import { randomUUID } from 'node:crypto'
import { getDataClient } from '../shared/dataClient'
import { getRequestBody } from '../shared/http'
import { jsonResponse } from '../shared/responses'
import { verifyAlphaRequest } from './rewardEventAuth'

const PATH = '/integrations/alpha/reward-events'
const EVENT_TYPE = 'reward.redeemed'
const EVENT_VERSION = 1
const MAX_AGE_MS = 5 * 60_000

function headers(event: any) { return Object.fromEntries(Object.entries(event.headers || {}).map(([k, v]) => [k.toLowerCase(), String(v)])) }
function safeName(value: unknown) { return String(value || 'A Project Respawn member').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 40) || 'A Project Respawn member' }

export async function handleAlphaRewardEvent(event: any, injectedClient?: any, now = Date.now()) {
  const body: any = getRequestBody(event) || {}; const h = headers(event); const client = injectedClient || await getDataClient()
  if (h['x-respawn-alpha-client'] !== (process.env.ALPHA_REWARD_EVENT_CLIENT_ID || 'alpha-app')) throw new Error('Alpha service client is not authorized')
  const nonceHash = verifyAlphaRequest({ method: 'POST', path: PATH, timestamp: h['x-respawn-timestamp'], nonce: h['x-respawn-nonce'], body }, h['x-respawn-signature'], process.env.ALPHA_REWARD_EVENT_AUTH_SECRET || '', now)
  const nonce = await client.models.AlphaServiceNonce.create({ nonceHash, expiresAt: new Date(now + 2 * 60_000).toISOString() })
  if (nonce.errors?.length) throw new Error('Alpha request nonce was already used')
  if (body.eventType !== EVENT_TYPE || body.eventVersion !== EVENT_VERSION || body.source !== 'alpha-app') return jsonResponse(400, { error: 'Unsupported reward event schema' })
  if (!/^alpha:reward-redemption:\d+:redeemed:v1$/.test(String(body.eventId || ''))) return jsonResponse(400, { error: 'Invalid reward event identity' })
  const occurred = Date.parse(body.occurredAt); if (!Number.isFinite(occurred) || Math.abs(now - occurred) > MAX_AGE_MS) return jsonResponse(410, { error: 'Reward event is stale' })
  const broadcasterId = String(body.twitchBroadcasterId || '').trim(); if (!/^\d+$/.test(broadcasterId)) return jsonResponse(400, { error: 'Invalid Twitch broadcaster identity' })
  const existing = await client.models.RewardRedemptionEvent.get({ eventId: body.eventId })
  if (existing.data) return jsonResponse(200, { accepted: true, duplicate: true, eventId: body.eventId })
  const integrations = await client.models.TwitchIntegration.list({ filter: { twitchBroadcasterId: { eq: broadcasterId }, connectionStatus: { eq: 'CONNECTED' } }, limit: 3 })
  if ((integrations.data || []).length !== 1) return jsonResponse(409, { error: 'Streamer integration binding is missing or ambiguous' })
  const integration = integrations.data[0]
  const workspaces = await client.models.CreatorWorkspaceRecord.listCreatorWorkspaceByOwnerUserId({ ownerUserId: integration.ownerUserId })
  if ((workspaces.data || []).length !== 1) return jsonResponse(409, { error: 'CreatorWorkspace binding is missing or ambiguous' })
  const created = await client.models.RewardRedemptionEvent.create({ eventId: body.eventId, eventVersion: 1, eventType: EVENT_TYPE, source: 'alpha-app', redemptionId: String(body.redemptionId), twitchBroadcasterId: broadcasterId, safeMemberDisplayName: safeName(body.memberDisplayName), occurredAt: new Date(occurred).toISOString(), expiresAt: new Date(occurred + MAX_AGE_MS).toISOString(), workspaceId: workspaces.data[0].id, integrationId: integration.id, status: 'AVAILABLE' })
  if (created.errors?.length) {
    const duplicate = await client.models.RewardRedemptionEvent.get({ eventId: body.eventId }); if (duplicate.data) return jsonResponse(200, { accepted: true, duplicate: true, eventId: body.eventId })
    throw new Error('Failed to persist reward event')
  }
  return jsonResponse(202, { accepted: true, duplicate: false, eventId: body.eventId })
}

export async function claimRewardEvent(client: any, integrationId: string, now = Date.now()) {
  const listed = await client.models.RewardRedemptionEvent.list({ filter: { integrationId: { eq: integrationId }, status: { eq: 'AVAILABLE' } }, limit: 20 })
  const current = (listed.data || []).filter((x: any) => Date.parse(x.expiresAt) >= now).sort((a: any, b: any) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt))[0]
  if (!current) return null
  const claimToken = randomUUID(); const claimedAt = new Date(now).toISOString()
  await client.models.RewardRedemptionEvent.update({ eventId: current.eventId, status: 'CLAIMED', claimToken, claimedAt })
  const confirmed = (await client.models.RewardRedemptionEvent.get({ eventId: current.eventId })).data
  if (!confirmed || confirmed.claimToken !== claimToken || confirmed.status !== 'CLAIMED') return null
  return { eventId: confirmed.eventId, eventVersion: confirmed.eventVersion, eventType: confirmed.eventType, integrationId: confirmed.integrationId, workspaceId: confirmed.workspaceId, twitchBroadcasterId: confirmed.twitchBroadcasterId, safeMemberDisplayName: confirmed.safeMemberDisplayName, occurredAt: confirmed.occurredAt, claimToken }
}

export async function resolveRewardEvent(client: any, integrationId: string, input: any, now = Date.now()) {
  const record = (await client.models.RewardRedemptionEvent.get({ eventId: String(input.eventId || '') })).data
  if (!record || record.integrationId !== integrationId || record.status !== 'CLAIMED' || record.claimToken !== input.claimToken) throw new Error('Reward event claim is invalid')
  if (!['SENT', 'SKIPPED', 'UNCERTAIN'].includes(input.resolution)) throw new Error('Reward event resolution is invalid')
  const updated = await client.models.RewardRedemptionEvent.update({ eventId: record.eventId, status: input.resolution, resolution: input.reason || input.resolution, resolvedAt: new Date(now).toISOString() })
  if (updated.errors?.length) throw new Error('Failed to resolve reward event')
  return { ok: true }
}
