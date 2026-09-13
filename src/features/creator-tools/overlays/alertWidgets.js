export const ALERT_WIDGETS = Object.freeze({
  'follow-alert': { kind: 'follow', topic: 'stream.follow', name: 'Follow Alert' },
  'subscription-alert': { kind: 'subscription', topic: 'stream.subscription', name: 'Subscription Alert' },
  'raid-alert': { kind: 'raid', topic: 'stream.raid', name: 'Raid Alert' },
  'cheer-alert': { kind: 'cheer', topic: 'stream.cheer', name: 'Bits Alert' },
  'redemption-alert': { kind: 'redemption', topic: 'reward.redeemed', name: 'Redemption Alert' },
})
export const ALERT_BEHAVIOR_KEYS = Object.freeze(['enabled', 'title', 'template', 'titleTemplate', 'messageTemplate', 'mediaUrl', 'soundUrl', 'volume', 'duration', 'entryAnimation', 'exitAnimation', 'animation'])
