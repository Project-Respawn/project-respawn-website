import { assertPlatformAdmin, getResolverIdentity, isPlatformAdmin, requireCanonicalUserId } from '../shared/auth'

export const TEAM_ROLES = ['MANAGER', 'COACH', 'PLAYER'] as const
export const LEAGUE_STARTING_ROLES = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'] as const
export const ACTIVE = 'ACTIVE'
export const INACTIVE = 'INACTIVE'
export const TEAM_HUB_DENIED = 'Team Hub access denied'

export function actor(event: any) {
  const identity = getResolverIdentity(event)
  return { userId: requireCanonicalUserId(identity), identity, isAdmin: isPlatformAdmin(identity) }
}

export function requireAdmin(event: any) {
  const current = actor(event)
  assertPlatformAdmin(current.identity)
  return current
}

export function requireRole(memberships: any[], userId: string, roles: readonly string[]) {
  const membership = memberships.find((row) => row.userId === userId && row.status === ACTIVE && roles.includes(row.role))
  if (!membership) throw new Error(TEAM_HUB_DENIED)
  return membership
}

export function requireTeamAccess(memberships: any[], userId: string, isAdmin: boolean) {
  if (isAdmin) return null
  return requireRole(memberships, userId, TEAM_ROLES)
}

export function requireManager(memberships: any[], userId: string) {
  return requireRole(memberships, userId, ['MANAGER'])
}

export function requirePlayer(memberships: any[], userId: string) {
  return requireRole(memberships, userId, ['PLAYER'])
}

export function requireCoach(memberships: any[], userId: string) {
  return requireRole(memberships, userId, ['COACH'])
}

export function requireCompetitiveReader(memberships: any[], userId: string) {
  return requireRole(memberships, userId, ['MANAGER', 'COACH'])
}
