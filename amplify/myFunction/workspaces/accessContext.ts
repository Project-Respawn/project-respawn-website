import { logger } from '../shared/logger'
import {
  ACTIVE_WORKSPACE_MEMBERSHIP,
  WORKSPACE_PERMISSION_KEYS,
  getEffectiveWorkspacePermissions,
} from './access'

const INDEX_PAGE_SIZE = 100
const MAX_INDEX_PAGES = 10

async function collectIndexed(
  query: (input: any, options: any) => Promise<any>,
  input: Record<string, string>,
  label: string,
) {
  const records: any[] = []
  let nextToken: string | null | undefined
  for (let page = 0; page < MAX_INDEX_PAGES; page += 1) {
    const result = await query(input, { limit: INDEX_PAGE_SIZE, nextToken })
    if (result.errors?.length) throw new Error(result.errors[0].message || `Failed to query ${label}`)
    records.push(...(result.data || []))
    nextToken = result.nextToken
    if (!nextToken) return records
  }
  logger.warn('Workspace access-context indexed query reached its safety limit', { label, maxRecords: INDEX_PAGE_SIZE * MAX_INDEX_PAGES })
  return records
}

async function getReferencedWorkspaces(client: any, workspaceIds: string[]) {
  const results = new Map<string, any>()
  for (let index = 0; index < workspaceIds.length; index += 25) {
    const batch = workspaceIds.slice(index, index + 25)
    const loaded = await Promise.all(batch.map(async (workspaceId) => {
      try {
        const result = await client.models.CreatorWorkspaceRecord.get({ id: workspaceId })
        if (result.errors?.length || !result.data) {
          logger.warn('Omitting membership whose Creator Workspace could not be loaded', { workspaceId })
          return null
        }
        return result.data
      } catch {
        logger.warn('Omitting membership whose Creator Workspace lookup failed', { workspaceId })
        return null
      }
    }))
    for (const workspace of loaded.filter(Boolean)) results.set(workspace.id, workspace)
  }
  return results
}

export async function getAccessibleWorkspaceSummaries(client: any, canonicalUserId: string) {
  const [ownedResults, membershipResults] = await Promise.all([
    collectIndexed(
      client.models.CreatorWorkspaceRecord.listCreatorWorkspaceByOwnerUserId.bind(client.models.CreatorWorkspaceRecord),
      { ownerUserId: canonicalUserId },
      'owned Creator Workspaces',
    ),
    collectIndexed(
      client.models.WorkspaceMembership.listWorkspaceMembershipByUserId.bind(client.models.WorkspaceMembership),
      { userId: canonicalUserId },
      'Workspace memberships',
    ),
  ])

  const owned = new Map<string, any>()
  for (const workspace of ownedResults) {
    if (workspace?.id && workspace.ownerUserId === canonicalUserId && typeof workspace.name === 'string') {
      owned.set(workspace.id, workspace)
    }
  }

  const activeMemberships = new Map<string, any>()
  for (const membership of membershipResults) {
    if (
      membership?.id
      && typeof membership.workspaceId === 'string'
      && membership.workspaceId
      && membership.userId === canonicalUserId
      && membership.status === ACTIVE_WORKSPACE_MEMBERSHIP
    ) {
      activeMemberships.set(membership.id, membership)
    }
  }

  const referencedIds = [...new Set([...activeMemberships.values()]
    .map((membership) => membership.workspaceId)
    .filter((workspaceId) => !owned.has(workspaceId)))]
  const referenced = await getReferencedWorkspaces(client, referencedIds)
  const summaries = new Map<string, any>()

  for (const workspace of owned.values()) {
    summaries.set(workspace.id, {
      id: workspace.id,
      name: workspace.name,
      isOwner: true,
      membershipStatus: null,
      permissionKeys: [...WORKSPACE_PERMISSION_KEYS].sort(),
    })
  }

  const collaboratorMemberships = [...activeMemberships.values()].filter((membership) => (
    !summaries.has(membership.workspaceId) && referenced.has(membership.workspaceId)
  ))
  const permissionRowsByMembershipId = new Map<string, any[]>()
  for (let index = 0; index < collaboratorMemberships.length; index += 25) {
    const batch = collaboratorMemberships.slice(index, index + 25)
    const sets = await Promise.all(batch.map(async (membership) => {
      const result = await client.models.WorkspaceMembershipPermissionSet.get({
        id: `workspace-membership-permission-set:${membership.id}`,
      })
      if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to load Workspace permission state')
      const set = result.data
      if (!set || set.membershipId !== membership.id || set.permissionGeneration !== membership.permissionGeneration) return []
      return (set.permissionKeys || []).map((permissionKey: string) => ({ membershipId: membership.id, permissionKey }))
    }))
    batch.forEach((membership, offset) => permissionRowsByMembershipId.set(membership.id, sets[offset]))
  }

  for (const membership of collaboratorMemberships) {
    if (summaries.has(membership.workspaceId)) continue
    const workspace = referenced.get(membership.workspaceId)
    if (!workspace || typeof workspace.name !== 'string' || workspace.ownerUserId === canonicalUserId) continue
    const permissionRows = permissionRowsByMembershipId.get(membership.id) || []
    summaries.set(workspace.id, {
      id: workspace.id,
      name: workspace.name,
      isOwner: false,
      membershipStatus: ACTIVE_WORKSPACE_MEMBERSHIP,
      permissionKeys: [...getEffectiveWorkspacePermissions(workspace, [membership], permissionRows, canonicalUserId)].sort(),
    })
  }

  return [...summaries.values()].sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id))
}
