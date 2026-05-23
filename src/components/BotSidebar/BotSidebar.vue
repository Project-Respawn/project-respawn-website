<template>
    <aside 
      class="bot-sidebar"
      :style="{
        '--colour-brand-1': colourBrand1,
        '--colour-brand-2': colourBrand2,
        '--colour-box-shadow': colourBoxShadow
      }">
      
      <div class="brand-block">
        <div class="brand-icon">R</div>
        <div>
          <p class="brand-kicker">Project Respawn</p>
          <h1 class="brand-title">{{ title }}</h1>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/bot" class="nav-item" exact-active-class="active">
          <span class="nav-dot"></span>
          Overview
        </router-link>

        <router-link to="/bot/twitch" class="nav-item" exact-active-class="active">
          <span class="nav-dot"></span>
          Twitch
        </router-link>

        <router-link to="/bot/discord" class="nav-item" exact-active-class="active">
          <span class="nav-dot"></span>
          Discord
        </router-link>

        <router-link to="/bot/automation" class="nav-item" exact-active-class="active">
          <span class="nav-dot"></span>
          Automation
        </router-link>

        <router-link to="/bot/settings" class="nav-item" exact-active-class="active">
          <span class="nav-dot"></span>
          Settings
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="status-pill online">Coming Soon</div>
        <p class="sidebar-note">Automation dashboard placeholder with shared bot navigation.</p>
      </div>
    </aside>
</template>


<script>
export default {
  props: ['title', 'colourBrand1', 'colourBrand2', 'colourBoxShadow'],
}
</script>


<style scoped src="./BotSidebar.css"></style>