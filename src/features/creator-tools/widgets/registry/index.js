import { cloneSerializableData } from '../../overlays/overlaySnapshots.js'
import { createId } from '../../overlays/overlayModel.js'
import { widgetCategoryRegistry } from './categories.js'
import { widgetIntegrationRegistry } from './integrations.js'
import text from '../utility/text/widget.js'
import image from '../utility/image/widget.js'
import twitchChat from '../chat/twitch-chat/widget.js'
import alerts from '../alerts/alerts/widget.js'
import tts from '../tts-audio/tts/widget.js'
import goal from '../goals/goal/widget.js'
import mission from '../engagement/mission/widget.js'
import sponsor from '../brand-sponsor/sponsor/widget.js'
import achievement from '../achievements/achievement/widget.js'
import upcomingEvent from '../events/upcoming-event/widget.js'
import subscriptionAlert from '../alerts/subscription-alert/widget.js'
import raidAlert from '../alerts/raid-alert/widget.js'
import webcamFrame from '../creator/webcam-frame/widget.js'
import creatorInfo from '../creator/creator-info/widget.js'
import supporterGoal from '../goals/supporter-goal/widget.js'
import recentActivity from '../community/recent-activity/widget.js'
import viewerCount from '../utility/viewer-count/widget.js'
import streamTimer from '../utility/stream-timer/widget.js'

export const widgetDefinitions = Object.freeze([
  text, image, twitchChat, alerts, tts, goal, mission, sponsor, achievement, upcomingEvent,
  subscriptionAlert, raidAlert, webcamFrame, creatorInfo, supporterGoal, recentActivity, viewerCount, streamTimer,
])
export const widgetRegistry = Object.freeze(Object.fromEntries(widgetDefinitions.map(item => [item.type, item])))

export function getAllWidgets() { return widgetDefinitions }
export function getWidgetByType(type) { return widgetRegistry[type] || null }
export function getWidgetsByCategory(category) { return widgetDefinitions.filter(item => item.categories.includes(category)) }
export function getWidgetsByIntegration(integration) { return widgetDefinitions.filter(item => item.integrations.includes(integration)) }

export function createWidget(type, overlay, position = {}) {
  const definition = getWidgetByType(type)
  if (!definition) throw new Error(`Unknown widget type: ${type}`)
  const now = new Date().toISOString()
  const maxZ = Math.max(0, ...(overlay?.widgets || []).map(item => item.zIndex || 0))
  return {
    schemaVersion: 1, id: createId('widget'), type, name: definition.displayName, enabled: true, hidden: false, locked: false, displayMode: definition.displayMode,
    frame: { x: position.x ?? 80, y: position.y ?? 80, width: definition.defaultSize.width, height: definition.defaultSize.height, rotation: 0 },
    zIndex: maxZ + 1, settings: cloneSerializableData(definition.defaultSettings),
    dataSource: { provider: definition.category === 'Project Respawn' ? 'respawn-demo' : type === 'twitch-chat' || ['alerts', 'tts'].includes(type) ? 'twitch-demo' : 'local-demo', topics: [...definition.topics] },
    animations: { entrance: definition.defaultSettings.animation || 'fade', exit: 'fade', durationMs: Number(definition.defaultSettings.duration || 6) * 1000 },
    createdAt: now, updatedAt: now,
  }
}

export function validateRegistry() {
  const errors = []
  const types = new Set()
  for (const definition of widgetDefinitions) {
    if (types.has(definition.type)) errors.push(`Duplicate type ${definition.type}`)
    types.add(definition.type)
    if (!definition.component || !definition.displayName || !definition.description || !Array.isArray(definition.settings)) errors.push(`Incomplete definition ${definition.type}`)
    for (const category of definition.categories) if (!widgetCategoryRegistry[category]) errors.push(`Unknown category ${category} on ${definition.type}`)
    for (const integration of definition.integrations) if (!widgetIntegrationRegistry[integration]) errors.push(`Unknown integration ${integration} on ${definition.type}`)
  }
  return errors
}

export { widgetCategories, widgetCategoryRegistry, getWidgetCategory } from './categories.js'
export { widgetIntegrations, widgetIntegrationRegistry, getWidgetIntegration } from './integrations.js'
