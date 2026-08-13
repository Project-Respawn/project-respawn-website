import TextWidget from '../widgets/TextWidget.vue'
import ImageWidget from '../widgets/ImageWidget.vue'
import ChatWidget from '../widgets/ChatWidget.vue'
import AlertsWidget from '../widgets/AlertsWidget.vue'
import TtsWidget from '../widgets/TtsWidget.vue'
import ProgressWidget from '../widgets/ProgressWidget.vue'
import MissionWidget from '../widgets/MissionWidget.vue'
import SponsorWidget from '../widgets/SponsorWidget.vue'
import AchievementWidget from '../widgets/AchievementWidget.vue'
import UpcomingEventWidget from '../widgets/UpcomingEventWidget.vue'
import { createId } from './overlayModel.js'

const commonStyle = [
  { key: 'opacity', label: 'Opacity', type: 'range', min: 0.1, max: 1, step: 0.05 },
  { key: 'background', label: 'Background', type: 'color' },
  { key: 'cornerRadius', label: 'Corner radius', type: 'number', min: 0, max: 100 },
]
const textStyle = [
  { key: 'fontSize', label: 'Text size', type: 'number', min: 10, max: 160 },
  { key: 'textAlign', label: 'Text alignment', type: 'select', options: ['left', 'center', 'right'] },
]

const definitions = [
  { type: 'text', displayName: 'Text', category: 'General', icon: 'T', component: TextWidget, size: [620, 150], defaults: { text: 'Your stream. Your community.', fontSize: 52, textAlign: 'center', color: '#ffffff', background: '#111827', opacity: 1, cornerRadius: 18 }, settings: [{ key: 'text', label: 'Text', type: 'textarea' }, { key: 'color', label: 'Text color', type: 'color' }, ...textStyle, ...commonStyle] },
  { type: 'image', displayName: 'Image', category: 'General', icon: '▧', component: ImageWidget, size: [400, 240], defaults: { imageUrl: '', alt: 'Overlay image', fit: 'contain', background: '#111827', opacity: 1, cornerRadius: 16 }, settings: [{ key: 'imageUrl', label: 'Image URL', type: 'text' }, { key: 'alt', label: 'Accessible description', type: 'text' }, { key: 'fit', label: 'Image fit', type: 'select', options: ['contain', 'cover'] }, ...commonStyle] },
  { type: 'twitch-chat', displayName: 'Twitch Chat', category: 'Twitch', icon: '◫', component: ChatWidget, topics: ['chat.message'], size: [430, 620], defaults: { showUsername: true, showBadges: true, showEmotes: true, maxMessages: 6, messageDuration: 12, direction: 'up', fontSize: 24, backgroundOpacity: 0.72, hideBotMessages: true, hideCommands: true, animation: 'slide', opacity: 1, background: '#111827', cornerRadius: 20 }, settings: [{ key: 'showUsername', label: 'Show usernames', type: 'checkbox' }, { key: 'showBadges', label: 'Show badges', type: 'checkbox' }, { key: 'showEmotes', label: 'Demo emotes', type: 'checkbox' }, { key: 'maxMessages', label: 'Maximum messages', type: 'number', min: 1, max: 20 }, { key: 'messageDuration', label: 'Message duration (seconds)', type: 'number', min: 2, max: 120 }, { key: 'direction', label: 'Chat direction', type: 'select', options: ['up', 'down'] }, { key: 'fontSize', label: 'Text size', type: 'number', min: 12, max: 64 }, { key: 'backgroundOpacity', label: 'Background opacity', type: 'range', min: 0, max: 1, step: 0.05 }, { key: 'hideBotMessages', label: 'Hide bot messages', type: 'checkbox' }, { key: 'hideCommands', label: 'Hide command messages', type: 'checkbox' }, { key: 'animation', label: 'Animation', type: 'select', options: ['fade', 'slide', 'none'] }] },
  { type: 'alerts', displayName: 'Alerts', category: 'Twitch', icon: '⚡', component: AlertsWidget, topics: ['stream.follow', 'stream.subscription', 'stream.cheer', 'stream.raid', 'reward.redeemed'], size: [800, 250], defaults: { enabledEvents: 'follow,subscription,cheer,raid,reward', messageTemplate: '{user} triggered {event}', duration: 6, animation: 'pop', minimumCheer: 100, soundPlaceholder: '', mediaPlaceholder: '', background: '#24143d', opacity: 1, cornerRadius: 24 }, settings: [{ key: 'enabledEvents', label: 'Enabled event types', type: 'text' }, { key: 'messageTemplate', label: 'Message template', type: 'text' }, { key: 'duration', label: 'Duration (seconds)', type: 'number', min: 1, max: 30 }, { key: 'animation', label: 'Animation', type: 'select', options: ['pop', 'fade', 'slide'] }, { key: 'minimumCheer', label: 'Minimum cheer', type: 'number', min: 0, max: 100000 }, { key: 'soundPlaceholder', label: 'Sound placeholder', type: 'text' }, { key: 'mediaPlaceholder', label: 'Media placeholder', type: 'text' }, ...commonStyle] },
  { type: 'tts', displayName: 'Text to Speech', category: 'Twitch', icon: '🔊', component: TtsWidget, topics: ['tts.requested'], size: [700, 230], defaults: { showSpeaker: true, showAvatar: true, showStatus: true, fontSize: 28, background: '#172033', opacity: 1, cornerRadius: 22 }, settings: [{ key: 'showSpeaker', label: 'Show speaker', type: 'checkbox' }, { key: 'showAvatar', label: 'Show avatar placeholder', type: 'checkbox' }, { key: 'showStatus', label: 'Show queue status', type: 'checkbox' }, ...textStyle, ...commonStyle] },
  { type: 'goal', displayName: 'Goal / Progress', category: 'General', icon: '▰', component: ProgressWidget, size: [700, 170], defaults: { title: 'Community Goal', current: 64, target: 100, unit: 'members', barColor: '#8b5cf6', background: '#111827', opacity: 1, cornerRadius: 18 }, settings: [{ key: 'title', label: 'Goal title', type: 'text' }, { key: 'current', label: 'Current value', type: 'number', min: 0, max: 1000000 }, { key: 'target', label: 'Target value', type: 'number', min: 1, max: 1000000 }, { key: 'unit', label: 'Unit', type: 'text' }, { key: 'barColor', label: 'Progress color', type: 'color' }, ...commonStyle] },
  { type: 'mission', displayName: 'Respawn Mission', category: 'Project Respawn', icon: '◆', component: MissionWidget, topics: ['mission.progressed'], size: [490, 260], defaults: { title: 'Community Vanguard', current: 78, target: 100, reward: '750 XP', timeRemaining: '2 days remaining', background: '#152238', opacity: 1, cornerRadius: 24 }, settings: [{ key: 'title', label: 'Mission title', type: 'text' }, { key: 'current', label: 'Progress', type: 'number', min: 0, max: 100000 }, { key: 'target', label: 'Target', type: 'number', min: 1, max: 100000 }, { key: 'reward', label: 'Reward', type: 'text' }, { key: 'timeRemaining', label: 'Time remaining', type: 'text' }, ...commonStyle] },
  { type: 'sponsor', displayName: 'Sponsor / Partner', category: 'Partner', icon: '★', component: SponsorWidget, size: [560, 170], defaults: { partnerName: 'Respawn Partner', campaignTitle: 'Powering the next match', promoCode: 'RESPAWN', url: 'partner.example', message: 'Official community partner', disclosure: 'Sponsored', duration: 30, animation: 'fade', background: '#0f2630', opacity: 1, cornerRadius: 18 }, settings: [{ key: 'partnerName', label: 'Partner name / logo text', type: 'text' }, { key: 'campaignTitle', label: 'Campaign title', type: 'text' }, { key: 'promoCode', label: 'Promo code', type: 'text' }, { key: 'url', label: 'Campaign URL', type: 'text' }, { key: 'message', label: 'Campaign message', type: 'text' }, { key: 'disclosure', label: 'Disclosure text', type: 'text' }, { key: 'duration', label: 'Display duration', type: 'number', min: 1, max: 3600 }, { key: 'animation', label: 'Animation', type: 'select', options: ['fade', 'slide', 'none'] }, ...commonStyle] },
  { type: 'achievement', displayName: 'Achievement', category: 'Project Respawn', icon: '🏆', component: AchievementWidget, topics: ['achievement.unlocked'], size: [560, 210], defaults: { icon: '🏆', title: 'First Victory', memberName: 'AchievementAce', animation: 'pop', background: '#2b1844', opacity: 1, cornerRadius: 22 }, settings: [{ key: 'icon', label: 'Achievement icon', type: 'text' }, { key: 'title', label: 'Achievement title', type: 'text' }, { key: 'memberName', label: 'Member name', type: 'text' }, { key: 'animation', label: 'Unlock animation', type: 'select', options: ['pop', 'fade', 'none'] }, ...commonStyle] },
  { type: 'upcoming-event', displayName: 'Upcoming Event', category: 'Project Respawn', icon: '◷', component: UpcomingEventWidget, topics: ['community.event.upcoming'], size: [620, 230], defaults: { title: 'Friday Game Night', dateTime: 'Friday · 19:30', attendees: 28, countdown: '2d 04h 18m', background: '#14263b', opacity: 1, cornerRadius: 22 }, settings: [{ key: 'title', label: 'Event title', type: 'text' }, { key: 'dateTime', label: 'Date and time', type: 'text' }, { key: 'attendees', label: 'Attendee count', type: 'number', min: 0, max: 100000 }, { key: 'countdown', label: 'Demo countdown', type: 'text' }, ...commonStyle] },
]

export const widgetRegistry = Object.freeze(Object.fromEntries(definitions.map((item) => [item.type, Object.freeze(item)])))
export const widgetDefinitions = Object.freeze(definitions)

export function createWidget(type, overlay, position = {}) {
  const definition = widgetRegistry[type]
  if (!definition) throw new Error(`Unknown widget type: ${type}`)
  const now = new Date().toISOString(); const [width, height] = definition.size
  const maxZ = Math.max(0, ...(overlay?.widgets || []).map((item) => item.zIndex || 0))
  return { schemaVersion: 1, id: createId('widget'), type, name: definition.displayName, enabled: true, locked: false, frame: { x: position.x ?? 80, y: position.y ?? 80, width, height, rotation: 0 }, zIndex: maxZ + 1, settings: structuredClone(definition.defaults), dataSource: { provider: definition.category === 'Project Respawn' ? 'respawn-demo' : type === 'twitch-chat' || ['alerts', 'tts'].includes(type) ? 'twitch-demo' : 'local-demo', topics: [...(definition.topics || [])] }, animations: { entrance: definition.defaults.animation || 'fade', exit: 'fade', durationMs: Number(definition.defaults.duration || 6) * 1000 }, createdAt: now, updatedAt: now }
}

export function validateRegistry() {
  const errors = []
  const types = new Set()
  for (const definition of definitions) {
    if (types.has(definition.type)) errors.push(`Duplicate type ${definition.type}`)
    types.add(definition.type)
    if (!definition.component || !definition.displayName || !definition.category || !Array.isArray(definition.settings)) errors.push(`Incomplete definition ${definition.type}`)
  }
  return errors
}
