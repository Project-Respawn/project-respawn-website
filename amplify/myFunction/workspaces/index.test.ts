import assert from 'node:assert/strict'
import test from 'node:test'
import {
  handleAddWorkspaceMember,
  handleCreateCreatorWorkspace,
  handleGetCreatorWorkspace,
  handleGetMyWorkspacePermissions,
  handleListMyCreatorWorkspaces,
  handleListWorkspaceMembers,
  handleRevokeWorkspaceMember,
  handleSetWorkspaceMemberPermissions,
} from './index'

const userASub = '123e4567-e89b-42d3-a456-426614174000'
const userBSub = '6ba7b810-9dad-41d1-80b4-00c04fd430c8'

function event(sub: string | undefined, username: string, arguments_: Record<string, unknown> = {}) {
  return {
    identity: sub ? { sub, username, claims: { sub, 'cognito:username': username } } : { username },
    arguments: arguments_,
  }
}

function makeClient(seed: any[] = []) {
  const records = seed.map((item) => ({ ...item }))
  const memberships: any[] = []
  const permissionRows: any[] = []
  const permissionSets: any[] = []
  const audits: any[] = []
  const createInputs: any[] = []
  return {
    records,
    memberships,
    permissionRows,
    permissionSets,
    audits,
    createInputs,
    models: {
      CreatorWorkspaceRecord: {
        create: async (input: any) => {
          createInputs.push(input)
          const now = '2026-08-20T12:00:00.000Z'
          const record = { id: `workspace-${records.length + 1}`, createdAt: now, updatedAt: now, ...input }
          records.push(record)
          return { data: record }
        },
        get: async ({ id }: { id: string }) => ({ data: records.find((item) => item.id === id) || null }),
        list: async ({ filter }: any) => ({
          data: records.filter((item) => item.ownerUserId === filter.ownerUserId.eq),
          nextToken: null,
        }),
      },
      WorkspaceMembership: {
        create: async (input: any) => {
          const now = '2026-08-20T12:00:00.000Z'
          const record = { createdAt: now, updatedAt: now, ...input }
          memberships.push(record)
          return { data: record }
        },
        get: async ({ id }: { id: string }) => ({ data: memberships.find((item) => item.id === id) || null }),
        update: async (input: any) => {
          const index = memberships.findIndex((item) => item.id === input.id)
          if (index < 0) return { data: null, errors: [{ message: 'Membership not found' }] }
          memberships[index] = { ...memberships[index], ...input, updatedAt: '2026-08-20T13:00:00.000Z' }
          return { data: memberships[index] }
        },
        list: async ({ filter }: any) => ({
          data: memberships.filter((item) => item.workspaceId === filter.workspaceId.eq),
          nextToken: null,
        }),
      },
      WorkspaceMembershipPermission: {
        create: async (input: any) => {
          const row = { createdAt: '2026-08-20T12:00:00.000Z', updatedAt: '2026-08-20T12:00:00.000Z', ...input }
          permissionRows.push(row)
          return { data: row }
        },
        delete: async ({ id }: { id: string }) => {
          const index = permissionRows.findIndex((item) => item.id === id)
          if (index >= 0) permissionRows.splice(index, 1)
          return { data: { id } }
        },
        list: async () => ({ data: permissionRows, nextToken: null }),
      },
      WorkspaceMembershipPermissionSet: {
        create: async (input: any) => {
          if (permissionSets.some((item) => item.id === input.id)) return { data: null, errors: [{ message: 'Already exists' }] }
          const row = { ...input }
          permissionSets.push(row)
          return { data: row }
        },
        get: async ({ id }: { id: string }) => ({ data: permissionSets.find((item) => item.id === id) || null }),
        update: async (input: any) => {
          const index = permissionSets.findIndex((item) => item.id === input.id)
          if (index < 0) return { data: null, errors: [{ message: 'Permission set not found' }] }
          permissionSets[index] = { ...permissionSets[index], ...input }
          return { data: permissionSets[index] }
        },
      },
      PermissionAuditEvent: {
        create: async (input: any) => { audits.push(input); return { data: input } },
      },
    },
    graphql: async ({ variables }: any) => {
      const index = permissionSets.findIndex((item) => item.id === variables.input.id)
      const current = permissionSets[index]
      if (!current || current.permissionGeneration !== variables.condition.permissionGeneration.eq || current.revision !== variables.condition.revision.eq) {
        return { errors: [{ errorType: 'DynamoDB:ConditionalCheckFailedException', message: 'The conditional request failed' }] }
      }
      permissionSets[index] = { ...current, ...variables.input }
      return { data: { updateWorkspaceMembershipPermissionSet: permissionSets[index] } }
    },
  }
}

test('authenticated creator creates a Workspace owned by sub, never username or client owner input', async () => {
  const client = makeClient()
  const created = await handleCreateCreatorWorkspace(event(userASub, 'creator-a', {
    name: ' Creator A Workspace ',
    ownerUserId: userBSub,
  }), client)

  assert.equal(created.ownerUserId, userASub)
  assert.equal(created.name, 'Creator A Workspace')
  assert.deepEqual(client.createInputs[0], { ownerUserId: userASub, name: 'Creator A Workspace' })
})

test('Workspace creation rejects missing, malformed, or unauthenticated Cognito sub', async () => {
  const client = makeClient()
  await assert.rejects(handleCreateCreatorWorkspace(event(undefined, 'username-only', { name: 'No sub' }), client), /Cognito sub is required/)
  await assert.rejects(handleCreateCreatorWorkspace(event('not-a-cognito-sub', 'creator-a', { name: 'Bad sub' }), client), /Cognito sub is required/)
  await assert.rejects(handleCreateCreatorWorkspace({ identity: undefined, arguments: { name: 'Anonymous' } }, client), /Cognito sub is required/)
  assert.equal(client.createInputs.length, 0)
})

test('owner can retrieve a Workspace and another authenticated user is denied by ID', async () => {
  const client = makeClient()
  const created = await handleCreateCreatorWorkspace(event(userASub, 'creator-a', { name: 'Workspace A' }), client)

  assert.deepEqual(await handleGetCreatorWorkspace(event(userASub, 'creator-a', { workspaceId: created.id }), client), created)
  await assert.rejects(
    handleGetCreatorWorkspace(event(userBSub, 'creator-b', { workspaceId: created.id }), client),
    /access is denied/,
  )
})

test('list returns only Workspaces owned by the authenticated canonical sub', async () => {
  const now = '2026-08-20T12:00:00.000Z'
  const client = makeClient([
    { id: 'workspace-a2', ownerUserId: userASub, name: 'Zulu', createdAt: now, updatedAt: now },
    { id: 'workspace-b1', ownerUserId: userBSub, name: 'Beta', createdAt: now, updatedAt: now },
    { id: 'workspace-a1', ownerUserId: userASub, name: 'Alpha', createdAt: now, updatedAt: now },
  ])

  assert.deepEqual((await handleListMyCreatorWorkspaces(event(userASub, 'creator-a'), client)).map((item) => item.id), ['workspace-a1', 'workspace-a2'])
  assert.deepEqual((await handleListMyCreatorWorkspaces(event(userBSub, 'creator-b'), client)).map((item) => item.id), ['workspace-b1'])
})

test('owner adds, lists, revokes, and reactivates a canonical-sub collaborator', async () => {
  const client = makeClient()
  const workspace = await handleCreateCreatorWorkspace(event(userASub, 'creator-a', { name: 'Workspace A' }), client)

  const added = await handleAddWorkspaceMember(event(userASub, 'creator-a', {
    workspaceId: workspace.id,
    targetUserId: userBSub,
    userId: 'spoofed-username',
  }), client)
  assert.equal(added.userId, userBSub)
  assert.equal(added.status, 'ACTIVE')
  assert.equal(added.addedByUserId, userASub)

  const ownerView = await handleListWorkspaceMembers(event(userASub, 'creator-a', { workspaceId: workspace.id }), client)
  assert.equal(ownerView.ownerUserId, userASub)
  assert.deepEqual(ownerView.memberships.map((item) => item.userId), [userBSub])

  const collaboratorView = await handleListWorkspaceMembers(event(userBSub, 'creator-b', { workspaceId: workspace.id }), client)
  assert.deepEqual(collaboratorView, ownerView)

  const revoked = await handleRevokeWorkspaceMember(event(userASub, 'creator-a', {
    workspaceId: workspace.id,
    targetUserId: userBSub,
  }), client)
  assert.equal(revoked.status, 'REVOKED')
  assert.equal(revoked.revokedByUserId, userASub)
  assert.ok(revoked.revokedAt)
  await assert.rejects(
    handleListWorkspaceMembers(event(userBSub, 'creator-b', { workspaceId: workspace.id }), client),
    /access is denied/,
  )

  const reactivated = await handleAddWorkspaceMember(event(userASub, 'creator-a', {
    workspaceId: workspace.id,
    targetUserId: userBSub,
  }), client)
  assert.equal(reactivated.status, 'ACTIVE')
  assert.equal(reactivated.revokedAt, null)
  assert.equal(client.memberships.length, 1)
})

test('owner cannot add themselves and duplicate active membership is rejected', async () => {
  const client = makeClient()
  const workspace = await handleCreateCreatorWorkspace(event(userASub, 'creator-a', { name: 'Workspace A' }), client)
  await assert.rejects(
    handleAddWorkspaceMember(event(userASub, 'creator-a', { workspaceId: workspace.id, targetUserId: userASub }), client),
    /owner cannot be added/i,
  )
  await handleAddWorkspaceMember(event(userASub, 'creator-a', { workspaceId: workspace.id, targetUserId: userBSub }), client)
  await assert.rejects(
    handleAddWorkspaceMember(event(userASub, 'creator-a', { workspaceId: workspace.id, targetUserId: userBSub }), client),
    /already exists/,
  )
})

test('collaborator can read but cannot manage membership or ownership', async () => {
  const client = makeClient()
  const workspace = await handleCreateCreatorWorkspace(event(userASub, 'creator-a', { name: 'Workspace A' }), client)
  await handleAddWorkspaceMember(event(userASub, 'creator-a', { workspaceId: workspace.id, targetUserId: userBSub }), client)
  await handleListWorkspaceMembers(event(userBSub, 'creator-b', { workspaceId: workspace.id }), client)

  const userCSub = '16fd2706-8baf-433b-82eb-8c7fada847da'
  await assert.rejects(
    handleAddWorkspaceMember(event(userBSub, 'creator-b', { workspaceId: workspace.id, targetUserId: userCSub }), client),
    /owner access is required/,
  )
  await assert.rejects(
    handleRevokeWorkspaceMember(event(userBSub, 'creator-b', { workspaceId: workspace.id, targetUserId: userBSub }), client),
    /owner access is required/,
  )
  await assert.rejects(
    handleRevokeWorkspaceMember(event(userASub, 'creator-a', { workspaceId: workspace.id, targetUserId: userASub }), client),
    /ownership cannot be revoked/,
  )
  assert.equal(client.records[0].ownerUserId, userASub)
})

test('cross-Workspace ID guessing never grants membership visibility or management', async () => {
  const client = makeClient()
  const workspaceA = await handleCreateCreatorWorkspace(event(userASub, 'creator-a', { name: 'Workspace A' }), client)
  const workspaceB = await handleCreateCreatorWorkspace(event(userBSub, 'creator-b', { name: 'Workspace B' }), client)
  const collaboratorCSub = '16fd2706-8baf-433b-82eb-8c7fada847da'

  await assert.rejects(handleListWorkspaceMembers(event(collaboratorCSub, 'creator-c', { workspaceId: workspaceA.id }), client), /access is denied/)
  await handleAddWorkspaceMember(event(userASub, 'creator-a', { workspaceId: workspaceA.id, targetUserId: collaboratorCSub }), client)
  await handleListWorkspaceMembers(event(collaboratorCSub, 'creator-c', { workspaceId: workspaceA.id }), client)

  await assert.rejects(handleListWorkspaceMembers(event(userBSub, 'creator-b', { workspaceId: workspaceA.id }), client), /access is denied/)
  await assert.rejects(handleAddWorkspaceMember(event(userBSub, 'creator-b', { workspaceId: workspaceA.id, targetUserId: userBSub }), client), /owner access is required/)
  await assert.rejects(handleRevokeWorkspaceMember(event(userBSub, 'creator-b', { workspaceId: workspaceA.id, targetUserId: collaboratorCSub }), client), /owner access is required/)
  await assert.rejects(handleListWorkspaceMembers(event(collaboratorCSub, 'creator-c', { workspaceId: workspaceB.id }), client), /access is denied/)

  await handleRevokeWorkspaceMember(event(userASub, 'creator-a', { workspaceId: workspaceA.id, targetUserId: collaboratorCSub }), client)
  await assert.rejects(handleListWorkspaceMembers(event(collaboratorCSub, 'creator-c', { workspaceId: workspaceA.id }), client), /access is denied/)
})

test('owner has all capabilities and explicitly manages only active collaborator capabilities', async () => {
  const client = makeClient()
  const workspace = await handleCreateCreatorWorkspace(event(userASub, 'owner-username', { name: 'Workspace A' }), client)
  await handleAddWorkspaceMember(event(userASub, 'owner-username', { workspaceId: workspace.id, targetUserId: userBSub }), client)

  const ownerPermissions = await handleGetMyWorkspacePermissions(event(userASub, 'owner-username', { workspaceId: workspace.id }), client)
  assert.equal(ownerPermissions.isOwner, true)
  assert.deepEqual(ownerPermissions.permissionKeys, [
    'workspace.discord.manage',
    'workspace.engagement.view',
    'workspace.members.manage',
    'workspace.overlays.manage',
    'workspace.profile.manage',
    'workspace.twitch.manage',
  ])

  const assigned = await handleSetWorkspaceMemberPermissions(event(userASub, 'owner-username', {
    workspaceId: workspace.id,
    targetUserId: userBSub,
    permissionKeys: ['workspace.overlays.manage', 'workspace.engagement.view'],
    expectedPermissionGeneration: 1,
    expectedRevision: 0,
  }), client)
  assert.deepEqual(assigned.permissionKeys, ['workspace.engagement.view', 'workspace.overlays.manage'])
  assert.ok(client.permissionRows.every((row) => row.assignedByUserId === userASub))
  assert.equal(client.audits.at(-1).actorUserId, userASub)
  assert.deepEqual(JSON.parse(client.audits.at(-1).before), {
    workspaceId: workspace.id, userId: userBSub, permissionKeys: [],
  })
  assert.deepEqual(JSON.parse(client.audits.at(-1).after), {
    workspaceId: workspace.id, userId: userBSub,
    permissionKeys: ['workspace.engagement.view', 'workspace.overlays.manage'],
  })

  const collaboratorPermissions = await handleGetMyWorkspacePermissions(event(userBSub, 'different-username', { workspaceId: workspace.id }), client)
  assert.equal(collaboratorPermissions.isOwner, false)
  assert.deepEqual(collaboratorPermissions.permissionKeys, ['workspace.engagement.view', 'workspace.overlays.manage'])

  const updated = await handleSetWorkspaceMemberPermissions(event(userASub, 'owner-username', {
    workspaceId: workspace.id,
    targetUserId: userBSub,
    permissionKeys: ['workspace.twitch.manage'],
    expectedPermissionGeneration: 1,
    expectedRevision: 1,
  }), client)
  assert.deepEqual(updated.permissionKeys, ['workspace.twitch.manage'])

  const removed = await handleSetWorkspaceMemberPermissions(event(userASub, 'owner-username', {
    workspaceId: workspace.id,
    targetUserId: userBSub,
    permissionKeys: [],
    expectedPermissionGeneration: 1,
    expectedRevision: 2,
  }), client)
  assert.deepEqual(removed.permissionKeys, [])
  assert.equal(client.permissionRows.length, 0)
})

test('unknown permissions and collaborator permission mutations are denied', async () => {
  const client = makeClient()
  const workspace = await handleCreateCreatorWorkspace(event(userASub, 'owner-name', { name: 'Workspace A' }), client)
  await handleAddWorkspaceMember(event(userASub, 'owner-name', { workspaceId: workspace.id, targetUserId: userBSub }), client)
  const userCSub = '16fd2706-8baf-433b-82eb-8c7fada847da'
  await handleAddWorkspaceMember(event(userASub, 'owner-name', { workspaceId: workspace.id, targetUserId: userCSub }), client)

  await assert.rejects(handleSetWorkspaceMemberPermissions(event(userASub, 'owner-name', {
    workspaceId: workspace.id, targetUserId: userBSub, permissionKeys: ['workspace.invented.manage'],
    expectedPermissionGeneration: 1, expectedRevision: 0,
  }), client), /Unknown Workspace permission key/)
  await assert.rejects(handleSetWorkspaceMemberPermissions(event(userBSub, 'collaborator-name', {
    workspaceId: workspace.id, targetUserId: userBSub, permissionKeys: ['workspace.twitch.manage'],
    expectedPermissionGeneration: 1, expectedRevision: 0,
  }), client), /owner access is required/)
  await assert.rejects(handleSetWorkspaceMemberPermissions(event(userBSub, 'collaborator-name', {
    workspaceId: workspace.id, targetUserId: userCSub, permissionKeys: ['workspace.twitch.manage'],
    expectedPermissionGeneration: 1, expectedRevision: 0,
  }), client), /owner access is required/)
})

test('revocation clears permissions and reactivation does not restore them', async () => {
  const client = makeClient()
  const workspace = await handleCreateCreatorWorkspace(event(userASub, 'owner-name', { name: 'Workspace A' }), client)
  await handleAddWorkspaceMember(event(userASub, 'owner-name', { workspaceId: workspace.id, targetUserId: userBSub }), client)
  await handleSetWorkspaceMemberPermissions(event(userASub, 'owner-name', {
    workspaceId: workspace.id, targetUserId: userBSub, permissionKeys: ['workspace.discord.manage'],
    expectedPermissionGeneration: 1, expectedRevision: 0,
  }), client)
  await handleRevokeWorkspaceMember(event(userASub, 'owner-name', { workspaceId: workspace.id, targetUserId: userBSub }), client)
  assert.equal(client.permissionRows.length, 0)
  await assert.rejects(handleGetMyWorkspacePermissions(event(userBSub, 'collaborator-name', { workspaceId: workspace.id }), client), /access is denied/)

  await handleAddWorkspaceMember(event(userASub, 'owner-name', { workspaceId: workspace.id, targetUserId: userBSub }), client)
  assert.deepEqual((await handleGetMyWorkspacePermissions(event(userBSub, 'collaborator-name', { workspaceId: workspace.id }), client)).permissionKeys, [])
})

test('permission mutations cannot cross Workspace or membership boundaries', async () => {
  const client = makeClient()
  const workspaceA = await handleCreateCreatorWorkspace(event(userASub, 'owner-a', { name: 'Workspace A' }), client)
  const workspaceB = await handleCreateCreatorWorkspace(event(userBSub, 'owner-b', { name: 'Workspace B' }), client)
  const collaboratorCSub = '16fd2706-8baf-433b-82eb-8c7fada847da'
  await handleAddWorkspaceMember(event(userASub, 'owner-a', { workspaceId: workspaceA.id, targetUserId: collaboratorCSub }), client)

  await assert.rejects(handleSetWorkspaceMemberPermissions(event(userASub, 'owner-a', {
    workspaceId: workspaceB.id, targetUserId: collaboratorCSub, permissionKeys: ['workspace.profile.manage'],
    expectedPermissionGeneration: 1, expectedRevision: 0,
  }), client), /owner access is required/)
  await assert.rejects(handleSetWorkspaceMemberPermissions(event(userBSub, 'owner-b', {
    workspaceId: workspaceB.id, targetUserId: collaboratorCSub, permissionKeys: ['workspace.profile.manage'],
    expectedPermissionGeneration: 1, expectedRevision: 0,
  }), client), /membership not found/)
  await assert.rejects(handleGetMyWorkspacePermissions(event(collaboratorCSub, 'collaborator-c', { workspaceId: workspaceB.id }), client), /access is denied/)
})

test('active collaborators do not see revoked former collaborators', async () => {
  const client = makeClient()
  const workspace = await handleCreateCreatorWorkspace(event(userASub, 'owner-a', { name: 'Workspace A' }), client)
  const collaboratorCSub = '16fd2706-8baf-433b-82eb-8c7fada847da'
  await handleAddWorkspaceMember(event(userASub, 'owner-a', { workspaceId: workspace.id, targetUserId: userBSub }), client)
  await handleAddWorkspaceMember(event(userASub, 'owner-a', { workspaceId: workspace.id, targetUserId: collaboratorCSub }), client)
  await handleRevokeWorkspaceMember(event(userASub, 'owner-a', { workspaceId: workspace.id, targetUserId: collaboratorCSub }), client)

  const ownerView = await handleListWorkspaceMembers(event(userASub, 'owner-a', { workspaceId: workspace.id }), client)
  assert.equal(ownerView.memberships.some((item) => item.userId === collaboratorCSub && item.status === 'REVOKED'), true)
  const memberView = await handleListWorkspaceMembers(event(userBSub, 'member-b', { workspaceId: workspace.id }), client)
  assert.equal(memberView.memberships.some((item) => item.userId === collaboratorCSub), false)
})

test('same-revision permission replacements conflict instead of merging', async () => {
  const client = makeClient()
  const workspace = await handleCreateCreatorWorkspace(event(userASub, 'owner', { name: 'Workspace A' }), client)
  await handleAddWorkspaceMember(event(userASub, 'owner', { workspaceId: workspace.id, targetUserId: userBSub }), client)

  const first = await handleSetWorkspaceMemberPermissions(event(userASub, 'owner', {
    workspaceId: workspace.id, targetUserId: userBSub,
    permissionKeys: ['workspace.twitch.manage'], expectedPermissionGeneration: 1, expectedRevision: 0,
  }), client)
  assert.equal(first.revision, 1)
  await assert.rejects(handleSetWorkspaceMemberPermissions(event(userASub, 'owner', {
    workspaceId: workspace.id, targetUserId: userBSub,
    permissionKeys: ['workspace.discord.manage'], expectedPermissionGeneration: 1, expectedRevision: 0,
  }), client), /changed; refresh and try again/)

  const read = await handleGetMyWorkspacePermissions(event(userBSub, 'member', { workspaceId: workspace.id }), client)
  assert.deepEqual(read.permissionKeys, ['workspace.twitch.manage'])
  assert.equal(read.revision, 1)
  assert.equal(client.audits.length, 1)
})

test('permission-row projection failure cannot change effective permission state or report success', async () => {
  const client = makeClient()
  const workspace = await handleCreateCreatorWorkspace(event(userASub, 'owner', { name: 'Workspace A' }), client)
  await handleAddWorkspaceMember(event(userASub, 'owner', { workspaceId: workspace.id, targetUserId: userBSub }), client)
  client.models.WorkspaceMembershipPermission.create = async () => ({ data: null, errors: [{ message: 'Injected projection failure' }] })

  await assert.rejects(handleSetWorkspaceMemberPermissions(event(userASub, 'owner', {
    workspaceId: workspace.id, targetUserId: userBSub,
    permissionKeys: ['workspace.overlays.manage'], expectedPermissionGeneration: 1, expectedRevision: 0,
  }), client), /Injected projection failure/)
  const read = await handleGetMyWorkspacePermissions(event(userBSub, 'member', { workspaceId: workspace.id }), client)
  assert.deepEqual(read.permissionKeys, [])
  assert.equal(read.revision, 0)
  assert.equal(client.audits.length, 0)
})

test('revocation and reactivation invalidate pre-revocation permission edits', async () => {
  const client = makeClient()
  const workspace = await handleCreateCreatorWorkspace(event(userASub, 'owner', { name: 'Workspace A' }), client)
  await handleAddWorkspaceMember(event(userASub, 'owner', { workspaceId: workspace.id, targetUserId: userBSub }), client)
  await handleSetWorkspaceMemberPermissions(event(userASub, 'owner', {
    workspaceId: workspace.id, targetUserId: userBSub,
    permissionKeys: ['workspace.discord.manage'], expectedPermissionGeneration: 1, expectedRevision: 0,
  }), client)
  await handleRevokeWorkspaceMember(event(userASub, 'owner', { workspaceId: workspace.id, targetUserId: userBSub }), client)

  await assert.rejects(handleSetWorkspaceMemberPermissions(event(userASub, 'owner', {
    workspaceId: workspace.id, targetUserId: userBSub,
    permissionKeys: ['workspace.twitch.manage'], expectedPermissionGeneration: 1, expectedRevision: 1,
  }), client), /must be active/)
  await handleAddWorkspaceMember(event(userASub, 'owner', { workspaceId: workspace.id, targetUserId: userBSub }), client)
  const reset = await handleGetMyWorkspacePermissions(event(userBSub, 'member', { workspaceId: workspace.id }), client)
  assert.deepEqual(reset.permissionKeys, [])
  assert.equal(reset.permissionGeneration, 3)
  assert.equal(reset.revision, 0)
  await assert.rejects(handleSetWorkspaceMemberPermissions(event(userASub, 'owner', {
    workspaceId: workspace.id, targetUserId: userBSub,
    permissionKeys: ['workspace.twitch.manage'], expectedPermissionGeneration: 1, expectedRevision: 1,
  }), client), /changed; refresh and try again/)

  const assigned = await handleSetWorkspaceMemberPermissions(event(userASub, 'owner', {
    workspaceId: workspace.id, targetUserId: userBSub,
    permissionKeys: ['workspace.engagement.view'], expectedPermissionGeneration: 3, expectedRevision: 0,
  }), client)
  assert.deepEqual(assigned.permissionKeys, ['workspace.engagement.view'])
})
