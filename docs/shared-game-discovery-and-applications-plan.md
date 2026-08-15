# Shared game discovery and applications plan

## Audit findings

- `/join-us` is the public Vue Router route rendered by `src/views/TeamTryouts/TeamTryouts.vue`; `/team-tryouts` is retained as a legacy redirect.
- The repository's application convention is the named `Applications` route at `/apply-now`; `/applications` and `/apply` are retained as legacy redirects. Its current four-step form is frontend-only and does not persist submissions.
- The profile UI exposes a configurable “Favorite Games” display module, but no persisted profile-to-game relationship or game-search service exists.
- No IGDB client, game cache, canonical game model, artwork normalizer, or reusable game-search component exists.
- Backend HTTP integrations use the shared Lambda and `amplify/myFunction/router/restRouter.ts`. Secrets are declared with Amplify `secret(...)`, never exposed to Vue.
- `UserProfile` is owner-authorized. Profile games and application games should therefore be separate owner-scoped joins to one shared catalog.

## Team Tryouts integration

- Remove the early hero application shortcut and retain “See how it works” as the sole primary hero action.
- Keep all programme, pathway, expectations, beta, and suitability content in its current reading order.
- Preserve `#apply`, replace its placeholder copy, and route the active CTA through the named `Applications` route with `type=creator`.
- Treat `creator` as the umbrella Project Respawn Creator Programme pathway. Applicants can change pathway before continuing or submitting.
- Preserve the final `#apply` link. Same-page navigation updates browser history, respects reduced-motion preferences, and moves focus to the destination heading. Direct/hash-history navigation is handled on route navigation and page mount.

## Shared game-discovery domain

Place this domain outside Applications and Profiles:

- Backend: `amplify/myFunction/games/` for IGDB transport, authentication, normalization, cache policy, rate limiting, and handlers.
- Frontend: `src/features/game-catalog/` for the API service, composable, reusable components, contracts, and tests.
- Data: canonical `Game` records plus independent `UserProfileGame` and `ApplicationFavouriteGame` relationships.

The normalized browser-facing game reference contains only a stable numeric `igdbId`, name/slug, normalized cover URL and alt text, normalized genres (`igdbId`, name, optional slug), and first-release date/year/status. Raw IGDB responses, credentials, OAuth tokens, and unused provider metadata never reach the browser or user relationships.

## Authentication and endpoints

- Add `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` as Amplify secrets on the shared Lambda. Obtain Twitch app tokens only in the backend and cache them per warm container until shortly before expiry.
- Add `GET /games/search?q=<query>&limit=<n>` to the REST router. Trim and validate a minimum query length, bound `limit`, and reject unsupported input.
- Return `{ games, meta }`; `meta` may include cache state and a request ID, never secrets or raw provider data.
- If stable-ID hydration is required, add `GET /games/:igdbId` using the same service and normalizer.

## Caching, limiting, and errors

- Use a short per-container memory cache plus a shared DynamoDB cache across Lambda instances.
- Normalize cache keys from lowercase, whitespace-collapsed query and bounded limit. Suggested search TTL is 15 minutes, ID TTL 24 hours, and stale-if-error up to seven days for known records.
- Deduplicate concurrent identical upstream requests in a warm container.
- Use a DynamoDB TTL token bucket/fixed window: per-user when authenticated and a conservative hashed-IP key for public application searches. Return `429` with `Retry-After`.
- Use bounded timeouts, at most one retry for retryable upstream failures, secret-safe structured logging, and normalized `400`, `429`, `502`, and `503` responses.

## Models and limits

- `Game`: backend-managed canonical record uniquely keyed by `igdbId`, with normalized metadata and cache timestamps.
- `UserProfileGame`: owner-scoped relationship containing profile ID, canonical game/IGDB ID, ordering, and timestamps.
- `Application`: durable owner/applicant aggregate with pathway, status, answers, and submission metadata.
- `ApplicationFavouriteGame`: application-to-canonical-game relationship with ordering.
- Application genres use stable normalized genre references (or a join if reporting requires it).

Enforce unique `(profileId, igdbId)` and `(applicationId, igdbId)` identities so retries cannot duplicate selections. Applications allow at most three distinct games and five distinct genres in both UI policy and the authoritative backend mutation. Profile limits come from separate profile configuration so they may evolve independently.

## Reusable frontend contract

- `gameCatalogService`: builds shared API URLs, calls search/by-ID, validates normalized responses, and maps transport errors.
- `useGameSearch`: debounced and cancellable lookup, minimum query length, loading/empty/error states, stale-response prevention, and duplicate-safe selection helpers.
- `GameSearchInput`: labelled combobox semantics, keyboard navigation, active-descendant state, Escape/blur handling, and announced result/error status.
- `GameSearchResult`: normalized selectable result with artwork, genres, and release details.
- `SelectedGameCard`: removable/reorderable selection keyed by IGDB ID.

Inject selection policy (`maxGames`, duplicate key, disabled state, messages) so Applications use three while Profiles remain independently configurable. Use the same policy pattern for the five-genre application limit.

## Delivery and verification

1. Ship Team Tryouts routing and accessible hash behavior without Amplify changes.
2. Test route-query preselection and hash navigation.
3. Add backend normalizer, cache, rate-limit, and handler tests before wiring the REST route and secrets.
4. Add canonical/relationship models only after inspecting `Ntgrestage8` and confirming an in-place schema update.
5. Run `npx tsc --noEmit -p amplify/tsconfig.json`, focused tests, and `npm run validate:amplify-contract` before any sandbox update.
6. Stop if Amplify selects another root stack or proposes replacing protected Cognito/AppSync resources. After an authorized in-place `Ntgrestage8` update, regenerate its outputs and run `npm run validate:local-outputs` and `npm run validate:amplify-contract`.

The IGDB backend, persistence models, and permanent submission workflow remain separate delivery slices. The repository has no durable application backend yet, and secrets/schema work must follow the protected Amplify compatibility procedure rather than being hidden inside a page-link change.
