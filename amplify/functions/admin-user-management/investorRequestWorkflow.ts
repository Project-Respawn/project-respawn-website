export function decodeRequestAudit(value: any) { if (typeof value !== 'string') return value || []; try { return JSON.parse(value) } catch { return [] } }

export async function applyInvestorRequestDecision(request: any, args: any, actor: string, dependencies: any) {
  const decision = String(args.decision || '').toUpperCase()
  if (!['APPROVE', 'DECLINE'].includes(decision)) throw new Error('Decision must be APPROVE or DECLINE')
  const now = dependencies.now?.() || new Date().toISOString()
  let status = decision === 'DECLINE' ? 'DECLINED' : 'PENDING_ACCOUNT', linkedUserId = request.linkedUserId || null, linkedInvestorAccessId = request.linkedInvestorAccessId || null, access = null
  if (decision === 'APPROVE') {
    const account = await dependencies.findAccount(String(args.accountEmail || request.email).trim().toLowerCase())
    if (account) {
      access = await dependencies.grantOrUpdate(account, { accessLevel: args.accessLevel || request.requestedAccessLevel || 'PRE_NDA', ndaStatus: args.ndaStatus || 'NOT_SIGNED', expiresAt: args.expiresAt || null })
      linkedUserId = account.cognitoSub; linkedInvestorAccessId = access.id; status = 'APPROVED'
    }
  }
  const auditHistory = [...decodeRequestAudit(request.auditHistory), { timestamp: now, action: decision === 'DECLINE' ? 'investor.request.declined' : status === 'APPROVED' ? 'investor.request.approved' : 'investor.request.approved_pending_account', actor, result: status, notes: String(args.decisionNotes || '') }]
  const saved = await dependencies.save({ id: request.id, status, reviewedAt: now, reviewedBy: actor, decisionNotes: String(args.decisionNotes || ''), linkedUserId, linkedInvestorAccessId, auditHistory: JSON.stringify(auditHistory) })
  return { request: { ...saved, auditHistory }, access }
}
