# Tournament domain model

Planning proposal, 27 September 2026. Parent: [implementation plan](founders-cup-implementation-plan.md). No schema or backend has been implemented by this document.

## Aggregates and ownership

All records carry environment, stable ID, schema version, created/updated timestamps and aggregate version. Tournament IDs are immutable; slugs are unique aliases. References never confer ownership of another domain’s records.

| Aggregate/record | Authoritative fields and behavior | Visibility |
| --- | --- | --- |
| Tournament | Slug, organizer, game/region, phase, publication state, schedule/timezone, registration window, active rules revision | Approved projection public |
| RulesRevision / Stage | Immutable rules, format, best-of, stage order, champion dataset, eligibility and advancement policy | Published revisions public |
| Registration / Review | Creator reference/attestation, applicant subject, draft roster, declarations, review status, reasons, accepted rules revision | Applicant, registrar |
| TournamentTeam | Competition identity, creator snapshot, captain subject, optional Team Hub reference, approval/withdrawal state | Sanitized approved identity public |
| RosterRevision / Member | Stable participant reference, Riot ID text, optional verified PUUID, position, starter/substitute, consent, verification evidence, lock/change decision | Public subset only |
| SeedVersion | Ordered eligible team IDs, tie resolution, actor/reason and immutable published revision | Published seeds public |
| BracketVersion / Node | Format, generation input hash, dependencies, slot sources, series IDs, activation state | Active version public |
| Series | Stage, entrants, seed snapshot, best-of, score derived from certified games, schedule, status, rules revision | Public competition state |
| Game | Number, attempt, teams/sides, chooser, draft reference, result/certification, remake/void linkage | Approved competition state |
| Draft / DraftAction | Pinned rule/dataset versions, sequence, phase, current actor/turn, timestamps, picks/bans, availability derivation, completion hash | Public state; commands restricted |
| ResultClaim / Dispute | Claim/evidence reference, submissions, confirmation, adjudication, superseded result links | Private review; public pending/final status |
| Broadcast / PartnerStream | Provider/channel, permission status, match links, schedule, talent, observed live state/freshness | Approved entries public |
| Announcement | Tournament scope, draft/published revision, body, publication timestamp | Published only |
| Grant / AuditEvent | Scoped capability grants; actor/action/entity/before/after/reason/correlation/version | Restricted administration |
| Idempotency / Outbox / Job | Request digest/outcome, durable effects, worker checkpoints and retry state | Internal only |

Creator and captain are distinct concepts. The creator may be non-playing only if approved rules permit it. Five LoL starting slots are distinct from a configurable substitute allowance; fixture “5 + 2” is not the rule. Players may need invited participant records before account linkage if the organizer permits this; never mark such identities verified automatically. Riot ID text is not proof of account control.

## Independent lifecycle machines

Transitions are commands checked against role, expected version, time and prerequisites. Terminal corrections use explicit audited commands, not unrestricted status patches.

| Machine | States and principal transitions | Guard |
| --- | --- | --- |
| Tournament competition | DRAFT → ANNOUNCED → SEEDING → ACTIVE → COMPLETED; eligible nonterminal states → CANCELLED | Announcement requires public content; seeding requires reviewed entrants; completion requires certified terminal results |
| Publication | PRIVATE → REVIEW → PUBLISHED → ARCHIVED | Public projection allowlist; material rule revisions reviewed |
| Registration window | NOT_SCHEDULED → SCHEDULED → OPEN ↔ PAUSED → CLOSED | Server UTC; `now >= closesAt` always CLOSED; early close audited; reopening needs explicit future deadline and eligibility review |
| Application | DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED / CHANGES_REQUESTED / REJECTED; changes → resubmission; withdrawal from permitted states | Creator verification, rules acceptance, roster/declaration completeness; approval atomically creates team once |
| Roster change | PROPOSED → APPROVED / REJECTED / WITHDRAWN | Before lock: permitted actor; after lock: explicit registrar/referee exception reason; active games retain pinned roster |
| Series | PENDING → SCHEDULED → READY → IN_PROGRESS → RESULT_PENDING → COMPLETED; DISPUTED detour; CANCELLED/FORFEITED adjudicated paths | Eligible locked entrants; certified games determine score; disputed results cannot advance bracket |
| Game | PENDING → SIDE_SELECTION → DRAFTING → READY → IN_PROGRESS → RESULT_PENDING → CERTIFIED; VOIDED/remake creates new attempt | Side/draft completion; referee certification; never overwrite a previous attempt |
| Draft | WAITING_SIDES → READY → DRAFTING → COMPLETED; PAUSED / AWAITING_REFEREE detours; VOIDED terminal | Authorized turn, expected sequence, available champion, deadline, rules version |
| Broadcast | PLANNED → APPROVED → SCHEDULED → ENDED / CANCELLED | Provider LIVE/OFFLINE/UNKNOWN is separate observed state, not this editorial lifecycle |

“FINALS” is a stage label, not a competing tournament-wide lifecycle. Registration and competition phases remain independent so a tournament can be announced while registration is paused. Publication never exposes pending private records merely because competition is ACTIVE.

## Registration and roster workflow

1. Authenticate with shared Cognito; resolve creator relationship through the proposed owner contract or reviewed registrar attestation.
2. Save a private application: team identity, creator, captain, starters/substitutes, Riot IDs, declarations and accepted rules revision.
3. Submit before deadline. Validate configured rules, creator verification freshness and duplicate-player/team restrictions. Record immutable submission revision.
4. Registrar reviews, requests changes or rejects with a reason. Resubmission is a new revision; deadline exceptions need explicit policy and audited approval.
5. Approval atomically reserves eligibility identities and creates one TournamentTeam plus the approved roster snapshot. Concurrent approvals cannot create duplicate entrants.
6. Changes produce new roster revisions. Locks apply to the tournament/stage/game scope specified by rules; never mutate a roster already pinned to an active game.
7. Withdrawal remains historical. Before seeding, release eligible reservations according to policy; afterward require bracket/no-show adjudication, not deletion of team history.

A creator-relationship outage leaves verification pending. Team Hub linkage is optional until decided and uses snapshots rather than ownership transfer. Store minimal private evidence; define retention before launch. Do not expose contacts, verification documents, private notes, raw subjects or PUUIDs in public rosters by default.

## Series, sides and Fearless draft

Best-of is pinned per stage/series and must be a supported positive odd number. Required wins are `(bestOf + 1) / 2`; certified non-void games derive the score. Team A/B remains stable across games while blue/red sides vary.

Game 1 chooser is the higher seed. Subsequent chooser is the previous certified game’s loser. Equal/missing seeds, forfeits without a played game, voids and remakes require configured policies; if unresolved, stop at AWAITING_REFEREE. The chooser selects blue/red through a command; an opponent or spectator cannot choose on its behalf. Store chooser basis, chosen side, actor and revision.

Draft rules pin champion dataset/patch, ordered ban/pick steps, team turn, timer duration and Fearless mode. Supported proposed modes are OFF, TEAM_USED and SERIES_USED; Founder’s Cup selection is unresolved. Ban carryover, void/remake handling and restriction reset boundaries must be explicit. Each action checks champion ID against the dataset, current draft uniqueness and exclusions derived from prior canonical games under that policy. Frontend arrays are never authoritative.

Actions have immutable sequence numbers. Completion requires a valid full ordered draft, five assigned picks per team and configured ban counts. Champion-role assignment is separate from selecting the champion. Persist a completion digest and history; later changes create a superseding attempt with a reason. A correction to an earlier game can invalidate later availability and must freeze affected drafts for adjudication.

Timer MVP: server stores `turnStartedAt` and `expiresAt`; expired picks are rejected regardless of browser clock. Timeout becomes an effective AWAITING_REFEREE state and requires an explicit resolution command; do not promise automatic champion selection. Pause stores remaining time; resume establishes a new audited deadline. A future automatic timeout runner needs a separate queue/scheduler design and resource/security review. Reads may expose effective expiry without silently mutating state.

This is a competition draft companion. It does not claim to control the League client or enforce champion choices inside the game; referee verification remains necessary unless a later reviewed integration supplies reliable evidence.

## Bracket consistency

Do not infer double elimination from preview graphics. Select the format before B4. Implement the chosen deterministic engine with explicit seed order, byes, advancement slots and reset-final behavior if applicable. Single elimination is the smallest initial option, not an approved Founder’s Cup rule.

Generate an immutable staged bracket version from rules/seed hashes. Validate acyclic dependencies, one entrant per slot, supported team count and complete node set. Write large versions in bounded chunks, then atomically switch the active pointer only when fully validated. Readers never see a partly generated bracket.

Certifying a series and updating its immediate successor slots must be one bounded transaction conditioned on topology and entity versions. A contested claim does not advance. Multi-node correction uses a tournament/stage correction lock and reviewed plan: freeze the affected subgraph, identify started descendants, adjudicate them explicitly, stage replacement results/slots and activate a consistent version. Never recursively overwrite matches already played. Keep superseded versions and actor/reason; decide whether high-impact corrections require a second approver before launch.

## Storage and access patterns

Three native DynamoDB tables cover the logical model. Exact key layout and GSIs are a B1 design review, not implemented schema.

| Table/access | Proposed key/index pattern | Purpose |
| --- | --- | --- |
| State tournament/config | `PK=T#id`, `SK=META / RULES#revision / STAGE#id` | Aggregate configuration reads |
| State application | `PK=REG#id`, `SK=META / REV#n`; sparse tournament/status and applicant indexes | Applicant workspace and review queue without Scan |
| State team/roster | `PK=TEAM#id`, `SK=META / ROSTER#n / MEMBER#id` | Approved and proposed roster snapshots |
| State competition | `PK=SERIES#id`, `SK=META / GAME#n#attempt / DRAFT#id / ACTION#seq` | Ordered history and current competition state |
| State bracket | `PK=BRACKET#id#version`, `SK=META / NODE#id` | Stage version generation and activation |
| State uniqueness/grants | Tournament-scoped player/slug/creator reservation keys and subject grants | Conditional uniqueness and authorization reads |
| Public | Tournament/slug partitions and list indexes, series/team projection keys | Bounded paginated public reads; no private fallback |
| Audit | Tournament/time-bucket partition, ordered event ID; entity lookup index | Actor/action/version reconstruction with restricted access |

Bound partition/page sizes and operational team caps before coding; split high-volume draft histories by series rather than put every action on one hot tournament item. Index queries return only authorized objects; a query parameter does not establish scope.

Each accepted mutation transaction includes aggregate conditions, updates, append-only audit, durable idempotency outcome and any outbox record. A retry with the same key/body returns the original outcome; the same key with a different digest fails. Conflicting expected versions fail without partial effects. Keep an application-level idempotency retention policy beyond DynamoDB’s native ten-minute token window. DynamoDB transactions allow up to 100 distinct items and 4 MB, so approval/advancement operations must stay bounded; large bracket creation uses staging, not an oversized transaction. [AWS transaction reference](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_TransactWriteItems.html).

Stream workers condition projection writes on source revision and tolerate duplicates. Cross-aggregate projections expose a completed bracket version marker; do not mix half-applied topology snapshots. Failed outbox items remain recoverable and produce alarms. Audit write permissions deny ordinary update/delete; this is an application control, not a claim of immutability against account administrators.

## Required regression cases

Cover deadline equality, paused-after-deadline, duplicate approvals, stolen team IDs, revoked grants, creator outages, roster lock exceptions, simultaneous draft actions, stale versions, idempotent retries, expiry/pause/resume, both side-choice rules, Fearless carryover/remakes, byes/forfeits, disputed advancement, downstream correction, projection replay and unauthorized private-data queries. Add resource/isolation checks and load tests against explicit capacity assumptions; do not substitute fixture snapshots for these behavioral tests.
