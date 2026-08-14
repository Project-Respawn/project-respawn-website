import { createHash, randomUUID } from 'node:crypto'
import { getIdentityUsername, getResolverIdentity } from '../shared/auth'
import { getEffectivePermissions } from '../shared/requirePermission'
import { createOAuthState } from './oauthState'
import { buildTwitchHealth } from './health'
import { deriveTwitchCapabilities } from './capabilities'
import { getDataClient } from '../shared/dataClient'
import { hasBrandTwitchManagePermission } from './managedPolicy'
import { REQUIRED_BROADCASTER_SCOPES, OPTIONAL_PHASE1_SCOPES } from './integrationTypes'

async function listAll(client: any, modelName: string) {
  const output: any[] = []; let nextToken: string | undefined | null
  do { const result = await client.models[modelName].list({ limit: 1000, nextToken }); if (result.errors?.length) throw new Error(`Failed to list ${modelName}`); output.push(...(result.data || [])); nextToken = result.nextToken } while (nextToken)
  return output
}

async function authorizedContext(event: any, brandId: string, client: any) {
  const identity = getResolverIdentity(event); const userId = getIdentityUsername(identity)
  if (!userId) throw new Error('Authenticated user identity is required')
  const [brandResult, accesses, permissions, permissionContext] = await Promise.all([
    client.models.Brand.get({ id: brandId }), listAll(client, 'BrandAccess'), listAll(client, 'BrandAccessPermission'), getEffectivePermissions(event, client),
  ])
  const brand = brandResult.data
  if (!brand) throw new Error('Brand not found')
  const platformOperator = permissionContext.effective.has('bots.twitch.manage')
  if (!platformOperator && !hasBrandTwitchManagePermission(userId, brand, accesses, permissions)) throw new Error('Brand Twitch management permission is required')
  return { userId, brand }
}

export function toSafeIntegration(record: any) {
  if (!record) return null
  return {
    id: record.id, brandId: record.brandId, ownerUserId: record.ownerUserId,
    twitchBroadcasterId: record.twitchBroadcasterId || null, twitchLogin: record.twitchLogin || null,
    twitchDisplayName: record.twitchDisplayName || null, connectionStatus: record.connectionStatus,
    grantedScopes: record.grantedScopes || [], capabilities: record.capabilities || {},
    tokenExpiresAt: record.tokenExpiresAt || null, configurationVersion: record.configurationVersion || 1,
    createdAt: record.createdAt || null, updatedAt: record.updatedAt || null,
  }
}

async function findIntegration(client: any, brandId: string) {
  const result = await client.models.TwitchIntegration.list({ filter: { brandId: { eq: brandId } }, limit: 2 })
  if (result.errors?.length) throw new Error('Failed to load Twitch integration')
  if ((result.data || []).length > 1) throw new Error('Multiple Twitch integrations exist for this Brand')
  return result.data?.[0] || null
}

export async function handleStartTwitchIntegrationOAuth(event: any, injectedClient?: any) {
  const brandId = String(event.arguments?.brandId || '').trim(); if (!brandId) throw new Error('brandId is required')
  const client = injectedClient || await getDataClient(); const { userId } = await authorizedContext(event, brandId, client)
  let integration = await findIntegration(client, brandId)
  if (!integration) {
    const created = await client.models.TwitchIntegration.create({ brandId, ownerUserId: userId, provider: 'twitch', connectionStatus: 'DISCONNECTED', grantedScopes: [], capabilities: {}, configurationVersion: 1 })
    if (created.errors?.length || !created.data) throw new Error('Failed to create Twitch integration')
    integration = created.data
  } else if (integration.ownerUserId !== userId) {
    throw new Error('Twitch integration owner does not match authenticated creator')
  }
  const transactionId = randomUUID(); const secret = process.env.TWITCH_OAUTH_STATE_SECRET || ''
  const state = createOAuthState(transactionId, secret)
  const nonceHash = createHash('sha256').update(state.payload.nonce).digest('hex')
  const transaction = await client.models.TwitchOAuthTransaction.create({ id: transactionId, ownerUserId: userId, brandId, integrationId: integration.id, nonceHash, expiresAt: new Date(state.payload.expiresAt).toISOString() })
  if (transaction.errors?.length) throw new Error('Failed to create Twitch OAuth transaction')
  const scopes = [...REQUIRED_BROADCASTER_SCOPES, ...OPTIONAL_PHASE1_SCOPES]
  const params = new URLSearchParams({ response_type: 'code', client_id: process.env.TWITCH_CLIENT_ID || '', redirect_uri: process.env.TWITCH_REDIRECT_URI || '', scope: scopes.join(' '), state: state.token, force_verify: 'true' })
  return { integrationId: integration.id, authorizeUrl: `https://id.twitch.tv/oauth2/authorize?${params}` }
}

export async function handleGetMyTwitchIntegration(event: any, injectedClient?: any) {
  const brandId = String(event.arguments?.brandId || '').trim(); const client = injectedClient || await getDataClient()
  await authorizedContext(event, brandId, client); const integration = await findIntegration(client, brandId)
  if (!integration) return { integration: null, health: null }
  const runtime = (await client.models.TwitchRuntimeHealth.get({ integrationId: integration.id })).data
  return { integration: toSafeIntegration(integration), health: buildTwitchHealth(integration, runtime) }
}

export async function handleDisconnectTwitchIntegration(event: any, injectedClient?: any) {
  const brandId = String(event.arguments?.brandId || '').trim(); const integrationId = String(event.arguments?.integrationId || '').trim(); const client = injectedClient || await getDataClient()
  await authorizedContext(event, brandId, client); const integration = await findIntegration(client, brandId)
  if (!integration || integration.id !== integrationId) throw new Error('Twitch integration does not belong to the selected Brand')
  await client.models.TwitchTokenVault.delete({ integrationId })
  const updated = await client.models.TwitchIntegration.update({ id: integrationId, connectionStatus: 'DISCONNECTED', disconnectedAt: new Date().toISOString(), tokenExpiresAt: null, lastErrorCode: null, configurationVersion: Number(integration.configurationVersion || 1) + 1 })
  return { integration: toSafeIntegration(updated.data), health: buildTwitchHealth(updated.data, null) }
}

export { authorizedContext, findIntegration, deriveTwitchCapabilities }
