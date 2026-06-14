<template>
  <div class="admin-layout-wrapper">
    <div v-if="authChecking" class="modal-overlay">
      <div class="auth-modal">
        <div class="modal-glow"></div>
        <div class="modal-header">
          <p class="modal-subtitle">Checking your dashboard permissions...</p>
        </div>
        <div class="spinner" style="margin: 12px auto 0;"></div>
      </div>
    </div>

    <div v-else-if="authError && !isAuthenticated" class="modal-overlay">
      <div class="auth-modal">
        <div class="modal-glow"></div>
        <div class="modal-header">
          <p class="modal-subtitle">Access restricted</p>
        </div>

        <p class="error-text" style="margin-bottom: 16px;">{{ authError }}</p>

        <button @click="handleSignOut" class="btn-primary">
          Sign Out
        </button>
      </div>
    </div>

    <div v-else class="admin-layout">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-dot"></div>
          <span>Respawn Admin</span>
        </div>

        <nav class="sidebar-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="nav-item"
            :class="{ active: activeTab === tab.id }"
            @click="goToTab(tab)"
          >
            <span class="nav-icon">{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
          </button>
        </nav>

        <div class="sidebar-footer">
          <div class="admin-chip">
            <div class="chip-avatar">{{ currentAdminInitials }}</div>
            <div class="chip-info">
              <span class="chip-name">{{ currentAdminPrimaryRoleLabel }}</span>
              <span class="chip-email">{{ adminEmail }}</span>
            </div>
          </div>

          <button class="btn-signout" @click="handleSignOut">Sign Out</button>
        </div>
      </aside>

      <main class="admin-layout-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script src="./AdminLayout.js"></script>
<style src="./AdminLayout.css"></style>