import assert from 'node:assert/strict'
import test from 'node:test'
import { handleRevolutWebhook, signRevolutWebhook } from './webhook'

const secret = 'test-signing-secret'
const now = 1_800_000_000_000
const timestamp = String(now)
const items = [{ productId: 'product-1', variantId: 'variant-1', fulfillmentVariantId: 'sync-1', color: 'Black', size: 'L', quantity: 1 }]

function order(overrides: Record<string, unknown> = {}) {
  return { id: 'stored-1', revolutOrderId: 'rev-1', environment: 'sandbox', paymentStatus: 'pending', paymentDate: null, paymentAmount: 25, currency: 'GBP', items, providerStatuses: {}, auditHistory: [], ...overrides }
}

function harness(stored: any = order(), authoritative: Record<string, unknown> = { id: 'rev-1', state: 'completed', amount: 2500, currency: 'GBP' }) {
  const updates: any[] = []
  let creates = 0
  let printfulCalls = 0
  const client = { models: { FulfillmentOrder: {
    list: async () => ({ data: stored ? [stored] : [] }),
    update: async (value: any) => { updates.push(value); return { data: { ...stored, ...value } } },
    create: async () => { creates += 1; return { data: null } },
  } } }
  const invoke = async (payload = { event: 'ORDER_COMPLETED', order_id: 'rev-1' }, signature = true) => {
    const body = JSON.stringify(payload)
    return handleRevolutWebhook({ body, headers: {
      'Revolut-Request-Timestamp': timestamp,
      'Revolut-Signature': signature ? signRevolutWebhook(body, timestamp, secret) : 'v1=invalid',
    } }, { signingSecret: secret, now: () => now, getClient: async () => client, fetchOrder: async () => ({ statusCode: 200, body: authoritative }) })
  }
  return { invoke, updates, get creates() { return creates }, get printfulCalls() { return printfulCalls } }
}

test('valid signed webhook updates the same pending order and preserves merchandise/provider data', async () => {
  const h = harness()
  assert.equal((await h.invoke()).statusCode, 204)
  assert.equal(h.updates.length, 1)
  assert.equal(h.updates[0].id, 'stored-1')
  assert.equal(h.updates[0].paymentStatus, 'completed')
  assert.deepEqual(JSON.parse(h.updates[0].auditHistory)[0].action, 'Revolut webhook payment update')
  assert.equal(h.updates[0].items, undefined)
  assert.equal(h.updates[0].providerStatuses, undefined)
  assert.equal(h.creates, 0)
  assert.equal(h.printfulCalls, 0)
})

test('valid webhook preserves JSON-serialized audit history returned by the Amplify client', async () => {
  const original = { timestamp: '2026-01-01T00:00:00.000Z', action: 'Order created', result: 'success', provider: null }
  const h = harness(order({ auditHistory: JSON.stringify([original]) }))
  await h.invoke()
  const auditHistory = JSON.parse(h.updates[0].auditHistory)
  assert.equal(auditHistory.length, 2)
  assert.deepEqual(auditHistory[0], original)
  assert.equal(auditHistory[1].action, 'Revolut webhook payment update')
})

test('invalid signature is rejected before data access', async () => {
  const h = harness()
  assert.equal((await h.invoke(undefined, false)).statusCode, 401)
  assert.equal(h.updates.length, 0)
})

test('captured is treated as paid on the existing record', async () => {
  const h = harness(order(), { id: 'rev-1', state: 'captured', amount: 2500, currency: 'GBP' })
  await h.invoke()
  assert.equal(h.updates[0].paymentStatus, 'captured')
  assert.ok(h.updates[0].paymentDate)
})

for (const [name, authoritative] of [
  ['amount', { id: 'rev-1', state: 'completed', amount: 2600, currency: 'GBP' }],
  ['currency', { id: 'rev-1', state: 'completed', amount: 2500, currency: 'USD' }],
] as const) test(`${name} mismatch records a visible security error without marking paid`, async () => {
  const h = harness(order(), authoritative)
  await h.invoke()
  assert.match(h.updates[0].reconciliationError, /does not match/)
  assert.equal(h.updates[0].paymentStatus, undefined)
})

test('duplicate delivery of an already-current state is idempotent', async () => {
  const h = harness(order({ paymentStatus: 'completed', paymentDate: 'already-paid' }))
  await h.invoke()
  await h.invoke()
  assert.equal(h.updates.length, 0)
  assert.equal(h.creates, 0)
})

for (const state of ['failed', 'cancelled']) test(`${state} authoritative state updates appropriately`, async () => {
  const h = harness(order(), { id: 'rev-1', state, amount: 2500, currency: 'GBP' })
  await h.invoke({ event: state === 'failed' ? 'ORDER_FAILED' : 'ORDER_CANCELLED', order_id: 'rev-1' })
  assert.equal(h.updates[0].paymentStatus, state)
  assert.equal(h.updates[0].paymentDate, null)
})

test('unknown signed order is acknowledged without manufacturing fulfillment data', async () => {
  const h = harness(null)
  assert.equal((await h.invoke()).statusCode, 204)
  assert.equal(h.creates, 0)
  assert.equal(h.updates.length, 0)
})

test('stale signed webhook is rejected to prevent replay', async () => {
  const body = JSON.stringify({ event: 'ORDER_COMPLETED', order_id: 'rev-1' })
  const staleTimestamp = String(now - 301_000)
  const result = await handleRevolutWebhook({ body, headers: { 'Revolut-Request-Timestamp': staleTimestamp, 'Revolut-Signature': signRevolutWebhook(body, staleTimestamp, secret) } }, { signingSecret: secret, now: () => now })
  assert.equal(result.statusCode, 401)
})
