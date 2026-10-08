import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { dormantBundle, denialProjection, activationSteps, activationProgress, rollbackPlan } from './fence-sequencing.mjs';
const candidate = JSON.parse(fs.readFileSync('docs/architecture/team-hub-2b5b-evidence-2026-10-07/fence-candidates.json'));
test('dormancy is detachment, with no preparation AWS request or permission changes', () => {
  const bundle = dormantBundle(candidate);
  assert.deepEqual(bundle.preparationAwsRequests, []);
  assert.equal(bundle.installNow, false);
  assert.equal(bundle.authority, 'LEGACY_WRITER');
  assert.deepEqual(bundle.future.tables, candidate.modes.FROZEN.tables);
});
for (const field of ['Condition', 'NotPrincipal']) test('rejects dormant conditions and principal bypass: '+field, () => {
  const changed = structuredClone(candidate);
  changed.modes.FROZEN.tables[0].policy.Statement[0][field] = { invented: 'bypass' };
  assert.throws(() => dormantBundle(changed));
});
test('simulation projection preserves deny actions and exact resources, never creates grants', () => {
  for (const table of candidate.modes.FROZEN.tables) {
    const projected = denialProjection(table.policy).Statement[0];
    const { Principal, ...expected } = table.policy.Statement[0];
    assert.deepEqual(projected, expected);
    assert.equal(projected.Effect, 'Deny');
  }
});
for (const step of activationSteps) test('failure at '+step+' cannot authorize target writes', () => {
  const receipts = Object.fromEntries(activationSteps.map(s => [s, true]));
  receipts[step] = false;
  const r = activationProgress(receipts);
  assert.equal(r.readyForSeparateTargetReview, false);
  assert.equal(r.nextRequired, step);
  assert.equal(r.targetWritesEnabled, false);
});
test('even complete simulated receipts require separate target authorization', () => {
  const r = activationProgress(Object.fromEntries(activationSteps.map(s => [s, true])));
  assert.equal(r.targetWritesEnabled, false); assert.equal(r.targetAuthorizationRequired, true);
});
test('partial installation rollback restores originals, verifies propagation, reopens gateway last', () => {
  const r = rollbackPlan({ targetDisabled:true, targetBusinessEmpty:true, authorityMode:'LEGACY_WRITER', installedHashesMatch:true, priorPoliciesAvailable:true });
  assert.ok(r.indexOf('RESTORE_GATEWAYS_LAST') > r.indexOf('VERIFY_RESTORATION_AND_PROPAGATION'));
  assert.ok(r.includes('RESTORE_EXACT_PRIOR_POLICIES_WITH_CURRENT_REVISIONS'));
});
test('post-target writes never fall back to simple policy removal', () => {
  const r = rollbackPlan({ targetDisabled:true, targetBusinessEmpty:false, authorityMode:'FROZEN', installedHashesMatch:true, priorPoliciesAvailable:true });
  assert.deepEqual(r, ['KEEP_BOTH_WRITERS_FENCED', 'EXPORT_REVERSE_TRANSFORM_RESTORE_RECONCILE_REVIEW']);
});
test('policy drift or missing custody evidence stops rollback without overwriting changes', () => {
  const r = rollbackPlan({ targetDisabled:true, targetBusinessEmpty:true, authorityMode:'LEGACY_WRITER', installedHashesMatch:false, priorPoliciesAvailable:true });
  assert.equal(r[0], 'STOP_KEEP_MAINTENANCE');
});
