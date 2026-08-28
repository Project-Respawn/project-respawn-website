import assert from 'node:assert/strict';
import test from 'node:test';
import {
  activePublicationLockId, assertPublicationOwner, assertWorkspaceBrandOwner, createActivePublicationLock, createConnectionRecord, createPublicationRecord,
  credentialMatches, fanOutOverlayEvent, hashOverlayCredential, publicationIsActive,
  rotatePublicationCredential, updatePublicationRecord, validateOverlayEvent, validateSceneSnapshot,
  editableOverlayProjectId, twitchOverlayConfigId, validateEditableOverlayProject, validateTwitchOverlayConfig,
} from './domain';

const now = new Date('2026-08-26T20:00:00.000Z');
const scene = { id: 'scene-1', name: 'Main Gameplay', resolution: { width: 1920, height: 1080 }, themeId: 'respawn-dark', widgets: [
  { id: 'chat', type: 'twitch-chat', enabled: true, frame: { x: 10, y: 20, width: 400, height: 600 }, zIndex: 2, settings: { maxMessages: 6 }, dataSource: { topics: ['chat.message'] } },
  { id: 'alert', type: 'alerts', enabled: true, displayMode: 'triggered', frame: { x: 500, y: 30, width: 500, height: 200 }, zIndex: 3, settings: {}, dataSource: { topics: ['stream.follow'] } },
] };

test('publication creation persists a complete scene snapshot and only a credential hash', () => {
  const record = createPublicationRecord({ workspaceId: 'workspace-1', brandId: 'brand-1', overlayId: 'overlay-1', sceneId: 'scene-1', sceneSnapshot: scene }, 'owner-1', hashOverlayCredential('opaque-secret'), now, 'publication-1');
  assert.equal(record.revision, 1); assert.equal(record.status, 'TEST'); assert.equal(record.sceneSnapshot.widgets.length, 2);
  assert.equal(record.credentialHash.length, 64); assert.equal(JSON.stringify(record).includes('opaque-secret'), false);
  assert.equal(credentialMatches(record, 'opaque-secret'), true); assert.equal(credentialMatches(record, 'wrong'), false);
});

test('sanitization forces event-driven widgets to neutral triggered mode', () => {
  const snapshot = validateSceneSnapshot({ ...scene, widgets: [
    { ...scene.widgets[1], displayMode: 'always' },
    { ...scene.widgets[1], id: 'tts', type: 'tts', displayMode: 'always' },
  ] });
  assert.deepEqual(snapshot.widgets.map((widget) => widget.displayMode), ['triggered', 'triggered']);
});

test('publication update replaces snapshot and increments revision', () => {
  const record = createPublicationRecord({ workspaceId: 'workspace-1', brandId: 'brand-1', sceneId: 'scene-1', sceneSnapshot: scene }, 'owner-1', 'hash', now, 'publication-1');
  const updated = updatePublicationRecord(record, 'scene-2', { ...scene, id: 'scene-2', widgets: scene.widgets.slice(0, 1) }, new Date(now.getTime() + 1000));
  assert.equal(updated.revision, 2); assert.equal(updated.sceneSnapshot.widgets.length, 1); assert.equal(updated.publicationId, record.publicationId);
  assert.equal(updated.sceneId, 'scene-2'); assert.equal(updated.credentialHash, record.credentialHash);
});

test('one deterministic active lock represents a Brand without changing its opaque publication ID', () => {
  const record = createPublicationRecord({ workspaceId: 'workspace-1', brandId: 'brand-1', sceneId: 'scene-1', sceneSnapshot: scene }, 'owner-1', 'hash', now, 'random-publication');
  const lock = createActivePublicationLock(record);
  assert.equal(activePublicationLockId('brand-1'), 'BRAND_ACTIVE#brand-1');
  assert.equal(lock.publicationId, 'BRAND_ACTIVE#brand-1'); assert.equal(lock.activePublicationId, 'random-publication');
  assert.equal(lock.workspaceId, record.workspaceId); assert.equal(lock.ownerUserId, record.ownerUserId);
});

test('credential rotation changes the hash, accepts only the new credential, and never persists plaintext', () => {
  const record = createPublicationRecord({ workspaceId: 'workspace-1', brandId: 'brand-1', sceneId: 'scene-1', sceneSnapshot: scene }, 'owner-1', hashOverlayCredential('old-credential'), now, 'publication-1');
  const rotated = rotatePublicationCredential(record, hashOverlayCredential('new-credential'), new Date(now.getTime() + 1000));
  assert.notEqual(rotated.credentialHash, record.credentialHash);
  assert.equal(credentialMatches(rotated, 'old-credential'), false);
  assert.equal(credentialMatches(rotated, 'new-credential'), true);
  assert.equal(JSON.stringify(rotated).includes('new-credential'), false);
});

test('snapshot ignores discarded editor runtime metadata while preserving sanitized persisted fields', () => {
  const snapshot = validateSceneSnapshot({
    ...scene,
    runtime: { credentialStatus: 'not-provisioned', callback: () => {} },
    editorState: { selection: 'chat' },
    widgets: [...scene.widgets, { ...scene.widgets[0], id: 'disabled', enabled: false }, { ...scene.widgets[0], id: 'hidden', hidden: true }],
  });
  assert.equal('runtime' in snapshot, false);
  assert.equal('editorState' in snapshot, false);
  assert.equal(snapshot.widgets.length, 2);
  assert.deepEqual(snapshot.widgets[0].frame, { x: 10, y: 20, width: 400, height: 600, rotation: 0 });
  assert.equal(snapshot.widgets[0].type, 'twitch-chat');
  assert.deepEqual(snapshot.widgets[0].settings, {});
  assert.equal(snapshot.widgets[0].displayMode, 'always');
  assert.equal(snapshot.widgets[1].displayMode, 'triggered');
  const findUndefined = (value: any): boolean => value && typeof value === 'object' && Object.values(value).some((child) => child === undefined || findUndefined(child));
  assert.equal(findUndefined(snapshot), false, 'sanitized snapshots must be accepted by DynamoDB document marshalling');
});

test('Brand Twitch configuration is deterministic, renderer-safe, bounded, and independently addressable', () => {
  const config = validateTwitchOverlayConfig({ alerts: { raid: { enabled: false, duration: 90, template: '{user} brought {viewers}', volume: 4 } }, tts: { voice: 'UK Voice', rate: 9, pitch: -2, volume: .4, maxLength: 900 }, chat: { maxMessages: 200, platforms: ['Twitch'], blockedTerms: ['Spam'] } });
  assert.equal(twitchOverlayConfigId('brand-1'), 'TWITCH_CONFIG#brand-1');
  assert.deepEqual(config.alerts.raid, { enabled: false, duration: 60, template: '{user} brought {viewers}', soundUrl: '', volume: 1 });
  assert.deepEqual(config.tts, { enabled: true, voice: 'UK Voice', rate: 2, pitch: 0, volume: .4, maxLength: 500 });
  assert.deepEqual(config.chat, { enabled: true, maxMessages: 50, platforms: ['Twitch'], blockedTerms: ['spam'] });
  assert.equal(JSON.stringify(config).match(/token|secret|credential|oauth/i), null);
});

test('editable projects preserve all scene geometry while discarding runtime state and Twitch behaviour', () => {
  const project = validateEditableOverlayProject({ schemaVersion: 1, name: 'Creator Overlay', selectedSceneId: 'scene-1', selectedWidgetId: 'disabled', scenes: [{
    ...scene, runtime: { credentialStatus: 'not-provisioned' }, preview: { backgroundType: 'reference' },
    widgets: [{ ...scene.widgets[0], id: 'disabled', enabled: false, locked: true, frame: { x: 44, y: 55, width: 400, height: 600 }, settings: { maxMessages: 20, background: '#123456' } }],
  }] });
  assert.equal(editableOverlayProjectId('brand-1'), 'EDITOR_PROJECT#brand-1');
  assert.equal(project.scenes[0].widgets.length, 1); assert.equal(project.scenes[0].widgets[0].enabled, false);
  assert.deepEqual(project.scenes[0].widgets[0].frame, { x: 44, y: 55, width: 400, height: 600, rotation: 0 });
  assert.deepEqual(project.scenes[0].widgets[0].settings, { background: '#123456' });
  assert.equal('runtime' in project.scenes[0], false);
  assert.throws(() => validateEditableOverlayProject({ ...project, scenes: [{ ...project.scenes[0], preview: { accessToken: 'forbidden' } }] }), /unsupported data/);
});

test('future snapshots remove Twitch behaviour while retaining geometry and visual presentation', () => {
  const snapshot = validateSceneSnapshot({ ...scene, widgets: [{ ...scene.widgets[1], settings: { duration: 12, messageTemplate: '{user}', background: '#123456', animation: 'pop' } }] });
  assert.deepEqual(snapshot.widgets[0].settings, { background: '#123456', animation: 'pop' });
  assert.deepEqual(snapshot.widgets[0].frame, { x: 500, y: 30, width: 500, height: 200, rotation: 0 });
});

test('snapshot still rejects secret-shaped keys in every persisted nested boundary', () => {
  assert.throws(() => validateSceneSnapshot({ ...scene, theme: { accessToken: 'forbidden' } }), /unsupported data/);
  assert.throws(() => validateSceneSnapshot({ ...scene, theme: { accessKeyId: 'forbidden' } }), /unsupported data/);
  assert.throws(() => validateSceneSnapshot({ ...scene, widgets: [{ ...scene.widgets[0], settings: { nested: { credential: 'forbidden' } } }] }), /unsupported data/);
  assert.throws(() => validateSceneSnapshot({ ...scene, widgets: [{ ...scene.widgets[0], dataSource: { password: 'forbidden' } }] }), /unsupported data/);
  assert.throws(() => validateSceneSnapshot({ ...scene, widgets: [{ ...scene.widgets[0], animations: { clientSecret: 'forbidden' } }] }), /unsupported data/);
});

test('snapshot enforces widget-count and serialized-size limits after sanitization', () => {
  assert.throws(() => validateSceneSnapshot({ ...scene, widgets: Array.from({ length: 101 }, (_, index) => ({ ...scene.widgets[0], id: `widget-${index}` })) }), /unsupported data/);
  assert.throws(() => validateSceneSnapshot({ ...scene, widgets: [{ ...scene.widgets[0], settings: { safeText: 'x'.repeat(351_000) } }] }), /too large/);
});

test('workspace, Brand, and publication ownership deny cross-tenant access without SuperAdmin bypass', () => {
  const workspace = { id: 'workspace-1', ownerUserId: 'owner-1' }, brand = { id: 'brand-1', workspaceId: 'workspace-1', ownerUserId: 'owner-1' };
  assert.doesNotThrow(() => assertWorkspaceBrandOwner(workspace, brand, 'owner-1', 'workspace-1', 'brand-1'));
  assert.throws(() => assertWorkspaceBrandOwner(workspace, brand, 'other-owner', 'workspace-1', 'brand-1'), /access is denied/);
  assert.throws(() => assertWorkspaceBrandOwner(workspace, { ...brand, workspaceId: 'workspace-2' }, 'owner-1', 'workspace-1', 'brand-1'), /access is denied/);
  assert.throws(() => assertPublicationOwner({ ownerUserId: 'owner-1' }, 'other-owner'), /access is denied/);
});

test('revoked and expired publications are denied', () => {
  assert.equal(publicationIsActive({ status: 'TEST', expiresAt: new Date(now.getTime() + 1000).toISOString() }, now.getTime()), true);
  assert.equal(publicationIsActive({ status: 'REVOKED' }, now.getTime()), false);
  assert.equal(publicationIsActive({ status: 'TEST', revokedAt: now.toISOString() }, now.getTime()), false);
  assert.equal(publicationIsActive({ status: 'TEST', expiresAt: new Date(now.getTime() - 1).toISOString() }, now.getTime()), false);
});

test('event validation accepts all v1 test types and rejects malformed events', () => {
  for (const type of ['chat.message','stream.follow','stream.subscription','stream.raid','stream.cheer','reward.redeemed','tts.requested']) assert.equal(validateOverlayEvent({ version: 1, id: type, type, timestamp: now.toISOString(), source: 'test', data: {} }).type, type);
  assert.throws(() => validateOverlayEvent({ version: 1, type: 'unknown', timestamp: now.toISOString(), source: 'test', data: {} }), /invalid/);
});

test('multiple active clients receive one event while stale and gone connections are cleaned up', async () => {
  const future = Math.floor(Date.now() / 1000) + 1000, sent: string[] = [], removed: string[] = [];
  const delivered = await fanOutOverlayEvent([
    { connectionId: 'a', publicationId: 'publication-1', expiresAtEpoch: future },
    { connectionId: 'b', publicationId: 'publication-1', expiresAtEpoch: future },
    { connectionId: 'stale', publicationId: 'publication-1', expiresAtEpoch: 1 },
    { connectionId: 'gone', publicationId: 'publication-1', expiresAtEpoch: future },
  ], { type: 'stream.follow' }, async (id) => { if (id === 'gone') throw Object.assign(new Error('gone'), { name: 'GoneException' }); sent.push(id); }, async (id) => { removed.push(id); });
  assert.equal(delivered, 2); assert.deepEqual(sent.sort(), ['a', 'b']); assert.deepEqual(removed.sort(), ['gone', 'stale']);
});

test('connection records bind one connection to the server-resolved publication with TTL', () => {
  const record = createConnectionRecord('connection-1', 'publication-1', now.getTime());
  assert.equal(record.publicationId, 'publication-1'); assert.equal(record.expiresAtEpoch, Math.floor(now.getTime() / 1000) + 86400);
});
