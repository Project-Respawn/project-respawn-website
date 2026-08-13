import { OVERLAY_SCHEMA_VERSION, OVERLAY_STORAGE_KEY } from './overlayModel.js'

export function loadOverlayState(storage, fallback) {
  try {
    const parsed = JSON.parse(storage?.getItem(OVERLAY_STORAGE_KEY) || 'null')
    if (!parsed || parsed.schemaVersion !== OVERLAY_SCHEMA_VERSION || !Array.isArray(parsed.overlays)) throw new Error('Unsupported state')
    return { state: parsed, recovered: false }
  } catch {
    return { state: structuredClone(fallback), recovered: true }
  }
}

export function saveOverlayState(storage, state) {
  const safe = structuredClone(state)
  for (const overlay of safe.overlays || []) {
    if (overlay.preview) delete overlay.preview.customImageUrl
  }
  storage?.setItem(OVERLAY_STORAGE_KEY, JSON.stringify(safe))
  return safe
}
