import assert from 'node:assert/strict'
import { handleGetMyAccessContextWithClient } from './index'

const brands: Array<{ id: string; name: string; ownerUserId: string | null }> = [
  { id: 'brand-alpha', name: 'Alpha', ownerUserId: 'owner-user' },
  { id: 'brand-beta', name: 'Beta', ownerUserId: 'other-owner' },
  { id: 'brand-gamma', name: 'Gamma', ownerUserId: 'owner-user' },
  { id: 'brand-ownerless', name: 'Ownerless', ownerUserId: null },
]
const accesses = [
  { id: 'helper-alpha', brandId: 'brand-alpha', userId: 'helper-user' },
  { id: 'helper-beta', brandId: 'brand-beta', userId: 'multi-user' },
  { id: 'helper-gamma', brandId: 'brand-gamma', userId: 'multi-user' },
]
const accessPermissions = [
  { id: 'helper-alpha-events', brandAccessId: 'helper-alpha', permissionKey: 'brand.events.manage' },
  { id: 'helper-beta-products', brandAccessId: 'helper-beta', permissionKey: 'brand.products.manage' },
  { id: 'helper-gamma-twitch', brandAccessId: 'helper-gamma', permissionKey: 'brand.twitch.manage' },
]

function event(username: string, groups: string[]) {
  return { identity: { username, claims: { 'cognito:groups': groups } } }
}

function makeClient() {
  return {
    models: {
      Brand: { list: async () => ({ data: brands }) },
      BrandAccess: { list: async () => ({ data: accesses }) },
      BrandAccessPermission: { list: async () => ({ data: accessPermissions }) },
      PermissionDefinition: { list: async () => ({ data: [] }) },
      GroupPermission: { list: async () => ({ data: [] }) },
    },
  }
}

async function accessibleBrandIds(username: string, groups: string[]) {
  const result = await handleGetMyAccessContextWithClient(event(username, groups), makeClient())
  return result.brands.map((brand: any) => brand.brandId)
}

assert.deepEqual(await accessibleBrandIds('admin-user', ['Admin']), ['brand-alpha', 'brand-beta', 'brand-gamma', 'brand-ownerless'], 'Admin sees every Brand, including an ownerless Brand without BrandAccess rows')
assert.deepEqual(await accessibleBrandIds('staff-user', ['Staff']), ['brand-alpha', 'brand-beta', 'brand-gamma', 'brand-ownerless'], 'Staff sees every Brand through the platform override')
assert.deepEqual(await accessibleBrandIds('owner-user', ['Member']), ['brand-alpha', 'brand-gamma'], 'Owner sees Brands by canonical ownerUserId')
assert.deepEqual(await accessibleBrandIds('helper-user', ['Member']), ['brand-alpha'], 'Helper sees persisted BrandAccess')
assert.deepEqual(await accessibleBrandIds('unrelated-user', ['Member']), [], 'Unrelated user sees no Brands')
assert.deepEqual(await accessibleBrandIds('multi-user', ['Member']), ['brand-beta', 'brand-gamma'], 'Multiple Brand accesses are retained')

const newlyAssignedBrand = { id: 'brand-new', name: 'New Brand', ownerUserId: null as string | null }
brands.push(newlyAssignedBrand)
assert.deepEqual(await accessibleBrandIds('new-owner', ['Member']), [], 'Unassigned Brand is not visible to an unrelated user')
newlyAssignedBrand.ownerUserId = 'new-owner'
assert.deepEqual(await accessibleBrandIds('new-owner', ['Member']), ['brand-new'], 'A refreshed access context exposes a newly assigned owner without relogging')
brands.pop()

console.log('brand access-context resolver tests passed')
