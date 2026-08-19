<script setup>
import { computed, ref } from 'vue';

import TrainerSidebar from '../../components/TrainerSidebar.vue';

import '../../styles/trainer-hub.css';
import '../../styles/trainer-challenges.css';


// ============================================================
// PROJECT RESPAWN — TRAINER CHALLENGES
// ============================================================


// ============================================================
// SECTION 1 — ACTIVE CHALLENGES
// ============================================================

const challenges = ref([
  {
    id: 1,
    title: 'August Consistency',
    description: 'Complete 10 activities this month.',
    type: 'Consistency',
    icon: '🏆',
    colour: 'purple',

    participants: 14,
    remaining: '8 days remaining',
    completion: 73,

    progress: {
      completed: 8,
      target: 10,
      label: 'activities',
    },

    topProgress: [
      {
        name: 'Alex',
        initials: 'AM',
        progress: '9 / 10',
      },
      {
        name: 'Jamie',
        initials: 'JL',
        progress: '8 / 10',
      },
      {
        name: 'Chris',
        initials: 'CW',
        progress: '7 / 10',
      },
    ],

    atRisk: 4,
  },

  {
    id: 2,
    title: 'Train With Me',
    description:
      'Attend one session with your trainer each week for 4 weeks.',
    type: 'Community',
    icon: '👥',
    colour: 'green',

    participants: 11,
    remaining: '3 weeks remaining',
    completion: 64,

    weeklyProgress: [
      {
        week: 'Week 1',
        state: 'complete',
      },
      {
        week: 'Week 2',
        state: 'complete',
      },
      {
        week: 'Week 3',
        state: 'current',
      },
      {
        week: 'Week 4',
        state: 'upcoming',
      },
    ],

    progress: {
      completed: 2,
      target: 4,
      label: 'weeks completed',
    },

    topProgress: [
      {
        name: 'Mia',
        initials: 'MP',
        progress: '2 / 4',
      },
      {
        name: 'Alex',
        initials: 'AM',
        progress: '2 / 4',
      },
      {
        name: 'Sam',
        initials: 'ST',
        progress: '1 / 4',
      },
    ],

    atRisk: 2,
  },

  {
    id: 3,
    title: 'Get Moving Week',
    description:
      'Complete at least one activity on 5 different days.',
    type: 'Streak',
    icon: '🏃',
    colour: 'blue',

    participants: 8,
    remaining: '3 days remaining',
    completion: 81,

    progress: {
      completed: 4,
      target: 5,
      label: 'days',
    },

    topProgress: [
      {
        name: 'Jamie',
        initials: 'JL',
        progress: '5 / 5',
      },
      {
        name: 'Chris',
        initials: 'CW',
        progress: '4 / 5',
      },
      {
        name: 'Leah',
        initials: 'LN',
        progress: '4 / 5',
      },
    ],

    atRisk: 1,
  },
]);


// ============================================================
// SECTION 2 — CHALLENGE INSIGHTS
// ============================================================

const challengeInsights = ref([
  {
    id: 'completion',
    icon: '✓',
    value: '73%',
    label: 'Average completion across all active challenges',
    colour: 'green',
  },

  {
    id: 'on-track',
    icon: '↗',
    value: '9',
    label: 'Clients on track',
    colour: 'green',
  },

  {
    id: 'completed',
    icon: '▣',
    value: '3',
    label: 'Challenges completed so far this month',
    colour: 'green',
  },

  {
    id: 'attention',
    icon: '👥',
    value: '6',
    label: 'Clients need attention',
    colour: 'red',
  },
]);


// ============================================================
// SECTION 3 — COMPANION IMPACT
// ============================================================

const companionImpact = ref({
  reminders: 18,
  resultingActivities: 11,
  conversion: 61,
});


// ============================================================
// SECTION 4 — CLIENTS NEEDING ATTENTION
// ============================================================

const attentionClients = ref([
  {
    id: 1,
    name: 'Sam Taylor',
    initials: 'ST',
    challenge: 'Train With Me',
    status: 'Behind',
    detail: 'Missed Week 2 session',
    severity: 'high',
  },

  {
    id: 2,
    name: 'Leo Jackson',
    initials: 'LJ',
    challenge: 'August Consistency',
    status: 'Behind',
    detail: '3/10 activities',
    severity: 'high',
  },

  {
    id: 3,
    name: 'Mia Patel',
    initials: 'MP',
    challenge: 'Get Moving Week',
    status: 'At risk',
    detail: '2/5 days completed',
    severity: 'medium',
  },
]);


// ============================================================
// SECTION 5 — CHALLENGE TEMPLATES
// ============================================================

const challengeTemplates = ref([
  {
    id: 'consistency',
    icon: '▣',
    title: 'Consistency Month',
    description:
      'Complete 10 planned activities this month.',
    type: 'Consistency',
    colour: 'purple',
  },

  {
    id: 'streak',
    icon: '🔥',
    title: '7 Day Streak',
    description:
      'Complete one task each day.',
    type: 'Streak',
    colour: 'orange',
  },

  {
    id: 'trainer-session',
    icon: '👥',
    title: 'Train With Me',
    description:
      'Attend one session with your trainer each week.',
    type: 'Community',
    colour: 'green',
  },

  {
    id: 'team-goal',
    icon: '◎',
    title: 'Team Goal',
    description:
      'Work together toward a shared target.',
    type: 'Team',
    colour: 'blue',
  },

  {
    id: 'social',
    icon: '👥',
    title: 'Social Challenge',
    description:
      'Complete activities with someone else.',
    type: 'Social',
    colour: 'red',
  },

  {
    id: 'custom',
    icon: '+',
    title: 'Custom Challenge',
    description:
      'Build your own challenge from scratch.',
    type: 'Custom',
    colour: 'grey',
  },
]);


// ============================================================
// SECTION 6 — DEMO UI STATE
// ============================================================

const selectedTemplate = ref(null);
const encouragementClient = ref(null);
const showCreateChallenge = ref(false);


// ============================================================
// SECTION 7 — COMPUTED
// ============================================================

const activeChallengeCount = computed(
  () => challenges.value.length
);


// ============================================================
// SECTION 8 — ACTIONS
// ============================================================

function openCreateChallenge(template = null) {
  selectedTemplate.value = template;
  showCreateChallenge.value = true;
}

function closeCreateChallenge() {
  showCreateChallenge.value = false;
  selectedTemplate.value = null;
}

function viewChallenge(challenge) {
  window.alert(
    `Demo: Open detailed challenge view for "${challenge.title}".`
  );
}

function sendEncouragement(client) {
  encouragementClient.value = client;

  window.alert(
    `Demo: ${client.name}'s companion would receive a trainer encouragement request.`
  );
}

function openInsights() {
  window.alert(
    'Demo: Open the full challenge insights dashboard.'
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
         CHALLENGES PAGE
         ====================================================== -->

    <main class="trainer-challenges-page">

      <!-- ====================================================
           PAGE HEADER
           ==================================================== -->

      <header class="trainer-challenges-header">

        <div>

          <span class="trainer-page-eyebrow">
            TRAINER HUB
          </span>

          <h1>
            Challenges
          </h1>

          <p>
            Create shared goals that keep your clients
            engaged over time.
          </p>

        </div>


        <button
          type="button"
          class="trainer-create-challenge-button"
          @click="openCreateChallenge()"
        >
          + Create Challenge
        </button>

      </header>


      <!-- ====================================================
           ACTIVE CHALLENGES + INSIGHTS
           ==================================================== -->

      <section class="trainer-challenge-dashboard-grid">

        <!-- ==================================================
             ACTIVE CHALLENGES
             ================================================== -->

        <article class="trainer-challenges-panel">

          <div class="trainer-challenges-panel-heading">

            <h2>
              Active Challenges
            </h2>

            <span>
              {{ activeChallengeCount }} active
            </span>

          </div>


          <div class="trainer-active-challenge-list">

            <article
              v-for="challenge in challenges"
              :key="challenge.id"
              class="trainer-active-challenge"
            >

              <!-- Challenge Identity -->

              <div class="trainer-challenge-identity">

                <div
                  class="trainer-challenge-large-icon"
                  :class="`trainer-challenge-${challenge.colour}`"
                >
                  {{ challenge.icon }}
                </div>


                <div class="trainer-challenge-copy">

                  <div class="trainer-challenge-title-row">

                    <h3>
                      {{ challenge.title }}
                    </h3>

                    <span
                      class="trainer-challenge-type"
                      :class="`trainer-challenge-type-${challenge.colour}`"
                    >
                      {{ challenge.type }}
                    </span>

                  </div>


                  <p>
                    {{ challenge.description }}
                  </p>


                  <div class="trainer-challenge-meta">

                    <span>
                      ♙ {{ challenge.participants }}
                      Participants
                    </span>

                    <span>
                      ▣ {{ challenge.remaining }}
                    </span>

                    <span>
                      ↗ {{ challenge.completion }}%
                      avg completion
                    </span>

                  </div>

                </div>

              </div>


              <!-- Standard Progress -->

              <div
                v-if="!challenge.weeklyProgress"
                class="trainer-challenge-progress-section"
              >

                <div class="trainer-challenge-progress-value">

                  <strong>
                    {{ challenge.progress.completed }}
                  </strong>

                  <span>
                    / {{ challenge.progress.target }}
                  </span>

                </div>


                <small>
                  {{ challenge.progress.label }}
                </small>


                <div class="trainer-challenge-progress-bar">

                  <span
                    :style="{
                      width:
                        `${(
                          challenge.progress.completed /
                          challenge.progress.target
                        ) * 100}%`,
                    }"
                  />

                </div>

              </div>


              <!-- Community Weekly Progress -->

              <div
                v-else
                class="trainer-community-progress"
              >

                <span class="trainer-progress-label">
                  Progress overview
                </span>


                <div class="trainer-community-week-list">

                  <div
                    v-for="(week, index) in challenge.weeklyProgress"
                    :key="week.week"
                    class="trainer-community-week"
                  >

                    <span
                      class="trainer-community-week-circle"
                      :class="week.state"
                    >
                      <template
                        v-if="week.state === 'complete'"
                      >
                        ✓
                      </template>

                      <template
                        v-else
                      >
                        {{ index + 1 }}
                      </template>
                    </span>

                    <small>
                      {{ week.week }}
                    </small>

                  </div>

                </div>


                <strong class="trainer-community-complete-copy">
                  {{ challenge.progress.completed }} /
                  {{ challenge.progress.target }}
                  weeks completed
                </strong>

              </div>


              <!-- Top Progress -->

              <div class="trainer-challenge-leaders">

                <span class="trainer-progress-label">
                  Top progress
                </span>


                <div
                  v-for="leader in challenge.topProgress"
                  :key="leader.name"
                  class="trainer-challenge-leader"
                >

                  <span class="trainer-leader-avatar">
                    {{ leader.initials }}
                  </span>

                  <span>
                    {{ leader.name }}
                  </span>

                  <strong>
                    {{ leader.progress }}
                  </strong>

                </div>

              </div>


              <!-- Challenge Actions -->

              <div class="trainer-challenge-actions">

                <div
                  class="trainer-at-risk-box"
                  :class="{
                    warning: challenge.atRisk > 0,
                  }"
                >

                  <strong>
                    {{ challenge.atRisk }}
                  </strong>

                  <span>
                    {{ challenge.atRisk === 1
                      ? 'client'
                      : 'clients' }}
                  </span>

                  <small>
                    at risk
                  </small>

                </div>


                <button
                  type="button"
                  @click="viewChallenge(challenge)"
                >
                  View Challenge
                </button>

              </div>

            </article>

          </div>


          <button
            type="button"
            class="trainer-view-all-challenges"
          >
            View all challenges →
          </button>

        </article>


        <!-- ==================================================
             CHALLENGE INSIGHTS
             ================================================== -->

        <aside class="trainer-challenge-insights">

          <h2>
            Challenge Insights
          </h2>


          <div class="trainer-challenge-insight-list">

            <div
              v-for="insight in challengeInsights"
              :key="insight.id"
              class="trainer-challenge-insight"
            >

              <span
                class="trainer-challenge-insight-icon"
                :class="`trainer-insight-${insight.colour}`"
              >
                {{ insight.icon }}
              </span>


              <div>

                <strong>
                  {{ insight.value }}
                </strong>

                <span>
                  {{ insight.label }}
                </span>

              </div>

            </div>

          </div>


          <div class="trainer-companion-impact">

            <div class="trainer-companion-impact-heading">

              <span>
                🐾
              </span>

              <strong>
                Companion impact
              </strong>

            </div>


            <p>
              <strong>
                {{ companionImpact.reminders }}
              </strong>
              reminders sent
            </p>

            <p>
              <strong>
                {{ companionImpact.resultingActivities }}
              </strong>
              resulted in activity within 24 hours
              ({{ companionImpact.conversion }}%)
            </p>

          </div>


          <button
            type="button"
            class="trainer-insights-button"
            @click="openInsights"
          >
            View insights dashboard
          </button>

        </aside>

      </section>


      <!-- ====================================================
           LOWER GRID
           ==================================================== -->

      <section class="trainer-challenge-lower-grid">

        <!-- ==================================================
             CLIENTS NEEDING ATTENTION
             ================================================== -->

        <article class="trainer-challenges-panel">

          <div class="trainer-challenges-panel-heading">

            <h2>
              Clients Needing Attention
            </h2>

            <span class="trainer-attention-count">
              6
            </span>

          </div>


          <div class="trainer-attention-client-list">

            <div
              v-for="client in attentionClients"
              :key="client.id"
              class="trainer-attention-client"
            >

              <span class="trainer-attention-avatar">
                {{ client.initials }}
              </span>


              <div class="trainer-attention-client-name">

                <strong>
                  {{ client.name }}
                </strong>

                <span>
                  {{ client.challenge }}
                </span>

              </div>


              <div class="trainer-attention-status">

                <strong
                  :class="{
                    high: client.severity === 'high',
                    medium:
                      client.severity === 'medium',
                  }"
                >
                  {{ client.status }}
                </strong>

                <span>
                  {{ client.detail }}
                </span>

              </div>


              <button
                type="button"
                class="trainer-send-encouragement"
                @click="sendEncouragement(client)"
              >
                🐾 Send encouragement
              </button>


              <button
                type="button"
                class="trainer-attention-menu"
                aria-label="More client options"
              >
                ⋮
              </button>

            </div>

          </div>


          <button
            type="button"
            class="trainer-view-all-challenges"
          >
            View all clients needing attention →
          </button>

        </article>


        <!-- ==================================================
             TEMPLATES
             ================================================== -->

        <article class="trainer-challenges-panel">

          <div class="trainer-challenges-panel-heading">

            <h2>
              Start From a Template
            </h2>

          </div>


          <div class="trainer-challenge-template-grid">

            <button
              v-for="template in challengeTemplates"
              :key="template.id"
              type="button"
              class="trainer-challenge-template"
              @click="openCreateChallenge(template)"
            >

              <span
                class="trainer-template-icon"
                :class="`trainer-challenge-${template.colour}`"
              >
                {{ template.icon }}
              </span>


              <span class="trainer-template-copy">

                <strong>
                  {{ template.title }}
                </strong>

                <small>
                  {{ template.description }}
                </small>

              </span>

            </button>

          </div>


          <button
            type="button"
            class="trainer-view-all-challenges"
          >
            Browse all templates →
          </button>

        </article>

      </section>


      <!-- ====================================================
           POSITIONING NOTICE
           ==================================================== -->

      <footer class="trainer-challenge-positioning">

        <div>

          <span>
            ⓘ
          </span>

          <p>
            Challenges are about building habits,
            confidence and community.
            <br />
            Detailed workout tracking stays within each
            client's connected services.
          </p>

        </div>


        <button type="button">
          Learn more about challenges ↗
        </button>

      </footer>


      <!-- ====================================================
           CREATE CHALLENGE DEMO MODAL
           ==================================================== -->

      <div
        v-if="showCreateChallenge"
        class="trainer-challenge-modal-backdrop"
        @click.self="closeCreateChallenge"
      >

        <section class="trainer-challenge-modal">

          <header>

            <div>

              <span>
                CREATE CHALLENGE
              </span>

              <h2>
                {{
                  selectedTemplate
                    ? selectedTemplate.title
                    : 'New Challenge'
                }}
              </h2>

            </div>


            <button
              type="button"
              @click="closeCreateChallenge"
            >
              ×
            </button>

          </header>


          <div class="trainer-challenge-modal-demo">

            <p>
              The full Challenge Builder will let the
              trainer choose the goal, participants,
              schedule, completion rules and Respawn
              rewards.
            </p>


            <div class="trainer-modal-demo-fields">

              <label>
                Challenge name
                <input
                  type="text"
                  :value="
                    selectedTemplate
                      ? selectedTemplate.title
                      : ''
                  "
                  placeholder="Enter challenge name"
                />
              </label>


              <label>
                Challenge type
                <select>
                  <option>
                    Consistency
                  </option>

                  <option>
                    Community
                  </option>

                  <option>
                    Streak
                  </option>

                  <option>
                    Team Goal
                  </option>

                  <option>
                    Social
                  </option>

                  <option>
                    Custom
                  </option>
                </select>
              </label>


              <label>
                Participants
                <div class="trainer-demo-participants">
                  Alex, Jamie, Chris, Mia + Add clients
                </div>
              </label>


              <label>
                Respawn reward
                <div class="trainer-demo-participants">
                  +2,000 XP · +500 Pet XP
                </div>
              </label>

            </div>

          </div>


          <footer>

            <button
              type="button"
              class="trainer-modal-cancel"
              @click="closeCreateChallenge"
            >
              Cancel
            </button>


            <button
              type="button"
              class="trainer-modal-launch"
              @click="closeCreateChallenge"
            >
              Preview Challenge
            </button>

          </footer>

        </section>

      </div>

    </main>

  </div>
</template>