import assert from 'node:assert/strict'
import { authorizeAdminUserOperation } from './authorization'
import { testPermissionModels } from '../../myFunction/shared/testPermissionModels'

const event = (group: 'Admin' | 'Staff') => ({
  identity: { username: `${group.toLowerCase()}-without-grant`, claims: { 'cognito:groups': [group] } },
})

for (const group of ['Admin', 'Staff'] as const) {
  for (const permissionKey of ['users.view', 'users.manage'] as const) {
    await assert.rejects(
      authorizeAdminUserOperation(event(group), { models: testPermissionModels([permissionKey], []) }, permissionKey),
      new RegExp(`Permission ${permissionKey.replace('.', '\\.')} is required`, 'i'),
    )
  }
}

await authorizeAdminUserOperation(
  event('Staff'),
  { models: testPermissionModels(['users.view'], ['Staff']) },
  'users.view',
)

console.log('admin user-operation effective permission tests passed')
