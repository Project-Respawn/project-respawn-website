# PROJECT RESPAWN TEAM HUB 2B6 — AUTHORITY ENDPOINT DEPLOYMENT RESULT

8 October 2026. **AUTHORITY ENDPOINT ACCEPTED — READY FOR FINAL PRE-CUTOVER REVIEW**.

Acceptance covers only the authenticated read-only authority endpoint and dormant frontend binding. Real authority remains LEGACY_WRITER, epoch 1, version 1. No FROZEN/TARGET_WRITER transition, frontend activation, source fence, Legacy retirement or production change.

## Identity, exact artifacts and deployment

Account `058264289478`, `eu-north-1`. Security operator `arn:aws:iam::058264289478:user/RavenTest`; product caller `ProjectRespawn-TeamHub-Ntgre-Deploy`, execution role `ProjectRespawn-TeamHub-Ntgre-ReadProofExecution`. Existing identities/trust only. The sandbox initially could not see the default AWS profile; verification succeeded through the approved host execution context. No credentials were copied into the workspace.

| Artifact | SHA-256 |
|---|---|
| Manifest | `30ac97e5b48f3867268403c13766e9439aa2e0821d87585a685cfdfae1b997d1` |
| Product | `5a2d99f4919fd07c619f483e556a0464b9cbaad0be00665201438b0f4ec7d0e9` |
| Read runtime | `cd58cc3553867f268af79bc9c710fe35e1bab07882d39b423e05b39626a7eedd` |
| Security | `503d08c93fddc869a11bc01c6ec57fe4e7449e618e0c9435e7bf2ed996351abc` |

The preserved content-addressed assembly was used directly. No synthesis, runtime rebuild or HEAD substitution. Exactly two S3 objects were published at reviewed content-hash keys with AES256/SSE-S3 and checksum/encryption readback. No KMS expansion. [Pins](team-hub-authority-endpoint-deployment-evidence-2026-10-08/artifact-review.json), [publication](team-hub-authority-endpoint-deployment-evidence-2026-10-08/publication.json).

| Stack | Inspected change set | Result |
|---|---|---|
| Security | `team-hub-authority-status-security-20261008/431e0dab-9335-44bf-b41e-113b22e17d2c` | Exactly ExecutionBoundary, ExecutionRole and PreparationCaller modifications; UPDATE_COMPLETE |
| Product | `team-hub-authority-status-product-20261008/9213b588-9a16-451b-a074-dd885c99e101` | AuthorityStatusRoute and AuthorityStatusInvokePermission additions, ParityReadFunction.Code update; UPDATE_COMPLETE |

All AWS change-set pages and returned templates were inspected. Zero deletions, replacements, conditional replacements or unexpected resources. Both executions explicitly used DisableRollback=false. Installed templates/code/policies match the pins. Command retains the accepted D1 ZIP. Existing API, Stage, JWT authorizer, integration, tables and runtime permissions remain unchanged. The installed Lambda resource policy permits only the exact `$default/GET/v1/authority` route and source account. No broadening of the existing `/v1/teams*` invocation grant.

[Security inspection](team-hub-authority-endpoint-deployment-evidence-2026-10-08/security-gate.json), [product inspection](team-hub-authority-endpoint-deployment-evidence-2026-10-08/product-gate.json), [installed security](team-hub-authority-endpoint-deployment-evidence-2026-10-08/installed-deployment-security.json), [invoke permission](team-hub-authority-endpoint-deployment-evidence-2026-10-08/invoke-permission.json).

Six direct control-plane writes: two PutObject, two CreateChangeSet and two ExecuteChangeSet. No failed deployment, automatic deployment retry or permission patch. Application verification requests and read-only IAM evaluation are recorded separately; no DynamoDB writes.

## Authentication and actual Journal read

`GET https://t54b88casf.execute-api.eu-north-1.amazonaws.com/v1/authority`:

- Missing/invalid tokens: 401.
- Existing Ntgre Admin and ordinary access tokens: 200, LEGACY_WRITER, epoch/version 1, exact approved contract metadata and no-store.
- ID tokens: 401. Tokens with altered issuer/client claims: rejected. These tampered-signature probes do not independently prove rejection of a correctly signed token from a foreign pool/client. Exact unchanged authorizer issuer/audience configuration plus offline signed-JWT/handler tests provide the complementary configuration/classification evidence; no foreign pool or client was created.
- Browser query input `epoch=2`: 400; no mode/key selection or write.
- Sanitized schema contains only contractVersion, domain, environment, account, region, mode, epoch, version and observedAt. No keys, audit metadata, IAM details, private records or tokens.

The installed Read CodeSha256 equals the reviewed ZIP. Its authority entry awaits the exact Journal `GetItem` with ConsistentRead=true before producing 200, has no fixture fallback, and fixes PK=CONTROL#AUTHORITY/SK=STATE. The same compiled ZIP passed the local transport serialization test. Live 200s plus exact installed bytes and independent strongly consistent control-row readback establish execution of that path; no CloudTrail DynamoDB data-event trace is claimed. Every approved C1 field remains unchanged and exactly one authority row exists. C1 temporary resources remain absent.

[Live requests](team-hub-authority-endpoint-deployment-evidence-2026-10-08/live-endpoint.json), [authority readback](team-hub-authority-endpoint-deployment-evidence-2026-10-08/authority-after.json), [installed product](team-hub-authority-endpoint-deployment-evidence-2026-10-08/product-installed.json).

## Frontend binding and dark behavior

The unchanged dormant client consumed real server status in Node and isolated browser checks. It refused business calls because live mode is LEGACY_WRITER. Five browser presentation scenarios passed: Admin, ordinary, Manager, Coach and Player. Admin/ordinary were real existing Ntgre identities; Manager/Coach/Player used the ordinary identity as presentation scenarios, not three newly authenticated role-specific business memberships. This endpoint requires authentication and has no Team role decision. Full business-persona cutover acceptance remains a later gate.

The browser used an intercepted isolated document at the approved localhost:5174 origin, with the accepted client bundled only in memory; nothing was published to the website. It fetched the real API directly and verified CORS/network behavior. Local-only response injection proved missing/stale/mismatched authority and endpoint unavailability fail closed. These injected failures are not live authority-state changes or live service outage proofs. No business request, Legacy fallback or foreign-domain initialization occurred in that isolated client. No unexpected browser console error. Explicit frontend activation remains disabled; a TARGET status alone does not authorize activation. Historical full-site UI/lazy-loading acceptance remains linked in the readiness report.

All 13 normal authenticated business routes returned 403 before and after deployment, using guarded invalid/empty command bodies. Operational contains zero items; Journal contains only 15 retained audit rows plus the C1 authority record. [Before denial](team-hub-authority-endpoint-deployment-evidence-2026-10-08/routes-before.json), [live browser](team-hub-authority-endpoint-deployment-evidence-2026-10-08/live-browser.json), [final inventory](team-hub-authority-endpoint-deployment-evidence-2026-10-08/after/inventory.json).

## Security, tests and monitoring

Seven policies passed Access Analyzer with no errors/security warnings. 62 deployed-versus-candidate deployment decisions and 68 actual-runtime decisions before plus 68 after passed. Runtime C2 inline policies and v6 boundaries are unchanged: authority-partition GetItem only, exact Core invocation/logging retained, unrelated Journal/business/foreign access denied. Eighteen focused endpoint/compiled-runtime tests passed this task; the earlier 648-test readiness suite and builds remain applicable because candidate bytes/source are unchanged.

For 16:24:00–16:25:00 UTC, 27 API probes produced 21 Lambda requests and 34 EMF events. Read Requests=12, AuthorizationFailures=6, WriterNotAuthoritative=4; Command Requests=9, AuthorizationFailures=9, WriterNotAuthoritative=9. All other custom failure counters were observed zero. Every Lambda-handled request ID correlates to expected events and exact CloudWatch counts. Gateway-rejected tokens correctly produce no assumed custom Lambda increment. Native API Count=27, 4xx=23, 5xx=0; both runtimes Errors=0 and Throttles=0. The expanded acceptance window includes all ten browser invocations: Read=22 total, Command=9, still zero Errors/Throttles/API5xx. No Core disruption or deliberate live dependency failure.

D1 stage detailed metrics and six alarms remain installed. Attended manual monitoring and access-log deferral remain unchanged; no new notification-delivery claim. [Correlated metrics](team-hub-authority-endpoint-deployment-evidence-2026-10-08/metrics-latest.json), [full-window health](team-hub-authority-endpoint-deployment-evidence-2026-10-08/acceptance-health.json), [runtime IAM](team-hub-authority-endpoint-deployment-evidence-2026-10-08/runtime-security-after.json), [monitoring/security refresh](team-hub-authority-endpoint-deployment-evidence-2026-10-08/security-monitoring-refresh.json).

## Preservation and remaining gates

Legacy remains 2,621 resources, FunctionDirectiveStack 167; all 62 inventoried templates match. Four source tables remain empty, PITR/deletion protected, backups AVAILABLE; logos empty. Team Hub 42+7, Core 8+5, Tournament 11. Existing physical identities and protected templates remain unchanged. Production untouched. [Preservation](team-hub-authority-endpoint-deployment-evidence-2026-10-08/after/preservation.json).

Next is final pre-cutover review, not automatic maintenance. Gate B live installed-fence denial proof still requires separately authorized FROZEN maintenance. Gate C deployed business authorization and transactional epoch enforcement remain unaccepted. Final authority transition, frontend activation and later Legacy retirement require separate authorization. Any future business-runtime candidate must preserve this now-installed authority route/contract and exact API invocation permission; do not deploy an old 40/44-resource template that silently removes them.

If endpoint rollback is separately required before business activation, restore the exact accepted D1 product first through an inspected rollback-enabled update, removing only the new route/permission, then restore security artifact references. Retain Journal control/state; do not restore an obsolete pre-D1 runtime or broaden access. No rollback was needed.

Authenticated browser contexts were disposed. One exact task-owned ignored browser cache remains partly Windows-locked after cleanup; it is not source/evidence and no credential contents were inspected. No AWS temporary resources were created for verification.

[Machine-readable result](team-hub-authority-endpoint-deployment-evidence-2026-10-08/result.json).

**AUTHORITY ENDPOINT ACCEPTED — READY FOR FINAL PRE-CUTOVER REVIEW**
