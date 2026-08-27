import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const editor = await readFile(new URL('../../views/overlays/OverlayEditor.vue', import.meta.url), 'utf8');
const outputs = await readFile(new URL('../../components/overlays/BrowserSourceOutputs.vue', import.meta.url), 'utf8');
const controls = await readFile(new URL('../../components/overlays/OverlayTestControls.vue', import.meta.url), 'utf8');
const source = await readFile(new URL('../../views/overlays/OverlayBrowserSource.vue', import.meta.url), 'utf8');
const service = await readFile(new URL('../../services/overlaySource.js', import.meta.url), 'utf8');

test('Overlay Builder exposes one scene publication lifecycle and no per-widget URLs', () => {
  for (const action of ['refreshSourceState','createTestSource','updateTestSource','replaceActiveScene','copySourceUrl','openSourceUrl','rotateSourceUrl','revokeTestSource']) assert.match(editor, new RegExp(action));
  assert.match(outputs, /One stable URL renders the Brand's active scene/); assert.doesNotMatch(outputs, /Universal Source|Scene URLs/);
  assert.match(outputs, /Replace Active Scene/); assert.match(outputs, /Rotate \/ Reissue URL/);
  assert.match(service, /overlay\/publications\/active/); assert.match(service, /overlay\/publications\/\$\{encodeURIComponent\(publicationId\)\}\/rotate/);
});

test('all required Creator Tools test buttons use the shared server event boundary', () => {
  for (const type of ['chat.message','stream.follow','stream.subscription','stream.raid','stream.cheer','reward.redeemed','tts.requested']) assert.match(controls, new RegExp(type.replace('.', '\\.')));
  assert.match(editor, /sendSourceTest\(\$event\.type\)/); assert.match(service, /overlay\/publications\/\$\{encodeURIComponent\(publicationId\)\}\/events/);
});

test('Browser Source retrieves server configuration and opens one reconnecting scene connection', () => {
  assert.match(source, /fetchOverlaySource\(credential\.value\)/); assert.match(source, /createOverlaySourceConnection/); assert.match(source, /widgetEventBus\.publish/);
  assert.match(service, /Math\.min\(1000 \* \(2 \*\* attempts\), 15000\)/); assert.match(service, /url\.searchParams\.set\('credential', credential\)/);
});

test('Browser Source transparency is isolated to its route lifecycle', () => {
  assert.match(source, /document\.documentElement\.classList\.add\(documentClass\)/);
  assert.match(source, /document\.documentElement\.classList\.remove\(documentClass\)/);
  assert.doesNotMatch(source, /html,\s*body,\s*#app\s*\{/);
});

test('temporary Browser Source geometry diagnostic contains only safe layout metadata', () => {
  assert.match(source, /\[Overlay Source geometry diagnostic\]/);
  for (const field of ['viewport', 'scene', 'computedScale', 'stageBoundingRect', 'devicePixelRatio', 'widgetBoundingRects']) {
    assert.match(source, new RegExp(field));
  }
  assert.doesNotMatch(source, /console\.(?:info|log)[\s\S]{0,500}(?:credential|publicationId|authorization|token)/i);
});
