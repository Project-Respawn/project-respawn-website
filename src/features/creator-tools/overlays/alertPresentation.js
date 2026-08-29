export const ALERT_KINDS = Object.freeze(['follow', 'subscription', 'raid', 'cheer', 'redemption'])
export const ALERT_ANIMATIONS = Object.freeze(['none', 'fade', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'scale'])

export const EVENT_KIND = Object.freeze({
  'stream.follow': 'follow', 'stream.subscription': 'subscription', 'stream.raid': 'raid',
  'stream.cheer': 'cheer', 'reward.redeemed': 'redemption',
})

const safeUrl = (value) => {
  if (!value) return ''
  try { const url = new URL(String(value)); return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : '' } catch { return '' }
}
const bounded = (value, fallback, max) => typeof value === 'string' ? value.slice(0, max) : fallback
const number = (value, fallback, min, max) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback

// Server defaults are authoritative. These values are renderer-safe fallbacks only for malformed/unavailable responses.
export function normalizeAlertConfiguration(value = {}) {
  return {
    enabled: typeof value.enabled === 'boolean' ? value.enabled : false,
    titleTemplate: bounded(value.titleTemplate ?? value.template, '', 240),
    messageTemplate: bounded(value.messageTemplate, '', 500),
    mediaUrl: safeUrl(value.mediaUrl), soundUrl: safeUrl(value.soundUrl),
    volume: number(value.volume, 0, 0, 1), duration: number(value.duration, 6, 1, 60),
    entryAnimation: ALERT_ANIMATIONS.includes(value.entryAnimation) ? value.entryAnimation : 'none',
    exitAnimation: ALERT_ANIMATIONS.includes(value.exitAnimation) ? value.exitAnimation : 'none',
  }
}

export function alertVariables(event = {}) {
  const payload = event.payload || {}, kind = EVENT_KIND[event.topic] || 'event'
  return {
    user: event.actor?.displayName || 'A community member', event: kind,
    viewers: String(payload.viewers ?? 0), bits: String(payload.bits ?? 0),
    reward: String(payload.rewardTitle || payload.reward || 'a reward'),
  }
}

export function interpolateAlertTemplate(template, event) {
  const variables = alertVariables(event)
  return String(template || '').replace(/\{([a-z]+)\}/gi, (match, key) => Object.hasOwn(variables, key) ? variables[key] : match)
}

export function resolveAlertPresentation(event, configuration) {
  const config = normalizeAlertConfiguration(configuration)
  return { config, title: interpolateAlertTemplate(config.titleTemplate, event), message: interpolateAlertTemplate(config.messageTemplate, event) }
}

export function previewEventForKind(kind) {
  const samples = {
    follow: ['stream.follow', 'RespawnTestViewer', {}], subscription: ['stream.subscription', 'RespawnTestSubscriber', { tier: '1' }],
    raid: ['stream.raid', 'RespawnTestRaider', { viewers: 42 }], cheer: ['stream.cheer', 'RespawnTestCheerer', { bits: 100 }],
    redemption: ['reward.redeemed', 'RespawnTestViewer', { reward: 'Test Reward' }],
  }
  const [topic, displayName, payload] = samples[kind] || samples.follow
  return { id: `preview-${kind}`, topic, provider: 'test', occurredAt: new Date(0).toISOString(), actor: { displayName }, payload }
}
