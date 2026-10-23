import { CommerceError } from './contracts'

// Explicit registry: adding a currency requires its minor-unit exponent and limit,
// not an exchange-rate source. Existing order snapshots retain their own currency.
export const CURRENCIES = { GBP: { exponent: 2, maxOrderMinor: 1000000 }, EUR: { exponent: 2, maxOrderMinor: 1000000 }, USD: { exponent: 2, maxOrderMinor: 1000000 } } as const
export type Currency = keyof typeof CURRENCIES
export type CurrencyPrices = Partial<Record<Currency, number>>
export function currencyOf(value: unknown): Currency {
  if (typeof value !== 'string' || !Object.hasOwn(CURRENCIES, value)) throw new CommerceError('UNSUPPORTED_CURRENCY', 400)
  return value as Currency
}
export function currencyPrices(value: unknown): CurrencyPrices {
  for (let decode = 0; decode < 2 && typeof value === 'string'; decode++) {
    if (value.length > 1000) throw new CommerceError('INVALID_CONFIGURED_PRICES', 400)
    try { value = JSON.parse(value) } catch { throw new CommerceError('INVALID_CONFIGURED_PRICES', 400) }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new CommerceError('INVALID_CONFIGURED_PRICES', 400)
  const prices: CurrencyPrices = {}
  for (const [code, amount] of Object.entries(value)) {
    const currency = currencyOf(code)
    if (!Number.isSafeInteger(amount) || (amount as number) <= 0 || (amount as number) > CURRENCIES[currency].maxOrderMinor) throw new CommerceError('INVALID_CONFIGURED_PRICE', 400)
    prices[currency] = amount as number
  }
  return prices
}
export function decimalPrice(amount: number, currency: Currency): string {
  const exponent = CURRENCIES[currency].exponent
  const scale = 10 ** exponent
  return `${Math.floor(amount / scale)}.${String(amount % scale).padStart(exponent, '0')}`
}
export function configuredPrice(value: unknown, currency: Currency): number {
  if (value == null) throw new CommerceError('PRICE_NOT_CONFIGURED', 400)
  const price = currencyPrices(value)[currency]
  if (price === undefined) throw new CommerceError('PRICE_NOT_CONFIGURED', 400)
  return price
}
