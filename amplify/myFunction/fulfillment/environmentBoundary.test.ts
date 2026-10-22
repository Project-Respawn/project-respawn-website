import assert from 'node:assert/strict'
import test from 'node:test'
import { REVOLUT_MODE, isPrintfulFulfillmentEnabled } from '../config/env'
import { buildFulfillmentOrder, createAtomicDispatcher } from './index'
import { createPrintfulOrder, handlePrintfulCreateOrder, handlePrintfulProducts } from '../printful'
import { installAtomicGraphQL } from './claimTestStore'
let sequence=0
function fixture(){
 let row:any={id:'boundary-'+(++sequence),projectOrderId:'PR-fixture',revolutOrderId:'rev-fixture',environment:REVOLUT_MODE==='prod'?'production':'sandbox',paymentStatus:'completed',paymentAmount:20,currency:'GBP',customerName:'Fixture',email:'test@example.invalid',items:[{productId:'p',variantId:'v',unitPrice:20,quantity:1,fulfillmentProvider:'printful',fulfillmentVariantId:'sync'}],shippingAddress:{address:'1 Fixture Street',city:'London',postcode:'TEST1',country:'GB'},providerStatuses:{},auditHistory:[],overallFulfillmentStatus:'pending'}
 const updates:any[]=[],calls:any[]=[]
 const client:any={models:{FulfillmentOrder:{get:async()=>({data:structuredClone(row)}),list:async()=>({data:[structuredClone(row)]}),update:async(input:any)=>{updates.push(input);row={...row,...input};return{data:structuredClone(row)}}},MerchProduct:{get:async()=>({data:{id:'p',sourceType:'printful'}})},MerchProductVariant:{get:async()=>({data:{productId:'p',externalVariantId:'sync',currency:'GBP',retailPrice:20}})}}}
 installAtomicGraphQL(client)
 const deps={getClient:async()=>client,fetchPayment:async()=>({statusCode:200,body:{id:'rev-fixture',merchant_order_ext_ref:'PR-fixture',state:'completed',amount:2000,currency:'GBP'}}),fulfillmentEnabled:()=>true,createPrintful:async(payload:any)=>{calls.push(payload);return{statusCode:200,body:{result:{id:'provider-fixture'}}}}}
 return{get row(){return row},updates,calls,deps,dispatch:createAtomicDispatcher()}
}

test('checkout data builds a normal persistent internal order record for the configured environment',()=>{const item={productId:'p',variantId:'v',fulfillmentProvider:'printful',fulfillmentVariantId:'sync',quantity:1,unitPrice:24.99};const stored=buildFulfillmentOrder({projectOrderId:'project-id',revolutOrderId:'rev',paymentAmount:24.99,currency:'GBP',customerName:'Fixture',email:'test@example.invalid',shippingAddress:{city:'Test City'},items:[item]},'paid','2026-08-10T12:00:00.000Z');assert.equal(stored.environment,REVOLUT_MODE==='prod'?'production':'sandbox');assert.equal(stored.paymentStatus,'paid');assert.deepEqual(stored.items[0],item);assert.equal(stored.shippingAddress.city,'Test City')})
test('live aliases are accepted only when the app environment is also production',()=>{assert.equal(isPrintfulFulfillmentEnabled('production','live'),true);assert.equal(isPrintfulFulfillmentEnabled('sandbox','live'),false)})
for(const environment of [{name:'staging',appEnv:'staging',mode:'sandbox'},{name:'sandbox',appEnv:'sandbox',mode:'sandbox'},{name:'missing',appEnv:'',mode:''},{name:'unknown',appEnv:'unknown',mode:'unknown'}])test(environment.name+' skips Printful creation without mutating the stored order',async()=>{const h=fixture();const enabled=()=>isPrintfulFulfillmentEnabled(environment.appEnv,environment.mode);const result=await h.dispatch(h.row,{...h.deps,fulfillmentEnabled:enabled});assert.equal(enabled(),false);assert.equal(result.printful.status,'test_skipped');assert.equal(h.calls.length,0);assert.equal(h.updates.length,0)})
test('explicit production reaches Printful only after trusted environment and atomic claim validation',async()=>{const h=fixture();h.row.environment='production';if(REVOLUT_MODE!=='prod'){await assert.rejects(h.dispatch(h.row,h.deps),/environment/);assert.equal(h.calls.length,0);return}const result=await h.dispatch(h.row,h.deps);assert.equal(h.calls.length,1);assert.deepEqual(h.calls[0].items,[{sync_variant_id:'sync',quantity:1}]);assert.equal(h.calls[0].zip,'TEST1');assert.equal('postcode'in h.calls[0],false);assert.equal(result.printful.status,'fulfilled');assert.ok(h.updates.some(v=>String(v.overallFulfillmentStatus).startsWith('fulfillment_claimed:')))})
test('missing Printful variant ID fails before claiming or submitting instead of guessing a mapping',async()=>{const h=fixture();h.row.items[0].fulfillmentVariantId=undefined;await assert.rejects(h.dispatch(h.row,h.deps),/mapping/);assert.equal(h.calls.length,0);assert.equal(h.updates.length,0)})
test('duplicate fulfilled provider dispatch does not create a second Printful order',async()=>{const h=fixture();h.row.providerStatuses={printful:{status:'fulfilled',providerOrderId:'existing'}};h.row.overallFulfillmentStatus='fulfilled';await h.dispatch(h.row,h.deps);assert.equal(h.calls.length,0);assert.equal(h.updates.length,0)})
test('Printful API failure retains a durable reconciliation marker in production',async()=>{const h=fixture();h.row.environment='production';const deps={...h.deps,createPrintful:async(payload:any)=>{h.calls.push(payload);return{statusCode:503,body:{error:'offline-unavailable'}} as any}};await assert.rejects(h.dispatch(h.row,deps));if(REVOLUT_MODE==='prod'){assert.equal(h.calls.length,1);assert.match(h.row.overallFulfillmentStatus,/^reconciliation_required:/);await assert.rejects(h.dispatch(h.row,deps));assert.equal(h.calls.length,1)}else assert.equal(h.calls.length,0)})
test('a stored sandbox order cannot later pass the production guard',async()=>{const h=fixture();h.row.environment='sandbox';if(REVOLUT_MODE==='prod')await assert.rejects(h.dispatch(h.row,h.deps),/environment/);else assert.equal((await h.dispatch(h.row,h.deps)).printful.status,'test_skipped');assert.equal(h.calls.length,0)})
test('an unclassified legacy order fails closed even when production is requested',async()=>{const h=fixture();delete h.row.environment;await assert.rejects(h.dispatch(h.row,h.deps),/environment/);assert.equal(h.calls.length,0);assert.equal(h.updates.length,0)})

test('Printful creation reuses an existing external order and never posts a duplicate', async () => {
  const calls: Array<{ url: string; method: string }> = []
  const result = await createPrintfulOrder(
    { orderId: 'PR-123', items: [{ sync_variant_id: '5352643000', quantity: 1 }] },
    {
      fulfillmentEnabled: () => true,
      authHeader: () => 'Bearer test',
      request: async (url, method) => {
        calls.push({ url, method })
        return { statusCode: 200, body: { result: { id: 'existing-printful-order', external_id: 'PR-123' } } } as any
      },
    },
  )
  assert.equal((result.body as any).result.id, 'existing-printful-order')
  assert.deepEqual(calls.map((call) => call.method), ['GET'])
  assert.match(calls[0].url, /orders\/%40PR-123$/)
})

test('Printful creation posts only after a 404 duplicate lookup', async () => {
  const methods: string[] = []
  let postedBody: any
  await createPrintfulOrder(
    { orderId: 'PR-123', zip: 'SW1A 1AA', items: [{ sync_variant_id: '5352643000', quantity: 1 }] },
    {
      fulfillmentEnabled: () => true,
      authHeader: () => 'Bearer test',
      request: async (_url, method, body) => {
        methods.push(method)
        if (method === 'POST') postedBody = body
        return method === 'GET' ? { statusCode: 404, body: {} } as any : { statusCode: 200, body: { result: { id: 'new' } } } as any
      },
    },
  )
  assert.deepEqual(methods, ['GET', 'POST'])
  assert.deepEqual(postedBody.items, [{ sync_variant_id: '5352643000', quantity: 1 }])
  assert.equal(postedBody.recipient.zip, 'SW1A 1AA')
  assert.equal('postcode' in postedBody.recipient, false)
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
