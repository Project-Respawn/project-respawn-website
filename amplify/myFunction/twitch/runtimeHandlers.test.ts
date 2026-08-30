import assert from 'node:assert/strict'
import test from 'node:test'
import { handleTwitchRuntime } from './runtimeHandlers'
import { signRuntimeRequest } from './runtimeAuth'
import { DEFAULT_TWITCH_RUNTIME_CLIENT_ID, PRODUCTION_TWITCH_RUNTIME_CLIENT_ID, twitchRuntimeClientId } from '../config/runtimeClientIdentity'
import { CanonicalPublicationError } from '../../overlaySource/canonicalPublisher'
import { LEGACY_DISPOSITIONS } from '../../overlaySource/twitchEventDedupe'

const integration = { id: 'integration-1', workspaceId: 'workspace-1', brandId: 'brand-1', ownerUserId: 'owner-1', twitchBroadcasterId: 'broadcaster-1', connectionStatus: 'CONNECTED', configurationVersion: 4, capabilities: '{"eventSub":true}', grantedScopes: ['channel:read:subscriptions'] }
const client: any = { models: {
  TwitchIntegration: { get: async ({ id }: any) => ({ data: id === integration.id ? integration : null }) },
  TwitchCommand: { list: async () => ({ data: [] }) },
} }

function signedLeaseEvent(id = integration.id, runtimeClientId = 'test-runtime') {
  const body = { integrationId: id }; const timestamp = new Date().toISOString(); const nonce = `nonce-${Math.random().toString(36).padEnd(20, 'x')}`
  return { headers: { 'x-respawn-runtime-client': runtimeClientId, 'x-respawn-timestamp': timestamp, 'x-respawn-nonce': nonce, 'x-respawn-signature': signRuntimeRequest({ method: 'POST', path: '/twitch/runtime/lease', timestamp, nonce, body }, 'test-secret') }, body: JSON.stringify(body) }
}

test('runtime client identity is production-scoped and rejects the staging identity in production', async () => {
  assert.equal(twitchRuntimeClientId('master'), PRODUCTION_TWITCH_RUNTIME_CLIENT_ID)
  assert.equal(twitchRuntimeClientId('Ntgrestage8'), DEFAULT_TWITCH_RUNTIME_CLIENT_ID)
  assert.equal(twitchRuntimeClientId(undefined), DEFAULT_TWITCH_RUNTIME_CLIENT_ID)
  process.env.TWITCH_RUNTIME_AUTH_SECRET = 'test-secret'; process.env.TWITCH_RUNTIME_CLIENT_ID = PRODUCTION_TWITCH_RUNTIME_CLIENT_ID
  const accepted: any = await handleTwitchRuntime('/twitch/runtime/lease', 'POST', signedLeaseEvent(integration.id, PRODUCTION_TWITCH_RUNTIME_CLIENT_ID), client)
  assert.equal(accepted.statusCode, 200)
  await assert.rejects(handleTwitchRuntime('/twitch/runtime/lease', 'POST', signedLeaseEvent(integration.id, DEFAULT_TWITCH_RUNTIME_CLIENT_ID), client), /client is not authorized/i)
})

test('HMAC lease and bearer manifest/snapshot preserve integration binding', async () => {
  process.env.TWITCH_RUNTIME_AUTH_SECRET = 'test-secret'; process.env.TWITCH_RUNTIME_CLIENT_ID = 'test-runtime'
  const leaseResponse: any = await handleTwitchRuntime('/twitch/runtime/lease', 'POST', signedLeaseEvent(), client)
  assert.equal(leaseResponse.statusCode, 200); const leasePayload = JSON.parse(leaseResponse.body)
  assert.equal(leasePayload.broadcasterId, integration.twitchBroadcasterId); assert.ok(leasePayload.expiresAt > Date.now())
  const authEvent = { headers: { authorization: `Bearer ${leasePayload.lease}` } }
  const manifest: any = JSON.parse((await handleTwitchRuntime('/twitch/runtime/manifest', 'GET', authEvent, client) as any).body)
  const snapshot: any = JSON.parse((await handleTwitchRuntime('/twitch/runtime/snapshot', 'GET', authEvent, client) as any).body)
  assert.equal(manifest.brandId, integration.brandId); assert.equal(manifest.broadcasterId, integration.twitchBroadcasterId)
  assert.deepEqual(manifest.capabilities, { eventSub: true })
  assert.equal(snapshot.integrationId, integration.id); assert.equal(snapshot.broadcasterId, integration.twitchBroadcasterId)
})

test('invalid HMAC and unrelated integration substitution are rejected', async () => {
  process.env.TWITCH_RUNTIME_AUTH_SECRET = 'test-secret'; process.env.TWITCH_RUNTIME_CLIENT_ID = 'test-runtime'
  const invalid = signedLeaseEvent(); invalid.headers['x-respawn-signature'] = 'invalid'
  await assert.rejects(handleTwitchRuntime('/twitch/runtime/lease', 'POST', invalid, client), /signature/i)
  await assert.rejects(handleTwitchRuntime('/twitch/runtime/lease', 'POST', signedLeaseEvent('integration-2'), client), /not found/i)
})

async function runtimeLease() {
  process.env.TWITCH_RUNTIME_AUTH_SECRET = 'test-secret'; process.env.TWITCH_RUNTIME_CLIENT_ID = 'test-runtime'
  return JSON.parse((await handleTwitchRuntime('/twitch/runtime/lease', 'POST', signedLeaseEvent(), client) as any).body).lease
}

test('real overlay ingestion revalidates identity, dedupes durably, and cannot choose Brand or publication', async () => {
  const records = new Map<string, any>(); let publishes = 0
  const isolatedClient = { models: {
    TwitchIntegration: client.models.TwitchIntegration,
    CreatorWorkspaceRecord: { get: async ({ id }: any) => ({ data: id === 'workspace-1' ? { id } : null }) },
    Brand: { get: async ({ id }: any) => ({ data: id === 'brand-1' ? { id, workspaceId: 'workspace-1' } : null }) },
  } }
  const dedupe = { claim: async (input: any) => { if (records.has(input.dedupeKey)) return { status: 'DUPLICATE', record: records.get(input.dedupeKey) }; records.set(input.dedupeKey, input); return { status: 'CLAIMED' } }, update: async (key: string, input: any) => { records.set(key, { ...records.get(key), ...input }) } }
  const lease = await runtimeLease(), event = { version: 1, id: 'message-1', type: 'stream.follow', timestamp: '2026-08-30T12:00:00.000Z', source: 'twitch', data: { actor: { displayName: 'Follower' }, payload: {} } }
  const request: any = { headers: { authorization: `Bearer ${lease}` }, body: JSON.stringify({ twitchMessageId: 'message-1', broadcasterId: 'broadcaster-1', brandId: 'attacker-brand', publicationId: 'attacker-publication', event }) }
  const publisher = { getActivePublication: async () => ({ publicationId: 'publication-1', workspaceId: 'workspace-1', brandId: 'brand-1', status: 'TEST', sceneSnapshot: { widgets: [{ type: 'alerts', enabled: true, dataSource: { topics: ['stream.follow'] } }] } }), getConfigRevision: async () => 4, listConnections: async () => [], send: async () => {}, remove: async () => {} }
  const first: any = JSON.parse((await handleTwitchRuntime('/twitch/runtime/overlay-events', 'POST', request, isolatedClient, { ...publisher, listConnections: async () => { publishes += 1; return [] } }, dedupe) as any).body)
  const duplicate: any = JSON.parse((await handleTwitchRuntime('/twitch/runtime/overlay-events', 'POST', request, isolatedClient, publisher, dedupe) as any).body)
  assert.equal(first.status, 'DELIVERED'); assert.equal(first.publicationId, 'publication-1'); assert.equal(first.configRevision, 4); assert.equal(first.legacyDisposition, LEGACY_DISPOSITIONS.suppress); assert.equal(duplicate.status, 'DUPLICATE'); assert.equal(duplicate.priorState, 'DELIVERED'); assert.equal(duplicate.priorOutcome, 'ZERO_CONNECTIONS'); assert.equal(duplicate.legacyDisposition, LEGACY_DISPOSITIONS.suppress); assert.equal(publishes, 1)
  const stored: any = [...records.values()][0]; assert.equal(stored.integrationId, 'integration-1'); assert.equal(stored.state, 'DELIVERED'); assert.equal(stored.legacyDisposition, LEGACY_DISPOSITIONS.suppress); assert.ok(stored.expiresAt > Math.floor(Date.now() / 1000)); assert.equal(JSON.stringify(stored).includes('attacker'), false)
  const mismatch = { ...request, body: JSON.stringify({ twitchMessageId: 'message-2', broadcasterId: 'other', event: { ...event, id: 'message-2' } }) }
  await assert.rejects(handleTwitchRuntime('/twitch/runtime/overlay-events', 'POST', mismatch, isolatedClient, publisher, dedupe), /broadcaster binding mismatch/i)
})

function overlayHarness() {
  const isolatedClient = { models: {
    TwitchIntegration: client.models.TwitchIntegration,
    CreatorWorkspaceRecord: { get: async () => ({ data: { id: 'workspace-1' } }) },
    Brand: { get: async () => ({ data: { id: 'brand-1', workspaceId: 'workspace-1' } }) },
  } }
  const event = { version: 1, id: 'semantic-message', type: 'stream.follow', timestamp: '2026-08-30T12:00:00.000Z', source: 'twitch', data: { actor: { displayName: 'Follower' }, payload: {} } }
  return { isolatedClient, event }
}

async function invokeOverlay(dedupe: object, publisher: object, messageId = 'semantic-message') {
  const { isolatedClient, event } = overlayHarness()
  const lease = await runtimeLease()
  const request = { headers: { authorization: `Bearer ${lease}` }, body: JSON.stringify({ twitchMessageId: messageId, broadcasterId: 'broadcaster-1', event: { ...event, id: messageId } }) }
  const response = await handleTwitchRuntime('/twitch/runtime/overlay-events', 'POST', request, isolatedClient, publisher, dedupe)
  return JSON.parse(response.body)
}

test('duplicate endpoint responses recover delivered, intentional skip, processing failure, and stranded claim dispositions', async () => {
  const publisher = {}
  const scenarios: Array<{ record: Record<string, unknown>; expectedDisposition: string; expectedReason: string }> = [
    { record: { state: 'DELIVERED', outcome: 'DELIVERED', legacyDisposition: LEGACY_DISPOSITIONS.suppress }, expectedDisposition: LEGACY_DISPOSITIONS.suppress, expectedReason: 'DELIVERED' },
    { record: { state: 'SKIPPED', outcome: 'TOPIC_NOT_ENABLED', legacyDisposition: LEGACY_DISPOSITIONS.suppress }, expectedDisposition: LEGACY_DISPOSITIONS.suppress, expectedReason: 'TOPIC_NOT_ENABLED' },
    { record: { state: 'SKIPPED', outcome: 'PROCESSING_FAILED', legacyDisposition: LEGACY_DISPOSITIONS.allowFallback }, expectedDisposition: LEGACY_DISPOSITIONS.allowFallback, expectedReason: 'PROCESSING_FAILED' },
    { record: { state: 'CLAIMED', outcome: 'PROCESSING', legacyDisposition: LEGACY_DISPOSITIONS.suppress }, expectedDisposition: LEGACY_DISPOSITIONS.suppress, expectedReason: 'PROCESSING' },
  ]
  for (const { record, expectedDisposition, expectedReason } of scenarios) {
    const body = await invokeOverlay({ claim: async () => ({ status: 'DUPLICATE', record }), update: async () => undefined }, publisher, `duplicate-${expectedReason}`)
    assert.equal(body.status, 'DUPLICATE')
    assert.equal(body.priorState, record.state)
    assert.equal(body.priorOutcome, record.outcome)
    assert.equal(body.legacyDisposition, expectedDisposition)
  }
  const claimed = await invokeOverlay({ claim: async () => ({ status: 'DUPLICATE', record: { state: 'CLAIMED', outcome: 'PROCESSING' } }), update: async () => undefined }, publisher, 'duplicate-claimed-legacy')
  assert.equal(claimed.reason, 'INDETERMINATE_CLAIMED')
  assert.equal(claimed.legacyDisposition, LEGACY_DISPOSITIONS.suppress)
})

test('authoritative delivery and intentional skip retain suppression when terminal dedupe update fails', async () => {
  const baseDedupe = { claim: async () => ({ status: 'CLAIMED' }), update: async () => { throw new Error('update failed') } }
  const delivered = await invokeOverlay(baseDedupe, { getActivePublication: async () => ({ publicationId: 'publication-1', workspaceId: 'workspace-1', brandId: 'brand-1', status: 'TEST', sceneSnapshot: { widgets: [{ type: 'alerts', enabled: true, dataSource: { topics: ['stream.follow'] } }] } }), getConfigRevision: async () => 4, listConnections: async () => [{ connectionId: 'one', expiresAtEpoch: Math.floor(Date.now() / 1000) + 1000 }, { connectionId: 'two', expiresAtEpoch: Math.floor(Date.now() / 1000) + 1000 }], send: async (id: string) => { if (id === 'two') throw new Error('send failed') }, remove: async () => undefined })
  assert.equal(delivered.status, 'DELIVERED')
  assert.equal(delivered.delivered, 1)
  assert.equal(delivered.failed, 1)
  assert.equal(delivered.legacyDisposition, LEGACY_DISPOSITIONS.suppress)
  assert.equal(delivered.dedupePersisted, false)

  const skipped = await invokeOverlay(baseDedupe, { getActivePublication: async () => null })
  assert.equal(skipped.status, 'SKIPPED')
  assert.equal(skipped.reason, 'NO_ACTIVE_PUBLICATION')
  assert.equal(skipped.legacyDisposition, LEGACY_DISPOSITIONS.suppress)
  assert.equal(skipped.dedupePersisted, false)
})

test('zero connections and all failed sends remain canonical-authoritative suppression outcomes', async () => {
  const updates: object[] = []
  const dedupe = { claim: async () => ({ status: 'CLAIMED' }), update: async (_key: string, values: object) => { updates.push(values) } }
  const publication = { publicationId: 'publication-1', workspaceId: 'workspace-1', brandId: 'brand-1', status: 'TEST', sceneSnapshot: { widgets: [{ type: 'alerts', enabled: true, dataSource: { topics: ['stream.follow'] } }] } }
  const common = { getActivePublication: async () => publication, getConfigRevision: async () => 4, remove: async () => undefined }
  const zero = await invokeOverlay(dedupe, { ...common, listConnections: async () => [], send: async () => undefined }, 'zero-connections')
  assert.equal(zero.delivered, 0); assert.equal(zero.failed, 0); assert.equal(zero.legacyDisposition, LEGACY_DISPOSITIONS.suppress)
  const failed = await invokeOverlay(dedupe, { ...common, listConnections: async () => [{ connectionId: 'one', expiresAtEpoch: Math.floor(Date.now() / 1000) + 1000 }], send: async () => { throw new Error('failed') } }, 'all-failed')
  assert.equal(failed.delivered, 0); assert.equal(failed.failed, 1); assert.equal(failed.legacyDisposition, LEGACY_DISPOSITIONS.suppress)
  assert.equal(updates.length, 2)
})

test('proven pre-fanout failures allow fallback while indeterminate fanout failures suppress it', async () => {
  const persisted: Record<string, unknown>[] = []
  const dedupe = { claim: async () => ({ status: 'CLAIMED' }), update: async (_key: string, values: Record<string, unknown>) => { persisted.push(values) } }
  const before = await invokeOverlay(dedupe, { getActivePublication: async () => { throw new Error('read failed') } }, 'before-fanout')
  assert.equal(before.status, 'PROCESSING_FAILED'); assert.equal(before.legacyDisposition, LEGACY_DISPOSITIONS.allowFallback)
  const ambiguous = await invokeOverlay(dedupe, { getActivePublication: async () => { throw new CanonicalPublicationError('indeterminate', true, new Error('fanout')) } }, 'ambiguous-fanout')
  assert.equal(ambiguous.status, 'PROCESSING_FAILED'); assert.equal(ambiguous.legacyDisposition, LEGACY_DISPOSITIONS.suppress)
  assert.deepEqual(persisted.map((value) => value.legacyDisposition), [LEGACY_DISPOSITIONS.allowFallback, LEGACY_DISPOSITIONS.suppress])
})
