import { jsonResponse } from '../shared/responses'
import { logger } from '../shared/logger'
import { createPrintfulOrder } from '../printful'
import { fetchRevolutMerchantOrder } from '../revolut'
import { isPrintfulFulfillmentEnabled, REVOLUT_MODE } from '../config/env'
import { decodeFulfillmentOrder } from './orderJson'
import { createValidatedFulfillmentOrder, validateFulfillmentOrder } from './orderValidation'

type FulfillmentItem = {
  productId: string
  variantId?: string
  externalVariantId?: string
  quantity: number
  fulfillmentProvider?: string
  fulfillmentVariantId?: string
  productName?: string
  color?: string
  size?: string
  unitPrice?: number
}

type ProviderStatus = { status: 'pending' | 'fulfilled' | 'failed' | 'test_skipped'; providerOrderId?: string; message?: string; lastAttempt?: string; lastError?: string }
type ProviderStatuses = Record<string, ProviderStatus>

async function getDataClient() {
  const dataClient = await import('../shared/dataClient')
  return dataClient.getDataClient()
}

function audit(action: string, result: string, provider?: string) {
  return { timestamp: new Date().toISOString(), action, result, provider: provider || null }
}

export function fulfillmentOrderInput(order: any) {
  validateFulfillmentOrder(order)
  return {
    ...order,
    shippingAddress: JSON.stringify(order.shippingAddress || {}),
    items: JSON.stringify(order.items || []),
    providerStatuses: JSON.stringify(order.providerStatuses || {}),
    auditHistory: JSON.stringify(order.auditHistory || []),
  }
}

function overallStatus(providerStatuses: ProviderStatuses) {
  const statuses = Object.values(providerStatuses)
  if (!statuses.length) return 'recovery_required'
  if (statuses.every((status) => status.status === 'fulfilled')) return 'fulfilled'
  if (statuses.every((status) => status.status === 'test_skipped')) return 'test_skipped'
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

function transactionEnvironment() {
  return REVOLUT_MODE === 'prod' ? 'production' : 'sandbox'
}

function isProductionOrder(order: any) {
  return String(order?.environment || '').trim().toLowerCase() === 'production'
}

export function assertPaymentMatchesStoredOrder(order: any, payment: any) {
  const storedAmount = Number(order?.paymentAmount)
  const authoritativeMinorUnits = Number(payment?.amount)
  const amountMatches = Number.isFinite(storedAmount) && Number.isFinite(authoritativeMinorUnits) && Math.round(storedAmount * 100) === authoritativeMinorUnits
  const currencyMatches = String(order?.currency || '').trim().toUpperCase() === String(payment?.currency || '').trim().toUpperCase()
  if (!amountMatches || !currencyMatches) throw new Error('Revolut payment amount or currency does not match the stored order')
  return true
}

export function assertPrintfulItemsHaveFulfillmentIds(items: unknown) {
  if (!Array.isArray(items)) throw new Error('Checkout items are required')
  for (const item of items as FulfillmentItem[]) {
    if (String(item.fulfillmentProvider || '').toLowerCase() !== 'printful') continue
    if (!String(item.fulfillmentVariantId || '').trim()) {
      throw new Error('Printful-backed checkout item is missing its Printful sync variant ID')
    }
  }
  return items
}

export async function hydrateFulfillmentVariantIds(order: any, client: any) {
  const items = Array.isArray(order?.items) ? order.items as FulfillmentItem[] : []
  const hydrated: FulfillmentItem[] = []
  for (const item of items) {
    if (String(item.fulfillmentProvider || '').toLowerCase() !== 'printful' || String(item.fulfillmentVariantId || '').trim()) {
      hydrated.push(item)
      continue
    }
    if (!String(item.variantId || '').trim()) throw new Error('Printful recovery item has no internal variant ID')
    const result = await client.models.MerchProductVariant.get({ id: item.variantId })
    const variant = result?.data
    if (result?.errors?.length || !variant) throw new Error('Printful recovery variant could not be loaded')
    const sameProduct = String(variant.productId || '') === String(item.productId || '')
    const sameColor = String(variant.color || '').trim().toLowerCase() === String(item.color || '').trim().toLowerCase()
    const sameSize = String(variant.size || '').trim().toUpperCase() === String(item.size || '').trim().toUpperCase()
    const syncVariantId = String(variant.externalVariantId || '').trim()
    if (!sameProduct || !sameColor || !sameSize || !syncVariantId) {
      throw new Error('Stored Printful variant mapping does not exactly match the purchased product, colour, and size')
    }
    hydrated.push({ ...item, externalVariantId: syncVariantId, fulfillmentVariantId: syncVariantId })
  }
  assertPrintfulItemsHaveFulfillmentIds(hydrated)
  return hydrated
}

export function buildFulfillmentOrder(body: any, paymentState: unknown, now = new Date().toISOString()) {
  const revolutOrderId = String(body?.revolutOrderId || '')
  const normalizedPaymentState = String(paymentState).toLowerCase()
  const paid = isPaid(normalizedPaymentState)
  return {
    projectOrderId: String(body?.projectOrderId || revolutOrderId),
    revolutOrderId,
    paymentStatus: normalizedPaymentState,
    paymentDate: paid ? now : null,
    paymentAmount: typeof body?.paymentAmount === 'number' ? body.paymentAmount : null,
    currency: typeof body?.currency === 'string' ? body.currency : null,
    environment: transactionEnvironment(),
    overallFulfillmentStatus: 'pending',
    customerName: String(body?.customerName || ''),
    email: String(body?.email || ''),
    phone: String(body?.phone || ''),
    shippingAddress: body?.shippingAddress || {},
    items: body?.items || [],
    providerStatuses: {},
    auditHistory: [audit('Order created', 'success'), audit(paid ? 'Payment successful' : 'Payment pending', paid ? 'verified' : 'pending')],
    createdAt: now,
    updatedAt: now,
  }
}

async function saveProviderStatuses(client: any, order: any, providerStatuses: ProviderStatuses, auditEntries: unknown[]) {
  await client.models.FulfillmentOrder.update({
    id: order.id,
    providerStatuses: JSON.stringify(providerStatuses),
    overallFulfillmentStatus: overallStatus(providerStatuses),
    auditHistory: JSON.stringify([...(order.auditHistory || []), ...auditEntries]),
    updatedAt: new Date().toISOString(),
  })
}

export async function dispatchFulfillment(order: any, injected?: {
  getClient?: () => Promise<any>
  createPrintful?: typeof createPrintfulOrder
  fulfillmentEnabled?: () => boolean
}) {
  order = decodeFulfillmentOrder(order)
  const getClient = injected?.getClient || getDataClient
  const client = await getClient() as any
  const createPrintful = injected?.createPrintful || createPrintfulOrder
  const fulfillmentEnabled = injected?.fulfillmentEnabled || isPrintfulFulfillmentEnabled
  const items = Array.isArray(order.items) ? order.items as FulfillmentItem[] : []
  const providerStatuses: ProviderStatuses = { ...(order.providerStatuses || {}) }
  const auditEntries: unknown[] = []

  for (const [provider, providerItems] of Object.entries(groupByProvider(items))) {
    if (providerStatuses[provider]?.status === 'fulfilled' || providerStatuses[provider]?.status === 'test_skipped') {
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

    if (!fulfillmentEnabled() || !isProductionOrder(order)) {
      providerStatuses.printful = {
        status: 'test_skipped',
        message: 'Printful fulfillment intentionally skipped for non-production transaction',
      }
      auditEntries.push(audit('Printful fulfillment', 'test_skipped', 'printful'))
      logger.info('Printful fulfilment skipped for non-production transaction')
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
      const result = await createPrintful({
        orderId: order.projectOrderId,
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
  if (byRevolut.data?.[0]) return decodeFulfillmentOrder(byRevolut.data[0])
  const byProject = await client.models.FulfillmentOrder.list({ filter: { projectOrderId: { eq: identifier } } })
  return decodeFulfillmentOrder(byProject.data?.[0] || null)
}

export async function persistPendingFulfillmentOrder(body: any, revolutOrderId: string, injectedClient?: any) {
  if (!String(revolutOrderId || '').trim()) throw new Error('Cannot persist checkout without a Revolut order ID')
  const client = injectedClient || await getDataClient() as any
  const existing = await findOrder(client, revolutOrderId)
  if (existing) return existing
  assertPrintfulItemsHaveFulfillmentIds(body?.items)
  const created = await createValidatedFulfillmentOrder(client, fulfillmentOrderInput(buildFulfillmentOrder({
    ...body,
    projectOrderId: body?.orderId || body?.projectOrderId,
    revolutOrderId,
    paymentAmount: body?.amount,
  }, 'pending')))
  return created
}

export async function handleFulfillmentRequest(body: any) {
  const client = await getDataClient() as any
  const revolutOrderId = String(body?.revolutOrderId || '')
  const projectOrderId = String(body?.projectOrderId || revolutOrderId)
  if (!revolutOrderId || !Array.isArray(body?.items)) return jsonResponse(400, { error: 'Missing paid order fulfillment data' })

  const payment = await fetchRevolutMerchantOrder(revolutOrderId)
  const paymentBody = payment.body as { state?: string; amount?: number; currency?: string }
  const paymentState = paymentBody.state
  if (payment.statusCode < 200 || payment.statusCode >= 300 || !isPaid(paymentState)) {
    return jsonResponse(409, { error: 'Revolut payment is not paid', revolutOrderId })
  }
  logger.info('Payment verified', { orderId: revolutOrderId, state: paymentState })

  let order = await findOrder(client, revolutOrderId)
  const alreadyFulfilled = Boolean(order) && Object.keys(order.providerStatuses || {}).length > 0 && Object.values(order.providerStatuses || {}).every((status: any) => status?.status === 'fulfilled')
  if (!order) {
    order = await createValidatedFulfillmentOrder(client, fulfillmentOrderInput(buildFulfillmentOrder(body, paymentState)))
  } else {
    assertPaymentMatchesStoredOrder(order, paymentBody)
    const paidUpdate = {
      id: order.id,
      paymentStatus: String(paymentState).toLowerCase(),
      paymentDate: new Date().toISOString(),
      paymentAmount: typeof body?.paymentAmount === 'number' ? body.paymentAmount : order.paymentAmount,
      currency: typeof body?.currency === 'string' ? body.currency : order.currency,
      updatedAt: new Date().toISOString(),
    }
    await client.models.FulfillmentOrder.update(paidUpdate)
    order = { ...order, ...paidUpdate }
  }
  const providers = await dispatchFulfillment(order)
  const failedProvider = Object.entries(providers).find(([, status]) => status.status === 'failed')
  if (failedProvider) {
    return jsonResponse(502, {
      success: false,
      error: failedProvider[1].lastError || failedProvider[1].message || `${failedProvider[0]} fulfillment failed`,
      recoverable: true,
      revolutOrderId,
      providers,
    })
  }
  return jsonResponse(200, { success: true, alreadyFulfilled, revolutOrderId, providers })
}

export async function handleRecoveryFulfillment(body: any) {
  const identifier = String(body?.revolutOrderId || body?.projectOrderId || '')
  logger.info('Recovery requested', { identifier })
  if (!identifier) return jsonResponse(400, { error: 'Missing revolutOrderId or projectOrderId' })
  const client = await getDataClient() as any
  let order = await findOrder(client, identifier)
  if (!order) return jsonResponse(404, { error: 'Order was not stored; shipping address, provider assignments, and variant quantities cannot be safely reconstructed from Revolut.' })
  const payment = await fetchRevolutMerchantOrder(order.revolutOrderId)
  const paymentBody = payment.body as { state?: string; amount?: number; currency?: string }
  const paymentState = paymentBody.state
  if (!isPaid(paymentState)) return jsonResponse(409, { error: 'Revolut payment is not paid', revolutOrderId: order.revolutOrderId })
  try { assertPaymentMatchesStoredOrder(order, paymentBody) }
  catch (error) { return jsonResponse(409, { error: error instanceof Error ? error.message : 'Revolut payment verification failed', revolutOrderId: order.revolutOrderId }) }
  logger.info('Payment verified', { orderId: order.revolutOrderId, state: paymentState })
  const hydratedItems = await hydrateFulfillmentVariantIds(order, client)
  if (JSON.stringify(hydratedItems) !== JSON.stringify(order.items || [])) {
    const mappingEntry = audit('Printful variant mapping restored', 'verified', 'printful')
    const update = {
      id: order.id,
      items: JSON.stringify(hydratedItems),
      auditHistory: JSON.stringify([...(order.auditHistory || []), mappingEntry]),
      updatedAt: new Date().toISOString(),
    }
    const result = await client.models.FulfillmentOrder.update(update)
    if (result?.errors?.length || !result?.data) throw new Error('Failed to persist restored Printful variant mapping')
    order = { ...order, items: hydratedItems, auditHistory: [...(order.auditHistory || []), mappingEntry] }
  }
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
  const created = await createValidatedFulfillmentOrder(client, fulfillmentOrderInput({
    projectOrderId: paymentBody.merchant_order_ext_ref || revolutOrderId,
    revolutOrderId,
    paymentStatus: String(paymentBody.state).toLowerCase(),
    paymentDate: new Date().toISOString(),
    paymentAmount: typeof paymentBody.amount === 'number' ? paymentBody.amount : null,
    currency: paymentBody.currency || null,
    environment: transactionEnvironment(),
    overallFulfillmentStatus: 'recovery_required',
    customerName: '',
    email: paymentBody.email || '',
    shippingAddress: {},
    items: [],
    providerStatuses: {},
    auditHistory: [audit('Existing Revolut order imported', 'recovery_required')],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))
  return jsonResponse(200, { success: true, imported: true, recoveryRequired: true, missingData, order: created })
}

export { createValidatedFulfillmentOrder, validateFulfillmentOrder } from './orderValidation'
