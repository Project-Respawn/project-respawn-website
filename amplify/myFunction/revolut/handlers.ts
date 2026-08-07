import { APP_ENV, REVOLUT_API_KEY, REVOLUT_API_SECRET, REVOLUT_MODE } from '../config/env'
import { makeRequest } from '../shared/http'
import { jsonResponse } from '../shared/responses'
import { logger } from '../shared/logger'

const REVOLUT_API_HEADERS = {
  'Revolut-Api-Version': '2026-04-20',
}

function normalizeCurrency(value: unknown) {
  const currency = String(value || 'GBP').trim().toUpperCase()
  return currency || 'GBP'
}

function normalizeAmountToMinorUnits(amount: unknown) {
  const numericAmount = Number(amount)

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('Invalid amount')
  }

  return Math.round(numericAmount * 100)
}

function buildRevolutOrderPayload(body: Record<string, unknown>) {
  return {
    amount: normalizeAmountToMinorUnits(body?.amount),
    currency: normalizeCurrency(body?.currency),
    description: body?.description || 'Project Respawn Merch Order',
    capture_mode: 'AUTOMATIC',
    merchant_order_ext_ref: body?.orderId || undefined,
    email: body?.email || undefined,
    metadata: {
      source: 'project-respawn-merch',
      customerEmail: body?.email || '',
      customerName: body?.customerName || '',
    },
  }
}

function sanitizeRevolutCreateResponse(order: Record<string, unknown>) {
  return {
    id: order?.id || null,
    token: order?.token || null,
    state: order?.state || null,
    amount: order?.amount ?? null,
    currency: order?.currency || null,
    createdAt: order?.created_at || null,
    mode: getRevolutMode(),
  }
}

function getRevolutMode(): 'sandbox' | 'prod' {
  return REVOLUT_MODE
/*
  // Prefer explicit REVOLUT_MODE
  const explicitMode = String(process.env.REVOLUT_MODE || '')
    .trim()
    .toLowerCase()

  if (explicitMode === 'prod' || explicitMode === 'production') {
    return 'prod'
  }

  if (explicitMode === 'sandbox') {
    return 'sandbox'
  }

  // Fall back to APP_ENV
  const appEnv = String(process.env.APP_ENV || '')
    .trim()
    .toLowerCase()

  if (
    appEnv === 'prod' ||
    appEnv === 'production' ||
    appEnv === 'live'
  ) {
    return 'prod'
  }

  return 'sandbox'
*/
}

function getRevolutBaseUrl() {
  return getRevolutMode() === 'prod'
    ? 'https://merchant.revolut.com'
    : 'https://sandbox-merchant.revolut.com'
}

function getRevolutOrdersUrl() {
  return `${getRevolutBaseUrl()}/api/orders`
}

function getRevolutSecretKey() {
  if (!REVOLUT_API_SECRET) {
    throw new Error('Missing REVOLUT_API_SECRET')
  }

  return REVOLUT_API_SECRET.trim()
}

function buildRevolutAuthHeader() {
  return `Bearer ${getRevolutSecretKey()}`
}

/* ============================================================================
   Revolut: handlers
============================================================================ */

async function createRevolutMerchantOrder(body: any) {
  const payload = buildRevolutOrderPayload(body)

  logger.info('APP_ENV:', process.env.APP_ENV)
  logger.info('process.env.REVOLUT_MODE:', process.env.REVOLUT_MODE)
  logger.info('Resolved Revolut mode:', REVOLUT_MODE)
  logger.info('Revolut base URL:', getRevolutBaseUrl())
  logger.info('Revolut orders URL:', getRevolutOrdersUrl())
  logger.info('Revolut API key configured:', Boolean(REVOLUT_API_KEY))
  logger.info('Revolut secret configured:', Boolean(REVOLUT_API_SECRET))
  logger.info('Creating Revolut order', { amount: payload.amount, currency: payload.currency })

  return makeRequest(
    getRevolutOrdersUrl(),
    'POST',
    payload,
    buildRevolutAuthHeader(),
    REVOLUT_API_HEADERS,
  )
}

async function fetchRevolutMerchantOrder(orderId: string) {
  return makeRequest(
    `${getRevolutOrdersUrl()}/${encodeURIComponent(orderId)}`,
    'GET',
    null,
    buildRevolutAuthHeader(),
    REVOLUT_API_HEADERS,
  )
}

export async function handleRevolutCheckout(body: any) {
  if (!body?.amount) {
    return jsonResponse(400, { error: 'Missing amount' })
  }

  try {
    const result = await createRevolutMerchantOrder(body)

    if (result.statusCode < 200 || result.statusCode >= 300) {
      logger.error('Revolut create order failed:', {
        statusCode: result.statusCode,
        mode: getRevolutMode(),
        response: result.body,
      })

      return jsonResponse(result.statusCode, {
        error: 'Failed to create Revolut order',
        mode: getRevolutMode(),
        revolut: result.body,
      })
    }

    const order = sanitizeRevolutCreateResponse(result.body as Record<string, unknown>)

    if (!order.token) {
      return jsonResponse(502, {
        error: 'Revolut order created but token missing',
        mode: getRevolutMode(),
        revolut: result.body,
      })
    }

    return jsonResponse(200, order)
  } catch (error: any) {
    logger.error('Revolut checkout error:', error)

    return jsonResponse(500, {
      error: 'Failed to create Revolut checkout session',
      message: error?.message || 'Unknown error',
      mode: getRevolutMode(),
    })
  }
}

export async function handleRevolutOrderLookup(path: string) {
  const orderId = path.split('/').pop()

  if (!orderId) {
    return jsonResponse(400, { error: 'Missing orderId' })
  }

  try {
    const result = await fetchRevolutMerchantOrder(orderId)

    if (result.statusCode < 200 || result.statusCode >= 300) {
      return jsonResponse(result.statusCode, {
        error: 'Failed to retrieve Revolut order',
        mode: getRevolutMode(),
        revolut: result.body,
      })
    }

    return jsonResponse(200, {
      ...(result.body as Record<string, unknown>),
      mode: getRevolutMode(),
    })
  } catch (error: any) {
    logger.error('Revolut order lookup error:', error)

    return jsonResponse(500, {
      error: 'Failed to retrieve Revolut order',
      message: error?.message || 'Unknown error',
      mode: getRevolutMode(),
    })
  }
}

/* ============================================================================
   Twitch
============================================================================ */



