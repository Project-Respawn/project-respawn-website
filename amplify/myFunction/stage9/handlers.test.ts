import assert from 'node:assert/strict'
import { handleListManagedOrders, handleManageSimpleResource, prepareManagedOrders } from './handlers'

function client(permissionKey: string, groupName = 'Moderator') {
  const writes: any[] = []; const audits: any[] = []
  const models: any = {
    PermissionDefinition: { list: async () => ({ data: [{ key: permissionKey, isActive: true }] }) },
    GroupPermission: { list: async () => ({ data: [{ permissionKey, groupName, enabled: true }] }) },
    FulfillmentOrder: { list: async () => ({ data: [{ id: 'order-1', projectOrderId: 'PR-1', revolutOrderId: 'rev-1', paymentStatus: 'pending' }] }) },
    ForumThread: {
      get: async () => ({ data: { id: 'thread-1', owner: 'owner-1', isLocked: false } }),
      update: async (input: any) => { writes.push(input); return { data: input } },
    },
    PermissionAuditEvent: { create: async (input: any) => { audits.push(input); return { data: input } } },
  }
  return { models, writes, audits }
}
const event = (groupName: string, fieldName: string, args: any = {}) => ({ identity: { username: 'actor-1', claims: { 'cognito:groups': [groupName] } }, info: { fieldName }, arguments: args });
{
  const testClient = client('forums.moderate')
  const ownerEvent = { ...event('Member', 'moderateForumThread', { action: 'update', resourceId: 'thread-1', input: JSON.stringify({ title: 'Owner edit' }) }), identity: { username: 'owner-1', claims: { 'cognito:groups': ['Member'] } } }
  assert.equal((await handleManageSimpleResource(ownerEvent, testClient)).success, true)
  await assert.rejects(() => handleManageSimpleResource({ ...ownerEvent, arguments: { action: 'update', resourceId: 'thread-1', input: JSON.stringify({ isPinned: true }) } }, testClient), /forums\.moderate/)
}

{
  const records = [
    { id: 'junk', revolutOrderId: '', projectOrderId: '', paymentStatus: '', customerName: '', email: '', shippingAddress: '{}', items: '[]', providerStatuses: '{}', auditHistory: '[]' },
    { id: 'pending', revolutOrderId: 'rev-pending', projectOrderId: 'PR-PENDING', paymentStatus: 'pending', createdAt: '2026-08-23T10:00:00Z', items: '[]', providerStatuses: '{}', auditHistory: '[]' },
    { id: 'paid', revolutOrderId: 'rev-paid', projectOrderId: 'PR-PAID', paymentStatus: 'completed', createdAt: '2026-08-23T11:00:00Z', items: '[{"productId":"one"}]', providerStatuses: '{}', auditHistory: '[]' },
    { id: 'import', revolutOrderId: 'rev-import', projectOrderId: 'PR-IMPORT', paymentStatus: 'completed', overallFulfillmentStatus: 'recovery_required', auditHistory: '[{"action":"Existing Revolut order imported"}]' },
  ]
  const prepared = prepareManagedOrders(records)
  assert.deepEqual(prepared.map((order) => order.id), ['paid', 'pending', 'import'])
  assert.deepEqual(prepared[0].items, [{ productId: 'one' }])
}

{
  const testClient = client('orders.view', 'Staff')
  const result = await handleListManagedOrders(event('Staff', 'listManagedOrders'), testClient)
  assert.equal(result.orders[0].id, 'order-1')
  await assert.rejects(() => handleListManagedOrders(event('Member', 'listManagedOrders'), testClient), /orders\.view/)
}
{
  const testClient = client('forums.moderate')
  const result = await handleManageSimpleResource(event('Moderator', 'moderateForumThread', { action: 'update', resourceId: 'thread-1', input: JSON.stringify({ isLocked: true }) }), testClient)
  assert.equal(result.success, true); assert.equal(testClient.writes[0].isLocked, true); assert.equal(testClient.audits[0].action, 'forum.thread.moderate.update')
  await assert.rejects(() => handleManageSimpleResource(event('Moderator', 'moderateForumThread', { action: 'update', resourceId: 'thread-1', input: JSON.stringify({ owner: 'attacker' }) }), testClient), /Field owner cannot be changed/)
  await assert.rejects(() => handleManageSimpleResource(event('Member', 'moderateForumThread', { action: 'update', resourceId: 'thread-1', input: '{}' }), testClient), /forums\.moderate/)
}
