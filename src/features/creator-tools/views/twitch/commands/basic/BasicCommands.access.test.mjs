import assert from 'node:assert/strict';
import { filterTwitchCommandsForBrand, getTwitchCommandCapabilities } from './BasicCommands.access.js';

const admin = getTwitchCommandCapabilities({ groups: ['Admin'], brands: [{ brandId: 'brand-a' }] }, 'brand-a');
assert.equal(admin.canManageSelectedBrandCommands, true);
const owner = getTwitchCommandCapabilities({ groups: ['Member'], brands: [{ brandId: 'brand-a', permissionKeys: ['brand.twitch.manage'] }] }, 'brand-a');
assert.equal(owner.canManageSelectedBrandCommands, true);
const helper = getTwitchCommandCapabilities({ groups: ['Member'], brands: [{ brandId: 'brand-a', permissionKeys: ['brand.twitch.manage'] }] }, 'brand-a');
assert.equal(helper.canManageSelectedBrandCommands, true);
assert.equal(getTwitchCommandCapabilities({ groups: ['Member'], brands: [{ brandId: 'brand-a', permissionKeys: [] }] }, 'brand-a').canManageSelectedBrandCommands, false);

const commands = [{ id: 'a', brandId: 'brand-a' }, { id: 'b', brandId: 'brand-b' }, { id: 'legacy', brandId: null }];
assert.deepEqual(filterTwitchCommandsForBrand(commands, owner, 'brand-a').map((command) => command.id), ['a']);
assert.deepEqual(filterTwitchCommandsForBrand(commands, owner, 'brand-b'), []);
assert.deepEqual(filterTwitchCommandsForBrand(commands, admin, 'brand-a').map((command) => command.id), ['a', 'legacy']);

console.log('Twitch Commands access tests passed');
