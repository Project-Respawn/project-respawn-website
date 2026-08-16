import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { requireEffectivePermission } from '../shared/requirePermission'
import { COMPLETE_WRITE_STATE, INITIAL_APPLICATION_STATUS, idempotencyDigest, normalizeContactEmail, payloadHash, validateSubmissionCommand } from './validation'

const RETENTION_SECONDS = 90 * 24 * 60 * 60
const SAFE_ERROR = 'Application storage request failed'
const modelsForChildren = ['ApplicationAnswer', 'ApplicationCreatorProfile', 'ApplicationSchedule', 'ApplicationAuditEvent'] as const
const resultError = (result: any, fallback: string) => {
  if (result?.errors?.length) {
    const raw = `${result.errors[0].errorType || ''} ${result.errors[0].message || ''}`
    const category = /unauthor|access denied|forbidden/i.test(raw) ? 'AUTHORIZATION'
      : /json/i.test(raw) ? 'JSON_CONTRACT' : /validation|variable|argument|type/i.test(raw) ? 'INPUT_CONTRACT' : 'MODEL_OPERATION'
    throw new Error(`APPLICATION_MODEL:${category}`)
  }
  return result?.data
}
const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))
const reference = () => `PR-${randomBytes(9).toString('base64url').toUpperCase()}`
const childId = (applicationId: string, kind: string, stable: string) => createHash('sha256').update(`${applicationId}:${kind}:${stable}`).digest('hex')
const asJson = (value: unknown) => JSON.stringify(value)
const fromJson = (value: unknown) => typeof value === 'string' ? JSON.parse(value) : value
async function getDataClient() { return (await import('../shared/dataClient')).getDataClient() }

async function listAllForApplication(client: any, modelName: string, applicationId: string) {
  const records: any[] = []; let nextToken: string | null | undefined
  do {
    const response = await client.models[modelName].list({ filter: { applicationId: { eq: applicationId } }, limit: 1000, nextToken })
    resultError(response, `Unable to read ${modelName}`); records.push(...(response.data || [])); nextToken = response.nextToken
  } while (nextToken)
  return records
}

async function safeAudit(client: any, applicationId: string, eventType: string, source: string, formVersion: string, testRunId: string | undefined, metadata: any, occurredAt = new Date().toISOString()) {
  const id = childId(applicationId, 'audit', `${eventType}:${occurredAt}`)
  return resultError(await client.models.ApplicationAuditEvent.create({ id, applicationId, eventType, actorSource: source, occurredAt, safeMetadata: asJson(metadata), formVersion, testRunId }), 'Unable to write application audit')
}

async function cleanFailedChildren(client: any, applicationId: string) {
  for (const modelName of modelsForChildren) {
    const rows = await listAllForApplication(client, modelName, applicationId)
    for (const row of rows) resultError(await client.models[modelName].delete({ id: row.id }), `Unable to recover ${modelName}`)
  }
}

export async function storeApplicationSubmission(client: any, raw: unknown, rawIdempotencyKey: unknown, actorUserId: string, options: { now?: () => Date; failAfter?: string } = {}) {
  if (typeof rawIdempotencyKey !== 'string' || rawIdempotencyKey.trim().length < 16 || rawIdempotencyKey.length > 200) throw new Error('APPLICATION_VALIDATION:IDEMPOTENCY_KEY_INVALID')
  const command = validateSubmissionCommand(raw); const hash = payloadHash(command); const digest = idempotencyDigest(rawIdempotencyKey.trim())
  const now = options.now || (() => new Date()); const expiresAt = Math.floor(now().getTime() / 1000) + RETENTION_SECONDS
  let stage = 'IDEMPOTENCY_READ'
  let lock = (await client.models.ApplicationIdempotency.get({ id: digest })).data
  if (lock && lock.payloadHash !== hash) throw new Error('APPLICATION_IDEMPOTENCY:KEY_PAYLOAD_MISMATCH')
  if (lock?.state === 'SUCCEEDED') return { ...(fromJson(lock.safeResult) as any), idempotentReplay: true }
  if (!lock) {
    stage = 'IDEMPOTENCY_CREATE'
    const claimed = await client.models.ApplicationIdempotency.create({ id: digest, payloadHash: hash, state: 'PROCESSING', expiresAt, testRunId: command.testRunId })
    if (claimed.errors?.length) {
      for (let attempt = 0; attempt < 20; attempt += 1) {
        await delay(10); lock = (await client.models.ApplicationIdempotency.get({ id: digest })).data
        if (lock?.payloadHash !== hash) throw new Error('APPLICATION_IDEMPOTENCY:KEY_PAYLOAD_MISMATCH')
        if (lock?.state === 'SUCCEEDED') return { ...(fromJson(lock.safeResult) as any), idempotentReplay: true }
        if (lock?.state === 'FAILED') break
      }
      if (lock?.state === 'PROCESSING') throw new Error('APPLICATION_IDEMPOTENCY:IN_PROGRESS_RETRY')
    }
  }
  const existingLock = (await client.models.ApplicationIdempotency.get({ id: digest })).data
  const applicationId = existingLock?.applicationId || randomUUID(); const timestamp = now().toISOString()
  try {
    stage = 'APPLICATION_READ'
    const existing = (await client.models.ApplicationSubmission.get({ id: applicationId })).data
    if (existing?.writeState === 'FAILED_WRITE') await cleanFailedChildren(client, applicationId)
    const root = { id: applicationId, applicationReference: existing?.applicationReference || reference(), pathwayId: command.pathwayId,
      formVersion: command.formVersion, applicantFullName: command.applicantFullName, creatorDisplayName: command.creatorDisplayName,
      contactEmail: command.contactEmail, emailVerificationState: command.emailVerificationProvenance === 'public-unverified' ? 'UNVERIFIED' : 'VERIFIED', emailVerificationProvenance: command.emailVerificationProvenance,
      submissionStatus: 'SUBMISSION_IN_PROGRESS', writeState: 'PENDING_WRITE', source: command.source,
      consentVersion: command.consentVersion, consentedAt: command.consentedAt, currentReviewState: 'NOT_STARTED',
      auditMetadata: asJson(command.auditMetadata), payloadHash: hash, idempotencyDigest: digest, testRunId: command.testRunId }
    stage = 'APPLICATION_WRITE'; resultError(existing ? await client.models.ApplicationSubmission.update(root) : await client.models.ApplicationSubmission.create(root), 'Unable to create application')
    stage = 'IDEMPOTENCY_BIND'
    resultError(await client.models.ApplicationIdempotency.update({ id: digest, payloadHash: hash, state: 'PROCESSING', applicationId, expiresAt, testRunId: command.testRunId, lastErrorCode: null }), 'Unable to bind application request')
    if (options.failAfter === 'main') throw new Error('INJECTED_FAILURE')
    stage = 'CREATED_AUDIT'; await safeAudit(client, applicationId, 'APPLICATION_CREATED', command.source, command.formVersion, command.testRunId, { pathwayId: command.pathwayId, formVersion: command.formVersion }, timestamp)
    for (let index = 0; index < command.answers.length; index += 1) {
      const answer = command.answers[index]
      stage = 'ANSWER_WRITE'; resultError(await client.models.ApplicationAnswer.create({ id: childId(applicationId, 'answer', answer.answerId), applicationId,
        answerId: answer.answerId, questionKey: answer.questionKey, questionLabelSnapshot: answer.questionLabel,
        sectionKey: answer.sectionKey, sectionLabelSnapshot: answer.sectionLabel, answerType: answer.answerType,
        structuredValue: asJson(answer.value), safeDisplayValue: answer.safeDisplayValue, displayOrder: answer.displayOrder,
        formVersion: command.formVersion, submittedCreatedAt: timestamp, testRunId: command.testRunId }), 'Unable to store application answer')
      if (options.failAfter === `answer:${index + 1}`) throw new Error('INJECTED_FAILURE')
    }
    if (options.failAfter === 'answers') throw new Error('INJECTED_FAILURE')
    for (let index = 0; index < command.creatorProfiles.length; index += 1) {
      const profile = command.creatorProfiles[index]
      stage = 'PROFILE_WRITE'; resultError(await client.models.ApplicationCreatorProfile.create({ id: childId(applicationId, 'profile', String(index)), applicationId, ...profile, submittedCreatedAt: timestamp, testRunId: command.testRunId }), 'Unable to store creator profile')
      if (options.failAfter === `profile:${index + 1}`) throw new Error('INJECTED_FAILURE')
    }
    for (let index = 0; index < command.schedules.length; index += 1) {
      const schedule = command.schedules[index]
      stage = 'SCHEDULE_WRITE'; resultError(await client.models.ApplicationSchedule.create({ id: childId(applicationId, 'schedule', String(index)), applicationId, ...schedule, submittedCreatedAt: timestamp, testRunId: command.testRunId }), 'Unable to store schedule')
      if (options.failAfter === `schedule:${index + 1}`) throw new Error('INJECTED_FAILURE')
    }
    stage = 'RELATED_VERIFY'; const [answers, profiles, schedules] = await Promise.all(modelsForChildren.slice(0, 3).map((name) => listAllForApplication(client, name, applicationId)))
    if (answers.length !== command.answers.length || profiles.length !== command.creatorProfiles.length || schedules.length !== command.schedules.length) throw new Error('APPLICATION_STORAGE:RELATED_COUNT_MISMATCH')
    stage = 'COMPLETION_AUDIT'; await safeAudit(client, applicationId, 'SUBMISSION_COMPLETED', command.source, command.formVersion, command.testRunId, { answerCount: answers.length, profileCount: profiles.length, scheduleCount: schedules.length }, timestamp)
    if (options.failAfter === 'audit') throw new Error('INJECTED_FAILURE')
    const safeResult = { applicationId, reference: root.applicationReference, status: INITIAL_APPLICATION_STATUS, submittedAt: timestamp, idempotentReplay: false }
    stage = 'FINAL_STATUS'; resultError(await client.models.ApplicationSubmission.update({ id: applicationId, submissionStatus: INITIAL_APPLICATION_STATUS, writeState: COMPLETE_WRITE_STATE, submittedAt: timestamp, currentReviewState: 'AWAITING_REVIEW' }), 'Unable to complete application')
    if (options.failAfter === 'final') throw new Error('INJECTED_FAILURE')
    stage = 'IDEMPOTENCY_COMPLETE'; resultError(await client.models.ApplicationIdempotency.update({ id: digest, payloadHash: hash, state: 'SUCCEEDED', applicationId, safeResult: asJson(safeResult), expiresAt, testRunId: command.testRunId, lastErrorCode: null }), 'Unable to complete idempotency request')
    return safeResult
  } catch (error) {
    try { await client.models.ApplicationSubmission.update({ id: applicationId, submissionStatus: 'SUBMISSION_FAILED', writeState: 'FAILED_WRITE', currentReviewState: 'NOT_STARTED' }) } catch {}
    try { await safeAudit(client, applicationId, 'SUBMISSION_FAILED', command.source, command.formVersion, command.testRunId, { errorCode: error instanceof Error && error.message === 'INJECTED_FAILURE' ? 'INJECTED_FAILURE' : 'WRITE_FAILED' }) } catch {}
    try { await client.models.ApplicationIdempotency.update({ id: digest, payloadHash: hash, state: 'FAILED', applicationId, expiresAt, testRunId: command.testRunId, lastErrorCode: 'WRITE_FAILED' }) } catch {}
    if (error instanceof Error && /^(APPLICATION_|INJECTED_FAILURE)/.test(error.message)) throw error
    throw new Error(`${SAFE_ERROR}:${stage}`)
  }
}

export async function listApplications(client: any, args: any = {}) {
  const limit = Math.min(Math.max(Number(args.limit) || 25, 1), 100); const status = args.status ? String(args.status) : null
  const pathway = args.pathwayId ? String(args.pathwayId) : null; const search = String(args.search || '').trim().toLowerCase()
  let storageToken: string | null | undefined; const stored: any[] = []
  do {
    const response = await client.models.ApplicationSubmission.list({ limit: 1000, nextToken: storageToken })
    resultError(response, 'Unable to list applications'); stored.push(...(response.data || [])); storageToken = response.nextToken
  } while (storageToken)
  let offset = 0
  if (args.nextToken) {
    try { offset = Number(JSON.parse(Buffer.from(String(args.nextToken), 'base64url').toString('utf8')).offset) } catch { throw new Error('APPLICATION_LIST_TOKEN_INVALID') }
    if (!Number.isInteger(offset) || offset < 0) throw new Error('APPLICATION_LIST_TOKEN_INVALID')
  }
  let items = stored.filter((item: any) => item.writeState === COMPLETE_WRITE_STATE)
  if (status) items = items.filter((item: any) => item.submissionStatus === status)
  if (pathway) items = items.filter((item: any) => item.pathwayId === pathway)
  if (search) items = items.filter((item: any) => [item.applicantFullName, item.creatorDisplayName, item.applicationReference].some((value) => String(value).toLowerCase().includes(search)))
  items.sort((a: any, b: any) => String(a.submittedAt).localeCompare(String(b.submittedAt)) * (args.sortDirection === 'ASC' ? 1 : -1))
  const page = items.slice(offset, offset + limit)
  return { items: page.map((item: any) => ({ id: item.id, reference: item.applicationReference, applicantName: item.applicantFullName,
    creatorName: item.creatorDisplayName, pathway: item.pathwayId, submittedAt: item.submittedAt, status: item.submissionStatus,
    reviewProgress: { state: item.currentReviewState, completed: 0, required: 3 } })),
    nextToken: offset + limit < items.length ? Buffer.from(JSON.stringify({ offset: offset + limit })).toString('base64url') : null }
}

export async function getApplicationDetail(client: any, applicationId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(applicationId)) throw new Error('APPLICATION_NOT_FOUND')
  const item = (await client.models.ApplicationSubmission.get({ id: applicationId })).data
  if (!item || item.writeState !== COMPLETE_WRITE_STATE) throw new Error('APPLICATION_NOT_FOUND')
  const [answers, profiles, schedules, audits] = await Promise.all(modelsForChildren.map((name) => listAllForApplication(client, name, applicationId)))
  const byOrder = (a: any, b: any) => a.displayOrder - b.displayOrder
  return { application: { id: item.id, reference: item.applicationReference, pathway: item.pathwayId, formVersion: item.formVersion,
    applicantName: item.applicantFullName, creatorName: item.creatorDisplayName, status: item.submissionStatus, submittedAt: item.submittedAt,
    contact: { email: item.contactEmail, verificationState: item.emailVerificationState, verificationProvenance: item.emailVerificationProvenance },
    consent: { version: item.consentVersion, consentedAt: item.consentedAt }, source: item.source, reviewProgress: { state: item.currentReviewState, completed: 0, required: 3 },
    answers: answers.sort(byOrder).map((row: any) => ({ id: row.answerId, key: row.questionKey, label: row.questionLabelSnapshot, sectionKey: row.sectionKey, section: row.sectionLabelSnapshot, type: row.answerType, value: fromJson(row.structuredValue), displayValue: row.safeDisplayValue, order: row.displayOrder, formVersion: row.formVersion })),
    creatorProfiles: profiles.sort(byOrder).map(({ id, applicationId: ignored, submittedCreatedAt, testRunId, createdAt, updatedAt, ...row }: any) => row),
    schedules: schedules.sort(byOrder).map(({ id, applicationId: ignored, submittedCreatedAt, testRunId, createdAt, updatedAt, ...row }: any) => row),
    audit: audits.sort((a: any, b: any) => String(a.occurredAt).localeCompare(String(b.occurredAt))).map((row: any) => ({ type: row.eventType, source: row.actorSource, occurredAt: row.occurredAt, metadata: fromJson(row.safeMetadata), formVersion: row.formVersion })),
    metadata: { audit: fromJson(item.auditMetadata), createdAt: item.createdAt, updatedAt: item.updatedAt } } }
}

export async function handleStoreTrustedApplicationSubmission(event: any, injectedClient?: any) {
  const client = injectedClient || await getDataClient(); const { actorUserId } = await requireEffectivePermission(event, client, 'applications.storage.trusted')
  return storeApplicationSubmission(client, event.arguments?.command, event.arguments?.idempotencyKey, actorUserId)
}

function requestSource(event: any) {
  const headers = event.request?.headers || {}; const forwarded = String(headers['x-forwarded-for'] || headers['X-Forwarded-For'] || '').split(',')[0].trim()
  return forwarded || String(event.identity?.sourceIp?.[0] || event.identity?.sourceIp || 'unknown')
}
async function enforcePublicRateLimit(client: any, source: string, email: string, now = new Date()) {
  const id = createHash('sha256').update(`public-application:${source}:${email.toLowerCase()}`).digest('hex'); const existing = (await client.models.ApplicationPublicRateLimit.get({ id })).data
  if (existing?.blockedUntil && Date.parse(existing.blockedUntil) > now.getTime()) throw new Error('APPLICATION_PUBLIC:RATE_LIMITED')
  const withinWindow = existing && now.getTime() - Date.parse(existing.windowStartedAt) < 60 * 60 * 1000; const count = withinWindow ? Number(existing.count) + 1 : 1
  if (count > 10) {
    const blockedUntil = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); await client.models.ApplicationPublicRateLimit.update({ id, count, blockedUntil, expiresAt: Math.floor((now.getTime() + 2 * 60 * 60 * 1000) / 1000) }); throw new Error('APPLICATION_PUBLIC:RATE_LIMITED')
  }
  const input = { id, windowStartedAt: withinWindow ? existing.windowStartedAt : now.toISOString(), count, expiresAt: Math.floor((now.getTime() + 2 * 60 * 60 * 1000) / 1000) }
  resultError(existing ? await client.models.ApplicationPublicRateLimit.update(input) : await client.models.ApplicationPublicRateLimit.create(input), 'Unable to apply rate limit')
}
export async function submitPublicApplication(client: any, rawPayload: unknown, requestToken: unknown, website: unknown, source = 'unknown') {
  if (website) throw new Error('APPLICATION_PUBLIC:REJECTED')
  if (typeof requestToken !== 'string' || !/^[A-Za-z0-9_-]{20,100}$/.test(requestToken)) throw new Error('APPLICATION_PUBLIC:REQUEST_TOKEN_INVALID')
  const serialized = JSON.stringify(rawPayload); if (serialized.length > 100_000) throw new Error('APPLICATION_PUBLIC:PAYLOAD_TOO_LARGE')
  if (!rawPayload || typeof rawPayload !== 'object' || Array.isArray(rawPayload)) throw new Error('APPLICATION_PUBLIC:PAYLOAD_INVALID')
  const { confirmEmail, ...publicCommand } = rawPayload as any; const normalizedEmail = normalizeContactEmail(publicCommand.contactEmail); const normalizedConfirmation = normalizeContactEmail(confirmEmail)
  if (normalizedEmail !== normalizedConfirmation) throw new Error('APPLICATION_PUBLIC:EMAIL_CONFIRMATION_MISMATCH')
  const command = { ...publicCommand, contactEmail: normalizedEmail, emailVerificationProvenance: 'public-unverified', source: 'public-apply-now' }
  await enforcePublicRateLimit(client, source, normalizedEmail)
  const trustedKey = createHash('sha256').update(`public-application:${requestToken}:${normalizedEmail}`).digest('base64url')
  const result = await storeApplicationSubmission(client, command, trustedKey, 'public-application-boundary')
  return { success: true, reference: result.reference, submittedAt: result.submittedAt, confirmationStatus: result.idempotentReplay ? 'ALREADY_SUBMITTED' : 'SUBMITTED' }
}
function publicValidationIssues(message: string) {
  const mappings: Array<[RegExp, string, string, string]> = [
    [/EMAIL_CONFIRMATION_MISMATCH/, 'confirmEmail', 'contact', 'The email addresses do not match.'], [/CONTACT_EMAIL/, 'email', 'contact', 'Enter a valid email address.'], [/applicant_name/, 'name', 'basic', 'Enter your full name.'], [/creator_name/, 'creatorName', 'basic', 'Enter your creator or channel name.'], [/time_zone/, 'timezone', 'basic', 'Choose a valid time zone.'], [/profile_url/, 'creatorProfiles[0].url', 'profiles', 'Enter a complete profile URL beginning with https://.'], [/SCHEDULE_END|end_time/, 'schedule[0].endTime', 'schedule', 'The stream end time must be later than the start time.'], [/start_time/, 'schedule[0].startTime', 'schedule', 'Enter the stream start time.'], [/SCHEDULE_DAY/, 'schedule[0].dayOfWeek', 'schedule', 'Choose the usual stream day.'], [/CONSENT/, 'termsAccepted', 'consent', 'Accept this declaration before submitting.'], [/PATHWAY/, 'applicationType', 'pathway', 'This application pathway is not open.'],
  ]; const found = mappings.find(([pattern]) => pattern.test(message)); return found ? [{ code: 'APPLICATION_VALIDATION_FAILED', field: found[1], section: found[2], message: found[3] }] : [{ code: 'APPLICATION_VALIDATION_FAILED', field: null, section: 'application', message: 'Some submitted information was not accepted. Please review this section and try again.' }]
}
export async function handleSubmitPublicApplication(event: any, injectedClient?: any) {
  const client = injectedClient || await getDataClient()
  try { return await submitPublicApplication(client, event.arguments?.payload, event.arguments?.requestToken, event.arguments?.website, requestSource(event)) }
  catch (error) { const raw = error instanceof Error ? error.message : ''; if (/APPLICATION_(?:VALIDATION|PUBLIC:(?:EMAIL|PAYLOAD|REQUEST_TOKEN))|PATHWAY/.test(raw)) return { success: false, errorCode: 'APPLICATION_VALIDATION_FAILED', issues: publicValidationIssues(raw), message: 'Some information needs attention.' }; if (/RATE_LIMITED/.test(raw)) return { success: false, errorCode: 'RATE_LIMITED', message: 'Too many application attempts have been made. Please wait before trying again. Your answers are still available on this page.' }; return { success: false, errorCode: 'SERVICE_UNAVAILABLE', message: 'We could not save your application because of a temporary system problem. Your answers are still here. Please try again shortly.', supportReference: randomBytes(6).toString('hex').toUpperCase() } }
}
export async function handleListAdminApplications(event: any, injectedClient?: any) {
  const client = injectedClient || await getDataClient(); await requireEffectivePermission(event, client, 'applications.read'); return listApplications(client, event.arguments)
}
export async function handleGetAdminApplication(event: any, injectedClient?: any) {
  const client = injectedClient || await getDataClient(); await requireEffectivePermission(event, client, 'applications.read'); return getApplicationDetail(client, String(event.arguments?.applicationId || ''))
}

export async function cleanupApplicationTestRun(client: any, ids: { applicationId?: string; idempotencyKey: string; testRunId: string }) {
  const digest = idempotencyDigest(ids.idempotencyKey); const lock = (await client.models.ApplicationIdempotency.get({ id: digest })).data
  if (!lock || !ids.testRunId || lock.testRunId !== ids.testRunId) throw new Error('APPLICATION_TEST_CLEANUP:SCOPE_MISMATCH')
  const applicationId = ids.applicationId || lock.applicationId
  if (applicationId) {
    const root = (await client.models.ApplicationSubmission.get({ id: applicationId })).data
    if (root) {
      if (root.testRunId !== ids.testRunId || (ids.applicationId && root.id !== ids.applicationId)) throw new Error('APPLICATION_TEST_CLEANUP:SCOPE_MISMATCH')
      await cleanFailedChildren(client, applicationId); await client.models.ApplicationSubmission.delete({ id: applicationId })
    }
  }
  await client.models.ApplicationIdempotency.delete({ id: digest })
}

/** Direct-Lambda integration-test cleanup. Deliberately absent from the AppSync schema. */
export async function handleCleanupApplicationStorageTestRun(event: any, injectedClient?: any) {
  const client = injectedClient || await getDataClient(); await requireEffectivePermission(event, client, 'applications.storage.trusted')
  const applicationId = String(event.arguments?.applicationId || '') || undefined; const idempotencyKey = String(event.arguments?.idempotencyKey || ''); const testRunId = String(event.arguments?.testRunId || '')
  await cleanupApplicationTestRun(client, { applicationId, idempotencyKey, testRunId }); return { success: true }
}

/** Direct-Lambda public-boundary test cleanup. Requires an exact aggregate id and marker stored in audit metadata. */
export async function handleCleanupPublicApplicationTestRun(event: any, injectedClient?: any) {
  const client = injectedClient || await getDataClient(); await requireEffectivePermission(event, client, 'applications.storage.trusted')
  const applicationId = String(event.arguments?.applicationId || ''); const testRunId = String(event.arguments?.testRunId || '')
  const root = (await client.models.ApplicationSubmission.get({ id: applicationId })).data
  if (!root || root.emailVerificationProvenance !== 'public-unverified' || fromJson(root.auditMetadata)?.publicSandboxTestRunId !== testRunId) throw new Error('APPLICATION_TEST_CLEANUP:SCOPE_MISMATCH')
  await cleanFailedChildren(client, applicationId); await client.models.ApplicationSubmission.delete({ id: applicationId })
  if (root.idempotencyDigest) await client.models.ApplicationIdempotency.delete({ id: root.idempotencyDigest })
  return { success: true }
}
