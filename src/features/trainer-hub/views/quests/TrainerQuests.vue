<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue';

import TrainerSidebar from '../../components/TrainerSidebar.vue';

import '../../styles/trainer-hub.css';
import '../../styles/trainer-quests.css';


// ============================================================
// PROJECT RESPAWN — TRAINER QUESTS
// ============================================================


// ============================================================
// SECTION 1 — PAGE FILTERS
// ============================================================

const activeQuestFilter = ref('all');
const libraryFilter = ref('all');
const librarySearch = ref('');


// ============================================================
// SECTION 2 — OVERVIEW METRICS
// ============================================================

const questMetrics = [
  {
    id: 'active',
    icon: 'ϟ',
    value: '12',
    label: 'Active Quests',
    change: '2 vs last week',
    tone: 'purple',
  },
  {
    id: 'individual',
    icon: '○',
    value: '8',
    label: 'Individual Quests',
    change: '1 vs last week',
    tone: 'green',
  },
  {
    id: 'community',
    icon: '👥',
    value: '4',
    label: 'Community Challenges',
    change: '1 vs last week',
    tone: 'blue',
  },
  {
    id: 'completion',
    icon: '◎',
    value: '84%',
    label: 'Average Completion',
    change: '6% vs last week',
    tone: 'orange',
  },
];


// ============================================================
// SECTION 3 — ACTIVE QUESTS
// ============================================================

const activeQuests = ref([
  {
    id: 1,
    title: 'Train With Me',
    description:
      'Attend one trainer session this week.',
    type: 'community',
    typeLabel: 'COMMUNITY',
    tone: 'purple',
    icon: '👥',

    progressCurrent: 12,
    progressTarget: 18,
    progressLabel: 'completed',

    status: 'active',
    statusLabel: 'Ends Sunday',

    participants: [
      'AM',
      'JR',
      'CT',
      'MP',
    ],

    extraParticipants: 8,

    action: 'Manage Challenge',
  },

  {
    id: 2,
    title: '10K Steps Today',
    description:
      'Assigned to Alex Morgan',
    type: 'individual',
    typeLabel: 'INDIVIDUAL',
    tone: 'green',
    icon: '🏃',

    progressCurrent: 1,
    progressTarget: 1,
    progressLabel: 'completed',

    status: 'complete',
    statusLabel: 'Completed Aug 20',

    reward: '+150 Pet XP',

    clientInitials: 'AM',

    action: 'View Quest',
  },

  {
    id: 3,
    title: 'Back In The Game',
    description:
      'Assigned to Sam Jones',
    type: 'individual',
    typeLabel: 'INDIVIDUAL',
    tone: 'orange',
    icon: '🔥',

    progressCurrent: 1,
    progressTarget: 3,
    progressLabel: 'complete',

    status: 'attention',
    statusLabel: 'Due Aug 23',

    helperText:
      '3 small activities',

    clientInitials: 'SJ',

    action: 'Manage Quest',
  },
]);

const activeQuestTabs = [
  {
    id: 'all',
    label: 'All',
  },
  {
    id: 'individual',
    label: 'Individual',
  },
  {
    id: 'community',
    label: 'Community',
  },
  {
    id: 'ending',
    label: 'Ending Soon',
  },
];

const filteredActiveQuests = computed(() => {
  if (activeQuestFilter.value === 'all') {
    return activeQuests.value;
  }

  if (
    activeQuestFilter.value === 'ending'
  ) {
    return activeQuests.value.filter(
      (quest) =>
        quest.status === 'active' ||
        quest.status === 'attention'
    );
  }

  return activeQuests.value.filter(
    (quest) =>
      quest.type ===
      activeQuestFilter.value
  );
});


// ============================================================
// SECTION 4 — COMMUNITY CHALLENGES
// ============================================================

const communityChallenges = ref([
  {
    id: 1,
    title: 'Train With Me',
    description:
      'Attend at least one trainer session this week.',
    tone: 'purple',
    icon: '👥',

    joined: 18,
    completed: 12,
    completion: 67,

    ends: 'Ends Sunday',

    reward:
      'Trainer session participation',
  },

  {
    id: 2,
    title: 'Weekend Movement Challenge',
    description:
      'Complete one activity this weekend.',
    tone: 'blue',
    icon: '👥',

    joined: 24,
    completed: 19,
    completion: 79,

    ends: 'Ends Sunday',

    reward:
      '+250 Pet XP · Weekend Warrior Badge',
  },
]);


// ============================================================
// SECTION 5 — INDIVIDUAL QUESTS
// ============================================================

const individualQuests = ref([
  {
    id: 1,
    client: 'Alex Morgan',
    initials: 'AM',
    quest: '20 Min Walk',
    progressCurrent: 1,
    progressTarget: 1,
    due: 'Aug 20',
    status: 'Completed',
    statusType: 'complete',
    companion: 'All good',
    companionType: 'good',
  },

  {
    id: 2,
    client: 'Jamie Reed',
    initials: 'JR',
    quest: 'Attend Session',
    progressCurrent: 0,
    progressTarget: 1,
    due: 'Aug 22',
    status: 'Active',
    statusType: 'active',
    companion: 'Check-in sent',
    companionType: 'checkin',
  },

  {
    id: 3,
    client: 'Chris Taylor',
    initials: 'CT',
    quest: 'Maintain Streak',
    progressCurrent: 3,
    progressTarget: 5,
    due: 'Aug 24',
    status: 'Active',
    statusType: 'active',
    companion: 'Encouraging',
    companionType: 'encouraging',
  },

  {
    id: 4,
    client: 'Sam Jones',
    initials: 'SJ',
    quest: 'Back In The Game',
    progressCurrent: 1,
    progressTarget: 3,
    due: 'Aug 23',
    status: 'Needs Attention',
    statusType: 'attention',
    companion: 'Extra support',
    companionType: 'attention',
  },

  {
    id: 5,
    client: 'Mia Patel',
    initials: 'MP',
    quest: 'Daily Activity',
    progressCurrent: 2,
    progressTarget: 3,
    due: 'Aug 21',
    status: 'Active',
    statusType: 'active',
    companion: 'All good',
    companionType: 'good',
  },
]);


// ============================================================
// SECTION 6 — QUEST LIBRARY
// ============================================================

const questLibrary = ref([
  {
    id: 1,
    name: 'Quick Win',
    description:
      'Complete one activity today',
    category: 'activity',
    type: 'Activity',
    successRate: 94,
    used: 18,
  },

  {
    id: 2,
    name: 'Train With Me',
    description:
      'Attend one trainer session this week',
    category: 'attendance',
    type: 'Attendance',
    successRate: 89,
    used: 12,
  },

  {
    id: 3,
    name: 'Three Day Consistency',
    description:
      'Complete your activity 3 days this week',
    category: 'consistency',
    type: 'Consistency',
    successRate: 84,
    used: 9,
  },

  {
    id: 4,
    name: 'Weekend Movement',
    description:
      'Complete one activity this weekend',
    category: 'activity',
    type: 'Activity',
    successRate: 79,
    used: 14,
  },

  {
    id: 5,
    name: '30 Day Challenge',
    description:
      'Complete daily activity for 30 days',
    category: 'achievement',
    type: 'Achievement',
    successRate: 48,
    used: 6,
  },
]);

const libraryCategories = [
  {
    id: 'all',
    label: 'All',
  },
  {
    id: 'mine',
    label: 'My Quests',
  },
  {
    id: 'community',
    label: 'Community',
  },
  {
    id: 'activity',
    label: 'Activity',
  },
  {
    id: 'consistency',
    label: 'Consistency',
  },
  {
    id: 'attendance',
    label: 'Attendance',
  },
  {
    id: 'achievement',
    label: 'Achievement',
  },
  {
    id: 'custom',
    label: 'Custom',
  },
];

const filteredLibrary = computed(() => {
  const search =
    librarySearch.value
      .trim()
      .toLowerCase();

  return questLibrary.value.filter(
    (quest) => {
      const matchesSearch =
        !search ||
        quest.name
          .toLowerCase()
          .includes(search) ||
        quest.description
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        libraryFilter.value === 'all' ||
        quest.category ===
          libraryFilter.value;

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );
});


// ============================================================
// SECTION 7 — RECENT QUEST RESULTS
// ============================================================

const recentResults = [
  {
    quest: 'Quick Win',
    type: 'Activity',
    clients: 8,
    completion: 94,
    engagementLift: '+12%',
    positive: true,
  },
  {
    quest: 'Train With Me',
    type: 'Attendance',
    clients: 18,
    completion: 89,
    engagementLift: '+18%',
    positive: true,
  },
  {
    quest: 'Three Day Consistency',
    type: 'Consistency',
    clients: 7,
    completion: 84,
    engagementLift: '+9%',
    positive: true,
  },
  {
    quest: 'Weekly Activity',
    type: 'Activity',
    clients: 12,
    completion: 71,
    engagementLift: '+3%',
    positive: true,
  },
  {
    quest: '30 Day Challenge',
    type: 'Achievement',
    clients: 6,
    completion: 48,
    engagementLift: '-2%',
    positive: false,
  },
];


// ============================================================
// SECTION 8 — QUEST CREATOR CLIENT DATA
// ============================================================

const creatorClients = ref([
  {
    id: 1,
    name: 'Alex Morgan',
    initials: 'AM',

    bestApproach:
      'Short, specific goals with visible progress.',

    goodFor: [
      'Short quests',
      'Visible progress',
      'Pet XP',
      'Streak rewards',
    ],

    avoid: [
      'Long open-ended challenges',
      'Too many quests at once',
    ],

    competitiveFit: 'good',
  },

  {
    id: 2,
    name: 'Jamie Reed',
    initials: 'JR',

    bestApproach:
      'Social accountability and direct trainer contact.',

    goodFor: [
      'Community challenges',
      'Trainer check-ins',
      'Shared goals',
      'Social quests',
    ],

    avoid: [
      'Long solo challenges',
      'Passive reminders',
    ],

    competitiveFit: 'good',
  },

  {
    id: 3,
    name: 'Chris Taylor',
    initials: 'CT',

    bestApproach:
      'Visible achievement progression and clear milestones.',

    goodFor: [
      'Streaks',
      'Achievements',
      'Milestones',
      'Short quests',
    ],

    avoid: [
      'Open-ended goals',
      'Long messages',
    ],

    competitiveFit: 'good',
  },

  {
    id: 4,
    name: 'Sam Jones',
    initials: 'SJ',

    bestApproach:
      'Low-pressure encouragement and small achievable steps.',

    goodFor: [
      'Small quests',
      'Gentle encouragement',
      'Companion support',
      'Flexible goals',
    ],

    avoid: [
      'Streak pressure',
      'Competitive ranking',
      'Multiple quests at once',
    ],

    competitiveFit: 'poor',
  },

  {
    id: 5,
    name: 'Mia Patel',
    initials: 'MP',

    bestApproach:
      'Reward-led motivation with visible progress.',

    goodFor: [
      'Pet XP',
      'Achievements',
      'Community goals',
      'Visible completion',
    ],

    avoid: [
      'Generic reminders',
      'Long challenges',
    ],

    competitiveFit: 'mixed',
  },

  {
    id: 6,
    name: 'Leo Nguyen',
    initials: 'LN',

    bestApproach:
      'Simple challenges with a clear shared target.',

    goodFor: [
      'Shared goals',
      'Short challenges',
      'Clear deadlines',
      'Trainer encouragement',
    ],

    avoid: [
      'Long individual goals',
      'Frequent reminders',
    ],

    competitiveFit: 'mixed',
  },
]);


// ============================================================
// SECTION 9 — CREATE QUEST STATE
// ============================================================

const createQuestOpen = ref(false);
const previewOpen = ref(false);

const creatorMode = ref('individual');

const questTypes = [
  {
    id: 'activity',
    label: 'Activity',
    icon: '🏃',
  },
  {
    id: 'consistency',
    label: 'Consistency',
    icon: '↻',
  },
  {
    id: 'community',
    label: 'Community',
    icon: '👥',
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: '▣',
  },
  {
    id: 'personal',
    label: 'Personal Goal',
    icon: '◎',
  },
  {
    id: 'achievement',
    label: 'Achievement',
    icon: '★',
  },
  {
    id: 'custom',
    label: 'Custom',
    icon: '✦',
  },
];

const creatorForm = ref({
  selectedClientId: 1,
  selectedCommunityClients: [
    1,
    2,
    3,
  ],

  name:
    'Complete a 20 minute walk',

  description:
    'Get outside and complete a 20 minute walk.',

  type: 'activity',

  startDate: '2026-08-20',
  dueDate: '2026-08-20',
  dueTime: '20:00',

  repeat: 'never',

  petXp: 150,
  bonusXp: 0,

  trainerMessage:
    'You’ve got this! Keep it simple and just get moving.',

  companionEnabled: true,
  companionIntroduce: true,
  companionEncourage: true,
  companionCelebrate: true,
  companionCheckIn: true,
  companionStyle: 'profile',

  communityAccess: 'selected',
  communityStyle: 'together',
});

const selectedCreatorClient = computed(() => {
  return (
    creatorClients.value.find(
      (client) =>
        client.id ===
        creatorForm.value.selectedClientId
    ) || creatorClients.value[0]
  );
});

const selectedCommunityClients = computed(() => {
  return creatorClients.value.filter(
    (client) =>
      creatorForm.value.selectedCommunityClients.includes(
        client.id
      )
  );
});

const competitionWarningClients = computed(() => {
  if (
    creatorMode.value !== 'community' ||
    creatorForm.value.communityStyle !==
      'leaderboard'
  ) {
    return [];
  }

  return selectedCommunityClients.value.filter(
    (client) =>
      client.competitiveFit === 'poor' ||
      client.competitiveFit === 'mixed'
  );
});


// ============================================================
// SECTION 10 — PAGE INDEX
// ============================================================

const questSections = [
  {
    id: 'quest-active',
    label: 'Active Quests',
  },
  {
    id: 'quest-community',
    label: 'Community Challenges',
  },
  {
    id: 'quest-individual',
    label: 'Individual Quests',
  },
  {
    id: 'quest-library',
    label: 'Quest Library',
  },
  {
    id: 'quest-results',
    label: 'Recent Results',
  },
];

const activeSection = ref(
  'quest-active'
);

let observer = null;


// ============================================================
// SECTION 11 — COMPUTED HELPERS
// ============================================================

function percentage(
  current,
  target
) {
  if (!target) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(
      (current / target) * 100
    )
  );
}


// ============================================================
// SECTION 12 — ACTIONS
// ============================================================

function openCreateQuest(
  mode = 'individual',
  template = null
) {
  creatorMode.value = mode;

  if (template) {
    creatorForm.value.name =
      template.name;

    creatorForm.value.description =
      template.description;

    creatorForm.value.type =
      template.category === 'attendance'
        ? 'attendance'
        : template.category ===
            'consistency'
          ? 'consistency'
          : template.category ===
              'achievement'
            ? 'achievement'
            : 'activity';
  }

  createQuestOpen.value = true;
}

function closeCreateQuest() {
  createQuestOpen.value = false;
  previewOpen.value = false;
}

function openPreview() {
  previewOpen.value = true;
}

function closePreview() {
  previewOpen.value = false;
}

function assignQuest() {
  window.alert(
    creatorMode.value === 'individual'
      ? `Demo: "${creatorForm.value.name}" assigned to ${selectedCreatorClient.value.name}.`
      : `Demo: "${creatorForm.value.name}" published to ${selectedCommunityClients.value.length} selected clients.`
  );

  closeCreateQuest();
}

function toggleCommunityClient(
  clientId
) {
  const selected =
    creatorForm.value
      .selectedCommunityClients;

  if (
    selected.includes(clientId)
  ) {
    creatorForm.value
      .selectedCommunityClients =
      selected.filter(
        (id) =>
          id !== clientId
      );

    return;
  }

  creatorForm.value
    .selectedCommunityClients.push(
      clientId
    );
}

function scrollToSection(
  sectionId
) {
  const element =
    document.getElementById(
      sectionId
    );

  if (!element) {
    return;
  }

  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

function demoAction(message) {
  window.alert(
    `Demo: ${message}`
  );
}


// ============================================================
// SECTION 13 — INDEX OBSERVER
// ============================================================

onMounted(async () => {
  await nextTick();

  const sections =
    questSections
      .map((section) =>
        document.getElementById(
          section.id
        )
      )
      .filter(Boolean);

  observer =
    new IntersectionObserver(
      (entries) => {
        const visible =
          entries
            .filter(
              (entry) =>
                entry.isIntersecting
            )
            .sort(
              (a, b) =>
                b.intersectionRatio -
                a.intersectionRatio
            );

        if (visible.length) {
          activeSection.value =
            visible[0].target.id;
        }
      },
      {
        root: null,
        rootMargin:
          '-18% 0px -62% 0px',
        threshold: [
          0.05,
          0.15,
          0.3,
          0.5,
        ],
      }
    );

  sections.forEach(
    (section) =>
      observer.observe(section)
  );
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>


<template>
  <div class="trainer-hub">

    <!-- ======================================================
         TRAINER SIDEBAR
         ====================================================== -->

    <TrainerSidebar />


    <!-- ======================================================
         QUESTS PAGE
         ====================================================== -->

    <main class="trainer-quests-page">

      <!-- ====================================================
           PAGE HEADER
           ==================================================== -->

      <header class="trainer-quests-header">

        <div>

          <span class="trainer-quests-eyebrow">
            TRAINER HUB
          </span>

          <h1>
            Quests
          </h1>

          <p>
            Create activities that keep your clients moving,
            engaged and progressing.
          </p>

        </div>


        <button
          type="button"
          class="trainer-create-quest-button"
          @click="
            openCreateQuest(
              'individual'
            )
          "
        >
          + Create Quest
        </button>

      </header>


      <!-- ====================================================
           PAGE CONTENT + INDEX
           ==================================================== -->

      <div class="trainer-quests-layout">

        <!-- ==================================================
             MAIN CONTENT
             ================================================== -->

        <div class="trainer-quests-content">

          <!-- ================================================
               OVERVIEW STRIP
               ================================================ -->

          <section class="trainer-quest-metric-strip">

            <article
              v-for="metric in questMetrics"
              :key="metric.id"
              class="trainer-quest-metric"
              :class="
                `trainer-quest-tone-${metric.tone}`
              "
            >

              <span class="trainer-quest-metric-icon">
                {{ metric.icon }}
              </span>


              <div>

                <strong>
                  {{ metric.value }}
                </strong>

                <span>
                  {{ metric.label }}
                </span>

                <small>
                  ↑ {{ metric.change }}
                </small>

              </div>

            </article>

          </section>


          <!-- ================================================
               ACTIVE QUESTS
               ================================================ -->

          <section
            id="quest-active"
            class="trainer-quest-section"
          >

            <article class="trainer-quest-panel">

              <header class="trainer-quest-panel-header">

                <div>

                  <span class="trainer-quest-section-label">
                    CURRENT
                  </span>

                  <h2>
                    Active Quests
                  </h2>

                </div>


                <button
                  type="button"
                  class="trainer-quest-text-button"
                >
                  View all
                </button>

              </header>


              <div class="trainer-active-quest-filters">

                <button
                  v-for="tab in activeQuestTabs"
                  :key="tab.id"
                  type="button"
                  :class="{
                    active:
                      activeQuestFilter ===
                      tab.id,
                  }"
                  @click="
                    activeQuestFilter =
                      tab.id
                  "
                >
                  {{ tab.label }}
                </button>

              </div>


              <div class="trainer-active-quest-list">

                <article
                  v-for="quest in filteredActiveQuests"
                  :key="quest.id"
                  class="trainer-active-quest-row"
                  :class="
                    `trainer-active-quest-${quest.tone}`
                  "
                >

                  <span
                    class="trainer-active-quest-icon"
                    :class="
                      `trainer-quest-tone-${quest.tone}`
                    "
                  >
                    {{ quest.icon }}
                  </span>


                  <div class="trainer-active-quest-main">

                    <div class="trainer-active-quest-title">

                      <h3>
                        {{ quest.title }}
                      </h3>


                      <span
                        class="trainer-active-quest-type"
                        :class="
                          `trainer-active-quest-type-${quest.tone}`
                        "
                      >
                        {{ quest.typeLabel }}
                      </span>

                    </div>


                    <p>
                      {{ quest.description }}
                    </p>


                    <small v-if="quest.reward">
                      Pet XP:
                      {{ quest.reward }}
                    </small>

                    <small v-if="quest.helperText">
                      {{ quest.helperText }}
                    </small>

                  </div>


                  <div class="trainer-active-quest-progress">

                    <div class="trainer-active-progress-copy">

                      <strong>
                        {{ quest.progressCurrent }}
                        /
                        {{ quest.progressTarget }}
                      </strong>

                      <span>
                        {{ quest.progressLabel }}
                      </span>

                    </div>


                    <div class="trainer-active-progress-bar">

                      <span
                        :style="{
                          width:
                            `${percentage(
                              quest.progressCurrent,
                              quest.progressTarget
                            )}%`,
                        }"
                      />

                    </div>


                    <small>
                      {{ quest.statusLabel }}
                    </small>

                  </div>


                  <div class="trainer-active-quest-people">

                    <template
                      v-if="
                        quest.participants
                      "
                    >

                      <div class="trainer-active-participants">

                        <span
                          v-for="participant in quest.participants"
                          :key="participant"
                        >
                          {{ participant }}
                        </span>

                        <span
                          v-if="
                            quest.extraParticipants
                          "
                          class="extra"
                        >
                          +{{ quest.extraParticipants }}
                        </span>

                      </div>

                    </template>


                    <template
                      v-else
                    >

                      <span class="trainer-single-client-avatar">
                        {{ quest.clientInitials }}
                      </span>

                    </template>

                  </div>


                  <div class="trainer-active-quest-actions">

                    <button
                      type="button"
                      @click="
                        demoAction(
                          quest.action
                        )
                      "
                    >
                      {{ quest.action }}
                    </button>

                    <button
                      type="button"
                      aria-label="More quest options"
                    >
                      ⋮
                    </button>

                  </div>

                </article>

              </div>

            </article>

          </section>


          <!-- ================================================
               COMMUNITY CHALLENGES
               ================================================ -->

          <section
            id="quest-community"
            class="trainer-quest-section"
          >

            <article class="trainer-quest-panel">

              <header class="trainer-quest-panel-header">

                <div>

                  <span class="trainer-quest-section-label">
                    TOGETHER
                  </span>

                  <h2>
                    Community Challenges
                  </h2>

                  <p>
                    Motivate your clients together.
                  </p>

                </div>


                <button
                  type="button"
                  class="trainer-quest-text-button"
                  @click="
                    openCreateQuest(
                      'community'
                    )
                  "
                >
                  + Create Community Challenge
                </button>

              </header>


              <div class="trainer-community-quest-grid">

                <article
                  v-for="challenge in communityChallenges"
                  :key="challenge.id"
                  class="trainer-community-quest-card"
                  :class="
                    `trainer-community-${challenge.tone}`
                  "
                >

                  <div class="trainer-community-card-heading">

                    <span
                      :class="
                        `trainer-quest-tone-${challenge.tone}`
                      "
                    >
                      {{ challenge.icon }}
                    </span>


                    <div>

                      <h3>
                        {{ challenge.title }}
                      </h3>

                      <p>
                        {{ challenge.description }}
                      </p>

                    </div>

                  </div>


                  <div class="trainer-community-card-stats">

                    <div>

                      <strong>
                        {{ challenge.joined }}
                      </strong>

                      <span>
                        Joined
                      </span>

                    </div>

                    <div>

                      <strong>
                        {{ challenge.completed }}
                      </strong>

                      <span>
                        Completed
                      </span>

                    </div>

                    <div>

                      <strong>
                        {{ challenge.completion }}%
                      </strong>

                      <span>
                        Completion
                      </span>

                    </div>

                  </div>


                  <div class="trainer-community-progress-bar">

                    <span
                      :style="{
                        width:
                          `${challenge.completion}%`,
                      }"
                    />

                  </div>


                  <footer>

                    <div>

                      <span>
                        ▣ {{ challenge.ends }}
                      </span>

                      <small>
                        🐾 {{ challenge.reward }}
                      </small>

                    </div>


                    <button
                      type="button"
                      @click="
                        demoAction(
                          `Manage ${challenge.title}`
                        )
                      "
                    >
                      Manage Challenge
                    </button>

                  </footer>

                </article>

              </div>

            </article>

          </section>


          <!-- ================================================
               INDIVIDUAL QUESTS
               ================================================ -->

          <section
            id="quest-individual"
            class="trainer-quest-section"
          >

            <article class="trainer-quest-panel">

              <header class="trainer-quest-panel-header">

                <div>

                  <span class="trainer-quest-section-label">
                    ONE TO ONE
                  </span>

                  <h2>
                    Individual Quests
                  </h2>

                </div>


                <button
                  type="button"
                  class="trainer-quest-text-button"
                >
                  View all
                </button>

              </header>


              <div class="trainer-individual-quest-table-wrapper">

                <div class="trainer-individual-quest-table">

                  <div class="trainer-individual-quest-head">

                    <span>
                      Client
                    </span>

                    <span>
                      Quest
                    </span>

                    <span>
                      Progress
                    </span>

                    <span>
                      Due
                    </span>

                    <span>
                      Status
                    </span>

                    <span>
                      Companion Support
                    </span>

                    <span />

                  </div>


                  <div
                    v-for="quest in individualQuests"
                    :key="quest.id"
                    class="trainer-individual-quest-row"
                  >

                    <div class="trainer-individual-client">

                      <span>
                        {{ quest.initials }}
                      </span>

                      <strong>
                        {{ quest.client }}
                      </strong>

                    </div>


                    <strong>
                      {{ quest.quest }}
                    </strong>


                    <div class="trainer-individual-progress">

                      <div>

                        <span
                          :style="{
                            width:
                              `${percentage(
                                quest.progressCurrent,
                                quest.progressTarget
                              )}%`,
                          }"
                        />

                      </div>

                      <strong>
                        {{ quest.progressCurrent }}
                        /
                        {{ quest.progressTarget }}
                      </strong>

                    </div>


                    <span>
                      {{ quest.due }}
                    </span>


                    <span
                      class="trainer-individual-status"
                      :class="
                        `status-${quest.statusType}`
                      "
                    >
                      {{ quest.status }}
                    </span>


                    <span
                      class="trainer-individual-companion"
                      :class="
                        `companion-${quest.companionType}`
                      "
                    >
                      🐾 {{ quest.companion }}
                    </span>


                    <button
                      type="button"
                      aria-label="More quest options"
                    >
                      ⋮
                    </button>

                  </div>

                </div>

              </div>

            </article>

          </section>


          <!-- ================================================
               QUEST LIBRARY
               ================================================ -->

          <section
            id="quest-library"
            class="trainer-quest-section"
          >

            <article class="trainer-quest-panel">

              <header class="trainer-quest-panel-header trainer-library-header">

                <div>

                  <span class="trainer-quest-section-label">
                    REUSE
                  </span>

                  <h2>
                    Quest Library
                  </h2>

                  <p>
                    Reuse activities that work well.
                  </p>

                </div>


                <div class="trainer-library-controls">

                  <div class="trainer-library-search">

                    <span>
                      ⌕
                    </span>

                    <input
                      v-model="librarySearch"
                      type="search"
                      placeholder="Search quests..."
                    />

                  </div>


                  <select v-model="libraryFilter">

                    <option
                      v-for="category in libraryCategories"
                      :key="category.id"
                      :value="category.id"
                    >
                      {{ category.label }}
                    </option>

                  </select>

                </div>

              </header>


              <div class="trainer-library-layout">

                <nav class="trainer-library-categories">

                  <button
                    v-for="category in libraryCategories"
                    :key="category.id"
                    type="button"
                    :class="{
                      active:
                        libraryFilter ===
                        category.id,
                    }"
                    @click="
                      libraryFilter =
                        category.id
                    "
                  >
                    {{ category.label }}
                  </button>

                </nav>


                <div class="trainer-library-table">

                  <div class="trainer-library-head">

                    <span>
                      Quest
                    </span>

                    <span>
                      Type
                    </span>

                    <span>
                      Success Rate
                    </span>

                    <span>
                      Used
                    </span>

                    <span>
                      Actions
                    </span>

                  </div>


                  <div
                    v-for="quest in filteredLibrary"
                    :key="quest.id"
                    class="trainer-library-row"
                  >

                    <div>

                      <strong>
                        {{ quest.name }}
                      </strong>

                      <span>
                        {{ quest.description }}
                      </span>

                    </div>


                    <span>
                      {{ quest.type }}
                    </span>


                    <strong
                      class="trainer-library-success"
                      :class="{
                        poor:
                          quest.successRate <
                          60,
                      }"
                    >
                      {{ quest.successRate }}%
                    </strong>


                    <span>
                      {{ quest.used }} times
                    </span>


                    <button
                      type="button"
                      @click="
                        openCreateQuest(
                          'individual',
                          quest
                        )
                      "
                    >
                      Use Template
                    </button>

                  </div>

                </div>

              </div>


              <button
                type="button"
                class="trainer-library-view-all"
              >
                View all templates →
              </button>

            </article>

          </section>


          <!-- ================================================
               RECENT RESULTS
               ================================================ -->

          <section
            id="quest-results"
            class="trainer-quest-section"
          >

            <article class="trainer-quest-panel">

              <header class="trainer-quest-panel-header">

                <div>

                  <span class="trainer-quest-section-label">
                    LEARN
                  </span>

                  <h2>
                    Recent Quest Results
                  </h2>

                  <p>
                    See which quests are driving the best engagement.
                  </p>

                </div>


                <RouterLink
                  to="/trainer/engagement"
                  class="trainer-quest-text-link"
                >
                  View full engagement analytics →
                </RouterLink>

              </header>


              <div class="trainer-result-table">

                <div class="trainer-result-head">

                  <span>
                    Quest
                  </span>

                  <span>
                    Type
                  </span>

                  <span>
                    Clients
                  </span>

                  <span>
                    Completion Rate
                  </span>

                  <span>
                    Engagement Lift
                  </span>

                </div>


                <div
                  v-for="result in recentResults"
                  :key="result.quest"
                  class="trainer-result-row"
                >

                  <strong>
                    {{ result.quest }}
                  </strong>

                  <span>
                    {{ result.type }}
                  </span>

                  <span>
                    {{ result.clients }}
                  </span>

                  <strong
                    :class="{
                      poor:
                        result.completion <
                        60,
                    }"
                  >
                    {{ result.completion }}%
                  </strong>

                  <strong
                    :class="{
                      positive:
                        result.positive,
                      negative:
                        !result.positive,
                    }"
                  >
                    {{ result.engagementLift }}
                  </strong>

                </div>

              </div>

            </article>

          </section>

        </div>


        <!-- ==================================================
             STICKY PAGE INDEX
             ================================================== -->

        <aside class="trainer-quest-index">

          <span class="trainer-quest-index-title">
            ON THIS PAGE
          </span>


          <nav>

            <button
              v-for="section in questSections"
              :key="section.id"
              type="button"
              :class="{
                active:
                  activeSection ===
                  section.id,
              }"
              @click="
                scrollToSection(
                  section.id
                )
              "
            >

              <span />

              {{ section.label }}

            </button>

          </nav>


          <div class="trainer-quest-index-tip">

            <span>
              🐾
            </span>

            <p>
              Use quests that match each client's motivation
              profile for the best results.
            </p>

          </div>

        </aside>

      </div>

    </main>


    <!-- ======================================================
         CREATE QUEST BACKDROP
         ====================================================== -->

    <Transition name="trainer-quest-fade">

      <button
        v-if="createQuestOpen"
        type="button"
        class="trainer-create-quest-backdrop"
        aria-label="Close quest creator"
        @click="
          closeCreateQuest
        "
      />

    </Transition>


    <!-- ======================================================
         CREATE QUEST SLIDE-OVER
         ====================================================== -->

    <Transition name="trainer-quest-slide">

      <aside
        v-if="createQuestOpen"
        class="trainer-create-quest-drawer"
      >

        <!-- ==================================================
             CREATOR HEADER
             ================================================== -->

        <header class="trainer-create-quest-header">

          <div>

            <span>
              QUEST BUILDER
            </span>

            <h2>
              Create Quest
            </h2>

            <p>
              Build a motivational activity and let the client's
              companion help deliver it in the right way.
            </p>

          </div>


          <button
            type="button"
            aria-label="Close quest creator"
            @click="
              closeCreateQuest
            "
          >
            ×
          </button>

        </header>


        <!-- ==================================================
             CREATOR CONTENT
             ================================================== -->

        <div class="trainer-create-quest-content">

          <!-- ================================================
               1 — QUEST AUDIENCE
               ================================================ -->

          <section class="trainer-builder-section">

            <div class="trainer-builder-section-number">
              1
            </div>


            <div class="trainer-builder-section-content">

              <header>

                <h3>
                  Who is this for?
                </h3>

                <p>
                  Choose whether this is an individual quest
                  or a community challenge.
                </p>

              </header>


              <div class="trainer-quest-mode-grid">

                <button
                  type="button"
                  :class="{
                    active:
                      creatorMode ===
                      'individual',
                  }"
                  @click="
                    creatorMode =
                      'individual'
                  "
                >

                  <span>
                    👤
                  </span>

                  <strong>
                    Individual
                  </strong>

                  <small>
                    Create a quest for one client.
                  </small>

                </button>


                <button
                  type="button"
                  :class="{
                    active:
                      creatorMode ===
                      'community',
                  }"
                  @click="
                    creatorMode =
                      'community'
                  "
                >

                  <span>
                    👥
                  </span>

                  <strong>
                    Community
                  </strong>

                  <small>
                    Create a shared challenge for multiple clients.
                  </small>

                </button>

              </div>

            </div>

          </section>


          <!-- ================================================
               2 — CLIENT SELECTION
               ================================================ -->

          <section class="trainer-builder-section">

            <div class="trainer-builder-section-number">
              2
            </div>


            <div class="trainer-builder-section-content">

              <header>

                <h3>
                  {{
                    creatorMode ===
                    'individual'
                      ? 'Select Client'
                      : 'Select Participants'
                  }}
                </h3>

              </header>


              <!-- Individual -->

              <template
                v-if="
                  creatorMode ===
                  'individual'
                "
              >

                <select
                  v-model="
                    creatorForm.selectedClientId
                  "
                  class="trainer-builder-select"
                >

                  <option
                    v-for="client in creatorClients"
                    :key="client.id"
                    :value="client.id"
                  >
                    {{ client.name }}
                  </option>

                </select>


                <div class="trainer-selected-client-preview">

                  <span>
                    {{ selectedCreatorClient.initials }}
                  </span>

                  <div>

                    <strong>
                      {{ selectedCreatorClient.name }}
                    </strong>

                    <small>
                      {{
                        selectedCreatorClient.bestApproach
                      }}
                    </small>

                  </div>

                </div>

              </template>


              <!-- Community -->

              <template v-else>

                <div class="trainer-community-access">

                  <label>

                    <input
                      v-model="
                        creatorForm.communityAccess
                      "
                      type="radio"
                      value="all"
                    />

                    <span>

                      <strong>
                        All my clients
                      </strong>

                      <small>
                        Everyone can participate.
                      </small>

                    </span>

                  </label>


                  <label>

                    <input
                      v-model="
                        creatorForm.communityAccess
                      "
                      type="radio"
                      value="selected"
                    />

                    <span>

                      <strong>
                        Selected clients
                      </strong>

                      <small>
                        Choose who can participate.
                      </small>

                    </span>

                  </label>


                  <label>

                    <input
                      v-model="
                        creatorForm.communityAccess
                      "
                      type="radio"
                      value="invite"
                    />

                    <span>

                      <strong>
                        Invite only
                      </strong>

                      <small>
                        Clients join through an invitation.
                      </small>

                    </span>

                  </label>

                </div>


                <div
                  v-if="
                    creatorForm.communityAccess ===
                    'selected'
                  "
                  class="trainer-community-client-grid"
                >

                  <button
                    v-for="client in creatorClients"
                    :key="client.id"
                    type="button"
                    :class="{
                      active:
                        creatorForm.selectedCommunityClients.includes(
                          client.id
                        ),
                    }"
                    @click="
                      toggleCommunityClient(
                        client.id
                      )
                    "
                  >

                    <span>
                      {{ client.initials }}
                    </span>

                    <strong>
                      {{ client.name }}
                    </strong>

                    <small>
                      {{
                        client.bestApproach
                      }}
                    </small>

                  </button>

                </div>

              </template>

            </div>

          </section>


          <!-- ================================================
               3 — QUEST TYPE
               ================================================ -->

          <section class="trainer-builder-section">

            <div class="trainer-builder-section-number">
              3
            </div>


            <div class="trainer-builder-section-content">

              <header>

                <h3>
                  Quest Type
                </h3>

                <p>
                  Choose the motivational structure that fits
                  the goal.
                </p>

              </header>


              <div class="trainer-quest-type-grid">

                <button
                  v-for="type in questTypes"
                  :key="type.id"
                  type="button"
                  :class="{
                    active:
                      creatorForm.type ===
                      type.id,
                  }"
                  @click="
                    creatorForm.type =
                      type.id
                  "
                >

                  <span>
                    {{ type.icon }}
                  </span>

                  <strong>
                    {{ type.label }}
                  </strong>

                </button>

              </div>

            </div>

          </section>


          <!-- ================================================
               4 — QUEST DETAILS
               ================================================ -->

          <section class="trainer-builder-section">

            <div class="trainer-builder-section-number">
              4
            </div>


            <div class="trainer-builder-section-content">

              <header>

                <h3>
                  Quest Details
                </h3>

              </header>


              <label class="trainer-builder-field">

                <span>
                  Quest name
                </span>

                <input
                  v-model="
                    creatorForm.name
                  "
                  type="text"
                />

              </label>


              <label class="trainer-builder-field">

                <span>
                  Description
                </span>

                <textarea
                  v-model="
                    creatorForm.description
                  "
                  rows="4"
                />

              </label>

            </div>

          </section>


          <!-- ================================================
               5 — SCHEDULE
               ================================================ -->

          <section class="trainer-builder-section">

            <div class="trainer-builder-section-number">
              5
            </div>


            <div class="trainer-builder-section-content">

              <header>

                <h3>
                  Schedule
                </h3>

              </header>


              <div class="trainer-builder-date-grid">

                <label class="trainer-builder-field">

                  <span>
                    Starts
                  </span>

                  <input
                    v-model="
                      creatorForm.startDate
                    "
                    type="date"
                  />

                </label>


                <label class="trainer-builder-field">

                  <span>
                    Due
                  </span>

                  <input
                    v-model="
                      creatorForm.dueDate
                    "
                    type="date"
                  />

                </label>


                <label class="trainer-builder-field">

                  <span>
                    Due time
                  </span>

                  <input
                    v-model="
                      creatorForm.dueTime
                    "
                    type="time"
                  />

                </label>


                <label class="trainer-builder-field">

                  <span>
                    Repeat
                  </span>

                  <select
                    v-model="
                      creatorForm.repeat
                    "
                  >
                    <option value="never">
                      Never
                    </option>

                    <option value="daily">
                      Daily
                    </option>

                    <option value="weekly">
                      Weekly
                    </option>

                    <option value="custom">
                      Custom
                    </option>
                  </select>

                </label>

              </div>

            </div>

          </section>


          <!-- ================================================
               6 — COMMUNITY STYLE
               ================================================ -->

          <section
            v-if="
              creatorMode ===
              'community'
            "
            class="trainer-builder-section"
          >

            <div class="trainer-builder-section-number">
              6
            </div>


            <div class="trainer-builder-section-content">

              <header>

                <h3>
                  Challenge Style
                </h3>

                <p>
                  Decide how participants experience the challenge.
                </p>

              </header>


              <div class="trainer-community-style-options">

                <label>

                  <input
                    v-model="
                      creatorForm.communityStyle
                    "
                    type="radio"
                    value="together"
                  />

                  <span>

                    <strong>
                      Everyone completes together
                    </strong>

                    <small>
                      Focus on participation rather than ranking.
                    </small>

                  </span>

                </label>


                <label>

                  <input
                    v-model="
                      creatorForm.communityStyle
                    "
                    type="radio"
                    value="personal"
                  />

                  <span>

                    <strong>
                      Personal progress
                    </strong>

                    <small>
                      Everyone works towards their own target.
                    </small>

                  </span>

                </label>


                <label>

                  <input
                    v-model="
                      creatorForm.communityStyle
                    "
                    type="radio"
                    value="leaderboard"
                  />

                  <span>

                    <strong>
                      Leaderboard
                    </strong>

                    <small>
                      Participants can compare progress.
                    </small>

                  </span>

                </label>

              </div>


              <div
                v-if="
                  competitionWarningClients.length
                "
                class="trainer-competition-warning"
              >

                <span>
                  ⚠
                </span>

                <div>

                  <strong>
                    {{
                      competitionWarningClients.length
                    }}
                    selected client{{
                      competitionWarningClients.length ===
                      1
                        ? ''
                        : 's'
                    }}
                    may respond poorly to competitive motivation.
                  </strong>

                  <p>
                    {{
                      competitionWarningClients
                        .map(
                          (client) =>
                            client.name
                        )
                        .join(', ')
                    }}
                  </p>

                </div>

              </div>

            </div>

          </section>


          <!-- ================================================
               REWARDS
               ================================================ -->

          <section class="trainer-builder-section">

            <div class="trainer-builder-section-number">
              {{
                creatorMode ===
                'community'
                  ? 7
                  : 6
              }}
            </div>


            <div class="trainer-builder-section-content">

              <header>

                <h3>
                  Rewards
                </h3>

              </header>


              <div class="trainer-builder-reward-grid">

                <label class="trainer-builder-field">

                  <span>
                    Pet XP
                  </span>

                  <input
                    v-model.number="
                      creatorForm.petXp
                    "
                    type="number"
                    min="0"
                  />

                </label>


                <label class="trainer-builder-field">

                  <span>
                    Bonus XP
                  </span>

                  <input
                    v-model.number="
                      creatorForm.bonusXp
                    "
                    type="number"
                    min="0"
                  />

                </label>

              </div>

            </div>

          </section>


          <!-- ================================================
               TRAINER MESSAGE
               ================================================ -->

          <section class="trainer-builder-section">

            <div class="trainer-builder-section-number">
              {{
                creatorMode ===
                'community'
                  ? 8
                  : 7
              }}
            </div>


            <div class="trainer-builder-section-content">

              <header>

                <h3>
                  Message From Trainer
                </h3>

                <p>
                  Optional message that can be introduced alongside
                  the quest.
                </p>

              </header>


              <label class="trainer-builder-field">

                <textarea
                  v-model="
                    creatorForm.trainerMessage
                  "
                  rows="4"
                />

              </label>

            </div>

          </section>


          <!-- ================================================
               COMPANION SUPPORT
               ================================================ -->

          <section class="trainer-builder-section">

            <div class="trainer-builder-section-number">
              {{
                creatorMode ===
                'community'
                  ? 9
                  : 8
              }}
            </div>


            <div class="trainer-builder-section-content">

              <header class="trainer-companion-builder-heading">

                <div>

                  <h3>
                    Companion Support
                  </h3>

                  <p>
                    Let each client's own companion help them stay
                    engaged with the quest.
                  </p>

                </div>


                <label class="trainer-builder-toggle">

                  <input
                    v-model="
                      creatorForm.companionEnabled
                    "
                    type="checkbox"
                  />

                  <span />

                </label>

              </header>


              <template
                v-if="
                  creatorForm.companionEnabled
                "
              >

                <div class="trainer-companion-support-options">

                  <label>

                    <input
                      v-model="
                        creatorForm.companionIntroduce
                      "
                      type="checkbox"
                    />

                    <span>
                      Introduce the quest
                    </span>

                  </label>


                  <label>

                    <input
                      v-model="
                        creatorForm.companionEncourage
                      "
                      type="checkbox"
                    />

                    <span>
                      Encourage progress
                    </span>

                  </label>


                  <label>

                    <input
                      v-model="
                        creatorForm.companionCelebrate
                      "
                      type="checkbox"
                    />

                    <span>
                      Celebrate completion
                    </span>

                  </label>


                  <label>

                    <input
                      v-model="
                        creatorForm.companionCheckIn
                      "
                      type="checkbox"
                    />

                    <span>
                      Check in if progress stops
                    </span>

                  </label>

                </div>


                <label class="trainer-builder-field">

                  <span>
                    Reminder style
                  </span>

                  <select
                    v-model="
                      creatorForm.companionStyle
                    "
                  >
                    <option value="profile">
                      Use client's motivation profile
                    </option>

                    <option value="gentle">
                      Gentle
                    </option>

                    <option value="energetic">
                      Energetic
                    </option>

                    <option value="minimal">
                      Minimal
                    </option>
                  </select>

                </label>

              </template>

            </div>

          </section>


          <!-- ================================================
               RESPAWN MOTIVATION RECOMMENDATION
               ================================================ -->

          <section class="trainer-respawn-quest-suggestion">

            <div class="trainer-respawn-suggestion-icon">
              🐾
            </div>


            <div>

              <span>
                RESPAWN SUGGESTION
              </span>


              <template
                v-if="
                  creatorMode ===
                  'individual'
                "
              >

                <h3>
                  Best approach for
                  {{ selectedCreatorClient.name }}
                </h3>


                <p>
                  {{
                    selectedCreatorClient.bestApproach
                  }}
                </p>


                <div class="trainer-respawn-suggestion-grid">

                  <div>

                    <strong>
                      RESPONDS WELL TO
                    </strong>

                    <ul>

                      <li
                        v-for="item in selectedCreatorClient.goodFor"
                        :key="item"
                      >
                        {{ item }}
                      </li>

                    </ul>

                  </div>


                  <div>

                    <strong class="avoid">
                      CONSIDER AVOIDING
                    </strong>

                    <ul class="avoid">

                      <li
                        v-for="item in selectedCreatorClient.avoid"
                        :key="item"
                      >
                        {{ item }}
                      </li>

                    </ul>

                  </div>

                </div>

              </template>


              <template v-else>

                <h3>
                  Community motivation fit
                </h3>

                <p>
                  Respawn can adapt companion encouragement to each
                  participant's individual motivation profile.
                </p>


                <div class="trainer-community-recommendation-summary">

                  <span>
                    {{
                      selectedCommunityClients.length
                    }}
                    selected participants
                  </span>

                  <span>
                    Personalised companion support
                  </span>

                  <span>
                    {{
                      competitionWarningClients.length
                    }}
                    competition warnings
                  </span>

                </div>

              </template>

            </div>

          </section>

        </div>


        <!-- ==================================================
             CREATOR FOOTER
             ================================================== -->

        <footer class="trainer-create-quest-footer">

          <button
            type="button"
            class="secondary"
            @click="
              closeCreateQuest
            "
          >
            Cancel
          </button>


          <button
            type="button"
            class="secondary"
            @click="
              openPreview
            "
          >
            Preview Quest
          </button>


          <button
            type="button"
            class="primary"
            @click="
              assignQuest
            "
          >
            {{
              creatorMode ===
              'individual'
                ? 'Assign Quest'
                : 'Publish Challenge'
            }}
          </button>

        </footer>

      </aside>

    </Transition>


    <!-- ======================================================
         QUEST PREVIEW
         ====================================================== -->

    <div
      v-if="previewOpen"
      class="trainer-quest-preview-backdrop"
      @click.self="
        closePreview
      "
    >

      <section class="trainer-quest-preview">

        <header>

          <div>

            <span>
              CLIENT PREVIEW
            </span>

            <h2>
              How the quest may appear
            </h2>

          </div>


          <button
            type="button"
            @click="
              closePreview
            "
          >
            ×
          </button>

        </header>


        <div class="trainer-preview-phone">

          <div class="trainer-preview-phone-top">

            <span>
              PROJECT RESPAWN
            </span>

            <span>
              🐾
            </span>

          </div>


          <div class="trainer-preview-companion">

            <span>
              🐾
            </span>

            <div>

              <strong>
                New quest from Sarah!
              </strong>

              <p
                v-if="
                  creatorMode ===
                  'individual'
                "
              >
                {{
                  selectedCreatorClient.name
                }},
                you've got a new quest.
              </p>

              <p v-else>
                Sarah has launched a new community challenge.
              </p>

            </div>

          </div>


          <article class="trainer-preview-quest-card">

            <span>
              {{
                questTypes.find(
                  (type) =>
                    type.id ===
                    creatorForm.type
                )?.icon
              }}
            </span>


            <h3>
              {{ creatorForm.name }}
            </h3>

            <p>
              {{ creatorForm.description }}
            </p>


            <div class="trainer-preview-reward">
              🐾 +{{ creatorForm.petXp }} Pet XP
            </div>


            <small>
              Due
              {{ creatorForm.dueDate }}
              at
              {{ creatorForm.dueTime }}
            </small>


            <button type="button">
              View Quest
            </button>

          </article>


          <div class="trainer-preview-trainer-message">

            <strong>
              Message from Sarah
            </strong>

            <p>
              {{ creatorForm.trainerMessage }}
            </p>

          </div>

        </div>


        <footer>

          <button
            type="button"
            @click="
              closePreview
            "
          >
            Back to Builder
          </button>

        </footer>

      </section>

    </div>

  </div>
</template>