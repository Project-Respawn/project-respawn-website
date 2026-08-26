import assert from 'node:assert/strict'
import { handleStartTwitchIntegrationOAuth, safeIntegrationResult, toSafeIntegration } from './integrationHandlers'
import { testPermissionModels } from '../shared/testPermissionModels'

process.env.TWITCH_OAUTH_STATE_SECRET = 'test-secret-with-enough-entropy'
process.env.TWITCH_CLIENT_ID = 'client-id'
process.env.TWITCH_REDIRECT_URI = 'http://localhost:3000/twitch/oauth/callback'

const createdIntegrations: any[] = []
const createdTransactions: any[] = []
const writeOrder: string[] = []
const client: any = { models: {
  ...testPermissionModels([]),
  Brand: { get: async () => ({ data: { id: 'brand-1', workspaceId: 'workspace-1', ownerUserId: 'creator-sub' } }) },
  CreatorWorkspaceRecord: { get: async () => ({ data: { id: 'workspace-1', ownerUserId: 'creator-sub' } }) },
  BrandAccess: { list: async () => ({ data: [] }) },
  BrandAccessPermission: { list: async () => ({ data: [] }) },
  TwitchIntegration: {
    list: async () => ({ data: [] }),
    create: async (input: any) => {
      if (typeof input.capabilities !== 'string') return { data: null, errors: [{ message: "Variable 'capabilities' has an invalid value." }] }
      JSON.parse(input.capabilities)
      createdIntegrations.push(input)
      writeOrder.push('integration')
      return { data: { id: 'integration-1', ...input } }
    },
  },
  TwitchOAuthTransaction: {
    create: async (input: any) => { createdTransactions.push(input); writeOrder.push('transaction'); return { data: input } },
  },
} }

const result = await handleStartTwitchIntegrationOAuth({
  identity: { username: 'creator-sub', claims: {} }, arguments: { brandId: 'brand-1' },
}, client)
assert.equal(result.integrationId, 'integration-1')
assert.equal(createdIntegrations[0].workspaceId, 'workspace-1')
assert.equal(createdIntegrations[0].brandId, 'brand-1')
assert.equal(createdIntegrations[0].ownerUserId, 'creator-sub')
assert.equal(createdIntegrations[0].capabilities, '{}')
assert.equal(createdTransactions[0].workspaceId, 'workspace-1')
assert.deepEqual(writeOrder, ['integration', 'transaction'])
assert.equal(new URL(result.authorizeUrl).searchParams.get('redirect_uri'), process.env.TWITCH_REDIRECT_URI)
assert.equal(new URL(result.authorizeUrl).protocol, 'https:')
assert.equal(new URL(result.authorizeUrl).hostname, 'id.twitch.tv')
assert.deepEqual(toSafeIntegration({ id: 'i', workspaceId: 'w', brandId: 'b', ownerUserId: 'u', capabilities: '{"eventSub":true}' })?.capabilities, { eventSub: true })
const connectedResult = safeIntegrationResult({ id: 'i', workspaceId: 'w', brandId: 'b', ownerUserId: 'u', connectionStatus: 'CONNECTED', twitchLogin: 'creator', capabilities: '{}' }, { botConnected: null })
assert.equal(typeof connectedResult.integration, 'string')
assert.equal(JSON.parse(connectedResult.integration as string).connectionStatus, 'CONNECTED')
assert.equal(JSON.parse(connectedResult.integration as string).twitchLogin, 'creator')
assert.equal(JSON.parse(connectedResult.health as string).botConnected, null)

const persistenceFailureClient: any = { models: {
  ...client.models,
  TwitchIntegration: {
    list: async () => ({ data: [] }),
    create: async () => ({ data: null, errors: [{ message: 'Safe AppSync persistence failure', errorType: 'ValidationError' }] }),
  },
} }
await assert.rejects(
  handleStartTwitchIntegrationOAuth({ identity: { username: 'creator-sub', claims: {} }, arguments: { brandId: 'brand-1' } }, persistenceFailureClient),
  /Safe AppSync persistence failure/,
)

console.log('Workspace-bound Twitch OAuth start tests passed')
