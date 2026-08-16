# Application prototype alignment report

## 1. Already aligned

- `/apply-now` is the canonical named public application route and uses a conditional multi-step Vue form. `/applications` and the former `/apply` path redirect to it while preserving query/hash data.
- `/join-us` is the canonical opportunities landing route. `/team-tryouts` redirects to it while preserving query/hash data. Its CTA enters `/apply-now?type=creator`, preserves `#apply`, keeps the full programme content, and retains accessible hash scrolling/focus/reduced-motion behavior.
- Shared applicant details, creator presence, mission-alignment questions, consent, and basic competitive fields already existed.
- The established Coming Soon composite is `src/components/FeatureTeaser/FeatureTeaser.vue`; it includes the shared status badge, preview treatment, and Coming Soon overlay. Therapist and Personal Trainer now reuse it for both their pathway cards and selected unavailable state.
- `src/components/TimezoneSelector/TimezoneSelector.vue` is a reusable controlled selector backed by `TimezoneSelector/timezones.js`. It detects the browser zone, displays dynamic current GMT offsets, allows manual changes, and emits canonical IANA identifiers.
- The existing shared-IGDB plan correctly keeps credentials and normalization in the backend and proposes independent profile/application relationships to a canonical game.
- Existing authentication (`useAuth`) and authorization (`useAccessContext`, permission helpers, group/permission resolver guards) provide conventions for future applicant ownership, reviewer eligibility, and admin decisions.

## 2. Missing from the repository

- Durable application drafts/submissions, statuses, audit history, decisions, communications, and induction records.
- Shared IGDB service/endpoints, normalized game model, caching, throttling, frontend search components, and profile/application game joins.
- Creator favourite-game search/add/remove, duplicate prevention, and authoritative three-game limit.
- Reviewer/admin interfaces and backend enforcement for three independent reviewers, hidden peer scores, weighted rubrics, thresholds, safety/spread escalation, overrides, re-review, prior-reviewer exclusion, recusal replacement, decline communications, and induction.
- Permission definitions and assignment policies specific to application review/admin/induction.
- Consent-aware notification/interest storage, so no “Notify me” control should be added.
- Comprehensive applicant validation and accessible per-step error summaries.

## 3. Conflicts resolved or remaining

- The previous form exposed three overlapping streamer cards. The prototype requires one non-competitive Creator Programme path plus distinct competitive paths; the frontend choices now follow that split.
- Therapist and Personal Trainer previously opened active question flows. They are now visible Coming Soon choices using the canonical badge and cannot advance or submit.
- The previous fixed competitive game dropdown used one free-text roles field. Safe frontend alignment now uses pathway-specific competitive choices and game-specific rank/position lists, including League roles Top, Jungle, Mid, Bot or ADC, and Support.
- The prototype uses local IGDB-shaped records. They are deliberately not copied; favourite-game UI remains a clearly identified protected-backend delivery slice.
- The prototype persists demo state in `localStorage`. Production application/review state must not use that mechanism.
- The existing submit handler did not persist anything. Durable submission remains unresolved and must be implemented through an owner-authorized backend mutation before the UI can claim successful submission.

## Public pathway availability

`src/config/applicationPathwayAvailability.js` is the canonical public recruitment switch. Creator Programme is `ACTIVE`; competitive streamer, player/esports roster, coaching, and analysis/support are `CLOSED`; Therapist and Personal Trainer are `COMING_SOON`. The entry controller preserves a requested closed pathway from `/apply-now?type=...`, shows the closed explanation, and prevents Next, validation, and submission. It does not rewrite the request to Creator Programme.

The competitive implementation remains intact in `src/views/Applications/Applications.vue` and `Applications.js`: pathway questions, competitive game definitions, game-specific ranks/positions, League roles, coaching/analysis specialist answers, validation boundaries, responsive layout, and the planned IGDB selection boundary are preserved. Availability is deliberately separate from those definitions.

To reopen one pathway, change only its value in `APPLICATION_PATHWAY_AVAILABILITY` from `PATHWAY_AVAILABILITY.CLOSED` to `PATHWAY_AVAILABILITY.ACTIVE`. The existing form then becomes enterable without reconstructing questions or mappings. No public Admin toggle exists.

Competitive recruitment is paused while Project Respawn develops internal scouting and team-building. Future broad organisational roles might include Coach or Esports member, while team-specific Player, Substitute, Captain, Coach, Analyst, Scout, and Team manager access should derive from team/game/roster/membership/status data—not one Cognito group per combination. None of these roles or models is approved or implemented here.

## 4. Exact future files and models

Frontend:

- `src/views/Applications/Applications.vue`, `.js`, `.css`: finish six-step applicant journey, validation, review summary, and backend submission states.
- `src/components/TimezoneSelector/TimezoneSelector.vue` and `timezones.js`: shared IANA selector and current-offset formatting for later reuse by Profiles, Creator Tools, Events, and scheduling.
- `src/features/game-catalog/gameCatalogService.js`
- `src/features/game-catalog/useGameSearch.js`
- `src/features/game-catalog/components/GameSearchInput.vue`
- `src/features/game-catalog/components/GameSearchResult.vue`
- `src/features/game-catalog/components/SelectedGameCard.vue`
- New reviewer/admin/induction feature routes and components under `src/features/applications/`, guarded by existing permission helpers.

Protected Amplify/backend:

- `amplify/data/resource.ts`: `Game`, `UserProfileGame`, `Application`, `ApplicationFavouriteGame`, optional `ApplicationGenre`, `ApplicationReviewRound`, `ApplicationReviewerAssignment`, `ApplicationReview`, `ApplicationDecision`, `ApplicationAuditEvent`, and `ApplicationInduction`.
- `amplify/myFunction/resource.ts`: IGDB secrets only; never frontend environment variables.
- `amplify/myFunction/games/*`: token handling, IGDB client, normalization, caching, throttling, and error mapping.
- `amplify/myFunction/applications/*`: submission, limits, transitions, reviewer assignment/exclusion, scoring, decisions, and audit handlers.
- `amplify/myFunction/router/restRouter.ts` and/or `appSyncRouter.ts`: shared game discovery and application operations following current conventions.
- Permission constants/catalog and tests for review, decision, override, communication, and induction actions.

## 5. Frontend-only work

- Pathway labels and conditional visibility.
- Canonical Coming Soon display and return behavior.
- Creator genre selection with a five-item UI limit.
- Competitive game/rank/position conditional fields and role-specific coaching/support questions.
- Shared game-search component shells, loading/error/keyboard behavior, and client-side duplicate/limit feedback once the endpoint contract exists.
- Applicant step UX and validation presentation. Frontend validation is helpful but never authoritative.
- Timezone detection, controlled selection, dynamic current-offset labels, and IANA values are frontend-only for now. The future application/profile field should be a string named `timeZone` (or the repository-wide agreed equivalent) containing an IANA identifier such as `Europe/London`, never a fixed offset or display label.

## 6. Protected Amplify delivery

- Every persistent application, review, decision, communication, induction, canonical game, and user-owned relationship model.
- Backend enforcement of three games, five genres, uniqueness, ownership, transition rules, reviewer independence, prior-round exclusion, and permissions.
- IGDB/Twitch secret declaration, token exchange, normalized endpoints, shared cache, rate limits, and observability.
- Any deployment/output regeneration. This must follow `docs/local-amplify-development.md`, preserve `Ntgrestage8`, and stop if replacement or a different root stack is proposed.

## 7. Remaining decisions

- Whether applications require sign-in before draft creation or allow an anonymous verified-email draft that is claimed later.
- The authoritative pathway/status enums and whether competitive applications belong to Project Respawn, Ravens Gaming, or a shared brand-aware application aggregate.
- Exact rubric weights and threshold rules to promote from the prototype into policy, including the below-55 admin-decision behavior rather than automatic rejection.
- Reviewer pool eligibility, workload balancing, conflict/recusal policy, and what happens when fewer than three unused reviewers remain.
- Data retention, deletion/export handling, applicant age policy, privacy wording, and visibility of sensitive incident/accessibility disclosures.
- Email provider/templates, approval requirements, induction scheduling integration, and audit retention.
- Supported initial competitive game catalog and ownership of rank/position configuration updates.
- Confirm the final cross-domain backend field name (`timeZone` recommended) and whether the curated timezone list should later become a platform-wide configuration source. Its stored value must remain the IANA identifier.
