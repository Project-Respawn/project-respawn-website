import { getIdentityGroups, getIdentityUsername, getResolverIdentity } from '../shared/auth'
import { writePermissionAudit } from '../shared/audit'
import { isPlatformBrandOperator } from '../brands/policy'
import {
  PLATFORM_EDITABLE_MERCH_PRODUCT_FIELDS,
  assertBrandProductFieldsAreAllowed,
  getRequestedProductFields,
  hasBrandProductsManagePermission,
} from './policy'

async function listAll(client: any, modelName: string) {
  const records: any[] = []
  let nextToken: string | null | undefined
  do {
    const result = await client.models[modelName].list({ nextToken, limit: 1000 })
    if (result.errors?.length) throw new Error(result.errors[0].message || `Failed to list ${modelName}`)
    records.push(...(result.data || []))
    nextToken = result.nextToken
  } while (nextToken)
  return records
}

function getActor(event: any) {
  const identity = getResolverIdentity(event)
  const userId = getIdentityUsername(identity)
  if (!userId) throw new Error('Authenticated user identity is required')
  return { userId, isPlatformOperator: isPlatformBrandOperator(getIdentityGroups(identity)) }
}

async function writeProductAudit(client: any, actorUserId: string, action: string, targetType: string, targetId: string, before: unknown, after: unknown) {
  return writePermissionAudit(client, actorUserId, action, targetType, targetId, before, after)
}

function assertPlatformProductOperator(event: any) {
  const actor = getActor(event)
  if (!actor.isPlatformOperator) {
    throw new Error('Platform product management access is required')
  }
  return actor
}

function selectProductFields(args: Record<string, unknown>) {
  const fields: Record<string, unknown> = {}
  for (const field of PLATFORM_EDITABLE_MERCH_PRODUCT_FIELDS) {
    if (args[field] !== undefined) fields[field] = args[field]
  }
  return fields
}

export async function handleCreateManagedMerchProduct(event: any, injectedClient?: any) {
  const actor = assertPlatformProductOperator(event)
  const args = event.arguments || {}
  for (const field of ['title', 'slug', 'sourceType', 'status']) {
    if (typeof args[field] !== 'string' || !args[field]) throw new Error(`${field} is required`)
  }
  if (typeof args.isVisible !== 'boolean') throw new Error('isVisible is required')

  const client = injectedClient || await loadDataClient()
  const result = await client.models.MerchProduct.create(selectProductFields(args))
  if (result.errors?.length || !result.data) throw new Error(result.errors?.[0]?.message || 'Failed to create product')
  await writeProductAudit(client, actor.userId, 'product.create', 'MerchProduct', result.data.id, null, result.data)
  return { success: true, message: 'Product created', productId: result.data.id }
}

export async function handleUpdateManagedMerchProduct(event: any, injectedClient?: any) {
  const actor = getActor(event)
  const args = event.arguments || {}
  if (typeof args.productId !== 'string' || !args.productId) throw new Error('productId is required')

  const client = injectedClient || await loadDataClient()
  const productResult = await client.models.MerchProduct.get({ id: args.productId })
  if (productResult.errors?.length) throw new Error(productResult.errors[0].message || 'Failed to load product')
  if (!productResult.data) throw new Error('Product not found')

  if (!actor.isPlatformOperator) {
    if (typeof args.brandId !== 'string' || !args.brandId) throw new Error('brandId is required for Brand product edits')
    assertBrandProductFieldsAreAllowed(args)

    const [brandResult, productBrandLinks, accesses, permissions] = await Promise.all([
      client.models.Brand.get({ id: args.brandId }),
      listAll(client, 'MerchProductBrand'),
      listAll(client, 'BrandAccess'),
      listAll(client, 'BrandAccessPermission'),
    ])
    if (brandResult.errors?.length) throw new Error(brandResult.errors[0].message || 'Failed to load brand')
    if (!brandResult.data) throw new Error('Brand not found')
    if (!productBrandLinks.some((link) => link.productId === args.productId && link.brandId === args.brandId)) {
      throw new Error('Product is not assigned to this brand')
    }
    if (!hasBrandProductsManagePermission(actor.userId, { ...brandResult.data, id: args.brandId }, accesses, permissions)) {
      throw new Error('Brand product management permission is required')
    }
  }

  const allowedFields = actor.isPlatformOperator
    ? PLATFORM_EDITABLE_MERCH_PRODUCT_FIELDS
    : getRequestedProductFields(args)
  const requestedFields = getRequestedProductFields(args)
  const updates: Record<string, unknown> = { id: args.productId }
  for (const field of requestedFields) {
    if (allowedFields.includes(field)) updates[field] = args[field]
  }
  if (requestedFields.length === 0) throw new Error('At least one product field is required')

  const result = await client.models.MerchProduct.update(updates)
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to update product')
  await writeProductAudit(client, actor.userId, 'product.update', 'MerchProduct', args.productId, productResult.data, { ...productResult.data, ...updates })
  return { success: true, message: 'Product updated', productId: args.productId }
}

function normalizeRelationshipIds(value: unknown, argumentName: string) {
  if (!Array.isArray(value) || value.some((id) => typeof id !== 'string' || !id.trim())) {
    throw new Error(`${argumentName} must be an array of non-empty IDs`)
  }
  return [...new Set(value.map((id) => id.trim()))]
}

async function requireProduct(client: any, productId: string) {
  const result = await client.models.MerchProduct.get({ id: productId })
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to load product')
  if (!result.data) throw new Error('Product not found')
}

async function requireRelationshipTargets(client: any, modelName: 'Brand' | 'MerchCategory', ids: string[]) {
  for (const id of ids) {
    const result = await client.models[modelName].get({ id })
    if (result.errors?.length) throw new Error(result.errors[0].message || `Failed to load ${modelName}`)
    if (!result.data) throw new Error(`${modelName === 'Brand' ? 'Brand' : 'Merch Category'} not found: ${id}`)
  }
}

async function reconcileProductRelationships(
  client: any,
  productId: string,
  targetIds: string[],
  modelName: 'MerchProductBrand' | 'MerchProductCategory',
  targetField: 'brandId' | 'categoryId',
) {
  const desiredIds = new Set(targetIds)
  const existingLinks = (await listAll(client, modelName)).filter((link) => link.productId === productId)
  const existingTargetIds = new Set(existingLinks.map((link) => link[targetField]))
  let changedCount = 0

  for (const targetId of targetIds) {
    if (existingTargetIds.has(targetId)) continue
    const result = await client.models[modelName].create({ productId, [targetField]: targetId })
    if (result.errors?.length) throw new Error(result.errors[0].message || `Failed to create ${modelName} relationship`)
    changedCount += 1
  }
  for (const link of existingLinks) {
    if (desiredIds.has(link[targetField])) continue
    const result = await client.models[modelName].delete({ id: link.id })
    if (result.errors?.length) throw new Error(result.errors[0].message || `Failed to remove ${modelName} relationship`)
    changedCount += 1
  }
  return changedCount
}

export async function handleReplaceManagedMerchProductBrands(event: any, injectedClient?: any) {
  const actor = assertPlatformProductOperator(event)
  const args = event.arguments || {}
  if (typeof args.productId !== 'string' || !args.productId) throw new Error('productId is required')
  const brandIds = normalizeRelationshipIds(args.brandIds, 'brandIds')
  const client = injectedClient || await loadDataClient()
  await requireProduct(client, args.productId)
  await requireRelationshipTargets(client, 'Brand', brandIds)
  const changedCount = await reconcileProductRelationships(client, args.productId, brandIds, 'MerchProductBrand', 'brandId')
  if (changedCount) await writeProductAudit(client, actor.userId, 'product.brands.replace', 'MerchProduct', args.productId, null, { brandIds })
  return { success: true, message: 'Product Brand assignments updated', productId: args.productId, changedCount }
}

export async function handleReplaceManagedMerchProductCategories(event: any, injectedClient?: any) {
  const actor = assertPlatformProductOperator(event)
  const args = event.arguments || {}
  if (typeof args.productId !== 'string' || !args.productId) throw new Error('productId is required')
  const categoryIds = normalizeRelationshipIds(args.categoryIds, 'categoryIds')
  const client = injectedClient || await loadDataClient()
  await requireProduct(client, args.productId)
  await requireRelationshipTargets(client, 'MerchCategory', categoryIds)
  const changedCount = await reconcileProductRelationships(client, args.productId, categoryIds, 'MerchProductCategory', 'categoryId')
  if (changedCount) await writeProductAudit(client, actor.userId, 'product.categories.replace', 'MerchProduct', args.productId, null, { categoryIds })
  return { success: true, message: 'Product Merch Category assignments updated', productId: args.productId, changedCount }
}

const MANAGED_PRODUCT_VARIANT_FIELDS = [
  'externalVariantId', 'sku', 'name', 'color', 'colorHex', 'size', 'displayPrice',
  'retailPrice', 'currency', 'availabilityStatus', 'imageUrl', 'sortOrder', 'status',
] as const

export async function handleUpsertManagedMerchProductVariant(event: any, injectedClient?: any) {
  const actor = assertPlatformProductOperator(event)
  const args = event.arguments || {}
  if (typeof args.productId !== 'string' || !args.productId) throw new Error('productId is required')

  const client = injectedClient || await loadDataClient()
  await requireProduct(client, args.productId)
  const fields: Record<string, unknown> = { productId: args.productId }
  for (const field of MANAGED_PRODUCT_VARIANT_FIELDS) {
    if (args[field] !== undefined) fields[field] = args[field]
  }

  let before: any = null
  if (typeof args.variantId === 'string' && args.variantId) {
    const existing = await client.models.MerchProductVariant.get({ id: args.variantId })
    if (existing.errors?.length || !existing.data) throw new Error(existing.errors?.[0]?.message || 'Product variant not found')
    before = existing.data
  }
  const result = typeof args.variantId === 'string' && args.variantId
    ? await client.models.MerchProductVariant.update({ id: args.variantId, ...fields })
    : await client.models.MerchProductVariant.create(fields)
  if (result.errors?.length || !result.data) throw new Error(result.errors?.[0]?.message || 'Failed to save product variant')
  await writeProductAudit(client, actor.userId, before ? 'product.variant.update' : 'product.variant.create', 'MerchProductVariant', result.data.id, before, result.data)
  return { success: true, message: args.variantId ? 'Product variant updated' : 'Product variant created', variantId: result.data.id }
}

const MANAGED_PRODUCT_IMAGE_FIELDS = ['sortOrder', 'isPrimary', 'isMockup', 'isVisible', 'isFeatured', 'altTextOverride', 'colorOverride', 'colorHexOverride', 'status'] as const

async function writeProductImageAudit(client: any, actorUserId: string, action: string, imageId: string, before: unknown, after: unknown) {
  return writeProductAudit(client, actorUserId, action, 'MerchProductImage', imageId, before, after)
}

export async function handleUpsertManagedMerchProductImage(event: any, injectedClient?: any) {
  const actor = assertPlatformProductOperator(event)
  const args = event.arguments || {}
  if (typeof args.productId !== 'string' || !args.productId) throw new Error('productId is required')
  const client = injectedClient || await loadDataClient()
  await requireProduct(client, args.productId)
  const fields: Record<string, unknown> = { productId: args.productId }
  for (const field of MANAGED_PRODUCT_IMAGE_FIELDS) if (args[field] !== undefined) fields[field] = args[field]
  let result: any
  let before: any = null
  if (typeof args.imageId === 'string' && args.imageId) {
    const existing = await client.models.MerchProductImage.get({ id: args.imageId })
    if (existing.errors?.length || !existing.data) throw new Error(existing.errors?.[0]?.message || 'Product image not found')
    if (existing.data.productId !== args.productId) throw new Error('Product image does not belong to product')
    before = existing.data
    result = await client.models.MerchProductImage.update({ id: args.imageId, ...fields })
  } else {
    if (typeof args.mediaItemId !== 'string' || !args.mediaItemId) throw new Error('mediaItemId is required')
    const media = await client.models.MediaItem.get({ id: args.mediaItemId })
    if (media.errors?.length || !media.data) throw new Error(media.errors?.[0]?.message || 'Media item not found')
    result = await client.models.MerchProductImage.create({ ...fields, mediaItemId: args.mediaItemId })
  }
  if (result.errors?.length || !result.data) throw new Error(result.errors?.[0]?.message || 'Failed to save product image')
  await writeProductImageAudit(client, actor.userId, before ? 'product.image.update' : 'product.image.assign', result.data.id, before, result.data)
  return { success: true, message: before ? 'Product image updated' : 'Product image assigned', imageId: result.data.id, productId: args.productId }
}

export async function handleDeleteManagedMerchProductImage(event: any, injectedClient?: any) {
  const actor = assertPlatformProductOperator(event)
  const imageId = event.arguments?.imageId
  if (typeof imageId !== 'string' || !imageId) throw new Error('imageId is required')
  const client = injectedClient || await loadDataClient()
  const existing = await client.models.MerchProductImage.get({ id: imageId })
  if (existing.errors?.length || !existing.data) throw new Error(existing.errors?.[0]?.message || 'Product image not found')
  const result = await client.models.MerchProductImage.delete({ id: imageId })
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Failed to delete product image')
  await writeProductImageAudit(client, actor.userId, 'product.image.remove', imageId, existing.data, null)
  return { success: true, message: 'Product image removed', imageId, productId: existing.data.productId }
}

async function loadDataClient() {
  const { getDataClient } = await import('../shared/dataClient')
  return getDataClient()
}
