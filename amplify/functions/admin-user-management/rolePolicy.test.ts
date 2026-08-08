import assert from 'node:assert/strict'
import { assertRoleChangeAllowed, getRoleManager } from './rolePolicy'

function expectDenied(callback: () => unknown) {
  assert.throws(callback, /cannot|authorized|SuperAdmin/i)
}

assert.doesNotThrow(() => assertRoleChangeAllowed(
  getRoleManager(['SuperAdmin']),
  ['Member'],
  ['Member', 'Admin'],
))
expectDenied(() => assertRoleChangeAllowed(getRoleManager(['SuperAdmin']), ['Member'], ['Member', 'SuperAdmin']))
expectDenied(() => assertRoleChangeAllowed(getRoleManager(['SuperAdmin']), ['SuperAdmin', 'Member'], ['Member']))
expectDenied(() => assertRoleChangeAllowed(getRoleManager(['Admin']), ['Member'], ['Member', 'Admin']))
expectDenied(() => assertRoleChangeAllowed(getRoleManager(['Admin']), ['Member'], ['Member', 'SuperAdmin']))
expectDenied(() => assertRoleChangeAllowed(getRoleManager(['Staff']), ['Member'], ['Member', 'Moderator']))
assert.doesNotThrow(() => assertRoleChangeAllowed(getRoleManager(['Staff']), ['Member'], ['Member', 'Trainer']))
for (const role of ['Staff', 'Admin', 'SuperAdmin'] as const) {
  expectDenied(() => assertRoleChangeAllowed(getRoleManager(['Staff']), ['Member'], ['Member', role]))
}
expectDenied(() => assertRoleChangeAllowed(getRoleManager(['Moderator']), ['Member'], ['Member', 'Trainer']))
expectDenied(() => assertRoleChangeAllowed(getRoleManager([]), ['Member'], ['Member', 'Trainer']))

console.log('rolePolicy tests passed')
