<template>
  <div class="bot-page">
    <aside class="bot-sidebar">
      <div class="brand-block">
        <div class="brand-icon">R</div>
        <div>
          <p class="brand-kicker">Project Respawn</p>
          <h1 class="brand-title">Bot Dashboard</h1>
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
        <div class="status-pill online">Bot Connected</div>
        <p class="sidebar-note">
          Main overview page for your Twitch, Discord, automation, and settings dashboards.
        </p>
      </div>
    </aside>

    <main class="bot-main">
      <section class="hero-card">
        <div class="hero-copy">
          <p class="eyebrow">Unified creator tools</p>
          <h2>Manage your bot dashboards from one control hub</h2>
          <p class="hero-text">
            Use this page as the overview for your bot system. From here you can jump into Twitch
            tools, Discord tools, automation workflows, and connection settings.
          </p>

          <div class="hero-actions">
            <router-link to="/bot/twitch" class="primary-btn link-btn">
              Open Twitch Dashboard
            </router-link>
            <router-link to="/bot/settings" class="secondary-btn link-btn">
              Open Settings
            </router-link>
          </div>
        </div>

        <div class="hero-stats">
          <div class="mini-stat">
            <span class="mini-label">Twitch Modules</span>
            <strong>4 Ready</strong>
          </div>
          <div class="mini-stat">
            <span class="mini-label">Dashboard Pages</span>
            <strong>5 Total</strong>
          </div>
          <div class="mini-stat">
            <span class="mini-label">Status</span>
            <strong>Prototype</strong>
          </div>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Overview</p>
            <h3>Bot workspace overview</h3>
          </div>
        </div>

        <div class="card-grid summary-grid">
          <article class="feature-card" v-for="card in overviewCards" :key="card.title">
            <span class="card-badge">{{ card.badge }}</span>
            <h4>{{ card.title }}</h4>
            <p>{{ card.description }}</p>
            <router-link :to="card.link" class="card-btn link-btn">
              {{ card.action }}
            </router-link>
          </article>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Quick access</p>
            <h3>Open a dashboard page</h3>
          </div>
        </div>

        <div class="card-grid">
          <article class="feature-card" v-for="card in dashboardCards" :key="card.title">
            <span class="card-badge muted">{{ card.badge }}</span>
            <h4>{{ card.title }}</h4>
            <p>{{ card.description }}</p>
            <router-link :to="card.link" class="card-btn secondary link-btn">
              {{ card.action }}
            </router-link>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'Bot',
  data() {
    return {
      overviewCards: [
        {
          badge: 'Live',
          title: 'Twitch Dashboard',
          description: 'Open the Twitch bot area to manage commands, timers, moderation placeholders, and channel tools.',
          action: 'Open Twitch',
          link: '/bot/twitch'
        },
        {
          badge: 'Setup',
          title: 'Settings Dashboard',
          description: 'Open the bot settings page to test broadcaster IDs, bot IDs, redirect URI, and token setup.',
          action: 'Open Settings',
          link: '/bot/settings'
        },
        {
          badge: 'Next',
          title: 'Discord Dashboard',
          description: 'Use this route for Discord welcome flows, moderation, permissions, and community tools.',
          action: 'Open Discord',
          link: '/bot/discord'
        }
      ],
      dashboardCards: [
        {
          badge: 'Available',
          title: 'Overview',
          description: 'Main hub page for all bot dashboards.',
          action: 'Go to Overview',
          link: '/bot'
        },
        {
          badge: 'Available',
          title: 'Twitch',
          description: 'Primary dashboard for your current Twitch bot build.',
          action: 'Go to Twitch',
          link: '/bot/twitch'
        },
        {
          badge: 'Placeholder',
          title: 'Discord',
          description: 'Use placeholder text here until the full Discord dashboard is built.',
          action: 'Go to Discord',
          link: '/bot/discord'
        },
        {
          badge: 'Placeholder',
          title: 'Automation',
          description: 'Use this page later for cross-platform workflows and scheduled jobs.',
          action: 'Go to Automation',
          link: '/bot/automation'
        },
        {
          badge: 'Available',
          title: 'Settings',
          description: 'Use this page now to test your local Twitch bot connection values.',
          action: 'Go to Settings',
          link: '/bot/settings'
        }
      ]
    };
  }
};
</script>

<style scoped>
.bot-page {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(144, 91, 255, 0.16), transparent 22%),
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
  background: linear-gradient(135deg, #7c3aed, #ec4899);
  color: #fff;
  box-shadow: 0 10px 24px rgba(124, 58, 237, 0.35);
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
  cursor: pointer;
  transition: 0.25s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.nav-item.active,
.nav-item.router-link-active,
.nav-item.router-link-exact-active {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.22), rgba(236, 72, 153, 0.14));
  border-color: rgba(167, 139, 250, 0.25);
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
  background: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
  border: 1px solid rgba(110, 231, 183, 0.2);
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
  margin-bottom: 22px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.28), rgba(236, 72, 153, 0.18));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.25);
}

.eyebrow,
.section-kicker {
  margin: 0 0 8px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #d8b4fe;
}

.hero-card h2 {
  margin: 0;
  font-size: 2rem;
  line-height: 1.15;
  max-width: 13ch;
}

.hero-text {
  margin: 14px 0 0;
  max-width: 54ch;
  color: #e9d5ff;
  line-height: 1.65;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 22px;
}

.primary-btn,
.secondary-btn,
.card-btn,
.link-btn {
  border: none;
  cursor: pointer;
  transition: 0.25s ease;
  text-decoration: none;
}

.primary-btn,
.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 600;
}

.primary-btn {
  background: #fff;
  color: #111827;
}

.primary-btn:hover {
  transform: translateY(-1px);
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.18);
}

.hero-stats {
  display: grid;
  gap: 14px;
  align-content: start;
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
  letter-spacing: 0.08em;
}

.mini-stat strong {
  font-size: 1.05rem;
  color: #fff;
}

.dashboard-section {
  margin-bottom: 28px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 18px;
}

.section-heading h3 {
  margin: 0;
  font-size: 1.45rem;
  color: #fff;
}

.card-grid,
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.feature-card {
  padding: 18px;
  border-radius: 20px;
  background: rgba(10, 16, 31, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
}

.feature-card h4 {
  margin: 0 0 10px;
  font-size: 1.05rem;
  color: #fff;
}

.feature-card p {
  margin: 0 0 16px;
  color: #9fb0cc;
  line-height: 1.6;
  min-height: 72px;
}

.card-badge {
  display: inline-flex;
  margin-bottom: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.14);
  color: #93c5fd;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.card-badge.muted {
  background: rgba(148, 163, 184, 0.12);
  color: #cbd5e1;
}

.card-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.18);
  color: #dbeafe;
  font-weight: 600;
}

.card-btn:hover {
  background: rgba(59, 130, 246, 0.28);
}

.card-btn.secondary {
  background: rgba(255, 255, 255, 0.06);
  color: #e5e7eb;
}

.card-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.12);
}

@media (max-width: 1180px) {
  .card-grid,
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-card {
    grid-template-columns: 1fr;
  }
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
}

@media (max-width: 640px) {
  .bot-main {
    padding: 18px;
  }

  .hero-card {
    padding: 22px;
  }

  .hero-card h2 {
    font-size: 1.6rem;
  }

  .card-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .section-heading {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>