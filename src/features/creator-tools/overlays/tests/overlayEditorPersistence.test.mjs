import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const [core, service, toolbar, browserSources] = await Promise.all([
  read('../../views/overlays/logic/shared/editor-core.js'), read('../../services/overlaySource.js'),
  read('../../components/overlays/OverlayBuilderToolbar.vue'), read('../../views/overlays/logic/section-10-browser-sources.js'),
]);

test('editor loads and saves a Brand-scoped server project without autosaving defaults', () => {
  assert.match(core, /refreshAccessContext/); assert.match(core, /getEditableOverlayProject/); assert.match(core, /updateEditableOverlayProject/);
  assert.match(core, /brandId\.value/); assert.match(core, /workspaceId\.value/); assert.match(core, /if \(result\.project\)/);
  assert.doesNotMatch(core, /onMounted\([\s\S]*updateEditableOverlayProject/);
  assert.match(service, /overlay\/editor-project/); assert.match(toolbar, /Save to Project Respawn/); assert.match(toolbar, /Save changes/);
});

test('failed and stale saves remain visibly dirty while publish stays explicit and stable', () => {
  assert.match(core, /dirty\.value = true/); assert.match(core, /catch \(error\)/); assert.match(core, /notice\.value = error/);
  assert.match(core, /revision\.value/); assert.match(core, /beforeunload/);
  assert.match(browserSources, /updateOverlayPublication/); assert.doesNotMatch(core, /updateOverlayPublication/);
});
