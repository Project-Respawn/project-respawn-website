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

<style scoped src="./Bot.css"></style>