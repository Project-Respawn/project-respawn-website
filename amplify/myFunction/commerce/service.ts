import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { Catalogue, CommerceError, Ledger, Order, Principal, ProviderOrder, Providers, Snapshot, State } from './contracts'
import { digest, quote } from './quote'

const AFTER_CREATION = new Set<State>(['PROVIDER_ORDER_CREATED', 'PROVIDER_CONFIRMING', 'PROVIDER_CONFIRMED', 'SHIPPED'])
export function createCommerce(deps: { ledger: Ledger; catalogue: Catalogue; providers: Providers; environment: Snapshot['environment']; now?: () => number; confirmEnabled?: boolean;
  audit?: (event: { id: string; state: State; version: number }) => void }) {
  const { ledger, providers } = deps, now = deps.now || Date.now
  async function load(id: string) {
    if (!/^cr_[a-f0-9-]{36}$/.test(id)) throw new CommerceError('ORDER_NOT_FOUND', 404)
    const order = await ledger.get(id)
    if (!order) throw new CommerceError('ORDER_NOT_FOUND', 404)
    if (order.snapshot.environment !== deps.environment || digest(order.snapshot) !== order.snapshotHash) throw new CommerceError('ORDER_INTEGRITY_ERROR')
    return order
  }
  function authorize(order: Order, principal: Principal) {
    if ('sub' in order.owner) {
      if (principal.kind === 'customer' && principal.sub === order.owner.sub) return
    } else if (principal.kind === 'guest' && !order.owner.revoked && order.owner.expiresAt > now() &&
        typeof principal.capability === 'string' && /^[A-Za-z0-9_-]{43}$/.test(principal.capability)) {
      const actual = Buffer.from(digest(principal.capability)), expected = Buffer.from(order.owner.capabilityHash)
      if (actual.length === expected.length && timingSafeEqual(actual, expected)) return
    }
    throw new CommerceError('ORDER_NOT_FOUND', 404)
  }
  async function change(previous: Order, patch: Partial<Order>) {
    const next: Order = { ...previous, ...patch, version: previous.version + 1, updatedAt: now() }
    if (!await ledger.replace(previous, next)) throw new CommerceError('ORDER_BUSY')
    deps.audit?.({ id: next.id, state: next.state, version: next.version })
    return next
  }
  function publicOrder(order: Order) {
    return { id: order.id, state: order.state, currency: order.snapshot.currency,
      subtotalMinor: order.snapshot.subtotalMinor, shippingMinor: order.snapshot.shippingMinor, taxMinor: order.snapshot.taxMinor,
      totalMinor: order.snapshot.totalMinor, seller: order.snapshot.seller || 'Ravens Community', pricesIncludeTax: order.snapshot.pricingModel === 'inclusive-free-shipping-v1', refundedMinor: order.refundedMinor || 0, expiresAt: order.snapshot.expiresAt,
      items: order.snapshot.lines.map(line => ({ variantId: line.variantId, name: line.name, quantity: line.quantity, unitMinor: line.unitMinor })) }
  }
  function paymentMatches(order: Order, payment: Awaited<ReturnType<Providers['payment']>>) {
    const s = order.snapshot
    return Number.isSafeInteger(payment.refundedMinor) && payment.refundedMinor >= 0 && payment.refundedMinor <= s.totalMinor && payment.reference === order.id && payment.environment === s.environment && payment.currency === s.currency && payment.amountMinor === s.totalMinor
  }
  function providerMatches(order: Order, provider: ProviderOrder) {
    const s = order.snapshot
    const lines = (items: { syncVariantId: string; quantity: number }[]) => JSON.stringify(items.map(i => [i.syncVariantId, i.quantity]).sort())
    return provider.reference === order.id && !!provider.id && lines(provider.lines) === lines(s.lines) &&
      ['name', 'email', 'address1', 'city', 'zip', 'country_code', 'state_code'].every(k =>
        String((provider.recipient as any)[k] || '').trim() === String((s.recipient as any)[k] || '').trim())
  }
  async function recordProvider(order: Order, result: ProviderOrder) {
    if (!providerMatches(order, result)) throw new CommerceError('PROVIDER_RECONCILIATION_REQUIRED')
    const state: State = result.status === 'fulfilled' ? 'SHIPPED' :
      ['pending', 'inprocess', 'partial'].includes(result.status) ? 'PROVIDER_CONFIRMED' :
      result.status === 'draft' ? 'PROVIDER_ORDER_CREATED' : 'RECONCILIATION_REQUIRED'
    if (order.state === state && order.providerId === result.id) return order
    return change(order, { state, providerId: result.id })
  }
  async function hold(order: Order, reason: string) {
    try { return await change(order, { state: 'RECONCILIATION_REQUIRED', reason }) }
    catch { throw new CommerceError('RECONCILIATION_REQUIRED') }
  }
  async function fulfill(order: Order) {
    if (order.state !== 'PAYMENT_VERIFIED') return order
    if (order.fulfillmentAttemptId) return hold(order, 'PREVIOUS_SUBMISSION_REQUIRES_REVIEW')
    const payment = await providers.payment(order.paymentId!)
    if (!paymentMatches(order, payment) || payment.state !== 'completed' || payment.refundedMinor !== 0 || payment.refundPending === true) return hold(order, 'PAYMENT_CHANGED_BEFORE_DISPATCH')
    // The successful CAS alone wins the right to submit. A crashed claim is never stolen.
    order = await change(order, { state: 'FULFILMENT_CLAIMED', fulfillmentAttemptId: randomUUID() })
    try {
      const existing = await providers.findOrder(order.id)
      const result = existing || await providers.createOrder(order.id, order.snapshot)
      order = await recordProvider(order, result)
    } catch { return hold(order, 'PROVIDER_CREATION_OUTCOME_UNKNOWN') }
    return confirm(order)
  }
  async function confirm(order: Order) {
    if (!deps.confirmEnabled || order.state !== 'PROVIDER_ORDER_CREATED') return order
    if (order.confirmationAttemptId) return hold(order, 'PREVIOUS_CONFIRMATION_REQUIRES_REVIEW')
    const payment = await providers.payment(order.paymentId!)
    if (!paymentMatches(order, payment) || payment.state !== 'completed' || payment.refundedMinor !== 0 || payment.refundPending === true) return hold(order, 'PAYMENT_CHANGED_BEFORE_CONFIRMATION')
    order = await change(order, { state: 'PROVIDER_CONFIRMING', confirmationAttemptId: randomUUID() })
    try {
      const found = await providers.findOrder(order.id)
      if (!found || !providerMatches(order, found)) return hold(order, 'PROVIDER_CONFIRMATION_MISMATCH')
      return recordProvider(order, found.status === 'draft' ? await providers.confirmOrder(found.id) : found)
    } catch { return hold(order, 'PROVIDER_CONFIRMATION_OUTCOME_UNKNOWN') }
  }
  return {
    async createQuote(input: unknown, principal: Principal) {
      if (principal.kind === 'customer' && !principal.sub) throw new CommerceError('UNAUTHORIZED', 401)
      const snapshot = await quote(input, deps.catalogue, providers, deps.environment, now())
      const capability = principal.kind === 'guest' ? randomBytes(32).toString('base64url') : undefined
      const id = 'cr_' + randomUUID()
      const order: Order = { pk: 'ORDER#' + id, id, version: 1, state: 'PENDING_PAYMENT', snapshot, snapshotHash: digest(snapshot),
        owner: capability ? { capabilityHash: digest(capability), expiresAt: now() + 30 * 86400_000, revoked: false } : { sub: (principal as { sub: string }).sub },
        paymentPhase: 'NEW', updatedAt: now() }
      if (!await ledger.create(order)) throw new CommerceError('ORDER_BUSY')
      deps.audit?.({ id, state: order.state, version: order.version })
      return { ...publicOrder(order), ...(capability ? { capability } : {}) }
    },
    async status(id: string, principal: Principal) {
      let order = await load(id); authorize(order, principal)
      if (order.state === 'PROVIDER_CONFIRMED') {
        // Provider read only, after ownership validation. Never create/confirm on customer polling.
        try {
          const observed = await providers.findOrder(id)
          if (observed) order = await recordProvider(order, observed)
        } catch { order = await load(id) }
      }
      return publicOrder(order)
    },
    async revoke(id: string, principal: Principal) {
      const order = await load(id); authorize(order, principal)
      if ('capabilityHash' in order.owner) await change(order, { owner: { ...order.owner, revoked: true } })
      return { revoked: true }
    },
    async startPayment(id: string, principal: Principal) {
      let order = await load(id); authorize(order, principal)
      if (order.paymentPhase === 'BOUND' && order.state === 'PENDING_PAYMENT') return { id, token: order.paymentToken, totals: publicOrder(order) }
      if (order.state !== 'PENDING_PAYMENT' || order.paymentPhase !== 'NEW') throw new CommerceError('PAYMENT_RECONCILIATION_REQUIRED')
      if (order.snapshot.expiresAt <= now()) throw new CommerceError('QUOTE_EXPIRED')
      order = await change(order, { paymentPhase: 'CREATING', paymentAttemptId: randomUUID() })
      try {
        const result = await providers.createPayment(order.id, order.snapshot)
        if (!result.id || !result.token) throw new Error('Invalid payment response')
        order = await change(order, { paymentPhase: 'BOUND', paymentId: result.id, paymentToken: result.token })
        return { id, token: result.token, totals: publicOrder(order) }
      } catch {
        try { await change(order, { state: 'PAYMENT_UNKNOWN', reason: 'PAYMENT_CREATION_OUTCOME_UNKNOWN' }) } catch { /* stale CREATING remains quarantined */ }
        throw new CommerceError('PAYMENT_RECONCILIATION_REQUIRED')
      }
    },
    // Called only after signature verification, or permission-checked administration.
    async paymentEvent(paymentId: string) {
      const payment = await providers.payment(paymentId)
      if (!payment.reference?.startsWith('cr_')) return false
      let order = await load(payment.reference)
      if (!paymentMatches(order, payment) || (payment.id !== paymentId && payment.triggerId !== paymentId) || (order.paymentId && order.paymentId !== payment.id)) throw new CommerceError('PAYMENT_MISMATCH')
      if (order.paymentPhase !== 'BOUND') {
        // Recover a paid session whose creation response/binding was lost; never create another.
        if (order.paymentPhase !== 'CREATING' || payment.state !== 'completed') return true
        order = await change(order, { paymentId: payment.id, paymentPhase: 'BOUND' })
      }
      if (payment.refundPending) { await hold(order, 'REFUND_PENDING'); return true }
      if (payment.refundedMinor < (order.refundedMinor || 0)) { await hold(order, 'REFUND_AMOUNT_REGRESSION'); return true }
      if (payment.refundedMinor > 0 || ['cancelled', 'failed'].includes(payment.state)) {
        if (['REFUNDED','PARTIALLY_REFUNDED','CANCELLED','PAYMENT_FAILED'].includes(order.state) && order.refundedMinor === payment.refundedMinor) return true
        const state: State = AFTER_CREATION.has(order.state) || order.state === 'FULFILMENT_CLAIMED' ? 'RECONCILIATION_REQUIRED' :
          payment.refundedMinor > 0 ? (payment.refundedMinor === order.snapshot.totalMinor ? 'REFUNDED' : 'PARTIALLY_REFUNDED') : payment.state === 'cancelled' ? 'CANCELLED' : 'PAYMENT_FAILED'
        await change(order, { state, reason: 'PAYMENT_STOP', refundedMinor: payment.refundedMinor }); return true
      }
      if (payment.state !== 'completed') return true
      if (['PENDING_PAYMENT', 'PAYMENT_UNKNOWN'].includes(order.state)) order = await change(order, { state: 'PAYMENT_VERIFIED' })
      try { await fulfill(order) } catch (error) { if (!(error instanceof CommerceError && error.code === 'ORDER_BUSY')) throw error }
      return true
    },
    // Permission-checked reconciliation can advance fresh orders. An uncertain attempt is never retried.
    async reconcile(id: string) {
      let order = await load(id)
      const payment = order.paymentId && await providers.payment(order.paymentId)
      if (!payment || !paymentMatches(order, payment) || payment.state !== 'completed' || payment.refundedMinor !== 0 || payment.refundPending === true) return hold(order, 'PAYMENT_RECONCILIATION_REQUIRED')
      if (order.state === 'PAYMENT_VERIFIED') return fulfill(order)
      if (order.state === 'PROVIDER_ORDER_CREATED') return confirm(order)
      if (['FULFILMENT_CLAIMED', 'PROVIDER_CONFIRMING', 'RECONCILIATION_REQUIRED', 'PROVIDER_CONFIRMED'].includes(order.state)) {
        const provider = await providers.findOrder(id)
        if (!provider) return hold(order, 'PROVIDER_NOT_FOUND_AFTER_UNCERTAIN_ATTEMPT')
        order = await recordProvider(order, provider)
        // Recovered drafts remain drafts until a separate explicit administrative retry.
      }
      return order
    },
  }
}
