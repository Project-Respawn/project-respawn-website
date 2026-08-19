<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import TrainerSidebar from '../../components/TrainerSidebar.vue';

import '../../styles/trainer-hub.css';
import '../../styles/trainer-client-details.css';


// ============================================================
// PROJECT RESPAWN — TRAINER CLIENT DETAILS
// ============================================================

const route = useRoute();


// ============================================================
// DEMO CLIENT
// ============================================================
//
// Later this will be loaded from the backend using:
// route.params.clientId
//
// For now this page demonstrates the complete trainer
// experience using Alex Morgan.
// ============================================================

const client = ref({
  id: route.params.clientId || '1',

  name: 'Alex Morgan',
  handle: '@alexm',
  initials: 'AM',

  memberSince: 'May 2026',
  lastActive: '12 mins ago',

  engagement: 92,
  activeQuests: 6,
  streak: 14,
  challenges: 2,

  status: 'Highly Engaged',
});


// ============================================================
// CONNECTED APPS
// ============================================================

const connectedApps = ref([
  {
    id: 'running',
    name: 'Running App',
    icon: '🏃',
    status: 'Connected',
    connected: true,
    detail: 'Last sync 18 mins ago',
  },

  {
    id: 'trainer',
    name: 'Your Trainer App',
    icon: '🏋',
    status: 'Connected',
    connected: true,
    detail: 'Training plan available',
  },

  {
    id: 'activity',
    name: 'Wearable / Activity App',
    icon: '⌚',
    status: 'Connected',
    connected: true,
    detail: 'Activity data available',
  },

  {
    id: 'nutrition',
    name: 'Nutrition App',
    icon: '●',
    status: 'Not connected',
    connected: false,
    detail: 'Connect',
  },
]);


// ============================================================
// WEEKLY SUMMARY
// ============================================================

const weeklyStats = ref([
  {
    label: 'Trainer activities completed',
    value: '3',
    icon: '✓',
    type: 'green',
  },

  {
    label: 'Respawn quests completed',
    value: '5',
    icon: '★',
    type: 'purple',
  },

  {
    label: 'Active days',
    value: '6',
    icon: '▣',
    type: 'blue',
  },

  {
    label: 'Challenge progress',
    value: '8 / 10',
    icon: '♜',
    type: 'orange',
  },
]);


// ============================================================
// RECENT ACTIVITY
// ============================================================

const recentActivity = ref([
  {
    when: 'Today',
    title: 'Completed trainer workout',
    source: 'Your Trainer App',
    icon: '✓',
    type: 'green',
  },

  {
    when: 'Yesterday',
    title: '5.2km run',
    source: 'Running App',
    icon: '✓',
    type: 'green',
  },

  {
    when: 'Tuesday',
    title: '"Get Outside" quest completed',
    source: 'Project Respawn',
    icon: '★',
    type: 'purple',
  },

  {
    when: 'Monday',
    title: 'Reached 14 day streak',
    source: 'Project Respawn',
    icon: '♜',
    type: 'orange',
  },
]);


// ============================================================
// ACTIVE QUESTS
// ============================================================

const quests = ref([
  {
    id: 1,
    title: "Complete today's workout",
    meta: 'Due today',
    reward: '+500 XP',
    icon: '🏋',
    type: 'purple',
  },

  {
    id: 2,
    title: 'Get Outside',
    meta: 'Due Friday',
    reward: '+250 XP',
    icon: '☀',
    type: 'orange',
  },

  {
    id: 3,
    title: 'Keep the streak alive',
    meta: 'Daily',
    reward: '🔥 14 days',
    icon: '🔥',
    type: 'green',
  },
]);


// ============================================================
// ACTIVE CHALLENGES
// ============================================================

const challenges = ref([
  {
    id: 1,
    title: 'August Consistency',
    description: 'Complete 10 activities this month',
    completed: 8,
    target: 10,
  },
]);


// ============================================================
// TRAINER MESSAGES
// ============================================================

const messages = ref([
  {
    id: 1,
    sender: 'Sarah',
    initials: 'SM',
    trainer: true,
    time: 'Aug 19, 10:32 AM',
    text: 'Brilliant work this week. Keep going! 💪',
  },

  {
    id: 2,
    sender: 'Alex',
    initials: 'AM',
    trainer: false,
    time: 'Aug 19, 10:45 AM',
    text: 'Thanks! Legs are tired but feeling good.',
  },

  {
    id: 3,
    sender: 'Sarah',
    initials: 'SM',
    trainer: true,
    time: 'Aug 19, 11:02 AM',
    text: 'Take tomorrow easier and focus on recovery.',
  },
]);

const newMessage = ref('');


// ============================================================
// COMPANION UPDATES
// ============================================================
//
// These represent information that Alex has explicitly
// allowed the companion to share with the trainer.
//
// Private companion conversations NEVER appear here.
// ============================================================

const companionUpdates = ref([
  {
    id: 1,
    date: '19 Aug',
    text:
      'Alex asked for a lighter week because work has been stressful.',
    status: 'Shared with you by Alex',
    type: 'shared',
  },

  {
    id: 2,
    date: '18 Aug',
    text:
      'Alex is feeling positive about their current streak.',
    status: 'Shared with you by Alex',
    type: 'shared',
  },

  {
    id: 3,
    date: '16 Aug',
    text:
      'Alex requested a check-in about staying motivated.',
    status: 'Check-in requested',
    type: 'checkin',
  },
]);


// ============================================================
// ENGAGEMENT INSIGHTS
// ============================================================

const positivePatterns = ref([
  'Short daily quests',
  'Streak-based motivation',
  'Trainer encouragement',
]);

const weakerPatterns = ref([
  'Long weekly challenges',
  'Too many tasks at once',
  'Vague or open-ended goals',
]);


// ============================================================
// COMPUTED
// ============================================================

const challengePercentage = computed(() => {
  const challenge = challenges.value[0];

  if (!challenge) {
    return 0;
  }

  return Math.round(
    (challenge.completed / challenge.target) * 100
  );
});


// ============================================================
// ACTIONS
// ============================================================

function sendMessage() {
  const message = newMessage.value.trim();

  if (!message) {
    return;
  }

  messages.value.push({
    id: Date.now(),
    sender: 'Sarah',
    initials: 'SM',
    trainer: true,
    time: 'Just now',
    text: message,
  });

  newMessage.value = '';
}

function sendEncouragement() {
  window.alert(
    "Demo: Alex's companion would now receive a trainer encouragement request."
  );
}

function assignQuest() {
  window.alert(
    'Demo: the Assign Quest flow will open here.'
  );
}

function scheduleCheckIn() {
  window.alert(
    'Demo: trainer check-in scheduling will open here.'
  );
}
</script>


<template>
  <div class="trainer-hub">

    <!-- ======================================================
         SIDEBAR
         ====================================================== -->

    <TrainerSidebar />


    <!-- ======================================================
         CLIENT DETAILS PAGE
         ====================================================== -->

    <main class="trainer-client-details-page">

      <!-- ====================================================
           BREADCRUMB
           ==================================================== -->

      <nav class="trainer-client-breadcrumb">

        <RouterLink to="/trainer/clients">
          Clients
        </RouterLink>

        <span>
          ›
        </span>

        <strong>
          {{ client.name }}
        </strong>

      </nav>


      <!-- ====================================================
           CLIENT HERO
           ==================================================== -->

      <section class="trainer-client-hero">

        <div class="trainer-client-hero-main">

          <div class="trainer-client-large-avatar">
            {{ client.initials }}
          </div>


          <div class="trainer-client-identity">

            <div class="trainer-client-name-row">

              <h1>
                {{ client.name }}
              </h1>

              <span class="trainer-client-engaged-badge">
                {{ client.status }}
              </span>

            </div>


            <div class="trainer-client-meta">

              <span>
                {{ client.handle }}
              </span>

              <span>
                •
              </span>

              <span>
                Member since {{ client.memberSince }}
              </span>

            </div>


            <div class="trainer-client-hero-stats">

              <div class="trainer-client-hero-stat">

                <strong class="trainer-stat-green">
                  {{ client.engagement }}%
                </strong>

                <span>
                  Engagement
                </span>

              </div>


              <div class="trainer-client-hero-stat">

                <strong class="trainer-stat-purple">
                  {{ client.activeQuests }}
                </strong>

                <span>
                  Active Quests
                </span>

              </div>


              <div class="trainer-client-hero-stat">

                <strong class="trainer-stat-orange">
                  🔥 {{ client.streak }}
                </strong>

                <span>
                  Day Streak
                </span>

              </div>


              <div class="trainer-client-hero-stat">

                <strong class="trainer-stat-blue">
                  {{ client.challenges }}
                </strong>

                <span>
                  Active Challenges
                </span>

              </div>

            </div>

          </div>


          <div class="trainer-client-hero-actions">

            <span class="trainer-client-last-active">
              <i />
              Last active {{ client.lastActive }}
            </span>


            <button
              type="button"
              class="trainer-client-primary-action"
              @click="assignQuest"
            >
              + Assign Quest
            </button>


            <button
              type="button"
              class="trainer-client-secondary-action"
              @click="sendEncouragement"
            >
              🐾 Send Encouragement
            </button>

          </div>

        </div>


        <div class="trainer-client-data-notice">

          <span>
            ⓘ
          </span>

          <p>
            Project Respawn shows engagement and motivation data.
            Detailed fitness tracking stays within the client's
            connected services.
          </p>

        </div>

      </section>


      <!-- ====================================================
           TOP INFORMATION GRID
           ==================================================== -->

      <section class="trainer-client-top-grid">

        <!-- Connected Apps -->

        <article class="trainer-client-panel">

          <header class="trainer-client-panel-header">
            <h2>Connected Apps</h2>
          </header>


          <div class="trainer-connected-app-list">

            <div
              v-for="app in connectedApps"
              :key="app.id"
              class="trainer-connected-app"
            >

              <div
                class="trainer-connected-app-icon"
                :class="{
                  disconnected: !app.connected,
                }"
              >
                {{ app.icon }}
              </div>


              <div class="trainer-connected-app-name">

                <strong>
                  {{ app.name }}
                </strong>

                <span
                  :class="{
                    connected: app.connected,
                    disconnected: !app.connected,
                  }"
                >
                  {{ app.status }}
                </span>

              </div>


              <span
                class="trainer-connected-app-detail"
                :class="{
                  action: !app.connected,
                }"
              >
                {{ app.detail }}
              </span>

            </div>

          </div>

        </article>


        <!-- This Week -->

        <article class="trainer-client-panel">

          <header class="trainer-client-panel-header">
            <h2>This Week</h2>
          </header>


          <div class="trainer-weekly-stat-list">

            <div
              v-for="stat in weeklyStats"
              :key="stat.label"
              class="trainer-weekly-stat"
            >

              <span
                class="trainer-weekly-stat-icon"
                :class="`trainer-icon-${stat.type}`"
              >
                {{ stat.icon }}
              </span>

              <span>
                {{ stat.label }}
              </span>

              <strong>
                {{ stat.value }}
              </strong>

            </div>

          </div>

        </article>


        <!-- Recent Activity -->

        <article class="trainer-client-panel">

          <header class="trainer-client-panel-header">

            <h2>
              Recent Activity
            </h2>

            <button type="button">
              View all
            </button>

          </header>


          <div class="trainer-recent-activity-list">

            <div
              v-for="activity in recentActivity"
              :key="`${activity.when}-${activity.title}`"
              class="trainer-recent-activity"
            >

              <span class="trainer-activity-date">
                {{ activity.when }}
              </span>


              <span
                class="trainer-activity-icon"
                :class="`trainer-icon-${activity.type}`"
              >
                {{ activity.icon }}
              </span>


              <div>

                <strong>
                  {{ activity.title }}
                </strong>

                <span>
                  Source: {{ activity.source }}
                </span>

              </div>

            </div>

          </div>

        </article>

      </section>


      <!-- ====================================================
           MAIN CONTENT GRID
           ==================================================== -->

      <section class="trainer-client-main-grid">

        <!-- Active Quests -->

        <article class="trainer-client-panel trainer-client-quests">

          <header class="trainer-client-panel-header">

            <h2>
              Active Quests
            </h2>

            <RouterLink to="/trainer/quests">
              View all
            </RouterLink>

          </header>


          <div class="trainer-detail-quest-list">

            <div
              v-for="quest in quests"
              :key="quest.id"
              class="trainer-detail-quest"
            >

              <span
                class="trainer-detail-quest-icon"
                :class="`trainer-icon-${quest.type}`"
              >
                {{ quest.icon }}
              </span>


              <div>

                <strong>
                  {{ quest.title }}
                </strong>

                <span>
                  {{ quest.meta }}
                </span>

              </div>


              <strong
                class="trainer-detail-quest-reward"
                :class="`trainer-text-${quest.type}`"
              >
                {{ quest.reward }}
              </strong>


              <span class="trainer-detail-chevron">
                ›
              </span>

            </div>

          </div>

        </article>


        <!-- Active Challenges -->

        <article class="trainer-client-panel trainer-client-challenges">

          <header class="trainer-client-panel-header">

            <h2>
              Active Challenges
            </h2>

            <RouterLink to="/trainer/challenges">
              View all
            </RouterLink>

          </header>


          <div
            v-for="challenge in challenges"
            :key="challenge.id"
            class="trainer-detail-challenge"
          >

            <div class="trainer-detail-challenge-title">

              <span>
                ♜
              </span>

              <div>

                <strong>
                  {{ challenge.title }}
                </strong>

                <small>
                  {{ challenge.description }}
                </small>

              </div>

            </div>


            <div class="trainer-detail-challenge-progress-copy">

              <strong>
                {{ challenge.completed }} /
                {{ challenge.target }}
              </strong>

              <span>
                activities complete
              </span>

            </div>


            <div class="trainer-detail-progress">

              <span
                :style="{
                  width: `${challengePercentage}%`,
                }"
              />

            </div>

          </div>

        </article>


        <!-- Trainer Messages -->

        <article class="trainer-client-panel trainer-client-messages">

          <header class="trainer-client-panel-header">

            <h2>
              Trainer Messages
            </h2>

            <button type="button">
              View all
            </button>

          </header>


          <div class="trainer-detail-message-list">

            <div
              v-for="message in messages"
              :key="message.id"
              class="trainer-detail-message"
            >

              <span
                class="trainer-detail-message-avatar"
                :class="{
                  client: !message.trainer,
                }"
              >
                {{ message.initials }}
              </span>


              <div>

                <div class="trainer-detail-message-meta">

                  <strong>
                    {{ message.sender }}
                  </strong>

                  <span>
                    {{ message.time }}
                  </span>

                </div>


                <p>
                  {{ message.text }}
                </p>

              </div>

            </div>

          </div>


          <form
            class="trainer-detail-message-input"
            @submit.prevent="sendMessage"
          >

            <input
              v-model="newMessage"
              type="text"
              placeholder="Write a message..."
            />

            <button
              type="submit"
              aria-label="Send message"
            >
              ➤
            </button>

          </form>

        </article>


        <!-- Companion Updates -->

        <article class="trainer-client-panel trainer-client-companion">

          <header class="trainer-client-panel-header">

            <div>

              <h2>
                Companion Updates
              </h2>

              <span>
                Only what Alex has chosen to share
              </span>

            </div>

            <button type="button">
              View all
            </button>

          </header>


          <div class="trainer-companion-update-list">

            <div
              v-for="update in companionUpdates"
              :key="update.id"
              class="trainer-companion-update"
            >

              <span
                class="trainer-companion-update-icon"
                :class="{
                  checkin:
                    update.type === 'checkin',
                }"
              >
                🐾
              </span>


              <span class="trainer-companion-update-date">
                {{ update.date }}
              </span>


              <div>

                <p>
                  {{ update.text }}
                </p>

                <strong
                  :class="{
                    checkin:
                      update.type === 'checkin',
                  }"
                >
                  {{ update.status }} ✓
                </strong>

              </div>

            </div>

          </div>


          <button
            type="button"
            class="trainer-schedule-checkin"
            @click="scheduleCheckIn"
          >
            Schedule Check-in
          </button>

        </article>

      </section>


      <!-- ====================================================
           BOTTOM INSIGHT GRID
           ==================================================== -->

      <section class="trainer-client-bottom-grid">

        <!-- Companion Privacy -->

        <article class="trainer-client-panel trainer-privacy-panel">

          <div class="trainer-privacy-heading">

            <span>
              🐾
            </span>

            <div>

              <h2>
                Companion Privacy
              </h2>

              <p>
                Alex's private conversations with their
                companion are not visible here.
              </p>

            </div>

          </div>


          <div class="trainer-privacy-columns">

            <div>

              <strong class="trainer-privacy-positive">
                You only receive:
              </strong>

              <ul>
                <li>
                  Information Alex chooses to share
                </li>

                <li>
                  Requests for trainer contact
                </li>

                <li>
                  Approved updates
                </li>

                <li>
                  General engagement signals
                </li>
              </ul>

            </div>


            <div>

              <strong class="trainer-privacy-negative">
                You do not receive:
              </strong>

              <ul class="negative">
                <li>
                  Private conversation history
                </li>

                <li>
                  Personal thoughts they have not shared
                </li>

                <li>
                  Sensitive details not approved by Alex
                </li>
              </ul>

            </div>

          </div>

        </article>


        <!-- Engagement Insight -->

        <article class="trainer-client-panel trainer-insight-panel">

          <div class="trainer-insight-heading">

            <span>
              ♢
            </span>

            <div>

              <h2>
                Engagement Insight
              </h2>

              <p>
                Based on Alex's engagement patterns
              </p>

            </div>

          </div>


          <div class="trainer-insight-content">

            <div>

              <strong>
                Alex responds particularly well to:
              </strong>

              <ul class="positive">

                <li
                  v-for="pattern in positivePatterns"
                  :key="pattern"
                >
                  {{ pattern }}
                </li>

              </ul>

            </div>


            <div>

              <strong>
                Less engaged with:
              </strong>

              <ul class="negative">

                <li
                  v-for="pattern in weakerPatterns"
                  :key="pattern"
                >
                  {{ pattern }}
                </li>

              </ul>

            </div>


            <div class="trainer-suggested-action">

              <span>
                ◎
              </span>

              <div>

                <strong>
                  Suggested action
                </strong>

                <p>
                  Assign a short, specific quest after
                  tomorrow's workout to maintain momentum.
                </p>

              </div>

            </div>

          </div>

        </article>

      </section>

    </main>

  </div>
</template>