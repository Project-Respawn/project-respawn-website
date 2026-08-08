import assert from 'node:assert/strict';
import { filterProductsForProductControl, getProductControlCapabilities } from './ProductControl.access.js';

const platformContext = { groups: ['Admin'], brands: [] };
const staffContext = { groups: ['Staff'], brands: [] };
const ownerContext = {
  groups: ['Member'],
  brands: [{ brandId: 'brand-a', permissionKeys: ['brand.products.manage'] }],
};
const helperWithoutPermissionContext = {
  groups: ['Member'],
  brands: [{ brandId: 'brand-a', permissionKeys: [] }],
};

for (const context of [platformContext, staffContext]) {
  const capabilities = getProductControlCapabilities(context, '');
  assert.equal(capabilities.canEditScalarProduct, true);
  assert.equal(capabilities.canManageRelationships, true);
  assert.equal(capabilities.canManageMedia, true);
}

const ownerCapabilities = getProductControlCapabilities(ownerContext, 'brand-a');
assert.equal(ownerCapabilities.canEditScalarProduct, true);
assert.equal(ownerCapabilities.canManageRelationships, false);
assert.equal(ownerCapabilities.canManageMedia, false);
assert.equal(getProductControlCapabilities(helperWithoutPermissionContext, 'brand-a').canEditScalarProduct, false);

const products = [{ id: 'product-a' }, { id: 'product-b' }, { id: 'product-c' }];
const links = [
  { productId: 'product-a', brandId: 'brand-a' },
  { productId: 'product-a', brandId: 'brand-b' },
  { productId: 'product-b', brandId: 'brand-b' },
];
const multiBrandCapabilities = getProductControlCapabilities({
  groups: ['Member'],
  brands: [
    { brandId: 'brand-a', permissionKeys: ['brand.products.manage'] },
    { brandId: 'brand-b', permissionKeys: [] },
  ],
}, 'brand-b');
assert.deepEqual(filterProductsForProductControl(products, links, multiBrandCapabilities, 'brand-b').map((product) => product.id), ['product-a', 'product-b']);
assert.deepEqual(filterProductsForProductControl(products, links, multiBrandCapabilities, 'brand-c'), []);

console.log('Product Control access tests passed');
