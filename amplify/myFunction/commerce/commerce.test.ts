import assert from 'node:assert/strict'
import test from 'node:test'
import { Catalogue, Ledger, Order, Providers, ProviderOrder } from './contracts'
import { createCommerce } from './service'
import { minorUnits, digest } from './quote'
import { commerceHttp, cognitoIdentity } from './http'
import { dynamoLedger } from './ledger'
import { providerAdapters } from './providers'
import { handleRevolutWebhook, signRevolutWebhook } from '../revolut/webhook'
import { legacyAttempts } from './legacy'
import { currencyPrices } from './currencies'

const copy = <T>(v: T): T => structuredClone(v)
const recipient = { name: 'Test Customer', email: 'test@example.invalid', address1: '1 Test Street', city: 'London', zip: 'TEST', country_code: 'GB' }
const selection = { recipient, items: [{ variantId: 'v', quantity: 2, price: 0.01, fulfillmentVariantId: 'evil' }], amount: 1, currency: 'GBP' }
function fixture() {
  let clock = 1800000000000
  const data = new Map<string, Order>(), calls: string[] = [], providerOrders = new Map<string, ProviderOrder>()
  const payment: any = { id: 'rev', reference: '', environment: 'sandbox', amountMinor: 2000, currency: 'GBP', state: 'completed', refundedMinor: 0 }
  const catalogue: Catalogue = {
    variant: async () => ({ productId: 'p', syncVariantId: 'sync', currencyPrices: { GBP: 1000, EUR: 1200, USD: 1500 }, active: true }),
    product: async () => ({ name: 'Shirt', active: true, provider: 'printful', providerProductId: 'pf-product' }),
  }
  // Independent instances share only this durable-storage simulator, never a process-local lock.
  const ledger: Ledger = {
    get: async id => data.has(id) ? copy(data.get(id)!) : undefined,
    create: async order => { if (data.has(order.id)) return false; data.set(order.id, copy(order)); return true },
    replace: async (previous, next) => {
      const stored = data.get(previous.id)
      if (!stored || stored.version !== previous.version || stored.snapshotHash !== previous.snapshotHash) return false
      data.set(next.id, copy(next)); return true
    },
  }
  const providers: Providers = {
    syncVariant: async () => ({ id: 'sync', catalogVariantId: 123, productId: 'pf-product', active: true }),
    shipping: async () => ({ currency: 'GBP', method: 'STANDARD', amountMinor: 500 }),
    tax: async (_basis, basisHash) => ({ currency: 'GBP', amountMinor: 500, reference: 'tax-fixture', policy: 'mock-approved-policy', inclusive: true, basisHash }),
    createPayment: async (id) => { calls.push('payment'); payment.reference = id; assert.ok(data.has(id)); return { id: 'rev', token: 'public-checkout-token' } },
    payment: async () => copy(payment),
    findOrder: async id => { calls.push('lookup'); return copy(providerOrders.get(id)) },
    createOrder: async (id, snapshot) => {
      calls.push('create'); const result: ProviderOrder = { id: 'pf', reference: id, status: 'draft', recipient: snapshot.recipient,
        lines: snapshot.lines.map(l => ({ syncVariantId: l.syncVariantId, quantity: l.quantity })) }
      providerOrders.set(id, copy(result)); return result
    },
    confirmOrder: async id => { calls.push('confirm'); const order = [...providerOrders.values()].find(o => o.id === id)!; order.status = 'pending'; return copy(order) },
  }
  const instance = () => createCommerce({ ledger, catalogue, providers, environment: 'sandbox', now: () => clock, confirmEnabled: true })
  const service = instance()
  async function pending(kind: 'guest' | 'customer' = 'guest') {
    const owner = kind === 'guest' ? { kind: 'guest' as const } : { kind: 'customer' as const, sub: 'alice' }
    const quoted = await service.createQuote(selection, owner)
    const principal = kind === 'guest' ? { kind: 'guest' as const, capability: quoted.capability } : { kind: 'customer' as const, sub: 'alice' }
    await service.startPayment(quoted.id, principal)
    return { quoted, principal }
  }
  return { service, instance, ledger, data, calls, providers, catalogue, payment, providerOrders, pending, advance: (ms: number) => { clock += ms } }
}

test('authoritative quote uses integer catalogue/shipping/tax totals and ignores browser money/mapping', async () => {
  const h = fixture(), result = await h.service.createQuote(selection, { kind: 'guest' })
  assert.equal(result.totalMinor, 2000); assert.equal(result.shippingMinor, 0); assert.equal(result.taxMinor, 500)
  const stored = h.data.get(result.id)!
  assert.equal(stored.snapshot.lines[0].syncVariantId, 'sync')
  assert.ok(result.capability && result.capability.length === 43)
  assert.ok(!JSON.stringify(stored).includes(result.capability!))
})

for (const [currency, expected] of [['GBP', 2000], ['EUR', 2400], ['USD', 3000]] as const) test(`independent ${currency} price drives exact payment and fulfilment`, async () => {
  const h = fixture()
  h.providers.shipping = async (_lines, _recipient, selected) => ({ currency: selected, method: 'STANDARD', amountMinor: 500 })
  h.providers.tax = async (basis, basisHash) => ({ currency: basis.currency, amountMinor: 500, reference: 'mock', policy: 'mock', inclusive: true, basisHash })
  h.payment.currency = currency; h.payment.amountMinor = expected
  const result = await h.service.createQuote({ ...selection, currency, amount: 1, items: [{ ...selection.items[0], price: 1, currencyPrices: { [currency]: 1 } }] }, { kind: 'customer', sub: 'alice' })
  assert.equal(result.totalMinor, expected); assert.equal(result.currency, currency)
  await h.service.startPayment(result.id, { kind: 'customer', sub: 'alice' })
  await h.service.paymentEvent('rev')
  assert.equal(h.data.get(result.id)!.state, 'PROVIDER_CONFIRMED')
})

test('unsupported currency, missing configured currency and fractional configuration fail closed', async () => {
  const h = fixture()
  for (const currency of ['JPY', 'gbp', '', '__proto__', undefined]) {
    await assert.rejects(h.service.createQuote({ ...selection, currency }, { kind: 'guest' }), /UNSUPPORTED_CURRENCY/)
  }
  h.catalogue.variant = async () => ({ productId: 'p', syncVariantId: 'sync', currencyPrices: { GBP: 1000 }, active: true })
  await assert.rejects(h.service.createQuote({ ...selection, currency: 'EUR' }, { kind: 'guest' }), /PRICE_NOT_CONFIGURED/)
  for (const prices of [{ GBP: 1.5 }, { USD: -1 }, { EUR: 0 }, { JPY: 10 }, { GBP: '10.00' }]) assert.throws(() => currencyPrices(prices))
  assert.deepEqual(currencyPrices(JSON.stringify({ GBP: 1000, EUR: 1700, USD: 999 })), { GBP: 1000, EUR: 1700, USD: 999 })
})

test('Revolut adapter receives matching configured currency/amount without conversion', async () => {
  for (const currency of ['GBP', 'EUR', 'USD'] as const) {
    const requests: any[] = []
    const adapter = providerAdapters({ printfulKey: 'mock', revolutKey: 'mock', environment: 'sandbox', transport: async (_url, init) => {
      requests.push(JSON.parse(String(init.body))); return new Response(JSON.stringify({ id: 'rev', token: 'public' }), { status: 201 })
    } })
    const snapshot = { ...([...fixture().data.values()][0]?.snapshot || {}), currency, totalMinor: 12345 } as any
    await adapter.createPayment('cr-fixture', snapshot)
    assert.equal(requests[0].currency, currency); assert.equal(requests[0].amount, 12345)
    assert.ok(!('exchange_rate' in requests[0]))
  }
})
for (const quantity of [0, -1, 1.5, 21, '2']) test(`invalid quantity ${quantity} is rejected`, async () => {
  const h = fixture()
  await assert.rejects(h.service.createQuote({ ...selection, items: [{ variantId: 'v', quantity }] }, { kind: 'guest' }))
  assert.equal(h.data.size, 0); assert.deepEqual(h.calls, [])
})
test('duplicate selections and unknown/inactive variants cannot bypass quantity/product checks', async () => {
  const h = fixture()
  await assert.rejects(h.service.createQuote({ ...selection, items: [...selection.items, ...selection.items] }, { kind: 'guest' }))
  h.catalogue.variant = async () => undefined
  await assert.rejects(h.service.createQuote(selection, { kind: 'guest' }))
})
for (const component of ['shipping', 'tax', 'syncVariant'] as const) test(`${component} failure never creates an order/payment`, async () => {
  const h = fixture(); (h.providers[component] as any) = async () => { throw new Error('mock unavailable') }
  await assert.rejects(h.service.createQuote(selection, { kind: 'guest' }))
  assert.equal(h.data.size, 0); assert.deepEqual(h.calls, [])
})
test('tax quote must bind to exact immutable quote basis', async () => {
  const h = fixture(); h.providers.tax = async () => ({ currency: 'GBP', amountMinor: 0, reference: 'r', policy: 'p', basisHash: 'wrong' })
  await assert.rejects(h.service.createQuote(selection, { kind: 'guest' }), /TAX_UNAVAILABLE/)
})
test('money parsing rejects floating precision, exponent, negative and missing values', () => {
  assert.equal(minorUnits('12.34'), 1234)
  for (const input of [undefined, null, -1, '1e2', '1.001', NaN]) assert.throws(() => minorUnits(input))
})
test('guest capability authorizes only its order, expires and can be revoked', async () => {
  const h = fixture(), a = await h.pending(), b = await h.pending()
  await assert.rejects(h.service.status(b.quoted.id, a.principal), /ORDER_NOT_FOUND/)
  await h.service.revoke(a.quoted.id, a.principal)
  await assert.rejects(h.service.status(a.quoted.id, a.principal), /ORDER_NOT_FOUND/)
  h.advance(31 * 86400_000)
  await assert.rejects(h.service.status(b.quoted.id, b.principal), /ORDER_NOT_FOUND/)
})
test('stolen bearer guest capability is usable until revoked; never grants another order', async () => {
  const h = fixture(), a = await h.pending()
  assert.equal((await h.instance().status(a.quoted.id, a.principal)).id, a.quoted.id)
  await h.service.revoke(a.quoted.id, a.principal)
  await assert.rejects(h.instance().status(a.quoted.id, a.principal))
})
test('authenticated order requires verified same customer and exposes no raw provider or address data', async () => {
  const h = fixture(), a = await h.pending('customer')
  await assert.rejects(h.service.status(a.quoted.id, { kind: 'customer', sub: 'bob' }))
  await assert.rejects(h.service.status(a.quoted.id, { kind: 'guest', capability: 'alice' }))
  const status = await h.service.status(a.quoted.id, a.principal)
  assert.ok(!JSON.stringify(status).includes(recipient.email)); assert.ok(!JSON.stringify(status).includes('public-checkout-token'))
})
test('quote expiry prevents payment creation and payment retries reuse the original session', async () => {
  const h = fixture(), a = await h.pending()
  await h.service.startPayment(a.quoted.id, a.principal)
  assert.equal(h.calls.filter(c => c === 'payment').length, 1)
  const b = await h.service.createQuote(selection, { kind: 'customer', sub: 'alice' }); h.advance(11 * 60_000)
  await assert.rejects(h.service.startPayment(b.id, { kind: 'customer', sub: 'alice' }), /QUOTE_EXPIRED/)
})
test('independent instances race on durable claim: one provider creation and confirmation', async () => {
  const h = fixture(); await h.pending()
  await Promise.allSettled(Array.from({ length: 20 }, () => h.instance().paymentEvent('rev')))
  assert.equal(h.calls.filter(c => c === 'create').length, 1)
  assert.equal(h.calls.filter(c => c === 'confirm').length, 1)
  assert.equal([...h.data.values()][0].state, 'PROVIDER_CONFIRMED')
  await h.instance().paymentEvent('rev')
  assert.equal(h.calls.filter(c => c === 'create').length, 1)
})
for (const field of ['reference', 'currency', 'amountMinor', 'environment'] as const) test(`mismatched payment ${field} cannot dispatch`, async () => {
  const h = fixture(); await h.pending(); h.payment[field] = field === 'amountMinor' ? 1 : 'wrong'
  if (field === 'reference') assert.equal(await h.service.paymentEvent('rev'), false)
  else await assert.rejects(h.service.paymentEvent('rev'))
  assert.ok(!h.calls.includes('create'))
})
for (const state of ['pending', 'failed', 'cancelled']) test(`${state} payment never dispatches`, async () => {
  const h = fixture(); await h.pending(); h.payment.state = state
  await h.service.paymentEvent('rev'); assert.ok(!h.calls.includes('create'))
})
test('refund before dispatch stops fulfilment; refund after creation requires reconciliation', async () => {
  const h = fixture(); await h.pending(); h.payment.refundedMinor = 10
  await h.service.paymentEvent('rev'); assert.equal([...h.data.values()][0].state, 'PARTIALLY_REFUNDED')
  assert.ok(!h.calls.includes('create'))
  const b = fixture(); await b.pending(); await b.service.paymentEvent('rev'); b.payment.refundedMinor = 10
  await b.service.paymentEvent('rev'); assert.equal([...b.data.values()][0].state, 'RECONCILIATION_REQUIRED')
})
test('provider timeout after acceptance reconciles by external ID, never creates a second order', async () => {
  const h = fixture(), a = await h.pending(), original = h.providers.createOrder
  h.providers.createOrder = async (id, snapshot) => { await original(id, snapshot); throw new Error('lost response') }
  await h.service.paymentEvent('rev')
  assert.equal(h.data.get(a.quoted.id)!.state, 'RECONCILIATION_REQUIRED')
  await h.instance().paymentEvent('rev')
  await h.instance().reconcile(a.quoted.id)
  assert.equal(h.calls.filter(c => c === 'create').length, 1)
  assert.equal(h.data.get(a.quoted.id)!.state, 'PROVIDER_ORDER_CREATED')
  await h.instance().reconcile(a.quoted.id)
  assert.equal(h.data.get(a.quoted.id)!.state, 'PROVIDER_CONFIRMED')
})
test('unknown provider outcome with no external order never permits blind resubmission', async () => {
  const h = fixture(), a = await h.pending()
  h.providers.createOrder = async () => { h.calls.push('create'); throw new Error('timeout') }
  await h.service.paymentEvent('rev'); await h.instance().reconcile(a.quoted.id)
  await h.instance().paymentEvent('rev')
  assert.equal(h.calls.filter(c => c === 'create').length, 1)
  assert.equal(h.data.get(a.quoted.id)!.state, 'RECONCILIATION_REQUIRED')
})
test('provider success followed by ledger failure cannot be retried by another instance', async () => {
  const h = fixture(), a = await h.pending(), replace = h.ledger.replace
  h.ledger.replace = async (previous, next) => { if (next.state === 'PROVIDER_ORDER_CREATED') throw new Error('lost ledger write'); return replace(previous, next) }
  await h.service.paymentEvent('rev'); await h.instance().paymentEvent('rev')
  assert.equal(h.calls.filter(c => c === 'create').length, 1)
  assert.equal(h.data.get(a.quoted.id)!.state, 'RECONCILIATION_REQUIRED')
})
test('lost payment creation response can bind from signed authoritative payment, without another session', async () => {
  const h = fixture(), original = h.providers.createPayment
  const quoted = await h.service.createQuote(selection, { kind: 'customer', sub: 'alice' })
  h.providers.createPayment = async (id, snapshot) => { await original(id, snapshot); throw new Error('lost response') }
  await assert.rejects(h.service.startPayment(quoted.id, { kind: 'customer', sub: 'alice' }))
  // Unknown sessions must be reconciled deliberately; known provider ID is never recreated.
  assert.equal(h.data.get(quoted.id)!.state, 'PAYMENT_UNKNOWN')
  await h.instance().paymentEvent('rev')
  assert.equal(h.data.get(quoted.id)!.state, 'PROVIDER_CONFIRMED')
  assert.equal(h.calls.filter(c => c === 'payment').length, 1)
})
test('immutable snapshot tampering fails before provider calls', async () => {
  const h = fixture(), a = await h.pending()
  h.data.get(a.quoted.id)!.snapshot.totalMinor = 1
  await assert.rejects(h.service.status(a.quoted.id, a.principal), /ORDER_INTEGRITY_ERROR/)
})

test('snapshot hashes survive DynamoDB map-key reordering', async () => {
  const h = fixture(), a = await h.pending(), stored = h.data.get(a.quoted.id)!
  stored.snapshot = Object.fromEntries(Object.entries(stored.snapshot).reverse()) as any
  assert.equal(digest(stored.snapshot), stored.snapshotHash)
  assert.equal((await h.service.status(a.quoted.id, a.principal)).id, a.quoted.id)
})

for (const failure of ['inactive', 'mapping', 'negative-shipping', 'wrong-shipping-currency', 'negative-tax']) test(`${failure} fails closed`, async () => {
  const h = fixture()
  if (failure === 'inactive') h.catalogue.product = async () => ({ name: 'Shirt', active: false, provider: 'printful', providerProductId: 'pf-product' })
  if (failure === 'mapping') h.providers.syncVariant = async () => ({ id: 'sync', catalogVariantId: 123, productId: 'wrong-product', active: true })
  if (failure === 'negative-shipping') h.providers.shipping = async () => ({ currency: 'GBP', method: 'STANDARD', amountMinor: -1 })
  if (failure === 'wrong-shipping-currency') h.providers.shipping = async () => ({ currency: 'USD', method: 'STANDARD', amountMinor: 500 })
  if (failure === 'negative-tax') h.providers.tax = async (_, basisHash) => ({ currency: 'GBP', amountMinor: -1, reference: 'r', policy: 'p', basisHash })
  await assert.rejects(h.service.createQuote(selection, { kind: 'guest' }))
  assert.equal(h.data.size, 0)
})
test('legacy references are left to Stage 1, not migrated or granted email ownership', async () => {
  const h = fixture(); h.payment.reference = 'PR-legacy'
  assert.equal(await h.service.paymentEvent('legacy-rev'), false)
  assert.equal(h.data.size, 0)
})
test('Cognito identity rejects unverified, wrong-client and expired tokens', async () => {
  const claims = { iss: 'https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_pool', client_id: 'client', token_use: 'access', sub: 'alice', exp: Math.floor(Date.now() / 1000) + 60 }
  const token = (patch = {}) => `header.${Buffer.from(JSON.stringify({ ...claims, ...patch })).toString('base64url')}.signature`
  const verify = cognitoIdentity('eu-north-1_pool', 'client', { send: async () => ({ UserAttributes: [{ Name: 'sub', Value: 'alice' }] }) } as any)
  assert.equal(await verify(token()), 'alice')
  await assert.rejects(verify(token({ exp: 1 }))); await assert.rejects(verify(token({ client_id: 'other' })))
  const rejecting = cognitoIdentity('eu-north-1_pool', 'client', { send: async () => { throw new Error('Invalid signature') } } as any)
  await assert.rejects(rejecting(token()))
})
test('HTTP release hold, ownership denial and no-store projections', async () => {
  const h = fixture(), a = await h.pending('customer')
  const held = commerceHttp(h.service, async () => 'alice', false)
  assert.equal((await held('/commerce/quotes', 'POST', selection, {})).statusCode, 503)
  const route = commerceHttp(h.service, async () => 'alice', true)
  assert.equal((await route(`/commerce/orders/${a.quoted.id}`, 'GET', null, {})).statusCode, 404)
  const response = await route(`/commerce/orders/${a.quoted.id}`, 'GET', null, { headers: { Authorization: 'Bearer mocked' } })
  assert.equal(response.statusCode, 200); assert.equal(response.headers['Cache-Control'], 'no-store')
})
test('forged/stale webhook cannot reach V2; valid signed replay reaches durable idempotency', async () => {
  const h = fixture(); await h.pending()
  const now = Date.now(), secret = 'offline-secret', body = JSON.stringify({ order_id: 'rev', event: 'ORDER_COMPLETED' })
  let reached = 0
  const stage2 = async (id: string) => { reached++; return h.instance().paymentEvent(id) }
  const event = (timestamp: string, signature?: string) => ({ body, headers: { 'Revolut-Request-Timestamp': timestamp, 'Revolut-Signature': signature || signRevolutWebhook(body, timestamp, secret) } })
  const deps = { signingSecret: secret, now: () => now, stage2 }
  assert.equal((await handleRevolutWebhook(event(String(now), 'forged'), deps)).statusCode, 401)
  assert.equal((await handleRevolutWebhook(event(String(now - 301000)), deps)).statusCode, 401)
  assert.equal(reached, 0)
  assert.equal((await handleRevolutWebhook(event(String(now)), deps)).statusCode, 204)
  assert.equal((await handleRevolutWebhook(event(String(now)), deps)).statusCode, 204)
  assert.equal(h.calls.filter(c => c === 'create').length, 1)
})
test('Dynamo adapter uses strong reads and conditional version writes with exact key', async () => {
  const commands: any[] = [], h = fixture(), a = await h.pending(), stored = h.data.get(a.quoted.id)!
  const ledger = dynamoLedger('local-table', { send: async (command: any) => { commands.push(command.input); return { Item: stored } } } as any)
  await ledger.get(stored.id); await ledger.create(stored); await ledger.replace(stored, { ...stored, version: stored.version + 1 })
  assert.equal(commands[0].ConsistentRead, true)
  assert.equal(commands[1].ConditionExpression, 'attribute_not_exists(pk)')
  assert.match(commands[2].ConditionExpression, /#v = :version AND snapshotHash = :hash/)
})
test('provider adapters never send capabilities and reject missing customer tax policy', async () => {
  const calls: any[] = []
  const adapters = providerAdapters({ printfulKey: 'mock', revolutKey: 'mock', environment: 'sandbox', transport: async (url, init) => {
    calls.push({ url, init }); return new Response(JSON.stringify({ result: [{ id: 'STANDARD', currency: 'GBP', rate: '5.00' }] }), { status: 200 })
  } })
  assert.equal((await adapters.shipping([{ catalogVariantId: 123, quantity: 2, unitMinor: 1000 } as any], recipient, 'GBP')).amountMinor, 500)
  assert.ok(!JSON.stringify(calls).includes('capability'))
  await assert.rejects(adapters.tax({} as any, 'basis'), /CUSTOMER_TAX_POLICY_UNCONFIGURED/)
})

test('legacy attempts use durable conditional fencing across instances, retaining uncertain outcomes', async () => {
  const records = new Map<string, any>()
  const client = { send: async (command: any) => {
    const input = command.input
    if (input.Key) return { Item: records.get(input.Key.pk) }
    const old = records.get(input.Item.pk)
    if (input.ConditionExpression === 'attribute_not_exists(pk)' && old || input.ExpressionAttributeValues && old?.attemptId !== input.ExpressionAttributeValues[':attempt']) {
      const error = new Error('conflict'); error.name = 'ConditionalCheckFailedException'; throw error
    }
    records.set(input.Item.pk, input.Item); return {}
  } }
  let creates = 0
  const submit = async () => { creates++; return { printful: { status: 'fulfilled' } } }
  await Promise.allSettled(Array.from({ length: 20 }, () => legacyAttempts('fixture', 'sandbox', client as any)('legacy', submit)))
  await legacyAttempts('fixture', 'sandbox', client as any)('legacy', submit)
  assert.equal(creates, 1)
  const failed = () => legacyAttempts('fixture', 'sandbox', client as any)('uncertain', async () => { creates++; throw new Error('timeout') })
  await assert.rejects(failed()); await assert.rejects(failed(), /reconciliation/)
  assert.equal(creates, 2)
})

test('provider confirmation timeout reconciles to existing provider state without another POST', async () => {
  const h = fixture(), a = await h.pending(), confirm = h.providers.confirmOrder
  h.providers.confirmOrder = async id => { await confirm(id); throw new Error('lost confirmation response') }
  await h.service.paymentEvent('rev')
  assert.equal(h.data.get(a.quoted.id)!.state, 'RECONCILIATION_REQUIRED')
  await h.instance().reconcile(a.quoted.id)
  assert.equal(h.data.get(a.quoted.id)!.state, 'PROVIDER_CONFIRMED')
  assert.equal(h.calls.filter(c => c === 'confirm').length, 1)
})

test('shipment observation moves confirmed order to SHIPPED, never on draft creation', async () => {
  const h = fixture(), a = await h.pending(); await h.service.paymentEvent('rev')
  assert.equal(h.data.get(a.quoted.id)!.state, 'PROVIDER_CONFIRMED')
  h.providerOrders.get(a.quoted.id)!.status = 'fulfilled'
  await h.instance().reconcile(a.quoted.id)
  assert.equal((await h.service.status(a.quoted.id, a.principal)).state, 'SHIPPED')
})
