import { createHmac } from 'node:crypto'
import { createCommerce } from '../../amplify/myFunction/commerce/service'
import { commerceHttp } from '../../amplify/myFunction/commerce/http'
import { inclusiveTaxPolicy, TaxPolicyConfig } from '../../amplify/myFunction/commerce/taxPolicy'
import type { Ledger, Order, Providers, ProviderOrder } from '../../amplify/myFunction/commerce/contracts'

/** In-memory, synthetic test data ONLY. No AWS client, credentials or provider transport. */
export function offlineCheckoutFixture() {
  const rows = new Map<string, Order>(), payments = new Map<string, any>(), providerOrders = new Map<string, ProviderOrder>()
  const calls: string[] = [], now = Date.now
  const policy: TaxPolicyConfig = { seller: 'Ravens Community', version: 'MOCK-NOT-A-TAX-OPINION', approvalReference: 'offline-fixture',
    validFrom: 0, validUntil: now() + 86400_000, rules: [{ country: 'GB', currencies: ['GBP','EUR','USD'], productIds: ['fixture-shirt'],
      postcodePrefixes: ['TEST'], excludedPostcodePrefixes: [], rateBasisPoints: 2000, reference: 'synthetic-only' }] }
  const tax = inclusiveTaxPolicy(policy)
  const copy = <T>(x:T):T => structuredClone(x)
  const ledger: Ledger = {
    async get(id) { return copy(rows.get(id)) },
    async create(order) { if(rows.has(order.id))return false;rows.set(order.id,copy(order));return true },
    async replace(previous,next) { const current=rows.get(previous.id);if(!current||current.version!==previous.version||current.snapshotHash!==previous.snapshotHash)return false;rows.set(next.id,copy(next));return true },
  }
  const providers: Providers = {
    destination: tax.destination, tax: tax.tax,
    async syncVariant(){return{id:'fixture-sync',catalogVariantId:123,productId:'fixture-pf-product',active:true}},
    async shipping(_lines,_recipient,currency){calls.push('shipping-estimate');return{currency,method:'STANDARD',amountMinor:450}},
    async createPayment(id,snapshot){calls.push('payment');const payment={id:'fixture-payment-'+id,reference:id,environment:'sandbox',currency:snapshot.currency,amountMinor:snapshot.totalMinor,state:'pending',refundedMinor:0};payments.set(payment.id,payment);return{id:payment.id,token:payment.id}},
    async payment(id){const p=payments.get(id);if(!p)throw Error('Unknown fixture payment');return copy(p)},
    async findOrder(id){calls.push('lookup');return copy(providerOrders.get(id))},
    async createOrder(id,snapshot){calls.push('create');const p:ProviderOrder={id:'fixture-provider-'+id,reference:id,status:'draft',recipient:copy(snapshot.recipient),lines:snapshot.lines.map(l=>({syncVariantId:l.syncVariantId,quantity:l.quantity}))};providerOrders.set(id,copy(p));return p},
    async confirmOrder(id){calls.push('confirm');const found=[...providerOrders.values()].find(p=>p.id===id);if(!found)throw Error('Missing fixture order');found.status='pending';return copy(found)},
  }
  const catalogue = {
    async product(id:string){return id==='fixture-shirt'?{name:'Project Respawn Fixture Shirt',active:true,provider:'printful',providerProductId:'fixture-pf-product'}:undefined},
    async variant(id:string){return id==='fixture-variant'?{productId:'fixture-shirt',syncVariantId:'fixture-sync',currencyPrices:{GBP:2500,EUR:2900,USD:3200},active:true}:undefined},
  }
  const instance=()=>createCommerce({ledger,catalogue,providers,environment:'sandbox',confirmEnabled:true})
  const service=instance(), http=commerceHttp(service,async token=>{if(token!=='fixture-customer')throw Error('Invalid fixture authentication');return'fixture-customer-sub'},true)
  const secret='offline-only-signing-secret'
  // A signed fixture callback verifies its bytes before calling the normal payment state machine.
  async function signedEvent(raw:string,signature:string){const expected=createHmac('sha256',secret).update(raw).digest('hex');if(signature!==expected)throw Error('Invalid fixture signature');return instance().paymentEvent(JSON.parse(raw).order_id)}
  async function complete(id:string){const payment=payments.get(id);if(!payment)throw Error('Unknown fixture payment');payment.state='completed';const raw=JSON.stringify({order_id:id});return signedEvent(raw,createHmac('sha256',secret).update(raw).digest('hex'))}
  return{rows,payments,providerOrders,calls,providers,catalogue,ledger,service,instance,http,complete,signedEvent}
}
