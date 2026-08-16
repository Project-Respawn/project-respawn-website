# Admin Applications architecture

## Existing admin map

- Entry point: `src/router/admin.routes.js` mounts the admin tree at `/dashboard`.
- Layout: `src/views/Admin/AdminLayout/AdminLayout.vue` owns authentication states, the fixed/responsive sidebar, and the child `router-view`; its behaviour and tab configuration live in `AdminLayout.js`.
- Routing and guards: `src/router/index.js` evaluates matched `requiredPermission`, `requiredGroups`, `requiresAuth`, and brand-access metadata. `AdminLayout` independently restricts the dashboard shell to Cognito `SuperAdmin`, `Admin`, or `Staff` groups.
- Permissions: runtime permissions come from the backend access-context resolver. The file `src/permissions/permissions.ts` is explicitly diagnostic/legacy metadata and has no application-review permission today.
- Shared patterns: admin pages use page-local Vue/CSS/JS files, dark cards, responsive overflow tables, filter toolbars, spinners, inline errors, and empty rows/states. There is no general-purpose shared admin state or status component to reuse.
- Public application flow: `src/views/Applications` is the applicant-facing four-step form at `/apply-now` (`/applications` redirects there). It contains five active pathways and two Coming Soon pathways, but deliberately does not persist submissions.

## Decision and routes

The feature belongs within the existing `src/views/Admin` structure, not beside or inside the public form. It uses the established dashboard prefix:

- `/dashboard/applications` — overview and queue
- `/dashboard/applications/:applicationId` — individual application

Both routes use the existing `requiredGroups` guard for `SuperAdmin`, `Admin`, and `Staff`, matching the existing dashboard shell. A dedicated runtime permission should be introduced with the backend review phase; inventing one in this frontend-only slice would hide the sidebar from every current user and would not create real authorization.

Applications is placed after Events in the sidebar because it is an operational programme workflow, before forum and commerce administration. The active-state prefix check covers both routes. The existing mobile bar is retained and made horizontally scrollable because the number of admin destinations already exceeds a narrow viewport.

## Component hierarchy

```text
AdminLayout
└── AdminApplications
    ├── status summary cards
    ├── ApplicationFilters
    └── ApplicationsQueue
        └── ApplicationStatusBadge

AdminLayout
└── AdminApplicationDetail
    ├── ApplicationSummaryHeader
    │   └── ApplicationStatusBadge
    ├── ApplicationSection (applicant information)
    ├── ApplicationSection (submitted answers)
    ├── ReviewerSlots
    ├── ApplicationSection (administrative metadata)
    └── ApplicationSection (future admin actions boundary)
```

`applicationTypes.js` contains frontend view constants and documents the anticipated view-model shapes. These are intentionally not represented as the final backend schema.

## Temporary fictional data boundary

`src/views/Admin/AdminApplications/applicationAdminData.js` is the only module imported by the overview and detail pages for application reads. It currently delegates to the single canonical, visibly fictional fixture in `fixtures/demoApplication.js`. The adapter also owns filtering, sorting, summary aggregation, and detail-route construction so those behaviours can be tested without mounting Vue or creating a fake API.

When protected application storage is delivered, replace `listAdminApplications` and `getAdminApplication` inside this adapter with calls to the authorised service, then remove the fixture and Demo data indicators. No component should need to import Amplify or change its display contract.

## File ownership by delivery stage

### Created in this task

- `src/views/Admin/AdminApplications/AdminApplications.vue`
- `src/views/Admin/AdminApplications/AdminApplicationDetail.vue`
- `src/views/Admin/AdminApplications/AdminApplications.css`
- `src/views/Admin/AdminApplications/applicationTypes.js`
- `src/views/Admin/AdminApplications/applicationAdminData.js`
- `src/views/Admin/AdminApplications/fixtures/demoApplication.js`
- `src/views/Admin/AdminApplications/components/*`
- `docs/admin-applications-architecture.md`

### Existing files updated

- `src/router/admin.routes.js`
- `src/views/Admin/AdminLayout/AdminLayout.js`
- `src/views/Admin/AdminLayout/AdminLayout.css`

### Future application storage

- `src/views/Admin/AdminApplications/services/applicationAdminService.js` for transport mapping only after an authorised backend exists.
- `amplify/data/resource.ts` application models and protected query/mutation definitions, following `docs/local-amplify-development.md` and an in-place `Ntgrestage8` update.
- Applicant submission service/composable alongside the public `src/views/Applications` form.
- Tests for server authorization, submission validation, versioned answers, and admin queue/detail transport mapping.

### Future three-reviewer process

- `components/ApplicationReviewPanel.vue` for criterion scoring and optional per-score comments.
- `components/ApplicationReviewSummary.vue` for admin-only completed-review comparison and the final average after all three reviews complete.
- A review service boundary enforcing reviewer independence server-side; frontend hiding is not authorization.
- Models/policies for exactly three assignments, per-criterion scores/comments, review-round identity, completion, and immutable reviewer attribution.

### Future decisions and induction

- `components/ApplicationAdminActions.vue` for approve/invite, applicant-facing decline reason, another review round, and internal notes.
- Separate backend commands and audit events for decisions, induction invitations, status transitions, and internal notes.

## Boundaries and open decisions

- The existing public form has no durable storage, and the admin scaffold therefore renders no fake applicants. Queue loading/error/data props are ready for a later service connection.
- Direct detail navigation currently shows an explicit unavailable-data scaffold; it performs no lookup.
- Decide the dedicated runtime permission key and its default group grants before backend work. Group-only access is intentionally the current compatible guard.
- Define stable pathway identifiers, application/reference generation, form-versioning, answer normalization, and the source of account/contact identity before schema design.
- Define review criteria, score scales, reassignment/recusal rules, round semantics, and averaging/rounding before implementing reviews.
- Therapist and Personal Trainer remain visible only in the public form as Coming Soon and are excluded from active admin pathway filters.
- Public competitive recruitment is temporarily closed through `src/config/applicationPathwayAvailability.js`. Admin active-pathway filters therefore contain only Creator Programme, while competitive labels and rendering remain available for historical submissions and future reopening. This changes new-entry availability only; `APP-DEMO-0001` and its review/induction workflows are unaffected.

## Frontend demo review workflow

The fictional `APP-DEMO-0001` flow now includes a third route, `/dashboard/applications/:applicationId/review`. A module-scoped reactive state in `applicationAdminData.js` preserves the simulation during in-app navigation but deliberately resets on a browser refresh. It uses no `localStorage`, session storage, network API, Cognito mutation, or Amplify record.

`fixtures/demoReviewers.js` defines the fictional Admin, Jordan Review, Casey Review, and Morgan Review preview identities. The `Demo preview as` control changes presentation and demo workflow actor only; it never replaces or represents the authenticated Cognito identity or a permission system. The control is rendered only inside the demo application journey.

Reviewers claim the next of exactly three slots. A reviewer can hold only one slot on an application. A claimant may release an unstarted claim; only Admin can release a started, unsubmitted claim, which discards its in-memory draft. Submitted reviews are immutable in the simulation. The eventual backend must claim slots atomically with a conditional write/transaction: frontend availability checks cannot prevent simultaneous claims, duplicate assignments, stale writes, or a fourth assignment.

`fixtures/creatorProgrammeReviewRubric.js` is the canonical frontend configuration for the four-stage Creator Programme assessment. The former six equal-weight demonstration criteria have been removed.

1. Reviewer confirmation checks identity, conflicts, evidence boundaries, confidentiality, and impartiality. Declaring a conflict requires an internal explanation, releases the claim, records an audit event, and does not create an applicant concern.
2. Seven eligibility/verification checks record Meets, Needs clarification, or Does not meet. Clarification/failure explanations are required and Admin-private. They do not change the numerical result, but any unresolved or historical issue blocks early/automatic induction and requires explicit Admin response unless the numerical result is below 35%, where automatic decline remains.
3. Seven internally weighted 1–10 criteria produce the reviewer percentage: Mission and values alignment 20%, Community safety and conduct 20%, Community engagement 15%, Creator readiness 15%, Reliability and commitment 15%, Collaboration and contribution 10%, and Growth potential 5%.
4. The reviewer confirms clarification items, optionally flags a separately explained serious concern, and may add an optional overall assessment distinct from criterion comments and applicant-facing decisions.

Reviewer UI shows criterion evidence guidance, questions, shared anchors, criterion-specific examples, selected 1–10 scores, and optional comments—but never weights, contributions, percentages, thresholds, or outcome predictions. This applies equally to ordinary, independent Admin, and informed Admin reviewer context. After explicit Admin reveal in administrative context, completed-review analysis shows eligibility explanations, internal weights, `(score / 10) × weight` contributions, overall assessment, provenance, concerns, and the full reviewer percentage.

The inclusion panel instructs reviewers not to assess spelling/grammar unless incomprehensible, disability, neurodivergence, anxiety, accent, presentation style, follower count alone, equipment/budget, game preferences, staff relationships, or communication-style similarity. Application completeness is an eligibility check and is not a scored criterion.

Early acceptance still requires exactly two individually weighted results of at least 85%, no current or historical concern, no eligibility clarification/failure, and explicit Admin confirmation with a reason and audited third-review waiver. The final three-review result is the arithmetic mean of full-precision weighted reviewer results.

Only Creator Programme uses this rubric. Competitive streamer, player/roster, coaching, and analysis/support pathways require a later architecture combining shared core standards with specialist pathway criteria.

Each submitted review percentage is its full-precision mean score multiplied by ten. A combined full-precision mean is calculated only after all three reviews are submitted:

- `>= 85%`: automatically qualified, status becomes Accepted — induction required.
- `>= 35%` and `< 85%`: Admin decision required.
- `< 35%`: automatically declined; Admin can override to induction.

Admin can also bypass incomplete reviews with a required internal reason. Bypass closes unsubmitted claims/drafts, preserves submitted reviews, prepares a fictional audit event, induction invitation state, and applicant email preview. Middle-range decline requires a separate applicant-facing reason. General audit events never contain score comments.

No meetings or booking route currently exists in the repository. The induction action therefore remains disabled and documents the future contract: a real email should contain a secure, expiring, opaque invitation token leading to a canonical meetings page where the applicant selects induction meeting type, available staff where applicable, and date/time. Applicant email previews exclude reviewer identity, scores, and internal comments.

### Required backend boundaries

- Dedicated permissions for viewing applications, claiming/releasing, submitting reviews, viewing all reviews, making decisions, overriding, and managing induction.
- Atomic three-slot claim enforcement, unique reviewer-per-application constraints, optimistic concurrency/version checks, and applicant/self-review prevention.
- Server-owned immutable submissions, criterion/rubric versioning, full-precision calculations, decision transitions, audit events, and separation of reviewer-private comments from applicant communications.
- Authorised email templates/delivery and a secure expiring invitation-token contract with the future meeting service.
- Server enforcement of Admin bypass/override reasons, decline messaging, submitted-review immutability, and audit retention.

## Extended admin review and induction simulation

Admins now participate in the same three-slot pool and may submit one scored review. Before explicitly revealing completed review detail, their work is labelled `Independent admin review` and peer scores/comments remain hidden. Choosing `View completed reviews` records an audit event and permanently marks a later Admin submission as `Informed admin review`; hiding the panel again cannot restore independence. Admin administrative powers remain separate from occupying a review slot, and no fourth scored review is possible.

Each submitted review has a separate serious-concern choice. A flag requires a private explanation, is visible only in Admin preview, is omitted from applicant communications, blocks two-review early acceptance, and overrides score-based automatic acceptance. Once any concern has existed, automation cannot restart acceptance: an authorised Admin must explicitly progress, request future handling, or decline with a reason, preserving the original concern and decision events.

Two completed reviews enable early acceptance only when both individual unrounded percentages are at least 85%, neither contains a concern, no concern has ever existed, and the application is not final. Early acceptance requires a reason, closes an unfinished third claim/draft, preserves both submissions, records that the third review was waived, and creates the induction/email simulation. It never happens automatically.

The former bypass interaction used sequential browser `prompt`/`confirm` calls and had no actual modal form, inline validation, or persistent confirmation action. `DemoActionModal.vue` now provides the bypass, early-acceptance, pause, and restore confirmation surface with a required trimmed reason, inline error, Escape/Cancel, initial focus, internal scrolling, and sticky visible actions. Double submission is disabled while confirmation runs.

Accepted induction can be paused with a reason while preserving reviews and calculated scores. The simulated invitation is revoked and any fictional booking is paused. Admin may later restore induction, decline separately, or inspect revealed reviews. A completed induction rejects this simple pause transition; post-induction membership removal remains a separate future workflow. Automatic rejection remains in the audit history when Admin overrides it.

`/dashboard/applications/inductions` and `/dashboard/applications/inductions/:inductionId` are declared before the dynamic application route. They expose the fictional booking in `fixtures/demoInductions.js`, filters, assigned staff, acceptance origin, meeting/attention state, applicant-safe details, and audit history. Admin preview can mark attendance, reassign fictional staff, pause/cancel/complete, and simulate joining without opening a provider URL. Reviewers receive an Admin-only state in the demo UI; this is not authorization.

Future backend permissions should include `applications.review`, `applications.view_reviews`, `applications.decide`, `inductions.view`, `inductions.manage`, and `inductions.join`. Backend enforcement must cover atomic slot claims, permanent reveal/informed-review provenance, immutable concerns and decisions, early-acceptance eligibility, invitation revocation, booking concurrency, staff notifications, and append-only audit records. Email, calendar, booking, and meeting providers must use authorised server commands and opaque expiring tokens; no provider integration exists in this simulation.

## Admin progress and decision summary

`components/AdminReviewProgressPanel.vue` is rendered prominently on the application detail page only for the Admin demo identity. It does not calculate a second outcome: it reads the existing reviewer slots and calls `isEarlyAcceptanceEligible`, `acceptEarly`, `claimReview`, `revealCompletedReviews`, `waitForThirdReview`, and `adminBypass` from the shared workflow boundary.

The panel always states the three-independent-review standard, claimed/completed/remaining counts, concern history, current decision status, recommended next action, and every slot’s lifecycle state. Its permanent “Are two reviews enough?” card exposes each eligibility check from the start. Before review detail is explicitly revealed, it reports only safe threshold results such as `Qualifying score recorded`; comments and exact percentages remain in the authorised detailed-review view.

Early acceptance is presented as evidence meeting the two-review rule and requires a reasoned Admin decision that waives the third review. Bypass is presented separately as a senior override and never as satisfying that rule. With an available slot, Admin can instead claim the existing third slot and complete the normal independent review; after explicit review reveal, the same action is labelled and recorded as informed.

The Admin-only scenario tools load strong, mixed, or serious-concern two-review states by calling the real in-memory claim and submission functions. They do not hard-code displayed eligibility or mutate Cognito/browser storage. Reset returns to the canonical fictional fixture.

A future backend decision-summary response should provide authorised slot state, threshold eligibility booleans safe to reveal before detailed-review access, immutable concern-history status, current decision/outcome provenance, and allowed commands. The server—not this panel—must enforce eligibility, slot concurrency, reveal provenance, waivers, and decision transitions.

## Feature tabs, review dashboard, and induction calendar

The Admin Applications feature now has route-backed `Applications`, `Review progress`, and `Inductions` navigation. `/dashboard/applications/reviews` and both static induction routes are declared before the dynamic application route. Application detail remains in the Applications context; induction pages remain in the Inductions context. The main dashboard sidebar continues matching the shared `/dashboard/applications` prefix. Reviewer demo previews receive only the Applications destination; real backend authorization must separately enforce organisation-wide review and induction permissions.

`AdminApplicationReviews.vue` derives its cards, eight-phase pipeline, filters, and table from `getReviewDashboard` in the existing workflow adapter. The projection exposes claim/completion counts, serious-concern and early-acceptance flags, phase, automated outcome, required action, and last activity. It intentionally omits exact scores, combined percentages, comments, and reviewer identities until an Admin explicitly uses the existing reveal action on an application. Automatic acceptance is described as threshold met/no blocking concern/progressed to induction; automatic decline and workflow exceptions remain separate filterable states.

`AdminInductions.vue` uses a small accessible month grid model aligned with the existing Events calendar pattern rather than adding another dependency. On narrow screens CSS replaces the grid with a labeled agenda. Calendar and table both consume the same filtered `demoWorkflow.inductions` collection, so date/status/staff filters and attendance, reassignment, pause, and cancellation mutations update both. Populated calendar dates are keyboard buttons, empty dates are non-interactive, and event selection opens a safe summary before navigation. The display time zone is stated using the browser setting, while every canonical fixture retains and displays its original `timeZone`.

The expanded fictional fixture collection covers multiple dates, two records on 16 August 2026, upcoming/booked, awaiting booking, needs staff, Admin attending, paused, cancelled, and completed states. No identities, URLs, emails, or timestamps represent real people or provider records.

Future backend queries should return permission-filtered review projections separately from deliberately revealed review details, and server commands must own every decision and induction mutation. Calendar and meeting providers remain behind future server-side adapters with opaque invitation/join contracts; this frontend does not connect to a provider. Backend policy must enforce `applications.view_reviews`, `applications.decide`, `inductions.view`, `inductions.manage`, score privacy, audit retention, and reviewer independence.

## Reviewer visibility and calibration analytics

Authorised Admin preview now sees reviewer identity, slot state, claimed/submitted timestamps, independent or informed provenance, submitted weighted percentage, concern status, and clarification status on Review Progress. Criterion scores and comments remain on the application detail. A combined percentage appears only after three submissions or a completed two-review early-acceptance decision.

The independent Admin safeguard is preserved. When the acting Admin owns an unfinished `Independent admin review`, the Review Progress projection hides peer scores and the combined percentage. `Reveal scores and continue as an informed reviewer` uses the existing confirmation and `revealCompletedReviews` audit command; disclosure permanently marks the Admin review informed. Frontend hiding is not authorization: future services must enforce `applications.view_review_progress` and `applications.view_reviews` independently.

`/dashboard/applications/reviewers` and `/dashboard/applications/reviewers/:reviewerId` are static Admin-only routes declared before application IDs. `fixtures/demoReviewerPerformance.js` is an isolated, fixed historical dataset and never mutates `APP-DEMO-0001`. `reviewerPerformanceData.js` calculates average/median/range, threshold and concern rates, score bands, comment coverage, claim-to-submission time, and same-application peer comparisons.

For each submitted result, peer mean excludes the selected reviewer and includes only other submitted reviews for that application. The signed difference captures direction; absolute difference captures agreement. Dashboard metrics aggregate signed and absolute differences, closest alignment, largest gap, and material disagreements. Filters separate date, pathway, rubric version, provenance, and minimum sample so materially different rubrics are not silently compared.

Calibration thresholds live in `DEMO_CALIBRATION_SETTINGS`: 10 comparable reviews minimum, 3 percentage points for close alignment, 10 for material difference, 6 for monitoring, 9 for calibration recommendation, 35% low comment coverage, and 72 hours for stale claims. They are visibly labelled demonstration settings requiring policy approval. Results use neutral `Insufficient sample`, `Within expected range`, `Review pattern to monitor`, and `Calibration recommended` states; no metric or combination establishes misconduct.

Durable analytics will require authorised, versioned review facts and immutable assignment events rather than client fixtures. Backend enforcement must add `reviewers.view_performance` and `reviewers.manage_calibration`, scope applicant information, separate rubric cohorts, preserve reviewer independence, and define approved thresholds and retention before real performance-management use.

## Induction booking and availability

`/induction/book/:invitationToken` is a frontend-only time-first journey: invitation state, simulated account and verified-email match, IANA time zone, date, time, available staff, review, final recheck, and confirmation. Staff selection follows time selection and exposes only public profile fields. Existing bookings can be viewed, rescheduled through the same flow, or cancelled with confirmation. Production requires cryptographically random single-use tokens, hashed storage, expiry, revocation, account binding, controlled email changes, and immutable audit.

`/dashboard/applications/availability` is static before application IDs. Admin preview sees organisation-wide hours, sources, coverage, capacity, recurring-hours creation, and staff blocks. Staff preview sees only its hours and bookings and may report its own unavailability. Future permissions must enforce schedule administration, self-unavailability, corrections, and reassignment rather than trusting demo identity state.

`inductionAvailabilityData.js` keeps recurring and one-off hours, staff unavailability, fictional Outlook free/busy, and canonical induction bookings as separate inputs. Bookable slots subtract inactive staff, unavailable and busy periods, existing bookings with buffers, and daily limits. Genuine unavailability blocks immediately; a booking overlap is preserved and marked `Admin action required` instead of being cancelled.

Confirmation recalculates availability. The collision demo inserts a fictional busy block, preserves date/time, offers remaining staff, and returns to time selection only if none remain. Success inserts or updates the canonical induction record, synchronising Inductions and Availability; cancellation releases capacity and paused bookings remain blocking. No email, Outlook event, or provider call occurs.

Future Microsoft Graph integration should consume free/busy only, without private event content. Server-side calculation must own time-zone conversion, concurrency, buffers, caps, conflict transactions, secure token/account binding, notifications, audit, and Outlook event creation.

## Generic Bookings architecture

The public scheduling surface is now `Bookings`, with canonical `/bookings`, `/bookings/:bookingTypeSlug`, and `/bookings/invite/:invitationToken` routes. The static invitation route precedes the dynamic type slug. `/induction/book/:invitationToken` is a compatibility redirect that preserves token, query, and hash and should be removed after old links expire. An invitation loads and locks its configured booking type; direct type URLs still enforce status, audience, account, and invitation requirements.

`bookingAvailabilityData.js` is the generic frontend boundary for booking types and typed slot projections. The model holds stable ID, slug, copy, status, access type (`public`, `account-required`, `invitation-only`, or `internal`), audience, account/invitation flags, duration, buffers, notice, horizon, policies, eligible staff, visibility, ordering, confirmation, and preparation instructions. Induction is the first active invitation-only type; Creator consultation is draft and Company introduction inactive.

Top-level `/dashboard/availability` owns supply administration and sidebar state independently of Applications. Its compact navigation covers Overview, Booking types, Staff schedules, Unavailability, and Calendar. Admin demo users may create/edit types, configure access and timing, assign eligible staff, validate activation prerequisites, and use the preserved recurring/one-off scheduling tools. Staff remain restricted to their assigned types/hours, bookings, and their own unavailability. `/dashboard/applications/availability` redirects temporarily to the top-level route.

The generic calculation is: eligible booking-type windows minus global staff unavailability, fictional Outlook free/busy, all confirmed/paused bookings and cross-type buffers, inactive staff, notice/horizon limits, and daily limits. Type projections use the selected type’s duration, buffers, and eligible staff. The frontend compatibility adapter still delegates proven low-level availability arithmetic to the original tested module; it does not create a second state store.

`demoWorkflow.bookings` is the canonical generic collection. `inductions` remains a same-array compatibility alias for existing components during migration. Records carry booking type identity, optional related application/invitation, staff, schedule/time zone, origin, meeting/status timestamps, and audit events. Applications → Inductions calls `listDemoInductions`, which filters the generic collection to Induction and preserves application relationships; generic future bookings need no application.

Availability manages types and supply, public Bookings manages customer selection, and Applications → Inductions remains the induction-specific operational view. A future top-level Admin Bookings area should manage all scheduled services, but is intentionally not built here.

Production requires server-authorised booking-type administration, eligible-staff assignment, availability management, self-unavailability, booking creation/cancellation/reassignment, audience enforcement, notice/horizon validation, and concurrency-safe cross-type exclusion. Microsoft Graph remains a free/busy boundary without private event content; secure invitation tokens, account binding, durable generic booking storage, notifications, and provider event creation remain backend responsibilities.

### SuperAdmin invitation fixture

`Bookings/fixtures/demoBookingInvitations.js` defines one exact removable fixture, `DEMO-SUPERADMIN-INDUCTION`, for `superadmin@projectrespawn.com` and `APP-DEMO-0001`. It opens `/bookings/invite/DEMO-SUPERADMIN-INDUCTION`, remains account-required, and compares the simulated verified account email before booking. The Admin-only demo application panel links to it and previews instructions with an explicit no-email-sent notice. Unknown and similar tokens remain invalid; no prefix-based acceptance exists. Reset restores the fixture to valid, unused, unrevoked, account-required, and unbooked. This is not a security design: production tokens must be random, hashed, expiring, revocable, single-use, and account-bound.
