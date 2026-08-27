import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../../components/overlays/OverlaySceneRenderer.vue', import.meta.url), 'utf8');

test('one browser renderer renders all enabled scene widgets with exact frames and z order', () => {
  assert.match(source, /v-for="widget in orderedWidgets"/);
  assert.match(source, /widget\.enabled && !widget\.hidden/);
  for (const field of ['frame.x', 'frame.y', 'frame.width', 'frame.height', 'zIndex']) assert.match(source, new RegExp(field.replace('.', '\\.')));
});

test('browser renderer is transparent and contains no editor chrome', () => {
  assert.match(source, /background: transparent/);
  assert.doesNotMatch(source, /resize-handle|selection|selectedId|pointerdown|dragging/);
  assert.match(source, /pointer-events: none/);
});

test('browser renderer scopes triggered visibility to canonical widget topics', () => {
  assert.match(source, /widgetDisplayMode\(widget\) !== 'triggered'/);
  assert.match(source, /createTriggeredWidgetSubscription/);
  assert.match(source, /overlay-source-trigger-in/);
});
