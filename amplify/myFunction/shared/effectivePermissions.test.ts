import assert from 'node:assert/strict'
import { assertPlatformControlAssignments, resolveEffectivePermissionKeys } from './effectivePermissions'

const definitions = [{ key: 'forums.moderate', isActive: true }, { key: 'forums.view', isActive: true }]
const assignments = [
  { groupName: 'Moderator', permissionKey: 'forums.moderate', enabled: true },
  { groupName: 'Member', permissionKey: 'forums.view', enabled: true },
  { groupName: 'Trainer', permissionKey: 'forums.moderate', enabled: false },
]
assert.equal(resolveEffectivePermissionKeys({ claims: { 'cognito:groups': ['Moderator', 'Member'] } }, definitions, assignments, []).has('forums.moderate'), true)
assert.equal(resolveEffectivePermissionKeys({ claims: { 'cognito:groups': ['Moderator', 'Member'] } }, definitions, assignments, []).has('forums.view'), true)
assert.equal(resolveEffectivePermissionKeys({ claims: { 'cognito:groups': ['Trainer'] } }, definitions, assignments, []).has('forums.moderate'), false)
assert.equal(resolveEffectivePermissionKeys({ claims: { 'cognito:groups': ['Admin'] } }, definitions, assignments, []).has('forums.moderate'), false)
assert.equal(resolveEffectivePermissionKeys(
  { claims: { 'cognito:groups': ['Admin'] } },
  [{ key: 'users.manage', isActive: true }],
  [{ groupName: 'SuperAdmin', permissionKey: 'users.manage', enabled: true }],
  [],
).has('users.manage'), false, 'Admin must not inherit a SuperAdmin-only catalog grant')
assert.throws(() => assertPlatformControlAssignments('Admin', [], ['SuperAdmin', 'Admin'], ['permissions.manage']), /cannot be removed/i)
assert.doesNotThrow(() => assertPlatformControlAssignments('Moderator', [], ['SuperAdmin', 'Admin'], ['permissions.manage']))
console.log('effective global permission resolver tests passed')
