import assert from 'node:assert/strict'
import test from 'node:test'
import { handleReconcileManagedOrder } from './handlers'

function event() {
  return { identity: { username: 'admin-1', claims: { 'cognito:groups': ['Admin'] } }, info: { fieldName: 'reconcileManagedOrder' }, arguments: { orderId: 'order-1' } }
}

function client(order: any) {
  const updates: any[] = []
  const audits: any[] = []
  return {
    models: {
      PermissionDefinition: { list: async () => ({ data: [{ key: 'orders.fulfillment.manage', isActive: true }] }) },
      GroupPermission: { list: async () => ({ data: [{ permissionKey: 'orders.fulfillment.manage', groupName: 'Admin', enabled: true }] }) },
      FulfillmentOrder: { get: async () => ({ data: order }), update: async (input: any) => { updates.push(input); return { data: { ...order, ...input } } } },
      PermissionAuditEvent: { create: async (input: any) => { audits.push(input); return { data: input } } },
    },
    updates,
    audits,
  }
}

const pendingOrder = { id: 'order-1', revolutOrderId: 'revolut-1', paymentStatus: 'pending', paymentDate: null, paymentAmount: 80, currency: 'GBP', auditHistory: [] }

test('captured Revolut payment updates the same stored pending order', async () => {
  const data = client(pendingOrder)
  const result = await handleReconcileManagedOrder(event(), data, async () => ({ statusCode: 200, body: { state: 'completed', amount: 8000, currency: 'GBP' } }))
  assert.equal(result.resourceId, 'order-1')
  assert.equal(data.updates.length, 1)
  assert.equal(data.updates[0].id, 'order-1')
  assert.equal(data.updates[0].paymentStatus, 'completed')
  assert.ok(data.updates[0].paymentDate)
})

test('reconciling an unchanged order is idempotent', async () => {
  const data = client({ ...pendingOrder, paymentStatus: 'completed', paymentDate: '2026-08-21T00:00:00Z' })
  const result = await handleReconcileManagedOrder(event(), data, async () => ({ statusCode: 200, body: { state: 'completed', amount: 8000, currency: 'GBP' } }))
  assert.equal(data.updates.length, 0)
  assert.match(result.message || '', /already completed/)
})

test('reconciliation rejects amount mismatch without updating the order', async () => {
  const data = client(pendingOrder)
  await assert.rejects(() => handleReconcileManagedOrder(event(), data, async () => ({ statusCode: 200, body: { state: 'completed', amount: 9000, currency: 'GBP' } })), /amount does not match/)
  assert.equal(data.updates.length, 0)
})
