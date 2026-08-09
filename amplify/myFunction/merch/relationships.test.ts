import assert from 'node:assert/strict'
import { handleReplaceManagedMerchProductBrands, handleReplaceManagedMerchProductCategories } from './handlers'
import { testPermissionModels } from '../shared/testPermissionModels'

function makeClient(options: { brands?: string[]; categories?: string[]; brandLinks?: any[]; categoryLinks?: any[] } = {}) {
  const brandLinks = [...(options.brandLinks || [])]
  const categoryLinks = [...(options.categoryLinks || [])]
  const created: any[] = []
  const deleted: any[] = []
  const audits: any[] = []
  const existingBrands = new Set(options.brands || ['brand-a', 'brand-b', 'brand-c'])
  const existingCategories = new Set(options.categories || ['category-a', 'category-b', 'category-c'])
  const relationshipModel = (links: any[], targetField: 'brandId' | 'categoryId') => ({
    list: async () => ({ data: [...links] }),
    create: async (input: any) => {
      const link = { id: `new-${input[targetField]}`, ...input }
      links.push(link)
      created.push(link)
      return { data: link }
    },
    delete: async ({ id }: { id: string }) => {
      const index = links.findIndex((link) => link.id === id)
      if (index >= 0) links.splice(index, 1)
      deleted.push(id)
      return { data: { id } }
    },
  })
  return {
    brandLinks,
    categoryLinks,
    created,
    deleted,
    audits,
    models: {
      ...testPermissionModels(['products.brand.assign', 'products.category.assign']),
      MerchProduct: { get: async () => ({ data: { id: 'product-a' } }) },
      Brand: { get: async ({ id }: { id: string }) => ({ data: existingBrands.has(id) ? { id } : null }) },
      MerchCategory: { get: async ({ id }: { id: string }) => ({ data: existingCategories.has(id) ? { id } : null }) },
      MerchProductBrand: relationshipModel(brandLinks, 'brandId'),
      MerchProductCategory: relationshipModel(categoryLinks, 'categoryId'),
      PermissionAuditEvent: {
        create: async (input: any) => {
          audits.push(input)
          return { data: input }
        },
      },
    },
  }
}

function event(username: string, groups: string[], arguments_: Record<string, unknown>) {
  return { identity: { username, claims: { 'cognito:groups': groups } }, arguments: arguments_ }
}

const adminBrandClient = makeClient({
  brandLinks: [
    { id: 'brand-link-a', productId: 'product-a', brandId: 'brand-a' },
    { id: 'brand-link-b', productId: 'product-a', brandId: 'brand-b' },
  ],
})
const adminBrandResult = await handleReplaceManagedMerchProductBrands(event('admin-a', ['Admin'], {
  productId: 'product-a', brandIds: ['brand-a', 'brand-c'],
}), adminBrandClient)
assert.equal(adminBrandResult.changedCount, 2)
assert.deepEqual(adminBrandClient.created, [{ id: 'new-brand-c', productId: 'product-a', brandId: 'brand-c' }])
assert.deepEqual(adminBrandClient.deleted, ['brand-link-b'])
assert.ok(adminBrandClient.brandLinks.some((link) => link.id === 'brand-link-a'))
assert.equal(adminBrandClient.audits[0].action, 'product.brands.replace')

const staffBrandClient = makeClient()
await handleReplaceManagedMerchProductBrands(event('staff-a', ['Staff'], {
  productId: 'product-a', brandIds: ['brand-a'],
}), staffBrandClient)
assert.deepEqual(staffBrandClient.created, [{ id: 'new-brand-a', productId: 'product-a', brandId: 'brand-a' }])

await assert.rejects(
  handleReplaceManagedMerchProductBrands(event('brand-owner', ['Member'], {
    productId: 'product-a', brandIds: ['brand-a'],
  }), makeClient()),
  /Permission products\.brand\.assign is required/i,
)

await assert.rejects(
  handleReplaceManagedMerchProductBrands(event('brand-helper', ['Member'], {
    productId: 'product-a', brandIds: ['brand-a'],
  }), makeClient()),
  /Permission products\.brand\.assign is required/i,
)

await assert.rejects(
  handleReplaceManagedMerchProductBrands(event('admin-a', ['Admin'], {
    productId: 'product-a', brandIds: ['brand-missing'],
  }), makeClient()),
  /Brand not found: brand-missing/i,
)

const adminCategoryClient = makeClient({
  categoryLinks: [
    { id: 'category-link-a', productId: 'product-a', categoryId: 'category-a' },
    { id: 'category-link-b', productId: 'product-a', categoryId: 'category-b' },
  ],
})
const adminCategoryResult = await handleReplaceManagedMerchProductCategories(event('admin-a', ['Admin'], {
  productId: 'product-a', categoryIds: ['category-a', 'category-c'],
}), adminCategoryClient)
assert.equal(adminCategoryResult.changedCount, 2)
assert.deepEqual(adminCategoryClient.created, [{ id: 'new-category-c', productId: 'product-a', categoryId: 'category-c' }])
assert.deepEqual(adminCategoryClient.deleted, ['category-link-b'])
assert.ok(adminCategoryClient.categoryLinks.some((link) => link.id === 'category-link-a'))
assert.equal(adminCategoryClient.audits[0].action, 'product.categories.replace')

await assert.rejects(
  handleReplaceManagedMerchProductCategories(event('brand-user', ['Member'], {
    productId: 'product-a', categoryIds: ['category-a'],
  }), makeClient()),
  /Permission products\.category\.assign is required/i,
)

await assert.rejects(
  handleReplaceManagedMerchProductCategories(event('admin-a', ['Admin'], {
    productId: 'product-a', categoryIds: ['category-missing'],
  }), makeClient()),
  /Merch Category not found: category-missing/i,
)

console.log('merch product relationship command tests passed')
