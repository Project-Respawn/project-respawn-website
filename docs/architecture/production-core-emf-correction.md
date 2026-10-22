# Production Core EMF correction — 21 October 2026

**PRODUCTION CORE EMF CORRECTION BLOCKED — EXACT DEPLOYMENT ARTIFACT BINDINGS REQUIRE SEPARATE IAM REVIEW.**

The emission correction is implemented, built and tested. No AWS writes, Lambda invocations, publication, change sets, deployment, IAM changes or production changes occurred in this task. Core remains deployed with the accepted KMS correction and old runtime; live Core acceptance remains pending. Team Hub, authority, business migration and Master remain excluded.

## Confirmed root cause

[Fresh installed baseline](production-core-emf-evidence-2026-10-21/fresh-installed-baseline.json) confirms JSON logging, ApplicationLogLevel INFO, SystemLogLevel INFO and the existing `/project-respawn/Production/core/contracts` group. All installed role policies, boundaries, trusts and templates match the accepted security/product pins. The complete Lambda environment, runtime, handler, role, memory, timeout, architectures, revision and code hash match the accepted runtime execution receipt.

[Read-only logging inspection](production-core-emf-evidence-2026-10-21/live-logging-inspection.json) correlates request `d427e306-cbeb-4425-a8d6-9b3be19b5bbe` with successful platform execution and the nested metric event. The old `console.log(JSON.stringify(eventRecord(...)))` puts EMF inside `message`; `_aws` is absent at the log-event root. Exact Production-dimension queries still return no custom counter points. Native initialization and KMS success are already accepted evidence and were not repeated.

[AWS Node.js logging guidance](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-logging.html) describes the JSON-console/EMF incompatibility and direct stdout emission. The [CloudWatch EMF specification](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format_Specification.html) requires `_aws`, dimensions and metric values at the root of a complete JSON event. Platform delivery can duplicate events; the application must still emit only once per invocation.

## Minimal correction and proof limits

Only `domains/shared-core/entry.mjs` changes: the existing finally block writes `JSON.stringify(eventRecord(...)) + '\n'` directly to `process.stdout`. The record builder, namespace `ProjectRespawn/Core`, Environment dimension, four Count metrics, outcome classification and response/authorization paths are unchanged. The production build retains the accepted Production rebinding. No additional SDK, PutMetricData permission, IAM action or log destination is introduced.

The accepted ZIP was reproduced byte-for-byte before applying the correction. The new bundle is byte-identical except for this single emission expression. The actual ZIP handler was executed in an isolated VM with SDK/verification boundaries stubbed and a simulated Lambda JSON console wrapper. The old artifact reproduced nesting; the corrected artifact emitted one complete root JSON record. Tests cover successful authorization, ordinary authorization denial, unauthenticated identity, wrong issuer/client, dependency failure, the real directory limiter, privacy, units/dimensions and 31 repeated requests with one application record per request. These are offline tests, not proof of actual AWS extraction or signed production authentication.

JSON LoggingConfig remains unchanged. Other console logs retain their current formatting and filtering. Direct stdout is the supported path that bypasses console wrapping; its actual CloudWatch ingestion must be demonstrated after separate deployment authorization. No universal exactly-once CloudWatch-delivery guarantee is claimed.

## Immutable artifacts

| Artifact | SHA-256 |
| --- | --- |
| New Core runtime ZIP | `dc2a7137a725f6a82582abc8a800f5d30846058ecdbe12965f81a19c887154c4` |
| New Core product template | `5b8783be1765409602b978ade59e641ed11c7516f63436c436318470bbd9d086` |
| Unchanged installed security template | `8f83dda21a47895b2f48cea19839daa84bdbcba7f28ff82e30906aec595b0c44` |
| Rollback product | `0302056f0152107ecabd9d459ab50d436245587eef3cec1aa4d971c77a6ca1e4` |
| Rollback runtime | `fecdc0327a5f75c8be4f9e4f280776b6908f646dfdffdf6bee4e61e5e8126503` |

[Candidate manifest](production-core-emf-evidence-2026-10-21/manifest.json). Expected product delta is only Contracts Code, zero additions/deletions/replacements. IAM, LoggingConfig, environment, imported log, alarm definitions and resource identities remain unchanged. Counts remain six security plus seven product resources. AWS-generated change-set counts have not been requested and remain a live execution gate. Rollback restores the previously deployed runtime, which initializes but has known-broken custom metric extraction; it cannot be mistaken for full operational acceptance.

## Exact deployment blocker

[Actual-role artifact controls](production-core-emf-evidence-2026-10-21/artifact-binding-controls.json) return:

| Installed principal/control | New artifact | Accepted rollback |
| --- | --- | --- |
| Core Execution GetObject, runtime ZIP | implicitDeny | allowed |
| Core Deploy GetObject, product template | implicitDeny | allowed |
| Core Deploy CreateChangeSet, exact TemplateURL | implicitDeny | allowed |

The intended restricted caller/execution workflow cannot deploy these new hash keys with unchanged execution IAM. No alternate administrator route, mutable overwrite of an approved key, inline-code substitution or permission bypass is proposed. Simulations do not independently certify organization policies or live writes.

The smallest follow-up review would cover exact artifact-reference additions only in Execution, ExecutionBoundary, Caller and CallerBoundary: new runtime/product GetObject bindings where required and the new exact product TemplateURL, retaining every accepted rollback reference. No action, PassRole, stack/function scope, runtime boundary, KMS, Cognito or business permission expansion is needed. That is still an execution-IAM change and is outside this task's preservation constraint. No revised security template or policy has been generated. This precise exception needs separate review before calling the package deployment-ready.

## Validation

104 focused tests pass, including eight exact-artifact emission/preservation/binding tests, production authentication/directory/privacy/cursor regressions, accounting and migration controls. All six unchanged installed policies have zero Access Analyzer ERROR/SECURITY_WARNING findings; CloudFormation ValidateTemplate accepts the new product template. Core TypeScript passes using the repository's installed compiler/types. Both baseline and corrected production Core bundle builds pass with the same dependencies.

The additional full website build attempt stops at missing VITE_API_BASE_URL (the isolated worktree has no frontend environment settings). It is not represented as a successful production website build. No frontend source changed and no environment values, checkout configuration or generated outputs were substituted to make it pass. A future public website release still needs its own environment-bound build acceptance.

The first historical regression run lacked its old local `.tmp/core-2b5a/runtime.zip` cache; the exact hash-verified original cache was recovered from the primary workspace. The final complete suite passes without skipped checks or regenerated historical candidates. The ledger reconciles all 2,621 Legacy resources. Historical execution/R2 bindings, artifact hashes and secret-pattern checks are recorded in the sealed validation summary. Primary-workspace SWG edits remain untouched.

## Separately authorized execution sequence

1. Resolve and pin the exact artifact-binding security exception above. Review its effective positive/negative controls and preservation; do not weaken the existing guards. No deployment may begin while this blocker remains.
2. Confirm a fresh operator window and no concurrent administration. Verify account 058264289478/eu-north-1/RavenTest, complete candidate/source/evidence/rollback hashes, installed IAM/configuration, source recovery/data, Cognito, imported log, Master and protected domains. Stop on drift.
3. Publish only approved immutable objects after authorization. If separately approved artifact-binding security changes are required, inspect their exact four-resource scope, deploy with rollback enabled and verify installed equivalence before product preparation.
4. Inspect the product change set and exact AWS template. Require only Contracts Code Modify, no replacement, deletion, environment/IAM/logging/log-group change. Execute with rollback enabled only under separate explicit authorization.
5. Verify actual CodeSha256, complete configuration/environment and preserved IAM/KMS. Invoke once with the reviewed invalid token. Require successful initialization and the unchanged UNAUTHENTICATED response; do not retry an ambiguous failure.
6. Correlate request ID with platform JSON records and one root EMF event. Query exact namespace/dimensions and the invocation time bucket until a reviewed bounded ingestion deadline. Require Requests and Denied positive points, zero dependency/rate-limit values for this probe, and native Errors/Throttles zero. Missing points stop acceptance; no fake metric publication or blind request replay.
7. Verify alarm namespace/dimensions/statistic/period/threshold against actual newly ingested points and refresh evaluation state. An OK alarm with absent input is insufficient. Do not force alarm states or deliberately cause a production outage. Platform duplicate delivery must be distinguished from duplicate application emission through log-event/request correlation.
8. Complete real production Admin and ordinary-user authentication/directory/privacy/cursor tests plus rejection of a valid signed Ntgre token, using existing accounts and permitted normal session reuse. No credential extraction/reset or fabricated receipt. Stop on an unexpected contract/security result.
9. Refresh monitoring and source/backups/Cognito/Master/protected-domain preservation, verify imported log remains IN_SYNC, stop the owned session helper, preserve sanitized evidence and update acceptance. Stop after Core; no Team deployment, authority, migration, Master publication or retirement.

On failure, preserve partial completion and allow CloudFormation's enabled rollback to settle. Do not automatically broaden permissions, retry writes, delete the imported log or change authority. A rollback to the old ZIP restores a known monitoring defect and therefore requires an explicit operational decision, not an acceptance claim.
