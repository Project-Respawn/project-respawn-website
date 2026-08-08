import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  handleCloneEvent,
  handleCreateRecurringEventSeries,
  handleGenerateRecurringInstances,
} from './handlers'

function eventRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'event-a', brandId: 'brand-a', title: 'Brand event', description: 'Description',
    startAt: '2026-08-10T10:00:00.000Z', endAt: '2026-08-10T11:00:00.000Z',
    locationType: 'online', status: 'draft', eventType: 'single', ...overrides,
  }
}

function makeClient(options: { source?: any; accesses?: any[]; permissions?: any[] } = {}) {
  const created: any[] = []
  const updated: any[] = []
  const audits: any[] = []
  const source = options.source || eventRecord()
  return {
    created, updated, audits,
    models: {
      Brand: { get: async ({ id }: { id: string }) => ({ data: ['brand-a', 'brand-b'].includes(id) ? { id, ownerUserId: id === 'brand-a' ? 'owner-a' : 'owner-b' } : null }) },
      BrandAccess: { list: async () => ({ data: options.accesses || [] }) },
      BrandAccessPermission: { list: async () => ({ data: options.permissions || [] }) },
      PermissionAuditEvent: { create: async (input: any) => { audits.push(input); return { data: input } } },
      Event: {
        get: async () => ({ data: source }),
        list: async () => ({ data: [] }),
        create: async (input: any) => { created.push(input); return { data: { id: `created-${created.length}`, ...input } } },
        update: async (input: any) => { updated.push(input); return { data: input } },
      },
    },
  }
}

function resolverEvent(username: string, groups: string[], arguments_: Record<string, unknown>) {
  return { identity: { username, claims: { 'cognito:groups': groups } }, arguments: arguments_ }
}

const adminCloneClient = makeClient({ source: eventRecord({ brandId: 'brand-b' }) })
assert.equal((await handleCloneEvent(resolverEvent('admin-a', ['Admin'], { eventId: 'event-a' }), adminCloneClient)).success, true)
assert.equal(adminCloneClient.created[0].brandId, 'brand-b')
assert.equal(adminCloneClient.audits[0].action, 'event.clone')

const superAdminCloneClient = makeClient({ source: eventRecord({ brandId: 'brand-b' }) })
assert.equal((await handleCloneEvent(resolverEvent('super-admin-a', ['SuperAdmin'], { eventId: 'event-a' }), superAdminCloneClient)).success, true)

const staffCloneClient = makeClient({ source: eventRecord({ brandId: 'brand-b' }) })
assert.equal((await handleCloneEvent(resolverEvent('staff-a', ['Staff'], { eventId: 'event-a' }), staffCloneClient)).success, true)

const ownerCloneClient = makeClient()
assert.equal((await handleCloneEvent(resolverEvent('owner-a', ['Member'], { eventId: 'event-a', brandId: 'brand-b', identity: { username: 'spoofed' } }), ownerCloneClient)).success, true)
assert.equal(ownerCloneClient.created[0].brandId, 'brand-a')
assert.equal(ownerCloneClient.created[0].createdBy, 'owner-a')

const helperCloneClient = makeClient({
  accesses: [{ id: 'access-a', brandId: 'brand-a', userId: 'helper-a', accessLevel: 'helper' }],
  permissions: [{ brandAccessId: 'access-a', permissionKey: 'brand.events.manage' }],
})
assert.equal((await handleCloneEvent(resolverEvent('helper-a', ['Member'], { eventId: 'event-a' }), helperCloneClient)).success, true)

const deniedHelper = await handleCloneEvent(resolverEvent('helper-a', ['Member'], { eventId: 'event-a' }), makeClient())
assert.equal(deniedHelper.success, false)
assert.match(deniedHelper.message || '', /Brand event management permission/i)

const crossBrandOwner = await handleCloneEvent(resolverEvent('owner-a', ['Member'], { eventId: 'event-a' }), makeClient({ source: eventRecord({ brandId: 'brand-b' }) }))
assert.equal(crossBrandOwner.success, false)

const unscopedCloneClient = makeClient({ source: eventRecord({ brandId: null }) })
assert.equal((await handleCloneEvent(resolverEvent('admin-a', ['Admin'], { eventId: 'event-a' }), unscopedCloneClient)).success, false)
assert.equal(unscopedCloneClient.created.length, 0)

const recurringClient = makeClient()
const recurringResult = await handleCreateRecurringEventSeries(resolverEvent('owner-a', ['Member'], {
  eventId: 'event-a', recurrenceFrequency: 'daily', recurrenceCount: 2,
}), recurringClient)
assert.equal(recurringResult.success, true)
assert.equal(recurringClient.updated[0].updatedBy, 'owner-a')
assert.deepEqual(recurringClient.created.map((item) => item.brandId), ['brand-a'])
assert.equal(recurringClient.audits[0].action, 'event.recurring_series.create')

const generateClient = makeClient({
  source: eventRecord({ eventType: 'recurring-master', recurrenceFrequency: 'daily', recurrenceCount: 2, seriesId: 'series-a' }),
})
const generatedResult = await handleGenerateRecurringInstances(resolverEvent('owner-a', ['Member'], { masterEventId: 'event-a' }), generateClient)
assert.equal(generatedResult.success, true)
assert.deepEqual(generateClient.created.map((item) => item.brandId), ['brand-a'])
assert.equal(generateClient.audits[0].action, 'event.recurring_instances.generate')

const crossBrandGenerate = await handleGenerateRecurringInstances(
  resolverEvent('owner-a', ['Member'], { masterEventId: 'event-a', brandId: 'brand-a' }),
  makeClient({ source: eventRecord({ brandId: 'brand-b', eventType: 'recurring-master', recurrenceFrequency: 'daily', recurrenceCount: 2 }) }),
)
assert.equal(crossBrandGenerate.success, false)

const schema = readFileSync(new URL('../../data/resource.ts', import.meta.url), 'utf8')
for (const command of ['cloneEvent', 'createRecurringEventSeries', 'generateRecurringInstances']) {
  const start = schema.indexOf(`    ${command}: a`)
  const nextCommand = schema.indexOf('\n\n    ', start + 5)
  assert.match(schema.slice(start, nextCommand), /allow\.authenticated\(\)/)
}

console.log('legacy Event clone and recurrence authorization tests passed')
