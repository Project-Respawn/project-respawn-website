import assert from 'node:assert/strict'
import { handleCreateBrand, handleSetBrandOwner } from '../brands'
import { handleCreateManagedEvent } from '../events/managedHandlers'
import { handleCreateManagedMerchProduct } from '../merch/handlers'
import { testPermissionModels } from './testPermissionModels'

const event = (arguments_: Record<string, unknown>) => ({
  identity: { username: 'staff-without-grant', claims: { 'cognito:groups': ['Staff'] } },
  arguments: arguments_,
})

const permissionModels = testPermissionModels(['brands.manage', 'products.edit', 'events.manage'], [])

let brandWrites = 0
let workspaceReads = 0
const deniedClient = { models: {
  ...permissionModels,
  CreatorWorkspaceRecord: { list: async () => { workspaceReads++; return { data: [] } } },
  Brand: {
    create: async () => { brandWrites++; return { data: { id: 'must-not-create' } } },
    update: async () => { brandWrites++; return { data: {} } },
  },
} }
for (const ownerUserId of [undefined, 'another-user']) {
  await assert.rejects(
    handleCreateBrand(event({ name: 'Denied', slug: 'denied', ownerUserId }), deniedClient),
    /only for their own Creator Workspace/i,
  )
}
assert.equal(workspaceReads, 0, 'reject foreign/omitted ownership before querying workspaces')
await assert.rejects(
  handleCreateBrand(event({ name: 'Denied', slug: 'denied', ownerUserId: 'staff-without-grant' }), deniedClient),
  /Exactly one owned Creator Workspace is required/i,
)
await assert.rejects(
  handleSetBrandOwner(event({ brandId: 'brand-a', ownerUserId: 'another-user' }), deniedClient),
  /platform brand administration/i,
)
assert.equal(brandWrites, 0, 'a Staff group label alone must never authorize Brand writes')

await assert.rejects(
  handleCreateManagedMerchProduct(event({
    title: 'Denied', slug: 'denied', sourceType: 'manual', status: 'draft', isVisible: false,
  }), { models: permissionModels }),
  /Permission products\.edit is required/i,
)

await assert.rejects(
  handleCreateManagedEvent(event({
    brandId: 'brand-a', title: 'Denied', description: 'Denied',
    startAt: '2026-08-10T10:00:00.000Z', endAt: '2026-08-10T11:00:00.000Z',
    locationType: 'online', status: 'draft',
  }), {
    models: {
      ...permissionModels,
      Brand: { get: async () => ({ data: { id: 'brand-a', ownerUserId: 'another-user' } }) },
      BrandAccess: { list: async () => ({ data: [] }) },
      BrandAccessPermission: { list: async () => ({ data: [] }) },
    },
  }),
  /Brand event management permission/i,
)

console.log('authoritative platform permission tests passed')
