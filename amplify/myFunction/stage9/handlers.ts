import { writePermissionAudit } from '../shared/audit'
import { requireEffectivePermission } from '../shared/requirePermission'
import { getIdentityUsername, getResolverIdentity } from '../shared/auth'
import { decodeFulfillmentOrder } from '../fulfillment/orderJson'

async function loadDataClient() { return (await import('../shared/dataClient')).getDataClient() as any }

async function listAll(client: any, modelName: string) {
  const records: any[] = []; let nextToken: string | null | undefined
  do { const result = await client.models[modelName].list({ limit: 1000, nextToken }); if (result.errors?.length) throw new Error(result.errors[0].message); records.push(...(result.data || [])); nextToken = result.nextToken } while (nextToken)
  return records
}
function ok(result: any, label: string) { if (result.errors?.length) throw new Error(result.errors[0].message || `${label} failed`); return result.data }
function mutationResult(id: string, message?: string) { return { success: true, message: message || null, resourceId: id } }

export async function handleListManagedOrders(event: any, injected?: any) {
  const client = injected || await loadDataClient(); await requireEffectivePermission(event, client, 'orders.view')
  return { orders: (await listAll(client, 'FulfillmentOrder')).map(decodeFulfillmentOrder) }
}
export async function handleListManagedProfiles(event: any, injected?: any) {
  const client = injected || await loadDataClient(); await requireEffectivePermission(event, client, 'profiles.staff.view')
  return { profiles: await listAll(client, 'UserProfile') }
}
export async function handleRecoverManagedOrder(event: any, injected?: any) {
  const client = injected || await loadDataClient(); const actor = await requireEffectivePermission(event, client, 'orders.fulfillment.manage')
  const id = String(event.arguments?.orderId || ''); const order = decodeFulfillmentOrder(ok(await client.models.FulfillmentOrder.get({ id }), 'Order lookup')); if (!order) throw new Error('Order not found')
  const { fetchRevolutMerchantOrder } = await import('../revolut'); const payment = await fetchRevolutMerchantOrder(order.revolutOrderId); const state = String((payment.body as any)?.state || '').toLowerCase()
  if (!['paid', 'completed', 'captured'].includes(state)) throw new Error('Revolut payment is not paid')
  const recoveryEntry = { timestamp: new Date().toISOString(), action: 'Admin recovery started', result: 'verified', provider: null }
  await client.models.FulfillmentOrder.update({ id, auditHistory: JSON.stringify([...(order.auditHistory || []), recoveryEntry]), updatedAt: recoveryEntry.timestamp })
  const { dispatchFulfillment } = await import('../fulfillment'); const providers = await dispatchFulfillment({ ...order, auditHistory: [...(order.auditHistory || []), recoveryEntry] })
  await writePermissionAudit(client, actor.actorUserId, 'order.fulfillment.recover', 'FulfillmentOrder', id, { overallFulfillmentStatus: order.overallFulfillmentStatus }, { providerStatuses: providers })
  return mutationResult(id)
}
export async function handleReconcileManagedOrder(event: any, injected?: any, fetchPaymentInjected?: any) {
  const client = injected || await loadDataClient()
  const actor = await requireEffectivePermission(event, client, 'orders.fulfillment.manage')
  const id = String(event.arguments?.orderId || '')
  const order = decodeFulfillmentOrder(ok(await client.models.FulfillmentOrder.get({ id }), 'Order lookup'))
  if (!order) throw new Error('Order not found')

  const fetchPayment = fetchPaymentInjected || (await import('../revolut')).fetchRevolutMerchantOrder
  const payment = await fetchPayment(order.revolutOrderId)
  if (payment.statusCode < 200 || payment.statusCode >= 300) throw new Error('Revolut order lookup failed')
  const body = payment.body as any
  const state = String(body?.state || '').trim().toLowerCase()
  if (!state) throw new Error('Revolut payment state is missing')

  const expectedCurrency = String(order.currency || '').toUpperCase()
  const actualCurrency = String(body?.currency || '').toUpperCase()
  if (expectedCurrency && actualCurrency && expectedCurrency !== actualCurrency) throw new Error('Revolut payment currency does not match the stored order')
  if (typeof order.paymentAmount === 'number' && typeof body?.amount === 'number' && Math.round(order.paymentAmount * 100) !== body.amount) {
    throw new Error('Revolut payment amount does not match the stored order')
  }

  const paid = ['paid', 'completed', 'captured'].includes(state)
  const changed = String(order.paymentStatus || '').toLowerCase() !== state || (paid && !order.paymentDate) || Boolean(order.reconciliationError)
  if (changed) {
    const now = new Date().toISOString()
    await client.models.FulfillmentOrder.update({
      id,
      paymentStatus: state,
      paymentDate: paid ? order.paymentDate || now : order.paymentDate || null,
      reconciliationError: null,
      auditHistory: JSON.stringify([...(order.auditHistory || []), { timestamp: now, action: 'Payment reconciled', result: state, provider: 'revolut' }]),
      updatedAt: now,
    })
  }
  await writePermissionAudit(client, actor.actorUserId, 'order.payment.reconcile', 'FulfillmentOrder', id, { paymentStatus: order.paymentStatus }, { paymentStatus: state, changed })
  return mutationResult(id, changed ? `Payment updated to ${state}` : `Payment already ${state}`)
}
export async function handleImportManagedRevolutOrder(event: any, injected?: any) {
  const client = injected || await loadDataClient(); const actor = await requireEffectivePermission(event, client, 'orders.fulfillment.manage')
  const revolutOrderId = String(event.arguments?.revolutOrderId || '').trim(); if (!revolutOrderId) throw new Error('revolutOrderId is required')
  const existing = (await client.models.FulfillmentOrder.list({ filter: { revolutOrderId: { eq: revolutOrderId } } })).data?.[0]
  if (existing) return mutationResult(existing.id, 'Order already imported')
  const { fetchRevolutMerchantOrder } = await import('../revolut'); const payment = await fetchRevolutMerchantOrder(revolutOrderId); const body = payment.body as any; const state = String(body?.state || '').toLowerCase()
  if (payment.statusCode < 200 || payment.statusCode >= 300 || !['paid', 'completed', 'captured'].includes(state)) throw new Error('Revolut payment is not paid')
  const created = ok(await client.models.FulfillmentOrder.create({ projectOrderId: body.merchant_order_ext_ref || revolutOrderId, revolutOrderId, paymentStatus: state, paymentDate: new Date().toISOString(), paymentAmount: typeof body.amount === 'number' ? body.amount : null, currency: body.currency || null, overallFulfillmentStatus: 'recovery_required', customerName: '', email: body.email || '', shippingAddress: JSON.stringify({}), items: JSON.stringify([]), providerStatuses: JSON.stringify({}), auditHistory: JSON.stringify([]), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }), 'Order import')
  await writePermissionAudit(client, actor.actorUserId, 'order.revolut.import', 'FulfillmentOrder', created.id, null, { revolutOrderId, overallFulfillmentStatus: 'recovery_required' })
  return mutationResult(created.id)
}

export async function handleManageSimpleResource(event: any, injected?: any) {
  const client = injected || await loadDataClient(); const args = event.arguments || {}
  const configs: Record<string, { model: string; permission: string; audit: string; fields: string[] }> = {
    manageMerchCategory: { model: 'MerchCategory', permission: 'merch.categories.manage', audit: 'merch.category', fields: ['name', 'slug', 'description', 'sortOrder', 'isActive'] },
    manageEventTag: { model: 'EventTag', permission: 'events.tags.manage', audit: 'event.tag', fields: ['name', 'slug', 'type', 'visibleOnEventCard', 'isActive'] },
    reviewEventSuggestion: { model: 'EventSuggestion', permission: 'events.manage', audit: 'event.suggestion.review', fields: ['status', 'reviewNotes'] },
    manageForumCategory: { model: 'ForumCategory', permission: 'forums.structure.manage', audit: 'forum.category', fields: ['name', 'slug', 'description', 'sortOrder', 'isActive'] },
    manageForumBoard: { model: 'ForumBoard', permission: 'forums.structure.manage', audit: 'forum.board', fields: ['categoryId', 'name', 'slug', 'description', 'sortOrder', 'isActive', 'allowedGroups', 'threadCreateGroups'] },
    moderateForumThread: { model: 'ForumThread', permission: 'forums.moderate', audit: 'forum.thread.moderate', fields: ['isPinned', 'isLocked', 'isFeatured'] },
    moderateForumPost: { model: 'ForumPost', permission: 'forums.moderate', audit: 'forum.post.moderate', fields: ['content', 'editedAt'] },
  }
  const field = event.info?.fieldName || event.fieldName; const config = configs[field]; if (!config) throw new Error('Unsupported management operation')
  const action = String(args.action || 'update').toLowerCase(); const input = JSON.parse(String(args.input || '{}')); const id = String(args.resourceId || input.id || '')
  const before = id ? ok(await client.models[config.model].get({ id }), `${config.model} lookup`) : null
  let actor: { actorUserId: string }
  let ownerFallback = false
  try { actor = await requireEffectivePermission(event, client, config.permission) }
  catch (error) {
    const actorUserId = getIdentityUsername(getResolverIdentity(event)); const isForumContent = config.model === 'ForumThread' || config.model === 'ForumPost'
    const ownerUpdateFields = config.model === 'ForumPost' ? ['content', 'editedAt'] : ['title', 'contentPreview']
    const ownerAction = isForumContent && before?.owner === actorUserId && (action === 'delete' || (action === 'update' && Object.keys(input).every((key) => ownerUpdateFields.includes(key))))
    if (!ownerAction) throw error
    actor = { actorUserId }
    ownerFallback = true
  }
  const ownerFields = config.model === 'ForumPost' ? ['content', 'editedAt'] : ['title', 'contentPreview']
  const permittedFields = new Set(ownerFallback ? ownerFields : config.fields)
  const unexpectedField = Object.keys(input).find((key) => !permittedFields.has(key))
  if (unexpectedField) throw new Error(`Field ${unexpectedField} cannot be changed by ${field}`)
  const safeInput: Record<string, unknown> = Object.fromEntries(Object.entries(input).filter(([key, value]) => permittedFields.has(key) && value !== undefined))
  if (field === 'reviewEventSuggestion') safeInput.reviewedBy = actor.actorUserId
  let after: any = null
  if (action === 'create') after = ok(await client.models[config.model].create(safeInput), `${config.model} create`)
  else if (action === 'update') after = ok(await client.models[config.model].update({ ...safeInput, id }), `${config.model} update`)
  else if (action === 'delete') { ok(await client.models[config.model].delete({ id }), `${config.model} delete`) }
  else throw new Error('Unsupported action')
  const targetId = String(after?.id || id); await writePermissionAudit(client, actor.actorUserId, `${config.audit}.${action}`, config.model, targetId, before, after)
  return mutationResult(targetId)
}
