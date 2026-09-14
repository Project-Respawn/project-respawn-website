<template>
  <aside
    class="team-hub-sidebar"
    :class="{ 'team-hub-sidebar--open': mobileOpen }"
  >
    <div class="sidebar-header">
      <RouterLink
        to="/team-hub"
        class="back-link"
        @click="closeMobileSidebar"
      >
        <span aria-hidden="true">←</span>
        All teams
      </RouterLink>

      <div class="team-identity">
        <div class="team-logo-container">
          <img
            :src="logoUrl"
            alt="Project Respawn"
            class="team-logo"
          />
        </div>

        <div class="team-details">
          <span class="team-label">TEAM WORKSPACE</span>
          <strong>{{ teamName }}</strong>
          <span>{{ gameName }}</span>
        </div>
      </div>
    </div>

    <nav
      class="sidebar-navigation"
      aria-label="Team workspace"
    >
      <!-- Player tools -->
      <div class="navigation-section">
        <span class="navigation-label">PLAYER TOOLS</span>

        <RouterLink
          :to="championPoolRoute"
          class="navigation-link"
          @click="closeMobileSidebar"
        >
          <span
            class="navigation-icon"
            aria-hidden="true"
          >
            CP
          </span>

          <span class="navigation-content">
            <strong>My Champion Pool</strong>
            <small>Rate your champions</small>
          </span>
        </RouterLink>
      </div>

      <!-- Coaching -->
      <div class="navigation-section">
        <span class="navigation-label">COACHING</span>

        <RouterLink
          v-if="canReviewPools"
          :to="coachReviewRoute"
          class="navigation-link"
          @click="closeMobileSidebar"
        >
          <span
            class="navigation-icon"
            aria-hidden="true"
          >
            CR
          </span>

          <span class="navigation-content">
            <strong>Coach Review</strong>
            <small>Review player submissions</small>
          </span>
        </RouterLink>

        <RouterLink
          v-if="canReviewPools"
          :to="teamPoolRoute"
          class="navigation-link"
          @click="closeMobileSidebar"
        >
          <span
            class="navigation-icon"
            aria-hidden="true"
          >
            TP
          </span>

          <span class="navigation-content">
            <strong>Team Pool</strong>
            <small>Build team compositions</small>
          </span>

          <span class="pro-badge">PRO</span>
        </RouterLink>

        <div class="navigation-link navigation-link--disabled">
          <span
            class="navigation-icon"
            aria-hidden="true"
          >
            PC
          </span>

          <span class="navigation-content">
            <strong>Premium Coaching</strong>
            <small>Advanced coaching tools</small>
          </span>

          <span class="coming-soon">Soon</span>
        </div>
      </div>

      <!-- Team management -->
      <div class="navigation-section">
        <span class="navigation-label">
          TEAM MANAGEMENT
        </span>

        <div class="navigation-link navigation-link--disabled">
          <span
            class="navigation-icon"
            aria-hidden="true"
          >
            RS
          </span>

          <span class="navigation-content">
            <strong>Roster</strong>
            <small>Players and roles</small>
          </span>

          <span class="coming-soon">Soon</span>
        </div>

        <div class="navigation-link navigation-link--disabled">
          <span
            class="navigation-icon"
            aria-hidden="true"
          >
            ST
          </span>

          <span class="navigation-content">
            <strong>Settings</strong>
            <small>Access and team details</small>
          </span>

          <span class="coming-soon">Soon</span>
        </div>
      </div>
    </nav>

    <footer class="sidebar-footer">
      <div>
        <span>Current plan</span>
        <strong>{{ planName }}</strong>
      </div>

      <span class="plan-badge">
        {{ planBadge }}
      </span>
    </footer>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import logoUrl from '../../assets/logo.png';

defineProps({
  teamName: {
    type: String,
    default: 'Project Respawn',
  },

  gameName: {
    type: String,
    default: 'League of Legends',
  },

  planName: {
    type: String,
    default: 'Team Hub Pro',
  },

  planBadge: {
    type: String,
    default: 'PRO',
  },

  canReviewPools: {
    type: Boolean,
    default: true,
  },

  mobileOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close']);

const route = useRoute();

const teamSlug = computed(() => {
  return route.params.teamSlug || 'project-respawn';
});

const championPoolRoute = computed(() => ({
  name: 'team-hub-champion-pool',

  params: {
    teamSlug: teamSlug.value,
  },
}));

const coachReviewRoute = computed(() => ({
  name: 'team-hub-coach-review',

  params: {
    teamSlug: teamSlug.value,
  },
}));

const teamPoolRoute = computed(() => ({
  name: 'team-hub-team-pool',

  params: {
    teamSlug: teamSlug.value,
  },
}));

function closeMobileSidebar() {
  emit('close');
}
</script>

<style scoped>
.team-hub-sidebar {
  display: flex;
  flex: 0 0 270px;
  width: 270px;
  min-height: calc(100vh - var(--header-height, 72px));
  flex-direction: column;
  color: #f5f7fa;
  border-right: 1px solid rgba(255, 255, 255, 0.09);
  background:
    linear-gradient(
      180deg,
      rgba(139, 61, 255, 0.07),
      transparent 35%
    ),
    #090c11;
}

.sidebar-header {
  padding: 22px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 22px;
  color: #aeb6c2;
  font-size: 0.85rem;
  text-decoration: none;
}

.back-link:hover {
  color: #a9ff38;
}

.team-identity {
  display: flex;
  align-items: center;
  gap: 13px;
}

.team-logo-container {
  display: grid;
  flex: 0 0 52px;
  width: 52px;
  height: 52px;
  place-items: center;
  border: 1px solid rgba(139, 61, 255, 0.45);
  border-radius: 11px;
  background: rgba(139, 61, 255, 0.08);
}

.team-logo {
  width: 82%;
  height: 82%;
  object-fit: contain;
}

.team-details {
  min-width: 0;
}

.team-details strong,
.team-details span {
  display: block;
}

.team-details strong {
  overflow: hidden;
  margin: 3px 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-details > span:last-child {
  color: #929cab;
  font-size: 0.78rem;
}

.team-label,
.navigation-label {
  color: #a9ff38;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.11em;
}

.sidebar-navigation {
  flex: 1;
  padding: 18px 12px;
}

.navigation-section + .navigation-section {
  margin-top: 26px;
}

.navigation-label {
  display: block;
  margin: 0 9px 9px;
  color: #7e8795;
}

.navigation-link {
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 54px;
  padding: 9px 11px;
  color: #c8ced7;
  border: 1px solid transparent;
  border-radius: 9px;
  text-decoration: none;
}

.navigation-link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.04);
}

.navigation-link.router-link-active {
  color: #ffffff;
  border-color: rgba(169, 255, 56, 0.25);
  background:
    linear-gradient(
      90deg,
      rgba(169, 255, 56, 0.12),
      rgba(139, 61, 255, 0.06)
    );
}

.navigation-link.router-link-active .navigation-icon {
  color: #a9ff38;
  border-color: rgba(169, 255, 56, 0.4);
}

.navigation-link.router-link-active .pro-badge {
  color: #071000;
  border-color: #a9ff38;
  background: #a9ff38;
}

.navigation-link--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.navigation-link--disabled:hover {
  color: #c8ced7;
  background: transparent;
}

.navigation-icon {
  display: grid;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  place-items: center;
  color: #c29cff;
  border: 1px solid rgba(139, 61, 255, 0.28);
  border-radius: 8px;
  background: rgba(139, 61, 255, 0.08);
  font-size: 0.68rem;
  font-weight: 700;
}

.navigation-content {
  min-width: 0;
  flex: 1;
}

.navigation-content strong,
.navigation-content small {
  display: block;
}

.navigation-content strong {
  margin-bottom: 3px;
  font-size: 0.86rem;
}

.navigation-content small {
  overflow: hidden;
  color: #7f8998;
  font-size: 0.72rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coming-soon,
.pro-badge,
.plan-badge {
  padding: 3px 6px;
  color: #aeb6c2;
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: 700;
}

.pro-badge,
.plan-badge {
  color: #c29cff;
  border-color: rgba(139, 61, 255, 0.35);
  background: rgba(139, 61, 255, 0.09);
}

.sidebar-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 17px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-footer span,
.sidebar-footer strong {
  display: block;
}

.sidebar-footer > div > span {
  margin-bottom: 3px;
  color: #7f8998;
  font-size: 0.7rem;
}

.sidebar-footer strong {
  font-size: 0.82rem;
}

@media (max-width: 800px) {
  .team-hub-sidebar {
    display: none;
    width: 100%;
    min-height: auto;
  }

  .team-hub-sidebar--open {
    display: flex;
  }
}
</style>