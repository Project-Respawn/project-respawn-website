import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export function canonicalAlphaRequest(input: { method: string; path: string; timestamp: string; nonce: string; body: unknown }) {
  return [input.method.toUpperCase(), input.path, input.timestamp, input.nonce, JSON.stringify(input.body ?? {})].join('\n')
}

export function signAlphaRequest(input: Parameters<typeof canonicalAlphaRequest>[0], secret: string) {
  return createHmac('sha256', secret).update(canonicalAlphaRequest(input)).digest('base64url')
}

export function verifyAlphaRequest(input: Parameters<typeof canonicalAlphaRequest>[0], supplied: string, secret: string, now = Date.now()) {
  const timestamp = Date.parse(input.timestamp)
  if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > 60_000) throw new Error('Alpha request timestamp is invalid or stale')
  if (!input.nonce || input.nonce.length < 16) throw new Error('Alpha request nonce is invalid')
  const expected = Buffer.from(signAlphaRequest(input, secret)); const received = Buffer.from(String(supplied || ''))
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) throw new Error('Alpha request signature is invalid')
  return createHash('sha256').update(input.nonce).digest('hex')
}
