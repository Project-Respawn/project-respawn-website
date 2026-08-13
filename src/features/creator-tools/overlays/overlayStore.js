import { reactive } from 'vue'
import { createOverlay, createSeedOverlays, OVERLAY_SCHEMA_VERSION } from './overlayModel.js'
import { createWidget } from './widgetRegistry.js'
import { loadOverlayState, saveOverlayState } from './overlayPersistence.js'
import { deleteFromState, duplicateInState, renameInState } from './overlayOperations.js'

const fallback = { schemaVersion: OVERLAY_SCHEMA_VERSION, overlays: createSeedOverlays(createWidget) }
const loaded = typeof window === 'undefined' ? { state: fallback, recovered: false } : loadOverlayState(window.localStorage, fallback)
export const overlayState = reactive({ ...loaded.state, recoveredStorage: loaded.recovered, saveLabel: loaded.recovered ? 'Local demo restored' : 'Saved in this browser' })

function persist() {
  if (typeof window !== 'undefined') saveOverlayState(window.localStorage, overlayState)
  overlayState.saveLabel = 'Saved in this browser'
}

export function getOverlay(id) { return overlayState.overlays.find((overlay) => overlay.id === id) }
export function addOverlay(name = 'Untitled Overlay') { const overlay = createOverlay({ name }); overlayState.overlays.push(overlay); persist(); return overlay }
export function updateOverlay(next) { const index = overlayState.overlays.findIndex((item) => item.id === next.id); if (index < 0) return false; overlayState.overlays[index] = { ...structuredClone(next), version: Number(next.version || 0) + 1, updatedAt: new Date().toISOString() }; persist(); return true }
export function renameOverlay(id, name) { const changed = renameInState(overlayState, id, name); if (changed) persist(); return changed }
export function duplicateOverlay(id) { const copy = duplicateInState(overlayState, id, createOverlay().id); if (copy) persist(); return copy }
export function deleteOverlay(id) { const changed = deleteFromState(overlayState, id); if (changed) persist(); return changed }
