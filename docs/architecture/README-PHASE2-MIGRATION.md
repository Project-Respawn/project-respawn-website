# PROJECT RESPAWN PHASE 2 MIGRATION — START HERE

**Checkpoint / final execution review (8 October 2026):** accepted endpoint and read-only baselines preserved. Business transactional runtime is NOT deployed; its separately reviewed installation and all safe verification must finish BEFORE Legacy freeze. Source-fence installation/proof, TARGET authority transfer and frontend activation are distinct authorization gates. [Ordered plan, aborts and recovery](team-hub-2b6-checkpoint-cutover-readiness.md).

<!-- TEAM 2B6 START -->
**Latest authority endpoint (8 October 2026): ACCEPTED LIVE ? READY FOR FINAL PRE-CUTOVER REVIEW.** Pinned security/product updates are UPDATE_COMPLETE; Team Hub 42+7. Authenticated GET /v1/authority returns the real LEGACY_WRITER epoch/version 1; dormant live browser binding passes, all 13 business routes remain denied. C2 runtime IAM and D1 monitoring preserved. No authority/frontend/fence/production change. [Deployment and live acceptance](team-hub-authority-endpoint-deployment-result.md). Gate B installed fence and Gate C business transactional epoch proof remain separate; earlier entries below are historical.
<!-- TEAM 2B6 END -->

<!-- TEAM 2B5B START -->
**Current Team Hub 2B5B (7 October 2026): CUTOVER PREPARATION BLOCKED.** Isolated rollback and policy-fence rehearsals passed and all temporary tables were removed. Candidate/frontend/security work is prepared; browser acceptance and execution gates remain open. LEGACY_WRITER, deployed dark runtime and normal-write denial remain unchanged. No business cutover or retirement. [Final preparation report](team-hub-2b5b-final-cutover-readiness.md) ? [2B6 runbook](team-hub-2b6-cutover-runbook.md). Earlier accepted deployment entries remain historical baselines.
<!-- TEAM 2B5B END -->

<!-- TEAM CORE INTEGRATION START -->
**Current Team Hub Core integration (7 October 2026): ACCEPTED — DARK LIVE CORE INTEGRATION.** Both Team runtimes call the accepted Core contracts; 29 live checks and 32 actual-role checks passed. All 13 deployed normal routes deny. Product/security remain 40+7, UPDATE_COMPLETE. LEGACY_WRITER / PRE_CUTOVER retained; normal writes and frontend cutover disabled. [Integration report](team-hub-2b5a2-live-core-integration.md). Earlier Team entries below are historical.
<!-- TEAM CORE INTEGRATION END -->

<!-- CORE LIVE START -->
**Current Core Release 1 (6 October 2026): INDEPENDENT_CONTRACT_RELEASE_1_ACCEPTED.** Existing 8 product +5 security resources; ordinary/admin contracts, required cursors and privacy accepted; manifest generated and validated. No redeployment or IAM/user changes during final acceptance. Team remains PRE_CUTOVER / LEGACY_WRITER. [Acceptance report](core-release1-acceptance.md). Earlier Core entries below are historical.
<!-- CORE LIVE END -->



**Current Core artifact-security gate (6 October 2026): READY FOR DEPLOYMENT REVIEW — NOT DEPLOYED.** Six exact artifact references corrected; product/runtime unchanged; 8+5 resources; quota 10/10, reservation NONE. Zero AWS changes. [Authoritative report](core-template-security-correction.md). Earlier Core gate entries below are historical.

**Latest Core quota correction (6 October 2026): PRODUCT CORRECTED; SECURITY ARTIFACT REBIND REVIEW REQUIRED.** Ntgre reserved concurrency removed; runtime/security unchanged, 8+5 resources. The old exact template URL/object permissions deny the new product. No AWS or quota changes. [Current readiness](core-first-deployment-readiness.md).

**Latest Core Release 1 result (6 October 2026): PREFLIGHT BLOCKED — NOTHING DEPLOYED.** Logging discrepancy classified through unconditional simulator controls. Account Lambda concurrency is 10; the pinned reservation of 5 cannot retain AWS’s required 100 unreserved. No artifact publication, security/product change set, quota change or Team integration. [Release result](core-release1-acceptance.md).

**Latest 2B5A result (6 October 2026): CORE CANDIDATE READY FOR AWS REVIEW — NOT DEPLOYED.** Independent Core contracts, eight product/five security resources, fresh protected baseline and policy review prepared. No AWS changes, Team authority switch or frontend cutover. [Core readiness](core-first-deployment-readiness.md). Next: CORE FIRST DEPLOYMENT REVIEW.

**Latest 2B5 result (6 October 2026): OFFLINE CUTOVER PREPARATION — BLOCKED.** Core contracts, ordinary-authority runtime, policy fences and dormant client candidates are prepared/tested. Core deployment security/live acceptance, full Vue/shell integration, installed fence proof and live rollback rehearsal remain open. No AWS calls, authority switch or frontend cutover. [2B5 dependency review](team-hub-2b5-cutover-dependency-review.md).

**Latest 2B4B result (6 October 2026): SYNTHETIC MUTATION PARITY VERIFIED.** All nine commands and 41 live sequence checks passed. Verification explicitly disabled; Operational 0, Journal 15 retained synthetic audits. Legacy remains LEGACY_WRITER; no ordinary-user or frontend cutover. [2B4B report](team-hub-2b4b-synthetic-mutation-verification.md). Next: Team Hub 2B5 Core contracts / writer-fence and cutover preparation.

**Latest 2B4A result (6 October 2026): DARK MUTATION INFRASTRUCTURE DEPLOYED.** Team Hub has 40 product +7 security resources; API t54b88casf unchanged. Nine commands and four reads deny authenticated requests with verification DISABLED. Legacy remains LEGACY_WRITER; both target tables remain empty. No synthetic verification, frontend cutover or retirement. [2B4A report](team-hub-2b4a-dark-mutation-runtime.md). Next: separately authorized 2B4B synthetic verification review.

**Latest Gate 3 result (5 October 2026): DARK TARGET CREATED.** Team Hub now has two empty, protected, non-authoritative tables; 13 product +5 security resources. Legacy remains authoritative; no copy, fence, frontend cutover or retirement. [Gate 3 report](team-hub-2b3-gate3-dark-target.md). Next: Phase 2B4 mutation parity / writer-fence preparation. Earlier preparation statements below are historical.

**Latest 2B4 preparation (6 October 2026):** Nine core mutations and restricted verification infrastructure prepared offline; three branding commands deferred. No deployment, test records or authority switch. Live remains 13 product +5 security; proposed 40+7 is uninstalled. [2B4 readiness](team-hub-2b4-mutation-parity-readiness.md). Next: live mutation-parity deployment review.

**TEMPORARY CONTROL DOCUMENT**

**DO NOT REMOVE UNTIL LEGACY RESOURCE OWNERSHIP = 100% RESOLVED**

This is the required starting point for Phase 2 architecture/migration work until LegacyPlatform decomposition is complete. Read the [machine-readable domain status](domain-migration-status.json), [ownership summary](legacy-resource-ownership-summary.md), then the [required migration template](domain-migration-template.md). The initial repository checkpoint made no AWS calls. The current Team Hub M4 task performed separately authorized, scoped read-only AWS inventory on 5 October 2026; no deployment, data migration or production changes occurred. See the [M4 inventory](team-hub-2b3-state-inventory.md) and [final preparation gate](team-hub-2b3-dark-target-readiness.md).

## CURRENT OBJECTIVE

Decompose LegacyPlatform into independently deployable product domains. The target is **ONE PROJECT RESPAWN WEBSITE · ONE SHARED LOGIN · MULTIPLE INDEPENDENT PRODUCT DOMAINS**. Existing website shell/navigation remain shared; extraction does not mean rebuilding the website as separate websites.

Creator implementation/planning is paused for this maintenance checkpoint. Do not infer authorization to start it from its presence in the roadmap. The accepted Team Hub read proof is complete; its business state and frontend still use LegacyPlatform.

## Required standards

- **Identity:** existing Cognito remains Shared/Core in the same environment. Domains consume that identity; do not create per-domain pools, migrate local users or repoint localhost to production.
- **Domain ownership:** substantial independent domains own their frontend boundary, lazy routes, API/client, business logic, business data, runtime IAM, sibling CloudFormation/CDK root, deployment lifecycle, rollback, endpoint manifest and observability. A nested stack is not an independent deployment unit. No root per small feature.
- **Data:** normal cross-domain direct database access is prohibited. Use versioned owner contracts/APIs. Keep current writer authority explicit until separately accepted reconciliation/cutover; equivalent new resources do not transfer authority.
- **Deployment:** operator → restricted domain deployment caller → domain CloudFormation execution role → domain resources. Runtime role stays separate and strict. A policy without an attached, bounded caller is not a deployment workflow. [Proven caller pattern](independent-domain-deployment-callers.md).
- **First API creation:** reviewed temporary first-create authority → protect every existing API → create the domain API → verify ownership/tags and actual ID → install exact-ID steady-state identity and boundary → deny CreateApi and other APIs → remove effective temporary authority. Preserve adequate expiry margin for rollback/lockdown. Team Hub used at least six hours.
- **KMS:** do not use blanket execution `kms:*` denies that break AWS-managed Lambda encryption. Do not grant broad business-key access. Inspect the actual default service path, customer-key policies/grants and runtime boundary separately; zero new KMS Allow was needed in the accepted Team execution correction.
- **Artifacts:** use the reviewed publication/encryption model. Where needed to avoid a shared bucket's SSE-KMS dependency, explicitly publish AES256/SSE-S3 and verify uploaded checksums and encryption headers. Never assume the bucket default is safe or add broad KMS decrypt to compensate.
- **Configuration:** independent domains publish accepted endpoint manifests. Do not repurpose `amplify_outputs.json` or switch the existing sandbox.
- **Frontend:** major domain routes/clients lazy-load. Shared shell/login stay global. Publishing a manifest is not frontend cutover.

The [Domain Architecture Standard](project-respawn-domain-architecture-standard.md), [new-domain checklist](new-domain-checklist.md), [deployment security standard](domain-deployment-runtime-security.md), [selection rules](domain-deployment-selection.md) and [data ownership](data-ownership.md) remain required. Earlier dated inventories/reports are evidence, not current deployment instructions. The [documentation inventory and navigation](phase2-documentation-index.md) identifies current, historical and superseded materials without moving their paths.

## Current domain status

| Domain | Accepted state | Remaining work / next gate |
|---|---|---|
| Shared/Core | INDEPENDENT_CONTRACT_RELEASE_1_ACCEPTED; Core 8 product +5 security, CREATE_COMPLETE; same-environment Cognito preserved | Team Hub dark integration accepted; writer-fence/frontend/rollback gates remain separate |
| Tournament | PROVEN_INDEPENDENT_ARCHITECTURE; Release 1 ACCEPTED; `ProjectRespawn-Tournaments-Ntgre`, UPDATE_COMPLETE, 11 resources, API `msipnwy39j`; Git `98dc1230dfadebbbcc1756823c85c866956ceadc` | Release 2 and restore Release 1 proof remain pending. **Phase 2A is not fully complete.** |
| Team Hub | SECOND INDEPENDENT DOMAIN PROVEN; 2B2 read proof ACCEPTED; `ProjectRespawn-TeamHub-Ntgre`, UPDATE_COMPLETE, 42 product resources, API `t54b88casf`; shared Cognito/runtime acceptance passed | 2B3/M4 Gate 1 direct protection and Gate 2 empty-source restore rehearsal accepted; four temporary tables cleaned up. Gate 3 dark targets created (13 product +5 security); 2B4A dark runtime deployed (40 product +7 security); 2B4B synthetic verification passed and disabled; 2B5 offline candidates prepared; cutover blocked pending dependency/security/frontend/rehearsal acceptance. Fence/cutover NOT performed. Business data migrated: NO; frontend cutover: NO; Legacy authority: YES |
| Creator | Logical ownership identified; existing Legacy/external-runtime dependencies remain | Paused; M0 evidence/ownership review only when separately resumed; no new implementation/planning in this checkpoint |
| Commerce | Legacy-authoritative; no extracted target stack/API | M0/M1 inventory/design, including financial/provider and single-writer risks |
| Community/Events | Legacy-authoritative; no extracted target stack/API | M0/M1 ownership, reader/writer and module boundaries |
| Applications/Intake | Legacy-authoritative; no extracted target stack/API | M0/M1 inventory, privacy and intake lifecycle |
| Investor Access | Legacy-authoritative; no extracted target stack/API | M0/M1 access/revocation, private documents and shared-identity dependencies |

Team Hub security: caller `ProjectRespawn-TeamHub-Ntgre-Deploy`; execution role `ProjectRespawn-TeamHub-Ntgre-ReadProofExecution`; exact steady API `t54b88casf`; broad first-create authority removed/no longer effective. Seven security resources are separate from the forty-two current product resources; Gate 3 had thirteen product +five security and Release 1 had eleven product resources. The [Team Hub acceptance report](team-hub-2b2-read-path-release1-2026-10-05.md) and [Tournament acceptance report](phase2a-tournament-runtime-kms-release1-acceptance-2026-10-04.md) state their evidence and limits. Team Hub source checkpoint is the containing commit on `phase2/team-hub-extraction`; resolve its SHA with `git log -1 -- config/domains/team-hub/domain-endpoints.Ntgre.json`.

## Legacy ownership and resource accounting

Accepted Legacy baseline: **UPDATE_COMPLETE · 2,621 declarations · FunctionDirectiveStack 167 · one root and 61 nested stacks**. The [ledger](legacy-resource-ownership.json) contains each declaration exactly once, including nested handles and metadata; the root is not an invented extra row. [Human-readable ledger](legacy-resource-ownership.md).

Inventory coverage is **100%**, while future-owner resolution is **92.71%**: 2,430 assigned, 0 UNASSIGNED and **191 UNRESOLVED_SHARED**. There are 61 source-defined stateful declarations and 62 protected identities. Zero resources are marked migrated, retired or retirement candidates. Shared/stateful/protected dimensions overlap. Mixed providers, shared handlers/APIs, IAM and storage need evidence, not guessed ownership. Full-account external-resource coverage and production are not implied by the Ntgre recursive ledger.

The independent previews have **not reduced the 2,621 Legacy resources**. Never delete a resource because equivalent domain resources now exist. Approximate DynamoDB counts do not prove a table empty. Retain source identifiers, backup/restore artifacts and compatibility consumers until an exact, separately authorized retirement review.

Maintain the ledger through reviewed row changes; `node scripts/migration/ledger.mjs check` validates exact inventory reconciliation and uniqueness, and `node scripts/migration/ledger.mjs summary` refreshes derived views. `init` refuses to overwrite an existing ledger. Update domain status and milestone evidence after each accepted change; do not regenerate away unresolved decisions.

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
