# Founder’s Cup rules configuration

Planning proposal, 27 September 2026. This example is deliberately incomplete and **must fail registration-opening/competition-activation validation**. Null means unresolved, not an implicit default. See [implementation plan](founders-cup-implementation-plan.md) and [state model](tournament-domain-model.md).

## Draft configuration example

```json
{
  "schemaVersion": "tournament-config.v1",
  "slug": "founders-cup",
  "displayName": "Founder’s Cup",
  "organizer": "Project Respawn",
  "game": "LEAGUE_OF_LEGENDS",
  "region": "EUW",
  "entry": { "type": "FREE" },
  "publication": "DRAFT",
  "schedule": {
    "timezone": null,
    "startsAt": null,
    "finalsAt": null,
    "endsAt": null
  },
  "registration": {
    "opensAt": null,
    "closesAt": null,
    "paused": false,
    "teamLimit": null,
    "lateChangesPolicy": null,
    "reopeningPolicy": null
  },
  "eligibility": {
    "registeredCreatorAssociationRequired": true,
    "creatorMayRegisterTeam": true,
    "creatorMustPlay": null,
    "creatorVerificationContract": "CreatorEligibility.v1-proposed",
    "creatorTeamsLimit": null,
    "playerAccountRequirement": null,
    "minimumAge": null,
    "rankPolicy": null,
    "residencyPolicy": null,
    "duplicatePlayerPolicy": null,
    "teamHubRequired": null
  },
  "roster": {
    "startingPlayers": 5,
    "substituteLimit": null,
    "captainRequired": true,
    "lockAt": null,
    "substitutionPolicy": null,
    "postLockExceptionPolicy": null,
    "withdrawalPolicy": null
  },
  "competition": {
    "format": null,
    "stages": [],
    "seedingPolicy": null,
    "seedTiePolicy": null,
    "sideSelection": {
      "gameOneChooser": "HIGHER_SEED",
      "laterGameChooser": "PREVIOUS_GAME_LOSER",
      "choiceOptions": ["BLUE", "RED"],
      "choiceDeadlineSeconds": null,
      "missingSeedPolicy": null,
      "forfeitOrRemakePolicy": null
    },
    "resultCertificationPolicy": null,
    "disputeWindowSeconds": null,
    "forfeitPolicy": null,
    "remakePolicy": null,
    "correctionApprovalPolicy": null
  },
  "draft": {
    "enabled": true,
    "datasetVersion": null,
    "championPoolRevision": null,
    "actionOrder": null,
    "turnDurationSeconds": null,
    "timeoutPolicy": null,
    "pausePolicy": null,
    "fearlessMode": null,
    "banCarryover": null,
    "restrictionResetBoundary": null,
    "voidGameContributionPolicy": null
  },
  "broadcast": {
    "official": [],
    "partners": [],
    "participantStreamingPolicy": null,
    "minimumDelaySeconds": null,
    "consentPolicy": null
  },
  "rewards": {
    "status": "PROPOSED",
    "allowedCategories": ["COSMETIC", "PET", "BADGE", "ACHIEVEMENT"],
    "awards": [],
    "fulfillmentContract": null
  },
  "review": {
    "organizerStatus": "PENDING",
    "publisherStatus": "NOT_CONFIRMED",
    "publisherEvidenceReference": null,
    "rulesVersion": null,
    "privacyPolicyUrl": null,
    "supportUrl": null
  }
}
```

Captain requirement and review workflow are design proposals; organizer must ratify them alongside the unresolved rules. Known brief requirements are free entry, EUW, LoL, creator association/ability to register, and the two side-choice rules. No stage best-of, substitute allowance, creator-playing rule, dates or Fearless variant is approved by this example.

## Validation and publication gates

- UTC ISO timestamps with explicit timezone information in storage; use the configured IANA timezone for display. Require ordered registration and competition dates; no past historical date fallback. Server deadline equality means CLOSED. A paused flag cannot conceal closure.
- An informational announcement may omit dates and show pending rules. Opening registration requires approved eligibility, team/roster constraints, rules version, deadline, support/privacy/consent and a working creator-verification path. Validate the appropriate policy review before public launch.
- Stage configuration requires stable stage IDs, chosen format, supported positive odd `bestOf`, entry/advancement policy and schedule. A finals stage may have a different best-of. Active series pin their stage/rules revision.
- Seeding requires approved eligible teams and a deterministic tie policy. Bracket activation requires complete validated topology. Define byes, no-shows, withdrawals and forfeits before starting matches.
- Draft activation requires dataset/version, ordered turn schema, timer/pause/timeout rules and all Fearless fields. The action schema must produce five picks per team and the approved ban count; validate side/turn sequencing and champion uniqueness.
- Resolve equal/missing seeds and games without a competitive loser explicitly. Never choose a team arbitrarily to keep the UI moving.
- Changes after registration opens need versioning, notice and an explicit reacceptance policy. Changes to an active game require referee adjudication and a superseding record; do not mutate history.
- Rewards are data: category, recipient/rank criteria, approved catalog reference, quantity, status and fulfillment reference. Announce only approved available rewards. No cash or Riot currency is inferred.
- Stream entries require an approved provider/channel, permission state, relevant tournament/match, schedule and optional talent. Public live status requires a timestamped source; otherwise show scheduled/unknown.

## Decision ledger

| Decision | Owner to confirm | Blocks |
| --- | --- | --- |
| Dates, timezone, cap and registration window | Tournament organizer | Registration opening and schedules |
| Creator must play; multiple teams per creator; current registered-creator definition | Organizer + Creator owner | Eligibility approval |
| Starter/substitute/account requirements, age/rank/residency and duplicate-player rules | Organizer + competition lead | Registration rules and review |
| Team Hub mandatory vs optional | Organizer + Team Hub owner | Registration UX; default architecture keeps it optional |
| Stage format, best-of, seeds/ties, byes and finals reset if applicable | Competition lead | Bracket implementation fixtures and activation |
| Locks, substitutions, withdrawals/no-shows/forfeits/remakes | Competition lead | Roster locking and match operations |
| Fearless TEAM_USED vs SERIES_USED, bans, reset scope and void-game treatment | Competition lead | Draft engine rule selection |
| Draft order, timers, pauses, timeout/referee process | Competition lead | Live draft operation |
| Result evidence, opponent confirmation, certification, dispute window and correction approvers | Competition lead | Result advancement |
| Creator verification transport, owner and attestation fallback | Creator owner + security reviewer | Safe registration submission/approval |
| Champion data/assets and identity/API verification scope | Integration owner + policy reviewer | Reviewed asset use and any verification claims |
| Applicable Europe competition terms, product registration and publisher review wording | Organizer + policy reviewer | External launch/review claims |
| Official/partner/participant streaming rights, delay and embeds | Broadcast lead | Broadcast publication |
| Reward catalog availability and fulfillment/correction contract | Platform reward owner | Prize promises and distribution |
| Consent, public roster fields, evidence retention and support contact | Organizer + privacy/support owner | Public registration |

## External dependency limits

Use a reviewed versioned champion dataset and original Project Respawn UI treatment. Data Dragon is the candidate source, subject to current terms and asset review. Treat Riot ID input as unverified unless an approved verification integration establishes control. Riot Sign On and Tournament API integration require their own access/onboarding decisions; neither is a prerequisite for a clearly manual referee-led MVP. No API credentials are supplied by this configuration. [Official League developer documentation](https://developer.riotgames.com/docs/lol).

The [Europe competition guidelines](https://riot.eurcommunitycompetition.com/games/league-of-legends/guidelines/) could not be retrieved during planning; obtain and review current applicable terms before claiming compliance. No endorsement, sponsorship, partnership or publisher approval is documented here.
