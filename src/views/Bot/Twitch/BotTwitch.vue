<template>
  <div class="bot-page">
    
    <BotSidebar :title="'Twitch Dashboard'" 
    :colourBrand1="'#2563eb'" 
    :colourBrand2="'#38bdf8'" 
    :colourBoxShadow="'rgba(37, 99, 235, 0.35)'" />

    <main class="bot-main">
      <section class="hero-card twitch-hero">
        <div class="hero-copy">
          <p class="eyebrow">Twitch bot control</p>
          <h2>Manage commands, timers, moderation, and channel tools</h2>
          <p class="hero-text">
            This page is the first dedicated bot dashboard for Project Respawn. Start by managing
            your core Twitch commands, then expand into automations and streamer-specific settings.
          </p>

          <div class="hero-actions">
            <button class="primary-btn">Save Twitch Settings</button>
            <button class="secondary-btn">Test Command Setup</button>
          </div>
        </div>

        <div class="hero-stats">
          <div class="mini-stat">
            <span class="mini-label">Connected Channel</span>
            <strong>RespawnSquad</strong>
          </div>
          <div class="mini-stat">
            <span class="mini-label">Core Commands</span>
            <strong>4 Active</strong>
          </div>
          <div class="mini-stat">
            <span class="mini-label">Build Status</span>
            <strong>MVP Setup</strong>
          </div>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Core tools</p>
            <h3>Twitch command controls</h3>
          </div>
          <div class="inline-status">Build this first</div>
        </div>

        <div class="card-grid">
          <article class="feature-card" v-for="card in commandCards" :key="card.title">
            <span class="card-badge">{{ card.badge }}</span>
            <h4>{{ card.title }}</h4>
            <p>{{ card.description }}</p>
            <button class="card-btn">{{ card.action }}</button>
          </article>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Channel tools</p>
            <h3>Automation and engagement</h3>
          </div>
        </div>

        <div class="card-grid">
          <article class="feature-card" v-for="card in channelCards" :key="card.title">
            <span class="card-badge muted">{{ card.badge }}</span>
            <h4>{{ card.title }}</h4>
            <p>{{ card.description }}</p>
            <button class="card-btn secondary">{{ card.action }}</button>
          </article>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Operations</p>
            <h3>Moderation and configuration</h3>
          </div>
        </div>

        <div class="card-grid">
          <article class="feature-card" v-for="card in opsCards" :key="card.title">
            <span class="card-badge muted">{{ card.badge }}</span>
            <h4>{{ card.title }}</h4>
            <p>{{ card.description }}</p>
            <button class="card-btn secondary">{{ card.action }}</button>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
  import BotSidebar from '@/components/BotSidebar/BotSidebar.vue';
</script>

<script>
export default {
  name: 'BotTwitch',
  data() {
    return {
      commandCards: [
        {
          badge: 'Ready',
          title: 'Basic Commands',
          description: 'Manage !hello, !commands, !respawn, and !beta from one Twitch-focused dashboard.',
          action: 'Manage'
        },
        {
          badge: 'Next',
          title: 'Custom Command Replies',
          description: 'Edit the response text for each command without changing the bot code every time.',
          action: 'Edit'
        },
        {
          badge: 'Next',
          title: 'Command Toggles',
          description: 'Enable or disable individual commands for testing, events, or streamer preferences.',
          action: 'Configure'
        }
      ],
      channelCards: [
        {
          badge: 'Planned',
          title: 'Welcome Messages',
          description: 'Set up first-chat or onboarding style replies for users entering the stream community.',
          action: 'Coming Soon'
        },
        {
          badge: 'Planned',
          title: 'Timers',
          description: 'Create recurring messages for your beta, website links, and community prompts.',
          action: 'Coming Soon'
        },
        {
          badge: 'Planned',
          title: 'Promo Tools',
          description: 'Prepare reusable modules for beta signups, Project Respawn info, and featured links.',
          action: 'Coming Soon'
        }
      ],
      opsCards: [
        {
          badge: 'Planned',
          title: 'Moderation Tools',
          description: 'Reserve a clean area for moderation helpers, safe chat rules, and bot protections.',
          action: 'Coming Soon'
        },
        {
          badge: 'Planned',
          title: 'Connection Status',
          description: 'Show startup health, bot identity, broadcaster settings, and token readiness.',
          action: 'Coming Soon'
        },
        {
          badge: 'Planned',
          title: 'Channel Settings',
          description: 'Later connect broadcaster-specific preferences and streamer-side dashboard controls.',
          action: 'Coming Soon'
        }
      ]
    };
  }
};
</script>

<style scoped src="./BotTwitch.css"></style>