import assert from 'node:assert/strict'
import test from 'node:test'
import { offlineCheckoutFixture } from '../../../scripts/commerce/offline-fixture'
import { TAX_POLICY, inclusiveTaxPolicy, TaxPolicyConfig } from './taxPolicy'
import { recipientOf } from './quote'
import { reconcileCommerceOrder } from './administration'
import { providerAdapters } from './providers'
import { commerceRoute, CHECKOUT_SECURITY_HOLD } from './runtime'

const recipient={name:'Offline Customer',email:'test@example.invalid',address1:'1 Fixture Street',city:'Fixture City',zip:'TEST1',country_code:'GB'}
const selection={currency:'GBP',recipient,items:[{variantId:'fixture-variant',quantity:1,price:1,fulfillmentVariantId:'attacker'}],amount:1,shippingMinor:999,taxMinor:0}
test('public configuration fits the existing order GET route and cannot enable runtime checkout',async()=>{
  assert.equal(CHECKOUT_SECURITY_HOLD,true)
  const response=await commerceRoute('/commerce/orders/config','GET',undefined,{})
  assert.equal(response.statusCode,200);const body=JSON.parse(response.body)
  assert.equal(body.checkoutEnabled,false);assert.equal(body.shippingMinor,0);assert.deepEqual(body.destinations,[])
})
for(const[currency,expected]of [['GBP',2500],['EUR',2900],['USD',3200]] as const)test(`${currency}: free shipping, inclusive quote, exact session, signed payment and protected status`,async()=>{
  const h=offlineCheckoutFixture(),q=await h.service.createQuote({...selection,currency},{kind:'guest'})
  const principal={kind:'guest' as const,capability:q.capability}
  assert.equal(q.totalMinor,expected);assert.equal(q.subtotalMinor,expected);assert.equal(q.shippingMinor,0)
  assert.equal(q.pricesIncludeTax,true);assert.equal(q.seller,'Ravens Community')
  assert.equal(h.rows.get(q.id)!.snapshot.merchantShippingMinor,450)
  assert.ok(!('merchantShippingMinor'in q));assert.ok(q.taxMinor>0&&q.taxMinor<expected)
  const session=await h.service.startPayment(q.id,principal);assert.equal(session.totals.totalMinor,expected)
  const order=h.rows.get(q.id)!;assert.equal(h.payments.get(order.paymentId!).amountMinor,expected)
  await h.complete(order.paymentId!);const status=await h.service.status(q.id,principal)
  assert.equal(status.state,'PROVIDER_CONFIRMED');assert.equal(h.calls.filter(c=>c==='create').length,1)
  assert.ok(h.rows.get(q.id)!.fulfillmentAttemptId);assert.ok(h.rows.get(q.id)!.paymentAttemptId)
  assert.ok(!JSON.stringify(status).includes(recipient.email))
  await assert.rejects(h.service.status(q.id,{kind:'guest',capability:'X'.repeat(43)}),/ORDER_NOT_FOUND/)
})
test('ten separate services cannot submit the same payment twice',async()=>{
  const h=offlineCheckoutFixture(),q=await h.service.createQuote(selection,{kind:'customer',sub:'owner'})
  await h.service.startPayment(q.id,{kind:'customer',sub:'owner'});const id=h.rows.get(q.id)!.paymentId!
  h.payments.get(id).state='completed'
  await Promise.allSettled(Array.from({length:10},()=>h.instance().paymentEvent(id)))
  assert.equal(h.calls.filter(c=>c==='create').length,1);assert.equal(h.calls.filter(c=>c==='confirm').length,1)
  await assert.rejects(h.service.status(q.id,{kind:'customer',sub:'another-customer'}),/ORDER_NOT_FOUND/)
})
test('default tax configuration rejects before a usable checkout exists',async()=>{
  await assert.rejects(inclusiveTaxPolicy(TAX_POLICY).destination(recipient),/CUSTOMER_TAX_POLICY_UNCONFIGURED/)
})
test('unsupported destination is rejected before provider costs or payment calls',async()=>{
  const h=offlineCheckoutFixture()
  await assert.rejects(h.service.createQuote({...selection,recipient:{...recipient,country_code:'US',state_code:'CA'}},{kind:'guest'}),/DESTINATION_UNSUPPORTED/)
  assert.equal(h.calls.length,0);assert.equal(h.rows.size,0)
})
test('forged fixture event never calls payment or fulfilment',async()=>{
  const h=offlineCheckoutFixture();await assert.rejects(h.signedEvent('{"order_id":"fake"}','forged'))
  assert.equal(h.calls.length,0)
})
test('partial refund prevents fulfilment and does not claim full repayment to the customer',async()=>{
  const h=offlineCheckoutFixture(),q=await h.service.createQuote(selection,{kind:'customer',sub:'owner'})
  await h.service.startPayment(q.id,{kind:'customer',sub:'owner'});const p=h.payments.get(h.rows.get(q.id)!.paymentId!)
  p.state='completed';p.refundedMinor=100;await h.instance().paymentEvent(p.id)
  const status=await h.service.status(q.id,{kind:'customer',sub:'owner'})
  assert.equal(status.state,'PARTIALLY_REFUNDED');assert.equal(status.refundedMinor,100);assert.equal(h.calls.filter(c=>c==='create').length,0)
})
test('timeout after provider acceptance cannot cause another submission after restart',async()=>{
  const h=offlineCheckoutFixture(),q=await h.service.createQuote(selection,{kind:'customer',sub:'owner'})
  await h.service.startPayment(q.id,{kind:'customer',sub:'owner'});const id=h.rows.get(q.id)!.paymentId!
  const create=h.providers.createOrder;h.providers.createOrder=async(...args)=>{await create(...args);throw Error('Lost provider acknowledgement')}
  await h.complete(id);assert.equal(h.rows.get(q.id)!.state,'RECONCILIATION_REQUIRED')
  await h.instance().paymentEvent(id);await h.instance().reconcile(q.id)
  assert.equal(h.calls.filter(c=>c==='create').length,1)
})
test('stale draft observations after uncertain confirmation never authorise another confirmation POST',async()=>{
  const h=offlineCheckoutFixture(),q=await h.service.createQuote(selection,{kind:'customer',sub:'owner'})
  await h.service.startPayment(q.id,{kind:'customer',sub:'owner'});const id=h.rows.get(q.id)!.paymentId!
  let confirmations=0;h.providers.confirmOrder=async()=>{confirmations++;throw Error('Uncertain confirmation')}
  await h.complete(id);assert.equal(h.rows.get(q.id)!.state,'RECONCILIATION_REQUIRED')
  const attempt=h.rows.get(q.id)!.confirmationAttemptId;assert.ok(attempt)
  await h.instance().reconcile(q.id);await h.instance().reconcile(q.id)
  assert.equal(confirmations,1);assert.equal(h.rows.get(q.id)!.confirmationAttemptId,attempt)
  assert.equal(h.rows.get(q.id)!.state,'RECONCILIATION_REQUIRED')
})
function policy():TaxPolicyConfig{return{seller:'Ravens Community',version:'synthetic-test',approvalReference:'fixture-approval',validFrom:1,validUntil:10000,rules:[{country:'GB',currencies:['GBP'],productIds:['p'],rateBasisPoints:2000,postcodePrefixes:['TEST'],excludedPostcodePrefixes:['TESTX'],reference:'fixture-rule'}]}}
const basis={currency:'GBP' as const,subtotalMinor:100,shippingMinor:0,recipient,lines:[{productId:'p',variantId:'v',syncVariantId:'s',catalogVariantId:1,quantity:1,unitMinor:100,name:'Fixture'}]}
test('approved inclusive policy uses integer rounding, basis binding and explicit product/territory scope',async()=>{
  const adapter=inclusiveTaxPolicy(policy(),()=>100)
  const result=await adapter.tax(basis,'immutable-basis');assert.equal(result.amountMinor,17);assert.equal(result.basisHash,'immutable-basis');assert.equal(result.inclusive,true)
  await assert.rejects(adapter.destination({...recipient,zip:'TESTX1'}),/DESTINATION_UNSUPPORTED/)
  await assert.rejects(adapter.tax({...basis,currency:'EUR'},'hash'),/TAX_TREATMENT_UNSUPPORTED/)
  await assert.rejects(adapter.tax({...basis,lines:[{...basis.lines[0],productId:'unapproved'}]},'hash'),/TAX_TREATMENT_UNSUPPORTED/)
  await assert.rejects(adapter.tax({...basis,shippingMinor:100},'hash'),/INVALID_CUSTOMER_SHIPPING/)
})
test('expired, unapproved and overlapping policies fail closed',async()=>{
  const expired=policy();expired.validUntil=99;await assert.rejects(inclusiveTaxPolicy(expired,()=>100).destination(recipient))
  const unsigned=policy();unsigned.approvalReference='';await assert.rejects(inclusiveTaxPolicy(unsigned,()=>100).destination(recipient))
  const ambiguous=policy();ambiguous.rules.push({...ambiguous.rules[0]});await assert.rejects(inclusiveTaxPolicy(ambiguous,()=>100).tax(basis,'hash'),/TAX_TREATMENT_UNSUPPORTED/)
})
for(const patch of [{quantity:0},{quantity:21},{quantity:1.5},{quantity:1,variantId:'unknown'}])test(`invalid variant/quantity ${JSON.stringify(patch)} creates no order`,async()=>{
  const h=offlineCheckoutFixture();await assert.rejects(h.service.createQuote({...selection,items:[{variantId:'fixture-variant',...patch}]},{kind:'guest'}));assert.equal(h.rows.size,0)
})
test('delivery control characters and state requirements are rejected',()=>{
  assert.throws(()=>recipientOf({...recipient,address1:'bad\naddress'}),/INVALID_ADDRESS/)
  assert.throws(()=>recipientOf({...recipient,country_code:'US'}),/STATE_REQUIRED/)
})

test('V2 administrative reconciliation requires existing effective permission before service access',async()=>{
  const h=offlineCheckoutFixture(),q=await h.service.createQuote(selection,{kind:'customer',sub:'owner'})
  const client={models:{PermissionDefinition:{list:async()=>({data:[{key:'orders.fulfillment.manage',isActive:true}]})},GroupPermission:{list:async()=>({data:[{groupName:'Staff',permissionKey:'orders.fulfillment.manage',enabled:true}]})},PermissionAuditEvent:{create:async(value:any)=>({data:value})}}}
  const event={identity:{username:'fixture-staff',claims:{'cognito:groups':['Staff']}},arguments:{orderId:q.id}}
  const unprivileged={...event,identity:{username:'member',claims:{'cognito:groups':['Member']}}}
  await assert.rejects(reconcileCommerceOrder(unprivileged,client,h.service),/Permission .* required/)
  assert.equal(h.calls.filter(c=>c==='create').length,0)
  const result=await reconcileCommerceOrder(event,client,h.service)
  assert.equal(result.state,'RECONCILIATION_REQUIRED');assert.equal(h.calls.filter(c=>c==='create').length,0)
})

for(const state of ['cancelled','failed'])test(`authoritative ${state} prevents dispatch and remains accurate on replay`,async()=>{
  const h=offlineCheckoutFixture(),q=await h.service.createQuote(selection,{kind:'customer',sub:'owner'})
  await h.service.startPayment(q.id,{kind:'customer',sub:'owner'});const payment=h.payments.get(h.rows.get(q.id)!.paymentId!)
  payment.state=state;await h.instance().paymentEvent(payment.id);await h.instance().paymentEvent(payment.id)
  assert.equal((await h.service.status(q.id,{kind:'customer',sub:'owner'})).state,state==='cancelled'?'CANCELLED':'PAYMENT_FAILED')
  assert.equal(h.calls.filter(c=>c==='create').length,0)
})

test('full refund and pending refund are distinguished from completed partial refunds',async()=>{
  for(const pending of [false,true]){
    const h=offlineCheckoutFixture(),q=await h.service.createQuote(selection,{kind:'customer',sub:'owner'})
    await h.service.startPayment(q.id,{kind:'customer',sub:'owner'});const p=h.payments.get(h.rows.get(q.id)!.paymentId!)
    p.state='completed';p.refundedMinor=pending?0:2500;p.refundPending=pending;await h.instance().paymentEvent(p.id)
    assert.equal(h.rows.get(q.id)!.state,pending?'RECONCILIATION_REQUIRED':'REFUNDED');assert.equal(h.calls.filter(c=>c==='create').length,0)
  }
})

test('Printful packing-slip amounts do not add embedded tax or absorbed shipping twice',async()=>{
  const h=offlineCheckoutFixture(),q=await h.service.createQuote(selection,{kind:'guest'}),snapshot=h.rows.get(q.id)!.snapshot
  let payload:any
  const adapters=providerAdapters({printfulKey:'offline-key',revolutKey:'offline-key',environment:'sandbox',transport:async(_url,init)=>{
    payload=JSON.parse(String(init.body));return new Response(JSON.stringify({result:{id:123,external_id:q.id,status:'draft',recipient:snapshot.recipient,items:[{sync_variant_id:'fixture-sync',quantity:1}]}}),{status:200})
  }})
  await adapters.createOrder(q.id,snapshot)
  assert.equal(payload.items[0].retail_price,'25.00');assert.equal(payload.retail_costs.shipping,'0.00');assert.equal(payload.retail_costs.tax,'0.00');assert.equal(payload.retail_costs.vat,'0.00')
  assert.ok(snapshot.taxMinor>0);assert.equal(snapshot.totalMinor,2500)
})

for(const refundState of ['pending','completed','failed'])test(`Revolut ${refundState} refund is verified against its original payment`,async()=>{
  const adapter=providerAdapters({printfulKey:'offline',revolutKey:'offline',environment:'sandbox',transport:async url=>new Response(JSON.stringify(url.endsWith('/refund')?
    {id:'refund',type:'refund',state:refundState,amount:100,currency:'GBP',related_order_id:'payment'}:
    {id:'payment',type:'payment',state:'completed',amount:2500,currency:'GBP',refunded_amount:0,merchant_order_ext_ref:'fixture'}),{status:200})})
  const observed=await adapter.payment('refund');assert.equal(observed.id,'payment');assert.equal(observed.triggerId,'refund')
  assert.equal(observed.refundedMinor,refundState==='completed'?100:0);assert.equal(observed.refundPending,refundState==='pending')
})
