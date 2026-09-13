import AlertWidget from './DedicatedAlertWidget.vue'
import { defineWidget, commonStyleSettings } from '../registry/definition.js'
import { ALERT_WIDGETS } from '../../overlays/alertWidgets.js'

export function defineAlertWidget(type, defaultSize = { width: 700, height: 220 }) {
  const alert = ALERT_WIDGETS[type]
  return defineWidget({ type, displayName: alert.name, description: `Brand-configured ${alert.name.toLowerCase()}.`, categories: ['alerts'], integrations: ['twitch'], icon: '★', component: AlertWidget, defaultSize,
    defaultSettings: { background: '#24143d', opacity: 1, cornerRadius: 20 }, topics: [alert.topic], legacyCategory: 'Alerts', settings: commonStyleSettings })
}
