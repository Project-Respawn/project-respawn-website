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

## Running The Project

1. Install dependencies with `npm install`.
2. Start the dev server with `npm run dev`.
3. Build for production with `npm run build`.
4. Preview the production build with `npm run preview`.

The dev server opens on port `5174`.

## Amplify Sandbox

Use the local Amplify sandbox when you need to work on the backend and generate fresh outputs for the frontend.

```bash
npx ampx sandbox
```

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

Use the delete command to tear down a sandbox deployment when you are done.

```bash
npx ampx sandbox delete
```

The sandbox workflow is separate from the frontend dev server. In practice, you run the sandbox for backend changes and `npm run dev` for the Vue app.

## Additional Commands

- `npm run cleanup:media:dry` scans for orphaned media without deleting anything.
- `npm run cleanup:media:apply` removes orphaned media after the scan.

## Environment Variables

The frontend expects these values when relevant:

- `VITE_API_BASE_URL` is required for production builds.
- `VITE_API_PROXY_TARGET` can override the local API proxy target in development.
- `VITE_REVOLUT_MODE` is required and must be explicitly set to `sandbox` or `prod`. It must match the backend `REVOLUT_MODE` for the deployed branch.
- `VITE_REVOLUT_PUBLIC_KEY` is required by the unified Revolut Checkout widget. Use the public Merchant API key for the same sandbox or production environment; never expose `REVOLUT_API_SECRET` to the frontend.

The backend and utility scripts also use these secrets or environment values:

- `PRINTFUL_API_KEY`
- `REVOLUT_API_KEY`
- `REVOLUT_API_SECRET`
- `TWITCH_BACKFILL_USERNAME`
- `TWITCH_BACKFILL_PASSWORD`
- `APP_ENV` is set in the Amplify function environment for the shared backend function.

Use a real API Gateway base URL for `VITE_API_BASE_URL`, including the deployed stage path. Do not use placeholder stage tokens. The build validation script rejects empty, relative, or placeholder values.

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
