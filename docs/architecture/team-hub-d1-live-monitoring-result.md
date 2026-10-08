# Project Respawn Team Hub 2B6 — D1 live monitoring result

**D1 LIVE MONITORING ACCEPTED — READY FOR REMAINING PRE-CUTOVER GATES**

8 October 2026. Acceptance is limited to the explicitly reviewed minimal dark-runtime D1-after-C2 monitoring scope. No business runtime, FROZEN/TARGET_WRITER, source fence, frontend activation, Legacy retirement or production change. Gate B and business epoch enforcement remain unaccepted.

## Exact candidate and deployment

| Artifact | SHA256 |
|---|---|
| D1-after-C2 product | cd11644cc163b2f06f486a6217127221109b26bd7dd8456726f63fd0dc307232 |
| D1-after-C2 security | 90876a5b857beadb6f1e4e72603b30939685c33ce9f7647c86b850f1e0b01d6f |
| Preserved runtime ZIP | a36406c42c727b4d8c262083e0cb95807f2404c4c8649b2eacc559915f4ba7d5 |

The original manifest, ten source hashes and preserved ZIP/template bytes verify. No fresh synthesis, rebuild, standalone-D1 substitution or current-HEAD deployment. Both objects were published under exact content-hash keys with AES256 and verified SHA256. [Pin/delta review](team-hub-d1-execution-evidence-2026-10-08/artifact-review.json), [publication](team-hub-d1-execution-evidence-2026-10-08/publication.json).

Security operator: arn:aws:iam::058264289478:user/RavenTest. Product caller: existing ProjectRespawn-TeamHub-Ntgre-Deploy role; execution role: existing ProjectRespawn-TeamHub-Ntgre-ReadProofExecution. Account 058264289478, region eu-north-1. No new principal, administrative grant or trust expansion.

Security change set: arn:aws:cloudformation:eu-north-1:058264289478:changeSet/team-hub-d1-monitoring-security-20261008/78e28c7b-2262-4714-a050-0b0050b603f2.

Product change set: arn:aws:cloudformation:eu-north-1:058264289478:changeSet/team-hub-d1-monitoring-product-20261008/c25ae498-2471-40b7-a244-c70f762d038e.

Both stacks reached UPDATE_COMPLETE with rollback enabled. Security changed only ExecutionBoundary, ExecutionRole and PreparationCaller artifact references. The exact new ZIP replaces the reviewed superseded 9d16027… reference; the accepted C2/dark rollback artifacts remain allowed. Product changed only ParityReadFunction.Code, ParityCommandFunction.Code and Stage.DefaultRouteSettings.DetailedMetricsEnabled. Zero additions, deletions, replacements or unrelated properties. API t54b88casf, routes, runtime roles, both tables and safeguards are preserved. [Security inspection](team-hub-d1-execution-evidence-2026-10-08/security-gate.json), [product inspection](team-hub-d1-execution-evidence-2026-10-08/product-gate.json), [security status](team-hub-d1-execution-evidence-2026-10-08/security-status.json), [product status](team-hub-d1-execution-evidence-2026-10-08/product-status.json).

## C2 and deployment security

Installed runtime inline policies and v6 boundaries remain exactly C2: authority-partition GetItem only, with LeadingKeys and Null=false; no business writes, Query/Scan, Operational access, secret access, Cognito administration, foreign-domain access or new KMS/Logs permissions. Deployment role/caller trust, policies and boundaries were read and compared before and after installation. Access Analyzer returned no findings for all three changed deployment policies. 44 deployed-versus-candidate deployment IAM decisions and 68 actual-runtime decisions before plus 68 after passed. These are effective IAM simulations, not new data-plane authority-read or business-transaction proof. [Deployment security](team-hub-d1-execution-evidence-2026-10-08/policy-review.json), [installed roles](team-hub-d1-execution-evidence-2026-10-08/installed-deployment-security.json), [runtime readback](team-hub-d1-execution-evidence-2026-10-08/after/installed-iam.json), [actual-role checks](team-hub-d1-execution-evidence-2026-10-08/runtime-security-after.json).

## Live probes and counter correlation

Bounded UTC metric window: **2026-10-08T13:21:00.000Z to 2026-10-08T13:22:00.000Z**.

All 13 authenticated normal routes returned HTTP 403/FORBIDDEN. Four existing IAM-only, delegated-JWT Core authorization proofs succeeded; four ordinary-user directory proofs returned FORBIDDEN. Each runtime repeated success and denial twice. These are the accepted read-only proof envelopes, not business-success responses or a verification bypass. Sessions/tokens remained in memory; no account or Core service changes.

| Runtime | Requests | AuthorizationFailures | WriterNotAuthoritative |
|---|---:|---:|---:|
| read | 8 | 6 | 4 |
| command | 13 | 11 | 9 |
| Total | 21 | 17 | 13 |

All 34 structured EMF events correlate to the 21 exact request IDs. HTTP denial emits a distinct configuration-writer event and one classified request event. Successful Core proofs emit one Requests increment and zero failure increments; ordinary directory denials emit AuthorizationFailures without WriterNotAuthoritative. CloudWatch ProjectRespawn/TeamHub datapoints exactly match log-derived counts with Environment=Ntgre and Runtime=read/command. All other emitted counters are actual observed zero datapoints for this window, not inferred zeros from absent data. [Probes](team-hub-d1-execution-evidence-2026-10-08/probes.json), [13 route denials](team-hub-d1-execution-evidence-2026-10-08/routes-after.json), [correlated logs and CloudWatch metrics](team-hub-d1-execution-evidence-2026-10-08/metrics-latest.json).

The first collection contained partial native API/Lambda counts and missing route datapoints; it remained pending. Subsequent read-only collection of the same window completed without extra probes or a relaxed threshold. [Initial ingestion receipt](team-hub-d1-execution-evidence-2026-10-08/metrics-attempt-1.json). Application log fields were checked against an explicit safe schema, and raw Team log messages were scanned for token/credential patterns before persistence. No subjects, private payloads or directory data appeared in application metrics/logs.

## Signals intentionally not claimed live

Core dependency failure classification passed offline injected-transport tests: DependencyFailures plus distinct CoreDependencyFailures. No Core outage was induced and no genuine dependency failure occurred during the live probes. Zero observed dependency counters do not prove the failure branch live.

The configuration-guard failure and AuthorityUnavailable emission passed offline tests. Current correct LEGACY_WRITER/PRE_CUTOVER/DISABLED configuration cannot safely exercise that failure without changing the pin, so it was not altered. D1 has no Journal authority reader; AuthorityUnavailable is not a live missing-record proof. Missing/stale epoch and transactional authority tests remain offline/later-business-runtime evidence. Normal target writes remain disabled.

38 package/monitoring/classification/ingestion tests passed. Offline business-handler cases are explicitly distinct from deployed D1 and its live acceptance.

## Native observability and operator

Native API Count/4xx and all 13 detailed route Count series were observed for the bounded window; Lambda Invocations, Errors and Throttles were queried for both runtimes. Missing native datapoints, if any for unexercised error signals, are recorded as absent rather than zero. DetailedMetricsEnabled is verified on the installed stage, with no access-log destination. Route dimensions follow [AWS HTTP API metric documentation](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-metrics.html): ApiId, Stage, Method and Resource.

All six existing alarms match the expected definitions. Named custodian/responder: **Ntgre (user)**. Monitoring is attended and manual; notification delivery is not configured or proven. During a separately approved window, watch the API/Lambda/custom counters and correlated request IDs, DynamoDB state/metrics, Core health and control-plane authority receipts. Abort for unexpected normal-route success, authority/state drift, business writes, Core failure, unexpected errors/throttles, protected-domain changes or missing required signals after the bounded ingestion deadline. Expected denial probes must be distinguished by their recorded IDs.

API access logs remain deferred under the selected Option A; no log-delivery/resource-policy administration was granted. No claim of automated paging or full business-transition telemetry. [Stage, alarms and operator responsibilities](team-hub-d1-execution-evidence-2026-10-08/observability.json).

## Protected state

Fresh strongly consistent authority readback matches every C1 field: CONTROL#AUTHORITY / STATE, team-hub-authority.v1, LEGACY_WRITER, epoch 1, version 1, original audit metadata. Exactly one control row. C1 temporary executor resources remain absent. [Authority](team-hub-d1-execution-evidence-2026-10-08/authority-after.json).

Team Hub remains 40 product +7 security resources; Core 8+5; Tournament 11; Legacy 2,621 with FunctionDirectiveStack 167. Physical resource identities, Core/Tournament templates and all inventoried Legacy templates remain unchanged. Four Legacy source tables remain empty with PITR/deletion protection and AVAILABLE backups. Operational is empty; Journal contains 15 retained audit rows plus the authority record, zero business rows. Target business records and business records changed: **0**. No frontend, production or retirement actions. [Final inventory](team-hub-d1-execution-evidence-2026-10-08/after/inventory.json), [preservation](team-hub-d1-execution-evidence-2026-10-08/after/preservation.json).

Six direct control-plane writes: two CreateChangeSet, two ExecuteChangeSet and two content-addressed PutObject calls. Read-only application invocations are recorded separately; no DynamoDB write. No failed deployment, permission patch or automatic deployment retry.

## Local validation and cleanup

38 tests passed; 19 script syntax checks, 34 JSON receipts and 88 documentation links validated. The targeted scan of 60 evidence/script/documentation files found zero credential, token or private-key patterns. Temporary request files and session pages are absent. Original C1 referenced pins remain intact. Complete metric acceptance occurred within the fixed 13:32:00 UTC ingestion deadline. [Validation receipt](team-hub-d1-execution-evidence-2026-10-08/local-validation.json).

## Remaining gates

- B: dormant source-fence design retained; no bundle attached. Actual all-path denial proof requires separately authorized FROZEN maintenance.
- C/business epoch: C1/C2 accepted; no live transactional authority/epoch enforcement or TARGET_WRITER activation proven by D1.
- E: independent frontend preparation remains inactive; final live authority/epoch binding, persona/network checks and frontend activation remain separate.
- F: prior isolated rehearsal evidence retained; remaining approved isolated proof and reviewed code/state-authority rollback conditions must close before cutover. No real rollback/reverse migration was performed here.

D1-after-C2 is the new dark monitoring baseline. Any rollback must preserve C2 and the C1 record using the reviewed prior C2 product/security artifacts through separate inspected authorization; do not infer business rollback or authority-switch approval.

**D1 LIVE MONITORING ACCEPTED — READY FOR REMAINING PRE-CUTOVER GATES**
