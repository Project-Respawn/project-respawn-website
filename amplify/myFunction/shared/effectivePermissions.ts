import { getIdentityGroups, isPlatformAdmin } from './auth'

const PLATFORM_GROUP_INHERITANCE: Record<string, readonly string[]> = {
  SuperAdmin: ['SuperAdmin', 'Admin', 'Staff', 'Moderator'],
  Admin: ['Admin', 'Staff', 'Moderator'],
  Staff: ['Staff', 'Moderator'],
}

export function getEffectiveIdentityGroups(identity: any) {
  const groups = getIdentityGroups(identity)
  return new Set(groups.flatMap((group) => PLATFORM_GROUP_INHERITANCE[group] || [group]))
}

/** Pure effective-permission calculation shared by protected backend handlers. */
export function resolveEffectivePermissionKeys(identity: any, definitions: any[], assignments: any[], platformControlKeys: readonly string[]) {
  const groups = getEffectiveIdentityGroups(identity)
  const activeKeys = new Set(definitions.filter((definition) => definition.isActive).map((definition) => definition.key))
  const permissions = new Set(assignments.filter((assignment) => assignment.enabled && groups.has(assignment.groupName) && activeKeys.has(assignment.permissionKey)).map((assignment) => assignment.permissionKey))
  if (isPlatformAdmin(identity)) for (const key of platformControlKeys) if (activeKeys.has(key)) permissions.add(key)
  return permissions
}

export function assertPlatformControlAssignments(groupName: string, requestedKeys: readonly string[], platformAdminGroups: readonly string[], platformControlKeys: readonly string[]) {
  if (!platformAdminGroups.includes(groupName)) return
  const missing = platformControlKeys.find((key) => !requestedKeys.includes(key))
  if (missing) throw new Error(`Platform-enforced permission cannot be removed: ${missing}`)
}
