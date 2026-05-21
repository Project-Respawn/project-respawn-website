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

<style scoped>
.bot-page {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.16), transparent 22%),
    linear-gradient(180deg, #0c1020 0%, #12182b 100%);
  color: #eef2ff;
}

.bot-sidebar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px 18px;
  background: rgba(8, 12, 24, 0.82);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}

.brand-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 1rem;
  background: linear-gradient(135deg, #0ea5e9, #06b6d4);
  color: #fff;
}

.brand-kicker {
  margin: 0 0 4px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #9ca3af;
}

.brand-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: transparent;
  color: #c7d2fe;
  text-align: left;
  text-decoration: none;
  transition: 0.25s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.nav-item.active,
.nav-item.router-link-active,
.nav-item.router-link-exact-active {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.22), rgba(6, 182, 212, 0.14));
  border-color: rgba(125, 211, 252, 0.25);
  color: #fff;
}

.nav-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.8;
}

.sidebar-footer {
  padding-top: 20px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
}

.status-pill.online {
  background: rgba(14, 165, 233, 0.15);
  color: #7dd3fc;
  border: 1px solid rgba(125, 211, 252, 0.2);
}

.sidebar-note {
  margin-top: 12px;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #94a3b8;
}

.bot-main {
  padding: 28px;
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.8fr);
  gap: 20px;
  padding: 28px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.22), rgba(6, 182, 212, 0.14));
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #7dd3fc;
}

.hero-card h2 {
  margin: 0;
  font-size: 2rem;
  line-height: 1.15;
}

.hero-text {
  margin-top: 14px;
  color: #dbeafe;
  line-height: 1.65;
  max-width: 54ch;
}

.hero-stats {
  display: grid;
  gap: 14px;
}

.mini-stat {
  padding: 16px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.34);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.mini-label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.78rem;
  color: #cbd5e1;
  text-transform: uppercase;
}

.mini-stat strong {
  color: #fff;
}

@media (max-width: 860px) {
  .bot-page {
    grid-template-columns: 1fr;
  }

  .bot-sidebar {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .hero-card {
    grid-template-columns: 1fr;
  }
}
</style>