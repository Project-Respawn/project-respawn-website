import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home/Home.vue'
import About from '../views/About/About.vue'
import Contact from '../views/Contact/Contact.vue'
import NotFound from '../views/NotFound/NotFound.vue'
import PrivacyPolicy from '../views/PrivacyPolicy/PrivacyPolicy.vue'
import TeamTryouts from '../views/TeamTryouts/TeamTryouts.vue'
import Merch from '../views/Merch/Merch.vue'
import Events from '../views/Events/Events.vue'
import Checkout from '../views/Checkout/Checkout.vue'
import Join from '../views/Join/Join.vue'
import Account from '../views/Account/Account.vue'
import Dashboard from '../views/Dashboard/Dashboard.vue'
import Roles from '../views/About/Roles/Roles.vue'
import BotOverview from '../views/Bot/Overview/BotOverview.vue'
import BotTwitch from '../views/Bot/Twitch/BotTwitch.vue'
import BotDiscord from '../views/Bot/Discord/BotDiscord.vue'
import BotAutomation from '../views/Bot/Automation/BotAutomation.vue'
import BotSettings from '../views/Bot/Settings/BotSettings.vue'
import TtsSettings from '../views/Bot/TTS/Settings/TtsSettings.vue'
import TtsOverlay from '../views/Bot/TTS/TtsOverlay.vue'
import TwitchCommands from '../views/Bot/TTS/TwitchCommands/TwitchCommands'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/about/Roles', component: Roles },
  { path: '/contact', component: Contact },
  { path: '/privacy-policy', component: PrivacyPolicy },
  { path: '/team-tryouts', component: TeamTryouts },
  { path: '/merch', component: Merch },
  { path: '/checkout', component: Checkout },
  { path: '/events', component: Events },
  { path: '/join', component: Join },
  { path: '/account', component: Account },
  { path: '/dashboard', component: Dashboard, meta: { hideLayout: true } },
  { path: '/bot', component: BotOverview },
  { path: '/bot/twitch', component: BotTwitch },
  { path: '/bot/twitch/commands', component: TwitchCommands },
  { path: '/bot/twitch/tts', component: TtsSettings },
  { path: '/tts-overlay', component: TtsOverlay, meta: { hideLayout: true } },
  { path: '/bot/discord', component: BotDiscord },
  { path: '/bot/automation', component: BotAutomation },
  { path: '/bot/settings', component: BotSettings },
  { path: '/:pathMatch(.*)', component: NotFound },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

export default router