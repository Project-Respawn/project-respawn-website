import UniversalDemoWidget from './UniversalDemoWidget.vue'
import { commonStyleSettings, defineWidget } from '../../registry/definition.js'

export function defineUniversalDemoWidget(definition) {
  return defineWidget({ component: UniversalDemoWidget, topics: [], integrations: [], capabilities: {}, requirements: {}, ...definition, settings: [...(definition.settings || []), ...commonStyleSettings] })
}
