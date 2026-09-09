import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import * as Vue from 'vue';
import { parse, compileScript } from '@vue/compiler-sfc';
import { createBuilderProject } from '../overlayBuilderDemoState.js';
import { createPublicationSceneSnapshot } from '../overlayPublicationSnapshot.js';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const logic = await read('../../views/overlays/logic/section-10-browser-sources.js');
const toolbar = await read('../../components/overlays/OverlayBuilderToolbar.vue');
const outputs = await read('../../components/overlays/BrowserSourceOutputs.vue');
const testUrl = 'https://example.test/overlay-source/test-only';

function workflow({ existing = false, saveFails = false, saveBlocked = false } = {}) {
  const calls = [], copied = [];
  const project = Vue.reactive(createBuilderProject());
  const state = {
    project, scene: Vue.computed(() => project.scenes[0]), notice: Vue.ref(''), previewMode: Vue.ref(false),
    dirty: Vue.ref(true), revision: Vue.ref(5), workspaceId: Vue.ref('workspace'), brandId: Vue.ref('brand'),
    brandContext: { load: async () => ({ workspaceId: 'workspace', brandId: 'brand' }) },
    async saveDraft() {
      calls.push('save');
      if (saveFails) throw new Error('Editable overlay changed in another session; reload before saving');
      if (saveBlocked) return;
      state.revision.value += 1; state.dirty.value = false;
      return { project, revision: state.revision.value };
    },
  };
  const publication = () => ({ publicationId: 'active-publication', revision: 1, sourceEditorRevision: state.revision.value });
  const useSources = runInNewContext(logic.replace(/^import .*$/gm, '').replace('export function', 'function') + '\nuseBrowserSources', {
    ...Vue, createPublicationSceneSnapshot,
    getActiveOverlayPublication: async () => ({ publication: existing ? publication() : null }),
    createOverlayPublication: async input => { calls.push(['create', input.sourceEditorRevision]); return { ...publication(), browserSourceUrl: testUrl, created: true }; },
    updateOverlayPublication: async (id, sceneId, snapshot, revision) => { calls.push(['update', id, revision]); return publication(); },
    rotateOverlayPublicationCredential: async () => { throw new Error('Normal saves must never rotate'); },
    navigator: { clipboard: { writeText: async value => { copied.push(value); } } },
  });
  return { ...state, ...useSources(state), calls, copied };
}

// Execute the compiled Vue templates so assertions cover the rendered labels and click handlers.
function component(source, props, emit = () => {}) {
  const { descriptor } = parse(source);
  const { content } = compileScript(descriptor, { id: 'workflow-test', inlineTemplate: true, genDefaultAs: 'component' });
  const code = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]vue['"];?/g,
    (_, names) => `const {${names.replace(/\bas\b/g, ':')}} = Vue;`);
  const definition = runInNewContext(code + '\ncomponent', { Vue: { ...Vue, resolveComponent: name => name } });
  const scope = Vue.effectScope();
  const render = scope.run(() => definition.setup(props, { expose() {}, emit }));
  return { render: () => render({ $emit: emit }, []), stop: () => scope.stop() };
}
function nodes(node) {
  if (!node || typeof node !== 'object') return [];
  return [node, ...(Array.isArray(node.children) ? node.children.flatMap(nodes) : [])];
}
const text = node => typeof node === 'string' ? node : Array.isArray(node?.children) ? node.children.map(text).join('') : typeof node?.children === 'string' ? node.children : '';
const button = (ui, label) => nodes(ui.render()).find(node => node.type === 'button' && text(node).trim() === label);

test('toolbar labels follow active publication state, including a fresh active-publication lookup', async () => {
  for (const existing of [false, true]) {
    const state = workflow({ existing });
    await state.refreshSourceState();
    const ui = component(toolbar, { hasActivePublication: state.hasActivePublication.value });
    const primary = nodes(ui.render()).find(node => node.props?.class === 'publish');
    assert.ok(text(primary).includes(existing ? 'Save Changes' : 'Create Browser Source'));
    ui.stop();
    if (existing) {
      assert.equal(state.sourceUrl.value, '');
      await state.saveAndUpdateLive();
      assert.deepEqual(state.calls, ['save', ['update', 'active-publication', 6]]);
    }
  }
});

test('first creation and repeated saves keep one publication and the issued URL', async () => {
  const state = workflow();
  await state.refreshSourceState();
  await Promise.all([state.createBrowserSource(), state.createBrowserSource()]);
  assert.equal(state.hasActivePublication.value, true);
  await Promise.all([state.saveAndUpdateLive(), state.saveAndUpdateLive()]);
  await state.createBrowserSource(); // Even an outdated create action updates the known active source.
  assert.deepEqual(state.calls, ['save', ['create', 6], 'save', ['update', 'active-publication', 7], 'save', ['update', 'active-publication', 8]]);
  assert.equal(state.publicationId.value, 'active-publication');
  assert.equal(state.sourceUrl.value, testUrl);
});

test('failed or blocked draft saves never publish or retry', async () => {
  for (const options of [{ saveFails: true }, { saveBlocked: true }]) {
    const state = workflow({ existing: true, ...options });
    await state.refreshSourceState();
    await state.saveAndUpdateLive();
    assert.deepEqual(state.calls, ['save']);
    assert.equal(state.dirty.value, true);
    assert.equal(state.revision.value, 5);
    assert.ok(state.notice.value);
  }
});

test('URL is masked on fresh load, toggles explicitly, and copies the real URL without revealing it', async () => {
  const state = workflow();
  await state.createBrowserSource();
  const props = Vue.reactive({ sourceUrl: state.sourceUrl.value, publicationId: state.publicationId.value, resolution: { width: 1920, height: 1080 } });
  const ui = component(outputs, props, event => { if (event === 'copy') return state.copySourceUrl(); });
  assert.ok(button(ui, 'Show URL'));
  assert.ok(!text(ui.render()).includes(testUrl));
  await button(ui, 'Copy URL').props.onClick();
  assert.deepEqual(state.copied, [testUrl]);
  assert.ok(!text(ui.render()).includes(testUrl));
  assert.equal(state.notice.value, 'Browser Source URL copied');
  button(ui, 'Show URL').props.onClick();
  assert.ok(text(ui.render()).includes(testUrl));
  button(ui, 'Hide URL').props.onClick();
  assert.ok(!text(ui.render()).includes(testUrl));
  button(ui, 'Show URL').props.onClick();
  const fresh = component(outputs, props);
  assert.ok(button(fresh, 'Show URL'));
  assert.ok(!text(fresh.render()).includes(testUrl));
  props.sourceUrl = `${testUrl}-rotated`;
  await Vue.nextTick();
  assert.ok(button(ui, 'Show URL'));
  assert.ok(!text(ui.render()).includes(props.sourceUrl));
  props.sourceUrl = '';
  assert.equal(button(ui, 'Show URL'), undefined);
  ui.stop(); fresh.stop();
});
