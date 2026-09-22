import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { chooseCreatorBrandId, resolveCreatorBrand } from '../../composables/useCreatorBrandContext.js';
import { computed, ref } from 'vue';
import { declaration, evaluate, templateNodes } from '../../../../../scripts/test-support/source-contracts.mjs';

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

test('Brand selection prioritises the route, then shared context, then a sole accessible Brand', () => {
  const access = { brands: [
    { brandId: 'brand-a', workspaceId: 'workspace-a' },
    { brandId: 'brand-b', workspaceId: 'workspace-b' },
  ] };
  assert.equal(chooseCreatorBrandId(access, 'brand-b', 'brand-a'), 'brand-b');
  assert.equal(chooseCreatorBrandId(access, '', 'brand-a'), 'brand-a');
  assert.equal(chooseCreatorBrandId(access), '');
  assert.equal(chooseCreatorBrandId({ brands: [access.brands[0]] }), 'brand-a');
  assert.equal(chooseCreatorBrandId({ brands: [] }), '');
  assert.equal(resolveCreatorBrand(access, 'brand-a')?.workspaceId, 'workspace-a');
});

test('legacy one-Brand access can use the sole workspace without guessing among multiple workspaces', () => {
  const brand = { brandId: 'brand-a' };
  assert.equal(resolveCreatorBrand({ brands: [brand], workspaces: [{ id: 'workspace-a' }] }, 'brand-a')?.workspaceId, 'workspace-a');
  assert.equal(resolveCreatorBrand({ brands: [brand], workspaces: [{ id: 'workspace-a' }, { id: 'workspace-b' }] }, 'brand-a'), null);
});

test('Save Draft remains independent and successful saves clear dirty state', () => {
  assert.match(core, /updateEditableOverlayProject/); assert.match(core, /dirty\.value = false/);
  assert.doesNotMatch(core, /updateOverlayPublication/); assert.match(status, /Save Draft/);
});

test('toolbar exposes the contextual Draft to Live actions without hiding Save Draft', () => {
  assert.match(editor, /@live="handleToolbarLiveAction"/);
  assert.match(editor, /hasActivePublication\.value\s*\? saveAndUpdateLive\(\)\s*: createBrowserSource\(\)/);
  assert.match(context, /chooseCreatorBrandId/);
  return read('../../components/overlays/OverlayBuilderToolbar.vue').then((toolbar) => {
    assert.match(toolbar, /Save Draft/);
    assert.match(toolbar, /Create Browser Source/);
    assert.match(toolbar, /Save Changes/);
  });
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

test('legacy publication stays published with unknown freshness and scene changes make Live stale', () => {
  const bindings = { computed, hasActivePublication: ref(true), sourceEditorRevision: ref(null), dirty: ref(false), revision: ref(5), activeSceneId: ref('scene-a'), scene: ref({ id: 'scene-a' }) };
  bindings.liveStatusUnknown = evaluate(declaration(sources, 'liveStatusUnknown'), bindings);
  const stale = evaluate(declaration(sources, 'liveOutOfDate'), bindings);
  assert.equal(bindings.liveStatusUnknown.value, true);
  assert.equal(stale.value, true);
  bindings.sourceEditorRevision.value = 5;
  assert.equal(bindings.liveStatusUnknown.value, false);
  assert.equal(stale.value, false);
  bindings.scene.value = { id: 'scene-b' };
  assert.equal(stale.value, true);
  bindings.hasActivePublication.value = false;
  assert.equal(stale.value, false);
  const labels = templateNodes(status, node => node.type === 5 && node.content.content.includes('liveStatusUnknown'));
  assert.equal(labels.length, 1);
  const label = (overrides = {}) => evaluate(labels[0].content.content, { publicationId: 'published-id', busy: false, error: '', liveStatusUnknown: false, liveOutOfDate: false, ...overrides });
  assert.equal(label({ liveStatusUnknown: true }), 'Published · update recommended');
  assert.equal(label({ liveOutOfDate: true }), 'Published · Update available');
  assert.equal(label(), 'Published · Up to date');
  assert.equal(label({ publicationId: '' }), 'Not published');
  assert.equal(label({ publicationId: '', busy: true }), 'Checking publication…');
  assert.equal(label({ publicationId: '', error: 'Failed' }), 'Status unavailable');
  assert.match(editor, /live-status-unknown/); assert.match(editor, /live-out-of-date/);
});
