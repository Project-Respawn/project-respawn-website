# Application storage phase 1 — test report

Date: 2026-08-16  
Sandbox: `Ntgrestage8`  
Root: `amplify-projectrespawnwebsite-Ntgrestage8-sandbox-767a43f84e`  
Production touched: **No**

## Results

| Layer | Command | Passed | Failed | Skipped |
| --- | --- | ---: | ---: | ---: |
| Amplify TypeScript | `npx tsc --noEmit -p amplify/tsconfig.json` | compile | 0 | 0 |
| Full backend/unit/contract/authorization/failure suite | `npx tsx --test "amplify/**/*.test.ts"` | 89 | 0 | 0 |
| Amplify environment guards | `npm run test:amplify-guards` | 15 | 0 | 0 |
| Affected Applications/Bookings frontend tests | `node --test …` | 57 | 0 | 0 |
| Canonical sandbox round trip | `node scripts/test-application-storage-sandbox.mjs` | 18 | 0 | 0 |
| Local output identity | `npm run validate:local-outputs` | verified | 0 | 0 |
| Generated operation contract | `npm run validate:amplify-contract` | 14 queries / 44 mutations / 0 subscriptions | 0 | 0 |
| Production frontend build | `npm run build` | built | 0 | 0 |
| Whitespace | `git diff --check` | clean | 0 | 0 |

The application-focused unit suite contains 44 passing cases within the 89-test backend total. It covers validation, controlled pathway/version/status rules, Unicode and inert script text, URL and credential rejection, schedules and IANA zones, exact answer/profile/schedule ordering, protected contact transport, list filtering/pagination/sorting, reference uniqueness, runtime permission denial, idempotent replay, parallel requests, seven injected failure positions, recovery, unrelated-record preservation, and exact test cleanup.

## Sandbox round-trip evidence

Final run ID: `application-storage-098c6fbb-6b2f-49f3-bfeb-e715a3f232c4`  
Created application ID: `793f1299-a0de-46c4-8cb3-7b69634cd157`  
Cleanup: `verified-exact-cleanup`

The runner dynamically resolved the current shared Lambda from the protected data stack. It stored one complete Creator Programme aggregate, read every submitted field through `getAdminApplication`, verified list projection and filters, repeated the same idempotency key without duplication, denied Staff without `applications.read`, rejected an invalid schedule, and removed the aggregate plus idempotency record using the exact run ID, application ID, and idempotency key. A subsequent protected detail read returned `APPLICATION_NOT_FOUND`.

The intentionally invalid sandbox command fails during validation before an application or idempotency row is created. Deeper partial-failure points are exhaustively injected in the in-memory service suite because deliberately breaking a deployed Lambda write at each stage would require a test fault switch in the live command.

## Cleanup audit and limitation

The final successful integration execution left no application record. Four `FAILED` idempotency-only rows from earlier diagnostic executions remain, each tagged with its unique `application-storage-…` run ID and with no visible application aggregate. They were discovered by a read-only audit after those early scripts had already discarded their random idempotency keys. They were **not** deleted because the safety requirement prohibits a broad scan followed by deletion. Their configured future expiry timestamps are retained, but automatic DynamoDB TTL activation is a future retention task.

The integration runner is now hardened: its `finally` path can delete its own exact failed idempotency row even when no aggregate was created. Future executions do not need a scan for cleanup.

## Environment confirmation

- Cognito pool remained `eu-north-1_X5BIIkPZR`.
- AppSync endpoint remained `https://kqkymuc23rax3mcsk77vlbb52e.appsync-api.eu-north-1.amazonaws.com/graphql`.
- The protected root finished `UPDATE_COMPLETE`.
- No sandbox identifier, auth resource, identity-pool role attachment, existing data ID, staging environment, or production environment was replaced or repointed.
- `APP-DEMO-0001` was not copied to backend data, and the public application form remains disconnected.

## Known build notes

Vite continues to report the existing missing `/css/styles.css` runtime reference and large main-chunk advisory. Neither warning was introduced by the backend storage phase, and the build succeeds.
