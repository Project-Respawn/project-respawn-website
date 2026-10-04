# Tournament API contract proposal

Planning only, 27 September 2026. See [model](tournament-domain-model.md) and [implementation plan](founders-cup-implementation-plan.md). These routes are not implemented and do not replace the pinned Phase 2A preview contract.

## Transport and authority

Version prefix `/v1`; `t` below means tournament ID, `s` series ID. Resolve public slugs through the hub route, then use stable IDs. JSON responses include `schemaVersion`, `data`, `version`, `observedAt` and `requestId`; collections add opaque `nextCursor`. Enforce bounded limits and allowlisted sorting/filtering. Public GETs support ETags/304 and approved cache lifetimes. Private workspace responses use `Cache-Control: no-store`.

Public-query Lambda reads only the public table. The private workspace GET uses registration/admin Lambda; command routes use registration/admin or competition Lambda. Three HTTP integrations cover these groups. Protected routes require Cognito JWT and runtime checks of scoped grants and ownership. Verify environment, issuer/client, token use and expiration; actor subject comes only from the token. Creator claims in request bodies are references requiring independent verification.

All mutations require `Idempotency-Key`. Updates require `If-Match` with the authoritative aggregate version; creates use conditional nonexistence. Compound commands include expected versions of affected series/bracket/roster. Request keys are scoped to actor, tournament and operation; persist digest and original outcome. Reject conflicting key reuse. An accepted command returns its committed version, even if public projection is still catching up.

Error envelope: `{ "error": { "code": "VERSION_CONFLICT", "message": "Refresh before retrying", "requestId": "...", "currentVersion": 12 } }`. Use 400 invalid input, 401 invalid/missing authentication, 403 denied capability, 404 unavailable resource, 409 state/idempotency conflict, 412 stale version, 422 rule violation and 429 throttling. Do not leak private existence or evidence in errors. Retry transient failures with the same key; never blindly replay a conflicting draft pick as a new action.

## Read inventory — 12 explicit routes

| # | GET route | Access and response |
| --- | --- | --- |
| 1 | `/v1/tournaments` | Public published summaries |
| 2 | `/v1/tournaments/by-slug/{slug}` | Public hub/configured dates/effective registration/rules summary |
| 3 | `/v1/tournaments/{t}/teams` | Public approved teams |
| 4 | `/v1/tournaments/{t}/teams/{team}` | Public team, consented roster and results |
| 5 | `/v1/tournaments/{t}/series` | Public paginated scheduled/completed series |
| 6 | `/v1/tournaments/{t}/series/{s}` | Public series, games, sides and result status |
| 7 | `/v1/tournaments/{t}/bracket` | Public active complete bracket version; stage filter |
| 8 | `/v1/tournaments/{t}/drafts` | Public current/upcoming/completed summaries |
| 9 | `/v1/tournaments/{t}/drafts/{draft}` | Public ordered picks/bans, availability, deadline and history cursor |
| 10 | `/v1/tournaments/{t}/broadcasts` | Public official and approved partner entries with freshness |
| 11 | `/v1/tournaments/{t}/announcements` | Public published news/rules links |
| 12 | `/v1/tournaments/{t}/workspace` | JWT: typed allowlisted views for own applications/rosters, authorized review queues/config, grants, disputes and audit; per-view capability checks |

Workspace is a bounded query interface, not arbitrary database access: require a recognized `view` enum, scope, cursor and permitted filters; return purpose-specific DTOs. If it becomes too complex, split it into explicit routes and update the resource budget rather than weaken enforcement.

## Command inventory — 24 explicit routes

Each operation enum below has a separate validated payload schema and permission check. These endpoints are not generic object patching or arbitrary state setters.

| # | Method and route | Operations and minimum authority |
| --- | --- | --- |
| 1 | `POST /v1/tournaments` | Create private tournament; trusted organizer grant |
| 2 | `PATCH /v1/tournaments/{t}/configuration` | Draft config/stages/rules revisions; organizer; active rules immutable |
| 3 | `POST /v1/tournaments/{t}/transitions` | Announce/publish/start/complete/cancel; organizer plus transition guards |
| 4 | `POST /v1/tournaments/{t}/registration-window` | Schedule/open/pause/close/reopen; organizer; time/policy guards |
| 5 | `POST /v1/tournaments/{t}/registrations` | Create draft; authenticated verified eligible creator or pending-verification workflow |
| 6 | `PATCH /v1/tournaments/{t}/registrations/{registration}` | Save own editable application; owner |
| 7 | `POST /v1/tournaments/{t}/registrations/{registration}/submit` | Submit/resubmit; owner, verified eligibility and deadline |
| 8 | `POST /v1/tournaments/{t}/registrations/{registration}/decision` | Review/approve/reject/request changes; registrar; reason |
| 9 | `POST /v1/tournaments/{t}/withdrawals` | Withdraw application/team; owner or registrar; post-seed adjudication |
| 10 | `POST /v1/tournaments/{t}/teams/{team}/roster-changes` | Propose revision; captain/delegate with roster capability |
| 11 | `POST /v1/tournaments/{t}/teams/{team}/roster-decisions` | Approve/reject/lock/unlock; registrar/referee; exception reason |
| 12 | `POST /v1/tournaments/{t}/seeds` | Stage/publish seed version; organizer/referee |
| 13 | `POST /v1/tournaments/{t}/bracket-commands` | Generate/validate/activate/correct; organizer/referee; versioned plan |
| 14 | `POST /v1/tournaments/{t}/series/{s}/schedule` | Set/reschedule; referee; conflict checks |
| 15 | `POST /v1/tournaments/{t}/series/{s}/transitions` | Ready/start/pause/cancel/forfeit; role-specific referee or participant guards |
| 16 | `POST /v1/tournaments/{t}/series/{s}/results` | Submit claim/confirm/certify; captain for own claim, referee for certification |
| 17 | `POST /v1/tournaments/{t}/series/{s}/disputes` | Open/respond/resolve/correct; participant scope or referee adjudication |
| 18 | `POST /v1/tournaments/{t}/series/{s}/side-choice` | Choose for game; entitled captain/delegate, referee exception with reason |
| 19 | `POST /v1/tournaments/{t}/drafts/{draft}/actions` | Current-turn pick/ban/assignment; scoped participant, sequence and deadline |
| 20 | `POST /v1/tournaments/{t}/drafts/{draft}/controls` | Create/start/pause/resume/resolve timeout/void/override; referee; audited payload |
| 21 | `POST /v1/tournaments/{t}/broadcasts` | Create/edit/assign/end official coverage; broadcast editor |
| 22 | `POST /v1/tournaments/{t}/partner-streams` | Request/edit/approve/revoke; own creator request vs editor approval |
| 23 | `POST /v1/tournaments/{t}/announcements` | Draft/edit/publish/unpublish; editorial grant |
| 24 | `POST /v1/tournaments/{t}/grants` | Grant/revoke scoped role; trusted organizer; prevent self-escalation |

The inventory totals 36 API Gateway routes. Protected reads are counted among the 12 reads, not mislabeled as anonymous routes. Registration/admin integration handles administrative data and commands; competition integration owns series/bracket/draft transactions. No endpoint accepts arbitrary IAM actions or cross-domain database identifiers.

## Representative contracts

Draft action request:

```json
{
  "operation": "PICK",
  "expectedSequence": 7,
  "gameId": "game-stable-id",
  "championId": "versioned-champion-id",
  "rulesRevision": "rules-3"
}
```

Headers supply the draft version and idempotency key. There is no authoritative actor/team owner field. Server loads the draft, resolves actor grant and turn team, checks rules/availability/time, commits action + state + audit + outbox + idempotency, and returns the next sequence/deadline. Two simultaneous picks cannot both occupy the same step.

Public draft DTO contains `draftId`, `seriesId`, `gameId`, `version`, `rulesRevision`, `datasetVersion`, `state`, `effectiveState`, `blueTeamId`, `redTeamId`, ordered actions, current turn, available/excluded champion IDs with reasons, `serverTime`, `expiresAt` and source revision. It omits private evidence, raw user claims and referee notes.

Result request discriminates `SUBMIT`, `CONFIRM` and `CERTIFY`; each requires its own capability. Certification supplies expected game/series/bracket versions and the adjudication reason where applicable. A captain’s submitted winner never becomes certified merely because the payload says `CERTIFY`.

Registration response distinguishes editable draft version, submitted revision, accepted rules revision, verification state and review outcome. Team creation occurs only through approval; retries return the existing team reference. Material rules changes require a visible reacceptance policy before resubmission/approval.

## Shared-domain and runtime contracts

- `CreatorEligibility.v1` is a proposed owner-approved minimal eligibility/relationship contract, not an existing deployed API. Bind the returned relationship to the verified subject and environment; enforce expiry. Registrar attestation is an explicit audited fallback, not frontend trust.
- Optional `TeamSnapshot.v1` imports an authorized immutable roster snapshot. Tournament does not acquire Team Hub ownership or initialize its frontend client.
- Future `TournamentOutcome.v1` includes tournament/result revision and stable recipients. Reward requests use an idempotent recipient/reward/result key and an owner-reviewed correction process.
- Stream provider metadata includes provider, approved channel identifier, permission status, observed state/time and stale-after duration. Never accept arbitrary iframe HTML. Unknown is preferable to invented live status.

Schemas reject unknown sensitive fields, cap body/text/page sizes, validate IDs and URL providers, and sanitize editorial content. Rate-limit public reads and mutation classes, test CORS per environment, and redact operational logs. No credentials, signing keys or provider tokens belong in frontend configuration.

## Contract verification

Test anonymous private reads, cross-tournament IDs, stolen captain/team references, forged creator claims, revoked grants, privilege escalation via operation enums, malformed tokens, cursor tampering, stale versions, duplicate keys with changed bodies, deadline equality, replay after projection failure and public/private DTO separation. Generate frontend types from a reviewed contract in B1; do not couple the client to LegacyPlatform’s generated schema or silently route failed requests there.
