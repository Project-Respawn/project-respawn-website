import { createHash, randomBytes, randomUUID } from 'node:crypto';

export const OVERLAY_EVENT_TYPES = new Set([
  'chat.message', 'stream.follow', 'stream.subscription', 'stream.raid',
  'stream.cheer', 'reward.redeemed', 'tts.requested',
]);

const forbiddenSnapshotKey = /token|secret|credential|oauth|authorization|runtimelease|accesskey|privatekey|password/i;

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
    return {
      schemaVersion: Number(widget.schemaVersion || 1), id: String(widget.id), type: String(widget.type), name: String(widget.name || widget.type),
      enabled: true, hidden: false, locked: Boolean(widget.locked), frame, zIndex: Number(widget.zIndex || 0),
      settings: safeObject(widget.settings) ? widget.settings : {}, dataSource: safeObject(widget.dataSource) ? widget.dataSource : {},
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
