<template>
  <div class="bot-page discord-layout-page">
    <BotSidebar
      :title="'Discord Dashboard'"
      :colourBrand1="'#5865f2'"
      :colourBrand2="'#8b5cf6'"
      :colourBoxShadow="'rgba(124, 58, 237, 0.35)'"
    />

    <main class="bot-main discord-layout-main">
      <section class="discord-topbar-card">
        <div class="discord-topbar-left">
          <div class="discord-topbar-copy">
            <p class="discord-kicker">Project Respawn Discord</p>
            <h1>{{ currentServer.name }}</h1>
            <p class="discord-subtitle">
              You are managing this server’s Discord tools and settings from the shared dashboard.
            </p>
          </div>

          <div class="discord-server-meta">
            <div class="discord-server-icon" aria-hidden="true">
              {{ currentServer.initials }}
            </div>

            <div class="discord-server-meta-copy">
              <span class="discord-meta-label">Current server</span>
              <strong>{{ currentServer.name }}</strong>
              <span class="discord-meta-secondary">
                Linked by {{ currentServer.linkedBy }} · {{ currentServer.memberCount }} members
              </span>
            </div>
          </div>
        </div>

        <div class="discord-topbar-right">
          <label class="discord-server-switcher">
            <span class="discord-switcher-label">Switch server</span>
            <select v-model="selectedServerId" @change="handleServerChange">
              <option
                v-for="server in availableServers"
                :key="server.id"
                :value="server.id"
              >
                {{ server.name }}
              </option>
            </select>
          </label>

          <div class="discord-status-grid">
            <article class="discord-status-pill discord-status-pill--success">
              <span class="discord-status-label">Connection</span>
              <strong>{{ currentServer.connectionStatus }}</strong>
            </article>

            <article class="discord-status-pill discord-status-pill--info">
              <span class="discord-status-label">Access</span>
              <strong>{{ currentUserAccess }}</strong>
            </article>

            <article class="discord-status-pill discord-status-pill--neutral">
              <span class="discord-status-label">Last sync</span>
              <strong>{{ currentServer.lastSync }}</strong>
            </article>
          </div>

          <div class="discord-topbar-actions">
            <button
              type="button"
              class="discord-action-btn discord-action-btn--secondary"
              @click="openDiscordSettings"
            >
              Open settings
            </button>

            <button
              type="button"
              class="discord-action-btn discord-action-btn--primary"
              @click="refreshDiscordContext"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section class="discord-page-shell">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script src="./DiscordLayout.js"></script>
<style scoped src="./DiscordLayout.css"></style>