import { handlePrintfulCreateOrder, handlePrintfulOrderLookup, handlePrintfulProductLookup, handlePrintfulProducts } from '../printful'
import { handleRevolutCheckout, handleRevolutOrderLookup } from '../revolut'
import { handleTwitchCommandsLookup, handleTwitchCommandsMe } from '../twitch'
import { handleExistingRevolutOrderImport, handleFulfillmentRequest, handleRecoveryFulfillment } from '../fulfillment'

export async function routeRest(path: string, method: string, body: unknown, event: unknown) {
  if (path === '/revolut/checkout' && method === 'POST') return handleRevolutCheckout(body)
  if (path.startsWith('/revolut/orders/') && method === 'GET') return handleRevolutOrderLookup(path)
  if (path.startsWith('/printful/products/') && method === 'GET') return handlePrintfulProductLookup(path)
  if (path === '/printful/products' && method === 'GET') return handlePrintfulProducts()
  if (path === '/printful/orders' && method === 'POST') return handlePrintfulCreateOrder(body)
  if (path.startsWith('/printful/orders/') && method === 'GET') return handlePrintfulOrderLookup(path)
  if (path === '/orders/fulfill' && method === 'POST') return handleFulfillmentRequest(body)
  if (path === '/orders/recover-fulfillment' && method === 'POST') return handleRecoveryFulfillment(body)
  if (path === '/orders/import-existing-revolut' && method === 'POST') return handleExistingRevolutOrderImport(body)
  if (path === '/twitch/commands/me' || path.startsWith('/twitch/commands/me/')) return handleTwitchCommandsMe(event)
  if (path === '/twitch/commands' && method === 'GET') return handleTwitchCommandsLookup(event)
  return null
}
