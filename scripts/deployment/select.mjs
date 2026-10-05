import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export function selection(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    if (!['--domain', '--env', '--mode', '--action'].includes(key) || !args[i + 1] || args[i + 1].startsWith('--') || key in options) throw new Error('Explicit unique --domain --env --mode --action required');
    options[key] = args[i + 1];
  }
  const domain = options['--domain'], environment = options['--env'], mode = options['--mode'], action = options['--action'];
  if (!domain || !environment || !mode || !action) throw new Error('Missing mandatory domain/environment/mode/action');
  if (['production', 'master', 'main'].includes(environment.toLowerCase())) throw new Error('Production requires separate artifact-bound authorization; no production adapter installed');
  if (!['check', 'synth', 'test', 'describe'].includes(action)) throw new Error('No diff/deploy/change-set execution adapter is authorized or installed');
  let command, entrypoint;
  if (domain === 'team-hub') {
    if (environment !== 'Ntgre' || !['READ_PROOF', 'FULL_TARGET'].includes(mode)) throw new Error('Invalid Team Hub configuration');
    entrypoint = mode === 'READ_PROOF' ? 'infrastructure/domains/team-hub/read-proof-app.ts' : 'infrastructure/domains/team-hub/app.ts';
    command = action === 'test' ? ['scripts/team-hub/verify-2b2.mjs'] : ['scripts/team-hub/plan.mjs', '--env', 'Ntgre', '--offline', ...(mode === 'READ_PROOF' ? ['--mode', mode] : [])];
  } else if (domain === 'tournaments') {
    if (environment !== 'Ntgre' || mode !== 'PREVIEW') throw new Error('Invalid Tournament selection');
    entrypoint = 'infrastructure/domains/tournaments/app.ts';
    command = action === 'test' ? ['scripts/checkpoints/verify-tournament-release1.mjs'] : ['scripts/domains/plan.mjs', 'tournaments', '--env', 'Ntgre'];
  } else if (domain === 'legacy') {
    if (environment !== 'staging' || mode !== 'LEGACY') throw new Error('Only explicitly selected staging Legacy validation is available');
    entrypoint = 'amplify/backend.ts'; command = ['scripts/legacy/validate-infrastructure-ci.mjs'];
    if (action === 'test') command = ['--test', 'scripts/cloudformation-accounting.test.mjs', 'scripts/ntgre-phase1-allowance.test.mjs'];
  } else throw new Error(`Unknown or unimplemented domain: ${domain}`);
  return { domain, environment, mode, action, entrypoint, command, selectedDomains: [domain], legacySelected: domain === 'legacy', tournamentSelected: domain === 'tournaments', awsWrites: false };
}
export async function runSelected(args, execute = spawnSync, base = root) {
  const plan = selection(args);
  if (!fs.existsSync(path.join(base, plan.entrypoint))) throw new Error('Selected domain entrypoint missing; refusing fallback');
  if (plan.action === 'describe') { console.log(JSON.stringify(plan, null, 2)); return plan; }
  const env = { ...process.env, RESPAWN_SELECTED_DOMAIN: plan.domain };
  if (plan.domain === 'legacy') env.AWS_BRANCH = plan.environment;
  const result = execute(process.execPath, plan.command, { cwd: base, env, stdio: 'inherit', windowsHide: true });
  if (result.error || result.status !== 0) throw new Error(`Selected ${plan.domain} command failed; no fallback: ${result.error?.message ?? result.status}`);
  return plan;
}
