<template>
  <div class="bot-page">  

    <BotSidebar :title="'Connections'" 
    :colourBrand1="'#9146ff'" 
    :colourBrand2="'#5865f2'" 
    :colourBoxShadow="'rgba(145, 70, 255, 0.35)'" />
   
    <main class="bot-main">
      <section class="hero-card connections-hero">
        <div class="hero-copy">
          <p class="eyebrow">Account connections</p>
          <h2>Connect your Twitch account to Project Respawn Bot</h2>
          <p class="hero-text">
            Authorise Project Respawn Bot to connect with your Twitch account so it can power chat,
            moderation tools, triggers, and future creator features from one dashboard.
          </p>

          <div class="hero-actions">
            <button class="primary-btn" @click="handleTwitchConnect">
              {{ twitchConnected ? 'Reconnect Twitch' : 'Connect Twitch' }}
            </button>
            <button class="secondary-btn" @click="refreshStatus">
              Refresh Status
            </button>
          </div>
        </div>

        <div class="hero-stats">
          <div class="mini-stat">
            <span class="mini-label">Connection</span>
            <strong>{{ twitchConnected ? 'Connected' : 'Not Connected' }}</strong>
          </div>
          <div class="mini-stat">
            <span class="mini-label">Connected Account</span>
            <strong>{{ twitchAccountName || 'No account linked yet' }}</strong>
          </div>
          <div class="mini-stat">
            <span class="mini-label">Discord</span>
            <strong>Coming Soon</strong>
          </div>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Twitch connection</p>
            <h3>What you are approving</h3>
          </div>
        </div>

        <div class="card-grid">
          <article
            class="feature-card"
            v-for="item in twitchPermissions"
            :key="item.title"
          >
            <span class="card-badge">{{ item.badge }}</span>
            <h4>{{ item.title }}</h4>
            <p>{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Connection status</p>
            <h3>Your Twitch account</h3>
          </div>
        </div>

        <div class="status-panel">
          <div class="status-row">
            <span class="status-label">Current status</span>
            <span
              class="status-value"
              :class="{ good: twitchConnected, muted: !twitchConnected }"
            >
              {{ twitchConnected ? 'Connected successfully' : 'No Twitch account connected yet' }}
            </span>
          </div>

          <div class="status-row">
            <span class="status-label">Display name</span>
            <span class="status-value">
              {{ twitchAccountName || 'Waiting for connection' }}
            </span>
          </div>

          <div class="status-row">
            <span class="status-label">Next step</span>
            <span class="status-value">
              {{ twitchConnected
                ? 'You can now use Twitch bot features'
                : 'Use Connect Twitch to begin authorisation'
              }}
            </span>
          </div>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Discord server</p>
            <h3>Coming soon</h3>
          </div>
        </div>

        <div class="coming-soon-card">
          <div class="coming-soon-copy">
            <span class="coming-badge">Coming Soon</span>
            <h4>Connect your Discord server</h4>
            <p>
              Soon you will be able to connect your Discord server to Project Respawn so your website,
              Twitch tools, and Discord community systems can work together in one place.
            </p>
          </div>

          <div class="coming-soon-points">
            <div class="coming-point">Server connection flow</div>
            <div class="coming-point">Permissions review</div>
            <div class="coming-point">Role and community sync</div>
          </div>
        </div>
      </section>

      <transition name="fade">
        <div v-if="toastMessage" class="toast">
          {{ toastMessage }}
        </div>
      </transition>
    </main>
  </div>
</template>

<script>
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

export default {
  name: 'BotSettings',
  data() {
    return {
      toastMessage: '',
      toastTimer: null,
      twitchConnected: false,
      twitchAccountName: '',
      currentUserId: '',
      twitchPermissions: [
        {
          badge: 'Twitch',
          title: 'Chat connection',
          description:
            'Allow Project Respawn Bot to connect with your Twitch setup so chat features can be enabled.'
        },
        {
          badge: 'Twitch',
          title: 'Creator tools',
          description:
            'Support creator-focused features such as triggers, account-linked actions, and future dashboard tools.'
        },
        {
          badge: 'Twitch',
          title: 'Moderation support',
          description:
            'Prepare moderation and automation permissions that can later be enabled through your connected Twitch setup.'
        }
      ]
    };
  },

  async mounted() {
    await this.loadCurrentUser();
    await this.refreshStatus();
    this.checkCallbackResult();
  },

  methods: {
    showToast(message) {
      this.toastMessage = message;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.toastMessage = '';
      }, 2500);
    },

    async loadCurrentUser() {
      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();

        this.currentUserId =
          session?.tokens?.idToken?.payload?.sub ||
          user?.userId ||
          '';

        console.log('Current Cognito user ID:', this.currentUserId);
      } catch (error) {
        console.error('Failed to load current user:', error);
        this.currentUserId = '';
        this.showToast('Could not identify signed-in user');
      }
    },

    checkCallbackResult() {
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');

      if (error) {
        this.showToast(`Twitch connection error: ${error}`);
      }
    },

    async refreshStatus() {
      if (!this.currentUserId) return;

      try {
        const response = await fetch(
          `http://localhost:3000/api/twitch/connection-by-user?userId=${encodeURIComponent(
            this.currentUserId
          )}`
        );

        if (!response.ok) {
          throw new Error('Connection request failed');
        }

        const data = await response.json();
        const connection = data.connection || null;

        this.twitchConnected = !!connection?.isConnected;
        this.twitchAccountName =
          connection?.twitchDisplayName ||
          connection?.twitchLogin ||
          '';
      } catch (error) {
        console.error('Failed to refresh Twitch status:', error);
        this.twitchConnected = false;
        this.twitchAccountName = '';
        this.showToast('Could not load Twitch connection status');
      }
    },

    handleTwitchConnect() {
      if (!this.currentUserId) {
        this.showToast('No signed-in user found');
        return;
      }

      window.location.href =
        `http://localhost:3000/api/twitch/connect?userId=${encodeURIComponent(
          this.currentUserId
        )}`;
    }
  }
};
</script>

<script setup>
  import BotSidebar from '@/components/BotSidebar/BotSidebar.vue';
</script>

<style scoped src="./BotSettings.css"></style>