import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const [renderer, triggerState, alert, tts, chat, alertsPage, ttsPage, moderation, properties, publication] = await Promise.all([
  read('../../components/overlays/OverlaySceneRenderer.vue'), read('../triggeredWidgetState.js'), read('../../widgets/alerts/alerts/AlertsWidget.vue'),
  read('../../widgets/tts-audio/tts/TtsWidget.vue'), read('../../widgets/chat/twitch-chat/ChatWidget.vue'), read('../../views/twitch/alerts/TwitchAlerts.vue'),
  read('../../views/twitch/text-to-speech/TextToSpeech.js'), read('../../views/twitch/moderation/TwitchModeration.js'), read('../../components/overlays/WidgetPropertiesPanel.vue'), read('../overlayPublicationSnapshot.js'),
]);

test('canonical alert configuration controls enablement, duration, templates and event payload interpolation', () => {
  assert.match(triggerState, /activeSettings\?\.enabled === false/); assert.match(triggerState, /triggerDurationMs\(widget, activeSettings\)/);
  for (const token of ['{user}', '{viewers}', '{bits}', '{reward}']) assert.match(alert, new RegExp(token.replace(/[{}]/g, '\\$&')));
  assert.match(renderer, /runtimeConfig\?\.alerts/); assert.match(alertsPage, /updateTwitchOverlayConfig/);
});

test('TTS and chat use server-backed safe configuration without Browser Source localStorage', () => {
  for (const field of ['voice', 'rate', 'pitch', 'volume', 'maxLength']) assert.match(tts, new RegExp(`config\\.${field}`));
  assert.match(ttsPage, /getTwitchOverlayConfig/); assert.match(ttsPage, /updateTwitchOverlayConfig/); assert.doesNotMatch(ttsPage, /localStorage/);
  assert.match(ttsPage, /sendOverlayTestEvent/); assert.doesNotMatch(ttsPage, /fetch\(`\$\{this\.apiBaseUrl\}\/api\/tts\/test/);
  assert.doesNotMatch(ttsPage, /VITE_TWITCH_SECURE_INTEGRATION/); assert.match(ttsPage, /refreshAccessContext/);
  assert.match(chat, /blockedTerms/); assert.match(chat, /maxMessages/); assert.match(chat, /platforms/); assert.match(moderation, /updateTwitchOverlayConfig/);
});

test('Overlay Builder retains layout and visual controls but removes duplicate Twitch behaviour ownership', () => {
  assert.match(properties, /Configure Twitch Settings/);
  for (const key of ['messageTemplate', 'duration', 'maxMessages', 'hideBotMessages', 'hideCommands']) assert.match(publication, new RegExp(key));
  assert.match(publication, /delete settings\[key\]/);
});
