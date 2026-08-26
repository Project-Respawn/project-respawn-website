import assert from 'node:assert/strict'
import test from 'node:test'
import { twitchIntegrationCallbackUpdate } from './oauthHandlers'
import { REQUIRED_BROADCASTER_SCOPES } from './integrationTypes'

test('OAuth callback serializes non-empty Twitch capabilities for AWSJSON', () => {
  const input = twitchIntegrationCallbackUpdate(
    { integrationId: 'integration-1' },
    { id: 'broadcaster-1', login: 'creator', display_name: 'Creator' },
    [...REQUIRED_BROADCASTER_SCOPES],
    '2026-08-26T20:00:00.000Z',
  )
  assert.equal(input.id, 'integration-1')
  assert.equal(typeof input.capabilities, 'string')
  assert.equal(JSON.parse(input.capabilities as string).eventSub, true)
  assert.notEqual(input.capabilities, JSON.stringify(input.capabilities))
})
