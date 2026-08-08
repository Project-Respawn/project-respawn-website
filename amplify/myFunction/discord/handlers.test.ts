import assert from 'node:assert/strict'
import { handleCreateOrUpdateManagedDiscordConfiguration, handleGetManagedDiscordConfiguration } from './handlers'

function makeClient(options: { configurations?: any[]; accesses?: any[]; permissions?: any[] } = {}) {
  const configurations = [...(options.configurations || [])]
  const created: any[] = []
  const updated: any[] = []
  const audits: any[] = []
  return {
    configurations, created, updated, audits,
    models: {
      Brand: { get: async ({ id }: { id: string }) => ({ data: ['brand-a', 'brand-b'].includes(id) ? { id, ownerUserId: id === 'brand-a' ? 'owner-a' : 'owner-b' } : null }) },
      BrandAccess: { list: async () => ({ data: options.accesses || [] }) },
      BrandAccessPermission: { list: async () => ({ data: options.permissions || [] }) },
      DiscordBotConfiguration: {
        list: async () => ({ data: [...configurations] }),
        create: async (input: any) => { const record = { id: input.id, brandId: input.brandId }; configurations.push(record); created.push(record); return { data: record } },
        update: async (input: any) => { const record = { id: input.id, brandId: input.brandId }; updated.push(record); return { data: record } },
      },
      PermissionAuditEvent: { create: async (input: any) => { audits.push(input); return { data: input } } },
    },
  }
}

function event(username: string, groups: string[], arguments_: Record<string, unknown>) {
  return { identity: { username, claims: { 'cognito:groups': groups } }, arguments: arguments_ }
}

const adminClient = makeClient()
await handleCreateOrUpdateManagedDiscordConfiguration(event('admin-a', ['Admin'], { brandId: 'brand-b' }), adminClient)
assert.deepEqual(adminClient.created, [{ id: 'discord-bot-configuration:brand-b', brandId: 'brand-b' }])
assert.equal(adminClient.audits[0].action, 'discord.configuration.create')

const staffClient = makeClient()
await handleCreateOrUpdateManagedDiscordConfiguration(event('staff-a', ['Staff'], { brandId: 'brand-b' }), staffClient)
assert.equal(staffClient.created[0].brandId, 'brand-b')

const ownerClient = makeClient()
await handleCreateOrUpdateManagedDiscordConfiguration(event('owner-a', ['Member'], { brandId: 'brand-a' }), ownerClient)
assert.equal(ownerClient.created[0].brandId, 'brand-a')

const helperClient = makeClient({
  accesses: [{ id: 'access-a', brandId: 'brand-a', userId: 'helper-a', accessLevel: 'helper' }],
  permissions: [{ brandAccessId: 'access-a', brandId: 'brand-a', permissionKey: 'brand.discord.manage' }],
})
await handleCreateOrUpdateManagedDiscordConfiguration(event('helper-a', ['Member'], { brandId: 'brand-a' }), helperClient)
assert.equal(helperClient.created[0].brandId, 'brand-a')

await assert.rejects(
  handleCreateOrUpdateManagedDiscordConfiguration(event('helper-a', ['Member'], { brandId: 'brand-a' }), makeClient()),
  /Brand Discord management permission/i,
)
await assert.rejects(
  handleCreateOrUpdateManagedDiscordConfiguration(event('owner-a', ['Member'], { brandId: 'brand-b' }), makeClient()),
  /Brand Discord management permission/i,
)

const directClient = makeClient()
await assert.rejects(
  handleCreateOrUpdateManagedDiscordConfiguration(event('untrusted-user', ['Member'], { brandId: 'brand-a', groups: ['Admin'], ownerUserId: 'owner-a' }), directClient),
  /Brand Discord management permission/i,
)
assert.equal(directClient.created.length, 0)

const getClient = makeClient({ configurations: [{ id: 'discord-bot-configuration:brand-a', brandId: 'brand-a' }] })
const loaded = await handleGetManagedDiscordConfiguration(event('owner-a', ['Member'], { brandId: 'brand-a' }), getClient)
assert.equal(loaded.configurationId, 'discord-bot-configuration:brand-a')

console.log('managed Discord configuration authorization tests passed')
