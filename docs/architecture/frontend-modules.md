# Frontend modules and loading plan

Status: proposed; route behavior and source files were not changed in this audit.

## Measured baseline

Vue 3 client rendering, Vue Router `createWebHistory`, Vite 8. No existing SSR entry was found. Keep browser-only initialization out of reusable module top levels so future SSR is possible; do not describe the current SPA as an SSR deployment.

Production audit build: 10.70 seconds; largest/main JS 2,322.65 kB minified, 603.51 kB gzip. It used the actual local output API endpoint and process-only sandbox payment mode/public-key placeholder. It proves bundling, not checkout/payment or production deployment correctness. The default build failed correctly on a stale VITE_API_BASE_URL mismatch. No `.env` or production configuration was edited.

| Route source | Static Vue component imports | Dynamic imports |
| --- | ---: | ---: |
| creator-tools | 25 | 0 |
| admin | 23 | 0 |
| public | 19 | 0 |
| therapist | 8 | 0 |
| trainer | 6 | 0 |
| partner | 5 | 0 |
| forum | 4 | 0 |
| esports | 1 | 2 |
| Team Hub | 0 | 5 |
| tournaments | 0 | 14 |
| Total | 91 | 21 |

Counts reflect route-module import declarations, not deduplicated component count. [Source inventory](evidence/source-inventory.json) records paths and imports. Tournaments already use a frontend-only fixture adapter (`src/features/tournaments/tournament.data.js`); registration/live-match previews must not be represented as a deployed backend.

## URL -> module -> backend ownership

| Existing URL | Frontend module | Backend owner / present state |
| --- | --- | --- |
| `/`, `/about`, `/contact`, `/privacy-policy`, `/careers` | Public website | Mostly content; Core navigation/auth only as needed |
| `/account`, `/home`, `/join` | Core account | Cognito, UserProfile, access context |
| `/forum`, `/forum/board/:boardSlug`, `/forum/thread/:threadSlug` | Community / Forums | Six models plus shared Lambda today |
| `/esports`, `/esports/league-of-legends` | Esports shell | Public/team presentation; no implicit Tournament backend |
| `/team-hub`, `/team-hub/:teamSlug/*` | Esports / Team Hub | Four models; readTeamHub/mutateTeamHub |
| `/tournaments/:tournamentSlug/*` | Esports / Tournaments | Fixture adapter now; future independent owner |
| `/esports/tournaments/:tournamentId` | Legacy Esports tournament detail | Preserve existing navigation; reconcile with fixture route deliberately |
| `/creator-tools/*` | Creators / Workspace and integrations | Workspace/Twitch/Discord models, APIs |
| `/overlay-source/:credential`, `/tts-overlay` | Creators / Overlay player | Credential-bound overlay HTTP/WebSocket; keep player minimal |
| `/partner/*` | Creators / Partner presentation | Reuse supported contracts; do not invent campaign persistence |
| `/swg-beyond-buff-builder` | Games / SWG | Client tool; no new backend stack needed by default |
| Separate Companion origin | Games / Companion | Separate app/repository audit required |
| `/events` | Events | Event, EventTag, EventSuggestion |
| `/merch`, `/checkout` | Commerce | Catalog/order operations; Printful/Revolut adapter |
| `/applications`, `/apply-now`, `/bookings/*`, `/induction/book/:invitationToken` | Operations / Applications and scheduling | Existing application contracts; review actual scheduling adapters before extraction |
| `/investors`, `/investors/data-room` | Operations / Investors | Investor access, NDA/expiry authorization |
| `/trainer/*`, `/therapist/*` | Operations presentation modules | Audit-backed APIs only; no matching model family assumed |
| `/dashboard/*` | Admin shell + domain-owned admin screens | Core identity/permission administration and each domain's privileged contract |

Do not change `/forum` to `/community` just to match the architecture diagram. Preserve route names, redirects, deep links, parameter names, metadata and hosted SPA rewrites.

## Implementation order

1. Configure Amplify before importing modules that initialize clients. Current main.js statically imports App/router before its configure call; ESM evaluation precedes that call. Introduce an explicit bootstrap boundary and lazy/cached client factories. Show a recoverable startup error instead of leaving an empty mount target.
2. Convert static route components to `() => import('...vue')`, including nested layouts and admin domain screens. Small route-definition arrays can stay eagerly registered if their component imports are lazy. Vue Router expects component import functions; do not wrap route components in `defineAsyncComponent`. [Vue Router lazy routes](https://router.vuejs.org/guide/advanced/lazy-loading)
3. Keep auth readiness and general access context available to guards, but load `resolveTeamRouteAccess` only on Team Hub routes. Audit investor/brand-specific guards similarly. Preserve sign-in redirects, permissions, ownership checks and denied-route behavior.
4. Move calendar, overlay editor/rendering and checkout SDK imports into the feature that needs them. Inspect actual production import edges before splitting vendor code. Shared Bootstrap/global styles can remain initially; domain CSS and large registries should not leak into the shell unnecessarily.
5. Preserve Team Hub and Tournament lazy boundaries already present. Remove eager paths through Admin/registry barrels that pull them back into the entry graph. Keep auth/profile/media contracts in Core; do not import internal sibling feature services.
6. Keep current folder paths while changing loading. Later normalize to `src/features/esports/team-hub`, `src/features/community/forums`, etc., in small case-sensitive-safe moves. Repository tests include casing-sensitive paths; Linux build is mandatory.

Use named public exports for a module contract, not an index file that eagerly exports every screen. Composable stores currently provide auth/access state; adding a new state framework is unnecessary for this audit. Domain stores should initialize on entry, reset on sign-out/environment change, cancel requests on teardown, and not retain another user's privileged data.

## Acceptance criteria

Capture build manifest and compressed size deltas. Initial public load should not fetch SWG, overlay editor, Team Hub editor, Tournament pages, calendar or checkout SDK chunks unless the shell demonstrably needs them. A shared dependency may legitimately remain shared; do not force duplicate copies just to improve one named chunk.

Use browser network and performance traces for cold/warm `/`, `/forum`, `/team-hub`, `/tournaments/founders-cup`, `/creator-tools`, `/swg-beyond-buff-builder`, `/merch`, `/dashboard`. Verify direct load/refresh/back/forward, denied access, expired sessions, sign-out, slow imports, failed chunks after a deployment, and browser-source links. Measure initial JS transfer, evaluation time, LCP and route transition latency against the baseline. Propose an initial 25% reduction target for entry transfer, then set per-route budgets from measurements; no reduction is claimed by this documentation-only audit.

Exercise actual signed-in Team Hub member/coach/admin and unauthorized users, investor expiry, creator workspace revocation and privileged Admin routes. Tests must confirm server-side denial as well as hidden UI. No production user/password or payment workflow was exercised in this audit.
