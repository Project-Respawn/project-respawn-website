import { PRINTFUL_API_KEY } from '../config/env'
import { makeRequest } from '../shared/http'
import { jsonResponse } from '../shared/responses'
import { logger } from '../shared/logger'

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
    image: variant.product?.image || variant.files?.[0]?.preview_url || fallbackImage,
  }
}

/* ============================================================================
   Printful: handlers
============================================================================ */

export async function handlePrintfulProducts() {
  const result = await makeRequest(
    'https://api.printful.com/store/products',
    'GET',
    null,
    buildPrintfulAuthHeader()
  )

  if (result.statusCode !== 200) {
    return jsonResponse(result.statusCode, result.body)
  }

  const responseBody = result.body as { result?: Array<Record<string, unknown>> }
  const products = (responseBody.result || []).map(normalizePrintfulListItem)
  return jsonResponse(200, { products })
}

export async function handlePrintfulProductLookup(path: string) {
  try {
    const productId = path.split('/').pop()

    if (!productId) {
      return jsonResponse(400, { error: 'Missing productId' })
    }

    logger.info('Printful product lookup:', productId)
    logger.info('Printful key configured:', Boolean(PRINTFUL_API_KEY))

    const result = await makeRequest(
      `https://api.printful.com/store/products/${productId}`,
      'GET',
      null,
      buildPrintfulAuthHeader()
    )

    logger.info('Printful product lookup status:', result.statusCode)

    if (result.statusCode !== 200) {
      logger.error('Printful product lookup failed:', result.body)
      return jsonResponse(result.statusCode, {
        error: 'Failed to fetch Printful product',
        printful: result.body,
      })
    }

    const product = (result.body as { result?: { sync_product?: Record<string, unknown>; sync_variants?: Array<Record<string, unknown>> } }).result

    return jsonResponse(200, {
      product: {
        id: product?.sync_product?.id,
        name: product?.sync_product?.name,
        thumbnailUrl: product?.sync_product?.thumbnail_url || '',
        variants: (product?.sync_variants || []).map((variant: any) =>
          normalizePrintfulVariant(
            variant,
            String(product?.sync_product?.thumbnail_url || '')
          )
        ),
      },
    })
  } catch (error: any) {
    logger.error('Printful product lookup error:', error)

    return jsonResponse(500, {
      error: 'Failed to fetch Printful product',
      message: error?.message || 'Unknown error',
    })
  }
}

export async function createPrintfulOrder(body: any) {
  if (!body?.items || !Array.isArray(body.items) || body.items.length === 0) {
    throw new Error('Missing order items')
  }

  const orderData = buildPrintfulOrderPayload(body)

  const result = await makeRequest(
    'https://api.printful.com/orders',
    'POST',
    orderData,
    buildPrintfulAuthHeader()
  )

  return result
}

export async function handlePrintfulCreateOrder(body: any) {
  try {
    const result = await createPrintfulOrder(body)
    return jsonResponse(result.statusCode, result.body)
  } catch (error) {
    return jsonResponse(400, { error: error instanceof Error ? error.message : 'Missing order items' })
  }
}

export async function handlePrintfulOrderLookup(path: string) {
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
   Revolut configuration
============================================================================ */


