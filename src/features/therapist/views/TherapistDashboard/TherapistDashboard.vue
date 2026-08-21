<script src="./TherapistDashboard.js"></script>

<template>
  <section class="therapist-dashboard">
    <!-- =========================================================
         SECTION 1 — PAGE HEADER
    ========================================================== -->
    <header class="therapist-dashboard__header">
      <div>
        <h1>Good morning, Dr. Morgan</h1>
        <p>Here’s what is happening with your clients today.</p>
      </div>

      <button class="date-button" type="button">
        <span class="date-button__icon">▣</span>
        <span>May 21, 2026</span>
        <span class="date-button__chevron">⌄</span>
      </button>
    </header>

    <!-- =========================================================
         SECTION 2 — OVERVIEW METRICS
    ========================================================== -->
    <section class="overview-grid">
      <article
        v-for="metric in overviewMetrics"
        :key="metric.id"
        class="overview-card"
        :class="`overview-card--${metric.tone}`"
      >
        <div class="overview-card__icon">
          {{ metric.icon }}
        </div>

        <div class="overview-card__content">
          <strong>{{ metric.value }}</strong>
          <span>{{ metric.label }}</span>

          <small :class="`text-${metric.tone}`">
            {{ metric.detail }}
          </small>
        </div>
      </article>
    </section>

    <!-- =========================================================
         SECTION 3 — QUICK ACTIONS
    ========================================================== -->
    <section class="dashboard-section">
      <div class="section-heading">
        <h2>Quick Actions</h2>
      </div>

      <div class="quick-actions">
        <RouterLink
          v-for="action in quickActions"
          :key="action.id"
          :to="action.route"
          class="quick-action-card"
          :class="`quick-action-card--${action.tone}`"
        >
          <div class="quick-action-card__icon">
            {{ action.icon }}
          </div>

          <strong>{{ action.title }}</strong>
          <span>{{ action.description }}</span>
        </RouterLink>
      </div>
    </section>

    <!-- =========================================================
         SECTION 4 — TODAY'S SESSIONS + NEEDS ATTENTION
    ========================================================== -->
    <section class="dashboard-two-column">
      <article class="dashboard-panel">
        <div class="panel-heading">
          <h2>Today’s Sessions</h2>

          <RouterLink to="/therapist/clients" class="panel-link">
            View full schedule →
          </RouterLink>
        </div>

        <div class="session-list">
          <div
            v-for="session in todaysSessions"
            :key="session.id"
            class="session-row"
          >
            <div class="session-row__time">
              <strong>{{ session.time }}</strong>
              <span>{{ session.period }}</span>
            </div>

            <div class="client-avatar">
              {{ session.initials }}
            </div>

            <div class="session-row__client">
              <strong>{{ session.name }}</strong>
              <span>{{ session.questProgress }}</span>
            </div>

            <span
              class="status-pill"
              :class="`status-pill--${session.statusTone}`"
            >
              {{ session.status }}
            </span>

            <RouterLink
              :to="session.route"
              class="secondary-button"
            >
              {{ session.action }}
            </RouterLink>
          </div>
        </div>

        <RouterLink to="/therapist/clients" class="panel-footer-link">
          View all sessions →
        </RouterLink>
      </article>

      <article class="dashboard-panel">
        <div class="panel-heading">
          <h2>Needs Attention</h2>
        </div>

        <div class="attention-list">
          <RouterLink
            v-for="item in attentionItems"
            :key="item.id"
            :to="item.route"
            class="attention-row"
          >
            <div
              class="attention-row__icon"
              :class="`attention-row__icon--${item.tone}`"
            >
              {{ item.icon }}
            </div>

            <div class="attention-row__content">
              <strong>{{ item.client }}</strong>
              <span>{{ item.title }}</span>
              <small>{{ item.detail }}</small>
            </div>

            <span class="attention-row__arrow">›</span>
          </RouterLink>
        </div>

        <RouterLink to="/therapist/clients" class="panel-footer-link">
          View all alerts →
        </RouterLink>
      </article>
    </section>

    <!-- =========================================================
         SECTION 5 — RECENT QUEST ACTIVITY + CLIENT PROGRESS
    ========================================================== -->
    <section class="dashboard-two-column dashboard-two-column--balanced">
      <article class="dashboard-panel">
        <div class="panel-heading">
          <h2>Recent Quest Activity</h2>

          <RouterLink to="/therapist/quests" class="panel-link">
            View all activity →
          </RouterLink>
        </div>

        <div class="activity-list">
          <div
            v-for="activity in recentQuestActivity"
            :key="activity.id"
            class="activity-row"
          >
            <div
              class="activity-row__icon"
              :class="`activity-row__icon--${activity.tone}`"
            >
              {{ activity.icon }}
            </div>

            <div class="activity-row__content">
              <strong>{{ activity.title }}</strong>
              <span>{{ activity.detail }}</span>
            </div>

            <div class="activity-row__meta">
              <span>{{ activity.when }}</span>
              <strong>{{ activity.points }}</strong>
            </div>
          </div>
        </div>
      </article>

      <article class="dashboard-panel progress-panel">
        <div class="panel-heading">
          <h2>Client Progress Snapshot</h2>
        </div>

        <div class="progress-panel__content">
          <div class="progress-summary">
            <div
              v-for="summary in progressSummary"
              :key="summary.id"
              class="progress-summary__item"
            >
              <strong :class="`text-${summary.tone}`">
                {{ summary.value }} {{ summary.direction }}
              </strong>

              <span>{{ summary.label }}</span>
              <small>{{ summary.detail }}</small>
            </div>
          </div>

          <div class="progress-chart">
            <div class="progress-chart__header">
              <div>
                <strong>Assigned vs Completed Quests</strong>
                <span>Last 6 weeks</span>
              </div>

              <div class="chart-legend">
                <span>
                  <i class="legend-dot legend-dot--assigned"></i>
                  Assigned
                </span>

                <span>
                  <i class="legend-dot legend-dot--completed"></i>
                  Completed
                </span>
              </div>
            </div>

            <div class="chart-area">
              <div class="chart-grid-line chart-grid-line--1"></div>
              <div class="chart-grid-line chart-grid-line--2"></div>
              <div class="chart-grid-line chart-grid-line--3"></div>

              <svg
                viewBox="0 0 600 220"
                preserveAspectRatio="none"
                class="chart-svg"
                aria-label="Assigned versus completed quests chart"
              >
                <polyline
                  class="chart-line chart-line--assigned"
                  points="10,175 110,145 210,110 310,70 410,55 510,67 590,58"
                />

                <polyline
                  class="chart-line chart-line--completed"
                  points="10,195 110,175 210,165 310,115 410,112 510,95 590,80"
                />
              </svg>

              <div class="chart-axis">
                <span>Apr 9</span>
                <span>Apr 23</span>
                <span>May 7</span>
                <span>May 21</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>

    <!-- =========================================================
         SECTION 6 — BETWEEN SESSION INSIGHTS
    ========================================================== -->
    <section class="dashboard-panel insights-panel">
      <div class="panel-heading">
        <div>
          <div class="insights-panel__title-row">
            <h2>Between Session Insights</h2>
            <span class="premium-badge">Premium</span>
          </div>

          <p>
            3 reports ready for upcoming sessions
          </p>

          <small>
            See activity, reflections, goal progress and changes since your previous session.
          </small>
        </div>

        <RouterLink to="/therapist/reports" class="panel-link">
          View all reports →
        </RouterLink>
      </div>

      <div class="insight-grid">
        <article
          v-for="report in insightReports"
          :key="report.id"
          class="insight-card"
        >
          <div class="insight-card__header">
            <div class="client-avatar client-avatar--large">
              {{ report.initials }}
            </div>

            <div>
              <strong>{{ report.name }}</strong>
              <span>{{ report.days }} days analysed</span>
            </div>
          </div>

          <div class="insight-card__stats">
            <span>{{ report.activities }} Activities</span>
            <span>
              Confidence
              <strong :class="`text-${report.confidenceTone}`">
                {{ report.confidence }}
              </strong>
            </span>
          </div>

          <RouterLink
            :to="report.route"
            class="insight-card__button"
          >
            View Report
          </RouterLink>
        </article>

        <article class="insight-card insight-card--locked">
          <div class="insight-card__lock">
            🔒
          </div>

          <strong>Unlock Between Session Insights</strong>

          <p>
            Upgrade to premium to see more client insights.
          </p>

          <RouterLink
            to="/therapist/settings"
            class="insight-card__button"
          >
            Learn More
          </RouterLink>
        </article>
      </div>
    </section>
  </section>
</template>

<style src="./TherapistDashboard.css"></style>