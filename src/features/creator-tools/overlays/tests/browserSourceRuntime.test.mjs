import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const [source, renderer, alert, chat, tts, universal] = await Promise.all([
  read('../../views/overlays/OverlayBrowserSource.vue'),
  read('../../components/overlays/OverlaySceneRenderer.vue'),
  read('../../widgets/alerts/alerts/AlertsWidget.vue'),
  read('../../widgets/chat/twitch-chat/ChatWidget.vue'),
  read('../../widgets/tts-audio/tts/TtsWidget.vue'),
  read('../../widgets/utility/universal-demo/UniversalDemoWidget.vue'),
]);

test('public Browser Source explicitly selects non-demo runtime mode', () => {
  assert.match(source, /runtime-mode="browser-source"/);
  assert.match(renderer, /:runtime-mode="runtimeMode"/);
  assert.match(renderer, /default: 'editor-preview'/);
});

test('live alert starts neutral while editor preview retains its explicit sample', () => {
  assert.match(alert, /runtimeMode==='browser-source'\?null/);
  assert.match(alert, /v-if="event && config"/);
  assert.match(alert, /AlertPresentation/);
  assert.match(alert, /NovaRespawn/);
});

test('live chat starts empty and hides editor-only preview labeling', () => {
  assert.match(chat, /runtimeMode==='browser-source'\?\[\]:previewMessages/);
  assert.match(chat, /v-if="runtimeMode !== 'browser-source'"/);
  for (const sample of ['PixelPioneer', 'NexusKnight', 'StreamBel', 'Moonlight']) assert.match(chat, new RegExp(sample));
});

test('live subscription, raid, and TTS widgets wait for canonical events', () => {
  assert.match(universal, /runtimeMode==='browser-source'.*\?null/);
  assert.match(tts, /runtimeMode==='browser-source'\?null/);
  assert.match(tts, /speechSynthesis\.speak/);
  assert.match(tts, /SpeechSynthesisUtterance/);
});

test('Browser Source owns a fixed transparent viewport and widgets fill outer frames', () => {
  assert.match(source, /position: fixed; inset: 0/);
  assert.match(source, /background: transparent/);
  assert.match(renderer, /\.widget-renderer \{ width: 100%; height: 100%; \}/);
  assert.doesNotMatch(renderer, /zoom:/);
});
