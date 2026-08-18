import { computed } from 'vue'
import { moveFrame } from '../../../overlays/overlayGeometry.js'
import { applySuggestion, generateSuggestions } from '../../../overlays/overlayBuilderSuggestions.js'

export function useWidgetSettings({ project, scene, selectedWidget, commit, selectWidget, changeWidget }) {
  const suggestions = computed(() => generateSuggestions(scene.value, scene.value.preview))

  function moveSelectedChat(action) {
    const widget = selectedWidget.value
    if (widget?.type !== 'twitch-chat' || widget.locked) return
    let frame = widget.frame
    if (action === 'left-edge' || action === 'right-edge') {
      const x = action === 'left-edge' ? 70 : Math.max(0, scene.value.resolution.width - widget.frame.width - 70)
      frame = { ...widget.frame, x }
    } else {
      const delta = {
        x: action === 'left' ? -40 : action === 'right' ? 40 : 0,
        y: action === 'up' ? -40 : action === 'down' ? 40 : 0,
      }
      frame = moveFrame(widget.frame, delta, scene.value.resolution, [], false).frame
    }
    changeWidget({ ...widget, frame }, true)
  }

  function applyLocalSuggestion(item) {
    const index = project.scenes.findIndex(candidate => candidate.id === scene.value.id)
    project.scenes[index] = applySuggestion(scene.value, item)
    selectWidget(item.widgetId || '')
    commit(`${item.actionLabel} applied · Undo is available`)
  }

  function focusSettings() {
    project.selectedWidgetId = scene.value.widgets[0]?.id || ''
    return project.selectedWidgetId ? 'Widget settings ready' : 'Add a widget to configure settings'
  }

  return { suggestions, moveSelectedChat, applyLocalSuggestion, focusSettings }
}
