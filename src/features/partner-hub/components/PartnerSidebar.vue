<script setup>
// ============================================================
// PROJECT RESPAWN — PARTNER HUB SIDEBAR
// ============================================================

// Project Respawn brand asset
import respawnLogo from '../../../assets/logo.png';
</script>

<template>
  <aside class="partner-sidebar">

    <!-- ======================================================
         PROJECT RESPAWN BRANDING
         ====================================================== -->

    <div class="partner-sidebar-brand">

      <img
        :src="respawnLogo"
        alt=""
        class="partner-sidebar-logo"
        aria-hidden="true"
      />

      <div class="partner-sidebar-brand-text">
        <span class="partner-brand-project">
          PROJECT
        </span>

        <span class="partner-brand-respawn">
          RESPAWN
        </span>
      </div>

    </div>

    <div class="partner-sidebar-divider" />

    <!-- ======================================================
         PARTNER HUB NAVIGATION
         ====================================================== -->

    <span class="partner-sidebar-section-title">
      PARTNER HUB
    </span>

    <nav
      class="partner-navigation"
      aria-label="Partner Hub navigation"
    >

      <!-- Dashboard -->

      <RouterLink
        to="/partner"
        class="partner-nav-item"
        exact-active-class="partner-nav-item-active"
      >
        <span
          class="partner-nav-icon"
          aria-hidden="true"
        >
          ▦
        </span>

        <span>Dashboard</span>
      </RouterLink>

      <!-- Brand Profile -->

      <RouterLink
        to="/partner/profile"
        class="partner-nav-item"
        active-class="partner-nav-item-active"
      >
        <span
          class="partner-nav-icon"
          aria-hidden="true"
        >
          ♙
        </span>

        <span>Brand Profile</span>
      </RouterLink>

      <!-- Campaigns -->

      <RouterLink
        to="/partner/campaigns"
        class="partner-nav-item"
        active-class="partner-nav-item-active"
      >
        <span
          class="partner-nav-icon"
          aria-hidden="true"
        >
          ◀
        </span>

        <span>Campaigns</span>
      </RouterLink>

      <!-- Analytics -->

      <RouterLink
        to="/partner/analytics"
        class="partner-nav-item"
        active-class="partner-nav-item-active"
      >
        <span
          class="partner-nav-icon"
          aria-hidden="true"
        >
          ⌁
        </span>

        <span>Analytics</span>
      </RouterLink>

    </nav>

    <div class="partner-sidebar-divider" />

    <!-- ======================================================
         CREATOR DISCOVERY — COMING SOON
         ====================================================== -->

    <RouterLink
      to="/partner/creators"
      class="partner-nav-coming-soon"
    >
      <span>
        Creator Discovery
      </span>

      <span class="partner-coming-soon-badge">
        Coming Soon
      </span>
    </RouterLink>

    <!-- Push support section to bottom -->

    <div class="partner-sidebar-spacer" />

    <!-- ======================================================
         PARTNER SUPPORT
         ====================================================== -->

    <div class="partner-support-card">

      <strong>
        Need help?
      </strong>

      <p>
        Your dedicated partner manager is here to help.
      </p>

      <div class="partner-manager-mini">

        <div
          class="partner-manager-avatar"
          aria-hidden="true"
        >
          SM
        </div>

        <div>
          <strong>
            Sarah Mitchell
          </strong>

          <span>
            Partnerships Manager
          </span>
        </div>

      </div>

      <button
        type="button"
        class="partner-text-button"
      >
        Send a message →
      </button>

    </div>

  </aside>
</template>