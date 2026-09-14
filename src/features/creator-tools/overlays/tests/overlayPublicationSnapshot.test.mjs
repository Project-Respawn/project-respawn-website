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
  assert.deepEqual(snapshot.widgets.map((widget) => widget.displayMode), ['triggered', 'triggered', 'always']);
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

test('event-driven widgets cannot publish unsafe always-visible demo state', () => {
  for (const type of ['alerts', 'subscription-alert', 'raid-alert', 'tts']) {
    assert.equal(widgetDisplayMode({ type, displayMode: 'always' }), 'triggered');
  }
});

test('publication excludes disabled, hidden, and physically deleted widgets', () => {
  const visible = { id: 'visible', type: 'text', enabled: true, hidden: false };
  const disabled = { id: 'disabled', type: 'text', enabled: false };
  const hidden = { id: 'hidden', type: 'text', enabled: true, hidden: true };
  const deleted = { id: 'deleted', type: 'text', enabled: true };
  const scene = { widgets: [visible, disabled, hidden] };
  const snapshot = createPublicationSceneSnapshot(scene);
  assert.deepEqual(snapshot.widgets.map((widget) => widget.id), ['visible']);
  assert.equal(snapshot.widgets.some((widget) => widget.id === deleted.id), false);
  assert.equal(scene.widgets.length, 3, 'snapshotting must not mutate the editable project');
});
