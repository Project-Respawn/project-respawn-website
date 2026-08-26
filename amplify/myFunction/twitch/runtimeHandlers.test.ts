import assert from 'node:assert/strict'
import test from 'node:test'
import { handleTwitchRuntime } from './runtimeHandlers'
import { signRuntimeRequest } from './runtimeAuth'

const integration = { id: 'integration-1', workspaceId: 'workspace-1', brandId: 'brand-1', ownerUserId: 'owner-1', twitchBroadcasterId: 'broadcaster-1', connectionStatus: 'CONNECTED', configurationVersion: 4, capabilities: '{"eventSub":true}', grantedScopes: ['channel:read:subscriptions'] }
const client: any = { models: {
  TwitchIntegration: { get: async ({ id }: any) => ({ data: id === integration.id ? integration : null }) },
  TwitchCommand: { list: async () => ({ data: [] }) },
} }

function signedLeaseEvent(id = integration.id) {
  const body = { integrationId: id }; const timestamp = new Date().toISOString(); const nonce = `nonce-${Math.random().toString(36).padEnd(20, 'x')}`
  return { headers: { 'x-respawn-runtime-client': 'test-runtime', 'x-respawn-timestamp': timestamp, 'x-respawn-nonce': nonce, 'x-respawn-signature': signRuntimeRequest({ method: 'POST', path: '/twitch/runtime/lease', timestamp, nonce, body }, 'test-secret') }, body: JSON.stringify(body) }
}

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
