import assert from 'node:assert/strict'
import test from 'node:test'
import {
  assertWorkspaceAccess,
  assertWorkspaceOwner,
  hasWorkspaceAccess,
  assertWorkspacePermission,
  getEffectiveWorkspacePermissions,
  hasWorkspacePermission,
  isActiveWorkspaceMember,
  isWorkspaceOwner,
} from './access'

const workspace = { ownerUserId: 'owner-sub' }
const memberships = [
  { userId: 'active-sub', status: 'ACTIVE' },
  { userId: 'revoked-sub', status: 'REVOKED' },
]

test('owner and active-member access are distinct and revoked membership grants nothing', () => {
  assert.equal(isWorkspaceOwner(workspace, 'owner-sub'), true)
  assert.equal(isActiveWorkspaceMember(memberships, 'active-sub'), true)
  assert.equal(isActiveWorkspaceMember(memberships, 'revoked-sub'), false)
  assert.equal(hasWorkspaceAccess(workspace, memberships, 'owner-sub'), true)
  assert.equal(hasWorkspaceAccess(workspace, memberships, 'active-sub'), true)
  assert.equal(hasWorkspaceAccess(workspace, memberships, 'revoked-sub'), false)
  assert.doesNotThrow(() => assertWorkspaceOwner(workspace, 'owner-sub'))
  assert.throws(() => assertWorkspaceOwner(workspace, 'active-sub'), /owner access is required/)
  assert.throws(() => assertWorkspaceAccess(workspace, memberships, 'revoked-sub'), /access is denied/)
})

test('owner receives all capabilities while members receive only assigned valid capabilities', () => {
  const permissionRows = [
    { membershipId: 'membership-active', permissionKey: 'workspace.overlays.manage' },
    { membershipId: 'membership-revoked', permissionKey: 'workspace.twitch.manage' },
    { membershipId: 'membership-active', permissionKey: 'brand.twitch.manage' },
  ]
  const scopedMemberships = [
    { id: 'membership-active', userId: 'active-sub', status: 'ACTIVE' },
    { id: 'membership-revoked', userId: 'revoked-sub', status: 'REVOKED' },
  ]
  assert.equal(getEffectiveWorkspacePermissions(workspace, scopedMemberships, permissionRows, 'owner-sub').size, 6)
  assert.deepEqual([...getEffectiveWorkspacePermissions(workspace, scopedMemberships, permissionRows, 'active-sub')], ['workspace.overlays.manage'])
  assert.equal(getEffectiveWorkspacePermissions(workspace, scopedMemberships, permissionRows, 'revoked-sub').size, 0)
  assert.equal(getEffectiveWorkspacePermissions(workspace, scopedMemberships, permissionRows, 'unknown-sub').size, 0)
  assert.equal(hasWorkspacePermission(workspace, scopedMemberships, permissionRows, 'active-sub', 'workspace.overlays.manage'), true)
  assert.equal(hasWorkspacePermission(workspace, scopedMemberships, permissionRows, 'active-sub', 'workspace.twitch.manage'), false)
  assert.doesNotThrow(() => assertWorkspacePermission(workspace, scopedMemberships, permissionRows, 'owner-sub', 'workspace.discord.manage'))
  assert.throws(() => assertWorkspacePermission(workspace, scopedMemberships, permissionRows, 'active-sub', 'workspace.discord.manage'), /permission is required/)
})
