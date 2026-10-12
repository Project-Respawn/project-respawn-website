import assert from 'node:assert/strict';
// Lambda-managed revision/status timestamps may change; all other returned configuration is preserved.
const volatile = new Set(['Environment','RevisionId','LastModified','State','StateReason','StateReasonCode','LastUpdateStatus','LastUpdateStatusReason','LastUpdateStatusReasonCode']);
const stable = value => Object.fromEntries(Object.entries(value).filter(([k]) => !volatile.has(k)));
export function verifyRecoveredFunction(before, after, desired, beforeIamHash, afterIamHash) {
  assert.deepEqual(after.Environment, {Variables: desired}, 'Complete declared environment required');
  assert.deepEqual(stable(after), stable(before), 'Non-environment configuration or code changed');
  assert.equal(after.State, 'Active');
  assert.equal(after.LastUpdateStatus, 'Successful');
  assert.ok(after.RevisionId && after.RevisionId !== before.RevisionId, 'Expected new revision');
  assert.ok(beforeIamHash && afterIamHash);
  assert.equal(afterIamHash, beforeIamHash, 'Permanent IAM changed');
  return true;
}
export function verifyAcceptance(proof) {
  for (const key of ['readConfiguration','commandConfiguration','monitoring','businessDataUnchanged','protectedDomains','cleanup']) assert.equal(proof[key], true, key);
  assert.deepEqual(proof.functionDrift, ['IN_SYNC','IN_SYNC']);
  assert.deepEqual(proof.authority, {status:200,mode:'LEGACY_WRITER',epoch:1,version:1});
  assert.equal(proof.routes.length,16);
  assert.equal(new Set(proof.routes.map(r=>r.route)).size,16);
  assert.ok(proof.routes.every(r=>r.status===403));
  assert.deepEqual([...proof.routes.map(r=>r.route)].sort(), [...proof.expectedRoutes].sort());
  return true;
}
