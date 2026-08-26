import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const editor = await readFile(new URL('../../views/overlays/OverlayEditor.vue', import.meta.url), 'utf8');
const outputs = await readFile(new URL('../../components/overlays/BrowserSourceOutputs.vue', import.meta.url), 'utf8');
const controls = await readFile(new URL('../../components/overlays/OverlayTestControls.vue', import.meta.url), 'utf8');
const source = await readFile(new URL('../../views/overlays/OverlayBrowserSource.vue', import.meta.url), 'utf8');
const service = await readFile(new URL('../../services/overlaySource.js', import.meta.url), 'utf8');

test('Overlay Builder exposes one scene publication lifecycle and no per-widget URLs', () => {
  for (const action of ['createTestSource','updateTestSource','copySourceUrl','openSourceUrl','revokeTestSource']) assert.match(editor, new RegExp(action));
  assert.match(outputs, /One URL renders every enabled widget/); assert.doesNotMatch(outputs, /Universal Source|Scene URLs/);
});

test('all required Creator Tools test buttons use the shared server event boundary', () => {
  for (const type of ['chat.message','stream.follow','stream.subscription','stream.raid','stream.cheer','reward.redeemed','tts.requested']) assert.match(controls, new RegExp(type.replace('.', '\\.')));
  assert.match(editor, /sendSourceTest\(\$event\.type\)/); assert.match(service, /overlay\/publications\/\$\{encodeURIComponent\(publicationId\)\}\/events/);
});

test('Browser Source retrieves server configuration and opens one reconnecting scene connection', () => {
  assert.match(source, /fetchOverlaySource\(credential\.value\)/); assert.match(source, /createOverlaySourceConnection/); assert.match(source, /widgetEventBus\.publish/);
  assert.match(service, /Math\.min\(1000 \* \(2 \*\* attempts\), 15000\)/); assert.match(service, /url\.searchParams\.set\('credential', credential\)/);
});
