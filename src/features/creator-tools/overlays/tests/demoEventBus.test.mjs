import test from 'node:test'
import assert from 'node:assert/strict'
import { createDemoEvent, createDemoEventBus, DEMO_EVENT_TOPICS } from '../demoEventBus.js'

test('events are deterministic, provider-scoped, and routed by topic', () => {
  const bus=createDemoEventBus(); const seen=[]; const stop=bus.subscribe('chat.message',event=>seen.push(event)); const event=createDemoEvent('chat.message','overlay-1');bus.publish(event);stop();bus.publish(event)
  assert.equal(seen.length,1);assert.equal(seen[0].provider,'twitch');assert.equal(seen[0].actor.providerUserId,'demo-chat-1');assert.equal(DEMO_EVENT_TOPICS.length,10)
})
