import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { overlayState, rememberOverlay } from '../../../../overlays/overlayStore.js'
import { createBuilderProject, restoreBuilderProject } from '../../../../overlays/overlayBuilderDemoState.js'
import { createHistory } from '../../../../overlays/overlayHistory.js'
import { useCreatorBrandContext } from '@/features/creator-tools/composables/useCreatorBrandContext.js'
import { getEditableOverlayProject, updateEditableOverlayProject } from '@/features/creator-tools/services/overlaySource.js'

const STORAGE_KEY = 'project-respawn.overlay-builder-demo.v1'

export function useOverlayEditorCore(route, router) {
  const restored = typeof sessionStorage === 'undefined'
    ? createBuilderProject()
    : restoreBuilderProject(sessionStorage.getItem(STORAGE_KEY))
  const project = reactive(restored)
  const history = reactive(createHistory(project, 50))
  const notice = ref('')
  const offerWidget = ref('')
  const activeWidgetId = ref('')
  const previewMode = ref(false)
  const loading = ref(true)
  const saving = ref(false)
  const dirty = ref(false)
  const workspaceId = ref('')
  const brandId = ref('')
  const revision = ref(0)
  const brandContext = useCreatorBrandContext(route, router)
  const cleanupCallbacks = new Set()
  let noticeTimer

  const scene = computed(() => project.scenes.find(item => item.id === project.selectedSceneId) || project.scenes[0])
  const selectedWidget = computed(() => scene.value.widgets.find(item => item.id === project.selectedWidgetId) || null)

  function commit(message = 'Unsaved demo changes') {
    history.commit(project)
    dirty.value = true
    notice.value = message
  }

  function selectWidget(id) {
    project.selectedWidgetId = id
  }

  function changeWidget(next, record = true) {
    const index = scene.value.widgets.findIndex(widget => widget.id === next.id)
    if (index < 0) return
    scene.value.widgets[index] = next
    if (record) commit(`${next.name} updated`)
  }

  function undo() {
    Object.assign(project, history.undo())
    dirty.value = true
    notice.value = 'Undo applied'
  }

  function redo() {
    Object.assign(project, history.redo())
    dirty.value = true
    notice.value = 'Redo applied'
  }

  async function saveDemo({ rethrow = false } = {}) {
    if (loading.value || saving.value) return
    if (!workspaceId.value || !brandId.value) { const error = new Error('Cannot save: Creator Workspace or Brand is unavailable'); notice.value = error.message; if (rethrow) throw error; return null }
    saving.value = true
    try {
      const result = await updateEditableOverlayProject(workspaceId.value, brandId.value, project, revision.value)
      replaceProject(result.project)
      revision.value = Number(result.revision || revision.value + 1)
      history.replace(project)
      dirty.value = false
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(project))
      notice.value = `Saved to Project Respawn · Revision ${revision.value} · Browser Source not published`
      return { project, revision: revision.value }
    } catch (error) {
      notice.value = error?.message || 'Overlay save failed'
      if (rethrow) throw error
      return null
    } finally {
      saving.value = false
    }
  }

  function replaceProject(next) {
    for (const key of Object.keys(project)) delete project[key]
    Object.assign(project, restoreBuilderProject(next))
  }

  function warnUnsaved(event) {
    if (!dirty.value) return
    event.preventDefault(); event.returnValue = ''
  }

  function registerCleanup(callback) {
    cleanupCallbacks.add(callback)
    return () => cleanupCallbacks.delete(callback)
  }

  onMounted(async () => {
    rememberOverlay(String(route.params.overlayId || ''))
    window.addEventListener('beforeunload', warnUnsaved)
    try {
      const resolved = await brandContext.load()
      brandId.value = resolved?.brandId || ''
      workspaceId.value = resolved?.workspaceId || ''
      if (!brandId.value || !workspaceId.value) throw new Error('Creator Workspace or Brand is unavailable')
      const result = await getEditableOverlayProject(workspaceId.value, brandId.value)
      revision.value = Number(result.revision || 0)
      if (result.project) {
        replaceProject(result.project)
        history.replace(project)
        notice.value = `Loaded saved overlay · Revision ${revision.value}`
      } else {
        notice.value = 'Starter overlay loaded · Save to keep editable scenes in Project Respawn'
      }
      dirty.value = false
    } catch (error) {
      notice.value = error?.message || 'Saved overlay could not be loaded'
    } finally {
      loading.value = false
    }
    if (overlayState.recoveredStorage) {
      notice.value = 'Older demo storage was refreshed with starter layouts.'
      overlayState.recoveredStorage = false
      noticeTimer = window.setTimeout(() => {
        if (notice.value.includes('storage')) notice.value = ''
      }, 4200)
    }
  })

  onBeforeUnmount(() => {
    clearTimeout(noticeTimer)
    window.removeEventListener('beforeunload', warnUnsaved)
    cleanupCallbacks.forEach(callback => callback())
  })

  return {
    project, history, notice, offerWidget, activeWidgetId, previewMode, loading, saving, dirty, revision, workspaceId, brandId, brandContext,
    scene, selectedWidget, commit, selectWidget, changeWidget, undo, redo,
    saveDemo, registerCleanup, storageKey: STORAGE_KEY,
  }
}
