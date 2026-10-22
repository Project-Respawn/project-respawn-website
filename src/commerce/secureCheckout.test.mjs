import assert from 'node:assert/strict'
import test from 'node:test'
import { createSecureCheckout, statusMessage } from './secureCheckout.js'

test('guest browser sends selections only, retains capability in memory, and uses protected status', async () => {
  const calls = [], capability = 'A'.repeat(43)
  const client = createSecureCheckout({ baseUrl: 'https://offline.invalid', request: async (url, init) => {
    calls.push({ url, init })
    const body = url.endsWith('/quotes') ? { id: 'cr-test', capability, expiresAt: Date.now() + 60000 } :
      url.endsWith('/payment') ? { token: 'public-token', totals: { totalMinor: 2500 } } : { id: 'cr-test', state: 'PAYMENT_VERIFIED' }
    return new Response(JSON.stringify(body), { status: 200 })
  } })
  const items = [{ variantId: 'v', quantity: 2, price: 0.01, fulfillmentVariantId: 'injected' }]
  const [a, b] = await Promise.all([client.start(items, { country_code: 'GB' }), client.start(items, { country_code: 'GB' })])
  assert.equal(a.token, b.token)
  assert.equal(calls.filter(c => c.url.endsWith('/quotes')).length, 1)
  assert.deepEqual(JSON.parse(calls[0].init.body).items, [{ variantId: 'v', quantity: 2 }])
  assert.equal(calls[1].init.headers.Authorization, `Guest ${capability}`)
  assert.ok(calls.every(c => !c.url.includes(capability) && !String(c.init.body).includes(capability)))
  assert.equal((await client.status()).state, 'PAYMENT_VERIFIED')
  await client.revoke()
  await assert.rejects(client.status())
})
test('authenticated browser sends access token and never makes a fulfilment request', async () => {
  const calls = []
  const client = createSecureCheckout({ baseUrl: 'https://offline.invalid', accessToken: async () => 'verified-access-token', request: async (url, init) => {
    calls.push({ url, init }); return new Response(JSON.stringify(url.endsWith('/quotes') ? { id: 'cr-test', expiresAt: Date.now() + 60000 } : { token: 'token', totals: {} }), { status: 200 })
  } })
  await client.start([{ variantId: 'v', quantity: 1 }], {})
  assert.ok(calls.every(c => c.init.headers.Authorization === 'Bearer verified-access-token'))
  assert.ok(calls.every(c => !c.url.includes('/fulfill')))
})
test('checkout hold never proceeds to payment creation', async () => {
  let calls = 0
  const client = createSecureCheckout({ baseUrl: 'https://offline.invalid', request: async () => {
    calls++; return new Response(JSON.stringify({ error: 'CHECKOUT_SECURITY_HOLD' }), { status: 503 })
  } })
  await assert.rejects(client.start([{ variantId: 'v', quantity: 1 }], {}), /temporarily unavailable/)
  assert.equal(calls, 1)
})
test('customer statuses distinguish draft, confirmation and shipment accurately', () => {
  assert.match(statusMessage('PROVIDER_ORDER_CREATED'), /awaiting production confirmation/)
  assert.match(statusMessage('PROVIDER_CONFIRMED'), /accepted for production/)
  assert.match(statusMessage('SHIPPED'), /shipped/)
  assert.match(statusMessage('PAYMENT_UNKNOWN'), /Do not pay again/)
  assert.match(statusMessage('RECONCILIATION_REQUIRED'), /review/)
})

test('quotes can be reviewed without creating payment and cannot be repriced after a session starts', async()=>{
  const requests=[]
  const client=createSecureCheckout({baseUrl:'https://offline.invalid',request:async(url)=>{
    requests.push(url)
    return new Response(JSON.stringify(url.endsWith('/quotes')?{id:'cr-fixture',capability:'A'.repeat(43),expiresAt:Date.now()+60000,totalMinor:2500,shippingMinor:0}:{token:'fixture-token',totals:{totalMinor:2500,shippingMinor:0}}),{status:200})
  }})
  const items=[{variantId:'v',quantity:1}]
  const quote=await client.quote(items,{},'GBP');assert.equal(quote.totalMinor,2500);assert.equal(requests.length,1)
  await client.start(items,{},'GBP');assert.equal(requests.length,2)
  await assert.rejects(client.quote(items,{},'USD'),/payment session already exists/)
})

test('cross-tab order lookup carries Cognito authorization and never reuses another order guest capability',async()=>{
  const requests=[],id='cr_00000000-0000-0000-0000-000000000000'
  const client=createSecureCheckout({baseUrl:'https://offline.invalid',accessToken:async()=> 'fixture-access-token',request:async(url,init)=>{
    requests.push({url,init});return new Response(JSON.stringify({state:'PENDING_PAYMENT'}),{status:200})
  }})
  await client.status(id);assert.equal(requests[0].init.headers.Authorization,'Bearer fixture-access-token')
  await assert.rejects(client.status('email@example.invalid'),/valid order reference/)
  assert.match(statusMessage('PARTIALLY_REFUNDED'),/Part of your payment/)
})
