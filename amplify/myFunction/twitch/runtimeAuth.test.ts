import assert from 'node:assert/strict'
import test from 'node:test'
import { createRuntimeLease, signRuntimeRequest, verifyRuntimeLease, verifyRuntimeRequest } from './runtimeAuth'

test('runtime request signatures bind method path body timestamp and nonce', () => {
  const input = { method: 'POST', path: '/twitch/runtime/lease', timestamp: new Date(1000).toISOString(), nonce: 'a-secure-test-nonce', body: { integrationId: 'i-1' } }
  const signature = signRuntimeRequest(input, 'secret')
  assert.equal(verifyRuntimeRequest(input, signature, 'secret', 1000), true)
  assert.throws(() => verifyRuntimeRequest({ ...input, body: { integrationId: 'i-2' } }, signature, 'secret', 1000), /signature/i)
  assert.throws(() => verifyRuntimeRequest(input, signature, 'secret', 100000), /stale/i)
})
test('runtime leases are integration scoped and operation constrained', () => {
  const lease = createRuntimeLease({ integrationId: 'i-1', brandId: 'b-1', broadcasterId: 't-1', operations: ['snapshot'] }, 'secret', 1000, 1000)
  assert.equal(verifyRuntimeLease(lease, 'secret', 'snapshot', 1500).brandId, 'b-1')
  assert.throws(() => verifyRuntimeLease(lease, 'secret', 'heartbeat', 1500), /permit/i)
  assert.throws(() => verifyRuntimeLease(lease, 'secret', 'snapshot', 2500), /expired/i)
})
