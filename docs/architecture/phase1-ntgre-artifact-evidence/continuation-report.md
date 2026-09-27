# Continuation decision — 2026-09-23

**NO-GO — Phase 1 must not be deployed.** Completed evidence already resolves the Lambda discrepancies and build reproduction. This continuation verified it without repeating completed builds. The unchanged accounting gate still rejects Ntgre. Fresh AWS confirmation is also unavailable: scoped identity/stack queries returned `NoCredentials`, and `aws configure list-profiles` returned no profiles. AWS findings below refer to the September 22 capture, not a successful current refresh. No AWS mutation was attempted.

## A. Live Lambda equivalence

SHA values below are AWS CodeSha256 (base64). Baseline and candidate have the same complete ZIP digest, including maps and metadata. All 15 archived ZIPs were rehashed this continuation.

| Function | Deployed code SHA | Local baseline | Phase 1 candidate | Equivalent? |
| --- | --- | --- | --- | --- |
| post-confirmation | `6sGwH4C8Jhg8LYK0UdfDdSYsl0aVJiy7h8ryM3sAn/w=` | Same | Same | YES, entire ZIP |
| admin-user-management | `7uvEQ6FDsvAbs8gHRU6WWZZJ+CHB4kxMqvdHfmpTTHI=` | Same | Same | YES, entire ZIP |
| myFunction | `8bcpmI6i73K9N9nUPXkfg27rE3BCCjIbFYuYsU4YCis=` | Same | Same | YES, entire ZIP |
| twitch-runtime | `4NH+0eVEqcjmg/YtV0xWNMD0qpJGP1yp095KMvZp5E8=` | Same | Same | YES, entire ZIP |
| OverlaySource | `U/cAL1CAnNBh5VxdBa28I1yvT8Qo6O84izOX1jdCBC4=` | Same | Same | YES, entire ZIP |

Original differences: BUILD PATH / SOURCE MAP and TOOLCHAIN. Corrected package differences: zero APPLICATION CODE, SOURCE MAP, BUILD PATH, TOOLCHAIN, PACKAGING, METADATA or UNKNOWN. Physical names, ARNs, hex hashes, inventories and asset references remain in the prior investigation's linked evidence. Current AWS identity of these packages awaits credentials.

## B. Live build reproduction

Sufficient for the captured deployment: Windows Node 24.14.1, CDK 2.260.0, pinned lockfile/Amplify dependencies, correct directory depth and Ntgre context reproduced exact ZIPs in independent baseline/candidate installs. Historical npm provenance and the complete historical environment remain unknown. No installs or builds were repeated.

## C. Live to candidate changes

**ADD 0 / MODIFY IN PLACE 81 / DELETE 308 / REPLACE 0 / UNKNOWN 0**, against captured templates using static property/provider replacement analysis. Meaningful changes: 77 resolver updates, 308 obsolete-chain deletions and one generated codegen asset update; two nested template references carry the changes. One API-key expiry update is synthesis-time churn, with real in-place expiry effect. CDK metadata differences: zero. These are not newly certified current-live counts or an AWS execution plan.

## D. Protected resources

PASS against captured definitions/artifacts for each category: Cognito; DynamoDB; S3; KMS; AppSync API/schema; Lambda definitions/permissions/layers; actual five Lambda ZIPs; Team Hub; Creator/Twitch/OverlaySource; payments/webhooks; HTTP API wiring; retained IAM/auth; generated output snapshot. External services have no proposed action and were not separately audited. No current drift scan is claimed.

## E. Recovery readiness

Recorded state: PITR on two of 55 tables; no listed table backups or AWS Backup recovery points; three buckets without enabled versioning/Object Lock; inactive Cognito deletion protection; two enabled retained KMS keys. Eight configured secret names are absent at both inspected SSM paths. No restore drill proves data/user/secret recovery. These are existing recovery/integration-test limitations, not identified stateful mutations in this consolidation. They are not comprehensive recovery assurance. Current protections were not refreshed.

## F. Dependency/order proof

All 79 operations preserve authorization functions: 77 transition to already-existing unchanged anchors; two already use retained anchors. The recorded 735 graph/protected checks pass. No retained resource references deleted chains. CloudFormation defers nested cleanup until nested stacks have updated or rolled back, supporting resolver repointing before obsolete-chain removal. This is static graph evidence plus documented semantics, not a guaranteed AWS event schedule. [AWS cleanup guidance](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/troubleshooting.html).

## G. Rollback strategy

Before submission: STOP, no recovery needed. Resolver update failure before cleanup: normal CloudFormation ROLLBACK. Obsolete-chain deletion failure: prefer ROLL-FORWARD through cleanup repair when stack status permits. Rollback failure: stop and diagnose, with separately authorized recovery execution. Regression after completion: prefer a narrowly reviewed ROLL-FORWARD; restoration of the old layout requires expansion review.

The old directive template's 475 resources are technically restorable under AWS's 500-resource template limit, with 25 slots remaining. Reverse changes restore 308 resources and approximately 81 other records. Fresh conservative accounting counts every resource in the three changed baseline templates: **root 7 + data 86 + directive 475 = 568**, below the 2,500-resource nested-operation limit. Unmodified nested templates are not updated under [AWS nested-stack semantics](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-cloudformation-stack.html). This supports feasibility for the captured scope; it does not certify current service quotas, physical-name availability or an AWS operation plan.

The full 2,929-resource hierarchy is not an update/rollback operation-size count. Fresh recreation would exceed 2,500 and is prohibited. No AWS count violation is identified for this scoped reverse update; service quotas, drift, IAM propagation, unavailable assets or cleanup failures can still prevent rollback. Repository policy separately blocks ordinary baseline expansion: 475 exceeds its template action threshold and Ntgre lacks a hierarchy allowance. AWS automatic rollback does not run that local evaluator. [AWS resource and operation quotas](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cloudformation-limits.html).

## H. Candidate integrity

Fresh verification: **1,128/1,128 raw file hashes match**. Manifest SHA256: `91e0242ed9998d7b7fa422b27a6711f33240eda45afc50066b11cc0eafc0a8d7`. No application/backend source, lockfile, budgets or allowances were changed; unrelated SWG work remains excluded.

## I. Checks actually performed in this continuation

- Verified every previously pinned evidence file and report digest: zero mismatches before documentation edits.
- Verified all 1,128 candidate hashes and manifest digest.
- Rehashed five downloaded ZIPs plus ten reproduced archives, including AWS base64 conversion: all exact.
- Recomputed assembly totals and reran the unchanged accounting evaluator with/without existing allowance: FAIL, hierarchy 2,621 and Ntgre outside allowance scope.
- Computed the 568-resource total across changed baseline templates and checked AWS limits/cleanup documentation.
- Attempted read-only AWS identity/stack refresh: unavailable, NoCredentials; no CLI profiles.

No application tests, npm ci, synthesis, contract checks or build were rerun this continuation. The earlier 89 targeted tests and build remain prior evidence, and 653/653 remains tied to the accepted source snapshot. Fresh results and verification code are in `phase1-ntgre-artifact-evidence/continuation-verification.json` and `verify-continuation.mjs` relative to the main report.

## J. FINAL DECISION

**NO-GO — Phase 1 must not be deployed.**

Exact blockers: the unchanged accounting gate rejects the 2,621-resource Ntgre hierarchy, with its allowance covering only master/staging; fresh AWS identity/templates/packages/protection confirmation is unavailable without credentials. A reviewed Ntgre-specific debt decision and working read-only AWS credentials are needed to resolve these blockers. Neither authorizes deployment. No deployment command is proposed. Work stops at this report.
