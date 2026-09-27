# Twitch text-to-speech investigation

This document records the pre-repair investigation. See [the local repair and validation notes](twitch-tts-repair.md) for the subsequent implementation; it has not been deployed.

Investigation date: 2026-09-25. Website baseline: `9cacb3b`, including the existing working tree. The sibling **Respawn Twitch Bot** repository was also inspected because it owns Twitch event ingestion. Paths prefixed `bot:` refer to that repository; other paths are relative to this website repository.

**Finding:** TTS is split across incompatible legacy and canonical delivery paths. A real qualifying redemption produces legacy `overlay-event / tts`, while the current Browser Source consumes versioned `tts.requested` events. The canonical publisher independently excludes TTS widgets from its eligibility checks. These failures occur **before speech generation**, which happens in the browser, not AWS.

This was a source audit plus synthetic execution of the actual local modules, not a live production incident trace. No deployment, credential rotation, resource mutation, application changes, or authentication changes were made. Only this report was added; pre-existing changes were left alone. Diagnostic assertions ran in memory with synthetic data and injected dependencies. No secret values were printed.

## 1. Current architecture

### Twitch and identity

- `bot:src/runtime/secureRuntime.js` obtains a signed runtime lease and broadcaster token from the website backend, then starts the broadcaster EventSub connection. `bot:src/runtime/runtimeClient.js` calls `/twitch/runtime/*`.
- `bot:src/sections/11-eventsub.js` owns outbound EventSub WebSockets, subscription registration, notification dispatch and reconnect handling. Redemptions arrive over this socket, **not through a Twitch webhook Lambda**. Twitch OAuth callbacks are a separate HTTP flow.
- The intended TTS trigger is `channel.channel_points_custom_reward_redemption.add`, with a reward title matching `TTS_REWARD_TITLE` (default `Text To Speech`, trimmed and case-insensitive) and nonempty `user_input`. Regular chat, redemption updates, automatic rewards, follows and cheers do not become TTS in the inspected implementation.
- `amplify/myFunction/twitch/integrationHandlers.ts` authorizes the Cognito user against Brand/Workspace ownership and permissions. `oauthHandlers.ts` binds the OAuth transaction to that integration and persists the Twitch identity; `tokenStore.ts` encrypts the token bundle using KMS. `TwitchIntegration` links `ownerUserId`, `workspaceId`, `brandId` and `twitchBroadcasterId`; a Twitch viewer does not need a Cognito account for their redemption to be spoken.
- `amplify/functions/twitch-runtime/handler.ts` delegates runtime requests to `amplify/myFunction/twitch/runtimeHandlers.ts`. The lease binds the integration, Workspace, Brand and broadcaster. Publishing rechecks those bindings and the connected integration status. Creator management uses Cognito; the Browser Source uses its opaque publication credential.

### Three clients, two transports

| Path | Input/transport | Playback implementation |
|---|---|---|
| Current `/overlay-source/:credential` | Credential configuration HTTP request, then API Gateway WebSocket; versioned canonical events | `TtsWidget.vue` uses `SpeechSynthesisUtterance` and `window.speechSynthesis.speak()` |
| TTS settings page | Cognito-backed config/test HTTP requests; local preview button | `TextToSpeech.js::speakNext()` has a local speech queue; mounting does not connect a live event socket |
| Legacy `/tts-overlay?broadcasterId=...` | `ws://localhost:3000/events-ws`, hardcoded in `OverlaySocket.js` | Visual `AlertCard`; no speech synthesis call in this legacy renderer |

Relevant current files:

- `src/features/creator-tools/views/twitch/text-to-speech/TextToSpeech.{js,vue}`: identity resolution, settings, local preview and server test.
- `src/features/creator-tools/services/overlaySource.js`: configuration/publication HTTP client and shared WebSocket connection.
- `src/features/creator-tools/views/overlays/OverlayBrowserSource.vue`: loads the published scene and configuration, refreshes configuration, publishes received events to the widget bus.
- `src/features/creator-tools/overlays/overlayEventContract.js`: version/source/type validation and conversion to widget events.
- `src/features/creator-tools/components/overlays/OverlaySceneRenderer.vue`, `widgets/widgetHelpers.js`, `widgets/tts-audio/tts/TtsWidget.vue`: mounting, topic subscriptions and speech.
- `amplify/overlaySource/{handler,domain,canonicalPublisher,awsPublisher,infrastructure,composition}.ts`: publication/configuration storage, ownership, eligibility and WebSocket fanout.

### Settings, provider and storage

`GET/PUT /overlay/twitch-config` stores a Brand-scoped `TWITCH_OVERLAY_CONFIG` record in the publication table. Defaults are enabled, browser-default voice, volume/rate/pitch `1`, maximum text length `200`; validation caps length at `500`. The settings page persists this configuration, and the Browser Source receives it as `twitchConfig`. The widget reads `runtimeConfig.tts` and skips speech when disabled, text is empty, or the speech API is absent. It truncates the text and applies voice/rate/pitch/volume.

The bot's legacy reward selection does not read these Brand settings. It uses process-wide reward-title/length configuration and legacy payload defaults. The current settings page preserves the saved `enabled` flag but does not expose an enable toggle.

**No external TTS provider is wired into this flow.** No Polly/ElevenLabs speech request, TTS API key, generated MP3, audio blob, S3 speech object or signed speech URL was found. Browser/OS speech synthesis generates the sound after receiving text. Alert MP3 assets and `alertAudioLifecycle.js` are a separate alert-sound feature.

## 2. TTS event flow

Assume a viewer redeems `Text To Speech` with input `Hello stream` for the correctly connected broadcaster.

| Input | Code path | Output | Next destination / finding |
|---|---|---|---|
| EventSub notification | Bot `11-eventsub.js::handleWebSocketMessage` | Subscription type, metadata and event | Canonical attempt, then legacy dispatch |
| Notification with canonical gate enabled and secure runtime | Bot `twitchOverlayEvent.js::normalizeTwitchOverlayEvent` | `reward.redeemed`, `data.payload.input = "Hello stream"` | Signed `/twitch/runtime/overlay-events`; **not `tts.requested` and no `payload.text`** |
| Signed canonical request | `runtimeHandlers.ts::handleTwitchRuntime` | Validated integration/broadcaster/Workspace/Brand; dedupe claim keyed by integration + Twitch message ID | `publishCanonicalOverlayEvent` |
| `reward.redeemed` | Canonical publisher and AWS dependencies | Alert eligibility decision, config revision, fanout counts | Eligible reward-alert clients only; no conversion to TTS |
| Original redemption | Bot `resolveEventSubActionBundle` → `10-tts.js::resolveTtsActionFromRedemption` | Trimmed/collapsed/truncated `user_input` in `{type:'overlay_event', eventType:'tts', payload:{broadcasterId,username,text,...}}` | Legacy action retained even when canonical alerts suppress legacy delivery |
| Legacy TTS action | Bot `13-site-events.js::broadcastSiteEvent` | `{type:'overlay-event',eventType:'tts',broadcasterId,payload}` | Bot-local `/events-ws` clients with matching broadcaster; **not API Gateway Browser Source clients** |
| Hypothetical valid canonical `tts.requested` | `overlaySource.js::createOverlaySourceConnection` → parser → `toWidgetEvent` | `topic:'tts.requested'`, `payload.text`, actor | Widget event bus |
| Widget event | `useWidgetEvents` → `TtsWidget.vue` watcher | Configured `SpeechSynthesisUtterance` | Browser speech engine → creator/OBS audio output |

Canonical delivery is attempted only if `RESPAWN_CANONICAL_ALERT_DELIVERY_ENABLED === 'true'` and the connection is secure. Production IaC sets the flag to `false`; staging IaC omits it, which also disables this branch. These are repository definitions, not proof of the running task's environment.

**Test-button path:** `sendTestTts()` → active Brand publication lookup → `createTestOverlayEvent('tts.requested')` → authenticated `POST /overlay/publications/{id}/events` → handler validates ownership and event → same canonical publisher → Browser Source → speech. This bypasses Twitch entirely but still encounters the publisher defect below.

**Local preview:** `runLocalPreview()` → local queue → `speakNext()`. It bypasses Twitch, backend publishing and the Browser Source. Hearing this preview proves only that this page's speech engine can play that preview.

## 3. Failure point

### Confirmed through execution of repository modules

1. **Live event contract and destination mismatch.** The actual bot helper accepts the synthetic matching redemption and returns legacy `eventType:'tts'`. The canonical normalizer returns `reward.redeemed` with `payload.input`. The website's canonical parser rejects the legacy envelope. No inspected bridge produces live `tts.requested / payload.text`. This is the first confirmed application divergence **after assuming successful Twitch reception and valid identity**. With the IaC gate disabled, canonical publishing is skipped earlier still.
2. **Canonical publisher rejects ordinary TTS scenes.** `canonicalPublisher.ts` special-cases chat; all other events require `hasActiveAlertWidget` and `activeAlertTopics`. Those helpers in `domain.ts` recognize generic/dedicated alert widgets, not `tts`. Injecting an active, matching publication and a connected client produced:

   ```text
   TTS-only scene:                 SKIPPED / ALERTS_WIDGET_DISABLED / delivered 0
   TTS + normal generic alerts:   SKIPPED / TOPIC_NOT_ENABLED / delivered 0
   send() calls across both:      0
   ```

   The generic widget's normal topics do not contain `tts.requested`. An artificially configured generic alert subscribing to TTS could pass, but that is not the TTS-widget contract. `handler.ts::sendTestEvent` throws on `SKIPPED`; the normal test-button case should display an API error, not success.
3. **Legacy overlay queue interface mismatch.** `Overlay.js::mounted()` calls `QueueService.onNext()` and `onFinished()`. Both are `undefined` in the actual imported singleton; its methods are `setCurrentItemChangedCallback` and `setQueueChangedCallback`. Mounting reaches a TypeError at `onNext` if preceding socket creation succeeds. Even repairing that interface alone would not add speech playback.

The reproduction ran with `node --import tsx --input-type=module`, imported the real helpers/publisher/parser/queue, used synthetic identifiers and injected publication/connection/send dependencies, and asserted the results above. It did not call Twitch or AWS. The publisher fixture supplied an active matching publication and a connection explicitly, excluding missing publications/connections as explanations for those two skips.

### Additional confirmed code defects or gaps

- The settings page retains legacy `connectSocket` methods but lacks initialized `useSocket`/`socketUrl`, and its mounted hook never calls them. Its “Recent TTS events” panel cannot receive live redemptions through this code; local preview does populate it.
- The legacy socket URL points to the viewer's localhost. It cannot reach the outbound-only hosted Fargate service through that address.
- `sendTestTts()` ignores `delivered`, `failed` and `staleRemoved` on successful responses. An eligible event with no clients can produce a success banner with `delivered:0`. A server send also does not acknowledge client playback.
- The canonical widget calls global `speechSynthesis.cancel()` before each utterance, interrupting preceding speech. It has no completion/error instrumentation, application queue or async voice-readiness handling. Multiple TTS widgets can compete for the same speech engine.
- The renderer uses `v-show`, so hidden/disabled widgets remain mounted and subscribed. The TTS watcher checks global TTS configuration but not `widget.enabled`/`widget.hidden`; this can matter when another eligible widget permits fanout.
- Initial Browser Source loading has no visible error state. Periodic refresh errors are discarded, and a failed refresh in the reconnect callback prevents that callback from calling `connect()`.

### Unproven deployment/browser issues

Actual subscription status, token validity/scopes, the deployed image, gate values, publication records, Cognito/Brand association, websocket clients, browser voices, permission/autoplay denial and OBS output routing were not observed. They remain possible additional failures, not established root causes. Brand selection defaults to the first accessible Brand, so multi-Brand context must also be checked with the affected account.

### Checked and ruled out within scope

- The declared custom-redemption event type and requested `channel:read:redemptions` scope are appropriate. Twitch documents this event and permits read or manage redemption scope. This does not prove the live subscription exists. [Twitch subscription reference](https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/)
- Canonical frontend/backend allowlists both include `tts.requested`; this is not a missing event enum. Runtime/client payload shape is the mismatch.
- No missing external speech-provider secret, expired generated speech URL, speech MIME type, S3 speech CORS rule or muted HTML audio element explains this path: speech does not use those components.
- Source IAM grants and infrastructure tests cover publication reads, connection index queries/deletes, dedupe writes, scoped `execute-api:ManageConnections`, AppSync runtime access and token KMS access. No missing grant was identified in source; deployed IAM remains unverified.

## 4. Root cause

The transition to canonical Browser Sources did not connect the existing live TTS producer to that transport, and the shared canonical publisher applies alert-only eligibility to TTS. The older overlay cannot serve as a working fallback because its queue API is incompatible and it renders text without speaking.

This proves multiple code-level causes of silence. It does **not** establish which path the affected creator has open or the earliest failure in their running environment. To complete incident attribution, collect the environment/release identifier, route type (never share the opaque credential), one Twitch message ID, subscription registration result, safe integration/Brand binding metadata, fanout result and browser speech start/error result. Missing AWS credentials prevented that runtime trace here.

## 5. Recommended fix

Use the existing canonical Browser Source and browser speech engine. Do not introduce a cloud speech provider, replacement socket service, new identity system or infrastructure migration.

1. Add explicit `tts.requested` eligibility to `canonicalPublisher.ts`: require an enabled, visible TTS widget subscribed to that topic. Preserve existing chat/alert rules. Add behavior tests before changing the implementation.
2. Connect qualifying live reward TTS to the existing signed canonical publisher with `actor.displayName` and `payload.text`, retaining the current title-matching and sanitization rules. Do not merely enable the alert gate: the normalizer still produces the wrong topic. Keep non-TTS redemption behavior and generic reward alerts intact.
3. Treat a redemption's generic alert and derived TTS as outputs of one deduplicated processing operation, or explicitly extend dedupe to distinguish those outputs. **Do not issue two independent requests with the same current dedupe key:** the second will be suppressed. Preserve retry/ambiguous-delivery behavior and ensure legacy suppression cannot duplicate speech. Review this bounded contract change with tests before implementation.
4. Make TTS test results truthful: distinguish accepted/sent, zero clients, failed sends and playback confirmation. Add widget speech `onstart/onend/onerror`, respect widget visibility/enabled state, and serialize speech without canceling each preceding utterance. Handle unavailable voices and unsupported speech explicitly. Do not claim audible playback from `speak()` alone.
5. Use the canonical publication URL in creator guidance. The broken legacy route and misleading recent-events panel need a small, explicit UI decision: point users to the canonical source and describe that panel accurately, rather than silently reconnecting a legacy broadcaster-ID socket.

Browser speech errors include permission and voice/audio failures; `cancel()` clears queued speech and stops current speech. These are verification targets, not proof of this incident's browser behavior. [Speech errors](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisErrorEvent/error), [cancel](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/cancel), [speak](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/speak)

## 6. Tests

Existing tests were run without weakening or changing them:

| Command/scope | Result |
|---|---|
| Website `npm.cmd run test:overlays` | **142 passed**, 0 failed |
| Bot `npm.cmd test` | **33 passed**, 0 failed |
| `node --test src/features/creator-tools/services/twitchConnection.test.mjs scripts/validate-master-twitch-environment.test.mjs` | **10 passed**, 0 failed |
| `node --import tsx --test --test-concurrency=1 amplify/myFunction/twitch/*.test.ts amplify/overlaySource/*.test.ts amplify/overlaySource/*.test.mjs amplify/myFunction/router/restRouter.twitch.test.ts infrastructure/twitch-runtime/*.test.ts` | 77 passed; 2 file-load failures resolving `$amplify` |
| Retry those two files with `TSX_TSCONFIG_PATH=amplify/tsconfig.json` | **3 passed**, 0 failed; integration and OAuth callback assertions executed |
| In-memory synthetic cross-repository reproduction | All assertions passed, confirming the three defects in section 3 |
| `npm.cmd run validate:local-outputs` | **Blocked:** AWS `NoCredentials`; protected Ntgre not verified |

The backend retry covered `integrationHandlers.test.ts` and `oauthHandlers.test.ts`; the initial loader failures were environment configuration, not application assertion failures. Restricted Windows `os.userInfo()` also prevented initial tsx startup; tests were rerun outside that restriction. PowerShell's npm script policy was handled by using `npm.cmd`. Test logs are temporary `respawn-tts-{overlays,bot,config,backend,auth-retry}.log` files, not committed artifacts.

Coverage includes:

- Bot `test/twitchOverlayEvent.test.js`: event normalization, canonical gate, retries/dispositions and preservation of legacy TTS. Other bot tests cover secure startup/runtime, configuration, commands and reward consumer behavior.
- `amplify/myFunction/twitch/*.test.ts`: capabilities, OAuth state/callback, integration ownership, runtime leases/auth, managed settings, health and reward handling.
- `amplify/overlaySource/{domain,canonicalPublisher,handler,twitchEventDedupe,infrastructure,composition}*.test.*`: configuration/events, ownership, fanout, dedupe, infrastructure and permissions.
- Overlay `browserSourceRuntime`, `twitchOverlayConfig`, `overlayEventContract`, `overlaySourceIntegration`, `triggeredWidget*`, `alertPresentation` and `firstPartyAlertDefaults` tests: event rendering contracts, settings and alert audio behavior.

The TTS-specific frontend checks largely inspect source strings (`speechSynthesis.speak`, field names) rather than executing a live redemption through publishing and playback. Passing alert-audio tests does not prove TTS speech works.

Required regression tests:

1. Actual matching redemption → canonical TTS text → eligible TTS-only publication → WebSocket send → widget `speak`; wrong title, empty input and broadcaster mismatch must not speak.
2. TTS-only and mixed scenes; missing/disabled/hidden widgets; `tts.enabled=false`; non-TTS events retain existing behavior.
3. Duplicate/retried redemption with generic reward plus speech: no lost output, duplicate speech or cross-Brand delivery under the existing ambiguous-send policy.
4. Test UI displays API skip errors, zero clients and partial failures accurately.
5. Execute the Vue speech watcher with a mocked engine: voice delay/fallback, truncation, rate/pitch/volume including zero volume, queue ordering, cancellation, disabled/hidden widget and multiple widgets.
6. Browser/OBS tests for speech start/end/error, reconnect/config failure and audio output. A mocked `speak` invocation alone is insufficient.
7. Regression for the chosen legacy-route and recent-events UI behavior.

## 7. Configuration and observability

### Configuration inventory

| Requirement | Code/reference and inspected status |
|---|---|
| Twitch app credentials | `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`: Amplify secret references and ECS secret mappings exist; bot local `.env` contains nonempty entries. Validity and deployed values not verified. |
| OAuth state/callback | Website uses `TWITCH_OAUTH_STATE_SECRET`; bot legacy state uses `TWITCH_STATE_SECRET` (not interchangeable). Website callback/frontend URLs are fixed by master/non-master branch in `myFunction/resource.ts`; local `.env.example` values do not override those expressions. Twitch console registration not verified. |
| Broadcaster token and scope | Encrypted `TwitchTokenVault`, `TWITCH_TOKEN_KMS_KEY_ID`, token lease/refresh; requested read-redemptions scope exists. Actual connected token and KMS access unverified. Bot chat credentials are separate and do not prove broadcaster redemption authorization. |
| Runtime signing | Bot `RESPAWN_RUNTIME_SHARED_SECRET` corresponds to backend `TWITCH_RUNTIME_AUTH_SECRET`; `RESPAWN_RUNTIME_CLIENT_ID` must match `TWITCH_RUNTIME_CLIENT_ID`. Local bot shared secret/client entries exist; equality/validity not checked or printed. |
| Runtime destination/selection | `RESPAWN_SECURE_RUNTIME_ENABLED`, `RESPAWN_RUNTIME_API_BASE`, `RESPAWN_TWITCH_INTEGRATION_ID`: defined in hosted IaC. Not present in inspected bot `.env`; may be injected externally. That file alone does not configure the hosted secure mode. |
| Canonical gate | Production definition explicitly false; staging omits the variable and code defaults off. Local bot `.env` also lacks the gate. Actual process environment not verified. |
| Reward selector | Local bot `.env` has nonempty `TTS_REWARD_TITLE` and `TTS_MAX_LENGTH`; ECS definitions inspected do not set them, so code defaults apply unless supplied elsewhere. No per-Brand reward selector exists in canonical TTS config. |
| Overlay APIs | Local `amplify_outputs.json` contains auth, GraphQL, `custom.overlaySource.httpUrl` and `websocketUrl`. Presence only: target provenance could not be validated. Canonical client reads outputs, not `VITE_API_BASE_URL`. |
| Frontend environment | Website `.env.local` contains `VITE_API_BASE_URL`; the example contains the older Twitch secure flag, but the TTS page does not use that flag. Do not repoint outputs as a workaround. |
| Publication/connection resources | IaC wires `PUBLICATION_TABLE`, `CONNECTION_TABLE`, `WORKSPACE_TABLE`, `BRAND_TABLE`, `WEBSOCKET_URL`, `WEBSOCKET_MANAGEMENT_URL`; runtime gets `OVERLAY_*` equivalents and `TWITCH_EVENT_DEDUPE_TABLE`. Live tables, records and endpoints unverified. |
| CORS/identity | Overlay HTTP API allows its configured frontend origin and auth/content-type headers. `backend.ts` selects production origin for master and localhost:5174 otherwise. Check staging origin separately; do not infer CORS from successful bot chat. Browser Source credentials bind publication identity server-side. |
| Speech provider | Browser speech API only; no external TTS secret or speech storage needed. Available voices and audio device depend on the actual browser/OBS host. |

The separate production and staging ECS stacks and Amplify LegacyPlatform have distinct deployment boundaries. Existing documentation is useful architecture evidence, not verification of current runtime values. No credential values were retrieved from AWS. AWS-backed configuration existence remains unknown because read-only local-output verification failed with `NoCredentials`.

### Observability

Current bot logs cover EventSub lifecycle, reward match outcome and legacy client counts. Canonical runtime logs include Twitch message ID, integration/Brand/Workspace, dedupe decision, publication and send counts. This is useful but stops before speech. The settings page's unused socket and the legacy overlay log full received payloads; avoid extending that pattern because it exposes message content.

Add structured stages sharing event/message ID: `event_received`, `creator_resolved`, `tts_eligible` or reason for skip, `publish_attempt`, `publish_result`, `client_received`, `speech_queued`, `speech_started`, `speech_ended`/`speech_failed`. Record publication/config revision, text length, queue length, counts and safe error codes. Do not log OAuth tokens, leases, credentials, complete credential URLs or viewer text. Backend “delivered” means WebSocket send accepted, not sound heard. The canonical widget currently has no playback acknowledgement or trace of synthesis errors.

## 8. Verification plan

After approval and the tested fix, in the intended environment:

1. Verify the deployment and outputs belong to that environment. For localhost, first pass `validate:local-outputs` against the protected Ntgre sandbox; do not switch/recreate it. Record release identity and effective canonical gate safely.
2. Confirm the intended creator's Cognito → Workspace → Brand → Twitch integration binding, connected status and broadcaster redemption subscription. Confirm reward title and required user input.
3. Publish a scene with one enabled visible TTS widget. Save TTS enabled, nonzero volume and an available voice. Open its canonical credential URL in the actual OBS/browser host; verify source configuration, revision and one connected client.
4. Run local voice preview, then server “Send test to overlay.” Require a positive send count, receipt of `tts.requested`, speech start/end and audible OBS output. These are separate checks.
5. Redeem the matching channel-point reward from a real viewer account with harmless unique text. Trace one message ID through EventSub reception, creator binding, eligibility, canonical/dedupe processing, client receipt and speech. In this architecture synthesis occurs **after client receipt**.
6. Redeem twice quickly: both should be heard in order. Exercise replay/deduplication without duplicate speech. Check a normal non-TTS reward and existing alerts still behave correctly.
7. Disable TTS, hide/disable its widget, close the source and test a wrong reward title/empty input. Each should produce a clear skip/no-client result and no unintended speech. Test reconnect and a browser speech error.

A production root-cause claim requires this runtime evidence. A green unit suite or successful HTTP response alone is not end-to-end verification.

## 9. Deployment impact

**Investigation:** documentation only; no deployment needed or performed.

If the recommended fix is approved:

| Component | Expected change/deployment |
|---|---|
| Website frontend | TTS widget behavior/diagnostics, test status and legacy-route guidance; deploy frontend assets |
| Overlay Source Lambda | TTS eligibility and test-response behavior; update existing Lambda code |
| Twitch runtime Lambda | Shared publisher is bundled here too; derived-output/dedupe orchestration as needed; update existing function code |
| Twitch bot ECS runtime | Canonical TTS adapter/routing and tests; build immutable image and update the selected environment's existing task/service |
| Runtime IaC gate | Review explicit TTS/canonical rollout behavior; existing production alert gate cannot simply be enabled incidentally. Any approved environment change requires a task-definition rollout |
| Existing DynamoDB/API Gateway/KMS/AppSync/Cognito | Reuse existing resources/contracts where possible. No new speech bucket/provider, pool replacement, schema migration or root-stack migration proposed. Dedupe changes require backward-compatible review |

Likely source files: `amplify/overlaySource/canonicalPublisher.ts` and its tests; `amplify/myFunction/twitch/runtimeHandlers.ts` and tests for derived-output/dedupe integration; `bot:src/runtime/twitchOverlayEvent.js`, `bot:src/sections/11-eventsub.js`, their tests (reuse `10-tts.js` sanitization); `TtsWidget.vue`, `TextToSpeech.js` and corresponding frontend tests; `creator-tools.routes.js`/TTS template only for the chosen legacy guidance. An approved gate change would also affect the relevant `infrastructure/twitch-runtime/*-stack.ts` and infrastructure assertions.

Logical ownership remains Creator Tools/Twitch/overlay modules in the existing platform and sibling Twitch runtime deployment. This repair does not justify new product roots or additional generated resources. Shared publisher code must be deployed to both Lambda consumers. Stateful dedupe semantics and existing resource budgets must be reviewed under the repository feature rule if implementation expands; this investigation authorizes no migration.

**ROOT CAUSE:** Live TTS remains on legacy delivery; canonical publishing excludes TTS widgets; legacy playback is also broken.

**EVIDENCE:** Actual module execution confirms wrong canonical topic/text shape, rejected legacy envelope, two publisher skips with zero sends, and missing legacy queue methods.

**PROPOSED FIX:** Complete canonical TTS routing and eligibility, preserve dedupe/other alerts, add reliable browser speech handling and truthful delivery diagnostics.

**FILES THAT WOULD CHANGE:** The bounded bot adapter/dispatch, shared publisher/runtime processing, TTS frontend and tests listed above; environment gate IaC only after rollout review.

**AWS RESOURCES AFFECTED:** Existing Overlay Source and Twitch runtime Lambdas plus selected ECS task/service; existing storage and APIs reused. No resource replacement proposed.

**TESTS REQUIRED:** Cross-repository redemption-to-speech contract, TTS eligibility, dedupe with multiple outputs, speech lifecycle/queue, no-client reporting and real OBS playback.

**SAFE TO IMPLEMENT: YES** — as a local, tested repair within these existing boundaries. Deployment is not authorized; live configuration and audible playback remain unverified.
