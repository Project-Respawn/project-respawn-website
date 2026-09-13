import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { computed, ref } from 'vue';
import { parse, compileScript } from '@vue/compiler-sfc';
import { createBuilderProject } from '../overlayBuilderDemoState.js';
import { createPublicationSceneSnapshot } from '../overlayPublicationSnapshot.js';
import { createWidgetEventBus } from '../widgetEventBus.js';

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
  assert.match(chat, /const messages = ref\(\[\]\)/);
  assert.match(chat, /v-if="runtimeMode !== 'browser-source'"/);
  assert.match(chat, /No messages yet/);
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

function runtime() {
  let mounted, unmounted, poll, interval, connectionOptions, connections = 0, closes = 0;
  let remote = { revision: 7, scene: createBuilderProject().scenes[0], twitchConfigRevision: 1, twitchConfig: {}, websocketUrl: 'wss://example.test' };
  const credentials = [], bus = createWidgetEventBus();
  const script = parse(source).descriptor.scriptSetup.content;
  const state = runInNewContext(script.replace(/^import .*$/gm, '') + '\n({ scene, loadedRevision, runtimeConfig, refreshRuntimeConfig })', {
    computed, ref, createPublicationSceneSnapshot, widgetEventBus: bus,
    useRoute: () => ({ params: { credential: 'unchanged-test-credential' } }),
    fetchOverlaySource: async credential => { credentials.push(credential); return remote; },
    createOverlaySourceConnection(options) { connections++; connectionOptions = options; return { close() { closes++; } }; },
    onMounted(callback) { mounted = callback; }, onBeforeUnmount(callback) { unmounted = callback; },
    ResizeObserver: class { observe() {} disconnect() {} },
    document: { documentElement: { classList: { add() {}, remove() {} } } },
    window: { innerWidth: 1920, innerHeight: 1080, setInterval(callback, delay) { poll = callback; interval = delay; return 1; }, clearInterval() {} },
  });
  return {
    ...state, bus, credentials, mount: () => mounted(), unmount: () => unmounted(),
    poll: async () => { poll(); await new Promise(resolve => setImmediate(resolve)); },
    setRemote(value) { remote = value; }, get remote() { return remote; },
    get interval() { return interval; }, get connections() { return connections; }, get closes() { return closes; },
    event: event => connectionOptions.onEvent(event), reconnect: () => connectionOptions.onReconnect(),
  };
}

test('existing poll applies newer publication scenes without replacing the source connection or credential', async () => {
  compileScript(parse(source).descriptor, { id: 'source-refresh', inlineTemplate: true });
  const page = runtime();
  page.mount();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(page.loadedRevision.value, 7);
  assert.equal(page.interval, 30_000);
  const originalScene = page.scene.value;
  await page.poll();
  assert.equal(page.scene.value, originalScene, 'unchanged revisions retain the rendered scene');
  page.setRemote({ ...page.remote, revision: 8, scene: { ...page.remote.scene, name: 'Updated live layout' }, twitchConfigRevision: 2 });
  await page.poll();
  assert.equal(page.loadedRevision.value, 8);
  assert.equal(page.scene.value.name, 'Updated live layout');
  assert.equal(page.runtimeConfig.value.revision, 2);
  const updatedScene = page.scene.value;
  await page.poll();
  assert.equal(page.scene.value, updatedScene);
  const received = [];
  const unsubscribe = page.bus.subscribe('stream.follow', event => received.push(event));
  await page.event({ topic: 'stream.follow', provider: 'twitch', configRevision: 2 });
  assert.equal(received.length, 1);
  assert.equal(received[0].provider, 'twitch');
  assert.equal(page.connections, 1);
  assert.equal(page.closes, 0);
  assert.ok(page.credentials.every(value => value === 'unchanged-test-credential'));
  unsubscribe(); page.unmount();
  assert.equal(page.closes, 1);
});

test('config-only updates and reconnect refresh remain functional without rolling the scene back', async () => {
  const page = runtime();
  page.mount();
  await new Promise(resolve => setImmediate(resolve));
  const originalScene = page.scene.value;
  page.setRemote({ ...page.remote, twitchConfigRevision: 2 });
  await page.event({ topic: 'stream.follow', provider: 'twitch', configRevision: 2 });
  assert.equal(page.runtimeConfig.value.revision, 2);
  assert.equal(page.scene.value, originalScene);
  page.setRemote({ ...page.remote, revision: 9, scene: { ...page.remote.scene, name: 'Latest scene' } });
  await page.reconnect();
  const latestScene = page.scene.value;
  assert.equal(page.loadedRevision.value, 9);
  page.setRemote({ ...page.remote, revision: 8, scene: { ...page.remote.scene, name: 'Older response' } });
  await page.poll();
  assert.equal(page.scene.value, latestScene);
  assert.equal(page.loadedRevision.value, 9);
  page.unmount();
});
