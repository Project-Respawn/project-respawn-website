<script src="./TherapistSidebar.js"></script>

<template>
  <aside class="therapist-sidebar">
    <!-- =====================================================
         THERAPIST IDENTITY
    ====================================================== -->
    <div class="therapist-sidebar-header">
      <span class="therapist-sidebar-header__icon">✦</span>

      <div>
        <strong class="therapist-sidebar-title">THERAPIST</strong>
        <span class="therapist-sidebar-subtitle">Professional Hub</span>
      </div>
    </div>

    <!-- =====================================================
         SUBSCRIPTION / TRIAL STATUS
    ====================================================== -->
    <div class="therapist-sidebar-plan">
      <!-- PREMIUM TRIAL -->
      <div
        v-if="isTrial"
        class="therapist-plan-card therapist-plan-card--trial"
      >
        <div class="therapist-plan-card__heading">
          <span class="therapist-plan-card__icon">✦</span>

          <strong>PREMIUM TRIAL</strong>
        </div>

        <strong class="therapist-plan-card__days">
          {{ trialDaysRemaining }} days remaining
        </strong>

        <p>
          All Therapist Premium features are currently unlocked.
        </p>

        <RouterLink
          to="/therapist/settings"
          class="therapist-plan-card__link"
        >
          See what's included →
        </RouterLink>
      </div>

      <!-- FREE -->
      <div
        v-else-if="isFree"
        class="therapist-plan-card therapist-plan-card--free"
      >
        <div class="therapist-plan-card__heading">
          <span class="therapist-plan-card__icon">✦</span>

          <strong>THERAPIST PREMIUM</strong>
        </div>

        <p>
          Unlock Between Session Insights, reports and advanced
          session preparation.
        </p>

        <strong class="therapist-plan-card__price">
          £{{ premiumPrice }} / month
        </strong>

        <RouterLink
          to="/therapist/settings"
          class="therapist-plan-card__link"
        >
          Explore Premium →
        </RouterLink>
      </div>

      <!-- PREMIUM -->
      <div
        v-else-if="isPremium"
        class="therapist-plan-card therapist-plan-card--premium"
      >
        <div class="therapist-plan-card__heading">
          <span class="therapist-plan-card__icon">◆</span>

          <strong>PREMIUM</strong>
        </div>

        <p>
          Between Session Insights and professional reports are enabled.
        </p>

        <RouterLink
          to="/therapist/settings"
          class="therapist-plan-card__link"
        >
          Manage subscription →
        </RouterLink>
      </div>
    </div>

    <!-- =====================================================
         MAIN NAVIGATION
    ====================================================== -->
    <nav
      class="therapist-sidebar-nav"
      aria-label="Therapist navigation"
    >
      <RouterLink
        to="/therapist"
        exact-active-class="therapist-nav-link-active"
        class="therapist-nav-link"
      >
        <span class="therapist-nav-icon">⌂</span>
        <span>Overview</span>
      </RouterLink>

      <RouterLink
        to="/therapist/clients"
        exact-active-class="therapist-nav-link-active"
        class="therapist-nav-link"
      >
        <span class="therapist-nav-icon">♙</span>
        <span>Clients</span>
      </RouterLink>

      <!-- ===================================================
           WORK WITH CLIENTS
      ==================================================== -->
      <span class="therapist-nav-heading">
        WORK WITH CLIENTS
      </span>

      <RouterLink
        to="/therapist/quests"
        exact-active-class="therapist-nav-link-active"
        class="therapist-nav-link"
      >
        <span class="therapist-nav-icon">✓</span>
        <span>Quests</span>

        <span
          v-if="activeQuestCount"
          class="therapist-nav-count"
        >
          {{ activeQuestCount }}
        </span>
      </RouterLink>

      <RouterLink
        to="/therapist/quests/new"
        exact-active-class="therapist-nav-link-active"
        class="therapist-nav-link"
      >
        <span class="therapist-nav-icon">＋</span>
        <span>Create Quest</span>
      </RouterLink>

      <!-- ===================================================
           INSIGHTS
      ==================================================== -->
      <span class="therapist-nav-heading">
        INSIGHTS
      </span>

      <RouterLink
        to="/therapist/insights"
        exact-active-class="therapist-nav-link-active"
        class="therapist-nav-link"
      >
        <span class="therapist-nav-icon">⌁</span>
        <span>Between Session Insights</span>

        <span
          v-if="!hasPremiumAccess"
          class="therapist-nav-premium"
          title="Therapist Premium"
        >
          ✦
        </span>
      </RouterLink>

      <RouterLink
        to="/therapist/reports"
        exact-active-class="therapist-nav-link-active"
        class="therapist-nav-link"
      >
        <span class="therapist-nav-icon">▤</span>
        <span>Reports</span>

        <span
          v-if="reportCount"
          class="therapist-nav-count therapist-nav-count--premium"
        >
          {{ reportCount }}
        </span>
      </RouterLink>

      <!-- ===================================================
           ACCOUNT
      ==================================================== -->
      <span class="therapist-nav-heading">
        ACCOUNT
      </span>

      <RouterLink
        to="/therapist/settings"
        exact-active-class="therapist-nav-link-active"
        class="therapist-nav-link"
      >
        <span class="therapist-nav-icon">⚙</span>
        <span>Settings</span>
      </RouterLink>
    </nav>

    <!-- =====================================================
         PROFILE
    ====================================================== -->
    <div class="therapist-sidebar-footer">
      <div class="therapist-sidebar-profile">
        <div class="therapist-sidebar-profile__avatar">
          {{ therapist.initials }}
        </div>

        <div class="therapist-sidebar-profile__details">
          <strong>{{ therapist.displayName }}</strong>
          <span>{{ therapist.role }}</span>
        </div>

        <RouterLink
          to="/therapist/settings"
          class="therapist-sidebar-profile__settings"
          aria-label="Therapist settings"
        >
          ⚙
        </RouterLink>
      </div>
    </div>
  </aside>
</template>

<style src="./TherapistSidebar.css"></style>