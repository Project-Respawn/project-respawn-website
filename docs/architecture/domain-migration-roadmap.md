# Project Respawn domain migration roadmap

Date: 4 October 2026. Applies the [mandatory architecture standard](project-respawn-domain-architecture-standard.md), [current classification](project-respawn-domain-classification.md) and [new-domain checklist](new-domain-checklist.md). **Planning only. Release 2 is paused; no deployment, AWS change or migration is authorized by this roadmap.**

## Starting point and limits

Tournament Release 1 has proved independent root/API/Lambda deployment, same-environment Cognito authentication and runtime isolation. The accepted root has eleven resources and returns stateless preview fixtures. No real Tournament frontend cutover or business-data implementation occurred. Required Release 2 and independent rollback remain pending.

Most other products still depend on LegacyPlatform, which remains **2,621 resources**, **167 FunctionDirectiveStack**, with **62 protected identities and five monitored Lambda hashes unchanged** in the latest acceptance evidence. Core identity remains physically there. This document uses recorded evidence; it is not a fresh AWS scan or certification of other business workflows.

The [website audit](full-website-domain-audit-2026-09-30.md) found broad frontend coupling, demo-heavy areas, unverified authenticated workflows and external SWG ownership gaps. Its historical Tournament blockers are superseded by [Release 1 acceptance](phase2a-tournament-runtime-kms-release1-acceptance-2026-10-04.md). Its unresolved product/health findings are not all resolved by Tournament success.

## Status register

| Target | Status | Evidence / limitation |
|---|---|---|
| Tournament | PROVEN_INDEPENDENT_ARCHITECTURE + PHASE_2A_FINAL_ROLLBACK_PROOF_PENDING | Release 1 authenticated preview accepted; does not prove all business features, frontend cutover, hosted routing or rollback |
| Any additional product | READY_TO_EXTRACT: **none** | No complete reviewed physical transfer plan/candidate/recovery proof established |
| Team Hub | NEEDS_DESIGN | Clear product owner and read/mutate seam; shared generated client, policy, transactions and tables remain |
| Creator | NEEDS_DESIGN | Control, token/OAuth and delivery boundaries known; actual external runtime ownership and encrypted-state migration unresolved |
| Commerce | NEEDS_DESIGN | Payment/order/fulfillment state and provider compatibility require high-assurance migration |
| Community / Events | NEEDS_DESIGN | Content, relations, profile/activity and moderation contracts required |
| Applications / Intake | NEEDS_DESIGN | Real submission/read versus demo review/booking scope must be separated |
| Investor Access | NEEDS_DESIGN | Revocation/NDA/private documents and identity-administration dependencies require design |
| Core Account / access / bounded Media | NEEDS_DESIGN, retain existing physical resources | Formalize contracts first; not an early pool/bucket/table transfer |
| Website / marketing; Esports projections; SWG Buff Builder | FRONTEND_ONLY | Frontend/dependency refactors, no new business root |
| Admin composition | FRONTEND_ONLY with Core/domain API dependencies | No Admin super-backend; Core administration contract still needs design |
| Partner / Trainer / Therapist | UNRESOLVED | Product and authorization boundaries must precede real data/infrastructure |
| SWG EOF distribution; historical Companion/external runtime ownership | UNRESOLVED | Discover owner/contracts; do not infer adoption or recreate external resources |

## Enabling work before the next extraction

Once the paused Phase 2A proof is separately authorized and completed, prepare three bounded workstreams. They may be designed in parallel, but this task implements none of them.

- **Frontend isolation:** lazy major layouts/pages/admin panels and domain access adapters, remove product dependencies from shell/guards, measure route bundles and client initialization. This offers the largest near-term loading benefit without transferring tables. Use the historical 2,165.36 kB minified / 556.59 kB gzip baseline, then establish a fresh comparable build. Do not promise an unevidenced percentage reduction.
- **Hosted selection:** replace the effective all-backend execution path with dependency-aware owner selection through a separately reviewed CI change. Guard the actual `ampx pipeline-deploy` invocation as well as synthesis/accounting. Frontend/domain-only changes must not select LegacyPlatform; shared contracts select compatibility checks. The local Tournament selector is not evidence that staging/master hosted pipelines are safe. Development is not AWS-connected under the existing user workflow; do not change branch connections implicitly.
- **Core/ownership contracts:** minimal profile/subject, global access vocabulary/directory, scoped media, endpoint manifests and owner registry. Inventory actual SWG and Creator external runtime ownership; agree Partner/Trainer/Therapist product scope. Resolve real workflow/test gaps relevant to each candidate. No new Core backend, generic Admin service, event bus or per-role root is implied.

These are prerequisites for claiming end-to-end independence, not a big-bang rewrite. Implement proposed guardrails in an approved task with negative fixtures and an explicit existing-debt register. No hidden budget pin refresh or wholesale allowlist is acceptable.

## Recommended extraction order

Rankings are recommendations from recorded coupling, business relevance, growth, loading benefit and state risk. They are not execution approvals or fixed dates. Reorder a later domain only through an updated evidence-based decision; security/recovery gates cannot be skipped for priority.

| Order | Bounded work | Why this position | Required exit evidence / remaining limits |
|---|---|---|---|
| 1 | **Tournament: complete Phase 2A Release 2 and rollback to Release 1** | Existing accepted stateless root is the lowest-state-risk lifecycle proof; avoids moving current business records | Reviewed pinned revision, domain-only update, independent rollback to accepted artifact/config, same-identity behavior, unchanged Legacy/protected resources. Do not start here without new authorization |
| 2 | **Team Hub API/execution compatibility stage** | Cohesive four-model owner, existing two-operation facade and 18-action contract; valuable next proof of extracting a real product with a known frontend service seam | Versioned API/client adapter, trusted identity/revocation parity, transaction/revision behavior, directory/media contracts and isolated release evidence. Keep custom-managed tables legacy until physical transfer separately rehearsed; stage is not complete data independence |
| 3 | **Creator control/API and frontend boundary** | Largest attributed product footprint in prior inventory and eager UI contribution; high business growth and independent release benefit | Inventory actual persistent/external owners first; separate stateless control packaging from legacy data/providers with explicit compatibility. Keep tokens, OAuth callbacks, keys and publication URLs stable. No implicit secret/state transfer |
| 4 | **Community / Events owner API and read contracts** | Meaningful loading benefit and clear content/moderation owner; fewer provider/payment dependencies than later high-risk cuts | Profile/activity projection contracts, moderation and public/private permission parity, generated relation analysis. Migrate content only after recovery/owner-transfer proof |
| 5 | **Applications / Intake** | Bounded seven-model workflow; business value in reliable intake, but review/booking demos must not be mistaken for implemented state | Preserve real submission/admin reads, anti-abuse/idempotency/audit and private answers; separately define real review/induction/booking scope. No speculative scheduling cloud |
| 6 | **Investor Access** | Smaller bounded model set does not make sensitive authorization/document movement low risk; benefit from mature Core contracts | Core-mediated identity lookup, access/NDA/expiry/revocation tests, scoped private documents/URLs, restore and audit proof; no investor runtime Cognito admin |
| 7 | **Creator persistent delivery and encrypted-state transfers** | High lifecycle/security complexity: tokens, KMS, leases, OAuth, WebSockets, delivery dedupe and external runtime ownership | Exact ownership inventory, preserved callbacks/browser-source links, single-writer transition, key/grant/TTL/connection compatibility, state recovery and replay tests. May use a separately justified runtime sibling under the same Creator owner |
| 8 | **Commerce business cutover** | Highest financial/provider/idempotency consequences; wait for tested directory/media and migration patterns | Provider test-mode parity, single order authority, amount/currency validation, webhook signature/replay handling, fulfillment reconciliation, rollback for in-flight orders. No live charges or duplicate writers as a migration test |
| 9 | **Retire obsolete Legacy ownership/compatibility only after proof** | Cleanup is the consequence of successful transfer, not a shortcut to it | Zero actual consumers, retained recovery artifacts/data, full provider-delete/replacement review and separate deletion authorization. Recount root/template budgets; do not claim create-size debt resolved merely because code moved |

**Team Hub is the recommended next product after Tournament's complete proof**, with frontend/pipeline/Core contract prerequisites addressed first. Team Hub physical table transfer is a separate gated substage, not a date implied by order 2. Likewise, each later row can produce an isolated API/execution stage before its high-risk state stage. A stage that still calls Legacy data must keep that dependency visible in status and performance claims.

Tournament business feature development may proceed later through its own product approval and checklist; stateless Release 2 proof must not be expanded into Founder's Cup registration, state creation or frontend cutover. The target architecture does not require completing every legacy extraction before new correctly bounded Tournament modules can be designed.

## Required phases for each existing-product extraction

| Stage | Work and acceptance | Honest status |
|---|---|---|
| Design | Inventory physical resources/readers/writers/external consumers; API/auth/contracts; resource accounting; recovery and permissions plan | NEEDS_DESIGN until gaps are closed |
| Candidate readiness | Exact bounded candidate, dependency closure, tests, acceptable IAM/lifecycle plan, reviewed state handling and reversible change proposal | READY_TO_EXTRACT for this stage only; no deployment authorization implied |
| Execution/API separation | Independent runtime/root/endpoint with a documented compatibility adapter; retain protected state when necessary | Execution-separated, with remaining Legacy dependencies listed; not physically extracted data |
| Stateful ownership transfer | Exact resource/provider support, backups/restore/rehearsal, keys/indexes/TTL/streams and transaction semantics, single writer and reconciliation | Data ownership independent only after verified physical/service authority and rollback plan |
| Frontend/consumer cutover | Accepted endpoint manifest, route/client compatibility, auth negatives, lazy-loading and business acceptance; old path supported during bounded transition | Product cutover accepted; retain rollback window |
| Lifecycle proof and retirement | Independent next release and rollback, observed unrelated stability, consumer deprecation and separately approved old-resource removal | Proven domain at stated scope; record remaining platform/operational limitations |

Avoid a generic copy/delete-table recipe. The 52 custom-managed tables and their provider callbacks need exact support/recovery evaluation; an imported reference or Retain attribute is insufficient. Preserve subject IDs, URLs, object paths, token/key relationships and idempotency windows. Check recovery readiness afresh before proposing state changes; historical PITR/versioning gaps are not fixed by documentation.

## Stop conditions and evidence pack

Stop before execution if ownership is unknown, a protected replacement appears, account/region/environment/artifact differs, permissions exceed reviewed scope, another root is selected, required state recovery cannot be proven, or real business behavior is still a demo. A failed deployment does not authorize repeated patches or a replacement Ntgre sandbox. No table/key/bucket/pool removal is implied by this standard.

For every authorized stage retain: owner decision; dependency and physical resource maps; immutable source/template/asset/config hashes; contract compatibility and auth tests; runtime positives/business-key and cross-domain negatives; Analyzer findings and simulator limitations; generated resource accounting; complete change-set reconciliation; rollback configuration and execution events; live behavior/log/metric evidence; unrelated stack timestamps/protected identities/Lambda hashes; accepted endpoint manifest; remaining dependencies and authorization limits.

## Immediate next step

Review and adopt these four documents as the site-wide standard. Then obtain separate authorization for the concrete Tournament-only Release 2 and rollback proof using the accepted Release 1 baseline. **Nothing in this task resumes Release 2, deploys infrastructure, migrates state, changes AWS or starts another product.**
