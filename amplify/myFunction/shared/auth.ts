export interface ResolverIdentity {
  username?: string
  sub?: string
  groups?: unknown
  claims?: Record<string, unknown>
}

export function getResolverIdentity(event: { identity?: ResolverIdentity }): ResolverIdentity {
  return event.identity || {}
}

export function getIdentityUsername(identity: ResolverIdentity | undefined): string {
  return String(identity?.username || identity?.claims?.['cognito:username'] || identity?.claims?.username || identity?.sub || '')
}

export function getIdentityGroups(identity: ResolverIdentity | undefined): string[] {
  const raw = identity?.claims?.['cognito:groups'] || identity?.groups || []
  return Array.isArray(raw) ? raw.map(String) : []
}

export function hasForumModerationAccess(identity: ResolverIdentity | undefined) {
  const groups = getIdentityGroups(identity).map((value) => value.toLowerCase())
  return groups.includes('superadmin') || groups.includes('admin') || groups.includes('staff')
}

export function hasGroupAccess(requiredGroups: string[] = [], userGroups: string[] = []) {
  return requiredGroups.length === 0 || requiredGroups.map(String).some((group) => userGroups.map(String).includes(group))
}
