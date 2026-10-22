import { PRINTFUL_API_KEY, REVOLUT_API_SECRET, REVOLUT_MODE } from '../config/env'
import { getDataClient } from '../shared/dataClient'
import { Catalogue } from './contracts'
import { dynamoLedger } from './ledger'
import { providerAdapters } from './providers'
import { createCommerce } from './service'
import { cognitoIdentity, commerceHttp } from './http'
import { TAX_POLICY, inclusiveTaxPolicy } from './taxPolicy'
import { logger } from '../shared/logger'

// Source release gate. Do not enable until tax policy, budget and acceptance gates are approved.
export const CHECKOUT_SECURITY_HOLD = true
let service: ReturnType<typeof createCommerce> | undefined
export function commerceService() {
  if (service) return service
  const catalogue: Catalogue = {
    async variant(id) {
      const r = await (await getDataClient()).models.MerchProductVariant.get({ id })
      const v = r.data
      if (r.errors?.length || !v) return undefined
      return { productId: v.productId, syncVariantId: v.externalVariantId || '', currencyPrices: v.currencyPrices, active: v.status === 'active' && v.availabilityStatus !== 'out_of_stock' }
    },
    async product(id) {
      const r = await (await getDataClient()).models.MerchProduct.get({ id })
      const p = r.data
      if (r.errors?.length || !p) return undefined
      return { name: p.title, active: p.status === 'active' && p.isVisible, provider: p.sourceType, providerProductId: p.externalProductId || '' }
    },
  }
  const policy = inclusiveTaxPolicy(TAX_POLICY)
  service = createCommerce({ ledger: dynamoLedger(process.env.COMMERCE_LEDGER_TABLE || ''), catalogue,
    environment: REVOLUT_MODE === 'prod' ? 'production' : 'sandbox', confirmEnabled: false,
    audit: event => logger.info('Commerce transition', event),
    providers: providerAdapters({ tax: policy.tax, destination: policy.destination, printfulKey: PRINTFUL_API_KEY, revolutKey: REVOLUT_API_SECRET, environment: REVOLUT_MODE === 'prod' ? 'production' : 'sandbox' }) })
  return service
}
export async function commerceRoute(path: string, method: string, body: unknown, event: unknown) {
  if (path === '/commerce/orders/config' && method === 'GET') return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ seller: 'Ravens Community', brand: 'Project Respawn', currencies: ['GBP','EUR','USD'], shippingMinor: 0, pricesIncludeTax: true, checkoutEnabled: false, destinations: [] }) }
  if (!process.env.COMMERCE_LEDGER_TABLE) return { statusCode: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ error: 'CHECKOUT_SECURITY_HOLD' }) }
  return commerceHttp(commerceService(), cognitoIdentity(process.env.COMMERCE_USER_POOL_ID || '', process.env.COMMERCE_CLIENT_ID || ''), !CHECKOUT_SECURITY_HOLD)(path, method, body, event)
}
