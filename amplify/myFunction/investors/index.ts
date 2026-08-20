import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getDataClient } from '../shared/dataClient'
import { getIdentityGroups, getResolverIdentity, requireCanonicalUserId } from '../shared/auth'
import { canAccessInvestorDocument, effectiveInvestorAccess, isExpired } from './policy'
import { INVESTOR_DOCUMENTS } from './documents'

const SIGNED_URL_SECONDS = 300

async function findAccessRecord(client: any, userId: string) {
  const result = await client.models.InvestorAccess.listInvestorAccessByUserId({ userId }, { limit: 1 })
  if (result.errors?.length) throw new Error(result.errors[0].message || 'Investor access could not be resolved')
  return result.data?.[0] || null
}

export async function resolveInvestorAccess(event: any, client?: any, now = new Date()) {
  const identity = getResolverIdentity(event)
  const userId = requireCanonicalUserId(identity)
  const groups = getIdentityGroups(identity)
  if (groups.includes('SuperAdmin') || groups.includes('Admin')) return effectiveInvestorAccess(groups, undefined, now)
  const dataClient = client || await getDataClient()
  const record = await findAccessRecord(dataClient, userId)
  if (record?.isActive === true && isExpired(record.expiresAt, now)) {
    const updated = await dataClient.models.InvestorAccess.update({ id: record.id, isActive: false })
    if (updated.errors?.length) throw new Error(updated.errors[0].message || 'Expired investor access could not be recorded')
    const audit = await dataClient.models.InvestorAccessAuditEvent.create({
      targetUserId: userId, action: 'investor.access.expired', previousValue: JSON.stringify(record),
      newValue: JSON.stringify(updated.data), adminUserId: 'system', occurredAt: now.toISOString(),
    })
    if (audit.errors?.length) throw new Error(audit.errors[0].message || 'Investor access expiry audit could not be written')
    return effectiveInvestorAccess(groups, updated.data, now)
  }
  return effectiveInvestorAccess(groups, record, now)
}

export async function handleGetMyInvestorAccess(event: any) {
  return resolveInvestorAccess(event)
}

export async function handleGetInvestorDocumentUrl(event: any) {
  const documentKey = String(event?.arguments?.documentKey || '').trim()
  const document = INVESTOR_DOCUMENTS[documentKey]
  if (!document) throw new Error('Document is not available')

  const access = await resolveInvestorAccess(event)
  if (!access.hasAccess || !canAccessInvestorDocument(access.accessLevel, document.access)) {
    throw new Error('Your investor access level does not permit this document')
  }

  const bucket = process.env.INVESTOR_DOCUMENT_BUCKET
  if (!bucket) throw new Error('Investor document storage is not configured')
  const expiresAt = new Date(Date.now() + SIGNED_URL_SECONDS * 1000).toISOString()
  const url = await getSignedUrl(new S3Client({}), new GetObjectCommand({ Bucket: bucket, Key: document.storageKey }), { expiresIn: SIGNED_URL_SECONDS })
  return { documentKey, url, expiresAt }
}
