export const BRAND_USER_EDITABLE_MERCH_PRODUCT_FIELDS = [
  'title',
  'slug',
  'shortDescription',
  'description',
  'materials',
  'sizeGuide',
  'shippingReturns',
  'whatsIncluded',
  'careInstructions',
  'fitNotes',
  'status',
  'isVisible',
] as const

export const PLATFORM_EDITABLE_MERCH_PRODUCT_FIELDS = [
  ...BRAND_USER_EDITABLE_MERCH_PRODUCT_FIELDS,
  'thumbnailUrl',
  'imageUrl',
  'sourceType',
  'externalProductId',
  'externalVariantGroupId',
  'sku',
  'displayPrice',
  'basePrice',
  'currency',
  'productUrl',
  'variantCount',
  'sortOrder',
] as const

export function getRequestedProductFields(args: Record<string, unknown>) {
  return PLATFORM_EDITABLE_MERCH_PRODUCT_FIELDS.filter((field) => args[field] !== undefined)
}

export function assertBrandProductFieldsAreAllowed(args: Record<string, unknown>) {
  const prohibitedField = getRequestedProductFields(args).find(
    (field) => !BRAND_USER_EDITABLE_MERCH_PRODUCT_FIELDS.includes(field as typeof BRAND_USER_EDITABLE_MERCH_PRODUCT_FIELDS[number]),
  )
  if (prohibitedField) {
    throw new Error(`Brand users cannot edit product field: ${prohibitedField}`)
  }
}

export function hasBrandProductsManagePermission(
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
    permission.permissionKey === 'brand.products.manage',
  )
}
