import assert from 'node:assert/strict';
import test from 'node:test';
import { createTestOverlayEvent, parseOverlayEvent, toWidgetEvent } from '../overlayEventContract.js';

for (const type of ['chat.message', 'stream.follow', 'stream.subscription', 'stream.raid', 'stream.cheer', 'reward.redeemed', 'tts.requested']) {
  test(`routes normalized ${type}`, () => {
    const event = createTestOverlayEvent(type, { id: `event-${type}`, timestamp: '2026-08-26T20:00:00.000Z' });
    assert.equal(parseOverlayEvent(event)?.type, type);
    assert.equal(toWidgetEvent(event)?.topic, type);
  });
}

test('rejects malformed, unversioned, and unsupported events', () => {
  assert.equal(parseOverlayEvent(null), null);
  assert.equal(parseOverlayEvent({ version: 2, type: 'stream.follow', timestamp: new Date().toISOString(), source: 'test', data: {} }), null);
  assert.equal(parseOverlayEvent({ version: 1, type: 'unknown', timestamp: new Date().toISOString(), source: 'test', data: {} }), null);
  assert.equal(parseOverlayEvent({ version: 1, type: 'stream.follow', timestamp: 'invalid', source: 'test', data: {} }), null);
});
