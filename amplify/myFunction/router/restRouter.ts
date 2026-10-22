import { handlePrintfulProductLookup, handlePrintfulProducts } from '../printful'
import { handleRevolutCheckout } from '../revolut'
import { handleRevolutWebhook } from '../revolut/webhook'
import { handleTwitchCommandsLookup, handleTwitchCommandsMe, handleTwitchOAuthCallback } from '../twitch'
import { handleAlphaRewardEvent } from '../twitch/rewardEventHandlers'

export async function routeRest(path: string, method: string, body: unknown, event: unknown) {
  if (path.startsWith('/commerce/')) return (await import('../commerce/runtime')).commerceRoute(path, method, body, event)
  // No customer ownership contract exists for these provider operations.
  if (path === '/printful/orders' || path.startsWith('/printful/orders/') ||
      (path === '/revolut/orders' || path.startsWith('/revolut/orders/')) ||
      ['/orders/fulfill', '/orders/recover-fulfillment', '/orders/import-existing-revolut'].includes(path)) {
    return { statusCode: 403, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Public order operations are disabled' }) }
  }
  if (path === '/webhooks/revolut' && method === 'POST') return handleRevolutWebhook(event)
  if (path === '/revolut/checkout' && method === 'POST') return handleRevolutCheckout(body)
  if (path.startsWith('/printful/products/') && method === 'GET') return handlePrintfulProductLookup(path)
  if (path === '/printful/products' && method === 'GET') return handlePrintfulProducts()
  if (path === '/twitch/commands/me' || path.startsWith('/twitch/commands/me/')) return handleTwitchCommandsMe(event)
  if (path === '/twitch/commands' && method === 'GET') return handleTwitchCommandsLookup(event)
  if (path === '/twitch/oauth/callback' && method === 'GET') return handleTwitchOAuthCallback(event)
  if (path === '/integrations/alpha/reward-events' && method === 'POST') return handleAlphaRewardEvent(event)
  return null
}
