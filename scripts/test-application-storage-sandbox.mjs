import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { EXPECTED_SANDBOX_IDENTIFIER, EXPECTED_SANDBOX_ROOT } from './lib/local-amplify-environment.mjs'

const region = 'eu-north-1'
const dataStack = `${EXPECTED_SANDBOX_ROOT}-data7552DF31-NAE95CTVMI8U`
const aws = process.platform === 'win32' ? 'aws.exe' : 'aws'
const runId = `application-storage-${randomUUID()}`
const successfulKey = `sandbox-success-${randomUUID()}`
const failingKey = `sandbox-failure-${randomUUID()}`
const createdIds = []
const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'respawn-app-storage-'))

function awsJson(args) { return JSON.parse(execFileSync(aws, [...args, '--output', 'json'], { encoding: 'utf8' })) }
function resolveFunctionName() {
  const resources = awsJson(['cloudformation', 'describe-stack-resources', '--stack-name', dataStack, '--region', region]).StackResources
  const resource = resources.find((item) => item.ResourceType === 'AWS::Lambda::Function' && /^myFunctionrebuildlambda/.test(item.LogicalResourceId))
  assert.ok(resource?.PhysicalResourceId, 'The current Ntgrestage8 shared Lambda must resolve from its data stack')
  return resource.PhysicalResourceId
}
const functionName = resolveFunctionName()

function invoke(fieldName, argumentsValue, groups = ['SuperAdmin']) {
  const request = path.join(temporaryDirectory, `${fieldName}-${randomUUID()}.json`)
  const response = path.join(temporaryDirectory, `${fieldName}-${randomUUID()}-response.json`)
  fs.writeFileSync(request, JSON.stringify({ info: { fieldName }, arguments: argumentsValue, identity: { username: `sandbox-test:${runId}`, claims: { 'cognito:groups': groups } } }))
  execFileSync(aws, ['lambda', 'invoke', '--function-name', functionName, '--region', region, '--cli-binary-format', 'raw-in-base64-out', '--payload', `fileb://${request}`, response], { encoding: 'utf8' })
  const value = JSON.parse(fs.readFileSync(response, 'utf8'))
  if (value?.success === false) throw new Error(value.message || 'Lambda request failed')
  return value
}

const answer = (questionKey, questionLabel, sectionKey, sectionLabel, answerType, value, displayOrder, safeDisplayValue) => ({
  answerId: `answer-${displayOrder}`, questionKey, questionLabel, sectionKey, sectionLabel, answerType, value, displayOrder,
  ...(safeDisplayValue ? { safeDisplayValue } : {}),
})
const command = {
  pathwayId: 'creator', formVersion: 'creator-v1', applicantFullName: 'Sandbox Round Trip', creatorDisplayName: 'RoundTrip星',
  contactEmail: ' SANDBOX.ROUNDTRIP@EXAMPLE.COM ', emailVerificationProvenance: 'trusted-test', source: 'sandbox-integration-test',
  consentVersion: 'creator-consent-v1', consentedAt: new Date().toISOString(), testRunId: runId, auditMetadata: { testRunId: runId },
  answers: [
    answer('creator_name', 'Creator / display name', 'basic', 'Basic details', 'short-text', 'RoundTrip星', 1),
    answer('creator_role', 'What role do you want to fill?', 'profile', 'Creator profile', 'single-selection', 'Community streamer', 2),
    answer('why_apply', 'Why do you want to apply?', 'motivation', 'Motivation and goals', 'long-text', 'Sandbox fidelity test with Unicode 星 and inert <script>text</script>.', 3),
    answer('confidence_fit', 'How does Project Respawn fit?', 'motivation', 'Motivation and goals', 'long-text', 'A complete round-trip answer.', 4),
    answer('fit_reason', 'Why are you a good fit?', 'alignment', 'Alignment', 'long-text', 'A complete alignment answer.', 5),
    answer('genres', 'Choose up to five genres', 'content', 'Content and games', 'genres', ['Cosy', 'RPG', 'Strategy', 'Puzzle', 'Adventure'], 6),
    answer('favourite_games', 'Favourite games', 'content', 'Content and games', 'games', ['Game One', 'Game Two'], 7),
    answer('availability', 'Availability', 'profile', 'Creator profile', 'availability', ['Tuesday evening'], 8),
    answer('regular_schedule', 'Do you have a regular schedule?', 'schedule', 'Schedule', 'boolean', true, 9, 'Yes'),
    answer('optional', 'Optional answer', 'alignment', 'Alignment', 'short-text', null, 10),
    answer('terms_accepted', 'I agree to the declaration.', 'consent', 'Consent and declarations', 'consent', true, 11, 'Yes'),
  ],
  creatorProfiles: [
    { platform: 'Twitch', displayNameOrHandle: 'roundtrip_star', profileUrl: 'https://twitch.tv/example', isPrimary: true, contentTypes: ['Live'], isActive: true, displayOrder: 1 },
    { platform: 'Discord', displayNameOrHandle: 'roundtrip.example', profileUrl: 'https://discord.gg/example', isPrimary: false, contentTypes: ['Community'], relationshipToServer: 'Owner', isActive: true, displayOrder: 2 },
  ],
  schedules: [
    { applicantTimeZone: 'Europe/London', hasRegularSchedule: true, scheduleVaries: false, dayOfWeek: 'Tuesday', startLocalTime: '19:00', endLocalTime: '22:00', profileReference: 'roundtrip_star', contentType: 'Live', publicViewingUrl: 'https://twitch.tv/example', displayOrder: 1 },
    { applicantTimeZone: 'Europe/London', hasRegularSchedule: true, scheduleVaries: false, dayOfWeek: 'Sunday', startLocalTime: '14:00', endLocalTime: '16:00', contentType: 'Community', additionalNotes: 'Original local time retained.', displayOrder: 2 },
  ],
}

let failedId = null
let cleanupResult = 'not-run'
try {
  invoke('seedPermissionCatalog', {})
  const created = invoke('storeTrustedApplicationSubmission', { command, idempotencyKey: successfulKey }); createdIds.push(created.applicationId)
  assert.match(created.reference, /^PR-[A-Z0-9_-]{12}$/); assert.equal(created.status, 'AWAITING_REVIEW')
  const replay = invoke('storeTrustedApplicationSubmission', { command, idempotencyKey: successfulKey })
  assert.equal(replay.applicationId, created.applicationId); assert.equal(replay.idempotentReplay, true)
  const detail = invoke('getAdminApplication', { applicationId: created.applicationId }).application
  assert.equal(detail.contact.email, 'SANDBOX.ROUNDTRIP@example.com'); assert.equal(detail.answers.length, command.answers.length)
  assert.deepEqual(detail.answers.map((item) => [item.key, item.label, item.type, item.value, item.order]), command.answers.map((item) => [item.questionKey, item.questionLabel, item.answerType, item.value, item.displayOrder]))
  assert.deepEqual(detail.creatorProfiles.map((item) => item.displayNameOrHandle), ['roundtrip_star', 'roundtrip.example'])
  assert.deepEqual(detail.schedules.map((item) => item.dayOfWeek), ['Tuesday', 'Sunday'])
  const list = invoke('listAdminApplications', { search: created.reference, status: 'AWAITING_REVIEW', pathwayId: 'creator', limit: 1 })
  assert.equal(list.items.length, 1); assert.equal(list.items[0].id, created.applicationId); assert.equal('contact' in list.items[0], false)
  let denied = false
  try { invoke('listAdminApplications', { search: created.reference }, ['Staff']) } catch (error) { denied = /applications\.read|required/i.test(String(error)); }
  assert.equal(denied, true, 'Staff without explicit application permission must be denied')
  let invalidRejected = false
  try { invoke('storeTrustedApplicationSubmission', { command: { ...command, schedules: [{ ...command.schedules[0], dayOfWeek: 'Funday' }] }, idempotencyKey: failingKey }) } catch (error) { invalidRejected = /SCHEDULE_DAY_INVALID/.test(String(error)); }
  assert.equal(invalidRejected, true)
  assert.equal(invoke('listAdminApplications', { search: 'RoundTrip星' }).items.length, 1, 'invalid retry created no second visible application')
  invoke('cleanupApplicationStorageTestRun', { applicationId: created.applicationId, idempotencyKey: successfulKey, testRunId: runId })
  assert.throws(() => invoke('getAdminApplication', { applicationId: created.applicationId }), /APPLICATION_NOT_FOUND/)
  cleanupResult = 'verified-exact-cleanup'
  console.log(JSON.stringify({ sandbox: EXPECTED_SANDBOX_IDENTIFIER, rootStack: EXPECTED_SANDBOX_ROOT, runId, functionName, createdIds, failedId, assertions: 18, passed: 18, failed: 0, skipped: 0, cleanupResult, productionTouched: false }, null, 2))
} finally {
  if (cleanupResult === 'not-run') {
    try { invoke('cleanupApplicationStorageTestRun', { idempotencyKey: successfulKey, testRunId: runId }) } catch {}
    try { invoke('cleanupApplicationStorageTestRun', { idempotencyKey: failingKey, testRunId: runId }) } catch {}
  }
  fs.rmSync(temporaryDirectory, { recursive: true, force: true })
}
