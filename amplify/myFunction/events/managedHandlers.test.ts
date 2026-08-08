import assert from 'node:assert/strict'
import { handleCreateManagedEvent, handleUpdateManagedEvent } from './managedHandlers'

function makeClient(options: { eventBrandId?: string; brands?: string[]; accesses?: any[]; permissions?: any[] } = {}) {
  const created: any[] = []
  const updated: any[] = []
  const audits: any[] = []
  const brands = new Set(options.brands || ['brand-a', 'brand-b'])
  return {
    created,
    updated,
    audits,
    models: {
      Brand: {
        get: async ({ id }: { id: string }) => ({ data: brands.has(id) ? { id, ownerUserId: id === 'brand-a' ? 'owner-a' : 'owner-b' } : null }),
      },
      BrandAccess: { list: async () => ({ data: options.accesses || [] }) },
      BrandAccessPermission: { list: async () => ({ data: options.permissions || [] }) },
      Event: {
        get: async () => ({ data: { id: 'event-a', brandId: options.eventBrandId || 'brand-a', title: 'Existing' } }),
        create: async (input: any) => { created.push(input); return { data: { id: 'event-created', ...input } } },
        update: async (input: any) => { updated.push(input); return { data: input } },
      },
      PermissionAuditEvent: { create: async (input: any) => { audits.push(input); return { data: input } } },
    },
  }
}

function event(username: string, groups: string[], arguments_: Record<string, unknown>) {
  return { identity: { username, claims: { 'cognito:groups': groups } }, arguments: arguments_ }
}

const requiredCreateFields = {
  title: 'Managed event', description: 'Description', startAt: '2026-08-10T10:00:00.000Z',
  endAt: '2026-08-10T11:00:00.000Z', locationType: 'online', status: 'draft',
}

const adminClient = makeClient()
await handleCreateManagedEvent(event('admin-a', ['Admin'], { ...requiredCreateFields, brandId: 'brand-b' }), adminClient)
assert.equal(adminClient.created[0].brandId, 'brand-b')
assert.equal(adminClient.created[0].createdBy, 'admin-a')
assert.equal(adminClient.audits[0].action, 'event.create')

const staffClient = makeClient({ eventBrandId: 'brand-b' })
await handleUpdateManagedEvent(event('staff-a', ['Staff'], { eventId: 'event-a', brandId: 'brand-b', title: 'Staff update' }), staffClient)
assert.deepEqual(staffClient.updated, [{ id: 'event-a', title: 'Staff update', brandId: 'brand-b', updatedBy: 'staff-a' }])

const ownerClient = makeClient()
await handleUpdateManagedEvent(event('owner-a', ['Member'], { eventId: 'event-a', brandId: 'brand-a', title: 'Owner update' }), ownerClient)
assert.deepEqual(ownerClient.updated, [{ id: 'event-a', title: 'Owner update', updatedBy: 'owner-a' }])

const helperClient = makeClient({
  accesses: [{ id: 'access-a', brandId: 'brand-a', userId: 'helper-a', accessLevel: 'helper' }],
  permissions: [{ brandAccessId: 'access-a', brandId: 'brand-a', permissionKey: 'brand.events.manage' }],
})
await handleUpdateManagedEvent(event('helper-a', ['Member'], { eventId: 'event-a', brandId: 'brand-a', status: 'live' }), helperClient)
assert.equal(helperClient.updated[0].status, 'live')

await assert.rejects(
  handleUpdateManagedEvent(event('helper-a', ['Member'], { eventId: 'event-a', brandId: 'brand-a', title: 'Denied' }), makeClient()),
  /Brand event management permission/i,
)

await assert.rejects(
  handleUpdateManagedEvent(event('owner-a', ['Member'], { eventId: 'event-a', brandId: 'brand-a', title: 'Wrong brand' }), makeClient({ eventBrandId: 'brand-b' })),
  /does not belong to the selected brand/i,
)

await assert.rejects(
  handleUpdateManagedEvent(event('owner-a', ['Member'], { eventId: 'event-a', brandId: 'brand-b', title: 'Move event' }), makeClient()),
  /does not belong to the selected brand/i,
)

const directCallClient = makeClient()
await assert.rejects(
  handleCreateManagedEvent(event('untrusted-user', ['Member'], {
    ...requiredCreateFields, brandId: 'brand-a', createdBy: 'owner-a', groups: ['Admin'],
  }), directCallClient),
  /Brand event management permission/i,
)
assert.equal(directCallClient.created.length, 0)

console.log('managed Event command authorization tests passed')
