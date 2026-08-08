import assert from 'node:assert/strict'
import {
  handleCreateManagedMerchProduct,
  handleReplaceManagedMerchProductBrands,
  handleReplaceManagedMerchProductCategories,
  handleUpdateManagedMerchProduct,
  handleUpsertManagedMerchProductVariant,
} from './handlers'

function makeClient(options: {
  productLinked?: boolean
  productLinks?: any[]
  ownerUserId?: string
  accesses?: any[]
  permissions?: any[]
} = {}) {
  const updates: any[] = []
  const creates: any[] = []
  const variantCreates: any[] = []
  const variantUpdates: any[] = []
  const audits: any[] = []
  const productLinked = options.productLinked ?? true
  const lists: Record<string, any[]> = {
    MerchProductBrand: options.productLinks || (productLinked ? [{ id: 'link-a', productId: 'product-a', brandId: 'brand-a' }] : []),
    BrandAccess: options.accesses || [],
    BrandAccessPermission: options.permissions || [],
  }
  return {
    updates, creates, variantCreates, variantUpdates, audits,
    models: {
      MerchProduct: {
        get: async () => ({ data: { id: 'product-a', title: 'Original' } }),
        create: async (input: any) => { creates.push(input); return { data: { id: 'product-created', ...input } } },
        update: async (input: any) => { updates.push(input); return { data: input } },
      },
      MerchProductVariant: {
        get: async () => ({ data: { id: 'variant-created', productId: 'product-a' } }),
        create: async (input: any) => { variantCreates.push(input); return { data: { id: 'variant-created', ...input } } },
        update: async (input: any) => { variantUpdates.push(input); return { data: { id: input.id, ...input } } },
      },
      Brand: { get: async () => ({ data: { id: 'brand-a', ownerUserId: options.ownerUserId || 'owner-a' } }) },
      MerchProductBrand: { list: async () => ({ data: lists.MerchProductBrand }) },
      BrandAccess: { list: async () => ({ data: lists.BrandAccess }) },
      BrandAccessPermission: { list: async () => ({ data: lists.BrandAccessPermission }) },
      PermissionAuditEvent: { create: async (input: any) => { audits.push(input); return { data: input } } },
    },
  }
}

function event(username: string, groups: string[], arguments_: Record<string, unknown>) {
  return { identity: { username, claims: { 'cognito:groups': groups } }, arguments: arguments_ }
}

const ownerClient = makeClient()
await handleUpdateManagedMerchProduct(event('owner-a', ['Member'], {
  productId: 'product-a', brandId: 'brand-a', title: 'Owner update', isVisible: false,
}), ownerClient)
assert.deepEqual(ownerClient.updates, [{ id: 'product-a', title: 'Owner update', isVisible: false }])

await assert.rejects(
  handleUpdateManagedMerchProduct(event('owner-a', ['Member'], {
    productId: 'product-a', brandId: 'brand-a', sourceType: 'manual',
  }), makeClient()),
  /cannot edit product field: sourceType/i,
)

await assert.rejects(
  handleUpdateManagedMerchProduct(event('owner-a', ['Member'], {
    productId: 'product-a', title: 'No brand context',
  }), makeClient()),
  /brandId is required/i,
)

await assert.rejects(
  handleUpdateManagedMerchProduct(event('owner-a', ['Member'], {
    productId: 'product-a', brandId: 'brand-a', title: 'Wrong brand link',
  }), makeClient({ productLinked: false })),
  /not assigned to this brand/i,
)

await assert.rejects(
  handleUpdateManagedMerchProduct(event('helper-a', ['Member'], {
    productId: 'product-a', brandId: 'brand-a', title: 'No grant',
  }), makeClient()),
  /management permission is required/i,
)

await assert.rejects(
  handleUpdateManagedMerchProduct(event('helper-b', ['Member'], {
    productId: 'product-a', brandId: 'brand-a', title: 'Cross-brand attempt',
  }), makeClient({
    productLinks: [
      { id: 'link-a', productId: 'product-a', brandId: 'brand-a' },
      { id: 'link-b', productId: 'product-a', brandId: 'brand-b' },
    ],
    accesses: [{ id: 'access-b', brandId: 'brand-b', userId: 'helper-b', accessLevel: 'helper' }],
    permissions: [{ id: 'permission-b', brandAccessId: 'access-b', brandId: 'brand-b', permissionKey: 'brand.products.manage' }],
  })),
  /management permission is required/i,
)

const helperClient = makeClient({
  accesses: [{ id: 'access-a', brandId: 'brand-a', userId: 'helper-a', accessLevel: 'helper' }],
  permissions: [{ id: 'permission-a', brandAccessId: 'access-a', brandId: 'brand-a', permissionKey: 'brand.products.manage' }],
})
await handleUpdateManagedMerchProduct(event('helper-a', ['Member'], {
  productId: 'product-a', brandId: 'brand-a', status: 'inactive',
}), helperClient)
assert.deepEqual(helperClient.updates, [{ id: 'product-a', status: 'inactive' }])

const platformClient = makeClient()
await handleUpdateManagedMerchProduct(event('staff-a', ['Staff'], {
  productId: 'product-a', sourceType: 'manual', externalProductId: 'platform-controlled',
}), platformClient)
assert.deepEqual(platformClient.updates, [{ id: 'product-a', sourceType: 'manual', externalProductId: 'platform-controlled' }])

const platformCreateClient = makeClient()
await handleCreateManagedMerchProduct(event('staff-a', ['Staff'], {
  title: 'Platform product', slug: 'platform-product', sourceType: 'manual', status: 'active', isVisible: true,
}), platformCreateClient)
assert.deepEqual(platformCreateClient.creates, [{
  title: 'Platform product', slug: 'platform-product', sourceType: 'manual', status: 'active', isVisible: true,
}])

await assert.rejects(
  handleCreateManagedMerchProduct(event('owner-a', ['Member'], {
    title: 'Bypass product', slug: 'bypass-product', sourceType: 'manual', status: 'active', isVisible: true,
  }), makeClient()),
  /Platform product management access/i,
)

const platformVariantClient = makeClient()
await handleUpsertManagedMerchProductVariant(event('staff-a', ['Staff'], {
  productId: 'product-a', externalVariantId: 'variant-a', name: 'Platform variant', status: 'active',
}), platformVariantClient)
assert.equal(platformVariantClient.variantCreates[0].productId, 'product-a')

await assert.rejects(
  handleUpsertManagedMerchProductVariant(event('owner-a', ['Member'], {
    productId: 'product-a', externalVariantId: 'variant-a', name: 'Bypass variant', status: 'active',
  }), makeClient()),
  /Platform product management access/i,
)

function relationshipClient() {
  const created: any[] = []
  return {
    created,
    models: {
      MerchProduct: { get: async () => ({ data: { id: 'product-a' } }) },
      Brand: { get: async () => ({ data: { id: 'brand-a' } }) },
      MerchCategory: { get: async () => ({ data: { id: 'category-a' } }) },
      MerchProductBrand: { list: async () => ({ data: [] }), create: async (input: any) => { created.push(input); return { data: input } }, delete: async () => ({ data: {} }) },
      MerchProductCategory: { list: async () => ({ data: [] }), create: async (input: any) => { created.push(input); return { data: input } }, delete: async () => ({ data: {} }) },
      PermissionAuditEvent: { create: async (input: any) => ({ data: input }) },
    },
  }
}

await assert.rejects(
  handleReplaceManagedMerchProductBrands(event('owner-a', ['Member'], { productId: 'product-a', brandIds: ['brand-a'] }), relationshipClient()),
  /Platform product management access/i,
)
await assert.rejects(
  handleReplaceManagedMerchProductCategories(event('owner-a', ['Member'], { productId: 'product-a', categoryIds: ['category-a'] }), relationshipClient()),
  /Platform product management access/i,
)

const platformRelationshipClient = relationshipClient()
await handleReplaceManagedMerchProductBrands(event('staff-a', ['Staff'], { productId: 'product-a', brandIds: ['brand-a'] }), platformRelationshipClient)
await handleReplaceManagedMerchProductCategories(event('staff-a', ['Staff'], { productId: 'product-a', categoryIds: ['category-a'] }), platformRelationshipClient)
assert.deepEqual(platformRelationshipClient.created, [
  { productId: 'product-a', brandId: 'brand-a' },
  { productId: 'product-a', categoryId: 'category-a' },
])

console.log('merch product command authorization tests passed')
