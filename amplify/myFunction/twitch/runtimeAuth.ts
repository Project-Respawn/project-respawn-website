import { createHmac, timingSafeEqual } from 'node:crypto'

export interface RuntimeRequest { method: string; path: string; timestamp: string; nonce: string; body?: unknown }
export interface RuntimeLease { integrationId: string; brandId: string; broadcasterId: string; operations: string[]; issuedAt: number; expiresAt: number }

export function runtimeLeaseMetadata(token: string) {
  const [encoded] = String(token || '').split('.')
  const claims = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as RuntimeLease
  return { issuedAt: claims.issuedAt, expiresAt: claims.expiresAt }
}

function stableBody(body: unknown) { return body === undefined || body === null ? '' : JSON.stringify(body) }
export function runtimeCanonicalRequest(input: RuntimeRequest) {
  return [input.method.toUpperCase(), input.path, input.timestamp, input.nonce, stableBody(input.body)].join('\n')
}
export function signRuntimeRequest(input: RuntimeRequest, secret: string) {
  return createHmac('sha256', secret).update(runtimeCanonicalRequest(input)).digest('base64url')
}
export function verifyRuntimeRequest(input: RuntimeRequest, supplied: string, secret: string, now = Date.now(), maxSkewMs = 60_000) {
  const timestamp = Date.parse(input.timestamp)
  if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > maxSkewMs) throw new Error('Runtime request timestamp is invalid or stale')
  if (!input.nonce || input.nonce.length < 16) throw new Error('Runtime request nonce is invalid')
  const expected = Buffer.from(signRuntimeRequest(input, secret))
  const received = Buffer.from(String(supplied || ''))
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) throw new Error('Runtime request signature is invalid')
  return true
}

export function createRuntimeLease(claims: Omit<RuntimeLease, 'issuedAt' | 'expiresAt'>, secret: string, now = Date.now(), ttlMs = 5 * 60_000) {
  const payload: RuntimeLease = { ...claims, issuedAt: now, expiresAt: now + ttlMs }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', secret).update(encoded).digest('base64url')
  return `${encoded}.${sig}`
}
export function verifyRuntimeLease(token: string, secret: string, operation: string, now = Date.now()): RuntimeLease {
  const [encoded, supplied, extra] = String(token || '').split('.')
  if (!encoded || !supplied || extra) throw new Error('Malformed runtime lease')
  const expected = Buffer.from(createHmac('sha256', secret).update(encoded).digest('base64url'))
  const received = Buffer.from(supplied)
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) throw new Error('Invalid runtime lease')
  const claims = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as RuntimeLease
  if (now > claims.expiresAt) throw new Error('Runtime lease expired')
  if (!claims.operations.includes(operation)) throw new Error('Runtime lease does not permit this operation')
  return claims
}
