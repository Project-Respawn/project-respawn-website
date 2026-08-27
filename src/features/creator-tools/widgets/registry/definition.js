export const commonStyleSettings = Object.freeze([
  { key: 'opacity', label: 'Opacity', type: 'range', min: 0.1, max: 1, step: 0.05 },
  { key: 'background', label: 'Background', type: 'color' },
  { key: 'cornerRadius', label: 'Corner radius', type: 'number', min: 0, max: 100 },
])

export const textStyleSettings = Object.freeze([
  { key: 'fontSize', label: 'Text size', type: 'number', min: 10, max: 160 },
  { key: 'textAlign', label: 'Text alignment', type: 'select', options: ['left', 'center', 'right'] },
])

const defaultCapabilities = Object.freeze({ draggable: true, resizable: true, supportsThemes: true, supportsAnimations: true })
const defaultRequirements = Object.freeze({ auth: false, integrations: [], backend: false })

export function defineWidget(definition) {
  const defaultSize = Object.freeze({ ...definition.defaultSize })
  const minimumSize = Object.freeze({ width: 80, height: 50, ...definition.minimumSize })
  const defaultSettings = Object.freeze({ ...definition.defaultSettings })
  const categories = Object.freeze([...(definition.categories || [])])
  const integrations = Object.freeze([...(definition.integrations || [])])
  const topics = Object.freeze([...(definition.topics || [])])
  const displayMode = definition.displayMode || (categories.includes('alerts') || definition.type === 'tts' ? 'triggered' : 'always')
  const capabilities = Object.freeze({ ...defaultCapabilities, ...definition.capabilities })
  const requirements = Object.freeze({ ...defaultRequirements, ...definition.requirements, integrations: Object.freeze([...(definition.requirements?.integrations || [])]) })
  return Object.freeze({
    ...definition, defaultSize, minimumSize, defaultSettings, categories, integrations, topics, displayMode, capabilities, requirements,
    // Compatibility fields consumed by the current editor and persisted demo model.
    category: definition.legacyCategory,
    size: Object.freeze([defaultSize.width, defaultSize.height]),
    defaults: defaultSettings,
    settings: Object.freeze([...(definition.settings || [])]),
  })
}
