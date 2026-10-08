const CreatorLayout = () => import('./components/CreatorLayout.vue');

const CreatorDashboard = () => import('./views/dashboard/CreatorDashboard.vue');
const CreatorProfile = () => import('./views/profile/CreatorProfile.vue');
const CreatorDiscord = () => import('./views/discord/CreatorDiscord.vue');
const CreatorCommunity = () => import('./views/community/CreatorCommunity.vue');
const CreatorRewards = () => import('./views/rewards/CreatorRewards.vue');
const CreatorAchievements = () => import('./views/achievements/CreatorAchievements.vue');
const CreatorEvents = () => import('./views/events/CreatorEvents.vue');
const CreatorMembers = () => import('./views/members/CreatorMembers.vue');
const CreatorAnalytics = () => import('./views/analytics/CreatorAnalytics.vue');
const CreatorSetup = () => import('./views/setup/CreatorSetup.vue');
const CreatorChat = () => import('./views/chat/CreatorChat.vue');

const BotsOverview = () => import('./views/bots/overview/BotsOverview.vue');
const Automation = () => import('./views/bots/automation/Automation.vue');

const TwitchOverview = () => import('./views/twitch/overview/TwitchOverview.vue');
const BasicCommands = () => import('./views/twitch/commands/basic/BasicCommands.vue');
const TwitchAlerts = () => import('./views/twitch/alerts/TwitchAlerts.vue');
const TextToSpeech = () => import('./views/twitch/text-to-speech/TextToSpeech.vue');
const TwitchModeration = () => import('./views/twitch/moderation/TwitchModeration.vue');

const Integrations = () => import('./views/integrations/Integrations.vue');

const OverlayManager = () => import('./views/overlays/OverlayManager.vue');
const OverlayEditor = () => import('./views/overlays/OverlayEditor.vue');
const OverlayEntry = () => import('./views/overlays/OverlayEntry.vue');
const OverlayBrowserSource = () => import('./views/overlays/OverlayBrowserSource.vue');

const Overlay = () => import('../../views/Bot/OverlayEngine/Overlay.vue');


const protectedCreatorRoute = {
  requiresAuth: true,
  hideLayout: true,
}


export default [
  {
    path: '/overlay-source/:credential',
    name: 'OverlayBrowserSource',
    component: OverlayBrowserSource,
    meta: {
      hideLayout: true
    }
  },

  {
    path: '/creator-tools',
    component: CreatorLayout,
    meta: protectedCreatorRoute,

    children: [
      {
        path: '',
        name: 'CreatorDashboard',
        component: CreatorDashboard,
        meta: {
          creatorFeature: 'dashboard'
        }
      },

      {
        path: 'profile',
        name: 'CreatorProfile',
        component: CreatorProfile,
        meta: {
          creatorFeature: 'profile'
        }
      },

      {
        path: 'twitch',
        name: 'CreatorTwitch',
        component: TwitchOverview,
        alias: '/bot/twitch',
        meta: {
          creatorFeature: 'twitch'
        }
      },

      {
        path: 'discord',
        name: 'CreatorDiscord',
        component: CreatorDiscord,
        alias: '/bot/discord',
        meta: {
          creatorFeature: 'discord'
        }
      },

      {
        path: 'bots',
        name: 'CreatorBots',
        component: BotsOverview,
        alias: '/bot',
        meta: {
          creatorFeature: 'bots'
        }
      },

      {
        path: 'bots/twitch/commands',
        name: 'CreatorTwitchCommands',
        component: BasicCommands,
        alias: '/bot/twitch/commands',
        meta: {
          creatorFeature: 'bots'
        }
      },

      {
        path: 'bots/twitch/alerts',
        name: 'CreatorTwitchAlerts',
        component: TwitchAlerts,
        alias: '/bot/twitch/alerts',
        meta: {
          creatorFeature: 'bots'
        }
      },

      {
        path: 'bots/twitch/tts',
        name: 'CreatorTwitchTts',
        component: TextToSpeech,
        alias: '/bot/twitch/tts',
        meta: {
          creatorFeature: 'bots'
        }
      },

      {
        path: 'bots/moderation',
        name: 'CreatorBotModeration',
        component: TwitchModeration,
        alias: '/bot/twitch/moderation',
        meta: {
          creatorFeature: 'bots'
        }
      },

      {
        path: 'bots/automation',
        name: 'CreatorBotAutomation',
        component: Automation,
        alias: '/bot/automation',
        meta: {
          creatorFeature: 'bots'
        }
      },

      {
        path: 'chat',
        name: 'CreatorChat',
        component: CreatorChat,
        meta: {
          creatorFeature: 'chat'
        }
      },

      {
        path: 'overlays',
        name: 'CreatorOverlays',
        component: OverlayEntry,
        meta: {
          creatorFeature: 'overlays'
        }
      },

      {
        path: 'overlays/library',
        name: 'CreatorOverlayLibrary',
        component: OverlayManager,
        meta: {
          creatorFeature: 'overlays'
        }
      },

      {
        path: 'overlays/:overlayId',
        name: 'CreatorOverlayEditor',
        component: OverlayEditor,
        meta: {
          creatorFeature: 'overlays'
        }
      },

      {
        path: 'community',
        name: 'CreatorCommunity',
        component: CreatorCommunity,
        meta: {
          creatorFeature: 'community'
        }
      },

      {
        path: 'rewards',
        name: 'CreatorRewards',
        component: CreatorRewards,
        meta: {
          creatorFeature: 'rewards'
        }
      },

      {
        path: 'achievements',
        name: 'CreatorAchievements',
        component: CreatorAchievements,
        meta: {
          creatorFeature: 'achievements'
        }
      },

      {
        path: 'events',
        name: 'CreatorEvents',
        component: CreatorEvents,
        meta: {
          creatorFeature: 'events'
        }
      },

      {
        path: 'members',
        name: 'CreatorMembers',
        component: CreatorMembers,
        meta: {
          creatorFeature: 'members'
        }
      },

      {
        path: 'analytics',
        name: 'CreatorAnalytics',
        component: CreatorAnalytics,
        meta: {
          creatorFeature: 'analytics'
        }
      },

      {
        path: 'integrations',
        name: 'CreatorIntegrations',
        component: Integrations,
        alias: '/bot/settings',
        meta: {
          creatorFeature: 'integrations'
        }
      },

      {
        path: 'setup',
        name: 'CreatorSetup',
        component: CreatorSetup,
        meta: {
          creatorFeature: 'setup'
        }
      }
    ]
  },

  {
    path: '/tts-overlay',
    component: Overlay,
    meta: {
      hideLayout: true
    }
  }
]