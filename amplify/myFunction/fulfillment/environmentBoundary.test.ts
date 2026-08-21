import assert from 'node:assert/strict'
import test from 'node:test'
import { isPrintfulFulfillmentEnabled } from '../config/env'
import { buildFulfillmentOrder, dispatchFulfillment } from './index'
import { createPrintfulOrder, handlePrintfulCreateOrder, handlePrintfulProducts } from '../printful'

function testOrder(environment = 'sandbox') {
  return {
    id: 'internal-order-id',
    revolutOrderId: 'revolut-order-id',
    environment,
    items: [{ productId: 'product', variantId: 'internal-amplify-variant', quantity: 1, fulfillmentProvider: 'printful', fulfillmentVariantId: 'printful-sync-variant' }],
    providerStatuses: {},
    auditHistory: [],
    shippingAddress: {},
  }
}

function fakeClient(updates: any[]) {
  return async () => ({
    models: {
      FulfillmentOrder: {
        update: async (value: any) => {
          updates.push(value)
          return { data: value }
        },
      },
    },
  }) as any
}

test('sandbox checkout data builds a normal persistent internal order record', () => {
  const item = {
    productId: 'product-1',
    variantId: 'internal-amplify-variant',
    externalVariantId: 'printful-sync-variant',
    fulfillmentProvider: 'printful',
    fulfillmentVariantId: 'printful-sync-variant',
    productName: 'Project Respawn Shirt',
    color: 'Black',
    size: 'XL',
    quantity: 1,
    unitPrice: 24.99,
  }
  const stored = buildFulfillmentOrder({
    revolutOrderId: 'sandbox-revolut-id',
    projectOrderId: 'project-id',
    paymentAmount: 42,
    currency: 'GBP',
    customerName: 'Test Customer',
    email: 'test@example.invalid',
    shippingAddress: { city: 'Test City' },
    items: [item],
  }, 'paid', '2026-08-10T12:00:00.000Z')

  assert.equal(stored.environment, 'sandbox')
  assert.equal(stored.paymentStatus, 'paid')
  assert.equal(stored.overallFulfillmentStatus, 'pending')
  assert.equal(stored.items.length, 1)
  assert.deepEqual(stored.items[0], item)
  assert.equal(stored.shippingAddress.city, 'Test City')
})

test('live aliases are accepted only when the app environment is also production', () => {
  assert.equal(isPrintfulFulfillmentEnabled('production', 'live'), true)
  assert.equal(isPrintfulFulfillmentEnabled('sandbox', 'live'), false)
})

for (const environment of [
  { name: 'staging', appEnv: 'staging', revolutMode: 'sandbox' },
  { name: 'sandbox', appEnv: 'sandbox', revolutMode: 'sandbox' },
  { name: 'missing', appEnv: '', revolutMode: '' },
  { name: 'unknown', appEnv: 'unknown', revolutMode: 'unknown' },
]) {
  test(`${environment.name} skips Printful order creation`, async () => {
    let createCalls = 0
    const updates: any[] = []
    const enabled = () => isPrintfulFulfillmentEnabled(environment.appEnv, environment.revolutMode)

    const statuses = await dispatchFulfillment(testOrder(), {
      getClient: fakeClient(updates),
      fulfillmentEnabled: enabled,
      createPrintful: async () => {
        createCalls += 1
        return { statusCode: 200, body: {} } as any
      },
    })

    assert.equal(enabled(), false)
    assert.equal(createCalls, 0)
    assert.equal(statuses.printful.status, 'test_skipped')
    assert.equal(updates[0].overallFulfillmentStatus, 'test_skipped')
  })
}

test('explicit production keeps the existing Printful fulfillment path reachable', async () => {
  let createCalls = 0
  let printfulPayload: any
  const updates: any[] = []
  const enabled = () => isPrintfulFulfillmentEnabled('prod', 'prod')

  const statuses = await dispatchFulfillment(testOrder('production'), {
    getClient: fakeClient(updates),
    fulfillmentEnabled: enabled,
    createPrintful: async (payload) => {
      createCalls += 1
      printfulPayload = payload
      return { statusCode: 200, body: { result: { id: 'printful-order-id' } } } as any
    },
  })

  assert.equal(enabled(), true)
  assert.equal(createCalls, 1)
  assert.deepEqual(printfulPayload.items, [{ sync_variant_id: 'printful-sync-variant', quantity: 1 }])
  assert.notEqual(printfulPayload.items[0].sync_variant_id, testOrder('production').items[0].variantId)
  assert.equal(statuses.printful.status, 'fulfilled')
})

test('missing Printful variant ID is persisted as a visible failure', async () => {
  const updates: any[] = []
  const order: any = testOrder('production')
  order.items[0].fulfillmentVariantId = undefined
  const statuses = await dispatchFulfillment(order, {
    getClient: fakeClient(updates), fulfillmentEnabled: () => true,
    createPrintful: async () => { throw new Error('must not be called') },
  })
  assert.equal(statuses.printful.status, 'failed')
  assert.match(statuses.printful.lastError || '', /Missing Printful fulfillment variant ID/)
  assert.equal(updates[0].overallFulfillmentStatus, 'failed')
})

test('duplicate fulfilled provider dispatch does not create a second Printful order', async () => {
  let calls = 0
  const order = { ...testOrder('production'), providerStatuses: { printful: { status: 'fulfilled', providerOrderId: 'existing' } } }
  await dispatchFulfillment(order, {
    getClient: fakeClient([]), fulfillmentEnabled: () => true,
    createPrintful: async () => { calls += 1; return { statusCode: 200, body: {} } as any },
  })
  assert.equal(calls, 0)
})

test('Printful API failure leaves the order recoverable with its error', async () => {
  const updates: any[] = []
  const statuses = await dispatchFulfillment(testOrder('production'), {
    getClient: fakeClient(updates), fulfillmentEnabled: () => true,
    createPrintful: async () => ({ statusCode: 503, body: { error: 'unavailable' } }) as any,
  })
  assert.equal(statuses.printful.status, 'failed')
  assert.equal(updates[0].overallFulfillmentStatus, 'failed')
  assert.match(statuses.printful.lastError || '', /Printful order creation failed/)
})

test('a stored sandbox order cannot later pass the production Printful guard', async () => {
  let createCalls = 0
  const updates: any[] = []

  const statuses = await dispatchFulfillment(testOrder('sandbox'), {
    getClient: fakeClient(updates),
    fulfillmentEnabled: () => true,
    createPrintful: async () => {
      createCalls += 1
      return { statusCode: 200, body: {} } as any
    },
  })

  assert.equal(createCalls, 0)
  assert.equal(statuses.printful.status, 'test_skipped')
})

test('an unclassified legacy order fails closed even in production', async () => {
  let createCalls = 0
  const updates: any[] = []
  const order = testOrder() as any
  delete order.environment

  const statuses = await dispatchFulfillment(order, {
    getClient: fakeClient(updates),
    fulfillmentEnabled: () => true,
    createPrintful: async () => {
      createCalls += 1
      return { statusCode: 200, body: {} } as any
    },
  })

  assert.equal(createCalls, 0)
  assert.equal(statuses.printful.status, 'test_skipped')
})

test('direct Printful order creation fails before any request outside production', async () => {
  let requestCalls = 0

  await assert.rejects(
    createPrintfulOrder(
      { items: [{ sync_variant_id: 'variant', quantity: 1 }] },
      {
        fulfillmentEnabled: () => false,
        request: async () => {
          requestCalls += 1
          return { statusCode: 200, body: {} } as any
        },
      },
    ),
    /disabled outside explicit production/,
  )

  assert.equal(requestCalls, 0)
})

test('public Printful create-order handler refuses non-production requests', async () => {
  const response = await handlePrintfulCreateOrder({
    items: [{ sync_variant_id: 'variant', quantity: 1 }],
  })

  assert.equal(response.statusCode, 403)
})

test('Printful product connectivity check is read-only', async () => {
  const requests: Array<{ url: string; method: string }> = []

  await handlePrintfulProducts({
    authHeader: () => 'test-auth-header',
    request: async (url: string, method: string) => {
      requests.push({ url, method })
      return { statusCode: 200, body: { result: [] } } as any
    },
  })

  assert.deepEqual(requests, [{ url: 'https://api.printful.com/store/products', method: 'GET' }])
})
