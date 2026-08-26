import CreatorLayout from './components/CreatorLayout.vue'

import CreatorDashboard from './views/dashboard/CreatorDashboard.vue'
import CreatorProfile from './views/profile/CreatorProfile.vue'

import CreatorDiscord from './views/discord/CreatorDiscord.vue'

import BotsOverview from './views/bots/overview/BotsOverview.vue'

import CreatorCommunity from './views/community/CreatorCommunity.vue'

import CreatorRewards from './views/rewards/CreatorRewards.vue'

import CreatorAchievements from './views/achievements/CreatorAchievements.vue'

import CreatorEvents from './views/events/CreatorEvents.vue'

import CreatorMembers from './views/members/CreatorMembers.vue'

import CreatorAnalytics from './views/analytics/CreatorAnalytics.vue'

import CreatorSetup from './views/setup/CreatorSetup.vue'

import TwitchOverview from './views/twitch/overview/TwitchOverview.vue'

import BasicCommands from './views/twitch/commands/basic/BasicCommands.vue'

import TwitchAlerts from './views/twitch/alerts/TwitchAlerts.vue'

import TextToSpeech from './views/twitch/text-to-speech/TextToSpeech.vue'

import TwitchModeration from './views/twitch/moderation/TwitchModeration.vue'

import Automation from './views/bots/automation/Automation.vue'

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
    meta: { hideLayout: true }
  },
  {
    path: '/creator-tools',
    component: CreatorLayout,
    meta: protectedCreatorRoute,

    children: [
      {
        path: '',
        name: 'CreatorDashboard',
        component: CreatorDashboard
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
        alias: '/bot/twitch'
      },

      {
        path: 'discord',
        name: 'CreatorDiscord',
        component: CreatorDiscord,
        alias: '/bot/discord'
      },

      {
        path: 'bots',
        name: 'CreatorBots',
        component: BotsOverview,
        alias: '/bot'
      },

      {
        path: 'bots/twitch/commands',
        name: 'CreatorTwitchCommands',
        component: BasicCommands,
        alias: '/bot/twitch/commands'
      },

      {
        path: 'bots/twitch/alerts',
        name: 'CreatorTwitchAlerts',
        component: TwitchAlerts,
        alias: '/bot/twitch/alerts'
      },

      {
        path: 'bots/twitch/tts',
        name: 'CreatorTwitchTts',
        component: TextToSpeech,
        alias: '/bot/twitch/tts'
      },

      {
        path: 'bots/moderation',
        name: 'CreatorBotModeration',
        component: TwitchModeration,
        alias: '/bot/twitch/moderation'
      },

      {
        path: 'bots/automation',
        name: 'CreatorBotAutomation',
        component: Automation,
        alias: '/bot/automation'
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
        component: CreatorCommunity
      },

      {
        path: 'rewards',
        name: 'CreatorRewards',
        component: CreatorRewards
      },

      {
        path: 'achievements',
        name: 'CreatorAchievements',
        component: CreatorAchievements
      },

      {
        path: 'events',
        name: 'CreatorEvents',
        component: CreatorEvents
      },

      {
        path: 'members',
        name: 'CreatorMembers',
        component: CreatorMembers
      },

      {
        path: 'analytics',
        name: 'CreatorAnalytics',
        component: CreatorAnalytics
      },

      {
        path: 'integrations',
        name: 'CreatorIntegrations',
        component: Integrations,
        alias: '/bot/settings'
      },

      {
        path: 'setup',
        name: 'CreatorSetup',
        component: CreatorSetup
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
