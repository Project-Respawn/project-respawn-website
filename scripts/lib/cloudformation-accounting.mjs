import { readFileSync, realpathSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';

// A Git checkout may change LF to CRLF; pin JSON contents, not formatting.
export const baselineDigest = bytes => createHash('sha256').update(JSON.stringify(JSON.parse(String(bytes)))).digest('hex');

export const BUDGETS = Object.freeze({
  template: { warning: 251, action: 351, block: 481, awsLimit: 500 },
  hierarchy: { warning: 1001, action: 1801, block: 2501, awsLimit: 2500 },
});
const read = file => JSON.parse(readFileSync(file, 'utf8'));
function within(directory, file) {
  const base = realpathSync(directory), target = realpathSync(file), rel = relative(base, target);
  if (rel.startsWith('..') || isAbsolute(rel)) throw new Error(`Assembly path escapes selected directory: ${file}`);
  return target;
}
export function state(count, budget) {
  return count >= budget.block ? 'HARD LIMIT / BLOCKED' : count >= budget.action ? 'ACTION REQUIRED' : count >= budget.warning ? 'WARNING' : 'NORMAL';
}
const add = (totals, type, count = 1) => { totals[type] = (totals[type] || 0) + count; };
function contributor(template, stackPath) {
  if (/FunctionDirectiveStack/.test(stackPath)) return 'FunctionDirectiveStack';
  if (Object.values(template.Resources || {}).some(r => r.Type === 'Custom::AmplifyDynamoDBTable')) return 'Model-generated';
  return 'Other platform resources';
}
export function owner(stackPath) {
  if (/TeamMembership|TeamRosterSlot|PlayerChampionPoolEntry|amplifyDataTeam[A-Z0-9]/.test(stackPath)) return 'Esports / Team Hub';
  if (/Forum|BoardPermissionRule/.test(stackPath)) return 'Community / Forums';
  if (/Investor/.test(stackPath)) return 'Operations / Investors';
  if (/Application/.test(stackPath)) return 'Operations / Applications';
  if (/Workspace/.test(stackPath)) return 'Creators / Workspaces';
  if (/Twitch|RewardRedemption|AlphaServiceNonce/.test(stackPath)) return 'Creators / Twitch';
  if (/Discord/.test(stackPath)) return 'Creators / Discord';
  if (/Merch|Fulfillment/.test(stackPath)) return 'Commerce';
  if (/amplifyDataEvent/.test(stackPath)) return 'Events';
  if (/UserProfile|PermissionDefinition|GroupPermission|PermissionAudit|Brand|Media/.test(stackPath)) return 'Core';
  return 'Shared / generated infrastructure';
}

// Count stack instances reachable from one manifest root, not every file on disk.
export function accountAssembly(directory, rootId) {
  const base = resolve(directory), manifest = read(within(base, resolve(base, 'manifest.json')));
  const roots = Object.entries(manifest.artifacts || {}).filter(([, a]) => a.type === 'aws:cloudformation:stack');
  if (!rootId && roots.length !== 1) throw new Error(`Select --root: assembly contains ${roots.length} root stacks`);
  const entry = rootId ? roots.find(([id]) => id === rootId) : roots[0];
  if (!entry) throw new Error(`Root not found: ${rootId}`);
  const [id, artifact] = entry, stacks = [], types = {}, contributors = {}, modules = {};
  function visit(file, stackPath, ancestors) {
    file = within(base, resolve(base, file));
    if (ancestors.includes(file)) throw new Error(`Nested template cycle at ${stackPath}`);
    const template = read(file), resources = Object.entries(template.Resources || {});
    const category = contributor(template, stackPath), domain = owner(stackPath), localTypes = {};
    for (const [, r] of resources) { add(types, r.Type); add(localTypes, r.Type); }
    add(contributors, category, resources.length); add(modules, domain, resources.length);
    stacks.push({ path: stackPath, file: relative(base, file).replaceAll('\\', '/'), resources: resources.length, types: localTypes, contributor: category, owner: domain, state: state(resources.length, BUDGETS.template) });
    for (const [logicalId, resource] of resources.filter(([, r]) => r.Type === 'AWS::CloudFormation::Stack')) {
      const nested = resource.Metadata?.['aws:asset:path'];
      if (typeof nested !== 'string' || !nested.endsWith('.json')) throw new Error(`Missing local nested asset at ${stackPath}/${logicalId}; cannot prove complete hierarchy`);
      visit(nested, `${stackPath}/${logicalId}`, [...ancestors, file]);
    }
  }
  visit(artifact.properties.templateFile, '$root', []);
  const total = stacks.reduce((n, s) => n + s.resources, 0);
  return { version: 1, root: id, environment: artifact.environment, tags: artifact.properties.tags || {}, label: /^amplify-/.test(id) ? 'LegacyPlatform' : id,
    total, largest: Math.max(...stacks.map(s => s.resources)), templateInstances: stacks.length,
    rootResources: stacks[0].resources, nestedResources: total - stacks[0].resources, nestedStackHandles: types['AWS::CloudFormation::Stack'] || 0,
    types, contributors, modules, hierarchyState: state(total, BUDGETS.hierarchy), stacks,
    operationSize: 'UNKNOWN: hierarchy total is a conservative fresh-create count, not resources touched by an update.' };
}
export function compareCounts(before, after) {
  const deltaMap = (a, b) => Object.fromEntries([...new Set([...Object.keys(a), ...Object.keys(b)])].sort().map(k => [k, { before: a[k] || 0, after: b[k] || 0, delta: (b[k] || 0) - (a[k] || 0) }]));
  return { total: { before: before.total, after: after.total, delta: after.total - before.total }, largest: { before: before.largest, after: after.largest, delta: after.largest - before.largest },
    types: deltaMap(before.types, after.types), modules: deltaMap(before.modules, after.modules), contributors: deltaMap(before.contributors, after.contributors),
    stacks: deltaMap(Object.fromEntries(before.stacks.map(s => [s.path, s.resources])), Object.fromEntries(after.stacks.map(s => [s.path, s.resources]))) };
}
export function evaluate(report, { baseline, exception, operation = 'create', now = new Date() } = {}) {
  if (!['create', 'update'].includes(operation)) throw new Error('Operation must be create or update');
  const reasons = [], warnings = [], delta = baseline ? compareCounts(baseline, report) : undefined;
  let allowance = false;
  if (exception) {
    if (!baseline) reasons.push('Debt allowance requires its pinned baseline');
    if (!exception.roots?.includes(report.root)) reasons.push('Debt allowance does not cover selected root');
    if (!(new Date(exception.expiresAt).getTime() > now.getTime())) reasons.push('Debt allowance has expired');
    if (!exception.owner || !exception.milestone) reasons.push('Debt allowance requires owner and removal milestone');
    if (operation !== 'update') reasons.push('Debt allowance is update-only; fresh creation remains blocked');
    if (baseline && exception.baselineTotal !== baseline.total) reasons.push('Debt allowance baseline total mismatch');
    if (baseline && report.total > baseline.total) reasons.push('Legacy hierarchy may not grow');
    if (delta && Object.values(delta.stacks).some(d => d.delta > 0)) reasons.push('Legacy template contribution may not grow or introduce a new stack');
    allowance = reasons.length === 0;
  }
  for (const s of report.stacks) {
    if (s.resources >= BUDGETS.template.block) reasons.push(`${s.path}: ${s.resources} exceeds internal hard gate 480 (AWS limit 500)`);
    else if (s.resources >= BUDGETS.template.action && !allowance) reasons.push(`${s.path}: action threshold 351 reached`);
    else if (s.resources >= BUDGETS.template.warning) warnings.push(`${s.path}: ${s.state}`);
  }
  if (report.total >= BUDGETS.hierarchy.action && !allowance) reasons.push(`Hierarchy ${report.total} exceeds action threshold 1800; fresh-create AWS ceiling is 2500`);
  if (delta) for (const [name, d] of Object.entries(delta.modules)) {
    const percent = d.before ? d.delta / d.before * 100 : d.delta > 0 ? 100 : 0;
    if (d.delta > 50 || percent > 20) reasons.push(`${name}: growth +${d.delta} (${percent.toFixed(1)}%) requires budget review`);
    else if (d.delta >= 25 || percent >= 10) warnings.push(`${name}: growth +${d.delta} (${percent.toFixed(1)}%)`);
  }
  if (allowance) warnings.push('Existing debt allowance: no growth. NOT deployment approval or proof of update operation size. Fresh creation remains blocked above 2500.');
  return { passed: reasons.length === 0, operation, allowance, reasons, warnings, delta, budgets: BUDGETS };
}
export function formatReport(report, result) {
  const lines = [`${report.label} (${report.root})`, `Total hierarchy resources: ${report.total} — ${report.hierarchyState}`, `Largest template: ${report.largest} — ${state(report.largest, BUDGETS.template)}`,
    `Template instances: ${report.templateInstances}; nested contribution: ${report.nestedResources}; nested stack handles: ${report.nestedStackHandles}`,
    `FunctionDirectiveStack: ${report.contributors.FunctionDirectiveStack || 0}`, `Model-generated resources: ${report.contributors['Model-generated'] || 0}`,
    `Resolvers: ${report.types['AWS::AppSync::Resolver'] || 0}; AppSync functions: ${report.types['AWS::AppSync::FunctionConfiguration'] || 0}; data sources: ${report.types['AWS::AppSync::DataSource'] || 0}`,
    `IAM roles: ${report.types['AWS::IAM::Role'] || 0}; policies: ${(report.types['AWS::IAM::Policy'] || 0) + (report.types['AWS::IAM::ManagedPolicy'] || 0)}; Lambdas: ${report.types['AWS::Lambda::Function'] || 0}`,
    report.operationSize, 'Budgets: template warning 251 / action 351 / gate 481; hierarchy warning 1001 / action 1801 / fresh-create block 2501.',
    'Templates (largest first):', ...[...report.stacks].sort((a,b) => b.resources-a.resources).map(s => `  ${s.resources}\t${s.state}\t${s.path}`),
    'Resource type totals:', ...Object.entries(report.types).sort().map(([type,n]) => `  ${type}: ${n}`)];
  if (result.delta) lines.push(`Hierarchy delta: ${result.delta.total.before} -> ${result.delta.total.after} (${result.delta.total.delta >= 0 ? '+' : ''}${result.delta.total.delta})`, `Largest template delta: ${result.delta.largest.before} -> ${result.delta.largest.after}`, 'Module deltas:', ...Object.entries(result.delta.modules).map(([name,d]) => `  ${name}: ${d.before} -> ${d.after} (${d.delta >= 0 ? '+' : ''}${d.delta})`));
  lines.push(...result.warnings.map(s => `WARNING: ${s}`), ...result.reasons.map(s => `BLOCKED: ${s}`), result.passed ? (result.allowance ? 'ACCOUNTING GATE PASS WITH EXISTING DEBT — NOT DEPLOYMENT APPROVAL' : 'ACCOUNTING GATE PASS') : 'ACCOUNTING GATE FAILED');
  return lines.join('\n');
}
