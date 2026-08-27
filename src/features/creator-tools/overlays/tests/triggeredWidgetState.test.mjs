import assert from 'node:assert/strict';
import test from 'node:test';
import { createWidgetEventBus } from '../widgetEventBus.js';
import { createTriggeredWidgetSubscription } from '../triggeredWidgetState.js';

function harness(topics) {
  const bus = createWidgetEventBus();
  const visibility = [];
  let expired = 0;
  let timeout = null;
  const dispose = createTriggeredWidgetSubscription({ dataSource: { topics }, settings: { duration: 2 } }, {
    bus,
    onVisibility: (visible) => visibility.push(visible),
    onExpired: () => { expired += 1; },
    setTimer: (handler, delay) => { timeout = { handler, delay }; return 1; },
    clearTimer: () => { timeout = null; },
  });
  return { bus, visibility, dispose, getTimeout: () => timeout, getExpired: () => expired };
}

for (const topic of ['stream.follow', 'stream.subscription', 'stream.raid']) {
  test(`${topic} reaches its matching triggered alert`, () => {
    const state = harness([topic]);
    state.bus.publish({ topic });
    assert.deepEqual(state.visibility, [true]);
    assert.equal(state.getTimeout().delay, 2000);
    state.getTimeout().handler();
    assert.deepEqual(state.visibility, [true, false]);
    assert.equal(state.getExpired(), 1);
    state.dispose();
  });
}

test('unrelated events do not trigger a widget', () => {
  const state = harness(['stream.follow']);
  state.bus.publish({ topic: 'stream.raid' });
  assert.deepEqual(state.visibility, []);
  state.dispose();
});

test('canonical runtime settings suppress disabled alerts and override snapshot duration', () => {
  const bus = createWidgetEventBus(), visibility = []; let delay = null;
  createTriggeredWidgetSubscription({ dataSource: { topics: ['stream.follow'] }, settings: { duration: 99 } }, { bus, onVisibility: value => visibility.push(value), runtimeSettings: { enabled: false, duration: 3 }, setTimer: (_handler, value) => { delay = value; return 1; } });
  bus.publish({ topic: 'stream.follow' }); assert.deepEqual(visibility, []); assert.equal(delay, null);
  createTriggeredWidgetSubscription({ dataSource: { topics: ['stream.raid'] }, settings: { duration: 99 } }, { bus, onVisibility: value => visibility.push(value), runtimeSettings: { enabled: true, duration: 3 }, setTimer: (_handler, value) => { delay = value; return 1; } });
  bus.publish({ topic: 'stream.raid' }); assert.deepEqual(visibility, [true]); assert.equal(delay, 3000);
});

test('a second matching event resets the timeout and can trigger again after hiding', () => {
  const state = harness(['stream.follow']);
  state.bus.publish({ topic: 'stream.follow' });
  const firstTimeout = state.getTimeout();
  firstTimeout.handler();
  state.bus.publish({ topic: 'stream.follow' });
  assert.deepEqual(state.visibility, [true, false, true]);
  assert.notEqual(state.getTimeout(), firstTimeout);
  state.dispose();
});

test('chat messages continue through the shared event bus to chat widgets', () => {
  const bus = createWidgetEventBus();
  let received = null;
  const dispose = bus.subscribe('chat.message', (event) => { received = event; });
  bus.publish({ topic: 'chat.message', payload: { text: 'hello' } });
  assert.equal(received.payload.text, 'hello');
  dispose();
});
