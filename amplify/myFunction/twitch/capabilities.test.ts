import assert from 'node:assert/strict'
import test from 'node:test'
import { deriveTwitchCapabilities } from './capabilities'
import { REQUIRED_BROADCASTER_SCOPES } from './integrationTypes'

test('Phase 1 capabilities are derived from least-privilege scopes', () => {
  const result = deriveTwitchCapabilities(REQUIRED_BROADCASTER_SCOPES, ['user:bot', 'user:read:chat', 'user:write:chat'])
  assert.equal(result.requiredScopesPresent, true)
  assert.equal(result.capabilities.chatRead, true)
  assert.equal(result.capabilities.chatWrite, true)
  assert.equal(result.capabilities.hypeTrainRead, false)
})
test('manage redemptions is not required for redemption events', () => {
  assert.equal(REQUIRED_BROADCASTER_SCOPES.includes('channel:manage:redemptions' as never), false)
})
