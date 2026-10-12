// Offline, domain-parameterized checks. No AWS client, deployment or synthesis.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
export const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export function verifyArtifacts(artifacts) {
  assert.ok(artifacts.length, 'Empty artifact manifest');
  assert.equal(new Set(artifacts.map(a => a.path)).size, artifacts.length, 'Duplicate artifact');
  for (const a of artifacts) {
    assert.match(a.sha256, /^[a-f0-9]{64}$/);
    assert.equal(sha256(fs.readFileSync(a.path)), a.sha256, a.path);
  }
  return true;
}
export function lambdaResourceForms(arn) {
  assert.match(arn, /^arn:[^:]+:lambda:[^:]+:\d{12}:function:[A-Za-z0-9_-]+$/);
  return [arn, arn + ':$LATEST']; // Coverage inputs, never an automatic IAM grant.
}
const volatile = new Set(['Environment', 'RevisionId', 'LastModified', 'State', 'StateReason', 'StateReasonCode', 'LastUpdateStatus', 'LastUpdateStatusReason', 'LastUpdateStatusReasonCode']);
const stable = v => Object.fromEntries(Object.entries(v).filter(([k]) => !volatile.has(k)));
export function verifyEnvironmentRecovery({before, after, desired, submittedRevision, beforeIamHash, afterIamHash, drift}) {
  assert.ok(before.RevisionId && submittedRevision === before.RevisionId, 'Pinned RevisionId required');
  assert.deepEqual(after.Environment, {Variables: desired}, 'Full environment map required');
  assert.deepEqual(stable(after), stable(before), 'Code/identity/non-environment change');
  assert.equal(after.State, 'Active'); assert.equal(after.LastUpdateStatus, 'Successful');
  assert.ok(after.RevisionId && after.RevisionId !== before.RevisionId);
  assert.ok(beforeIamHash && beforeIamHash === afterIamHash, 'Permanent IAM changed');
  assert.equal(drift, 'IN_SYNC', 'UNKNOWN is not acceptance');
  return true;
}
export function verifyCoverage({requirements, cases, certification, critical, installedEquivalent}) {
  assert.ok(requirements.length && cases.length);
  for (const list of [requirements, cases]) assert.equal(new Set(list.map(x => x.id)).size, list.length, 'Duplicate coverage ID');
  assert.equal(installedEquivalent, true, 'Exact installed equivalence required');
  for (const receipt of [certification, critical]) {
    assert.equal(receipt.complete, true); assert.equal(new Set(receipt.checks.map(x => x.id)).size, receipt.checks.length);
    for (const result of receipt.checks) { const c = cases.find(x => x.id === result.id); assert.ok(c, 'Unknown case'); assert.equal(result.decision, c.expected); }
  }
  assert.deepEqual(certification.checks.map(x => x.id).sort(), cases.map(x => x.id).sort(), 'Incomplete certification');
  for (const c of cases) { assert.ok(c.requirements.length); for (const id of c.requirements) assert.ok(requirements.some(r => r.id === id), 'Unknown requirement'); }
  for (const r of requirements) {
    const mapped = cases.filter(c => c.requirements.includes(r.id)); assert.ok(mapped.length, 'Uncovered requirement');
    if (r.installedRequired) assert.ok(mapped.some(c => critical.checks.some(x => x.id === c.id)), 'Missing actual-role control');
  }
  return true; // IAM simulation coverage, NOT live service authorization.
}
export function verifyDeploymentAcceptance({expectedResources, actualResources, expectedRoutes, routes, protectedBefore, protectedAfter, monitoring, businessState, cleanup, evidenceLevel}) {
  assert.equal(evidenceLevel, 'LIVE', 'Offline proof cannot establish live acceptance');
  for (const [expected, actual] of [[expectedResources, actualResources], [expectedRoutes, routes]]) {
    assert.ok(expected.length); assert.equal(new Set(expected.map(x => x.id)).size, expected.length);
    assert.equal(new Set(actual.map(x => x.id)).size, actual.length); assert.deepEqual([...actual].sort((a,b)=>a.id.localeCompare(b.id)), [...expected].sort((a,b)=>a.id.localeCompare(b.id)));
  }
  assert.ok(Object.keys(protectedBefore).length); assert.deepEqual(protectedAfter, protectedBefore);
  assert.equal(monitoring, true); assert.equal(businessState, true);
  assert.equal(cleanup.complete, true); assert.deepEqual(cleanup.remaining, []);
  return true;
}
