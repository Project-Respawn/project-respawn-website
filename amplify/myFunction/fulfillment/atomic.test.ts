import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createAtomicDispatcher } from './index'
import { acquireFulfillmentClaim, completeFulfillmentClaim } from './claim'
import { assertStoredOrderSafe } from './security'
import { conditionMatches } from './claimTestStore'
import { decodeFulfillmentOrder } from './orderJson'
import { REVOLUT_MODE } from '../config/env'
import { handleRevolutWebhook, signRevolutWebhook } from '../revolut/webhook'
import { handleRecoverManagedOrder, handleReconcileManagedOrder, prepareManagedOrders } from '../stage9/handlers'
import * as printful from '../printful/handlers'
const fallback = typeof (printful as any).lookupPrintfulOrder === 'function'
const prod = { skip: REVOLUT_MODE !== 'prod' }
let sequence=0
export function fixture(participants=1) {
 let row:any={id:'claim-'+(++sequence),projectOrderId:'PR-offline',revolutOrderId:'rev-offline',environment:'production',paymentStatus:'completed',paymentAmount:20,currency:'GBP',customerName:'Offline',email:'test@example.invalid',shippingAddress:{address:'Stored',city:'London',country:'GB',postcode:'TEST'},items:[{productId:'p',variantId:'v',fulfillmentProvider:'printful',fulfillmentVariantId:'sync',quantity:1,unitPrice:20}],providerStatuses:{},auditHistory:[],overallFulfillmentStatus:'pending',updatedAt:'2026-01-01T00:00:00.000Z'}
 let queue:Promise<any>=Promise.resolve(),arrivals=0,release:()=>void=()=>{},calls=0,lookups=0,claims=0,finish=0
 const ready=new Promise<void>(r=>release=r);if(participants===1)release()
 const state:any={failure:'',attempts:[]}
 const client:any={models:{FulfillmentOrder:{get:async()=>({data:structuredClone(row)}),list:async()=>({data:[structuredClone(row)]}),update:async(input:any)=>{row={...row,...input};return{data:structuredClone(row)}}},MerchProduct:{get:async()=>({data:{id:'p',sourceType:'printful'}})},MerchProductVariant:{get:async()=>({data:{productId:'p',externalVariantId:'sync',currency:'GBP',retailPrice:20}})},PermissionDefinition:{list:async()=>({data:[{key:'orders.fulfillment.manage',isActive:true}]})},GroupPermission:{list:async()=>({data:[{groupName:'Staff',permissionKey:'orders.fulfillment.manage',enabled:true}]})},PermissionAuditEvent:{create:async(v:any)=>({data:v})}}}
 client.graphql=async(request:any)=>{
  assert.equal(request.authMode,'iam');assert.ok(request.query.includes('condition: $condition'))
  const {input,condition}=request.variables;assert.ok(condition)
  const acquire=String(input.overallFulfillmentStatus).startsWith('fulfillment_claimed:')
  if(acquire){state.attempts.push(input.overallFulfillmentStatus);if(++arrivals===participants)release();await ready}
  const work=queue.then(()=>{
   if(acquire&&state.failure==='acquireReject')return{errors:[{errorType:'DynamoDB:ConditionalCheckFailedException'}]}
   if(acquire&&state.failure==='acquireThrowBefore')throw Error('offline transport error')
   if(!conditionMatches(row,condition))return{errors:[{errorType:'DynamoDB:ConditionalCheckFailedException'}]}
   const completion=input.overallFulfillmentStatus==='fulfilled'
   if(completion&&state.failure==='completionBefore')return{errors:[{errorType:'OfflineBackendFailure'}]}
   if(String(input.overallFulfillmentStatus).startsWith('reconciliation_required:')&&state.failure==='holdFailure')return{errors:[{errorType:'OfflineBackendFailure'}]}
   row={...row,...input};if(acquire)claims++;if(completion)finish++
   if(acquire&&state.failure==='claimCommercialChange')row.paymentAmount=999
   if((acquire&&state.failure==='acquireLostAck')||(completion&&state.failure==='completionLostAck'))throw Error('offline lost response')
   return{data:{updateFulfillmentOrder:structuredClone(row)}}
  });queue=work.catch(()=>undefined);return work
 }
 const fetchPayment=async()=>({statusCode:200,body:{id:'rev-offline',merchant_order_ext_ref:'PR-offline',state:'completed',amount:2000,currency:'GBP'}})
 const deps:any={getClient:async()=>client,fetchPayment,fulfillmentEnabled:()=>true,
  createPrintful:async(body:any)=>{calls++;assert.ok(String(row.overallFulfillmentStatus).startsWith('fulfillment_claimed:'));assert.equal(body.address,'Stored');return{statusCode:200,body:{result:{id:'provider-offline'}}}},
  lookupPrintful:async()=>{lookups++;return{statusCode:200,body:{result:{id:'provider-offline',external_id:'PR-offline'}}}}
 }
 return{client,deps,fetchPayment,state,get row(){return row},set row(v:any){row=v},get calls(){return calls},get lookups(){return lookups},get claims(){return claims},get finish(){return finish},status:()=>decodeFulfillmentOrder(row).providerStatuses.printful}
}
for(const participants of [2,10])test(participants+' independent instances acquire only one persistent claim and submit once',prod,async()=>{
 const h=fixture(participants);const outcomes=await Promise.allSettled(Array.from({length:participants},()=>createAtomicDispatcher()(h.row,h.deps)))
 assert.equal(h.claims,1);assert.equal(h.calls,1);assert.equal(h.finish,1);assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,1)
 assert.equal(new Set(h.state.attempts).size,participants);assert.match(h.status().attemptId,/^[0-9a-f-]{36}$/);assert.equal(h.status().claimState,'fulfilled')
 assert.equal(h.lookups,fallback?1:0)
})
test('signed webhook and permission-checked admin recovery race through the same conditional claim',prod,async()=>{
 const h=fixture(2),now=Date.now(),timestamp=String(now),secret='offline-signature-only',body=JSON.stringify({event:'ORDER_COMPLETED',order_id:'rev-offline'})
 const event={body,headers:{'Revolut-Request-Timestamp':timestamp,'Revolut-Signature':signRevolutWebhook(body,timestamp,secret)}}
 const webhook=handleRevolutWebhook(event,{getClient:async()=>h.client,fetchOrder:h.fetchPayment,now:()=>now,signingSecret:secret,dispatch:o=>createAtomicDispatcher()(o,h.deps)})
 const admin=handleRecoverManagedOrder({identity:{username:'staff',claims:{'cognito:groups':['Staff']}},arguments:{orderId:h.row.id}},h.client,(o:any)=>createAtomicDispatcher()(o,h.deps))
 await Promise.allSettled([webhook,admin]);assert.equal(h.claims,1);assert.equal(h.calls,1)
})
test('timeout keeps attempt ID and blocks a new runtime from resubmitting',prod,async()=>{
 const h=fixture();let timeouts=0;h.deps.createPrintful=async()=>{timeouts++;throw Error('offline timeout')}
 await assert.rejects(createAtomicDispatcher()(h.row,h.deps),/reconcile before retry/)
 const id=h.status().attemptId;assert.equal(h.status().claimState,'reconciliation_required');assert.ok(h.row.overallFulfillmentStatus.endsWith(id))
 await assert.rejects(createAtomicDispatcher()(h.row,h.deps),/reconciliation/);assert.equal(h.status().attemptId,id);assert.equal(h.claims,1);assert.equal(timeouts,1)
})
test('provider success followed by persistence failure never permits another submission',prod,async()=>{
 const h=fixture();h.state.failure='completionBefore';await assert.rejects(createAtomicDispatcher()(h.row,h.deps),/reconcile before retry/)
 const id=h.status().attemptId;await assert.rejects(createAtomicDispatcher()(h.row,h.deps),/reconciliation/);assert.equal(h.calls,1);assert.equal(h.status().attemptId,id)
})
test('crash after claim and before provider call survives arbitrarily old timestamps',prod,async()=>{
 const h=fixture();const validated=await assertStoredOrderSafe(h.row,h.client,h.fetchPayment);const claim=await acquireFulfillmentClaim(h.client,validated)
 h.row.providerStatuses=JSON.stringify({printful:{...claim.statuses.printful,lastAttempt:'2000-01-01T00:00:00.000Z'}})
 await assert.rejects(createAtomicDispatcher()(h.row,h.deps),/Persistent fulfilment claim/);assert.equal(h.calls,0);assert.equal(h.claims,1)
})
test('duplicate valid signed webhooks do not repeat a completed provider operation',prod,async()=>{
 const h=fixture(),now=Date.now(),timestamp=String(now),secret='offline-signature-only',body=JSON.stringify({event:'ORDER_COMPLETED',order_id:'rev-offline'})
 const event={body,headers:{'Revolut-Request-Timestamp':timestamp,'Revolut-Signature':signRevolutWebhook(body,timestamp,secret)}}
 const deps={getClient:async()=>h.client,fetchOrder:h.fetchPayment,now:()=>now,signingSecret:secret,dispatch:(o:any)=>createAtomicDispatcher()(o,h.deps)}
 assert.equal((await handleRevolutWebhook(event,deps)).statusCode,204);assert.equal((await handleRevolutWebhook(event,deps)).statusCode,204);assert.equal(h.calls,1)
})
test('existing fulfilled order with provider ID remains fulfilled without claim',prod,async()=>{const h=fixture();h.row.providerStatuses={printful:{status:'fulfilled',providerOrderId:'existing'}};h.row.overallFulfillmentStatus='fulfilled';await createAtomicDispatcher()(h.row,h.deps);assert.equal(h.claims,0);assert.equal(h.calls,0)})
test('uncertain legacy attempts and missing fulfilled IDs remain held',prod,async()=>{for(const p of [{status:'failed'},{status:'pending',lastAttempt:'old'},{status:'pending',attemptId:'old'},{status:'fulfilled'},{status:'test_skipped'}]){const h=fixture();h.row.providerStatuses={printful:p};await assert.rejects(createAtomicDispatcher()(h.row,h.deps));assert.equal(h.claims,0);assert.equal(h.calls,0)}})
for(const failure of ['acquireReject','acquireThrowBefore','acquireLostAck'])test('conditional/backend failure '+failure+' never calls provider or retries in the attempt',prod,async()=>{
 const h=fixture();h.state.failure=failure;const dispatcher=createAtomicDispatcher();await assert.rejects(dispatcher(h.row,h.deps));await assert.rejects(dispatcher(h.row,h.deps));assert.equal(h.calls,0);assert.equal(h.state.attempts.length,1)
 if(failure==='acquireLostAck'){await assert.rejects(createAtomicDispatcher()(h.row,h.deps),/Persistent fulfilment claim/);assert.equal(h.claims,1)}
})
test('completion response lost after commit cannot overwrite successful status',prod,async()=>{const h=fixture();h.state.failure='completionLostAck';await assert.rejects(createAtomicDispatcher()(h.row,h.deps));assert.equal(h.row.overallFulfillmentStatus,'fulfilled');const id=h.status().attemptId;await createAtomicDispatcher()(h.row,h.deps);assert.equal(h.calls,1);assert.equal(h.status().attemptId,id)})
test('claim response is revalidated before using its merchandise/payment fields',prod,async()=>{const h=fixture();h.state.failure='claimCommercialChange';await assert.rejects(createAtomicDispatcher()(h.row,h.deps));assert.equal(h.calls,0);assert.equal(h.status().claimState,'reconciliation_required')})
test('ownership conditions prevent completion of a different attempt',prod,async()=>{const h=fixture();const claim=await acquireFulfillmentClaim(h.client,await assertStoredOrderSafe(h.row,h.client,h.fetchPayment));h.row.overallFulfillmentStatus='fulfillment_claimed:other-owner';await assert.rejects(completeFulfillmentClaim(h.client,claim,'fake'));assert.equal(h.row.overallFulfillmentStatus,'fulfillment_claimed:other-owner');assert.equal(h.finish,0)})
test('missing conditional transport fails closed without model-update fallback',prod,async()=>{const h=fixture();delete h.client.graphql;await assert.rejects(createAtomicDispatcher()(h.row,h.deps),/transport unavailable/);assert.equal(h.calls,0);assert.equal(h.claims,0)})
test('known duplicate legacy records are held before a claim or provider submission',prod,async()=>{const h=fixture();h.client.models.FulfillmentOrder.list=async()=>({data:[structuredClone(h.row),{...structuredClone(h.row),id:'duplicate-internal-record'}]});await assert.rejects(createAtomicDispatcher()(h.row,h.deps),/Duplicate or uncertain legacy/);assert.equal(h.calls,0);assert.equal(h.claims,0)})
test('null and absent scalar status snapshots use atomic absence/null conditions',prod,async()=>{for(const value of [null,undefined]){const h=fixture();h.row.overallFulfillmentStatus=value;h.row.updatedAt=value;await createAtomicDispatcher()(h.row,h.deps);assert.equal(h.calls,1);assert.equal(h.claims,1)}})
test('fallback provider confirmation disagreement retains the unique attempt', {skip:REVOLUT_MODE!=='prod'||!fallback},async()=>{const h=fixture();h.deps.lookupPrintful=async()=>({statusCode:200,body:{result:{id:'different',external_id:'PR-offline'}}});await assert.rejects(createAtomicDispatcher()(h.row,h.deps));const id=h.status().attemptId;await assert.rejects(createAtomicDispatcher()(h.row,h.deps));assert.equal(h.calls,1);assert.equal(h.status().attemptId,id)})
test('generated resolver attaches input condition to one DynamoDB UpdateItem and propagates errors',()=>{
 const request=fs.readFileSync(new URL('./fixtures/claim-request.vtl', import.meta.url),'utf8')
 const response=fs.readFileSync(new URL('./fixtures/claim-response.vtl', import.meta.url),'utf8')
 assert.ok(request.includes('$ctx.stash.conditions.add($args.condition)'));assert.ok(request.includes('toDynamoDBConditionExpression($mergedConditions)'));assert.ok(request.includes('"operation": "UpdateItem"'));assert.ok(request.includes('$UpdateItem.put("condition", $Conditions)'));assert.ok(response.includes('$util.error($ctx.error.message, $ctx.error.type)'))
})

test('owned completion preserves concurrently appended webhook audit history',prod,async()=>{const h=fixture();const create=h.deps.createPrintful;h.deps.createPrintful=async(body:any)=>{const result=await create(body);const audit=decodeFulfillmentOrder(h.row).auditHistory;h.row.auditHistory=JSON.stringify([...audit,{action:'Concurrent webhook audit'}]);return result};await createAtomicDispatcher()(h.row,h.deps);assert.ok(decodeFulfillmentOrder(h.row).auditHistory.some((a:any)=>a.action==='Concurrent webhook audit'));assert.equal(h.calls,1)})
test('reconciliation hold preserves concurrently appended webhook audit history',prod,async()=>{const h=fixture();h.deps.createPrintful=async()=>{const audit=decodeFulfillmentOrder(h.row).auditHistory;h.row.auditHistory=JSON.stringify([...audit,{action:'Concurrent webhook audit'}]);throw Error('offline timeout')};await assert.rejects(createAtomicDispatcher()(h.row,h.deps));assert.ok(decodeFulfillmentOrder(h.row).auditHistory.some((a:any)=>a.action==='Concurrent webhook audit'));assert.equal(h.status().claimState,'reconciliation_required')})

test('claimed pending orders remain visible in existing managed-order listing',prod,async()=>{const h=fixture();await acquireFulfillmentClaim(h.client,await assertStoredOrderSafe(h.row,h.client,h.fetchPayment));const visible=prepareManagedOrders([h.row]);assert.equal(visible.length,1);assert.equal(visible[0].id,h.row.id)})
test('administrative payment reconciliation cannot clear an existing fulfilment claim',prod,async()=>{const h=fixture();await acquireFulfillmentClaim(h.client,await assertStoredOrderSafe(h.row,h.client,h.fetchPayment));const token=h.row.overallFulfillmentStatus,id=h.status().attemptId;await handleReconcileManagedOrder({identity:{username:'staff',claims:{'cognito:groups':['Staff']}},arguments:{orderId:h.row.id}},h.client,h.fetchPayment);assert.equal(h.row.overallFulfillmentStatus,token);assert.equal(h.status().attemptId,id);await assert.rejects(createAtomicDispatcher()(h.row,h.deps),/Persistent fulfilment claim/);assert.equal(h.calls,0)})

test('stale pre-claim reads after restart cannot overwrite completed or uncertain state',prod,async()=>{
 for(const timeout of [false,true]){const h=fixture();const stale=structuredClone(h.row);const create=h.deps.createPrintful;if(timeout)h.deps.createPrintful=async(body:any)=>{await create(body);throw Error('offline lost provider response')};
  const first=createAtomicDispatcher()(h.row,h.deps);if(timeout)await assert.rejects(first);else await first;
  const owner=h.status().attemptId,overall=h.row.overallFulfillmentStatus;h.client.models.FulfillmentOrder.get=async()=>({data:structuredClone(stale)});
  await assert.rejects(createAtomicDispatcher()(stale,h.deps),/Conditional write rejected or uncertain/);assert.equal(h.calls,1);assert.equal(h.claims,1);assert.equal(h.status().attemptId,owner);assert.equal(h.row.overallFulfillmentStatus,overall);
 }
})
