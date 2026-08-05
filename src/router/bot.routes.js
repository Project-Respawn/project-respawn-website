// src/router/bot.routes.js

import BotOverview from '../views/Bot/Overview/BotOverview.vue';
import BotTwitch from '../views/Bot/Twitch/BotTwitch.vue';
import BotDiscord from '../views/Bot/Discord/BotDiscord.vue';
import BotAutomation from '../views/Bot/Automation/BotAutomation.vue';
import BotSettings from '../views/Bot/Settings/BotSettings.vue';

import Overlay from '../views/Bot/OverlayEngine/Overlay.vue';

import Moderation from '../views/Bot/Twitch/Moderation/Moderation.vue';
import TtsSettings from '../views/Bot/Twitch/TTS/Settings/TtsSettings.vue';
import TwitchCommands from '../views/Bot/Twitch/TwitchCommands/TwitchCommands.vue';
import BotAlerts from '../views/Bot/Twitch/Alerts/BotAlerts.vue';

export default [

    { path: '/bot', component: BotOverview },

    { path: '/bot/twitch', component: BotTwitch },

    { path: '/bot/twitch/commands', component: TwitchCommands },

    { path: '/bot/twitch/alerts', component: BotAlerts },

    { path: '/bot/twitch/tts', component: TtsSettings },

    { path: '/bot/twitch/moderation', component: Moderation },

    {
        path: '/tts-overlay',
        component: Overlay,
        meta: {
            hideLayout: true
        }
    },

    { path: '/bot/discord', component: BotDiscord },

    { path: '/bot/automation', component: BotAutomation },

    { path: '/bot/settings', component: BotSettings }

];