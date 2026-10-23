import { REVOLUT_API_SECRET, REVOLUT_MODE } from '../config/env'
import { makeRequest } from '../shared/http'
import { jsonResponse } from '../shared/responses'

const REVOLUT_API_HEADERS = {
  'Revolut-Api-Version': '2026-04-20',
}

function getRevolutMode(): 'sandbox' | 'prod' {
  return REVOLUT_MODE

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

export async function fetchRevolutMerchantOrder(orderId: string) {
  return makeRequest(
    `${getRevolutOrdersUrl()}/${encodeURIComponent(orderId)}`,
    'GET',
    null,
    buildRevolutAuthHeader(),
    REVOLUT_API_HEADERS,
  )
}

/** Release gate: trusted shipping/tax and quote policy must be approved before reopening. */
export async function handleRevolutCheckout(_body: unknown) {
  return jsonResponse(503, { error: 'Checkout is temporarily unavailable. No payment session was created.', code: 'CHECKOUT_SECURITY_HOLD' })
}
export async function handleRevolutOrderLookup(_path: string) {
  return jsonResponse(403, { error: 'Public provider order lookup is disabled' })
}


