export const INVESTOR_LEVELS = ['PRE_NDA', 'NDA', 'DILIGENCE'] as const
export const NDA_STATUSES = ['NOT_REQUIRED', 'NOT_SIGNED', 'SIGNED'] as const
export type InvestorLevel = typeof INVESTOR_LEVELS[number]
export type NdaStatus = typeof NDA_STATUSES[number]

const LEVEL_RANK: Record<InvestorLevel, number> = { PRE_NDA: 1, NDA: 2, DILIGENCE: 3 }

export function canManageInvestorAccess(groups: string[]) {
  return groups.includes('SuperAdmin') || groups.includes('Admin')
}

export function isInvestorLevel(value: unknown): value is InvestorLevel {
  return INVESTOR_LEVELS.includes(value as InvestorLevel)
}

export function isNdaStatus(value: unknown): value is NdaStatus {
  return NDA_STATUSES.includes(value as NdaStatus)
}

export function isExpired(expiresAt: unknown, now = new Date()) {
  if (!expiresAt) return false
  const timestamp = Date.parse(String(expiresAt))
  return !Number.isFinite(timestamp) || timestamp <= now.getTime()
}

export function effectiveInvestorAccess(groups: string[], record?: any, now = new Date()) {
  const isPlatformAdmin = groups.some((group) => group === 'SuperAdmin' || group === 'Admin')
  if (isPlatformAdmin) return { hasAccess: true, accessLevel: 'DILIGENCE' as InvestorLevel, ndaStatus: 'SIGNED' as NdaStatus, isPlatformAdmin, expiresAt: null }

  const valid = record && record.isActive === true && isInvestorLevel(record.accessLevel) && !isExpired(record.expiresAt, now)
  return {
    hasAccess: Boolean(valid),
    accessLevel: valid ? record.accessLevel as InvestorLevel : null,
    ndaStatus: valid && isNdaStatus(record.ndaStatus) ? record.ndaStatus as NdaStatus : null,
    isPlatformAdmin: false,
    expiresAt: valid ? record.expiresAt || null : null,
  }
}

export function canAccessInvestorDocument(effectiveLevel: unknown, requiredLevel: unknown, ndaStatus?: unknown, requiredNdaStatus?: NdaStatus) {
  const tierPermitsAccess = isInvestorLevel(effectiveLevel) && isInvestorLevel(requiredLevel) && LEVEL_RANK[effectiveLevel] >= LEVEL_RANK[requiredLevel]
  return tierPermitsAccess && (!requiredNdaStatus || ndaStatus === requiredNdaStatus)
}

export function classifyAccessChange(previousLevel: InvestorLevel, nextLevel: InvestorLevel) {
  if (previousLevel === nextLevel) return 'investor.access.updated'
  return LEVEL_RANK[nextLevel] > LEVEL_RANK[previousLevel] ? 'investor.access.upgraded' : 'investor.access.downgraded'
}
