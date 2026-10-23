import { CommerceError, Providers, ProviderOrder, Snapshot } from './contracts'
import { minorUnits } from './quote'
import { decimalPrice } from './currencies'

type Transport = (url: string, init: RequestInit) => Promise<Response>
export function providerAdapters(config: { printfulKey: string; revolutKey: string; environment: Snapshot['environment']; tax?: Providers['tax']; destination?: Providers['destination']; transport?: Transport }): Providers {
  const transport = config.transport || fetch
  const revolut = config.environment === 'production' ? 'https://merchant.revolut.com' : 'https://sandbox-merchant.revolut.com'
  async function call(provider: 'printful' | 'revolut', method: string, path: string, body?: unknown, missing = false): Promise<any> {
    const key = provider === 'printful' ? config.printfulKey : config.revolutKey
    if (!key) throw new CommerceError('PROVIDER_NOT_CONFIGURED', 503)
    const response = await transport((provider === 'printful' ? 'https://api.printful.com' : revolut) + path, {
      method, signal: AbortSignal.timeout(8000), headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json',
        ...(provider === 'revolut' ? { 'Revolut-Api-Version': '2026-04-20' } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
    if (missing && response.status === 404) return undefined
    if (!response.ok) throw new CommerceError('PROVIDER_UNAVAILABLE', 503)
    const data = await response.json()
    return provider === 'printful' ? data.result : data
  }
  function normalizeOrder(result: any): ProviderOrder {
    if (!result?.id || !Array.isArray(result.items) || !result.recipient) throw new CommerceError('INVALID_PROVIDER_ORDER')
    return { id: String(result.id), reference: result.external_id, status: result.status, recipient: result.recipient,
      lines: result.items.map((i: any) => ({ syncVariantId: String(i.sync_variant_id), quantity: i.quantity })) }
  }
  return {
    destination: config.destination,
    async syncVariant(id) {
      const result = await call('printful', 'GET', `/store/variants/${encodeURIComponent(id)}`)
      const v = result?.sync_variant
      return { id: String(v?.id), catalogVariantId: v?.variant_id, productId: String(v?.sync_product_id),
        active: v?.synced === true && v?.is_ignored !== true && v?.discontinued !== true && v?.out_of_stock !== true }
    },
    async shipping(lines, recipient, currency) {
      const rates = await call('printful', 'POST', '/shipping/rates', { recipient, currency,
        items: lines.map(l => ({ variant_id: l.catalogVariantId, quantity: l.quantity, value: decimalPrice(l.unitMinor, currency) })) })
      const rate = Array.isArray(rates) && rates.find(r => r.id === 'STANDARD' && r.currency === currency)
      if (!rate) throw new CommerceError('SHIPPING_UNAVAILABLE', 503)
      return { currency: rate.currency, method: rate.id, amountMinor: minorUnits(rate.rate) }
    },
    tax: config.tax || (async () => { throw new CommerceError('CUSTOMER_TAX_POLICY_UNCONFIGURED', 503) }),
    async createPayment(id, snapshot) {
      // One durable CREATING claim per internal order. No retry after uncertain response.
      const result = await call('revolut', 'POST', '/api/orders', { amount: snapshot.totalMinor, currency: snapshot.currency,
        capture_mode: 'automatic', merchant_order_ext_ref: id, description: 'Project Respawn merchandise' })
      return { id: result.id, token: result.token }
    },
    async payment(id) {
      let result = await call('revolut', 'GET', `/api/orders/${encodeURIComponent(id)}`)
      if (result.id !== id) throw new CommerceError('INVALID_PAYMENT_RESPONSE')
      let triggerId: string | undefined, refundMinor = 0, refundPending = false
      if (result.type === 'refund') {
        const original = result.related_order_id
        const refundCurrency = result.currency
        if (typeof original !== 'string' || !Number.isSafeInteger(result.amount)) throw new CommerceError('INVALID_REFUND_RESPONSE')
        triggerId = id
        if (result.state === 'completed') refundMinor = result.amount
        else if (!['failed','cancelled'].includes(result.state)) refundPending = true
        result = await call('revolut', 'GET', `/api/orders/${encodeURIComponent(original)}`)
        if (result.id !== original || result.currency !== refundCurrency) throw new CommerceError('INVALID_REFUND_RESPONSE')
      }
      if (!Number.isSafeInteger(result.amount) || result.amount <= 0 || !Number.isSafeInteger(result.refunded_amount) || result.refunded_amount < 0 || result.refunded_amount > result.amount || refundMinor > result.amount || result.type !== 'payment') throw new CommerceError('INVALID_PAYMENT_RESPONSE')
      return { id: result.id, reference: result.merchant_order_ext_ref, environment: config.environment,
        currency: result.currency, amountMinor: result.amount, state: result.state, refundedMinor: Math.max(result.refunded_amount, refundMinor), refundPending, ...(triggerId ? { triggerId } : {}) }
    },
    async findOrder(id) {
      const result = await call('printful', 'GET', `/orders/${encodeURIComponent('@' + id)}`, undefined, true)
      return result ? normalizeOrder(result) : undefined
    },
    async createOrder(id, snapshot) {
      return normalizeOrder(await call('printful', 'POST', '/orders?confirm=0', { external_id: id, shipping: snapshot.shippingMethod,
        recipient: snapshot.recipient, items: snapshot.lines.map(l => ({ sync_variant_id: l.syncVariantId, quantity: l.quantity, retail_price: decimalPrice(l.unitMinor, snapshot.currency) })),
        retail_costs: { currency: snapshot.currency, shipping: decimalPrice(snapshot.shippingMinor, snapshot.currency), // tax/vat here mean amounts NOT already in retail_price. Embedded tax remains in our snapshot.
          tax: snapshot.pricingModel === 'inclusive-free-shipping-v1' ? '0.00' : decimalPrice(snapshot.taxMinor, snapshot.currency),
          ...(snapshot.pricingModel === 'inclusive-free-shipping-v1' ? { vat:'0.00' } : {}) } }))
    },
    async confirmOrder(id) { return normalizeOrder(await call('printful', 'POST', `/orders/${encodeURIComponent(id)}/confirm`)) },
  }
}
