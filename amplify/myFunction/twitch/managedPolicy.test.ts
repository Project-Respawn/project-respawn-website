import assert from 'node:assert/strict'
import { MANAGED_TWITCH_COMMAND_FIELDS, getRequestedTwitchCommandFields } from './managedPolicy'

assert.deepEqual(MANAGED_TWITCH_COMMAND_FIELDS, ['streamerId', 'name', 'reply', 'enabled', 'cooldownSeconds', 'isCustom', 'category', 'permissionLevel'])
assert.deepEqual(getRequestedTwitchCommandFields({ name: 'hello', reply: 'Hi', ownerUserId: 'spoofed' }), ['name', 'reply'])
console.log('managed Twitch command policy tests passed')
