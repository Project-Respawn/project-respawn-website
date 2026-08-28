<template>
  <aside class="creator-sidebar">
    <!-- Creator Tools brand -->
    <router-link
      :to="{ name: 'CreatorDashboard' }"
      class="creator-product"
    >
      <span class="creator-product-mark">
        <img :src="projectRespawnLogo" alt="" />
      </span>

      <span class="creator-product-copy">
        <strong>RESPAWN</strong>
        <small>Creator Tools</small>
      </span>
    </router-link>

    <!-- Active brand -->
    <button
      type="button"
      class="creator-context-card"
      aria-label="Change active brand"
      @click="brandMenuOpen = !brandMenuOpen"
    >
      <span class="creator-context-main">
        <span class="creator-context-avatar">
          <img
            v-if="activeBrand.logo"
            :src="activeBrand.logo"
            :alt="activeBrand.name"
          />
          <span v-else>
            {{ brandInitials }}
          </span>
        </span>

        <span class="creator-context-copy">
          <strong>{{ activeBrand.name }}</strong>
          <small>Brand</small>
        </span>
      </span>

      <span
        class="creator-context-chevron"
        :class="{ 'is-open': brandMenuOpen }"
        aria-hidden="true"
      >
        ⌄
      </span>
    </button>

    <!-- Frontend shell only.
         Codex should connect this to canonical Workspace/Brand context. -->
    <div
      v-if="brandMenuOpen"
      class="creator-brand-menu"
    >
      <div class="creator-brand-menu-label">
        Current context
      </div>

      <div class="creator-brand-menu-current">
        <strong>{{ activeBrand.name }}</strong>
        <span>{{ activeBrand.workspaceName }}</span>
      </div>

      <button
        type="button"
        class="creator-brand-menu-action"
        @click="emitBrandRequest"
      >
        Switch brand
      </button>
    </div>

    <div class="creator-workspace-status">
      <span>{{ activeBrand.workspaceName }}</span>

      <span
        class="creator-workspace-state"
        :class="{ 'is-active': activeBrand.active }"
      >
        <span class="creator-workspace-dot" />
        {{ activeBrand.active ? 'Active' : 'Inactive' }}
      </span>
    </div>

    <!-- Navigation -->
    <nav
      class="creator-navigation"
      aria-label="Creator Tools navigation"
    >
      <section
        v-for="group in creatorNavigation"
        :key="group.label"
        class="creator-nav-group"
      >
        <button
          type="button"
          class="creator-nav-group-toggle"
          :aria-expanded="isGroupOpen(group.label)"
          @click="toggleGroup(group.label)"
        >
          <span>{{ group.label }}</span>

          <span
            class="creator-nav-group-chevron"
            :class="{ 'is-open': isGroupOpen(group.label) }"
            aria-hidden="true"
          >
            ›
          </span>
        </button>

        <div
          v-show="isGroupOpen(group.label)"
          class="creator-nav-items"
        >
          <router-link
            v-for="key in visibleItems(group.items)"
            :key="key"
            :to="{ name: registry[key].routeName }"
            class="creator-nav-link"
            :class="{ 'is-active': isFeatureActive(key) }"
          >
            <span class="creator-nav-link-main">
              <span class="creator-nav-icon">
                <CreatorFeatureIcon :name="registry[key].icon" />
              </span>

              <span>{{ registry[key].label }}</span>
            </span>

            <FeatureStatusBadge
              v-if="registry[key].status !== 'live'"
              :status="registry[key].status"
            />
          </router-link>
        </div>
      </section>
    </nav>

    <router-link
      to="/home"
      class="creator-back-link"
    >
      <span>←</span>
      <span>Account Dashboard</span>
    </router-link>
  </aside>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import FeatureStatusBadge from '../../../components/FeatureStatusBadge/FeatureStatusBadge.vue'
import CreatorFeatureIcon from './CreatorFeatureIcon.vue'
import projectRespawnLogo from '../views/events/project-respawn-mark.png'

import {
  creatorFeatureRegistry as registry,
  creatorNavigation
} from '../config/creatorFeatureRegistry.js'

const props = defineProps({
  brand: {
    type: Object,
    default: () => ({
      name: 'Sea Guardian',
      logo: null,
      workspaceName: 'Main Workspace',
      active: true
    })
  }
})

const emit = defineEmits(['request-brand-switch'])

const route = useRoute()
const brandMenuOpen = ref(false)

const activeBrand = computed(() => ({
  name: props.brand?.name || 'Select Brand',
  logo: props.brand?.logo || null,
  workspaceName: props.brand?.workspaceName || 'Workspace',
  active: props.brand?.active !== false
}))

const brandInitials = computed(() => {
  return activeBrand.value.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
})

const groupState = reactive(
  Object.fromEntries(
    creatorNavigation.map((group) => [group.label, true])
  )
)

function visibleItems(items) {
  return items.filter(
    (key) => registry[key]?.showInSidebar !== false
  )
}

function isFeatureActive(key) {
  const feature = registry[key]

  if (!feature) {
    return false
  }

  return (
    route.meta?.creatorFeature === key ||
    (feature.activeRouteNames || [feature.routeName])
      .includes(route.name)
  )
}

function groupContainsActiveFeature(group) {
  return visibleItems(group.items).some(isFeatureActive)
}

function isGroupOpen(label) {
  return groupState[label] !== false
}

function toggleGroup(label) {
  groupState[label] = !groupState[label]
}

function ensureActiveGroupOpen() {
  creatorNavigation.forEach((group) => {
    if (groupContainsActiveFeature(group)) {
      groupState[group.label] = true
    }
  })
}

function emitBrandRequest() {
  brandMenuOpen.value = false
  emit('request-brand-switch')
}

watch(
  () => route.fullPath,
  () => ensureActiveGroupOpen(),
  { immediate: true }
)
</script>

<style scoped>
.creator-product {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
  color: #fff;
  text-decoration: none;
}

.creator-product-mark {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
}

.creator-product-mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.creator-product-copy strong,
.creator-product-copy small {
  display: block;
}

.creator-product-copy strong {
  font-size: 1rem;
  letter-spacing: .06em;
}

.creator-product-copy small {
  margin-top: 2px;
  color: #a78bfa;
  font-size: .78rem;
}

.creator-context-card {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  color: #fff;
  text-align: left;
  background:
    linear-gradient(
      135deg,
      rgba(124, 58, 237, .12),
      rgba(15, 23, 42, .7)
    );
  border: 1px solid rgba(255, 255, 255, .09);
  border-radius: 12px;
  cursor: pointer;
}

.creator-context-card:hover {
  border-color: rgba(167, 139, 250, .4);
}

.creator-context-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.creator-context-avatar {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  display: grid;
  place-items: center;
  overflow: hidden;
  color: #fff;
  font-size: .72rem;
  font-weight: 700;
  background: #312e81;
  border: 1px solid rgba(167, 139, 250, .45);
  border-radius: 50%;
}

.creator-context-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.creator-context-copy {
  min-width: 0;
}

.creator-context-copy strong,
.creator-context-copy small {
  display: block;
}

.creator-context-copy strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: .9rem;
}

.creator-context-copy small {
  margin-top: 3px;
  color: #a78bfa;
  font-size: .72rem;
}

.creator-context-chevron {
  color: #94a3b8;
  transition: transform .18s ease;
}

.creator-context-chevron.is-open {
  transform: rotate(180deg);
}

.creator-brand-menu {
  margin-top: 6px;
  padding: 10px;
  background: #111827;
  border: 1px solid rgba(255, 255, 255, .09);
  border-radius: 10px;
}

.creator-brand-menu-label {
  margin-bottom: 8px;
  color: #64748b;
  font-size: .65rem;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.creator-brand-menu-current strong,
.creator-brand-menu-current span {
  display: block;
}

.creator-brand-menu-current strong {
  color: #fff;
  font-size: .85rem;
}

.creator-brand-menu-current span {
  margin-top: 2px;
  color: #94a3b8;
  font-size: .72rem;
}

.creator-brand-menu-action {
  width: 100%;
  margin-top: 10px;
  padding: 7px 9px;
  color: #c4b5fd;
  text-align: left;
  background: rgba(124, 58, 237, .12);
  border: 0;
  border-radius: 7px;
  cursor: pointer;
}

.creator-workspace-status {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 3px 16px;
  color: #64748b;
  font-size: .7rem;
}

.creator-workspace-state {
  display: flex;
  align-items: center;
  gap: 5px;
}

.creator-workspace-state.is-active {
  color: #4ade80;
}

.creator-workspace-dot {
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
}

.creator-navigation {
  padding-top: 4px;
}

.creator-nav-group {
  padding: 8px 0;
  border-top: 1px solid rgba(255, 255, 255, .055);
}

.creator-nav-group:first-child {
  border-top: 0;
}

.creator-nav-group-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 7px;
  color: #7f8ba3;
  background: transparent;
  border: 0;
  cursor: pointer;
  font-size: .66rem;
  font-weight: 600;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.creator-nav-group-chevron {
  color: #94a3b8;
  font-size: 1rem;
  transition: transform .18s ease;
}

.creator-nav-group-chevron.is-open {
  transform: rotate(90deg);
}

.creator-nav-items {
  margin-top: 2px;
}

.creator-nav-link {
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 2px 0;
  padding: 8px 9px;
  color: #b8c1d1;
  text-decoration: none;
  border-radius: 8px;
  font-size: .84rem;
  transition:
    background .15s ease,
    color .15s ease;
}

.creator-nav-link:hover {
  color: #fff;
  background: rgba(255, 255, 255, .045);
}

.creator-nav-link.router-link-exact-active,
.creator-nav-link.is-active {
  color: #fff;
  background:
    linear-gradient(
      90deg,
      rgba(124, 58, 237, .38),
      rgba(124, 58, 237, .16)
    );
  box-shadow:
    inset 2px 0 0 #8b5cf6;
}

.creator-nav-link-main {
  min-width: 0;
  display: flex;
  align-items: center;
}

.creator-nav-icon {
  width: 20px;
  height: 20px;
  display: inline-grid;
  place-items: center;
  margin-right: 8px;
  color: #c4b5fd;
}

.creator-back-link {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 16px;
  padding: 14px 8px 4px;
  color: #94a3b8;
  text-decoration: none;
  font-size: .78rem;
  border-top: 1px solid rgba(255, 255, 255, .07);
}

.creator-back-link:hover {
  color: #fff;
}
</style>