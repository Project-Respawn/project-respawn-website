export const ACTIVE_WORKSPACE_MEMBERSHIP = 'ACTIVE'
export const REVOKED_WORKSPACE_MEMBERSHIP = 'REVOKED'

export const WORKSPACE_PERMISSION_KEYS = [
  'workspace.profile.manage',
  'workspace.members.manage',
  'workspace.twitch.manage',
  'workspace.discord.manage',
  'workspace.overlays.manage',
  'workspace.engagement.view',
] as const

export type WorkspacePermissionKey = typeof WORKSPACE_PERMISSION_KEYS[number]

export function isWorkspaceOwner(workspace: { ownerUserId?: string | null }, userId: string) {
  return Boolean(userId && workspace.ownerUserId === userId)
}

export function isActiveWorkspaceMember(
  memberships: Array<{ userId?: string | null; status?: string | null }>,
  userId: string,
) {
  return Boolean(userId && memberships.some((membership) => (
    membership.userId === userId && membership.status === ACTIVE_WORKSPACE_MEMBERSHIP
  )))
}

export function hasWorkspaceAccess(
  workspace: { ownerUserId?: string | null },
  memberships: Array<{ userId?: string | null; status?: string | null }>,
  userId: string,
) {
  return isWorkspaceOwner(workspace, userId) || isActiveWorkspaceMember(memberships, userId)
}

export function assertWorkspaceOwner(workspace: { ownerUserId?: string | null }, userId: string) {
  if (!isWorkspaceOwner(workspace, userId)) throw new Error('Creator Workspace owner access is required')
}

export function assertWorkspaceAccess(
  workspace: { ownerUserId?: string | null },
  memberships: Array<{ userId?: string | null; status?: string | null }>,
  userId: string,
) {
  if (!hasWorkspaceAccess(workspace, memberships, userId)) throw new Error('Creator Workspace access is denied')
}

export function normalizeWorkspacePermissionKeys(value: unknown): WorkspacePermissionKey[] {
  if (!Array.isArray(value) || value.some((key) => typeof key !== 'string')) {
    throw new Error('permissionKeys must be an array of supported Workspace permissions')
  }
  const keys = [...new Set(value)]
  const invalid = keys.find((key) => !WORKSPACE_PERMISSION_KEYS.includes(key as WorkspacePermissionKey))
  if (invalid) throw new Error(`Unknown Workspace permission key: ${invalid}`)
  return keys.sort() as WorkspacePermissionKey[]
}

export function getEffectiveWorkspacePermissions(
  workspace: { ownerUserId?: string | null },
  memberships: Array<{ id?: string | null; userId?: string | null; status?: string | null }>,
  permissionRows: Array<{ membershipId?: string | null; permissionKey?: string | null }>,
  userId: string,
) {
  if (isWorkspaceOwner(workspace, userId)) return new Set<WorkspacePermissionKey>(WORKSPACE_PERMISSION_KEYS)
  const membershipIds = new Set(memberships
    .filter((membership) => membership.userId === userId && membership.status === ACTIVE_WORKSPACE_MEMBERSHIP)
    .map((membership) => membership.id)
    .filter(Boolean))
  if (!membershipIds.size) return new Set<WorkspacePermissionKey>()
  return new Set(permissionRows
    .filter((row) => membershipIds.has(row.membershipId) && WORKSPACE_PERMISSION_KEYS.includes(row.permissionKey as WorkspacePermissionKey))
    .map((row) => row.permissionKey as WorkspacePermissionKey))
}

export function hasWorkspacePermission(
  workspace: { ownerUserId?: string | null },
  memberships: Array<{ id?: string | null; userId?: string | null; status?: string | null }>,
  permissionRows: Array<{ membershipId?: string | null; permissionKey?: string | null }>,
  userId: string,
  permissionKey: WorkspacePermissionKey,
) {
  return getEffectiveWorkspacePermissions(workspace, memberships, permissionRows, userId).has(permissionKey)
}

export function assertWorkspacePermission(
  workspace: { ownerUserId?: string | null },
  memberships: Array<{ id?: string | null; userId?: string | null; status?: string | null }>,
  permissionRows: Array<{ membershipId?: string | null; permissionKey?: string | null }>,
  userId: string,
  permissionKey: WorkspacePermissionKey,
) {
  if (!hasWorkspacePermission(workspace, memberships, permissionRows, userId, permissionKey)) {
    throw new Error(`Workspace permission is required: ${permissionKey}`)
  }
}
