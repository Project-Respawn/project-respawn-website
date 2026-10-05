# Team Hub v1 HTTP contract

Owner: Team Hub. Version: `team-hub.v1`. Phase 2B1 status: **offline contracts and synthetic service only**. Legacy `readTeamHub` / `mutateTeamHub` remain live and unchanged. The authoritative executable schemas/DTO allowlists are [contracts.mjs](../../domains/team-hub/contracts.mjs); [model types](../../domains/team-hub/model.ts) define private entities separately.

## Transport, identity and versioning

Requests use the methods/paths below. Path identifiers are URL-encoded; the HTTP boundary rejects a field duplicated in path, query or body. GET optional fields are query parameters; non-GET fields are JSON body fields. DELETE may carry its required concurrency fields in a JSON body. Search is POST in the read runtime so directory text is not embedded in a URL. Maximum body size is 16 KiB; base64 payloads are not accepted in this contract.

Authentication is an existing Ntgre Cognito **access** token, using the approved issuer/client. API Gateway validates the signature; handlers derive `(issuer, sub)` only from its JWT context and recheck environment, client, expiry/not-before and token purpose. No raw-token decoder acts as a verifier. Body `userId`, caller role, email identity or arbitrary extra fields are rejected. Target account strings are only exact Core directory lookup intents; returned subjects become canonical target identity.

Success is HTTP 200 with `{ contractVersion: "team-hub.v1", requestId, data }`. `data` is validated against that operation's closed DTO. Errors are `{ contractVersion, requestId, error: { code } }`, without input, repository entities or private detail. Headers include `Cache-Control: no-store`. No shared global Schema/client is imported.

Breaking field/meaning/privacy changes require a new version and a reviewed expand/contract compatibility window. Additive updates need consumer tests; they do not silently deploy consumers. This initial offline v1 is not a live compatibility promise. Future endpoint configuration must bind domain/environment/root/auth/revision/provenance and an accepted DEPLOYED state; no such manifest is created here.

## Eighteen operations

`C` below means `idempotencyKey`, `expectedTeamVersion`, `expectedAuthorizationEpoch`, `expectedMembershipVersion`. All are required on existing-Team commands. `expectedMembershipVersion` is zero for a global actor with no active Team membership. All listed body fields are required unless explicitly optional. Each path already supplies its identifiers.

| Legacy action | HTTP route | Additional request fields | Response data |
|---|---|---|---|
| LIST_MY_TEAMS | GET `/v1/teams` | Optional status, limit, nextToken | Team summary page |
| GET_TEAM_HUB | GET `/v1/teams/{teamId}` | None | Team, active membership DTOs, roster DTOs |
| LIST_MY_CHAMPION_POOL | GET `/v1/teams/{teamId}/me/champions` | Optional limit, nextToken | Own Player-entry page |
| LIST_TEAM_CHAMPION_POOLS | GET `/v1/teams/{teamId}/champion-pools` | Optional limit, nextToken | Active Player competitive-summary page |
| GET_PLAYER_COMPETITIVE_DETAIL | GET `/v1/teams/{teamId}/players/{membershipId}/competitive` | None | Active Player entries and authorized assessment projection |
| SEARCH_TEAM_ASSIGNABLE_USERS | POST `/v1/directory/assignable-search` | teamId, query; optional limit | Minimal subject/display-name items |
| CREATE_TEAM | POST `/v1/teams` | slug, name, gameKey, idempotencyKey | Team DTO |
| UPDATE_TEAM | PATCH `/v1/teams/{teamId}` | C, name, status | Team DTO |
| SET_MANAGER | PUT `/v1/teams/{teamId}/manager` | C, action, expectedTargetMembershipVersion; targetAccount on ASSIGN or targetMembershipId on REVOKE | Membership + Team DTO |
| MANAGE_MEMBER | POST `/v1/teams/{teamId}/members` | C, action, role, expectedTargetMembershipVersion; targetAccount on ASSIGN or targetMembershipId on REVOKE | Membership + Team DTO |
| SET_ROSTER_SLOT | POST `/v1/teams/{teamId}/roster-slots` | C, membershipId, gameRoleKey, slotType, action, expectedRosterVersion, expectedTargetMembershipVersion | Roster + Team DTO |
| UPSERT_MY_CHAMPION | PUT `/v1/teams/{teamId}/me/champions/{championId}` | C, gameRoleKey, comfortLevel, priority, competitiveReady, playerNotes, expectedEntryVersion | Player entry + Team DTO, never Coach fields |
| DELETE_MY_CHAMPION | DELETE `/v1/teams/{teamId}/me/champions/{championId}` | C, expectedEntryVersion | deleted=true, championId, Team DTO |
| UPSERT_COACH_ASSESSMENT | PUT `/v1/teams/{teamId}/players/{membershipId}/assessments/{championId}` | C, teamVisible, privateNote, expectedAssessmentVersion, expectedTargetMembershipVersion | Separate assessment/private-note DTOs + Team DTO |
| SET_TEAM_PLAN | PUT `/v1/teams/{teamId}/plan` | C, plan | Team DTO |
| REQUEST_TEAM_LOGO_UPLOAD | POST `/v1/teams/{teamId}/logo-upload-intents` | C, contentType, size | Synthetic intentId, expiresAt, Team DTO; no URL |
| COMMIT_TEAM_LOGO | PUT `/v1/teams/{teamId}/logo` | C, intentId | Team DTO; requires independently verified synthetic intent |
| REMOVE_TEAM_LOGO | DELETE `/v1/teams/{teamId}/logo` | C | Team DTO |

All six reads use one read runtime; all twelve commands use one command runtime. The POST directory route still selects the read runtime. [Compatibility mapping](../../domains/team-hub/compatibility.mjs) and tests reconcile every action with the unchanged Legacy gateway. Slug lookup becomes deterministic `teamIdForSlug(slug)` → `team:{slug}`, preserving Legacy stable IDs without a nineteenth route.

## Bounds and DTOs

| Value | Bound / vocabulary |
|---|---|
| Team ID | `team:` plus lower-case slug components; maximum 70 |
| Slug | lower-case alphanumeric/hyphen components, maximum 48 |
| Team name | 1–100 characters |
| Subject | canonical Cognito UUID-shaped opaque subject, issuer-scoped |
| Membership ID | `team-membership:{teamId}:{subject}`, maximum 160 |
| Champion ID | alphanumeric, 1–40 characters; role does not enter entry identity |
| Game | `LEAGUE_OF_LEGENDS` |
| Team/member status | ACTIVE / INACTIVE |
| Member role | MANAGER / COACH / PLAYER; member-management accepts COACH / PLAYER |
| Assignment actions | ASSIGN / REVOKE; roster ASSIGN / REMOVE |
| Game role | TOP / JUNGLE / MID / ADC / SUPPORT |
| Slot | STARTER / SUBSTITUTE |
| Comfort / priority | S,A,B,C,D / LOW,NORMAL,HIGH |
| Player notes | 0–500 characters |
| Team-visible assessment / private note | Separate 0–1,000-character strings |
| Plan | FREE / PRO; does not imply unimplemented paid entitlement activation |
| Pagination | Default 25, maximum 50; signed opaque cursor maximum 4,096 characters, 5-minute expiry |
| Directory | Query 2–100; maximum/default 10 results; exact account intent maximum 254 |
| Idempotency key | 8–128 alphanumeric/underscore/hyphen characters; actor/operation scoped; 24-hour application expiry |
| Revisions | Nonnegative safe integers; existing Team/target versions start at 1; zero for absent new entry/assessment/target |
| Per-Team offline aggregate | 50 membership records (including retained inactive records), 20 slots, 50 entries per Player |
| Synthetic logo | PNG declared content type, 1–2,097,152 bytes; 5-minute owner/team intent |

The finite retained membership ceiling is an explicit offline bounded-state restriction. Larger/historical Teams require a reviewed pagination/archive strategy before a persistent adapter is accepted; the skeleton must not silently evict inactive identities or truncate data. A result page is a current authorized view, not a point-in-time snapshot; concurrent list changes can move offsets. Cursor signatures bind subject/issuer, operation, Team/status and page size. No cursor authorizes a read; every page rechecks membership. Future durable pagination must preserve these security properties.

Team DTO: id, slug, name, gameKey, status, Team version, authorization epoch, roster version, settings(plan/logoAssetId). Membership DTO: id, subject, displayName, role, status, version. Roster DTO: membershipId, gameRoleKey, slotType. Player entry DTO: Team/membership/champion IDs, game role, comfort, priority, competitiveReady, playerNotes, version. No raw item, migration provenance or unreviewed field is spread into a response.

Competitive DTO: membershipId, Player entries and separate team-visible assessments. Only the active authoring Coach receives `privateNotes`; Managers omit that property. Players receive neither class of Coach fields. Assessment mutation returns the caller's allowed visible/private DTOs; Player mutations cannot return Coach data. [Authorization matrix](team-hub-authorization-matrix.md) specifies per-operation grants.

## Errors and conflict behavior

| Code | HTTP | Meaning |
|---|---:|---|
| INVALID_INPUT | 400 | Unknown/malformed fields, invalid cursor, bounds/identifier/input-source violations |
| LIMIT_EXCEEDED | 400 | Aggregate/transaction capacity exceeded; no partial write |
| UNAUTHENTICATED | 401 | Missing or wrong environment/client/subject/purpose/expired claims |
| FORBIDDEN | 403 | No current authority, revoked membership, invalid media ownership/verification |
| NOT_FOUND | 404 | Missing authorized target/route/account; not a private Team enumeration interface |
| CONFLICT | 409 | Stale Team/member/epoch/entity/roster version, duplicate slot/slug or changed idempotency payload |
| DEPENDENCY_UNAVAILABLE | 503 | Core dependency unavailable; no broad fallback |
| OFFLINE_SKELETON | 503 | Packaged entrypoint deliberately has no live adapters |
| INTERNAL_ERROR | 500 | Redacted unexpected failure |

Same-key/same-payload commands return the original minimized result after current authorization recheck. Changed payload under the same key conflicts. Successful commands atomically include domain changes, audit and idempotency. A conservative 25-item transaction-shape limit includes guards and journal writes; existing-Team expected conditions are mandatory rather than last-writer-wins. Re-fetch/review before retrying with fresh versions; do not auto-overwrite an acknowledged concurrent change.

## Core and future consumer contracts

[Core schemas](../../domains/team-hub/core-contracts.mjs) and [interfaces](../../domains/team-hub/model.ts) define:

- `environment.v1`: pinned shared Ntgre issuer/client/account/region; the existing descriptor is consumed read-only.
- `directory.assignment.v1`: bounded search and exact resolution. Only subject/display name are returned; active eligible synthetic accounts stand in for future confirmed Core accounts. The future transport must authenticate the Team service and verify delegated actor/assignment scope, not trust body identity.
- `authorization.decision.v1`: `teams.admin` and `teams.branding.manage`, decision version/time/expiry. Synthetic decisions are fresh and not cached; cross-service freshness and atomicity remain review gates.
- `profile.summary.v1`: subject/display name only, no profile writes. The future service must verify authorized Team/directory scope.
- Team-owned `eligibility.v1`: contract only, no route/runtime implementation or Tournament changes. Request includes Team, expected roster version and registration/roster-lock purpose. Response is a minimal eligible roster/version snapshot with evaluation/expiry times. Requires allowlisted service identity, verified delegated subject, same environment and replay protection; a snapshot is not ongoing authorization.

## Approved differences and deferred work

Intentional privacy corrections replace Legacy Player/Manager Coach-field exposure. Inactive competitive targets are denied. Core directory replaces direct Cognito administration. Conflicts, bounded state and idempotency are explicit rather than preserving unversioned Legacy writes. Logo upload contracts remain synthetic: no presigned URL, PNG byte verification or live object operation is claimed. These are visible offline scope limits, not hidden production fallbacks.

`approval`, `overallFeedback`, `recommendations`, `flexConfirmation` are **DEFERRED_PRODUCT_FEATURES** with no backend operation. Legacy generic assessment/payload JSON is not accepted by the independent API; an eventual frontend compatibility adapter must translate only approved fields and reject ambiguous/private Legacy records through the separate migration review. No live records were transformed.
