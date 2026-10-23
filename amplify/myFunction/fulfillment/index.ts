import { acquireFulfillmentClaim, claimedSnapshotClient, completeFulfillmentClaim, holdFulfillmentClaim, inspectStoredAttempt, providerId } from './claim'
import { assertStoredOrderSafe } from './security'
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
  const result = await client.models.FulfillmentOrder.update({
    id: order.id,
    providerStatuses: JSON.stringify(providerStatuses),
    overallFulfillmentStatus: overallStatus(providerStatuses),
    auditHistory: JSON.stringify([...(order.auditHistory || []), ...auditEntries]),
    updatedAt: new Date().toISOString(),
  })
  if (result?.errors?.length || !result?.data) throw new Error('Fulfillment status could not be persisted; reconcile before retry')
}

async function dispatchFulfillmentInternal(order: any, injected?: {
  getClient?: () => Promise<any>; createPrintful?: typeof createPrintfulOrder; fulfillmentEnabled?: () => boolean; fetchPayment?: typeof fetchRevolutMerchantOrder
}) {
  const client = await (injected?.getClient || getDataClient)() as any
  const payment = injected?.fetchPayment || fetchRevolutMerchantOrder
  const trusted = await assertStoredOrderSafe(order, client, payment)
  const status = inspectStoredAttempt(trusted)
  if (status !== 'fresh') return trusted.providerStatuses
  if (!(injected?.fulfillmentEnabled || isPrintfulFulfillmentEnabled)() || !isProductionOrder(trusted)) {
    return { ...(trusted.providerStatuses || {}), printful: { status: 'test_skipped' as const, message: 'Non-production fulfilment intentionally skipped' } }
  }
  const claim = await acquireFulfillmentClaim(client, trusted)
  try {
    const current = await assertStoredOrderSafe(claim.order, claimedSnapshotClient(client, claim), payment)
    const response = await (injected?.createPrintful || createPrintfulOrder)({
      orderId: current.projectOrderId, shippingMethod: 'STANDARD', items: current.items.map((item: FulfillmentItem) => ({ sync_variant_id: item.fulfillmentVariantId, quantity: item.quantity })),
      customerName: current.customerName, email: current.email, address: current.shippingAddress?.address, city: current.shippingAddress?.city,
      state: current.shippingAddress?.state, zip: current.shippingAddress?.postcode, country: current.shippingAddress?.country,
    })
    return await completeFulfillmentClaim(client, claim, providerId(response))
  } catch {
    try { await holdFulfillmentClaim(client, claim) } catch { /* Existing claim remains durable if reconciliation persistence fails. */ }
    throw new Error('Fulfilment outcome requires reconciliation; reconcile before retry')
  }
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

// REST requests do not establish customer ownership. Only webhook/admin dispatch.
export async function handleFulfillmentRequest(_body: unknown) {
  return jsonResponse(403, { error: 'Public fulfillment is disabled' })
}
export async function handleRecoveryFulfillment(_body: unknown) {
  return jsonResponse(403, { error: 'Use authenticated administrative recovery' })
}
export async function handleExistingRevolutOrderImport(_body: unknown) {
  return jsonResponse(403, { error: 'Use authenticated administrative import' })
}

// Cache only coalesces this process; the persistent conditional claim provides exclusion.
export function createAtomicDispatcher() {
  const attempts = new Map<string, Promise<ProviderStatuses>>()
  return function dispatch(order: any, injected?: Parameters<typeof dispatchFulfillmentInternal>[1]) {
    const key = String(order?.id || '')
    if (!key) return Promise.reject(new Error('Stored internal order ID is required'))
    if (attempts.has(key)) return attempts.get(key)!
    if (attempts.size >= 1000) return Promise.reject(new Error('Fulfilment capacity reached; reconcile before retry'))
    const attempt = dispatchFulfillmentInternal(order, injected); attempts.set(key, attempt); return attempt
  }
}
export const dispatchFulfillment = createAtomicDispatcher()

export { createValidatedFulfillmentOrder, validateFulfillmentOrder } from './orderValidation'
