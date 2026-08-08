import assert from 'node:assert/strict'
import { hasBrandDiscordManagePermission } from './policy'

const brand = { id: 'brand-a', ownerUserId: 'owner-a' }
assert.equal(hasBrandDiscordManagePermission('owner-a', brand, [], []), true)
assert.equal(hasBrandDiscordManagePermission('helper-a', brand, [{ id: 'access-a', brandId: 'brand-a', userId: 'helper-a', accessLevel: 'helper' }], [
  { brandAccessId: 'access-a', permissionKey: 'brand.discord.manage' },
]), true)
assert.equal(hasBrandDiscordManagePermission('helper-a', brand, [{ id: 'access-a', brandId: 'brand-a', userId: 'helper-a', accessLevel: 'helper' }], [
  { brandAccessId: 'access-b', permissionKey: 'brand.discord.manage' },
]), false)
console.log('managed Discord policy tests passed')
