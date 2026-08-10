import assert from 'node:assert/strict'
import { assertPlatformControlAssignments, getEffectiveIdentityGroups, resolveEffectivePermissionKeys } from './effectivePermissions'

const definitions = [
  { key: 'forums.moderate', isActive: true },
  { key: 'forums.view', isActive: true },
  { key: 'orders.view', isActive: true },
]
const assignments = [
  { groupName: 'Moderator', permissionKey: 'forums.moderate', enabled: true },
  { groupName: 'Member', permissionKey: 'forums.view', enabled: true },
  { groupName: 'Staff', permissionKey: 'orders.view', enabled: true },
  { groupName: 'Trainer', permissionKey: 'forums.moderate', enabled: false },
]

const permissionKeys = (groups?: string[]) => resolveEffectivePermissionKeys(
  { claims: groups ? { 'cognito:groups': groups } : {} },
  definitions,
  assignments,
  [],
)

assert.equal(permissionKeys(['Moderator', 'Member']).has('forums.moderate'), true)
assert.equal(permissionKeys(['Moderator', 'Member']).has('forums.view'), true)
assert.equal(permissionKeys(['Trainer']).has('forums.moderate'), false)

assert.deepEqual(
  [...getEffectiveIdentityGroups({ claims: { 'cognito:groups': ['SuperAdmin'] } })],
  ['SuperAdmin', 'Admin', 'Staff', 'Moderator'],
  'SuperAdmin Cognito claims inherit platform administration groups',
)
assert.equal(permissionKeys(['SuperAdmin']).has('orders.view'), true)
assert.equal(permissionKeys(['SuperAdmin']).has('forums.moderate'), true)
assert.deepEqual(
  [...getEffectiveIdentityGroups({ claims: { 'cognito:groups': ['Admin'] } })],
  ['Admin', 'Staff', 'Moderator'],
  'Admin remains recognised and inherits operational groups',
)
assert.equal(permissionKeys(['Member']).has('orders.view'), false, 'normal users do not gain admin access')
assert.equal(permissionKeys().has('orders.view'), false, 'missing groups do not gain admin access')

assert.equal(resolveEffectivePermissionKeys(
  { claims: { 'cognito:groups': ['Admin'] } },
  [{ key: 'users.manage', isActive: true }],
  [{ groupName: 'SuperAdmin', permissionKey: 'users.manage', enabled: true }],
  [],
).has('users.manage'), false, 'Admin must not inherit a SuperAdmin-only catalog grant')
assert.throws(() => assertPlatformControlAssignments('Admin', [], ['SuperAdmin', 'Admin'], ['permissions.manage']), /cannot be removed/i)
assert.doesNotThrow(() => assertPlatformControlAssignments('Moderator', [], ['SuperAdmin', 'Admin'], ['permissions.manage']))

console.log('effective global permission resolver tests passed')
