import assert from 'node:assert/strict'
import test from 'node:test'
import { submitInvestorRequest, validateInvestorRequest } from './requests'

function client() {
  const rows = new Map<string, any>()
  return { rows, models: { InvestorAccessRequest: {
    get: async ({ id }: any) => ({ data: rows.get(id) || null }),
    create: async (value: any) => { rows.set(value.id, value); return { data: value } },
  } } }
}

const payload = { name: 'Sandbox Investor', email: 'investor@example.test', organisation: 'Test Fund', role: 'Partner', investmentContext: 'Pre-seed review', message: 'Test only', requestedAccessLevel: 'PRE_NDA' }

test('public investor request validates, persists, and replays idempotently', async () => {
  const data = client(); const token = 'investor-request-token-123456'
  const first = await submitInvestorRequest(data, payload, token, '', new Date('2026-08-21T00:00:00Z'))
  const second = await submitInvestorRequest(data, payload, token, '', new Date('2026-08-22T00:00:00Z'))
  assert.equal(first.success, true); assert.equal(data.rows.size, 1); assert.equal(second.alreadySubmitted, true)
  assert.equal([...data.rows.values()][0].status, 'PENDING')
})

test('invalid investor requests are rejected before persistence', async () => {
  const data = client()
  await assert.rejects(() => submitInvestorRequest(data, { ...payload, email: 'bad' }, 'investor-request-token-123456', ''), /email/)
  assert.equal(data.rows.size, 0)
  assert.throws(() => validateInvestorRequest({ ...payload, requestedAccessLevel: 'ADMIN' }), /requestedAccessLevel/)
})

test('honeypot submissions are rejected', async () => {
  await assert.rejects(() => submitInvestorRequest(client(), payload, 'investor-request-token-123456', 'spam.example'), /REJECTED/)
})
