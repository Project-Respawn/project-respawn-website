import assert from 'node:assert/strict'
import test from 'node:test'
import { handleGetMyAccessContextWithClient } from './index'
import { WORKSPACE_PERMISSION_KEYS } from '../workspaces/access'

const userSub = '123e4567-e89b-42d3-a456-426614174000'
const otherSub = '6ba7b810-9dad-41d1-80b4-00c04fd430c8'
const thirdSub = '16fd2706-8baf-433b-82eb-8c7fada847da'

function event(sub = userSub, username = 'username-different-from-sub') {
  return { identity: { username, sub, claims: { sub, 'cognito:username': username, 'cognito:groups': ['Member'] } } }
}

function makeClient(options: {
  workspaces?: any[]
  memberships?: any[]
  permissionRows?: any[]
  permissionSets?: any[]
  brands?: any[]
  brandAccesses?: any[]
  brandPermissions?: any[]
} = {}) {
  const workspaces = options.workspaces || []
  const memberships = options.memberships || []
  const permissionRows = options.permissionRows || []
  const permissionSets = options.permissionSets || [...new Set(permissionRows.map((row) => row.membershipId))].map((membershipId) => ({
    id: `workspace-membership-permission-set:${membershipId}`,
    membershipId,
    permissionGeneration: memberships.find((membership) => membership.id === membershipId)?.permissionGeneration,
    permissionKeys: permissionRows.filter((row) => row.membershipId === membershipId).map((row) => row.permissionKey),
    revision: 1,
  }))
  const calls: any[] = []
  return {
    calls,
    models: {
      PermissionDefinition: { list: async () => ({ data: [], nextToken: null }) },
      GroupPermission: { list: async () => ({ data: [], nextToken: null }) },
      Brand: { list: async () => ({ data: options.brands || [], nextToken: null }) },
      BrandAccess: { list: async () => ({ data: options.brandAccesses || [], nextToken: null }) },
      BrandAccessPermission: { list: async () => ({ data: options.brandPermissions || [], nextToken: null }) },
      CreatorWorkspaceRecord: {
        listCreatorWorkspaceByOwnerUserId: async (input: any, queryOptions: any) => {
          calls.push(['owned', input, queryOptions])
          return { data: workspaces.filter((workspace) => workspace.ownerUserId === input.ownerUserId), nextToken: null }
        },
        get: async ({ id }: { id: string }) => ({ data: workspaces.find((workspace) => workspace.id === id) || null }),
      },
      WorkspaceMembership: {
        listWorkspaceMembershipByUserId: async (input: any, queryOptions: any) => {
          calls.push(['memberships', input, queryOptions])
          return { data: memberships.filter((membership) => membership.queriedFor === input.userId || membership.userId === input.userId), nextToken: null }
        },
      },
      WorkspaceMembershipPermission: {
        listWorkspaceMembershipPermissionByMembershipId: async (input: any, queryOptions: any) => {
          calls.push(['permissions', input, queryOptions])
          return { data: permissionRows.filter((row) => row.membershipId === input.membershipId), nextToken: null }
        },
      },
      WorkspaceMembershipPermissionSet: {
        get: async ({ id }: { id: string }) => ({ data: permissionSets.find((set) => set.id === id) || null }),
      },
    },
  }
}

test('access context returns owned and active collaborator Workspaces separately from Brands through indexed queries', async () => {
  const client = makeClient({
    workspaces: [
      { id: 'workspace-a', name: 'Owned A', ownerUserId: userSub },
      { id: 'workspace-b', name: 'Collaborator B', ownerUserId: otherSub },
      { id: 'workspace-c', name: 'Revoked C', ownerUserId: otherSub },
      { id: 'workspace-d', name: 'Unrelated D', ownerUserId: otherSub },
      { id: 'workspace-e', name: 'Zero Permission E', ownerUserId: otherSub },
    ],
    memberships: [
      { id: 'membership-b', workspaceId: 'workspace-b', userId: userSub, status: 'ACTIVE' },
      { id: 'membership-c', workspaceId: 'workspace-c', userId: userSub, status: 'REVOKED' },
      { id: 'membership-e', workspaceId: 'workspace-e', userId: userSub, status: 'ACTIVE' },
      { id: 'membership-foreign', workspaceId: 'workspace-d', userId: otherSub, queriedFor: userSub, status: 'ACTIVE' },
      { id: 'membership-missing', workspaceId: 'workspace-missing', userId: userSub, status: 'ACTIVE' },
      { id: '', workspaceId: 'workspace-d', userId: userSub, status: 'ACTIVE' },
    ],
    permissionRows: [
      { id: 'permission-overlay', membershipId: 'membership-b', permissionKey: 'workspace.overlays.manage' },
      { id: 'permission-brand', membershipId: 'membership-b', permissionKey: 'brand.twitch.manage' },
      { id: 'permission-invalid', membershipId: 'membership-b', permissionKey: 'workspace.unknown.manage' },
      { id: 'permission-wrong-member', membershipId: 'membership-other', permissionKey: 'workspace.twitch.manage' },
    ],
    brands: [{ id: 'brand-a', name: 'Commercial Brand', ownerUserId: 'username-different-from-sub' }],
  })

  const result = await handleGetMyAccessContextWithClient(event(), client)
  assert.equal(result.userId, 'username-different-from-sub', 'legacy Brand context identity remains username-compatible')
  assert.deepEqual(result.brands.map((brand: any) => brand.brandId), ['brand-a'])
  assert.deepEqual(result.workspaces.map((workspace: any) => workspace.id), ['workspace-b', 'workspace-a', 'workspace-e'])

  const owned = result.workspaces.find((workspace: any) => workspace.id === 'workspace-a')
  assert.equal(owned.isOwner, true)
  assert.equal(owned.membershipStatus, null)
  assert.deepEqual(owned.permissionKeys, [...WORKSPACE_PERMISSION_KEYS].sort())
  const collaborator = result.workspaces.find((workspace: any) => workspace.id === 'workspace-b')
  assert.equal(collaborator.isOwner, false)
  assert.equal(collaborator.membershipStatus, 'ACTIVE')
  assert.deepEqual(collaborator.permissionKeys, ['workspace.overlays.manage'])
  assert.deepEqual(result.workspaces.find((workspace: any) => workspace.id === 'workspace-e').permissionKeys, [])

  assert.deepEqual(client.calls.find((call: any) => call[0] === 'owned')[1], { ownerUserId: userSub })
  assert.deepEqual(client.calls.find((call: any) => call[0] === 'memberships')[1], { userId: userSub })
  assert.ok(client.calls.every((call: any) => call[2].limit === 100))
})

test('revocation removes visibility and reactivation restores no old capability', async () => {
  const memberships = [{ id: 'membership-b', workspaceId: 'workspace-b', userId: userSub, status: 'ACTIVE' }]
  const permissionRows = [{ id: 'permission-overlay', membershipId: 'membership-b', permissionKey: 'workspace.overlays.manage' }]
  const permissionSets = [{ id: 'workspace-membership-permission-set:membership-b', membershipId: 'membership-b', permissionGeneration: undefined, revision: 1, permissionKeys: ['workspace.overlays.manage'] }]
  const client = makeClient({ workspaces: [{ id: 'workspace-b', name: 'Workspace B', ownerUserId: otherSub }], memberships, permissionRows, permissionSets })

  assert.deepEqual((await handleGetMyAccessContextWithClient(event(), client)).workspaces[0].permissionKeys, ['workspace.overlays.manage'])
  memberships[0].status = 'REVOKED'
  assert.deepEqual((await handleGetMyAccessContextWithClient(event(), client)).workspaces, [])
  permissionRows.splice(0)
  permissionSets[0].permissionKeys = []
  memberships[0].status = 'ACTIVE'
  assert.deepEqual((await handleGetMyAccessContextWithClient(event(), client)).workspaces[0].permissionKeys, [])
})

test('owner plus accidental membership is deduplicated and owner authority wins', async () => {
  const client = makeClient({
    workspaces: [{ id: 'workspace-a', name: 'Workspace A', ownerUserId: userSub }],
    memberships: [{ id: 'membership-a', workspaceId: 'workspace-a', userId: userSub, status: 'ACTIVE' }],
    permissionRows: [{ id: 'permission-a', membershipId: 'membership-a', permissionKey: 'workspace.engagement.view' }],
  })
  const result = await handleGetMyAccessContextWithClient(event(), client)
  assert.equal(result.workspaces.length, 1)
  assert.equal(result.workspaces[0].isOwner, true)
  assert.deepEqual(result.workspaces[0].permissionKeys, [...WORKSPACE_PERMISSION_KEYS].sort())
})

test('Brand access alone never creates Workspace access and users remain isolated', async () => {
  const client = makeClient({
    workspaces: [{ id: 'workspace-other', name: 'Other Workspace', ownerUserId: otherSub }],
    brands: [{ id: 'brand-other', name: 'Other Brand', ownerUserId: otherSub }],
    brandAccesses: [{ id: 'brand-helper', brandId: 'brand-other', userId: 'brand-helper-name' }],
    brandPermissions: [{ id: 'brand-permission', brandAccessId: 'brand-helper', permissionKey: 'brand.twitch.manage' }],
  })
  const result = await handleGetMyAccessContextWithClient(event(thirdSub, 'brand-helper-name'), client)
  assert.deepEqual(result.brands.map((brand: any) => brand.brandId), ['brand-other'])
  assert.deepEqual(result.workspaces, [])
})
