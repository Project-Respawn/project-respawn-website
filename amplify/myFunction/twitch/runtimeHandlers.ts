import { randomUUID } from 'node:crypto'
import { getDataClient } from '../shared/dataClient'
import { getRequestBody } from '../shared/http'
import { jsonResponse } from '../shared/responses'
import { createRuntimeLease, runtimeLeaseMetadata, verifyRuntimeLease, verifyRuntimeRequest } from './runtimeAuth'
import { decryptTokenBundle } from './tokenStore'
import { claimRewardEvent, resolveRewardEvent } from './rewardEventHandlers'

const seenNonces = new Map<string, number>()
function headers(event: any) { const input = event.headers || {}; return Object.fromEntries(Object.entries(input).map(([key, value]) => [key.toLowerCase(), String(value)])) }
function runtimeSecret() { const value = process.env.TWITCH_RUNTIME_AUTH_SECRET || ''; if (!value) throw new Error('Runtime authentication is not configured'); return value }
function purgeNonces(now: number) { for (const [nonce, expiry] of seenNonces) if (expiry < now) seenNonces.delete(nonce) }
function authenticateRuntime(event: any, path: string, method: string, body: unknown) {
  const h = headers(event); const timestamp = h['x-respawn-timestamp']; const nonce = h['x-respawn-nonce']; const signature = h['x-respawn-signature']; const now = Date.now()
  if (h['x-respawn-runtime-client'] !== (process.env.TWITCH_RUNTIME_CLIENT_ID || 'respawn-twitch-bot')) throw new Error('Runtime client is not authorized')
  verifyRuntimeRequest({ method, path, timestamp, nonce, body }, signature, runtimeSecret(), now); purgeNonces(now)
  if (seenNonces.has(nonce)) throw new Error('Runtime request nonce was already used')
  seenNonces.set(nonce, now + 2 * 60_000)
}
async function integration(client: any, id: string) { const result = await client.models.TwitchIntegration.get({ id }); if (!result.data) throw new Error('Twitch integration not found'); return result.data }
function bearer(event: any) { return headers(event).authorization?.replace(/^Bearer\s+/i, '') || '' }

export async function handleTwitchRuntime(path: string, method: string, event: any, injectedClient?: any) {
  const body: any = getRequestBody(event) || {}; const client = injectedClient || await getDataClient()
  if (path === '/twitch/runtime/lease' && method === 'POST') {
    authenticateRuntime(event, path, method, body); const record = await integration(client, String(body.integrationId || ''))
    if (!record.twitchBroadcasterId || record.connectionStatus === 'DISCONNECTED') return jsonResponse(409, { error: 'Integration is not runtime-ready' })
    const lease = createRuntimeLease({ integrationId: record.id, brandId: record.brandId, broadcasterId: record.twitchBroadcasterId, operations: ['manifest', 'snapshot', 'token', 'heartbeat', 'reward-events-claim', 'reward-events-resolve'] }, runtimeSecret())
    return jsonResponse(200, { lease, ...runtimeLeaseMetadata(lease), integrationId: record.id, brandId: record.brandId, broadcasterId: record.twitchBroadcasterId, requestId: randomUUID() })
  }
  const operation = path.split('/').pop() || ''; const claims = verifyRuntimeLease(bearer(event), runtimeSecret(), operation); const record = await integration(client, claims.integrationId)
  if (record.brandId !== claims.brandId || record.twitchBroadcasterId !== claims.broadcasterId) throw new Error('Runtime lease integration binding mismatch')
  if (operation === 'manifest' && method === 'GET') return jsonResponse(200, { integrationId: record.id, brandId: record.brandId, broadcasterId: record.twitchBroadcasterId, configurationVersion: record.configurationVersion, connectionStatus: record.connectionStatus, capabilities: record.capabilities || {}, grantedScopes: record.grantedScopes || [] })
  if (operation === 'snapshot' && method === 'GET') {
    const commands = await client.models.TwitchCommand.list({ filter: { streamerId: { eq: record.twitchBroadcasterId } }, limit: 1000 })
    return jsonResponse(200, { integrationId: record.id, brandId: record.brandId, broadcasterId: record.twitchBroadcasterId, configurationVersion: record.configurationVersion, commands: commands.data || [] })
  }
  if (operation === 'token' && method === 'GET') {
    const vault = (await client.models.TwitchTokenVault.get({ integrationId: record.id })).data; if (!vault) return jsonResponse(409, { error: 'Integration token is unavailable' })
    let token = await decryptTokenBundle(record.id, vault.encryptedTokenBundle)
    if (token.expiresAt && Date.parse(token.expiresAt) <= Date.now() + 5 * 60_000) {
      const refreshBody = new URLSearchParams({ client_id: process.env.TWITCH_CLIENT_ID || '', client_secret: process.env.TWITCH_CLIENT_SECRET || '', grant_type: 'refresh_token', refresh_token: token.refreshToken })
      const response = await fetch('https://id.twitch.tv/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: refreshBody })
      if (!response.ok) {
        await client.models.TwitchIntegration.update({ id: record.id, connectionStatus: 'RECONNECT_REQUIRED', lastErrorCode: 'TOKEN_REFRESH_FAILED' })
        return jsonResponse(409, { error: 'Twitch authorization requires reconnect' })
      }
      const refreshed: any = await response.json()
      token = { accessToken: refreshed.access_token, refreshToken: refreshed.refresh_token || token.refreshToken, expiresAt: refreshed.expires_in ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString() : token.expiresAt, scopes: refreshed.scope || token.scopes }
      const { putTokenBundle } = await import('./tokenStore')
      await putTokenBundle(client, record.id, token)
      await client.models.TwitchIntegration.update({ id: record.id, tokenExpiresAt: token.expiresAt, tokenUpdatedAt: new Date().toISOString(), grantedScopes: token.scopes, lastValidatedAt: new Date().toISOString(), lastErrorCode: null })
    }
    return jsonResponse(200, { integrationId: record.id, brandId: record.brandId, broadcasterId: record.twitchBroadcasterId, accessToken: token.accessToken, tokenExpiresAt: token.expiresAt, grantedScopes: token.scopes })
  }
  if (operation === 'heartbeat' && method === 'POST') {
    const now = new Date().toISOString(); const input = { integrationId: record.id, botAuthenticated: true, botConnected: Boolean(body.botConnected), eventSubConnected: Boolean(body.eventSubConnected), chatReadAvailable: Boolean(body.chatReadAvailable), chatWriteAvailable: Boolean(body.chatWriteAvailable), lastEventReceivedAt: body.lastEventReceivedAt || null, lastBotHeartbeatAt: now, lastConfigurationSyncAt: body.lastConfigurationSyncAt || null, appliedConfigurationVersion: Number(body.appliedConfigurationVersion || 0), warnings: Array.isArray(body.warnings) ? body.warnings.map(String) : [], errors: Array.isArray(body.errors) ? body.errors.map(String) : [] }
    const existing = await client.models.TwitchRuntimeHealth.get({ integrationId: record.id }); const result = existing.data ? await client.models.TwitchRuntimeHealth.update(input) : await client.models.TwitchRuntimeHealth.create(input)
    if (result.errors?.length) throw new Error('Failed to record Twitch runtime health')
    return jsonResponse(200, { ok: true, observedAt: now })
  }
  if (operation === 'reward-events-claim' && method === 'POST') return jsonResponse(200, { event: await claimRewardEvent(client, record.id) })
  if (operation === 'reward-events-resolve' && method === 'POST') return jsonResponse(200, await resolveRewardEvent(client, record.id, body))
  return jsonResponse(404, { error: 'Runtime route not found' })
}
