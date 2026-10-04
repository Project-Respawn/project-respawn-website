# Project Respawn full website / domain audit — 2026-09-30

**Tournament deployment work is frozen. No deployment, IAM change, AWS modification, migration, application fix, deletion, commit or push was performed.** This audits the normal development workspace, branch development, HEAD 5048a7fd0f8310b2615e7ae346707abee9fe7805. Existing untracked Phase 2A evidence/scripts were preserved.

**Completion gate: FULL WEBSITE AUDIT INCOMPLETE.** The source inventory and offline route pass cover every configured website route. Authenticated business workflows, fresh AWS baseline verification and exact external SWG download-service ownership remain unverified. Those gaps prevent an honest full-site health certification or final decomposition approval. They do not justify another deployment attempt.

## Scope, method and counting

Inspected the router groups, seven feature route modules, global guards, App/main bootstrap, routed Vue dependency graph, schema, backend dispatchers, identity/storage definitions, existing resource/domain inventories and recent Tournament evidence. Route extraction uses inert component/service stubs; it does not invoke real handlers. Build compilation covers imported Vue code. Static import/call traversal is dependency evidence, not a runtime traffic trace.

There are **128 route records: 115 page records, five layout records and eight redirects**. Layouts with empty children share URLs, giving **123 distinct canonical path patterns**, plus **nine aliases**. Parameterized URLs are patterns, not counts of all possible concrete pages. All routed component files exist. These routes are configured in the current workspace; hosted publication was not checked.

- [Route inventory](website-route-inventory.json): every path/name/component/source, access metadata, lazy/eager imports, guards, expected user, layouts, redirects, aliases, dependencies and browser observations.
- [Feature/domain map](website-feature-domain-map.json): 16 discovered areas, all 52 model owners/consumers/readers/writers/physical stacks, storage/native tables, frontend loading and dead-code candidates.
- [Backend call map](website-backend-call-map.json): all 79 custom operations, handler mappings, 26 HTTP declarations, 18 Team Hub gateway actions, generated model calls, auth/overlay adapters and external integrations.
- [Health matrix](website-health-matrix.json): every route's health/backend/data/owner/future-domain/auth/loading/migration-risk row and reconciled counts.

## Site health and build/test baseline

| Classification | Route records |
|---|---:|
| WORKING | 16 |
| PARTIALLY_WORKING | 19 |
| FIXTURE_DEMO | 56 |
| PLACEHOLDER | 4 |
| BROKEN | 0 |
| DEAD_LEGACY | 1 |
| UNKNOWN | 32 |

WORKING means the narrow frontend capability was observed, not that every form/backend journey passed acceptance. UNKNOWN means unverified, not broken. PARTIALLY_WORKING reflects evidenced mixed real/demo capabilities or incomplete/error paths. FIXTURE_DEMO describes the primary workflow even when its parent checks real identity. DEAD_LEGACY includes a still-routed legacy implementation, not permission to delete it. Zero BROKEN routes means no complete primary-route failure was established independently of deliberately blocked network access; error-path defects are recorded below.

Access partition: **61 public entry records, 43 explicitly authenticated records, 24 Admin records**. Admin is not counted twice. /account has a component-level sign-in gate. Therapist pages are public in the current router.

Product-backend partition: **47 LegacyPlatform**, **one independent SWG backend**, **71 frontend/content/fixture**, **eight redirects**, **one local legacy WebSocket**. Shared Cognito/guard dependencies are excluded from a demo page's product-backend count but retained in route evidence. **Zero current website routes consume the new Tournament backend.**

| Check | Result | Evidence |
|---|---|---|
| Install | Not needed; existing dependencies used; no lockfile changes | Current workspace |
| Production build | PASS, Vite 8.0.16; API-base check passes, Revolut sandbox | [website-audit-evidence-2026-09-30/build.log](website-audit-evidence-2026-09-30/build.log) |
| TypeScript | PASS: tsc --noEmit -p amplify/tsconfig.json | [website-audit-evidence-2026-09-30/typescript.log](website-audit-evidence-2026-09-30/typescript.log) |
| Vue type check | No dedicated vue-tsc script; build is compilation, not exhaustive Vue type checking | package.json |
| AppSync contract | PASS: 24 queries, 55 mutations, zero subscriptions; 62 frontend operations, none missing | [website-audit-evidence-2026-09-30/contract.log](website-audit-evidence-2026-09-30/contract.log) |
| Frontend tests | 58 files, 307 pass, zero fail | [website-audit-evidence-2026-09-30/frontend-tests.log](website-audit-evidence-2026-09-30/frontend-tests.log) |
| Broad backend tests | 63 files; initial 276 pass, nine fail | [website-audit-evidence-2026-09-30/backend-tests.log](website-audit-evidence-2026-09-30/backend-tests.log) |
| Configured follow-up | Both generated-module failures pass with repository TS config; three assertions pass | [website-audit-evidence-2026-09-30/backend-targeted-config.log](website-audit-evidence-2026-09-30/backend-targeted-config.log) |
| Remaining backend failures | Seven overlay composition/infrastructure asset-bundling failures; Windows entry path not resolved by esbuild subprocess | Initial backend log |
| Team Hub backend | 47 pass | [website-audit-evidence-2026-09-30/team-tests.log](website-audit-evidence-2026-09-30/team-tests.log) |
| Resource accounting | 41 pass | [website-audit-evidence-2026-09-30/accounting-tests.log](website-audit-evidence-2026-09-30/accounting-tests.log) |
| Amplify guards | 16 pass | [website-audit-evidence-2026-09-30/guard-tests.log](website-audit-evidence-2026-09-30/guard-tests.log) |
| SWG/Team Hub route contracts | 16 pass | [website-audit-evidence-2026-09-30/route-contract-tests.log](website-audit-evidence-2026-09-30/route-contract-tests.log) |
| Local outputs | BLOCKED: AWS NoCredentials at read-only Cognito lookup | [website-audit-evidence-2026-09-30/local-outputs.log](website-audit-evidence-2026-09-30/local-outputs.log) |
| npm run dev | FAILS same preflight; Vite not reached | [website-audit-evidence-2026-09-30/dev.log](website-audit-evidence-2026-09-30/dev.log) |

Suites overlap; do not sum them as unique assertions. The initial two generated $amplify module failures were diagnostic runner configuration, not product regressions. They pass with TSX_TSCONFIG_PATH=amplify/tsconfig.json. Seven bundling failures remain; no source repair or deployed-runtime failure is inferred. Test-only disposable assets were generated locally; the preserved Tournament deployment assembly was not regenerated/substituted.

## Safe route health check

Used the production build on an isolated localhost static server with a fresh Edge profile. Content Security Policy and request interception blocked external calls; /api was never proxied upstream. No real sign-in, checkout, submission, upload, pairing, admin mutation or controls were activated. This was an offline rendering diagnostic, not a connected bypass of the normal dev preflight.

[website-audit-evidence-2026-09-30/browser-health.json](website-audit-evidence-2026-09-30/browser-health.json) covers all 128 records. [website-audit-evidence-2026-09-30/browser-followup.json](website-audit-evidence-2026-09-30/browser-followup.json) covers nine aliases, invalid Tournament slug and seven slower/error-path checks. /about initially sampled before mount; longer follow-up renders correctly. Anonymous protected pages reach /join or denial destinations; /dashboard displays access restricted. All /bot aliases preserve login gates. Invalid Tournament slug redirects to Founder Cup; unknown general path renders 404.

Merch's network error, forum loading state and Overlay Source failed fetch were intentionally induced by external blocking, not observed AWS outages. Overlay Source has an unhandled initial-load rejection/blank error path in this scenario. Authenticated contents, valid business IDs, live API successes and privileged negative cases remain unverified. The first pass captures uncaught exceptions; focused follow-up also captures console errors. Missing console entries in the first pass do not prove console cleanliness.

## Current major sections and proposed ownership

Counts include layout/redirect records; full paths follow in the page matrix.

| Area | Records | Status counts | Current owner | Proposed classification |
|---|---:|---|---|---|
| Games / SWG | 2 | WORKING: 1; UNKNOWN: 1 | Buff Builder frontend-only; EOF separate download service ownership unresolved | UNRESOLVED |
| Applications / Bookings | 19 | WORKING: 6; PARTIALLY_WORKING: 2; FIXTURE_DEMO: 9; UNKNOWN: 2 | LegacyPlatform | INDEPENDENT_DOMAIN |
| Website / Content | 8 | WORKING: 6; PLACEHOLDER: 2 | Frontend content/demo; shared login where guarded | FRONTEND_ONLY |
| Investor Access | 3 | UNKNOWN: 3 | LegacyPlatform | INDEPENDENT_DOMAIN |
| Commerce | 5 | UNKNOWN: 5 | LegacyPlatform | INDEPENDENT_DOMAIN |
| Community / Events | 7 | PARTIALLY_WORKING: 4; UNKNOWN: 3 | LegacyPlatform | INDEPENDENT_DOMAIN |
| Core / Account | 4 | WORKING: 1; UNKNOWN: 3 | LegacyPlatform | SHARED_CORE |
| Creator Platform | 25 | PARTIALLY_WORKING: 11; FIXTURE_DEMO: 10; PLACEHOLDER: 1; DEAD_LEGACY: 1; UNKNOWN: 2 | LegacyPlatform | INDEPENDENT_DOMAIN |
| Partner Hub | 5 | FIXTURE_DEMO: 5 | Frontend content/demo; shared login where guarded | UNRESOLVED |
| Trainer Hub | 6 | FIXTURE_DEMO: 6 | Frontend content/demo; shared login where guarded | UNRESOLVED |
| Therapist | 12 | FIXTURE_DEMO: 12 | Frontend content/demo; shared login where guarded | UNRESOLVED |
| Esports | 3 | PARTIALLY_WORKING: 2; PLACEHOLDER: 1 | Frontend content/demo; shared login where guarded | FRONTEND_ONLY |
| Team Hub | 7 | WORKING: 1; UNKNOWN: 6 | LegacyPlatform | INDEPENDENT_DOMAIN |
| Tournaments | 15 | WORKING: 1; FIXTURE_DEMO: 14 | Frontend fixtures; separate API shell is not consumed | INDEPENDENT_DOMAIN |
| Core / Admin | 6 | UNKNOWN: 6 | LegacyPlatform | SHARED_CORE |
| Content / Media | 1 | UNKNOWN: 1 | LegacyPlatform | SHARED_CORE |

### Games / SWG

Routes: `/SWG-EOF-test`, `/swg-beyond-buff-builder`.

Data models: No dedicated generated model; see shared/external dependencies. Separate Buff Builder utility from already integrated protected distribution service; audit external owner before final decomposition.

### Applications / Bookings

Routes: `/bookings`, `/bookings/invite/:invitationToken`, `/bookings/:bookingTypeSlug`, `/induction/book/:invitationToken`, `/join-us`, `/team-tryouts`, `/apply-now`, `/applications`, `/apply`, `/dashboard/applications`, `/dashboard/applications/reviews`, `/dashboard/applications/reviewers`, `/dashboard/applications/reviewers/:reviewerId`, `/dashboard/availability`, `/dashboard/applications/availability`, `/dashboard/applications/inductions`, `/dashboard/applications/inductions/:inductionId`, `/dashboard/applications/:applicationId/review`, `/dashboard/applications/:applicationId`.

Data models: ApplicationSubmission, ApplicationAnswer, ApplicationCreatorProfile, ApplicationSchedule, ApplicationAuditEvent, ApplicationIdempotency, ApplicationPublicRateLimit. Intake plus review/induction modules initially; bookings is demo and should not become a speculative root.

### Website / Content

Routes: `/`, `/about`, `/careers`, `/creators`, `/partners`, `/contact`, `/privacy-policy`, `/:pathMatch(.*)`.

Data models: No dedicated generated model; see shared/external dependencies. Frontend release unit; retain static marketing/legal content without a new backend root.

### Investor Access

Routes: `/investors`, `/investors/data-room`, `/dashboard/investors`.

Data models: InvestorAccessRequest, InvestorAccess, InvestorAccessAuditEvent. Bounded sensitive-access domain consuming Core identity and scoped private documents.

### Commerce

Routes: `/merch`, `/checkout`, `/dashboard/merch-categories`, `/dashboard/product-control`, `/dashboard/orders`.

Data models: MerchCategory, MerchProduct, MerchProductVariant, FulfillmentOrder, MerchProductBrand, MerchProductCategory, MerchProductImage. Independent payment/order owner; migrate last after idempotency/provider parity.

### Community / Events

Routes: `/events`, `/dashboard/events`, `/dashboard/forums`, `/forum`, `/forum/board/:boardSlug`, `/forum/thread/:threadSlug`.

Data models: EventTag, Event, EventSuggestion, ForumCategory, ForumBoard, ForumThread, ForumPost, ForumActivity, BoardPermissionRule. Forum and general events modules; split only on measured lifecycle/security needs.

### Core / Account

Routes: `/join`, `/account`, `/home`, `/brand-permissions`.

Data models: PermissionDefinition, GroupPermission, PermissionAuditEvent, UserProfile, Brand, BrandAccess, BrandAccessPermission. One shared environment identity/profile/authorization contract; no duplicate pools.

### Creator Platform

Routes: `/overlay-source/:credential`, `/creator-tools`, `/creator-tools/profile`, `/creator-tools/twitch`, `/creator-tools/discord`, `/creator-tools/bots`, `/creator-tools/bots/twitch/commands`, `/creator-tools/bots/twitch/alerts`, `/creator-tools/bots/twitch/tts`, `/creator-tools/bots/moderation`, `/creator-tools/bots/automation`, `/creator-tools/chat`, `/creator-tools/overlays`, `/creator-tools/overlays/library`, `/creator-tools/overlays/:overlayId`, `/creator-tools/community`, `/creator-tools/rewards`, `/creator-tools/achievements`, `/creator-tools/events`, `/creator-tools/members`, `/creator-tools/analytics`, `/creator-tools/integrations`, `/creator-tools/setup`, `/tts-overlay`.

Data models: CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermission, WorkspaceMembershipPermissionSet, TwitchCommand, TwitchIntegration, TwitchTokenVault, TwitchOAuthTransaction, TwitchRuntimeHealth, RewardRedemptionEvent, RewardRedemptionEventClaim, AlphaServiceNonce, DiscordBotConfiguration. One product owner; control API and persistent runtime/overlay delivery may have separate deployment units under versioned contracts.

### Partner Hub

Routes: `/partner`, `/partner/profile`, `/partner/campaigns`, `/partner/analytics`, `/partner/creators`.

Data models: No dedicated generated model; see shared/external dependencies. Demo product workspace; likely Creator commercial-partnership module until independent lifecycle justified.

### Trainer Hub

Routes: `/trainer`, `/trainer/clients`, `/trainer/clients/:clientId`, `/trainer/quests`, `/trainer/challenges`, `/trainer/engagement`.

Data models: No dedicated generated model; see shared/external dependencies. Unresolved coaching/wellbeing product boundary; do not create a root from demo routes.

### Therapist

Routes: `/therapist`, `/therapist/clients`, `/therapist/clients/:clientId`, `/therapist/quests`, `/therapist/quests/new`, `/therapist/clients/:clientId/quests`, `/therapist/insights`, `/therapist/clients/:clientId/insights`, `/therapist/reports`, `/therapist/clients/:clientId/reports`, `/therapist/settings`.

Data models: No dedicated generated model; see shared/external dependencies. Separate sensitive authorization/data boundary from general coaching if implemented; no clinical backend exists here.

### Esports

Routes: `/esports`, `/esports/league-of-legends`, `/esports/tournaments/:tournamentId`.

Data models: No dedicated generated model; see shared/external dependencies. Public content/projections; consume Team Hub and Tournament read contracts when real.

### Team Hub

Routes: `/team-hub/:teamSlug/manage`, `/team-hub`, `/team-hub/:teamSlug`, `/team-hub/:teamSlug/champion-pool`, `/team-hub/:teamSlug/coach-review`, `/team-hub/:teamSlug/team-pool`, `/dashboard/esports/teams`.

Data models: Team, TeamMembership, TeamRosterSlot, PlayerChampionPoolEntry. Independent product domain; roster/champion pools/coaching remain modules.

### Tournaments

Routes: `/tournaments`, `/tournaments/:tournamentSlug`, `/tournaments/:tournamentSlug/teams`, `/tournaments/:tournamentSlug/matches`, `/tournaments/:tournamentSlug/drafts`, `/tournaments/:tournamentSlug/broadcast`, `/tournaments/:tournamentSlug/partner-streams`, `/tournaments/:tournamentSlug/bracket`, `/tournaments/:tournamentSlug/news`, `/tournaments/:tournamentSlug/info`, `/tournaments/:tournamentSlug/matches/:matchId`, `/tournaments/:tournamentSlug/drafts/:matchId`, `/tournaments/:tournamentSlug/register`, `/tournaments/:tournamentSlug/matches/:matchId/lobby`.

Data models: No dedicated generated model; see shared/external dependencies. Independent domain; all tournament pages/modules share one product boundary; freeze Release 1.

### Core / Admin

Routes: `/dashboard`, `/dashboard/users`, `/dashboard/permissions`, `/dashboard/brands`, `/dashboard/brand-permissions`.

Data models: No dedicated generated model; see shared/external dependencies. Administrative UI is cross-domain composition; business mutations belong to owning domains.

### Content / Media

Routes: `/dashboard/media-library`.

Data models: MediaCollection, MediaItem. Shared media capability with prefix/domain ownership, not universal business storage API.

### Capability distinctions within those sections

- Core/Account: Cognito login, registration/confirmation/reset and session handling; UserProfile stores app profile/layout. Account also calls forum activity. /home combines Core access and Team Hub navigation.
- Core/Admin: AdminLayout checks SuperAdmin/Admin/Staff, followed by route permissions/groups. User/role and permission administration are real backend operations. Business administration belongs to product owners, not one all-powerful Admin cloud.
- Creator: Dashboard, profile, Discord, community, rewards, achievements, events, members and analytics contain local simulations. Twitch overview hard-codes connection labels. Commands/OAuth/workspace/Brand setup and canonical overlay configuration have real adapters. Automation is only a teaser. Overlay editing mixes local demo state and canonical publication APIs.
- Team Hub: 18 gateway actions cover team creation/update, membership/manager/roster, champion pools, coach assessment, plans and logos. Four generated models; Cognito account lookup and S3 logos are shared dependencies. User routes require login; management/coach routes add membership and roles.
- Tournaments: 13 page modules plus lazy shell/redirect use tournament.data.js. Teams, match state, drafting, bracket, broadcast, streams and news are fixtures. Registration/lobby are previews. The separate JWT preview client exists but is not wired into pages.
- Commerce: Public merch/checkout and permissioned product/category/order tools use AppSync, media storage, Revolut and Printful. Payment/order/idempotency/fulfilment is a real stateful boundary; no live financial action was tested.
- Community/Events: Three Event and six Forum/activity/board-permission models support real operations. Forum sidebar/friends-online has hard-coded examples. Creator demo events and Tournament competition are different owners.
- Applications/Bookings: Public submissions and admin list/detail use backend operations and seven models. Review claims/scoring/decisions, reviewer performance, inductions and booking/availability are substantially frontend demo state. Admin list is explicitly wired to live sandbox reads; that does not make the review-to-onboarding lifecycle operational.
- Investor: Public request intake, admin approval/access records and private-document URL authorization use three Investor models, immutable Cognito identity and an S3 private prefix. Access levels/NDA/expiry are product authorization, not a second login.
- Content/Media: Shared MediaCollection/MediaItem plus Commerce image joins and bucket prefixes. Keep explicit product object ownership behind a shared capability.
- Partner: Five login-protected pages use partnerDemoData for campaigns, discovery, profile and analytics; no Partner-specific route role guard or product backend found.
- Trainer: Six login-protected demo dashboard/client/quest/challenge/engagement pages; Trainer group not required in router. No Trainer models found.
- Therapist: Eleven page records plus layout, anonymously reachable with fictional clients, quests, insights/reports/settings. No clinical backend model found. Decide authorization/sensitive-data ownership before real client data; this finding is not evidence of a live data leak.
- Esports: Public marketing/team/roster/fixture presentation and older TournamentDetail; should consume Team/Tournament read projections when implemented, not own a cloud per landing page.
- Games/SWG: Buff Builder is frontend-only. EOF installer preview is BetaMember-gated and calls separate API 7sqhe1oq7f with a Cognito ID token. docs/swg-eof-test-page.md records private download deployment; exact root/handler/storage identities are outside this repo. Do not conflate it with swg-private-test EC2 or separate Companion hosting.

## Frontend dependency / lazy-loading audit

**23 component records are lazy**: Tournament shell/pages 14, Team Hub user pages five, SWG two and Esports two. **97 component records are eager**; eight redirects have no component. Creator 25, Partner five, Trainer six, Therapist 12, Admin 24 and most public pages are eager. TeamAdministration is eager through Admin despite Team user pages being lazy.

The extracted initial import closure has **419 local files**, not 419 output chunks. Actual main JavaScript: **2,165.36 kB minified / 556.59 kB gzip**; API chunk 154.19 kB. Build warns above 500 kB. No artificial bundle-size estimate replaces these build results.

Opening Tournament loads its lazy page alongside the main bundle's eager Creator/Commerce/Admin/Trainer/Therapist code. Team Hub similarly gets unrelated main-bundle code. Creator pages themselves are eager. Download/evaluation does not mean every component mounts or every API request runs: many generateClient helpers defer client creation until use.

Coupling points: main.js global Amplify/full outputs and Bootstrap; router imports useAuth/useAccessContext/useInvestorAccess and Team Hub resolver service; public.routes imports Merch/Checkout/Account/Applications/Investor; admin.routes imports all admin views and TeamAdministration. Creator imports pull editor/connected-demo stores and shared Brand context. overlayStore reads localStorage at module initialization. Account imports forum services. Commerce spans product/Brand/media. Domain isolation is therefore incomplete even for lazy route pages.

Recommend lazy feature layout/page trees, on-demand domain clients, small shared auth/navigation shell, on-demand Team access guard adapter, explicit endpoint/configuration contracts, and preserved deep links/aliases. No refactor was performed.

## Backend calls and current cloud architecture

LegacyPlatform contains one AppSync schema with 52 generated models and 79 custom operations. 71 operations dispatch through shared myFunction; eight through adminUserManagement. Retained FnSubmitInvestorAccessRequest/FnReviewInvestorAccessRequest aliases are consolidation infrastructure, not evidence that unrelated operations belong to Investor. Generated CRUD is AppSync model infrastructure, not one Lambda per model.

| Feature | Frontend service | API | Handler/resolver | Data | Physical owner |
|---|---|---|---|---|---|
| Team Hub | teamHub.service.js | readTeamHub/mutateTeamHub | myFunction → gateway/Team handlers | Four Team models + Cognito/logo S3 | Legacy FunctionDirectiveStack, model stacks, shared storage |
| Creator setup/commands | setup/twitchConnection/BasicCommands | Workspace/Brand/Twitch AppSync | myFunction workspace/brands/twitch | Creator workspace + Core Brand/access + Twitch | Legacy shared compute/schema |
| Alerts/chat/editor | overlaySource.js | Overlay HTTP/WebSocket | overlaySource handler | Three native tables + workspace/Brand | Legacy overlay-source-stack |
| Commerce | merchService/useCheckout/ProductControl | AppSync + shared HTTP | merch/media/stage9/revolut/printful/fulfillment | Product joins/order/media/provider state | Legacy multiple nested stacks |
| Applications | submission/applicationAdminData | submitPublicApplication + admin reads | myFunction applications | Seven Application models | Legacy model/handler stacks |
| Investor | useInvestorAccess/admin views | Investor operations | myFunction investors + admin Lambda | Three models + private S3 + Cognito | Legacy schema/storage/auth |
| Forum/account | forumApi/Account | Generated + custom AppSync | Resolvers + shared forum handlers | Forum + UserProfile | LegacyPlatform |
| General events | Events/AdminEvents | Generated + custom AppSync | Resolvers + shared event handlers | Event/Tag/Suggestion | LegacyPlatform |
| SWG EOF | swgDownloads.js | External download HTTP | External source absent here | Release/pairing/storage | Exact independent root UNRESOLVED |
| Tournament pages | tournament.data.js | None currently | None currently | Local fixtures | Frontend; API shell unused |

The JSON preserves exact declarations/auth, handler source lines, physical owners and potential model references. Static helper-call references are conservative dependencies, not proof each request touches every table. Dynamic ProductControl model helpers and overlay fetchImpl/WebSocketImpl adapters are recorded separately. The literal caller scan is not the contract validator: optional/dead/comment references can differ from its 62 operations.

There are 26 HTTP declarations, including nine Overlay declarations. Creator Overlay management uses Cognito JWT; public browser-source uses publication credentials; shared HTTP handlers have operation/provider-specific validation. Gateway authorizer absence alone does not prove an unprotected write. /twitch/status and /twitch/connect are registered but absent from restRouter dispatch, so this entrypoint returns 404; an active frontend caller was not established.

Providers: Twitch, Discord configuration, Revolut, Printful, and Alpha reward ingestion. No Stripe implementation inferred. Canonical overlay WebSocket differs from active legacy /tts-overlay, which uses ws://localhost:3000/events-ws. No frontend Lambda Function URL caller was found (not a regional absence claim). Companion is a separate app/repository, not a route here.

## Data ownership and migration risk

All **52 generated model tables** are Custom::AmplifyDynamoDBTable declarations, not ordinary AWS::DynamoDB::Table resources. Together with **three native overlay tables**, there are 55 table resources in the preserved Legacy inventory. Omitting custom resources would incorrectly report only three. The feature map records physical IDs/stacks, readers/writers, backend reference lines and sensitivity. No business records were read.

Clearly product-owned: Team's four models; Commerce product/order/joins; Creator workspace/Twitch/token/reward/Discord; seven Intake models; three Investor models; Event and Forum models. Shared Core: Cognito subject/profile, permission catalog/group policy, Brand/access directory. Media capability serves multiple product owners; MediaItem and MerchProductImage have different ownership roles.

Cross-domain examples: Creator workspace → Core Brand/access; Commerce product → Brand/media; Account → UserProfile/forum activity; Investor → Cognito/private S3; Team Hub → Cognito assignable-user lookup/logo storage; native overlays → workspace/Brand. Shared handler IAM/code packaging adds coupling even when logical data ownership is clear.

All tables are stateful. Physical ownership changes are HIGH risk: preserve keys/indexes, generated providers, TTL/idempotency, identity subjects, object prefixes, signing/encryption keys and active URLs. Static reader/writer lists are not measured access logs; backendReferences also retain dynamic DynamoDB/environment bindings. Cross-domain=false means not established, not proven isolation.

| Model | Logical owner | Frontend consumers | Current physical stack | Sensitivity | Cross-domain references |
|---|---|---|---|---|---|
| InvestorAccessRequest | Investor Access | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataInvestorAccessRequestNestedStac-1I8NAXAL4H75F | PERSONAL / authorization / private records | Not established |
| InvestorAccess | Investor Access | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataInvestorAccessNestedStackInvest-YUVLR597GD0G | PERSONAL / authorization / private records | Not established |
| InvestorAccessAuditEvent | Investor Access | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataInvestorAccessAuditEventNestedS-S4W1L1GSWH1S | PERSONAL / authorization / private records | Not established |
| CreatorWorkspaceRecord | Creator Platform | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataCreatorWorkspaceRecordNestedSta-13HSLWLT4DBGJ | Business content; authorization still required | Not established |
| WorkspaceMembership | Creator Platform | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataWorkspaceMembershipNestedStackW-8QPM2OKM0CKW | PERSONAL / authorization / private records | Not established |
| WorkspaceMembershipPermission | Creator Platform | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataWorkspaceMembershipPermissionNe-1A95LWNM73OVD | PERSONAL / authorization / private records | Not established |
| WorkspaceMembershipPermissionSet | Creator Platform | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataWorkspaceMembershipPermissionSe-EIVOMDMIOY6P | PERSONAL / authorization / private records | Not established |
| PermissionDefinition | Core / Account | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataPermissionDefinitionNestedStack-1ITRJ4HE2951Q | PERSONAL / authorization / private records | Not established |
| GroupPermission | Core / Account | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataGroupPermissionNestedStackGroup-YOWCHNM4PMDD | PERSONAL / authorization / private records | Not established |
| PermissionAuditEvent | Core / Account | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataPermissionAuditEventNestedStack-1A0PXGESI1P14 | PERSONAL / authorization / private records | Not established |
| ApplicationSubmission | Applications / Bookings | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataApplicationSubmissionNestedStac-SP7BAH4R3I8Q | PERSONAL / authorization / private records | Not established |
| ApplicationAnswer | Applications / Bookings | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataApplicationAnswerNestedStackApp-13IUPR6G30449 | PERSONAL / authorization / private records | Not established |
| ApplicationCreatorProfile | Applications / Bookings | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataApplicationCreatorProfileNested-1QF71ECB1E8V3 | PERSONAL / authorization / private records | Not established |
| ApplicationSchedule | Applications / Bookings | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataApplicationScheduleNestedStackA-MOHWNT0DQQ2S | PERSONAL / authorization / private records | Not established |
| ApplicationAuditEvent | Applications / Bookings | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataApplicationAuditEventNestedStac-17F6NJN6DJ7WJ | PERSONAL / authorization / private records | Not established |
| ApplicationIdempotency | Applications / Bookings | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataApplicationIdempotencyNestedSta-17TQ89N6EFY35 | PERSONAL / authorization / private records | Not established |
| ApplicationPublicRateLimit | Applications / Bookings | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataApplicationPublicRateLimitNeste-APQKOTCVCETA | PERSONAL / authorization / private records | Not established |
| TwitchCommand | Creator Platform | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataTwitchCommandNestedStackTwitchC-W4IOYPK3WTV8 | Business content; authorization still required | Not established |
| TwitchIntegration | Creator Platform | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataTwitchIntegrationNestedStackTwi-YSFLZV03VCBQ | Business content; authorization still required | Not established |
| TwitchTokenVault | Creator Platform | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataTwitchTokenVaultNestedStackTwit-WKBEWIT1UDV1 | SECRET / security state | Not established |
| TwitchOAuthTransaction | Creator Platform | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataTwitchOAuthTransactionNestedSta-1WLFCZT6BR0VI | SECRET / security state | Not established |
| TwitchRuntimeHealth | Creator Platform | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataTwitchRuntimeHealthNestedStackT-IFOY4ZMH5GHJ | Business content; authorization still required | Not established |
| RewardRedemptionEvent | Creator Platform | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataRewardRedemptionEventNestedStac-1VFMYQ8KVRM69 | Business content; authorization still required | Not established |
| RewardRedemptionEventClaim | Creator Platform | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataRewardRedemptionEventClaimNeste-6HL7DVK6VT84 | Business content; authorization still required | Not established |
| AlphaServiceNonce | Creator Platform | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataAlphaServiceNonceNestedStackAlp-1QLOZ14U4V2K7 | SECRET / security state | Not established |
| DiscordBotConfiguration | Creator Platform | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataDiscordBotConfigurationNestedSt-LQVUU7J9LI80 | Business content; authorization still required | Not established |
| Team | Team Hub | Website / Content, Core / Account, Creator Platform, Trainer Hub, Esports, Team Hub, Tournaments, Core / Admin, Investor Access, Community / Events, Applications / Bookings, Commerce, Content / Media | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataTeamNestedStackTeamNestedStackR-1JDKU82MS8003 | Business content; authorization still required | Yes |
| TeamMembership | Team Hub | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataTeamMembershipNestedStackTeamMe-WCZXVS62U7CN | PERSONAL / authorization / private records | Not established |
| TeamRosterSlot | Team Hub | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataTeamRosterSlotNestedStackTeamRo-14YH10PBU6UWL | Business content; authorization still required | Not established |
| PlayerChampionPoolEntry | Team Hub | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataPlayerChampionPoolEntryNestedSt-7CZOVYLEJDGR | Business content; authorization still required | Not established |
| UserProfile | Core / Account | Core / Account, Community / Events | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataUserProfileNestedStackUserProfi-1N1L9N5L89W4E | PERSONAL / authorization / private records | Yes |
| EventTag | Community / Events | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataEventTagNestedStackEventTagNest-737IG4DYC2PL | Business content; authorization still required | Not established |
| Event | Community / Events | Applications / Bookings, Commerce, Community / Events, Creator Platform, Partner Hub, Trainer Hub, Tournaments | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataEventNestedStackEventNestedStac-18RFDG5DRM1MX | Business content; authorization still required | Yes |
| EventSuggestion | Community / Events | Community / Events | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataEventSuggestionNestedStackEvent-1CI9RHWHY9BV9 | Business content; authorization still required | Not established |
| ForumCategory | Community / Events | Core / Account, Community / Events | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataForumCategoryNestedStackForumCa-1EOR1WM67HK4Z | Business content; authorization still required | Yes |
| ForumBoard | Community / Events | Core / Account, Community / Events | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataForumBoardNestedStackForumBoard-1PCQXC9CL4RO | Business content; authorization still required | Yes |
| ForumThread | Community / Events | Core / Account, Community / Events | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataForumThreadNestedStackForumThre-1OVNN240N4AMW | Business content; authorization still required | Yes |
| ForumPost | Community / Events | Core / Account, Community / Events | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataForumPostNestedStackForumPostNe-1THTUDPS84PPM | Business content; authorization still required | Yes |
| ForumActivity | Community / Events | Core / Account, Community / Events | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataForumActivityNestedStackForumAc-1KJW3GQ4OX1OW | Business content; authorization still required | Yes |
| BoardPermissionRule | Community / Events | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataBoardPermissionRuleNestedStackB-1EIFA8L7IK65U | PERSONAL / authorization / private records | Not established |
| Brand | Core / Account | Investor Access, Commerce, Creator Platform, Partner Hub, Core / Admin, Team Hub, Community / Events, Applications / Bookings, Content / Media | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataBrandNestedStackBrandNestedStac-8RGRVMAA8YC2 | Business content; authorization still required | Yes |
| MerchCategory | Commerce | Commerce | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataMerchCategoryNestedStackMerchCa-WTCPHSCGWFKY | Business content; authorization still required | Not established |
| MerchProduct | Commerce | Commerce | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataMerchProductNestedStackMerchPro-1TGFUUPFFPBM9 | Business content; authorization still required | Not established |
| MerchProductVariant | Commerce | Commerce | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataMerchProductVariantNestedStackM-9W53RFLOJ5X2 | Business content; authorization still required | Not established |
| FulfillmentOrder | Commerce | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataFulfillmentOrderNestedStackFulf-19CCN2HVV52UG | PERSONAL / financial transaction records | Not established |
| MerchProductBrand | Commerce | Commerce | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataMerchProductBrandNestedStackMer-1OZBR5Y33V2X2 | Business content; authorization still required | Not established |
| MerchProductCategory | Commerce | Commerce | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataMerchProductCategoryNestedStack-1DWXBY78GY0GT | Business content; authorization still required | Not established |
| BrandAccess | Core / Account | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataBrandAccessNestedStackBrandAcce-FY7QBTKXJ2V5 | PERSONAL / authorization / private records | Not established |
| BrandAccessPermission | Core / Account | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataBrandAccessPermissionNestedStac-UUABYLRAR3LQ | PERSONAL / authorization / private records | Not established |
| MediaCollection | Content / Media | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataMediaCollectionNestedStackMedia-1XQJV1IB641DT | Business content; authorization still required | Not established |
| MediaItem | Content / Media | Backend-only / no literal frontend reference | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataMediaItemNestedStackMediaItemNe-1CSA9MP7VMVZU | Business content; authorization still required | Not established |
| MerchProductImage | Commerce | Commerce | amplify-projectrespawnwebsite-Ntgre-sandbox-amplifyDataMerchProductImageNestedStackMer-TY41JHKTHP6Y | Business content; authorization still required | Not established |

Storage: projectRespawnStorage serves public/*, identity-private files, backend-authorized investor-data-room documents and separately granted team logo prefixes. Native OverlayPublication, OverlaySourceConnection and TwitchEventDeliveryDedupe tables belong to the legacy overlay stack. External SWG release storage is a different boundary. Token/OAuth/nonce records are security state; application/investor/profile/membership records carry personal/authorization data. No secret values are included.

## Cognito and identity

Retain **one Project Respawn identity authority per environment**, not per domain. Ntgre keeps its protected managed Cognito deployment; this is not permission to point localhost at production. auth/mode.ts permits referenceAuth only through reviewed branch configuration and prevents that mode in local sandbox/master. Existing physical identity ownership remains LegacyPlatform.

Login, registration/confirmation, password reset and session handling use Amplify Cognito. UserProfile is app data distinct from immutable Cognito sub. Declared groups: SuperAdmin, Admin, Staff, Moderator, Trainer, Therapist, StreamingPartner, AffiliatePartner, Member, BetaMember.

Core owns issuer/client/sub, session lifecycle, identity/profile and shared permission vocabulary. Products own authorization: Creator workspace/Brand roles, Team membership/capabilities, Investor level/NDA/expiry, moderation and future Tournament roles. UI role labels alone do not authorize APIs. Admin is a composition of product-specific controls.

Review gaps: Therapist has no auth/group route requirement; Trainer/Partner require login but no product group; Admin authentication is partly inside AdminLayout; coach requiredCapability metadata is not explicitly evaluated by the global router (membership/roles and backend policy are separate). These are boundary-review findings, not demonstrated access to live private records. Test each allowed/denied persona before launching real sensitive workflows.

## Duplication, legacy and dead-code candidates

**61 unreachable Vue candidates** are listed individually in website-feature-domain-map.json. This is not a deletion list: dynamic string loading, separate entrypoints or external consumption remain possible. Windows case-only paths were reconciled; active AdminEvents is not falsely marked dead.

- ACTIVE: Bot/OverlayEngine/Overlay.vue still serves /tts-overlay, despite its legacy folder name.
- ACTIVE/POSSIBLY_DUPLICATE: /esports/tournaments/:tournamentId and /tournaments/:tournamentSlug both exist. Preserve links until their roles are agreed.
- LEGACY: Profile_old/Account.vue; TeamPool.vue whose route redirects to coach-review; amplify-backup outside the current backend entrypoint.
- DEAD_CANDIDATE: unrouted AboutProjectRespawn.vue has six missing ./tabs imports. The current /about uses views/About/About.vue and builds/renders successfully.
- UNKNOWN/POSSIBLY_ACTIVE: 15 custom operations have no literal frontend caller in this scan. Some are intended service/external hooks, including trusted application submission; others are capability foundations. They are listed in the backend call map and must not be deleted based on frontend reachability alone.

## Priority issues — no fixes made

| Priority | Category | Evidence / issue | Next decision |
|---|---|---|---|
| Critical to completion | Audit validation gap | Missing AWS credentials, authenticated acceptance and exact SWG external owner | Complete read-only checks and safe identity tests before full certification |
| High | PERFORMANCE/LOADING; ARCHITECTURE COUPLING | 2.17 MB main JS; eager unrelated features and global Team service | Approve lazy domain/frontend contract design |
| High | SECURITY/AUTH | Public Therapist demo; Trainer/Partner lack product role gate | Define domain permissions before real data; retain server checks |
| High | FIXTURE/DEMO; MISSING BACKEND | Creator analytics/Discord and Tournament lifecycle simulated; review/booking workflow incomplete | Distinguish product acceptance from rendered UI |
| High | APPLICATION BUG / error path | OverlayBrowserSource void load() rejects without handler and renders blank on failed fetch | Explicit loading/error/recovery behavior in a separately authorized fix |
| High | Local tests | Seven overlay asset-bundling failures on Windows entry resolution | Investigate test/subprocess portability; not a proven live outage |
| Medium | APPLICATION BUG / incomplete backend | /twitch/status and /twitch/connect registered, undispatched | Confirm consumers, then implement or retire separately |
| Medium | APPLICATION BUG / misleading status | TwitchModeration.saveSettings shows success even without persistence context | Success must reflect actual persistence |
| Medium | FIXTURE/DEMO | Hard-coded Twitch connected status and forum friends-online | Label or use actual operational state |
| Medium | DEAD CODE / legacy | /tts-overlay local WebSocket; unreachable Vue candidates | Establish consumers before retirement |
| Low | PLACEHOLDER | Automation teaser, empty public directories, old TournamentDetail | Align navigation/roadmap with capabilities |

No comprehensive security penetration test, accessibility audit, traffic-load test or payment compliance assessment is claimed.

## Phase 2 plan reassessment

The sibling-root direction, one shared identity and state-retention strategy remain valid. Existing Phase 2 already recognizes Intake/Investor as logical boundaries despite their Admin resource-accounting attribution. Do not turn that attribution bucket into a giant administrative backend.

Recommended adjustments, **not applied**:

1. Add the currently integrated SWG protected download service to explicit ownership/contract discovery. The website is not only a Buff Builder. Do not absorb swg-private-test or Companion by assumption.
2. Include Partner/Trainer/Therapist in the product catalog. Partner is provisionally a Creator commercial module; Trainer/Therapist need a product decision about shared coaching versus separate sensitive-care boundaries. Demo screens alone do not justify independent roots.
3. Split the Intake capability map into real submission/read and demo review/booking/induction modules. Do not create a scheduling root before real lifecycle needs exist.
4. Keep Core narrow: identity/profile/access vocabulary/media contracts. Keep product approvals/memberships in domains and Admin as frontend composition. Marketing/Esports remain frontend or projections.
5. Keep Creator one product owner with potentially separate control/runtime/delivery deployment lifecycles; persistent runtime extraction is more complex than a stateless API.
6. Keep Team roster/pools/coaching together, and all Tournament overview/team/match/draft/bracket/broadcast pages together. No cloud per page.

Order: resolve audit gaps and demo/product scope first; design frontend loading/contracts; settle external ownership; then reauthorize a bounded stateless proof. Tournament remains frozen. If its external blocker persists, a Team Hub read-only adapter proof could be proposed without moving tables, but is not authorized here. Migrate Creator persistent delivery and Commerce/order/fulfilment state late with explicit compatibility/rollback evidence. Existing Phase 2 plan documents were not changed.

## Tournament and LegacyPlatform status

Tournament: ProjectRespawn-Tournaments-Ntgre, one imported HTTP API msipnwy39j, last recorded UPDATE_ROLLBACK_COMPLETE, drift last recorded IN_SYNC. **Release 1 NOT COMPLETE.** Latest preserved focused inspection: 2026-09-30T11:49:07.211Z in [current-readonly-state.json](phase2a-tournament-inline-stage-evidence-2026-09-30/current-readonly-state.json). No new drift scan or deployment/API-tagging investigation was undertaken.

Founder Cup is fixture teams/matches/drafts/bracket/broadcast/news plus registration/lobby previews, not an operational tournament implementation. Independent preview handler/client/contracts exist but are not consumed by current pages. Candidate b75a91494c03606d825e234a65d295c184067820cd77dfc84e11a2c83484ae2f remains the prior approved deployment input, not the current-site audit baseline.

LegacyPlatform **2,621 / FunctionDirectiveStack 167** is the last full verified inventory, 2026-09-30T07:55:08.972Z: [legacy-before.json](phase2a-tournament-apigateway-authorization-v8-evidence-2026-09-30/legacy-before.json). The later focused snapshot reported unchanged root timestamp. Mandatory preflight attempted fresh read-only verification but stopped at NoCredentials. These figures are preserved evidence, not fresh verification. Production was not inspected or modified; AWS writes were zero.

## Complete page-to-domain matrix

Layout and redirect rows are retained for counting. Data columns show potential dependency reachability, not measured queries. Loading column is current mode / should lazy-load. Source lines/guards/aliases are in route inventory.

| ID | Route | Page | Status | Backend | Data dependencies | Current CFN owner | Future domain | Cognito | Loading / should lazy | Migration risk |
|---:|---|---|---|---|---|---|---|---|---|---|---|
| 1 | /SWG-EOF-test | SwgEofTest | UNKNOWN | Independent SWG download service | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | External SWG distribution root: UNRESOLVED | Games / SWG | Yes | Lazy / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 2 | /swg-beyond-buff-builder | SwgBeyondBuffBuilder | WORKING | Frontend-only | No product data dependency established | No product CFN owner / see target | Games / SWG | No | Lazy / Yes | LOW frontend; new backend authorization separate |
| 3 | /bookings | Bookings | FIXTURE_DEMO | Frontend fixtures/content | PermissionDefinition, GroupPermission, ApplicationSubmission | No product CFN owner / see target | Applications / Bookings | No | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 4 | /bookings/invite/:invitationToken | Bookings | FIXTURE_DEMO | Frontend fixtures/content | PermissionDefinition, GroupPermission, ApplicationSubmission | No product CFN owner / see target | Applications / Bookings | No | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 5 | /bookings/:bookingTypeSlug | Bookings | FIXTURE_DEMO | Frontend fixtures/content | PermissionDefinition, GroupPermission, ApplicationSubmission | No product CFN owner / see target | Applications / Bookings | No | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 6 | /induction/book/:invitationToken (redirect) | none | WORKING | redirect target | No product data dependency established | No product CFN owner / see target | Applications / Bookings | No | N/A / Yes | LOW frontend; new backend authorization separate |
| 7 | / | Home | WORKING | Frontend-only | No product data dependency established | No product CFN owner / see target | Website / Content | No | Eager / Optional | LOW frontend; new backend authorization separate |
| 8 | /about | About | WORKING | Frontend-only | No product data dependency established | No product CFN owner / see target | Website / Content | No | Eager / Optional | LOW frontend; new backend authorization separate |
| 9 | /investors | Investors | UNKNOWN | LegacyPlatform | InvestorAccessRequest | LegacyPlatform (nested owners in call/model maps) | Investor Access | No | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 10 | /investors/data-room | InvestorDataRoom | UNKNOWN | LegacyPlatform | InvestorAccess, InvestorAccessAuditEvent | LegacyPlatform (nested owners in call/model maps) | Investor Access | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 11 | /careers | Careers | WORKING | Frontend-only | No product data dependency established | No product CFN owner / see target | Website / Content | No | Eager / Optional | LOW frontend; new backend authorization separate |
| 12 | /creators | Creators | PLACEHOLDER | Frontend fixtures/content | No product data dependency established | No product CFN owner / see target | Website / Content | No | Eager / Optional | LOW frontend; new backend authorization separate |
| 13 | /partners | Partners | PLACEHOLDER | Frontend fixtures/content | No product data dependency established | No product CFN owner / see target | Website / Content | No | Eager / Optional | LOW frontend; new backend authorization separate |
| 14 | /contact | Contact | WORKING | Frontend-only | No product data dependency established | No product CFN owner / see target | Website / Content | No | Eager / Optional | LOW frontend; new backend authorization separate |
| 15 | /privacy-policy | MainPrivacyPolicy | WORKING | Frontend-only | No product data dependency established | No product CFN owner / see target | Website / Content | No | Eager / Optional | LOW frontend; new backend authorization separate |
| 16 | /join-us | TeamTryouts | WORKING | Frontend-only | No product data dependency established | No product CFN owner / see target | Applications / Bookings | No | Eager / Yes | LOW frontend; new backend authorization separate |
| 17 | /team-tryouts (redirect) | none | WORKING | redirect target | No product data dependency established | No product CFN owner / see target | Applications / Bookings | No | N/A / Yes | LOW frontend; new backend authorization separate |
| 18 | /merch | Merch | UNKNOWN | LegacyPlatform | MerchProduct, Brand, MerchCategory, MerchProductBrand, MerchProductCategory, MerchProductVariant, MediaItem, MerchProductImage | LegacyPlatform (nested owners in call/model maps) | Commerce | No | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 19 | /checkout | Checkout | UNKNOWN | LegacyPlatform | No product data dependency established | LegacyPlatform (nested owners in call/model maps) | Commerce | No | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 20 | /events | Events | UNKNOWN | LegacyPlatform | Event, EventSuggestion | LegacyPlatform (nested owners in call/model maps) | Community / Events | No | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 21 | /join | Join | UNKNOWN | Frontend-only | No product data dependency established | No product CFN owner / see target | Core / Account | No | Eager / Yes | LOW frontend; new backend authorization separate |
| 22 | /account | Account | UNKNOWN | LegacyPlatform | UserProfile, ForumCategory, ForumBoard, ForumThread, ForumPost, ForumActivity, PermissionDefinition, GroupPermission, PermissionAuditEvent, EventTag, EventSuggestion, MerchCategory | LegacyPlatform (nested owners in call/model maps) | Core / Account | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 23 | /apply-now | Applications | UNKNOWN | LegacyPlatform | ApplicationSubmission, ApplicationAnswer, ApplicationCreatorProfile, ApplicationSchedule, ApplicationAuditEvent, ApplicationIdempotency, ApplicationPublicRateLimit | LegacyPlatform (nested owners in call/model maps) | Applications / Bookings | No | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 24 | /applications (redirect) | none | WORKING | redirect target | No product data dependency established | No product CFN owner / see target | Applications / Bookings | No | N/A / Yes | LOW frontend; new backend authorization separate |
| 25 | /apply (redirect) | none | WORKING | redirect target | No product data dependency established | No product CFN owner / see target | Applications / Bookings | No | N/A / Yes | LOW frontend; new backend authorization separate |
| 26 | /home | UserHomepage | UNKNOWN | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | LegacyPlatform (nested owners in call/model maps) | Core / Account | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 27 | /overlay-source/:credential | OverlayBrowserSource | PARTIALLY_WORKING | LegacyPlatform | OverlayPublication, OverlaySourceConnection, TwitchEventDeliveryDedupe | LegacyPlatform (nested owners in call/model maps) | Creator Platform | No | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 28 | /creator-tools (layout) | CreatorLayout | UNKNOWN | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | LegacyPlatform (nested owners in call/model maps) | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 29 | /creator-tools | CreatorDashboard | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | No product CFN owner / see target | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 30 | /creator-tools/profile | CreatorProfile | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | No product CFN owner / see target | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 31 | /creator-tools/twitch | TwitchOverview | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | No product CFN owner / see target | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 32 | /creator-tools/discord | CreatorDiscord | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | No product CFN owner / see target | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 33 | /creator-tools/bots | BotsOverview | PARTIALLY_WORKING | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | LegacyPlatform (nested owners in call/model maps) | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 34 | /creator-tools/bots/twitch/commands | BasicCommands | UNKNOWN | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, PermissionAuditEvent, TwitchCommand, TwitchIntegration, TwitchRuntimeHealth | LegacyPlatform (nested owners in call/model maps) | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 35 | /creator-tools/bots/twitch/alerts | TwitchAlerts | PARTIALLY_WORKING | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, OverlayPublication, OverlaySourceConnection, TwitchEventDeliveryDedupe | LegacyPlatform (nested owners in call/model maps) | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 36 | /creator-tools/bots/twitch/tts | TextToSpeech | PARTIALLY_WORKING | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, TwitchIntegration, TwitchOAuthTransaction, TwitchRuntimeHealth, OverlayPublication, OverlaySourceConnection, TwitchEventDeliveryDedupe | LegacyPlatform (nested owners in call/model maps) | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 37 | /creator-tools/bots/moderation | TwitchModeration | PARTIALLY_WORKING | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, OverlayPublication, OverlaySourceConnection, TwitchEventDeliveryDedupe | LegacyPlatform (nested owners in call/model maps) | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 38 | /creator-tools/bots/automation | Automation | PLACEHOLDER | Frontend fixtures/content; Core auth/access guard | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | No product CFN owner / see target | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 39 | /creator-tools/chat | CreatorChat | PARTIALLY_WORKING | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, OverlayPublication, OverlaySourceConnection, TwitchEventDeliveryDedupe | LegacyPlatform (nested owners in call/model maps) | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 40 | /creator-tools/overlays | OverlayEntry | PARTIALLY_WORKING | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | LegacyPlatform (nested owners in call/model maps) | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 41 | /creator-tools/overlays/library | OverlayManager | PARTIALLY_WORKING | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | LegacyPlatform (nested owners in call/model maps) | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 42 | /creator-tools/overlays/:overlayId | OverlayEditor | PARTIALLY_WORKING | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, TwitchIntegration, TwitchOAuthTransaction, TwitchRuntimeHealth, OverlayPublication, OverlaySourceConnection, TwitchEventDeliveryDedupe | LegacyPlatform (nested owners in call/model maps) | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 43 | /creator-tools/community | CreatorCommunity | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | No product CFN owner / see target | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 44 | /creator-tools/rewards | CreatorRewards | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | No product CFN owner / see target | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 45 | /creator-tools/achievements | CreatorAchievements | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | No product CFN owner / see target | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 46 | /creator-tools/events | CreatorEvents | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | No product CFN owner / see target | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 47 | /creator-tools/members | CreatorMembers | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | No product CFN owner / see target | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 48 | /creator-tools/analytics | CreatorAnalytics | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | No product CFN owner / see target | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 49 | /creator-tools/integrations | Integrations | PARTIALLY_WORKING | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, TwitchIntegration, TwitchOAuthTransaction, TwitchRuntimeHealth, PermissionAuditEvent | LegacyPlatform (nested owners in call/model maps) | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 50 | /creator-tools/setup | CreatorSetup | PARTIALLY_WORKING | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, TwitchIntegration, TwitchOAuthTransaction, TwitchRuntimeHealth, PermissionAuditEvent | LegacyPlatform (nested owners in call/model maps) | Creator Platform | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 51 | /tts-overlay | Overlay | DEAD_LEGACY | Local legacy WebSocket service | No product data dependency established | No product CFN owner / see target | Creator Platform | No | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 52 | /partner | PartnerDashboard | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Partner Hub | Yes | Eager / Yes | LOW frontend; new backend authorization separate |
| 53 | /partner/profile | PartnerProfile | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Partner Hub | Yes | Eager / Yes | LOW frontend; new backend authorization separate |
| 54 | /partner/campaigns | PartnerCampaigns | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Partner Hub | Yes | Eager / Yes | LOW frontend; new backend authorization separate |
| 55 | /partner/analytics | PartnerAnalytics | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Partner Hub | Yes | Eager / Yes | LOW frontend; new backend authorization separate |
| 56 | /partner/creators | CreatorDiscovery | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Partner Hub | Yes | Eager / Yes | LOW frontend; new backend authorization separate |
| 57 | /trainer | TrainerDashboard | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Trainer Hub | Yes | Eager / Yes | LOW frontend; new backend authorization separate |
| 58 | /trainer/clients | TrainerClients | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Trainer Hub | Yes | Eager / Yes | LOW frontend; new backend authorization separate |
| 59 | /trainer/clients/:clientId | TrainerClientDetail | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Trainer Hub | Yes | Eager / Yes | LOW frontend; new backend authorization separate |
| 60 | /trainer/quests | TrainerQuests | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Trainer Hub | Yes | Eager / Yes | LOW frontend; new backend authorization separate |
| 61 | /trainer/challenges | TrainerChallenges | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Trainer Hub | Yes | Eager / Yes | LOW frontend; new backend authorization separate |
| 62 | /trainer/engagement | TrainerEngagement | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Trainer Hub | Yes | Eager / Yes | LOW frontend; new backend authorization separate |
| 63 | /therapist (layout) | TherapistLayout | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Therapist | No | Eager / Yes | LOW frontend; new backend authorization separate |
| 64 | /therapist | TherapistDashboard | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Therapist | No | Eager / Yes | LOW frontend; new backend authorization separate |
| 65 | /therapist/clients | TherapistClients | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Therapist | No | Eager / Yes | LOW frontend; new backend authorization separate |
| 66 | /therapist/clients/:clientId | TherapistQuests | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Therapist | No | Eager / Yes | LOW frontend; new backend authorization separate |
| 67 | /therapist/quests | TherapistQuests | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Therapist | No | Eager / Yes | LOW frontend; new backend authorization separate |
| 68 | /therapist/quests/new | TherapistQuestBuilder | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Therapist | No | Eager / Yes | LOW frontend; new backend authorization separate |
| 69 | /therapist/clients/:clientId/quests | TherapistQuests | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Therapist | No | Eager / Yes | LOW frontend; new backend authorization separate |
| 70 | /therapist/insights | TherapistInsights | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Therapist | No | Eager / Yes | LOW frontend; new backend authorization separate |
| 71 | /therapist/clients/:clientId/insights | TherapistInsights | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Therapist | No | Eager / Yes | LOW frontend; new backend authorization separate |
| 72 | /therapist/reports | TherapistReports | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Therapist | No | Eager / Yes | LOW frontend; new backend authorization separate |
| 73 | /therapist/clients/:clientId/reports | TherapistReports | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Therapist | No | Eager / Yes | LOW frontend; new backend authorization separate |
| 74 | /therapist/settings | TherapistSettings | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Therapist | No | Eager / Yes | LOW frontend; new backend authorization separate |
| 75 | /esports | EsportsHome | PARTIALLY_WORKING | Frontend-only | No product data dependency established | No product CFN owner / see target | Esports | No | Eager / Yes | LOW frontend; new backend authorization separate |
| 76 | /esports/league-of-legends | LeagueOfLegendsTeam | PARTIALLY_WORKING | Frontend-only | No product data dependency established | No product CFN owner / see target | Esports | No | Lazy / Yes | LOW frontend; new backend authorization separate |
| 77 | /esports/tournaments/:tournamentId | TournamentDetail | PLACEHOLDER | Frontend fixtures/content | No product data dependency established | No product CFN owner / see target | Esports | No | Lazy / Yes | LOW frontend; new backend authorization separate |
| 78 | /team-hub/:teamSlug/manage | TeamManagement | UNKNOWN | LegacyPlatform | Team, TeamMembership, TeamRosterSlot, PlayerChampionPoolEntry | LegacyPlatform (nested owners in call/model maps) | Team Hub | Yes | Lazy / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 79 | /team-hub | TeamHubHome | UNKNOWN | LegacyPlatform | Team, TeamMembership, TeamRosterSlot, PlayerChampionPoolEntry | LegacyPlatform (nested owners in call/model maps) | Team Hub | Yes | Lazy / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 80 | /team-hub/:teamSlug | TeamHome | UNKNOWN | LegacyPlatform | Team, TeamMembership, TeamRosterSlot, PlayerChampionPoolEntry | LegacyPlatform (nested owners in call/model maps) | Team Hub | Yes | Lazy / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 81 | /team-hub/:teamSlug/champion-pool | ChampionPool | UNKNOWN | LegacyPlatform | Team, TeamMembership, TeamRosterSlot, PlayerChampionPoolEntry | LegacyPlatform (nested owners in call/model maps) | Team Hub | Yes | Lazy / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 82 | /team-hub/:teamSlug/coach-review | CoachPoolReview | UNKNOWN | LegacyPlatform | Team, TeamMembership, TeamRosterSlot, PlayerChampionPoolEntry | LegacyPlatform (nested owners in call/model maps) | Team Hub | Yes | Lazy / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 83 | /team-hub/:teamSlug/team-pool (redirect) | none | WORKING | redirect target | Team, TeamMembership, TeamRosterSlot, PlayerChampionPoolEntry | No product CFN owner / see target | Team Hub | Yes | N/A / Yes | LOW frontend; new backend authorization separate |
| 84 | /tournaments (redirect) | none | WORKING | redirect target | No product data dependency established | No product CFN owner / see target | Tournaments | No | N/A / Yes | LOW frontend; new backend authorization separate |
| 85 | /tournaments/:tournamentSlug (layout) | TournamentShell | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Tournaments | No | Lazy / Yes | LOW frontend; new backend authorization separate |
| 86 | /tournaments/:tournamentSlug | TournamentOverview | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Tournaments | No | Lazy / Yes | LOW frontend; new backend authorization separate |
| 87 | /tournaments/:tournamentSlug/teams | TournamentTeams | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Tournaments | No | Lazy / Yes | LOW frontend; new backend authorization separate |
| 88 | /tournaments/:tournamentSlug/matches | TournamentMatches | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Tournaments | No | Lazy / Yes | LOW frontend; new backend authorization separate |
| 89 | /tournaments/:tournamentSlug/drafts | TournamentDraftCentre | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Tournaments | No | Lazy / Yes | LOW frontend; new backend authorization separate |
| 90 | /tournaments/:tournamentSlug/broadcast | TournamentRespawnBroadcast | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Tournaments | No | Lazy / Yes | LOW frontend; new backend authorization separate |
| 91 | /tournaments/:tournamentSlug/partner-streams | TournamentPartnerStreams | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Tournaments | No | Lazy / Yes | LOW frontend; new backend authorization separate |
| 92 | /tournaments/:tournamentSlug/bracket | TournamentBracketResults | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Tournaments | No | Lazy / Yes | LOW frontend; new backend authorization separate |
| 93 | /tournaments/:tournamentSlug/news | TournamentNews | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Tournaments | No | Lazy / Yes | LOW frontend; new backend authorization separate |
| 94 | /tournaments/:tournamentSlug/info | TournamentInfo | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Tournaments | No | Lazy / Yes | LOW frontend; new backend authorization separate |
| 95 | /tournaments/:tournamentSlug/matches/:matchId | TournamentMatchDetail | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Tournaments | No | Lazy / Yes | LOW frontend; new backend authorization separate |
| 96 | /tournaments/:tournamentSlug/drafts/:matchId | TournamentDraftSpectator | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Tournaments | No | Lazy / Yes | LOW frontend; new backend authorization separate |
| 97 | /tournaments/:tournamentSlug/register | TournamentRegistration | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Tournaments | No | Lazy / Yes | LOW frontend; new backend authorization separate |
| 98 | /tournaments/:tournamentSlug/matches/:matchId/lobby | TournamentMatchLobby | FIXTURE_DEMO | Frontend fixtures/content | Local fixture/demo; schema presence elsewhere does not make this workflow live | No product CFN owner / see target | Tournaments | No | Lazy / Yes | LOW frontend; new backend authorization separate |
| 99 | /dashboard (layout) | AdminLayout | UNKNOWN | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | LegacyPlatform (nested owners in call/model maps) | Core / Admin | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 100 | /dashboard | AdminHome | UNKNOWN | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | LegacyPlatform (nested owners in call/model maps) | Core / Admin | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 101 | /dashboard/users | AdminUsers | UNKNOWN | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | LegacyPlatform (nested owners in call/model maps) | Core / Admin | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 102 | /dashboard/permissions | AdminPermissions | UNKNOWN | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, PermissionAuditEvent | LegacyPlatform (nested owners in call/model maps) | Core / Admin | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 103 | /dashboard/investors | AdminInvestors | UNKNOWN | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, InvestorAccessRequest, InvestorAccess, InvestorAccessAuditEvent | LegacyPlatform (nested owners in call/model maps) | Investor Access | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 104 | /dashboard/esports/teams | TeamAdministration | UNKNOWN | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, Team, TeamMembership, TeamRosterSlot, PlayerChampionPoolEntry | LegacyPlatform (nested owners in call/model maps) | Team Hub | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 105 | /dashboard/events | AdminEvents | UNKNOWN | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | LegacyPlatform (nested owners in call/model maps) | Community / Events | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 106 | /dashboard/applications | AdminApplications | UNKNOWN | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, ApplicationSubmission | LegacyPlatform (nested owners in call/model maps) | Applications / Bookings | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 107 | /dashboard/applications/reviews | AdminApplicationReviews | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, ApplicationSubmission | No product CFN owner / see target | Applications / Bookings | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 108 | /dashboard/applications/reviewers | AdminReviewerPerformance | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, ApplicationSubmission | No product CFN owner / see target | Applications / Bookings | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 109 | /dashboard/applications/reviewers/:reviewerId | AdminReviewerDetail | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, ApplicationSubmission | No product CFN owner / see target | Applications / Bookings | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 110 | /dashboard/availability | AdminAvailability | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, ApplicationSubmission | No product CFN owner / see target | Applications / Bookings | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 111 | /dashboard/applications/availability (redirect) | none | WORKING | redirect target | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission | No product CFN owner / see target | Applications / Bookings | Yes | N/A / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 112 | /dashboard/applications/inductions | AdminInductions | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, ApplicationSubmission | No product CFN owner / see target | Applications / Bookings | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 113 | /dashboard/applications/inductions/:inductionId | AdminInductionDetail | FIXTURE_DEMO | Frontend fixtures/content; Core auth/access guard | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, ApplicationSubmission | No product CFN owner / see target | Applications / Bookings | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 114 | /dashboard/applications/:applicationId/review | AdminApplicationReview | PARTIALLY_WORKING | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, ApplicationSubmission | LegacyPlatform (nested owners in call/model maps) | Applications / Bookings | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 115 | /dashboard/applications/:applicationId | AdminApplicationDetail | PARTIALLY_WORKING | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, ApplicationSubmission | LegacyPlatform (nested owners in call/model maps) | Applications / Bookings | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 116 | /dashboard/forums | AdminForums | UNKNOWN | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, ForumCategory, ForumBoard, ForumThread, PermissionAuditEvent, EventTag, EventSuggestion, ForumPost, MerchCategory | LegacyPlatform (nested owners in call/model maps) | Community / Events | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 117 | /dashboard/brands | AdminBrands | UNKNOWN | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, PermissionAuditEvent | LegacyPlatform (nested owners in call/model maps) | Core / Admin | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 118 | /dashboard/brand-permissions | BrandPermissions | UNKNOWN | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, PermissionAuditEvent | LegacyPlatform (nested owners in call/model maps) | Core / Admin | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 119 | /dashboard/merch-categories | AdminMerchCategories | UNKNOWN | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, MerchCategory, PermissionAuditEvent, EventTag, EventSuggestion, ForumCategory, ForumBoard, ForumThread, ForumPost | LegacyPlatform (nested owners in call/model maps) | Commerce | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 120 | /dashboard/product-control | ProductControl | UNKNOWN | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, PermissionAuditEvent, MerchProduct, MerchProductBrand, MerchProductVariant, MediaCollection, MediaItem, MerchCategory, MerchProductCategory, MerchProductImage | LegacyPlatform (nested owners in call/model maps) | Commerce | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 121 | /dashboard/media-library | MediaLibrary | UNKNOWN | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, PermissionAuditEvent, MediaCollection, MediaItem, MerchProductImage | LegacyPlatform (nested owners in call/model maps) | Content / Media | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 122 | /dashboard/orders | AdminOrders | UNKNOWN | LegacyPlatform | CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet, PermissionDefinition, GroupPermission, Brand, BrandAccess, BrandAccessPermission, FulfillmentOrder, PermissionAuditEvent | LegacyPlatform (nested owners in call/model maps) | Commerce | Yes | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 123 | /forum (layout) | ForumLayout | PARTIALLY_WORKING | LegacyPlatform | ForumCategory, ForumBoard, ForumThread, ForumPost, UserProfile, ForumActivity, PermissionDefinition, GroupPermission, PermissionAuditEvent, EventTag, EventSuggestion, MerchCategory | LegacyPlatform (nested owners in call/model maps) | Community / Events | No | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 124 | /forum | ForumIndex | PARTIALLY_WORKING | LegacyPlatform | ForumCategory, ForumBoard, ForumThread, ForumPost, UserProfile, ForumActivity, PermissionDefinition, GroupPermission, PermissionAuditEvent, EventTag, EventSuggestion, MerchCategory | LegacyPlatform (nested owners in call/model maps) | Community / Events | No | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 125 | /forum/board/:boardSlug | ForumBoard | PARTIALLY_WORKING | LegacyPlatform | ForumCategory, ForumBoard, ForumThread, ForumPost, UserProfile, ForumActivity, PermissionDefinition, GroupPermission, PermissionAuditEvent, EventTag, EventSuggestion, MerchCategory | LegacyPlatform (nested owners in call/model maps) | Community / Events | No | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 126 | /forum/thread/:threadSlug | ForumThread | PARTIALLY_WORKING | LegacyPlatform | ForumCategory, ForumBoard, ForumThread, ForumPost, UserProfile, ForumActivity, PermissionDefinition, GroupPermission, PermissionAuditEvent, EventTag, EventSuggestion, MerchCategory | LegacyPlatform (nested owners in call/model maps) | Community / Events | No | Eager / Yes | HIGH if moving state; frontend boundary refactor LOW/MEDIUM |
| 127 | /brand-permissions (redirect) | none | WORKING | redirect target | No product data dependency established | No product CFN owner / see target | Core / Account | No | N/A / Yes | LOW frontend; new backend authorization separate |
| 128 | /:pathMatch(.*) | NotFound | WORKING | Frontend-only | No product data dependency established | No product CFN owner / see target | Website / Content | No | Eager / Optional | LOW frontend; new backend authorization separate |

## Completion gate and top next actions

Delivered: full configured-route inventory/matrix, model/custom-operation/adapter maps, current-workspace build/test results and offline route/alias checks. Still unresolved: live/authenticated business health, fresh Ntgre physical baseline, exact external SWG deployment owner, seven asset-bundling failures, and exhaustive runtime behavior behind dynamic service adapters. No hosted production-route verification was attempted under the production restriction.

1. Restore credentials for read-only Ntgre baseline/output verification; do not deploy/recreate infrastructure.
2. Use approved test identities/fixtures for protected read journeys and negative authorization tests without business writes.
3. Identify the independent SWG distribution root/handler/storage and contract; audit Companion separately if required.
4. Agree demo-to-product scope and acceptance criteria for Creator, Intake/Bookings, Trainer/Therapist and Tournament.
5. Review the proposed domain/loading changes, then separately authorize fixes or migration. Keep Tournament frozen until explicitly resumed.

**FULL WEBSITE AUDIT INCOMPLETE**
