# Production Core — imported-log drift permission correction

21 October 2026. **Review and candidate preparation only; no AWS writes.**

The [Core recovery execution result](team-hub-production-core-kms-recovery-result.md) remains the installed-state record. Core security is UPDATE_COMPLETE; the recreated product stack is IMPORT_COMPLETE with one retained Logs resource. The six-addition product update and Lambda creation have not started. This report proposes an additional, separately authorized Core-only security revision.

## Exact denial and installed baseline

[CloudTrail and original-principal evidence](production-core-kms-recovery-execution-2026-10-21/mandatory-stop-inspection.json) identifies:

- Principal: `arn:aws:sts::058264289478:assumed-role/ProjectRespawn-Core-Production-Execution/AWSCloudFormation`.
- Action: `logs:DescribeIndexPolicies`.
- Evaluated resource: `arn:aws:logs:eu-north-1:058264289478:log-group:/project-respawn/Production/core/contracts`.
- Drift-correlated event `902b860c-5e36-44c2-8708-77a1f8bf66c1`, request `a1d28aa7-0495-4d38-99bf-dcd84d0baf8c`, 2026-10-21T06:05:52Z. AWS says no identity-based policy allows this action; requestParameters is null.

The [fresh installed baseline](production-core-log-drift-evidence-2026-10-21/fresh-installed-baseline.json) verifies account 058264289478, eu-north-1, RavenTest; unchanged actual execution inline policy, boundary, service-only trust and absence of attached managed policies. The actual documents match installed security template `59c85a51a66a064044e81d28acff3d72f0fdb9e2d9604c823df3d74573ed7cab`. Neither identity nor boundary permits the missing action. This is an omitted read permission; no conflicting explicit Deny needs removal.

The recreated product stack ID and sole Logs identity still match the accepted import. Log creationTime, name and 30-day retention are preserved. The existing drift result remains UNKNOWN; this task did not rerun drift detection. Fresh source contents were not rescanned in this review: the [accepted post-stop preservation](production-core-kms-recovery-execution-2026-10-21/post-recovery-preservation.json) is historical evidence for the 121 records, backups/protections, Cognito, Master and protected stacks. Full preservation refresh is mandatory at future execution.

Other policy layers remain relevant: exact role trust, permissions boundary, artifact/PassRole constraints and existing explicit prohibitions. No new session-policy or organization inspection authority was obtained. The CloudTrail cause is specific; it does not certify absence of every SCP or external restriction. Actual CloudFormation drift remains a live gate.

## Supported scope and deliberate metadata visibility

The current [AWS CloudWatch Logs authorization reference](https://docs.aws.amazon.com/service-authorization/latest/reference/list_logs.html) gives **no resource type and no action-specific condition key** for DescribeIndexPolicies. The [machine-readable AWS action entry](production-core-log-drift-evidence-2026-10-21/aws-permission-scope.json) preserves the source URL, retrieval time and source-document hash. This action therefore requires `Resource: "*"`; the ARN printed in a denial is not an IAM resource-scoping guarantee. Do not use a guessed log-name/tag condition to claim a hard per-group boundary.

The [API](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_DescribeIndexPolicies.html) accepts one specified group identifier and returns its applicable index-policy metadata, potentially including an account-level policy. This is not log-event content. Because the execution role already has account-level DescribeLogGroups discovery, the new action permits index-policy metadata inspection for other log groups in this account/region, including Legacy, Ntgre and other domains. Their field/index schema can be sensitive operational metadata. The future executor must request only the exact Core group, but that request restriction is operational, not an enforceable per-group IAM fence.

The proposed statement adds the global `aws:RequestedRegion=eu-north-1` condition. [AWS documents RequestedRegion as always present](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_condition-keys.html#condition-keys-requestedregion); it limits the service endpoint, not a group identity. No service-specific group condition is invented. This account/region metadata-read exception requires explicit security-owner acceptance in the next authorization.

## Minimal proposed change

Append exactly this statement to **both** the Core execution inline policy and ExecutionBoundary:

```json
{
  "Effect": "Allow",
  "Action": "logs:DescribeIndexPolicies",
  "Resource": "*",
  "Condition": {
    "StringEquals": {
      "aws:RequestedRegion": "eu-north-1"
    }
  }
}
```

All prior statements, including every Deny and NotAction, remain unchanged. The action-specific Allow does not match any KMS, IAM, Cognito, DynamoDB, S3 or Lambda operation. Exact-key CreateGrant/Encrypt/Decrypt/DescribeKey conditions, AWS-resource/service/account checks and business-key denials are retained. Runtime boundary/identity, deployment caller/trust, PassRole, exact product/ZIP/import/rollback artifact permissions and every non-execution resource remain identical.

No PutIndexPolicy, DeleteIndexPolicy, PutResourcePolicy, DeleteResourcePolicy, PutAccountPolicy, DeleteAccountPolicy, log-event access or new deletion permission is added. Existing own-Core log lifecycle permissions used for CloudFormation rollback remain unchanged; tests must not incorrectly call those pre-existing permissions denied. Foreign log lifecycle operations remain denied. Cross-domain **index-policy metadata read** is the explicitly disclosed exception; other domain access is not broadened.

## Candidates and validation evidence

[Proposed manifest](production-core-log-drift-evidence-2026-10-21/manifest.json) and [full semantic diff](production-core-log-drift-evidence-2026-10-21/policy-diff.json) preserve the installed candidate and historical evidence. The new security template SHA-256 is `5f30d59d1e7f5e436cecefd723ee6a10c2b79651eb47ab90115d528ced0e7172`.

Identity policy file SHA-256: `7a97d5d8f0a3681e72acaff52d98cfbd6a2e7bb81d87b73de5c4708afdcbacd8`.

ExecutionBoundary policy file SHA-256: `0d1dae1442e780d93c3e1c4665cebffa15410f42c9ce1183e5decef71db8bd15`.

Preserved Core product template: `b9c5d96e7123a6d837c903f1e1779080e020aba8c9eab8af1e2ddccde912ed96`.

Preserved runtime ZIP: `fecdc0327a5f75c8be4f9e4f280776b6908f646dfdffdf6bee4e61e5e8126503`.

The security template remains six resources. Expected security change set: exactly Execution and ExecutionBoundary modifications; zero additions/deletions/replacements, including conditional/dynamic replacement. The imported log and one-resource product stack are untouched by this security candidate. No product template, runtime, environment, resource name or rollback artifact is regenerated.

The initial harness tried unsupported ARN simulation input for DescribeIndexPolicies and returned implicitDeny. [That incomplete run](production-core-log-drift-evidence-2026-10-21/initial-unsupported-arn-simulation.json) is retained. Certification uses AWS-supported wildcard-resource input for this action; it does not interpret ARN simulator behavior as actual group isolation. The policy bytes did not change to make that test pass. Identical successful cases are reused only under an identical policy hash and exact case/context match; unfinished/invalid checks are not silently accepted.

## Separately authorized execution sequence

1. Obtain fresh authorization for the exact new manifest/security SHA, explicitly accepting account/region-wide index-policy metadata visibility. Confirm current production operator/window and no concurrent changes. Team deployment is excluded.
2. Refresh account/region/RavenTest, both stack IDs/statuses, sole imported log identity/properties, source record counts/digests/relationships, protections/four backups, Cognito, Master, protected Legacy/Ntgre roots and capacity. Reverify installed trust/inline/boundary/attachments against the current 59c85 baseline, and all immutable artifact/rollback hashes. Stop on drift or missing mandatory evidence.
3. Publish only the new exact security template using approved AES256/checksum/conditional-create/readback handling. Existing product and ZIP objects must be verified and reused. No arbitrary URL, bucket-policy/default change or secret retrieval.
4. Prepare and fully inspect the Core security UPDATE change set. Require exactly two reviewed policy modifications; no new resources, deletions, replacements, runtime or trust changes. Execute once with rollback enabled only after all gates pass.
5. Read actual installed documents/trust/boundary/attachments and compare to the new pin. Run installed-role positive DescribeIndexPolicies and negative write/admin/foreign-domain controls, plus existing KMS, PassRole and artifact regressions. Simulated region context does not prove real provider success.
6. Run the separately authorized exact Logs drift check once. Require **actual IN_SYNC** and matching properties. UNKNOWN, denied discovery, changed ownership or any new missing operation stops progression. Do not add another permission or waive the gate automatically.
7. Prepare the unchanged full Core product UPDATE through the existing bounded caller and exact product URL/execution role. Require exactly **six additions**: Runtime, Contracts, Errors, Throttles, DependencyFailures, Denied. Logs must remain unchanged; no other modifications/deletions/replacements. Do not delete/reimport the log or recreate the product stack.
8. Execute the product update once, rollback enabled. Verify Lambda Active/Successful, exact ZIP/configuration/runtime IAM, supported KMS initialization and real production Core authorization/directory/privacy/cursor contracts with distinct existing Admin/SuperAdmin and ordinary identities. Never infer service success from simulations or stack completion alone. Keep tokens and raw directory data out of evidence.
9. Verify Core logs/native/custom metrics and alarms, then refresh source data/protections/backups, Cognito/Master and protected-domain preservation. No authority initialization, Team stack, migration or public release. Stop after Core acceptance and seek separate Team authorization.

## Rollback and abort

Security update failure: allow native rollback, verify the installed 59c85 baseline and preserve the imported group/stack. Product update failure: allow rollback to the imported Logs-only stack; verify group retention and inventory every partial resource. No automatic retry, permission broadening, destructive cleanup or downgrade to the pre-KMS security candidate. Any further recovery requires a scoped review. Removing the new read permission after successful product deployment is a separate lifecycle decision because future drift inspection would again fail.

No security deployment, artifact publication, change set, drift retry, log deletion/replacement, production Team action, authority/data migration or Master publication occurred during this task.

<!-- LOG-DRIFT-CERTIFICATION -->
## Completed certification

[Summary](production-core-log-drift-evidence-2026-10-21/validation-summary.json): 6 Core policies, 324 policy cases and 59 identity/boundary-intersection cases passed, with zero blocking Access Analyzer findings. Identical successful cases reused after the harness correction: 66; every unfinished supported check completed. AWS ValidateTemplate passed for the new security bytes. Twenty-six focused security, artifact and migration-control tests passed. All 44 R2 inputs and 40 prior execution evidence files remain hash-identical. New evidence/source scan: 15 files, zero credential/token/private-key pattern matches.

| Document | Compact size | Limit |
|---|---:|---:|
| coreSecurity.Execution | 5659 | 10240 |
| coreSecurity.ExecutionBoundary | 3832 | 6144 |

New immutable manifest SHA-256: `639d59654977db8b603b2f7c1344199046148668448c9c1cf5fa4b2d9ec5d891`. New candidates are **not installed or execution-authorized**. Previous authorization ca35f7a4… covers the prior security bytes, not this metadata-read expansion. Actual imported Logs IN_SYNC, the six-addition AWS product change set, Lambda/KMS creation, production Core contracts, monitoring and preservation remain live gates.

**CORE LOG DRIFT CORRECTION READY FOR DEPLOYMENT REVIEW**
