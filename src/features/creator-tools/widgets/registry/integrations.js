export const widgetIntegrations = Object.freeze([
  { id: 'twitch', label: 'Twitch' },
  { id: 'discord', label: 'Discord' },
  { id: 'respawn', label: 'Project Respawn' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'kick', label: 'Kick' },
])

export const widgetIntegrationRegistry = Object.freeze(Object.fromEntries(widgetIntegrations.map(item => [item.id, item])))
export function getWidgetIntegration(id) { return widgetIntegrationRegistry[id] || null }
