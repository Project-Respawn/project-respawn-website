# Project Respawn Phase 2 migration — START HERE

## Final production release prerequisite package — 24 October 2026

[Current final-release readiness](team-hub-production-final-release-readiness.md) binds the next cursor/R3 execution package `a76e562196597cb3edcacd6027f2360a35dfb07c1872f4af832d55ad3bc4955c`. Preparation and read-only validation only: 68 installed-role controls, four Analyzer documents, nine offline cursor checks and 83 scoped regression/accounting tests passed. Fresh source remains 125 rows, authority LEGACY_WRITER 1/1, target Operational empty. The proposed one temporary cursor Lambda/four retained backups/owner-only encrypted capture requires explicit approval and a fresh 60-minute attended window. Production-specific fences/S3, genuine post-write reverse/reconciliation and five-persona maintenance acceptance remain gates. Legacy cannot enforce new per-member grants; do not treat unchanged-state reversal or frontend rollback as post-write recovery. Master/publication and authority remain unchanged.

## Production dark parity runtime accepted — 24 October 2026

[Actual runtime-update result](team-hub-production-current-data-runtime-result.md): authorized package `49418cbce1980ed0eb0987e94f06a5c81a0e9dac0585f241bd452315b0ab2930` installed exactly four security-policy modifications and one route addition/two Code-only Lambda updates. Both stacks UPDATE_COMPLETE; actual **42 product +8 security**, ZIP `df1e45b1…`, unchanged runtime IAM/environments, **209 actual-role cases passed** and only the two expressly accepted Analyzer catalog findings. Real production authentication proved authority 200 at LEGACY_WRITER 1/1 and all 19 business routes 403. Actual metrics/logs and five alarms passed; temporary auth helper closed. All 125 source rows, four backups/protections, Core/Cognito configuration, Master and protected domains are preserved. Normal localhost remains Ntgre with `respawn.test` personas. Public website remains Legacy. Production cursor proof, current-data recovery/fence/import/reconciliation, compatible post-write recovery, five-persona business acceptance and separately authorized frontend-only publication remain gates. Earlier preparation entries below are historical.

## Current production data migration correction — 24 October 2026

[Current-data migration review](team-hub-production-current-data-migration-review.md): fresh source inventory is 125 rows (1/8/15/101), not the historical 121. The prepared transformer accounts for every row and successfully dry-runs to 120 target records while preserving inactive members' pools and exact unchanged-state recovery. An immutable proposed runtime/product/security correction restores current roster, Pro and role-preference parity before migration. It is not deployed or authorized. Complete security certification, explicit artifact-binding review, installed dark acceptance, production maintenance/reconciliation and separately approved Master publication remain gates. Actual production authority remains LEGACY_WRITER 1/1; public website remains Legacy. No AWS writes during this preparation.

## Team Hub separation — verified layout and instructions

Start with the [Team Hub separation guide](team-hub-separation-guide.md) for the worked example, exact code/configuration locations, repeatable verification commands and ordered procedure for separating other domains. Apply it together with the [domain architecture standard](project-respawn-domain-architecture-standard.md) and [mandatory checklist](new-domain-checklist.md). This is documentation and read-only/offline verification, not a new deployment or cutover authorization.

| Boundary | Current state |
| --- | --- |
| Independent AWS deployment | Team Hub has its own product/security **root stacks**, not nested LegacyPlatform stacks: Ntgre 48+7 and Production 42+8. Existing same-environment Cognito is reused; Core is consumed through its contracts. |
| Frontend loading | Major Team pages and access/service logic use dynamic imports. Fresh hosted-source/Ntgre bundle analysis passed **177** static-closure checks: no eager Team implementation in entry chunks, no unrelated product implementation in Team page closures, and no Team implementation in unrelated product page closures. Shared shell/auth and lightweight route metadata remain allowed. This is not a new authenticated browser receipt. |
| Localhost | Accepted independent Ntgre service selection is restricted to Vite `serve` and validated against the existing Ntgre identity/endpoint/activation manifests. Hosted builds do not inherit that alias. |
| Public Production website | Still Legacy until protected data migration and controlled cutover. The independent production backend is dark, with actual LEGACY_WRITER authority 1/1; do not turn a deployment milestone into a public-live claim. |

The aim for future sections is **frontend loading on demand and independent domain deployment**, with one shared identity authority per environment. AWS stacks are already provisioned; page navigation loads JavaScript and calls the relevant API. A coherent domain may own several pages; do not create one root per page. Record any remaining Legacy state, pipeline or frontend dependency explicitly.

Fresh evidence: [AWS root/API/authority verification](team-hub-separation-verification-2026-10-24/aws.json) and [frontend import-closure verification](team-hub-separation-verification-2026-10-24/frontend.json). See the guide for limitations and rerun instructions. Production authenticated dark acceptance, cursor proof, migration/reconciliation, business transfer and separately approved frontend-only Master release remain open. The dated execution entries below preserve history; later accepted results supersede earlier statuses only within their stated scope.

## Production authority initialized — 24 October 2026

[Actual C1 result](team-hub-production-c1-result.md): one fixed conditional workflow SUCCEEDED; complete strong readback confirms **LEGACY_WRITER epoch/version 1/1**. The two temporary resources were removed and absence verified. Operational is empty; Journal contains only the authority control row. Permanent IAM/runtime, source data/protections/four backups, Core/Cognito, Master and protected domains remain unchanged. Authenticated authority 200 and all **18** business-route denial checks remain pending real production sessions; missing/invalid JWT 401 checks are not substitutes. Next: authenticated dark acceptance and separately authorized isolated cursor proof; nonempty migration, business transfer and public release remain separately gated. Do not rerun initialization. Earlier entries below are historical.


## Production Team Hub dark deployment accepted — 24 October 2026

[Actual recovery result](team-hub-production-stage-tagging-recovery-result.md): the owner explicitly accepted only the two TagResource Analyzer catalog findings and approved package `88039809ac363780db0df392081580b70f58fd023166249693f881f18c59473d`. Exactly two security-policy modifications reached UPDATE_COMPLETE, the verified-empty failed product stack record was removed, and the unchanged 41-addition product reached CREATE_COMPLETE. Installed total **8 security +41 product**, with **199 post-correction actual-role checks** passed. Actual CloudTrail confirms successful original-role CreateStage; both approved ZIPs/environments match and both Lambda initialization probes returned 401 without error. All 19 JWT routes and five alarms match; real native/EMF datapoints are accepted for the dark probes. Both protected tables remain empty and **no production authority record exists**. Final 1/8/15/101 source digests, four backups/protections, Cognito, Core, Master and protected stacks are preserved. Public website remains Legacy. Next: separately reviewed conditional authority bootstrap and authenticated dark/isolated proofs, then nonempty production migration/business acceptance and separate frontend-only Master publication. Earlier blocked/preparation entries below are historical.

## Stage-tagging correction prepared — historical exception-review record

[Narrow recovery review](team-hub-production-stage-tagging-recovery-review.md): the owner approved the described correction. The new proposal changes only execution identity/boundary, adding `apigateway:TagResource` within the existing one-API child scope. All 393 IAM cases and two template validations passed; product/runtime bytes remain unchanged. The actual installed Stage provider and CloudTrail require this action, but Access Analyzer reports exactly two INVALID_ACTION errors, one per changed document. The original zero-error gate has not been waived; require explicit acceptance of only that exception for proposed execution package `88039809ac363780db0df392081580b70f58fd023166249693f881f18c59473d`. No AWS mutation during correction preparation. Existing security remains accepted; product remains ROLLBACK_COMPLETE. Authority, data migration and Master remain separately gated.

## Production permission dark deployment blocked — 24 October 2026

[Actual execution result](team-hub-production-permissions-dark-deployment-result.md): approved package `2df8f08fec949b5b0eadac8fb0a472eea8edcc3f8bb3f3a2671d6afb5fd3909e` published three exact artifacts and installed the eight-resource security stack, with 111 actual-role checks and six installed-policy Analyzer validations passed. The inspected 41-addition product attempt failed on `apigateway:TagResource` for API stages and reached ROLLBACK_COMPLETE. No retry or permission patch. Actual target tables/functions/runtime roles/log groups, API stages/routes and product alarms are absent; security resources remain retained. Post-attempt source digests (1/8/15/101), backups/protections, Cognito, Core IAM/runtime/monitoring, Master and protected stacks are preserved. Require a separately reviewed tagging-lifecycle/failed-stack recovery package before further writes. No authority bootstrap, migration, source fence or frontend publication. [Current production runbook](team-hub-production-migration-runbook.md).

## Production permission release preparation — historical pre-execution record

[Current permission/Master release review](team-hub-production-permissions-release-readiness.md): the owner selected working production permissions before publication. Production Core is healthy; independent production Team Hub stacks are absent. Revised offline permission candidates propose 8 security +41 product resources, with 333 read-only IAM controls, four Access Analyzer checks and two template validations passed. Current source counts are 1 Team, 8 membership, 15 roster/control/archive and 101 pool rows; use current reconciliation, not the historical 121-row assumption. All four backups/protections remain intact. No AWS configuration/data writes, authority transition or Master push. Separate revised dark-deployment approval, production migration/live acceptance and frontend publication remain required. This does not change accepted Ntgre authority or reopen historical failures below.

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
