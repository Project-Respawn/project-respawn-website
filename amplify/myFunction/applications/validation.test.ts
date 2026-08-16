import assert from 'node:assert/strict'
import test from 'node:test'
import { completeCreatorSubmission } from './testSupport'
import { idempotencyDigest, payloadHash, validateSubmissionCommand } from './validation'

test('valid complete Creator Programme submission normalizes contact data without losing Unicode', () => {
  const value = validateSubmissionCommand(completeCreatorSubmission())
  assert.equal(value.contactEmail, 'ZOE@example.com'); assert.equal(value.applicantFullName, 'Zoë Example'); assert.equal(value.creatorDisplayName, '星 Quest')
  assert.equal(value.answers.find((answer) => answer.questionKey === 'additional_information')?.value, null)
})

const invalidCases: Array<[string, (input: any) => void, RegExp]> = [
  ['missing name', (x) => { x.applicantFullName = '' }, /applicant_name_REQUIRED/],
  ['missing email', (x) => { x.contactEmail = '' }, /contact_email_REQUIRED/],
  ['malformed email', (x) => { x.contactEmail = 'nope' }, /CONTACT_EMAIL_INVALID/],
  ['browser verified claim', (x) => { x.emailVerified = true }, /UNEXPECTED_FIELD|PROTECTED_FIELD/],
  ['unsupported pathway', (x) => { x.pathwayId = 'therapist' }, /PATHWAY_UNSUPPORTED/],
  ['closed competitive pathway', (x) => { x.pathwayId = 'competitive-player' }, /PATHWAY_CLOSED/],
  ['unsupported form version', (x) => { x.formVersion = 'creator-v99' }, /FORM_VERSION_UNSUPPORTED/],
  ['missing required answer', (x) => { x.answers = x.answers.filter((a: any) => a.questionKey !== 'why_apply') }, /REQUIRED_ANSWER_why_apply/],
  ['wrong answer type', (x) => { x.answers.find((a: any) => a.questionKey === 'why_apply').answerType = 'boolean' }, /answer_why_apply_TYPE|REQUIRED_ANSWER_why_apply/],
  ['invalid profile URL', (x) => { x.creatorProfiles[0].profileUrl = 'not a URL' }, /profile_url_INVALID/],
  ['unsafe URL protocol', (x) => { x.creatorProfiles[0].profileUrl = 'javascript:alert(1)' }, /profile_url_UNSAFE/],
  ['profile password forbidden', (x) => { x.creatorProfiles[0].password = 'secret' }, /SECRET_FIELD_FORBIDDEN/],
  ['invalid day', (x) => { x.schedules[0].dayOfWeek = 'Funday' }, /SCHEDULE_DAY_INVALID/],
  ['end before start', (x) => { x.schedules[0].endLocalTime = '18:00' }, /SCHEDULE_END_INVALID/],
  ['invalid IANA zone', (x) => { x.schedules[0].applicantTimeZone = 'GMT' }, /TIME_ZONE_INVALID/],
  ['fixed schedule without hours', (x) => { delete x.schedules[0].startLocalTime }, /SCHEDULE_FIXED_HOURS_REQUIRED/],
  ['missing consent', (x) => { x.answers.find((a: any) => a.questionKey === 'terms_accepted').value = false }, /CONSENT_REQUIRED/],
  ['unsupported consent version', (x) => { x.consentVersion = 'old' }, /CONSENT_VERSION_UNSUPPORTED/],
  ['excessive text', (x) => { x.answers.find((a: any) => a.questionKey === 'why_apply').value = 'x'.repeat(12001) }, /TOO_LONG/],
  ['excessive list', (x) => { x.answers.find((a: any) => a.questionKey === 'availability').value = Array(51).fill('x') }, /_LIST/],
  ['untrusted verification', (x) => { x.emailVerificationProvenance = 'browser' }, /VERIFICATION_PROVENANCE_UNTRUSTED/],
  ['unexpected field', (x) => { x.adminNotes = 'mine' }, /UNEXPECTED_FIELD/],
]
for (const [name, mutate, expected] of invalidCases) test(`rejects ${name}`, () => { const input: any = completeCreatorSubmission(); mutate(input); assert.throws(() => validateSubmissionCommand(input), expected) })

test('multiple accounts on one platform and safe Discord public information remain valid', () => {
  const input: any = completeCreatorSubmission(); input.creatorProfiles.push({ ...input.creatorProfiles[1], displayNameOrHandle: 'Second channel', profileUrl: 'https://youtube.com/@second', displayOrder: 4 })
  const result = validateSubmissionCommand(input); assert.equal(result.creatorProfiles.length, 4); assert.equal(result.creatorProfiles[2].relationshipToServer, 'Community owner')
})
test('script input is preserved as inert text at storage boundary', () => { const result = validateSubmissionCommand(completeCreatorSubmission()); assert.match(String(result.answers[2].value), /<script>/) })
test('canonical payload and idempotency digests are stable but distinct', () => {
  assert.equal(payloadHash({ b: 2, a: 1 }), payloadHash({ a: 1, b: 2 })); assert.notEqual(idempotencyDigest('1234567890123456'), idempotencyDigest('1234567890123457'))
})
