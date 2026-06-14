declare const process: any

import type { Handler } from 'aws-lambda'
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/myFunction'
import type { Schema } from '../data/resource'

const REVOLUT_API_SECRET = process.env.REVOLUT_API_SECRET
const REVOLUT_MODE = String(process.env.REVOLUT_MODE || 'sandbox').trim().toLowerCase()
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY

let clientPromise: Promise<any> | null = null

async function getDataClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)
      Amplify.configure(resourceConfig, libraryOptions)
      return generateClient<Schema>()
    })()
  }

  return clientPromise
}

function jsonResponse(statusCode: number, payload: any) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: JSON.stringify(payload),
  }
}

function getRequestPath(event: any) {
  return event?.rawPath || event?.path || ''
}

function getRequestMethod(event: any) {
  return event?.requestContext?.http?.method || event?.httpMethod || ''
}

function getRequestBody(event: any) {
  if (!event?.body) return null

  try {
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body
  } catch {
    return null
  }
}

function getQueryParams(event: any) {
  return event?.queryStringParameters || {}
}

async function makeRequest(
  url: string,
  method: string,
  body: any = null,
  authHeader?: string
): Promise<{ statusCode: number; body: any }> {
  const response = await fetch(url, {
    method,
    headers: {
      ...(authHeader ? { Authorization: authHeader } : {}),
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await response.text()

  try {
    return {
      statusCode: response.status,
      body: JSON.parse(text),
    }
  } catch {
    return {
      statusCode: response.status,
      body: text,
    }
  }
}

/* ============================================================================
   Printful
============================================================================ */

function getPrintfulApiKey() {
  if (!PRINTFUL_API_KEY) {
    throw new Error('Missing PRINTFUL_API_KEY')
  }

  return PRINTFUL_API_KEY
}

function buildPrintfulAuthHeader() {
  return `Bearer ${getPrintfulApiKey()}`
}

function buildPrintfulOrderPayload(body: any) {
  return {
    external_id: body.orderId,
    shipping: body.shippingMethod || 'STANDARD',
    items: body.items,
    recipient: {
      name: body.customerName,
      address1: body.address,
      city: body.city,
      state_code: body.state,
      postcode: body.postcode,
      country_code: body.country || 'GB',
      email: body.email,
    },
  }
}

function normalizePrintfulListItem(product: any) {
  return {
    id: product.id,
    name: product.name,
    thumbnailUrl: product.thumbnail_url || '',
    variantCount: product.variants || 0,
    synced: product.synced ?? true,
  }
}

function normalizePrintfulVariant(variant: any, fallbackImage = '') {
  return {
    id: variant.id,
    name: variant.name,
    retailPrice: variant.retail_price || '',
    currency: variant.currency || '',
    size: variant.size || '',
    color: variant.color || '',
    availabilityStatus: variant.availability_status || '',
    sku: variant.sku || '',
    image:
      variant.product?.image ||
      variant.files?.[0]?.preview_url ||
      fallbackImage,
  }
}

async function handlePrintfulProducts() {
  const result = await makeRequest(
    'https://api.printful.com/store/products',
    'GET',
    null,
    buildPrintfulAuthHeader()
  )

  if (result.statusCode !== 200) {
    return jsonResponse(result.statusCode, result.body)
  }

  const products = (result.body?.result || []).map(normalizePrintfulListItem)
  return jsonResponse(200, { products })
}

async function handlePrintfulProductLookup(path: string) {
  const productId = path.split('/').pop()

  if (!productId) {
    return jsonResponse(400, { error: 'Missing productId' })
  }

  const result = await makeRequest(
    `https://api.printful.com/store/products/${productId}`,
    'GET',
    null,
    buildPrintfulAuthHeader()
  )

  if (result.statusCode !== 200) {
    return jsonResponse(result.statusCode, result.body)
  }

  const product = result.body?.result

  return jsonResponse(200, {
    product: {
      id: product?.sync_product?.id,
      name: product?.sync_product?.name,
      thumbnailUrl: product?.sync_product?.thumbnail_url || '',
      variants: (product?.sync_variants || []).map((variant: any) =>
        normalizePrintfulVariant(
          variant,
          product?.sync_product?.thumbnail_url || ''
        )
      ),
    },
  })
}

async function handlePrintfulCreateOrder(body: any) {
  if (!body?.items || !Array.isArray(body.items) || body.items.length === 0) {
    return jsonResponse(400, { error: 'Missing order items' })
  }

  const orderData = buildPrintfulOrderPayload(body)

  const result = await makeRequest(
    'https://api.printful.com/orders',
    'POST',
    orderData,
    buildPrintfulAuthHeader()
  )

  return jsonResponse(result.statusCode, result.body)
}

async function handlePrintfulOrderLookup(path: string) {
  const orderId = path.split('/').pop()

  if (!orderId) {
    return jsonResponse(400, { error: 'Missing orderId' })
  }

  const result = await makeRequest(
    `https://api.printful.com/orders/${orderId}`,
    'GET',
    null,
    buildPrintfulAuthHeader()
  )

  return jsonResponse(result.statusCode, result.body)
}

/* ============================================================================
   Revolut
============================================================================ */

function getRevolutMode(): 'sandbox' | 'prod' {
  return REVOLUT_MODE === 'prod' ? 'prod' : 'sandbox'
}

function getRevolutSecretKey() {
  if (!REVOLUT_API_SECRET) {
    throw new Error('Missing REVOLUT_API_SECRET')
  }

  return REVOLUT_API_SECRET
}

function buildRevolutAuthHeader() {
  return `Bearer ${getRevolutSecretKey()}`
}

function getRevolutBaseUrl() {
  return getRevolutMode() === 'sandbox'
    ? 'https://sandbox-merchant.revolut.com'
    : 'https://merchant.revolut.com'
}

function getRevolutOrdersUrl() {
  return `${getRevolutBaseUrl()}/api/orders`
}

function normalizeCurrency(value: any) {
  const currency = String(value || 'GBP').trim().toUpperCase()
  return currency || 'GBP'
}

function normalizeAmountToMinorUnits(amount: any) {
  const numericAmount = Number(amount)

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('Invalid amount')
  }

  return Math.round(numericAmount * 100)
}

function buildRevolutOrderPayload(body: any) {
  const amount = normalizeAmountToMinorUnits(body?.amount)

  return {
    amount,
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

function sanitizeRevolutCreateResponse(order: any) {
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

async function createRevolutMerchantOrder(body: any) {
  const payload = buildRevolutOrderPayload(body)

  console.log('Revolut mode:', getRevolutMode())
  console.log('Revolut orders URL:', getRevolutOrdersUrl())
  console.log('Revolut secret configured:', Boolean(REVOLUT_API_SECRET))
  console.log('Creating Revolut order for amount:', payload.amount, payload.currency)

  return makeRequest(
    getRevolutOrdersUrl(),
    'POST',
    payload,
    buildRevolutAuthHeader()
  )
}

async function fetchRevolutMerchantOrder(orderId: string) {
  return makeRequest(
    `${getRevolutOrdersUrl()}/${encodeURIComponent(orderId)}`,
    'GET',
    null,
    buildRevolutAuthHeader()
  )
}

async function handleRevolutCheckout(body: any) {
  if (!body?.amount) {
    return jsonResponse(400, { error: 'Missing amount' })
  }

  try {
    const result = await createRevolutMerchantOrder(body)

    if (result.statusCode < 200 || result.statusCode >= 300) {
      console.error('Revolut create order failed:', {
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

    const order = sanitizeRevolutCreateResponse(result.body)

    if (!order.token) {
      return jsonResponse(502, {
        error: 'Revolut order created but token missing',
        mode: getRevolutMode(),
        revolut: result.body,
      })
    }

    return jsonResponse(200, order)
  } catch (error: any) {
    console.error('Revolut checkout error:', error)

    return jsonResponse(500, {
      error: 'Failed to create Revolut checkout session',
      message: error?.message || 'Unknown error',
      mode: getRevolutMode(),
    })
  }
}

async function handleRevolutOrderLookup(path: string) {
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
      ...result.body,
      mode: getRevolutMode(),
    })
  } catch (error: any) {
    console.error('Revolut order lookup error:', error)

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

function mapTwitchCommand(command: any) {
  return {
    id: command.id,
    streamerId: command.streamerId,
    name: command.name,
    reply: command.reply,
    enabled: command.enabled,
    cooldownSeconds: command.cooldownSeconds,
    isCustom: command.isCustom,
    category: command.category || 'Custom',
    permissionLevel: command.permissionLevel || 'everyone',
  }
}

async function handleTwitchCommandsLookup(event: any) {
  const query = getQueryParams(event)
  const broadcasterId = String(query?.broadcasterId || '').trim()

  if (!broadcasterId) {
    return jsonResponse(400, { error: 'Missing broadcasterId' })
  }

  const client = await getDataClient()

  const result = await client.models.TwitchCommand.list({
    filter: {
      streamerId: { eq: broadcasterId },
    },
  })

  if (result.errors?.length) {
    console.error('TwitchCommand lookup errors:', result.errors)

    return jsonResponse(500, {
      error: 'Failed to load commands',
      details: result.errors,
    })
  }

  const commands = (result.data || []).map(mapTwitchCommand)

  return jsonResponse(200, {
    broadcasterId,
    commands,
  })
}

async function handleTwitchCommandsMe(event: any) {
  const method = getRequestMethod(event)

  if (method === 'GET') {
    return jsonResponse(200, {
      message: 'GET /twitch/commands/me not implemented yet',
      commands: [],
    })
  }

  if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
    return jsonResponse(200, {
      message: `${method} /twitch/commands/me not implemented yet`,
    })
  }

  return jsonResponse(405, { error: 'Method not allowed' })
}

/* ============================================================================
   Route handlers
============================================================================ */

async function handleRevolutRoutes(path: string, method: string, body: any) {
  if (path === '/revolut/checkout' && method === 'POST') {
    return handleRevolutCheckout(body)
  }

  if (path.startsWith('/revolut/orders/') && method === 'GET') {
    return handleRevolutOrderLookup(path)
  }

  return null
}

async function handlePrintfulRoutes(path: string, method: string, body: any) {
  if (path.startsWith('/printful/products/') && method === 'GET') {
    return handlePrintfulProductLookup(path)
  }

  if (path === '/printful/products' && method === 'GET') {
    return handlePrintfulProducts()
  }

  if (path === '/printful/orders' && method === 'POST') {
    return handlePrintfulCreateOrder(body)
  }

  if (path.startsWith('/printful/orders/') && method === 'GET') {
    return handlePrintfulOrderLookup(path)
  }

  return null
}

async function handleTwitchRoutes(path: string, method: string, event: any) {
  if (path === '/twitch/commands/me' || path.startsWith('/twitch/commands/me/')) {
    return handleTwitchCommandsMe(event)
  }

  if (path === '/twitch/commands' && method === 'GET') {
    return handleTwitchCommandsLookup(event)
  }

  return null
}

/* ============================================================================
   Main handler
============================================================================ */

export const handler: Handler = async (event: any) => {
  const path = getRequestPath(event)
  const method = getRequestMethod(event)
  const body = getRequestBody(event)

  try {
    if (method === 'OPTIONS') {
      return jsonResponse(200, { ok: true })
    }

    const revolutResponse = await handleRevolutRoutes(path, method, body)
    if (revolutResponse) return revolutResponse

    const printfulResponse = await handlePrintfulRoutes(path, method, body)
    if (printfulResponse) return printfulResponse

    const twitchResponse = await handleTwitchRoutes(path, method, event)
    if (twitchResponse) return twitchResponse

    return jsonResponse(404, {
      error: 'Route not found',
      path,
      method,
    })
  } catch (error: any) {
    console.error('API Error:', error)

    return jsonResponse(500, {
      error: 'Request failed',
      message: error?.message || 'Unknown error',
    })
  }
}