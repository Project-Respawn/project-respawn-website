import { OVERLAY_SCHEMA_VERSION, OVERLAY_STORAGE_KEY } from './overlayModel.js'
import { cloneSerializableData } from './overlaySnapshots.js'

export function loadOverlayState(storage, fallback) {
  const raw = storage?.getItem(OVERLAY_STORAGE_KEY)
  if (!raw) return { state: cloneSerializableData(fallback), recovered: false }
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.schemaVersion !== OVERLAY_SCHEMA_VERSION || !Array.isArray(parsed.overlays)) throw new Error('Unsupported state')
    return { state: parsed, recovered: false }
  } catch {
    return { state: cloneSerializableData(fallback), recovered: true }
  }
}

export function saveOverlayState(storage, state) {
  const safe = cloneSerializableData(state)
  for (const overlay of safe.overlays || []) {
    if (overlay.preview) delete overlay.preview.customImageUrl
  }
  storage?.setItem(OVERLAY_STORAGE_KEY, JSON.stringify(safe))
  return safe
}
