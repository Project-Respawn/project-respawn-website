<!-- PRODUCTION-CORE-FINAL-RESULT:START -->
## Production Core — deployed, runtime acceptance blocked

[Actual final recovery result](production-core-final-recovery-result.md): final security/product UPDATE_COMPLETE, 115 actual-role IAM checks passed, imported Logs IN_SYNC, exact six-addition product update and runtime/configuration pins verified. Actual CreateGrant succeeded. First live invocation failed on runtime-role kms:Decrypt explicit Deny before handler initialization. No Core live acceptance; helper stopped; no permission patch/retry. All 121 source records/backups/protections, Cognito, Master and protected domains preserved. Thirteen Core resources survive; Team remains unauthorized and absent. Separate runtime IAM/KMS review is required.
<!-- PRODUCTION-CORE-FINAL-RESULT:END -->

# Production Core-only KMS recovery — execution result

21 October 2026. **CORE RECOVERY BLOCKED — IMPORTED LOG DRIFT CHECK CANNOT READ INDEX POLICIES.**

## Authorization and actual execution

The user approved Core-only manifest `ca35f7a41b0c9786ab8a81d130a464a170c69d466d3a0e807531a06a164b7d86` and confirmed current operator availability/no concurrent changes. [Window receipt](production-core-kms-recovery-execution-2026-10-21/authorization-window.json) records the technical 06:01:58–08:01:58 UTC window; no historical signature or approval timestamp is invented. [Consolidated result](production-core-kms-recovery-execution-2026-10-21/result.json).

| Gate | Actual result |
|---|---|
| Fresh preservation and artifact checks | PASS; exact account/region/RavenTest, pinned sources/evidence/templates/ZIP, 121 source records/digests, backups/protections, Cognito/Master/protected roots |
| Core security change set | Exactly ExecutionBoundary and Execution modifications, no additions/deletions/replacements |
| Core security execution | UPDATE_COMPLETE, rollback enabled; installed managed/inline policies, boundaries, trusts and attachments match pin; 56 actual-role permission cases PASS |
| Failed product stack record | Deleted exact archived old stack ARN; retained log group preserved |
| Retained Logs import | Exactly one Import, zero other changes; IMPORT_COMPLETE; same name/retention and existing log group preserved |
| Mandatory Logs drift gate | **FAIL: UNKNOWN**, Access denied for logs:DescribeIndexPolicies |
| Six-addition Core product update | **NOT CREATED OR EXECUTED** |
| Lambda/KMS creation and authenticated production acceptance | **NOT RUN; Lambda remains absent** |
| Team / authority / migration / Master | Not authorized and not performed |

## Exact failed permission and uncertainty

[Drift receipt](production-core-kms-recovery-execution-2026-10-21/import-drift.json) reports ExpectedProperties/ActualProperties as empty objects and no PropertyDifferences. These do **not** prove IN_SYNC: the provider could not inspect the resource fully. [Read-only stop inspection and CloudTrail](production-core-kms-recovery-execution-2026-10-21/mandatory-stop-inspection.json) identifies the original assumed execution role `ProjectRespawn-Core-Production-Execution/AWSCloudFormation`, action `logs:DescribeIndexPolicies`, and evaluated resource `arn:aws:logs:eu-north-1:058264289478:log-group:/project-respawn/Production/core/contracts`. AWS states no identity-based policy allows the action. Installed identity and boundary both omit it; an Allow in just one layer would not align both. Five matching service events are preserved; no manual drift retry or product retry was made. CloudTrail request parameters are null.

The [AWS action reference](https://docs.aws.amazon.com/service-authorization/latest/reference/list_logs.html) and [DescribeIndexPolicies API](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_DescribeIndexPolicies.html) require a separate review of supported resource/condition scoping. The action reference does not list a resource type for this action, while this actual denial names the exact group. Do not infer effective ARN scoping solely from a simulator or add account-wide log discovery automatically. No new permission candidate has been installed, no KMS condition changed and no bypass criterion accepted.

## Preservation and remaining actions

[Post-stop preservation](production-core-kms-recovery-execution-2026-10-21/post-recovery-preservation.json) reconfirms source counts **1/8/11/101**, identical canonical digests, four AVAILABLE backups and PITR/deletion protection. Cognito/client/user summary, Master and all pre-existing protected stacks remain unchanged. Production Team roots remain absent. The surviving domain infrastructure is still six Core security resources plus the same log group, now managed by the recreated one-resource Core product stack. Security secret and all rollback artifacts remain retained. No business data or production users were modified.

Leave both current stacks and the log group intact. No automatic rollback to the old restrictive security policy, stack deletion, log deletion or product retry is appropriate. Next: separately review the minimum log-provider read permission in identity/boundary, certify its scope and policy sizes, pin the revision and obtain fresh authorization before any installation or drift retry. Only after actual Logs IN_SYNC may the unchanged Core product six-addition update and live Core acceptance proceed. Team remains separately unauthorized.

**CORE RECOVERY BLOCKED — logs:DescribeIndexPolicies PREVENTS MANDATORY IMPORTED-LOG DRIFT ACCEPTANCE.**
