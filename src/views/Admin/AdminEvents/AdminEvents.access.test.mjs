import assert from 'node:assert/strict';
import { filterEventsForAdminEvents, getAdminEventsCapabilities } from './AdminEvents.access.js';

for (const group of ['Admin', 'Staff']) {
  const capabilities = getAdminEventsCapabilities({ groups: [group], brands: [] }, '');
  assert.equal(capabilities.isPlatformOperator, true);
  assert.equal(capabilities.canManageSelectedBrandEvents, true);
}

const ownerCapabilities = getAdminEventsCapabilities({
  groups: ['Member'], brands: [{ brandId: 'brand-a', permissionKeys: ['brand.events.manage'] }],
}, 'brand-a');
assert.equal(ownerCapabilities.canManageSelectedBrandEvents, true);

const helperCapabilities = getAdminEventsCapabilities({
  groups: ['Member'], brands: [{ brandId: 'brand-a', permissionKeys: ['brand.events.manage'] }],
}, 'brand-a');
assert.equal(helperCapabilities.canManageSelectedBrandEvents, true);
assert.equal(getAdminEventsCapabilities({
  groups: ['Member'], brands: [{ brandId: 'brand-a', permissionKeys: [] }],
}, 'brand-a').canManageSelectedBrandEvents, false);

const multiBrandCapabilities = getAdminEventsCapabilities({
  groups: ['Member'],
  brands: [
    { brandId: 'brand-a', permissionKeys: ['brand.events.manage'] },
    { brandId: 'brand-b', permissionKeys: [] },
  ],
}, 'brand-b');
const events = [{ id: 'event-a', brandId: 'brand-a' }, { id: 'event-b', brandId: 'brand-b' }, { id: 'event-c', brandId: 'brand-c' }];
assert.deepEqual(filterEventsForAdminEvents(events, multiBrandCapabilities, 'brand-b').map((event) => event.id), ['event-b']);
assert.deepEqual(filterEventsForAdminEvents(events, multiBrandCapabilities, 'brand-c'), []);

console.log('Admin Events access tests passed');
