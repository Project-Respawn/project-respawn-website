export function cloneSerializableData(value, seen = new WeakSet()) {
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return value
  if (typeof value === 'undefined') return undefined
  if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint') return undefined
  if (value instanceof Date) return value.toISOString()
  if (typeof value !== 'object') return undefined
  if (seen.has(value)) throw new TypeError('Overlay snapshots cannot contain circular data')
  seen.add(value)
  if (Array.isArray(value)) {
    const result = value.map((item) => cloneSerializableData(item, seen)).filter((item) => item !== undefined)
    seen.delete(value)
    return result
  }
  const result = {}
  for (const key of Object.keys(value)) {
    const cloned = cloneSerializableData(value[key], seen)
    if (cloned !== undefined) result[key] = cloned
  }
  seen.delete(value)
  return result
}

export function createWidgetSnapshot(widget) {
  return {
    schemaVersion: widget.schemaVersion,
    id: widget.id,
    type: widget.type,
    name: widget.name,
    enabled: Boolean(widget.enabled),
    hidden: Boolean(widget.hidden),
    locked: Boolean(widget.locked),
    ...(widget.displayMode ? { displayMode: widget.displayMode } : {}),
    frame: cloneSerializableData(widget.frame),
    zIndex: Number(widget.zIndex),
    settings: cloneSerializableData(widget.settings),
    themeId: widget.themeId,
    dataSource: cloneSerializableData(widget.dataSource),
    animations: cloneSerializableData(widget.animations),
    createdAt: widget.createdAt,
    updatedAt: widget.updatedAt,
  }
}

export function createSceneSnapshot(scene) {
  return {
    schemaVersion: scene.schemaVersion,
    id: scene.id,
    brandId: scene.brandId,
    ownerContext: scene.ownerContext,
    name: scene.name,
    description: scene.description,
    resolution: cloneSerializableData(scene.resolution),
    runtime: cloneSerializableData(scene.runtime),
    version: scene.version,
    createdAt: scene.createdAt,
    updatedAt: scene.updatedAt,
    required: Boolean(scene.required),
    isDefault: Boolean(scene.isDefault),
    themeId: scene.themeId,
    preview: cloneSerializableData(scene.preview),
    widgets: (scene.widgets || []).map(createWidgetSnapshot),
  }
}

export function createOverlaySnapshot(editorState) {
  return {
    schemaVersion: editorState.schemaVersion,
    name: editorState.name,
    themeId: editorState.themeId,
    selectedSceneId: editorState.selectedSceneId,
    selectedWidgetId: editorState.selectedWidgetId,
    grid: Boolean(editorState.grid),
    snapping: Boolean(editorState.snapping),
    safeZone: Boolean(editorState.safeZone),
    animationsPaused: Boolean(editorState.animationsPaused),
    publishReady: Boolean(editorState.publishReady),
    scenes: (editorState.scenes || []).map(createSceneSnapshot),
    obsMappings: cloneSerializableData(editorState.obsMappings || []),
  }
}
