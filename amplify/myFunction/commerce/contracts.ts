export class CommerceError extends Error {
  constructor(public code: string, public status = 409) { super(code) }
}
export type Principal = { kind: 'customer'; sub: string } | { kind: 'guest'; capability?: string }
export type State = 'PENDING_PAYMENT' | 'PAYMENT_UNKNOWN' | 'PAYMENT_VERIFIED' | 'FULFILMENT_CLAIMED' |
  'PROVIDER_ORDER_CREATED' | 'PROVIDER_CONFIRMING' | 'PROVIDER_CONFIRMED' | 'SHIPPED' |
  'PAYMENT_FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'RECONCILIATION_REQUIRED'
export type Recipient = { name: string; email: string; address1: string; city: string; zip: string; country_code: string; state_code?: string }
export type Line = { productId: string; variantId: string; syncVariantId: string; catalogVariantId: number; quantity: number; unitMinor: number; name: string }
export type Snapshot = { version: 2; environment: 'sandbox' | 'production'; currency: import('./currencies').Currency; recipient: Recipient;
  lines: Line[]; subtotalMinor: number; shippingMinor: number; taxMinor: number; totalMinor: number;
  merchantShippingMinor?: number; pricingModel?: 'inclusive-free-shipping-v1'; seller?: 'Ravens Community';
  shippingMethod: string; taxReference: string; taxPolicy: string; quotedAt: number; expiresAt: number }
export type Order = { pk: string; id: string; version: number; state: State; snapshot: Snapshot; snapshotHash: string;
  owner: { sub: string } | { capabilityHash: string; expiresAt: number; revoked: boolean };
  paymentAttemptId?: string; fulfillmentAttemptId?: string; confirmationAttemptId?: string; refundedMinor?: number;
  paymentPhase: 'NEW' | 'CREATING' | 'BOUND'; paymentId?: string; paymentToken?: string;
  providerId?: string; updatedAt: number; reason?: string }
export interface Ledger {
  get(id: string): Promise<Order | undefined>
  create(order: Order): Promise<boolean>
  replace(previous: Order, next: Order): Promise<boolean>
}
export type TaxQuote = { currency: import('./currencies').Currency; amountMinor: number; reference: string; policy: string; basisHash: string; inclusive?: true }
export interface Providers {
  destination?(recipient: Recipient): Promise<void>
  syncVariant(id: string): Promise<{ id: string; catalogVariantId: number; productId: string; active: boolean }>
  shipping(lines: Line[], recipient: Recipient, currency: import('./currencies').Currency): Promise<{ currency: string; method: string; amountMinor: number }>
  tax(basis: { currency: import('./currencies').Currency; subtotalMinor: number; shippingMinor: number; lines: Line[]; recipient: Recipient }, basisHash: string): Promise<TaxQuote>
  createPayment(id: string, snapshot: Snapshot): Promise<{ id: string; token: string }>
  payment(id: string): Promise<{ id: string; reference: string; environment: string; currency: string; amountMinor: number; state: string; refundedMinor: number; refundPending?: boolean; triggerId?: string }>
  findOrder(id: string): Promise<ProviderOrder | undefined>
  createOrder(id: string, snapshot: Snapshot): Promise<ProviderOrder>
  confirmOrder(id: string): Promise<ProviderOrder>
}
export type ProviderOrder = { id: string; reference: string; status: string; recipient: Recipient; lines: { syncVariantId: string; quantity: number }[] }
export interface Catalogue {
  variant(id: string): Promise<{ productId: string; syncVariantId: string; currencyPrices: unknown; active: boolean } | undefined>
  product(id: string): Promise<{ name: string; active: boolean; provider: string; providerProductId: string } | undefined>
}
