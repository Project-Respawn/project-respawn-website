# Phase 2B2 — independent Team Hub read-path readiness

5 October 2026. Branch `phase2/team-hub-extraction`. **Candidate ready for AWS review only. No deployment, IAM bootstrap, change set, data migration or frontend cutover is authorized or performed.** The [2B1 full foundation](team-hub-2b1-implementation.md), eighteen contracts and stateful design remain valid. LegacyPlatform remains the live Team business authority.

## Scope and ownership

Owner: Team Hub. This is a non-business authenticated synthetic proof, not physical extraction or a Legacy compatibility reader. Existing environment Cognito → independent HTTP API → dedicated preview Read Lambda → explicitly synthetic response. No Core network adapter, live table, S3 logo storage, command handler, migration identity or foreign business client is installed. No fixture is presented as a real Team.

`GET /v1/team-hub/preview` returns `contractVersion: team-hub.v1`, `environment: Ntgre`, `preview: true`, `nonProduction: true`, `dataAuthority: SYNTHETIC`, plus a plainly labeled example with `realBusinessRecord: false`. It returns no user email, token, membership, private assessment or live record. The [preview handler](../../domains/team-hub/preview.mjs) emits only domain/mode/request ID/status/data-authority logs; it never logs claims or authorization headers.

The [explicit domain selector](domain-deployment-selection.md) fixes the Phase 2B1 generic-CI blocker. Both FULL_TARGET and READ_PROOF pass through the generic package entrypoint and synthesize only their Team-owned roots. No Legacy, Tournament, Creator, Commerce or Community app is loaded; no schema generation or shared `myFunction` bundling occurs. Hosted source now guards the actual deployment call, not just its precheck. Its independent deployment adapters and production execution remain disabled pending separate authorization.

## Exact resources

| Resource | Product | Security/bootstrap |
|---|---:|---:|
| HTTP API | 1 | 0 |
| Default stage | 1 | 0 |
| Existing-Cognito JWT authorizer | 1 | 0 |
| GET preview route | 1 | 0 |
| Lambda proxy integration | 1 | 0 |
| Preview Read Lambda | 1 | 0 |
| Runtime role with inline logs policy | 1 | 0 |
| API invocation permission | 1 | 0 |
| Runtime/application log group | 1 | 0 |
| Lambda/API error alarms | 2 | 0 |
| Runtime permissions boundary | 0 | 1 |
| CloudFormation execution role | 0 | 1 |
| Execution permissions boundary | 0 | 1 |
| Unattached preparation-caller policy | 0 | 1 |
| **Total** | **11** | **4** |

**15 total**, versus full target **43 + 3 = 46**, below the existing ≤75 ceiling. Zero DynamoDB, product S3, new Cognito, AppSync, Command Lambda, business mutation routes, migration/compatibility writers, nested stacks or custom providers. The CDK asset references the existing conventional bootstrap asset bucket; no bucket/role is created implicitly. Its existence, access and publisher identity need confirmation during AWS review. The runtime zip is not published.

The product root is `ProjectRespawn-TeamHub-Ntgre`. The separately counted bootstrap proposal is `ProjectRespawn-TeamHub-Ntgre-ReadProofSecurity`. Security must be reviewed/installed separately before an authorized product creation; neither stack was created here. An unattached caller policy is not an installed deployment identity.

## Authentication and runtime IAM

Existing Ntgre pool `eu-north-1_n24iLL7QE`, client `1iq7ovjaf7d16imdvbqgfgvf86`, account `058264289478`, region `eu-north-1`. The Core descriptor is consumed with exact SHA-256 `9bea68ab5781eeb7265c363fd6baac78d1e3e032196f9aa209bc3780644a6b9e`. No pool/client/user/session change or localhost repointing occurred.

API Gateway JWT authorizer validates the configured issuer/client audience and signature. The Lambda independently requires access-token purpose, issuer, client, canonical subject and expiry/not-before from trusted JWT-authorizer context. API Gateway's issuer/audience settings alone do not enforce Cognito token purpose; the handler's explicit access-token check is required. Raw bearer text, body-supplied claims and unverified decoded tokens cannot establish context.

Offline tests cover no token, malformed/forged signature, wrong issuer/client, ID token, expiry, invalid subject, valid same-environment context and the actual packaged handler. The signed-token test uses ephemeral synthetic keys/tokens in memory only. **No real Cognito token or browser session was requested, copied or stored. No live HTTP 200/401 acceptance is claimed**: there is no deployed Team API. A later authorized gate must use the existing browser session, pass the token only in memory to this exact API, and record status/correlation IDs without the credential.

The runtime identity allows only its own `CreateLogStream` / `PutLogEvents`. The boundary explicitly denies every other service/action except narrowly classified default Lambda decrypt. Consequently DynamoDB, all product S3, Cognito Admin/ListUsers, AppSync, other domain APIs/Lambdas, IAM/CloudFormation, secrets and role assumption are denied.

For KMS, the boundary denies decrypt outside this account/region and for keys without the reserved `alias/aws/lambda` resource alias; it allows only the matching AWS-managed Lambda key class. The identity policy has no broad KMS grant. AWS-managed key/resource grants still govern the service path. No Tournament key ARN was copied and no undocumented ViaService/encryption-context constraint was guessed. Business/unknown/foreign keys remain denied. This follows [AWS alias authorization](https://docs.aws.amazon.com/kms/latest/developerguide/alias-authorization.html) and [Lambda default encryption](https://docs.aws.amazon.com/lambda/latest/dg/security-encryption-at-rest.html). **Actual default-key/grant behavior must be verified in AWS review/live acceptance**; local policy tests are not IAM Simulator or service initialization evidence.

## Deployment IAM and residual review

[Read-proof security definitions](../../infrastructure/domains/team-hub/read-proof-security.mjs) separate deployment from runtime. CloudFormation execution has regional service-level `apigateway:*` to cover internal lifecycle operations; it is not falsely described as perfectly resource-scoped. Known accepted Tournament API `msipnwy39j` and REST APIs are explicitly denied. Lambda, runtime role, logs and alarms are restricted to Team preview identities; S3 read is limited to this exact hashed Lambda artifact. Business data, Cognito, AppSync and unrelated role passing are denied. Runtime boundary changes/removal and managed-policy attachment are denied to the execution role.

The preparation caller is restricted to the exact Team product stack and passing the designated execution role. It does not grant `ExecuteChangeSet`. No execution adapter or command is run. Review complete change sets, rollback-enabled behavior and artifact hashes before any later approval. Regional API Gateway lifecycle authority can still reach unlisted regional HTTP APIs; this is an explicit deployment residual, contained by stack/artifact/role review and requiring a refreshed protected API inventory before installation. Do not treat historical protected IDs as a complete current production inventory.

Bootstrap identity, existing asset bucket/publication permissions, protected API inventory, current AWS identity/account, key alias/grants, service-role effective policies and alarm ownership remain items for AWS review. The AWS CLI identity check in this session failed locally with `NoCredentials`; no authenticated AWS read response was obtained. Credentials are not needed to prepare this concrete local candidate, and none were requested. This readiness claim stops before those installation/execution gates.

Only one runtime/application log group is proposed. API-level metrics supply the API error alarm; API access-log delivery infrastructure is intentionally omitted from this minimal proof. Later acceptance requires a correlated safe application log and Lambda/platform metrics, not an automatic reuse of Tournament's former logging exception. Alarm notification recipients remain an operational review item.

## Preserved candidate and validation

The authoritative exact candidate revision, product/security template hashes, Lambda hash and preserved local assembly path are in [gate.json](team-hub-2b2-evidence-2026-10-05/gate.json). The revision binds mode plus the complete source-input hash manifest; READ_PROOF and FULL_TARGET are not interchangeable. [Read-proof receipt](team-hub-2b2-evidence-2026-10-05/read-proof-receipt.json) records closure, libraries and template hashes; [full-target receipt](team-hub-2b2-evidence-2026-10-05/full-target-receipt.json) records the still-valid 46-resource design. [Product template](team-hub-2b2-evidence-2026-10-05/read-proof.template.json) and [security template](team-hub-2b2-evidence-2026-10-05/security.template.json) are intentionally retained review evidence. Runtime assets remain in the unique ignored local assembly; no live endpoint descriptor is published.

Reproduce local validation with `node scripts/team-hub/verify-2b2.mjs`. A new synthesis produces a new review artifact; it does not authorize substitution for this preserved candidate. Final validation: **221 Phase 2B1 tests, 29 Phase 2B2 tests, 18 selection tests, 41 existing accounting/safeguard tests**. TypeScript, backend/browser builds, both isolated synthesis modes and both Tournament checkpoint verifiers pass. The 2B1 count retains all 18 contracts and 12 commands. Only a pure authentication helper was extracted for reuse by the minimal preview; no business operation was removed.

The original inventory had 51 source hashes including `amplify.yml`. All **50 business/live-client protected sources** remain exact. `amplify.yml` is the explicitly authorized selection correction; tests preserve its frontend section and require its guarded backend calls. Existing tracked changes are limited to that file and the generic validator. No Legacy backend/schema, live Team service, outputs or Tournament files changed. Historical 2B1 evidence remains historical; this report supersedes its generic-CI selection limitation.

Tournament remains accepted candidate `b75a91494c03606d825e234a65d295c184067820cd77dfc84e11a2c83484ae2f`, eleven resources, accepted runtime boundary v2/execution policy v8. Release 2/rollback is not advanced. Legacy remains the historical accepted 2,621 resources / FunctionDirectiveStack 167. These are preserved baselines, not refreshed live stack counts.

## PHASE 2B2 TEAM HUB READ-PATH DEPLOYMENT GATE

Domain selector: explicit, fail-closed; generic CI passes for Team in both modes.
Team Hub selected: yes. Legacy selected: no. Tournament selected: no.
Amplify schema generated: no. Shared myFunction bundled: no.

Candidate revision / Template hash / Lambda hash: exact values in the linked gate JSON, bound to READ_PROOF and the preserved assembly.
Proposed stack: `ProjectRespawn-TeamHub-Ntgre`. Resources: 11 product + 4 security = 15.
API: 1. Stage: 1. Authorizer: 1. Route: `GET /v1/team-hub/preview`.
Read Lambda: 1. Runtime role: 1. Log group: 1. Alarms: 2.
DynamoDB: 0. S3 product state: 0. Command Lambda: 0. Mutation routes: 0. Business state: none.
Shared Cognito: existing Ntgre identity. Runtime business access: none.
Deployment IAM: separate practical regional control plane, owned resource/asset scope, reviewed residuals above; uninstalled.
Runtime IAM: own logs, strict boundary, AWS-managed Lambda default-decrypt exception; uninstalled.
Team tests / Selection tests / Security tests / Accounting / TypeScript / Build: pass locally.
LegacyPlatform baseline: 2,621 / 167, unchanged. Tournament baseline: accepted eleven-resource checkpoint, unchanged.
Production target: forbidden. AWS writes: zero. IAM bootstrap: none. Change sets: none. Deployment: none.

**TEAM HUB READ-PATH CANDIDATE READY FOR AWS REVIEW**
