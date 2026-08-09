import assert from 'node:assert/strict'
import { BRAND_PERMISSION_KEYS, assertCanChangeBrandOwner, canManageBrandPermissions } from './policy'

assert.equal(BRAND_PERMISSION_KEYS.length, 5)
assert.ok(BRAND_PERMISSION_KEYS.includes('brand.products.manage'))
assert.ok(BRAND_PERMISSION_KEYS.includes('brand.discord.manage'))
assert.equal(canManageBrandPermissions(false, 'owner-1', 'owner-1'), true)
assert.equal(canManageBrandPermissions(false, 'owner-1', 'owner-2'), false)
assert.equal(canManageBrandPermissions(false, 'new-owner', 'new-owner'), true)
assert.equal(canManageBrandPermissions(true, 'staff-1', 'owner-2'), true)
assert.doesNotThrow(() => assertCanChangeBrandOwner(true))
assert.throws(() => assertCanChangeBrandOwner(false), /Only platform/i)
console.log('brand permission catalog tests passed')
