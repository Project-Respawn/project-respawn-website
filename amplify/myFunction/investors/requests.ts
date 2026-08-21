import { createHash, randomUUID } from 'node:crypto'

const LEVELS = new Set(['PRE_NDA', 'NDA', 'DILIGENCE'])
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clean(value: unknown, max: number) { return String(value || '').trim().replace(/\s+/g, ' ').slice(0, max) }

export function validateInvestorRequest(payload: any) {
  const request = {
    name: clean(payload?.name, 120), email: clean(payload?.email, 254).toLowerCase(),
    organisation: clean(payload?.organisation, 160), role: clean(payload?.role, 120),
    investmentContext: clean(payload?.investmentContext, 1000), message: clean(payload?.message, 3000),
    requestedAccessLevel: clean(payload?.requestedAccessLevel || 'PRE_NDA', 20),
  }
  if (request.name.length < 2) throw new Error('INVESTOR_REQUEST_INVALID:name')
  if (!EMAIL.test(request.email)) throw new Error('INVESTOR_REQUEST_INVALID:email')
  if (!request.investmentContext) throw new Error('INVESTOR_REQUEST_INVALID:investmentContext')
  if (!LEVELS.has(request.requestedAccessLevel)) throw new Error('INVESTOR_REQUEST_INVALID:requestedAccessLevel')
  return request
}

export async function submitInvestorRequest(client: any, payload: any, requestToken: unknown, website: unknown, now = new Date()) {
  if (website) throw new Error('INVESTOR_REQUEST_REJECTED')
  if (typeof requestToken !== 'string' || !/^[A-Za-z0-9_-]{20,100}$/.test(requestToken)) throw new Error('INVESTOR_REQUEST_INVALID:requestToken')
  const request = validateInvestorRequest(payload)
  const id = createHash('sha256').update(`investor-request:${requestToken}:${request.email}`).digest('hex')
  const existing = (await client.models.InvestorAccessRequest.get({ id })).data
  if (existing) return { success: true, requestId: existing.id, status: existing.status, submittedAt: existing.submittedAt, alreadySubmitted: true }
  const submittedAt = now.toISOString()
  const auditHistory = [{ timestamp: submittedAt, action: 'investor.request.submitted', actor: 'public', result: 'PENDING' }]
  const result = await client.models.InvestorAccessRequest.create({ id, ...request, status: 'PENDING', submittedAt, auditHistory: JSON.stringify(auditHistory) })
  if (result.errors?.length || !result.data) throw new Error(result.errors?.[0]?.message || 'INVESTOR_REQUEST_STORAGE_FAILED')
  return { success: true, requestId: id || randomUUID(), status: 'PENDING', submittedAt, alreadySubmitted: false }
}

export async function handleSubmitInvestorAccessRequest(event: any, injected?: any) {
  const client = injected || await (await import('../shared/dataClient')).getDataClient()
  try { return await submitInvestorRequest(client, event.arguments?.payload, event.arguments?.requestToken, event.arguments?.website) }
  catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (/INVESTOR_REQUEST_(?:INVALID|REJECTED)/.test(message)) return { success: false, status: 'REJECTED', message: 'Please review the submitted investor details and try again.' }
    return { success: false, status: 'UNAVAILABLE', message: 'The request could not be saved. Please try again shortly.' }
  }
}
