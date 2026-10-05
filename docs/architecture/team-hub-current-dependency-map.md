# Team Hub current dependency map

4 October 2026; source HEAD `96b100072f96d03be13e4bb73f5e9518b76a4ebb`, branch `phase2/team-hub-extraction`. **Inventory only. No application, schema, policy or infrastructure changes.** Companion: [extraction plan](team-hub-domain-extraction-plan.md), [target model](team-hub-target-domain-model.md), [migration contract](team-hub-migration-contract.md).

Evidence: [source inventory](team-hub-extraction-evidence-2026-10-04/current-source-inventory.json) records source hashes, literal imports, action arguments, model schemas and generated operations. [AWS inventory](team-hub-extraction-evidence-2026-10-04/current-aws-inventory.json) records fresh read-only Ntgre templates, resource logical/physical IDs, table metadata and recovery settings. No business records, users, tokens or logo objects were retrieved. API-key physical IDs are redacted. Historical [recovery](team-hub-post-phase1-recovery-2026-09-26.md) used authenticated browser **fixtures**, not live business acceptance; the [website audit](full-website-domain-audit-2026-09-30.md) likewise leaves connected workflows unverified.

## Frontend routes and behavior

Paths below use the existing `src/features/Team Hub/` directory. There are **seven configured Team Hub records: six pages and one redirect**, five lazy pages and one eager admin page. WORKING below certifies only the redirect; UNKNOWN means implemented but not currently live-accepted, not broken. PARTIAL means evidenced mixed persisted and local-only behavior.

| Route / name | File; loading | Auth and role | Calls / state | Classification |
|---|---|---|---|---|
| `/team-hub` / `team-hub-home` | `TeamHubHome.vue`; lazy | Signed in; create controls Admin/SuperAdmin | `listMyTeams`, `createTeam`; `useAuth`, bounded paging, component refs | PARTIAL: real teams; tournament is null and history empty |
| `/team-hub/:teamSlug` / `team-hub-team` | `TeamHome.vue`; lazy | Auth; `beforeEnter` gets server context; active member or permitted admin/branding viewer | `getTeamHub`, `useRoute`, TeamLogo; roster/entitlement display | UNKNOWN: implemented, tested wiring; no fresh live session |
| `/team-hub/:teamSlug/manage` / `team-hub-manage` | `TeamManagement.vue`; lazy | Auth; route ADMIN/MANAGER; backend checks per command | `getTeamHub`, `updateTeam`, `setTeamManager`, `manageTeamMember`, `setTeamRosterSlot`, `searchAssignableUsers`; local refs/view models | UNKNOWN |
| `/team-hub/:teamSlug/champion-pool` / `team-hub-champion-pool` | `champion-pool/ChampionPool.vue`; lazy | Auth route; active PLAYER required by own-pool backend | `getTeamHub`, `listMyChampionPool`, `upsertMyChampionPoolEntry`, `deleteMyChampionPoolEntry`; Riot catalogue; component refs | UNKNOWN |
| `/team-hub/:teamSlug/coach-review` / `team-hub-coach-review` | `champion-pool/CoachPoolReview.vue`; lazy | Auth; route COACH/MANAGER; assessment writes COACH only | `getTeamHub`, `listTeamChampionPools`, `upsertCoachAssessment`; Riot catalogue; local review/recommendation/flex state | PARTIAL: assessment persisted; approval, overall feedback, recommendations and flex confirmation partly local-only |
| `/team-hub/:teamSlug/team-pool` / `team-hub-team-pool` | route redirect to coach-review | Auth and COACH/MANAGER metadata | Preserves slug; target guard applies | WORKING redirect, not a composition backend |
| `/dashboard/esports/teams` / `AdminTeamAdministration` | `TeamAdministration.vue`; **eager** through admin routes/layout | `teams.branding.manage` route permission; AdminLayout requires signed-in SuperAdmin/Admin/Staff; server commands stricter | List/create/update, get context, manager search/assignment, plan, logo upload/commit/remove; `useAuth`, view models | UNKNOWN |

The user pages use Legacy AppSync through one service. Logo upload additionally PUTs to an S3 presigned URL; TeamLogo/img renders a signed GET URL. Catalogue requests fetch Data Dragon versions, champion JSON and images; only this public catalogue is cached in localStorage. There is no operational team-data localStorage fallback.

Other Team Hub files are `TeamHubSidebar.vue`, `TeamLogo.vue`, `teamHub.service.js`, `teamHub.viewModel.js`, `teamAdministration.viewModel.js`, `teamHubDashboard.js`, `teamBranding.js`, `championPool.constants.js`, `dataDragon.service.js`, CSS and the frontend tests. The JSON inventory enumerates every file/import, including unused artifacts.

`champion-pool/TeamPool.vue` is **LEGACY / unrouted fixture code**: hard-coded players/champion pools, browser-local compositions keyed by team slug, no Team Hub persistence. Do not migrate its fictional records as production data. `ChampionPool.js` is a legacy unreferenced options-component fragment; the live Vue page uses script setup. Sidebar “Soon” features have no independent routes or backend. There are no primary fixture-only or placeholder-only Team Hub routes; fixtures/local-only features exist within the components above.

Outside-domain consumers and lookalikes:

- `src/views/UserHomepage/UserHomepage.js` calls `listMyTeams` and `getTeamHub` and consumes `teamHubDashboard.js` to create role-aware shortcuts. It must receive a compatibility projection/client change at cutover.
- Global `src/router/index.js` and Team Hub route metadata eagerly import `resolveTeamRouteAccess`. `requiredCapability` is declared for Coach Review but is **not evaluated by the global router**; role checks and backend authority still apply.
- Admin layout and admin routes eagerly load TeamAdministration and other products. UserHomepage is another eager entry dependency. Five dynamic page imports therefore do not prove complete isolation.
- Esports League-of-Legends/team presentation, Tournament Teams and TeamTryouts were checked as similarly named areas. They do not consume Team Hub models/operations in current source; public esports rosters are demo data and tryouts belong to Applications. Future integration is a contract decision, not existing ownership.

## Import and initialization closure

The literal local import graph has **18 non-test Team Hub JS/Vue seeds and 20 local nodes** including shared `useAuth.js` and the shared logo asset. The stylesheet and tests are separately enumerated. Package leaves are Vue, Vue Router and Amplify auth/data/utils. Domain page code directly imports no Tournament, Creator, Commerce or Community implementation. This is static evidence, not a browser network trace.

`teamHub.service.js` imports `generateClient` from `aws-amplify/data` eagerly but constructs/caches its client only on first request. Do not claim merely importing that module issues a network request. Global shell/router/admin imports separately pull other product implementations and access-context logic into the entry bundle. `useAuth` is global session state; Team state is mostly per-component. There is no dedicated global Team store. Catalogue cache is public; private state and the cached client need an explicit logout/account-switch lifetime contract.

Target layout is `src/features/team-hub/{routes,pages,components,api,contracts,services,state}` or a clearly equivalent feature boundary. Move existing domain-owned helpers together; replace the service internals behind a versioned interface, dynamically load route guards and admin panels, and leave small auth/design primitives in Core. Avoid a cosmetic case/space rename before functional compatibility is proved. Do not copy the global router, full Amplify client, UserHomepage, AdminLayout or global access store into the domain.

## Backend operation map

All 18 actions traverse `teamHub.service.js` → authenticated AppSync `Query.readTeamHub` or `Mutation.mutateTeamHub` → FunctionDirectiveStack auth function → shared invoke function → shared `myFunction-rebuild` → `router/appSyncRouter.ts` → `teamHub/gateway.ts` → `teamHub/index.ts`. Gateway input is bounded at 8,192 serialized characters, scalar top-level values only, per-action field allowlists, JSON payload strings bounded separately. The exact arguments/remaps and handler names are in the source inventory.

| Action | Public operation / frontend wrapper and callers | Authority / data effects |
|---|---|---|
| LIST_MY_TEAMS | read / `listMyTeams`, `listAdminTeams`; home, admin, global homepage | Own active memberships; admin/qualifying Staff branding permission can list teams by status; signed logo URLs |
| GET_TEAM_HUB | read / `getTeamHub`; all operational views, guards, homepage | Active team membership, platform admin or branding permission; team, visible memberships, roster, capabilities and plan; signed logo |
| LIST_MY_CHAMPION_POOL | read / `listMyChampionPool`; ChampionPool | Active Player; own membership-index entries; coach fields stripped on this read |
| LIST_TEAM_CHAMPION_POOLS | read / `listTeamChampionPools`; Coach Review | Active Manager/Coach; team-index pool entries; Coach filters active Players, Manager has broader historical visibility |
| GET_PLAYER_COMPETITIVE_DETAIL | read / `getPlayerCompetitiveDetail`; exported, no current routed caller found | Manager/Coach; one Player membership, entries and slots; target inactive membership is not rejected consistently with list path |
| SEARCH_TEAM_ASSIGNABLE_USERS | read / `searchAssignableUsers`; management/admin | Platform admin or active team Manager; Cognito ListUsers prefix searches, max 10 combined results |
| CREATE_TEAM | mutate / `createTeam`; home/admin | Admin/SuperAdmin; create deterministic Team ID |
| UPDATE_TEAM | mutate / `updateTeam`; management/admin | Admin/SuperAdmin; name/status update, no expected revision |
| SET_MANAGER | mutate / `setTeamManager`; management/admin | Admin/SuperAdmin; exact email resolves canonical sub; Team + Membership + roster cleanup transaction |
| MANAGE_MEMBER | mutate / `manageTeamMember`; management | Active Manager, including no implicit admin bypass; assign/revoke Coach/Player with revision/roster cleanup transaction |
| SET_ROSTER_SLOT | mutate / `setTeamRosterSlot`; management | Active Manager; active Player target; position and one-starter-per-player guard; roster revision transaction |
| UPSERT_MY_CHAMPION | mutate / `upsertMyChampionPoolEntry`; ChampionPool | Active Player; caller-derived ID; create/update own entry, no expected entry revision |
| DELETE_MY_CHAMPION | mutate / `deleteMyChampionPoolEntry`; ChampionPool | Active Player; delete own entry including co-located coach assessment fields |
| UPSERT_COACH_ASSESSMENT | mutate / `upsertCoachAssessment`; Coach Review | Active Coach; active team Player and existing champion entry; updates coach fields |
| SET_TEAM_PLAN | mutate / `setTeamPlan`; admin | Admin/SuperAdmin; settings revision transaction; FREE/PRO/expiry; all listed Pro feature flags currently false |
| REQUEST_TEAM_LOGO_UPLOAD | mutate / `requestTeamLogoUpload`; admin upload helper | Platform admin or effective `teams.branding.manage`; PNG constraints, immutable team prefix; 300-second PUT URL |
| COMMIT_TEAM_LOGO | mutate / `commitTeamLogo`; admin upload helper | Same branding authority; S3 HEAD/GET validation, settings revision, old object cleanup |
| REMOVE_TEAM_LOGO | mutate / `removeTeamLogo`; admin | Same authority; settings revision, S3 deletion |

Other operations in the effective entry path are **not Team Hub business operations**: `getMyAccessContext` for admin/shell permissions, Cognito shared session/user-attribute calls, S3 signed PUT/GET and service HEAD/GET/DELETE, Data Dragon HTTPS requests, and IAM-authenticated generated AppSync model methods used by the Lambda. There is no dedicated Team Hub REST endpoint or subscription in source. Each of the four generated stacks contains ten resolvers (get/list/create/update/delete, two index queries and three subscriptions); their existence does not imply clients use subscriptions or have public model CRUD authority.

## Data, writers and ownership

All four tables use string `id` partition keys, no sort key, two ALL-projection GSIs, on-demand billing, and `NEW_AND_OLD_IMAGES` streams. Schema fields are retained verbatim in the machine inventory, including timestamps and optional fields via generated metadata. Physical suffix is `dxb2tdlulrch7hj2pts2mfijia-NONE`; these are **Ntgre**, not production.

| Model / physical table | Indexes | Writers / readers | Ownership and risk |
|---|---|---|---|
| Team / `Team-dxb2tdlulrch7hj2pts2mfijia-NONE` | `teamsBySlug`, `teamsByStatus` | Create/update, plan/logo, member/roster transaction revisions; all Team views | TEAM_HUB_OWNED; name/slug/game/status, manager/coach pointers, three revisions, plan/expiry/grant and logo metadata; HIGH migration risk |
| TeamMembership / `TeamMembership-dxb2tdlulrch7hj2pts2mfijia-NONE` | `teamMembershipsByTeamId`, `teamMembershipsByUserId` | Set Manager/manage member transactions; policy, lists, roster/pools | TEAM_HUB_OWNED; sub/display-name snapshot, one role per team+subject, active/revoked state and audit IDs; HIGH identity/revocation risk |
| TeamRosterSlot / `TeamRosterSlot-dxb2tdlulrch7hj2pts2mfijia-NONE` | `teamRosterSlotsByTeamId`, `teamRosterSlotsByMembershipId` | Roster/member-role/revocation transactions; team context/detail | TEAM_HUB_OWNED; STARTER/SUBSTITUTE plus hidden STARTER_GUARD; HIGH invariant risk |
| PlayerChampionPoolEntry / `PlayerChampionPoolEntry-dxb2tdlulrch7hj2pts2mfijia-NONE` | `playerChampionPoolEntriesByTeamId`, `playerChampionPoolEntriesByMembershipId` | Player create/update/delete; Coach field updates; own/team/detail reads | TEAM_HUB_OWNED; private ratings/notes and coach assessment share a row; HIGH privacy/concurrency risk |

All are stateful. No direct writer/reader in another product's application code was found; generated API operations and shared-role IAM remain possible access paths that require runtime/consumer evidence before retirement. The global homepage consumes the two-operation facade, not tables. Public display names on membership are snapshots, not ownership of global profiles.

Additional dependencies:

| Dependency | Classification | Current behavior / target boundary |
|---|---|---|
| Cognito pool/client/groups and stable sub | SHARED_CORE | Existing pool `eu-north-1_n24iLL7QE`, client `1iq7ovjaf7d16imdvbqgfgvf86`; auth stack. Team code uses ListUsers, not account creation. Future Core directory API owns lookup |
| PermissionDefinition, GroupPermission | SHARED_CORE | Direct reads by Team branding permission resolver; global permission administrators write them. Replace with bounded entitlement decision API |
| Brand, BrandAccess, BrandAccessPermission | SHARED_CORE / LEGACY_COMPATIBILITY | Indirect through `getMyAccessContext`, not Team business data. Brand rich-product fields require field ownership review; do not copy whole records |
| CreatorWorkspaceRecord, WorkspaceMembership, WorkspaceMembershipPermissionSet | OTHER_DOMAIN | Indirect global access-context workspace summaries only; no Team ownership or future direct table grants |
| Shared bucket + `team-logos/<teamId>/<uuid>.png` | Team association TEAM_HUB_OWNED; physical bucket LEGACY_COMPATIBILITY | `amplify-projectrespawnweb-projectrespawnstoragebuc-ketz6kwxegaw`; storage nested root. Future owned bucket or explicitly approved media API, not whole bucket access |
| Generated Schema/client, shared Lambda/invoke/table provider | LEGACY_COMPATIBILITY | Packaging/deployment coupling, not Core business ownership |
| Data Dragon catalogue/art | OTHER_DOMAIN (external) | Public browser fetch/cache, not authoritative player data |
| Historical coaching privacy and role semantics | UNRESOLVED | Manager versus Coach-only notes; inactive detail visibility; prospective product policy approval required |

The Team business path does **not** read UserProfile, Creator secrets, Tournament records or Commerce orders. Those capabilities must not be inherited merely because the old Lambda can reach them.

## CloudFormation accounting and state safeguards

Fresh read-only account check: `058264289478`, `eu-north-1`, `RavenTest`; protected root `amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332`, `UPDATE_COMPLETE`.

Each live model template contains **46 declarations**: 1 custom table, 1 IAM role, 1 AppSync data source, 32 AppSync functions, 10 resolvers and 1 CDK metadata resource. Four descendants = 184; add four parent nested handles = 188; add two Team gateway resolvers + two auth functions = **192**. Equivalently: 4 tables + 176 AppSync declarations + 12 other declarations. This confirms the old estimate rather than claiming savings now.

Shared dependencies are excluded from the exclusive 192: shared invoke function/data source/role/policy in FunctionDirectiveStack; main AppSync API/schema/NONE source; table-manager provider root; shared Lambda/role/default policy in the **data nested stack**, shared storage/auth, logs and generated introspection support. Full logical/physical mappings are in the AWS JSON. Shared Lambda is `amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV`; no Team-exclusive Lambda exists. FunctionDirectiveStack freshly counts **167**; full LegacyPlatform **2,621** is the accepted baseline, not a new recursive recount of all 62 stacks.

DescribeTable reports **0 approximate items for each table**. Exact records were not scanned; do not assume empty or bypass migration. AWS updates these estimates periodically: [DescribeTable](https://docs.aws.amazon.com/cli/latest/reference/dynamodb/describe-table.html). All four have PITR **DISABLED**, TTL **DISABLED**, deletion protection **false**. Their custom resources have `DeletionPolicy: Delete`, `UpdateReplacePolicy: Delete`, `allowDestructiveGraphqlSchemaUpdates: true`, `replaceTableUponGsiUpdate: true`. The shared bucket reports no versioning configuration. These are migration/retirement blockers until separately remediated and restore-tested; no protection was changed here. Absence of a customer-managed SSE setting does not mean DynamoDB data is unencrypted.

## Authorization findings to resolve before cutover

1. Authentication is AppSync-gated; handler identity requires canonical sub and rejects conflicting identity fields. Team roles are database memberships, **not** the platform Trainer/Staff/Cognito role names. There is no distinct implemented captain/owner role; creator metadata is not an authorization grant.
2. Admin/SuperAdmin manage Team/Manager/plan; Manager manages members/roster; Coach writes assessments; Player writes own pool. Admin is not automatically allowed competitive reads or Manager actions. Branding uses platform admin or permission resolution. Staff list/context checks explicitly require Staff; logo command permission checks are broader. Preserve or explicitly review this inconsistency.
3. Membership reads use generated GSI queries, then writes occur separately. Transaction revision checks help, but current code does not atomically recheck the acting membership on every privileged mutation. Target base-table membership checks and transactional policy epochs are required for revocation races.
4. Player own-list strips Coach fields, but Player upsert returns the unprojected model result. This is a **potential coach-field disclosure path** requiring a negative regression before reuse; no exploit or live private-data read was attempted.
5. Coach UI appends “Private:” text into `coachRecommendation`; Manager competitive responses include that same field. Coach-only privacy is not established. Separate visibility classes; do not infer privacy from the label.
6. Coach detail can address an inactive Player while Coach list filters active Players; define archival visibility consistently. Player deletion removes co-located Coach fields; entry edits and Team name/status updates lack version checks. Settings transaction conditions do not require record existence. Review integrity/concurrency before porting.
7. Approval/recommendation/flex/overall-feedback controls change local UI state without server commands. They are not durable features to declare migrated. Either mark them visibly local/deferred or authorize new backend contracts separately.
8. Directory prefix search exposes bounded account emails/usernames to Managers. Scope, privacy, rate limits and minimum-query policy belong in the Core directory contract; product runtime must not inherit Cognito admin.

Current regression checks: **47 backend tests + 26 frontend/contract/render tests passed**. Mocks and fixtures prove those cases only; they do not prove all live personas, policies or data invariants. No current source was modified to fix these findings.
