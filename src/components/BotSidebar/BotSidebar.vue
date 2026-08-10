<template>
    <aside 
      class="bot-sidebar"
      :style="{
        '--colour-brand-1': sidebarStore.colourBrand1,
        '--colour-brand-2': sidebarStore.colourBrand2,
        '--colour-box-shadow': sidebarStore.colourBoxShadow
      }">
      
      <div class="brand-block">
        <div class="brand-icon">R</div>
        <div>
          <p class="brand-kicker">Project Respawn</p>
          <h1 class="brand-title">{{ sidebarStore.title }}</h1>
        </div>
      </div>

      <nav class="sidebar-nav">
        <template v-for="item in menuItems" :key="item.id">
          <!-- Top-level items without children -->
          <router-link 
            v-if="!item.children || item.children.length === 0"
            :to="item.to"
            class="nav-item" 
            exact-active-class="active">
            <span class="nav-dot"></span>
            {{ item.label }}
          </router-link>

          <!-- Top-level items with children - render link with button inside + submenu -->
          <div v-else class="nav-group">
            <router-link
              :to="item.to"
              class="nav-item nav-parent"
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
              <MenuLevel :items="item.children" :depth="1" />
            </div>
          </div>
        </template>
      </nav>

      <div class="sidebar-footer">
        <div class="status-pill online">Coming Soon</div>
        <p class="sidebar-note">Automation dashboard placeholder with shared bot navigation.</p>
      </div>
      
    </aside>
</template>

<script setup>
  import MenuLevel from './MenuLevel.vue'
  import { sidebarStore } from '../Stores/SidebarStore'
  import { watch } from 'vue'

  const props = defineProps({
    title: String,
    colourBrand1: String,
    colourBrand2: String,
    colourBoxShadow: String
  })

  watch(
    () => props,
    (newProps) => {
      sidebarStore.setTitle(props.title)
      sidebarStore.setColors(props.colourBrand1, props.colourBrand2, props.colourBoxShadow)
    },
    { deep: true, immediate: true }
  )
</script>

<script>
export default {
  data() {
    return {
      sidebarStore,
      menuItems: [
        {
          id: 'overview',
          label: 'Overview',
          to: { name: 'CreatorBots' },
        },
        {
          id: 'twitch',
          label: 'Twitch',
          to: { name: 'CreatorTwitch' },
          children: [
            {
              id: 'twitch-commands',
              label: 'Basic Commands',
              to: { name: 'CreatorTwitchCommands' },
            },
            {
              id: 'twitch-tts',
              label: 'Text to Speech',
              to: { name: 'CreatorTwitchTts' },
            },
          ],
        },
        {
          id: 'discord',
          label: 'Discord',
          to: { name: 'CreatorDiscord' },
        },
        {
          id: 'automation',
          label: 'Automation',
          to: { name: 'CreatorBotAutomation' },
        },
        {
          id: 'settings',
          label: 'Settings',
          to: { name: 'CreatorIntegrations' },
        },
      ],
    };
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
};

</script>


<style scoped src="./BotSidebar.css"></style>
