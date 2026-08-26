export const OVERLAY_EVENT_VERSION = 1;

export const OVERLAY_EVENT_TYPES = Object.freeze([
  'chat.message',
  'stream.follow',
  'stream.subscription',
  'stream.raid',
  'stream.cheer',
  'reward.redeemed',
  'tts.requested',
]);

const allowedTypes = new Set(OVERLAY_EVENT_TYPES);
const allowedSources = new Set(['test', 'twitch', 'respawn']);

export function parseOverlayEvent(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  if (value.version !== OVERLAY_EVENT_VERSION || !allowedTypes.has(value.type)) return null;
  if (!allowedSources.has(value.source) || !Number.isFinite(Date.parse(value.timestamp))) return null;
  if (!value.data || typeof value.data !== 'object' || Array.isArray(value.data)) return null;
  return {
    version: OVERLAY_EVENT_VERSION,
    id: typeof value.id === 'string' ? value.id : '',
    type: value.type,
    timestamp: value.timestamp,
    source: value.source,
    data: {
      actor: value.data.actor && typeof value.data.actor === 'object' ? value.data.actor : null,
      payload: value.data.payload && typeof value.data.payload === 'object' ? value.data.payload : {},
    },
  };
}

export function toWidgetEvent(value) {
  const event = parseOverlayEvent(value);
  if (!event) return null;
  return {
    id: event.id || `${event.type}:${event.timestamp}`,
    version: event.version,
    topic: event.type,
    occurredAt: event.timestamp,
    provider: event.source,
    actor: event.data.actor,
    payload: event.data.payload,
  };
}

export function createTestOverlayEvent(type, overrides = {}) {
  if (!allowedTypes.has(type)) throw new Error(`Unsupported overlay event type: ${type}`);
  const samples = {
    'chat.message': { actor: { displayName: 'RespawnTester' }, payload: { platform: 'Twitch', text: 'Project Respawn Browser Source test', isBot: false } },
    'stream.follow': { actor: { displayName: 'TestFollower' }, payload: {} },
    'stream.subscription': { actor: { displayName: 'TestSubscriber' }, payload: { tier: '1' } },
    'stream.raid': { actor: { displayName: 'TestRaider' }, payload: { viewers: 42 } },
    'stream.cheer': { actor: { displayName: 'TestCheerer' }, payload: { bits: 500 } },
    'reward.redeemed': { actor: { displayName: 'TestViewer' }, payload: { reward: 'Test redemption' } },
    'tts.requested': { actor: { displayName: 'VoiceTester' }, payload: { text: 'Project Respawn text to speech test', status: 'queued' } },
  };
  return {
    version: OVERLAY_EVENT_VERSION,
    id: overrides.id || `test-${type}-${Date.now()}`,
    type,
    timestamp: overrides.timestamp || new Date().toISOString(),
    source: 'test',
    data: samples[type],
  };
}
