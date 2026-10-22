import assert from 'node:assert/strict'
import test from 'node:test'
import { handleRecoverManagedOrder, handleReconcileManagedOrder } from './handlers'

test('administrative recovery and reconciliation reject anonymous and unprivileged callers before reading orders', async () => {
  let reads = 0
  const client = { models: {
    PermissionDefinition: { list: async () => ({ data: [] }) },
    GroupPermission: { list: async () => ({ data: [] }) },
    FulfillmentOrder: { get: async () => { reads++; throw new Error('Must not read orders') } },
  } }
  for (const handler of [handleRecoverManagedOrder, handleReconcileManagedOrder]) {
    await assert.rejects(() => handler({ arguments: { orderId: 'known', email: 'owner@example.invalid' } }, client), /Authenticated identity/)
    await assert.rejects(() => handler({ identity: { username: 'customer', claims: { 'cognito:groups': ['Member'] } }, arguments: { orderId: 'known' } }, client), /orders.fulfillment.manage/)
  }
  assert.equal(reads, 0)
})

test('authorized administrator reaches stored-order validation; unknown orders remain held', async () => {
  const permissionKey = 'orders.fulfillment.manage'
  const client = { models: {
    PermissionDefinition: { list: async () => ({ data: [{ key: permissionKey, isActive: true }] }) },
    GroupPermission: { list: async () => ({ data: [{ permissionKey, groupName: 'Staff', enabled: true }] }) },
    FulfillmentOrder: { get: async () => ({ data: null }) },
  } }
  const event = { identity: { username: 'staff', claims: { 'cognito:groups': ['Staff'] } }, arguments: { orderId: 'unknown' } }
  await assert.rejects(() => handleRecoverManagedOrder(event, client), /Order not found/)
})
