# Phase 2A KMS-corrected Release 1 — 4 October 2026

**CloudFormation deployment succeeded: UPDATE_COMPLETE, eleven resources. Release 1 acceptance failed because the unchanged runtime permissions boundary denied default-key decryption. No runtime policy patch, deployment retry or forced rollback followed.**

The execution-policy KMS correction worked without adding any KMS Allow. Lambda and Stage both reached CREATE_COMPLETE, resolving the previous infrastructure-creation blockers for this attempt. However, CloudTrail records `kms:Decrypt` denied for the new PreviewRole session by RuntimeBoundary. A valid authenticated preview and successful Lambda execution were not established. **Do not treat the completed stack or healthy-looking alarms as completed Release 1 acceptance.**

## Target and immutable candidate

Account `058264289478`; region `eu-north-1`; supervising identity `arn:aws:iam::058264289478:user/RavenTest`. Product operations used the restricted `ProjectRespawn-Tournaments-Ntgre-Deploy` role and designated `ProjectRespawn-Tournaments-Ntgre-CfnExecution` service role.

Stack: `arn:aws:cloudformation:eu-north-1:058264289478:stack/ProjectRespawn-Tournaments-Ntgre/0bbf8810-bb52-11f1-8464-0ad1b20dfcbd`.

Candidate: `b75a91494c03606d825e234a65d295c184067820cd77dfc84e11a2c83484ae2f`.

Template SHA: `b9be81faba86a3a8e1949cca1c802720a7bf557cc74cd6cb7f5ee17423c35705`.

Published ZIP key: `004def9c2189ea71a43cc3a05a796073327c0a084a7d896d0d6ee19aa8e54199.zip`; exact ZIP SHA: `813c9fc380baab07aa60f4f4c782db9955bb669432d60d8ec0f735a79e83929a`.

All 42 preservation-manifest files were verified. The checkpoint confirmed 24 source files and 12 original security files remain exact. Published template/ZIP hashes and deployed Lambda CodeSha256 match. No fresh synthesis, product-source change, regenerated asset, artifact upload, HEAD substitution or change to `amplify_outputs.json` occurred. The independent root still consumes the existing Ntgre Cognito issuer/client; ownership was not transferred.

## Exact execution-policy failure and minimum correction

The authoritative [preceding report](phase2a-tournament-practical-iam-release1-2026-10-04.md) records PreviewFunction CREATE_FAILED. Correlated CloudTrail confirms CreateFunction20150331 and KMS Encrypt at `2026-10-04T13:11:58Z`, under `CfnExecution/AWSCloudFormation`. The KMS error explicitly names the ExecutionBoundary deny. Lambda request ID: `d5891c40-4e37-442c-9f8a-af107c340d9d`; KMS request ID: `6b430ae3-8eeb-4828-b360-b62b03eedd9c`.

The key is AWS-managed `alias/aws/lambda`, ARN `arn:aws:kms:eu-north-1:058264289478:key/13ae83f9-bc5f-4486-a013-e07b9d7d52e7`. Its actual policy supplies Lambda-mediated access for account 058264289478. The failed event has no request parameters and reports CloudFormation as invokedBy; no unobserved ViaService field is claimed. The mediation conclusion uses the correlated Lambda operation, default-encryption template, fetched key policy and [AWS Lambda encryption documentation](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars-encryption.html).

Selected model **A**: remove `kms:*` from exactly one execution-policy Deny statement; add **zero KMS Allows**. Every non-KMS statement, practical API Gateway permission and deny, PassRole restriction, artifact permission, DeployBoundary and RuntimeBoundary remains unchanged. [Semantic diff](phase2a-tournament-kms-correction-evidence-2026-10-04/semantic-diff.json), [review of alternatives A/B/C](phase2a-tournament-kms-correction-evidence-2026-10-04/policy-review.md).

Model B's explicit key-ID deny list was unnecessary for the inspected policies/grants. Model C's new service-context conditions were unnecessary and would introduce a request-context dependency not present in the failed event. Neither was implemented. The direct-administration prohibition is distinct from normal AWS-managed Lambda encryption/grant handling. No broad decrypt permission or key-administration permission was added.

## Key inventory and business-data isolation

Read-only inspection covered all 16 visible keys in the target account/region, including aliases, policies, customer-key ownership and grants:

| Classification | Count | Result |
|---|---:|---|
| AWS_MANAGED_SERVICE_KEY | 6 | Lambda, Secrets Manager, EBS, SSM, S3, DynamoDB |
| PROJECT_RESPAWN_BUSINESS_KEY | 8 | Five Twitch token-vault keys; three Overlay credential keys, including production/master |
| DEPLOYMENT_ARTIFACT_KEY | 0 identified | Exact pinned ZIP uses AES256, not a customer KMS key |
| UNKNOWN | 2 | Customer-managed keys with Amplify tags but no current CFN owner; protected in all negative tests |

All ten customer-managed keys have only account-root delegation policies and **zero grants**. Such delegation enables identity authorization rather than granting every IAM principal access; the execution identity/boundary contain no KMS Allow. Business decrypt, encrypt, data-key operations and direct KMS administration remain denied. Runtime's explicit non-logging deny independently blocks business KMS. [AWS account-principal delegation semantics](https://docs.aws.amazon.com/kms/latest/developerguide/key-policy-default.html).

This conclusion is limited to the inspected policies/grants; it does not assert that missing identity permissions override all conceivable future resource-policy grants. Revalidate on key-policy, grant or encryption-model changes. UNKNOWN does not imply unused or deletion-authorized. No key was created, modified or deleted by the operator; no direct business encrypt/decrypt test was issued. Lambda's normal service-managed operations on its AWS-managed key are separately recorded.

Evidence: [readable inventory](phase2a-tournament-kms-correction-evidence-2026-10-04/key-classification.md), [complete metadata/policies/grants](phase2a-tournament-kms-correction-evidence-2026-10-04/key-inventory.json), [artifact encryption](phase2a-tournament-kms-correction-evidence-2026-10-04/artifact-encryption.json), [failure KMS events](phase2a-tournament-kms-correction-evidence-2026-10-04/kms-failure-events.json), [correlated Lambda events](phase2a-tournament-kms-correction-evidence-2026-10-04/lambda-failure-events.json).

## Validation, policy gate and installation

| Check | Result |
|---|---|
| Access Analyzer, corrected execution/runtime/deployment documents | Zero findings; zero invalid actions |
| General deployment positives | 153 assertions: 139 raw allows; 14 retained simulator denials |
| Independent inclusion and sensitive controls for those denials | 42/42 pass |
| General negative assertions | 119/119 pass |
| Actual-failure regression | Exact prior deny identified; corrected execution policy no longer blocks default encryption; CreateFunction allowed |
| Real-key KMS/runtime negatives | 186/186 pass across all ten customer-managed keys and administration controls |
| Tournament / dependency-isolation suite | 26/26 pass in preserved final-candidate worktree |
| Resource-accounting / isolation suite | 41/41 pass |
| Original candidate checkpoint | Exact |

The regression distinguished absent execution-policy explicit deny from a new KMS Allow; it did not fabricate a live encryption success from a simulator result. Live creation later supplied that proof. The runtime suite correctly proved business KMS denial, but **did not prove a permitted default-key runtime initialization path**; the new runtime failure is retained as an acceptance blocker.

The required **PRACTICAL KMS CORRECTION READY** gate was printed before AWS modification. Only the authorized execution managed policy was updated, from IAM **v7 to v8**. Semantic readback matched exactly. No runtime permission, other-domain policy, key policy or trust policy was changed. The managed policy remains both CfnExecution's identity policy and boundary.

Evidence: [regression summary](phase2a-tournament-kms-correction-evidence-2026-10-04/kms-regression-summary.json), [all KMS assertions](phase2a-tournament-kms-correction-evidence-2026-10-04/kms-regression-results.json), [Analyzer](phase2a-tournament-kms-correction-evidence-2026-10-04/access-analyzer.json), [raw general simulations](phase2a-tournament-kms-correction-evidence-2026-10-04/policy-simulations.json), [independent controls](phase2a-tournament-kms-correction-evidence-2026-10-04/independent-policy-checks.json), [policy gate](phase2a-tournament-kms-correction-evidence-2026-10-04/policy-gate.json), [installed v8](phase2a-tournament-kms-correction-evidence-2026-10-04/security-installed.json).

## Reviewed UPDATE and terminal result

Fresh baseline: UPDATE_ROLLBACK_COMPLETE, one original API `msipnwy39j`, IN_SYNC, zero children. No recovery action was required.

New change set: `arn:aws:cloudformation:eu-north-1:058264289478:changeSet/ntgre-tournaments-release1-kms-corrected-20261004/3e48f322-a2f0-4c65-b5a4-34e974db9996`.

All pages and the AWS-held template were reconciled: **10 additions, one equivalent API lifecycle-attribute modification, zero deletions, zero replacements (including conditional), zero unexpected resources**. The original API's properties and physical ID were unchanged. The lifecycle modification removes explicit Delete/Delete attributes, retaining equivalent defaults; AWS reported static evaluation, no recreation and Replacement=False.

The required **READY TO EXECUTE KMS-CORRECTED RELEASE 1** gate was printed. The restricted Deploy role executed only that reviewed change set, with **DisableRollback=false**, request token `ntgre-tournaments-release1-kms-corrected-20261004-execute`.

CloudFormation reached **UPDATE_COMPLETE** with all eleven resources. There were no failed resource events in this attempt. Both PreviewFunction and DefaultStage reached CREATE_COMPLETE. The prior Stage-tagging failure did not recur under the practical policy.

| Logical resource | Physical identity / configuration | Final CFN status |
|---|---|---|
| HttpApi | `msipnwy39j`, original API | UPDATE_COMPLETE |
| DefaultStage | `$default`, AutoDeploy=true; no API access logging | CREATE_COMPLETE |
| JwtAuthorizer | `v78ib2`, existing Ntgre Cognito issuer/client | CREATE_COMPLETE |
| PreviewIntegration | `xeys56k`, AWS_PROXY, payload v2.0 | CREATE_COMPLETE |
| PreviewRoute | `0txbv4p`, `GET /v1/tournaments/preview`, JWT required | CREATE_COMPLETE |
| PreviewFunction | `ProjectRespawn-Tournaments-Ntgre-PreviewFunction-Ao4o6udMacJV` | CREATE_COMPLETE |
| PreviewRole | `ProjectRespawn-Tournaments-Ntgre-PreviewRole-o0HtDJVosSDO`, unchanged RuntimeBoundary | CREATE_COMPLETE |
| HttpInvoke | `ProjectRespawn-Tournaments-Ntgre-HttpInvoke-DTm4dxJNE81S`, exact API/GET preview permission | CREATE_COMPLETE |
| PreviewLogs | `/project-respawn/Ntgre/tournaments/preview`, retention 14 days | CREATE_COMPLETE |
| HttpErrors | `ProjectRespawn-Tournaments-Ntgre-HttpErrors-NLywnrF34Zb4` | CREATE_COMPLETE |
| PreviewErrors | `ProjectRespawn-Tournaments-Ntgre-PreviewErrors-tVGBWEop0yku` | CREATE_COMPLETE |

Evidence: [preflight](phase2a-tournament-kms-correction-evidence-2026-10-04/preflight.json), [change-set reconciliation](phase2a-tournament-kms-correction-evidence-2026-10-04/change-set-inspection.json), [execution gate](phase2a-tournament-kms-correction-evidence-2026-10-04/execution-gate.json), [execution request](phase2a-tournament-kms-correction-evidence-2026-10-04/execute-request.json), [successful-attempt events](phase2a-tournament-kms-correction-evidence-2026-10-04/successful-deployment-events.json), [full deployed-resource verification](phase2a-tournament-kms-correction-evidence-2026-10-04/live-resources.json).

## New runtime KMS blocker — stopped without patching

Post-deployment CloudTrail inspection found this request at `2026-10-04T13:35:13Z`:

- Operation: **Decrypt** on the same AWS-managed Lambda key.
- Principal: `arn:aws:sts::058264289478:assumed-role/ProjectRespawn-Tournaments-Ntgre-PreviewRole-o0HtDJVosSDO/awslambda_849_20261004133513647`.
- Request ID: `67538f28-978f-4030-ae4b-5103fa9e66a5`.
- Error: **AccessDenied**, explicit deny in `ProjectRespawn-Tournaments-Ntgre-RuntimeBoundary`.

Read-only simulation against the **actual deployed runtime role** reproduces `explicitDeny` for that key's kms:Decrypt. Its boundary still denies every action except preview logging. Actual runtime identity policy is exactly PreviewLogsOnly; there are no attached managed policies or extra inline grants, and trust remains Lambda-only.

The same event collection confirms successful execution-role Encrypt, Decrypt and normal CreateGrant handling on `alias/aws/lambda`, without an identity-policy KMS Allow. Those service operations are distinct from direct business-key access or permission to administer customer keys. The runtime denial shows why execution-policy success alone is insufficient.

The user prohibited changing runtime permissions in the installation step and patch/retry after a failure. Accordingly, **no runtime exception, broad decrypt grant, second deployment or forced rollback was performed**. CloudFormation itself succeeded, so it did not automatically roll back; the eleven resources remain deployed. A separately reviewed runtime service-encryption correction is needed before acceptance can finish. Do not claim an observed authenticated HTTP 500: no valid-identity response was captured.

Evidence: [mixed successful service events and runtime denial](phase2a-tournament-kms-correction-evidence-2026-10-04/kms-post-deployment-events.json), [exact runtime blocker and actual-role simulation](phase2a-tournament-kms-correction-evidence-2026-10-04/runtime-kms-blocker.json).

## Authentication and observability

- No token: **HTTP 401**.
- Invalid token: **HTTP 401**.
- Wrong issuer/client: not tested live; configured authorizer and handler negatives passed local tests.
- Valid existing Ntgre identity: **not verified**.
- Preview response: **not verified**.

A temporary localhost page was prepared to keep tokens in the user's browser and send them only to Tournament. It returned no browser evidence before the runtime blocker was discovered. No token/password was requested, captured or saved. Its loopback-only collector was stopped after the blocker; the normal localhost application was left running. The page's tampered-JWT negatives would not independently prove issuer/client enforcement, and are not counted as performed tests.

The Lambda log group exists, but successful Lambda execution logs/metrics were not established. Both alarms were present and reported OK with TreatMissingData=notBreaching; that does not prove successful traffic. API access logging remains disabled. The final observation recorded API Count datapoints following the anonymous/invalid requests, but no Lambda invocation datapoints or platform.report log events. Gateway counts do not prove runtime success.

Evidence: [live negative authentication](phase2a-tournament-kms-correction-evidence-2026-10-04/anonymous-auth.json), [logs/metrics/alarms and actual runtime policy](phase2a-tournament-kms-correction-evidence-2026-10-04/observability.json).

## LegacyPlatform isolation and local checks

| Check | Before | After |
|---|---|---|
| Legacy resources | 2,621 | 2,621 |
| FunctionDirectiveStack | 167 | 167 |
| Root status | UPDATE_COMPLETE | UPDATE_COMPLETE |
| Root timestamp | 2026-09-26T11:52:06.391000+00:00 | Identical |
| Stack template/resource identity sets | 62 | Identical |
| Protected identities | 62 | Identical |
| Monitored Lambda code/configuration hashes | 5 | Identical |
| Cognito contract / outputs hash | Recorded | Identical |

LegacyPlatform synthesized: **No**. Diffed: **No**. Change set: **No**. Deployed: **No**. Production modified: **No**; production key metadata/ownership was inspected read-only. No other domain was deployed and no business data was read or written by Tournament runtime.

The existing `npm run dev` server remained available at localhost:5174 (HTTP 200). Fresh Ntgre outputs validation and contract checks pass: 24 queries, 55 mutations, 62 frontend operations, zero missing. This is server/contract validation, not authenticated application-health acceptance. [Local checks](phase2a-tournament-kms-correction-evidence-2026-10-04/local-checks.json).

No active endpoint manifest or frontend cutover was published because live acceptance is incomplete. No Founder's Cup B1, other-domain role work, commit or push was performed. The [security standard](domain-deployment-runtime-security.md) distinguishes the successful execution correction from the newly evidenced runtime blocker.

Evidence: [fresh before baseline](phase2a-tournament-kms-correction-evidence-2026-10-04/legacy-before.json), [complete after equality proof](phase2a-tournament-kms-correction-evidence-2026-10-04/legacy-after.json).

Remaining Phase 2A proofs, blocked until Release 1 runtime acceptance succeeds:

1. Tournament-only Release 2.
2. Independent rollback to Release 1.

**PHASE 2A RELEASE 1 FAILED** — acceptance failed; CloudFormation remains UPDATE_COMPLETE with eleven resources.
