import type { Handler } from 'aws-lambda'
import { getRequestBody, getRequestMethod, getRequestPath } from './shared/http'
import { logger } from './shared/logger'
import { jsonResponse } from './shared/responses'
import { getResolverFieldName, isAppSyncResolverEvent, routeAppSync } from './router/appSyncRouter'
import { routeRest } from './router/restRouter'

/** Single Lambda entry point; protocol-specific routing remains isolated. */
export const handler: Handler = async (event) => {
  try {
    if (isAppSyncResolverEvent(event)) {
      const response = await routeAppSync(event)
      return response ?? { success: false, message: `Unsupported resolver field: ${getResolverFieldName(event)}` }
    }

    const path = getRequestPath(event)
    const method = getRequestMethod(event)
    if (method === 'OPTIONS') return jsonResponse(200, { ok: true })

    const response = await routeRest(path, method, getRequestBody(event), event)
    return response ?? jsonResponse(404, { error: 'Route not found', path, method })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('API request failed', { message })
    if (isAppSyncResolverEvent(event)) throw new Error(message)
    return jsonResponse(500, { error: 'Request failed', message })
  }
}
