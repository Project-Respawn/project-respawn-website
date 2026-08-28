<template>
  <div class="creator-shell">
    <div
      v-if="mobileNavigationOpen"
      class="creator-mobile-backdrop"
      @click="mobileNavigationOpen = false"
    />

    <div
      class="creator-sidebar-shell"
      :class="{ 'is-mobile-open': mobileNavigationOpen }"
    >
      <CreatorSidebar
        :brand="activeBrand"
        @request-brand-switch="handleBrandSwitchRequest"
      />
    </div>

    <div class="creator-content">
      <CreatorContextHeader
        :brand-name="activeBrand.name"
        :breadcrumbs="breadcrumbs"
        @toggle-navigation="mobileNavigationOpen = !mobileNavigationOpen"
      />

      <main class="creator-page">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import CreatorSidebar from './CreatorSidebar.vue'
import CreatorContextHeader from './CreatorContextHeader.vue'

import {
  creatorFeatureRegistry as registry
} from '../config/creatorFeatureRegistry.js'

const route = useRoute()

const mobileNavigationOpen = ref(false)

/*
 * Frontend shell placeholder.
 *
 * Do not turn this into a second Brand source of truth.
 * Codex/backend integration should replace this with the canonical
 * authenticated Account -> Workspace -> Brand context.
 */
const activeBrand = ref({
  id: null,
  name: 'Sea Guardian',
  logo: null,
  workspaceName: 'Main Workspace',
  active: true
})

const routeBreadcrumbOverrides = {
  CreatorTwitchCommands: [
    { label: 'Bots', routeName: 'CreatorBots' },
    { label: 'Commands' }
  ],

  CreatorTwitchAlerts: [
    { label: 'Bots', routeName: 'CreatorBots' },
    { label: 'Alerts' }
  ],

  CreatorTwitchTts: [
    { label: 'Bots', routeName: 'CreatorBots' },
    { label: 'Text to Speech' }
  ],

  CreatorBotModeration: [
    { label: 'Bots', routeName: 'CreatorBots' },
    { label: 'Moderation' }
  ],

  CreatorBotAutomation: [
    { label: 'Bots', routeName: 'CreatorBots' },
    { label: 'Automation' }
  ],

  CreatorOverlayLibrary: [
    {
      label: 'Overlay Builder',
      routeName: 'CreatorOverlays'
    },
    { label: 'Library' }
  ],

  CreatorOverlayEditor: [
    {
      label: 'Overlay Builder',
      routeName: 'CreatorOverlays'
    },
    { label: 'Editor' }
  ]
}

const featureKey = computed(() => {
  if (route.meta?.creatorFeature) {
    return route.meta.creatorFeature
  }

  return Object.keys(registry).find((key) => {
    const feature = registry[key]

    return (
      feature.routeName === route.name ||
      feature.activeRouteNames?.includes(route.name)
    )
  })
})

const breadcrumbs = computed(() => {
  const override = routeBreadcrumbOverrides[route.name]

  if (override) {
    return override
  }

  const feature = registry[featureKey.value]

  if (feature) {
    return [{ label: feature.label }]
  }

  if (route.name === 'CreatorDashboard') {
    return [{ label: 'Dashboard' }]
  }

  return []
})

function handleBrandSwitchRequest() {
  /*
   * Frontend boundary only.
   *
   * Codex should connect this to the canonical Workspace/Brand
   * selector rather than browser storage or demo state.
   */
  console.info(
    '[Creator Tools] Brand switch requested.'
  )
}

watch(
  () => route.fullPath,
  () => {
    mobileNavigationOpen.value = false
  }
)
</script>

<style>
.creator-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  color: #eef2ff;
  background:
    radial-gradient(
      circle at 20% 0%,
      rgba(124, 58, 237, .1),
      transparent 26%
    ),
    linear-gradient(
      180deg,
      #090d18,
      #0c1220 55%,
      #0a101c
    );
}

.creator-sidebar-shell {
  position: relative;
  z-index: 40;
}

.creator-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  padding: 22px 16px;
  background:
    linear-gradient(
      180deg,
      rgba(6, 9, 19, .98),
      rgba(8, 12, 24, .98)
    );
  border-right: 1px solid rgba(255, 255, 255, .075);
}

.creator-content {
  min-width: 0;
}

.creator-page {
  min-width: 0;
}

/*
 * Existing bot pages currently contain their own legacy sidebar.
 * CreatorLayout remains the canonical shell.
 */
.creator-page > .bot-page,
.creator-page > .tts-settings-container {
  grid-template-columns: minmax(0, 1fr) !important;
  min-height: auto;
  background: transparent;
}

.creator-page > .bot-page > .bot-sidebar,
.creator-page > .tts-settings-container > .bot-sidebar {
  display: none !important;
}

.creator-mobile-backdrop {
  display: none;
}

@media (max-width: 900px) {
  .creator-shell {
    grid-template-columns: 1fr;
  }

  .creator-sidebar-shell {
    position: fixed;
    inset: 0 auto 0 0;
    width: min(290px, 86vw);
    transform: translateX(-100%);
    transition: transform .2s ease;
  }

  .creator-sidebar-shell.is-mobile-open {
    transform: translateX(0);
  }

  .creator-sidebar {
    position: relative;
    width: 100%;
  }

  .creator-mobile-backdrop {
    position: fixed;
    inset: 0;
    z-index: 35;
    display: block;
    background: rgba(0, 0, 0, .62);
    backdrop-filter: blur(3px);
  }
}
</style>