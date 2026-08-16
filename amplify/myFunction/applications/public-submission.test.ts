import assert from 'node:assert/strict'
import test from 'node:test'
import { submitPublicApplication } from './index'
import { completeCreatorSubmission, createMemoryClient } from './testSupport'

function publicPayload(overrides: Record<string, unknown> = {}) {
  const { emailVerificationProvenance, source, testRunId, ...payload } = completeCreatorSubmission()
  return { ...payload, contactEmail: ' Local.Part+tag@Example.COM ', confirmEmail: 'Local.Part+tag@example.com', ...overrides }
}

test('public submission normalises only whitespace and domain and stores server-owned UNVERIFIED state', async () => {
  const client = createMemoryClient(); const result = await submitPublicApplication(client, publicPayload(), 'public-request-token-1234567890', '', '192.0.2.1')
  assert.equal(result.confirmationStatus, 'SUBMITTED'); assert.deepEqual(Object.keys(result).sort(), ['confirmationStatus', 'reference', 'submittedAt'])
  const root = [...client.stores.ApplicationSubmission.values()][0]
  assert.equal(root.contactEmail, 'Local.Part+tag@example.com'); assert.equal(root.emailVerificationState, 'UNVERIFIED')
  assert.equal(root.emailVerificationProvenance, 'public-unverified'); assert.equal(root.source, 'public-apply-now')
})

test('public retry is idempotent and creates one visible application', async () => {
  const client = createMemoryClient(); const payload = publicPayload(); const token = 'public-retry-token-1234567890'
  const first = await submitPublicApplication(client, payload, token, '', '192.0.2.2'); const second = await submitPublicApplication(client, payload, token, '', '192.0.2.2')
  assert.equal(first.reference, second.reference); assert.equal(second.confirmationStatus, 'ALREADY_SUBMITTED'); assert.equal(client.stores.ApplicationSubmission.size, 1)
})

for (const [name, payload, expected] of [
  ['missing email', publicPayload({ contactEmail: '' }), /contact_email_REQUIRED/],
  ['malformed email', publicPayload({ contactEmail: 'not-an-email', confirmEmail: 'not-an-email' }), /CONTACT_EMAIL_INVALID/],
  ['confirmation mismatch', publicPayload({ confirmEmail: 'other@example.com' }), /EMAIL_CONFIRMATION_MISMATCH/],
  ['closed pathway', publicPayload({ pathwayId: 'competitive-player' }), /PATHWAY_CLOSED/],
  ['browser verified claim', publicPayload({ emailVerificationState: 'VERIFIED' }), /UNEXPECTED_FIELD|PROTECTED_FIELD/],
] as const) test(`public command rejects ${name}`, async () => assert.rejects(submitPublicApplication(createMemoryClient(), payload, `public-invalid-${crypto.randomUUID()}`, '', '192.0.2.3'), expected))

test('honeypot and per-source/email throttling reject abuse without email challenges', async () => {
  await assert.rejects(submitPublicApplication(createMemoryClient(), publicPayload(), 'public-honeypot-token-123456', 'bot-site', '192.0.2.4'), /REJECTED/)
  const client = createMemoryClient()
  for (let index = 0; index < 10; index += 1) await submitPublicApplication(client, publicPayload(), `public-rate-token-${index}-123456789`, '', '192.0.2.5')
  await assert.rejects(submitPublicApplication(client, publicPayload(), 'public-rate-token-blocked-123456', '', '192.0.2.5'), /RATE_LIMITED/)
})
