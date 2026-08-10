<template>
  <template v-for="item in items" :key="item.id">
    <!-- Item without children - render as link -->
    <router-link 
      v-if="!item.children || item.children.length === 0"
      :to="item.to"
      class="nav-item nav-child"
      :style="{ paddingLeft: `calc(18px + ${depth * 16}px)` }"
      exact-active-class="active">

      <span class="nav-dot"></span>
      {{ item.label }}
    </router-link>

    <!-- Item with children - render link with button inside, then submenu -->
    <div v-else class="nav-group">
      <router-link
        :to="item.to"
        class="nav-item nav-parent nav-child"
        :style="{ paddingLeft: `calc(18px + ${depth * 16}px)` }"
        exact-active-class="active"
        @click="expandOnly(item.id)">
        <span class="nav-dot"></span>
        {{ item.label }}
        
        <button
          class="nav-expand-btn"
          :class="{ expanded: sidebarStore.expandedItems[item.id] }"
          @click.prevent.stop="toggleExpand(item.id)"
          :aria-label="`Toggle ${item.label} menu`">
          <span class="chevron-icon">›</span>
        </button>
      </router-link>

      <div class="submenu" :class="{ active: sidebarStore.expandedItems[item.id] }">
        <MenuLevel :items="item.children" :depth="depth + 1" />
      </div>
    </div>
  </template>
</template>

<script>
import { sidebarStore } from '../Stores/SidebarStore'

export default {
  name: 'MenuLevel',
  props: {
    items: {
      type: Array,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      sidebarStore
    }
  },
  methods: {
    expandOnly(itemId) {
      // Only expand, don't collapse (for parent clicks)
      sidebarStore.expandMenu(itemId)
    },
    toggleExpand(itemId) {
      // Toggle expand/collapse (for arrow button)
      sidebarStore.toggleExpand(itemId)
    }
  }
}
</script>
