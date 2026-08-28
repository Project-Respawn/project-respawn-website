import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const [core, sources, service, handler, context, editor, status] = await Promise.all([
  read('../../views/overlays/logic/shared/editor-core.js'), read('../../views/overlays/logic/section-10-browser-sources.js'),
  read('../../services/overlaySource.js'), read('../../../../../amplify/overlaySource/handler.ts'),
  read('../../composables/useCreatorBrandContext.js'), read('../../views/overlays/OverlayEditor.vue'),
  read('../../components/overlays/BrowserSourceOutputs.vue'),
]);

test('editor and publication management share explicit Brand bindings without first-Brand fallback', () => {
  assert.match(core, /brandContext\.load/); assert.match(sources, /brandContext\.load/);
  assert.match(core, /getEditableOverlayProject\(workspaceId\.value, brandId\.value\)/);
  assert.match(sources, /getActiveOverlayPublication\(bindings\.workspaceId, bindings\.brandId\)/);
  assert.doesNotMatch(core + sources, /brands\?\.\[0\]|workspaces\?\.\[0\]/);
  assert.match(context, /brands\.find/); assert.match(context, /Select an accessible Brand/);
});

test('Save Draft remains independent and successful saves clear dirty state', () => {
  assert.match(core, /updateEditableOverlayProject/); assert.match(core, /dirty\.value = false/);
  assert.doesNotMatch(core, /updateOverlayPublication/); assert.match(status, /Save Draft/);
});

test('Save and Update Live saves first, never publishes after a failed save, and preserves stale state on publication failure', () => {
  const saveIndex = sources.indexOf('await ensureSavedDraft()');
  const publishIndex = sources.indexOf('await updateOverlayPublication');
  assert.ok(saveIndex >= 0 && publishIndex > saveIndex);
  assert.match(sources, /saveDraft\(\{ rethrow: true \}\)/);
  assert.match(sources, /Draft saved — live update failed/);
  assert.match(sources, /sourceEditorRevision\.value !== revision\.value/);
});

test('publication metadata is sent on create and update without credential rotation', () => {
  assert.match(sources, /sourceEditorRevision: revision\.value/);
  assert.match(sources, /updateOverlayPublication\([^\n]+revision\.value\)/);
  assert.match(service, /sourceEditorRevision/); assert.match(handler, /sourceEditorRevision = :sourceEditorRevision/);
  const updateBody = sources.slice(sources.indexOf('async function saveAndUpdateLive'), sources.indexOf('async function replaceActiveScene'));
  assert.doesNotMatch(updateBody, /rotateOverlayPublicationCredential/);
});

test('legacy live state is unknown and scene changes make Live stale', () => {
  assert.match(sources, /sourceEditorRevision\.value === null/);
  assert.match(status, /Status unknown · update recommended/);
  assert.match(sources, /activeSceneId\.value !== scene\.value\?\.id/);
  assert.match(editor, /live-status-unknown/); assert.match(editor, /live-out-of-date/);
});
