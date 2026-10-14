# Project Respawn Team Hub 2B6 — isolated AWS verification result

**Quota-corrected isolated AWS verification (12 October 2026): ACCEPTED — READY FOR FINAL CUTOVER REVIEW.** 48/48 real isolated DynamoDB scenarios and nine actual-Read-role cursor checks passed; CloudTrail retrieval/decryption, native metrics, cleanup and final preservation verified. Four temporary resources and exact artifact removed. Real LEGACY_WRITER epoch/version 1, empty permanent business state, permanent IAM/code, Legacy frontend and protected domains preserved. No cutover or retirement. [Authoritative result and evidence](team-hub-2b6-quota-corrected-isolated-aws-verification-result.md). Earlier entries are historical.


**ISOLATED AWS BUSINESS VERIFICATION BLOCKED — PINNED CURSOR PROBE RESERVED-CONCURRENCY GATE.**

12 October 2026. The user authorized the exact reviewed isolated test lifecycle conditional on every mandatory security/resource gate passing. Fresh inspection found a provisioning incompatibility before any AWS write. No template, policy, runtime or reservation was changed to bypass it. The previous readiness review missed this account-quota constraint; its execution-ready conclusion is superseded by this result.

## Exact failed gate

The pinned template sets `CursorProbe.Properties.ReservedConcurrentExecutions: 1`. Fresh `lambda:GetAccountSettings` returned:

```json
{
  "ConcurrentExecutions": 10,
  "UnreservedConcurrentExecutions": 10
}
```

AWS requires at least 100 executions to remain unreserved when allocating reserved concurrency. A reservation of one therefore requires at least 101 currently unreserved; this account reports 10. This is a documented preflight incompatibility, **not** an AWS provisioning attempt or an observed PutFunctionConcurrency failure. See [AWS reserved concurrency](https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html) and [PutFunctionConcurrency](https://docs.aws.amazon.com/lambda/latest/api/API_PutFunctionConcurrency.html).

[Actual quota receipt](team-hub-isolated-execution-evidence-2026-10-12/quota-failure.json) and [custody stop record](team-hub-isolated-execution-evidence-2026-10-12/custody.json). No quota increase requested. Removing the reservation would change the pinned template and its resource-control design; it was not silently substituted.

## Exact candidate and physical scope

All candidate/template/policy/probe/tooling hashes and the probe source/dependency-lock closure verified before AWS inspection. [Pin and inventory receipt](team-hub-isolated-execution-evidence-2026-10-12/pins.json).

| Artifact | SHA-256 |
| --- | --- |
| Candidate | `5b701d83da949d2a59df7807f6fe716986432cd08b2e0a84fde72dd0d6f03da6` |
| Temporary template | `e021e71e2126c4919f82c54a226d249a4912c2e5fd698e383e8c336d84c0604e` |
| Runner policy | `91f88143ba16d5c11cdfd1293c86fbd5ca7c2a2f04311c5962f6112a28228d97` |
| Cursor-probe ZIP | `a072a13df0aa7e4299fb8f01a8e77513e8f9bcf6ae37c4867a933b1f09e9d1e4` |
| Accepted business runtime, unchanged | `da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e` |

The exact template has two isolated DynamoDB tables, one runner role containing one inline policy, and one cursor-probe Lambda. There is no transform, extra managed policy, log group, invocation permission, API or function URL resource. It reuses the existing Read role and `/project-respawn/Ntgre/team-hub/parity-read` log group. One exact S3 ZIP object would also require publication. All six checked names/objects (stack, role, function, two tables, ZIP object) were absent. No artifact upload or change set was created.

## Fresh protected baseline

Identity: `arn:aws:iam::058264289478:user/RavenTest`, account `058264289478`, eu-north-1. [Fresh baseline](team-hub-isolated-execution-evidence-2026-10-12/baseline.json), [protected templates/resources](team-hub-isolated-execution-evidence-2026-10-12/protected-after.json), [inventory](team-hub-isolated-execution-evidence-2026-10-12/after/inventory.json), [source-fence comparison](team-hub-isolated-execution-evidence-2026-10-12/source-fence-preservation-after.json).

- Legacy: 2,621, FunctionDirectiveStack 167; inspected templates unchanged.
- Team Hub: 48 product + 7 security; Core: 8 + 5; Tournament: 11.
- Both Team Hub Lambda complete configurations/revisions/code match accepted recovery; Active/Successful and function drift IN_SYNC.
- Actual Journal row strongly read: LEGACY_WRITER, epoch 1, version 1. Operational count 0; Journal 16 = 1 authority + 15 historical synthetic audits, no business records.
- Four source tables/logos remain empty; source PITR, deletion protection and reviewed backups verified. Source fence remains uninstalled and frontend remains Legacy/dormant.
- Installed execution/caller/Read/Command policy and boundary comparison passed. No permanent permissions changed. [Installed security inspection](team-hub-isolated-execution-evidence-2026-10-12/installed-security-audit.json).
- Local Amplify outputs independently validated for protected Ntgre, existing pool `eu-north-1_n24iLL7QE`. No sandbox or authentication configuration changed.

Authenticated authority-endpoint/16-route refresh was **not reached** before the quota stop. The previous accepted HTTP receipts remain historical evidence, not a fresh endpoint-health claim. The full preflight is therefore not marked complete merely because the configuration/state portion passed.

## Execution and acceptance matrix

| Gate | Actual result |
| --- | --- |
| Candidate pins/resource scope | PASS |
| Fresh AWS configuration/state preservation | PASS for recorded inspection scope |
| Cursor-probe reserved concurrency | **FAIL: 10 unreserved versus minimum 101 for reservation 1** |
| Full provisioning custody/lifecycle IAM | NOT COMPLETED; stopped before new simulations |
| Fresh runner/Read positive/negative suite and Analyzer | NOT RERUN after stop; preparation's 65/36 checks and zero findings are historical only |
| AWS-generated change set | NOT CREATED |
| Provisioning / installed temporary IAM | NOT EXECUTED / NOT APPLICABLE |
| 48 real DynamoDB scenarios | NOT EXECUTED |
| Nine actual-Read-role cursor checks | NOT EXECUTED; secret value not retrieved |
| Isolated authorization/privacy acceptance | NOT EXECUTED live; offline fixture results remain preparation evidence |
| Monitoring | Six alarms/detailed API metrics configuration preserved; new transaction/cursor/API acceptance signals not exercised |
| Cleanup | No temporary resources or S3 object created; nothing to remove, no lifecycle-created orphans |
| Business authority / frontend / production | UNCHANGED; no cutover or retirement |

Company SCP visibility remains the previously documented waiver, not a newly established permission proof. The quota failure is the exact demonstrated blocker; other uncompleted execution gates must still pass after any revised proposal. No broad IAM change, retry, Lambda patch, authority switch or frontend activation occurred.

## Required next review

The smallest candidate correction to evaluate is removal of **only** the probe's reserved-concurrency property, retaining fixed empty-input code, no public trigger, tightly controlled invocation and one sequential probe invocation. This removes an AWS-enforced concurrency cap, so its replacement controls need explicit review; this report does not claim equivalence or authorize the change. Alternatively, an explicitly authorized quota increase could preserve the existing pin but changes an account-level limit and is not proposed as an automatic repair.

After a separately reviewed candidate/security decision: repeat actual quota/custody/IAM/resource-isolation checks, fresh protected and authenticated endpoint preflight, inspect the complete change set, then execute only under valid authorization. Preserve the original pins and evidence. Remaining cutover gates include actual isolated transactions/cursor acceptance, business enforcement/telemetry and persona proofs, installed Legacy fence denial during separate maintenance, authority transfer, frontend publication and rollback readiness.

Current domain: Team Hub. Phase: M5 / 2B6 isolated verification blocked before writes. AWS resource changes: 0. Legacy changes: 0. Production changes: 0. Ownership-ledger changes: 0. Next gate: reviewed quota-compatible cursor-probe candidate and fresh full execution preflight.

**ISOLATED AWS BUSINESS VERIFICATION BLOCKED — PINNED CURSOR PROBE RESERVED-CONCURRENCY GATE.**
