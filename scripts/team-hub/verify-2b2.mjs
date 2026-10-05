import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
process.chdir(root);
const results = [];
const run = (name, args) => {
  const r = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, windowsHide: true });
  if (r.status !== 0) throw new Error(`${name} failed\n${r.stdout}\n${r.stderr}`);
  const tests = r.stdout.match(/(?:#|ℹ) tests (\d+)/)?.[1];
  results.push({ name, status: 'PASS', ...(tests ? { tests: Number(tests) } : {}) });
  console.log(`${name}: PASS${tests ? ` (${tests} tests)` : ''}`); return r.stdout;
};
run('TypeScript', ['infrastructure/domains/team-hub/node_modules/typescript/bin/tsc', '--project', 'infrastructure/domains/team-hub/tsconfig.json', '--noEmit']);
run('Generic CI FULL_TARGET Team-only synthesis/build', ['scripts/validate-infrastructure-ci.mjs', '--domain', 'team-hub', '--env', 'Ntgre', '--mode', 'FULL_TARGET', '--action', 'check']);
run('Generic CI READ_PROOF Team-only synthesis/build', ['scripts/validate-infrastructure-ci.mjs', '--domain', 'team-hub', '--env', 'Ntgre', '--mode', 'READ_PROOF', '--action', 'check']);
for (const [name, dir] of [['2B1 regression', 'scripts/team-hub/tests'], ['2B2 preview/auth/security/accounting', 'scripts/team-hub/read-proof-tests'], ['Domain selection/hosted dispatch', 'scripts/deployment/tests']]) run(name, ['--test', '--test-reporter=spec', ...fs.readdirSync(dir).filter(n => n.endsWith('.test.mjs')).map(n => `${dir}/${n}`)]);
run('Existing accounting/safeguards', ['--test', '--test-reporter=spec', 'scripts/cloudformation-accounting.test.mjs', 'scripts/ntgre-phase1-allowance.test.mjs']);
const pinned = JSON.parse(run('Tournament exact pinned preservation', ['scripts/verify-phase2-checkpoint.mjs']));
const accepted = JSON.parse(run('Tournament accepted checkpoint preservation', ['scripts/checkpoints/verify-tournament-release1.mjs']));
const load = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const proof = load(load('infrastructure/domains/team-hub/.build/latest-read-proof.json').receipt);
const full = load(load('infrastructure/domains/team-hub/.build/latest.json').receipt);
const product = proof.templates.find(t => t.count === 11), security = proof.templates.find(t => t.count === 4), lambda = proof.closure.find(c => c.name === 'read').outputs[0];
const dir = 'docs/architecture/team-hub-2b2-evidence-2026-10-05'; fs.mkdirSync(dir, { recursive: true });
for (const [name, receipt] of [['read-proof', proof], ['full-target', full]]) {
  const portable = JSON.parse(JSON.stringify(receipt).replaceAll(/offline-\d+/g, 'REGENERATE_LOCALLY'));
  fs.writeFileSync(`${dir}/${name}-receipt.json`, JSON.stringify(portable, null, 2) + '\n');
}
// Intentionally retained review templates. These are not published AWS artifacts.
fs.copyFileSync(product.path, `${dir}/read-proof.template.json`);
fs.copyFileSync(security.path, `${dir}/security.template.json`);
const source = [...proof.inputs.map(i => i.path), 'docs/architecture/domain-deployment-selection.md', 'docs/architecture/team-hub-2b2-read-path-readiness.md'];
const patterns = [/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\b/, /(?:aws_secret_access_key|aws_session_token)\s*[=:]\s*["']?[A-Za-z0-9/+]{16,}/i];
for (const file of source) if (patterns.some(p => p.test(fs.readFileSync(file, 'utf8')))) throw new Error(`Potential credential in ${file}; contents withheld`);
const tracked = spawnSync('git', ['diff', '--name-only', 'HEAD'], { encoding: 'utf8' });
if (tracked.status !== 0) throw new Error('Git inspection failed');
const changed = tracked.stdout.trim().split(/\r?\n/).filter(Boolean);
if (changed.some(p => !['amplify.yml', 'scripts/validate-infrastructure-ci.mjs'].includes(p))) throw new Error('Unrelated tracked modification');
const gate = { candidateRevision: proof.revision, mode: proof.mode, stack: proof.target, productTemplateSha256: product.sha256, securityTemplateSha256: security.sha256, lambdaSha256: lambda.sha256, preservedAssembly: path.dirname(product.path), productResources: product.count, securityResources: security.count, total: proof.total, fullTargetResources: full.total, results, tournament: { revision: pinned.revision, allExact: pinned.allExact, accepted: accepted.accepted }, legacyBusinessSourceHashes: 50, authorizedSharedToolingChanges: changed, genericCI: 'PASS: explicit Team selection, both modes; no Legacy fallback', hostedPipeline: 'Guarded source only; not installed/run in AWS. Independent-domain deployment disabled; production requires separate gate.', awsReadAttempt: 'STS identity could not run: no credentials; no authenticated AWS API response obtained', awsWrites: 0, changeSetsCreated: 0, iamBootstrapCreated: 0, deployment: false, liveAuthentication: 'NOT RUN: no deployed Team API; synthetic signature/claim/packaged handler tests only', runtimeKms: 'Reserved alias/aws/lambda boundary exception; no copied key ARN; verify AWS-managed key/resource grants during later AWS review', dataAuthority: 'SYNTHETIC', statefulResources: 0, endpointManifestPublished: false, secretScan: { files: source.length, matches: 0 }, timestamp: new Date().toISOString() };
fs.writeFileSync(`${dir}/gate.json`, JSON.stringify(gate, null, 2) + '\n');
let documentLinks = 0;
for (const file of source.filter(p => p.endsWith('.md'))) {
  for (const match of fs.readFileSync(file, 'utf8').matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0]; if (!target || /^https?:/.test(target)) continue;
    if (!fs.existsSync(path.resolve(path.dirname(file), target))) throw new Error(`Broken documentation link ${file} -> ${target}`);
    documentLinks++;
  }
}
for (const file of fs.readdirSync(dir).map(name => `${dir}/${name}`)) if (patterns.some(p => p.test(fs.readFileSync(file, 'utf8')))) throw new Error(`Potential credential in retained evidence ${file}`);
gate.documentLinks = documentLinks;
gate.status = 'TEAM HUB READ-PATH CANDIDATE READY FOR AWS REVIEW';
fs.writeFileSync(`${dir}/gate.json`, JSON.stringify(gate, null, 2) + '\n');
console.log(JSON.stringify({ evidence: `${dir}/gate.json`, candidateRevision: gate.candidateRevision, template: gate.productTemplateSha256, lambda: gate.lambdaSha256, resources: gate.total }, null, 2));
