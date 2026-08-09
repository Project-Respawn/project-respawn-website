export const MANAGED_GROUPS = [
  'SuperAdmin',
  'Admin',
  'Staff',
  'Moderator',
  'Trainer',
  'Therapist',
  'StreamingPartner',
  'AffiliatePartner',
  'Member',
  'BetaMember',
] as const

export type ManagedGroup = (typeof MANAGED_GROUPS)[number]
export type RoleManager = 'SuperAdmin' | 'Admin' | 'Staff'

const SUPER_ADMIN_MUTABLE_ROLES: readonly ManagedGroup[] = MANAGED_GROUPS.filter(
  (role) => role !== 'SuperAdmin',
)
const ADMIN_MUTABLE_ROLES: readonly ManagedGroup[] = [
  'Staff',
  'Moderator',
  'Trainer',
  'Therapist',
  'StreamingPartner',
  'AffiliatePartner',
  'Member',
  'BetaMember',
]
const STAFF_MUTABLE_ROLES: readonly ManagedGroup[] = [
  'Trainer',
  'Therapist',
  'StreamingPartner',
  'AffiliatePartner',
  'Member',
  'BetaMember',
]

export function isManagedGroup(value: unknown): value is ManagedGroup {
  return typeof value === 'string' && MANAGED_GROUPS.includes(value as ManagedGroup)
}

export function getRoleManager(groups: string[]): RoleManager | null {
  if (groups.includes('SuperAdmin')) return 'SuperAdmin'
  if (groups.includes('Admin')) return 'Admin'
  if (groups.includes('Staff')) return 'Staff'
  return null
}

export function getAssignableRoles(manager: RoleManager): readonly ManagedGroup[] {
  switch (manager) {
    case 'SuperAdmin': return SUPER_ADMIN_MUTABLE_ROLES
    case 'Admin': return ADMIN_MUTABLE_ROLES
    case 'Staff': return STAFF_MUTABLE_ROLES
  }
}

function assertTargetCanBeManaged(manager: RoleManager, existingRoles: ManagedGroup[]) {
  if (existingRoles.includes('SuperAdmin')) {
    throw new Error('SuperAdmin membership cannot be altered through the website')
  }

  if (manager === 'Admin' && existingRoles.includes('Admin')) {
    throw new Error('Admins cannot alter Admin membership')
  }

  if (manager === 'Staff' && existingRoles.some((role) => !STAFF_MUTABLE_ROLES.includes(role))) {
    throw new Error('Staff can manage only approved lower-role users')
  }
}

export function assertRoleChangeAllowed(
  manager: RoleManager | null,
  existingRoles: ManagedGroup[],
  desiredRoles: ManagedGroup[],
) {
  if (!manager) {
    throw new Error('You are not authorized to manage user roles')
  }

  assertTargetCanBeManaged(manager, existingRoles)

  const rolesToAdd = desiredRoles.filter((role) => !existingRoles.includes(role))
  const rolesToRemove = existingRoles.filter((role) => !desiredRoles.includes(role))
  const changedRoles = [...rolesToAdd, ...rolesToRemove]

  if (changedRoles.includes('SuperAdmin')) {
    throw new Error('SuperAdmin membership cannot be added or removed through the website')
  }

  const assignableRoles = getAssignableRoles(manager)
  const forbiddenRole = changedRoles.find((role) => !assignableRoles.includes(role))

  if (forbiddenRole) {
    throw new Error(`${manager} cannot assign or remove the ${forbiddenRole} role`)
  }

  return { rolesToAdd, rolesToRemove }
}
