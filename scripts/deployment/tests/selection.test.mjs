import test from 'node:test';
import assert from 'node:assert/strict';
import { selection, runSelected, root } from '../select.mjs';
import { hostedSelection } from '../hosted.mjs';
const args = (domain = 'team-hub', environment = 'Ntgre', mode = 'READ_PROOF', action = 'check') => ['--domain', domain, '--env', environment, '--mode', mode, '--action', action];
for (const [domain, env, mode, expected] of [['team-hub', 'Ntgre', 'READ_PROOF', 'scripts/team-hub/plan.mjs'], ['team-hub', 'Ntgre', 'FULL_TARGET', 'scripts/team-hub/plan.mjs'], ['tournaments', 'Ntgre', 'PREVIEW', 'scripts/domains/plan.mjs'], ['legacy', 'staging', 'LEGACY', 'scripts/legacy/validate-infrastructure-ci.mjs']]) test(`${domain}/${mode} dispatches exactly its own adapter`, async () => {
  const calls = [];
  const plan = await runSelected(args(domain, env, mode), (exe, command, options) => { calls.push({ exe, command, options }); return { status: 0 }; });
  assert.equal(calls.length, 1); assert.equal(calls[0].command[0], expected); assert.deepEqual(plan.selectedDomains, [domain]);
  assert.equal(plan.legacySelected, domain === 'legacy'); assert.equal(plan.tournamentSelected, domain === 'tournaments');
  if (domain === 'legacy') assert.equal(calls[0].options.env.AWS_BRANCH, 'staging');
});
for (const domain of ['unknown', 'creator', 'commerce', 'community', 'applications', 'investor']) test(`${domain} unavailable adapter fails closed`, () => assert.throws(() => selection(args(domain)), /Unknown or unimplemented/));
test('missing domain/environment/mode/action and duplicate/unknown flags fail closed', () => {
  for (const request of [[], ['--domain', 'team-hub'], args().slice(2), [...args(), '--domain', 'legacy'], [...args(), '--force', 'true']]) assert.throws(() => selection(request));
});
for (const environment of ['production', 'master', 'main', 'Production']) test(`${environment} requires separate authorization`, () => assert.throws(() => selection(args('team-hub', environment)), /separate artifact-bound authorization/));
test('missing configuration and subprocess failure never fall back to another adapter', async () => {
  let calls = 0;
  await assert.rejects(runSelected(args(), () => { calls++; return { status: 1 }; }), /no fallback/); assert.equal(calls, 1);
  await assert.rejects(runSelected(args(), () => { calls++; return { status: 0 }; }, `${root}/nonexistent-fixture-root`), /entrypoint missing/); assert.equal(calls, 1);
  assert.throws(() => selection(args('team-hub', 'Ntgre', 'BAD_MODE')));
  assert.throws(() => selection(args('team-hub', 'Ntgre', 'READ_PROOF', 'deploy')));
  assert.throws(() => selection(args('team-hub', 'Ntgre', 'READ_PROOF', 'diff')));
});
test('hosted Team validation routes only to Team; deployment cannot reach Amplify', () => {
  const env = { RESPAWN_DEPLOY_DOMAIN: 'team-hub', RESPAWN_DEPLOY_ENV: 'Ntgre', RESPAWN_DEPLOY_MODE: 'READ_PROOF', AWS_BRANCH: 'phase2/team-hub-extraction' };
  assert.equal(hostedSelection(env, 'check').command[0], 'scripts/team-hub/plan.mjs');
  assert.throws(() => hostedSelection(env, 'deploy'), /refusing Amplify fallback/);
  assert.throws(() => hostedSelection({ ...env, AWS_BRANCH: 'master' }, 'check'), /Production/);
  assert.throws(() => hostedSelection({ AWS_BRANCH: 'staging' }, 'check'), /required/);
});
test('hosted Legacy deployment is explicit staging only; no branch default', () => {
  const env = { RESPAWN_DEPLOY_DOMAIN: 'legacy', RESPAWN_DEPLOY_ENV: 'staging', RESPAWN_DEPLOY_MODE: 'LEGACY', AWS_BRANCH: 'staging' };
  assert.deepEqual(hostedSelection(env, 'deploy').command, ['ampx', 'pipeline-deploy', '--branch', 'staging', '--app-id', 'd2cux232bpa951']);
  assert.throws(() => hostedSelection({ ...env, AWS_BRANCH: 'development' }, 'deploy'));
  assert.throws(() => hostedSelection({ ...env, AWS_BRANCH: '' }, 'check'));
});
