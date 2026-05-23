<template>
  <div class="bot-page">
    <aside class="bot-sidebar">
      <div class="brand-block">
        <div class="brand-icon">R</div>
        <div>
          <p class="brand-kicker">Project Respawn</p>
          <h1 class="brand-title">Automation Dashboard</h1>
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

    <main class="bot-main">
      <section class="hero-card">
        <div class="hero-copy">
          <p class="eyebrow">Automation tools</p>
          <h2>Automation dashboard coming soon</h2>
          <p class="hero-text">
            This page is reserved for workflows, scheduled jobs, and cross-platform triggers between your website, Twitch, and Discord tools.
          </p>
        </div>

        <div class="hero-stats">
          <div class="mini-stat">
            <span class="mini-label">Status</span>
            <strong>Placeholder</strong>
          </div>
          <div class="mini-stat">
            <span class="mini-label">Focus</span>
            <strong>Automation</strong>
          </div>
          <div class="mini-stat">
            <span class="mini-label">Next Step</span>
            <strong>Build Later</strong>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'BotAutomation'
}
</script>

<style scoped src="./BotAutomation.css"></style>