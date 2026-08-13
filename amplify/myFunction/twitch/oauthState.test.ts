import assert from 'node:assert/strict'
import test from 'node:test'
import { createOAuthState, verifyOAuthState } from './oauthState'

test('OAuth state is signed, transaction bound and expiring', () => {
  const state = createOAuthState('transaction-a', 'test-secret', 1000, 1000)
  assert.equal(verifyOAuthState(state.token, 'test-secret', 1500).transactionId, 'transaction-a')
  assert.throws(() => verifyOAuthState(state.token, 'wrong-secret', 1500), /signature/i)
  assert.throws(() => verifyOAuthState(state.token, 'test-secret', 2500), /expired/i)
})
