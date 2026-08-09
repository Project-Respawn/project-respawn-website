export const BRAND_USER_EDITABLE_EVENT_FIELDS = [
  'title',
  'shortDescription',
  'description',
  'longDescription',
  'categories',
  'locationType',
  'tagIds',
  'hostUserId',
  'host',
  'hostDisplayName',
  'startAt',
  'endAt',
  'featured',
  'status',
  'ticketMode',
  'ticketTiers',
] as const

export const PLATFORM_EDITABLE_EVENT_FIELDS = [
  ...BRAND_USER_EDITABLE_EVENT_FIELDS,
  'slug',
  'platform',
  'category',
  'eventType',
  'isTemplate',
  'isRecurring',
  'seriesId',
  'parentEventId',
  'clonedFromEventId',
  'recurrenceRule',
  'recurrenceFrequency',
  'recurrenceInterval',
  'recurrenceByWeekday',
  'recurrenceEndsAt',
  'recurrenceCount',
  'rewardText',
  'recapText',
  'ctaLabel',
  'ctaUrl',
] as const

export function getRequestedEventFields(args: Record<string, unknown>) {
  return PLATFORM_EDITABLE_EVENT_FIELDS.filter((field) => args[field] !== undefined)
}

export function assertBrandEventFieldsAreAllowed(args: Record<string, unknown>) {
  const prohibitedField = getRequestedEventFields(args).find(
    (field) => !BRAND_USER_EDITABLE_EVENT_FIELDS.includes(field as typeof BRAND_USER_EDITABLE_EVENT_FIELDS[number]),
  )
  if (prohibitedField) throw new Error(`Brand users cannot edit Event field: ${prohibitedField}`)
}

export function hasBrandEventsManagePermission(
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
    permission.permissionKey === 'brand.events.manage',
  )
}
