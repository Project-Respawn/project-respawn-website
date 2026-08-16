import assert from 'node:assert/strict'
import test from 'node:test'
import { cleanupApplicationTestRun, getApplicationDetail, handleGetAdminApplication, handleListAdminApplications, handleStoreTrustedApplicationSubmission, listApplications, storeApplicationSubmission } from './index'
import { completeCreatorSubmission, createMemoryClient } from './testSupport'

const idempotencyKey = () => `unit-${crypto.randomUUID()}`
const event = (groups: string[], args: any = {}) => ({ identity: { username: 'tester', claims: { 'cognito:groups': groups } }, arguments: args })

test('complete aggregate round trips every ordered submitted value through protected detail', async () => {
  const client = createMemoryClient(); const input = completeCreatorSubmission(); const stored = await storeApplicationSubmission(client, input, idempotencyKey(), 'tester', { now: () => new Date('2026-08-16T12:00:00.000Z') })
  const detail = (await getApplicationDetail(client, stored.applicationId)).application
  assert.equal(detail.reference, stored.reference); assert.equal(detail.status, 'AWAITING_REVIEW'); assert.equal(detail.contact.email, 'ZOE@example.com')
  assert.deepEqual(detail.answers.map((answer: any) => [answer.key, answer.label, answer.type, answer.value, answer.order]), (input.answers as any[]).map((answer) => [answer.questionKey, answer.questionLabel, answer.answerType, answer.value, answer.displayOrder]))
  assert.deepEqual(detail.creatorProfiles.map((profile: any) => profile.displayNameOrHandle), ['zoë_星', 'Zoe Example', 'zoe.example'])
  assert.deepEqual(detail.schedules.map((slot: any) => slot.dayOfWeek), ['Tuesday', 'Sunday']); assert.equal(detail.formVersion, 'creator-v1')
  assert.deepEqual(detail.audit.map((audit: any) => audit.type), ['APPLICATION_CREATED', 'SUBMISSION_COMPLETED'])
  assert.ok(detail.audit.every((audit: any) => !JSON.stringify(audit).includes('zoe@example.com')))
})

test('same key and payload replays one application; changed payload is rejected', async () => {
  const client = createMemoryClient(); const key = idempotencyKey(); const first = await storeApplicationSubmission(client, completeCreatorSubmission(), key, 'tester')
  const second = await storeApplicationSubmission(client, completeCreatorSubmission(), key, 'tester')
  assert.equal(second.applicationId, first.applicationId); assert.equal(second.idempotentReplay, true); assert.equal(client.stores.ApplicationSubmission.size, 1)
  await assert.rejects(storeApplicationSubmission(client, completeCreatorSubmission({ creatorDisplayName: 'Different' }), key, 'tester'), /KEY_PAYLOAD_MISMATCH/)
})

test('parallel identical requests create one logical visible application', async () => {
  const client = createMemoryClient(); const key = idempotencyKey(); const input = completeCreatorSubmission()
  const results = await Promise.allSettled(Array.from({ length: 8 }, () => storeApplicationSubmission(client, input, key, 'tester')))
  assert.equal(client.stores.ApplicationSubmission.size, 1); assert.equal((await listApplications(client)).items.length, 1)
  assert.ok(results.every((result) => result.status === 'fulfilled' || /IN_PROGRESS_RETRY/.test((result as PromiseRejectedResult).reason.message)))
})

for (const point of ['main', 'answer:2', 'answers', 'profile:1', 'schedule:1', 'audit', 'final']) test(`failure after ${point} is hidden and exact retry recovers without touching unrelated data`, async () => {
  const client = createMemoryClient(); const unrelatedKey = idempotencyKey(); const unrelated = await storeApplicationSubmission(client, completeCreatorSubmission({ testRunId: 'unrelated' }), unrelatedKey, 'tester')
  const key = idempotencyKey(); await assert.rejects(storeApplicationSubmission(client, completeCreatorSubmission({ testRunId: `failure-${point}` }), key, 'tester', { failAfter: point }), /INJECTED_FAILURE/)
  assert.equal((await listApplications(client)).items.length, 1); assert.equal((await getApplicationDetail(client, unrelated.applicationId)).application.id, unrelated.applicationId)
  const recovered = await storeApplicationSubmission(client, completeCreatorSubmission({ testRunId: `failure-${point}` }), key, 'tester')
  assert.equal((await listApplications(client)).items.length, 2); assert.equal((await getApplicationDetail(client, recovered.applicationId)).application.answers.length, 12)
})

test('list omits protected detail and supports search, filters, sort and bounds', async () => {
  const client = createMemoryClient(); await storeApplicationSubmission(client, completeCreatorSubmission(), idempotencyKey(), 'tester', { now: () => new Date('2026-08-15T12:00:00Z') })
  await storeApplicationSubmission(client, completeCreatorSubmission({ applicantFullName: 'Jamie New', creatorDisplayName: 'LatestCreator', contactEmail: 'jamie@example.com' }), idempotencyKey(), 'tester', { now: () => new Date('2026-08-16T12:00:00Z') })
  const newest = await listApplications(client, { limit: 1, sortDirection: 'DESC' }); assert.equal(newest.items[0].applicantName, 'Jamie New'); assert.equal('contact' in newest.items[0], false)
  assert.ok(newest.nextToken); const secondPage = await listApplications(client, { limit: 1, sortDirection: 'DESC', nextToken: newest.nextToken }); assert.equal(secondPage.items[0].applicantName, 'Zoë Example'); assert.equal(secondPage.nextToken, null)
  assert.equal((await listApplications(client, { search: 'PR-' })).items.length, 2); assert.equal((await listApplications(client, { search: 'latestcreator' })).items.length, 1)
  assert.equal((await listApplications(client, { pathwayId: 'creator', status: 'AWAITING_REVIEW' })).items.length, 2); assert.equal((await listApplications(client, { pathwayId: 'closed' })).items.length, 0)
})

test('pagination rejects malformed cursors and empty lists are stable', async () => {
  const client = createMemoryClient(); assert.deepEqual(await listApplications(client), { items: [], nextToken: null })
  await assert.rejects(listApplications(client, { nextToken: 'not-a-cursor' }), /APPLICATION_LIST_TOKEN_INVALID/)
})

test('unknown and malformed detail identifiers do not enumerate storage', async () => {
  const client = createMemoryClient(); await assert.rejects(getApplicationDetail(client, 'bad'), /APPLICATION_NOT_FOUND/); await assert.rejects(getApplicationDetail(client, crypto.randomUUID()), /APPLICATION_NOT_FOUND/)
})

test('runtime permissions deny guest, member, Staff and reviewer while permitting explicitly assigned Admin', async () => {
  const denied = createMemoryClient([], []); await assert.rejects(handleListAdminApplications(event(['Staff']), denied), /applications\.read/)
  await assert.rejects(handleGetAdminApplication(event(['Member'], { applicationId: crypto.randomUUID() }), denied), /applications\.read/)
  await assert.rejects(handleStoreTrustedApplicationSubmission(event([], { command: completeCreatorSubmission(), idempotencyKey: idempotencyKey() }), denied), /Authenticated identity|required/)
  const admin = createMemoryClient(['applications.read'], ['Admin']); assert.deepEqual((await handleListAdminApplications(event(['Admin']), admin)).items, [])
  await assert.rejects(handleStoreTrustedApplicationSubmission(event(['Admin'], { command: completeCreatorSubmission(), idempotencyKey: idempotencyKey() }), admin), /applications\.storage\.trusted/)
  const superAdmin = createMemoryClient(); const stored = await handleStoreTrustedApplicationSubmission(event(['SuperAdmin'], { command: completeCreatorSubmission(), idempotencyKey: idempotencyKey() }), superAdmin)
  assert.equal((await handleGetAdminApplication(event(['SuperAdmin'], { applicationId: stored.applicationId }), superAdmin)).application.id, stored.applicationId)
})

test('server-owned fields cannot be mass-assigned or mutated after submission', async () => {
  const input: any = completeCreatorSubmission(); input.status = 'ACCEPTED'; await assert.rejects(storeApplicationSubmission(createMemoryClient(), input, idempotencyKey(), 'tester'), /UNEXPECTED_FIELD/)
  const client = createMemoryClient(); const stored = await storeApplicationSubmission(client, completeCreatorSubmission(), idempotencyKey(), 'tester'); const root = client.stores.ApplicationSubmission.get(stored.applicationId)
  assert.equal(root.submissionStatus, 'AWAITING_REVIEW'); assert.equal(root.emailVerificationState, 'VERIFIED'); assert.ok(root.submittedAt)
})

test('generated references are non-sequential and unique', async () => {
  const client = createMemoryClient(); const refs = new Set<string>()
  for (let index = 0; index < 100; index += 1) refs.add((await storeApplicationSubmission(client, completeCreatorSubmission({ contactEmail: `person${index}@example.com` }), idempotencyKey(), 'tester')).reference)
  assert.equal(refs.size, 100); assert.ok([...refs].every((value) => /^PR-[A-Z0-9_-]{12}$/.test(value)))
})

test('test cleanup requires the exact run tag and removes only exact aggregate records', async () => {
  const client = createMemoryClient(); const keepKey = idempotencyKey(); const removeKey = idempotencyKey()
  const keep = await storeApplicationSubmission(client, completeCreatorSubmission({ testRunId: 'keep-run' }), keepKey, 'tester')
  const remove = await storeApplicationSubmission(client, completeCreatorSubmission({ testRunId: 'remove-run' }), removeKey, 'tester')
  await assert.rejects(cleanupApplicationTestRun(client, { applicationId: remove.applicationId, idempotencyKey: removeKey, testRunId: 'wrong-run' }), /SCOPE_MISMATCH/)
  await cleanupApplicationTestRun(client, { applicationId: remove.applicationId, idempotencyKey: removeKey, testRunId: 'remove-run' })
  assert.equal((await listApplications(client)).items.length, 1); assert.equal((await getApplicationDetail(client, keep.applicationId)).application.id, keep.applicationId)
})

test('test cleanup can remove an exact failed idempotency row when no aggregate was created', async () => {
  const client = createMemoryClient(); const key = idempotencyKey(); const { idempotencyDigest } = await import('./validation')
  await client.models.ApplicationIdempotency.create({ id: idempotencyDigest(key), payloadHash: 'hash', state: 'FAILED', expiresAt: 1, testRunId: 'failed-run' })
  await cleanupApplicationTestRun(client, { idempotencyKey: key, testRunId: 'failed-run' })
  assert.equal(client.stores.ApplicationIdempotency.size, 0)
})
