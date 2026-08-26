import assert from 'node:assert/strict'
import { handleStartTwitchIntegrationOAuth, toSafeIntegration } from './integrationHandlers'
import { testPermissionModels } from '../shared/testPermissionModels'

process.env.TWITCH_OAUTH_STATE_SECRET = 'test-secret-with-enough-entropy'
process.env.TWITCH_CLIENT_ID = 'client-id'
process.env.TWITCH_REDIRECT_URI = 'http://localhost:3000/twitch/oauth/callback'

const createdIntegrations: any[] = []
const createdTransactions: any[] = []
const client: any = { models: {
  ...testPermissionModels([]),
  Brand: { get: async () => ({ data: { id: 'brand-1', workspaceId: 'workspace-1', ownerUserId: 'creator-sub' } }) },
  CreatorWorkspaceRecord: { get: async () => ({ data: { id: 'workspace-1', ownerUserId: 'creator-sub' } }) },
  BrandAccess: { list: async () => ({ data: [] }) },
  BrandAccessPermission: { list: async () => ({ data: [] }) },
  TwitchIntegration: {
    list: async () => ({ data: [] }),
    create: async (input: any) => {
      createdIntegrations.push(input)
      return { data: { id: 'integration-1', ...input } }
    },
  },
  TwitchOAuthTransaction: {
    create: async (input: any) => { createdTransactions.push(input); return { data: input } },
  },
} }

const result = await handleStartTwitchIntegrationOAuth({
  identity: { username: 'creator-sub', claims: {} }, arguments: { brandId: 'brand-1' },
}, client)
assert.equal(result.integrationId, 'integration-1')
assert.equal(createdIntegrations[0].workspaceId, 'workspace-1')
assert.equal(createdTransactions[0].workspaceId, 'workspace-1')
assert.equal(new URL(result.authorizeUrl).searchParams.get('redirect_uri'), process.env.TWITCH_REDIRECT_URI)
assert.equal(toSafeIntegration({ id: 'i', workspaceId: 'w', brandId: 'b', ownerUserId: 'u' })?.workspaceId, 'w')

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
