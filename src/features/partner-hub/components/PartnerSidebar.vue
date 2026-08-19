<template>
  <aside class="partner-sidebar">
    <div class="partner-sidebar-brand">
      <div class="respawn-mark">R</div>

      <div>
        <span class="brand-small">PROJECT</span>
        <strong>RESPAWN</strong>
      </div>
    </div>

    <div class="partner-sidebar-divider" />

    <span class="partner-sidebar-section-title">
      PARTNER HUB
    </span>

    <nav class="partner-navigation">
      <RouterLink
        to="/partner"
        class="partner-nav-item"
        exact-active-class="partner-nav-item-active"
      >
        <span class="partner-nav-icon">▦</span>
        Dashboard
      </RouterLink>

      <RouterLink
        to="/partner/profile"
        class="partner-nav-item"
        active-class="partner-nav-item-active"
      >
        <span class="partner-nav-icon">♙</span>
        Brand Profile
      </RouterLink>

      <RouterLink
        to="/partner/campaigns"
        class="partner-nav-item"
        active-class="partner-nav-item-active"
      >
        <span class="partner-nav-icon">◀</span>
        Campaigns
      </RouterLink>

      <RouterLink
        to="/partner/analytics"
        class="partner-nav-item"
        active-class="partner-nav-item-active"
      >
        <span class="partner-nav-icon">⌁</span>
        Analytics
      </RouterLink>
    </nav>

    <div class="partner-sidebar-divider" />

    <RouterLink
      to="/partner/creators"
      class="partner-nav-coming-soon"
    >
      <span>Creator Discovery</span>
      <span class="partner-coming-soon-badge">
        Coming Soon
      </span>
    </RouterLink>

    <div class="partner-sidebar-spacer" />

    <div class="partner-support-card">
      <strong>Need help?</strong>

      <p>
        Your dedicated partner manager is here to help.
      </p>

      <div class="partner-manager-mini">
        <div class="partner-manager-avatar">
          SM
        </div>

        <div>
          <strong>Sarah Mitchell</strong>
          <span>Partnerships Manager</span>
        </div>
      </div>

      <button class="partner-text-button">
        Send a message →
      </button>
    </div>
  </aside>
</template><!-- Partner Hub placeholder -->
