// Capabilities live only in this checkout closure. Never URLs, storage or logs.
export function createSecureCheckout({ baseUrl, request = fetch, accessToken = async () => undefined }) {
  let current = null
  let creation = null
  let quoting = null
  let generation = 0
  async function call(path, method, body, capability) {
    const token = await accessToken()
    const response = await request(`${baseUrl.replace(/\/+$/, '')}${path}`, {
      method, cache: 'no-store', headers: { 'Content-Type': 'application/json',
        ...(capability ? { Authorization: `Guest ${capability}` } : token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(({
      CHECKOUT_SECURITY_HOLD:'Checkout is temporarily unavailable.',
      PRICE_NOT_CONFIGURED:'An item has no configured price in this currency. Choose another currency.',
      DESTINATION_UNSUPPORTED:'This delivery destination is not supported. Please contact support.',
      TAX_TREATMENT_UNSUPPORTED:'Checkout is not available for this destination and selection. Please contact support.',
    })[data.error] || 'Unable to process this order securely. Please contact support.')
    return data
  }
  function selectionOf(items, recipient, currency) {
    return { currency, items: items.map(({ variantId, quantity }) => ({ variantId, quantity })), recipient }
  }
  async function quoteOrder(items, recipient, currency = 'GBP') {
    const selection = selectionOf(items, recipient, currency), key = JSON.stringify(selection)
    if (current?.paymentStarted && (current.key !== key || current.expiresAt <= Date.now())) throw new Error('A payment session already exists. Check its status before starting another order.')
    if (current?.key === key && current.expiresAt > Date.now()) return current.totals
    if (quoting) {
      if (quoting.key !== key) throw new Error('Order details changed. Wait for the current quote to finish.')
      return quoting.promise
    }
    const requestGeneration = generation
    const promise = call('/commerce/quotes', 'POST', selection).then(result => {
      if (generation !== requestGeneration) throw new Error('Order details changed. Please review your basket again.')
      current = { id: result.id, capability: result.capability, expiresAt: result.expiresAt, key, totals: result }
      return result
    }).finally(() => { quoting = null })
    quoting = { key, promise }
    return promise
  }
  return {
    quote: quoteOrder,
    start(items, recipient, currency = 'GBP') {
      if (creation) return creation
      creation = (async () => {
        await quoteOrder(items, recipient, currency)
        current.paymentStarted = true
        const session = await call(`/commerce/orders/${current.id}/payment`, 'POST', {}, current.capability)
        return { id: current.id, token: session.token, totals: session.totals }
      })().finally(() => { creation = null })
      return creation
    },
    async status(orderId) {
      if (orderId && orderId !== current?.id) {
        if (!/^cr_[a-f0-9-]{36}$/.test(orderId)) throw new Error('Enter a valid order reference.')
        // An order reference is only a lookup key: backend Cognito ownership is still required.
        return call(`/commerce/orders/${orderId}`, 'GET')
      }
      if (!current) throw new Error('Order access is unavailable in this browser session.')
      return call(`/commerce/orders/${current.id}`, 'GET', undefined, current.capability)
    },
    async revoke() {
      if (current) await call(`/commerce/orders/${current.id}/revoke`, 'POST', {}, current.capability)
      current = null
    },
    reset() { generation++; current = null },
  }
}

export function statusMessage(state) {
  return ({ PENDING_PAYMENT: 'Awaiting verified payment.', PAYMENT_UNKNOWN: 'Payment is being reconciled. Do not pay again.',
    PAYMENT_VERIFIED: 'Payment verified. Preparing your order.', FULFILMENT_CLAIMED: 'Your order is being submitted.',
    PROVIDER_ORDER_CREATED: 'Your order is awaiting production confirmation.', PROVIDER_CONFIRMING: 'Production confirmation is being checked.',
    PROVIDER_CONFIRMED: 'Your order has been accepted for production.', SHIPPED: 'Your order has shipped.',
    PAYMENT_FAILED: 'Payment failed.', CANCELLED: 'Your order was cancelled.', REFUNDED: 'Your payment has been refunded.', PARTIALLY_REFUNDED: 'Part of your payment has been refunded. Your order is held for review.',
    RECONCILIATION_REQUIRED: 'Your order needs review. Please contact support.' })[state] || 'Your order is awaiting verification.'
}
