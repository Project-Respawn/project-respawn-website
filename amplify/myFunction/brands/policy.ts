export const BRAND_PERMISSION_KEYS = [
  'brand.products.manage',
  'brand.events.manage',
  'brand.profile.manage',
  'brand.twitch.manage',
  'brand.discord.manage',
] as const

const PLATFORM_BRAND_GROUPS = ['SuperAdmin', 'Admin', 'Staff']

export function isPlatformBrandOperator(groups: string[]) {
  return groups.some((group) => PLATFORM_BRAND_GROUPS.includes(group))
}

export function canManageBrandPermissions(isPlatformOperator: boolean, userId: string, ownerUserId?: string | null) {
  return isPlatformOperator || ownerUserId === userId
}

export function assertCanChangeBrandOwner(isPlatformOperator: boolean) {
  if (!isPlatformOperator) {
    throw new Error('Only platform brand administration can change the Brand Owner')
  }
}
