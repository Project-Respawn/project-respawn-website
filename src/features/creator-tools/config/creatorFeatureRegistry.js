export const CREATOR_FEATURE_STATUS = Object.freeze({
  LIVE: 'live',
  PREVIEW: 'preview',
  COMING_SOON: 'coming-soon',
})


export const creatorFeatureRegistry = Object.freeze({

  dashboard: {
    label: 'Creator Dashboard',
    icon: 'dashboard',
    routeName: 'CreatorDashboard',
    status: CREATOR_FEATURE_STATUS.LIVE
  },

  profile: {
    label: 'Creator Profile',
    icon: 'profile',
    routeName: 'CreatorProfile',
    status: CREATOR_FEATURE_STATUS.PREVIEW
  },

  setup: {
    label: 'Setup',
    icon: 'setup',
    routeName: 'CreatorSetup',
    status: CREATOR_FEATURE_STATUS.COMING_SOON
  },

  twitch: {
    label: 'Twitch',
    icon: 'twitch',
    routeName: 'CreatorTwitch',
    status: CREATOR_FEATURE_STATUS.PREVIEW
  },

  discord: {
    label: 'Discord',
    icon: 'discord',
    routeName: 'CreatorDiscord',
    status: CREATOR_FEATURE_STATUS.PREVIEW
  },

  bots: {
    label: 'Bots',
    icon: 'bots',
    routeName: 'CreatorBots',
    status: CREATOR_FEATURE_STATUS.LIVE
  },

  chat: {
    id: 'chat',
    label: 'Chat',
    icon: 'chat',
    routeName: 'CreatorChat',
    routePath: '/creator-tools/chat',
    navigationGroup: 'Tools',
    status: CREATOR_FEATURE_STATUS.PREVIEW,
    description:
      'Configure unified stream chat sources, appearance and behaviour.',
    showInSidebar: true,
    showInMobileNavigation: true
  },

  overlays: {
    id: 'overlays',
    label: 'Overlay Builder',
    icon: 'overlays',
    routeName: 'CreatorOverlays',
    routePath: '/creator-tools/overlays',
    activeRouteNames: [
      'CreatorOverlays',
      'CreatorOverlayLibrary',
      'CreatorOverlayEditor'
    ],
    navigationGroup: 'Tools',
    status: CREATOR_FEATURE_STATUS.PREVIEW,
    description:
      'Build and preview browser-local Universal Overlay scenes and widgets.',
    showInSidebar: true,
    showInMobileNavigation: true
  },

  community: {
    label: 'Community',
    icon: 'community',
    routeName: 'CreatorCommunity',
    status: CREATOR_FEATURE_STATUS.PREVIEW
  },

  events: {
    label: 'Events',
    icon: 'events',
    routeName: 'CreatorEvents',
    status: CREATOR_FEATURE_STATUS.PREVIEW
  },

  rewards: {
    label: 'Rewards',
    icon: 'rewards',
    routeName: 'CreatorRewards',
    status: CREATOR_FEATURE_STATUS.PREVIEW
  },

  achievements: {
    label: 'Achievements',
    icon: 'achievements',
    routeName: 'CreatorAchievements',
    status: CREATOR_FEATURE_STATUS.PREVIEW
  },

  members: {
    label: 'Members',
    icon: 'members',
    routeName: 'CreatorMembers',
    status: CREATOR_FEATURE_STATUS.PREVIEW
  },

  analytics: {
    label: 'Analytics',
    icon: 'analytics',
    routeName: 'CreatorAnalytics',
    status: CREATOR_FEATURE_STATUS.PREVIEW
  },

  integrations: {
    label: 'Integrations',
    icon: 'integrations',
    routeName: 'CreatorIntegrations',
    status: CREATOR_FEATURE_STATUS.PREVIEW
  }

})


export const creatorNavigation = Object.freeze([

  {
    label: 'Overview',
    items: [
      'dashboard',
      'profile',
      'setup'
    ]
  },

  {
    label: 'Channels',
    items: [
      'twitch',
      'discord'
    ]
  },

  {
    label: 'Tools',
    items: [
      'chat',
      'overlays',
      'bots',
      'community',
      'events'
    ]
  },

  {
    label: 'Growth',
    items: [
      'rewards',
      'achievements',
      'members',
      'analytics'
    ]
  },

  {
    label: 'Configuration',
    items: [
      'integrations'
    ]
  }

])


export function getCreatorFeature(key) {
  return creatorFeatureRegistry[key]
}