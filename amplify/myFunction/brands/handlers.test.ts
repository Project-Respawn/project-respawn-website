import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { handleCreateBrand, handleSetBrandOwner } from './index'

function event(username: string, groups: string[], arguments_: Record<string, unknown>) {
  return { identity: { username, claims: { 'cognito:groups': groups } }, arguments: arguments_ }
}

function makeClient(createResult: any) {
  const created: any[] = []
  const persisted: any[] = []
  const audits: any[] = []
  return {
    created,
    persisted,
    audits,
    models: {
      Brand: { create: async (input: any) => { created.push(input); if (createResult.data) persisted.push(createResult.data); return createResult } },
      PermissionAuditEvent: { create: async (input: any) => { audits.push(input); return { data: input } } },
    },
  }
}

const successClient = makeClient({ data: { id: 'persisted-brand-id', name: 'Ravens' } })
const success = await handleCreateBrand(event('admin-a', ['Admin'], {
  name: 'Ravens', slug: 'ravens', ownerUserId: 'owner-a',
}), successClient)
assert.deepEqual(success, { success: true, message: 'Brand created', brandId: 'persisted-brand-id' })
assert.equal(successClient.created[0].id, undefined, 'the browser cannot supply or choose a Brand ID')
assert.equal(successClient.persisted[0].id, success.brandId, 'the command returns the ID of the persisted Brand')
assert.equal(successClient.audits[0].targetId, 'persisted-brand-id')
assert.deepEqual(successClient.audits[0].after, {
  id: 'persisted-brand-id', name: 'Ravens', slug: null, description: null, sortOrder: null,
  isActive: null, ownerUserId: null, ownerAssignedBy: null, ownerAssignedAt: null,
}, 'Brand creation audits a plain JSON snapshot rather than a generated model object')

const ownerlessClient = makeClient({ data: { id: 'ownerless-brand-id', name: 'Ownerless' } })
const ownerless = await handleCreateBrand(event('admin-a', ['Admin'], {
  name: 'Ownerless', slug: 'ownerless', ownerUserId: null,
}), ownerlessClient)
assert.equal(ownerless.brandId, 'ownerless-brand-id')
assert.equal(ownerlessClient.created[0].ownerUserId, null, 'a Brand can be created without an owner')
assert.equal(ownerlessClient.created[0].ownerAssignedBy, null)

const ownerUpdates: any[] = []
const ownerClient = {
  models: {
    Brand: {
      get: async () => ({ data: { id: 'persisted-brand-id', ownerUserId: 'old-owner' } }),
      update: async (input: any) => { ownerUpdates.push(input); return { data: input } },
    },
    PermissionAuditEvent: { create: async () => ({ data: {} }) },
  },
}
assert.deepEqual(
  await handleSetBrandOwner(event('admin-a', ['Admin'], { brandId: 'persisted-brand-id', ownerUserId: 'new-owner' }), ownerClient),
  { success: true, message: 'Brand owner updated', brandId: 'persisted-brand-id' },
)
assert.equal(ownerUpdates[0].ownerUserId, 'new-owner')
await assert.rejects(
  handleSetBrandOwner(event('new-owner', ['Member'], { brandId: 'persisted-brand-id', ownerUserId: 'another-owner' }), ownerClient),
  /Only platform brand administration/i,
)

const schema = readFileSync(new URL('../../data/resource.ts', import.meta.url), 'utf8')
const resultDefinition = schema.slice(schema.indexOf('BrandMutationResult: a.customType'), schema.indexOf('MerchProductMutationResult: a.customType'))
assert.match(resultDefinition, /brandId:\s*a\.id\(\),/, 'failure result objects must not violate a non-null Brand ID contract')

await assert.rejects(
  handleCreateBrand(event('admin-a', ['Admin'], { name: 'Ravens', slug: 'ravens' }), makeClient({ errors: [{ message: 'Brand slug already exists' }] })),
  /Brand slug already exists/,
)

await assert.rejects(
  handleCreateBrand(event('member-a', ['Member'], { name: 'Ravens', slug: 'ravens' }), makeClient({ data: { id: 'should-not-create' } })),
  /Only platform brand administration can change the Brand Owner/i,
)

console.log('managed Brand creation result tests passed')
