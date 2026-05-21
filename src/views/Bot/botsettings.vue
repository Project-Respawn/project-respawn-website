<template>
  <div class="bot-page">
    <aside class="bot-sidebar">
      <div class="brand-block">
        <div class="brand-icon">R</div>
        <div>
          <p class="brand-kicker">Project Respawn</p>
          <h1 class="brand-title">Connections</h1>
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
        <div class="status-pill online" :class="{ offline: !twitchConnected }">
          {{ twitchConnected ? 'Twitch Connected' : 'Awaiting Connection' }}
        </div>
        <p class="sidebar-note">
          Connect your Twitch account to Project Respawn Bot and prepare for future Discord server linking.
        </p>
      </div>
    </aside>

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

<style scoped>
.bot-page {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(145, 70, 255, 0.18), transparent 22%),
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
  background: linear-gradient(135deg, #9146ff, #5865f2);
  color: #fff;
  box-shadow: 0 10px 24px rgba(145, 70, 255, 0.35);
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
  background: linear-gradient(135deg, rgba(145, 70, 255, 0.22), rgba(88, 101, 242, 0.14));
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

.status-pill.offline {
  background: rgba(148, 163, 184, 0.12);
  color: #cbd5e1;
  border: 1px solid rgba(203, 213, 225, 0.15);
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
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.25);
}

.connections-hero {
  background: linear-gradient(135deg, rgba(145, 70, 255, 0.24), rgba(88, 101, 242, 0.12));
}

.eyebrow,
.section-kicker {
  margin: 0 0 8px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #c4b5fd;
}

.hero-card h2 {
  margin: 0;
  font-size: 2rem;
  line-height: 1.15;
  max-width: 14ch;
}

.hero-text {
  margin: 14px 0 0;
  max-width: 58ch;
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
.secondary-btn {
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s ease;
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

.card-grid {
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
  margin: 0;
  color: #9fb0cc;
  line-height: 1.6;
  min-height: 96px;
}

.card-badge {
  display: inline-flex;
  margin-bottom: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(145, 70, 255, 0.14);
  color: #d8b4fe;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.status-panel,
.coming-soon-card {
  padding: 20px;
  border-radius: 22px;
  background: rgba(10, 16, 31, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.status-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.status-row:last-child {
  border-bottom: none;
}

.status-label {
  color: #94a3b8;
  font-weight: 600;
}

.status-value {
  color: #e2e8f0;
  text-align: right;
}

.status-value.good {
  color: #6ee7b7;
}

.status-value.muted {
  color: #cbd5e1;
}

.coming-soon-card {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(220px, 0.7fr);
  gap: 20px;
  align-items: center;
}

.coming-badge {
  display: inline-flex;
  margin-bottom: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(88, 101, 242, 0.14);
  color: #c7d2fe;
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.coming-soon-copy h4 {
  margin: 0 0 10px;
  font-size: 1.2rem;
  color: #fff;
}

.coming-soon-copy p {
  margin: 0;
  color: #9fb0cc;
  line-height: 1.65;
  max-width: 56ch;
}

.coming-soon-points {
  display: grid;
  gap: 10px;
}

.coming-point {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(88, 101, 242, 0.1);
  border: 1px solid rgba(199, 210, 254, 0.1);
  color: #dbeafe;
  font-weight: 600;
}

.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(145, 70, 255, 0.92);
  color: white;
  font-weight: 600;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1180px) {
  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-card,
  .coming-soon-card {
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

  .status-row {
    flex-direction: column;
  }

  .status-value {
    text-align: left;
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

  .card-grid {
    grid-template-columns: 1fr;
  }

  .section-heading {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>