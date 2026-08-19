<script setup>
import { computed, ref } from 'vue';

import TrainerSidebar from '../../components/TrainerSidebar.vue';

import '../../styles/trainer-hub.css';
import '../../styles/trainer-clients.css';

// ============================================================
// PROJECT RESPAWN — TRAINER CLIENTS DEMO
// ============================================================


// ============================================================
// CLIENT DATA
// ============================================================

const clients = ref([
  {
    id: 1,
    name: 'Alex Morgan',
    handle: '@alexm',
    initials: 'AM',
    engagement: 92,
    activeQuests: 6,
    completedThisWeek: 3,
    streak: 14,
    challenges: 2,
    status: 'Highly Engaged',
    statusType: 'high',
    companionStatus: 'All good',
    companionType: 'good',
    lastActive: '12 mins ago',
    selected: false,
  },

  {
    id: 2,
    name: 'Jamie Reed',
    handle: '@jamiereed',
    initials: 'JR',
    engagement: 84,
    activeQuests: 4,
    completedThisWeek: 2,
    streak: 7,
    challenges: 1,
    status: 'Engaged',
    statusType: 'engaged',
    companionStatus: 'Check-in requested',
    companionType: 'checkin',
    lastActive: '1 hour ago',
    selected: false,
  },

  {
    id: 3,
    name: 'Chris Taylor',
    handle: '@christ',
    initials: 'CT',
    engagement: 78,
    activeQuests: 5,
    completedThisWeek: 2,
    streak: 4,
    challenges: 2,
    status: 'Engaged',
    statusType: 'engaged',
    companionStatus: 'Reminder sent',
    companionType: 'waiting',
    lastActive: '3 hours ago',
    selected: false,
  },

  {
    id: 4,
    name: 'Sam Jones',
    handle: '@samj',
    initials: 'SJ',
    engagement: 42,
    activeQuests: 3,
    completedThisWeek: 0,
    streak: 0,
    challenges: 1,
    status: 'Needs Attention',
    statusType: 'attention',
    companionStatus: 'Motivation low',
    companionType: 'attention',
    lastActive: '5 days ago',
    selected: false,
  },

  {
    id: 5,
    name: 'Mia Carter',
    handle: '@miacarter',
    initials: 'MC',
    engagement: 88,
    activeQuests: 5,
    completedThisWeek: 4,
    streak: 11,
    challenges: 2,
    status: 'Highly Engaged',
    statusType: 'high',
    companionStatus: 'All good',
    companionType: 'good',
    lastActive: '28 mins ago',
    selected: false,
  },

  {
    id: 6,
    name: 'Leo Harris',
    handle: '@leoh',
    initials: 'LH',
    engagement: 65,
    activeQuests: 4,
    completedThisWeek: 1,
    streak: 2,
    challenges: 1,
    status: 'Needs Attention',
    statusType: 'attention',
    companionStatus: 'Encouragement available',
    companionType: 'attention',
    lastActive: '2 days ago',
    selected: false,
  },
]);


// ============================================================
// FILTERS
// ============================================================

const searchQuery = ref('');
const statusFilter = ref('all');

const statusTabs = [
  {
    id: 'all',
    label: 'All Clients',
  },
  {
    id: 'high',
    label: 'Highly Engaged',
  },
  {
    id: 'engaged',
    label: 'Engaged',
  },
  {
    id: 'attention',
    label: 'Needs Attention',
  },
];

const filteredClients = computed(() => {
  return clients.value.filter((client) => {
    const search =
      searchQuery.value.trim().toLowerCase();

    const matchesSearch =
      !search ||
      client.name.toLowerCase().includes(search) ||
      client.handle.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter.value === 'all' ||
      client.statusType === statusFilter.value;

    return matchesSearch && matchesStatus;
  });
});


// ============================================================
// SUMMARY
// ============================================================

const selectedClients = computed(() => {
  return clients.value.filter(
    (client) => client.selected
  );
});

const selectedCount = computed(() => {
  return selectedClients.value.length;
});

const averageEngagement = computed(() => {
  const total = clients.value.reduce(
    (sum, client) => sum + client.engagement,
    0
  );

  return Math.round(total / clients.value.length);
});

const attentionCount = computed(() => {
  return clients.value.filter(
    (client) => client.statusType === 'attention'
  ).length;
});

const activeStreakCount = computed(() => {
  return clients.value.filter(
    (client) => client.streak > 0
  ).length;
});


// ============================================================
// COMPANION DEMO
// ============================================================

const companionDemoOpen = ref(false);
const activeClient = ref(null);
const activeScenario = ref('encouragement');

const companionScenarios = {
  encouragement: {
    label: 'Trainer encouragement',
    trainerAction: 'Sarah sends encouragement',
    messages: [
      {
        sender: 'companion',
        text:
          'Hey Sam 👋 Sarah noticed you’ve been a little quiet lately. She’s wondering how you’re doing and misses seeing you active.',
      },
      {
        sender: 'companion',
        text:
          'Would you like me to update her?',
      },
    ],
    options: [
      'I’m okay, just been busy',
      'I’m struggling a bit',
      'I’d like Sarah to check in',
      'I’d rather keep this private',
    ],
  },

  busy: {
    label: 'Client is busy',
    trainerAction: 'Client responds',
    messages: [
      {
        sender: 'companion',
        text:
          'Hey Sam 👋 Sarah noticed you’ve been a little quiet lately. Want me to let her know how you’re doing?',
      },
      {
        sender: 'client',
        text:
          'I’m okay, just been really busy with work.',
      },
      {
        sender: 'companion',
        text:
          'That makes sense. Want me to tell Sarah you’re okay and just need a little breathing room?',
      },
      {
        sender: 'client',
        text:
          'Yeah, that would be good.',
      },
      {
        sender: 'companion',
        text:
          'Done 💜 I’ll let her know you’re okay and planning to get back to things when you can.',
      },
    ],
    trainerResult:
      'Sam approved an update: they are okay, currently busy and intend to re-engage when they can.',
  },

  checkin: {
    label: 'Client requests support',
    trainerAction: 'Client asks for a check-in',
    messages: [
      {
        sender: 'companion',
        text:
          'Hey Jamie. Sarah’s wondering how things are going. Would you like me to update her?',
      },
      {
        sender: 'client',
        text:
          'I’ve been struggling to stay motivated this week.',
      },
      {
        sender: 'companion',
        text:
          'Thanks for telling me. I’m here with you. Would you like Sarah to check in with you?',
      },
      {
        sender: 'client',
        text:
          'Yes please.',
      },
      {
        sender: 'companion',
        text:
          'Absolutely. I’ll let Sarah know you’d like some time with her.',
      },
    ],
    trainerResult:
      'Jamie has requested a trainer check-in. No private conversation details are shared.',
  },

  private: {
    label: 'Client keeps it private',
    trainerAction: 'Private support',
    messages: [
      {
        sender: 'companion',
        text:
          'Hey Sam. Sarah noticed you haven’t been around as much. Do you want to talk about what’s going on?',
      },
      {
        sender: 'client',
        text:
          'I do, but I don’t want Sarah involved right now.',
      },
      {
        sender: 'companion',
        text:
          'That’s okay. We can keep this between us. I won’t share what you tell me unless you choose to.',
      },
      {
        sender: 'companion',
        text:
          'Would you like to talk about what’s been making things harder lately?',
      },
    ],
    trainerResult:
      'Encouragement delivered. No trainer follow-up requested. Private companion content remains private.',
  },

  quest: {
    label: 'Quest motivation',
    trainerAction: 'Quest reminder',
    messages: [
      {
        sender: 'companion',
        text:
          'Hey Alex! Sarah set you a quest: Complete your planned activity today 💪',
      },
      {
        sender: 'companion',
        text:
          'You’re on a 14 day streak. Want to keep it going together?',
      },
      {
        sender: 'client',
        text:
          'Yeah. Remind me again after work.',
      },
      {
        sender: 'companion',
        text:
          'You got it. I’ll be here when you’re ready 🐾',
      },
    ],
    trainerResult:
      'Alex engaged with the quest reminder. No trainer action is currently needed.',
  },
};

const activeScenarioData = computed(() => {
  return companionScenarios[activeScenario.value];
});


// ============================================================
// ACTIONS
// ============================================================

function toggleClient(client) {
  client.selected = !client.selected;
}

function clearSelection() {
  clients.value.forEach((client) => {
    client.selected = false;
  });
}

function openCompanionDemo(
  client,
  scenario = 'encouragement'
) {
  activeClient.value = client;
  activeScenario.value = scenario;
  companionDemoOpen.value = true;
}

function closeCompanionDemo() {
  companionDemoOpen.value = false;
}

function sendEncouragement(client) {
  openCompanionDemo(
    client,
    'encouragement'
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
         CLIENTS PAGE
         ====================================================== -->

    <main class="trainer-clients-page">

      <!-- ====================================================
           HEADER
           ==================================================== -->

      <header class="trainer-clients-header">

        <div>

          <span class="trainer-clients-eyebrow">
            TRAINER HUB
          </span>

          <h1>
            Clients
          </h1>

          <p>
            Manage the people you're motivating through Project Respawn.
          </p>

        </div>


        <button
          type="button"
          class="trainer-companion-demo-button"
          @click="
            openCompanionDemo(
              clients[3],
              'encouragement'
            )
          "
        >
          🐾 Preview Companion Demo
        </button>

      </header>


      <!-- ====================================================
           SUMMARY STRIP
           ==================================================== -->

      <section class="trainer-clients-summary">

        <div>

          <strong>
            {{ clients.length }}
          </strong>

          <span>
            Active Clients
          </span>

        </div>


        <div>

          <strong>
            {{ averageEngagement }}%
          </strong>

          <span>
            Average Engagement
          </span>

        </div>


        <div>

          <strong>
            42
          </strong>

          <span>
            Active Quests
          </span>

        </div>


        <div>

          <strong>
            {{ activeStreakCount }}
          </strong>

          <span>
            Active Streaks
          </span>

        </div>


        <div class="trainer-summary-attention">

          <strong>
            {{ attentionCount }}
          </strong>

          <span>
            Need Attention
          </span>

        </div>

      </section>


      <!-- ====================================================
           SEARCH AND FILTERS
           ==================================================== -->

      <section class="trainer-client-controls">

        <div class="trainer-client-search">

          <span aria-hidden="true">
            ⌕
          </span>

          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search clients..."
          />

        </div>


        <div class="trainer-client-filter-tabs">

          <button
            v-for="tab in statusTabs"
            :key="tab.id"
            type="button"
            :class="{
              active:
                statusFilter === tab.id,
            }"
            @click="
              statusFilter = tab.id
            "
          >
            {{ tab.label }}
          </button>

        </div>

      </section>


      <!-- ====================================================
           CLIENT TABLE
           ==================================================== -->

      <section class="trainer-clients-table-panel">

        <div class="trainer-clients-table-head">

          <span />

          <span>
            Client
          </span>

          <span>
            Engagement
          </span>

          <span>
            Quests
          </span>

          <span>
            Streak
          </span>

          <span>
            Challenges
          </span>

          <span>
            Companion
          </span>

          <span>
            Status
          </span>

          <span>
            Action
          </span>

        </div>


        <div
          v-for="client in filteredClients"
          :key="client.id"
          class="trainer-client-row"
          :class="{
            'trainer-client-row-selected':
              client.selected,
          }"
        >

          <!-- Selection -->

          <button
            type="button"
            class="trainer-client-checkbox"
            :class="{
              active:
                client.selected,
            }"
            :aria-label="
              client.selected
                ? `Remove ${client.name} from selection`
                : `Select ${client.name}`
            "
            @click="
              toggleClient(client)
            "
          >
            {{ client.selected ? '✓' : '' }}
          </button>


          <!-- Client -->

          <div class="trainer-client-person">

            <div class="trainer-client-avatar">
              {{ client.initials }}
            </div>

            <div>

              <strong>
                {{ client.name }}
              </strong>

              <span>
                {{ client.handle }}
              </span>

              <small>
                Last active
                {{ client.lastActive }}
              </small>

            </div>

          </div>


          <!-- Engagement -->

          <div class="trainer-client-engagement-cell">

            <div>

              <span
                v-for="index in 7"
                :key="index"
                :class="{
                  active:
                    index <=
                    Math.round(
                      client.engagement / 14.3
                    ),
                  attention:
                    client.statusType ===
                    'attention' &&
                    index <=
                    Math.round(
                      client.engagement / 14.3
                    ),
                }"
              />

            </div>

            <strong
              :class="{
                warning:
                  client.statusType ===
                  'attention',
              }"
            >
              {{ client.engagement }}%
            </strong>

          </div>


          <!-- Quests -->

          <div class="trainer-client-number-cell">

            <strong>
              {{ client.activeQuests }}
            </strong>

            <span>
              active
            </span>

            <small>
              {{ client.completedThisWeek }}
              completed this week
            </small>

          </div>


          <!-- Streak -->

          <div class="trainer-client-streak">

            <template
              v-if="client.streak"
            >
              <strong>
                🔥 {{ client.streak }}
              </strong>

              <span>
                days
              </span>
            </template>

            <template v-else>

              <strong>
                —
              </strong>

              <span>
                no streak
              </span>

            </template>

          </div>


          <!-- Challenges -->

          <div class="trainer-client-number-cell">

            <strong>
              {{ client.challenges }}
            </strong>

            <span>
              active
            </span>

          </div>


          <!-- Companion -->

          <button
            type="button"
            class="trainer-companion-status"
            :class="
              `trainer-companion-${client.companionType}`
            "
            @click="
              openCompanionDemo(
                client,
                client.companionType ===
                  'checkin'
                  ? 'checkin'
                  : client.companionType ===
                      'attention'
                    ? 'encouragement'
                    : 'quest'
              )
            "
          >

            <span>
              🐾
            </span>

            <div>

              <strong>
                {{ client.companionStatus }}
              </strong>

              <small>
                View companion flow
              </small>

            </div>

          </button>


          <!-- Status -->

          <span
            class="trainer-client-status"
            :class="
              `trainer-client-status-${client.statusType}`
            "
          >
            {{ client.status }}
          </span>


          <!-- Actions -->

          <div class="trainer-client-actions">

            <RouterLink
              :to="
                `/trainer/clients/${client.id}`
              "
            >
              View Client
            </RouterLink>


            <button
              v-if="
                client.statusType ===
                'attention'
              "
              type="button"
              @click="
                sendEncouragement(client)
              "
            >
              Send Encouragement
            </button>

          </div>

        </div>


        <!-- Empty State -->

        <div
          v-if="
            !filteredClients.length
          "
          class="trainer-client-empty"
        >

          <strong>
            No clients found
          </strong>

          <span>
            Try changing your filters.
          </span>

        </div>

      </section>


      <!-- ====================================================
           MULTI SELECT BAR
           ==================================================== -->

      <Transition name="trainer-selection-slide">

        <section
          v-if="
            selectedCount
          "
          class="trainer-client-selection-bar"
        >

          <div>

            <strong>
              {{ selectedCount }}
              client{{
                selectedCount === 1
                  ? ''
                  : 's'
              }}
              selected
            </strong>


            <div class="trainer-selection-avatars">

              <span
                v-for="client in selectedClients"
                :key="client.id"
              >
                {{ client.initials }}
              </span>

            </div>

          </div>


          <div class="trainer-selection-actions">

            <RouterLink
              to="/trainer/quests"
            >
              + Assign Quest
            </RouterLink>

            <RouterLink
              to="/trainer/challenges"
            >
              🏆 Add to Challenge
            </RouterLink>

            <button
              type="button"
              @click="
                openCompanionDemo(
                  selectedClients[0],
                  'encouragement'
                )
              "
            >
              🐾 Send Encouragement
            </button>

            <button
              type="button"
              class="trainer-selection-clear"
              @click="
                clearSelection
              "
            >
              Clear
            </button>

          </div>

        </section>

      </Transition>

    </main>


    <!-- ======================================================
         COMPANION DEMO BACKDROP
         ====================================================== -->

    <Transition name="trainer-demo-fade">

      <button
        v-if="
          companionDemoOpen
        "
        type="button"
        class="trainer-companion-demo-backdrop"
        aria-label="Close companion demo"
        @click="
          closeCompanionDemo
        "
      />

    </Transition>


    <!-- ======================================================
         COMPANION DEMO DRAWER
         ====================================================== -->

    <Transition name="trainer-demo-slide">

      <aside
        v-if="
          companionDemoOpen
        "
        class="trainer-companion-demo-drawer"
      >

        <!-- Drawer Header -->

        <header class="trainer-companion-demo-header">

          <div>

            <span>
              CLIENT COMPANION DEMO
            </span>

            <h2>
              {{ activeClient?.name }}'s Companion
            </h2>

            <p>
              Preview how a client's personal AI companion
              can support them while respecting what they
              choose to share with their trainer.
            </p>

          </div>


          <button
            type="button"
            aria-label="Close companion demo"
            @click="
              closeCompanionDemo
            "
          >
            ×
          </button>

        </header>


        <!-- Scenario Selector -->

        <div class="trainer-demo-scenarios">

          <button
            type="button"
            :class="{
              active:
                activeScenario ===
                'encouragement',
            }"
            @click="
              activeScenario =
                'encouragement'
            "
          >
            Encouragement
          </button>


          <button
            type="button"
            :class="{
              active:
                activeScenario ===
                'busy',
            }"
            @click="
              activeScenario =
                'busy'
            "
          >
            Busy
          </button>


          <button
            type="button"
            :class="{
              active:
                activeScenario ===
                'checkin',
            }"
            @click="
              activeScenario =
                'checkin'
            "
          >
            Needs Support
          </button>


          <button
            type="button"
            :class="{
              active:
                activeScenario ===
                'private',
            }"
            @click="
              activeScenario =
                'private'
            "
          >
            Private
          </button>


          <button
            type="button"
            :class="{
              active:
                activeScenario ===
                'quest',
            }"
            @click="
              activeScenario =
                'quest'
            "
          >
            Quest
          </button>

        </div>


        <!-- Client Companion -->

        <section class="trainer-demo-companion">

          <div class="trainer-demo-pet">

            <div class="trainer-demo-pet-ear left" />
            <div class="trainer-demo-pet-ear right" />

            <div class="trainer-demo-pet-face">

              <span class="eye left" />
              <span class="eye right" />

              <span class="mouth">
                ᴗ
              </span>

            </div>

            <div class="trainer-demo-pet-body">
              🐾
            </div>

          </div>


          <div>

            <span>
              {{ activeClient?.name }}'s Companion
            </span>

            <strong>
              Personal. Private. Always learning.
            </strong>

          </div>

        </section>


        <!-- Conversation -->

        <section class="trainer-demo-chat">

          <div class="trainer-demo-chat-label">

            <span>
              {{
                activeScenarioData.label
              }}
            </span>

            <small>
              Demo conversation
            </small>

          </div>


          <div class="trainer-demo-message-list">

            <div
              v-for="(
                message,
                index
              ) in activeScenarioData.messages"
              :key="index"
              class="trainer-demo-message"
              :class="
                message.sender
              "
            >

              <div
                v-if="
                  message.sender ===
                  'companion'
                "
                class="trainer-demo-message-avatar"
              >
                🐾
              </div>


              <p>
                {{ message.text }}
              </p>

            </div>

          </div>


          <!-- Example client choices -->

          <div
            v-if="
              activeScenarioData.options
            "
            class="trainer-demo-options"
          >

            <button
              v-for="option in activeScenarioData.options"
              :key="option"
              type="button"
            >
              {{ option }}
            </button>

          </div>

        </section>


        <!-- Trainer Result -->

        <section
          v-if="
            activeScenarioData.trainerResult
          "
          class="trainer-demo-trainer-result"
        >

          <span>
            WHAT THE TRAINER SEES
          </span>

          <strong>
            {{
              activeScenarioData.trainerResult
            }}
          </strong>

        </section>


        <!-- Privacy Note -->

        <section class="trainer-demo-privacy-note">

          <span>
            ◆
          </span>

          <div>

            <strong>
              Client-controlled sharing
            </strong>

            <p>
              Private companion conversations are not shown to
              the trainer. The trainer only receives information
              the client chooses to share, explicit requests for
              contact, and appropriate engagement signals.
            </p>

          </div>

        </section>

      </aside>

    </Transition>

  </div>
</template>