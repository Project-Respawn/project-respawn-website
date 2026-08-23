import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { fulfillmentSummary, hasProviderError, orderMatchesFilters, parseManagedOrders, sortOrdersNewestFirst } from './AdminOrders.js'

const statuses = [
  { paymentStatus: 'pending', overallFulfillmentStatus: 'pending', providerStatuses: {} },
  { paymentStatus: 'completed', overallFulfillmentStatus: 'fulfilled', providerStatuses: { printful: { status: 'fulfilled' } } },
  { paymentStatus: 'completed', overallFulfillmentStatus: 'failed', providerStatuses: { printful: { status: 'failed', lastError: 'Provider unavailable' } } },
  { paymentStatus: 'completed', overallFulfillmentStatus: 'recovery_required', providerStatuses: {} },
]

test('all stored lifecycle states remain visible with default Admin Orders filters', () => {
  for (const order of statuses) assert.equal(orderMatchesFilters(order), true)
})

test('pending, fulfilled, failed, and recovery-required summaries are preserved', () => {
  assert.equal(fulfillmentSummary(statuses[0]), 'pending')
  assert.equal(fulfillmentSummary(statuses[1]), 'fulfilled')
  assert.equal(fulfillmentSummary(statuses[2]), 'failed')
  assert.equal(fulfillmentSummary(statuses[3]), 'recovery_required')
  assert.equal(hasProviderError(statuses[2]), true)
})

test('newest stored orders appear first', () => {
  const sorted = sortOrdersNewestFirst([{ id: 'missing' }, { id: 'old', createdAt: '2026-01-01T00:00:00Z' }, { id: 'new', createdAt: '2026-02-01T00:00:00Z' }])
  assert.deepEqual(sorted.map((order) => order.id), ['new', 'old', 'missing'])
})

test('AWSJSON string responses decode to orders instead of blank character rows', () => {
  const orders = [{ id: 'stored', projectOrderId: 'PR-1' }]
  assert.deepEqual(parseManagedOrders(JSON.stringify(orders)), orders)
  assert.deepEqual(parseManagedOrders(JSON.stringify(JSON.stringify(orders))), orders)
  assert.deepEqual(parseManagedOrders('not-json'), [])
})

test('search matches Project ID, Revolut ID, email, and customer name', () => {
  const order = { projectOrderId: 'PR-SEARCH', revolutOrderId: 'REV-SEARCH', email: 'buyer@example.invalid', customerName: 'Example Buyer' }
  for (const search of ['pr-search', 'rev-search', 'buyer@example', 'example buyer']) {
    assert.equal(orderMatchesFilters(order, { search }), true)
  }
})

test('detail view renders provider errors and complete item identity', () => {
  const template = readFileSync(new URL('./AdminOrders.vue', import.meta.url), 'utf8')
  for (const field of ['productId', 'variantId', 'externalVariantId', 'fulfillmentVariantId', 'color', 'size', 'quantity', 'unitPrice']) {
    assert.match(template, new RegExp(`item\\.${field}`))
  }
  assert.match(template, /status\.lastError/)
  assert.match(template, /reconcileOrder\(selectedOrder\)/)
})
