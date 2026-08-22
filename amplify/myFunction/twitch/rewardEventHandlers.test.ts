import assert from 'node:assert/strict'
import test from 'node:test'
import { handleAlphaRewardEvent, claimRewardEvent, resolveRewardEvent } from './rewardEventHandlers'
import { signAlphaRequest } from './rewardEventAuth'

const now = Date.parse('2026-08-26T18:00:00.000Z')
function body() { return { eventId: 'alpha:reward-redemption:42:redeemed:v1', eventVersion: 1, eventType: 'reward.redeemed', source: 'alpha-app', redemptionId: '42', twitchBroadcasterId: '99', memberDisplayName: 'Raven\u0000Player', occurredAt: new Date(now).toISOString() } }
function event(input = body(), nonce = 'nonce-abcdefghijklmnop') { const timestamp = new Date(now).toISOString(); return { headers: { 'x-respawn-alpha-client': 'alpha-test', 'x-respawn-timestamp': timestamp, 'x-respawn-nonce': nonce, 'x-respawn-signature': signAlphaRequest({ method: 'POST', path: '/integrations/alpha/reward-events', timestamp, nonce, body: input }, 'alpha-secret') }, body: JSON.stringify(input) } }

function fakeClient() {
  const events = new Map<string, any>(); const nonces = new Set<string>()
  const claims = new Map<string, any>()
  return { events, models: {
    AlphaServiceNonce: { create: async ({ nonceHash }: any) => nonces.has(nonceHash) ? ({ errors: ['duplicate'] }) : (nonces.add(nonceHash), { data: { nonceHash } }) },
    TwitchIntegration: { list: async () => ({ data: [{ id: 'integration-1', ownerUserId: 'owner-sub', brandId: 'brand-legacy', twitchBroadcasterId: '99', connectionStatus: 'CONNECTED' }] }) },
    CreatorWorkspaceRecord: { listCreatorWorkspaceByOwnerUserId: async () => ({ data: [{ id: 'workspace-1', ownerUserId: 'owner-sub' }] }) },
    RewardRedemptionEvent: {
      get: async ({ eventId }: any) => ({ data: events.get(eventId) || null }),
      create: async (value: any) => events.has(value.eventId) ? ({ errors: ['duplicate'] }) : (events.set(value.eventId, { ...value }), { data: value }),
      list: async ({ filter }: any) => ({ data: [...events.values()].filter((x) => x.integrationId === filter.integrationId.eq && x.status === filter.status.eq) }),
      update: async (value: any) => { const current = events.get(value.eventId); events.set(value.eventId, { ...current, ...value }); return { data: events.get(value.eventId) } },
    },
    RewardRedemptionEventClaim: {
      create: async (value: any) => claims.has(value.eventId) ? ({ errors: ['duplicate'] }) : (claims.set(value.eventId, value), { data: value }),
      get: async ({ eventId }: any) => ({ data: claims.get(eventId) || null }),
    },
  } }
}

test('Alpha ingestion authenticates, sanitizes and persistently deduplicates event identity', async () => {
  process.env.ALPHA_REWARD_EVENT_AUTH_SECRET = 'alpha-secret'; process.env.ALPHA_REWARD_EVENT_CLIENT_ID = 'alpha-test'; const client: any = fakeClient()
  const first: any = await handleAlphaRewardEvent(event(), client, now); assert.equal(first.statusCode, 202); assert.equal(client.events.get(body().eventId).safeMemberDisplayName, 'RavenPlayer')
  const second: any = await handleAlphaRewardEvent(event(body(), 'nonce-bcdefghijklmnopq'), client, now); assert.equal(second.statusCode, 200); assert.equal(JSON.parse(second.body).duplicate, true); assert.equal(client.events.size, 1)
})

test('invalid signature, stale request and replayed nonce fail closed', async () => {
  process.env.ALPHA_REWARD_EVENT_AUTH_SECRET = 'alpha-secret'; process.env.ALPHA_REWARD_EVENT_CLIENT_ID = 'alpha-test'; const client: any = fakeClient()
  const invalid: any = event(); invalid.headers['x-respawn-signature'] = 'bad'; await assert.rejects(handleAlphaRewardEvent(invalid, client, now), /signature/i)
  await assert.rejects(handleAlphaRewardEvent(event(), client, now + 120_000), /stale/i)
  await handleAlphaRewardEvent(event(), client, now); await assert.rejects(handleAlphaRewardEvent(event(), client, now), /nonce/i)
})

test('ambiguous integration or workspace bindings are rejected', async () => {
  process.env.ALPHA_REWARD_EVENT_AUTH_SECRET = 'alpha-secret'; process.env.ALPHA_REWARD_EVENT_CLIENT_ID = 'alpha-test'; const client: any = fakeClient()
  client.models.TwitchIntegration.list = async () => ({ data: [] }); const missing: any = await handleAlphaRewardEvent(event(), client, now); assert.equal(missing.statusCode, 409)
  const client2: any = fakeClient(); client2.models.CreatorWorkspaceRecord.listCreatorWorkspaceByOwnerUserId = async () => ({ data: [{ id: 'w1' }, { id: 'w2' }] }); const ambiguous: any = await handleAlphaRewardEvent(event(body(), 'nonce-cdefghijklmnopqr'), client2, now); assert.equal(ambiguous.statusCode, 409)
})

test('claim is persistent and uncertain claims are never offered again', async () => {
  const client: any = fakeClient(); client.events.set(body().eventId, { ...body(), integrationId: 'integration-1', workspaceId: 'workspace-1', status: 'AVAILABLE', expiresAt: new Date(now + 300_000).toISOString() })
  const claimed = await claimRewardEvent(client, 'integration-1', now); assert.ok(claimed?.claimToken); assert.equal(await claimRewardEvent(client, 'integration-1', now), null)
  await resolveRewardEvent(client, 'integration-1', { eventId: claimed!.eventId, claimToken: claimed!.claimToken, resolution: 'UNCERTAIN', reason: 'send-started' }, now)
  assert.equal(await claimRewardEvent(client, 'integration-1', now), null)
  await resolveRewardEvent(client, 'integration-1', { eventId: claimed!.eventId, claimToken: claimed!.claimToken, resolution: 'SENT', reason: 'accepted' }, now)
  assert.equal(client.events.get(claimed!.eventId).status, 'SENT')
})
