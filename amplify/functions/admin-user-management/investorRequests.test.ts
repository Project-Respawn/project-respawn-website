import assert from 'node:assert/strict'
import test from 'node:test'
import { applyInvestorRequestDecision } from './investorRequestWorkflow'

const request = { id: 'request-1', name: 'Sandbox Investor', email: 'investor@example.test', organisation: 'Test Fund', requestedAccessLevel: 'PRE_NDA', status: 'PENDING', auditHistory: JSON.stringify([{ action: 'submitted' }]) }
function client(existingAccess: any = null) {
  const updates: any[] = []
  return { updates, models: {
    InvestorAccessRequest: { get: async () => ({ data: request }), update: async (value: any) => { updates.push(value); return { data: { ...request, ...value } } } },
    InvestorAccess: { listInvestorAccessByUserId: async () => ({ data: existingAccess ? [existingAccess] : [] }) },
  } }
}
const event = { identity: { sub: 'admin-sub' } }

test('approval grants through existing InvestorAccess authority and links the request', async () => {
  let grants = 0; let saved: any
  const result = await applyInvestorRequestDecision(request, { requestId: 'request-1', decision: 'APPROVE', decisionNotes: 'Verified', accessLevel: 'PRE_NDA', ndaStatus: 'NOT_SIGNED' }, 'admin-sub', {
    findAccount: async () => ({ cognitoSub: 'investor-sub', email: request.email }),
    grantOrUpdate: async () => { grants += 1; return { id: 'access-1' } }, save: async (value: any) => saved = { ...request, ...value }, now: () => '2026-08-21T00:00:00Z',
  })
  assert.equal(grants, 1); assert.equal(result.request.status, 'APPROVED'); assert.equal(result.request.linkedUserId, 'investor-sub'); assert.equal(result.request.linkedInvestorAccessId, 'access-1')
})

test('decline records decision without granting access', async () => {
  let grants = 0
  const result = await applyInvestorRequestDecision(request, { decision: 'DECLINE', decisionNotes: 'Not proceeding' }, 'admin-sub', { findAccount: async () => null, grantOrUpdate: async () => { grants += 1 }, save: async (value: any) => ({ ...request, ...value }) })
  assert.equal(grants, 0); assert.equal(result.request.status, 'DECLINED')
})

test('approval without a matching account is explicitly pending account', async () => {
  const result = await applyInvestorRequestDecision(request, { decision: 'APPROVE' }, 'admin-sub', { findAccount: async () => null, grantOrUpdate: async () => null, save: async (value: any) => ({ ...request, ...value }) })
  assert.equal(result.request.status, 'PENDING_ACCOUNT'); assert.equal(result.access, null)
})
