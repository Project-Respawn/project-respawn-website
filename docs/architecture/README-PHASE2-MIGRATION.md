> Current Team Hub review: [Production Team Hub dark deployment readiness](production-team-hub-deployment-readiness.md). Production Core is accepted and unchanged; Team candidates propose 8 security +39 product additions with preserved runtime bytes, reviewed KMS corrections, exact artifact bindings and passing IAM/build/regression checks. Read-only preservation verifies all 121 records, four backups/protections, Cognito, Master and Ntgre; Team stacks remain absent. Separate dark-deployment authorization is required. C1 authority initialization, cursor proof, business migration/cutover and public release are excluded. Earlier entries below are historical.

> Current acceptance: [Production Core deployed and accepted](production-core-emf-acceptance.md). Exact security/product updates are UPDATE_COMPLETE; all 13 live contracts, signed-Ntgre rejection, EMF and alarm signals passed. The separately authorized ordinary test account was removed and all original 15 users preserved. Final checks preserve 121 source records, four backups/protections, Cognito configuration, Master and protected domains. Team Hub deployment requires separate review and authorization; no authority initialization, data migration or public release occurred. Earlier entries below are historical.

> Current execution: [Production Core EMF deployment result](production-core-emf-deployment-result.md). Security (four modifications) and product (one Contracts Code modification) are UPDATE_COMPLETE. Actual root-level EMF ingestion and all four alarm input signals passed; 126 execution-role and 43 caller-role checks passed. All 121 source records, backups, protections, Cognito, Master and protected domains are preserved. Final Core acceptance is blocked only by missing authenticated production Admin/ordinary-user and signed-Ntgre rejection receipts. Team deployment remains unauthorized; no authority, migration or public release occurred. Earlier states below are historical.

> Current review: [Core EMF artifact binding](production-core-emf-artifact-binding.md) is ready for separate deployment review. Proposed security changes are exactly four deployment-policy modifications; product remains one Contracts Code modification. Runtime IAM/KMS, EMF artifact bytes and rollback references are preserved. Certification passed 494 policy checks, 211 effective controls and 112 offline tests. No AWS writes, invocation, change sets or deployment occurred; live EMF/authentication acceptance remains pending. Earlier states below are historical.

> Current preparation: [Production Core EMF correction](production-core-emf-correction.md). Emission-only runtime/product artifacts and tests are complete; installed IAM is unchanged. Execution remains blocked because the new immutable ZIP/template keys and TemplateURL are outside current exact artifact grants. No AWS writes or new invocation occurred. Separate artifact-binding review is required; Core live acceptance and Team deployment remain gated. Earlier results below are historical.

> Current execution result: [Core runtime correction deployed; custom-metric acceptance blocked](production-core-runtime-execution-result.md). Five security and one Runtime IAM modifications UPDATE_COMPLETE, 119 execution-role + 50 runtime-role checks passed, actual initialization/Decrypt succeeded. Custom EMF is nested by JSON logging and not extracted; stop before further authentication or Team deployment. Source/protected baselines preserved. Earlier preparation and failures below are historical.

> Current 21 October preparation: [Core runtime KMS correction](production-core-runtime-kms-correction.md). Deployed Core remains blocked at runtime Decrypt; the proposed identity/boundary correction is not installed or live accepted. Separate security-first/product-second authorization is required; no Team deployment, authority or Master change is included.

<!-- PRODUCTION-CORE-FINAL-RESULT:START -->
## Production Core — deployed, runtime acceptance blocked

[Actual final recovery result](production-core-final-recovery-result.md): final security/product UPDATE_COMPLETE, 115 actual-role IAM checks passed, imported Logs IN_SYNC, exact six-addition product update and runtime/configuration pins verified. Actual CreateGrant succeeded. First live invocation failed on runtime-role kms:Decrypt explicit Deny before handler initialization. No Core live acceptance; helper stopped; no permission patch/retry. All 121 source records/backups/protections, Cognito, Master and protected domains preserved. Thirteen Core resources survive; Team remains unauthorized and absent. Separate runtime IAM/KMS review is required.
<!-- PRODUCTION-CORE-FINAL-RESULT:END -->

<!-- CORE-LOG-DRIFT-CORRECTION:START -->
## Production Core log-drift correction — prepared only

[Current permission review and execution plan](production-core-log-drift-permission-correction.md): proposes only logs:DescribeIndexPolicies on Resource star, restricted to eu-north-1, in the Core execution identity/boundary. Account/region-wide index-policy metadata visibility is explicit and requires fresh acceptance. Security remains UPDATE_COMPLETE and product IMPORT_COMPLETE with Logs only; no AWS writes or drift retry during this review. Actual IN_SYNC must pass before the unchanged six-addition product update. Team remains unauthorized.
<!-- CORE-LOG-DRIFT-CORRECTION:END -->

<!-- PRODUCTION-CORE-RECOVERY-RESULT:START -->
## Production Core recovery — stopped at imported-log drift gate

[Actual execution result](team-hub-production-core-kms-recovery-result.md): pinned Core security UPDATE_COMPLETE and 56 actual-role IAM checks passed; failed product stack record deleted with Logs retained; one-resource import IMPORT_COMPLETE. Mandatory Logs drift returned UNKNOWN because logs:DescribeIndexPolicies was denied. Product update/Lambda creation/live Core acceptance were not started. Sources, backups/protections, Cognito, Master and protected domains remain preserved. Separate permission review and fresh authorization are required; Team remains unauthorized.
<!-- PRODUCTION-CORE-RECOVERY-RESULT:END -->

<!-- PRODUCTION-KMS-RECOVERY-CURRENT:START -->
## Production KMS recovery — proposed, not deployed

[Recovery review, exact candidates and authorization gates](team-hub-production-kms-recovery-readiness.md): service-mediated CreateGrant correction for Core/Team execution roles, with existing runtime/security isolation preserved. Core security remains CREATE_COMPLETE; product remains ROLLBACK_COMPLETE with retained Logs. Proposed recovery retains/imports that group before adding six product resources. No AWS writes this task. Fresh approval must explicitly cover new security bytes, failed-stack-record deletion, retained-log import and product update; old approval is insufficient. Earlier deployment proposals below remain historical.
<!-- PRODUCTION-KMS-RECOVERY-CURRENT:END -->

<!-- PRODUCTION-DARK-RESULT-CURRENT:START -->
## Production dark deployment blocked ? current

**Core security CREATE_COMPLETE (6 resources); Core product ROLLBACK_COMPLETE.** Lambda creation required kms:CreateGrant on the AWS-managed Lambda key, explicitly denied by the reviewed execution identity. [Actual result, CloudTrail and recovery](team-hub-production-dark-deployment-result.md) supersede the preparation-only READY verdict below. Team stacks were not started. The retained Core log group and failed stack record remain; no automatic cleanup/retry or IAM broadening. Post-stop verification preserves all 121 records, four backups/protections, Cognito, Master and existing/Ntgre stacks. No authority row, migration, source fence or frontend publication. A separate narrow security/lifecycle correction review and new execution authorization are required.
<!-- PRODUCTION-DARK-RESULT-CURRENT:END -->

<!-- PRODUCTION-DOMAIN-READINESS-CURRENT:START -->
## Production Core / Team Hub candidate — current

**PRODUCTION CORE/TEAM HUB READY FOR DEPLOYMENT REVIEW.** [Readiness, exact hashes and live gates](team-hub-production-migration-readiness.md) · [ordered runbook](team-hub-production-migration-runbook.md). Four production-bound roots propose 60 additions (Core 6 security +7 product; Team 8 security +39 product), no Legacy additions. Existing production Cognito is preserved. IAM/artifact/CORS bindings, isolated runtime tests, accounting/build/security checks passed. R1/R2 remain accepted. This preparation made zero AWS writes: no publication/change sets/deployment/authority/Master changes. Separate production authorization and Core-before-Team live acceptance are required; conditional authority initialization and later stateful cutover remain separate gates. Earlier entries below are historical.
<!-- PRODUCTION-DOMAIN-READINESS-CURRENT:END -->

## Production R2 restore verification accepted — 20 October 2026

[Accepted corrected R2 execution](team-hub-production-r2-result.md): existing Team restore reused, remaining three restored, all 121 records/schema/indexes/relationships/transform/encrypted evidence verified. Four owned recovery tables deleted and independently confirmed absent. Original sources, PITR/deletion protection, four backups, Cognito/Master/protected baselines preserved. Next: separate production Core/Team candidate binding and deployment review. Earlier blocked states are historical; no domain, authority or public release is authorized.

## Production R2 blocked — one owned recovery table retained

[Actual R2 stop and corrected resumption review](team-hub-production-r2-result.md): one Team backup restored and its one record/schema/encrypted evidence verified; other three restores never started. Runner stopped on the pinned 33-character STS name and observed disappearing RestoreSummary. The one exact owned ACTIVE recovery table remains; do not rerun the original executor, retry the restore or use parent credentials for cleanup. Sources/protections/four backups/Cognito/Master preserved. Corrected immutable resumption and additional cleanup-only session require a narrow explicit amendment. No domain deployment, authority or publication authorization.

## Production R2 prepared — awaiting authorization

[Exact R2 result and approval scope](team-hub-production-r2-result.md): four retained backups and source protections freshly verified; four reserved restore names absent; restricted per-pair session policies and owner-encrypted custody prepared. No R2 AWS writes or live restore acceptance. R1 remains accepted; do not repeat it.

## Production R1 accepted — 20 October 2026

[Production R1 result](team-hub-production-r1-result.md): four PITR enables, four deletion-protection enables and four named backups completed and independently verified. All 121 source records preserved; Cognito and Master unchanged. Next: separately reviewed R2 isolated restore proof. No production domain deployment or authority/publication change. Earlier production preparation entries are historical.

### Production preparation — 20 October 2026

Production recovery protection is prepared for separate execution review. Existing production users and 121 source records were inspected read-only; no production AWS writes, authority switch, Master merge or publication occurred. [Current production readiness](team-hub-production-migration-readiness.md) and [runbook](team-hub-production-migration-runbook.md) distinguish the R1 protection package from draft infrastructure and later live restore/cutover gates. Accepted Ntgre 5/5 remains a separate environment.

 Project Respawn Phase 2 migration — START HERE

## Ntgre cutover accepted — 14 October 2026

Actual authority **TARGET_WRITER epoch/version 5/5**. Legacy fences remain installed; Ntgre localhost epoch-5 frontend and five-persona business/browser acceptance passed, followed by full continuous observation and API-only fixture cleanup. Protected counts remain Legacy 2,621/167, Team 48+7, Core 8+5, Tournament 11. [Authoritative result](team-hub-2b6-final-preflight-cutover-result-2026-10-14.md). Earlier snapshots below are historical. No Master publication or Legacy retirement; post-write rollback requires target containment and state reconciliation, never frontend-only source reopening.

## Controlled Ntgre cutover in progress — 14 October 2026

Fresh preflight, five distinct Cognito/Core persona receipts and attended 150-minute window passed. Actual authority is FROZEN 4/4; four table fences, logo-prefix deny and two gateway mappings are installed. Twelve original AppSync and thirty-five direct/operator denials passed. TARGET and frontend activation remain held pending drain/reconciliation and live business acceptance. Evidence: [current execution](team-hub-cursor-accepted-cutover-evidence-2026-10-14/window.json). No Master publication or Legacy retirement. Older authority snapshots below are historical.

## Cursor correction deployed and dark runtime accepted ? current

[Actual deployment result](team-hub-2b6-cursor-runtime-deployment-result.md): exact security 5cf68f36b3e4e3f95ba8a3cb1444eacc82e382ae214e0cee58d5382409974c23 (three modifications) and product caa0a68384990438196ed7720f1a24062641e03220f6092c1b4a2340d2417241 (Read Code only) reached UPDATE_COMPLETE with rollback enabled. Read ZIP ab6edf023d4091f87c56de7f4d5520cda580630d5e147e9c49c0a09a135c571e; Command remains da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e. Both functions healthy/IN_SYNC, complete environments and runtime IAM preserved. Authority 200 at LEGACY_WRITER 3/3; sixteen routes denied for both personas (32/32), 34 handler receipts correlated, zero errors/throttles/5xx, six alarms OK. Actual downloaded ZIPs passed 41 business scenarios plus 23 extra offline checks. Source/target business state unchanged, Legacy frontend active, protected counts preserved. No FROZEN/target/frontend/production/retirement. Future maintenance must use the new accepted deployment baseline; earlier blocked/offline-only snapshots below are historical.

## Cursor IAM quotas resolved offline ? deployment review ready

[Quota correction and exact security pin](team-hub-2b6-cursor-iam-quota-correction.md): execution inline 10,166 / 10,240 and boundary 5,992 / 6,144; equivalent intended permissions proven, 503 IAM rows and zero Analyzer findings. Security SHA 5cf68f36b3e4e3f95ba8a3cb1444eacc82e382ae214e0cee58d5382409974c23. Read ZIP ab6edf023d4091f87c56de7f4d5520cda580630d5e147e9c49c0a09a135c571e and product caa0a68384990438196ed7720f1a24062641e03220f6092c1b4a2340d2417241 are unchanged. No AWS writes. Separately authorize and inspect security-first/product-second dark deployment; require live acceptance at LEGACY_WRITER 3/3 before maintenance. Existing approvals and epoch-5 frontend/rollback pins remain preserved. Earlier oversized-candidate entries below are historical.

## Cursor runtime corrected offline ? deployment security blocked

[Cursor correction and final pins](team-hub-2b6-cursor-runtime-correction.md): all four routed reads pass; LIST_MY_TEAMS now uses the accepted lazy cursor loader with a bounded secret request. Runtime IAM unchanged; fresh protected state remains LEGACY_WRITER 3/3. Proposed exact artifact bindings exceed execution boundary (6,273 / 6,144) and inline-role (10,394 / 10,240) quotas. Do not deploy this security candidate or resume FROZEN. Resolve policy representation, separately authorize the final dark Read deployment, and complete live acceptance first. Existing approvals, S3 evidence and epoch-5 frontend/rollback bytes remain preserved.

## Final resumption blocked before FROZEN ? current

[Final controlled-cutover result](team-hub-2b6-final-controlled-cutover-result.md): fresh preflight passed at LEGACY_WRITER 3/3, but exact pinned business-router verification reproduced GET /v1/teams HTTP 503 because LIST_MY_TEAMS never loads required cursor-signing material. Offline proof only; no AWS writes or authority/frontend change. Prepare and separately review a minimal runtime correction before resuming maintenance. Preserve accepted approvals, multipart evidence and historical pins.

## Owned multipart diagnostic accepted ? current

[Actual result](team-hub-2b6-multipart-diagnostic-result.md): amendment accepted for candidate 58a168cf2f4e370e7b5ceb7044c6e957bd30085212efcac179caecc45b11f895; exactly two owned zero-part uploads created and terminally aborted. RavenTest received actual explicit resource-policy Abort AccessDenied on the known second upload (FMNH2DH4K7JDGHG5). Exact source policy restored; zero logo objects/pending uploads. Audit correlation **5/5 data + 2/2 management** complete. IDs protected privately, public fingerprints only. Authority remains **LEGACY_WRITER 3/3**, sixteen business routes denied; protected counts/code/IAM/D1 unchanged. Corrected maintenance manifest e3e5f5d7877830cfaa258e135beca78d369da337fdc88b44f8560d3d599dbbac prepares 4/4 -> 5/5 and epoch-5 local frontend. No full maintenance, frontend/production change or retirement. Amendment need not be requested again; require separate resumption direction and fresh attended window/live gates. Older blocked/amendment-pending entries below are historical.

## Post-abort corrections prepared ? current

[Reviewed preparation](team-hub-2b6-post-abort-correction-readiness.md) verifies recovered **LEGACY_WRITER 3/3**, restored source policies/gateways, empty business state, healthy auditing, protected counts/config/IAM and sixteen denied target routes. New candidate **58a168cf2f4e370e7b5ceb7044c6e957bd30085212efcac179caecc45b11f895** proposes a separately authorized, owned zero-part source-key multipart lifecycle before maintenance, plus monotonic 3/3 -> FROZEN 4/4 -> TARGET 5/5 and epoch-5 frontend activation. Exact accepted rollback bytes reused. Existing pins/approvals preserved; a narrow amendment is required for multipart state/proof timing and new release pins. No AWS writes or activation in preparation. After amendment and diagnostic cleanup/audit correlation, retain the 150-minute maintenance sequence and all live gates. Earlier 1/2/3 execution entries are historical and must not be rerun.

## Resumed maintenance aborted and recovered ? current

[Actual execution and recovery](team-hub-2b6-resumed-controlled-cutover-result.md): conditional FROZEN 2/2, all seven source fence/gateway changes and all twelve original generated proofs succeeded. Thirty-one operator denials passed; AbortMultipartUpload on the nonexistent diagnostic ID returned 404 NoSuchUpload (2YAMA4GF3MQJHB6H), failing the mandatory proof. Pre-write recovery restored exact source policies/gateways and **LEGACY_WRITER epoch/version 3/3**. Source and target business state unchanged; authenticated authority 200 and all sixteen target routes 403 after recovery. Protected counts/code/IAM/D1 preserved. No TARGET, independent frontend activation, production change or retirement. Next attempt needs corrected multipart diagnostic and reviewed FROZEN 4/4 -> TARGET 5/5 epoch/frontend bindings; preserve old pins and approvals. Earlier 1/1 readiness snapshots below are historical, not current authority.

## Generated-delete proof corrected ? execution review pending

[Correction and exact supplemental pin](team-hub-2b6-generated-delete-proof-correction.md) explain documented AppSync absent-delete condition reconciliation. Installed pipelines map to guarded DeleteItem; eight read-only mapping evaluations, twelve actual-role IAM cases, four Analyzer validations and sixteen focused tests pass. Candidate SHA cd335b6f16a422715388d31e30ffe54798be5fe45698754e96f13ed0a93ab351. All existing pins and approvals remain unchanged. Before-fence null is not standalone write proof; after-fence exact original-role/table DeleteItem resource-policy AccessDenied remains mandatory. No AWS mutation or authority/frontend change. Review the new verification candidate before resuming maintenance.

## Controlled cutover stopped before FROZEN ? current

[Actual result](team-hub-2b6-controlled-cutover-result.md): approvals/attendance remain recorded; Admin and ordinary authentication, authority 200, sixteen route denials, protected preflight and 32 operator controls passed. The pinned generated deleteTeam pre-control returned null without the required underlying conditional failure (request 29a7a14d-2a8d-4d89-98ee-82fcb7aa30c9). Stop before FROZEN; prepare/review a service-reaching deletion proof, without changing accepted pins or silently extending the shared/cleanup alternative criterion. Source/target business state remains empty and authority LEGACY_WRITER 1/1. No source fence, independent frontend activation or production change. Earlier pending-Admin/approval entries are historical.

## Explicit approvals recorded ? current execution gate

The user explicitly approved both security-owner and maintenance-operator statements and confirmed 150-minute attendance, monitoring/recovery custody and rollback availability. [Approval receipt](team-hub-maintenance-authorization-evidence-2026-10-13/authorization-approvals.json) records actual receipt time without inventing a user-message signature timestamp. [Fresh preflight](team-hub-controlled-cutover-preflight-evidence-2026-10-13/current-result.json) confirms protected counts/configurations, empty business state, LEGACY_WRITER 1/1, exact package/frontend hashes and active S3 audit. Existing ordinary session was verified through Core; Admin session was unavailable. Pending normal Admin sign-in and authenticated acceptance readiness; no maintenance window started, AWS resource write, FROZEN, target transfer or frontend activation occurred. Older pending-approval statements below are historical.

## Original-principal security decision ? current

**TEAM HUB READY FOR CONTROLLED MAINTENANCE AUTHORIZATION**, conditional on explicit named security-owner acceptance of the original-role alternative proof criterion and real-cutover logical quarantine. [Decision, exact authorization and residual risks](team-hub-2b6-original-principal-security-decision.md) supersede earlier unresolved preparation verdicts below; historical evidence remains preserved. Fresh original-role/bucket grants are unchanged; 12 identity controls and four Access Analyzer validations completed. These are not live installed-fence proof.

Reject both same-role helpers and destructive cleanup. Preserve actual AppSync/operator live proof during separately authorized FROZEN; shared/cleanup direct service-role receipts remain explicitly unavailable. Unknown late objects remain non-authoritative and preserved; branding stays disabled, audit/reconciliation continues and no universal physical revocation is claimed. No AWS writes, authority change, frontend switch or retirement occurred in this review. Security decision and maintenance approval are not yet granted.

## Isolated S3 verification accepted — 13 October (current)

**S3 ISOLATED VERIFICATION ACCEPTED — READY FOR ORIGINAL-PRINCIPAL CUTOVER SECURITY REVIEW.** [Authoritative execution result](team-hub-2b6-isolated-s3-verification-result.md) records 3/2/2 deployment, 21 actual-role/caller checks, 3/3 canary and 4/4 race-event correlation, four-resource/artifact cleanup and final preservation. Both isolated URL/stream controls returned 403; synthetic injection is explicitly not measured late completion. Three private audit resources retained under Ntgre custody for at least 90 days.

Real LEGACY_WRITER epoch/version 1/1, empty business state, source fence absent and frontend Legacy remain unchanged. Canonical domain counts remain Legacy 2,621/167, Team 48+7, Core 8+5, Tournament 11; retained auxiliary audit +3 is separately accounted. No FROZEN/TARGET/frontend/production/retirement change. Original shared/cleanup-principal proof and a real-cutover residual-risk/criterion decision remain separately required. Earlier preparation/blocked entries below are historical.


Final two-blocker review (13 October): original cleanup helper is NOT approved: its actual bucket resource policy grants PutBucketPolicy despite identity-only implicit denial. Shared-role reuse also exposes existing foreign secret/KMS grants. Restricted two-resource alternative is prepared, not deployed, and not original-principal proof. Strict single-part upload quiescence remains unproven; logical quarantine requires an explicit residual-risk decision. See [current engineering verdict](team-hub-2b6-final-cutover-execution-readiness.md#current-two-blocker-engineering-verdict--13-october-2026). No AWS writes or authority/frontend changes.


13 October priority review: live protected/runtime/IAM/data/protection refresh completed without resource writes; 61 preparation tests and 11 package hashes passed. Upload quiescence and same-role helper review remain prerequisites. Ntgre-local frontend pins do not authorize Master publication. See [final execution readiness](team-hub-2b6-final-cutover-execution-readiness.md).


**Quota-corrected isolated AWS verification (12 October 2026): ACCEPTED — READY FOR FINAL CUTOVER REVIEW.** 48/48 real isolated DynamoDB scenarios and nine actual-Read-role cursor checks passed; CloudTrail retrieval/decryption, native metrics, cleanup and final preservation verified. Four temporary resources and exact artifact removed. Real LEGACY_WRITER epoch/version 1, empty permanent business state, permanent IAM/code, Legacy frontend and protected domains preserved. No cutover or retirement. [Authoritative result and evidence](team-hub-2b6-quota-corrected-isolated-aws-verification-result.md). Earlier entries are historical.


Current follow-up: frontend/probe/acceptance/monitoring packets are prepared and pinned. Final maintenance remains BLOCKED on reviewed source S3 in-flight upload quiescence and explicit security-owner approval of the proposed two-function same-role helper lifecycle. See the [consolidated preparation report](team-hub-2b6-final-maintenance-preparation.md). No AWS writes or activation; Master is eventual production intent only.

Authoritative migration entrypoint, consolidated 12 October 2026. **One website, one shared login per environment, independently deployable product domains.** Read this file, [current status](domain-migration-status.json), [ownership ledger summary](legacy-resource-ownership-summary.md) and [M0–M8 template](domain-migration-template.md) before migration work. Standards are requirements, not AWS authorization.

This checkpoint uses accepted repository evidence, including the [12 October Team Hub recovery](team-hub-2b6-describekey-recovery-result.md); it performs no fresh AWS verification or writes. Previous chronology is preserved in the [historical control record](phase2-migration-control-history-2026-10-12.md). Historical failed policies and superseded candidates are not deployment instructions.

## Why separate domains

LegacyPlatform couples product schema, handlers, IAM and release risk in a large Amplify Gen 2 hierarchy. Independent domains provide bounded ownership, permission scope, deployment/rollback and growth budgets. This does not promise lower costs or remove Legacy resources automatically. A nested stack or backend.createStack() remains part of its parent deployment; justified domains use sibling CloudFormation roots with their own app, dependency closure and artifacts. Do not create a root for every page or small feature.

## Permanent architecture requirements

- **Identity/Core:** keep the existing same-environment Cognito pool and stable issuer/subject identity. The accepted independent Core contract runtime supplies global authorization and bounded directory contracts; Cognito ownership remains protected in Legacy. No per-domain pool, product Cognito administration or localhost-to-production switch.
- **Domain API/data:** each domain owns its API, authorization and business state. Use versioned owner contracts rather than foreign database access. Deployment of a new table/API does not transfer business authority. Record exactly one authoritative writer.
- **Independent roots:** isolated app/synthesis, immutable template/runtime/configuration manifest, explicit account/region/root selector and prior compatible rollback artifacts. Do not synthesize unrelated domains or Legacy by default. Hosted pipeline isolation must be proven separately from local selection.
- **Frontend:** lazy major layouts/pages and clients; shared shell/login stay global. Consume accepted endpoint manifests and a token-provider callback. Preserve URLs, privacy and account switching; prove import, initialization and network isolation. Publishing a manifest is not live frontend activation. Keep genuine amplify_outputs.json for Legacy.
- **IAM:** security operator, restricted deployment caller, CloudFormation execution role and product runtime have distinct jobs. Review identity policies, boundaries, trust, PassRole, resource/key policies and organization limitations. Exact artifact binding and cross-domain negatives are mandatory. No administrator shortcut.
- **State/authority:** source protections, restore/reconciliation, current membership, revision/idempotency/audit and transactional authority/epoch enforcement precede cutover. Frontend status is never a mutation security boundary. Empty-source migrations still require exact counts, writer coverage and recovery proof.
- **Evidence:** separate prepared, deployed, offline/simulated and live-accepted states. UPDATE_COMPLETE is not runtime acceptance. Read complete actual configuration and compare to the declared template, code hashes, identities, drift where supported, endpoints and telemetry.

Required companions: [architecture standard](project-respawn-domain-architecture-standard.md), [new-domain checklist](new-domain-checklist.md), [deployment acceptance/security](project-respawn-aws-deployment-acceptance-standard.md), [runtime/deployment separation](domain-deployment-runtime-security.md), [restricted callers](independent-domain-deployment-callers.md), [selection rules](domain-deployment-selection.md), [data ownership](data-ownership.md), [resource budgets](cloudformation-boundaries.md).

## Current accepted state

Ntgre account 058264289478, eu-north-1. Counts below are accepted evidence, not a new cloud scan. Production migration is not implied.

| Domain | Deployed independent infrastructure | Business-data authority / frontend | Remaining gate |
| --- | --- | --- | --- |
| Shared Core | 8 product + 5 security; accepted authorization/directory contracts | Existing Cognito preserved; no general Core state migration | Preserve bounded contracts and consumer isolation |
| Tournament | 11 resources, API msipnwy39j; Release 1 authenticated preview accepted | Stateless proof; no business-data or frontend cutover | Separately authorize Release 2 and restore-to-Release-1 proof |
| Team Hub | 48 product + 7 security, API t54b88casf; accepted cursor-corrected business runtime | TARGET_WRITER epoch/version 5/5; epoch-5 Ntgre localhost frontend active; Legacy fences retained | Separate Master/production release review; Legacy retirement not authorized |
| Creator | No accepted independent extraction; Legacy/external runtimes remain | Legacy/external ownership retained | Paused; resume M0 ownership/dependency evidence only when authorized |
| Commerce | No extracted root/API accepted | Legacy authoritative; no cutover | Inventory payment/provider/idempotency and recovery risks |
| Community/Events | No extracted root/API accepted | Legacy authoritative; no cutover | Ownership, moderation and reader/writer contracts |
| Applications/Intake | No extracted root/API accepted | Legacy authoritative; no cutover | Privacy, intake lifecycle and real/demo scope |
| Investor Access | No extracted root/API accepted | Legacy authoritative; no cutover | Revocation, NDA/private documents and identity dependencies |

Core: [accepted release](core-release1-acceptance.md). Tournament: [accepted release](phase2a-tournament-runtime-kms-release1-acceptance-2026-10-04.md). Team Hub: [current acceptance](team-hub-2b6-acceptance.md), [runbook](team-hub-2b6-cutover-runbook.md), [recovery evidence](team-hub-describekey-execution-evidence-2026-10-12/accepted.json).

### Accepted Team Hub recovery and remaining dependencies

Both Lambda environments match CloudFormation, Active/Successful and function drift IN_SYNC; runtime ZIPs and permanent IAM unchanged. Authority returns HTTP 200; all 16 normal business routes return 403. Live KMS DescribeKey/Encrypt/Decrypt succeeded; temporary role/workflow removed. No business records changed, frontend cutover, source fence, authority transition or Legacy retirement. The 222 certification/82 installed-role counts are specific to this package, not universal domain requirements. Company SCP visibility remains a documented, explicitly waived limitation; successful recovery is not a complete organization-policy audit.

Accepted: 48 isolated real AWS transaction scenarios and nine Read-role cursor checks. Next: close the exact fence-probe and frontend-release preparation gaps in the current cutover runbook. Finish safe runtime/frontend/rollback proof **before** freezing Legacy. Prepare a dormant source fence without denying current writes; reserve installed live denial proof for separately authorized FROZEN maintenance. Source-fence activation, reconciled target authority and frontend publication are distinct gates. Never replay the consumed recovery workflow or restore known-unhealthy environment maps.

## Repeatable migration workflow

1. Classify the domain/module and owner; inventory Legacy/external consumers and unresolved shared resources (M0).
2. Define Core contracts, API/data/authorization/privacy and independent-root boundaries (M1).
3. Build the isolated foundation and least-privilege caller/execution/runtime models; pin artifacts and rollback inputs (M2).
4. Separately review and deploy a dark stateless/read path; inspect actual AWS changes and prove live isolation (M3).
5. Prepare owned state, source protection, exact inventory, export/transform/reconciliation and isolated restore (M4).
6. Prove real business runtime, transactional epochs, membership, revisions and idempotency; prepare dormant writer fences and frontend isolation (M5).
7. Conduct separately authorized freeze/fence proof, final reconciliation, single-writer transfer and frontend activation with abort monitoring (M6).
8. Observe and reconcile; prove independent update and compatible code/state rollback (M7; explicitly approved stateless reordering is allowed).
9. Review Legacy consumers and exact retirement effects; remove nothing without separate authorization, then recount (M8).

Every gate uses the [required evidence worksheet](domain-migration-template.md) and [deployment lifecycle safeguards](project-respawn-aws-deployment-acceptance-standard.md). Failure stops the affected gate; independent authorized offline work may continue. No speculative permission patch or ambiguous workflow retry.

## Reusable automation

[Shared deterministic checks](../../scripts/migration/deployment-checks.mjs) validate hashes, full environment recovery, domain-defined IAM coverage and deployment acceptance. [Shared IAM scheduler entrypoint](../../scripts/migration/iam-validation.mjs) reuses the accepted rate-limited harness without changing pinned Team scripts. [Tooling guide](migration-tooling.md) defines inputs, limitations and offline commands. Domain-specific AWS adapters, expected permission cases and live evidence remain required; these helpers do not deploy or grant permissions.

## Legacy ownership and accounting

Accepted Legacy baseline: **2,621 declarations / FunctionDirectiveStack 167**, one root plus 61 nested stacks. [Complete ledger](legacy-resource-ownership.json): **2,430 assigned, 191 unresolved shared, 0 unassigned**, 100% inventory and 92.71% ownership resolution. Stateful/protected dimensions overlap (61/62). No migrated or retired Legacy rows are inferred from independent deployment.

The 191 mixed shared providers, APIs/handlers, IAM and storage declarations need exact consumer, lifecycle, key and ownership evidence. Do not delete or guess these rows. The Ntgre recursive ledger does not establish full-account/external or production coverage. Run node scripts/migration/ledger.mjs check; update rows only with accepted ownership/transfer evidence, retaining unresolved entries and recovery records.

## Migration completion and retirement of this control document

**THE PHASE 2 MIGRATION README MAY NOT BE REMOVED UNTIL ALL TEN CONDITIONS PASS:**

1. The ledger reconciles to the accepted/live Legacy total.
2. UNASSIGNED = 0.
3. UNRESOLVED_SHARED = 0.
4. Every resource has exactly one authoritative future owner or approved retirement disposition.
5. Every independent target domain has independent synthesis/deployment, shared Cognito acceptance, runtime isolation and update/rollback proof.
6. Every stateful migration has reconciliation, backup/restore evidence and accepted writer authority.
7. Every retirement candidate has separate deletion authorization.
8. The Legacy retirement/remainder architecture has been reviewed.
9. A full-account resource inventory confirms no forgotten Legacy-owned resources outside this ledger.
10. Production migration has separate approval/evidence.

Even then, **explicit human authorization is required to archive/retire this README**. Never automatically delete it. Today conditions 3–10 are not established; complete inventory alone does not satisfy this gate.

## INSTRUCTIONS FOR CODEX / FUTURE AUTOMATION

1. READ THIS DOCUMENT FIRST.
2. Read `domain-migration-status.json`.
3. Read `legacy-resource-ownership-summary.md`.
4. Identify the CURRENT domain and migration phase.
5. Use `domain-migration-template.md`.
6. Do not skip migration stages without explicit authorization.
7. Do not deploy another domain accidentally.
8. Do not synthesize LegacyPlatform during independent-domain work unless explicitly required.
9. Do not modify Tournament/Team Hub while working on another domain.
10. Do not delete Legacy resources because equivalent new resources exist.
11. Update the ownership ledger/status after every accepted migration milestone.
12. Never change production without separate explicit authorization.
13. Stop on unexpected CloudFormation changes.
14. Preserve rollback artifacts.
15. Fail closed when domain selection is ambiguous.
16. Never assume approximate DynamoDB count zero means empty.
17. Never expose secrets/tokens in evidence.
18. Keep runtime and deployment IAM separate.
19. Use shared Cognito rather than product-specific identity.
20. Before finishing any task, state: **current domain; phase; AWS changes; Legacy changes; production changes; ledger changes; next gate**.

## Navigation and retention

[Migration stages/template](domain-migration-template.md) · [status JSON](domain-migration-status.json) · [ownership summary](legacy-resource-ownership-summary.md) · [roadmap](domain-migration-roadmap.md) · [documentation index](phase2-documentation-index.md) · [retention review](../maintenance/phase2-document-retention.md).

Existing paths are retained to preserve evidence hashes and links. Unknown or superseded evidence is labeled, not silently deleted. Historical commands, expired authorizations and failed policy candidates are never current execution authority. Use the accepted manifests and a fresh authorized gate for later AWS work.
