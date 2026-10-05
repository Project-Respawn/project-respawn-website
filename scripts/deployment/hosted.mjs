import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { selection, runSelected } from './select.mjs';
export function hostedSelection(env, phase) {
  if (!['check', 'deploy'].includes(phase)) throw new Error('Hosted phase must be check or deploy');
  const { RESPAWN_DEPLOY_DOMAIN: domain, RESPAWN_DEPLOY_ENV: environment, RESPAWN_DEPLOY_MODE: mode, AWS_BRANCH: branch } = env;
  if (!branch) throw new Error('Hosted branch missing');
  if (['master', 'main', 'production'].includes(branch.toLowerCase())) throw new Error('Production hosted execution requires a separate reviewed gate');
  const args = ['--domain', domain, '--env', environment, '--mode', mode, '--action', 'check'];
  const plan = selection(args);
  if (domain === 'legacy' && branch !== 'staging') throw new Error('Legacy hosted validation requires the explicit staging branch');
  if (phase === 'deploy' && (domain !== 'legacy' || branch !== 'staging' || environment !== 'staging')) throw new Error('Independent-domain hosted deployment is not installed; refusing Amplify fallback');
  return { plan, args, command: phase === 'deploy' ? ['ampx', 'pipeline-deploy', '--branch', 'staging', '--app-id', 'd2cux232bpa951'] : plan.command };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const phase = process.argv[2]; const selected = hostedSelection(process.env, phase);
  if (phase === 'check') await runSelected(selected.args);
  else {
    const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', selected.command, { stdio: 'inherit', windowsHide: true, shell: process.platform === 'win32' });
    if (result.status !== 0) process.exit(result.status || 1);
  }
}
