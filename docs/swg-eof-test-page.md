# SWG EOF test download page

Route: `/SWG-EOF-test` (Vue Router's default case-insensitive matching also accepts the earlier `/SWG-EOF-Test` spelling). BetaMember-restricted, lazy loaded; reuses App.vue's real Header/Footer and global theme. No navigation menu changes or deployment performed.

Release settings: `src/config/swgEofRelease.js`. Keep `published: false` and the installer URL empty until the hosted bootstrap, payload and tester services are verified. This is the Setup download URL, not the payload base URL compiled into Setup. Rebuilding/signing Setup changes its checksum; update the version, size and hash here to match the final artifact before publishing. The page never contains passwords or account lists. Do not put the 8 GB payload inside the website repository/public directory; host it separately.

Preview using the repository's normal `npm run dev` and visit `/SWG-EOF-test` on the port printed by Vite. Validate local outputs first as required by AGENTS.md. Build with `npm run build`. On eventual deployment the host must rewrite application routes to index.html, like the other Vue Router pages.

Architecture assessment: existing public website / SWG test information module; public release metadata owned by the release organiser. Frontend-only, lazy-loaded view and configuration; zero new AWS resources, IAM permissions, models, tables, resolvers or stateful migrations. Root/template budget delta: zero. Existing website deployment unit; no independent backend created and no sandbox identity/output changes. Existing guards preserved. The page displays availability, not live server status; it makes no new API calls. Future authentication, wake/status and idle shutdown belong to a separately reviewed service implementation.

Rollback: remove the single SwgEofTest public route and its view/configuration. All other existing work is preserved.

## Validation — 2026-09-22

Local output verification and Amplify frontend contract validation passed. The normal guarded `npm run dev -- --host 127.0.0.1` started on port 5174; `/SWG-EOF-test` and its transformed Vue module returned HTTP 200. Vue script, template and scoped styles compiled successfully. Unpublished-release download gating and route diff whitespace checks passed. Browser visual/device testing was not performed.

`npm run build` stopped in the existing API base URL guard: VITE_API_BASE_URL does not match the API generated for this Amplify branch. No environment variables, generated outputs or backend resources were changed to bypass that protection. Resolve the existing branch configuration before production build/deployment. Nothing deployed.

## Beta access update — 2026-09-22

The route now requires authentication and the existing Cognito/access-context group `BetaMember` via the application's existing global route guard. No new role, pool, permission model or backend resource was created. Admin/SuperAdmin alone does not bypass beta membership. The view also reacts to cleared access context (for example sign-out) by removing the test content. Existing token/group refresh semantics apply; this is not instantaneous server-enforced revocation of already downloaded files or JavaScript.

Assign access through `/admin/users`: edit the selected user's roles, add **Beta Member**, and save using an authorised role-management account. Do this in the intended local or deployed environment; the local sandbox and production may have different identities/configuration. No accounts were changed by this task. Website beta access does not yet provision a game account.

Validation: `node --test scripts/swg-eof-access.test.mjs` passed all five checks using the real route declaration and global guard: anonymous redirect with return URL, ordinary member denied, BetaMember allowed, administrator without BetaMember denied, access-service failure denied. Updated Vue script/template compilation passed. Live sign-in and deployed role assignment were not exercised.

Read-only AWS inspection found `swg-private-test-transferbucket-hlbxxoo9wpzs` containing deployment.tar.gz plus initial-backup/ and backups/ objects. No Setup.exe, version.json or client payload was present there; projectrespawn.com bucket listed empty. This does not rule out a release hosted in another account/location. Local bootstrap-build.json still specifies a .invalid placeholder base URL and website installerUrl remains empty. Download stays disabled. No AWS changes or uploads made.

The page gate controls application navigation, not direct binary access. Before a restricted download opens, use server-validated site identity and BetaMember membership to issue time-limited download access for private release storage. The native bootstrap needs its own authenticated download/session flow (including renewal/resume); it cannot inherit browser login cookies automatically. Do not make the server backup bucket public or treat a hidden static URL as authorization. Implement this download service as a separately reviewed boundary, not an arbitrary new model in LegacyPlatform.

This area can later host collections and resource-planning tests using the same platform identity and explicit beta eligibility. API endpoints must independently validate issuer/audience/expiry and server-side group/permission eligibility. Use a narrow service adapter to the isolated SWG test environment rather than exposing database credentials or database ports to browsers. Add feature-specific permissions where writes or privileged operations require them; BetaMember must not confer game-god or administrative access. Collections/resource-planning integrations and server lifecycle controls are future work, not live features claimed by this page.

## Protected downloader implementation — 2026-09-22

The page now requests Setup through `src/api/swgDownloads.js` using the existing Cognito ID token. `downloadApiBase` replaces the public installer URL as the active download setting. A device query opens an explicit approval form; the user types the eight-character code from Setup. No automatic approval, credentials in links, or AWS keys in the browser.

The separate download-service implementation and review template are in the SWG workspace under tools/eof-distribution/aws and build/eof-distribution/aws. Its architecture review, exact resource costs/counts, deployment proposal and validation results are documented in AWS_DOWNLOAD_INTEGRATION_REPORT.md and the aws/README.md. It references existing identity and does not modify Amplify resources.

No endpoint has been deployed yet. Leave downloadApiBase empty and published false. After deployment, configure_from_outputs.py binds real stack outputs to the website and installer; compile Setup, run --finalize-metadata, then complete hosted authorization/download/install tests before publication. The static installerUrl is no longer used for downloads. This supersedes the earlier public-link instructions above.

Validated: five route tests, updated Vue compilation, 13 download-service tests, native protected resolver checks and 13 existing installer transport/recovery tests. Live AWS pairing, browser interaction and clean-Windows validation remain pending; the existing production build API-address mismatch remains unchanged.

## Approved AWS release — 2026-09-22

Private download service deployed: https://7sqhe1oq7f.execute-api.eu-north-1.amazonaws.com/ . Release storage is private and separate from the SWG backup bucket. Setup is 53,760 bytes; SHA-256 d695c09f54226f52ec30aabbf57cb1594b9cc6e2288cb0cc961d687f185e7135. The page is being released as an **installer preview**, not a claim that game-server authentication/start integration is complete. First Beta Member assignment and signed-in clean-Windows installer acceptance remain with the owner.

Live anonymous/invalid-token/pending-installer denials, private S3 denial, actual blob SHA-256 and byte-range checks passed. Production build passed using generated master outputs in an isolated checkout; the original local sandbox configuration was preserved. Only this page's seven release files are committed. Production CI has an opt-in SWG_FRONTEND_ONLY mode with an explicit reviewed base and file allowlist; it generates existing outputs instead of deploying the backend. The temporary branch setting is restored after deployment. The default pipeline behavior is unchanged when the flag is absent.


## Launcher/city preview update

Release 0.2.0-city-preview.1 adds desktop browser approval, assigned game accounts, server start/readiness controls and in-place updater handoff. Install over the existing dedicated client folder; do not uninstall. The current patch is required for the supported launcher Play flow. The city is an isolated Solo prototype; simultaneous Big Battle encounters are not included. Native bypass-proof patch enforcement is not claimed.
