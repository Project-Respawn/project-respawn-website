import { cloneSerializableData } from './overlaySnapshots.js';
import { ALERT_WIDGETS, ALERT_BEHAVIOR_KEYS } from './alertWidgets.js';

const triggeredWidgetTypes = new Set(['alerts', ...Object.keys(ALERT_WIDGETS), 'tts']);
const canonicalTopicsByType = Object.freeze({
  alerts: ['stream.follow', 'stream.subscription', 'stream.cheer', 'stream.raid', 'reward.redeemed'],
  'subscription-alert': ['stream.subscription'],
  'raid-alert': ['stream.raid'],
  'twitch-chat': ['chat.message'],
  tts: ['tts.requested'],
});
const twitchBehaviorKeysByType = Object.freeze({
  alerts: ['enabledEvents', 'messageTemplate', 'duration', 'minimumCheer', 'soundPlaceholder', 'mediaPlaceholder'],
  'subscription-alert': ['title'], 'raid-alert': ['title'], tts: ['duration'],
  'twitch-chat': ['platforms', 'maxMessages', 'hideBotMessages', 'hideCommands', 'showUsername', 'showBadges', 'showEmotes', 'messageDuration', 'direction', 'fontSize', 'backgroundOpacity', 'animation'],
});
function overlayOwnedSettings(widget) { const settings = { ...(widget.settings || {}) }; for (const key of ALERT_WIDGETS[widget.type] ? ALERT_BEHAVIOR_KEYS : twitchBehaviorKeysByType[widget.type] || []) delete settings[key]; return settings; }

export function widgetDisplayMode(widget) {
  if (triggeredWidgetTypes.has(widget?.type)) return 'triggered';
  if (widget?.displayMode === 'triggered' || widget?.displayMode === 'always') return widget.displayMode;
  return 'always';
}

export function createPublicationSceneSnapshot(scene) {
  const snapshot = cloneSerializableData(scene);
  snapshot.widgets = (snapshot.widgets || [])
    .filter((widget) => widget?.enabled !== false && widget?.hidden !== true)
    .map((widget) => {
    const configuredTopics = Array.isArray(widget.dataSource?.topics) ? widget.dataSource.topics : [];
    return {
      ...widget,
      settings: overlayOwnedSettings(widget),
      displayMode: widgetDisplayMode(widget),
      dataSource: {
        ...(widget.dataSource || {}),
        topics: ALERT_WIDGETS[widget.type] ? [ALERT_WIDGETS[widget.type].topic] : configuredTopics.length ? configuredTopics : [...(canonicalTopicsByType[widget.type] || [])],
      },
    };
    });
  return snapshot;
}
