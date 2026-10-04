# Project Respawn current website domain classification

Date: 4 October 2026. Apply the [mandatory architecture standard](project-respawn-domain-architecture-standard.md), [checklist](new-domain-checklist.md) and [roadmap](domain-migration-roadmap.md). This is documentation, not an extraction or new AWS inventory.

## Evidence and status vocabulary

The [full website audit](full-website-domain-audit-2026-09-30.md), [route inventory](website-route-inventory.json), [feature/model map](website-feature-domain-map.json) and [backend call map](website-backend-call-map.json) cover 128 route records across the 16 areas below: 115 pages, five layouts and eight redirects, with 123 distinct canonical patterns and nine aliases. These are historical configured-source observations, not newly tested live workflows. Rows do not equate folder names, route groups or resource attribution to physically independent clouds.

The [Tournament acceptance report](phase2a-tournament-runtime-kms-release1-acceptance-2026-10-04.md) supplies the later update: independent eleven-resource preview root accepted, existing Cognito consumed, runtime isolation verified, manifest generated, frontend cutover not performed. Most remaining products are physically LegacyPlatform. Its last verified inventory remains **2,621 / 167**; this task makes no AWS calls.

| Status | Meaning |
|---|---|
| PROVEN_INDEPENDENT | Evidence exists for the stated independent capability, with its exact limits; not automatic business-product completeness |
| PROVEN_INDEPENDENT_ARCHITECTURE | Tournament's specific qualified label: Release 1 proves root/API/runtime/auth/deployment isolation |
| PHASE_2A_FINAL_ROLLBACK_PROOF_PENDING | Required additional Tournament state; Release 2 and rollback not done |
| READY_TO_EXTRACT | Owner/contracts/recovery/resource-specific plan and isolated candidate reviewed; no execution implied |
| NEEDS_DESIGN | Target owner is sufficiently clear, but dependency, authorization, lifecycle or migration design is incomplete |
| FRONTEND_ONLY | Content/projection/utility or composition boundary needs no new independent product backend for current scope |
| UNRESOLVED | Product/data/operational ownership or external deployment facts must be established first |

**No additional target domain currently qualifies as READY_TO_EXTRACT.** Team Hub is the next recommended design candidate, not an approved migration. Core is intentionally retained, not incorrectly classified as a proven independent root. FRONTEND_ONLY does not mean unauthenticated, no dependencies, or permission to delete existing resources.

## Current architecture, target owner and cloud boundary

All independent-root requirements below describe the target at the appropriate approved stage, not immediate creation. One website and hosting release can contain multiple domain frontend chunks. A frontend boundary does not require a separate website.

| Area (audit records) | Current architecture | Target classification | Target owner | Independent cloud required | Current migration status |
|---|---|---|---|---|---|
| Website / marketing (8) | Mostly eager public content; `/`, about/careers/contact/legal; creator/partner directories contain placeholders | FRONTEND_ONLY | Website shell/content | No product backend; reuse website hosting | FRONTEND_ONLY |
| Account (4) | Shared Cognito and Legacy UserProfile/access; account also imports Community activity; `/join`, `/account`, `/home`, redirect | SHARED_CORE | Core identity/minimal profile; owner APIs for product summaries | No new root now; retain existing identity physically | NEEDS_DESIGN for profile/access contracts; identity stays put |
| Creator Tools (25) | Legacy AppSync/shared handlers, nested Twitch/overlay services and mixed real/demo UI; separate runtime sources/external ownership need reconciliation | INDEPENDENT_DOMAIN | Creator Platform | Yes for control boundary; additional persistent-runtime/delivery unit only with lifecycle justification | NEEDS_DESIGN |
| Team Hub (7) | Legacy `readTeamHub`/`mutateTeamHub`, shared Lambda/client, four custom-managed models; five lazy user pages but eager admin/guard coupling | INDEPENDENT_DOMAIN | Team Hub | Yes for independently owned API/execution; table ownership later | NEEDS_DESIGN |
| Tournament (15) | Accepted independent HTTP API/Lambda/root; main website shell/pages lazy but fixture-backed; global shell still loads unrelated code | INDEPENDENT_DOMAIN | Tournament Platform | Already exists: `ProjectRespawn-Tournaments-Ntgre`; no additional root per module | PROVEN_INDEPENDENT_ARCHITECTURE; PHASE_2A_FINAL_ROLLBACK_PROOF_PENDING |
| Commerce (5) | Legacy AppSync/shared HTTP, seven product/order models, media/Brand dependencies, Revolut/Printful flows; eager pages/admin | INDEPENDENT_DOMAIN | Commerce | Yes; one order/payment authority, no root per checkout step | NEEDS_DESIGN |
| Community / Events (7) | Legacy Event and Forum models/APIs; real operations with demo sidebar elements; eager frontend | INDEPENDENT_DOMAIN | Community / Events | Yes eventually; forums/moderation/general events start as modules | NEEDS_DESIGN |
| Applications / Bookings (19) | Legacy public submission/admin reads and seven models; reviews, availability, inductions/bookings substantially demo | INDEPENDENT_DOMAIN | Applications / Intake | Yes for Intake; no speculative separate scheduling root | NEEDS_DESIGN |
| Investor (3) | Legacy request/access/audit models, Cognito lookup and private S3 document access; eager pages | INDEPENDENT_DOMAIN | Investor Access | Yes eventually; distinct approval/revocation lifecycle | NEEDS_DESIGN |
| Admin (6 Core/Admin records) | Eager dashboard shell/user/global-permission/Brand tools; product admin routes also counted with their product areas | CROSS_DOMAIN_UI plus narrow CORE_ADMIN | Shell owns composition; Core owns identity/global permissions; products own business admin | No Admin super-root/backend | FRONTEND_ONLY for composition; Core admin contract NEEDS_DESIGN |
| Media (1 admin record) | Legacy MediaCollection/MediaItem/shared bucket; Commerce owns its image joins; other private/prefix uses | SHARED_CORE_BOUNDED_CAPABILITY plus DOMAIN_STORAGE | Core for reusable global assets; each product for its private assets and associations | No new universal media root now; domain storage where justified | NEEDS_DESIGN |
| Partner (5) | Login-protected demo campaign/creator/profile/analytics pages; no product group route gate/backend found | PROVISIONAL_EXISTING_DOMAIN_MODULE | Provisionally Creator commercial-partnership module; Commerce owns actual money flows | No new root justified by current demos | UNRESOLVED |
| Trainer (6) | Login-protected demo client/quest/challenge/engagement pages; no dedicated backend/models or Trainer route-group requirement | PRODUCT_BOUNDARY_UNRESOLVED | Coaching/wellbeing owner to decide; team coaching may fit Team Hub | Undecided; do not create a root from a role label | UNRESOLVED |
| Therapist (12) | Public fictional-client layout/pages and no clinical backend; role/privacy design absent | SENSITIVE_PRODUCT_BOUNDARY_UNRESOLVED | Prospective sensitive-care owner, separate from general coaching if real data warrants it | Undecided; sensitive scope must be designed before real data | UNRESOLVED |
| Esports (3) | Public marketing/team presentation and old Tournament detail placeholder; mixed eager/lazy | FRONTEND_ONLY / READ_PROJECTIONS | Website presentation; Team Hub and Tournament own underlying facts | No new product root | FRONTEND_ONLY |
| Games / SWG (2) | Lazy Buff Builder utility; separate BetaMember-gated EOF download API integration with external ownership unresolved | SPLIT_FRONTEND_UTILITY_AND_EXTERNAL_CAPABILITY | Website owns Buff Builder; EOF distribution owner unverified | No for utility; distribution backend already exists, exact root unverified | UNRESOLVED overall; Buff Builder FRONTEND_ONLY |

## Identity, API/data ownership and frontend target

“Own API/data” specifies the desired authority, not a claim that physical migration has occurred. Public pages can remain public; “shared Cognito” applies to protected operations. All future protected products must consume the selected environment's existing identity authority.

| Area | Shared Cognito | Own API | Own data | Lazy frontend requirement |
|---|---|---|---|---|
| Website / marketing | Only login/account-aware shell or protected links | No speculative CMS; owner read contracts if needed | Static content/assets; no new business database | Keep shell small; defer nonessential pages and all product implementations |
| Account | Yes; sole environment identity authority | Bounded Core account/profile/access contracts | Global identity reference/minimal profile/global permission vocabulary | Account page and product-summary adapters lazy; shared session primitives small |
| Creator Tools | Yes; public overlay publication credential is a separate scoped contract | Creator control API; runtime/delivery contracts where independently justified | Workspace/membership, commands, provider tokens/OAuth, rewards, overlays; not global profile ownership | All Creator layouts/pages/admin, stores and provider clients on demand |
| Team Hub | Yes; domain membership/capabilities additionally checked | Preserve facade compatibility, target independently owned Team API | Team, membership, roster slots, champion pools; single transaction/writer authority | Lazy user/admin pages and Team access adapter; no global Team service initialization |
| Tournament | Yes; live preview confirmed against Ntgre | Already owns preview HTTP API; future competition APIs belong here | Currently fixtures only; future registration/matches/drafts/brackets/results owned here | Existing lazy pages retained; remove unrelated shell dependencies in later frontend work |
| Commerce | Yes for account/admin operations; separately validated provider/public contracts | Commerce products/orders/checkout/webhook contracts | Catalog/joins/images, order/payment/fulfillment state and idempotency | Merch/checkout and all commerce admin/client/store code lazy |
| Community / Events | Yes for writes/protected reads/admin; explicit public reads | Community event/forum/moderation API | Generic events, suggestions, forums/activity/board permissions | Forum/event/admin layouts and clients lazy |
| Applications / Bookings | Yes for private review/admin; public intake intentionally separate | Submission/review/booking APIs within agreed scope | Answers/submissions/audit/idempotency/rate limits; scheduling only when implemented | Public forms and private admin/review modules lazy |
| Investor | Yes plus access level/NDA/expiry/revocation | Investor request/approval/private-document access API | Investor access/audit/request records and document entitlement; Core owns identity | Public/private/admin Investor modules lazy |
| Admin | Same shared session; every target API authorizes separately | No aggregate privileged business API; Core admin + each owner admin API | No duplicate product tables; Core retains global admin audit where applicable | Dashboard shell thin; product admin panels independently lazy |
| Media | Shared identity or deliberately bounded public/signed access | Authorized asset intents/registry; private product endpoints as needed | Global reusable metadata only in Core; domain-private bytes/associations stay owned | Media picker/editor loaded only by consuming route; no eager global media SDK |
| Partner | Shared identity currently; product authorization must be designed | No current own API; use eventual Creator contracts, Commerce for settlement | No current business persistence; owner of campaigns/agreements remains a decision | Demo/product routes and clients lazy under chosen owner |
| Trainer | Shared identity currently; future domain checks required | No current own API; decide Team module versus independent coaching contract | Fictional clients/quests now; no real-data ownership inferred | Lazy feature boundary; no sensitive data until scope/permissions agreed |
| Therapist | None on current public demo; shared identity required for real protected service | No current own API; future sensitive service requires independent authorization design | Fictional data now; any real care records require explicit owner/security/retention | Lazy; protected real-data routes must replace demo assumptions only through approved work |
| Esports | Public projections normally; shared identity if protected functionality added | Consume Team/Tournament public read contracts | No duplicated authoritative roster/competition store | Lazy presentation pages; owner client loaded only for needed projection |
| Games / SWG | EOF currently uses existing identity with ID-token adapter; utility public | EOF external download API exists; no utility backend | External release/pairing/storage ownership unresolved; utility local data | Both currently lazy; retain isolation and external-contract compatibility |

## Migration requirements and unresolved decisions

| Area | Migration required | Unresolved decisions / completion gate |
|---|---|---|
| Website / marketing | Frontend dependency cleanup only for present scope | Any genuine CMS need must be justified; placeholder directories are not operational products |
| Account | Contract and read-composition refactor; no Cognito move | Exact global profile field allowlist, Brand boundary, revocation freshness and replacement of direct product UserProfile writes |
| Creator Tools | Staged execution/API then explicitly reviewed encrypted/native/custom state transfer | Actual persistent-runtime/ECS/external owners, OAuth/callback/browser-source compatibility, secret/KMS access and lease/delivery lifecycle; demo-to-real scope |
| Team Hub | Execution/API compatibility first; physical tables remain Legacy until separately proven | Full-Schema client removal, current permission/directory/media contracts, three-table transactions, revision semantics and custom-provider transfer/recovery |
| Tournament | No legacy business data to migrate; future page/client cutover is separate | Finish isolated Release 2 and rollback; hosted CI and real registration/match product work are not yet proven |
| Commerce | Late staged extraction, data/provider reconciliation and reversible endpoint cutover | Single order writer, payment/fulfillment idempotency, callback compatibility, product/media/Brand relations, restore and reconciliation |
| Community / Events | Owner API/authorization facade, then stateful content migration | Profile/activity read contracts, generated relations, moderation policy and deletion/retention parity |
| Applications / Bookings | Preserve real intake/read behavior; design missing review/booking workflows separately; migrate state later | Real versus demo transitions, sensitive answer access, spam/rate limits, idempotency, reviewer authority and need for broader scheduling lifecycle |
| Investor | API/security boundary first; documents/access records only under reviewed migration | Revocation/NDA/expiry, signed URL lifetime, private storage scope and replacing product Cognito admin with Core capability |
| Admin | Lazy composition/client refactor; business actions follow owner extraction | Global versus domain admin authority; partial failures and no privilege escalation through dashboard aggregation |
| Media | Clarify metadata/asset ownership and prefix contracts; no blanket bucket move | Public/private classification, permitted consumers, asset deletion/refcounts, signing, retention and recovery; need for a dedicated service only if justified |
| Partner | Frontend ownership cleanup initially; no existing product database to extract | Is it Creator partnership workflow or a distinct marketplace? Where do contracts, rights, campaigns and payouts belong? |
| Trainer | No current backend extraction; real product design first | Team coaching module versus broader coaching business; trainer/client relationship authorization and scope |
| Therapist | No current backend extraction; sensitive product/auth design before real data | Role gates, care relationship, consent/privacy/retention and whether a distinct service is warranted; no inference of a live clinical data leak |
| Esports | Frontend projection/route cleanup only | Preserve both current Tournament URLs until intended alias/detail behavior is agreed; Team/Tournament read projection contracts |
| Games / SWG | No Buff Builder backend move; no EOF transfer until owner audit | Exact root/handler/storage/operator and contract of API `7sqhe1oq7f`; do not conflate with `swg-private-test` EC2 or Companion; ID-token compatibility |

## Target independent product responsibilities

Seven product owners are established targets: **Tournament, Team Hub, Creator, Commerce, Community/Events, Applications/Intake, Investor Access**. Each owns its domain frontend, API/authorization, business data where appropriate, runtime boundaries, artifacts, observability and release/rollback lifecycle while sharing Cognito. This is a target ownership statement, not seven achieved extractions. Creator may justify separate control and persistent-runtime units within one domain. Core remains narrow and physically retained until a separate decision.

Shared/Core and frontend-only areas do not require one cloud each. Partner, Trainer and Therapist remain unresolved product decisions despite existing Cognito group names. SWG already integrates an external backend, but its independence/ownership has not been verified to the Tournament standard.

## Completeness and constraints

All 16 audited major areas are represented across the three tables with current architecture, target classification/owner, cloud requirement, shared identity, API/data authority, frontend loading, migration need and unresolved decisions. Detailed individual route/model/caller evidence remains in the linked audit inventories; this document does not recertify all 128 routes or cure its seven historical bundling-test failures.

No target other than Tournament is labeled physically extracted. No area is marked READY_TO_EXTRACT by naming it. No code, state, pool, group, IAM role, stack or endpoint was modified. Release 2 remains paused pending separate authorization.
