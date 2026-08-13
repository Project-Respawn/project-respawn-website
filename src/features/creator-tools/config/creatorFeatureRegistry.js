export const CREATOR_FEATURE_STATUS = Object.freeze({
  LIVE: 'live',
  PREVIEW: 'preview',
  COMING_SOON: 'coming-soon',
})

export const creatorFeatureRegistry = Object.freeze({
  dashboard: { label: 'Creator Dashboard', routeName: 'CreatorDashboard', status: CREATOR_FEATURE_STATUS.LIVE },
  setup: { label: 'Setup', routeName: 'CreatorSetup', status: CREATOR_FEATURE_STATUS.COMING_SOON },
  twitch: { label: 'Twitch', routeName: 'CreatorTwitch', status: CREATOR_FEATURE_STATUS.PREVIEW },
  discord: { label: 'Discord', routeName: 'CreatorDiscord', status: CREATOR_FEATURE_STATUS.PREVIEW },
  bots: { label: 'Bots', routeName: 'CreatorBots', status: CREATOR_FEATURE_STATUS.LIVE },
  overlays: {
    id: 'overlays',
    label: 'Overlays',
    icon: '▧',
    routeName: 'CreatorOverlays',
    routePath: '/creator-tools/overlays',
    activeRouteNames: ['CreatorOverlays', 'CreatorOverlayEditor'],
    navigationGroup: 'Tools',
    status: CREATOR_FEATURE_STATUS.PREVIEW,
    description: 'Build and preview browser-local Universal Widget overlay layouts.',
    showInSidebar: true,
    showInMobileNavigation: true,
  },
  community: { label: 'Community', routeName: 'CreatorCommunity', status: CREATOR_FEATURE_STATUS.COMING_SOON },
  events: { label: 'Events', routeName: 'CreatorEvents', status: CREATOR_FEATURE_STATUS.COMING_SOON },
  rewards: { label: 'Rewards', routeName: 'CreatorRewards', status: CREATOR_FEATURE_STATUS.COMING_SOON },
  achievements: { label: 'Achievements', routeName: 'CreatorAchievements', status: CREATOR_FEATURE_STATUS.COMING_SOON },
  members: { label: 'Members', routeName: 'CreatorMembers', status: CREATOR_FEATURE_STATUS.COMING_SOON },
  analytics: { label: 'Analytics', routeName: 'CreatorAnalytics', status: CREATOR_FEATURE_STATUS.PREVIEW },
  integrations: { label: 'Integrations', routeName: 'CreatorIntegrations', status: CREATOR_FEATURE_STATUS.PREVIEW },
})

export const creatorNavigation = Object.freeze([
  { label: 'Overview', items: ['dashboard', 'setup'] },
  { label: 'Channels', items: ['twitch', 'discord'] },
  { label: 'Tools', items: ['overlays', 'bots', 'community', 'events'] },
  { label: 'Growth', items: ['rewards', 'achievements', 'members', 'analytics'] },
  { label: 'Configuration', items: ['integrations'] },
])

export function getCreatorFeature(key) {
  return creatorFeatureRegistry[key]
}
