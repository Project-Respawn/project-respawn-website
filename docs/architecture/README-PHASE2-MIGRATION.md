# Project Respawn Phase 2 migration — START HERE

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
| Team Hub | 48 product + 7 security, API t54b88casf; complete business runtime configuration recovered | LEGACY_WRITER epoch/version 1/1; target business records 0; frontend Legacy | Isolated AWS transaction/cursor proofs, then remaining cutover gates |
| Creator | No accepted independent extraction; Legacy/external runtimes remain | Legacy/external ownership retained | Paused; resume M0 ownership/dependency evidence only when authorized |
| Commerce | No extracted root/API accepted | Legacy authoritative; no cutover | Inventory payment/provider/idempotency and recovery risks |
| Community/Events | No extracted root/API accepted | Legacy authoritative; no cutover | Ownership, moderation and reader/writer contracts |
| Applications/Intake | No extracted root/API accepted | Legacy authoritative; no cutover | Privacy, intake lifecycle and real/demo scope |
| Investor Access | No extracted root/API accepted | Legacy authoritative; no cutover | Revocation, NDA/private documents and identity dependencies |

Core: [accepted release](core-release1-acceptance.md). Tournament: [accepted release](phase2a-tournament-runtime-kms-release1-acceptance-2026-10-04.md). Team Hub: [current acceptance](team-hub-2b6-acceptance.md), [runbook](team-hub-2b6-cutover-runbook.md), [recovery evidence](team-hub-describekey-execution-evidence-2026-10-12/accepted.json).

### Accepted Team Hub recovery and remaining dependencies

Both Lambda environments match CloudFormation, Active/Successful and function drift IN_SYNC; runtime ZIPs and permanent IAM unchanged. Authority returns HTTP 200; all 16 normal business routes return 403. Live KMS DescribeKey/Encrypt/Decrypt succeeded; temporary role/workflow removed. No business records changed, frontend cutover, source fence, authority transition or Legacy retirement. The 222 certification/82 installed-role counts are specific to this package, not universal domain requirements. Company SCP visibility remains a documented, explicitly waived limitation; successful recovery is not a complete organization-policy audit.

Next: separately review isolated real AWS transactional enforcement and Read-role cursor decryption/signing. Finish safe runtime/frontend/rollback proof **before** freezing Legacy. Prepare a dormant source fence without denying current writes; reserve installed live denial proof for separately authorized FROZEN maintenance. Source-fence activation, reconciled target authority and frontend publication are distinct gates. Never replay the consumed recovery workflow or restore known-unhealthy environment maps.

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
