import { createHash } from 'node:crypto'
import { Catalogue, CommerceError, Providers, Recipient, Snapshot } from './contracts'
import { CURRENCIES, configuredPrice, currencyOf } from './currencies'

// DynamoDB map field order is not a serialization contract.
function canonical(value: any): any {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort()
    .filter(key => value[key] !== undefined).map(key => [key, canonical(value[key])]))
  return value
}
export const digest = (value: unknown) => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex')
export function minorUnits(value: unknown): number {
  const text = String(value)
  if (!/^\d{1,7}(?:\.\d{1,2})?$/.test(text)) throw new CommerceError('INVALID_MONEY', 400)
  const [whole, cents = ''] = text.split('.')
  return Number(whole) * 100 + Number(cents.padEnd(2, '0'))
}
function text(value: unknown, max: number) {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\x00-\x1f]/.test(value)) throw new CommerceError('INVALID_ADDRESS', 400)
  return value.trim()
}
export function recipientOf(value: any): Recipient {
  const recipient: Recipient = { name: text(value?.name, 100), email: text(value?.email, 254),
    address1: text(value?.address1, 200), city: text(value?.city, 100), zip: text(value?.zip, 20), country_code: text(value?.country_code, 2).toUpperCase() }
  if (!/^[A-Z]{2}$/.test(recipient.country_code) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email)) throw new CommerceError('INVALID_ADDRESS', 400)
  if (value?.state_code) recipient.state_code = text(value.state_code, 10).toUpperCase()
  if (['US', 'CA', 'AU'].includes(recipient.country_code) && !recipient.state_code) throw new CommerceError('STATE_REQUIRED', 400)
  return recipient
}
export async function quote(input: any, catalogue: Catalogue, providers: Providers, environment: Snapshot['environment'], now: number): Promise<Snapshot> {
  const currency = currencyOf(input?.currency)
  if (!Array.isArray(input?.items) || !input.items.length || input.items.length > 30) throw new CommerceError('INVALID_ITEMS', 400)
  const recipient = recipientOf(input.recipient), lines: Snapshot['lines'] = [], seen = new Set<string>()
  await providers.destination?.(recipient)
  let quantity = 0
  for (const selected of input.items) {
    if (typeof selected?.variantId !== 'string' || selected.variantId.length > 128 || !Number.isSafeInteger(selected.quantity) || selected.quantity < 1 || selected.quantity > 20 || seen.has(selected.variantId)) throw new CommerceError('INVALID_SELECTION', 400)
    seen.add(selected.variantId); quantity += selected.quantity
    if (quantity > 50) throw new CommerceError('QUANTITY_LIMIT', 400)
    const variant = await catalogue.variant(selected.variantId)
    const product = variant && await catalogue.product(variant.productId)
    if (!variant?.active || !product?.active || product.provider !== 'printful' || !variant.syncVariantId) throw new CommerceError('PRODUCT_UNAVAILABLE', 400)
    const sync = await providers.syncVariant(variant.syncVariantId)
    if (!sync.active || sync.id !== variant.syncVariantId || sync.productId !== product.providerProductId || !Number.isSafeInteger(sync.catalogVariantId) || sync.catalogVariantId < 1) throw new CommerceError('VARIANT_MAPPING_INVALID', 400)
    const unitMinor = configuredPrice(variant.currencyPrices, currency)
    if (unitMinor < 1) throw new CommerceError('INVALID_PRICE', 400)
    lines.push({ productId: variant.productId, variantId: selected.variantId, syncVariantId: variant.syncVariantId,
      catalogVariantId: sync.catalogVariantId, quantity: selected.quantity, unitMinor, name: product.name })
  }
  const subtotalMinor = lines.reduce((sum, line) => sum + line.unitMinor * line.quantity, 0)
  const shipping = await providers.shipping(lines, recipient, currency)
  if (shipping.currency !== currency || !shipping.method || !Number.isSafeInteger(shipping.amountMinor) || shipping.amountMinor < 0) throw new CommerceError('SHIPPING_UNAVAILABLE', 503)
  const basis = { currency, subtotalMinor, shippingMinor: 0, lines, recipient }
  const basisHash = digest(basis), tax = await providers.tax(basis, basisHash)
  if (tax.inclusive !== true || tax.amountMinor > subtotalMinor || tax.currency !== currency || tax.basisHash !== basisHash || !tax.reference || !tax.policy || !Number.isSafeInteger(tax.amountMinor) || tax.amountMinor < 0) throw new CommerceError('TAX_UNAVAILABLE', 503)
  // Inclusive merchandise prices are the complete customer charge. Supplier shipping is our cost.
  const totalMinor = subtotalMinor
  if (!Number.isSafeInteger(totalMinor) || totalMinor < 1 || totalMinor > CURRENCIES[currency].maxOrderMinor) throw new CommerceError('ORDER_TOTAL_LIMIT', 400)
  return { version: 2, environment, currency, recipient, lines, subtotalMinor, shippingMinor: 0, merchantShippingMinor: shipping.amountMinor,
    pricingModel: 'inclusive-free-shipping-v1', seller: 'Ravens Community',
    taxMinor: tax.amountMinor, totalMinor, shippingMethod: shipping.method, taxReference: tax.reference,
    taxPolicy: tax.policy, quotedAt: now, expiresAt: now + 10 * 60_000 }
}
