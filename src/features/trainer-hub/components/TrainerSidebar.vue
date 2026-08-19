<script setup>
// ============================================================
// PROJECT RESPAWN — TRAINER HUB SIDEBAR
// ============================================================

import respawnLogo from '../../../assets/logo.png';
</script>

<template>
  <aside class="trainer-sidebar">

    <!-- ======================================================
         PROJECT RESPAWN BRANDING
         ====================================================== -->

    <div class="trainer-sidebar-brand">

      <img
        :src="respawnLogo"
        alt=""
        aria-hidden="true"
        class="trainer-sidebar-logo"
      />

      <div class="trainer-sidebar-brand-text">

        <span class="trainer-brand-project">
          PROJECT
        </span>

        <span class="trainer-brand-respawn">
          RESPAWN
        </span>

      </div>

    </div>


    <!-- ======================================================
         TRAINER HUB LABEL
         ====================================================== -->

    <div class="trainer-sidebar-hub-label">
      TRAINER HUB
    </div>


    <!-- ======================================================
         MAIN NAVIGATION
         ====================================================== -->

    <nav
      class="trainer-navigation"
      aria-label="Trainer Hub navigation"
    >

      <!-- Dashboard -->

      <RouterLink
        to="/trainer"
        class="trainer-nav-item"
        exact-active-class="trainer-nav-item-active"
      >

        <span
          class="trainer-nav-icon"
          aria-hidden="true"
        >
          ⌂
        </span>

        <span>
          Dashboard
        </span>

      </RouterLink>


      <!-- Clients -->

      <RouterLink
        to="/trainer/clients"
        class="trainer-nav-item"
        active-class="trainer-nav-item-active"
      >

        <span
          class="trainer-nav-icon"
          aria-hidden="true"
        >
          ◉
        </span>

        <span>
          Clients
        </span>

      </RouterLink>


      <!-- Quests -->

      <RouterLink
        to="/trainer/quests"
        class="trainer-nav-item"
        active-class="trainer-nav-item-active"
      >

        <span
          class="trainer-nav-icon"
          aria-hidden="true"
        >
          ▣
        </span>

        <span>
          Quests
        </span>

      </RouterLink>


      <!-- Challenges -->

      <RouterLink
        to="/trainer/challenges"
        class="trainer-nav-item"
        active-class="trainer-nav-item-active"
      >

        <span
          class="trainer-nav-icon"
          aria-hidden="true"
        >
          ♛
        </span>

        <span>
          Challenges
        </span>

      </RouterLink>


      <!-- Engagement -->

      <RouterLink
        to="/trainer/engagement"
        class="trainer-nav-item"
        active-class="trainer-nav-item-active"
      >

        <span
          class="trainer-nav-icon"
          aria-hidden="true"
        >
          ▥
        </span>

        <span>
          Engagement
        </span>

      </RouterLink>


      <!-- Messages — Coming Soon -->

      <div
        class="trainer-nav-item trainer-nav-coming-soon"
        aria-disabled="true"
      >

        <span
          class="trainer-nav-icon"
          aria-hidden="true"
        >
          💬
        </span>

        <span>
          Messages
        </span>

        <span class="trainer-coming-soon-badge">
          Coming Soon
        </span>

      </div>

    </nav>


    <!-- ======================================================
         SPACER
         ====================================================== -->

    <div class="trainer-sidebar-spacer" />


    <!-- ======================================================
         TRAINER PROFILE
         ====================================================== -->

    <div class="trainer-sidebar-profile">

      <div class="trainer-sidebar-avatar">
        SM
      </div>

      <div class="trainer-sidebar-profile-copy">

        <strong>
          Sarah Mitchell
        </strong>

        <span>
          Personal Trainer
        </span>

      </div>

      <span
        class="trainer-profile-chevron"
        aria-hidden="true"
      >
        ⌄
      </span>

    </div>


    <!-- ======================================================
         BOTTOM ACTIONS
         ====================================================== -->

    <div class="trainer-sidebar-bottom">

      <button
        type="button"
        class="trainer-sidebar-bottom-action"
      >

        <span aria-hidden="true">
          ⚙
        </span>

        <span>
          Settings
        </span>

      </button>


      <button
        type="button"
        class="trainer-sidebar-bottom-action"
      >

        <span aria-hidden="true">
          ↪
        </span>

        <span>
          Log out
        </span>

      </button>

    </div>

  </aside>
</template><!-- Trainer Hub placeholder -->
