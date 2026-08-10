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
  name: 'CreatorIntegrations',
  data() {
    return {
      toastMessage: '',
      toastTimer: null,
      callbackRefreshTimer: null,
      twitchConnected: false,
      twitchAccountName: '',
      currentUserId: '',
      lookupUserIds: [],
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
    window.addEventListener('focus', this.handleWindowFocus);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    await this.loadCurrentUser();

    const callback = this.parseCallbackResult();

    if (callback.error) {
      this.showToast(`Twitch connection error: ${callback.error}`);
      this.clearOAuthQueryParams();
      await this.refreshStatus({ silent: true });
      return;
    }

    if (callback.isOAuthReturn) {
      this.showToast('Finalising Twitch connection...');
      await this.refreshStatusWithRetry();
      this.clearOAuthQueryParams();
      return;
    }

    await this.refreshStatus({ silent: true });
  },

  beforeUnmount() {
    window.removeEventListener('focus', this.handleWindowFocus);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    clearTimeout(this.callbackRefreshTimer);
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

        const tokenSub = session?.tokens?.idToken?.payload?.sub || '';
        const amplifyUserId = user?.userId || '';
        const amplifyUsername = user?.username || '';

        this.currentUserId =
          tokenSub ||
          amplifyUserId ||
          amplifyUsername ||
          '';

        this.lookupUserIds = [tokenSub, amplifyUserId, amplifyUsername]
          .map((value) => String(value || '').trim())
          .filter((value, index, list) => value && list.indexOf(value) === index);

        console.log('Current Cognito user ID:', this.currentUserId);
      } catch (error) {
        console.error('Failed to load current user:', error);
        this.currentUserId = '';
        this.lookupUserIds = [];
        this.showToast('Could not identify signed-in user');
      }
    },

    parseCallbackResult() {
      const searchParams = new URLSearchParams(window.location.search || '');
      const hashValue = window.location.hash || '';
      const hashQuery = hashValue.includes('?') ? hashValue.split('?')[1] : '';
      const hashParams = new URLSearchParams(hashQuery);

      const readParam = (name) => {
        return searchParams.get(name) || hashParams.get(name) || '';
      };

      const error = readParam('error');
      const hasCode = Boolean(readParam('code'));
      const hasState = Boolean(readParam('state'));
      const connectedFlag = String(readParam('connected')).toLowerCase();
      const successFlag = String(readParam('success')).toLowerCase();

      const isOAuthReturn =
        hasCode ||
        hasState ||
        connectedFlag === '1' ||
        connectedFlag === 'true' ||
        successFlag === '1' ||
        successFlag === 'true';

      return {
        error,
        isOAuthReturn
      };
    },

    clearOAuthQueryParams() {
      if (!window.location.search && !window.location.hash.includes('?')) {
        return;
      }

      const cleanUrl = `${window.location.origin}${window.location.pathname}`;
      window.history.replaceState({}, '', cleanUrl);
    },

    async fetchConnectionForUser(userId) {
      const response = await fetch(
        `http://localhost:3000/api/twitch/connection-by-user?userId=${encodeURIComponent(userId)}&t=${Date.now()}`,
        {
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        throw new Error('Connection request failed');
      }

      const data = await response.json();
      return data?.connection || null;
    },

    async fetchBotStatus() {
      const response = await fetch(
        `http://localhost:3000/api/twitch/status?t=${Date.now()}`,
        {
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        throw new Error('Status request failed');
      }

      return response.json();
    },

    async fetchConnectedBroadcaster() {
      const response = await fetch(
        `http://localhost:3000/api/twitch/connections?t=${Date.now()}`,
        {
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        throw new Error('Connections request failed');
      }

      const data = await response.json();
      const connections = Array.isArray(data?.connections) ? data.connections : [];

      return (
        connections.find((item) => item?.isConnected && (item?.twitchDisplayName || item?.twitchLogin)) ||
        null
      );
    },

    async refreshStatus({ silent = false } = {}) {
      try {
        let connection = null;

        if (this.lookupUserIds.length) {
          for (const userId of this.lookupUserIds) {
            const candidate = await this.fetchConnectionForUser(userId);
            if (candidate) {
              connection = candidate;
              break;
            }
          }
        }

        if (connection) {
          this.twitchConnected = !!connection?.isConnected;
          this.twitchAccountName =
            connection?.twitchDisplayName ||
            connection?.twitchLogin ||
            '';

          console.log('Twitch connection resolved by user lookup:', {
            localUserIds: this.lookupUserIds,
            twitchAccountName: this.twitchAccountName,
            isConnected: this.twitchConnected
          });

          return this.twitchConnected;
        }

        // Local fallback for cases where Cognito userId does not match the saved bot-side connection userId.
        const connectedBroadcaster = await this.fetchConnectedBroadcaster();

        if (connectedBroadcaster) {
          this.twitchConnected = true;
          this.twitchAccountName =
            connectedBroadcaster.twitchDisplayName ||
            connectedBroadcaster.twitchLogin ||
            '';

          console.log('Twitch connection resolved by broadcaster fallback:', {
            localUserIds: this.lookupUserIds,
            twitchAccountName: this.twitchAccountName,
            broadcasterUserId: connectedBroadcaster.broadcasterUserId || '',
            isConnected: true
          });

          return true;
        }

        const botStatus = await this.fetchBotStatus();
        this.twitchConnected = !!botStatus?.connected;
        this.twitchAccountName = botStatus?.displayName || botStatus?.username || '';

        console.log('Twitch status resolved by bot status fallback:', {
          localUserIds: this.lookupUserIds,
          botConnected: this.twitchConnected,
          botUsername: this.twitchAccountName
        });

        return this.twitchConnected;
      } catch (error) {
        console.error('Failed to refresh Twitch status:', error);
        this.twitchConnected = false;
        this.twitchAccountName = '';
        if (!silent) {
          this.showToast('Could not load Twitch connection status');
        }
        return false;
      }
    },

    async refreshStatusWithRetry() {
      const maxAttempts = 6;
      const delayMs = 1200;

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const connected = await this.refreshStatus({ silent: true });

        if (connected) {
          this.showToast('Twitch account connected');
          return;
        }

        if (attempt < maxAttempts - 1) {
          await new Promise((resolve) => {
            this.callbackRefreshTimer = setTimeout(resolve, delayMs);
          });
        }
      }

      this.showToast('Connection saved. Status will update shortly; use Refresh Status if needed.');
    },

    async handleWindowFocus() {
      await this.refreshStatus({ silent: true });
    },

    async handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        await this.refreshStatus({ silent: true });
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

<style scoped src="./Integrations.css"></style>
