export const TEAM_PLANS = ['FREE', 'PRO'] as const
export const PRO_FEATURES = Object.freeze({
  advancedChampionPoolComparisons: false,
  historicalPoolVersions: false,
  managerMeetingTools: false,
  draftStrategyTools: false,
  exports: false,
  advancedAnalytics: false,
  scheduledPublicRosterReveals: false,
})

export function teamEntitlement(team: any, at = new Date()) {
  const storedPlan = team?.teamPlan === 'PRO' ? 'PRO' : 'FREE'
  const expiresAt = typeof team?.proExpiresAt === 'string' && team.proExpiresAt ? team.proExpiresAt : null
  const expiry = expiresAt ? Date.parse(expiresAt) : Number.NaN
  const expired = storedPlan === 'PRO' && Number.isFinite(expiry) && expiry <= at.getTime()
  const isPro = storedPlan === 'PRO' && !expired
  return { plan: isPro ? 'PRO' : 'FREE', storedPlan, isPro, expiresAt, expired, features: { ...PRO_FEATURES } }
}
