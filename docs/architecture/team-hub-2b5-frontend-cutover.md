# Team Hub 2B5 — frontend and compatibility preparation

6 October 2026. **PREPARED CLIENT; APPLICATION CUTOVER NOT READY.** No route registration, live service, endpoint manifest, Cognito configuration or frontend authority was changed.

The dormant [cutover client](../../src/features/team-hub/api/cutover-client.mjs) consumes the existing accepted Team manifest and shared token-provider callback. It validates environment/account/region/endpoint/auth mode, refreshes identity on each call, sends an authority epoch, validates DTOs, rejects branding and never falls back to Legacy. It requires an explicit reviewed TARGET_WRITER activation descriptor; none exists in live configuration. Its frontend flag is not a server authority grant. [Consumer adapters](../../src/features/team-hub/services/cutover-consumers.mjs) support home summaries, slug-to-ID lookup and bounded admin operations. No global Amplify.configure switching or hard-coded API ID in client source.

## Route map

All current operations below still use the Legacy readTeamHub/mutateTeamHub gateway through `src/features/Team Hub/teamHub.service.js`.

| Route/consumer | Owner API operations | Readiness / remaining work |
|---|---|---|
| /team-hub dashboard | LIST_MY_TEAMS, CREATE_TEAM | Client ready; adapt summary DTO/capability controls, revisions and create result |
| /team-hub/:teamSlug | GET_TEAM_HUB | Deterministic slug adapter ready; convert Team context to current component model |
| /team-hub/:teamSlug/manage and roster | GET_TEAM_HUB, SEARCH_TEAM_ASSIGNABLE_USERS, UPDATE_TEAM, SET_MANAGER, MANAGE_MEMBER, SET_ROSTER_SLOT | Replace legacy revisions/payloads with explicit Team/member/epoch/target versions; account-result selection must resolve exact account privately |
| /team-hub/:teamSlug/champion-pool | LIST_MY_CHAMPION_POOL, UPSERT_MY_CHAMPION, DELETE_MY_CHAMPION | Map Player DTO and entry revisions; clear private state on account change |
| /team-hub/:teamSlug/coach-review | LIST_TEAM_CHAMPION_POOLS, GET_PLAYER_COMPETITIVE_DETAIL, UPSERT_COACH_ASSESSMENT | Preserve Manager/Coach projections; no private-note creation in rollback window; legacy form has additional deferred fields |
| /team-hub/:teamSlug/team-pool | Redirect to Coach Review | Preserve URL/name/role checks |
| /dashboard/esports/teams | LIST_MY_TEAMS, CREATE_TEAM, UPDATE_TEAM, SET_MANAGER, SET_TEAM_PLAN, SEARCH_TEAM_ASSIGNABLE_USERS | Admin consumer adapter ready; page remains Legacy. Global capability does not confer Manager/Coach access |
| /home shortcuts | LIST_MY_TEAMS, GET_TEAM_HUB | Bounded adapter ready; migrate current homepage view-model projection |

Two missing live routes (LIST_MY_TEAMS and directory search) are added to the offline product proposal using the existing API, JWT authorizer and Read integration. The candidate repository queries existing sparse GSIs for listing and strongly rereads base items before authorization. It does not Scan. The bounded listing ceiling is 500 candidate Teams; pagination and larger-scale listing behavior need live acceptance. Directory pagination is an additive candidate schema extension and must be deployed with its client.

## Measured loading boundary

[Measurement](team-hub-2b5-evidence-2026-10-06/frontend-measure.json): isolated candidate consumer/client bundle **17,116 bytes / 5,089 gzip**, four pure Team contract/client modules, zero foreign product imports. Construction is dormant and dynamically imported; no AWS SDK, Cognito management or unrelated product initialization in this graph.

The actual site build succeeds but the main entry is **2,162,918 bytes / 552,337 gzip**, plus its static API chunk. The current router/admin layout still eagerly includes unrelated product implementations. This is the unchanged application baseline, not a before/after cutover improvement. No live route was rewired, so application-level unrelated-client initialization/network absence has **not** been proven. The exact chunk/module graph is retained. Existing large-chunk and `/css/styles.css` build warnings remain.

Before cutover: convert the real Vue forms/read projections, make domain admin/guards dynamic, remove unexplained foreign implementations from the shared entry closure, build comparable before/after artifacts, and run cold/cache browser traces for /, Team, Admin and /home. Require zero unrelated product client initialization/API calls without navigation. Do not claim dormant scaffold pages satisfy those journeys. Core supplies identity/global capability; Team owns role checks. No global application loading refactor was silently performed during this backend preparation.

## Branding recommendation: option A

Disable logo upload/commit/remove for initial empty-source cutover; use the existing placeholder display. The candidate client and server reject all three mutations; the future source bucket policy denies all writes/deletes under the exact old logo prefix, including outstanding presigned requests. No new bucket, KMS key, CDN or owner storage deployment. Any existing logo at the final gate stops Mode A. Re-enablement requires a separate Team-owned storage/permission/rollback review and resolution of historical Staff branding grants.

## Compatibility contract

Legacy gateways remain functional under LEGACY_WRITER, then explicit maintenance/domain-moved errors. Generated model business operations are blocked at the underlying resources after transfer; no raw table consumer is introduced. Home/Admin use owner DTO adapters, not direct DynamoDB access. Browser/backend compatibility, old-client upgrade handling and account-switch state disposal remain final candidate acceptance gates. State fallback to stale Legacy data is forbidden.
