# Team Hub 2B6 — final controlled cutover result

## Current result: blocked before maintenance

The owner confirmed availability for a fresh 150-minute attended window. Existing security/operator approvals and the accepted multipart amendment remain preserved. The window was not started: a new mandatory business-read readiness failure was reproduced before any authority or AWS resource write.

Fresh read-only preflight evidence is in `team-hub-final-controlled-cutover-evidence-2026-10-13/preflight`. Account 058264289478, eu-north-1: Legacy 2,621 / FunctionDirectiveStack 167; Team Hub 48 + 7; Core 8 + 5; Tournament 11. Authority remains LEGACY_WRITER, epoch/version 3/3. Source/target business state is empty; source policies/gateways restored, recovery protections intact, auditing and D1 monitoring healthy, both functions Active/Successful and IN_SYNC. No frontend activation or production change occurred.

## Newly demonstrated runtime defect

The reproducible offline check `scripts/team-hub-maintenance-preparation/final-list-teams-check.mjs` verifies every accepted business-runtime source hash and runtime ZIP hash `da8ca25e8de2356c9df3940c8de52a1d5ade7330425f889fc3c3ef9958fd1b3e` before testing the actual business router. With isolated TARGET_WRITER 5/5, valid authorizer claims, successful contract-valid Core decisions and an empty isolated query result, GET /v1/teams returns HTTP 503 / DEPENDENCY_UNAVAILABLE. Both expected index queries execute, the cursor loader executes zero times, and no transaction executes.

`handler.mjs` lazily loads signing material only for LIST_MY_CHAMPION_POOL and LIST_TEAM_CHAMPION_POOLS. `service.mjs` also requires signing material for LIST_MY_TEAMS via `page()`. The router supplies no preloaded signing material. This invalidates readiness for that required read operation; accepted isolated cursor tests do not establish this routed operation works. This is offline proof, not a claim that the live authority was changed or a live TARGET request executed.

Sanitized result: [list-my-teams-readiness.json](team-hub-final-controlled-cutover-evidence-2026-10-13/list-my-teams-readiness.json).

## Required correction and resumption gate

Prepare a separately reviewed runtime candidate making LIST_MY_TEAMS use the existing lazy cursor loader, preserving fail-closed authority ordering, exact Read-only secret permissions and all other contracts. Require routed pagination regression tests, unchanged dark denials, secret-failure/tampering/privacy tests, exact new runtime/product pins and rollback references. Do not silently substitute this code for the approved runtime. Existing approvals and multipart evidence need not be repeated; revised runtime deployment and its acceptance must precede resuming maintenance.

No FROZEN transition, writer-fence installation, reconciliation write, TARGET_WRITER transition, business fixture creation or frontend activation occurred. The temporary local persona helper was stopped; no AWS cleanup was necessary. Existing source, runtime and maintenance pins are preserved. Unrelated SWG work remains untouched. Evidence is prepared in the working tree; no commit or push was made for a failed cutover.

**TEAM HUB CUTOVER BLOCKED — PINNED LIST_MY_TEAMS CURSOR DEPENDENCY FAILURE**
