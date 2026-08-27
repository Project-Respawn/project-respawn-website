import assert from 'node:assert/strict';
import test from 'node:test';
import { createPublicationSceneSnapshot, widgetDisplayMode } from '../overlayPublicationSnapshot.js';

test('publication materializes computed alert display modes without mutating editor state', () => {
  const scene = { widgets: [
    { id: 'follow', type: 'alerts', dataSource: { provider: 'demo', topics: [] } },
    { id: 'raid', type: 'raid-alert', displayMode: 'always' },
    { id: 'chat', type: 'twitch-chat' },
  ] };
  const snapshot = createPublicationSceneSnapshot(scene);
  assert.deepEqual(snapshot.widgets.map((widget) => widget.displayMode), ['triggered', 'always', 'always']);
  assert.deepEqual(snapshot.widgets[0].dataSource.topics, ['stream.follow', 'stream.subscription', 'stream.cheer', 'stream.raid', 'reward.redeemed']);
  assert.deepEqual(snapshot.widgets[2].dataSource.topics, ['chat.message']);
  assert.equal(scene.widgets[0].displayMode, undefined);
});

test('explicit canonical widget topics are retained', () => {
  const snapshot = createPublicationSceneSnapshot({ widgets: [{ type: 'alerts', dataSource: { topics: ['stream.raid'] } }] });
  assert.deepEqual(snapshot.widgets[0].dataSource.topics, ['stream.raid']);
});

test('renderer derives the same triggered default for legacy alert snapshots', () => {
  assert.equal(widgetDisplayMode({ type: 'subscription-alert' }), 'triggered');
  assert.equal(widgetDisplayMode({ type: 'tts' }), 'triggered');
  assert.equal(widgetDisplayMode({ type: 'twitch-chat' }), 'always');
});
