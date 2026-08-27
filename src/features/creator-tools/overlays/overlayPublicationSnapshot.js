import { cloneSerializableData } from './overlaySnapshots.js';

const triggeredAlertTypes = new Set(['alerts', 'subscription-alert', 'raid-alert']);
const canonicalTopicsByType = Object.freeze({
  alerts: ['stream.follow', 'stream.subscription', 'stream.cheer', 'stream.raid', 'reward.redeemed'],
  'subscription-alert': ['stream.subscription'],
  'raid-alert': ['stream.raid'],
  'twitch-chat': ['chat.message'],
  tts: ['tts.requested'],
});

export function widgetDisplayMode(widget) {
  if (widget?.displayMode === 'triggered' || widget?.displayMode === 'always') return widget.displayMode;
  return triggeredAlertTypes.has(widget?.type) ? 'triggered' : 'always';
}

export function createPublicationSceneSnapshot(scene) {
  const snapshot = cloneSerializableData(scene);
  snapshot.widgets = (snapshot.widgets || []).map((widget) => {
    const configuredTopics = Array.isArray(widget.dataSource?.topics) ? widget.dataSource.topics : [];
    return {
      ...widget,
      displayMode: widgetDisplayMode(widget),
      dataSource: {
        ...(widget.dataSource || {}),
        topics: configuredTopics.length ? configuredTopics : [...(canonicalTopicsByType[widget.type] || [])],
      },
    };
  });
  return snapshot;
}
