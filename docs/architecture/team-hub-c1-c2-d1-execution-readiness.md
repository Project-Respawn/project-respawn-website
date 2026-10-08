# Team Hub C1 / C2 / D1 execution readiness

**Latest D1 result: LIVE MONITORING ACCEPTED — READY FOR REMAINING PRE-CUTOVER GATES (8 October 2026).** Pinned D1-after-C2 deployed; 13 normal routes deny, 21 live requests correlate to 34 EMF events and matching CloudWatch counters. C2 IAM/v6 boundaries preserved. LEGACY_WRITER epoch/version 1, zero target business rows; no fence/frontend/production change. Dependency/configuration/transactional epoch failure proofs remain explicitly offline or later gates. [D1 live result](team-hub-d1-live-monitoring-result.md). Earlier entries below are historical.


**Latest C2 result: AUTHORITY READ ACCEPTED — READY FOR D1 REVIEW (8 October 2026).** Security/product updates complete, exact runtime policies and v6 boundaries verified; 68 actual-role IAM decisions pass and all 13 normal routes still deny. Authority remains LEGACY_WRITER, epoch/version 1; runtime code, frontend and protected domains unchanged. D1 not deployed. [C2 result](team-hub-c2-execution-result.md). Earlier entries below are historical.


**Latest C1 result: AUTHORITY INITIALIZED - READY FOR C2 REVIEW.** Live conditional creation verified: LEGACY_WRITER, epoch/version 1. Temporary role/state machine removed; normal routes remain denied; zero business records changed. C2/D1 not executed. [C1 result](team-hub-c1-execution-result.md).


**TEAM HUB C1 AUTHORITY INITIALIZATION READY FOR EXECUTION REVIEW**

Prepared for account 058264289478, eu-north-1, Ntgre only. This is an independently reviewable package, not execution approval. No AWS writes, record initialization, IAM changes, deployment, FROZEN/TARGET transition or frontend switch occurred. C1 is independently reviewable from C2 and D1. [Exact manifest and hashes](team-hub-c1-evidence-2026-10-07/candidate.json).

## C1 record and fixed conditional creation

The approved schema has no environment field; adding one would violate its exact shape. Ntgre is enforced by the fixed account, region and table, not by inventing a schema attribute.

| Field | Exact value |
|---|---|
| Table | ProjectRespawn-TeamHub-Ntgre-Journal |
| PK / SK | CONTROL#AUTHORITY / STATE |
| schemaVersion | team-hub-authority.v1 |
| mode | LEGACY_WRITER |
| epoch / version | 1 / 1 |
| changedAt | 2026-10-07T22:32:12.867Z (prepared metadata timestamp, not a claim of execution time) |
| changedBy | team-hub-c1-executor (nonpersonal service label) |
| gateDigest | 2227a62a06992e9e09ff672ad6e2f09164e0304f3f68db491437a93577f1ab94 |

[Exact typed PutItem request](team-hub-c1-evidence-2026-10-07/c1-request.json). ConditionExpression is attribute_not_exists(PK) AND attribute_not_exists(SK); ReturnValues NONE. Existing state is never overwritten, updated or deleted. The metadata digest binds the reviewed installed-IAM evidence; it does not confer approval. Preserve this request hash, or re-review any metadata change. Actual execution time comes from audited workflow history.

## Temporary security-owned executor

The smallest proposed executor is a temporary STANDARD Step Functions state machine plus its inline-policy IAM role: **two temporary resources**, no Lambda, secret, bucket, log group, API, schedule or permanent administrator role. [Template](team-hub-c1-evidence-2026-10-07/c1-template.json), [fixed definition](team-hub-c1-evidence-2026-10-07/c1-workflow.json).

The execution role trusts only states.amazonaws.com, with exact aws:SourceAccount and aws:SourceArn for ProjectRespawn-TeamHub-Ntgre-C1Initialize. No human, domain runtime or generic CloudFormation principal can assume it under that trust. Security custody remains with Ntgre (user), using the existing separately approved account security identity; current read-only inspections identify RavenTest. No new administrative capability is granted to the normal Team deployment caller. The eventual review must explicitly authorize the security-owned create/start/delete lifecycle and confirm that authenticated operator's existing permissions, rather than silently broadening a role.

The workflow discards execution input, reads the fixed item consistently, fails if it exists, performs exactly the pinned conditional PutItem, reads back consistently and checks every expected schema field. No JSONPath/dynamic parameter can select table/key/item/state/epoch. It has a 120-second timeout, no retries, no update/delete path and no business call. A racing duplicate fails at the conditional write even after an absent pre-read. Errors stop; they never trigger an unconditional fallback.

IAM allows only GetItem/PutItem on the exact Journal ARN with LeadingKeys CONTROL#AUTHORITY and Null=false. All other actions/resources are denied. Both permissions are bounded by mandatory WindowStart/WindowEnd parameters without defaults. Execution review must select a concrete UTC window of at most 15 minutes and validate it using validateWindow; policy simulations use an explicitly labelled example window, not a scheduled authorization. IAM expiry bounds existing sessions too; role MaxSessionDuration is not relied upon for the shorter data-access limit. No permanent access remains after cleanup.

**Security limit:** LeadingKeys controls the partition, not SK or item attribute values or ConditionExpression. Fixed workflow code supplies SK=STATE and LEGACY epoch/version 1. Combined service-only trust, immutable reviewed definition and constrained IAM protect other entries. The IAM role alone would technically cover another sort key within CONTROL#AUTHORITY; do not claim otherwise. Only the security custodian may deploy/change the workflow; read back and hash its definition/trust/inline policy immediately before start. A drifted definition or additional policy stops execution. An account administrator able to rewrite the executor remains a trusted security owner, not a runtime bypass.

[AWS Step Functions trust guidance](https://docs.aws.amazon.com/step-functions/latest/dg/procedure-create-iam-role.html) supports source-account/ARN scoping. [DynamoDB integration](https://docs.aws.amazon.com/step-functions/latest/dg/connect-ddb.html) supports fixed GetItem/PutItem tasks. [Conditional PutItem](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html) supplies overwrite prevention.

Authentication is normal AWS authenticated security-owner access; no embedded credentials or generated credential file. Approval records exact template/definition/request hashes and window parameters. Start with empty input and a unique reviewed execution name. Preserve create/start caller identity, state-machine execution ARN, sanitized execution history and consistent readback receipt; do not assume a CloudTrail DynamoDB data-event trail exists. STANDARD workflow history provides task evidence; management audit configuration must be checked at execution review. History contains only the fixed nonpersonal record when started as instructed.

After a terminal result, export the receipt, verify normal target APIs still deny, then delete only the two temporary resources through the reviewed security-owned cleanup procedure. No record deletion is part of stack removal. Confirm role/state machine absence and expiry. If the task timed out or verification failed after PutItem, stop and inspect the exact row: do not retry blindly, delete it or advance authority. Prefer retaining a correct LEGACY row. Removing it requires separate conditional-removal authorization; this role has no DeleteItem.

## C2 separate runtime authority-read candidate

[C2 product](team-hub-c1-evidence-2026-10-07/c2-product.template.json) and [C2 security](team-hub-c1-evidence-2026-10-07/c2-security.template.json) retain accepted dark runtime bytes, environment safeguards and exact Core permissions. Only the two runtime inline policies and their boundaries gain GetItem on Journal with authority-partition LeadingKeys and Null=false. No business-table reads, Query, Scan, writes, broader Journal partition, cursor secret, Cognito, business KMS or log administration is added. Resource counts remain 40+7. Exact C2 template URL/object references are proposed separately in deployment security, retaining rollback references.

IAM cannot constrain SK=STATE; fixed reviewed readers must enforce it. The deployed dark runtime has no control reader, so C2 alone does not invoke GetItem or change business behavior. C1 initialization alone likewise cannot enable target writes: deployed dark code has no repository/mutation path, and its existing LEGACY/PRE_CUTOVER/DISABLED guards remain. The future business handler also rejects LEGACY authority. No TARGET/FROZEN row is created to test this.

## Cursor-secret decision

**Required only for future business activation; excluded from C1, C2 and D1.** The business entry in domains/team-hub/cutover/entry.mjs fetches Secrets Manager before building createCutoverHandler. That passes cursorSecret into the business service. domains/team-hub/cutover/service.mjs requires signing material and uses HMAC-SHA256 to validate/generate bounded pagination tokens. The deployed dark Core proof handler does not instantiate that service. D1's bundle dependency check excludes Secrets Manager, DynamoDB and business repository/service/handler imports. No secret was retrieved or exposed.

## D1 minimal monitoring candidate

New explicitly revised dark-runtime SHA256: a36406c42c727b4d8c262083e0cb95807f2404c4c8649b2eacc559915f4ba7d5.

Standalone product SHA256: 966920ec94e1fba437f6647357c9814aab029fd447e28ae322efef5681d82e0a. When following C2, use the separately pinned after-C2 product cd11644cc163b2f06f486a6217127221109b26bd7dd8456726f63fd0dc307232 and security 90876a5b857beadb6f1e4e72603b30939685c33ce9f7647c86b850f1e0b01d6f; the standalone version must not be substituted because it would remove C2's permissions. Full pins are in the manifest.

**40 -> 40 product, 7 -> 7 security; zero additions/deletions.** Only two Code references and Stage detailed metrics change relative to the applicable baseline. API routes, tables, Cognito, Core, Tournament, Lambda authority/write-disable settings and frontend stay unchanged. No access-log group or delivery-policy grant.

The wrapper preserves dark response bodies/status and accepted IAM-only delegated-JWT Core proof contract. It emits sanitized EMF request/auth/dependency counters, configuration writer denial and configuration guard failure. Direct invocations correlate using Lambda awsRequestId; HTTP uses the API request ID. Tokens, subjects, bodies and directory fields are not logged. Core responses remain independently authorized by Core. No business-authority success response or test bypass is introduced.

The existing execution boundary had 6,109 characters; simply appending a new ZIP reference exceeded 6,144. The proposed exact-artifact update replaces the superseded 9d16027de6526c9a787a099100dfd9b40b615382e22044e11ee93c705dbe86c8 ZIP reference with the new D1 ZIP. It retains the accepted deployed 2992b5d6b736c90c3fc306654a38576cd861dc0e07068c92bf02c79c87948e6a ZIP and preview rollback reference. No artifact is deleted; historical pins/files remain. This removal of an old allow-reference is explicit review scope, not a wildcard expansion. [Artifact policy checks](team-hub-c1-evidence-2026-10-07/artifact-security-validation.json).

## Pre-cutover signals versus later proof

| Signal | Pre-cutover acceptance | Reserved proof |
|---|---|---|
| API 403 | Authenticated normal route still denied; AuthorizationFailures and configuration WriterNotAuthoritative correlate | This is not row-driven transactional enforcement or later business-capability denial |
| Core proof success | Existing IAM-only read-only envelope with independently verified delegated JWT; Requests increments, no failure counter | Not business HTTP success; no requirement to enable normal target reads/writes now |
| Core denial | Ordinary directory proof returns FORBIDDEN; authorization counter, no business effect | Domain membership authorization belongs to later business handler |
| Core failure | Offline injected transport failure produces CoreDependencyFailures/DependencyFailures; observe naturally occurring failures safely if any | No real outage or broad fault bypass. Controlled AWS fault injection requires separately isolated approval; not claimed live-proven by offline tests |
| Writer state | Dark environment configuration denial can be proven now | Actual installed source fence during authorized FROZEN; row/transaction enforcement requires later reviewed runtime |
| Missing/stale epoch | Offline exact business-handler tests retained | Actual epoch branch needs separately authorized TARGET before first business write; FROZEN alone cannot reach it |
| AuthorityUnavailable | D1 environment-guard failure classification tested offline | It does not mean missing Journal-row proof; D1 intentionally does not read it |

Require bounded metric windows, exact Environment/Runtime dimensions, raw request/log correlation and no missing-data-as-zero acceptance. Named responder Ntgre uses attended manual monitoring; alarms have no notification actions. Distinguish HTTP probes from direct proof receipts. Do not mark Gate B, business epoch enforcement or full business telemetry accepted from D1.

## Proposed AWS writes - future review only

1. C1 only: security-owned creation of two temporary resources with reviewed UTC window; start fixed workflow; one conditional Journal PutItem plus reads; export verification/audit evidence; remove temporary role/workflow. No changes to Team product/security roots required by C1.
2. C2 separately: exact policy/boundary and template-reference changes via inspected security/product changes, no code change or business permissions. Roll back to accepted dark policies if needed.
3. D1 separately: exact artifact publication/reference changes and two Lambda/stage updates. Inspect no replacements/stateful changes and rollback enabled. Restore accepted dark code/template on failure; preserve control record and C2 state according to the reviewed baseline.

Before C1 execution review closes: refresh actual account/identity, absence of control row and temporary-name collisions, installed IAM/resource policies, source protections, actual states; approve window parameters and custody; inspect definition/trust/policy hashes; verify normal routes denied and no drift. Approval is specific to C1; it does not authorize C2, D1, FROZEN, TARGET, frontend or retirement.

## Validation

AWS read-only state-machine and CloudFormation validation pass. C1/C2 Access Analyzer and effective IAM checks cover authority access, duplicate/key/environment/epoch behavior, unrelated partitions/tables, denied deletes/queries, missing leading keys and before/after time-window denial. Fixed-workflow tests prove input cannot redirect keys, state or environment; isolated tests are not live DynamoDB acceptance. Initial template null serialization was rejected and corrected; the initial NOT-DEPLOYABLE artifact is retained.

22 package tests plus 607 regression/monitoring/Core/accounting tests pass (629 total), TypeScript and ledger pass. Accepted old pins verify. Fresh inventory preserves Legacy 2,621 / directive 167; Team 40+7; Core 8+5; Tournament 11; four source tables empty/protected with AVAILABLE backups; Operational empty and Journal has 15 retained audit rows and no business/control row. Secret scan/pin checks are in the final review receipt. No AWS mutation or deployment occurred.

**TEAM HUB C1 AUTHORITY INITIALIZATION READY FOR EXECUTION REVIEW**
