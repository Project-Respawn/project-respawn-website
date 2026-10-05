# PROJECT RESPAWN PHASE 2B2 — TEAM HUB READ-PATH RELEASE 1

**ACCEPTED at 2026-10-05T15:22:18.164Z.** The second independent product domain is deployed in Ntgre, authenticated against the existing Ntgre identity pool, locked to its own API, and verified without changing LegacyPlatform, Tournament or production. Frontend cutover remains false. Earlier blocked state is retained in [previous report](team-hub-2b2-caller-release-evidence-2026-10-05/previous-release-report.md).

## Preserved product and security provenance

Product candidate: d458da9a7a8d1d519aaab05418fda95097a26256da0a297b71c95a5aaef5085f. All 54 inputs, templates and Lambda bundle outputs remained hash-identical; no HEAD substitution, rebuild or synthesis occurred. Product template SHA: 0796ee8170bd0417fca6b2806e58e48c18278b4e6c32999824f55ac65898e7ee. Lambda index.js SHA: 0e3fde08f1dbf3c1803ff1daac65e902117d757c76506d478112d5291814e7b3. Packaged ZIP SHA: b9138c4dda6962a05aac55a1b28eb58905424d07554669bcbc23554772915950; live CodeSha256: uROMTdppYqBarFWhso61iQVCTQdVRmm8vCNVR3KRWVA=.

The accepted four-resource KMS-corrected bootstrap remains the historical base, revision 3e5a12edf9074bb8dc8d7bf0d83783b641aefc3973514e08aa4cc80f530050de. Caller extension revision: bfc982cd6128541eeb582eae2fde8471bbd2c77f4d57b406b0b28d029ba6ad72. Exact-ID steady-state security template SHA: c7e7bd11ac692d3739535b04db75a99c23d2c1e6bddfd05404600ed6ab82b53c. Current security stack: ProjectRespawn-TeamHub-Ntgre-ReadProofSecurity, UPDATE_COMPLETE, five resources. Both security updates used rollback-enabled CloudFormation change sets.

## Restricted deployment caller

Role: ProjectRespawn-TeamHub-Ntgre-Deploy. Trust: only arn:aws:iam::058264289478:user/RavenTest. No IAM user or long-lived credentials were created. Assumed session credentials existed only in process memory and child-process environments, never evidence files or console output.

The extension added one role and modified only PreparationCaller; it reused that managed policy as the role's sole identity attachment and permissions boundary. It added exact artifact reads and stack-scoped ListStackResources/DescribeStackResource/ListChangeSets inspection. Account-wide ListStacks and direct CreateStack/UpdateStack/DeleteStack remain denied. No execution or runtime permissions were broadened. The user explicitly confirmed that PassRole must use the existing ReadProofExecution role rather than the prompt's CfnExecution spelling.

Scope: only ProjectRespawn-TeamHub-Ntgre, exact pinned template URL and ZIP reads, and PassRole of ProjectRespawn-TeamHub-Ntgre-ReadProofExecution to cloudformation.amazonaws.com. LegacyPlatform, Tournament, production, Creator, Commerce, Community, the security stack, direct API/Lambda, business storage, Cognito, AppSync, KMS and IAM administration are denied. Proposed and installed actual-role checks each passed 25 positives and 159 negatives; Analyzer policy/trust findings: zero.

Actual caller: arn:aws:sts::058264289478:assumed-role/ProjectRespawn-TeamHub-Ntgre-Deploy/TeamHubReviewedRelease1. It prepared, inspected, executed and monitored the product change set. RavenTest was used for authorized security custody/publication and read-only audit, not substituted for the product caller. See the [reusable caller pattern](independent-domain-deployment-callers.md) and [implementation](../../infrastructure/security/team-hub-Ntgre-deploy-caller/README.md).

Evidence: [candidate](team-hub-2b2-caller-release-evidence-2026-10-05/candidate.json), [caller-gate](team-hub-2b2-caller-release-evidence-2026-10-05/caller-gate.json), [extension-change-set](team-hub-2b2-caller-release-evidence-2026-10-05/extension-change-set.json), [installed-caller](team-hub-2b2-caller-release-evidence-2026-10-05/installed-caller.json), [live-validation](team-hub-2b2-caller-release-evidence-2026-10-05/live-validation.json).

## Assets and product execution gate

Bucket: cdk-hnb659fds-assets-058264289478-eu-north-1. Exact caller-authorized template key: team-hub/read-proof/0796ee8170bd0417fca6b2806e58e48c18278b4e6c32999824f55ac65898e7ee.template.json. ZIP key: da4d9e570523cbbdcff21572d059f18227d03c12482620e916752f2863b87da1.zip. Both objects are AES256/SSE-S3, confirmed by HeadObject checksums and actual restricted-caller downloads matching preserved bytes. The existing ZIP was not republished. No KMS decrypt permission or bucket-default change was added. [artifacts](team-hub-2b2-caller-release-evidence-2026-10-05/artifacts.json).

Product change set team-hub-read-proof-release1-20261005 contained eleven additions, zero modifications/deletions/replacements/unexpected resources. Original AWS template matched the preserved product. Execution role was verified through DescribeStacks (DescribeChangeSet does not expose that field). Expiry margin immediately before execution exceeded 22 hours, above the required six-hour minimum. Rollback stayed enabled. No deployment failure, permission patch or retry occurred.

Product stack: ProjectRespawn-TeamHub-Ntgre, CREATE_COMPLETE, eleven resources. API t54b88casf; stage $default; authorizer nvebda; integration pb3fp80; route GET /v1/team-hub/preview; Lambda ProjectRespawn-TeamHub-Ntgre-PreviewRead. Other resources: runtime role, invoke permission, preview log group and two alarms. No DynamoDB, S3 product bucket, command Lambda, mutation route, AppSync/Cognito creation, real Team records or business state.

Evidence: [product-prepared](team-hub-2b2-caller-release-evidence-2026-10-05/product-prepared.json), [product-change-set](team-hub-2b2-caller-release-evidence-2026-10-05/product-change-set.json), [product-execution-gate](team-hub-2b2-caller-release-evidence-2026-10-05/product-execution-gate.json), [product-executed](team-hub-2b2-caller-release-evidence-2026-10-05/product-executed.json), [product-events](team-hub-2b2-caller-release-evidence-2026-10-05/product-events.json), [ownership](team-hub-2b2-caller-release-evidence-2026-10-05/ownership.json).

## Immediate exact-API lockdown

API CloudFormation stack/name/logical-ID tags and Project=ProjectRespawn, Domain=TeamHub, Environment=Ntgre were verified, along with all eleven identities and the pinned template. The reviewed binder generated the actual-ID policy. The new caller role/policy were explicitly retained when deriving the security update from the older template.

Lockdown change set: zero additions, two modifications (ExecutionBoundary and ExecutionRole), zero deletions/replacements. The installed inline identity and default boundary match the exact-ID policy; no extra execution attachments or inline policies exist. Own API lifecycle is allowed; CreateApi, all fourteen pre-existing APIs and arbitrary other APIs are denied. Caller/runtime permissions are preserved. Proposed and actual-role lockdown checks each passed 43 positives and 679 negatives, zero Analyzer findings. Previously resolved unsupported simulator representations were not reopened.

Temporary broad first-create authority is no longer effective. One historical non-default managed-policy version remains inactive; neither the product caller nor execution role can restore it. The former expiry 2026-10-06T13:51:32.179Z was not extended. Runtime acceptance occurred only after installed lockdown verification. Evidence: [lockdown-candidate](team-hub-2b2-caller-release-evidence-2026-10-05/lockdown-candidate.json), [lockdown-change-set](team-hub-2b2-caller-release-evidence-2026-10-05/lockdown-change-set.json), [lockdown-installed](team-hub-2b2-caller-release-evidence-2026-10-05/lockdown-installed.json), [lockdown-live-validation](team-hub-2b2-caller-release-evidence-2026-10-05/lockdown-live-validation.json).

## Live authentication and runtime acceptance

Browser-local verification used the existing Ntgre session; no account/pool/client change or credential collection occurred. No token=401; invalid token=401; wrong issuer=401; wrong client=401; valid existing identity=200. The wrong-identity tokens were tampered and therefore also had invalid signatures: those HTTP results alone do not isolate issuer/client enforcement. Live JWT authorizer readback and nine passing preview/authentication tests, including an independent signed-token model, establish those controls separately.

Response: contractVersion=team-hub.v1, environment=Ntgre, preview=true, nonProduction=true, dataAuthority=SYNTHETIC, synthetic Team fixture with realBusinessRecord=false. The temporary local page and collector were removed/closed after sanitized results arrived. amplify_outputs.json is unchanged and repository local-output validation passed.

Lambda initialization observed; successful platform report and application success log matched request 712e8748-ce7c-4c35-8847-81abaf9bb763. Metrics: 1 invocation, 0 errors; 9 API requests and 0 API 5xx. Both alarms OK. No runtime KMS AccessDenied or log errors. The KMS DryRunOperationException recorded during creation explicitly states the request would have succeeded; it is a successful authorization probe, not an encryption failure.

The actual runtime role passed all 70 post-invocation negative assertions: DynamoDB, business S3, Cognito Admin/ListUsers, AppSync, IAM, CloudFormation, Tournament, Creator, Commerce and business KMS denied. Real key aliases were used where present; alias-less customer keys use a nonmatching simulator representative, with fresh inventory establishing absence of alias/aws/lambda. The boundary's ForAllValues deny also applies to an absent alias set.

The known logging simulator limitation produced two raw implicit denials despite exact policy readback. They are retained in pre-auth evidence and are not relabeled as raw Allows. Independent Analyzer inclusion checks for identity and boundary, sensitive removed-Allow controls, foreign-log deny controls and successful live logs resolved logging coverage: six independent checks passed. No IAM patch was applied to satisfy simulation. Evidence: [live-auth](team-hub-2b2-caller-release-evidence-2026-10-05/live-auth.json), [observability](team-hub-2b2-caller-release-evidence-2026-10-05/observability.json), [runtime-logs](team-hub-2b2-caller-release-evidence-2026-10-05/runtime-logs.json), [runtime-kms](team-hub-2b2-caller-release-evidence-2026-10-05/runtime-kms.json), [runtime-security](team-hub-2b2-caller-release-evidence-2026-10-05/runtime-security.json), [logging-verification](team-hub-2b2-caller-release-evidence-2026-10-05/logging-verification.json).

## Final isolation and endpoint manifest

Legacy: UPDATE_COMPLETE, 2,621 resources, FunctionDirectiveStack 167; root timestamp unchanged, 62 protected identities unchanged, five Lambda hashes unchanged. Tournament: UPDATE_COMPLETE, eleven resources, API msipnwy39j; Lambda/security unchanged. Live before/after comparisons passed. Neither Legacy nor Tournament was synthesized, diffed, given a change set or deployed. Production untouched.

Endpoint manifest: [config/domains/team-hub/domain-endpoints.Ntgre.json](../../config/domains/team-hub/domain-endpoints.Ntgre.json), generated only after acceptance and validated against domain-endpoints.v1. Shared environment schema also passed. frontendCutover=false; no application routing change, migration or business-data mutation. No Git commit/push was requested or performed; unrelated workspace changes remain preserved.

Final evidence: [legacy-after](team-hub-2b2-caller-release-evidence-2026-10-05/legacy-after.json), [tournament-baseline](team-hub-2b2-caller-release-evidence-2026-10-05/tournament-baseline.json), [accepted-state](team-hub-2b2-caller-release-evidence-2026-10-05/accepted-state.json), [final](team-hub-2b2-caller-release-evidence-2026-10-05/final.json).

TEAM HUB READ-PATH RELEASE 1 ACCEPTED — SECOND INDEPENDENT DOMAIN PROVEN
