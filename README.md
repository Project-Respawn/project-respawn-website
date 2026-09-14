# Project Respawn Website

Project Respawn Website is the web app for the Project Respawn community. It is built with Vue 3, Vue Router, Bootstrap 5, Vite, and AWS Amplify, and it covers the public site, authenticated user areas, admin tooling, forum pages, merch checkout, and Twitch-related dashboard workflows.

## Root

The root of the repo holds the app shell, build config, and generated backend outputs.

- [package.json](package.json) contains the frontend scripts and dependency list.
- [vite.config.js](vite.config.js) configures the dev server, API proxy, and build entry points.
- [index.html](index.html) is the Vite app entry document.
- [public/error.html](public/error.html) is the standalone error page used in production builds.
- [amplify.yml](amplify.yml) defines the Amplify build flow.
- [amplify_outputs.json](amplify_outputs.json) contains generated Amplify frontend outputs.
- [audit.json](audit.json), [audit-output.json](audit-output.json), and [bucket-policy.json](bucket-policy.json) are generated audit and policy artifacts.
- [README.md](README.md) is this file.

## src/

The frontend app starts in [src/main.js](src/main.js), which configures Amplify, loads Bootstrap, and mounts the Vue application.

### src/main.js

- Configures Amplify from [amplify_outputs.json](amplify_outputs.json).
- Creates the Vue app and installs the router.
- Loads Bootstrap styles, Bootstrap JavaScript, and the shared site stylesheet.

### src/App.vue

- Provides the top-level app shell.
- Shows the shared header and footer unless the current route hides them.
- Renders the active route with `router-view`.

### src/router/

- [src/router/index.js](src/router/index.js) defines all public, authenticated, admin, forum, and bot routes.
- The router uses nested shells for the dashboard and forum areas.
- A catch-all route sends unknown URLs to the 404 page.

### src/views/

The view folders map directly to the major areas of the site.

- [src/views/About/](src/views/About/) contains the public about pages and the roles page.
- [src/views/Account/](src/views/Account/) contains the signed-in account area.
- [src/views/Admin/](src/views/Admin/) contains the admin dashboard, layout, and management pages.
- [src/views/Applications/](src/views/Applications/) contains the application page.
- [src/views/Bot/](src/views/Bot/) contains the Twitch, Discord, automation, and bot settings pages.
- [src/views/Checkout/](src/views/Checkout/) contains the merch checkout flow.
- [src/views/Contact/](src/views/Contact/) contains the contact page.
- [src/views/Events/](src/views/Events/) contains event pages.
- [src/views/Forum/](src/views/Forum/) contains the forum shell, boards, and threads.
- [src/views/Home/](src/views/Home/) contains the public home page.
- [src/views/Join/](src/views/Join/) contains the join flow.
- [src/views/Merch/](src/views/Merch/) contains the merch browsing pages.
- [src/views/NotFound/](src/views/NotFound/) contains the 404 page.
- [src/views/PrivacyPolicy/](src/views/PrivacyPolicy/) contains the privacy policy page.
- [src/views/Profile_old/](src/views/Profile_old/) contains legacy profile code that is still kept in the tree.
- [src/views/TeamTryouts/](src/views/TeamTryouts/) contains the tryouts page.
- [src/views/UserHomepage/](src/views/UserHomepage/) contains the authenticated user landing page.

### src/components/

- [src/components/Header/](src/components/Header/) contains the site header and navigation.
- [src/components/Footer/](src/components/Footer/) contains the site footer.
- [src/components/BotSidebar/](src/components/BotSidebar/) contains the bot dashboard sidebar and menu levels.
- [src/components/Stores/](src/components/Stores/) contains shared UI state helpers.

### src/composables/

- [src/composables/useAuth.js](src/composables/useAuth.js) manages Cognito auth state, group checks, and account helpers.
- [src/composables/useCheckout.js](src/composables/useCheckout.js) manages cart state and the Revolut checkout flow.

### src/api/

- [src/api/products.ts](src/api/products.ts) fetches Printful product data for merch-related features.

### src/config/

- [src/config/apiBaseUrl.js](src/config/apiBaseUrl.js) resolves the API base URL for development and production.

### src/css/

- [src/css/styles.css](src/css/styles.css) holds the shared global styling for the site.

### src/assets/

- [src/assets/](src/assets/) holds static frontend assets used by the app.

### src/permissions/

- [src/permissions/](src/permissions/) contains permission-reporting and permission-scanning utilities.

## amplify/

This folder defines the AWS backend used by the frontend.

- [amplify/backend.ts](amplify/backend.ts) wires together auth, data, storage, functions, and the shared HTTP API.
- [amplify/auth/](amplify/auth/) defines Cognito email login, user groups, and the post-confirmation trigger.
- [amplify/functions/admin-user-management/](amplify/functions/admin-user-management/) handles Cognito group management for admins.
- [amplify/myFunction/](amplify/myFunction/) contains the shared API function for Printful, Revolut, and Twitch-related routes.
- [amplify/data/](amplify/data/) contains the data resource definition.
- [amplify/storage/](amplify/storage/) contains the storage resource definition.

## amplify-backup/

- [amplify-backup/](amplify-backup/) is an older backend snapshot kept as a backup reference.

## scripts/

Utility scripts live here.

- [scripts/validate-vite-api-base-url.mjs](scripts/validate-vite-api-base-url.mjs) fails the build if the production API base URL is missing or invalid.
- [scripts/cleanup-orphaned-media.mjs](scripts/cleanup-orphaned-media.mjs) scans and optionally removes orphaned media.
- [scripts/backfill-twitch-commands.mjs](scripts/backfill-twitch-commands.mjs) backfills Twitch command data.

## public/

- [public/error.html](public/error.html) is the standalone error page.
- [public/images/](public/images/) holds shared public image assets.

## How It Works

1. [src/main.js](src/main.js) boots the Vue app and configures Amplify.
2. [src/router/index.js](src/router/index.js) decides which page or shell is shown.
3. [src/config/apiBaseUrl.js](src/config/apiBaseUrl.js) uses `/api` in development and a configured base URL in production.
4. The Amplify backend in [amplify/backend.ts](amplify/backend.ts) serves the API routes used by merch, checkout, and Twitch dashboard features.
5. Shared UI state and auth logic live in the composables and components folders so the route pages stay thin.

### Site Flow

- The public site is made up of the home page, about pages, contact page, join flow, applications page, tryouts page, events pages, privacy policy, and merch browsing pages.
- Signed-in users can reach the account area and the authenticated user homepage.
- The admin dashboard is nested under `/dashboard` and is wrapped in its own layout shell.
- The forum is nested under `/forum` and uses a forum layout plus board and thread routes.
- The bot area is nested under `/bot` and contains Twitch, Discord, automation, settings, alerts, moderation, commands, and TTS overlay routes.
- The checkout flow uses the local cart state in `useCheckout`, validates the shipping address, and creates a Revolut checkout session through the shared API.
- Merch browsing uses Printful data from the backend function, while payment creation uses the Revolut backend secrets.
- Auth state is managed through Cognito, and group membership controls which admin and user areas are accessible.

### Backend Flow

- [amplify/auth/](amplify/auth/) defines email login and the user groups used across the app.
- [amplify/auth/post-confirmation/](amplify/auth/post-confirmation/) adds users to groups after confirmation.
- [amplify/functions/admin-user-management/](amplify/functions/admin-user-management/) lets admin users manage Cognito groups.
- [amplify/myFunction/](amplify/myFunction/) handles the shared HTTP API for Printful, Revolut, and Twitch-related routes.
- The API gateway routes declared in [amplify/backend.ts](amplify/backend.ts) are the server side for merch, checkout, Twitch command lookups, status checks, and connect actions.
- [src/api/products.ts](src/api/products.ts) expects `PRINTFUL_API_KEY` on the backend and returns transformed Printful product data to the frontend.
- [src/composables/useCheckout.js](src/composables/useCheckout.js) reads the API base URL from [src/config/apiBaseUrl.js](src/config/apiBaseUrl.js), then calls the Revolut checkout route with the current cart and customer details.

## Cognito Integration Architecture

This section is critical for developers working with auth, Twitch integration, and cross-environment deployments.

### User Identity Resolution

The app uses three Cognito identifier fields, each with different guarantees and contexts:

- `sub` — UUID, globally unique, never changes, stable across all contexts
- `userId` — Optional custom attribute, may vary by environment or migration state
- `username` — Email address (for email login), changes on user request

When resolving a user for backend lookups (e.g., Twitch broadcaster connection, profile data):

1. Try `sub` first (highest priority, always present)
2. Fall back to `userId` if `sub` fails
3. Fall back to `username` if both fail

This pattern is used in [src/views/Bot/Settings/BotSettings.vue](src/views/Bot/Settings/BotSettings.vue) and [src/views/Bot/Twitch/TwitchCommands/TwitchCommands.vue](src/views/Bot/Twitch/TwitchCommands/TwitchCommands.vue) to avoid false "not connected" states when the backend connection was stored under a different identifier.

### Amplify Outputs Configuration

**Critical for CI/CD and hosted deployments:**

The frontend must generate branch-specific `amplify_outputs.json` during the Amplify build process. The Cognito User Pool ID, Identity Pool ID, and AppSync API endpoint differ per branch and must be populated correctly or auth will fail.

In CI/CD pipelines, generate outputs with:

```bash
npx ampx generate outputs --branch "$AWS_BRANCH" --app-id <app-id> --format json --out-dir .
```

**Do not**:
- Manually override `Auth` configuration in `Amplify.configure()` when using `amplify_outputs.json`. This can cause User Pool and Identity Pool mismatch, resulting in Cognito Identity 400 errors on staging or production.
- Commit `amplify_outputs.json` to version control; regenerate it per branch and environment.
- Allow staging to inherit the production API URL or Cognito pool IDs.

**Always**:
- Use `Amplify.configure(outputs)` to keep Cognito resources consistent with deployed backend.
- Regenerate and validate outputs after sandbox recreation or schema changes.
- Verify in [src/config/apiBaseUrl.js](src/config/apiBaseUrl.js) that the correct API base URL is loaded for the current environment.

## Core Features Deep Dive

This section is meant as a handoff reference for developers integrating this app with external systems.

### Twitch Dashboard (Core Feature)

Primary files:

- [src/views/Bot/Twitch/BotTwitch.vue](src/views/Bot/Twitch/BotTwitch.vue)
- [src/views/Bot/Twitch/TwitchCommands/TwitchCommands.vue](src/views/Bot/Twitch/TwitchCommands/TwitchCommands.vue)
- [src/views/Bot/Twitch/TwitchCommands/TwitchCommands.js](src/views/Bot/Twitch/TwitchCommands/TwitchCommands.js)
- [src/views/Bot/Twitch/Alerts/BotAlerts.vue](src/views/Bot/Twitch/Alerts/BotAlerts.vue)
- [src/views/Bot/Twitch/Moderation/Moderation.vue](src/views/Bot/Twitch/Moderation/Moderation.vue)
- [src/views/Bot/Twitch/TTS/Settings/TtsSettings.vue](src/views/Bot/Twitch/TTS/Settings/TtsSettings.vue)
- [src/views/Bot/Settings/BotSettings.vue](src/views/Bot/Settings/BotSettings.vue)

Current behavior:

- The Twitch dashboard is the most mature bot area and acts as the main control surface.
- The command manager uses Amplify auth to resolve the signed-in user, looks up their Twitch broadcaster connection, and then loads and persists command data.
- Command records are fetched and updated through Amplify Data models (for example `client.models.TwitchCommand`).
- Suggested commands are pre-seeded in UI logic and can be enabled/edited into streamer-specific commands.
- The settings page handles Twitch connect/reconnect UX and status refresh.
- Alerts, moderation, and TTS pages are implemented UI surfaces with active structures for future persistence and runtime linkage.

#### Twitch Connection Status and OAuth Flow

**Connection lookup and reconciliation:**

Connection status is fetched via `GET /api/twitch/connection-by-user` in [src/views/Bot/Settings/BotSettings.vue](src/views/Bot/Settings/BotSettings.vue). The endpoint looks up broadcaster connections using the user's Cognito identifier. To account for identifier variations (see [Cognito Integration Architecture](#cognito-integration-architecture)), the frontend may retry the connection lookup using multiple identifier formats (`sub`, `userId`, `username`) to ensure the most recent connection is returned.

**OAuth callback and re-fetch:**

After an OAuth redirect from Twitch, the callback query/hash is detected in the settings page component. A robust re-fetch with exponential backoff ensures the UI reflects the newly connected state instead of showing a stale "not connected" message. This polling pattern handles:

- Cognito token refresh delays
- Backend connection record propagation delays
- Client-side cache invalidation

**Implementation notes:**

- Do not assume connection lookup will succeed immediately after OAuth callback.
- Always retry with all three Cognito identifier formats in [src/views/Bot/Twitch/TwitchCommands/TwitchCommands.vue](src/views/Bot/Twitch/TwitchCommands/TwitchCommands.vue) and [src/views/Bot/Settings/BotSettings.vue](src/views/Bot/Settings/BotSettings.vue) to avoid false negatives.
- If an OAuth redirect is detected but the connection still shows as missing after polling, the backend lookup may have failed or the connection record was not created. Check backend logs and Cognito identifier mismatch.

Integration significance:

- This is the primary place to integrate external bot runtimes, command sync services, overlay systems, moderation engines, and event processors.
- It already spans auth, route-level dashboard UX, backend lookup calls, and persisted command records.

### Discord Dashboard (Core Feature, In Build)

Primary files:

- [src/views/Bot/Discord/BotDiscord.vue](src/views/Bot/Discord/BotDiscord.vue)
- [src/views/Bot/Discord/DiscordLayout/DiscordLayout.vue](src/views/Bot/Discord/DiscordLayout/DiscordLayout.vue)
- [src/views/Bot/Discord/DiscordLayout/DiscordLayout.js](src/views/Bot/Discord/DiscordLayout/DiscordLayout.js)

Current behavior:

- `/bot/discord` currently presents a placeholder dashboard message.
- `DiscordLayout` defines the intended operational shell: selected server context, connection status, access label, server switching, refresh action, and nested child-view area.
- The current server list and metadata are local mock data.
- Refresh and server-switch actions currently emit component events and do not yet trigger backend sync.

Planned role in platform integration:

- Server OAuth/linking flow
- Guild and role sync
- Discord moderation tools
- Cross-platform automation with Twitch and site systems

Known implementation note:

- `openDiscordSettings()` currently routes to `/dashboard/settings`, and that route is not present in [src/router/index.js](src/router/index.js). Adjust this route when wiring the live Discord settings page.

### Profile System (Key Feature)

Primary files:

- [src/views/Account/Account.vue](src/views/Account/Account.vue)
- [src/views/Account/Account.js](src/views/Account/Account.js)
- [src/views/UserHomepage/UserHomepage.vue](src/views/UserHomepage/UserHomepage.vue)
- [src/composables/useAuth.js](src/composables/useAuth.js)

Legacy profile files:

- [src/views/Profile_old/Account.vue](src/views/Profile_old/Account.vue)

Current behavior:

- The active profile hub is `/account`, not the legacy profile folder.
- Profile identity data is loaded and saved through Amplify Data (`UserProfile`) and tied to the signed-in Cognito user.
- The page includes a runtime-configured board layout system where modules can be repositioned, resized, duplicated, removed, and visibility-scoped.
- Board layout is calculated client-side with collision handling, repack logic, and drag-and-drop placement.
- Module availability is controlled by release flags, allowing partial rollout of profile capabilities.
- The signed-in homepage links into profile management and displays profile progression summaries.

Integration significance:

- The profile hub is the future anchor for user identity, personalization, social visibility, and connected app metadata.
- External app integrations can map profile modules to additional data providers without changing the board system architecture.

### Events Hub (Key Feature)

Primary files:

- [src/views/Events/Events.vue](src/views/Events/Events.vue)
- [src/views/Events/Events.js](src/views/Events/Events.js)

Current behavior:

- The events page supports list and calendar views for upcoming events.
- Events are loaded from Amplify Data (`Event`) and normalized in-client for status, labels, and display formatting.
- Filtering is available by location format and category.
- Featured event, upcoming this week, and past recap sections are derived from the same core event data.
- Signed-in users can submit event suggestions through an event suggestion modal.
- Suggestions are persisted through Amplify Data (`EventSuggestion`) with owner metadata for later moderation/review workflows.

Integration significance:

- The events system is positioned to become the orchestration layer for community schedule data across website, Discord, Twitch, and partner apps.
- It already supports an extensible event shape (status, category, platform, CTA fields, notes, host, rewards) that can map to external scheduling and notification systems.

### Bot Navigation Architecture

Primary files:

- [src/components/BotSidebar/BotSidebar.vue](src/components/BotSidebar/BotSidebar.vue)
- [src/components/BotSidebar/MenuLevel.vue](src/components/BotSidebar/MenuLevel.vue)
- [src/components/Stores/SidebarStore.js](src/components/Stores/SidebarStore.js)

Current behavior:

- Twitch, Discord, Automation, and Settings all use a shared sidebar shell.
- Menu expand/collapse state and brand styling are managed by a central reactive store.
- This keeps cross-dashboard navigation and visual identity consistent while the feature pages evolve independently.

## Integration Notes For External Apps

- Treat Twitch as the first-class operational integration surface today.
- Treat Discord as the next integration surface with UI shell ready and backend wiring still in progress.
- Use Cognito user identity as the base mapping key for per-user dashboard contexts.
- Use broadcaster/server IDs as secondary mapping keys for platform-specific integrations.
- Keep feature flags or rollout guards for profile modules and dashboard subtools to avoid blocking release when one integration is incomplete.

## Deployment and Output Management

### Branch-Specific Cognito and AppSync Outputs

Each Amplify branch (development, staging, production) has its own Cognito User Pool, Identity Pool, and AppSync GraphQL endpoint. The `amplify_outputs.json` file is the contract between the deployed backend and the frontend runtime configuration.

**Generation strategy:**

- `amplify_outputs.json` is generated per-deployment via `npx ampx generate outputs --branch <branch> --app-id <app-id> --format json --out-dir .`
- Never commit `amplify_outputs.json` to version control; treat it as a build artifact
- CI/CD must regenerate outputs as part of the build process for each branch
- Local development uses the `Ntgrestage8` sandbox; outputs are generated via `npm run dev:sandbox`

**Integration with frontend build:**

- [scripts/validate-vite-api-base-url.mjs](scripts/validate-vite-api-base-url.mjs) runs before Vite starts and validates that Cognito and AppSync resources match the expected sandbox identifier
- [src/config/apiBaseUrl.js](src/config/apiBaseUrl.js) consumes `amplify_outputs.json` to derive the API base URL for the current environment
- The build will fail if outputs are missing, stale, or point to the wrong sandbox or branch

**Gotchas:**

- Stale outputs + Cognito session mismatch = Cognito Identity 400 on staging (incorrect User Pool or Identity Pool ID)
- Manual `Amplify.configure()` overrides bypass the schema validation, leading to downstream resource conflicts
- Staging inheritance of production Cognito IDs breaks auth for staging users

### Schema Validation and Custom Operations

After any change to [amplify/data/](amplify/data/) or [amplify/backend.ts](amplify/backend.ts), the frontend custom GraphQL operations must be regenerated and validated.

- [scripts/validate-amplify-contract.mjs](scripts/validate-amplify-contract.mjs) verifies that all custom operations used by the frontend are present in both the current schema and the generated `amplify_outputs.json`
- If this validation fails, the schema was changed but operations were not regenerated, or the sandbox was not redeployed
- Always run `npm run dev:sandbox` after backend changes, then re-run validation before starting Vite

## Running The Project

1. Install dependencies with `npm install`.
2. Start the Amplify sandbox with `npm run dev:sandbox` and wait for deployment/output generation.
3. In a second terminal, start the validated frontend with `npm run dev`.
4. Build for production with `npm run build`.
5. Preview the production build with `npm run preview`.

The dev server opens on port `5174`.

## Amplify Sandbox

The canonical local sandbox identifier is `Ntgrestage8`. Localhost must use this sandbox rather than hosted staging, production, or another developer sandbox.

The sandbox is protected infrastructure. Read and follow [docs/local-amplify-development.md](docs/local-amplify-development.md) before changing anything under `amplify/`. Generated AWS IDs are not stable identifiers, and sandbox replacement/deletion requires explicit target-specific authorization.

Use two terminals so sandbox logs and shutdown remain visible and predictable.

Terminal 1:

```bash
npm run dev:sandbox
```

Wait until the sandbox deployment completes and `amplify_outputs.json` is generated. Then use Terminal 2:

```bash
npm run dev
```

`npm run dev` alone is insufficient after backend changes or sandbox recreation. Before Vite starts it runs a read-only validation that checks:

- Cognito and AppSync are tagged as Amplify sandbox resources.
- Both resources belong to the exact `Ntgrestage8` sandbox deployment.
- Cognito and AppSync belong to the same deployment.
- `amplify_outputs.json` exposes `getMyAccessContext`.
- Every custom operation used by the frontend exists in both the current schema and generated output metadata.

The command fails instead of starting Vite if outputs are missing, stale, from staging/production, or from another sandbox. It does not automatically recreate or repoint anything. AWS CLI authentication is therefore required for local startup, just as it is for deploying the sandbox.

Stop the sandbox watcher with `Ctrl+C`. This stops local watching but retains the deployed personal sandbox. Restart it with `npm run dev:sandbox`; do not delete the sandbox merely to refresh outputs.

After changing or recreating a sandbox, stop Vite, regenerate outputs through `npm run dev:sandbox`, restart Vite, then sign out and sign back in. Cognito sessions do not transfer between user pools.

To check group claims safely in browser DevTools after signing in, print only the groups array—never the token or complete payload:

```js
const { fetchAuthSession } = await import('/node_modules/.vite/deps/aws-amplify_auth.js')
const session = await fetchAuthSession()
console.log(session.tokens?.accessToken?.payload?.['cognito:groups'] ?? [])
```

If `getMyAccessContext` is unavailable or `npm run dev` reports the wrong sandbox, treat `amplify_outputs.json` as stale. Stop both processes and repeat the two-terminal startup sequence.

Configure the Revolut backend credentials interactively for your personal sandbox. These values are stored externally by Amplify and must not be added to repository files:

```bash
npx ampx sandbox secret set REVOLUT_API_KEY
npx ampx sandbox secret set REVOLUT_API_SECRET
```

For the local frontend, copy `.env.example` to the ignored `.env.local` file and configure the sandbox public Merchant key:

```dotenv
VITE_REVOLUT_MODE=sandbox
VITE_REVOLUT_PUBLIC_KEY=<sandbox-public-merchant-api-key>
```

The public Merchant key is browser-safe, but its value should remain in local or branch environment configuration rather than source control. Local sandbox secrets are separate from hosted Amplify branch secrets.

## Sandbox and Environment Isolation Best Practices

### When Sandbox Outputs Become Stale

Several scenarios can cause `amplify_outputs.json` to become inconsistent with the running sandbox:

- Backend schema change without redeployment
- Sandbox deletion/recreation without new outputs generation
- Manual changes to Amplify resources outside the CDK definitions
- Switching between different developer sandboxes without updating outputs

**Recovery:**

1. Stop Vite (`Ctrl+C` in terminal 2)
2. Run `npm run dev:sandbox` and wait for full deployment (terminal 1)
3. Verify `amplify_outputs.json` was regenerated (check timestamp)
4. Restart Vite with `npm run dev` (terminal 2)
5. Sign out and sign back in to refresh Cognito sessions (old sessions may point to old pool IDs)

**Do not manually edit `amplify_outputs.json`** — it is generated by Amplify and must be byte-for-byte accurate or auth will fail in cryptic ways.

### Protecting the Sandbox

The `Ntgrestage8` sandbox identifier and its generated AWS resources (Cognito User Pool, AppSync, Lambda, S3, etc.) are considered protected local infrastructure. Do **not**:

- Delete it to "fix" issues (deletions are permanent and require full recreation)
- Recreate it without explicit user authorization
- Change the sandbox identifier or create a parallel sandbox for the same local developer
- Manually replace generated Cognito pool IDs or AppSync endpoint IDs
- Run `npx ampx sandbox delete --identifier Ntgrestage8` unless explicitly instructed and authorized

**Authorized deletion** is destructive and requires re-authentication, user recreation, and group reassignment after the replacement sandbox deploys.

See [docs/local-amplify-development.md](docs/local-amplify-development.md) for all backend modification workflows.

The following destructive command is documented only for an explicitly authorized teardown. Never infer authorization from a general repair or deployment request:

```bash
npx ampx sandbox delete --identifier Ntgrestage8
```

Deleting recreates resource IDs and requires a fresh sign-in after the replacement sandbox is deployed.



## Additional Commands

- `npm run cleanup:media:dry` scans for orphaned media without deleting anything.
- `npm run cleanup:media:apply` removes orphaned media after the scan.

## Environment Variables

The frontend expects these values when relevant:

- `VITE_API_BASE_URL` is required for hosted builds and must match the `projectRespawnApi` endpoint generated for that Amplify branch. Configure it as a branch override; do not let staging inherit the production API URL.
- `VITE_API_PROXY_TARGET` can override the local API proxy target in development.
- `VITE_REVOLUT_MODE` is required: use `sandbox` for staging/development and `live` for production. The frontend maps `live` to the Revolut SDK's `prod` mode and verifies that the backend returns the same resolved mode.
- `VITE_REVOLUT_PUBLIC_KEY` is required by the unified Revolut Checkout widget. Use the public Merchant API key for the same sandbox or production environment; never expose `REVOLUT_API_SECRET` to the frontend.

The backend and utility scripts also use these secrets or environment values:

- `PRINTFUL_API_KEY`
- `REVOLUT_API_KEY`
- `REVOLUT_API_SECRET`
- `TWITCH_BACKFILL_USERNAME`
- `TWITCH_BACKFILL_PASSWORD`
- `APP_ENV` is set in the Amplify function environment for the shared backend function.

Use a real API Gateway base URL for `VITE_API_BASE_URL`, including the deployed stage path. Do not use placeholder stage tokens. The build validation script rejects empty, relative, or placeholder values.

## Senior Developer Integration Checklist

Use this checklist when onboarding to the codebase, adding new features, or integrating external systems:

### Before Starting

- [ ] Read [docs/local-amplify-development.md](docs/local-amplify-development.md) for backend modification procedures
- [ ] Review the [Cognito Integration Architecture](#cognito-integration-architecture) section, especially identifier resolution
- [ ] Understand the [Deployment and Output Management](#deployment-and-output-management) workflow and when `amplify_outputs.json` becomes stale
- [ ] Verify your local `Ntgrestage8` sandbox is running and `npm run dev` validates successfully

### When Integrating Third-Party Services

- [ ] Map user identity to Cognito `sub` (primary), fallback to `userId` and `username`
- [ ] Do not assume immediate consistency after OAuth/callback flows; implement polling with exponential backoff
- [ ] Backend lookups (broadcaster connection, profile data, etc.) should accept and retry with multiple Cognito identifiers
- [ ] Store platform-specific IDs (Twitch broadcaster ID, Discord server ID) as separate attributes on the user or connection record, not as primary keys

### When Modifying the Backend

- [ ] After schema changes, run `npm run dev:sandbox` to redeploy and regenerate outputs
- [ ] Run [scripts/validate-amplify-contract.mjs](scripts/validate-amplify-contract.mjs) to verify custom operations
- [ ] Commit the change (not the `amplify_outputs.json` artifact)
- [ ] Document any new custom operations or resolver behavior in `amplify/data/` or `amplify/backend.ts` comments

### When Deploying to Hosted Environments

- [ ] Generate branch-specific `amplify_outputs.json` via CI/CD using `npx ampx generate outputs --branch <branch> ...`
- [ ] Configure `VITE_API_BASE_URL` to the correct API Gateway endpoint for the branch
- [ ] Ensure `VITE_REVOLUT_MODE` is `sandbox` for staging and `live` for production
- [ ] Configure branch-specific Cognito identity pool and User Pool IDs (via `Amplify.configure(outputs)`, not manual overrides)
- [ ] Run [scripts/validate-vite-api-base-url.mjs](scripts/validate-vite-api-base-url.mjs) in the build pipeline

### When Debugging Auth Issues

- [ ] Check the Cognito User Pool ID and Identity Pool ID in the browser via `fetchAuthSession()` and compare to `amplify_outputs.json`
- [ ] Verify the current branch-specific outputs were generated (check `amplify_outputs.json` timestamp)
- [ ] Check for Cognito 400 errors, which typically indicate User Pool / Identity Pool mismatch
- [ ] If "not connected" appears after OAuth, check that retry polling is working and that backend lookup tried all three identifier formats
- [ ] Sign out and sign back in to refresh Cognito sessions after sandbox or pool changes

### When Extending the Dashboard

- [ ] Twitch is fully wired (connection lookup, command persistence, OAuth flow); use it as the reference implementation
- [ ] Discord has UI shell but backend wiring in progress; coordinate with [docs/local-amplify-development.md](docs/local-amplify-development.md) before wiring persistence
- [ ] All dashboard sub-routes use the shared sidebar navigation and brand store; keep this consistent
- [ ] Feature-gate new dashboard tools with release flags in [src/composables/useAuth.js](src/composables/useAuth.js) or a dedicated feature-flags composable

## Dependencies

- `vue`
- `vue-router`
- `bootstrap`
- `aws-amplify`
- `@fullcalendar/core`
- `@fullcalendar/daygrid`
- `@fullcalendar/vue3`
- `@revolut/checkout`

Development and backend tooling includes:

- `vite`
- `@vitejs/plugin-vue`
- `@aws-amplify/backend`
- `@aws-amplify/backend-cli`
- `aws-cdk-lib`
- `tsx`
- `typescript`

## Notes

- The dev server proxies `/api` requests to the configured backend target.
- The production build validates the API base URL and required Revolut frontend environment configuration before bundling.
- The repository includes both the active Amplify backend and a backup copy for reference.
- The current `src/views/Profile_old/` folder is legacy and should be treated as old code unless it is intentionally reused.
- Browser support is targeted at modern desktop and mobile browsers.
