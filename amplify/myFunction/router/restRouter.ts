import { handlePrintfulCreateOrder, handlePrintfulOrderLookup, handlePrintfulProductLookup, handlePrintfulProducts } from '../printful'
import { handleRevolutCheckout, handleRevolutOrderLookup } from '../revolut'
import { handleFulfillmentRequest } from '../fulfillment'

export async function routeRest(path: string, method: string, body: unknown, event: unknown) {
  if (path === '/revolut/checkout' && method === 'POST') return handleRevolutCheckout(body)
  if (path.startsWith('/revolut/orders/') && method === 'GET') return handleRevolutOrderLookup(path)
  if (path.startsWith('/printful/products/') && method === 'GET') return handlePrintfulProductLookup(path)
  if (path === '/printful/products' && method === 'GET') return handlePrintfulProducts()
  if (path === '/printful/orders' && method === 'POST') return handlePrintfulCreateOrder(body)
  if (path.startsWith('/printful/orders/') && method === 'GET') return handlePrintfulOrderLookup(path)
  if (path === '/orders/fulfill' && method === 'POST') return handleFulfillmentRequest(body)
  return null
}
