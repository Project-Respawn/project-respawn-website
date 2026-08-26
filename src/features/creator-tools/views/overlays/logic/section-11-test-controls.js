import { onMounted } from 'vue'
import { createBuilderProject } from '../../../overlays/overlayBuilderDemoState.js'
import { chatShowcaseTarget, nudgeWidgetFrame } from '../../../overlays/overlayGeometry.js'
import { widgetRegistry } from '../../../widgets/registry/index.js'

export function useTestControls(options) {
  const {
    project, history, scene, selectedWidget, notice, previewMode,
    changeWidget, toggleWidget, replay, undo: coreUndo, redo: coreRedo,
    commit, storageKey, registerCleanup, closeHeaderPanel, activeHeaderPanel,
  } = options
  let chatMoveAnimation = 0
  const reducedMotion = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const quickTests = [
    ['stream.follow', 'alerts', 'Test Follow'],
    ['achievement.unlocked', 'achievement', 'Test Achievement'],
    ['tts.requested', 'tts', 'Test TTS'],
  ].map(([type, targetWidgetType, label]) => ({
    id: `quick-${type}`, type, targetWidgetType, platform: 'demo', actor: 'Demo Creator',
    summary: label, createdAtLabel: 'just now', label, payload: { demo: true },
  }))

  function cancelChatMovement() { cancelAnimationFrame(chatMoveAnimation); chatMoveAnimation = 0 }
  function undo() { cancelChatMovement(); coreUndo() }
  function redo() { cancelChatMovement(); coreRedo() }
  function setProject(key, value) { project[key] = value; commit(`${key} updated`) }

  function demoChatMove() {
    const widget = selectedWidget.value
    if (widget?.type !== 'twitch-chat' || widget.locked) return
    cancelChatMovement()
    const start = { ...widget.frame }
    const target = chatShowcaseTarget(start, scene.value.resolution)
    if (reducedMotion) { changeWidget({ ...widget, frame: target }, true); return }
    const started = performance.now()
    const duration = 520
    function step(now) {
      const current = scene.value.widgets.find(item => item.id === widget.id)
      if (!current) return
      const progress = Math.min(1, (now - started) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const frame = {
        ...start,
        x: Math.round(start.x + (target.x - start.x) * eased),
        y: Math.round(start.y + (target.y - start.y) * eased),
      }
      changeWidget({ ...current, frame }, progress === 1)
      if (progress < 1) chatMoveAnimation = requestAnimationFrame(step)
      else notice.value = 'Demo Chat Move applied · Browser only · Undo is available'
    }
    chatMoveAnimation = requestAnimationFrame(step)
  }

  function resetScene() {
    if (!confirm(`Reset ${scene.value.name} to the deterministic demo layout?`)) return
    const original = createBuilderProject().scenes.find(item => item.id === scene.value.id)
    if (original) {
      project.scenes.splice(project.scenes.findIndex(item => item.id === scene.value.id), 1, original)
      project.selectedWidgetId = ''
      commit('Scene reset · Undo is available')
    }
  }

  function resetAll() {
    if (!confirm('Reset the complete Universal Overlay Builder demo?')) return
    Object.assign(project, createBuilderProject())
    history.commit(project)
    sessionStorage.removeItem(storageKey)
    notice.value = 'Complete demo reset'
  }

  function closeTopLayer() {
    if (activeHeaderPanel.value) closeHeaderPanel()
    else if (previewMode.value) previewMode.value = false
    else project.selectedWidgetId = ''
  }

  function keyboard(event) {
    const target = event.target instanceof Element ? event.target : document.activeElement
    if (target?.closest?.('input, textarea, select, button, a, [contenteditable="true"], [role="textbox"]')) return
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault(); event.shiftKey ? redo() : undo()
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') { event.preventDefault(); redo() }
    const widget = selectedWidget.value
    if (!previewMode.value && widget && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const frame = nudgeWidgetFrame(widget, event.key, event.shiftKey, scene.value.resolution, widgetRegistry[widget.type]?.capabilities?.draggable)
      if (frame) { event.preventDefault(); changeWidget({ ...widget, frame }, true); return }
    }
    if (!previewMode.value && (event.key === 'Delete' || event.key === 'Backspace') && widget) {
      event.preventDefault(); toggleWidget(selectedWidget.value.type, false)
    }
  }

  onMounted(() => window.addEventListener('keydown', keyboard))
  registerCleanup(() => { window.removeEventListener('keydown', keyboard); cancelChatMovement() })
  return { quickTests, setProject, demoChatMove, undo, redo, resetScene, resetAll, closeTopLayer }
}
