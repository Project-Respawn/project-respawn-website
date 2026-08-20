<script src="./TherapistClientDetail.js"></script>

<template>
  <section
    v-if="client"
    class="therapist-client-detail"
  >
    <!-- =====================================================
         BACK
    ====================================================== -->
    <RouterLink
      to="/therapist/clients"
      class="client-detail-back"
    >
      ← Back to Clients
    </RouterLink>

    <!-- =====================================================
         CLIENT HEADER
    ====================================================== -->
    <header class="client-detail-header">
      <div class="client-detail-header__identity">
        <div class="client-detail-avatar">
          {{ client.initials }}
        </div>

        <div>
          <h1>{{ client.name }}</h1>

          <div class="client-detail-meta">
            <span>
              Connected {{ client.connectedFor }}
            </span>

            <span>•</span>

            <span class="client-sharing-active">
              🔒 Sharing active
            </span>
          </div>
        </div>
      </div>

      <div class="client-detail-header__actions">
        <RouterLink
          :to="`/therapist/quests/new?client=${client.id}`"
          class="client-detail-button client-detail-button--primary"
        >
          ＋ Assign Quest
        </RouterLink>

        <button
          type="button"
          class="client-detail-button client-detail-button--secondary"
        >
          ◯ Message
        </button>

        <div class="client-next-session">
          <span>Next session</span>

          <strong>
            {{ client.nextSession }}
          </strong>

          <small>
            {{ client.nextSessionDetail }}
          </small>
        </div>
      </div>
    </header>

    <!-- =====================================================
         TABS
    ====================================================== -->
    <nav
      class="client-detail-tabs"
      aria-label="Client workspace"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="client-detail-tab"
        :class="{
          'client-detail-tab--active':
            activeTab === tab.id,
        }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}

        <span
          v-if="tab.premium"
          class="client-detail-tab__premium"
        >
          ✦
        </span>
      </button>
    </nav>

    <!-- =====================================================
         OVERVIEW
    ====================================================== -->
    <template v-if="activeTab === 'overview'">
      <!-- SUMMARY -->
      <section class="client-detail-summary">
        <article
          v-for="metric in summaryMetrics"
          :key="metric.id"
          class="client-detail-summary-card"
        >
          <div
            class="client-detail-summary-card__icon"
            :class="`client-detail-summary-card__icon--${metric.tone}`"
          >
            {{ metric.icon }}
          </div>

          <div>
            <span>{{ metric.label }}</span>

            <strong>{{ metric.value }}</strong>

            <small
              v-if="metric.detail"
              :class="`text-${metric.tone}`"
            >
              {{ metric.detail }}
            </small>
          </div>
        </article>
      </section>

      <!-- ===================================================
           MAIN WORKSPACE
      ==================================================== -->
      <section class="client-detail-grid">
        <!-- SINCE LAST SESSION -->
        <article class="client-workspace-card">
          <div class="client-workspace-card__header">
            <h2>Since Last Session</h2>

            <span class="client-workspace-badge">
              7 days
            </span>
          </div>

          <div class="session-stat-grid">
            <div>
              <strong>5</strong>
              <span>Activities</span>
            </div>

            <div>
              <strong>4 / 5</strong>
              <span>Quests completed</span>
            </div>

            <div>
              <strong>3</strong>
              <span>Reflections</span>
            </div>

            <div>
              <strong class="text-green">↑</strong>
              <span>Confidence trend</span>
            </div>
          </div>

          <div class="activity-timeline">
            <article
              v-for="activity in recentTimeline"
              :key="activity.id"
              class="timeline-item"
            >
              <div class="timeline-item__date">
                <strong>{{ activity.day }}</strong>
                <span>{{ activity.date }}</span>
              </div>

              <div
                class="timeline-item__marker"
                :class="`timeline-item__marker--${activity.tone}`"
              >
                {{ activity.icon }}
              </div>

              <div class="timeline-item__content">
                <strong>{{ activity.title }}</strong>
                <span>{{ activity.detail }}</span>

                <small
                  v-if="activity.result"
                  :class="`text-${activity.tone}`"
                >
                  {{ activity.result }}
                </small>
              </div>
            </article>
          </div>

          <RouterLink
            :to="`/therapist/clients/${client.id}/activity`"
            class="client-card-link"
          >
            View full activity timeline →
          </RouterLink>
        </article>

        <!-- CURRENT QUESTS -->
        <article class="client-workspace-card">
          <div class="client-workspace-card__header">
            <h2>Current Quests</h2>

            <RouterLink
              :to="`/therapist/quests/new?client=${client.id}`"
              class="client-card-small-button"
            >
              ＋ Assign Quest
            </RouterLink>
          </div>

          <div class="current-quest-list">
            <article
              v-for="quest in currentQuests"
              :key="quest.id"
              class="current-quest"
            >
              <div
                class="current-quest__status"
                :class="`current-quest__status--${quest.tone}`"
              >
                {{ quest.completed ? "✓" : "" }}
              </div>

              <div class="current-quest__content">
                <strong>{{ quest.title }}</strong>

                <span :class="`text-${quest.tone}`">
                  {{ quest.status }}
                </span>
              </div>

              <div class="current-quest__points">
                <strong>+{{ quest.points }}</strong>
                <span>Points</span>
              </div>
            </article>
          </div>

          <RouterLink
            :to="`/therapist/clients/${client.id}/quests`"
            class="client-card-link"
          >
            View all quests →
          </RouterLink>
        </article>

        <!-- RECENT REFLECTIONS -->
        <article class="client-workspace-card">
          <div class="client-workspace-card__header">
            <h2>Recent Reflections</h2>
          </div>

          <div class="reflection-list">
            <article
              v-for="reflection in reflections"
              :key="reflection.id"
              class="reflection-item"
            >
              <div class="reflection-item__icon">
                “
              </div>

              <div>
                <blockquote>
                  {{ reflection.text }}
                </blockquote>

                <small>
                  {{ reflection.activity }}
                  <span>•</span>
                  {{ reflection.date }}
                </small>
              </div>

              <span class="reflection-item__arrow">
                ›
              </span>
            </article>
          </div>

          <RouterLink
            :to="`/therapist/clients/${client.id}/activity`"
            class="client-card-link"
          >
            View all reflections →
          </RouterLink>
        </article>

        <!-- SESSION PREPARATION -->
        <article class="client-workspace-card">
          <div class="client-workspace-card__header">
            <h2>Session Preparation</h2>
          </div>

          <div class="session-preparation">
            <div class="session-preparation__icon">
              ▤
            </div>

            <div>
              <strong>Report ready</strong>

              <span>7 days analysed</span>

              <p>
                A structured summary of activity, quest progress,
                reflections and changes since your previous session.
              </p>

              <RouterLink
                :to="`/therapist/clients/${client.id}/reports`"
                class="client-detail-button client-detail-button--primary"
              >
                View preparation report →
              </RouterLink>
            </div>
          </div>
        </article>
      </section>

      <!-- ===================================================
           CLIENT DISCUSSION POINTS
      ==================================================== -->
      <section class="client-wide-card">
        <div class="client-workspace-card__header">
          <h2>Client Wants To Discuss</h2>

          <span class="client-workspace-badge">
            {{ discussionPoints.length }} points
          </span>
        </div>

        <div class="discussion-list">
          <article
            v-for="point in discussionPoints"
            :key="point.id"
            class="discussion-item"
          >
            <div class="discussion-item__icon">
              💬
            </div>

            <div class="discussion-item__content">
              <strong>
                “{{ point.text }}”
              </strong>

              <span>
                Added by {{ client.firstName }}
                <span>•</span>
                {{ point.date }}
              </span>
            </div>

            <span
              v-if="point.priority"
              class="discussion-priority"
            >
              Priority
            </span>

            <span class="discussion-item__arrow">
              ›
            </span>
          </article>
        </div>

        <div class="client-wide-card__footer">
          <button
            type="button"
            class="client-card-link client-card-link--button"
          >
            View all {{ discussionPoints.length }}
            discussion points →
          </button>
        </div>
      </section>

      <!-- ===================================================
           SHARING
      ==================================================== -->
      <section class="client-wide-card client-sharing-card">
        <div class="client-workspace-card__header">
          <div class="client-sharing-card__heading">
            <h2>Sharing & Permissions</h2>

            <span>
              Your client controls what you can see.
              Last updated: 16 Aug
            </span>
          </div>

          <RouterLink
            :to="`/therapist/clients/${client.id}/sharing`"
            class="client-card-link"
          >
            Manage sharing details →
          </RouterLink>
        </div>

        <div class="sharing-permissions-grid">
          <article
            v-for="permission in sharingPermissions"
            :key="permission.id"
            class="sharing-permission"
          >
            <div
              class="sharing-permission__icon"
              :class="`sharing-permission__icon--${permission.tone}`"
            >
              {{ permission.icon }}
            </div>

            <div>
              <strong>{{ permission.label }}</strong>

              <span
                :class="
                  permission.shared
                    ? 'text-green'
                    : 'text-red'
                "
              >
                {{ permission.shared ? "✓ Shared" : "✕ Not shared" }}
              </span>
            </div>
          </article>
        </div>
      </section>
    </template>

    <!-- =====================================================
         FUTURE TAB PLACEHOLDER
    ====================================================== -->
    <section
      v-else
      class="client-tab-placeholder"
    >
      <strong>
        {{ activeTabLabel }}
      </strong>

      <p>
        We will build this client workspace section next.
      </p>
    </section>
  </section>

  <!-- CLIENT NOT FOUND -->
  <section
    v-else
    class="client-detail-not-found"
  >
    <h1>Client not found</h1>

    <RouterLink to="/therapist/clients">
      Return to clients
    </RouterLink>
  </section>
</template>

<style src="./TherapistClientDetail.css"></style>