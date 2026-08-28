import { createDefaultChatSettings } from './chat.defaults.js'

export const CHAT_SCHEMA_VERSION = 2
export const CHAT_SOURCE_IDS = Object.freeze(['twitch', 'youtube', 'tiktok', 'discord', 'kick'])

function merge(target, source) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return target
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      target[key] = merge(target[key] && typeof target[key] === 'object' ? target[key] : {}, value)
    } else if (value !== undefined) target[key] = value
  }
  return target
}

export function normalizeCreatorChatConfig(input = {}) {
  const raw = input && typeof input === 'object' && !Array.isArray(input) ? input : {}
  const settings = merge(createDefaultChatSettings(), raw)
  if (Array.isArray(raw.platforms) && !raw.sources) {
    const enabled = new Set(raw.platforms.map((value) => String(value).toLowerCase()))
    for (const id of CHAT_SOURCE_IDS) settings.sources[id].enabled = enabled.has(id)
  }
  if (raw.maxMessages !== undefined && raw.content?.maximumVisibleMessages === undefined) {
    settings.content.maximumVisibleMessages = raw.maxMessages
  }
  return {
    schemaVersion: CHAT_SCHEMA_VERSION,
    enabled: raw.enabled !== false,
    ...settings,
    blockedTerms: Array.isArray(raw.blockedTerms) ? [...raw.blockedTerms] : [],
  }
}

export function creatorChatSettings(config) {
  const normalized = normalizeCreatorChatConfig(config)
  return Object.fromEntries(['sources', 'content', 'appearance', 'behaviour', 'layout', 'typography'].map((key) => [key, structuredClone(normalized[key])]))
}

export function toCanonicalChatConfig(settings, previous = {}) {
  const candidate = { ...previous, ...structuredClone(settings), schemaVersion: CHAT_SCHEMA_VERSION }
  validateCreatorChatConfig(candidate)
  return normalizeCreatorChatConfig(candidate)
}

export function validateCreatorChatConfig(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Chat settings are invalid')
  const normalized = normalizeCreatorChatConfig(value)
  const sections = ['sources', 'content', 'appearance', 'behaviour', 'layout', 'typography']
  if (sections.some((section) => !value[section] || typeof value[section] !== 'object' || Array.isArray(value[section]))) throw new Error('Chat settings are incomplete')
  if (Object.keys(value.sources).some((id) => !CHAT_SOURCE_IDS.includes(id))) throw new Error('Chat settings contain an unknown source')
  const fail = () => { throw new Error('Chat settings contain an unsupported value') }
  const boolean = (candidate) => { if (typeof candidate !== 'boolean') fail() }
  const number = (candidate, min, max, integer = false) => { if (typeof candidate !== 'number' || !Number.isFinite(candidate) || candidate < min || candidate > max || (integer && !Number.isInteger(candidate))) fail() }
  const option = (candidate, allowed) => { if (!allowed.includes(candidate)) fail() }
  const colour = (candidate) => { if (typeof candidate !== 'string' || !/^#[0-9a-f]{6}$/i.test(candidate)) fail() }
  const font = (candidate) => { if (typeof candidate !== 'string' || !/^[\p{L}\p{N} _-]{1,60}$/u.test(candidate)) fail() }
  for (const id of CHAT_SOURCE_IDS) boolean(value.sources[id]?.enabled)
  for (const key of ['showUsername', 'showBadges', 'showTimestamps', 'showPlatformIndicator', 'showEmotes', 'hideCommandMessages', 'hideBotMessages', 'highlightMentions']) boolean(value.content[key])
  number(value.content.maximumVisibleMessages, 1, 100, true); number(value.content.messageDisplayDuration, 1, 300)
  const container = value.appearance.container || {}, message = value.appearance.message || {}
  option(container.backgroundType, ['none', 'solid', 'glass']); colour(container.backgroundColor); number(container.opacity, 0, 1); number(container.blur, 0, 50); boolean(container.borderEnabled); colour(container.borderColor); number(container.borderRadius, 0, 100); number(container.padding, 0, 80)
  option(message.backgroundType, ['none', 'solid', 'glass']); colour(message.backgroundColor); number(message.opacity, 0, 1); number(message.borderRadius, 0, 100); number(message.verticalPadding, 0, 40); number(message.horizontalPadding, 0, 60)
  const behaviour = value.behaviour
  option(behaviour.messageDirection, ['top-to-bottom', 'bottom-to-top']); number(behaviour.messageSpacing, 0, 40); option(behaviour.messageAnimation, ['none', 'fade', 'slide']); option(behaviour.animationSpeed, ['slow', 'normal', 'fast']); number(behaviour.fadeDuration, 0, 10); number(behaviour.messageLifetime, 1, 600); boolean(behaviour.autoScroll); boolean(behaviour.pauseOnHover); boolean(behaviour.smoothScrolling)
  const layout = value.layout
  option(layout.alignment, ['left', 'center', 'right']); option(layout.width, ['compact', 'medium', 'full']); option(layout.avatarBadgePosition, ['left', 'right']); option(layout.timestampPosition, ['left', 'right']); boolean(layout.showMessageSeparators); option(layout.separatorStyle, ['solid', 'dashed', 'dotted']); colour(layout.separatorColor)
  const typography = value.typography
  font(typography.usernameFont); number(typography.usernameWeight, 100, 900, true); if (typography.usernameWeight % 100) fail(); number(typography.usernameSize, 8, 72); colour(typography.usernameColor); font(typography.messageFont); number(typography.messageWeight, 100, 900, true); if (typography.messageWeight % 100) fail(); number(typography.messageSize, 8, 72); colour(typography.messageColor); colour(typography.timestampColor); colour(typography.systemMessageColor); colour(typography.linkColor); boolean(typography.textShadow)
  if (!Array.isArray(value.blockedTerms) || value.blockedTerms.length > 100 || value.blockedTerms.some((term) => typeof term !== 'string' || !term.trim() || term.length > 80)) fail()
  const comparable = structuredClone(value)
  delete comparable.maxMessages
  delete comparable.platforms
  if (JSON.stringify(comparable) !== JSON.stringify(normalized)) throw new Error('Chat settings contain an unsupported value')
  return normalized
}
