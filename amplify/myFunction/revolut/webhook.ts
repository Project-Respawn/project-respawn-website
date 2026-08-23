import { createHmac, timingSafeEqual } from 'node:crypto'
import { REVOLUT_MODE, REVOLUT_WEBHOOK_SIGNING_SECRET } from '../config/env'
import { logger } from '../shared/logger'
import { fetchRevolutMerchantOrder } from './handlers'
import { decodeFulfillmentOrder } from '../fulfillment/orderJson'

type ApiEvent = {
  body?: string | null
  isBase64Encoded?: boolean
  headers?: Record<string, string | undefined>
}

type Dependencies = {
  getClient?: () => Promise<any>
  fetchOrder?: typeof fetchRevolutMerchantOrder
  signingSecret?: string
  now?: () => number
  dispatch?: (order: any) => Promise<unknown>
}

const FIVE_MINUTES_MS = 5 * 60 * 1000
const PAID_STATES = new Set(['paid', 'completed', 'captured'])

function response(statusCode: number) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: '' }
}

function header(event: ApiEvent, name: string) {
  const match = Object.entries(event.headers || {}).find(([key]) => key.toLowerCase() === name.toLowerCase())
  return match?.[1] || ''
}

function rawBody(event: ApiEvent) {
  const body = typeof event.body === 'string' ? event.body : ''
  return event.isBase64Encoded ? Buffer.from(body, 'base64').toString('utf8') : body
}

export function signRevolutWebhook(rawPayload: string, timestamp: string, secret: string) {
  return `v1=${createHmac('sha256', secret).update(`v1.${timestamp}.${rawPayload}`, 'utf8').digest('hex')}`
}

export function verifyRevolutWebhook(event: ApiEvent, secret: string, now = Date.now()) {
  if (!secret) return false
  const timestamp = header(event, 'Revolut-Request-Timestamp')
  const timestampMs = Number(timestamp)
  if (!Number.isFinite(timestampMs) || Math.abs(now - timestampMs) > FIVE_MINUTES_MS) return false
  const expected = Buffer.from(signRevolutWebhook(rawBody(event), timestamp, secret))
  return header(event, 'Revolut-Signature').split(',').some((candidate) => {
    const supplied = Buffer.from(candidate.trim())
    return supplied.length === expected.length && timingSafeEqual(supplied, expected)
  })
}

async function defaultClient() {
  return (await import('../shared/dataClient')).getDataClient()
}

function transactionEnvironment() {
  return REVOLUT_MODE === 'prod' ? 'production' : 'sandbox'
}

function audit(action: string, result: string) {
  return { timestamp: new Date().toISOString(), action, result, provider: 'revolut' }
}

function amountMatches(storedAmount: unknown, authoritativeMinorUnits: unknown) {
  const stored = Number(storedAmount)
  const authoritative = Number(authoritativeMinorUnits)
  return Number.isFinite(stored) && Number.isFinite(authoritative) && Math.round(stored * 100) === authoritative
}

function fulfillmentComplete(order: any) {
  const statuses = Object.values(order?.providerStatuses || {}) as Array<{ status?: string }>
  return statuses.length > 0 && statuses.every((provider) => ['fulfilled', 'test_skipped'].includes(String(provider?.status || '')))
}

export async function handleRevolutWebhook(event: unknown, injected: Dependencies = {}) {
  const apiEvent = event as ApiEvent
  const secret = injected.signingSecret ?? REVOLUT_WEBHOOK_SIGNING_SECRET
  if (!verifyRevolutWebhook(apiEvent, secret, injected.now?.() ?? Date.now())) {
    logger.warn('Rejected Revolut webhook signature')
    return response(401)
  }

  let payload: { event?: string; order_id?: string; merchant_order_ext_ref?: string }
  try { payload = JSON.parse(rawBody(apiEvent)) } catch { return response(400) }
  const orderId = String(payload.order_id || '').trim()
  if (!orderId) return response(400)

  const client = await (injected.getClient || defaultClient)() as any
  const existingResult = await client.models.FulfillmentOrder.list({ filter: { revolutOrderId: { eq: orderId } } })
  const order = decodeFulfillmentOrder(existingResult.data?.[0])
  if (!order) {
    logger.warn('Valid Revolut webhook received for unknown order', { orderId, event: payload.event })
    return response(204)
  }

  if (String(order.environment || '').toLowerCase() !== transactionEnvironment()) {
    logger.error('Revolut webhook environment mismatch', { orderId, configuredMode: REVOLUT_MODE })
    return response(204)
  }

  const fetchOrder = injected.fetchOrder || fetchRevolutMerchantOrder
  const authoritative = await fetchOrder(orderId)
  if (authoritative.statusCode < 200 || authoritative.statusCode >= 300) {
    logger.error('Revolut webhook authoritative lookup failed', { orderId, statusCode: authoritative.statusCode })
    return response(503)
  }

  const revolut = authoritative.body as { id?: string; state?: string; amount?: number; currency?: string }
  const state = String(revolut.state || '').trim().toLowerCase()
  if (String(revolut.id || '') !== orderId || !state) return response(503)

  const currencyMatches = String(order.currency || '').toUpperCase() === String(revolut.currency || '').toUpperCase()
  const matchesAmount = amountMatches(order.paymentAmount, revolut.amount)
  if (!currencyMatches || !matchesAmount) {
    const reason = !matchesAmount ? 'Revolut payment amount does not match the stored order' : 'Revolut payment currency does not match the stored order'
    logger.error('Revolut webhook payment verification failed', { orderId, reason })
    if (order.reconciliationError !== reason) {
      const entry = audit('Revolut webhook payment update', `security_error: ${reason}`)
      await client.models.FulfillmentOrder.update({ id: order.id, reconciliationError: reason, auditHistory: JSON.stringify([...(order.auditHistory || []), entry]), updatedAt: entry.timestamp })
    }
    return response(204)
  }

  let currentOrder = order
  if (String(order.paymentStatus || '').toLowerCase() !== state || order.reconciliationError) {
    const entry = audit('Revolut webhook payment update', state)
    const update = {
      id: order.id,
      paymentStatus: state,
      paymentDate: PAID_STATES.has(state) ? order.paymentDate || entry.timestamp : order.paymentDate,
      reconciliationError: null,
      auditHistory: JSON.stringify([...(order.auditHistory || []), entry]),
      updatedAt: entry.timestamp,
    }
    const updated = await client.models.FulfillmentOrder.update(update)
    currentOrder = decodeFulfillmentOrder(updated?.data || { ...order, ...update })
  }

  if (PAID_STATES.has(state) && !fulfillmentComplete(currentOrder)) {
    try {
      const dispatch = injected.dispatch || (await import('../fulfillment')).dispatchFulfillment
      await dispatch(currentOrder)
    } catch (error) {
      logger.error('Revolut webhook fulfillment dispatch failed', { orderId, message: error instanceof Error ? error.message : 'Unknown error' })
      return response(503)
    }
  }
  return response(204)
}
