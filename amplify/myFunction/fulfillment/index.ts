import { getDataClient } from '../shared/dataClient'
import { jsonResponse } from '../shared/responses'
import { logger } from '../shared/logger'
import { createPrintfulOrder } from '../printful'
import { fetchRevolutMerchantOrder } from '../revolut'

type FulfillmentItem = {
  productId: string
  quantity: number
  fulfillmentProvider?: string
  fulfillmentVariantId?: string
}

type ProviderStatus = { status: 'pending' | 'fulfilled' | 'failed'; providerOrderId?: string; message?: string; lastAttempt?: string; lastError?: string }
type ProviderStatuses = Record<string, ProviderStatus>

function audit(action: string, result: string, provider?: string) {
  return { timestamp: new Date().toISOString(), action, result, provider: provider || null }
}

function overallStatus(providerStatuses: ProviderStatuses) {
  const statuses = Object.values(providerStatuses)
  if (!statuses.length) return 'recovery_required'
  if (statuses.every((status) => status.status === 'fulfilled')) return 'fulfilled'
  if (statuses.some((status) => status.status === 'failed')) return 'failed'
  if (statuses.some((status) => status.status === 'fulfilled')) return 'partially_fulfilled'
  return 'pending'
}

function groupByProvider(items: FulfillmentItem[]) {
  return items.reduce<Record<string, FulfillmentItem[]>>((groups, item) => {
    const provider = String(item.fulfillmentProvider || 'manual').toLowerCase()
    ;(groups[provider] ||= []).push(item)
    return groups
  }, {})
}

function isPaid(state: unknown) {
  return ['paid', 'completed', 'captured'].includes(String(state || '').toLowerCase())
}

async function saveProviderStatuses(client: any, order: any, providerStatuses: ProviderStatuses, auditEntries: unknown[]) {
  await client.models.FulfillmentOrder.update({
    id: order.id,
    providerStatuses,
    overallFulfillmentStatus: overallStatus(providerStatuses),
    auditHistory: [...(order.auditHistory || []), ...auditEntries],
    updatedAt: new Date().toISOString(),
  })
}

export async function dispatchFulfillment(order: any) {
  const client = await getDataClient() as any
  const items = Array.isArray(order.items) ? order.items as FulfillmentItem[] : []
  const providerStatuses: ProviderStatuses = { ...(order.providerStatuses || {}) }
  const auditEntries: unknown[] = []

  for (const [provider, providerItems] of Object.entries(groupByProvider(items))) {
    if (providerStatuses[provider]?.status === 'fulfilled') {
      logger.info('Provider already fulfilled', { provider, orderId: order.revolutOrderId })
      auditEntries.push(audit('Provider already fulfilled', 'skipped', provider))
      continue
    }

    logger.info('Dispatching fulfillment provider', { provider, orderId: order.revolutOrderId })

    if (provider !== 'printful') {
      providerStatuses[provider] = { status: 'pending', message: 'Provider is not implemented', lastAttempt: new Date().toISOString() }
      auditEntries.push(audit('Fulfillment dispatch', 'pending', provider))
      continue
    }

    const printfulItems = providerItems
      .filter((item) => item.fulfillmentVariantId)
      .map((item) => ({ sync_variant_id: item.fulfillmentVariantId, quantity: item.quantity }))

    if (printfulItems.length !== providerItems.length) {
      providerStatuses.printful = { status: 'failed', message: 'Missing Printful fulfillment variant ID', lastAttempt: new Date().toISOString(), lastError: 'Missing Printful fulfillment variant ID' }
      auditEntries.push(audit('Printful fulfillment', 'failed', 'printful'))
      continue
    }

    try {
      logger.info('Creating Printful order', { orderId: order.revolutOrderId })
      const result = await createPrintfulOrder({
        orderId: order.revolutOrderId,
        shippingMethod: 'STANDARD',
        items: printfulItems,
        customerName: order.customerName,
        email: order.email,
        address: order.shippingAddress?.address,
        city: order.shippingAddress?.city,
        state: order.shippingAddress?.state,
        postcode: order.shippingAddress?.postcode,
        country: order.shippingAddress?.country,
      })
      logger.info('Printful response status', { status: result.statusCode })
      if (result.statusCode >= 200 && result.statusCode < 300) {
        const body = result.body as { result?: { id?: string } }
        providerStatuses.printful = { status: 'fulfilled', providerOrderId: body.result?.id, lastAttempt: new Date().toISOString() }
        auditEntries.push(audit('Printful fulfillment', 'fulfilled', 'printful'))
        logger.info('Provider fulfillment success', { provider: 'printful', orderId: order.revolutOrderId })
      } else {
        providerStatuses.printful = { status: 'failed', message: 'Printful order creation failed', lastAttempt: new Date().toISOString(), lastError: 'Printful order creation failed' }
        auditEntries.push(audit('Printful fulfillment', 'failed', 'printful'))
        logger.warn('Provider fulfillment failure', { provider: 'printful', orderId: order.revolutOrderId })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Printful order creation failed'
      providerStatuses.printful = { status: 'failed', message, lastAttempt: new Date().toISOString(), lastError: message }
      auditEntries.push(audit('Printful fulfillment', 'failed', 'printful'))
      logger.error('Provider fulfillment failure', { provider: 'printful', orderId: order.revolutOrderId })
    }
  }

  await saveProviderStatuses(client, order, providerStatuses, auditEntries)
  return providerStatuses
}

async function findOrder(client: any, identifier: string) {
  const byRevolut = await client.models.FulfillmentOrder.list({ filter: { revolutOrderId: { eq: identifier } } })
  if (byRevolut.data?.[0]) return byRevolut.data[0]
  const byProject = await client.models.FulfillmentOrder.list({ filter: { projectOrderId: { eq: identifier } } })
  return byProject.data?.[0] || null
}

export async function handleFulfillmentRequest(body: any) {
  const client = await getDataClient() as any
  const revolutOrderId = String(body?.revolutOrderId || '')
  const projectOrderId = String(body?.projectOrderId || revolutOrderId)
  if (!revolutOrderId || !Array.isArray(body?.items)) return jsonResponse(400, { error: 'Missing paid order fulfillment data' })

  const payment = await fetchRevolutMerchantOrder(revolutOrderId)
  const paymentState = (payment.body as { state?: string }).state
  if (payment.statusCode < 200 || payment.statusCode >= 300 || !isPaid(paymentState)) {
    return jsonResponse(409, { error: 'Revolut payment is not paid', revolutOrderId })
  }
  logger.info('Payment verified', { orderId: revolutOrderId, state: paymentState })

  let order = await findOrder(client, revolutOrderId)
  const alreadyFulfilled = Boolean(order) && Object.keys(order.providerStatuses || {}).length > 0 && Object.values(order.providerStatuses || {}).every((status: any) => status?.status === 'fulfilled')
  if (!order) {
    const create = await client.models.FulfillmentOrder.create({
      projectOrderId,
      revolutOrderId,
      paymentStatus: String(paymentState).toLowerCase(),
      paymentDate: new Date().toISOString(),
      paymentAmount: typeof body.paymentAmount === 'number' ? body.paymentAmount : null,
      currency: typeof body.currency === 'string' ? body.currency : null,
      overallFulfillmentStatus: 'pending',
      customerName: String(body.customerName || ''),
      email: String(body.email || ''),
      shippingAddress: body.shippingAddress || {},
      items: body.items,
      providerStatuses: {},
      auditHistory: [audit('Order created', 'success'), audit('Payment successful', 'verified')],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    order = create.data
  }
  const providers = await dispatchFulfillment(order)
  return jsonResponse(200, { success: true, alreadyFulfilled, revolutOrderId, providers })
}

export async function handleRecoveryFulfillment(body: any) {
  const identifier = String(body?.revolutOrderId || body?.projectOrderId || '')
  logger.info('Recovery requested', { identifier })
  if (!identifier) return jsonResponse(400, { error: 'Missing revolutOrderId or projectOrderId' })
  const client = await getDataClient() as any
  const order = await findOrder(client, identifier)
  if (!order) return jsonResponse(404, { error: 'Order was not stored; shipping address, provider assignments, and variant quantities cannot be safely reconstructed from Revolut.' })
  const payment = await fetchRevolutMerchantOrder(order.revolutOrderId)
  const paymentState = (payment.body as { state?: string }).state
  if (!isPaid(paymentState)) return jsonResponse(409, { error: 'Revolut payment is not paid', revolutOrderId: order.revolutOrderId })
  logger.info('Payment verified', { orderId: order.revolutOrderId, state: paymentState })
  const alreadyFulfilled = Object.keys(order.providerStatuses || {}).length > 0 && Object.values(order.providerStatuses || {}).every((status: any) => status?.status === 'fulfilled')
  await saveProviderStatuses(client, order, order.providerStatuses || {}, [audit('Admin recovery started', 'verified')])
  const refreshed = { ...order, auditHistory: [...(order.auditHistory || []), audit('Admin recovery started', 'verified')] }
  const providers = await dispatchFulfillment(refreshed)
  return jsonResponse(200, { success: true, alreadyFulfilled, revolutOrderId: order.revolutOrderId, providers })
}

export async function handleExistingRevolutOrderImport(body: any) {
  const revolutOrderId = String(body?.revolutOrderId || '')
  if (!revolutOrderId) return jsonResponse(400, { error: 'Missing revolutOrderId' })
  const client = await getDataClient() as any
  const existing = await findOrder(client, revolutOrderId)
  if (existing) return jsonResponse(200, { success: true, imported: false, order: existing })
  const payment = await fetchRevolutMerchantOrder(revolutOrderId)
  const paymentBody = payment.body as { state?: string; merchant_order_ext_ref?: string; amount?: number; currency?: string; email?: string }
  if (payment.statusCode < 200 || payment.statusCode >= 300 || !isPaid(paymentBody.state)) {
    return jsonResponse(409, { error: 'Revolut payment is not paid', revolutOrderId })
  }
  const missingData = 'Recovery requires the original shipping address, item quantities, fulfillment providers, and Printful sync variant IDs.'
  const create = await client.models.FulfillmentOrder.create({
    projectOrderId: paymentBody.merchant_order_ext_ref || revolutOrderId,
    revolutOrderId,
    paymentStatus: String(paymentBody.state).toLowerCase(),
    paymentDate: new Date().toISOString(),
    paymentAmount: typeof paymentBody.amount === 'number' ? paymentBody.amount : null,
    currency: paymentBody.currency || null,
    overallFulfillmentStatus: 'recovery_required',
    customerName: '',
    email: paymentBody.email || '',
    shippingAddress: {},
    items: [],
    providerStatuses: {},
    auditHistory: [audit('Existing Revolut order imported', 'recovery_required')],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  return jsonResponse(200, { success: true, imported: true, recoveryRequired: true, missingData, order: create.data })
}
