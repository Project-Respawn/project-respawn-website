<script src="./TherapistClients.js"></script>

<template>
  <section class="therapist-clients">
    <!-- =====================================================
         HEADER
    ====================================================== -->
    <header class="therapist-clients__header">
      <div>
        <h1>Clients</h1>
        <p>
          Manage your connected clients, review progress and prepare for
          upcoming sessions.
        </p>
      </div>

      <button
        type="button"
        class="primary-button"
        @click="handleConnectClient"
      >
        <span>＋</span>
        Connect Client
      </button>
    </header>

    <!-- =====================================================
         SUMMARY CARDS
    ====================================================== -->
    <section class="client-summary-grid">
      <article
        v-for="metric in summaryMetrics"
        :key="metric.id"
        class="client-summary-card"
        :class="`client-summary-card--${metric.tone}`"
      >
        <div class="client-summary-card__icon">
          {{ metric.icon }}
        </div>

        <div class="client-summary-card__content">
          <strong>{{ metric.value }}</strong>
          <span>{{ metric.label }}</span>

          <small :class="`text-${metric.tone}`">
            {{ metric.detail }}
          </small>
        </div>

        <span
          v-if="metric.premium"
          class="premium-badge"
        >
          Premium
        </span>
      </article>
    </section>

    <!-- =====================================================
         SEARCH / FILTERS
    ====================================================== -->
    <section class="client-toolbar">
      <label class="client-search">
        <span class="client-search__icon">⌕</span>

        <input
          v-model.trim="searchQuery"
          type="search"
          placeholder="Search clients..."
          aria-label="Search clients"
        />
      </label>

      <div class="client-filters" aria-label="Client filters">
        <button
          v-for="filter in filters"
          :key="filter.id"
          type="button"
          class="filter-button"
          :class="{ 'filter-button--active': activeFilter === filter.id }"
          @click="activeFilter = filter.id"
        >
          {{ filter.label }}

          <span
            v-if="filter.premium"
            class="filter-button__premium"
          >
            ●
          </span>
        </button>
      </div>

      <label class="client-sort">
        <span>Sort by:</span>

        <select v-model="sortBy">
          <option value="next-session">Next Session</option>
          <option value="name">Name</option>
          <option value="recent-activity">Recent Activity</option>
        </select>
      </label>
    </section>

    <!-- =====================================================
         CLIENT LIST
    ====================================================== -->
    <section class="client-list">
      <article
        v-for="client in filteredClients"
        :key="client.id"
        class="client-card"
      >
        <div class="client-card__main">
          <!-- Identity -->
          <div class="client-card__identity">
            <div
              class="client-avatar"
              :class="`client-avatar--${client.tone}`"
            >
              {{ client.initials }}

              <span
                class="client-avatar__status"
                :class="`client-avatar__status--${client.statusTone}`"
              ></span>
            </div>

            <div class="client-card__identity-content">
              <strong>{{ client.name }}</strong>

              <span>
                Connected {{ client.connectedFor }}
              </span>

              <small
                class="sharing-status"
                :class="{
                  'sharing-status--updated': client.sharingUpdated,
                }"
              >
                🔒
                {{
                  client.sharingUpdated
                    ? "Sharing updated"
                    : "Sharing active"
                }}
              </small>
            </div>
          </div>

          <!-- Next session -->
          <div class="client-card__stat">
            <span class="client-card__label">
              Next Session
            </span>

            <strong :class="`text-${client.sessionTone}`">
              {{ client.nextSession }}
            </strong>

            <small>{{ client.nextSessionDetail }}</small>
          </div>

          <!-- Quests -->
          <div class="client-card__stat">
            <span class="client-card__label">
              Quests
            </span>

            <strong :class="`text-${client.questTone}`">
              {{ client.completedQuests }} / {{ client.totalQuests }}
            </strong>

            <small>
              {{ client.questStatus }}
            </small>
          </div>

          <!-- Since last session -->
          <div class="client-card__stat client-card__stat--insights">
            <span class="client-card__label">
              Since Last Session
            </span>

            <strong>
              {{ client.activitiesSinceLastSession }}
            </strong>

            <small
              v-if="hasPremiumAccess && client.confidenceTrend"
              class="confidence-trend"
            >
              Confidence
              <span :class="`text-${client.confidenceTone}`">
                {{ client.confidenceTrend }}
              </span>
            </small>

            <small v-else>
              Activity summary available
            </small>
          </div>

          <!-- Status -->
          <div class="client-card__status-area">
            <span
              class="client-status-pill"
              :class="`client-status-pill--${client.statusTone}`"
            >
              {{ client.status }}
            </span>
          </div>

          <!-- Actions -->
          <div class="client-card__actions">
            <RouterLink
              :to="`/therapist/quests/new?client=${client.id}`"
              class="secondary-button"
            >
              Assign Quest
            </RouterLink>

            <RouterLink
              :to="`/therapist/clients/${client.id}`"
              class="primary-button primary-button--small"
            >
              Open Client
              <span>→</span>
            </RouterLink>
          </div>
        </div>

        <div class="client-card__activity">
          <span>Last activity:</span>
          <strong>{{ client.lastActivity }}</strong>
          <small>· {{ client.lastActivityTime }}</small>
        </div>
      </article>

      <div
        v-if="filteredClients.length === 0"
        class="client-empty-state"
      >
        <strong>No clients found</strong>
        <p>
          Try changing your search or filters.
        </p>
      </div>
    </section>

    <!-- =====================================================
         FOOTER NOTE
    ====================================================== -->
    <footer class="clients-sharing-note">
      <span>ⓘ</span>
      Clients control what they share. You can review sharing permissions
      in each client workspace.
    </footer>
  </section>
</template>

<style src="./TherapistClients.css"></style>