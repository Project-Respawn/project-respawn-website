import { installAtomicGraphQL } from './claimTestStore'
import assert from 'node:assert/strict'
import test from 'node:test'
import { dispatchFulfillment, handleFulfillmentRequest, handleRecoveryFulfillment, handleExistingRevolutOrderImport } from './index'
import { assertStoredOrderSafe } from './security'
import { routeRest } from '../router/restRouter'
import { handleRevolutCheckout, handleRevolutOrderLookup } from '../revolut/handlers'
import { handlePrintfulCreateOrder, handlePrintfulOrderLookup } from '../printful/handlers'
import { REVOLUT_MODE } from '../config/env'
import { handleRevolutWebhook, signRevolutWebhook } from '../revolut/webhook'

let sequence = 0
function harness() {
  let stored: any = {
    id: `security-${++sequence}`, projectOrderId: 'PR-test', revolutOrderId: 'rev-test',
    environment: REVOLUT_MODE === 'prod' ? 'production' : 'sandbox', paymentStatus: 'pending', paymentAmount: 20, currency: 'GBP',
    shippingAddress: { address: 'Stored address', city: 'London', country: 'GB', postcode: 'TEST' },
    customerName: 'Test', email: 'test@example.invalid', providerStatuses: {}, auditHistory: [],
    items: [{ productId: 'p', variantId: 'v', fulfillmentProvider: 'printful', fulfillmentVariantId: 'sync', quantity: 1, unitPrice: 20 }],
  }
  const payment: any = { id: 'rev-test', merchant_order_ext_ref: 'PR-test', state: 'completed', amount: 2000, currency: 'GBP' }
  const variant: any = { productId: 'p', externalVariantId: 'sync', currency: 'GBP', retailPrice: 20 }
  const calls: any[] = []
  const client = { models: {
    FulfillmentOrder: { get: async () => ({ data: stored }), list: async () => ({ data: [stored] }), update: async (value: any) => { stored = { ...stored, ...value }; return { data: stored } } },
    MerchProductVariant: { get: async () => ({ data: variant }) },
    MerchProduct: { get: async () => ({ data: { id: 'p', sourceType: 'printful' } }) },
  } }
  installAtomicGraphQL(client)
  const fetchPayment = async () => ({ statusCode: 200, body: payment })
  const dependencies = { getClient: async () => client, fetchPayment, fulfillmentEnabled: () => false,
    lookupPrintful: async (_id: string) => ({ statusCode: 200, body: { result: { id: 'provider', external_id: 'PR-test' } } }),
    createPrintful: async (body: any) => { calls.push(body); return { statusCode: 200, body: { result: { id: 'provider' } } } } }
  return { get stored() { return stored }, set stored(v: any) { stored = v }, payment, variant, calls, client, dependencies, fetchPayment }
}

test('public operations deny all callers without provider calls, including forged ownership', async () => {
  const payload = { revolutOrderId: 'known', email: 'owner@example.invalid', paymentAmount: 0.01, items: [] }
  for (const path of ['/printful/orders', '/printful/orders/123', '/revolut/orders/123', '/orders/fulfill', '/orders/recover-fulfillment', '/orders/import-existing-revolut']) {
    for (const method of ['GET', 'POST']) assert.equal((await routeRest(path, method, payload, {}))?.statusCode, 403)
  }
  for (const handler of [handleFulfillmentRequest, handleRecoveryFulfillment, handleExistingRevolutOrderImport, handlePrintfulCreateOrder]) {
    assert.equal((await handler(payload)).statusCode, 403)
  }
  assert.equal((await handlePrintfulOrderLookup('/123')).statusCode, 403)
  assert.equal((await handleRevolutOrderLookup('/123')).statusCode, 403)
})

test('new guest and authenticated checkout sessions fail closed before creating payment', async () => {
  assert.equal((await handleRevolutCheckout({ amount: 0.01, items: [] })).statusCode, 503)
})

test('unknown internal order cannot trigger fulfillment', async () => {
  const h = harness(), input = h.stored
  h.stored = null
  await assert.rejects(dispatchFulfillment(input, h.dependencies), /Stored order not found/)
  assert.equal(h.calls.length, 0)
})

test('existing legitimate pending order is reloaded; caller overrides are discarded', async () => {
  const h = harness()
  const safe = await assertStoredOrderSafe({ ...h.stored, paymentAmount: 0.01, currency: 'USD', items: [], shippingAddress: {} }, h.client, h.fetchPayment)
  assert.equal(safe.paymentAmount, 20)
  assert.equal(safe.currency, 'GBP')
  assert.equal(safe.items.length, 1)
  assert.equal(safe.shippingAddress.address, 'Stored address')
})

for (const [name, change] of Object.entries({
  unpaid: (h: any) => { h.payment.state = 'pending' },
  underpaid: (h: any) => { h.payment.amount = 1 },
  reference: (h: any) => { h.payment.merchant_order_ext_ref = 'other' },
  currency: (h: any) => { h.payment.currency = 'USD' },
  refund: (h: any) => { h.payment.refunded_amount = 100 },
  environment: (h: any) => { h.stored.environment = 'wrong-environment' },
  price: (h: any) => { h.stored.items[0].unitPrice = 0.01 },
  quantity: (h: any) => { h.stored.items[0].quantity = -1 },
  mapping: (h: any) => { h.stored.items[0].fulfillmentVariantId = 'other' },
})) test(`${name} fails before provider submission`, async () => {
  const h = harness(); change(h)
  await assert.rejects(dispatchFulfillment(h.stored, h.dependencies))
  assert.equal(h.calls.length, 0)
})

test('concurrent and repeated calls share one process-local attempt and preserve sandbox boundary', async () => {
  const h = harness(); let reads = 0
  const get = h.client.models.FulfillmentOrder.get
  h.client.models.FulfillmentOrder.get = async () => { reads++; return get() }
  const result = await Promise.all(Array.from({ length: 10 }, () => dispatchFulfillment(h.stored, h.dependencies)))
  assert.equal(reads, 1)
  assert.equal(result[0].printful.status, 'test_skipped')
  await dispatchFulfillment(h.stored, h.dependencies)
  assert.equal(reads, 1)
  assert.equal(h.calls.length, 0)
})

test('verified production order submits once under concurrent calls with fully mocked provider', { skip: REVOLUT_MODE !== 'prod' }, async () => {
  const h = harness()
  const dependencies = { ...h.dependencies, fulfillmentEnabled: () => true }
  await Promise.all(Array.from({ length: 10 }, () => dispatchFulfillment(h.stored, dependencies)))
  assert.equal(h.calls.length, 1)
  assert.equal(h.calls[0].address, 'Stored address')
  assert.deepEqual(h.calls[0].items, [{ sync_variant_id: 'sync', quantity: 1 }])
})

test('signed webhook integrates with stored-order validation and shared dispatcher', async () => {
  const h = harness(), now = Date.now(), timestamp = String(now), secret = 'offline-signing-secret'
  const body = JSON.stringify({ event: 'ORDER_COMPLETED', order_id: h.stored.revolutOrderId })
  const dependencies = { ...h.dependencies, fulfillmentEnabled: () => REVOLUT_MODE === 'prod' }
  const event = { body, headers: { 'Revolut-Request-Timestamp': timestamp, 'Revolut-Signature': signRevolutWebhook(body, timestamp, secret) } }
  const injected = { signingSecret: secret, now: () => now, getClient: async () => h.client,
    fetchOrder: h.fetchPayment, dispatch: (order: any) => dispatchFulfillment(order, dependencies) }
  assert.equal((await handleRevolutWebhook(event, injected)).statusCode, 204)
  assert.equal(h.stored.paymentStatus, 'completed')
  assert.equal(h.calls.length, REVOLUT_MODE === 'prod' ? 1 : 0)
  assert.equal((await handleRevolutWebhook(event, injected)).statusCode, 204)
  assert.equal(h.calls.length, REVOLUT_MODE === 'prod' ? 1 : 0)
})

test('atomic intent persistence failure prevents provider submission', { skip: REVOLUT_MODE !== 'prod' }, async () => {
  const h = harness()
  h.client.models.FulfillmentOrder.update = async () => { throw new Error('offline persistence failure') }
  const injected = { ...h.dependencies, fulfillmentEnabled: () => true }
  await assert.rejects(dispatchFulfillment(h.stored, injected), /Conditional write rejected or uncertain/)
  await assert.rejects(dispatchFulfillment(h.stored, injected), /Conditional write rejected or uncertain/)
  assert.equal(h.calls.length, 0)
})

test('uncertain provider result is held for reconciliation instead of retried in-process', { skip: REVOLUT_MODE !== 'prod' }, async () => {
  const h = harness(); let calls = 0
  const injected = { ...h.dependencies, fulfillmentEnabled: () => true,
    createPrintful: async () => { calls++; throw new Error('Provider timed out') } }
  await assert.rejects(dispatchFulfillment(h.stored, injected), /reconcile before retry/)
  await assert.rejects(dispatchFulfillment(h.stored, injected), /reconcile before retry/)
  assert.equal(calls, 1)
})
