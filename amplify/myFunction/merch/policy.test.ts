import assert from 'node:assert/strict'
import {
  BRAND_USER_EDITABLE_MERCH_PRODUCT_FIELDS,
  assertBrandProductFieldsAreAllowed,
  hasBrandProductsManagePermission,
} from './policy'

assert.deepEqual(BRAND_USER_EDITABLE_MERCH_PRODUCT_FIELDS, [
  'title', 'slug', 'shortDescription', 'description', 'materials', 'sizeGuide',
  'shippingReturns', 'whatsIncluded', 'careInstructions', 'fitNotes', 'status', 'isVisible',
])
assert.doesNotThrow(() => assertBrandProductFieldsAreAllowed({ title: 'Updated', isVisible: false }))
assert.throws(() => assertBrandProductFieldsAreAllowed({ sourceType: 'manual' }), /cannot edit product field: sourceType/i)
assert.throws(() => assertBrandProductFieldsAreAllowed({ imageUrl: 'https://example.test/image.png' }), /cannot edit product field: imageUrl/i)

const brand = { id: 'brand-a', ownerUserId: 'owner-a' }
const helperAccess = { id: 'access-a', brandId: 'brand-a', userId: 'helper-a', accessLevel: 'helper' }
assert.equal(hasBrandProductsManagePermission('owner-a', brand, [], []), true)
assert.equal(hasBrandProductsManagePermission('helper-a', brand, [helperAccess], [
  { brandAccessId: 'access-a', permissionKey: 'brand.products.manage' },
]), true)
assert.equal(hasBrandProductsManagePermission('helper-a', brand, [helperAccess], [
  { brandAccessId: 'access-b', permissionKey: 'brand.products.manage' },
]), false)
assert.equal(hasBrandProductsManagePermission('helper-a', brand, [
  { ...helperAccess, brandId: 'brand-b' },
], [{ brandAccessId: 'access-a', permissionKey: 'brand.products.manage' }]), false)
console.log('merch product authorization policy tests passed')
