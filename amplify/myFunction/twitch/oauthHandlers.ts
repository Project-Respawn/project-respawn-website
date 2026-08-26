import { createHash } from 'node:crypto'
import { getDataClient } from '../shared/dataClient'
import { jsonResponse } from '../shared/responses'
import { getQueryParams } from '../shared/http'
import { verifyOAuthState } from './oauthState'
import { deriveTwitchCapabilities } from './capabilities'
import { putTokenBundle } from './tokenStore'
import { encodeAwsJson } from './awsJson'

function redirect(location: string) { return { statusCode: 302, headers: { Location: location, 'Cache-Control': 'no-store' }, body: '' } }
export function twitchIntegrationCallbackUpdate(tx: any, user: any, scopes: string[], expiresAt: string | null) {
  const derived = deriveTwitchCapabilities(scopes)
  return { id: tx.integrationId, twitchBroadcasterId: user.id, twitchLogin: user.login, twitchDisplayName: user.display_name, connectionStatus: derived.requiredScopesPresent ? 'CONNECTED' : 'MISSING_PERMISSIONS', grantedScopes: scopes, capabilities: encodeAwsJson(derived.capabilities), tokenExpiresAt: expiresAt, tokenUpdatedAt: new Date().toISOString(), connectedAt: new Date().toISOString(), disconnectedAt: null, lastValidatedAt: new Date().toISOString(), lastErrorCode: derived.requiredScopesPresent ? null : 'MISSING_REQUIRED_SCOPES' }
}
async function twitchToken(code: string) {
  const body = new URLSearchParams({ client_id: process.env.TWITCH_CLIENT_ID || '', client_secret: process.env.TWITCH_CLIENT_SECRET || '', code, grant_type: 'authorization_code', redirect_uri: process.env.TWITCH_REDIRECT_URI || '' })
  const response = await fetch('https://id.twitch.tv/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
  if (!response.ok) throw new Error('TWITCH_TOKEN_EXCHANGE_FAILED')
  return response.json() as Promise<any>
}
async function twitchUser(accessToken: string) {
  const response = await fetch('https://api.twitch.tv/helix/users', { headers: { Authorization: `Bearer ${accessToken}`, 'Client-Id': process.env.TWITCH_CLIENT_ID || '' } })
  const body = await response.json() as any
  if (!response.ok || !body?.data?.[0]) throw new Error('TWITCH_IDENTITY_LOOKUP_FAILED')
  return body.data[0]
}

export async function handleTwitchOAuthCallback(event: any, injectedClient?: any) {
  const query = getQueryParams(event); const frontend = process.env.TWITCH_FRONTEND_URL || 'http://localhost:5174'
  if (query.error) return redirect(`${frontend}/creator-tools/integrations?twitch=error&reason=authorization_denied`)
  if (!query.code || !query.state) return jsonResponse(400, { error: 'Missing OAuth callback parameters' })
  const state = verifyOAuthState(query.state, process.env.TWITCH_OAUTH_STATE_SECRET || '')
  const client = injectedClient || await getDataClient(); const txResult = await client.models.TwitchOAuthTransaction.get({ id: state.transactionId }); const tx = txResult.data
  if (!tx) return jsonResponse(400, { error: 'OAuth transaction is invalid or already consumed' })
  if (Date.parse(tx.expiresAt) < Date.now()) return jsonResponse(400, { error: 'OAuth transaction expired' })
  if (createHash('sha256').update(state.nonce).digest('hex') !== tx.nonceHash) return jsonResponse(400, { error: 'OAuth transaction nonce mismatch' })
  if (tx.consumedAt) {
    const integrationResult = await client.models.TwitchIntegration.get({ id: tx.integrationId })
    const integration = integrationResult.data
    const bindingsMatch = integration
      && integration.workspaceId === tx.workspaceId
      && integration.brandId === tx.brandId
      && integration.ownerUserId === tx.ownerUserId
    if (!bindingsMatch || integration.connectionStatus !== 'CONNECTED') return jsonResponse(400, { error: 'OAuth transaction is invalid or already consumed' })
    return redirect(`${frontend}/creator-tools/integrations?twitch=connected`)
  }
  const token = await twitchToken(query.code); const user = await twitchUser(token.access_token); const scopes = token.scope || []
  const duplicate = await client.models.TwitchIntegration.list({ filter: { twitchBroadcasterId: { eq: user.id } }, limit: 10 })
  if ((duplicate.data || []).some((item: any) => item.id !== tx.integrationId && item.connectionStatus === 'CONNECTED')) return jsonResponse(409, { error: 'Twitch broadcaster is already connected to another integration' })
  const expiresAt = token.expires_in ? new Date(Date.now() + token.expires_in * 1000).toISOString() : null
  await putTokenBundle(client, tx.integrationId, { accessToken: token.access_token, refreshToken: token.refresh_token, expiresAt, scopes })
  await client.models.TwitchIntegration.update(twitchIntegrationCallbackUpdate(tx, user, scopes, expiresAt))
  await client.models.TwitchOAuthTransaction.update({ id: tx.id, consumedAt: new Date().toISOString() })
  return redirect(`${frontend}/creator-tools/integrations?twitch=connected`)
}
