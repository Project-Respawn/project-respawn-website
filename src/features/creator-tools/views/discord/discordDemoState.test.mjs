import test from 'node:test'
import assert from 'node:assert/strict'
import { commandCatalogue, createDiscordDemoState, demoChannels, demoRoles, renderGreeting, roleRestriction, validateCustomCommand } from './discordDemoState.js'

test('demo state is deterministic and uses string Discord IDs', () => {
  assert.deepEqual(createDiscordDemoState(), createDiscordDemoState())
  assert.ok(demoChannels.every(({ id }) => typeof id === 'string'))
  assert.ok(demoRoles.every(({ id }) => typeof id === 'string'))
})

test('custom commands validate names, uniqueness and content', () => {
  assert.equal(validateCustomCommand({ name: 'help', description: 'x', response: 'y' }).valid, false)
  assert.equal(validateCustomCommand({ name: 'Bad Name', description: 'x', response: 'y' }).valid, false)
  assert.equal(validateCustomCommand({ name: 'loadout', description: 'Show it', response: 'Ready' }).command.key, '/loadout')
})

test('greeting templates render allowlisted placeholders safely', () => {
  assert.equal(renderGreeting('Hi {user}, welcome to {server} #{memberCount}').text, 'Hi @Nova, welcome to Respawn Creators #1,285')
  assert.equal(renderGreeting('Hi {unknown}').valid, false)
  assert.equal(renderGreeting('@everyone welcome').text, '@\u200beveryone welcome')
})

test('catalogue is unique and restricted roles are rejected', () => {
  assert.equal(new Set(commandCatalogue.map(({ key }) => key)).size, commandCatalogue.length)
  assert.match(roleRestriction('1300000000000000005'), /managed/i)
  assert.equal(roleRestriction('1300000000000000001'), '')
})
