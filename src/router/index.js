import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home/Home.vue'
import About from '../views/About/About.vue'
import Contact from '../views/Contact/Contact.vue'
import OurMission from '../views/OurMission/OurMission.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/contact', component: Contact },
  { path: '/our-mission', component: OurMission }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
