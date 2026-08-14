export const OVERLAY_SCHEMA_VERSION = 1
export const OVERLAY_STORAGE_KEY = 'project-respawn.overlay-demo.v1'

export const RESOLUTION_PRESETS = Object.freeze({
  '720p': { width: 1280, height: 720, label: '720p' },
  '1080p': { width: 1920, height: 1080, label: '1080p' },
  '1440p': { width: 2560, height: 1440, label: '1440p' },
  '4k': { width: 3840, height: 2160, label: '4K' },
})

let sequence = 0
export function createId(prefix = 'item') {
  sequence += 1
  return `${prefix}_${Date.now().toString(36)}_${sequence.toString(36)}`
}

export function createOverlay({ name = 'Untitled Overlay', preset = '1080p', now = new Date().toISOString() } = {}) {
  const resolution = RESOLUTION_PRESETS[preset] || RESOLUTION_PRESETS['1080p']
  return {
    schemaVersion: OVERLAY_SCHEMA_VERSION,
    id: createId('overlay'),
    brandId: 'local-demo-brand',
    ownerContext: 'local-demo',
    name,
    description: '',
    resolution: { ...resolution, preset },
    preview: { backgroundType: 'transparent', color: '#10131f', referenceAssetId: 'arena', guides: [] },
    widgets: [],
    runtime: { status: 'demo', credentialStatus: 'not-provisioned' },
    version: 1,
    createdAt: now,
    updatedAt: now,
  }
}

export function createSeedOverlays(createWidget) {
  const main = createOverlay({ name: 'Main Gameplay' })
  main.widgets = [
    createWidget('twitch-chat', main, { x: 1430, y: 390 }),
    createWidget('alerts', main, { x: 560, y: 70 }),
    createWidget('mission', main, { x: 55, y: 70 }),
    createWidget('sponsor', main, { x: 55, y: 880 }),
  ]
  const chatting = createOverlay({ name: 'Just Chatting' })
  chatting.widgets = [createWidget('text', chatting, { x: 660, y: 70 }), createWidget('goal', chatting, { x: 610, y: 900 })]
  const starting = createOverlay({ name: 'Starting Soon' })
  starting.widgets = [createWidget('text', starting, { x: 610, y: 380 }), createWidget('upcoming-event', starting, { x: 650, y: 570 })]
  return [main, chatting, starting]
}

export function runtimeSafeOverlay(overlay) {
  const { preview: _preview, runtime: _runtime, ...safe } = cloneSerializableData(overlay)
  safe.widgets = safe.widgets.map(({ editorState: _editorState, ...widget }) => widget)
  return safe
}
import { cloneSerializableData } from './overlaySnapshots.js'
