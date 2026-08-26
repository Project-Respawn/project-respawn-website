import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import test from 'node:test'
import { handleTwitchOAuthCallback, twitchIntegrationCallbackUpdate } from './oauthHandlers'
import { REQUIRED_BROADCASTER_SCOPES } from './integrationTypes'
import { createOAuthState } from './oauthState'

test('OAuth callback serializes non-empty Twitch capabilities for AWSJSON', () => {
  const input = twitchIntegrationCallbackUpdate(
    { integrationId: 'integration-1' },
    { id: 'broadcaster-1', login: 'creator', display_name: 'Creator' },
    [...REQUIRED_BROADCASTER_SCOPES],
    '2026-08-26T20:00:00.000Z',
  )
  assert.equal(input.id, 'integration-1')
  assert.equal(typeof input.capabilities, 'string')
  assert.equal(JSON.parse(input.capabilities as string).eventSub, true)
  assert.notEqual(input.capabilities, JSON.stringify(input.capabilities))
})

test('duplicate consumed callback redirects only for the matching connected integration', async () => {
  process.env.TWITCH_OAUTH_STATE_SECRET = 'test-secret-with-enough-entropy'
  process.env.TWITCH_FRONTEND_URL = 'https://www.projectrespawn.com'
  const state = createOAuthState('transaction-1', process.env.TWITCH_OAUTH_STATE_SECRET)
  const tx = { id: 'transaction-1', integrationId: 'integration-1', workspaceId: 'workspace-1', brandId: 'brand-1', ownerUserId: 'owner-1', consumedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 60_000).toISOString(), nonceHash: createHash('sha256').update(state.payload.nonce).digest('hex') }
  const integration = { id: 'integration-1', workspaceId: 'workspace-1', brandId: 'brand-1', ownerUserId: 'owner-1', connectionStatus: 'CONNECTED' }
  const event = { queryStringParameters: { code: 'one-time-code-not-used', state: state.token } }
  const client: any = { models: { TwitchOAuthTransaction: { get: async () => ({ data: tx }) }, TwitchIntegration: { get: async () => ({ data: integration }) } } }
  const result = await handleTwitchOAuthCallback(event, client)
  assert.equal(result.statusCode, 302)
  assert.equal(result.headers.Location, 'https://www.projectrespawn.com/creator-tools/integrations?twitch=connected')

  const mismatchClient: any = { models: { ...client.models, TwitchIntegration: { get: async () => ({ data: { ...integration, brandId: 'other-brand' } }) } } }
  const rejected = await handleTwitchOAuthCallback(event, mismatchClient)
  assert.equal(rejected.statusCode, 400)
})
