import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { overlayState, rememberOverlay } from '../../../../overlays/overlayStore.js'
import { createBuilderProject, restoreBuilderProject } from '../../../../overlays/overlayBuilderDemoState.js'
import { createHistory } from '../../../../overlays/overlayHistory.js'

const STORAGE_KEY = 'project-respawn.overlay-builder-demo.v1'

export function useOverlayEditorCore(route) {
  const restored = typeof sessionStorage === 'undefined'
    ? createBuilderProject()
    : restoreBuilderProject(sessionStorage.getItem(STORAGE_KEY))
  const project = reactive(restored)
  const history = reactive(createHistory(project, 50))
  const notice = ref('')
  const offerWidget = ref('')
  const activeWidgetId = ref('')
  const previewMode = ref(false)
  const cleanupCallbacks = new Set()
  let noticeTimer

  const scene = computed(() => project.scenes.find(item => item.id === project.selectedSceneId) || project.scenes[0])
  const selectedWidget = computed(() => scene.value.widgets.find(item => item.id === project.selectedWidgetId) || null)

  function commit(message = 'Unsaved demo changes') {
    history.commit(project)
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
    notice.value = 'Undo applied'
  }

  function redo() {
    Object.assign(project, history.redo())
    notice.value = 'Redo applied'
  }

  function saveDemo() {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(project))
    history.replace(project)
    notice.value = 'Saved in this browser · Nothing was published'
  }

  function registerCleanup(callback) {
    cleanupCallbacks.add(callback)
    return () => cleanupCallbacks.delete(callback)
  }

  onMounted(() => {
    rememberOverlay(String(route.params.overlayId || ''))
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
    cleanupCallbacks.forEach(callback => callback())
  })

  return {
    project, history, notice, offerWidget, activeWidgetId, previewMode,
    scene, selectedWidget, commit, selectWidget, changeWidget, undo, redo,
    saveDemo, registerCleanup, storageKey: STORAGE_KEY,
  }
}
