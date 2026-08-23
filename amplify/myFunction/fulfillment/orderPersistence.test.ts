import assert from 'node:assert/strict'
import test from 'node:test'
import { assertPaymentMatchesStoredOrder, hydrateFulfillmentVariantIds, persistPendingFulfillmentOrder } from './index'
import { createValidatedFulfillmentOrder, isProvablyMalformedFulfillmentOrder, validateFulfillmentOrder } from './orderValidation'

function clientHarness() {
  const records: any[] = []
  return {
    records,
    client: { models: { FulfillmentOrder: {
      list: async ({ filter }: any) => ({ data: records.filter((record) => {
        const [field, condition] = Object.entries(filter)[0] as [string, any]
        return record[field] === condition.eq
      }) }),
      create: async (input: any) => {
        const stored = { id: `stored-${records.length + 1}`, ...input }
        records.push(stored)
        return { data: stored }
      },
    } } },
  }
}

const checkout = {
  orderId: 'PR-123', amount: 42.5, currency: 'GBP', customerName: 'Customer Name',
  email: 'customer@example.invalid', phone: '+441234567890',
  shippingAddress: { address: '1 Test Street', city: 'London', postcode: 'SW1A 1AA', country: 'GB' },
  items: [{ productId: 'product-1', variantId: 'variant-1', quantity: 2, fulfillmentProvider: 'printful', fulfillmentVariantId: 'sync-1' }],
}

test('one checkout persists exactly one populated pending order and preserves its Revolut ID and commerce data', async () => {
  const h = clientHarness()
  const first = await persistPendingFulfillmentOrder(checkout, 'revolut-123', h.client)
  const second = await persistPendingFulfillmentOrder(checkout, 'revolut-123', h.client)
  assert.equal(h.records.length, 1)
  assert.equal(first.id, second.id)
  assert.equal(first.revolutOrderId, 'revolut-123')
  assert.equal(first.projectOrderId, 'PR-123')
  assert.equal(first.environment, 'sandbox')
  assert.equal(first.customerName, checkout.customerName)
  assert.equal(first.email, checkout.email)
  assert.equal(first.phone, checkout.phone)
  assert.deepEqual(JSON.parse(first.shippingAddress), checkout.shippingAddress)
  assert.deepEqual(JSON.parse(first.items), checkout.items)
  assert.equal(first.paymentAmount, checkout.amount)
  assert.equal(first.currency, checkout.currency)
  assert.equal(first.paymentStatus, 'pending')
})

test('blank identifiers and invalid timestamps are rejected before a model create call', async () => {
  let creates = 0
  const client = { models: { FulfillmentOrder: { create: async () => { creates += 1; return { data: {} } } } } }
  const base = { revolutOrderId: '', projectOrderId: '', environment: 'sandbox', createdAt: 'bad', updatedAt: 'bad' }
  await assert.rejects(() => createValidatedFulfillmentOrder(client, base), /revolutOrderId is required/)
  assert.throws(() => validateFulfillmentOrder({ ...base, revolutOrderId: 'rev', projectOrderId: 'project' }), /createdAt must be a valid ISO timestamp/)
  assert.equal(creates, 0)
})

test('cleanup predicate only selects records with no IDs or meaningful commerce/audit data', () => {
  assert.equal(isProvablyMalformedFulfillmentOrder({ id: 'junk', revolutOrderId: '', projectOrderId: '', items: '[]', auditHistory: '[]' }), true)
  assert.equal(isProvablyMalformedFulfillmentOrder({ revolutOrderId: 'rev-1' }), false)
  assert.equal(isProvablyMalformedFulfillmentOrder({ auditHistory: JSON.stringify([{ action: 'import' }]) }), false)
  assert.equal(isProvablyMalformedFulfillmentOrder({ customerName: 'Customer' }), false)
})

test('pending persistence rejects a Printful item without its sync variant ID', async () => {
  const h = clientHarness()
  await assert.rejects(
    () => persistPendingFulfillmentOrder({ ...checkout, items: [{ ...checkout.items[0], fulfillmentVariantId: '' }] }, 'revolut-missing', h.client),
    /missing its Printful sync variant ID/,
  )
  assert.equal(h.records.length, 0)
})

test('recovery hydrates only an exact product, colour, and size mapping', async () => {
  const item = { productId: 'product-1', variantId: 'variant-1', color: 'True Royal', size: 'L', quantity: 1, fulfillmentProvider: 'printful' }
  const client = { models: { MerchProductVariant: { get: async () => ({ data: { id: 'variant-1', productId: 'product-1', color: 'True Royal', size: 'L', externalVariantId: '5352643000' } }) } } }
  const [hydrated] = await hydrateFulfillmentVariantIds({ items: [item] }, client)
  assert.equal(hydrated.fulfillmentVariantId, '5352643000')
  const wrong = { models: { MerchProductVariant: { get: async () => ({ data: { productId: 'product-1', color: 'Black', size: 'L', externalVariantId: 'wrong' } }) } } }
  await assert.rejects(() => hydrateFulfillmentVariantIds({ items: [item] }, wrong), /does not exactly match/)
})

test('recovery requires the authoritative Revolut amount and currency to match', () => {
  const stored = { paymentAmount: 20, currency: 'GBP' }
  assert.equal(assertPaymentMatchesStoredOrder(stored, { amount: 2000, currency: 'GBP' }), true)
  assert.throws(() => assertPaymentMatchesStoredOrder(stored, { amount: 2100, currency: 'GBP' }), /does not match/)
  assert.throws(() => assertPaymentMatchesStoredOrder(stored, { amount: 2000, currency: 'EUR' }), /does not match/)
})
