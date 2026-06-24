<template>
  <div class="bot-page">
    <BotSidebar
      :title="'Twitch Dashboard'"
      :colourBrand1="'#2563eb'"
      :colourBrand2="'#38bdf8'"
      :colourBoxShadow="'rgba(37, 99, 235, 0.35)'"
    />

    <main class="bot-main">
      <section class="hero-card twitch-hero">
        <div class="hero-copy">
          <p class="eyebrow">Twitch control centre</p>
          <h2>Manage commands, alerts, automations, and stream-side tools</h2>
          <p class="hero-text">
            Configure how Project Respawn responds in chat, handles Twitch events,
            and powers channel tools for each connected broadcaster.
          </p>

          <div class="hero-actions">
            <button class="primary-btn" type="button">Save Twitch Settings</button>
            <button class="secondary-btn" type="button">Run Test Actions</button>
          </div>
        </div>

        <div class="hero-stats">
          <div class="mini-stat">
            <span class="mini-label">Connected Channel</span>
            <strong>{{ heroStats.connectedChannel }}</strong>
          </div>
          <div class="mini-stat">
            <span class="mini-label">Bot Status</span>
            <strong>{{ heroStats.botStatus }}</strong>
          </div>
          <div class="mini-stat">
            <span class="mini-label">Current Focus</span>
            <strong>{{ heroStats.currentFocus }}</strong>
          </div>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Core tools</p>
            <h3>Commands</h3>
          </div>
          <div class="inline-status">Build this first</div>
        </div>

        <div class="card-grid">
          <article class="feature-card" v-for="card in commandCards" :key="card.title">
            <span class="card-badge">{{ card.badge }}</span>
            <h4>{{ card.title }}</h4>
            <p>{{ card.description }}</p>
            <button class="card-btn" type="button">{{ card.action }}</button>
          </article>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Viewer-facing events</p>
            <h3>Alerts</h3>
          </div>
          <div class="inline-status alt-status">Expand next</div>
        </div>

        <div class="card-grid">
          <article class="feature-card" v-for="card in alertCards" :key="card.title">
            <span class="card-badge alert">{{ card.badge }}</span>
            <h4>{{ card.title }}</h4>
            <p>{{ card.description }}</p>
            <button class="card-btn" type="button">{{ card.action }}</button>
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
            <button class="card-btn secondary" type="button">{{ card.action }}</button>
          </article>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Operations</p>
            <h3>Moderation and connection health</h3>
          </div>
        </div>

        <div class="card-grid">
          <article class="feature-card" v-for="card in opsCards" :key="card.title">
            <span class="card-badge muted">{{ card.badge }}</span>
            <h4>{{ card.title }}</h4>
            <p>{{ card.description }}</p>
            <button class="card-btn secondary" type="button">{{ card.action }}</button>
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
      heroStats: {
        connectedChannel: 'Connected broadcaster',
        botStatus: 'Bot linked',
        currentFocus: 'Commands + alerts'
      },

      commandCards: [
        {
          badge: 'Ready',
          title: 'Basic Commands',
          description: 'Manage core commands like !hello, !commands, !discord, and your Project Respawn links from one dashboard.',
          action: 'Manage'
        },
        {
          badge: 'Ready',
          title: 'Custom Replies',
          description: 'Edit response text without changing bot code each time, so streamer-specific replies stay flexible.',
          action: 'Edit'
        },
        {
          badge: 'Next',
          title: 'Command Toggles',
          description: 'Enable or disable individual commands for testing, live events, or streamer preference changes.',
          action: 'Configure'
        },
        {
          badge: 'Next',
          title: 'Permission Rules',
          description: 'Control which commands are available to everyone, subscribers, moderators, or broadcaster-only use.',
          action: 'Set Rules'
        }
      ],

      alertCards: [
        {
          badge: 'Next',
          title: 'Follow Alerts',
          description: 'Prepare alerts for new followers so the dashboard can control how these events appear on stream.',
          action: 'Configure'
        },
        {
          badge: 'Next',
          title: 'Sub & Gift Alerts',
          description: 'Manage subscriber, resub, and gifted sub alert behaviour so major support events feel consistent.',
          action: 'Configure'
        },
        {
          badge: 'Next',
          title: 'Raid Alerts',
          description: 'Create custom raid welcome behaviour for incoming creators and community callouts.',
          action: 'Configure'
        },
        {
          badge: 'In Progress',
          title: 'TTS Reward Alerts',
          description: 'Link channel point TTS behaviour with alert logic, cooldowns, and future voice-based stream moments.',
          action: 'Manage'
        },
        {
          badge: 'Planned',
          title: 'Bits & Donation Alerts',
          description: 'Reserve a dedicated area for cheers and future support-based event alerts across your platform.',
          action: 'Coming Soon'
        },
        {
          badge: 'Planned',
          title: 'Overlay Scene Settings',
          description: 'Later let streamers choose what viewers see for each event, including styling, placement, and animation.',
          action: 'Coming Soon'
        }
      ],

      channelCards: [
        {
          badge: 'Planned',
          title: 'Welcome Messages',
          description: 'Set up first-chat and onboarding style replies for viewers arriving in the stream community.',
          action: 'Coming Soon'
        },
        {
          badge: 'Planned',
          title: 'Timers',
          description: 'Create recurring messages for beta updates, website links, Discord prompts, and stream reminders.',
          action: 'Coming Soon'
        },
        {
          badge: 'Planned',
          title: 'Promo Tools',
          description: 'Build reusable modules for Project Respawn announcements, feature pushes, and featured links.',
          action: 'Coming Soon'
        },
        {
          badge: 'Planned',
          title: 'Channel Point Actions',
          description: 'Expand reward handling so channel point redeems can trigger dashboard-controlled actions and tools.',
          action: 'Coming Soon'
        }
      ],

      opsCards: [
        {
          badge: 'Planned',
          title: 'Moderation Tools',
          description: 'Reserve an area for shoutouts, mod-only tools, chat safety helpers, and bot protections.',
          action: 'Coming Soon'
        },
        {
          badge: 'Next',
          title: 'Connection Status',
          description: 'Show broadcaster connection health, linked bot readiness, and account status in one place.',
          action: 'Review'
        },
        {
          badge: 'Next',
          title: 'Event Health',
          description: 'Track whether chat subscriptions, reward listeners, and event triggers are active for the current channel.',
          action: 'Review'
        },
        {
          badge: 'Planned',
          title: 'Channel Settings',
          description: 'Add broadcaster-specific preferences and future streamer-side controls for your wider bot platform.',
          action: 'Coming Soon'
        }
      ]
    };
  }
};
</script>

<style scoped src="./BotTwitch.css"></style>