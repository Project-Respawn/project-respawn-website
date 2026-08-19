import { createWidget } from '../../../widgets/registry/index.js'

export function useWidgetLibrary({ project, scene, commit, selectWidget }) {
  function toggleWidget(type, enabled) {
    const existing = scene.value.widgets.find(widget => widget.type === type)
    if (enabled && !existing) {
      const widget = createWidget(type, scene.value, {
        x: 100 + scene.value.widgets.length * 24,
        y: 80 + scene.value.widgets.length * 22,
      })
      widget.themeId = project.themeId
      scene.value.widgets.push(widget)
      selectWidget(widget.id)
      commit(`${widget.name} added to ${scene.value.name}`)
    } else if (!enabled && existing && confirm(`Remove ${existing.name} from this demo scene?`)) {
      scene.value.widgets = scene.value.widgets.filter(widget => widget.id !== existing.id)
      if (project.selectedWidgetId === existing.id) project.selectedWidgetId = ''
      commit(`${existing.name} removed from this scene`)
    }
  }

  return { selectWidget, toggleWidget }
}
