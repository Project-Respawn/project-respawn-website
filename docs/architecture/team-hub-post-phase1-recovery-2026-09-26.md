# Team Hub post-Phase-1 recovery — 2026-09-26

The historical missing-operation failure is no longer reproducible. Both Team Hub operations exist in source, deployed AppSync, resolver wiring and local generated metadata. Normal `npm run dev` passes both validators and starts Vite. Two separate local problems were reproduced and fixed: a stale REST API environment URL blocked the production build, and Coach Review dereferenced an absent player during its initial render. No infrastructure deployment was necessary.

## Deployed baseline and health

This work follows the completed [Phase 1 execution](phase1-ntgre-execution-2026-09-26.md); it does not repeat or revert consolidation.

| Check | Result |
| --- | --- |
| Account / region | `058264289478` / `eu-north-1` |
| AWS identity | `arn:aws:iam::058264289478:user/RavenTest` |
| Environment | Protected `Ntgre` sandbox |
| Root | `amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332` |
| Root status | `UPDATE_COMPLETE` |
| Resources | 2,621; all current logical IDs, types and physical IDs match the post-Phase-1 snapshots across 62 stacks |
| FunctionDirectiveStack | 167 |
| Protected resources | 62 direct service checks pass: 55 tables ACTIVE, Cognito pool, AppSync API, three buckets and two KMS keys present |
| Reviewed Lambda functions | 5/5 hashes unchanged; all Active / Successful |
| Public AppSync query | `listPublicMerchProducts` succeeds, HTTP 200 without GraphQL errors |
| Production touched | No |

[Health evidence](team-hub-post-phase1-recovery-evidence-2026-09-26/health.json) records the current identity, resource checks, hashes, operation wiring and live rejection results. Inventory equality confirms the 308 removed redundant resources have not returned. This is a targeted comparison and service-health check, not a new comprehensive CloudFormation drift-detection run.

Six additional [safe smoke checks](team-hub-post-phase1-recovery-evidence-2026-09-26/smoke.json) pass: checkout missing-amount rejection, unsigned webhook rejection, Twitch missing-lease rejection, Twitch unauthorized-client rejection, overlay JWT rejection, and a public AppSync query. The two Twitch rejection paths return their existing HTTP 500 authentication-error responses. These establish handler reachability and rejection before business actions; they are not successful authenticated Twitch sessions. No financial transaction, valid webhook, Twitch action/message or real team-data mutation was performed.

## Initial state and root causes

The initial normal `npm run dev` already passed `validate:local-outputs` and `validate:amplify-contract`, then started Vite. Contract totals were 24 queries, 55 mutations, zero subscriptions and 62 frontend operations, with zero missing. Both `readTeamHub` and `mutateTeamHub` were present. The earlier missing-output diagnosis therefore does not describe this deployed/current state; no new generation workaround was needed.

The current generated outputs identify the same protected Cognito pool, AppSync endpoint and storage bucket as the deployed sandbox. The Phase 1 execution evidence also records that outputs regenerated from AWS equal these workspace outputs. This task did not insert output entries or repoint generated IDs.

Two actual failures were found:

1. `npm run build` failed with `Build failed: VITE_API_BASE_URL does not match the API generated for this Amplify branch.` The ignored `.env.local` contained the stale endpoint `https://9qp7ehd406.execute-api.eu-north-1.amazonaws.com`. Its single `VITE_API_BASE_URL` setting now uses the endpoint from verified Ntgre outputs: `https://jm15a0rmi0.execute-api.eu-north-1.amazonaws.com`. Other environment settings were preserved. [Non-secret change record](team-hub-post-phase1-recovery-evidence-2026-09-26/local-env-change.json).
2. The first authenticated browser fixture for `/team-hub/fixture/coach-review` failed with `TypeError: Cannot read properties of undefined (reading 'statusLabel')`. `players` starts empty, while the header used `selectedPlayer.statusLabel` unconditionally. There was also a gap between catalogue loading and membership loading in which the main workspace could render without a player. Two template conditions now render the controls and workspace only when `selectedPlayer` exists. Existing loading, empty-team and authorization-error handling remains in place.

There is no evidence that the consolidation introduced either local issue. No authorization rule, backend handler, schema or generated metadata was changed.

## Operation dependency chain

| Layer | `readTeamHub` | `mutateTeamHub` |
| --- | --- | --- |
| Authoritative source | `amplify/data/resource.ts`: `a.query()` | Same file: `a.mutation()` |
| Contract | Required `action`, bounded read arguments; required JSON return | Required `action`, explicitly declared mutation arguments; required JSON return |
| Source authorization | `allow.authenticated()` | `allow.authenticated()` |
| Handler association | Shared `FnSubmitInvestorAccessRequest` function alias | Same shared alias |
| Generated ownership | Data nested hierarchy, FunctionDirectiveStack resolver/auth resources | Same nested hierarchy |
| Live AppSync | `Query.readTeamHub: AWSJSON!`, Cognito/IAM directives | `Mutation.mutateTeamHub: AWSJSON!`, Cognito/IAM directives |
| Live pipeline | Operation auth function, then shared invoke function `lev4xkxdl5cszjd3xgyqs2yomm` | Separate operation auth function, then the same shared invoke function |
| Lambda | `amplify-projectrespawnweb-myFunctionrebuildlambdaF-LwVW5TljICgV` | Same Lambda |
| Dispatch | `amplify/myFunction/router/appSyncRouter.ts` → `routeTeamHubRead` | Same router → `routeTeamHubMutation` |
| Gateway / handlers | `amplify/myFunction/teamHub/gateway.ts` → `teamHub/index.ts` | Same gateway/index; separate mutation allowlist |
| Generated metadata | `amplify_outputs.json`: `data.model_introspection.queries.readTeamHub` | `data.model_introspection.mutations.mutateTeamHub` |
| Validation | `scripts/validate-amplify-contract.mjs` compares schema, metadata and actual frontend calls | Same validator |
| Frontend | `src/features/Team Hub/teamHub.service.js`: `api().queries.readTeamHub(...)` | Same service: `api().mutations.mutateTeamHub(...)` |

The gateway validates actions/arguments, preserves resolver identity and dispatches to existing handlers. `teamHub/policy.ts` derives the caller from Cognito identity. Active membership and action-specific roles remain enforced: Players manage their own pool; Managers/Coaches can read their team's competitive data; Coach assessment writes require Coach authority; platform administration does not grant unrestricted competitive-data access. Backend tests cover missing identity, inactive and cross-team access, caller-derived Player identity, and role-specific permissions.

`team-hub.routes.js` connects the home, champion-pool and coach-review pages. All require authentication. Coach Review additionally requires Coach/Manager membership and `canReviewChampionPools`; backend authorization remains authoritative.

## Changes and validation

Task changes:

- `.env.local`: corrected only the local API URL; file remains ignored.
- `src/features/Team Hub/champion-pool/CoachPoolReview.vue`: two selected-player rendering guards.
- `scripts/team-hub-output-contract.test.mjs`: five tests retain both source/frontend operations and prove missing or wrong-case generated metadata fails validation.
- `scripts/team-hub-coach-render.test.mjs`: three tests compile and render the actual Vue template before players arrive, between async responses, and with empty/denied team results.
- This report and its sanitized evidence directory.

Tests use synthetic metadata only as unit-test inputs; application outputs were not fabricated. Existing validators were not weakened. Previously dirty Twitch, overlays, infrastructure, package and other application files were preserved.

| Validation | Result |
| --- | --- |
| `npm run test:team-hub-backend` | 47 pass; authorization/handler tests use mocks |
| Team Hub frontend tests | 18 pass |
| Existing handler consolidation / Amplify guard tests | 18 pass |
| New output-contract tests | 5 pass |
| New Coach Review render tests | 3 pass |
| `npm run test:resource-accounting` | 41 pass, including exact-pin/debt allowance and fail-closed growth/replacement cases |
| Total distinct tests | 132 pass, zero failures |
| `tsc --noEmit -p amplify/tsconfig.json` | PASS |
| `npm run build` after final UI fix | PASS, 1,556 modules; Team Hub chunks emitted |
| `npm run preflight:local-sandbox` | PASS, resolves canonical Ntgre root |
| Final `npm run dev` | Local-output validation PASS; contract validation PASS; Vite starts |

Run the added regression checks with `node --test scripts/team-hub-output-contract.test.mjs scripts/team-hub-coach-render.test.mjs`. The existing contract validator remains part of every `npm run dev` invocation and detects missing actual outputs.

[Browser evidence](team-hub-post-phase1-recovery-evidence-2026-09-26/browser.json) was collected with isolated headless Chrome against local Vite. All remote requests were intercepted with fixtures; no real credentials or user profile was read. Each of the three routes redirects unauthenticated visitors to `/join`. Authenticated Player/Coach fixtures render all three routes without page/console errors, including Coach Review after the fix. The actual generated client and Team Hub service send the expected `readTeamHub` queries and an `UPSERT_MY_CHAMPION` request through `mutateTeamHub`, and decode the returned AWSJSON. The mutation is intercepted, never submitted to AWS.

Live AppSync independently exposes both operations and rejects API-key-only calls with `Unauthorized`. The mutation rejection uses an invalid no-write action as additional protection. Positive authorization is covered by mocked backend tests and browser fixtures, not a live signed-in Cognito user or real team write. This remains a verification limit, not a claim of live end-to-end user testing.

## Infrastructure, workflow and remaining limits

Infrastructure additions: **0**. Modifications: **0**. Deletions: **0**. Replacements: **0**. No AWS configuration write, change set, synthesis or sandbox deployment was performed. The fix is local configuration/frontend rendering only, so there is no proposed infrastructure deployment diff. The prior pinned assembly was not modified or replaced.

The deployment watcher `npm run dev:sandbox` was deliberately not started: it could deploy unrelated dirty backend work. Its read-only preflight passes and the existing deployed backend is healthy; a new watcher deployment is unnecessary for this fix. This report does not claim the dirty working tree has been approved or tested for deployment. Resource-budget tests remain green; the existing 2,621-resource legacy hierarchy still has its documented debt and is not fresh-create safe merely because these tests pass.

Normal `npm run dev` was rerun after the fixes; a single task-started Vite server is left available on the configured local port. There are no remaining Team Hub contract or tested-route blockers. Existing nonblocking build warnings remain for `/css/styles.css` and a large main bundle. Browser startup also emits existing Amplify pre-configuration warnings; the final fixture reports no console errors or missing-operation errors. These unrelated warnings were not expanded into additional scope.

Final baseline remains **2,621 / 167**, root **UPDATE_COMPLETE**. Phase 1 consolidation is preserved. Production is untouched. Further broad AWS audit remediation and later migration phases remain outside this recovery task.

**TEAM HUB RECOVERED — DEVELOPMENT ENVIRONMENT GREEN**
