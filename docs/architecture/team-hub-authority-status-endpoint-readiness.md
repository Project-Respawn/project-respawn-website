# PROJECT RESPAWN TEAM HUB 2B6 — AUTHORITY STATUS ENDPOINT READINESS

**Latest authority endpoint (8 October 2026): ACCEPTED LIVE ? READY FOR FINAL PRE-CUTOVER REVIEW.** Pinned security/product updates are UPDATE_COMPLETE; Team Hub 42+7. Authenticated GET /v1/authority returns the real LEGACY_WRITER epoch/version 1; dormant live browser binding passes, all 13 business routes remain denied. C2 runtime IAM and D1 monitoring preserved. No authority/frontend/fence/production change. [Deployment and live acceptance](team-hub-authority-endpoint-deployment-result.md). Gate B installed fence and Gate C business transactional epoch proof remain separate; earlier entries below are historical.

The following is the preserved preparation-stage review; its not-deployed statements describe that earlier stage. Current installed state is in the linked execution result.

8 October 2026. Account `058264289478`, region `eu-north-1`, existing API `t54b88casf`, product `ProjectRespawn-TeamHub-Ntgre`, security `ProjectRespawn-TeamHub-Ntgre-ReadProofSecurity`. Preparation only: no AWS deployment, publication, change-set creation, IAM update, authority write, source fence or frontend activation.

**AUTHORITY STATUS ENDPOINT READY FOR DEPLOYMENT REVIEW.** The candidate is prepared and reviewed, not deployed. Separate execution authorization and live acceptance remain required.

## Route, authentication and response

`GET /v1/authority` uses the existing API, `JwtAuthorizer`, `ParityReadIntegration` and `ParityReadFunction`. API Gateway validates the signature and configured issuer/audience before forwarding trusted claims; the handler additionally enforces exact Ntgre issuer/client, `token_use=access`, expiry, not-before and valid subject. ID tokens and browser-supplied claims are rejected. API Gateway's distinction between audience and client ID and its token-type limitation are documented by [AWS](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html); the handler's access-token check is retained independently.

Only these response fields are permitted:

```json
{
  "contractVersion": "team-hub.authority-status.v1",
  "domain": "TeamHub",
  "environment": "Ntgre",
  "account": "058264289478",
  "region": "eu-north-1",
  "mode": "LEGACY_WRITER",
  "epoch": 1,
  "version": 1,
  "observedAt": "<server observation timestamp>"
}
```

The mode/epoch/version above illustrate the freshly verified live row, not hard-coded response values. The endpoint projects them from the approved schema. It never returns control keys, changedBy, gateDigest, IAM details, tokens, identity information or business records. All responses use `Cache-Control: no-store`. Invalid claims return 401, any body/query/path input returns 400, and missing/malformed/unavailable authority or incompatible runtime configuration returns 503. No request selects a key, mode or epoch. No authority record is created or changed.

## Journal access and runtime security

The runtime performs only strongly consistent `GetItem` on `ProjectRespawn-TeamHub-Ntgre-Journal`, PK `CONTROL#AUTHORITY`, SK `STATE`. C2 already permits that exact table/partition through `ForAllValues:StringEquals` on `dynamodb:LeadingKeys` and a non-null condition. LeadingKeys restricts the partition, not the sort key; the handler fixes SK=`STATE` and accepts no browser override. See [DynamoDB fine-grained access conditions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/specifying-conditions.html).

**Zero runtime IAM changes.** Both runtime identities, inline policies, v6 boundaries, Core invocation permissions and cross-domain denials remain byte/semantically matched to C2. No PutItem, UpdateItem, DeleteItem, Query, Scan, transaction writes, cursor-secret, Cognito administration, business data or foreign-domain access is added. No database is created.

The new Read wrapper delegates every non-status event to the unchanged accepted D1 handler. The Command code stays on the exact installed D1 ZIP. The status route emits the existing bounded-dimension request/authentication/dependency/authority-unavailable EMF counters; it does not label a status read as a business writer denial or a Journal failure as a Core failure. API Gateway rejection before Lambda produces native API evidence, not an assumed custom Lambda counter. Existing D1 stage, logs, alarms, CORS and all business responses remain unchanged.

## Frontend binding

The dormant independent client fetches fresh authenticated status before each business request using the accepted Team/Core manifests and current token. It validates the exact response schema, environment/account/region, positive epoch/version, server observation age ≤30 seconds and future clock tolerance ≤5 seconds. Non-TARGET authority, missing/malformed/expired status, unavailable endpoint or an epoch different from the separately reviewed activation epoch fails closed. The request epoch is taken from the validated server response; no fixed epoch 1 or cached fallback is used.

Status alone grants nothing. The client still requires explicit reviewed activation; the live proposal remains `reviewed:false`, `epoch:null`. All current dark business routes continue denying even if an isolated status fixture reports TARGET_WRITER. Normal server-side Core/business authorization and atomic authority mode/epoch/version checks remain mandatory for the separately reviewed business-runtime candidate. The status GET cannot close a read-to-write race. This candidate neither installs that business runtime nor activates the website. Existing CORS already permits status GET with Authorization from localhost:5174; future business-method/origin changes remain separate gates.

## Exact synthesized changes

The offline CDK app imports the exact accepted D1 template into the existing sibling Team Hub root, preserving logical IDs, bootstrap declarations and every unrelated property. It makes no AWS lookups. No Amplify/Legacy synthesis is substituted.

| Product logical ID | Change | Scope |
|---|---|---|
| `AuthorityStatusRoute` | Add | Existing API, JWT authorizer, existing Read integration; depends on exact invoke permission. |
| `AuthorityStatusInvokePermission` | Add | `lambda:InvokeFunction` for `apigateway.amazonaws.com`, source account 058264289478, exact `arn:aws:execute-api:eu-north-1:058264289478:t54b88casf/$default/GET/v1/authority`, existing Read Lambda. |
| `ParityReadFunction` | Modify Code only | New pinned wrapper bundle; role/configuration/logging unchanged. |

Product **40→42**, security **7→7**. No other API, Lambda, table, role, log group or alarm is created. No deletion/replacement is proposed. These are template comparisons, not AWS-generated change-set results. Lambda code artifact changes are in-place properties in the [CloudFormation Code reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-properties-lambda-function-code.html); actual replacement classification must still be inspected before future execution.

The first 41-resource preparation was rejected during integration review: existing `ParityReadPermission` only covers `/v1/teams*`. It could not invoke `/v1/authority`. The corrected candidate adds a separate exact-route permission instead of broadening the existing permission. The rejected pin/evidence is retained under `superseded-missing-invoke-permission/` and must not be deployed. Runtime bytes did not change during that correction.

## Deployment-security delta

Only `ExecutionBoundary`, `ExecutionRole` and `PreparationCaller` change, with no trust or runtime policy edits:

- Exact new Read ZIP reference replaces the historical pre-D1 Core-integration ZIP `2992b5d6…48e6a` in execution identity/boundary. The full removed ARN is recorded in candidate.json. The currently installed D1 ZIP `a36406c4…ba7d5` and existing preview asset remain allowed for rollback.
- Exact new product template URL/object is added to the restricted caller's existing allow/deny conditions. No wildcard artifact path, extra stack, administrator grant or publication privilege is added.
- The installed execution boundary was already 6,100/6,144 characters. Replacement rather than appending keeps it at **6,086**; caller policy is **6,053**. All managed policies pass size checks. Older pre-D1 runtime rollback is no longer an allowed execution artifact in this proposed policy; its files/S3 objects are not deleted. The supported rollback for this update is the installed D1 baseline.
- Existing deployment permission to add/remove a Lambda resource policy on the Team Read function is sufficient for the new exact invocation grant; simulations still deny the same action on Core. No new deployment actions are added.

## Exact pins and preserved assembly

| Artifact | SHA-256 |
|---|---|
| Candidate manifest | `30ac97e5b48f3867268403c13766e9439aa2e0821d87585a685cfdfae1b997d1` |
| Product | `5a2d99f4919fd07c619f483e556a0464b9cbaad0be00665201438b0f4ec7d0e9` |
| Read runtime ZIP | `cd58cc3553867f268af79bc9c710fe35e1bab07882d39b423e05b39626a7eedd` |
| Security | `503d08c93fddc869a11bc01c6ec57fe4e7449e618e0c9435e7bf2ed996351abc` |

Use the [preserved assembly manifest](team-hub-authority-status-evidence-2026-10-08/preserved-assembly.json). Its directory is `infrastructure/domains/team-hub/.build/authority-status/30ac97e5b48f3867268403c13766e9439aa2e0821d87585a685cfdfae1b997d1/` and contains candidate.json, product.template.json, security.template.json and runtime.zip. These are local pinned artifacts, not published S3 objects. Verify each exact hash; do not rebuild, substitute HEAD or choose the rejected candidate for execution.

## Validation and scope of proof

- 648 offline tests cover contract, Cognito claim rejection and an in-memory signed-JWT authorizer model, malformed/missing authority, epoch mismatch, frontend fail-closed behavior, privacy, preserved D1 counters, Core integration, business transactional checks, rollback, IAM isolation, regression and resource accounting. TypeScript and normal/dormant-independent builds pass. Existing stylesheet-reference and shared-chunk size warnings remain.
- The exact compiled ZIP was exercised against a localhost-only fake DynamoDB service: precisely fixed strongly consistent GetItem serialization, sanitized success, missing-record 503 and normal business 403. No AWS DynamoDB request was made by this test.
- Corrected route/invoke-permission/resource tests passed (41 focused tests, included in the total). Both actual runtime roles passed 68 IAM decisions. Installed/candidate deployment policies passed 62 decisions. Seven policies passed Access Analyzer without errors/security warnings. Actual IAM simulation is not a live new-route invocation proof.
- The incomplete IAM connection-timeout receipt is retained; the read-only rerun passed. The first browser run stopped during initial DOM evaluation; the test harness now tolerates an absent body during navigation without suppressing application errors or retrying mutations. The original browser receipt is retained.
- All five browser personas passed: 49 UI checks, 40 contract checks, 14 base pages, 42 additional route visits, 346 privacy checks and 24 lazy-loading/isolation checks; no unexpected console/network errors or Legacy Team fallback. Browser authority/business state is explicitly isolated; existing Ntgre test identities authenticate through live Core. No live business data or authority state is changed.

Fresh baselines: real LEGACY_WRITER epoch/version 1; Legacy 2,621 resources / FunctionDirectiveStack 167 and 62 unchanged templates; four source tables empty/protected with available backups; Team Hub 40+7 and zero target business rows; Core 8+5; Tournament 11; installed D1/C2 preserved. No production changes.

## Separately authorized execution and live acceptance

The [change-set review plan](team-hub-authority-status-evidence-2026-10-08/change-set-review-plan.json) is not an execution authorization. No AWS change set exists for this task.

1. Fresh identity/account/region, installed D1/C2/control/protection baselines and exact preserved hashes; stop on drift.
2. Separately authorize and inspect the security-owned update: exactly three artifact-reference modifications, no additions/deletions/replacements or trust/runtime changes. Preserve installed D1 rollback access.
3. Only with publication authorization, publish exact pinned ZIP/template to their exact candidate keys using explicit AES256/SSE-S3 and verify checksums/encryption; no KMS broadening.
4. Under the existing restricted product caller and `ReadProofExecution` role, prepare the product UPDATE change set. Retrieve all pages/property details. Require exactly two additions above and one Read Code modification. Stop on every unexpected effect, replacement (including conditional/dynamic), deletion, nested stack effect, IAM change or protected-domain change.
5. Execute only after the separately reviewed gate is authorized, with `DisableRollback:false`. On failure allow rollback and stop; do not grant permissions or retry automatically. Roll back product to exact D1 before reverting security; remove only the two introduced endpoint resources, never data or authority.
6. Prove valid existing Admin/ordinary tokens obtain real LEGACY 1/1 status; missing/forged/expired/wrong-issuer/wrong-client/ID tokens deny. Verify input rejection, privacy, no caching, exact installed GetItem scope, control-row preservation and all 13 existing normal business denials. Correlate native API and Lambda/EMF signals while preserving D1 evidence. Do not deliberately corrupt the live authority row or disrupt Core to test failure branches.
7. Prove real browser status binding from the approved localhost origin while keeping frontend activation disabled. TARGET success and deployed business transactional epoch enforcement remain separate Gate C/maintenance acceptance; source-fence proof remains Gate B during separately authorized FROZEN maintenance. Preserve this status contract in any later reviewed business-runtime change.

No authority switch, frontend switch, Legacy retirement or production action is authorized by readiness.

Evidence: [candidate](team-hub-authority-status-evidence-2026-10-08/candidate.json), [artifact review](team-hub-authority-status-evidence-2026-10-08/artifact-review.json), [validation](team-hub-authority-status-evidence-2026-10-08/validation.json), [policy review](team-hub-authority-status-evidence-2026-10-08/policy-review.json), [runtime IAM proof](team-hub-authority-status-evidence-2026-10-08/runtime-security-before.json), [authority read](team-hub-authority-status-evidence-2026-10-08/authority-after.json), [final result](team-hub-authority-status-evidence-2026-10-08/result.json).

Local cleanup: authenticated browser contexts were disposed and the isolated server stopped. One task-owned browser cache directory remains Windows-locked and Git-ignored; its contents were not included in source/evidence or inspected for credentials. Existing earlier E/F cache leftovers are unrelated to this new candidate. No AWS temporary resources were created.

**AUTHORITY STATUS ENDPOINT READY FOR DEPLOYMENT REVIEW**
