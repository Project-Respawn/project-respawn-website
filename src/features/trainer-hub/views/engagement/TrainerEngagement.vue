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
import '../../styles/trainer-engagement.css';


// ============================================================
// PROJECT RESPAWN — TRAINER ENGAGEMENT
// ============================================================


// ============================================================
// SECTION 1 — FILTER STATE
// ============================================================

const selectedPeriod = ref('month');
const selectedClientFilter = ref('all');


// ============================================================
// SECTION 2 — KPI SUMMARY
// ============================================================

const engagementMetrics = [
  {
    id: 'quests',
    icon: '▣',
    value: '84%',
    label: 'Quest Completion',
    change: '6%',
    tone: 'purple',
  },
  {
    id: 'challenges',
    icon: '🏆',
    value: '76%',
    label: 'Challenge Completion',
    change: '4%',
    tone: 'green',
  },
  {
    id: 'streaks',
    icon: '🔥',
    value: '12',
    label: 'Active Streaks',
    change: '2',
    tone: 'orange',
  },
  {
    id: 'clients',
    icon: '👥',
    value: '18',
    label: 'Active Clients',
    change: '3',
    tone: 'blue',
  },
  {
    id: 'companion',
    icon: '🐾',
    value: '61%',
    label: 'Companion Re-engagement',
    change: '8%',
    tone: 'purple',
  },
];


// ============================================================
// SECTION 3 — ENGAGEMENT OVER TIME
// ============================================================

const engagementTimeline = [
  { label: 'May 1', value: 42 },
  { label: 'May 8', value: 48 },
  { label: 'May 15', value: 54 },
  { label: 'May 22', value: 57 },
  { label: 'Jun 1', value: 52 },
  { label: 'Jun 8', value: 63 },
  { label: 'Jun 15', value: 69 },
  { label: 'Jun 22', value: 78 },
  { label: 'Jul 1', value: 81 },
  { label: 'Jul 8', value: 84 },
  { label: 'Jul 15', value: 91 },
  { label: 'Jul 22', value: 82 },
  { label: 'Aug 1', value: 79 },
  { label: 'Aug 8', value: 70 },
  { label: 'Aug 12', value: 65 },
  { label: 'Aug 15', value: 72 },
  { label: 'Aug 18', value: 74 },
  { label: 'Aug 19', value: 69 },
  { label: 'Aug 20', value: 66 },
  { label: 'Aug 21', value: 74 },
];

const timelineEvents = [
  {
    date: 'Jun 5',
    label: 'New Quest Launch',
    tone: 'purple',
  },
  {
    date: 'Jul 1',
    label: 'Train With Me Challenge',
    tone: 'green',
  },
  {
    date: 'Jul 20',
    label: 'Companion Reminder Push',
    tone: 'blue',
  },
  {
    date: 'Aug 10',
    label: 'Community Event',
    tone: 'orange',
  },
];

const timelinePoints = computed(() => {
  const maxIndex = engagementTimeline.length - 1;

  return engagementTimeline.map((point, index) => {
    const x =
      maxIndex === 0
        ? 0
        : (index / maxIndex) * 100;

    const y =
      100 - point.value;

    return {
      ...point,
      x,
      y,
    };
  });
});

const timelinePolyline = computed(() => {
  return timelinePoints.value
    .map(
      (point) =>
        `${point.x},${point.y}`
    )
    .join(' ');
});


// ============================================================
// SECTION 4 — WHAT WORKS ACROSS CLIENTS
// ============================================================

const groupMotivators = [
  {
    label: 'Short quests',
    value: 91,
    icon: '▣',
    tone: 'purple',
  },
  {
    label: 'Trainer encouragement',
    value: 87,
    icon: '☘',
    tone: 'green',
  },
  {
    label: 'Community challenges',
    value: 82,
    icon: '👥',
    tone: 'blue',
  },
  {
    label: 'Streaks',
    value: 79,
    icon: '🔥',
    tone: 'orange',
  },
  {
    label: 'Pet rewards',
    value: 76,
    icon: '🐾',
    tone: 'purple',
  },
  {
    label: 'Long challenges',
    value: 58,
    icon: '♜',
    tone: 'grey',
  },
];


// ============================================================
// SECTION 5 — CLIENT MOTIVATION PROFILES
// ============================================================

const motivationClients = ref([
  {
    id: 1,
    name: 'Alex Morgan',
    initials: 'AM',
    engagement: 92,

    bestApproach:
      'Short, specific goals with visible progress.',

    motivators: [
      {
        label: 'Short quests',
        value: 94,
        tone: 'purple',
      },
      {
        label: 'Trainer encouragement',
        value: 89,
        tone: 'green',
      },
      {
        label: 'Streaks',
        value: 86,
        tone: 'orange',
      },
      {
        label: 'Pet XP rewards',
        value: 81,
        tone: 'purple',
      },
      {
        label: 'Community challenges',
        value: 72,
        tone: 'blue',
      },
    ],

    lessEffective: [
      {
        label: 'Long challenges',
        value: 42,
      },
      {
        label: 'Generic reminders',
        value: 31,
      },
    ],

    respondsWellTo: [
      'Short quests',
      'Streaks',
      'Trainer encouragement',
      'Pet progression',
    ],

    lessResponsiveTo: [
      'Long open-ended challenges',
      'Multiple quests at once',
    ],

    suggestedAction:
      'Assign a 1–2 day quest after tomorrow’s planned activity.',
  },

  {
    id: 2,
    name: 'Jamie Reed',
    initials: 'JR',
    engagement: 84,

    bestApproach:
      'Social accountability and regular trainer contact.',

    motivators: [
      {
        label: 'Community challenges',
        value: 95,
        tone: 'blue',
      },
      {
        label: 'Trainer check-ins',
        value: 91,
        tone: 'green',
      },
      {
        label: 'Social quests',
        value: 88,
        tone: 'blue',
      },
      {
        label: 'Pet rewards',
        value: 72,
        tone: 'purple',
      },
      {
        label: 'Streaks',
        value: 64,
        tone: 'orange',
      },
    ],

    lessEffective: [
      {
        label: 'Solo long challenges',
        value: 43,
      },
      {
        label: 'Generic reminders',
        value: 37,
      },
    ],

    respondsWellTo: [
      'Community activities',
      'Trainer check-ins',
      'Social quests',
      'Shared goals',
    ],

    lessResponsiveTo: [
      'Long solo challenges',
      'Passive reminders',
    ],

    suggestedAction:
      'Invite Jamie to the next Train With Me community challenge.',
  },

  {
    id: 3,
    name: 'Chris Taylor',
    initials: 'CT',
    engagement: 78,

    bestApproach:
      'Visible progression and achievement-based motivation.',

    motivators: [
      {
        label: 'Streaks',
        value: 96,
        tone: 'orange',
      },
      {
        label: 'Achievement rewards',
        value: 91,
        tone: 'purple',
      },
      {
        label: 'Short quests',
        value: 84,
        tone: 'purple',
      },
      {
        label: 'Pet XP rewards',
        value: 77,
        tone: 'green',
      },
      {
        label: 'Community challenges',
        value: 61,
        tone: 'blue',
      },
    ],

    lessEffective: [
      {
        label: 'Open-ended goals',
        value: 44,
      },
      {
        label: 'Trainer messages',
        value: 39,
      },
    ],

    respondsWellTo: [
      'Streaks',
      'Achievements',
      'Clear progress',
      'Milestone rewards',
    ],

    lessResponsiveTo: [
      'Open-ended goals',
      'Long motivational messages',
    ],

    suggestedAction:
      'Set a clear milestone quest that extends Chris’s current streak.',
  },

  {
    id: 4,
    name: 'Sam Jones',
    initials: 'SJ',
    engagement: 42,

    bestApproach:
      'Low-pressure encouragement and very small achievable steps.',

    motivators: [
      {
        label: 'Trainer encouragement',
        value: 87,
        tone: 'green',
      },
      {
        label: 'Small quests',
        value: 83,
        tone: 'purple',
      },
      {
        label: 'Companion support',
        value: 79,
        tone: 'purple',
      },
      {
        label: 'Pet progression',
        value: 62,
        tone: 'blue',
      },
      {
        label: 'Community challenges',
        value: 52,
        tone: 'blue',
      },
    ],

    lessEffective: [
      {
        label: 'Streak pressure',
        value: 31,
      },
      {
        label: 'Multiple quests',
        value: 27,
      },
    ],

    respondsWellTo: [
      'Gentle encouragement',
      'Very small quests',
      'Companion support',
      'Flexible goals',
    ],

    lessResponsiveTo: [
      'Streak pressure',
      'Too many tasks at once',
    ],

    suggestedAction:
      'Send encouragement and offer one small optional quest.',
  },

  {
    id: 5,
    name: 'Mia Patel',
    initials: 'MP',
    engagement: 73,

    bestApproach:
      'Reward-led motivation with visible progress.',

    motivators: [
      {
        label: 'Pet rewards',
        value: 93,
        tone: 'purple',
      },
      {
        label: 'Achievement rewards',
        value: 89,
        tone: 'green',
      },
      {
        label: 'Community challenges',
        value: 82,
        tone: 'blue',
      },
      {
        label: 'Short quests',
        value: 77,
        tone: 'purple',
      },
      {
        label: 'Streaks',
        value: 69,
        tone: 'orange',
      },
    ],

    lessEffective: [
      {
        label: 'Generic reminders',
        value: 45,
      },
      {
        label: 'Long challenges',
        value: 40,
      },
    ],

    respondsWellTo: [
      'Pet rewards',
      'Achievement progress',
      'Community goals',
      'Visible completion',
    ],

    lessResponsiveTo: [
      'Generic reminders',
      'Long open-ended challenges',
    ],

    suggestedAction:
      'Assign a short quest with a visible Pet XP reward.',
  },

  {
    id: 6,
    name: 'Leo Nguyen',
    initials: 'LN',
    engagement: 65,

    bestApproach:
      'Simple challenges with a clear shared target.',

    motivators: [
      {
        label: 'Team goals',
        value: 88,
        tone: 'blue',
      },
      {
        label: 'Short challenges',
        value: 84,
        tone: 'purple',
      },
      {
        label: 'Trainer encouragement',
        value: 78,
        tone: 'green',
      },
      {
        label: 'Pet rewards',
        value: 74,
        tone: 'purple',
      },
      {
        label: 'Streaks',
        value: 57,
        tone: 'orange',
      },
    ],

    lessEffective: [
      {
        label: 'Long individual goals',
        value: 39,
      },
      {
        label: 'Frequent reminders',
        value: 34,
      },
    ],

    respondsWellTo: [
      'Shared goals',
      'Short challenges',
      'Trainer encouragement',
      'Clear deadlines',
    ],

    lessResponsiveTo: [
      'Long individual goals',
      'Frequent reminders',
    ],

    suggestedAction:
      'Invite Leo to a short team challenge with a clear deadline.',
  },
]);

const selectedMotivationClientId = ref(1);

const selectedMotivationClient = computed(() => {
  return (
    motivationClients.value.find(
      (client) =>
        client.id ===
        selectedMotivationClientId.value
    ) || motivationClients.value[0]
  );
});


// ============================================================
// SECTION 6 — CLIENT ENGAGEMENT OVERVIEW
// ============================================================

const clientOverview = [
  {
    id: 1,
    name: 'Alex Morgan',
    initials: 'AM',
    engagement: 92,
    bestMotivator: 'Short quests',
    motivatorTone: 'purple',
    quests: 94,
    challenges: 89,
    streak: '14 days',
    trend: '+8%',
    trendType: 'up',
    companion: 'All good',
    companionTone: 'purple',
    status: 'Great',
    statusType: 'great',
  },

  {
    id: 2,
    name: 'Jamie Reed',
    initials: 'JR',
    engagement: 84,
    bestMotivator: 'Community',
    motivatorTone: 'blue',
    quests: 88,
    challenges: 81,
    streak: '7 days',
    trend: '+3%',
    trendType: 'up',
    companion: 'Check-in suggested',
    companionTone: 'blue',
    status: 'Good',
    statusType: 'good',
  },

  {
    id: 3,
    name: 'Chris Taylor',
    initials: 'CT',
    engagement: 78,
    bestMotivator: 'Streaks',
    motivatorTone: 'orange',
    quests: 81,
    challenges: 74,
    streak: '4 days',
    trend: '0%',
    trendType: 'flat',
    companion: 'Reminder sent',
    companionTone: 'blue',
    status: 'Stable',
    statusType: 'stable',
  },

  {
    id: 4,
    name: 'Mia Patel',
    initials: 'MP',
    engagement: 73,
    bestMotivator: 'Pet rewards',
    motivatorTone: 'purple',
    quests: 77,
    challenges: 71,
    streak: '6 days',
    trend: '+5%',
    trendType: 'up',
    companion: 'All good',
    companionTone: 'purple',
    status: 'Good',
    statusType: 'good',
  },

  {
    id: 5,
    name: 'Sam Jones',
    initials: 'SJ',
    engagement: 42,
    bestMotivator: 'Encouragement',
    motivatorTone: 'green',
    quests: 39,
    challenges: 46,
    streak: '—',
    trend: '-18%',
    trendType: 'down',
    companion: 'Needs attention',
    companionTone: 'red',
    status: 'Attention',
    statusType: 'attention',
  },
];


// ============================================================
// SECTION 7 — COMPANION IMPACT
// ============================================================

const companionImpact = {
  nudges: 34,
  responses: 21,
  activities: 18,
  reengagement: 61,
  bestFor:
    'Clients beginning to disengage',
};


// ============================================================
// SECTION 8 — ENGAGEMENT PATTERNS
// ============================================================

const engagementDays = [
  { label: 'Saturday', value: 90 },
  { label: 'Tuesday', value: 88 },
  { label: 'Wednesday', value: 81 },
  { label: 'Friday', value: 73 },
  { label: 'Monday', value: 72 },
  { label: 'Thursday', value: 64 },
  { label: 'Sunday', value: 55 },
];

const rewardPatterns = [
  {
    label: 'Pet XP',
    icon: '🐾',
    tone: 'purple',
  },
  {
    label: 'Achievement progress',
    icon: '★',
    tone: 'green',
  },
  {
    label: 'Streak rewards',
    icon: '🔥',
    tone: 'orange',
  },
  {
    label: 'Badges',
    icon: '◆',
    tone: 'blue',
  },
  {
    label: 'Trainer recognition',
    icon: '👤',
    tone: 'purple',
  },
];


// ============================================================
// SECTION 9 — RESPAWN INSIGHTS
// ============================================================

const respawnInsights = [
  {
    id: 1,
    icon: '△',
    tone: 'red',
    title:
      'Sam’s engagement has fallen 18% over the last two weeks.',
    description:
      'Sam responds better to encouragement than streak pressure.',
    primaryAction: 'Send Encouragement',
    secondaryAction: 'View Sam',
  },

  {
    id: 2,
    icon: '👥',
    tone: 'blue',
    title:
      'Community challenges are performing particularly well with Jamie.',
    description:
      'Consider inviting Jamie to the next Train With Me challenge.',
    primaryAction: 'Invite Jamie',
  },

  {
    id: 3,
    icon: '🐾',
    tone: 'purple',
    title:
      'Alex responds strongly to short quests and pet progression.',
    description:
      'Consider assigning another short quest after their next activity.',
    primaryAction: 'Assign Quest',
  },
];


// ============================================================
// SECTION 10 — ON THIS PAGE INDEX
// ============================================================

const engagementSections = [
  {
    id: 'engagement-overview',
    label: 'Overview',
  },
  {
    id: 'engagement-trends',
    label: 'Engagement Trends',
  },
  {
    id: 'motivation-overall',
    label: 'What Works',
  },
  {
    id: 'motivation-profiles',
    label: 'Client Motivation',
  },
  {
    id: 'client-overview',
    label: 'Client Overview',
  },
  {
    id: 'companion-impact',
    label: 'Companion Impact',
  },
  {
    id: 'engagement-patterns',
    label: 'Engagement Patterns',
  },
  {
    id: 'respawn-insights',
    label: 'Respawn Insights',
  },
];

const activeSection = ref(
  'engagement-overview'
);

let observer = null;


// ============================================================
// SECTION 11 — ACTIONS
// ============================================================

function scrollToSection(sectionId) {
  const section =
    document.getElementById(sectionId);

  if (!section) {
    return;
  }

  section.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

function selectMotivationClient(clientId) {
  selectedMotivationClientId.value =
    clientId;
}

function demoAction(message) {
  window.alert(
    `Demo: ${message}`
  );
}


// ============================================================
// SECTION 12 — INTERSECTION OBSERVER
// ============================================================

onMounted(async () => {
  await nextTick();

  const sectionElements =
    engagementSections
      .map((section) =>
        document.getElementById(
          section.id
        )
      )
      .filter(Boolean);

  observer =
    new IntersectionObserver(
      (entries) => {
        const visibleEntries =
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

        if (
          visibleEntries.length
        ) {
          activeSection.value =
            visibleEntries[0].target.id;
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

  sectionElements.forEach(
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
         MAIN TRAINER SIDEBAR
         ====================================================== -->

    <TrainerSidebar />


    <!-- ======================================================
         ENGAGEMENT PAGE
         ====================================================== -->

    <main class="trainer-engagement-page">

      <!-- ====================================================
           PAGE HEADER
           ==================================================== -->

      <header class="trainer-engagement-header">

        <div>

          <span class="trainer-engagement-eyebrow">
            TRAINER HUB
          </span>

          <h1>
            Engagement
          </h1>

          <p>
            Understand what motivates your clients and where
            support may be needed.
          </p>

        </div>


        <div class="trainer-engagement-header-actions">

          <select v-model="selectedPeriod">
            <option value="month">
              This Month
            </option>

            <option value="week">
              This Week
            </option>

            <option value="quarter">
              Last 3 Months
            </option>
          </select>


          <select v-model="selectedClientFilter">
            <option value="all">
              All Clients
            </option>

            <option value="engaged">
              Engaged Clients
            </option>

            <option value="attention">
              Needs Attention
            </option>
          </select>


          <button
            type="button"
            @click="
              demoAction(
                'Export engagement report'
              )
            "
          >
            ↓ Export Report
          </button>

        </div>

      </header>


      <!-- ====================================================
           PAGE CONTENT + STICKY INDEX
           ==================================================== -->

      <div class="trainer-engagement-layout">

        <!-- ==================================================
             MAIN CONTENT
             ================================================== -->

        <div class="trainer-engagement-content">

          <!-- ================================================
               SECTION 1 — OVERVIEW
               ================================================ -->

          <section
            id="engagement-overview"
            class="trainer-engagement-section trainer-engagement-overview"
          >

            <div class="trainer-engagement-kpi-strip">

              <article
                v-for="metric in engagementMetrics"
                :key="metric.id"
                class="trainer-engagement-kpi"
                :class="
                  `trainer-engagement-tone-${metric.tone}`
                "
              >

                <div class="trainer-engagement-kpi-icon">
                  {{ metric.icon }}
                </div>


                <div>

                  <strong>
                    {{ metric.value }}
                  </strong>

                  <span>
                    {{ metric.label }}
                  </span>

                  <small>
                    ↑ {{ metric.change }}
                    <em>
                      vs last month
                    </em>
                  </small>

                </div>

              </article>

            </div>

          </section>


          <!-- ================================================
               SECTION 2 — ENGAGEMENT TRENDS
               ================================================ -->

          <section
            id="engagement-trends"
            class="trainer-engagement-section"
          >

            <div class="trainer-engagement-two-column">

              <!-- Engagement Over Time -->

              <article class="trainer-engagement-panel">

                <header class="trainer-engagement-panel-header">

                  <div>
                    <span class="trainer-engagement-section-label">
                      TRENDS
                    </span>

                    <h2>
                      Engagement Over Time
                    </h2>
                  </div>


                  <select>
                    <option>
                      Engagement Score
                    </option>
                  </select>

                </header>


                <div class="trainer-engagement-chart">

                  <div class="trainer-chart-y-axis">

                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>

                  </div>


                  <div class="trainer-chart-plot">

                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      aria-label="Engagement over time chart"
                    >

                      <defs>
                        <linearGradient
                          id="engagementArea"
                          x1="0"
                          x2="0"
                          y1="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stop-color="#9e5cff"
                            stop-opacity="0.30"
                          />

                          <stop
                            offset="100%"
                            stop-color="#9e5cff"
                            stop-opacity="0"
                          />
                        </linearGradient>
                      </defs>


                      <polygon
                        :points="
                          `0,100 ${timelinePolyline} 100,100`
                        "
                        fill="url(#engagementArea)"
                      />


                      <polyline
                        :points="timelinePolyline"
                        fill="none"
                        stroke="#9e5cff"
                        stroke-width="1.25"
                        vector-effect="non-scaling-stroke"
                      />


                      <circle
                        v-for="point in timelinePoints"
                        :key="
                          `${point.label}-${point.value}`
                        "
                        :cx="point.x"
                        :cy="point.y"
                        r="1.1"
                        fill="#b878ff"
                      />

                    </svg>


                    <div class="trainer-chart-x-axis">
                      <span>May</span>
                      <span>Jun</span>
                      <span>Jul</span>
                      <span>Aug</span>
                    </div>

                  </div>

                </div>


                <div class="trainer-timeline-events">

                  <div
                    v-for="event in timelineEvents"
                    :key="event.date"
                  >

                    <span
                      :class="
                        `trainer-event-${event.tone}`
                      "
                    />

                    <div>

                      <strong>
                        {{ event.date }}
                      </strong>

                      <small>
                        {{ event.label }}
                      </small>

                    </div>

                  </div>

                </div>

              </article>


              <!-- What Works Overall -->

              <article
                id="motivation-overall"
                class="trainer-engagement-panel"
              >

                <header class="trainer-engagement-panel-header">

                  <div>
                    <span class="trainer-engagement-section-label">
                      GROUP INSIGHTS
                    </span>

                    <h2>
                      What Works Across Your Clients
                    </h2>
                  </div>

                </header>


                <div class="trainer-group-motivator-list">

                  <div
                    v-for="motivator in groupMotivators"
                    :key="motivator.label"
                    class="trainer-group-motivator"
                    :class="
                      `trainer-engagement-tone-${motivator.tone}`
                    "
                  >

                    <span class="trainer-group-motivator-icon">
                      {{ motivator.icon }}
                    </span>


                    <strong>
                      {{ motivator.label }}
                    </strong>


                    <div class="trainer-group-motivator-bar">

                      <span
                        :style="{
                          width:
                            `${motivator.value}%`,
                        }"
                      />

                    </div>


                    <b>
                      {{ motivator.value }}%
                    </b>

                  </div>

                </div>


                <p class="trainer-engagement-data-note">
                  Based on completion rate and engagement lift.
                </p>

              </article>

            </div>

          </section>


          <!-- ================================================
               SECTION 3 — CLIENT MOTIVATION PROFILES
               ================================================ -->

          <section
            id="motivation-profiles"
            class="trainer-engagement-section trainer-motivation-section"
          >

            <header class="trainer-engagement-section-header">

              <div>

                <span class="trainer-engagement-section-label">
                  PERSONALISATION
                </span>

                <h2>
                  Client Motivation Profiles
                </h2>

                <p>
                  See what each client responds to best.
                </p>

              </div>

            </header>


            <!-- Client selector -->

            <div class="trainer-motivation-client-selector">

              <button
                v-for="client in motivationClients"
                :key="client.id"
                type="button"
                :class="{
                  active:
                    selectedMotivationClientId ===
                    client.id,
                }"
                @click="
                  selectMotivationClient(
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

              </button>

            </div>


            <!-- Selected client profile -->

            <div class="trainer-motivation-profile-grid">

              <!-- Motivation scores -->

              <article class="trainer-engagement-panel trainer-client-motivation-card">

                <div class="trainer-client-motivation-heading">

                  <div>

                    <h3>
                      {{ selectedMotivationClient.name }}
                    </h3>

                    <span>
                      Overall Engagement
                    </span>

                  </div>


                  <div class="trainer-engagement-score-ring">

                    <strong>
                      {{
                        selectedMotivationClient.engagement
                      }}%
                    </strong>

                  </div>

                </div>


                <span class="trainer-motivation-positive-label">
                  RESPONDS BEST TO
                </span>


                <div class="trainer-client-motivator-bars">

                  <div
                    v-for="
                      motivator in
                      selectedMotivationClient.motivators
                    "
                    :key="motivator.label"
                    :class="
                      `trainer-engagement-tone-${motivator.tone}`
                    "
                  >

                    <span>
                      {{ motivator.label }}
                    </span>


                    <div>

                      <i
                        :style="{
                          width:
                            `${motivator.value}%`,
                        }"
                      />

                    </div>


                    <strong>
                      {{ motivator.value }}%
                    </strong>

                  </div>

                </div>


                <span class="trainer-motivation-negative-label">
                  LESS EFFECTIVE
                </span>


                <div class="trainer-client-less-effective">

                  <div
                    v-for="
                      motivator in
                      selectedMotivationClient.lessEffective
                    "
                    :key="motivator.label"
                  >

                    <span>
                      {{ motivator.label }}
                    </span>

                    <div>
                      <i
                        :style="{
                          width:
                            `${motivator.value}%`,
                        }"
                      />
                    </div>

                    <strong>
                      {{ motivator.value }}%
                    </strong>

                  </div>

                </div>

              </article>


              <!-- Motivation profile -->

              <article class="trainer-engagement-panel trainer-client-profile-card">

                <h3>
                  {{ selectedMotivationClient.name }}'s Motivation Profile
                </h3>


                <div class="trainer-best-approach">

                  <span>
                    ★
                  </span>

                  <div>

                    <small>
                      BEST APPROACH
                    </small>

                    <strong>
                      {{
                        selectedMotivationClient.bestApproach
                      }}
                    </strong>

                  </div>

                </div>


                <div class="trainer-profile-response-grid">

                  <div>

                    <span class="trainer-motivation-positive-label">
                      RESPONDS WELL TO
                    </span>

                    <ul class="positive">

                      <li
                        v-for="
                          item in
                          selectedMotivationClient.respondsWellTo
                        "
                        :key="item"
                      >
                        {{ item }}
                      </li>

                    </ul>

                  </div>


                  <div>

                    <span class="trainer-motivation-negative-label">
                      LESS RESPONSIVE TO
                    </span>

                    <ul class="negative">

                      <li
                        v-for="
                          item in
                          selectedMotivationClient.lessResponsiveTo
                        "
                        :key="item"
                      >
                        {{ item }}
                      </li>

                    </ul>

                  </div>

                </div>


                <div class="trainer-next-action">

                  <span>
                    🐾
                  </span>

                  <div>

                    <small>
                      SUGGESTED NEXT ACTION
                    </small>

                    <strong>
                      {{
                        selectedMotivationClient.suggestedAction
                      }}
                    </strong>

                  </div>


                  <button
                    type="button"
                    @click="
                      demoAction(
                        `Assign quest for ${selectedMotivationClient.name}`
                      )
                    "
                  >
                    Assign Quest
                  </button>

                </div>

              </article>

            </div>

          </section>


          <!-- ================================================
               SECTION 4 — CLIENT ENGAGEMENT OVERVIEW
               ================================================ -->

          <section
            id="client-overview"
            class="trainer-engagement-section"
          >

            <article class="trainer-engagement-panel">

              <header class="trainer-engagement-panel-header">

                <div>
                  <span class="trainer-engagement-section-label">
                    CLIENTS
                  </span>

                  <h2>
                    Client Engagement Overview
                  </h2>
                </div>

              </header>


              <div class="trainer-engagement-client-table-wrapper">

                <div class="trainer-engagement-client-table">

                  <div class="trainer-engagement-client-head">

                    <span>
                      Client
                    </span>

                    <span>
                      Engagement
                    </span>

                    <span>
                      Best Motivator
                    </span>

                    <span>
                      Quests
                    </span>

                    <span>
                      Challenges
                    </span>

                    <span>
                      Streak
                    </span>

                    <span>
                      Trend
                    </span>

                    <span>
                      Companion Impact
                    </span>

                    <span>
                      Status
                    </span>

                  </div>


                  <div
                    v-for="client in clientOverview"
                    :key="client.id"
                    class="trainer-engagement-client-row"
                  >

                    <div class="trainer-engagement-client-person">

                      <span>
                        {{ client.initials }}
                      </span>

                      <strong>
                        {{ client.name }}
                      </strong>

                    </div>


                    <div class="trainer-engagement-table-score">

                      <strong>
                        {{ client.engagement }}%
                      </strong>

                      <div>

                        <span
                          :style="{
                            width:
                              `${client.engagement}%`,
                          }"
                        />

                      </div>

                    </div>


                    <div class="trainer-engagement-best-motivator">

                      <span
                        :class="
                          `trainer-mini-${client.motivatorTone}`
                        "
                      />

                      {{ client.bestMotivator }}

                    </div>


                    <span>
                      {{ client.quests }}%
                    </span>


                    <span>
                      {{ client.challenges }}%
                    </span>


                    <span>
                      {{ client.streak }}
                    </span>


                    <strong
                      class="trainer-engagement-trend"
                      :class="
                        `trend-${client.trendType}`
                      "
                    >
                      {{
                        client.trendType === 'up'
                          ? '↑'
                          : client.trendType === 'down'
                            ? '↓'
                            : '→'
                      }}

                      {{ client.trend }}
                    </strong>


                    <div class="trainer-engagement-companion-cell">

                      <span
                        :class="
                          `trainer-mini-${client.companionTone}`
                        "
                      />

                      {{ client.companion }}

                    </div>


                    <span
                      class="trainer-engagement-status-badge"
                      :class="
                        `status-${client.statusType}`
                      "
                    >
                      {{ client.status }}
                    </span>

                  </div>

                </div>

              </div>


              <RouterLink
                to="/trainer/clients"
                class="trainer-engagement-view-all"
              >
                View all clients →
              </RouterLink>

            </article>

          </section>


          <!-- ================================================
               SECTION 5 — COMPANION + PATTERNS + INSIGHTS
               ================================================ -->

          <section
            class="trainer-engagement-section"
          >

            <div class="trainer-engagement-bottom-grid">

              <!-- Companion Impact -->

              <article
                id="companion-impact"
                class="trainer-engagement-panel trainer-companion-impact-card"
              >

                <header class="trainer-engagement-panel-header">

                  <div>
                    <span class="trainer-engagement-section-label">
                      AI COMPANION
                    </span>

                    <h2>
                      Companion Impact
                    </h2>
                  </div>

                </header>


                <div class="trainer-companion-impact-main">

                  <div class="trainer-companion-large-icon">
                    🐾
                  </div>


                  <div>

                    <strong>
                      {{ companionImpact.nudges }}
                    </strong>

                    <span>
                      Nudges sent
                    </span>

                  </div>

                </div>


                <div class="trainer-companion-impact-stat">

                  <strong>
                    {{ companionImpact.responses }}
                  </strong>

                  <span>
                    Clients responded
                  </span>

                </div>


                <div class="trainer-companion-impact-stat">

                  <strong>
                    {{ companionImpact.activities }}
                  </strong>

                  <span>
                    Completed activity within 24h
                  </span>

                </div>


                <div class="trainer-companion-reengagement">

                  <strong>
                    {{ companionImpact.reengagement }}%
                  </strong>

                  <span>
                    Re-engagement rate
                  </span>

                </div>


                <div class="trainer-companion-most-effective">

                  <span>
                    Most effective for:
                  </span>

                  <strong>
                    {{ companionImpact.bestFor }}
                  </strong>

                </div>

              </article>


              <!-- Engagement Patterns -->

              <article
                id="engagement-patterns"
                class="trainer-engagement-panel trainer-patterns-card"
              >

                <header class="trainer-engagement-panel-header">

                  <div>
                    <span class="trainer-engagement-section-label">
                      PATTERNS
                    </span>

                    <h2>
                      Engagement Patterns
                    </h2>
                  </div>

                </header>


                <div class="trainer-patterns-grid">

                  <div>

                    <span class="trainer-motivation-positive-label">
                      BEST DAYS
                    </span>


                    <div class="trainer-best-day-list">

                      <div
                        v-for="day in engagementDays"
                        :key="day.label"
                      >

                        <span>
                          {{ day.label }}
                        </span>

                        <div>
                          <i
                            :style="{
                              width:
                                `${day.value}%`,
                            }"
                          />
                        </div>

                        <strong>
                          {{ day.value }}%
                        </strong>

                      </div>

                    </div>

                  </div>


                  <div>

                    <span class="trainer-pattern-purple-label">
                      BEST REWARDS
                    </span>


                    <div class="trainer-reward-pattern-list">

                      <div
                        v-for="reward in rewardPatterns"
                        :key="reward.label"
                        :class="
                          `trainer-engagement-tone-${reward.tone}`
                        "
                      >

                        <span>
                          {{ reward.icon }}
                        </span>

                        <strong>
                          {{ reward.label }}
                        </strong>

                      </div>

                    </div>

                  </div>

                </div>

              </article>


              <!-- Respawn Insights -->

              <article
                id="respawn-insights"
                class="trainer-engagement-panel trainer-respawn-insights"
              >

                <header class="trainer-engagement-panel-header">

                  <div>
                    <span class="trainer-engagement-section-label">
                      ACTIONABLE
                    </span>

                    <h2>
                      Respawn Insights
                    </h2>
                  </div>

                </header>


                <div class="trainer-respawn-insight-list">

                  <article
                    v-for="insight in respawnInsights"
                    :key="insight.id"
                    :class="
                      `trainer-engagement-tone-${insight.tone}`
                    "
                  >

                    <span class="trainer-respawn-insight-icon">
                      {{ insight.icon }}
                    </span>


                    <div>

                      <strong>
                        {{ insight.title }}
                      </strong>

                      <p>
                        {{ insight.description }}
                      </p>


                      <div>

                        <button
                          v-if="insight.secondaryAction"
                          type="button"
                          class="secondary"
                          @click="
                            demoAction(
                              insight.secondaryAction
                            )
                          "
                        >
                          {{ insight.secondaryAction }}
                        </button>


                        <button
                          type="button"
                          @click="
                            demoAction(
                              insight.primaryAction
                            )
                          "
                        >
                          {{ insight.primaryAction }}
                        </button>

                      </div>

                    </div>

                  </article>

                </div>

              </article>

            </div>

          </section>


          <!-- ================================================
               PAGE FOOTER
               ================================================ -->

          <footer class="trainer-engagement-footer">

            <p>
              Insights are based on client activity,
              challenge participation and approved companion
              engagement signals.
            </p>

            <button
              type="button"
              @click="
                demoAction(
                  'Learn more about Engagement'
                )
              "
            >
              Learn more about Engagement →
            </button>

          </footer>

        </div>


        <!-- ==================================================
             STICKY PAGE INDEX
             ================================================== -->

        <aside class="trainer-engagement-index">

          <span class="trainer-engagement-index-title">
            ON THIS PAGE
          </span>


          <nav>

            <button
              v-for="section in engagementSections"
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


          <div class="trainer-engagement-index-help">

            <span>
              🐾
            </span>

            <p>
              Engagement helps you understand how to motivate
              each client differently.
            </p>

          </div>

        </aside>

      </div>

    </main>

  </div>
</template>