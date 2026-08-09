import assert from 'node:assert/strict'
import { handleCreateManagedTwitchCommand, handleDeleteManagedTwitchCommand, handleListManagedTwitchCommands, handleUpdateManagedTwitchCommand } from './managedHandlers'
import { testPermissionModels } from '../shared/testPermissionModels'

function makeClient(options: { commandBrandId?: string | null; accesses?: any[]; permissions?: any[] } = {}) {
  const created: any[] = []
  const updated: any[] = []
  const deleted: any[] = []
  const audits: any[] = []
  return {
    created, updated, deleted, audits,
    models: {
      ...testPermissionModels(['bots.twitch.manage']),
      Brand: { get: async ({ id }: { id: string }) => ({ data: ['brand-a', 'brand-b'].includes(id) ? { id, ownerUserId: id === 'brand-a' ? 'owner-a' : 'owner-b' } : null }) },
      BrandAccess: { list: async () => ({ data: options.accesses || [] }) },
      BrandAccessPermission: { list: async () => ({ data: options.permissions || [] }) },
      TwitchCommand: {
        get: async () => ({ data: { id: 'command-a', brandId: options.commandBrandId === undefined ? 'brand-a' : options.commandBrandId, name: 'hello' } }),
        list: async () => ({ data: [
          { id: 'command-a', brandId: 'brand-a', streamerId: 'streamer-a', name: 'hello', reply: 'Hello!', enabled: true, cooldownSeconds: 10, isCustom: true, category: 'Info', permissionLevel: 'everyone' },
          { id: 'command-b', brandId: 'brand-b', streamerId: 'streamer-b', name: 'other', reply: 'Other!', enabled: true, cooldownSeconds: 10, isCustom: true, category: 'Info', permissionLevel: 'everyone' },
          { id: 'command-legacy', brandId: null, streamerId: 'legacy', name: 'legacy', reply: 'Legacy!', enabled: true, cooldownSeconds: 10, isCustom: true, category: 'Info', permissionLevel: 'everyone' },
        ] }),
        create: async (input: any) => { created.push(input); return { data: { id: 'command-created', ...input } } },
        update: async (input: any) => { updated.push(input); return { data: input } },
        delete: async (input: any) => { deleted.push(input); return { data: input } },
      },
      PermissionAuditEvent: { create: async (input: any) => { audits.push(input); return { data: input } } },
    },
  }
}

function event(username: string, groups: string[], arguments_: Record<string, unknown>) {
  return { identity: { username, claims: { 'cognito:groups': groups } }, arguments: arguments_ }
}

const createFields = { brandId: 'brand-b', streamerId: 'streamer-b', name: 'hello', reply: 'Hello!', enabled: true, cooldownSeconds: 10, isCustom: true, category: 'Info', permissionLevel: 'everyone' }

const adminClient = makeClient()
await handleCreateManagedTwitchCommand(event('admin-a', ['Admin'], createFields), adminClient)
assert.equal(adminClient.created[0].brandId, 'brand-b')
assert.equal(adminClient.audits[0].action, 'twitch.command.create')

const staffClient = makeClient({ commandBrandId: 'brand-b' })
await handleUpdateManagedTwitchCommand(event('staff-a', ['Staff'], { commandId: 'command-a', brandId: 'brand-b', reply: 'Staff reply' }), staffClient)
assert.deepEqual(staffClient.updated, [{ id: 'command-a', reply: 'Staff reply', brandId: 'brand-b' }])

const ownerClient = makeClient()
const ownerCommands = await handleListManagedTwitchCommands(event('owner-a', ['Member'], { brandId: 'brand-a' }), ownerClient)
assert.deepEqual(ownerCommands.map((command) => command.id), ['command-a'])
await handleUpdateManagedTwitchCommand(event('owner-a', ['Member'], { commandId: 'command-a', brandId: 'brand-a', reply: 'Owner reply' }), ownerClient)
assert.equal(ownerClient.updated[0].reply, 'Owner reply')
await handleDeleteManagedTwitchCommand(event('owner-a', ['Member'], { commandId: 'command-a', brandId: 'brand-a' }), ownerClient)
assert.deepEqual(ownerClient.deleted, [{ id: 'command-a' }])

const helperClient = makeClient({
  accesses: [{ id: 'access-a', brandId: 'brand-a', userId: 'helper-a', accessLevel: 'helper' }],
  permissions: [{ brandAccessId: 'access-a', brandId: 'brand-a', permissionKey: 'brand.twitch.manage' }],
})
await handleUpdateManagedTwitchCommand(event('helper-a', ['Member'], { commandId: 'command-a', brandId: 'brand-a', enabled: false }), helperClient)
assert.equal(helperClient.updated[0].enabled, false)

await assert.rejects(
  handleUpdateManagedTwitchCommand(event('helper-a', ['Member'], { commandId: 'command-a', brandId: 'brand-a', enabled: false }), makeClient()),
  /Brand Twitch management permission/i,
)

await assert.rejects(
  handleUpdateManagedTwitchCommand(event('owner-a', ['Member'], { commandId: 'command-a', brandId: 'brand-a', reply: 'Wrong brand' }), makeClient({ commandBrandId: 'brand-b' })),
  /does not belong to the selected brand/i,
)
await assert.rejects(
  handleDeleteManagedTwitchCommand(event('owner-a', ['Member'], { commandId: 'command-a', brandId: 'brand-b' }), makeClient()),
  /does not belong to the selected brand/i,
)

await assert.rejects(
  handleUpdateManagedTwitchCommand(event('owner-a', ['Member'], { commandId: 'command-a', brandId: 'brand-b', reply: 'Move command' }), makeClient()),
  /does not belong to the selected brand/i,
)

const directCallClient = makeClient()
await assert.rejects(
  handleCreateManagedTwitchCommand(event('untrusted-user', ['Member'], { ...createFields, brandId: 'brand-a', groups: ['Admin'], ownerUserId: 'owner-a' }), directCallClient),
  /Brand Twitch management permission/i,
)
assert.equal(directCallClient.created.length, 0)

const unscopedClient = makeClient({ commandBrandId: null })
await handleUpdateManagedTwitchCommand(event('admin-a', ['Admin'], { commandId: 'command-a', brandId: 'brand-a', reply: 'Remediated' }), unscopedClient)
assert.equal(unscopedClient.updated[0].brandId, 'brand-a')
await assert.rejects(
  handleUpdateManagedTwitchCommand(event('owner-a', ['Member'], { commandId: 'command-a', brandId: 'brand-a', reply: 'No remediation' }), makeClient({ commandBrandId: null })),
  /require platform-admin remediation/i,
)

console.log('managed Twitch command authorization tests passed')
