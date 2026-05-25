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
          <!-- Top-level items -->
          <div v-if="!item.children || item.children.length === 0">
            <router-link :to="item.path" class="nav-item" exact-active-class="active">
              <span class="nav-dot"></span>
              {{ item.label }}
            </router-link>
          </div>

          <!-- Items with submenus -->
          <div v-else class="nav-group">
            <button 
              class="nav-item nav-parent"
              :class="{ expanded: sidebarStore.expandedItems[item.id] }"
              @click="sidebarStore.toggleExpand(item.id)"
            >
              <span class="nav-dot"></span>
              {{ item.label }}
              <span class="chevron-icon">›</span>
            </button>

            <!-- Submenu -->
            <div 
              class="submenu"
              :class="{ active: sidebarStore.expandedItems[item.id] }"
            >
              <template v-for="subitem in item.children" :key="subitem.id">
                <div v-if="!subitem.children || subitem.children.length === 0">
                  <router-link :to="subitem.path" class="nav-item nav-subitem" exact-active-class="active">
                    <span class="nav-dot"></span>
                    {{ subitem.label }}
                  </router-link>
                </div>

                <!-- Nested submenu (3rd level) -->
                <div v-else class="nav-group">
                  <button 
                    class="nav-item nav-subitem nav-parent"
                    :class="{ expanded: sidebarStore.expandedItems[subitem.id] }"
                    @click="sidebarStore.toggleExpand(subitem.id)"
                  >
                    <span class="nav-dot"></span>
                    {{ subitem.label }}
                    <span class="chevron-icon">›</span>
                  </button>

                  <div 
                    class="submenu submenu-2"
                    :class="{ active: sidebarStore.expandedItems[subitem.id] }"
                  >
                    <router-link 
                      v-for="subsubitem in subitem.children"
                      :key="subsubitem.id"
                      :to="subsubitem.path" 
                      class="nav-item nav-subitem-2" 
                      exact-active-class="active"
                    >
                      <span class="nav-dot"></span>
                      {{ subsubitem.label }}
                    </router-link>
                  </div>
                </div>
              </template>
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
  import { sidebarStore } from '../../stores/sidebarStore'
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
          path: '/bot',
        },
        {
          id: 'twitch',
          label: 'Twitch',
          path: '/bot/twitch',
          children: [
            {
              id: 'twitch-dashboard',
              label: 'Dashboard',
              path: '/bot/twitch',
            },
            {
              id: 'twitch-commands',
              label: 'Commands',
              path: '/bot/twitch/commands',
            },
            {
              id: 'twitch-tts',
              label: 'TTS',
              path: '/bot/twitch/tts',
            },
          ],
        },
        {
          id: 'discord',
          label: 'Discord',
          path: '/bot/discord',
        },
        {
          id: 'automation',
          label: 'Automation',
          path: '/bot/automation',
        },
        {
          id: 'settings',
          label: 'Settings',
          path: '/bot/settings',
        },
      ],
    };
  },
};

</script>


<style scoped src="./BotSidebar.css"></style>