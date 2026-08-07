export interface OutboundResponse<T = unknown> {
  statusCode: number
  body: T
}

export async function makeRequest<T = unknown>(
  url: string,
  method: string,
  body: unknown = null,
  authHeader?: string,
): Promise<OutboundResponse<T>> {
  const response = await fetch(url, {
    method,
    headers: {
      ...(authHeader ? { Authorization: authHeader } : {}),
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await response.text()
  try {
    return { statusCode: response.status, body: JSON.parse(text) as T }
  } catch {
    return { statusCode: response.status, body: text as T }
  }
}

export function getRequestPath(event: { rawPath?: string; path?: string }) {
  return event.rawPath || event.path || ''
}

export function getRequestMethod(event: { requestContext?: { http?: { method?: string } }; httpMethod?: string }) {
  return event.requestContext?.http?.method || event.httpMethod || ''
}

export function getQueryParams(event: { queryStringParameters?: Record<string, string | undefined> }) {
  return event.queryStringParameters || {}
}

export function getRequestBody(event: { body?: string | unknown }) {
  if (!event.body) return null
  try { return typeof event.body === 'string' ? JSON.parse(event.body) as unknown : event.body } catch { return null }
}
