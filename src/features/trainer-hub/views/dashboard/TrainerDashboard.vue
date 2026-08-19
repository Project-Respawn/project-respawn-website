<script setup>
import TrainerSidebar from '../../components/TrainerSidebar.vue';

import '../../styles/trainer-hub.css';
import '../../styles/trainer-dashboard.css';

// ============================================================
// PROJECT RESPAWN — TRAINER HUB DASHBOARD DEMO
// ============================================================


// ============================================================
// SECTION 1 — DASHBOARD STATS
// ============================================================

const dashboardStats = [
  {
    id: 'clients',
    label: 'Active Clients',
    value: '18',
    change: '2 from last week',
    icon: '◉',
    tone: 'purple',
  },
  {
    id: 'quests',
    label: 'Active Quests',
    value: '42',
    change: '6 from last week',
    icon: '▣',
    tone: 'purple',
  },
  {
    id: 'completion',
    label: 'Quest Completion',
    value: '84%',
    change: '12% from last week',
    icon: '84%',
    tone: 'green',
    progress: true,
  },
  {
    id: 'streaks',
    label: 'Active Streaks',
    value: '6',
    change: '2 from last week',
    icon: '🔥',
    tone: 'orange',
  },
];


// ============================================================
// SECTION 2 — CLIENT ENGAGEMENT
// ============================================================

const clients = [
  {
    id: 1,
    name: 'Alex Morgan',
    initials: 'AM',
    completion: 92,
    engagementBlocks: 6,
    streak: '14 days',
    status: 'Highly Engaged',
    statusType: 'high',
  },
  {
    id: 2,
    name: 'Jamie Reed',
    initials: 'JR',
    completion: 84,
    engagementBlocks: 5,
    streak: '7 days',
    status: 'Engaged',
    statusType: 'engaged',
  },
  {
    id: 3,
    name: 'Chris Taylor',
    initials: 'CT',
    completion: 78,
    engagementBlocks: 5,
    streak: '4 days',
    status: 'Engaged',
    statusType: 'engaged',
  },
  {
    id: 4,
    name: 'Sam Jones',
    initials: 'SJ',
    completion: 42,
    engagementBlocks: 3,
    streak: '—',
    status: 'Needs Attention',
    statusType: 'attention',
  },
];


// ============================================================
// SECTION 3 — NEEDS ATTENTION
// ============================================================

const attentionItems = [
  {
    id: 1,
    name: 'Sam Jones',
    initials: 'SJ',
    message: 'No quest completed in 5 days',
    severity: 'danger',
    action: 'View Client',
  },
  {
    id: 2,
    name: 'Jamie Reed',
    initials: 'JR',
    message: '2 quests overdue',
    severity: 'warning',
    action: 'View Client',
  },
  {
    id: 3,
    name: 'Chris Taylor',
    initials: 'CT',
    message: 'Streak at risk today',
    severity: 'warning',
    action: 'Send encouragement',
  },
];


// ============================================================
// SECTION 4 — RECENT ACTIVITY
// ============================================================

const recentActivity = [
  {
    id: 1,
    icon: '✓',
    tone: 'green',
    text: 'Alex Morgan completed “Get Outside”',
    time: '12 minutes ago',
  },
  {
    id: 2,
    icon: '🏆',
    tone: 'purple',
    text: 'Jamie Reed completed the August Challenge',
    time: '46 minutes ago',
  },
  {
    id: 3,
    icon: '🔥',
    tone: 'orange',
    text: 'Chris Taylor reached a 7 day streak',
    time: '2 hours ago',
  },
  {
    id: 4,
    icon: '💬',
    tone: 'blue',
    text: 'You sent encouragement to Alex Morgan',
    time: '3 hours ago',
  },
];


// ============================================================
// SECTION 5 — QUICK ACTIONS
// ============================================================

const quickActions = [
  {
    id: 1,
    title: 'Assign a Quest',
    description: 'Give a client a new task',
    icon: '+',
    route: '/trainer/quests',
    tone: 'purple',
  },
  {
    id: 2,
    title: 'Create a Challenge',
    description: 'Motivate multiple clients',
    icon: '🏆',
    route: '/trainer/challenges',
    tone: 'purple',
  },
  {
    id: 3,
    title: 'View Clients',
    description: 'See all your clients',
    icon: '◉',
    route: '/trainer/clients',
    tone: 'purple',
  },
  {
    id: 4,
    title: 'View Engagement',
    description: 'Detailed engagement insights',
    icon: '▥',
    route: '/trainer/engagement',
    tone: 'purple',
  },
  {
    id: 5,
    title: 'Send Encouragement',
    description: 'Message a client to keep them going',
    icon: '💬',
    route: '/trainer/clients',
    tone: 'teal',
  },
];


// ============================================================
// SECTION 6 — CLIENT AI COMPANION
// ============================================================

const companionBenefits = [
  {
    title: 'Knows them',
    description:
      'Learns their preferences, goals and challenges over time.',
    icon: '♥',
  },
  {
    title: 'Develops with them',
    description:
      'Builds trust and adapts as their habits and confidence grow.',
    icon: '★',
  },
  {
    title: 'Private & safe',
    description:
      'Gives them a personal outlet for things they may not want to share.',
    icon: '◆',
  },
];
</script>

<template>
  <div class="trainer-hub">

    <!-- ======================================================
         TRAINER SIDEBAR
         ====================================================== -->

    <TrainerSidebar />


    <!-- ======================================================
         DASHBOARD
         ====================================================== -->

    <main class="trainer-dashboard-page">

      <!-- ====================================================
           HEADER
           ==================================================== -->

      <header class="trainer-dashboard-header">

        <div>
          <h1>
            Good afternoon, Sarah 👋
          </h1>

          <p>
            Keep your clients motivated with quests, streaks and challenges.
          </p>
        </div>


        <button
          type="button"
          class="trainer-period-button"
        >
          ◫ This Week
          <span>⌄</span>
        </button>

      </header>


      <!-- ====================================================
           SECTION 1 — KPI STRIP
           ==================================================== -->

      <section class="trainer-stat-strip">

        <article
          v-for="stat in dashboardStats"
          :key="stat.id"
          class="trainer-stat-item"
          :class="`trainer-tone-${stat.tone}`"
        >

          <div
            v-if="!stat.progress"
            class="trainer-stat-icon"
          >
            {{ stat.icon }}
          </div>


          <div
            v-else
            class="trainer-completion-ring"
          >
            <span>
              {{ stat.icon }}
            </span>
          </div>


          <div class="trainer-stat-copy">

            <strong>
              {{ stat.value }}
            </strong>

            <span>
              {{ stat.label }}
            </span>

            <small>
              ▲ {{ stat.change }}
            </small>

          </div>

        </article>

      </section>


      <!-- ====================================================
           SECTION 2 — CLIENT ENGAGEMENT + NEEDS ATTENTION
           ==================================================== -->

      <section class="trainer-dashboard-grid trainer-dashboard-grid-top">

        <!-- Client Engagement -->

        <article class="trainer-dashboard-panel trainer-client-engagement-panel">

          <header class="trainer-panel-header">

            <div class="trainer-panel-heading">

              <span class="trainer-panel-icon">
                ◉
              </span>

              <h2>
                Client Engagement
              </h2>

            </div>

            <RouterLink
              to="/trainer/clients"
              class="trainer-panel-link"
            >
              View all clients →
            </RouterLink>

          </header>


          <div class="trainer-engagement-table">

            <div class="trainer-engagement-head">

              <span>Client</span>
              <span>Engagement</span>
              <span>Completion</span>
              <span>Streak</span>
              <span>Status</span>
              <span>Action</span>

            </div>


            <div
              v-for="client in clients"
              :key="client.id"
              class="trainer-engagement-row"
            >

              <div class="trainer-client-cell">

                <div class="trainer-client-avatar">
                  {{ client.initials }}
                </div>

                <strong>
                  {{ client.name }}
                </strong>

              </div>


              <div class="trainer-engagement-blocks">

                <span
                  v-for="index in 7"
                  :key="index"
                  :class="{
                    active: index <= client.engagementBlocks,
                    warning:
                      client.statusType === 'attention' &&
                      index <= client.engagementBlocks,
                  }"
                />

              </div>


              <strong
                class="trainer-completion-value"
                :class="{
                  'trainer-completion-warning':
                    client.statusType === 'attention',
                }"
              >
                {{ client.completion }}%
              </strong>


              <span class="trainer-streak-value">

                <template v-if="client.streak !== '—'">
                  🔥
                </template>

                {{ client.streak }}

              </span>


              <span
                class="trainer-engagement-status"
                :class="`trainer-status-${client.statusType}`"
              >
                {{ client.status }}
              </span>


              <RouterLink
                :to="`/trainer/clients/${client.id}`"
                class="trainer-row-action"
              >
                View Client →
              </RouterLink>

            </div>

          </div>

        </article>


        <!-- Needs Attention -->

        <article class="trainer-dashboard-panel trainer-attention-panel">

          <header class="trainer-panel-header">

            <div class="trainer-panel-heading">

              <span class="trainer-panel-icon trainer-warning-icon">
                △
              </span>

              <h2>
                Needs Attention
              </h2>

            </div>

            <button
              type="button"
              class="trainer-panel-link trainer-panel-link-button"
            >
              View all →
            </button>

          </header>


          <div class="trainer-attention-list">

            <div
              v-for="item in attentionItems"
              :key="item.id"
              class="trainer-attention-row"
            >

              <div class="trainer-attention-person">

                <div class="trainer-client-avatar">
                  {{ item.initials }}
                </div>

                <div>

                  <strong>
                    {{ item.name }}
                  </strong>

                  <span
                    :class="`trainer-attention-${item.severity}`"
                  >
                    {{ item.message }}
                  </span>

                </div>

              </div>


              <button
                type="button"
                class="trainer-attention-action"
              >
                {{ item.action }}
              </button>

            </div>

          </div>

        </article>

      </section>


      <!-- ====================================================
           SECTION 3 — RECENT ACTIVITY + QUICK ACTIONS
           ==================================================== -->

      <section class="trainer-dashboard-grid trainer-dashboard-grid-bottom">

        <!-- Recent Activity -->

        <article class="trainer-dashboard-panel">

          <header class="trainer-panel-header">

            <div class="trainer-panel-heading">

              <span class="trainer-panel-icon">
                ϟ
              </span>

              <h2>
                Recent Activity
              </h2>

            </div>

            <button
              type="button"
              class="trainer-panel-link trainer-panel-link-button"
            >
              View all activity →
            </button>

          </header>


          <div class="trainer-activity-list">

            <div
              v-for="activity in recentActivity"
              :key="activity.id"
              class="trainer-activity-row"
            >

              <div
                class="trainer-activity-icon"
                :class="`trainer-tone-${activity.tone}`"
              >
                {{ activity.icon }}
              </div>


              <span>
                {{ activity.text }}
              </span>


              <small>
                {{ activity.time }}
              </small>

            </div>

          </div>

        </article>


        <!-- Quick Actions -->

        <article class="trainer-dashboard-panel">

          <header class="trainer-panel-header">

            <div class="trainer-panel-heading">

              <span class="trainer-panel-icon">
                ⤴
              </span>

              <h2>
                Quick Actions
              </h2>

            </div>

          </header>


          <div class="trainer-quick-actions">

            <RouterLink
              v-for="action in quickActions"
              :key="action.id"
              :to="action.route"
              class="trainer-quick-action"
            >

              <div
                class="trainer-quick-action-icon"
                :class="`trainer-tone-${action.tone}`"
              >
                {{ action.icon }}
              </div>


              <div>

                <strong>
                  {{ action.title }}
                </strong>

                <span>
                  {{ action.description }}
                </span>

              </div>


              <span class="trainer-quick-action-arrow">
                ›
              </span>

            </RouterLink>

          </div>

        </article>

      </section>


      <!-- ====================================================
           SECTION 4 — CLIENT AI COMPANION
           ==================================================== -->

      <section class="trainer-companion-banner">

        <!-- Pet illustration placeholder -->

        <div class="trainer-companion-pet">

          <div class="trainer-companion-pet-ears">
            <span />
            <span />
          </div>

          <div class="trainer-companion-pet-head">

            <div class="trainer-companion-eye trainer-eye-left" />
            <div class="trainer-companion-eye trainer-eye-right" />

            <div class="trainer-companion-mouth">
              ᴗ
            </div>

          </div>

          <div class="trainer-companion-pet-body">

            <span>
              🐾
            </span>

          </div>

        </div>


        <!-- Main message -->

        <div class="trainer-companion-copy">

          <h2>
            Your clients. Their AI companion. Real motivation.
          </h2>

          <p>
            Each client has their own AI companion that knows them,
            develops with them and helps them stay on track with the
            quests you set.
          </p>


          <ul>

            <li>
              🐾 Pushes them to complete quests and build healthy habits
            </li>

            <li>
              💬 Listens, supports and celebrates their progress
            </li>

            <li>
              ♡ Gives them a private outlet when they need one
            </li>

            <li>
              🔔 Lets you know when they request time with you
            </li>

          </ul>

        </div>


        <!-- Companion message preview -->

        <div class="trainer-companion-message-card">

          <header>

            <span>
              🐾 From Alex's Companion
            </span>

            <span>
              ⋮
            </span>

          </header>


          <div class="trainer-companion-chat">

            <div class="trainer-companion-chat-avatar">
              🐾
            </div>

            <p>
              Hey Alex! Sarah set you a new quest:
              <strong>Complete your workout today 💪</strong>
            </p>

          </div>


          <div class="trainer-companion-encouragement">
            You've got this! I believe in you!
          </div>

        </div>


        <!-- Companion benefits -->

        <div class="trainer-companion-benefits">

          <article
            v-for="benefit in companionBenefits"
            :key="benefit.title"
          >

            <div class="trainer-companion-benefit-icon">
              {{ benefit.icon }}
            </div>

            <div>

              <strong>
                {{ benefit.title }}
              </strong>

              <p>
                {{ benefit.description }}
              </p>

            </div>

          </article>

        </div>

      </section>

    </main>

  </div>
</template>