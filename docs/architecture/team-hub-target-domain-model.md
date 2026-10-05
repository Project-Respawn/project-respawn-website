# Team Hub target domain model and contracts

**Proposed design, 4 October 2026. No tables, API, manifest or runtime have been created.** Read with the [current dependency map](team-hub-current-dependency-map.md), [migration contract](team-hub-migration-contract.md) and [extraction plan](team-hub-domain-extraction-plan.md). Ownership follows the [domain standard](project-respawn-domain-architecture-standard.md); this document is not implementation or deployment authorization.

## Decision: compact native persistence, two bounded runtimes

Use an independent HTTP API with existing Cognito authentication, a Team Hub read Lambda and a Team Hub command Lambda. The separation is by read/write IAM privilege, not one Lambda per tiny operation. Both package only Team Hub logic, pure contracts and necessary SDK clients. No generated global Schema, shared business Lambda, root Amplify configuration or foreign infrastructure imports. AppSync remains the old compatibility facade during transition; a new GraphQL graph/subscription system is not justified by current request/response behavior.

Use **two native DynamoDB tables** for the initial complete target: an operational table for transactional Team aggregates and a journal table for audit/idempotency. Separate journal retention/append behavior is justified; unrelated product data must not be combined to reduce resource counts. An owned private S3 bucket is the proposed final logo store. Existing logos stay in the shared bucket until explicitly migrated; an approved prefix-scoped media API is an alternative if shared media is ready first. No new bucket/table is needed in the initial stateless skeleton.

Table names, ARNs and index names are proposals and resolved by the eventual stack. Existing external Team IDs/slugs and membership IDs remain stable. Never replace Cognito subjects or turn email into a key. Scope all subjects to the approved issuer/environment.

## Operational table: explicit access patterns

Keys are strings `PK`, `SK`. Each entity carries `schemaVersion`, `entityType`, stable external ID, created/updated timestamps and an integer `version` where mutable. A single Team partition is appropriate for the current bounded roster (50-member safety bound); growth/hot-key tests must precede larger-team promises.

| Entity | Proposed keys | Data and invariants |
|---|---|---|
| Team | `TEAM#<teamId>` / `META` | slug, name, game, status, manager/coach references, membership/roster/settings revisions, authorization epoch; atomic unique slug reservation |
| Slug lookup | `SLUG#<normalizedSlug>` / `TEAM` | Team ID; conditional create in same transaction as Team; do not trust an eventual GSI for uniqueness |
| TeamMembership | `TEAM#<teamId>` / `MEMBER#<sub>` | stable legacy membershipId, canonical subject, display-name snapshot, one active role MANAGER/COACH/PLAYER, status/revocation/actor timestamps and version |
| Roster starter | `TEAM#<teamId>` / `STARTER#<gameRole>` | active Player subject/reference; exactly one active occupant per role |
| Starter guard | `TEAM#<teamId>` / `STARTER_PLAYER#<sub>` | prevents a player occupying multiple starter positions; transactional with slot changes |
| Substitute | `TEAM#<teamId>` / `SUB#<sub>#<gameRole>` | Player reference and active/inactive slot state |
| Player champion entry | `TEAM#<teamId>` / `POOL#<sub>#<championId>` | comfort S–D, LOW/NORMAL/HIGH priority, competitiveReady, role metadata, player notes, version; role is **not** part of identity |
| Coach assessment | `TEAM#<teamId>` / `ASSESSMENT#<sub>#<championId>` | coach tier/assessment/recommendation/priority, author/time/version, explicit visibility; separate from Player-editable item |
| Team settings | Initially fields on Team META | FREE/PRO administrative grant, expiry and logo reference, preserving settingsRevision. No Commerce/payment integration implied; false Pro feature flags stay false |

There is no new global PlayerProfile table. A TeamPlayer is a membership plus an approved Core profile reference/snapshot. No persisted competition history, draft compositions, player approval workflow or recommendation inbox is invented from the current demo controls. Those need separate product contracts.

Two proposed sparse GSIs:

1. `BySubject`: membership items only, `GSI1PK=SUBJECT#<sub>`, `GSI1SK=TEAM#<teamId>`. Candidate list for “my teams”; revalidate base membership and Team status before returning sensitive data or authorizing.
2. `ByTeamStatus`: Team META only, `GSI2PK=STATUS#<status>`, `GSI2SK=TEAM#<teamId>`. Authorized administrative listing. Do not project private notes or use the index as an authorization decision.

Team context, roster, pool and assessment lists use bounded base partition/sort-prefix queries. Exact caller membership is a strongly consistent base-key read; GSI eventual consistency must not extend revoked access. [AWS read-consistency behavior](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html). Limit fields and pagination; signed opaque cursors bind operation, subject, team, filter, version and expiry. Client-supplied cursors cannot authorize another partition. Cross-team administration remains explicitly permissioned.

## Journal table and mutation guarantees

Audit items: `PK=TEAM#<teamId>`, `SK=AUDIT#<time>#<requestId>`; append only with actor subject, action, resource references, outcome, before/after versions and correlation ID. Do not store tokens, emails from directory searches or raw private notes. Define business retention and reviewer access before deployment; current console audit messages are not a durable audit ledger.

Idempotency items: `PK=REQUEST#<issuerHash>#<sub>`, `SK=<operation>#<idempotencyKey>`, including request digest, outcome, resulting entity versions and expiry. Same key/different digest returns conflict. Enforce expiration in code; TTL cleanup timing is not an authorization or idempotency guarantee. Proposed request window is 24 hours, subject to owner review. Audit has an independently approved retention period, not the request TTL.

Within one transaction, condition the Team's active state/authorization epoch, acting membership role/status/version, target membership where applicable, expected aggregate/entity revision, uniqueness guards, operational update, audit append and idempotency result. Conditions for an item being updated go on that Update/Put; do not separately ConditionCheck the same item. Plan against measured transaction size; current code intentionally limits itself to 25 items. DynamoDB supports up to 100 distinct transaction items, but that service limit is not permission to silently expand product limits. [AWS transaction constraints](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html).

Serialize membership/roster changes with aggregate revisions; revocation increments the authorization epoch and atomically deactivates dependent slots/guards. Prohibit record resurrection with `attribute_exists` where updating an existing Team. Entity-level expected versions protect Player/Coach concurrent edits. Never overwrite the Coach item in a Player mutation. Player removal of a champion must follow an explicit assessment-retention/archive rule, not silently destroy private Coach history. Return explicit allowlisted DTOs on **every** read and mutation.

PITR, deletion protection and retain-on-removal/replacement are required target defaults, subject to a reviewed generated template. Use native service-managed encryption unless sensitivity policy requires an owned key. Do not grant access to unrelated business keys. Separate sensitivity/retention for possible future clinical coaching is unresolved and outside this ordinary esports domain.

## Proposed `team-hub.v1` HTTP surface

Preserve semantics of all 18 gateway actions, including presently unused exported detail, behind a versioned client. This is a design table, not a deployed API or exact final route naming decision.

| Method and path | Existing action | Runtime |
|---|---|---|
| GET `/v1/teams` | LIST_MY_TEAMS, admin status filter only when permitted | Read |
| GET `/v1/teams/{teamId}` | GET_TEAM_HUB; slug may be resolved by documented query parameter | Read |
| GET `/v1/teams/{teamId}/me/champions` | LIST_MY_CHAMPION_POOL | Read |
| GET `/v1/teams/{teamId}/champion-pools` | LIST_TEAM_CHAMPION_POOLS | Read |
| GET `/v1/teams/{teamId}/players/{membershipId}/competitive` | GET_PLAYER_COMPETITIVE_DETAIL | Read |
| POST `/v1/directory/assignable-search` | SEARCH_TEAM_ASSIGNABLE_USERS; query in body, never log it | Read via bounded Core contract |
| POST `/v1/teams` | CREATE_TEAM | Command |
| PATCH `/v1/teams/{teamId}` | UPDATE_TEAM | Command |
| PUT `/v1/teams/{teamId}/manager` | SET_MANAGER, assign/revoke command | Command |
| POST `/v1/teams/{teamId}/members` | MANAGE_MEMBER, assign/revoke command | Command |
| POST `/v1/teams/{teamId}/roster-slots` | SET_ROSTER_SLOT, assign/remove command | Command |
| PUT `/v1/teams/{teamId}/me/champions/{championId}` | UPSERT_MY_CHAMPION | Command |
| DELETE `/v1/teams/{teamId}/me/champions/{championId}` | DELETE_MY_CHAMPION | Command |
| PUT `/v1/teams/{teamId}/players/{membershipId}/assessments/{championId}` | UPSERT_COACH_ASSESSMENT | Command |
| PUT `/v1/teams/{teamId}/plan` | SET_TEAM_PLAN | Command |
| POST `/v1/teams/{teamId}/logo-upload-intents` | REQUEST_TEAM_LOGO_UPLOAD | Command |
| PUT `/v1/teams/{teamId}/logo` | COMMIT_TEAM_LOGO | Command |
| DELETE `/v1/teams/{teamId}/logo` | REMOVE_TEAM_LOGO | Command |

Define one route/body identity source and reject mismatches. IDs containing colon must round-trip through URL encoding. All responses include contract version, request ID and relevant version/cursor; errors have stable codes (`UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INVALID_INPUT`, `LIMIT_EXCEEDED`, `DEPENDENCY_UNAVAILABLE`) without leaking team existence to outsiders. Preserve existing frontend error mapping during compatibility. Full JSON schemas, max lengths, pagination and negative cases are a 2B1 deliverable before implementation is accepted.

Caller identity comes solely from validated authorizer context. Validate existing issuer/client, signature, expiry and access-token purpose; API authorizer configuration alone must not accidentally accept ID tokens. Fail closed for mismatched environment, subject or claims. Platform admin grants remain distinct from Team membership; Core checks global privilege freshness, Team checks current resource membership. No new pool/client is required.

## Cross-domain contracts (proposed, not existing services)

| Contract / authority | Minimal payload and authorization | Availability, privacy and exit rule |
|---|---|---|
| Core identity token-provider / `environment.v1` | Existing issuer/client and token refresh callback; canonical `(issuer,sub)` | Never copy password/session into manifest; clear private state on logout/switch |
| Core `directory.assignment.v1` | Manager/admin-scoped search and exact account-resolution intent; eligible stable sub and display label; bounded/minimized email result | Rate limits, audit purpose, verified active/confirmed account; no raw Cognito Admin/ListUsers in Team runtime; no trusted caller-supplied sub |
| Core `authorization.decision.v1` | Current `teams.admin` / branding grants for authenticated subject, capability, scope and decision version | Fail closed on outage/revocation uncertainty; no indefinite JWT-group cache; do not fetch Creator workspaces to authorize Team actions |
| Core minimal profile / `profile.summary.v1` | Subject, display label and avatar reference; allowlisted fields only | Snapshot provenance/age; no global profile writes, Creator bio/secrets or account email authority |
| Team `summary.v1` | Authorized team label, role-aware navigation/capabilities for `/home` and approved esports projection | Stable Team IDs, visibility allowlist, TTL; summary not an authorization credential |
| Team `eligibility.v1` → Tournament (future consumer) | Authorized service identity plus purpose/delegated user, team/roster version, minimal eligible roster snapshot | Recheck at registration/lock; immutable competition snapshot owned by Tournament; no database access or cross-domain transaction; not implemented now |
| Media `asset-intent.v1` if shared route chosen | Exact team/asset/prefix, allowed content type/size, short-lived upload/read intents, commit verification | Domain controls association/visibility/deletion. No bucket-wide grant; current legacy prefix exception must expire after asset migration |
| Creator summary (only if needed later) | Owner-authorized public display/stream reference | No current direct dependency justifies implementing or copying Creator profile data |
| Admin composition | Lazy Team admin client consumes the same Team APIs | No universal admin backend; domain retains decision/audit |

Service-to-service authorization must name the allowed service principal, endpoint/actions, end-user delegation proof, expiry/audience, replay protection and resource check. An arbitrary JSON `identity` object or copied `cognito:groups` field is not delegation. Core APIs above are prerequisites to design/implement with their owners; they are not assumed deployed. A temporary legacy bridge needs a separately approved, narrowly scoped compatibility exception.

## Endpoint descriptor design

Future location: `config/domains/team-hub/domain-endpoints.Ntgre.json`. **Do not create that file until an accepted live deployment is read back.** Design state belongs in these documents, not a usable config.

Required future fields: `version`, `status: DEPLOYED`, `liveVerified: true`, `domain/domainOwner: TeamHub`, `environment: Ntgre`, `account: 058264289478`, `region: eu-north-1`, `stackName: ProjectRespawn-TeamHub-Ntgre`, observed `stackArn`, `apiId`, HTTPS `endpoint`, `authMode: COGNITO_ACCESS_TOKEN`, `contractVersion: team-hub.v1`, immutable `deploymentRevision`, and provenance (template/asset/core hashes, accepted report/time, API/schema revision, explicit frontend-cutover state). Auth references the same `environment.v1` core configuration.

The existing endpoint schema is Tournament-specific; introduce and review a Team Hub schema or a compatible domain discriminated schema later. Do not change Tournament's accepted schema or falsify an API ID to satisfy it. Consumers reject absent/planned/unverified descriptors, wrong environment/issuer/client/root or unsupported revision. Manifests contain no JWTs, client secrets, presigned URLs or credentials.
