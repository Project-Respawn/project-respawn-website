# Phase 1 green baseline ? reproducible Linux validation

Verified 2026-09-22. **653 passed / 0 failed / 0 skipped. Production build passed. Exact infrastructure comparison: 0 additions / 81 updates / 308 deletions; all 1,238 checks passed.** No AWS deployment, change set, watcher, Cognito change, migration or DNS change was performed.

This result applies to the recorded validation snapshot. Unrelated SWG frontend edits appeared in the shared workspace during validation and are explicitly outside it (section G).

## A. Artifact reproducibility root cause

The failed attempt's temporary snapshot helper executed `content.toString('utf8').replaceAll('\r\n', '\n')` before writing selected source files and creating the tar archive. That changed embedded `sourcesContent` in five Lambda source maps, changing their packaged asset hashes. It was **snapshot generation**, not Docker transfer or esbuild rewriting application files.

Git's system configuration is `core.autocrlf=true`; there is no repository `.gitattributes`, and `git check-attr text eol` reports unspecified attributes for the inspected build-sensitive files. This explains the existing Windows working-tree CRLF representation. Git did not perform a checkout during the failed snapshot copy. A fresh Linux Git checkout would therefore not faithfully reproduce this reviewed, partly uncommitted working tree without an explicit representation policy.

The proof compares each differing embedded source against both the original working-tree file and the preserved failed snapshot: all failed snapshot bytes equal exactly the CRLF-to-LF conversion; all original contents equal the baseline source-map contents. All other map properties and all executable JavaScript bytes are identical. The corrected transfer's per-file hash verification before install, after install and after synthesis independently proves tar/Docker/npm/build tooling did not change source bytes.

| Affected Lambda | Differing embedded source files | Proven discrepancy |
| --- | ---: | --- |
| post-confirmation | 1 | Source-map embedded CRLF ? LF only |
| admin-user-management | 10 | Source-map embedded CRLF ? LF only |
| myFunction | 71 | Source-map embedded CRLF ? LF only |
| twitch-runtime | 15 | Source-map embedded CRLF ? LF only |
| OverlaySource | 5 | Source-map embedded CRLF ? LF only |

See [every asset/hash/source file](phase1-reproducibility-evidence/artifact-details.md) and [machine-readable byte provenance](phase1-reproducibility-evidence/artifact-root-cause.json). They include baseline and failed-candidate asset hashes, executable SHA-256, source-map SHA-256 and each affected source path/hash. All 12 Lambda resources now match the accepted asset references again; [accepted-asset preservation](phase1-reproducibility-evidence/accepted-asset-preservation.json) records the restored references.

## B. Reproducibility fix

`scripts/snapshot-validation-source.mjs` selects tracked and non-ignored untracked files using Git, copies raw Buffers into a new isolated directory, and writes a SHA-256 manifest. It never decodes or rewrites source contents. Verification after Linux extraction and builds fails if any listed byte changes. Git metadata, installed dependencies, ignored artifacts and the separate Codex worktree are not copied.

Both fresh Linux environments used **node:22.18.0 / npm 10.9.3**, independent clean `npm ci`, the same repaired lockfile, identical environment inputs and the same `/work` path. Tests ran without a globally forced branch/auth mode; synthesis sets its own master context. No AWS credentials were mounted.

The baseline uses the preserved pre-consolidation schema, verified against its original receipt. All other Amplify runtime sources match the candidate byte-for-byte. [Baseline provenance](phase1-reproducibility-evidence/baseline-provenance.json) and the two input manifests make the reconstruction explicit. The accepted baseline/exception files were not changed.

Example snapshot commands, run from the repository root:

`node scripts/snapshot-validation-source.mjs copy .amplify/<new-snapshot>`

`node scripts/snapshot-validation-source.mjs verify .amplify/<new-snapshot>`

Transfer that directory unchanged; run the same verifier in Linux before installation/synthesis. Reproduction runners, exact command ledgers and manifest amendments are included in the [evidence index](phase1-reproducibility-evidence/README.md). Amendments record only the reviewed test/helper fixes; no application byte normalization occurred.

No global line-ending migration is needed for this task. A future `.gitattributes` policy would be a separate reviewed change because rebuilding normalized source maps intentionally changes assets. Exact source-map, executable, packaged-file and code-reference comparisons remain unchanged and mandatory.

## C. Exact infrastructure comparison

| Metric | Fresh result |
| --- | ---: |
| Baseline hierarchy | 2,936 |
| Candidate hierarchy | 2,628 |
| Candidate FunctionDirectiveStack | 167 |
| Added | 0 |
| Updated | 81 |
| Deleted | 308 |
| Exact checks passed / failed | 1,238 / 0 |

The initial corrected comparison, the new synthesis after the helper correction, and the final post-test comparison all pass. The 81 updates retain the approved shape: 77 resolver pipeline references, two nested-template references, one codegen asset reference and synthesis-time API-key expiry. The 308 removals are the approved redundant invocation/data-source/IAM resources. All 79 operations, both retained handler anchors, readTeamHub/mutateTeamHub and their authorization contracts remain intact. See [final comparison](phase1-reproducibility-evidence/final-comparison/summary.json).

## D. Seven-test resolution

### 1. Linux AdminEvents path

- **Failure / root cause:** `stage9-boundaries.test.ts` opened `Adminevents/AdminEvents.js`; Git tracks `AdminEvents/AdminEvents.js`. Windows case-insensitive lookup concealed the mismatch.
- **Intended / current behavior:** Test the tracked Admin Events implementation on every supported filesystem. The application router already imports the canonical `AdminEvents` path.
- **Test or application bug:** Test path bug. `git ls-files` establishes the canonical spelling; the test dates to `cab858a`.
- **Fix:** Correct the one path. Case-insensitive searches across `src`, `amplify` and `scripts` found no other incorrectly cased AdminEvents paths. No folder rename.
- **Security / behavior impact:** Existing boundary assertions remain intact; no runtime change.
- **Result:** PASS in the complete clean Linux suite.

### 2. Authoritative Brand permissions

- **Failure / root cause:** The test expected the old platform-only create-Brand error from a Staff identity with no authoritative grants. Current creation rejects missing/foreign ownership first.
- **Intended / current behavior:** Platform operators can manage Brands; non-operators can create a Brand only as themselves in exactly one owned Creator Workspace. A Staff group label alone confers no platform permission. Owner reassignment remains platform-only.
- **Evidence:** `df3794f` explicitly replaced the platform-only create gate with owner/workspace checks. Existing Brand handler tests cover allowed creator-owned creation, platform creation and foreign-owner denial. This is an intentional authorization model change, not merely different error ordering.
- **Test or application bug:** Stale test; the current owner/workspace rejection is appropriate.
- **Fix:** Exercise omitted and foreign owners, rejection before workspace reads, self-owner without a workspace, and platform-only owner reassignment. Assert zero Brand writes for all denied requests. Preserve the merchandise and event denials.
- **Security / behavior impact:** No authorization code changed or weakened. The test now verifies both creator ownership restrictions and authoritative platform permission denial.
- **Result:** PASS in the complete clean Linux suite.

### 3. Connected-demo Creator Tools routes

- **Failure / root cause:** A single-line regex could not match multiline route records.
- **Intended / current behavior:** Community, events, rewards, achievements and members each mount their corresponding connected-demo page under the authenticated Creator Tools parent.
- **Evidence:** Current route declarations and component imports agree; route history `127b226` and demo test history `544f725` explain the formatting-sensitive mismatch.
- **Test or application bug:** Test formatting assumption.
- **Fix:** Parse the actual JavaScript route module, replace component imports with their source paths and evaluate its route declarations. Assert each unique path, name, component mapping and parent `requiresAuth` flag.
- **Security / behavior impact:** Stronger route/auth structure coverage; existing no-external-request and fictional-data checks remain. No route or loading behavior changed.
- **Result:** PASS in the complete clean Linux suite.

### 4. Chat v2 runtime/preview/legacy precedence

- **Failure / root cause:** The test expected runtime directly followed by legacy configuration, omitting the injected preview fallback.
- **Intended / current behavior:** Normalize runtime Chat first, then injected preview configuration, then legacy widget settings.
- **Evidence:** `d8e543d` deliberately introduced preview injection and this fallback order alongside shared chat events.
- **Test or application bug:** Stale source-expression assertion.
- **Fix:** Select the actual `chat` and `legacyConfig` declarations using the JavaScript AST and execute them with Vue reactivity and the real normalizer. Exercise all three precedence levels and verify canonical v2 plus moderation terms.
- **Security / behavior impact:** Runtime settings take precedence over preview settings; no persisted or runtime behavior changed.
- **Result:** PASS in the complete clean Linux suite.

### 5. Browser Source refreshed Chat configuration

- **Failure / root cause:** The same obsolete two-way fallback expression was asserted independently of refresh behavior.
- **Intended / current behavior:** Browser Source passes refreshed runtime configuration through the renderer; the widget recomputes normalized canonical Chat, including disabled state and moderation terms.
- **Evidence:** The source/renderer forwarding contract remains present; `d8e543d` explains the intentional preview fallback.
- **Test or application bug:** Stale test.
- **Fix:** Retain forwarding, polling and shared-normalizer checks. Replace the fallback regex with a reactive runtime configuration update; assert new message limits, preserved blocked terms and `enabled: false` without falling through to preview.
- **Security / behavior impact:** Preserves disabled/moderation settings in the tested refresh path. No application change.
- **Result:** PASS in the complete clean Linux suite.

### 6. Legacy publication freshness and display

- **Failure / root cause:** The test expected “Status unknown · update recommended”; current UI says “Published · update recommended”.
- **Intended / current behavior:** An existing publication is known to exist even when legacy metadata cannot establish its freshness. Recommend updating it; mark a changed scene stale. Without a publication, distinguish checking, unavailable and not published.
- **Evidence:** `8af98de` intentionally introduced these separate Browser Source states. `liveStatusUnknown` still checks missing source revision; `liveOutOfDate` still includes scene changes.
- **Test or application bug:** Stale UI expectation, not a loss of freshness protection.
- **Fix:** Execute the actual computed freshness declarations and template status expression. Cover missing revision, matching revision, changed scene, no publication, checking, failure and all published labels. Keep editor wiring checks.
- **Security / behavior impact:** No publication operation or credential behavior changed; uncertainty is still visible as an update recommendation.
- **Result:** PASS in the complete clean Linux suite.

### 7. Demo-only Admin invitation action

- **Failure / root cause:** The test expected an admin-only `v-if` string and rejected the additional `application.isDemo` condition.
- **Intended / current behavior:** Show the demo review/action panel only for a demo application viewed as demo admin. Live application data must not expose demo actions.
- **Evidence:** `53039c3` introduced the real application storage/admin UI separation and explicitly added the demo guard.
- **Test or application bug:** Stale source regex; removing the extra guard would be a regression.
- **Fix:** Parse the actual component `v-if` and test the truth table for demo/non-demo applications and admin/reviewer/applicant/missing roles. Preserve exact invitation token, email, application ID, no-email-sent and legacy route checks.
- **Security / behavior impact:** Stronger demo/live separation coverage. This UI predicate is not claimed as a substitute for backend authorization.
- **Result:** PASS in the complete clean Linux suite.


Two additional **test-only portability fixes** were necessary when preserving CRLF: application-storage-boundary and media-storage-boundary previously located schema sections with literal LF sequences. Their selectors now accept whitespace/line-ending variation and assert that both section boundaries exist in the correct order. Every original permission assertion remains. Both pass in the full suite.

The new Vue helper initially used the base parser without HTML void-tag rules, causing one failure. It now uses Vue compiler-dom's HTML-aware parser. The initial 652/1/0 run is preserved separately; the final complete run is 653/0/0. No application template changed.

## E. Complete test ledger

Both isolated clean installs and fresh master syntheses passed. The table reports the final validation; named groups overlap the complete suite and must not be added together.

| Check | Result | Passed / failed / skipped |
| --- | --- | --- |
| typescript | PASS | ? |
| contracts | PASS | ? |
| guards | PASS | 16 / 0 / 0 |
| teamhub-backend | PASS | 47 / 0 / 0 |
| overlays | PASS | 142 / 0 / 0 |
| connected-demo | PASS | 9 / 0 / 0 |
| master-preview | PASS | 17 / 0 / 0 |
| runtime-ownership | PASS | 3 / 0 / 0 |
| infrastructure-accounting | PASS | 24 / 0 / 0 |
| handler-consolidation | PASS | 2 / 0 / 0 |
| teamhub-frontend | PASS | 18 / 0 / 0 |
| tournaments | PASS | 6 / 0 / 0 |
| accounting-update-gate | PASS | ? |
| ci-accounting | PASS | ? |
| full-suite | PASS | 653 / 0 / 0 |
| production-build | PASS | ? |
| verify-final-source | PASS | ? |
| final-exact-comparison | PASS | ? |

**Complete suite: PASSED 653; FAILED 0; SKIPPED 0; cancelled 0.** No tests were deleted, suppressed or disabled. [Final ledger](phase1-reproducibility-evidence/final-test-ledger.json) contains exact commands and results; raw logs and the enumerated test-file list are retained. The build used the existing output endpoint and process-only sandbox payment placeholders; no configuration file was altered.

Existing install warnings and the large frontend chunk warning remain in logs. Infrastructure accounting passed with the unchanged, scoped existing-debt allowance. At 2,628 resources, fresh hierarchy creation remains blocked; this result concerns an existing-root update candidate, not permission to recreate a root. The input receipt was not refreshed to hide test/tooling fingerprint changes; CI performed synthesis and confirmed no growth.

## F. Protected-resource verification

**Exact protected-resource and Lambda asset equivalence PASS.** Preserved definitions/identities include all 52 custom-managed model tables, three native DynamoDB tables, Cognito pool/client/identity pool and 10 groups, three S3 buckets, two KMS keys, AppSync API/schema and all 12 Lambda definitions. All 10 unique Lambda assets (35 packaged files, including source maps) are byte-identical; no map was ignored or normalized by the comparator.

Payment/webhook API routes, integrations, permissions, Team Hub state resources and Creator/Twitch state resources remain unchanged outside the approved consolidation changes. Generated `amplify_outputs.json` bytes remain unchanged. The final source verifier also passed after tests/build. These are exact local template/asset/source checks; they do not claim a live AWS state inspection or prove deployment ordering/rollback.

## G. Files changed and source classification

**Phase 1 infrastructure:** no new infrastructure changes in this cleanup/reproducibility task. The previously accepted Phase 1 implementation remains as described in [phase1-implementation.md](phase1-implementation.md). Schema, backend/runtime code, production authorization, Team Hub/Creator/payment behavior, Cognito, AWS configuration, package/lockfile, accounting budgets and accepted resource receipts were not edited.

| Classification | File | Purpose |
| --- | --- | --- |
| Test cleanup | `amplify/data/stage9-boundaries.test.ts` | Canonical tracked AdminEvents casing |
| Test cleanup | `amplify/myFunction/shared/authoritativePermissions.test.ts` | Owner/workspace/platform denial ordering and zero writes |
| Test cleanup | `amplify/data/application-storage-boundary.test.ts` | CRLF/LF-independent section boundaries; preserve auth assertions |
| Test cleanup | `amplify/data/media-storage-boundary.test.ts` | CRLF/LF-independent section boundaries; preserve auth assertions |
| Test cleanup | `src/features/creator-tools/connected-demo/connectedDemoState.test.mjs` | Structural route/component/auth mapping |
| Test cleanup | `src/features/creator-tools/overlays/tests/chatCanonicalConfig.test.mjs` | Actual reactive runtime/preview/legacy precedence |
| Test cleanup | `src/features/creator-tools/overlays/tests/creatorChatConfig.test.mjs` | Refreshed canonical configuration and disabled/moderation preservation |
| Test cleanup | `src/features/creator-tools/overlays/tests/overlayDraftLive.test.mjs` | Actual freshness computation and UI states |
| Test cleanup | `src/views/Admin/Bookings/demoSuperAdminInvitation.test.mjs` | Demo/admin truth table with invitation checks retained |
| Test helper | `scripts/test-support/source-contracts.mjs` | AST-selected trusted local expressions and HTML-aware Vue parsing |
| Test helper | `src/features/creator-tools/overlays/tests/chatWidgetContract.mjs` | Actual widget declarations with Vue reactivity/real normalizer |
| Validation tooling | `scripts/snapshot-validation-source.mjs` | Raw-byte snapshots and SHA-256 verification |
| Documentation | `docs/architecture/phase1-green-baseline.md` | This final report |
| Evidence | `docs/architecture/phase1-reproducibility-evidence/*` | Every evidence file/purpose/hash listed in README.md and files.json |

The prior stopped-attempt evidence in `phase1-green-baseline-evidence` remains intact. [Source classification](phase1-reproducibility-evidence/source-classification.json) separates changes since the start of the seven-test cleanup from pre-existing Phase 1 work.

**Concurrent work excluded:** `src/router/public.routes.js`, `src/config/swgEofRelease.js`, and `src/views/SwgEofTest/SwgEofTest.vue` were changed/added outside this task after snapshot creation. They add a SWG test route/page. They were not reverted, edited, or validated here. Consequently the current working tree as a whole is not identical to the tested snapshot. The [candidate manifest](phase1-reproducibility-evidence/candidate-manifest.json) identifies the exact tested bytes; unrelated edits must not be assumed covered by this report.

## H. Deployment readiness

**YES ? the exact recorded Phase 1 snapshot is ready for a separately authorized controlled deployment to the EXISTING Ntgre non-production environment.** The required 0/81/308 result, protected-resource checks, exact Lambda assets, complete green suite and production build all pass.

This is not authorization to deploy, nor a green claim for the concurrently edited working tree. Pin the reviewed snapshot and perform the existing-target preflight/live-baseline comparison before execution; the master-context local synthesis is not an Ntgre AWS change set. Preserve existing resources and apply the agreed non-production proof/observation plan. No automatic sandbox watcher was started.

Frontend lazy-loading work may begin as a separate follow-up after that non-production infrastructure proof. No Phase 2 implementation or deployment was performed here.
