# Phase 1 green-baseline attempt — stopped on artifact drift

Local validation only. This follow-up preserves the accepted Phase 1 implementation and historical [Phase 1 report](phase1-implementation.md). No AWS deployment, watcher, production configuration, Cognito change or data migration was performed.

**Outcome: stopped, not green.** The exact comparison returned **0 additions / 89 updates / 308 deletions**, rather than 0 / 81 / 308. Five Lambda bundles have identical executable JavaScript but different source-map line endings, changing their asset hashes. This came from this run's Linux snapshot normalizing LF **before** synthesis; the prior baseline synthesis retained CRLF source contents. The comparison correctly failed closed. No baseline refresh, comparator relaxation or further validation was attempted after the stop condition.

## 1. Seven-failure resolution

### 1. Linux AdminEvents path

- **Failure / root cause:** `stage9-boundaries.test.ts` opened `Adminevents/AdminEvents.js`; Git tracks `AdminEvents/AdminEvents.js`. Windows case-insensitive lookup concealed the mismatch.
- **Intended / current behavior:** Test the tracked Admin Events implementation on every supported filesystem. The application router already imports the canonical `AdminEvents` path.
- **Test or application bug:** Test path bug. `git ls-files` establishes the canonical spelling; the test dates to `cab858a`.
- **Fix:** Correct the one path. Case-insensitive searches across `src`, `amplify` and `scripts` found no other incorrectly cased AdminEvents paths. No folder rename.
- **Security / behavior impact:** Existing boundary assertions remain intact; no runtime change.
- **Result:** Fix prepared; Linux test not reached before the mandatory stop.

### 2. Authoritative Brand permissions

- **Failure / root cause:** The test expected the old platform-only create-Brand error from a Staff identity with no authoritative grants. Current creation rejects missing/foreign ownership first.
- **Intended / current behavior:** Platform operators can manage Brands; non-operators can create a Brand only as themselves in exactly one owned Creator Workspace. A Staff group label alone confers no platform permission. Owner reassignment remains platform-only.
- **Evidence:** `df3794f` explicitly replaced the platform-only create gate with owner/workspace checks. Existing Brand handler tests cover allowed creator-owned creation, platform creation and foreign-owner denial. This is an intentional authorization model change, not merely different error ordering.
- **Test or application bug:** Stale test; the current owner/workspace rejection is appropriate.
- **Fix:** Exercise omitted and foreign owners, rejection before workspace reads, self-owner without a workspace, and platform-only owner reassignment. Assert zero Brand writes for all denied requests. Preserve the merchandise and event denials.
- **Security / behavior impact:** No authorization code changed or weakened. The test now verifies both creator ownership restrictions and authoritative platform permission denial.
- **Result:** Fix prepared; Linux test not reached before the mandatory stop.

### 3. Connected-demo Creator Tools routes

- **Failure / root cause:** A single-line regex could not match multiline route records.
- **Intended / current behavior:** Community, events, rewards, achievements and members each mount their corresponding connected-demo page under the authenticated Creator Tools parent.
- **Evidence:** Current route declarations and component imports agree; route history `127b226` and demo test history `544f725` explain the formatting-sensitive mismatch.
- **Test or application bug:** Test formatting assumption.
- **Fix:** Parse the actual JavaScript route module, replace component imports with their source paths and evaluate its route declarations. Assert each unique path, name, component mapping and parent `requiresAuth` flag.
- **Security / behavior impact:** Stronger route/auth structure coverage; existing no-external-request and fictional-data checks remain. No route or loading behavior changed.
- **Result:** Fix prepared; Linux test not reached before the mandatory stop.

### 4. Chat v2 runtime/preview/legacy precedence

- **Failure / root cause:** The test expected runtime directly followed by legacy configuration, omitting the injected preview fallback.
- **Intended / current behavior:** Normalize runtime Chat first, then injected preview configuration, then legacy widget settings.
- **Evidence:** `d8e543d` deliberately introduced preview injection and this fallback order alongside shared chat events.
- **Test or application bug:** Stale source-expression assertion.
- **Fix:** Select the actual `chat` and `legacyConfig` declarations using the JavaScript AST and execute them with Vue reactivity and the real normalizer. Exercise all three precedence levels and verify canonical v2 plus moderation terms.
- **Security / behavior impact:** Runtime settings take precedence over preview settings; no persisted or runtime behavior changed.
- **Result:** Fix prepared; Linux test not reached before the mandatory stop.

### 5. Browser Source refreshed Chat configuration

- **Failure / root cause:** The same obsolete two-way fallback expression was asserted independently of refresh behavior.
- **Intended / current behavior:** Browser Source passes refreshed runtime configuration through the renderer; the widget recomputes normalized canonical Chat, including disabled state and moderation terms.
- **Evidence:** The source/renderer forwarding contract remains present; `d8e543d` explains the intentional preview fallback.
- **Test or application bug:** Stale test.
- **Fix:** Retain forwarding, polling and shared-normalizer checks. Replace the fallback regex with a reactive runtime configuration update; assert new message limits, preserved blocked terms and `enabled: false` without falling through to preview.
- **Security / behavior impact:** Preserves disabled/moderation settings in the tested refresh path. No application change.
- **Result:** Fix prepared; Linux test not reached before the mandatory stop.

### 6. Legacy publication freshness and display

- **Failure / root cause:** The test expected “Status unknown · update recommended”; current UI says “Published · update recommended”.
- **Intended / current behavior:** An existing publication is known to exist even when legacy metadata cannot establish its freshness. Recommend updating it; mark a changed scene stale. Without a publication, distinguish checking, unavailable and not published.
- **Evidence:** `8af98de` intentionally introduced these separate Browser Source states. `liveStatusUnknown` still checks missing source revision; `liveOutOfDate` still includes scene changes.
- **Test or application bug:** Stale UI expectation, not a loss of freshness protection.
- **Fix:** Execute the actual computed freshness declarations and template status expression. Cover missing revision, matching revision, changed scene, no publication, checking, failure and all published labels. Keep editor wiring checks.
- **Security / behavior impact:** No publication operation or credential behavior changed; uncertainty is still visible as an update recommendation.
- **Result:** Fix prepared; Linux test not reached before the mandatory stop.

### 7. Demo-only Admin invitation action

- **Failure / root cause:** The test expected an admin-only `v-if` string and rejected the additional `application.isDemo` condition.
- **Intended / current behavior:** Show the demo review/action panel only for a demo application viewed as demo admin. Live application data must not expose demo actions.
- **Evidence:** `53039c3` introduced the real application storage/admin UI separation and explicitly added the demo guard.
- **Test or application bug:** Stale source regex; removing the extra guard would be a regression.
- **Fix:** Parse the actual component `v-if` and test the truth table for demo/non-demo applications and admin/reviewer/applicant/missing roles. Preserve exact invitation token, email, application ID, no-email-sent and legacy route checks.
- **Security / behavior impact:** Stronger demo/live separation coverage. This UI predicate is not claimed as a substitute for backend authorization.
- **Result:** Fix prepared; Linux test not reached before the mandatory stop.

## 2. Final test ledger

| Validation | Result |
| --- | --- |
| Clean Linux `npm ci` | PASS (Node 22.18.0, npm 10.9.3; existing install warnings retained in log) |
| Master synthesis | PASS; local synthesis only |
| Exact baseline/candidate comparison | FAIL: 1,231 passed / 15 failed assertions, 1,246 total |
| TypeScript, contracts, guards, Team Hub backend/frontend, tournaments, overlays, connected demo, master preview, runtime ownership, accounting, handler tests, production build | NOT RUN after mandatory stop |
| Complete clean Linux test suite | NOT RUN: 0 executed; passed/failed/skipped totals are not available |

No tests were deleted, suppressed or marked skipped. The full suite did not run because the infrastructure check ran first and triggered the explicit stop instruction. Historical Phase 1 results (646 passed / 7 failed) are not presented as current results.

A preliminary Windows run of five affected frontend test files failed before assertions with Node `UNKNOWN: unknown error, read` while loading local dependencies. That environmental failure is not a Linux suite result; no host dependencies were replaced. The isolated Linux container was stopped and retained after the comparison failure.

Logs, commands and diagnostic evidence: [evidence manifest](phase1-green-baseline-evidence/README.md).

## 3. Infrastructure regression check

| Metric | Required | Observed |
| --- | ---: | ---: |
| Total hierarchy resources | 2,628 | 2,628 |
| FunctionDirectiveStack resources | 167 | 167 |
| Added | 0 | 0 |
| Updated | 81 | **89** |
| Deleted | 308 | 308 |

The eight extra updates comprise five Lambda code asset references and three additional parent nested-template references. Affected Lambdas: post-confirmation, admin-user-management, myFunction, twitch-runtime and OverlaySource. Their executable JS bytes are identical. For all five, source-map paths and content match exactly after normalizing CRLF to LF; all remaining source-map properties are identical. The original byte-level evidence remains unchanged and the comparison still fails.

Cognito, DynamoDB, S3, KMS, AppSync identities/schema, API routes and permissions retain identical definitions in this local comparison. However, **zero protected-resource changes cannot be claimed**: the protected Lambda code references changed. Nothing was applied to AWS, and no fresh live-state verification was performed here.

All 79 operation contracts, retained handler anchors and Team Hub gateways remain unchanged. Byte-hash checks against the task-start workspace confirm no edits to backend/runtime sources, schema, auth, outputs, lockfile, resource receipts/budgets, LegacyPlatform rules, comparator or CI implementation. Test/helper changes do alter the infrastructure input fingerprint; the accepted receipt was not refreshed to hide this.

The next validation attempt must explicitly reconcile the line-ending conditions of the preserved baseline and candidate before claiming exact asset equivalence. Do not replace the baseline or waive Lambda checks. No corrected re-synthesis was run after the stop.

## 4. Files changed

| File | Reason |
| --- | --- |
| `amplify/data/stage9-boundaries.test.ts` | Canonical tracked AdminEvents path |
| `amplify/myFunction/shared/authoritativePermissions.test.ts` | Authoritative Brand/ownership denials and no-write assertions |
| `src/features/creator-tools/connected-demo/connectedDemoState.test.mjs` | Structural route/component/auth contract |
| `src/features/creator-tools/overlays/tests/chatCanonicalConfig.test.mjs` | Actual reactive three-level Chat precedence |
| `src/features/creator-tools/overlays/tests/creatorChatConfig.test.mjs` | Actual refreshed canonical Chat behavior |
| `src/features/creator-tools/overlays/tests/overlayDraftLive.test.mjs` | Actual freshness computation and publication status states |
| `src/views/Admin/Bookings/demoSuperAdminInvitation.test.mjs` | Demo/admin condition truth table |
| `src/features/creator-tools/overlays/tests/chatWidgetContract.mjs` | Shared test harness for actual widget declarations |
| `scripts/test-support/source-contracts.mjs` | AST-based test helpers for trusted local source; no new dependencies |
| `docs/architecture/phase1-green-baseline.md` | This investigation and validation report |

Previously dirty Phase 1/auth/configuration files are preserved; the table identifies changes made by this follow-up only. Every new evidence file and its purpose is listed in the [evidence manifest](phase1-green-baseline-evidence/README.md), with hashes in `files.json`. Ignored `.amplify/green-baseline` source snapshots, assemblies and runner are local validation artifacts.

## 5. Deployment readiness

**No: this attempt has not established readiness for controlled deployment to the existing Ntgre environment.** First reconcile artifact reproducibility, obtain the expected exact comparison and complete the genuinely green Linux ledger. Target-specific preflight and review against the actual existing Ntgre deployment remain necessary; the hosted master synthesis is not a live sandbox change plan. No deployment was performed.

## 6. Phase 2 readiness

Frontend lazy loading can begin as a separate follow-up **after** the green baseline and successful non-production infrastructure proof. Those prerequisites are not yet satisfied. It has not been started here.
