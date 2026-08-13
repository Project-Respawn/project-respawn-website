<template>
  <aside class="creator-sidebar">
    <router-link :to="{ name: 'CreatorDashboard' }" class="creator-brand">
      <span class="creator-brand-mark">R</span>
      <span><small>Project Respawn</small><strong>Creator Tools</strong></span>
    </router-link>

    <nav aria-label="Creator Tools navigation">
      <section v-for="group in creatorNavigation" :key="group.label" class="creator-nav-group">
        <h2>{{ group.label }}</h2>
        <router-link v-for="key in visibleItems(group.items)" :key="key" :to="{ name: registry[key].routeName }" class="creator-nav-link" :class="{ 'is-active': isFeatureActive(key) }">
          <span><span v-if="registry[key].icon" class="creator-nav-icon" aria-hidden="true">{{ registry[key].icon }}</span>{{ registry[key].label }}</span>
          <FeatureStatusBadge v-if="registry[key].status !== 'live'" :status="registry[key].status" />
        </router-link>
      </section>
    </nav>

    <router-link to="/home" class="creator-back-link">← Account Dashboard</router-link>
  </aside>
</template>

<script setup>
import FeatureStatusBadge from '../../../components/FeatureStatusBadge/FeatureStatusBadge.vue'
import { creatorFeatureRegistry as registry, creatorNavigation } from '../config/creatorFeatureRegistry.js'
import { useRoute } from 'vue-router'

const route = useRoute()
function visibleItems(items) { return items.filter((key) => registry[key].showInSidebar !== false) }
function isFeatureActive(key) {
  return route.meta?.creatorFeature === key || (registry[key].activeRouteNames || [registry[key].routeName]).includes(route.name)
}
</script>
