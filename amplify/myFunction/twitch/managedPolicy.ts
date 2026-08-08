export const MANAGED_TWITCH_COMMAND_FIELDS = [
  'streamerId',
  'name',
  'reply',
  'enabled',
  'cooldownSeconds',
  'isCustom',
  'category',
  'permissionLevel',
] as const

export function getRequestedTwitchCommandFields(args: Record<string, unknown>) {
  return MANAGED_TWITCH_COMMAND_FIELDS.filter((field) => args[field] !== undefined)
}

export function hasBrandTwitchManagePermission(
  userId: string,
  brand: { id: string; ownerUserId?: string | null },
  accesses: Array<{ id: string; brandId: string; userId: string; accessLevel?: string | null }>,
  permissions: Array<{ brandAccessId: string; permissionKey: string }>,
) {
  if (brand.ownerUserId === userId) return true
  const helperAccessIds = new Set(
    accesses
      .filter((access) => access.brandId === brand.id && access.userId === userId && access.accessLevel === 'helper')
      .map((access) => access.id),
  )
  return permissions.some((permission) =>
    helperAccessIds.has(permission.brandAccessId) &&
    permission.permissionKey === 'brand.twitch.manage',
  )
}
