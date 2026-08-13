import assert from 'node:assert/strict'
import test from 'node:test'
import { buildTwitchHealth } from './health'

test('health never fabricates live runtime state when heartbeat is stale', () => {
  const health = buildTwitchHealth({ id: 'i', brandId: 'b', connectionStatus: 'CONNECTED', tokenExpiresAt: '2030-01-01', configurationVersion: 2 }, { botConnected: true, eventSubConnected: true, lastBotHeartbeatAt: '1970-01-01', appliedConfigurationVersion: 1 }, Date.parse('2026-01-01'))
  assert.equal(health.botConnected, null)
  assert.equal(health.eventSubConnected, null)
  assert.ok(health.warnings.includes('BOT_HEARTBEAT_STALE'))
  assert.ok(health.warnings.includes('CONFIGURATION_OUT_OF_SYNC'))
})
