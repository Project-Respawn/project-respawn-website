import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { computed, reactive, ref } from 'vue';
import { createBuilderProject, restoreBuilderProject } from '../overlayBuilderDemoState.js';
import { createHistory } from '../overlayHistory.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const [core, service, toolbar, browserSources] = await Promise.all([
  read('../../views/overlays/logic/shared/editor-core.js'), read('../../services/overlaySource.js'),
  read('../../components/overlays/OverlayBuilderToolbar.vue'), read('../../views/overlays/logic/section-10-browser-sources.js'),
]);

test('editor loads and saves a Brand-scoped server project without autosaving defaults', () => {
  assert.match(core, /useCreatorBrandContext/); assert.match(core, /getEditableOverlayProject/); assert.match(core, /updateEditableOverlayProject/);
  assert.match(core, /brandId\.value/); assert.match(core, /workspaceId\.value/); assert.match(core, /if \(result\.project\)/);
  assert.doesNotMatch(core, /onMounted\([\s\S]*updateEditableOverlayProject/);
  assert.match(service, /overlay\/editor-project/); assert.match(toolbar, /Save Draft/); assert.match(toolbar, /Draft saved/);
});

test('failed and stale saves remain visibly dirty while publish stays explicit and stable', () => {
  assert.match(core, /dirty\.value = true/); assert.match(core, /catch \(error\)/); assert.match(core, /notice\.value = error/);
  assert.match(core, /revision\.value/); assert.match(core, /beforeunload/);
  assert.match(browserSources, /updateOverlayPublication/); assert.doesNotMatch(core, /updateOverlayPublication/);
});

async function createEditor({ loadRevision = 5, update, restore = restoreBuilderProject } = {}) {
  let mounted;
  const useCore = runInNewContext(
    core.replace(/^import .*$/gm, '').replace('export function useOverlayEditorCore', 'function useOverlayEditorCore') + '\nuseOverlayEditorCore',
    {
      computed, reactive, ref, createBuilderProject, restoreBuilderProject: restore, createHistory,
      onMounted(callback) { mounted = callback; }, onBeforeUnmount() {},
      overlayState: {}, rememberOverlay() {},
      useCreatorBrandContext: () => ({ load: async () => ({ workspaceId: 'workspace', brandId: 'brand' }) }),
      getEditableOverlayProject: async () => ({ project: { ...createBuilderProject(), revision: 999 }, revision: loadRevision }),
      updateEditableOverlayProject: update,
      sessionStorage: { getItem() { return null; }, setItem() {} },
      window: { addEventListener() {}, removeEventListener() {} }, clearTimeout,
    },
  );
  const editor = useCore({ params: {} }, {});
  await mounted();
  return editor;
}

test('GET stores the response revision and consecutive saves use each server-returned revision', async () => {
  const sent = [];
  const editor = await createEditor({ update: async (workspace, brand, project, revision) => {
    assert.equal(workspace, 'workspace');
    assert.equal(brand, 'brand');
    sent.push(revision);
    return { project: createBuilderProject(), revision: revision + 2 };
  } });
  assert.equal(editor.revision.value, 5);
  editor.commit();
  await editor.saveDemo();
  assert.equal(editor.revision.value, 7);
  assert.equal(editor.dirty.value, false);
  editor.commit();
  await editor.saveDemo();
  assert.deepEqual(sent, [5, 7]);
  assert.equal(editor.revision.value, 9);
});

test('the existing saving guard prevents overlapping requests with the same revision', async () => {
  let finish;
  const sent = [];
  const editor = await createEditor({ update: (workspace, brand, project, revision) => {
    sent.push(revision);
    return new Promise(resolve => { finish = resolve; });
  } });
  editor.commit();
  const pending = editor.saveDemo();
  assert.equal(editor.saving.value, true);
  await editor.saveDemo({ rethrow: true });
  assert.deepEqual(sent, [5]);
  finish({ project: createBuilderProject(), revision: 6 });
  await pending;
  assert.equal(editor.revision.value, 6);
  assert.equal(editor.saving.value, false);
  editor.commit();
  const next = editor.saveDemo();
  assert.deepEqual(sent, [5, 6]);
  finish({ project: createBuilderProject(), revision: 7 });
  await next;
});

test('successful PUT advances revision before returned project processing can fail', async () => {
  const sent = [];
  const editor = await createEditor({
    restore(value) {
      if (value?.failRestore) throw new Error('Project processing failed');
      return restoreBuilderProject(value);
    },
    update: async (workspace, brand, project, revision) => {
      sent.push(revision);
      return { project: { failRestore: true }, revision: 8 };
    },
  });
  editor.commit();
  await editor.saveDemo();
  assert.equal(editor.revision.value, 8);
  assert.equal(editor.dirty.value, true);
  await editor.saveDemo();
  assert.deepEqual(sent, [5, 8]);
});

test('stale saves preserve local edits, dirty state and revision and surface the error without retrying', async () => {
  const message = 'Editable overlay changed in another session; reload before saving';
  let requests = 0;
  const editor = await createEditor({ update: async () => { requests += 1; throw new Error(message); } });
  editor.project.name = 'Unsaved local edits';
  editor.commit();
  assert.equal(await editor.saveDemo(), null);
  assert.equal(editor.project.name, 'Unsaved local edits');
  assert.equal(editor.dirty.value, true);
  assert.equal(editor.revision.value, 5);
  assert.equal(editor.notice.value, message);
  assert.equal(editor.saving.value, false);
  assert.equal(requests, 1);
  await assert.rejects(editor.saveDemo({ rethrow: true }), { message });
  assert.equal(editor.dirty.value, true);
  assert.equal(editor.project.name, 'Unsaved local edits');
  assert.equal(requests, 2);
});
