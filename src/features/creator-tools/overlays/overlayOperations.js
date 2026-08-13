export function renameInState(state, id, name, now = new Date().toISOString()) {
  const overlay = state.overlays.find((item) => item.id === id)
  if (!overlay || !String(name).trim()) return false
  overlay.name = String(name).trim(); overlay.version += 1; overlay.updatedAt = now
  return true
}

export function deleteFromState(state, id) {
  if (state.overlays.length <= 1) return false
  const index = state.overlays.findIndex((item) => item.id === id)
  if (index < 0) return false
  state.overlays.splice(index, 1)
  return true
}

export function duplicateInState(state, id, nextId, now = new Date().toISOString()) {
  const source = state.overlays.find((item) => item.id === id)
  if (!source) return null
  const copy = structuredClone(source)
  copy.id = nextId; copy.name = `${source.name} Copy`
  copy.widgets = copy.widgets.map((widget, index) => ({ ...widget, id: `${widget.id}_copy_${index}` }))
  copy.version = 1; copy.createdAt = copy.updatedAt = now
  state.overlays.push(copy)
  return copy
}
