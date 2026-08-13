import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export interface OAuthStatePayload {
  transactionId: string
  nonce: string
  issuedAt: number
  expiresAt: number
}

function encode(value: string | Buffer) { return Buffer.from(value).toString('base64url') }
function decode(value: string) { return Buffer.from(value, 'base64url').toString('utf8') }
function signature(encoded: string, secret: string) { return createHmac('sha256', secret).update(encoded).digest('base64url') }

export function createOAuthState(transactionId: string, secret: string, now = Date.now(), ttlMs = 10 * 60_000) {
  if (!transactionId || !secret) throw new Error('OAuth transaction and state secret are required')
  const payload: OAuthStatePayload = { transactionId, nonce: randomBytes(24).toString('base64url'), issuedAt: now, expiresAt: now + ttlMs }
  const encoded = encode(JSON.stringify(payload))
  return { token: `${encoded}.${signature(encoded, secret)}`, payload }
}

export function verifyOAuthState(token: string, secret: string, now = Date.now()): OAuthStatePayload {
  const [encoded, supplied, extra] = String(token || '').split('.')
  if (!encoded || !supplied || extra) throw new Error('Malformed OAuth state')
  const expected = Buffer.from(signature(encoded, secret))
  const received = Buffer.from(supplied)
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) throw new Error('Invalid OAuth state signature')
  const payload = JSON.parse(decode(encoded)) as OAuthStatePayload
  if (!payload.transactionId || !payload.nonce || !payload.expiresAt) throw new Error('Incomplete OAuth state')
  if (now > payload.expiresAt) throw new Error('OAuth state expired')
  return payload
}
