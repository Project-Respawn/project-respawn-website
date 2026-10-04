# Phase 2A Tournament Release 1 runtime KMS acceptance — 4 October 2026

## Final acceptance — authenticated checks completed

**PHASE 2A RELEASE 1 ACCEPTED — READY FOR RELEASE 2 / ROLLBACK PROOF**

The existing signed-in Ntgre session successfully invoked the live Tournament route at `2026-10-04T15:21:46Z`: **HTTP 200**, valid `tournament-preview.v1`, exact preserved candidate revision, `preview=true`, `nonProduction=true`, `registrationEnabled=false`, and the expected fixture tournament. No-token and invalid-token requests returned **401**. Altered issuer/client tokens also returned **401**; because those alterations invalidate signatures, they do not independently isolate issuer/client validation. The deployed authorizer configuration and passing handler tests provide the complementary issuer/client checks.

Lambda log events include `platform.initStart`, `platform.start` and a matching `platform.report` with **status=success**, request ID `2ad5a4a1-f9ac-4196-b075-02a275c7949c`, runtime duration 33.959 ms and initialization duration 104.967 ms. The acceptance minute has **one invocation and zero errors**. API metrics are present; both alarms remain present and OK. API access logging stays disabled.

CloudTrail records **successful runtime Decrypt** at `2026-10-04T15:21:45Z`, request `27553a30-92c7-46a9-a541-87f2ca2d8fb3`, on the exact AWS-managed Lambda key. The principal is the deployed PreviewRole session and the encryption context identifies the exact PreviewFunction ARN. No runtime KMS error was observed in the captured acceptance window. This supplies the live proof that removing the exact explicit blocker was sufficient: **no new KMS Allow was needed**.

The handler still emits **no application log entry**. The user explicitly accepted **“Accept response, platform logs and metrics”** as the logging criterion. Successful output and matching platform logs/metrics satisfy that approved alternative; no application log is invented and no source/code change was made. [Recorded user decision](phase2a-tournament-runtime-kms-evidence-2026-10-04/logging-acceptance.json).

After live success, the full negative suite passed again: **307 explicit-denial assertions**, including all ten customer-managed keys, administration and cross-domain operations. Actual deployed-principal simulations also passed after success. Access Analyzer returned zero findings. RuntimeBoundary remains **v2**, execution boundary **v8**, and runtime identity remains logging-only. Business keys, unknown customer keys, DynamoDB, business S3, Cognito Admin, AppSync, IAM, CloudFormation and other domain resources remain denied.

Fresh LegacyPlatform comparison after the authenticated request: **2,621 resources**, **167 FunctionDirectiveStack resources**, unchanged root timestamp `2026-09-26T11:52:06.391000+00:00`, **62 protected identities unchanged**, **five Lambda hashes unchanged**, all 62 stack template/resource sets equal. No Legacy synthesis, diff, change set or deployment occurred. Production was untouched. The original checkpoint still verifies **24 source files and 12 security files exact**; previously completed Tournament **26/26** and accounting/isolation **41/41** tests remain applicable because no product source changed.

The [deployed endpoint manifest](../../config/domains/tournaments/domain-endpoints.Ntgre.json) has now been generated from the pinned assembly and live evidence. It contains domain/environment/account/region, exact stack ARN/API/endpoint, auth mode, contract version, candidate revision and verification provenance. It is **not imported into the frontend**. `amplify_outputs.json` is unchanged. No CloudFormation update, product code change, Release 2, rollback exercise, Founder's Cup B1, Git commit or push occurred during these final checks.

The ten Ntgre role-test accounts were created and confirmed under separate explicit user instructions between checkpoints. That authorized user provisioning is distinct from infrastructure identity preservation. No Cognito pool/client/group definition or production account was changed. The acceptance page consumed the user's signed-in session; no token or password was captured in acceptance evidence.

Evidence: [authenticated response](phase2a-tournament-runtime-kms-evidence-2026-10-04/live-auth.json), [correlated runtime logs](phase2a-tournament-runtime-kms-evidence-2026-10-04/acceptance-runtime-logs.json), [metrics and alarms](phase2a-tournament-runtime-kms-evidence-2026-10-04/observability.json), [successful runtime KMS](phase2a-tournament-runtime-kms-evidence-2026-10-04/runtime-kms-live-events.json), [post-success boundary tests](phase2a-tournament-runtime-kms-evidence-2026-10-04/validate-after-results.json), [post-success actual-principal tests](phase2a-tournament-runtime-kms-evidence-2026-10-04/actual-role-post-success-negatives.json), [Legacy after comparison](phase2a-tournament-runtime-kms-evidence-2026-10-04/legacy-after.json), [final result](phase2a-tournament-runtime-kms-evidence-2026-10-04/final-result.json).

Remaining Phase 2A proof, requiring its own next-stage work:

1. Tournament-only Release 2.
2. Independent rollback to Release 1.

## Historical initial checkpoint — superseded by the acceptance above

The following records the earlier incomplete checkpoint, before local test-account setup and successful browser verification. Its pending/failed statements are historical. An unmodified [initial report snapshot](phase2a-tournament-runtime-kms-evidence-2026-10-04/initial-incomplete-report.md) is also retained.

**RuntimeBoundary v2 is installed and verified. No infrastructure deployment occurred. Live Release 1 acceptance is incomplete: the browser verification found no usable authenticated session, so successful Lambda execution is not established.** The preserved handler emits no application logs; the user has been asked whether authenticated output plus platform logs may satisfy that requirement. No answer or exception is assumed.

## Scope and deployed state

Account `058264289478`, region `eu-north-1`, supervising identity `arn:aws:iam::058264289478:user/RavenTest`. Only `ProjectRespawn-Tournaments-Ntgre-RuntimeBoundary` was changed in AWS, by creating default managed-policy version **v2** at `2026-10-04T13:55:58Z`. Version v1 is retained. No execution policy, deployment boundary, trust, runtime identity policy, key policy, API configuration, Cognito configuration or Lambda code was changed.

Existing stack `ProjectRespawn-Tournaments-Ntgre` remains **UPDATE_COMPLETE**, with eleven expected resources and rollback enabled. Stack ARN: `arn:aws:cloudformation:eu-north-1:058264289478:stack/ProjectRespawn-Tournaments-Ntgre/0bbf8810-bb52-11f1-8464-0ad1b20dfcbd`.

Original API `msipnwy39j`, stage `$default`, JWT authorizer `v78ib2`, integration `xeys56k`, route `GET /v1/tournaments/preview`, and Lambda `ProjectRespawn-Tournaments-Ntgre-PreviewFunction-Ao4o6udMacJV` are unchanged. The authorizer consumes the existing Ntgre Cognito pool/client. API access logging remains disabled; the preview log group and both alarms remain present.

Candidate `b75a91494c03606d825e234a65d295c184067820cd77dfc84e11a2c83484ae2f`, template SHA `b9be81faba86a3a8e1949cca1c802720a7bf557cc74cd6cb7f5ee17423c35705`, ZIP SHA `813c9fc380baab07aa60f4f4c782db9955bb669432d60d8ec0f735a79e83929a`. Preservation validation checked all 42 files; the checkpoint confirmed 24 original sources and 12 original security files remain exact. The deployed template and Lambda hash match. No synthesis, artifact regeneration, HEAD substitution or product-source change occurred.

## Reconstructed runtime requirement and decision

Fresh read-only evidence reconfirmed the failure at `2026-10-04T13:35:13Z`, request `67538f28-978f-4030-ae4b-5103fa9e66a5`: `kms:Decrypt` was explicitly denied by RuntimeBoundary for the assumed session of `ProjectRespawn-Tournaments-Ntgre-PreviewRole-o0HtDJVosSDO`.

Exact key: `arn:aws:kms:eu-north-1:058264289478:key/13ae83f9-bc5f-4486-a013-e07b9d7d52e7`, alias `alias/aws/lambda`, classification **AWS_MANAGED_SERVICE_KEY**. Lambda has no configured customer-managed KMS key. Its runtime identity policy remains exactly `PreviewLogsOnly`, allowing only CreateLogStream/PutLogEvents for `/project-respawn/Ntgre/tournaments/preview`; it has no attached managed policies and Lambda-only trust.

The freshly retrieved AWS-managed key policy grants Decrypt to account principals subject to the caller account and Lambda FunctionArn encryption context; a separate statement permits Lambda-mediated operations. This supplies a possible resource-policy authorization path without a new identity Allow. Explicit denies override that path. See [AWS boundary evaluation](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html) and [Lambda default encryption](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars-encryption.html).

Selected **model A, narrowly scoped**: add only `kms:Decrypt` to the blanket deny's NotAction exception and add a new explicit Decrypt deny with NotResource equal to the exact Lambda key ARN. All other KMS operations stay explicitly denied everywhere, and Decrypt stays explicitly denied for every other key, including future/arbitrary keys. No KMS Allow is added to either boundary or identity policy. Existing logging statements remain identical.

Model B, a new exact-key KMS Allow, was not selected: it was not yet shown necessary and would not itself be an identity-policy grant. Model C, new ViaService/encryption-context restrictions, was not added: the failed event lacks request context, while the fetched key policy already enforces its own constraints. A new condition must not be invented from an absent field. No new permission to administer keys or obtain other functions' ciphertext is granted.

**Limit:** identity-policy simulation reports implicitDeny, rather than allowed, for the exact Lambda key because it does not model this key-policy/session authorization path. It proves removal of the explicit blocker, not successful service execution. Live behavior is still required to prove that no new Allow is needed. No successful default-key initialization is claimed in this report.

Boundary canonical SHA-256: `27d274137d949c5c89634745d3de1eb42531a7015ed5c9c1a31345203b58d160`. [Reviewed boundary](../../infrastructure/security/tournaments-Ntgre-runtime-kms/runtime-boundary.json), [fresh requirement evidence](phase2a-tournament-runtime-kms-evidence-2026-10-04/requirement.json), [design](phase2a-tournament-runtime-kms-evidence-2026-10-04/design.json).

## Validation and installation gate

| Check | Result |
|---|---|
| Access Analyzer before/after | Zero findings |
| Ten customer-managed keys | 240 explicit-denial assertions, covering 24 applicable operations per key |
| CreateKey and global KMS administration | Explicitly denied; CreateKey evaluated on `*`, not an existing key ARN |
| Exact AWS Lambda key, other KMS operations | Explicitly denied |
| Other AWS-managed keys and arbitrary key | Decrypt explicitly denied |
| Cross-domain runtime actions | Explicitly denied |
| Total explicit-denial assertions | 307 before and after installation |
| Own preview logging | Independent Analyzer grant inclusion PASS; removing Allow produces expected FAIL |
| Other-domain logging | Independent Analyzer proves deny still defeats a hypothetical Allow; removing that deny produces expected FAIL |
| Actual deployed runtime principal | Customer-key, administration, cross-domain negatives and exact-key absence of explicit deny all pass |
| Tournament and dependency isolation | 26/26 pass in preserved candidate worktree |
| Resource accounting and isolation | 41/41 pass |
| Original pinned checkpoint | Exact |

Eight keys remain **PROJECT_RESPAWN_BUSINESS_KEY**, including Twitch token-vault and Overlay keys across Ntgre/staging/production/master. The two unresolved keys `241c8882-ea21-4f96-80e1-9848879bc8b0` and `819371f0-e874-4aec-b055-4291faefffa6` are **UNKNOWN_CUSTOMER_MANAGED_KEY** and receive the same explicit denials. The ten ARN targets come from the preserved [inventory](phase2a-tournament-kms-correction-evidence-2026-10-04/key-inventory.json). Denials do not depend on root-delegation policies or the absence of grants. No real business-key decrypt/encrypt operation was issued.

Initial simulator diagnostics are retained: the harness first incorrectly combined wildcard and concrete resources, then observed CreateKey's unsupported existing-key resource and the known logging simulator limitation. Corrected requests test CreateKey globally and inspect every ResourceSpecificResult. Independent Analyzer checks with sensitive controls resolve logging coverage; raw implicit denials are not relabeled as raw allows.

The full **PHASE 2A RUNTIME KMS ACCEPTANCE GATE / RUNTIME KMS CORRECTION READY** was printed before any write. The first apply stopped before mutation because RoleLastUsed telemetry had appeared; read-only comparison proved this was the sole difference. The final comparison excludes only that observational field and still compares every security setting. Installation then succeeded, with exact semantic readback. ExecutionBoundary remains **v8**; DeployBoundary, runtime identity policy and trust are unchanged.

The managed policy's new default version applies to the existing role attachment. No detach/reattach, role recreation, CloudFormation change set or stack update was needed. Runtime initialization remains separately unverified.

Evidence: [gate](phase2a-tournament-runtime-kms-evidence-2026-10-04/gate.json), [validation](phase2a-tournament-runtime-kms-evidence-2026-10-04/validate-results.json), [after validation](phase2a-tournament-runtime-kms-evidence-2026-10-04/validate-after-results.json), [actual principal](phase2a-tournament-runtime-kms-evidence-2026-10-04/actual-role-negatives.json), [logging deny controls](phase2a-tournament-runtime-kms-evidence-2026-10-04/logging-deny-controls.json), [installed security](phase2a-tournament-runtime-kms-evidence-2026-10-04/security-installed.json), [live resources](phase2a-tournament-runtime-kms-evidence-2026-10-04/live-resources.json).

## Live acceptance: not completed

No token: **401**. Invalid token: **401**, verified both directly and from the browser. Wrong issuer/client: not tested live because no usable existing identity was available; authorizer configuration and handler negatives pass. A future tampered JWT test would also have an invalid signature and cannot independently isolate issuer/client enforcement.

The temporary verification page loaded in the browser and successfully posted sanitized results to its loopback collector. It reported `sessionAvailable=false`, with no valid-identity request or preview response. The user was asked to sign in through localhost normally and reload the page. No password/token was requested, extracted from browser storage by the agent, persisted, or sent to the collector. No user/group was created or modified. Local Ntgre outputs validation passed.

The latest observation has no Lambda invocation datapoints or platform.report events. API Count datapoints exist and both alarms are OK, but those facts do not establish successful Lambda execution. No post-correction runtime KMS events were observed in the captured CloudTrail window; delivery delay and the lack of authenticated invocation mean this is **not proof of successful Decrypt or absence of a future failure**.

The pinned handler contains no application logging. Adding it would violate this task's source/code-change prohibition. User clarification is pending; no waiver is inferred. Neither application logs nor a successful-request error count of zero is claimed.

Evidence: [browser result](phase2a-tournament-runtime-kms-evidence-2026-10-04/live-auth.json), [anonymous checks](phase2a-tournament-runtime-kms-evidence-2026-10-04/anonymous-auth.json), [observability](phase2a-tournament-runtime-kms-evidence-2026-10-04/observability.json), [CloudTrail window](phase2a-tournament-runtime-kms-evidence-2026-10-04/runtime-kms-events.json).

The security suite was rerun after installation. The specifically requested **post-success** run remains pending because a successful authenticated invocation has not occurred.

## Legacy isolation and completion conditions

Fresh complete before/after inventory: **2,621 resources**, **167 FunctionDirectiveStack resources**, **62 protected identities unchanged**, **five Lambda code/configuration hashes unchanged**. Root timestamp stays `2026-09-26T11:52:06.391000+00:00`; all 62 stack template/resource sets and core identity/output hash match.

LegacyPlatform synthesized: **NO**. Diffed: **NO**. Change set: **NO**. Deployed: **NO**. Production modified: **NO**. `amplify_outputs.json` modified: **NO**. Frontend cutover: **NO**. Domain endpoint manifest: **not generated**, because live acceptance has not passed. No Release 2, rollback proof or Founder's Cup B1 started. No commit or push was requested or performed.

[Before baseline](phase2a-tournament-runtime-kms-evidence-2026-10-04/legacy-before.json), [complete after equality](phase2a-tournament-runtime-kms-evidence-2026-10-04/legacy-after.json).

To finish: use an existing Ntgre identity through the live JWT-authorized API, verify the preview contract, correlate successful runtime logs/metrics and KMS behavior, resolve the application-log requirement, rerun security negatives after success, then generate the provenance-bearing endpoint manifest. Preserve the deployed stack and installed policies while awaiting that proof.

Remaining Phase 2A proof after Release 1 acceptance:

1. Tournament-only Release 2.
2. Independent rollback to Release 1.

**PHASE 2A RELEASE 1 RUNTIME ACCEPTANCE FAILED** — acceptance evidence is incomplete; infrastructure remains deployed and RuntimeBoundary v2 is installed.
