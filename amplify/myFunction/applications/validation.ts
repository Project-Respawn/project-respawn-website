import { createHash } from 'node:crypto'

export const CREATOR_PATHWAY = 'creator'
export const CREATOR_FORM_VERSION = 'creator-v1'
export const CREATOR_CONSENT_VERSION = 'creator-consent-v1'
export const INITIAL_APPLICATION_STATUS = 'AWAITING_REVIEW'
export const COMPLETE_WRITE_STATE = 'COMPLETE'

const CLOSED_PATHWAYS = new Set(['competitive-streamer', 'competitive-player', 'competitive-coaching', 'competitive-analysis'])
const ANSWER_TYPES = new Set(['short-text', 'long-text', 'boolean', 'single-selection', 'multiple-selection', 'list', 'genres', 'games', 'availability', 'url', 'urls', 'consent'])
const PLATFORMS = new Set(['Twitch', 'YouTube', 'Instagram', 'TikTok', 'Kick', 'X', 'Facebook Gaming', 'Discord', 'Other'])
const DAYS = new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
const REQUIRED_ANSWERS = new Map([
  ['creator_name', 'short-text'], ['creator_role', 'single-selection'], ['why_apply', 'long-text'],
  ['confidence_fit', 'long-text'], ['fit_reason', 'long-text'], ['terms_accepted', 'consent'],
])
const SERVER_FIELDS = new Set(['id', 'applicationId', 'applicationReference', 'reference', 'status', 'submissionStatus', 'writeState', 'reviewStatus', 'currentReviewState', 'createdAt', 'updatedAt', 'submittedAt', 'actorUserId', 'emailVerified', 'emailVerificationState'])
const SECRET_KEY = /(?:password|passcode|access.?token|refresh.?token|private.?key|client.?secret|credential)/i
const TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/

export interface ValidatedSubmission {
  pathwayId: string; formVersion: string; applicantFullName: string; creatorDisplayName: string
  contactEmail: string; emailVerificationProvenance: string; source: string; consentVersion: string
  consentedAt: string; answers: any[]; creatorProfiles: any[]; schedules: any[]; auditMetadata: Record<string, unknown>
  testRunId?: string
}

function fail(code: string): never { throw new Error(`APPLICATION_VALIDATION:${code}`) }
function text(value: unknown, field: string, max: number, required = true) {
  if (typeof value !== 'string') fail(`${field}_TYPE`)
  const normalized = value.trim()
  if (required && !normalized) fail(`${field}_REQUIRED`)
  if (normalized.length > max) fail(`${field}_TOO_LONG`)
  return normalized
}
function optionalText(value: unknown, field: string, max: number) {
  if (value === undefined || value === null || value === '') return null
  return text(value, field, max, false)
}
function exactKeys(value: any, allowed: readonly string[], field: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${field}_TYPE`)
  const unexpected = Object.keys(value).find((key) => !allowed.includes(key))
  if (unexpected) fail(`${field}_UNEXPECTED_FIELD`)
}
function assertNoSecrets(value: unknown) {
  if (!value || typeof value !== 'object') return
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (SECRET_KEY.test(key)) fail('SECRET_FIELD_FORBIDDEN')
    assertNoSecrets(child)
  }
}
function publicUrl(value: unknown, field: string, required = false) {
  const raw = optionalText(value, field, 2048)
  if (!raw) { if (required) fail(`${field}_REQUIRED`); return null }
  let parsed: URL
  try { parsed = new URL(raw) } catch { fail(`${field}_INVALID`) }
  if (parsed.protocol !== 'https:' || !parsed.hostname || parsed.username || parsed.password) fail(`${field}_UNSAFE`)
  return parsed.toString()
}
export function normalizeContactEmail(value: unknown) {
  const raw = text(value, 'contact_email', 320)
  if (/[\s\u0000-\u001f\u007f]/u.test(raw)) fail('CONTACT_EMAIL_INVALID')
  const separator = raw.lastIndexOf('@'); if (separator <= 0 || separator === raw.length - 1 || raw.indexOf('@') !== separator) fail('CONTACT_EMAIL_INVALID')
  const local = raw.slice(0, separator); const domain = raw.slice(separator + 1).toLowerCase()
  if (local.length > 64 || domain.length > 255 || !/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i.test(domain) || !domain.includes('.') || domain.includes('..')) fail('CONTACT_EMAIL_INVALID')
  return `${local}@${domain}`
}
function validTimeZone(value: string) {
  try { Intl.DateTimeFormat('en-GB', { timeZone: value }).format(); return value.includes('/') || value === 'UTC' } catch { return false }
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical((value as any)[key])}`).join(',')}}`
  return JSON.stringify(value)
}
export function payloadHash(value: unknown) { return createHash('sha256').update(canonical(value)).digest('hex') }
export function idempotencyDigest(value: string) { return createHash('sha256').update(`application-storage:v1:${value}`).digest('hex') }

function validateAnswerValue(type: string, value: unknown, key: string) {
  if (value === null) return
  if (['short-text', 'long-text', 'single-selection'].includes(type)) text(value, `answer_${key}`, type === 'long-text' ? 12000 : 1000)
  else if (['boolean', 'consent'].includes(type) && typeof value !== 'boolean') fail(`answer_${key}_TYPE`)
  else if (type === 'url') publicUrl(value, `answer_${key}`, true)
  else if (['multiple-selection', 'list', 'genres', 'games', 'availability', 'urls'].includes(type)) {
    if (!Array.isArray(value) || value.length > 50) fail(`answer_${key}_LIST`)
    for (const item of value) type === 'urls' ? publicUrl(item, `answer_${key}`, true) : text(item, `answer_${key}`, 500)
    if (type === 'genres' && value.length > 5) fail(`answer_${key}_GENRES`)
  } else if (!ANSWER_TYPES.has(type)) fail(`answer_${key}_UNSUPPORTED_TYPE`)
}

export function validateSubmissionCommand(input: unknown): ValidatedSubmission {
  exactKeys(input, ['pathwayId', 'formVersion', 'applicantFullName', 'creatorDisplayName', 'contactEmail', 'emailVerificationProvenance', 'source', 'consentVersion', 'consentedAt', 'answers', 'creatorProfiles', 'schedules', 'auditMetadata', 'testRunId'], 'command')
  assertNoSecrets(input)
  const command = input as any
  const forbidden = Object.keys(command).find((key) => SERVER_FIELDS.has(key))
  if (forbidden) fail('PROTECTED_FIELD')
  const pathwayId = text(command.pathwayId, 'pathway', 80)
  if (CLOSED_PATHWAYS.has(pathwayId)) fail('PATHWAY_CLOSED')
  if (pathwayId !== CREATOR_PATHWAY) fail('PATHWAY_UNSUPPORTED')
  const formVersion = text(command.formVersion, 'form_version', 80)
  if (formVersion !== CREATOR_FORM_VERSION) fail('FORM_VERSION_UNSUPPORTED')
  const consentVersion = text(command.consentVersion, 'consent_version', 80)
  if (consentVersion !== CREATOR_CONSENT_VERSION) fail('CONSENT_VERSION_UNSUPPORTED')
  const applicantFullName = text(command.applicantFullName, 'applicant_name', 200)
  const creatorDisplayName = text(command.creatorDisplayName, 'creator_name', 200)
  const email = normalizeContactEmail(command.contactEmail)
  const provenance = text(command.emailVerificationProvenance, 'verification_provenance', 100)
  if (!['trusted-test', 'public-unverified'].includes(provenance)) fail('VERIFICATION_PROVENANCE_UNTRUSTED')
  const consentedAt = text(command.consentedAt, 'consented_at', 40)
  if (!Number.isFinite(Date.parse(consentedAt))) fail('CONSENT_TIMESTAMP_INVALID')
  if (!Array.isArray(command.answers) || command.answers.length > 100) fail('ANSWERS_INVALID')
  const keys = new Set<string>()
  const answers = command.answers.map((answer: any, index: number) => {
    exactKeys(answer, ['answerId', 'questionKey', 'questionLabel', 'sectionKey', 'sectionLabel', 'answerType', 'value', 'safeDisplayValue', 'displayOrder'], 'answer')
    const questionKey = text(answer.questionKey, 'question_key', 100)
    if (keys.has(questionKey)) fail('ANSWER_KEY_DUPLICATE'); keys.add(questionKey)
    const answerType = text(answer.answerType, 'answer_type', 40)
    validateAnswerValue(answerType, answer.value, questionKey)
    const order = Number(answer.displayOrder)
    if (!Number.isInteger(order) || order < 0 || order > 1000) fail('ANSWER_ORDER_INVALID')
    return { answerId: optionalText(answer.answerId, 'answer_id', 100) || `answer-${index + 1}`, questionKey,
      questionLabel: text(answer.questionLabel, 'question_label', 500), sectionKey: text(answer.sectionKey, 'section_key', 100),
      sectionLabel: text(answer.sectionLabel, 'section_label', 300), answerType, value: answer.value ?? null,
      safeDisplayValue: optionalText(answer.safeDisplayValue, 'safe_display_value', 2000), displayOrder: order }
  })
  for (const [key, expectedType] of REQUIRED_ANSWERS) {
    const answer = answers.find((item: any) => item.questionKey === key)
    if (!answer || answer.value === null || answer.value === '' || answer.answerType !== expectedType) fail(`REQUIRED_ANSWER_${key}`)
  }
  if (answers.find((item: any) => item.questionKey === 'terms_accepted')?.value !== true) fail('CONSENT_REQUIRED')
  if (!Array.isArray(command.creatorProfiles) || command.creatorProfiles.length > 20) fail('PROFILES_INVALID')
  const creatorProfiles = command.creatorProfiles.map((profile: any, index: number) => {
    exactKeys(profile, ['platform', 'customPlatformLabel', 'displayNameOrHandle', 'profileUrl', 'isPrimary', 'contentTypes', 'isActive', 'relationshipToServer', 'displayOrder'], 'profile')
    const platform = text(profile.platform, 'profile_platform', 80)
    if (!PLATFORMS.has(platform)) fail('PROFILE_PLATFORM_UNSUPPORTED')
    if (!Array.isArray(profile.contentTypes) || profile.contentTypes.length > 20) fail('PROFILE_CONTENT_TYPES_INVALID')
    return { platform, customPlatformLabel: platform === 'Other' ? text(profile.customPlatformLabel, 'custom_platform', 100) : null,
      displayNameOrHandle: text(profile.displayNameOrHandle, 'profile_handle', 200), profileUrl: publicUrl(profile.profileUrl, 'profile_url'),
      isPrimary: Boolean(profile.isPrimary), contentTypes: profile.contentTypes.map((item: unknown) => text(item, 'content_type', 100)),
      isActive: profile.isActive !== false, relationshipToServer: optionalText(profile.relationshipToServer, 'server_relationship', 500),
      displayOrder: Number.isInteger(profile.displayOrder) ? profile.displayOrder : index }
  })
  if (creatorProfiles.filter((profile: any) => profile.isPrimary).length > 1) fail('MULTIPLE_PRIMARY_PROFILES')
  if (!Array.isArray(command.schedules) || command.schedules.length > 30) fail('SCHEDULES_INVALID')
  const schedules = command.schedules.map((slot: any, index: number) => {
    exactKeys(slot, ['applicantTimeZone', 'hasRegularSchedule', 'scheduleVaries', 'dayOfWeek', 'startLocalTime', 'endLocalTime', 'profileReference', 'contentType', 'nextPlannedPublicStream', 'publicViewingUrl', 'additionalNotes', 'displayOrder'], 'schedule')
    const zone = text(slot.applicantTimeZone, 'time_zone', 100); if (!validTimeZone(zone)) fail('TIME_ZONE_INVALID')
    const regular = Boolean(slot.hasRegularSchedule); const varies = Boolean(slot.scheduleVaries)
    const day = optionalText(slot.dayOfWeek, 'schedule_day', 20); if (day && !DAYS.has(day)) fail('SCHEDULE_DAY_INVALID')
    const start = optionalText(slot.startLocalTime, 'start_time', 5); const end = optionalText(slot.endLocalTime, 'end_time', 5)
    if (regular && !varies && (!day || !start || !end)) fail('SCHEDULE_FIXED_HOURS_REQUIRED')
    if ((start && !TIME.test(start)) || (end && !TIME.test(end))) fail('SCHEDULE_TIME_INVALID')
    if (start && end && end <= start) fail('SCHEDULE_END_INVALID')
    const next = optionalText(slot.nextPlannedPublicStream, 'next_stream', 40); if (next && !Number.isFinite(Date.parse(next))) fail('NEXT_STREAM_INVALID')
    return { applicantTimeZone: zone, hasRegularSchedule: regular, scheduleVaries: varies, dayOfWeek: day,
      startLocalTime: start, endLocalTime: end, profileReference: optionalText(slot.profileReference, 'profile_reference', 200),
      contentType: optionalText(slot.contentType, 'schedule_content_type', 100), nextPlannedPublicStream: next,
      publicViewingUrl: publicUrl(slot.publicViewingUrl, 'viewing_url'), additionalNotes: optionalText(slot.additionalNotes, 'schedule_notes', 2000),
      displayOrder: Number.isInteger(slot.displayOrder) ? slot.displayOrder : index }
  })
  return { pathwayId, formVersion, applicantFullName, creatorDisplayName, contactEmail: email,
    emailVerificationProvenance: provenance, source: optionalText(command.source, 'source', 100) || 'trusted-service',
    consentVersion, consentedAt: new Date(consentedAt).toISOString(), answers, creatorProfiles, schedules,
    auditMetadata: command.auditMetadata && typeof command.auditMetadata === 'object' && !Array.isArray(command.auditMetadata) ? command.auditMetadata : {},
    testRunId: optionalText(command.testRunId, 'test_run_id', 100) || undefined }
}
