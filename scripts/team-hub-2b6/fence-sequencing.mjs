import assert from 'node:assert/strict';

// Offline review only. No AWS client, permission attachment, or transition executor.
export function dormantBundle(candidate) {
  assert.equal(candidate.account, '058264289478');
  assert.equal(candidate.region, 'eu-north-1');
  assert.equal(candidate.installed, false);
  const tables = candidate.modes.FROZEN.tables;
  assert.equal(tables.length, 4);
  assert.equal(new Set(tables.map(t => t.arn)).size, 4);
  for (const table of tables) {
    const deny = table.policy.Statement.find(s => s.Sid === 'TeamHubMigrationWriterFence');
    assert.equal(deny?.Effect, 'Deny');
    assert.equal(deny.Principal, '*');
    assert.equal(deny.Resource, table.arn);
    assert.equal(deny.Condition, undefined);
    assert.equal(deny.NotPrincipal, undefined);
    assert.deepEqual(candidate.modes.LEGACY_WRITER.tables.find(t => t.arn === table.arn).policy,
      candidate.existing[table.arn] ?? { Version: '2012-10-17', Statement: [] });
  }
  return {
    schemaVersion: 'team-hub-fence-sequencing.v1',
    design: 'DETACHED_PINNED_ACTIVATION_BUNDLE',
    installed: false, installNow: false, preparationAwsRequests: [],
    effectivePermissionDelta: 'NONE_WHILE_UNATTACHED',
    authority: 'LEGACY_WRITER',
    future: {
      tables: structuredClone(tables),
      logo: structuredClone(candidate.modes.FROZEN.bucket),
      gateways: structuredClone(candidate.gateways),
      rollback: { policies: structuredClone(candidate.existing), revisions: structuredClone(candidate.revisions) },
    },
    requirements: ['FRESH_REVISION_AND_HASH_READ', 'SEPARATE_FROZEN_AUTHORIZATION',
      'TARGET_WRITES_DISABLED', 'EXCLUSIVE_POLICY_CUSTODY', 'LIVE_ALL_PATH_DENIAL',
      'DRAIN_AND_RECONCILE', 'SEPARATE_TARGET_AUTHORIZATION'],
  };
}

// Identity-policy projection for supported simulator use; NOT a role resource-policy simulation.
export function denialProjection(policy) {
  const statements = policy.Statement.filter(s => s.Sid === 'TeamHubMigrationWriterFence' || s.Sid === 'TeamHubMigrationLogoFence');
  assert.ok(statements.length);
  return { Version: policy.Version, Statement: statements.map(s => {
    assert.equal(s.Effect, 'Deny'); assert.equal(s.Principal, '*');
    assert.equal(s.Condition, undefined); assert.equal(s.NotPrincipal, undefined);
    const { Principal, ...identityStatement } = s;
    return structuredClone(identityStatement);
  }) };
}

// Decision model, not an execution API. Every failed gate stops with target writes disabled.
export const activationSteps = Object.freeze([
  'authorizedMaintenance', 'targetWritesDisabled', 'freshPoliciesAndCoverage',
  'exclusivePolicyCustody', 'gatewayMaintenance', 'fourTableFences', 'logoFence',
  'policyReadback', 'liveAllPathDenial', 'targetFrozenDenial',
  'writerDrain', 'strongReconciliation',
]);
export function activationProgress(receipts) {
  for (const step of activationSteps) {
    if (receipts[step] !== true) return { readyForSeparateTargetReview: false, nextRequired: step, targetWritesEnabled: false };
  }
  return { readyForSeparateTargetReview: true, targetWritesEnabled: false, targetAuthorizationRequired: true };
}
export function rollbackPlan({ targetDisabled, targetBusinessEmpty, authorityMode, installedHashesMatch, priorPoliciesAvailable }) {
  if (!targetDisabled || !installedHashesMatch || !priorPoliciesAvailable)
    return ['STOP_KEEP_MAINTENANCE', 'RESOLVE_CONTROL_OR_POLICY_DRIFT'];
  if (!targetBusinessEmpty || authorityMode === 'TARGET_WRITER')
    return ['KEEP_BOTH_WRITERS_FENCED', 'EXPORT_REVERSE_TRANSFORM_RESTORE_RECONCILE_REVIEW'];
  return ['KEEP_GATEWAYS_CLOSED', 'CONFIRM_TARGET_DENIED_AND_SOURCE_RECONCILED',
    'RESTORE_EXACT_PRIOR_POLICIES_WITH_CURRENT_REVISIONS', 'VERIFY_RESTORATION_AND_PROPAGATION',
    'CONDITIONAL_CONTROL_TO_LEGACY_IF_NEEDED', 'RESTORE_GATEWAYS_LAST', 'VERIFY_ORIGINAL_LEGACY_BEHAVIOR'];
}
