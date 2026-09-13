import assert from 'node:assert/strict';
import test from 'node:test';
import { publishCanonicalOverlayEvent } from './canonicalPublisher';

const event = { version: 1, id: 'message-1', type: 'stream.follow', timestamp: '2026-08-30T12:00:00.000Z', source: 'twitch', data: { actor: { displayName: 'Follower' }, payload: {} } };
const publication = { publicationId: 'publication-1', workspaceId: 'workspace-1', brandId: 'brand-1', status: 'TEST', sceneSnapshot: { widgets: [{ type: 'alerts', enabled: true, dataSource: { topics: ['stream.follow'] } }] } };
function dependencies(overrides: any = {}) { return { getActivePublication: async () => publication, getConfigRevision: async () => 9, listConnections: async () => [{ connectionId: 'a', expiresAtEpoch: Math.floor(Date.now() / 1000) + 100 }], send: async () => {}, remove: async () => {}, ...overrides }; }

test('publisher resolves the Brand publication, attaches current revision, and fans out', async () => {
  const result: any = await publishCanonicalOverlayEvent({ workspaceId: 'workspace-1', brandId: 'brand-1', event }, dependencies());
  assert.equal(result.status, 'DELIVERED'); assert.equal(result.publicationId, 'publication-1'); assert.equal(result.configRevision, 9); assert.equal(result.event.configRevision, 9); assert.equal(result.delivered, 1);
});

test('publisher fails closed for cross-Brand, missing widget, and unsubscribed topic', async () => {
  assert.equal((await publishCanonicalOverlayEvent({ workspaceId: 'workspace-1', brandId: 'brand-2', event }, dependencies())).reason, 'PUBLICATION_IDENTITY_MISMATCH');
  assert.equal((await publishCanonicalOverlayEvent({ workspaceId: 'workspace-1', brandId: 'brand-1', event }, dependencies({ getActivePublication: async () => ({ ...publication, sceneSnapshot: { widgets: [] } }) }))).reason, 'ALERTS_WIDGET_DISABLED');
  assert.equal((await publishCanonicalOverlayEvent({ workspaceId: 'workspace-1', brandId: 'brand-1', event: { ...event, type: 'stream.raid' } }, dependencies())).reason, 'TOPIC_NOT_ENABLED');
  assert.equal((await publishCanonicalOverlayEvent({ workspaceId: 'workspace-1', brandId: 'brand-1', event }, dependencies({ getActivePublication: async () => null }))).reason, 'NO_ACTIVE_PUBLICATION');
});

test('chat-only publications receive chat and reject disabled, removed and cross-tenant destinations', async () => {
  const chatEvent = { ...event, type: 'chat.message', data: { actor: { displayName: 'Viewer' }, payload: { text: 'Hello', platform: 'twitch' } } };
  const chatPublication = { ...publication, sceneSnapshot: { widgets: [{ type: 'twitch-chat', enabled: true, dataSource: { topics: ['chat.message'] } }] } };
  const input = { workspaceId: 'workspace-1', brandId: 'brand-1', event: chatEvent };
  const deps = dependencies({ getActivePublication: async () => chatPublication });
  assert.equal((await publishCanonicalOverlayEvent(input, deps)).status, 'DELIVERED');
  assert.equal((await publishCanonicalOverlayEvent({ ...input, workspaceId: 'other' }, deps)).reason, 'PUBLICATION_IDENTITY_MISMATCH');
  assert.equal((await publishCanonicalOverlayEvent({ ...input, brandId: 'other' }, deps)).reason, 'PUBLICATION_IDENTITY_MISMATCH');
  for (const widgets of [[], [{ ...chatPublication.sceneSnapshot.widgets[0], enabled: false }], [{ ...chatPublication.sceneSnapshot.widgets[0], hidden: true }]]) {
    assert.equal((await publishCanonicalOverlayEvent(input, dependencies({ getActivePublication: async () => ({ ...chatPublication, sceneSnapshot: { widgets } }) }))).reason, 'CHAT_WIDGET_DISABLED');
  }
});
