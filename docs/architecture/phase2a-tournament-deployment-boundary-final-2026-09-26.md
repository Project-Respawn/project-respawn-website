# PHASE 2A FINAL DEPLOYMENT BOUNDARY

**Selected outcome: DEFER_API_ACCESS_LOGGING**

**PHASE 2A FINAL SECURITY MODEL READY FOR BOOTSTRAP AUTHORIZATION**

Account `058264289478`; region `eu-north-1`; environment `Ntgre`. This is readiness for a separately authorized **IAM-only security bootstrap**, not authorization to create resources or deploy Tournament. AWS writes during this task: **0**.

This is the final Phase 2A deployment-boundary design. V1, V2 and V3 are **superseded for execution purposes**. Their original reports, policies, assemblies and test results remain historical evidence. The earlier 12-resource candidates are not the candidates to use for future execution. The new 11-resource candidate below requires its own subsequent deployment authorization.

## 1. Final decision between the two outcomes

**A — controlled logging bootstrap:** using the existing administrator for one reviewed, hash-pinned PutResourcePolicy request is a reasonable administrative control; the administrator's existing broader authority is not itself a reason to invent a permanently privileged domain role. Account/region/name/content checks, a fixed payload, one write, immediate read-back and termination can control that operation. However, installing destination permission alone does not establish the first-delivery authorization contract identified in v3. Keeping access logging would still require additional service-behavior confirmation or an active validation/setup sequence before all required first-activation checks could be closed. No such AWS writes are authorized here. The single controlled write is therefore not a complete Outcome A solution under this task's all-positive/no-unresolved-activation requirement.

**B — defer access logging:** remove the optional activation path from the proof and retain its deployment, authentication, runtime logging and alarm boundaries. This completes the model without an extra administrative operation, delivery-policy lifecycle or first-activation exception. It is the selected fallback because Phase 2A proves domain deployment isolation, not centralized observability.

| Criterion | Decision rationale |
| --- | --- |
| Security | No Logs policy/delivery administration in deployment, execution or runtime permissions. |
| Operational simplicity | Five IAM security resources, eleven product resources; no logging setup/cleanup operation. |
| Future-domain reuse | Reuse the role/boundary and independent-root pattern; establish access logging later through centralized Security/Observability. |
| Phase 2A purpose | Source/build/synthesis/deployment/update/rollback isolation remains the proof. |
| Blast radius | No new account-level log-delivery permission or existing policy modification. |
| Permanent privilege | No additional broad logging privilege, temporary logging role, custom provider or installer. |
| Rollback complexity | No delivery relationship/resource-policy dependency to restore or remove. |
| Observability | Keep runtime logs, metrics, alarms and deployment events; explicitly accept missing per-request API records for this sandbox proof. |

This choice is not based on preserving a resource count. The count deliberately changes from 12 to **11**, confirmed by synthesis.

## 2. Exact product change and why activation permissions disappear

The complete template delta against the preserved v2/v3 product is:

1. Remove `AccessLogs`, the `/project-respawn/Ntgre/tournaments/http` log group.
2. Remove `DefaultStage.Properties.AccessLogSettings`.
3. Update the function's BUILD_REVISION value and DeploymentRevision output to the new source-manifest revision.

No other resource/property changes occur. Runtime code bundle bytes and the Cognito identity contract are unchanged. This is a local candidate delta, **not deletion of an existing AWS log group**: Tournament has never been deployed and the named product stack remains absent.

The final template contains no access-log destination, AccessLogSettings, Logs ResourcePolicy, Delivery, DeliverySource, DeliveryDestination or custom setup provider. AWS's [HTTP API logging procedure](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-logging.html) activates logging by configuring a Stage destination; that optional configuration is absent. The [Stage API](https://docs.aws.amazon.com/apigatewayv2/latest/api-reference/apis-apiid-stages.html) supports creation without it. Therefore the proof has no API access-log activation step in first create, code update, rollback or removal.

The final executor's boundary also explicitly denies direct PutResourcePolicy, DeleteResourcePolicy and Create/Update/DeleteLogDelivery. It denies Stage POST/PATCH/PUT requests carrying `apigateway:Request/AccessLoggingDestination`; this service condition appears in the preserved API Gateway authorization metadata. Future access-log enablement must be a separate reviewed design change, not a side effect of a routine release.

The original two failing activation tests are no longer required positives. The runner first asserts the absence of the feature in the actual synthesized template, then checks that the retired operations are denied. It does not suppress a requirement from an unchanged template.

## 3. Observability and authentication retained

- `PreviewLogs`: explicit runtime log group, JSON Lambda logging, 14-day retention.
- `PreviewErrors`: Lambda Errors alarm.
- `HttpErrors`: API Gateway 5xx alarm scoped by the product API ID.
- Native API Gateway aggregate metrics, including request count, errors and latency, independent of access-log setup. Detailed route metrics are not newly enabled. [AWS HTTP API metrics](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-metrics.html).
- Lambda invocation/error logging and safe existing application behavior; no new claims of custom telemetry coverage.
- CloudFormation events for deployment/update/rollback diagnostics.
- HTTP API, endpoint output, GET preview route, JWT authorizer, existing issuer/client contract, Lambda invoke restriction, CORS, throttling, no-registration preview behavior and isolation protections.

Deferred: per-request API access records, request-ID/route/status/response-length correlation at the API edge, and evidence for requests rejected before Lambda invocation. Lambda logs and aggregate metrics are not equivalent substitutes for those records. Centralized Security/Observability owns the later capability; no production-observability readiness is claimed for this sandbox proof.

## 4. Final candidate and preservation

Worktree: `.codex-worktrees/phase2a-tournament-final-20260926`.

| Item | Exact value |
| --- | --- |
| Source-manifest revision, not a Git commit | `b75a91494c03606d825e234a65d295c184067820cd77dfc84e11a2c83484ae2f` |
| Product template SHA-256 | `b9be81faba86a3a8e1949cca1c802720a7bf557cc74cd6cb7f5ee17423c35705` |
| Product stack | `ProjectRespawn-Tournaments-Ntgre` |
| Product resource count | **11** |
| CLI / CDK library | 2.1143.0 / 2.260.0 |
| Cognito core contract SHA-256 | `9bea68ab5781eeb7265c363fd6baac78d1e3e032196f9aa209bc3780644a6b9e` |

[Preservation manifest](phase2a-tournament-boundary-final-evidence-2026-09-26/preservation-manifest.json) pins all 42 copied source/build files. [Candidate comparison](phase2a-tournament-boundary-final-evidence-2026-09-26/candidate-comparison.json) records all four template differences and verifies unchanged runtime bytes/core identity. Source changes are limited to stack.ts, README, resource-envelope guard and proof tests.

The 11 resources are one each of HTTP API, Stage, JWT Authorizer, Integration, Route, Lambda Function, Lambda Permission, IAM Role and runtime LogGroup, plus two CloudWatch Alarms. No nested root, new Cognito/AppSync/DynamoDB/S3/KMS resource, cross-stack import or AWS context lookup is introduced.

The superseded 12-resource revision `33b22ca602a238e2ca4fb98b87c016e8da3e058d202f66297e3cd13cae734761` and template `0e1e2b094f03d996cbbb72d9a8ff6a75f2797e9092ad7afac199fd65097d7ee6` remain preserved. They are not silently reused or treated as approval for this revised candidate.

## 5. Final IAM model

Exact documents: [infrastructure/security/tournaments-Ntgre-final](../../infrastructure/security/tournaments-Ntgre-final/).

| Identity | Effective intended scope |
| --- | --- |
| `ProjectRespawn-Tournaments-Ntgre-Deploy` | Own stack change-set workflow; exact pinned template URL; PassRole only to the Tournament execution role and only to CloudFormation. No direct arbitrary stack update/create, business writes or Logs administration. Trust: exact RavenTest user. |
| `ProjectRespawn-Tournaments-Ntgre-CfnExecution` | Own generated Lambda/runtime role, one runtime log group, two alarms, exact read-only artifact objects and bootstrap-version parameter; API scope according to first-create/steady policy below. Trust: CloudFormation only. |
| Product runtime role | Own preview streams only: CreateLogStream and PutLogEvents. Trust: Lambda only. Required external RuntimeBoundary is already in the final product template. |

The deployment/execution policies are attached both as their role's grant and as its permissions boundary. The domain identities cannot modify the security-owned policies. Runtime role creation/inline policy management requires the exact runtime boundary; boundary removal/replacement and arbitrary managed-policy attachment are outside the execution ceiling. Runtime PassRole is only to Lambda. Broad simulated identity grants cannot escape these tested boundaries.

The deployment template URL now pins the **new** template hash. Execution artifact reads are limited to the new template object and unchanged code zip in the existing CDK asset bucket. Neither domain role can publish or overwrite artifacts or mutate existing business S3/KMS resources. A later reviewed publisher/promotion step is separate from the security bootstrap and product deployment.

Managed-policy compact sizes: deploy 4,043; first-create execution 5,455; steady execution 4,273; runtime boundary 532 characters, all below 6,144.

### First-create API exception and mandatory lock-down

The existing reviewed API pattern remains: CreateApi requires the exact name and ownership tags. A temporary execution policy can operate the four required child collections before the API ID exists, in eu-north-1 only, explicitly denying all 13 refreshed existing API IDs. The draft window ends `2026-09-27T23:59:00Z`. At/after expiry it denies execution-role operations; it is not automatically extended.

This first-create scope is not claimed to be perfect ownership enforcement for an unrelated API newly created during that window. The reviewed pinned template, denied existing inventory and an API-creation freeze are required controls for the disclosed one-time exception. They do not become routine deployment access. This is the existing API bootstrap exception, not a new Logs exception.

After successful separately authorized Release 1, a security-owned policy update must bind to the actual product API ID. The steady policy allows only that literal API/root child scope, omits POST `/apis`, and retains the access-logging enablement denial. The `tournamentfixture` policy is a simulation fixture only; the parameterized steady template requires a verified real 10-character API ID. Do not deploy the fixture value.

If the execution window expires before a later authorized release, refresh only through an explicitly reviewed policy/package revision. Do not silently extend it. Never delete the associated CloudFormation execution role as a substitute for removing temporary permissions.

## 6. Validation

[Full IAM evidence](phase2a-tournament-boundary-final-evidence-2026-09-26/iam-simulation-results.json), [runner](phase2a-tournament-boundary-final-evidence-2026-09-26/validate-iam.mjs), [Access Analyzer evidence](phase2a-tournament-boundary-final-evidence-2026-09-26/access-analyzer-validation.json).

| Matrix | Positive | Negative | Failures |
| --- | --- | --- | --- |
| Deployment | 12/12 | 31/31 | 0 |
| First-create execution | 77/77 | 89/89 | 0 |
| Steady execution | 76/76 | 44/44 | 0 |
| Runtime | 2/2 | 32/32 | 0 |
| **Total** | **167/167** | **196/196** | **0** |

All **131 original negative protections** remain. Additional tests deny broad Logs actions, access-log re-enablement and protected business reads as well as mutations. All required steady-state positives pass. Unexplained denials: **0**. Unresolved first-activation tests: **0**.

Why the positive denominator changed: 18 own-HTTP-log-group operation cases, the two delivery/policy activation cases and one resource-policy metadata case are no longer required after the feature/resource removal. All 21 become explicit denial checks. This is recorded per case with the template-based reason; no failing necessary action was removed merely to report success.

Access Analyzer: **zero findings across eight documents**—three deployment/execution variants, runtime boundary, three trusts and resolved runtime inline policy. No ERROR, WARNING, SECURITY_WARNING or SUGGESTION findings were suppressed.

IAM request action names remain normalized to lowercase, following the preserved v2 simulator case-reproduction evidence. These are custom-policy simulations with supplied context, not live role assumptions or a service deployment. Prior SCP visibility limits remain; actual account controls and AWS-generated change sets must be checked at authorized execution gates. That is normal deployment verification, not an unresolved access-log prerequisite.

| Local validation | Result |
| --- | --- |
| Tournament tests, including retained authentication/observability | **26/26 PASS** |
| Resource-accounting tests | **24/24 PASS** |
| TypeScript --noEmit | PASS |
| Runtime, infrastructure and independent client builds | PASS |
| Isolation guards and Tournament-only synthesis | PASS |
| Security template validation | PASS; CAPABILITY_NAMED_IAM required |
| LegacyPlatform synthesis | NO |
| Amplify schema generation | NO |
| Unrelated Lambda bundling | NO |

Global infrastructure CI was not invoked because it would synthesize LegacyPlatform; the authorized isolated build and pure accounting checks were used. The plan's resource guard rejects any reintroduced AccessLogSettings or Logs delivery/policy resource.

## 7. Final IAM-only bootstrap package

Security stack: `ProjectRespawn-Tournaments-Ntgre-SecurityBootstrap`.

Exactly **five** resources:

1. Managed policy `ProjectRespawn-Tournaments-Ntgre-DeployBoundary`.
2. Managed policy `ProjectRespawn-Tournaments-Ntgre-ExecutionBoundary`.
3. Managed policy `ProjectRespawn-Tournaments-Ntgre-RuntimeBoundary`.
4. Role `ProjectRespawn-Tournaments-Ntgre-Deploy`.
5. Role `ProjectRespawn-Tournaments-Ntgre-CfnExecution`.

No Logs resource policy, log group, delivery, privileged logging identity or one-time PutResourcePolicy operation is included. No product API/Lambda/alarm or existing AWS service-linked role is created or modified by this bootstrap.

| Artifact | SHA-256 |
| --- | --- |
| `bootstrap.template.json` | `cc67fc28cedd065e71c323918565b5efbdb89d490801ecd11366943f22b8f156` |
| `prepare-bootstrap-change-set.request.json` | `2bcfb69836be73e0225dcb6e0119ed3cbfee9b3375037cc364f1d79b8c680e1d` |

The request embeds the pinned template bytes, uses CREATE and CAPABILITY_NAMED_IAM, disables automatic imports/nested-stack inclusion, and sets **OnStackFailure=ROLLBACK**. It names only the security root. No product deployment request is included.

All five named IAM resources and both security/product roots were absent in [read-only name preflight](phase2a-tournament-boundary-final-evidence-2026-09-26/name-preflight.json). Expected bootstrap resource diff: **5 additions, 0 updates, 0 deletions, 0 replacements**. This is the local expected diff; no AWS change set exists yet.

### Next authorization and procedure

The next authorization is for this **security bootstrap only**. The existing administrator performs the reviewed IAM installation; no new general-purpose administrator role is introduced. The bootstrap request omits a service-role ARN, so CloudFormation would use the authorized administrator's temporary credentials for the new security stack. Those administrator permissions are not granted to the domain roles. Product stack operations later must explicitly use the restricted product execution role.

Before any authorized write: recheck caller/account/region, name collisions, API deny inventory, expiry, baseline, both artifact hashes and the exact five-resource template. Stop on mismatches; do not substitute HEAD, regenerate the candidate or adopt colliding resources.

The exact **first write to authorize later**, shown here but **not run**, is:

```powershell
aws cloudformation create-change-set --profile default --region eu-north-1 --cli-input-json file://infrastructure/security/tournaments-Ntgre-final/prepare-bootstrap-change-set.request.json
```

Creating this change set creates only the security stack's REVIEW_IN_PROGRESS record, not its IAM resources. Retrieve and reconcile all AWS-generated changes against the five additions above. Execute only under explicit bootstrap execution authorization and only by the inspected change-set ARN. Because the preparation request sets OnStackFailure, do not also supply DisableRollback to ExecuteChangeSet; rollback is already selected. [AWS CreateChangeSet contract](https://docs.aws.amazon.com/AWSCloudFormation/latest/APIReference/API_CreateChangeSet.html).

After security execution: verify role trusts, managed-policy default documents/hashes, permissions boundaries, no broad Logs Allows, runtime boundary existence, empty product deployment state and unchanged LegacyPlatform. Repeat effective-policy checks under the actual roles as applicable. Do not upload artifacts or deploy Tournament under security-only authorization.

Release 1 needs separate authorization: publish/promote only preserved exact artifacts, prepare and inspect the product change set with the restricted execution role, verify **11 additions** and no protected-resource effects, execute with rollback enabled only when authorized, then lock down the API scope. Release 2 and rollback proof require their own reviewed candidate/change-set evidence; no live deployment/update/rollback success is claimed here.

### Failure, rollback and removal

- Preparation only: if abandoned, remove only the new unexecuted security change set/REVIEW_IN_PROGRESS root when authorized; no existing resources are targets.
- Security create failure: allow rollback, inspect events and any residual new IAM resources. Never delete a pre-existing name collision or attach a shared administrator policy to make creation pass.
- Security completed, product absent: separately authorized security removal can delete the new roles and policies in dependency order. No logging cleanup exists.
- Product exists: retain its runtime boundary and associated execution role until the product is safely removed under separate authorization. Revoke temporary API grants through security policy update, not role deletion.
- First-create expiry during product rollback: inspect and seek a narrowly reviewed time/action correction; do not auto-extend or switch to a shared administrator execution role.
- Routine code rollback: promote/retain the exact previous code/template artifact read grants as required. It does not need Logs delivery or resource-policy administration.

## 8. Legacy baseline and final stop

[Before](phase2a-tournament-boundary-final-evidence-2026-09-26/legacy-before.json) and [after](phase2a-tournament-boundary-final-evidence-2026-09-26/legacy-after.json) are read-only comparisons against the preserved inventory.

| Check | Result |
| --- | --- |
| Root | `amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332` |
| Status | UPDATE_COMPLETE |
| Total resources | **2,621** |
| FunctionDirectiveStack | **167** |
| LastUpdatedTime | `2026-09-26T11:52:06.391000+00:00`, unchanged |
| Stack/template identities | 62 unchanged |
| Protected resource identities | 62 unchanged |
| Monitored Lambda code/configuration hashes | 5 unchanged |
| Cognito contract and local outputs | unchanged |

The local design and validation are complete. This readiness applies to the named final package and disclosed first-create API controls, subject to the normal fresh execution preflight. It does not authorize or claim deployment.

AWS writes: **0**. Tournament deployed: **NO**. Production mutations: **NONE**.
