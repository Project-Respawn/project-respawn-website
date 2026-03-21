import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home/Home.vue'
import About from '../views/About/About.vue'
import Contact from '../views/Contact/Contact.vue'
import OurMission from '../views/OurMission/OurMission.vue'
import NotFound from '../views/NotFound/NotFound.vue'
import PrivacyPolicy from '../views/PrivacyPolicy/PrivacyPolicy.vue'
import TeamTryouts from '../views/TeamTryouts/TeamTryouts.vue'
import Merch from '../views/Mech/Merch.vue'
import Events from '../views/Events/Events.vue'
import Checkout from '../views/Checkout/Checkout.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/contact', component: Contact },
  { path: '/our-mission', component: OurMission },
  { path: '/privacy-policy', component: PrivacyPolicy },
  { path: '/team-tryouts', component: TeamTryouts },
  { path: '/merch', component: Merch },
  { path: '/checkout', component: Checkout },
  { path: '/events', component: Events },
  { path: '/:pathMatch(.*)', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

export default router
