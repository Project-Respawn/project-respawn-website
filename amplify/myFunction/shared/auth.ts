export interface ResolverIdentity {
  username?: string
  sub?: string
  groups?: unknown
  claims?: Record<string, unknown>
}

export const PLATFORM_ADMIN_GROUPS = ['SuperAdmin', 'Admin'] as const

export function getResolverIdentity(event: { identity?: ResolverIdentity }): ResolverIdentity {
  return event.identity || {}
}

export function getIdentityUsername(identity: ResolverIdentity | undefined): string {
  return String(identity?.username || identity?.claims?.['cognito:username'] || identity?.claims?.username || identity?.sub || '')
}

export function getIdentityGroups(identity: ResolverIdentity | undefined): string[] {
  const raw = identity?.claims?.['cognito:groups'] || identity?.groups || []
  if (Array.isArray(raw)) return raw.map(String)
  return typeof raw === 'string' && raw.length > 0 ? [raw] : []
}

export function isPlatformAdmin(identity: ResolverIdentity | undefined) {
  const groups = getIdentityGroups(identity).map((group) => group.toLowerCase())
  return PLATFORM_ADMIN_GROUPS.some((group) => groups.includes(group.toLowerCase()))
}

export function assertPlatformAdmin(identity: ResolverIdentity | undefined) {
  if (!isPlatformAdmin(identity)) {
    throw new Error('Platform administrator access is required')
  }
}

export function hasForumModerationAccess(identity: ResolverIdentity | undefined) {
  const groups = getIdentityGroups(identity).map((value) => value.toLowerCase())
  return groups.includes('superadmin') || groups.includes('admin') || groups.includes('staff')
}

export function hasGroupAccess(requiredGroups: string[] = [], userGroups: string[] = []) {
  return requiredGroups.length === 0 || requiredGroups.map(String).some((group) => userGroups.map(String).includes(group))
}
