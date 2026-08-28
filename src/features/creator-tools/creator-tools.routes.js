import CreatorLayout from './components/CreatorLayout.vue'

import CreatorDashboard from './views/dashboard/CreatorDashboard.vue'
import CreatorProfile from './views/profile/CreatorProfile.vue'
import CreatorDiscord from './views/discord/CreatorDiscord.vue'
import CreatorCommunity from './views/community/CreatorCommunity.vue'
import CreatorRewards from './views/rewards/CreatorRewards.vue'
import CreatorAchievements from './views/achievements/CreatorAchievements.vue'
import CreatorEvents from './views/events/CreatorEvents.vue'
import CreatorMembers from './views/members/CreatorMembers.vue'
import CreatorAnalytics from './views/analytics/CreatorAnalytics.vue'
import CreatorSetup from './views/setup/CreatorSetup.vue'
import CreatorChat from './views/chat/CreatorChat.vue'

import BotsOverview from './views/bots/overview/BotsOverview.vue'
import Automation from './views/bots/automation/Automation.vue'

import TwitchOverview from './views/twitch/overview/TwitchOverview.vue'
import BasicCommands from './views/twitch/commands/basic/BasicCommands.vue'
import TwitchAlerts from './views/twitch/alerts/TwitchAlerts.vue'
import TextToSpeech from './views/twitch/text-to-speech/TextToSpeech.vue'
import TwitchModeration from './views/twitch/moderation/TwitchModeration.vue'

import Integrations from './views/integrations/Integrations.vue'

import OverlayManager from './views/overlays/OverlayManager.vue'
import OverlayEditor from './views/overlays/OverlayEditor.vue'
import OverlayEntry from './views/overlays/OverlayEntry.vue'
import OverlayBrowserSource from './views/overlays/OverlayBrowserSource.vue'

import Overlay from '../../views/Bot/OverlayEngine/Overlay.vue'


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