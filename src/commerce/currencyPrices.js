export const checkoutCurrencies = Object.freeze(['GBP', 'EUR', 'USD'])
// Public catalogue display uses the same configured maps, never imported supplier prices.
export function advertisedVariantPrice(value) {
  try {
    for (let i=0;i<2&&typeof value==='string';i++) value=JSON.parse(value)
    for (const currency of checkoutCurrencies) {
      const minor=value?.[currency]
      if (Number.isSafeInteger(minor)&&minor>0&&minor<=1000000) return {currency,minor,price:minor/100,
        display:new Intl.NumberFormat('en-GB',{style:'currency',currency}).format(minor/100)}
    }
  } catch { /* Malformed configuration is unavailable, never a supplier-price fallback. */ }
  return null
}
export function advertisedCataloguePrice(variants) {
  const available=variants.map(v=>advertisedVariantPrice(v.currencyPrices)).filter(Boolean)
  const currency=checkoutCurrencies.find(code=>available.some(price=>price.currency===code))
  if(!currency)return 'Price available after configuration'
  const minor=Math.min(...available.filter(price=>price.currency===currency).map(price=>price.minor))
  return `From ${new Intl.NumberFormat('en-GB',{style:'currency',currency}).format(minor/100)} (tax inclusive)`
}
export function priceDraft(value) {
  for (let i = 0; i < 2 && typeof value === 'string'; i++) value = JSON.parse(value)
  const prices = value || {}
  return Object.fromEntries(checkoutCurrencies.map(code => [code, Number.isSafeInteger(prices[code]) ? (prices[code] / 100).toFixed(2) : '']))
}
export function pricesFromDraft(draft) {
  const prices = {}
  for (const code of checkoutCurrencies) {
    const text = String(draft[code] ?? '').trim()
    if (!text) continue // A blank removes that currency's price; it never enables conversion.
    if (!/^\d{1,5}(?:\.\d{1,2})?$/.test(text)) throw new Error(`Enter a valid ${code} price with up to two decimal places.`)
    const [major, fraction = ''] = text.split('.')
    const minor = Number(major) * 100 + Number(fraction.padEnd(2, '0'))
    if (minor < 1 || minor > 1000000) throw new Error(`${code} price must be between 0.01 and 10,000.00.`)
    prices[code] = minor
  }
  return prices
}
