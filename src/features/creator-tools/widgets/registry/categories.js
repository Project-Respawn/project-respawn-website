export const widgetCategories = Object.freeze([
  { id: 'chat', label: 'Chat' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'community', label: 'Community' },
  { id: 'goals', label: 'Goals' },
  { id: 'rewards', label: 'Rewards' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'engagement', label: 'Engagement' },
  { id: 'events', label: 'Events' },
  { id: 'tts-audio', label: 'TTS & Audio' },
  { id: 'creator', label: 'Creator' },
  { id: 'game', label: 'Game' },
  { id: 'brand-sponsor', label: 'Brand & Sponsor' },
  { id: 'utility', label: 'Utility' },
])

export const widgetCategoryRegistry = Object.freeze(Object.fromEntries(widgetCategories.map(item => [item.id, item])))
export function getWidgetCategory(id) { return widgetCategoryRegistry[id] || null }
