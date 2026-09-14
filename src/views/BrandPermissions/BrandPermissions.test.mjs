import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { filterAdminUsers, helperFormForUser } from './brandPermissionUserSearch.js';

test('Brand Permissions is nested in the Admin layout and keeps Admin navigation', async () => {
  const [routes, layout, rootRoutes] = await Promise.all([
    readFile(new URL('../../router/admin.routes.js', import.meta.url), 'utf8'),
    readFile(new URL('../Admin/AdminLayout/AdminLayout.js', import.meta.url), 'utf8'),
    readFile(new URL('../../router/index.js', import.meta.url), 'utf8'),
  ]);
  assert.match(routes, /path: 'brand-permissions'[\s\S]*name: 'BrandPermissions'/);
  assert.match(layout, /route: '\/dashboard\/brand-permissions'/);
  assert.match(rootRoutes, /path: '\/brand-permissions'[\s\S]*redirect: \{ name: 'BrandPermissions' \}/);
});

test('username, display name and email search returns canonical Admin users', () => {
  const users = [{ cognitoSub: 'sub-123', username: 'raven', name: 'Raven Gamer', email: 'raven@example.com', status: 'CONFIRMED', enabled: true }];
  for (const query of ['raven', 'gamer', 'example.com']) {
    assert.equal(filterAdminUsers(users, query)[0].cognitoSub, 'sub-123');
  }
});

test('selecting a user retains canonical sub and loads existing permissions', () => {
  const user = { cognitoSub: 'sub-123', username: 'raven', name: 'Raven Gamer', email: 'raven@example.com' };
  const form = helperFormForUser(user, [{ userId: 'sub-123', displayName: 'Existing', email: 'old@example.com', permissionKeys: ['brand.twitch.manage'] }]);
  assert.deepEqual(form, { userId: 'sub-123', displayName: 'Existing', email: 'old@example.com', permissionKeys: ['brand.twitch.manage'] });
  const changed = helperFormForUser({ cognitoSub: 'sub-456', username: 'helper-two' }, [{ userId: 'sub-456', permissionKeys: ['brand.events.manage'] }]);
  assert.equal(changed.userId, 'sub-456');
  assert.deepEqual(changed.permissionKeys, ['brand.events.manage']);
});

test('page uses the Admin-only search operation and saves canonical userId', async () => {
  const page = await readFile(new URL('./BrandPermissions.js', import.meta.url), 'utf8');
  const schema = await readFile(new URL('../../../amplify/data/resource.ts', import.meta.url), 'utf8');
  const handler = await readFile(new URL('../../../amplify/functions/admin-user-management/handler.ts', import.meta.url), 'utf8');
  assert.match(page, /queries\.listAdminUsers\(\)/);
  assert.match(page, /userId: this\.helperForm\.userId\.trim\(\)/);
  assert.match(page, /brandId: this\.selectedBrandId,[\s\S]*userId: this\.helperForm\.userId\.trim\(\)/);
  assert.match(schema, /listAdminUsers:[\s\S]*allow\.groups\(\['SuperAdmin', 'Admin', 'Staff'\]\)/);
  assert.match(handler, /case 'listAdminUsers':[\s\S]*authorizeAdminUserOperation\(event, dataClient, 'users\.view'\)/);
});
