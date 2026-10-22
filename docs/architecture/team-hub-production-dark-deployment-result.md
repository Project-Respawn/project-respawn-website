# Project Respawn ? Production Core/Team Hub dark deployment result

**PRODUCTION DARK DEPLOYMENT BLOCKED ? CORE LAMBDA CREATION REQUIRES kms:CreateGrant.**

Actual AWS execution on 20 October 2026, account 058264289478, eu-north-1, RavenTest. [Authorization](production-dark-deployment-evidence-2026-10-20/authorization.json), [consolidated result](production-dark-deployment-evidence-2026-10-20/result.json), [post-stop preservation](production-dark-deployment-evidence-2026-10-20/post-stop-preservation.json). No IAM broadening, deployment retry or Team progression occurred after the mandatory Core failure.

## Scope, artifacts and preflight

All 41 reviewed input hashes matched before execution. Manifest a2edd836734044c9a607ba718ae06b39b1c392029fbf6fec066358ba57ca3d43; execution package bd6c821dbc7d9e4ea9aee68abf9574bd15a8a8504499361c9364caba18f21d69. The original mutable review documents are preserved byte-for-byte under [approved documents](production-dark-deployment-evidence-2026-10-20/approved-documents/team-hub-production-migration-readiness.md.source.txt). Runtime ZIPs/templates were never rebuilt or substituted. Exactly three reviewed Core objects were published with AES256, exact checksum and downloaded SHA verification. Team objects were not published.

Fresh source/table/backup identities, 121 records/digests/relationships inherited from accepted R2, protections, Cognito/client, Master/protected stack baselines, 25 name collisions, managed-key policies, bucket configuration and account capacity passed. Existing recorded drift metadata showed no unexpected MODIFIED/DELETED entries; this is not a claim of exhaustive fresh account-wide drift detection. Protected local Ntgre outputs were also verified without switching them. Fourteen policies passed fresh Access Analyzer and 458 policy cases; ten actual installed execution-role cases passed. Those simulations did not prove live KMS lifecycle authorization.

## Change sets and installed resources

| Stack | Change-set inspection | Actual outcome |
|---|---|---|
| Core security | Exactly 6 additions, zero modifications/deletions/replacements | CREATE_COMPLETE; all managed/inline policies, boundaries and trusts read back and matched |
| Core product | Exactly 7 additions, zero modifications/deletions/replacements | Lambda creation failed; rollback enabled; ROLLBACK_COMPLETE |
| Team security | Not created | Not deployed; Core live prerequisite failed |
| Team product | Not created | Not deployed |

[Core security change set](production-dark-deployment-evidence-2026-10-20/coreSecurity-change-set-inspected.json) ? [Core product change set](production-dark-deployment-evidence-2026-10-20/coreProduct-change-set-inspected.json) ? [terminal rollback/events](production-dark-deployment-evidence-2026-10-20/coreProduct-terminal-rollback.json). Product creation used only the new bounded Core caller and exact execution role. Both changesets used the reviewed OnStackFailure=ROLLBACK behavior; no execution was retried.

## Demonstrated blocker

CloudTrail event **8e4f248c-cd7e-4b9a-be43-d3a35d8aca21**, KMS request **964d5eaf-0f2b-4620-85cb-12ec85d65691**, Lambda request **e7338420-65e9-4864-a4cd-b9871abc277e** identify the denied kms:CreateGrant operation on AWS-managed Lambda key **13ae83f9-bc5f-4486-a013-e07b9d7d52e7**, through assumed role **ProjectRespawn-Core-Production-Execution/AWSCloudFormation**. [CloudTrail evidence](production-dark-deployment-evidence-2026-10-20/kms-create-grant-denial.json) and [actual installed policies](production-dark-deployment-evidence-2026-10-20/kms-blocking-installed-policies.json).

The identity Deny/NotAction permits only Encrypt, Decrypt and DescribeKey on this key, so it explicitly denies CreateGrant. Its boundary likewise lacks a CreateGrant Allow. Adding an Allow alone would not override the Deny. CloudTrail requestParameters is null; no grantee or grant-operation conditions are invented. This requires a new narrowly reviewed security candidate and authorization; none was prepared or installed after the stop. Pre-deployment validation missed this **Lambda creation** lifecycle requirement; earlier recovery/update evidence and negative Grant tests were not sufficient proof for first creation. The earlier deployment-readiness verdict is superseded by actual AWS evidence. The uninstalled Team execution candidate uses the same KMS action ceiling; its creation lifecycle must be reviewed together before resumption rather than repeating this failure. No Team policy was installed or changed.

## Recovery and preservation

Native rollback removed the failed Core Lambda, product runtime role and four alarms. [Independent inventory](production-dark-deployment-evidence-2026-10-20/coreProduct-post-rollback-inventory.json) confirms their absence. Core security's six resources remain intentionally installed. Product Logs was DELETE_SKIPPED under its retained lifecycle: **/project-respawn/Production/core/contracts** remains. The failed product stack record remains ROLLBACK_COMPLETE. No automatic deletion, cleanup, unhealthy restore, IAM change or another deployment was attempted. A future review must explicitly handle that stack record and retained log name before retry; do not assume an empty fresh CREATE is possible.

Post-stop scans match all 121 accepted source records (1/8/11/101), with four AVAILABLE backups, PITR and deletion protection. R2 evidence/provenance remains intact. Production Cognito/client/users, Master/public deployment and all pre-existing protected stacks, including Ntgre, are unchanged. Three approved artifact objects, six new Core security resources and one retained product log group are the surviving deployment additions; the two Core stack records also remain. No source writer fence, business mutation, production authority row, frontend publication or Legacy retirement occurred.

Core live authorization/directory/cursor acceptance and monitoring were **not run** because its function was rolled back. No production login/token was collected; the prepared local helper was not started. Team dark acceptance and authority-dependent checks remain pending, not passed. Authority initialization remains separately prohibited by this authorization.

Two local CLI response-handling issues were corrected with read-only inspection: an S3 download argument error and an empty ExecuteChangeSet response. The first object was verified in place without another PutObject, and the already-started security execution was verified without another ExecuteChangeSet. Historical stop receipts are retained; neither was an artifact substitution or IAM change. The subsequent real KMS denial caused the mandatory deployment stop.

## Next authorization boundary

Review the minimum required CreateGrant identity/boundary correction and applicable supported service/grantee conditions; preserve unrelated/customer-managed-key denial. Separately approve a revised pinned security candidate, failed-stack/log-group handling and one product retry. Only after Core deploys and its actual production identity/directory/cursor/monitoring checks pass may the original Team sequence be reconsidered. Do not initialize authority, migrate data or publish Master.
