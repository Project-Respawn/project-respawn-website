export function useLayers({ scene, commit, selectWidget }) {
  function normalizeLayers() {
    ;[...scene.value.widgets]
      .sort((a, b) => a.zIndex - b.zIndex)
      .forEach((widget, index) => { widget.zIndex = index + 1 })
  }

  function layerAction(action, id) {
    const widget = scene.value.widgets.find(item => item.id === id)
    if (!widget) return
    const max = Math.max(1, ...scene.value.widgets.map(item => item.zIndex))
    if (action === 'visibility') widget.enabled = !widget.enabled
    if (action === 'lock') widget.locked = !widget.locked
    if (action === 'forward') widget.zIndex = Math.min(max, widget.zIndex + 1)
    if (action === 'backward') widget.zIndex = Math.max(1, widget.zIndex - 1)
    if (action === 'front') widget.zIndex = max + 1
    if (action === 'back') widget.zIndex = 0
    normalizeLayers()
    selectWidget(id)
    commit('Layer updated')
  }

  return { layerAction }
}
