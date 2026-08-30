import { createHash, randomBytes, randomUUID } from 'node:crypto';

export const OVERLAY_EVENT_TYPES = new Set([
  'chat.message', 'stream.follow', 'stream.subscription', 'stream.raid',
  'stream.cheer', 'reward.redeemed', 'tts.requested',
]);

const forbiddenSnapshotKey = /token|secret|credential|oauth|authorization|runtimelease|accesskey|privatekey|password/i;
const triggeredWidgetTypes = new Set(['alerts', 'subscription-alert', 'raid-alert', 'tts']);
const twitchBehaviorKeys: Record<string, string[]> = { alerts: ['enabledEvents', 'messageTemplate', 'duration', 'minimumCheer', 'soundPlaceholder', 'mediaPlaceholder'], 'subscription-alert': ['title'], 'raid-alert': ['title'], tts: ['duration'], 'twitch-chat': ['platforms', 'maxMessages', 'hideBotMessages', 'hideCommands', 'showUsername', 'showBadges', 'showEmotes', 'messageDuration', 'direction', 'fontSize', 'backgroundOpacity', 'animation'] };
const alertKinds = ['follow', 'subscription', 'raid', 'cheer', 'redemption'] as const;
export const ALERT_ANIMATIONS = ['none', 'fade', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'scale'] as const;
const chatSourceIds = ['twitch', 'youtube', 'tiktok', 'discord', 'kick'] as const;

const DEFAULT_CHAT_CONFIG = Object.freeze({
  schemaVersion: 2, enabled: true,
  sources: Object.freeze(Object.fromEntries(chatSourceIds.map((id) => [id, Object.freeze({ enabled: id === 'twitch' })]))),
  content: Object.freeze({ showUsername: true, showBadges: true, showTimestamps: true, showPlatformIndicator: true, showEmotes: true, maximumVisibleMessages: 10, messageDisplayDuration: 10, hideCommandMessages: false, hideBotMessages: false, highlightMentions: true }),
  appearance: Object.freeze({ container: Object.freeze({ backgroundType: 'glass', backgroundColor: '#0f172a', opacity: .7, blur: 10, borderEnabled: true, borderColor: '#6d28d9', borderRadius: 12, padding: 16 }), message: Object.freeze({ backgroundType: 'none', backgroundColor: '#111827', opacity: .6, borderRadius: 8, verticalPadding: 6, horizontalPadding: 10 }) }),
  behaviour: Object.freeze({ messageDirection: 'top-to-bottom', messageSpacing: 8, messageAnimation: 'fade', animationSpeed: 'normal', fadeDuration: 1.5, messageLifetime: 15, autoScroll: true, pauseOnHover: true, smoothScrolling: true }),
  layout: Object.freeze({ alignment: 'left', width: 'full', avatarBadgePosition: 'left', timestampPosition: 'left', showMessageSeparators: false, separatorStyle: 'solid', separatorColor: '#334155' }),
  typography: Object.freeze({ usernameFont: 'Inter', usernameWeight: 600, usernameSize: 14, usernameColor: '#a78bfa', messageFont: 'Inter', messageWeight: 400, messageSize: 14, messageColor: '#e2e8f0', timestampColor: '#94a3b8', systemMessageColor: '#f59e0b', linkColor: '#60a5fa', textShadow: false }),
  blockedTerms: Object.freeze([] as string[]),
});

export const DEFAULT_TWITCH_OVERLAY_CONFIG = Object.freeze({
  alerts: Object.freeze(Object.fromEntries(alertKinds.map((kind) => [kind, Object.freeze({
    enabled: kind !== 'cheer' && kind !== 'redemption',
    duration: kind === 'follow' ? 6 : 8,
    titleTemplate: defaultAlertTitle(kind),
    messageTemplate: defaultAlertMessage(kind),
    mediaUrl: '', soundUrl: '', volume: 0.8,
    entryAnimation: 'slide-up', exitAnimation: 'fade',
  })]))),
  tts: Object.freeze({ enabled: true, voice: '', volume: 1, rate: 1, pitch: 1, maxLength: 200 }),
  chat: DEFAULT_CHAT_CONFIG,
});

function defaultAlertTitle(kind: string) {
  if (kind === 'follow') return '{user} followed!';
  if (kind === 'subscription') return '{user} subscribed!';
  if (kind === 'raid') return '{user} brought {viewers} viewers';
  if (kind === 'cheer') return '{user} cheered {bits} bits';
  return '{user} redeemed {reward}';
}

function defaultAlertMessage(kind: string) {
  if (kind === 'follow') return 'Welcome to the community, {user}.';
  if (kind === 'subscription') return 'Thank you for supporting the channel.';
  if (kind === 'raid') return 'Welcome, raiders!';
  if (kind === 'cheer') return 'Thank you for the {bits} bits.';
  return 'Reward: {reward}';
}

const clamp = (value: unknown, fallback: number, min: number, max: number) => {
  const number = Number(value); return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
};
const cleanText = (value: unknown, fallback = '', max = 240) => typeof value === 'string' ? value.trim().slice(0, max) : fallback;
const cleanHttpsUrl = (value: unknown) => { const text = cleanText(value, '', 500); if (!text) return ''; try { const url = new URL(text); return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : ''; } catch { return ''; } };
const bool = (value: unknown, fallback: boolean) => typeof value === 'boolean' ? value : fallback;
const choice = (value: unknown, allowed: readonly string[], fallback: string) => allowed.includes(String(value)) ? String(value) : fallback;
const color = (value: unknown, fallback: string) => /^#[0-9a-f]{6}$/i.test(String(value || '')) ? String(value).toLowerCase() : fallback;
const font = (value: unknown, fallback: string) => /^[\p{L}\p{N} _-]{1,60}$/u.test(String(value || '')) ? String(value) : fallback;

function assertCurrentChatConfig(value: Record<string, any>) {
  if (value.schemaVersion !== 2) return;
  const fail = () => { throw new Error('Chat configuration is invalid'); };
  const object = (candidate: unknown) => { if (!safeObject(candidate)) fail(); return candidate as Record<string, any>; };
  const exactKeys = (candidate: Record<string, any>, allowed: readonly string[]) => {
    if (Object.keys(candidate).some((key) => !allowed.includes(key))) fail();
  };
  const boolean = (candidate: unknown) => { if (typeof candidate !== 'boolean') fail(); };
  const number = (candidate: unknown, min: number, max: number, integer = false) => {
    if (typeof candidate !== 'number' || !Number.isFinite(candidate) || candidate < min || candidate > max || (integer && !Number.isInteger(candidate))) fail();
  };
  const option = (candidate: unknown, allowed: readonly string[]) => { if (typeof candidate !== 'string' || !allowed.includes(candidate)) fail(); };
  const colour = (candidate: unknown) => { if (typeof candidate !== 'string' || !/^#[0-9a-f]{6}$/i.test(candidate)) fail(); };
  const fontName = (candidate: unknown) => { if (typeof candidate !== 'string' || !/^[\p{L}\p{N} _-]{1,60}$/u.test(candidate)) fail(); };

  exactKeys(value, ['schemaVersion', 'enabled', 'sources', 'content', 'appearance', 'behaviour', 'layout', 'typography', 'blockedTerms']);
  boolean(value.enabled);
  const sources = object(value.sources); exactKeys(sources, chatSourceIds);
  for (const id of chatSourceIds) { const source = object(sources[id]); exactKeys(source, ['enabled']); boolean(source.enabled); }
  const content = object(value.content); exactKeys(content, ['showUsername', 'showBadges', 'showTimestamps', 'showPlatformIndicator', 'showEmotes', 'maximumVisibleMessages', 'messageDisplayDuration', 'hideCommandMessages', 'hideBotMessages', 'highlightMentions']);
  for (const key of ['showUsername', 'showBadges', 'showTimestamps', 'showPlatformIndicator', 'showEmotes', 'hideCommandMessages', 'hideBotMessages', 'highlightMentions']) boolean(content[key]);
  number(content.maximumVisibleMessages, 1, 100, true); number(content.messageDisplayDuration, 1, 300);
  const appearance = object(value.appearance); exactKeys(appearance, ['container', 'message']);
  const container = object(appearance.container); exactKeys(container, ['backgroundType', 'backgroundColor', 'opacity', 'blur', 'borderEnabled', 'borderColor', 'borderRadius', 'padding']);
  option(container.backgroundType, ['none', 'solid', 'glass']); colour(container.backgroundColor); number(container.opacity, 0, 1); number(container.blur, 0, 50); boolean(container.borderEnabled); colour(container.borderColor); number(container.borderRadius, 0, 100); number(container.padding, 0, 80);
  const message = object(appearance.message); exactKeys(message, ['backgroundType', 'backgroundColor', 'opacity', 'borderRadius', 'verticalPadding', 'horizontalPadding']);
  option(message.backgroundType, ['none', 'solid', 'glass']); colour(message.backgroundColor); number(message.opacity, 0, 1); number(message.borderRadius, 0, 100); number(message.verticalPadding, 0, 40); number(message.horizontalPadding, 0, 60);
  const behaviour = object(value.behaviour); exactKeys(behaviour, ['messageDirection', 'messageSpacing', 'messageAnimation', 'animationSpeed', 'fadeDuration', 'messageLifetime', 'autoScroll', 'pauseOnHover', 'smoothScrolling']);
  option(behaviour.messageDirection, ['top-to-bottom', 'bottom-to-top']); number(behaviour.messageSpacing, 0, 40); option(behaviour.messageAnimation, ['none', 'fade', 'slide']); option(behaviour.animationSpeed, ['slow', 'normal', 'fast']); number(behaviour.fadeDuration, 0, 10); number(behaviour.messageLifetime, 1, 600); boolean(behaviour.autoScroll); boolean(behaviour.pauseOnHover); boolean(behaviour.smoothScrolling);
  const layout = object(value.layout); exactKeys(layout, ['alignment', 'width', 'avatarBadgePosition', 'timestampPosition', 'showMessageSeparators', 'separatorStyle', 'separatorColor']);
  option(layout.alignment, ['left', 'center', 'right']); option(layout.width, ['compact', 'medium', 'full']); option(layout.avatarBadgePosition, ['left', 'right']); option(layout.timestampPosition, ['left', 'right']); boolean(layout.showMessageSeparators); option(layout.separatorStyle, ['solid', 'dashed', 'dotted']); colour(layout.separatorColor);
  const typography = object(value.typography); exactKeys(typography, ['usernameFont', 'usernameWeight', 'usernameSize', 'usernameColor', 'messageFont', 'messageWeight', 'messageSize', 'messageColor', 'timestampColor', 'systemMessageColor', 'linkColor', 'textShadow']);
  fontName(typography.usernameFont); number(typography.usernameWeight, 100, 900, true); if (typography.usernameWeight % 100) fail(); number(typography.usernameSize, 8, 72); colour(typography.usernameColor); fontName(typography.messageFont); number(typography.messageWeight, 100, 900, true); if (typography.messageWeight % 100) fail(); number(typography.messageSize, 8, 72); colour(typography.messageColor); colour(typography.timestampColor); colour(typography.systemMessageColor); colour(typography.linkColor); boolean(typography.textShadow);
  if (!Array.isArray(value.blockedTerms) || value.blockedTerms.length > 100 || value.blockedTerms.some((term: unknown) => typeof term !== 'string' || !term.trim() || term.length > 80)) fail();
}

export function normalizeChatConfig(value: unknown) {
  const raw = safeObject(value) ? value : {}, d: any = DEFAULT_CHAT_CONFIG;
  const sources = safeObject(raw.sources) ? raw.sources : {};
  const legacyPlatforms = Array.isArray(raw.platforms) ? new Set(raw.platforms.map((item: unknown) => String(item).toLowerCase())) : null;
  const content = safeObject(raw.content) ? raw.content : {}, appearance = safeObject(raw.appearance) ? raw.appearance : {};
  const container = safeObject(appearance.container) ? appearance.container : {}, message = safeObject(appearance.message) ? appearance.message : {};
  const behaviour = safeObject(raw.behaviour) ? raw.behaviour : {}, layout = safeObject(raw.layout) ? raw.layout : {}, typography = safeObject(raw.typography) ? raw.typography : {};
  const normalizedSources = Object.fromEntries(chatSourceIds.map((id) => [id, { enabled: bool(safeObject(sources[id]) ? sources[id].enabled : undefined, legacyPlatforms ? legacyPlatforms.has(id) : d.sources[id].enabled) }]));
  return {
    schemaVersion: 2, enabled: bool(raw.enabled, d.enabled), sources: normalizedSources,
    content: {
      showUsername: bool(content.showUsername, d.content.showUsername), showBadges: bool(content.showBadges, d.content.showBadges), showTimestamps: bool(content.showTimestamps, d.content.showTimestamps), showPlatformIndicator: bool(content.showPlatformIndicator, d.content.showPlatformIndicator), showEmotes: bool(content.showEmotes, d.content.showEmotes),
      maximumVisibleMessages: Math.round(clamp(content.maximumVisibleMessages ?? raw.maxMessages, d.content.maximumVisibleMessages, 1, 100)), messageDisplayDuration: clamp(content.messageDisplayDuration, d.content.messageDisplayDuration, 1, 300), hideCommandMessages: bool(content.hideCommandMessages, d.content.hideCommandMessages), hideBotMessages: bool(content.hideBotMessages, d.content.hideBotMessages), highlightMentions: bool(content.highlightMentions, d.content.highlightMentions),
    },
    appearance: {
      container: { backgroundType: choice(container.backgroundType, ['none', 'solid', 'glass'], d.appearance.container.backgroundType), backgroundColor: color(container.backgroundColor, d.appearance.container.backgroundColor), opacity: clamp(container.opacity, d.appearance.container.opacity, 0, 1), blur: clamp(container.blur, d.appearance.container.blur, 0, 50), borderEnabled: bool(container.borderEnabled, d.appearance.container.borderEnabled), borderColor: color(container.borderColor, d.appearance.container.borderColor), borderRadius: clamp(container.borderRadius, d.appearance.container.borderRadius, 0, 100), padding: clamp(container.padding, d.appearance.container.padding, 0, 80) },
      message: { backgroundType: choice(message.backgroundType, ['none', 'solid', 'glass'], d.appearance.message.backgroundType), backgroundColor: color(message.backgroundColor, d.appearance.message.backgroundColor), opacity: clamp(message.opacity, d.appearance.message.opacity, 0, 1), borderRadius: clamp(message.borderRadius, d.appearance.message.borderRadius, 0, 100), verticalPadding: clamp(message.verticalPadding, d.appearance.message.verticalPadding, 0, 40), horizontalPadding: clamp(message.horizontalPadding, d.appearance.message.horizontalPadding, 0, 60) },
    },
    behaviour: { messageDirection: choice(behaviour.messageDirection, ['top-to-bottom', 'bottom-to-top'], d.behaviour.messageDirection), messageSpacing: clamp(behaviour.messageSpacing, d.behaviour.messageSpacing, 0, 40), messageAnimation: choice(behaviour.messageAnimation, ['none', 'fade', 'slide'], d.behaviour.messageAnimation), animationSpeed: choice(behaviour.animationSpeed, ['slow', 'normal', 'fast'], d.behaviour.animationSpeed), fadeDuration: clamp(behaviour.fadeDuration, d.behaviour.fadeDuration, 0, 10), messageLifetime: clamp(behaviour.messageLifetime, d.behaviour.messageLifetime, 1, 600), autoScroll: bool(behaviour.autoScroll, d.behaviour.autoScroll), pauseOnHover: bool(behaviour.pauseOnHover, d.behaviour.pauseOnHover), smoothScrolling: bool(behaviour.smoothScrolling, d.behaviour.smoothScrolling) },
    layout: { alignment: choice(layout.alignment, ['left', 'center', 'right'], d.layout.alignment), width: choice(layout.width, ['compact', 'medium', 'full'], d.layout.width), avatarBadgePosition: choice(layout.avatarBadgePosition, ['left', 'right'], d.layout.avatarBadgePosition), timestampPosition: choice(layout.timestampPosition, ['left', 'right'], d.layout.timestampPosition), showMessageSeparators: bool(layout.showMessageSeparators, d.layout.showMessageSeparators), separatorStyle: choice(layout.separatorStyle, ['solid', 'dashed', 'dotted'], d.layout.separatorStyle), separatorColor: color(layout.separatorColor, d.layout.separatorColor) },
    typography: { usernameFont: font(typography.usernameFont, d.typography.usernameFont), usernameWeight: Math.round(clamp(typography.usernameWeight, d.typography.usernameWeight, 100, 900) / 100) * 100, usernameSize: clamp(typography.usernameSize, d.typography.usernameSize, 8, 72), usernameColor: color(typography.usernameColor, d.typography.usernameColor), messageFont: font(typography.messageFont, d.typography.messageFont), messageWeight: Math.round(clamp(typography.messageWeight, d.typography.messageWeight, 100, 900) / 100) * 100, messageSize: clamp(typography.messageSize, d.typography.messageSize, 8, 72), messageColor: color(typography.messageColor, d.typography.messageColor), timestampColor: color(typography.timestampColor, d.typography.timestampColor), systemMessageColor: color(typography.systemMessageColor, d.typography.systemMessageColor), linkColor: color(typography.linkColor, d.typography.linkColor), textShadow: bool(typography.textShadow, d.typography.textShadow) },
    blockedTerms: Array.isArray(raw.blockedTerms) ? raw.blockedTerms.map((item: unknown) => cleanText(item, '', 80).toLowerCase()).filter(Boolean).slice(0, 100) : [],
  };
}

export function validateTwitchOverlayConfig(value: unknown) {
  const input = safeObject(value) ? value : {}, inputAlerts = safeObject(input.alerts) ? input.alerts : {};
  const alerts = Object.fromEntries(alertKinds.map((kind) => {
    const defaults = (DEFAULT_TWITCH_OVERLAY_CONFIG.alerts as any)[kind], raw = safeObject(inputAlerts[kind]) ? inputAlerts[kind] : {};
    const reject = (condition: boolean, field: string) => { if (condition) throw new Error(`Alert ${field} is invalid`); };
    reject(raw.enabled !== undefined && typeof raw.enabled !== 'boolean', 'enabled');
    for (const [field, max] of [['titleTemplate', 240], ['messageTemplate', 500]] as const) reject(raw[field] !== undefined && (typeof raw[field] !== 'string' || raw[field].length > max), field);
    for (const field of ['mediaUrl', 'soundUrl'] as const) reject(raw[field] !== undefined && raw[field] !== null && (typeof raw[field] !== 'string' || (raw[field] !== '' && !cleanHttpsUrl(raw[field]))), field);
    reject(raw.volume !== undefined && (typeof raw.volume !== 'number' || !Number.isFinite(raw.volume) || raw.volume < 0 || raw.volume > 1), 'volume');
    reject(raw.duration !== undefined && (typeof raw.duration !== 'number' || !Number.isFinite(raw.duration) || raw.duration < 1 || raw.duration > 60), 'duration');
    for (const field of ['entryAnimation', 'exitAnimation'] as const) reject(raw[field] !== undefined && !ALERT_ANIMATIONS.includes(raw[field]), field);
    const legacyTemplate = typeof raw.template === 'string' && raw.template.length <= 240 ? raw.template : undefined;
    return [kind, {
      enabled: raw.enabled ?? defaults.enabled,
      duration: raw.duration ?? defaults.duration,
      titleTemplate: cleanText(raw.titleTemplate, legacyTemplate ?? defaults.titleTemplate, 240),
      messageTemplate: cleanText(raw.messageTemplate, defaults.messageTemplate, 500),
      mediaUrl: cleanHttpsUrl(raw.mediaUrl), soundUrl: cleanHttpsUrl(raw.soundUrl),
      volume: raw.volume ?? defaults.volume,
      entryAnimation: raw.entryAnimation ?? defaults.entryAnimation,
      exitAnimation: raw.exitAnimation ?? defaults.exitAnimation,
    }];
  }));
  const rawTts = safeObject(input.tts) ? input.tts : {}, rawChat = safeObject(input.chat) ? input.chat : {};
  assertCurrentChatConfig(rawChat);
  return {
    alerts,
    tts: { enabled: rawTts.enabled !== false, voice: cleanText(rawTts.voice, '', 120), volume: clamp(rawTts.volume, 1, 0, 1), rate: clamp(rawTts.rate, 1, 0.5, 2), pitch: clamp(rawTts.pitch, 1, 0, 2), maxLength: Math.round(clamp(rawTts.maxLength, 200, 1, 500)) },
    chat: normalizeChatConfig(rawChat),
  };
}

export function twitchOverlayConfigId(brandId: string) { if (!brandId) throw new Error('Brand is required'); return `TWITCH_CONFIG#${brandId}`; }
export function editableOverlayProjectId(brandId: string) { if (!brandId) throw new Error('Brand is required'); return `EDITOR_PROJECT#${brandId}`; }

export function hashOverlayCredential(credential: string) {
  return createHash('sha256').update(credential).digest('hex');
}

export function issueOverlayCredential() {
  const credential = randomBytes(32).toString('base64url');
  return { credential, credentialHash: hashOverlayCredential(credential) };
}

function safeObject(value: unknown): value is Record<string, any> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function containsForbiddenKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsForbiddenKey);
  if (!safeObject(value)) return false;
  return Object.entries(value).some(([key, child]) => forbiddenSnapshotKey.test(key) || containsForbiddenKey(child));
}

export function validateSceneSnapshot(value: unknown) {
  if (!safeObject(value) || !safeObject(value.resolution) || !Array.isArray(value.widgets)) throw new Error('Scene snapshot is invalid');
  const width = Number(value.resolution.width), height = Number(value.resolution.height);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 320 || height < 180 || width > 7680 || height > 4320) throw new Error('Scene resolution is invalid');
  if (value.widgets.length > 100) throw new Error('Scene snapshot contains unsupported data');
  const widgets = value.widgets.filter((widget: any) => widget?.enabled !== false && widget?.hidden !== true).map((widget: any) => {
    if (!safeObject(widget) || !safeObject(widget.frame) || !widget.id || !widget.type) throw new Error('Scene widget is invalid');
    const frame = { x: Number(widget.frame.x), y: Number(widget.frame.y), width: Number(widget.frame.width), height: Number(widget.frame.height), rotation: Number(widget.frame.rotation || 0) };
    if (Object.values(frame).some((number) => !Number.isFinite(number)) || frame.width <= 0 || frame.height <= 0) throw new Error('Scene widget frame is invalid');
    const settings = safeObject(widget.settings) ? { ...widget.settings } : {}; for (const key of twitchBehaviorKeys[String(widget.type)] || []) delete settings[key];
    return {
      schemaVersion: Number(widget.schemaVersion || 1), id: String(widget.id), type: String(widget.type), name: String(widget.name || widget.type),
      enabled: true, hidden: false, locked: Boolean(widget.locked), frame, zIndex: Number(widget.zIndex || 0),
      displayMode: triggeredWidgetTypes.has(String(widget.type)) || widget.displayMode === 'triggered' ? 'triggered' : 'always',
      settings, dataSource: safeObject(widget.dataSource) ? widget.dataSource : {},
      animations: safeObject(widget.animations) ? widget.animations : {},
      ...(widget.themeId ? { themeId: String(widget.themeId) } : {}),
    };
  });
  const snapshot = {
    schemaVersion: Number(value.schemaVersion || 1), id: String(value.id || ''), name: String(value.name || ''),
    resolution: { width, height }, themeId: String(value.themeId || 'respawn-dark'),
    ...(safeObject(value.theme) ? { theme: value.theme } : {}), widgets,
  };
  if (containsForbiddenKey(snapshot)) throw new Error('Scene snapshot contains unsupported data');
  if (Buffer.byteLength(JSON.stringify(snapshot), 'utf8') > 350_000) throw new Error('Scene snapshot is too large');
  return snapshot;
}

function validateEditableWidget(value: unknown) {
  if (!safeObject(value) || !safeObject(value.frame) || !value.id || !value.type) throw new Error('Editable overlay widget is invalid');
  const frame = { x: Number(value.frame.x), y: Number(value.frame.y), width: Number(value.frame.width), height: Number(value.frame.height), rotation: Number(value.frame.rotation || 0) };
  if (Object.values(frame).some((number) => !Number.isFinite(number)) || frame.width <= 0 || frame.height <= 0) throw new Error('Editable overlay widget frame is invalid');
  const settings = safeObject(value.settings) ? { ...value.settings } : {}; for (const key of twitchBehaviorKeys[String(value.type)] || []) delete settings[key];
  return {
    schemaVersion: Number(value.schemaVersion || 1), id: cleanText(value.id, '', 120), type: cleanText(value.type, '', 80), name: cleanText(value.name, String(value.type), 120),
    enabled: value.enabled !== false, hidden: value.hidden === true, locked: value.locked === true, frame, zIndex: Number(value.zIndex || 0),
    displayMode: value.displayMode === 'triggered' ? 'triggered' : 'always', settings,
    dataSource: safeObject(value.dataSource) ? value.dataSource : {}, animations: safeObject(value.animations) ? value.animations : {},
    ...(value.themeId ? { themeId: cleanText(value.themeId, '', 80) } : {}),
  };
}

export function validateEditableOverlayProject(value: unknown) {
  if (!safeObject(value) || !Array.isArray(value.scenes) || !value.scenes.length || value.scenes.length > 25) throw new Error('Editable overlay project is invalid');
  const scenes = value.scenes.map((scene: any) => {
    if (!safeObject(scene) || !safeObject(scene.resolution) || !Array.isArray(scene.widgets) || scene.widgets.length > 100) throw new Error('Editable overlay scene is invalid');
    const width = Number(scene.resolution.width), height = Number(scene.resolution.height);
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 320 || height < 180 || width > 7680 || height > 4320) throw new Error('Editable overlay scene resolution is invalid');
    return {
      schemaVersion: Number(scene.schemaVersion || 1), id: cleanText(scene.id, '', 120), name: cleanText(scene.name, '', 120), description: cleanText(scene.description, '', 500),
      resolution: { width, height, ...(scene.resolution.label ? { label: cleanText(scene.resolution.label, '', 40) } : {}), ...(scene.resolution.preset ? { preset: cleanText(scene.resolution.preset, '', 40) } : {}) },
      version: Number(scene.version || 1), required: scene.required === true, isDefault: scene.isDefault === true, themeId: cleanText(scene.themeId, 'respawn-purple', 80),
      preview: safeObject(scene.preview) ? scene.preview : {}, widgets: scene.widgets.map(validateEditableWidget),
    };
  });
  const project = {
    schemaVersion: Number(value.schemaVersion || 1), name: cleanText(value.name, 'Creator Overlay', 120), themeId: cleanText(value.themeId, 'respawn-purple', 80),
    selectedSceneId: cleanText(value.selectedSceneId, scenes[0].id, 120), selectedWidgetId: cleanText(value.selectedWidgetId, '', 120),
    grid: value.grid !== false, snapping: value.snapping !== false, safeZone: value.safeZone !== false, animationsPaused: value.animationsPaused === true,
    publishReady: value.publishReady === true, scenes,
  };
  if (containsForbiddenKey(project)) throw new Error('Editable overlay project contains unsupported data');
  const serialized = JSON.stringify(project);
  if (Buffer.byteLength(serialized, 'utf8') > 1_000_000) throw new Error('Editable overlay project is too large');
  return JSON.parse(serialized);
}

export function validateOverlayEvent(value: unknown) {
  if (safeObject(value) && !value.id) value = { ...value, id: randomUUID() };
  return validateTrustedOverlayEvent(value, 'test');
}

export function validateTrustedOverlayEvent(value: unknown, source: 'test' | 'twitch') {
  if (!safeObject(value) || value.version !== 1 || !OVERLAY_EVENT_TYPES.has(String(value.type)) || value.source !== source) throw new Error('Overlay event is invalid');
  if (!String(value.id || '').trim() || !Number.isFinite(Date.parse(String(value.timestamp))) || !safeObject(value.data)) throw new Error('Overlay event is invalid');
  return { version: 1, id: String(value.id), type: String(value.type), timestamp: String(value.timestamp), source, data: { actor: safeObject(value.data.actor) ? value.data.actor : null, payload: safeObject(value.data.payload) ? value.data.payload : {} } };
}

export function assertPublicationOwner(publication: any, userId: string) {
  if (!publication || publication.ownerUserId !== userId) throw new Error('Overlay publication access is denied');
}

export function assertWorkspaceBrandOwner(workspace: any, brand: any, userId: string, workspaceId: string, brandId: string) {
  if (!workspace || workspace.id !== workspaceId || workspace.ownerUserId !== userId) throw new Error('Overlay publication Workspace access is denied');
  if (!brand || brand.id !== brandId || brand.workspaceId !== workspaceId || brand.ownerUserId !== userId) throw new Error('Overlay publication Brand access is denied');
}

export function publicationIsActive(publication: any, now = Date.now()) {
  return Boolean(publication && publication.status !== 'REVOKED' && !publication.revokedAt && (!publication.expiresAt || Date.parse(publication.expiresAt) > now));
}

export function credentialMatches(publication: any, credential: string) {
  return Boolean(publication?.credentialHash && hashOverlayCredential(credential) === publication.credentialHash);
}

export function createPublicationRecord(input: any, ownerUserId: string, credentialHash: string, now: Date, publicationId: string = randomUUID()) {
  const sceneSnapshot = validateSceneSnapshot(input.sceneSnapshot);
  return {
    publicationId, overlayId: String(input.overlayId || ''), sceneId: String(input.sceneId || sceneSnapshot.id || ''),
    workspaceId: String(input.workspaceId), brandId: String(input.brandId), ownerUserId,
    entityType: 'PUBLICATION', revision: 1, status: 'TEST', credentialHash, sceneSnapshot,
    ...(Number.isInteger(input.sourceEditorRevision) && input.sourceEditorRevision >= 0 ? { sourceEditorRevision: input.sourceEditorRevision } : {}),
    createdAt: now.toISOString(), updatedAt: now.toISOString(),
  };
}

export function activePublicationLockId(brandId: string) {
  if (!brandId) throw new Error('Brand is required');
  return `BRAND_ACTIVE#${brandId}`;
}

export function createActivePublicationLock(publication: any) {
  return {
    publicationId: activePublicationLockId(publication.brandId), entityType: 'BRAND_ACTIVE_LOCK',
    workspaceId: publication.workspaceId, brandId: publication.brandId, ownerUserId: publication.ownerUserId,
    activePublicationId: publication.publicationId, createdAt: publication.createdAt, updatedAt: publication.updatedAt,
  };
}

export function updatePublicationRecord(publication: any, sceneId: string, sceneSnapshot: unknown, now: Date, sourceEditorRevision?: number) {
  if (!publicationIsActive(publication, now.getTime())) throw new Error('Overlay publication is not active');
  const snapshot = validateSceneSnapshot(sceneSnapshot);
  return { ...publication, sceneId: String(sceneId || snapshot.id || ''), sceneSnapshot: snapshot, revision: Number(publication.revision || 0) + 1, updatedAt: now.toISOString(), ...(Number.isInteger(sourceEditorRevision) && Number(sourceEditorRevision) >= 0 ? { sourceEditorRevision } : {}) };
}

export function rotatePublicationCredential(publication: any, credentialHash: string, now: Date) {
  if (!publicationIsActive(publication, now.getTime())) throw new Error('Overlay publication is not active');
  if (!/^[a-f0-9]{64}$/.test(credentialHash)) throw new Error('Overlay credential hash is invalid');
  return { ...publication, credentialHash, credentialRotatedAt: now.toISOString(), updatedAt: now.toISOString() };
}

export function createConnectionRecord(connectionId: string, publicationId: string, now = Date.now()) {
  return { connectionId, publicationId, connectedAt: new Date(now).toISOString(), expiresAtEpoch: Math.floor(now / 1000) + 86400 };
}

export async function fanOutOverlayEvent(connections: any[], event: any, send: (connectionId: string, event: any) => Promise<void>, remove: (connectionId: string) => Promise<void>, onFailure: (error: any, connectionId: string) => void = () => undefined) {
  let delivered = 0, staleRemoved = 0, failed = 0;
  const reportFailure = (error: any, connectionId: string) => { failed += 1; try { onFailure(error, connectionId); } catch {} };
  const removeStale = async (connectionId: string) => {
    try { await remove(connectionId); staleRemoved += 1; }
    catch (error) { reportFailure(error, connectionId); }
  };
  await Promise.all(connections.map(async (connection) => {
    if (Number(connection.expiresAtEpoch || 0) <= Math.floor(Date.now() / 1000)) { await removeStale(connection.connectionId); return; }
    try { await send(connection.connectionId, event); delivered += 1; }
    catch (error: any) { if (error?.name === 'GoneException' || error?.$metadata?.httpStatusCode === 410) await removeStale(connection.connectionId); else reportFailure(error, connection.connectionId); }
  }));
  return { delivered, staleRemoved, failed };
}
