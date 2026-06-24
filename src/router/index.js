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
import Roles from '../views/About/Roles/Roles.vue'
import UserHomepage from '../views/UserHomepage/UserHomepage.vue'

import BotOverview from '../views/Bot/Overview/BotOverview.vue'
import BotTwitch from '../views/Bot/Twitch/BotTwitch.vue'
import BotDiscord from '../views/Bot/Discord/BotDiscord.vue'
import BotAutomation from '../views/Bot/Automation/BotAutomation.vue'
import BotSettings from '../views/Bot/Settings/BotSettings.vue'
import TtsOverlay from '../views/Bot/Twitch/TTS/TtsOverlay.vue'
import Moderation from '../views/Bot/twitch/Moderation/Moderation.vue'
import TtsSettings from '../views/Bot/Twitch/TTS/Settings/TtsSettings.vue'
import TwitchCommands from '../views/Bot/Twitch/TwitchCommands/TwitchCommands.vue'
import BotAlerts from '../views/Bot/Twitch/Alerts/BotAlerts.vue'

import AdminLayout from '../views/Admin/AdminLayout/AdminLayout.vue'
import AdminHome from '../views/Admin/AdminHome/AdminHome.vue'
import AdminUsers from '../views/Admin/AdminUsers/AdminUsers.vue'
import AdminPermissions from '../views/Admin/AdminPermissions/AdminPermissions.vue'
import AdminBrands from '../views/Admin/AdminBrands/AdminBrands.vue'
import AdminMerchCategories from '../views/Admin/AdminMerchCategories/AdminMerchCategories.vue'
import AdminBrandPermissions from '../views/Admin/AdminBrandPermissions/AdminBrandPermissions.vue'
import AdminForums from '../views/Admin/AdminForums/AdminForums.vue'
import AdminEvents from '../views/Admin/AdminEvents/AdminEvents.vue'

import ForumLayout from '../views/Forum/ForumLayout/ForumLayout.vue'
import ForumIndex from '../views/Forum/ForumIndex/ForumIndex.vue'
import ForumBoard from '../views/Forum/ForumBoard/ForumBoard.vue'
import ForumThread from '../views/Forum/ForumThread/ForumThread.vue'

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
  {
    path: '/home',
    name: 'UserHomepage',
    component: UserHomepage,
    meta: { requiresAuth: true },
  },

  {
    path: '/dashboard',
    component: AdminLayout,
    meta: { hideLayout: true },
    children: [
      {
        path: '',
        name: 'AdminHome',
        component: AdminHome,
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: AdminUsers,
      },
      {
        path: 'permissions',
        name: 'AdminPermissions',
        component: AdminPermissions,
      },
      {
        path: 'events',
        name: 'AdminEvents',
        component: AdminEvents,
      },
      {
        path: 'forums',
        name: 'AdminForums',
        component: AdminForums,
      },
      {
        path: 'brands',
        name: 'AdminBrands',
        component: AdminBrands,
      },
      {
        path: 'merch-categories',
        name: 'AdminMerchCategories',
        component: AdminMerchCategories,
      },
      {
        path: 'brand-permissions',
        name: 'AdminBrandPermissions',
        component: AdminBrandPermissions,
      },
    ],
  },

  {
    path: '/forum',
    component: ForumLayout,
    children: [
      {
        path: '',
        name: 'ForumIndex',
        component: ForumIndex,
      },
      {
        path: 'board/:boardSlug',
        name: 'ForumBoard',
        component: ForumBoard,
        props: true,
      },
      {
        path: 'thread/:threadSlug',
        name: 'ForumThread',
        component: ForumThread,
        props: true,
      },
    ],
  },

  { path: '/bot', component: BotOverview },
  { path: '/bot/twitch', component: BotTwitch },
  { path: '/bot/twitch/commands', component: TwitchCommands },
  { path: '/bot/twitch/alerts', component: BotAlerts },
  { path: '/bot/twitch/tts', component: TtsSettings },
  { path: '/bot/twitch/moderation', component: Moderation },
  { path: '/tts-overlay', component: TtsOverlay, meta: { hideLayout: true } },
  { path: '/bot/discord', component: BotDiscord },
  { path: '/bot/automation', component: BotAutomation },
  { path: '/bot/settings', component: BotSettings },

  { path: '/:pathMatch(.*)', component: NotFound },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router