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

// Cognito subjects are UUID-shaped opaque identifiers. Do not constrain UUID
// version/variant bits: the user pool, not this application, owns their format.
const COGNITO_SUB_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Returns the immutable Cognito subject used by new ownership boundaries.
 *
 * Future Creator Workspace ownership and membership records must use this
 * value, never `username`, `cognito:username`, or an email address. AppSync
 * normally exposes the subject on `identity.sub`; the signed `sub` claim is a
 * compatibility source for resolver/test identity shapes.
 */
export function getCanonicalUserId(identity: ResolverIdentity | undefined): string {
  const directSub = typeof identity?.sub === 'string' ? identity.sub.trim() : ''
  const claimSub = typeof identity?.claims?.sub === 'string' ? identity.claims.sub.trim() : ''
  if (directSub && claimSub && directSub !== claimSub) return ''
  const sub = directSub || claimSub

  return COGNITO_SUB_PATTERN.test(sub) ? sub : ''
}

export function requireCanonicalUserId(identity: ResolverIdentity | undefined): string {
  const userId = getCanonicalUserId(identity)
  if (!userId) throw new Error('Authenticated Cognito sub is required')
  return userId
}

/**
 * Legacy/current username-compatible identifier.
 *
 * Existing Brand and other persisted ownership records may contain Cognito
 * usernames, so their authorization paths must retain this lookup order until
 * an explicit migration is designed. Do not use this helper for new Creator
 * Workspace ownership or membership records; use getCanonicalUserId instead.
 */
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
