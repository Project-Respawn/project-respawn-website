# Required independent-domain migration record

Read [Phase 2 START HERE](README-PHASE2-MIGRATION.md) first. Copy this template into a domain-specific record; fill every field with evidence or an explicit blocker. This template grants no AWS, data, production or deletion authorization. Record a separately approved reason for stage reordering; a stateless M7 proof can be authorized without pretending M4–M6 are complete.

## Record header

Domain / accountable owner / environment / account / region / current phase / approved scope / explicit prohibitions / product and security hashes / current writer authority / current endpoint consumers / protected baselines / expiry reserve / approval reference / evidence directory / rollback operator: **REQUIRED**.

## M0 — OWNERSHIP / INVENTORY

**ENTRY CRITERIA:** domain selected unambiguously; current ledger/status and shared identity read; inventory-only scope approved.

**ALLOWED CHANGES:** inventory routes, frontend imports, operations, data, AWS declarations/physical resources, identity, external integrations and cross-domain dependencies; update evidence-backed ownership with unresolved gaps retained.

**PROHIBITED CHANGES:** new product implementation, deployment, data writes, guessed ownership, interpreting approximate table counts as empty, deleting equivalent Legacy resources.

**REQUIRED TESTS:** exact resource identity/uniqueness/arithmetic; dependency and consumer reconciliation; secret redaction; evidence freshness/provenance.

**AWS GATE:** none for stored evidence; targeted read-only inspection only if authorized. No mutation.

**ROLLBACK:** restore documentation/inventory checkpoint; preserve the original evidence.

**EXIT CRITERIA:** explicit owner and inventory scope; each unknown is listed; authoritative readers/writers and physical state are identified sufficiently for design.

**EVIDENCE:** ledger IDs, source paths, route/operation maps, external integration inventory, gaps and owner decision.

## M1 — DESIGN

**ENTRY CRITERIA:** M0 accepted; unresolved facts that affect safety are resolved or block the design.

**ALLOWED CHANGES:** target ownership, versioned contracts/API, data model, runtime boundaries, independent deployment root, generated resource budget, migration/recovery strategy, frontend lazy boundary and observability design.

**PROHIBITED CHANGES:** live provisioning, migration, cross-domain direct database access, new per-domain Cognito, root per small module, treating nested stacks as independent roots.

**REQUIRED TESTS:** contract/schema review, authorization matrix, estimated generated resource accounting, dependency/transaction/consumer coverage and recovery feasibility.

**AWS GATE:** design only; no mutation. State/provider support requires read-only evidence, not assumption.

**ROLLBACK:** retain existing design/authority and record the alternative decision.

**EXIT CRITERIA:** bounded design accepted, resource costs and source/target authority explicit, stage-specific rollback and deployment identities specified.

**EVIDENCE:** architecture decision, contracts, IAM threat/scope review, resource budget, migration strategy and owner approval.

## M2 — OFFLINE FOUNDATION

**ENTRY CRITERIA:** M1 and implementation scope approved; isolated dependencies/toolchain selected.

**ALLOWED CHANGES:** contracts, domain model, synthetic adapters, independent infrastructure, tests, generated resource accounting and independent offline synthesis/build.

**PROHIBITED CHANGES:** AWS writes, state migration, global/Legacy synthesis without explicit need, production changes, frontend endpoint cutover or presenting fixtures as real data.

**REQUIRED TESTS:** contracts, authorization/privacy, business invariants, import/build isolation, domain selection fails closed, TypeScript/build, resource budgets and shared identity/configuration schemas.

**AWS GATE:** offline only. Pin source/template/Lambda/config hashes; synthesis is not deployment authorization.

**ROLLBACK:** restore code checkpoint; keep accepted candidate and reproducible source/toolchain evidence.

**EXIT CRITERIA:** isolated foundation passes tests, costs are counted and immutable candidate/evidence is reviewable.

**EVIDENCE:** source manifest, pinned templates/bundles, toolchain lockfiles, tests/accounting, dependency closure and declared remaining gaps.

## M3 — STATELESS / READ PROOF

**ENTRY CRITERIA:** M2 accepted; explicit environment/candidate-bound deployment authorization; protected baseline and rollback margin verified.

**ALLOWED CHANGES:** reviewed restricted caller/security bootstrap, independent API, shared Cognito JWT, synthetic/read-only Lambda, exact artifact publication, live auth proof and immediate steady-state lockdown.

**PROHIBITED CHANGES:** business state/write routes, broad bootstrap identity as product caller, new pools, permission patch/retry after a stop-on-failure authorization, other domains or production, frontend cutover.

**REQUIRED TESTS:** Analyzer, caller/runtime/execution positive/negative checks, exact artifacts/encryption, full change-set reconciliation, rollback families, existing API protection, API ownership/tags, live auth, initialization/logs/metrics/alarms and unchanged protected baselines.

**AWS GATE:** separately inspect/authorize security, product and exact-ID lockdown; rollback enabled; fail on unexpected changes. Adequate first-create expiry reserve. No runtime acceptance until temporary broad authority is ineffective.

**ROLLBACK:** let CloudFormation roll back failures; collect evidence and stop as authorized. Retain pinned artifacts; do not recreate the sandbox or add an unreviewed permission.

**EXIT CRITERIA:** proof accepted at its stated synthetic/read-only scope, actual runtime isolated, owner API locked down, endpoint manifest accepted with frontendCutover=false; Legacy business authority retained.

**EVIDENCE:** installed policies/trust/boundaries, assumed caller identity (no credentials), complete plans/events, artifact checksums/encryption, ownership, auth/runtime acceptance and before/after baselines.

## M4 — STATE PREPARATION

**ENTRY CRITERIA:** accepted M3 and separately approved state-preparation scope; exact source/provider/consumer ownership known.

**ALLOWED CHANGES:** exact source record inventory, backup/recovery proof, target state design, migration tooling, isolated rehearsal and record/key/index/TTL/stream reconciliation plans.

**PROHIBITED CHANGES:** real writer cutover, source deletion, counting approximate DynamoDB zero as empty, unapproved live target creation/copy or exposing private records in evidence.

**REQUIRED TESTS:** backup restore, provider delete/import behavior, exact counts/key-set or approved privacy-preserving reconciliation, replay/idempotency, missing/duplicate/corrupt record controls and rehearsal rollback.

**AWS GATE:** each state creation/export/copy/rehearsal action needs exact separately approved source/target scope. Default is tooling/design only.

**ROLLBACK:** restore rehearsal targets or revert tooling; keep Legacy authoritative and backups immutable. No blind copy/delete-table recipe.

**EXIT CRITERIA:** migration can be rehearsed/reconciled and recovered without losing relationships or accepted authority; target and backup readiness evidenced.

**EVIDENCE:** exact inventory, recovery artifacts, rehearsal outputs, reconciliation methodology/results and stateful risk decisions.

## M5 — MUTATION PARITY

**ENTRY CRITERIA:** M4 accepted; command/security contract and parity scope approved.

**ALLOWED CHANGES:** commands, transactions, authorization, idempotency, audit, concurrency and privacy behavior using controlled targets/adapters.

**PROHIBITED CHANGES:** competing production writers, real financial/provider side effects as tests, unapproved live business mutations or consumer cutover.

**REQUIRED TESTS:** command parity, transaction/concurrency conflicts, replay/idempotency, tenant/role negatives, audit privacy, provider-failure/retry semantics and recovery.

**AWS GATE:** separately approved bounded mutation test scope; identify the single authoritative writer. No implied production authority.

**ROLLBACK:** revert candidate/controlled state with reconciled recovery; fence accidental writers before restoring authority.

**EXIT CRITERIA:** accepted mutation parity with no unresolved data-integrity/security defects; cutover/rollback writer sequence ready.

**EVIDENCE:** parity matrix, transaction/authorization tests, idempotency/audit examples without sensitive data, recovery and writer plan.

## M6 — CUTOVER

**ENTRY CRITERIA:** M4/M5 accepted; explicit cutover authorization, recovered backups, consumer map and timed rollback window.

**ALLOWED CHANGES:** old-writer fence, final reconciliation, one new writer, frontend endpoint switch, bounded compatibility adapters and monitoring.

**PROHIBITED CHANGES:** dual authority, silent cross-domain access, premature Legacy deletion, repurposing amplify_outputs.json, production without separate approval.

**REQUIRED TESTS:** fence effectiveness, exact reconciliation, shared-auth/role negatives, user journeys, lazy-route/client boundaries, compatibility, observability and reverse-cutover rehearsal.

**AWS GATE:** exact source/target/consumer/writer changes and endpoint configuration inspected and separately authorized; stop on unexpected plan/state differences.

**ROLLBACK:** fence the new writer first, reconcile intervening writes, restore explicitly accepted authority/endpoint; do not simply point at stale data.

**EXIT CRITERIA:** new owner has accepted business writer authority, consumers use the accepted contract, monitoring/rollback window completed and ledger/status updated.

**EVIDENCE:** writer-fence timestamps, final reconciliation, endpoint version, consumer acceptance, metrics and rollback proof.

## M7 — UPDATE / ROLLBACK PROOF

**ENTRY CRITERIA:** accepted independent release and separately authorized next-release/restore proof; stateful prerequisites where applicable. A stateless proof before M4 requires explicit stage-order authorization.

**ALLOWED CHANGES:** independent Release N → N+1 → restore prior release; bounded stateful rollback rehearsal where applicable.

**PROHIBITED CHANGES:** incidental business expansion, other-domain deployment, lost rollback assets, destructive schema rollback or claiming stateful proof from a stateless fixture.

**REQUIRED TESTS:** independent synthesis/deployment, before/after unrelated-stack stability, auth/runtime/security regression, restored artifact/hash/behavior, state compatibility and data reconciliation.

**AWS GATE:** inspect each release/restore plan; exact candidates and rollback enabled; production remains separately authorized.

**ROLLBACK:** execute the reviewed prior candidate with its compatible state/writer plan; stop on unexpected replacement or recovery failure.

**EXIT CRITERIA:** independent update and restoration both accepted, with explicit stateful/stateless limits. Tournament Release 1 alone does not satisfy this stage.

**EVIDENCE:** both release manifests, plans/events, restored hashes/behavior and data recovery evidence where applicable.

## M8 — LEGACY RETIREMENT REVIEW

**ENTRY CRITERIA:** accepted owner/cutover/update/rollback milestones, zero remaining Legacy consumers and recovery evidence; each candidate mapped in the ledger.

**ALLOWED CHANGES:** exact deletion proposal, provider/nested effects analysis, backup/restore review, separately authorized retirement and resource recount.

**PROHIBITED CHANGES:** automatic deletion because a replacement exists, undocumented consumers, deletion without explicit authorization, assuming Retain prevents custom-provider destruction, hiding unresolved/account-external resources.

**REQUIRED TESTS:** consumer absence, backup restore, resource/provider impact, retained identities/state, exact recount and ledger uniqueness/status reconciliation.

**AWS GATE:** separate human deletion authorization for exact resources and effects. No plan approval from this template; full-account/production requirements remain independent.

**ROLLBACK:** documented resource-specific recovery, including retained state and provider constraints; disclose irreversible effects before authorization.

**EXIT CRITERIA:** authorized retirement observed, counts updated, compatibility/remainder architecture accepted; control README retained until every global completion condition passes and a human authorizes archival.

**EVIDENCE:** consumer/recovery proof, signed scope/approval reference, deletion plan/events, resource recount, ledger changes and remainder review.
