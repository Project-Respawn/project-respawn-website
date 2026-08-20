import { getCanonicalUserId, getResolverIdentity, requireCanonicalUserId } from '../shared/auth'
import { writePermissionAudit } from '../shared/audit'
import {
  ACTIVE_WORKSPACE_MEMBERSHIP,
  REVOKED_WORKSPACE_MEMBERSHIP,
  assertWorkspaceAccess,
  assertWorkspaceOwner,
  getEffectiveWorkspacePermissions,
  isWorkspaceOwner,
  normalizeWorkspacePermissionKeys,
} from './access'

function workspaceSummary(workspace: any) {
  return {
    id: workspace.id,
    ownerUserId: workspace.ownerUserId,
    name: workspace.name,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
  }
}

function membershipSummary(membership: any) {
  return {
    id: membership.id,
    workspaceId: membership.workspaceId,
    userId: membership.userId,
    status: membership.status,
    addedByUserId: membership.addedByUserId,
    revokedAt: membership.revokedAt || null,
    revokedByUserId: membership.revokedByUserId || null,
    permissionGeneration: membership.permissionGeneration,
    createdAt: membership.createdAt,
    updatedAt: membership.updatedAt,
  }
}

const PERMISSION_CONFLICT_MESSAGE = 'Workspace permissions changed; refresh and try again'

function permissionSetId(membershipId: string) {
  return `workspace-membership-permission-set:${membershipId}`
}

async function loadPermissionSet(client: any, membership: any) {
  const result = await client.models.WorkspaceMembershipPermissionSet.get({ id: permissionSetId(membership.id) })
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to load Workspace permission state')
  const data = result.data
  if (!data || data.membershipId !== membership.id || data.permissionGeneration !== membership.permissionGeneration) {
    return { permissionKeys: [], revision: 0, permissionGeneration: membership.permissionGeneration }
  }
  return {
    permissionKeys: normalizeWorkspacePermissionKeys(data.permissionKeys),
    revision: data.revision,
    permissionGeneration: data.permissionGeneration,
  }
}

async function createPermissionSet(client: any, membershipId: string, generation: number, actorId: string) {
  return client.models.WorkspaceMembershipPermissionSet.create({
    id: permissionSetId(membershipId), membershipId, permissionGeneration: generation,
    revision: 0, permissionKeys: [], updatedByUserId: actorId, updatedAt: new Date().toISOString(),
  })
}

const UPDATE_PERMISSION_SET = /* GraphQL */ `
  mutation UpdateWorkspaceMembershipPermissionSetConditionally(
    $input: UpdateWorkspaceMembershipPermissionSetInput!
    $condition: ModelWorkspaceMembershipPermissionSetConditionInput
  ) {
    updateWorkspaceMembershipPermissionSet(input: $input, condition: $condition) {
      id membershipId permissionGeneration revision permissionKeys updatedByUserId updatedAt
    }
  }
`

async function replacePermissionSetAtomically(client: any, input: any, expectedGeneration: number, expectedRevision: number) {
  const result = await client.graphql({
    query: UPDATE_PERMISSION_SET,
    variables: {
      input,
      condition: {
        permissionGeneration: { eq: expectedGeneration },
        revision: { eq: expectedRevision },
      },
    },
  })
  const errors = result.errors || result.data?.errors
  if (errors?.length) {
    const isConflict = errors.some((error: any) => /conditionalcheckfailed|condition.*fail|conflict/i.test(String(error.errorType || error.message)))
    throw new Error(isConflict ? PERMISSION_CONFLICT_MESSAGE : (errors[0].message || 'Failed to replace Workspace permissions'))
  }
  const data = result.data?.updateWorkspaceMembershipPermissionSet
  if (!data) throw new Error('Failed to replace Workspace permissions')
  return data
}

function actorUserId(event: any) {
  return requireCanonicalUserId(getResolverIdentity(event))
}

function requireName(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Workspace name is required')
  return value.trim()
}

function requireTargetUserId(value: unknown) {
  const userId = getCanonicalUserId({ sub: typeof value === 'string' ? value : undefined })
  if (!userId) throw new Error('targetUserId must be a canonical Cognito sub')
  return userId
}

async function loadWorkspace(client: any, workspaceId: string) {
  const result = await client.models.CreatorWorkspaceRecord.get({ id: workspaceId })
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to load Creator Workspace')
  if (!result.data) throw new Error('Creator Workspace not found')
  return result.data
}

async function listWorkspaceMemberships(client: any, workspaceId: string) {
  const memberships: any[] = []
  let nextToken: string | null | undefined
  do {
    const result = await client.models.WorkspaceMembership.list({
      filter: { workspaceId: { eq: workspaceId } },
      limit: 1000,
      nextToken,
    })
    if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to list Workspace memberships')
    memberships.push(...(result.data || []).filter((membership: any) => membership.workspaceId === workspaceId))
    nextToken = result.nextToken
  } while (nextToken)
  return memberships
}

async function listMembershipPermissionRows(client: any, membershipIds: string[]) {
  if (!membershipIds.length) return []
  const membershipIdSet = new Set(membershipIds)
  const rows: any[] = []
  let nextToken: string | null | undefined
  do {
    const result = await client.models.WorkspaceMembershipPermission.list({ limit: 1000, nextToken })
    if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to list Workspace permissions')
    rows.push(...(result.data || []).filter((row: any) => membershipIdSet.has(row.membershipId)))
    nextToken = result.nextToken
  } while (nextToken)
  return rows
}

async function deletePermissionRows(client: any, rows: any[]) {
  for (const row of rows) {
    const result = await client.models.WorkspaceMembershipPermission.delete({ id: row.id })
    if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to remove Workspace permission')
  }
}

export async function handleCreateCreatorWorkspace(event: any, injectedClient?: any) {
  const ownerUserId = actorUserId(event)
  const name = requireName(event.arguments?.name)
  const client = injectedClient || await loadDataClient()
  const result = await client.models.CreatorWorkspaceRecord.create({ ownerUserId, name })
  if (result.errors?.length || !result.data) {
    throw new Error(result.errors?.[0]?.message || 'Failed to create Creator Workspace')
  }
  return workspaceSummary(result.data)
}

export async function handleGetCreatorWorkspace(event: any, injectedClient?: any) {
  const ownerUserId = actorUserId(event)
  const workspaceId = String(event.arguments?.workspaceId || '').trim()
  if (!workspaceId) throw new Error('workspaceId is required')
  const client = injectedClient || await loadDataClient()
  const workspace = await loadWorkspace(client, workspaceId)
  if (workspace.ownerUserId !== ownerUserId) throw new Error('Creator Workspace access is denied')
  return workspaceSummary(workspace)
}

export async function handleListMyCreatorWorkspaces(event: any, injectedClient?: any) {
  const ownerUserId = actorUserId(event)
  const client = injectedClient || await loadDataClient()
  const workspaces: any[] = []
  let nextToken: string | null | undefined

  do {
    const result = await client.models.CreatorWorkspaceRecord.list({
      filter: { ownerUserId: { eq: ownerUserId } },
      limit: 1000,
      nextToken,
    })
    if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to list Creator Workspaces')
    workspaces.push(...(result.data || []).filter((workspace: any) => workspace.ownerUserId === ownerUserId))
    nextToken = result.nextToken
  } while (nextToken)

  return workspaces
    .map(workspaceSummary)
    .sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id))
}

export async function handleAddWorkspaceMember(event: any, injectedClient?: any) {
  const ownerUserId = actorUserId(event)
  const workspaceId = String(event.arguments?.workspaceId || '').trim()
  const targetUserId = requireTargetUserId(event.arguments?.targetUserId)
  if (!workspaceId) throw new Error('workspaceId is required')
  const client = injectedClient || await loadDataClient()
  const workspace = await loadWorkspace(client, workspaceId)
  assertWorkspaceOwner(workspace, ownerUserId)
  if (targetUserId === workspace.ownerUserId) throw new Error('Workspace owner cannot be added as a collaborator')

  const membershipId = `workspace-membership:${workspaceId}:${targetUserId}`
  const existing = (await client.models.WorkspaceMembership.get({ id: membershipId })).data
  if (existing?.status === ACTIVE_WORKSPACE_MEMBERSHIP) throw new Error('Active Workspace membership already exists')

  const input = {
    id: membershipId,
    workspaceId,
    userId: targetUserId,
    status: ACTIVE_WORKSPACE_MEMBERSHIP,
    addedByUserId: ownerUserId,
    revokedAt: null,
    revokedByUserId: null,
    permissionGeneration: existing ? Number(existing.permissionGeneration || 0) + 1 : 1,
  }
  if (existing) {
    const reset = await createPermissionSet(client, membershipId, input.permissionGeneration, ownerUserId)
    if (reset.errors?.length) {
      const updated = await client.models.WorkspaceMembershipPermissionSet.update({
        id: permissionSetId(membershipId), membershipId, permissionGeneration: input.permissionGeneration,
        revision: 0, permissionKeys: [], updatedByUserId: ownerUserId, updatedAt: new Date().toISOString(),
      })
      if (updated.errors?.length) throw new Error(updated.errors[0].message || 'Failed to reset Workspace permissions')
    }
  }
  if (!existing) {
    const initialized = await createPermissionSet(client, membershipId, input.permissionGeneration, ownerUserId)
    if (initialized.errors?.length) throw new Error(initialized.errors[0].message || 'Failed to initialize Workspace permissions')
  }
  const result = existing
    ? await client.models.WorkspaceMembership.update(input)
    : await client.models.WorkspaceMembership.create(input)
  if (result.errors?.length || !result.data) throw new Error(result.errors?.[0]?.message || 'Failed to add Workspace member')
  return membershipSummary(result.data)
}

export async function handleListWorkspaceMembers(event: any, injectedClient?: any) {
  const userId = actorUserId(event)
  const workspaceId = String(event.arguments?.workspaceId || '').trim()
  if (!workspaceId) throw new Error('workspaceId is required')
  const client = injectedClient || await loadDataClient()
  const workspace = await loadWorkspace(client, workspaceId)
  const memberships = await listWorkspaceMemberships(client, workspaceId)
  assertWorkspaceAccess(workspace, memberships, userId)
  const visibleMemberships = isWorkspaceOwner(workspace, userId)
    ? memberships
    : memberships.filter((membership) => membership.status === ACTIVE_WORKSPACE_MEMBERSHIP)
  return {
    workspaceId,
    ownerUserId: workspace.ownerUserId,
    memberships: visibleMemberships.map(membershipSummary),
  }
}

export async function handleRevokeWorkspaceMember(event: any, injectedClient?: any) {
  const ownerUserId = actorUserId(event)
  const workspaceId = String(event.arguments?.workspaceId || '').trim()
  const targetUserId = requireTargetUserId(event.arguments?.targetUserId)
  if (!workspaceId) throw new Error('workspaceId is required')
  const client = injectedClient || await loadDataClient()
  const workspace = await loadWorkspace(client, workspaceId)
  assertWorkspaceOwner(workspace, ownerUserId)
  if (targetUserId === workspace.ownerUserId) throw new Error('Workspace ownership cannot be revoked through membership')

  const membershipId = `workspace-membership:${workspaceId}:${targetUserId}`
  const existing = (await client.models.WorkspaceMembership.get({ id: membershipId })).data
  if (!existing || existing.workspaceId !== workspaceId || existing.userId !== targetUserId) {
    throw new Error('Workspace membership not found')
  }
  if (existing.status !== ACTIVE_WORKSPACE_MEMBERSHIP) throw new Error('Workspace membership is not active')
  const result = await client.models.WorkspaceMembership.update({
    id: membershipId,
    status: REVOKED_WORKSPACE_MEMBERSHIP,
    revokedAt: new Date().toISOString(),
    revokedByUserId: ownerUserId,
    permissionGeneration: Number(existing.permissionGeneration || 0) + 1,
  })
  if (result.errors?.length || !result.data) throw new Error(result.errors?.[0]?.message || 'Failed to revoke Workspace member')
  const beforeSet = await loadPermissionSet(client, existing)
  const resetResult = await client.models.WorkspaceMembershipPermissionSet.update({
    id: permissionSetId(existing.id), membershipId: existing.id,
    permissionGeneration: result.data.permissionGeneration, revision: 0, permissionKeys: [],
    updatedByUserId: ownerUserId, updatedAt: new Date().toISOString(),
  })
  if (resetResult.errors?.length) throw new Error(resetResult.errors[0].message || 'Failed to clear Workspace permissions')
  const permissionRows = await listMembershipPermissionRows(client, [existing.id])
  await deletePermissionRows(client, permissionRows)
  if (beforeSet.permissionKeys.length) {
    await writePermissionAudit(
      client,
      ownerUserId,
      'workspace.member.permissions.clear-on-revoke',
      'WorkspaceMembership',
      existing.id,
      { workspaceId, userId: targetUserId, permissionKeys: beforeSet.permissionKeys },
      { workspaceId, userId: targetUserId, permissionKeys: [] },
    )
  }
  return membershipSummary(result.data)
}

export async function handleGetMyWorkspacePermissions(event: any, injectedClient?: any) {
  const userId = actorUserId(event)
  const workspaceId = String(event.arguments?.workspaceId || '').trim()
  if (!workspaceId) throw new Error('workspaceId is required')
  const client = injectedClient || await loadDataClient()
  const workspace = await loadWorkspace(client, workspaceId)
  const memberships = await listWorkspaceMemberships(client, workspaceId)
  assertWorkspaceAccess(workspace, memberships, userId)
  const membership = memberships.find((item) => item.userId === userId && item.status === ACTIVE_WORKSPACE_MEMBERSHIP)
  const permissionSet = membership ? await loadPermissionSet(client, membership) : null
  const permissionRows = permissionSet ? permissionSet.permissionKeys.map((permissionKey: string) => ({ membershipId: membership.id, permissionKey })) : []
  return {
    workspaceId,
    userId,
    isOwner: isWorkspaceOwner(workspace, userId),
    permissionKeys: [...getEffectiveWorkspacePermissions(workspace, memberships, permissionRows, userId)].sort(),
    permissionGeneration: membership?.permissionGeneration || 0,
    revision: permissionSet?.revision || 0,
  }
}

export async function handleSetWorkspaceMemberPermissions(event: any, injectedClient?: any) {
  const ownerUserId = actorUserId(event)
  const workspaceId = String(event.arguments?.workspaceId || '').trim()
  const targetUserId = requireTargetUserId(event.arguments?.targetUserId)
  const permissionKeys = normalizeWorkspacePermissionKeys(event.arguments?.permissionKeys)
  const expectedPermissionGeneration = event.arguments?.expectedPermissionGeneration
  const expectedRevision = event.arguments?.expectedRevision
  if (!Number.isInteger(expectedPermissionGeneration) || expectedPermissionGeneration < 1) throw new Error('expectedPermissionGeneration is required')
  if (!Number.isInteger(expectedRevision) || expectedRevision < 0) throw new Error('expectedRevision is required')
  if (!workspaceId) throw new Error('workspaceId is required')
  const client = injectedClient || await loadDataClient()
  const workspace = await loadWorkspace(client, workspaceId)
  assertWorkspaceOwner(workspace, ownerUserId)
  if (targetUserId === workspace.ownerUserId) throw new Error('Workspace owner permissions are implicit and cannot be assigned')

  const membershipId = `workspace-membership:${workspaceId}:${targetUserId}`
  const membership = (await client.models.WorkspaceMembership.get({ id: membershipId })).data
  if (!membership || membership.workspaceId !== workspaceId || membership.userId !== targetUserId) {
    throw new Error('Workspace membership not found')
  }
  if (membership.status !== ACTIVE_WORKSPACE_MEMBERSHIP) throw new Error('Workspace membership must be active')

  if (membership.permissionGeneration !== expectedPermissionGeneration) throw new Error(PERMISSION_CONFLICT_MESSAGE)
  const existingSet = await loadPermissionSet(client, membership)
  if (existingSet.revision !== expectedRevision) throw new Error(PERMISSION_CONFLICT_MESSAGE)
  const existingRows = await listMembershipPermissionRows(client, [membershipId])
  const existingKeys = new Set(existingRows.map((row) => row.permissionKey))
  await deletePermissionRows(client, existingRows.filter((row) => !permissionKeys.includes(row.permissionKey)))
  const assignedAt = new Date().toISOString()
  for (const permissionKey of permissionKeys.filter((key) => !existingKeys.has(key))) {
    const result = await client.models.WorkspaceMembershipPermission.create({
      id: `workspace-membership-permission:${membershipId}:${permissionKey}`,
      membershipId,
      permissionKey,
      assignedByUserId: ownerUserId,
      assignedAt,
    })
    if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to assign Workspace permission')
  }

  const committed = await replacePermissionSetAtomically(client, {
    id: permissionSetId(membershipId), membershipId,
    permissionGeneration: expectedPermissionGeneration,
    revision: expectedRevision + 1,
    permissionKeys,
    updatedByUserId: ownerUserId,
    updatedAt: new Date().toISOString(),
  }, expectedPermissionGeneration, expectedRevision)

  const before = existingSet.permissionKeys
  if (JSON.stringify(before) !== JSON.stringify(permissionKeys)) {
    await writePermissionAudit(
      client,
      ownerUserId,
      'workspace.member.permissions.replace',
      'WorkspaceMembership',
      membershipId,
      { workspaceId, userId: targetUserId, permissionKeys: before },
      { workspaceId, userId: targetUserId, permissionKeys },
    )
  }
  return {
    workspaceId, userId: targetUserId, isOwner: false, permissionKeys,
    permissionGeneration: committed.permissionGeneration,
    revision: committed.revision,
  }
}

async function loadDataClient() {
  const { getDataClient } = await import('../shared/dataClient')
  return getDataClient()
}
