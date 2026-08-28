import { createHash, randomBytes, randomUUID } from 'node:crypto';

export const OVERLAY_EVENT_TYPES = new Set([
  'chat.message', 'stream.follow', 'stream.subscription', 'stream.raid',
  'stream.cheer', 'reward.redeemed', 'tts.requested',
]);

const forbiddenSnapshotKey = /token|secret|credential|oauth|authorization|runtimelease|accesskey|privatekey|password/i;
const triggeredWidgetTypes = new Set(['alerts', 'subscription-alert', 'raid-alert', 'tts']);
const twitchBehaviorKeys: Record<string, string[]> = { alerts: ['enabledEvents', 'messageTemplate', 'duration', 'minimumCheer', 'soundPlaceholder', 'mediaPlaceholder'], 'subscription-alert': ['title'], 'raid-alert': ['title'], tts: ['duration'], 'twitch-chat': ['platforms', 'maxMessages', 'hideBotMessages', 'hideCommands'] };
const alertKinds = ['follow', 'subscription', 'raid', 'cheer', 'redemption'] as const;

export const DEFAULT_TWITCH_OVERLAY_CONFIG = Object.freeze({
  alerts: Object.freeze(Object.fromEntries(alertKinds.map((kind) => [kind, Object.freeze({ enabled: kind !== 'cheer' && kind !== 'redemption', duration: kind === 'follow' ? 6 : 8, template: defaultAlertTemplate(kind), soundUrl: '', volume: 0.8 })]))),
  tts: Object.freeze({ enabled: true, voice: '', volume: 1, rate: 1, pitch: 1, maxLength: 200 }),
  chat: Object.freeze({ enabled: true, maxMessages: 6, platforms: Object.freeze(['Twitch']), blockedTerms: Object.freeze([]) }),
});

function defaultAlertTemplate(kind: string) {
  if (kind === 'follow') return '{user} followed!';
  if (kind === 'subscription') return '{user} subscribed!';
  if (kind === 'raid') return '{user} brought {viewers} viewers';
  if (kind === 'cheer') return '{user} cheered {bits} bits';
  return '{user} redeemed {reward}';
}

const clamp = (value: unknown, fallback: number, min: number, max: number) => {
  const number = Number(value); return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
};
const cleanText = (value: unknown, fallback = '', max = 240) => typeof value === 'string' ? value.trim().slice(0, max) : fallback;
const cleanHttpsUrl = (value: unknown) => { const text = cleanText(value, '', 500); if (!text) return ''; try { const url = new URL(text); return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : ''; } catch { return ''; } };

export function validateTwitchOverlayConfig(value: unknown) {
  const input = safeObject(value) ? value : {}, inputAlerts = safeObject(input.alerts) ? input.alerts : {};
  const alerts = Object.fromEntries(alertKinds.map((kind) => {
    const defaults = (DEFAULT_TWITCH_OVERLAY_CONFIG.alerts as any)[kind], raw = safeObject(inputAlerts[kind]) ? inputAlerts[kind] : {};
    return [kind, { enabled: raw.enabled === undefined ? defaults.enabled : raw.enabled === true, duration: clamp(raw.duration, defaults.duration, 1, 60), template: cleanText(raw.template, defaults.template), soundUrl: cleanHttpsUrl(raw.soundUrl), volume: clamp(raw.volume, defaults.volume, 0, 1) }];
  }));
  const rawTts = safeObject(input.tts) ? input.tts : {}, rawChat = safeObject(input.chat) ? input.chat : {};
  return {
    alerts,
    tts: { enabled: rawTts.enabled !== false, voice: cleanText(rawTts.voice, '', 120), volume: clamp(rawTts.volume, 1, 0, 1), rate: clamp(rawTts.rate, 1, 0.5, 2), pitch: clamp(rawTts.pitch, 1, 0, 2), maxLength: Math.round(clamp(rawTts.maxLength, 200, 1, 500)) },
    chat: { enabled: rawChat.enabled !== false, maxMessages: Math.round(clamp(rawChat.maxMessages, 6, 1, 50)), platforms: Array.isArray(rawChat.platforms) ? rawChat.platforms.map((item: unknown) => cleanText(item, '', 30)).filter(Boolean).slice(0, 8) : ['Twitch'], blockedTerms: Array.isArray(rawChat.blockedTerms) ? rawChat.blockedTerms.map((item: unknown) => cleanText(item, '', 80).toLowerCase()).filter(Boolean).slice(0, 100) : [] },
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
  if (!safeObject(value) || value.version !== 1 || !OVERLAY_EVENT_TYPES.has(String(value.type)) || value.source !== 'test') throw new Error('Overlay event is invalid');
  if (!Number.isFinite(Date.parse(String(value.timestamp))) || !safeObject(value.data)) throw new Error('Overlay event is invalid');
  return { version: 1, id: String(value.id || randomUUID()), type: String(value.type), timestamp: String(value.timestamp), source: 'test', data: { actor: safeObject(value.data.actor) ? value.data.actor : null, payload: safeObject(value.data.payload) ? value.data.payload : {} } };
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

export function updatePublicationRecord(publication: any, sceneId: string, sceneSnapshot: unknown, now: Date) {
  if (!publicationIsActive(publication, now.getTime())) throw new Error('Overlay publication is not active');
  const snapshot = validateSceneSnapshot(sceneSnapshot);
  return { ...publication, sceneId: String(sceneId || snapshot.id || ''), sceneSnapshot: snapshot, revision: Number(publication.revision || 0) + 1, updatedAt: now.toISOString() };
}

export function rotatePublicationCredential(publication: any, credentialHash: string, now: Date) {
  if (!publicationIsActive(publication, now.getTime())) throw new Error('Overlay publication is not active');
  if (!/^[a-f0-9]{64}$/.test(credentialHash)) throw new Error('Overlay credential hash is invalid');
  return { ...publication, credentialHash, credentialRotatedAt: now.toISOString(), updatedAt: now.toISOString() };
}

export function createConnectionRecord(connectionId: string, publicationId: string, now = Date.now()) {
  return { connectionId, publicationId, connectedAt: new Date(now).toISOString(), expiresAtEpoch: Math.floor(now / 1000) + 86400 };
}

export async function fanOutOverlayEvent(connections: any[], event: any, send: (connectionId: string, event: any) => Promise<void>, remove: (connectionId: string) => Promise<void>) {
  let delivered = 0;
  await Promise.all(connections.map(async (connection) => {
    if (Number(connection.expiresAtEpoch || 0) <= Math.floor(Date.now() / 1000)) { await remove(connection.connectionId); return; }
    try { await send(connection.connectionId, event); delivered += 1; }
    catch (error: any) { if (error?.name === 'GoneException' || error?.$metadata?.httpStatusCode === 410) await remove(connection.connectionId); else throw error; }
  }));
  return delivered;
}
