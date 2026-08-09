import assert from 'node:assert/strict';
import { assertCreatedBrandVisible, listAllBrands, normalizeOwnerUsers, requireSuccessfulBrandMutation } from './AdminBrands.results.js';

assert.throws(
  () => requireSuccessfulBrandMutation({ data: { success: false, message: 'Brand write denied' } }, 'Failed to create brand.'),
  /Brand write denied/,
  'a resolver failure must not be shown as a successful create',
);

const created = requireSuccessfulBrandMutation(
  { data: { success: true, message: 'Brand created', brandId: 'persisted-brand-id' } },
  'Failed to create brand.',
);
assert.equal(created.brandId, 'persisted-brand-id');
assert.doesNotThrow(() => assertCreatedBrandVisible([{ id: 'persisted-brand-id' }], created.brandId));
assert.throws(() => assertCreatedBrandVisible([], created.brandId), /could not be found in Existing Brands/);
assert.throws(
  () => requireSuccessfulBrandMutation({ errors: [{ message: 'GraphQL transport failure' }] }, 'Failed to create brand.'),
  /GraphQL transport failure/,
);

const pages = [
  { data: [{ id: 'active-brand', isActive: true }], nextToken: 'page-2' },
  { data: [{ id: 'archived-brand', isActive: false }], nextToken: null },
];
let pageIndex = 0;
const listOptions = [];
assert.deepEqual(
  await listAllBrands({ models: { Brand: { list: async (options) => { listOptions.push(options); return pages[pageIndex++]; } } } }),
  [{ id: 'active-brand', isActive: true }, { id: 'archived-brand', isActive: false }],
  'Existing Brands loads every page and retains active and archived Brands',
);
assert.deepEqual(listOptions[0], { authMode: 'userPool', limit: 1000 }, 'first Brand page omits a pagination token');
assert.deepEqual(listOptions[1], { authMode: 'userPool', limit: 1000, nextToken: 'page-2' }, 'subsequent Brand page uses the generated nextToken unchanged');
await assert.rejects(
  listAllBrands({ models: { Brand: { list: async () => ({ errors: [{ message: 'Brand list denied' }] }) } } }),
  /Brand list denied/,
);
assert.deepEqual(
  normalizeOwnerUsers([
    { username: 'owner-b', name: 'Bea', email: 'bea@example.test' },
    { id: 'owner-a', name: 'Alex', email: '' },
  ]),
  [
    { userId: 'owner-a', label: 'Alex — owner-a' },
    { userId: 'owner-b', label: 'Bea — bea@example.test' },
  ],
  'owner selector uses canonical usernames with recognisable user details',
);

console.log('Admin Brands mutation result tests passed');
