<template>
  <header class="creator-context-header">
    <div class="creator-context-header-left">
      <button
        type="button"
        class="creator-mobile-menu"
        aria-label="Open Creator Tools navigation"
        @click="$emit('toggle-navigation')"
      >
        ☰
      </button>

      <nav
        class="creator-breadcrumbs"
        aria-label="Breadcrumb"
      >
        <router-link :to="{ name: 'CreatorDashboard' }">
          Creator Tools
        </router-link>

        <span class="creator-breadcrumb-separator">›</span>

        <span class="creator-breadcrumb-brand">
          {{ brandName }}
        </span>

        <template v-for="crumb in breadcrumbs" :key="crumb.label">
          <span class="creator-breadcrumb-separator">›</span>

          <router-link
            v-if="crumb.routeName"
            :to="{ name: crumb.routeName }"
          >
            {{ crumb.label }}
          </router-link>

          <span
            v-else
            class="creator-breadcrumb-current"
          >
            {{ crumb.label }}
          </span>
        </template>
      </nav>
    </div>

    <div class="creator-context-header-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup>
defineProps({
  brandName: {
    type: String,
    default: 'Sea Guardian'
  },

  breadcrumbs: {
    type: Array,
    default: () => []
  }
})

defineEmits(['toggle-navigation'])
</script>

<style scoped>
.creator-context-header {
  min-height: 68px;
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 0 28px;
  background: rgba(7, 10, 22, .9);
  border-bottom: 1px solid rgba(255, 255, 255, .075);
  backdrop-filter: blur(18px);
}

.creator-context-header-left {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 18px;
}

.creator-mobile-menu {
  display: none;
  width: 36px;
  height: 36px;
  color: #cbd5e1;
  background: transparent;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.15rem;
}

.creator-mobile-menu:hover {
  color: #fff;
  background: rgba(255, 255, 255, .06);
}

.creator-breadcrumbs {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
  font-size: .82rem;
}

.creator-breadcrumbs a {
  color: #cbd5e1;
  text-decoration: none;
}

.creator-breadcrumbs a:hover {
  color: #fff;
}

.creator-breadcrumb-separator {
  color: #475569;
}

.creator-breadcrumb-brand {
  color: #a78bfa;
  font-weight: 600;
}

.creator-breadcrumb-current {
  overflow: hidden;
  color: #f8fafc;
  text-overflow: ellipsis;
}

.creator-context-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

@media (max-width: 900px) {
  .creator-context-header {
    min-height: 60px;
    padding: 0 16px;
  }

  .creator-mobile-menu {
    display: grid;
    place-items: center;
  }

  .creator-breadcrumbs {
    gap: 8px;
  }
}

@media (max-width: 600px) {
  .creator-breadcrumbs > *:first-child,
  .creator-breadcrumbs > *:nth-child(2),
  .creator-breadcrumb-brand {
    display: none;
  }
}
</style>