import { createWidgetEventBus, widgetEventBus } from './widgetEventBus.js'

export const createDemoEventBus = createWidgetEventBus
export const demoEventBus = widgetEventBus
const samples = {
  'chat.message': { provider: 'twitch', actor: { providerUserId: 'demo-chat-1', displayName: 'PixelPilot' }, payload: { text: 'This overlay looks brilliant!', badges: ['sub'], isBot: false } },
  'stream.follow': { provider: 'twitch', actor: { providerUserId: 'demo-follow-1', displayName: 'NovaRespawn' }, payload: {} },
  'stream.subscription': { provider: 'twitch', actor: { providerUserId: 'demo-sub-1', displayName: 'RavenAsh' }, payload: { tier: '1' } },
  'stream.cheer': { provider: 'twitch', actor: { providerUserId: 'demo-cheer-1', displayName: 'BitKnight' }, payload: { bits: 500 } },
  'stream.raid': { provider: 'twitch', actor: { providerUserId: 'demo-raid-1', displayName: 'SquadLeader' }, payload: { viewers: 42 } },
  'tts.requested': { provider: 'twitch', actor: { providerUserId: 'demo-tts-1', displayName: 'VoiceTester' }, payload: { text: 'Welcome to the Project Respawn demo.', status: 'queued' } },
  'mission.progressed': { provider: 'respawn', actor: { providerUserId: 'demo-member-1', displayName: 'Respawn Member' }, payload: { title: 'Community Vanguard', current: 78, target: 100, reward: '750 XP' } },
  'achievement.unlocked': { provider: 'respawn', actor: { providerUserId: 'demo-member-2', displayName: 'AchievementAce' }, payload: { title: 'First Victory', icon: '🏆' } },
  'community.event.upcoming': { provider: 'respawn', actor: null, payload: { title: 'Friday Game Night', startsAt: 'Friday · 19:30', attendees: 28 } },
  'reward.redeemed': { provider: 'respawn', actor: { providerUserId: 'demo-member-3', displayName: 'RewardHunter' }, payload: { reward: 'VIP Game' } },
}

let eventSequence = 0
export function createDemoEvent(topic, overlayId = '') {
  const sample = samples[topic]
  if (!sample) throw new Error(`Unknown demo topic: ${topic}`)
  eventSequence += 1
  return { id: `demo-${topic}-${eventSequence}`, version: 1, topic, overlayId, occurredAt: new Date(1700000000000 + eventSequence * 1000).toISOString(), ...cloneSerializableData(sample) }
}

export const DEMO_EVENT_TOPICS = Object.keys(samples)
import { cloneSerializableData } from './overlaySnapshots.js'
