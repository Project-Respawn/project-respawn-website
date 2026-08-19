<template>
  <aside
    class="builder-panel recent-panel"
    aria-label="Recent activity"
  >
    <!-- ======================================================
         SECTION 07A
         HEADER
         ====================================================== -->

    <header class="recent-header">
      <div>
        <strong>
          ◉ Recent Activity
        </strong>

        <small>
          Live events across your creator ecosystem
        </small>
      </div>

      <span class="recent-demo-badge">
        Demo Feed
      </span>
    </header>


    <!-- ======================================================
         SECTION 07B
         EVENT FILTERS
         ====================================================== -->

    <div
      class="recent-filters"
      aria-label="Recent activity filters"
    >
      <button
        v-for="item in filters"
        :key="item.id"
        type="button"
        :class="{
          active: activeFilter === item.id
        }"
        @click="activeFilter = item.id"
      >
        {{ item.label }}
      </button>
    </div>


    <!-- ======================================================
         SECTION 07C
         EVENT FEED
         ====================================================== -->

    <div
      v-if="filteredActivities.length"
      class="activity-items"
    >
      <article
        v-for="item in filteredActivities"
        :key="item.id"
        class="activity-row"
        :class="`activity-row--${eventDefinition(item).family}`"
      >
        <!-- ==================================================
             SECTION 07D
             EVENT ICON
             ================================================== -->

        <span
          class="activity-icon"
          :title="eventDefinition(item).label"
          aria-hidden="true"
        >
          {{ eventDefinition(item).icon }}
        </span>


        <!-- ==================================================
             SECTION 07E
             EVENT CONTENT
             ================================================== -->

        <div class="activity-copy">
          <div class="activity-title-row">
            <b>
              {{ eventDefinition(item).label }}
            </b>

            <span
              class="activity-platform"
              :class="`activity-platform--${item.platform}`"
            >
              {{ platformLabel(item.platform) }}
            </span>
          </div>

          <strong>
            {{ activityDescription(item) }}
          </strong>

          <small>
            {{ item.createdAtLabel }}
          </small>
        </div>


        <!-- ==================================================
             SECTION 07F
             REPLAY ACTION
             ================================================== -->

        <button
          type="button"
          class="activity-replay"
          :aria-label="`Replay ${item.summary}`"
          @click="$emit('replay', item)"
        >
          <span aria-hidden="true">
            ▶
          </span>

          Replay
        </button>
      </article>
    </div>


    <!-- ======================================================
         SECTION 07G
         EMPTY STATE
         ====================================================== -->

    <div
      v-else
      class="recent-empty"
    >
      <span>
        ◇
      </span>

      <strong>
        No activity in this category
      </strong>

      <small>
        Try another filter.
      </small>

      <button
        type="button"
        @click="activeFilter = 'all'"
      >
        Show all activity
      </button>
    </div>
  </aside>
</template>


<script setup>
import {
  computed,
  ref,
} from 'vue'


// ============================================================
// SECTION 07
// PROPS
// ============================================================

const props = defineProps({
  activities: {
    type: Array,
    default: () => [],
  },
})


// ============================================================
// SECTION 07
// EVENTS
// ============================================================

defineEmits([
  'replay',
])


// ============================================================
// SECTION 07B
// FILTER STATE
// ============================================================

const activeFilter =
  ref('all')


// ============================================================
// SECTION 07D
// EVENT DEFINITIONS
//
// This maps WHAT happened.
//
// Platform is handled separately.
// ============================================================

const eventDefinitions = {
  'stream.follow': {
    label: 'New Follower',
    icon: '♥',
    family: 'community',
    filter: 'community',
  },

  'stream.subscription': {
    label: 'New Subscriber',
    icon: '★',
    family: 'support',
    filter: 'support',
  },

  'stream.raid': {
    label: 'Incoming Raid',
    icon: '⚡',
    family: 'alert',
    filter: 'alerts',
  },

  'achievement.unlocked': {
    label: 'Achievement Unlocked',
    icon: '🏆',
    family: 'achievement',
    filter: 'community',
  },

  'community.event.upcoming': {
    label: 'Event Activity',
    icon: '▣',
    family: 'event',
    filter: 'community',
  },

  'discord.member.joined': {
    label: 'Community Member Joined',
    icon: '＋',
    family: 'community',
    filter: 'community',
  },

  'supporter.tier.changed': {
    label: 'Supporter Update',
    icon: '◆',
    family: 'support',
    filter: 'support',
  },

  'tts.requested': {
    label: 'Text to Speech',
    icon: '◖',
    family: 'tts',
    filter: 'alerts',
  },
}


// ============================================================
// SECTION 07D
// FALLBACK EVENT
// ============================================================

const fallbackEvent = {
  label: 'Activity',
  icon: '•',
  family: 'default',
  filter: 'all',
}


// ============================================================
// SECTION 07B
// FILTER OPTIONS
// ============================================================

const filters = [
  {
    id: 'all',
    label: 'All',
  },

  {
    id: 'alerts',
    label: 'Alerts',
  },

  {
    id: 'community',
    label: 'Community',
  },

  {
    id: 'support',
    label: 'Support',
  },
]


// ============================================================
// SECTION 07B
// FILTERED FEED
// ============================================================

const filteredActivities =
  computed(() => {
    if (
      activeFilter.value === 'all'
    ) {
      return props.activities
    }

    return props.activities.filter(
      item =>
        eventDefinition(item).filter ===
        activeFilter.value,
    )
  })


// ============================================================
// SECTION 07D
// EVENT RESOLVER
// ============================================================

function eventDefinition(item) {
  return (
    eventDefinitions[item.type] ||
    fallbackEvent
  )
}


// ============================================================
// SECTION 07E
// PLATFORM LABEL
// ============================================================

function platformLabel(platform) {
  const labels = {
    twitch: 'Twitch',
    discord: 'Discord',
    respawn: 'Respawn',
    youtube: 'YouTube',
    kick: 'Kick',
  }

  return (
    labels[platform] ||
    platform ||
    'External'
  )
}


// ============================================================
// SECTION 07E
// ACTIVITY DESCRIPTION
// ============================================================

function activityDescription(item) {
  /*
   * Existing demo data already gives us:
   *
   * actor
   * summary
   *
   * Keep this deliberately straightforward for now so
   * backend event payloads can replace it later.
   */

  if (!item.actor) {
    return item.summary
  }

  if (
    item.type === 'stream.follow'
  ) {
    return `${item.actor} followed your channel`
  }

  if (
    item.type ===
    'stream.subscription'
  ) {
    return `${item.actor} subscribed · ${
      item.summary
        .replace('New subscriber · ', '')
    }`
  }

  if (
    item.type === 'stream.raid'
  ) {
    return `${item.actor} raided your channel · ${
      item.summary
        .replace('Twitch raid · ', '')
    }`
  }

  if (
    item.type ===
    'achievement.unlocked'
  ) {
    return `${item.actor} unlocked ${
      item.summary
        .replace(
          'Achievement earned · ',
          '',
        )
    }`
  }

  if (
    item.type ===
    'community.event.upcoming'
  ) {
    return `${item.actor} ${
      item.summary
        .replace(
          'Event RSVP · ',
          'joined ',
        )
    }`
  }

  if (
    item.type ===
    'discord.member.joined'
  ) {
    return `${item.actor} joined your Discord community`
  }

  if (
    item.type ===
    'supporter.tier.changed'
  ) {
    return `${item.actor} changed supporter tier`
  }

  if (
    item.type ===
    'tts.requested'
  ) {
    return `${item.actor} requested Text to Speech`
  }

  return `${item.actor} · ${item.summary}`
}
</script>


<style scoped>
/* ============================================================
   PROJECT RESPAWN
   SECTION 07 — RECENT ACTIVITY

   07A Header
   07B Filters
   07C Feed
   07D Event Icon
   07E Event / Platform Information
   07F Replay
   07G Empty State
   ============================================================ */


/* ============================================================
   ROOT
   ============================================================ */

.recent-panel {
  display: flex;

  width: 100%;
  height: 100%;

  min-width: 0;
  min-height: 0;

  flex-direction: column;

  overflow: hidden;

  background:
    #081727;
}


/* ============================================================
   07A
   HEADER
   ============================================================ */

.recent-header {
  display: flex;

  flex: 0 0 auto;

  min-height: 54px;

  align-items: center;
  justify-content: space-between;

  gap: 8px;

  padding:
    7px 9px;

  border-bottom:
    1px solid
    rgba(148, 163, 184, 0.09);
}

.recent-header > div {
  min-width: 0;
}

.recent-header strong {
  display: block;

  color:
    #eef2f8;

  font-size: 10px;
}

.recent-header small {
  display: block;

  margin-top: 3px;

  color:
    #66798f;

  font-size: 7px;

  line-height: 1.3;
}

.recent-demo-badge {
  flex: 0 0 auto;

  padding:
    3px 5px;

  border:
    1px solid
    rgba(139, 92, 246, 0.28);

  border-radius: 999px;

  background:
    rgba(91, 33, 182, 0.12);

  color:
    #b8a4ff;

  font-size: 6px;

  font-weight: 800;

  text-transform: uppercase;
}


/* ============================================================
   07B
   FILTERS
   ============================================================ */

.recent-filters {
  display: grid;

  flex: 0 0 auto;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 4px;

  padding:
    6px;

  border-bottom:
    1px solid
    rgba(148, 163, 184, 0.07);
}

.recent-filters button {
  min-width: 0;

  min-height: 26px;

  padding:
    3px;

  border:
    1px solid
    rgba(148, 163, 184, 0.09);

  border-radius: 5px;

  background:
    rgba(9, 23, 37, 0.72);

  color:
    #718399;

  font-size: 7px;

  font-weight: 700;

  cursor: pointer;
}

.recent-filters button:hover {
  border-color:
    rgba(139, 92, 246, 0.28);

  color:
    #c4b5fd;
}

.recent-filters button.active {
  border-color:
    rgba(139, 92, 246, 0.55);

  background:
    rgba(91, 33, 182, 0.12);

  color:
    #ddd6fe;
}


/* ============================================================
   07C
   FEED
   ============================================================ */

.activity-items {
  flex: 1 1 0;

  min-height: 0;

  padding:
    5px;

  overflow-x: hidden;
  overflow-y: auto;
}


/* ============================================================
   07C
   EVENT ROW
   ============================================================ */

.activity-row {
  position: relative;

  display: grid;

  grid-template-columns:
    30px
    minmax(0, 1fr);

  gap:
    7px;

  min-height:
    84px;

  margin-bottom:
    5px;

  padding:
    8px;

  border:
    1px solid
    rgba(148, 163, 184, 0.08);

  border-radius:
    7px;

  background:
    rgba(7, 18, 31, 0.62);
}

.activity-row:hover {
  border-color:
    rgba(139, 92, 246, 0.22);

  background:
    rgba(11, 25, 42, 0.8);
}


/* ============================================================
   07D
   EVENT ICON
   ============================================================ */

.activity-icon {
  display: grid;

  width: 30px;
  height: 30px;

  place-items: center;

  border-radius:
    7px;

  background:
    rgba(139, 92, 246, 0.12);

  color:
    #c4b5fd;

  font-size:
    13px;
}


/* ============================================================
   EVENT FAMILY ACCENTS
   ============================================================ */

.activity-row--support
  .activity-icon {
  background:
    rgba(34, 197, 94, 0.1);

  color:
    #86efac;
}

.activity-row--achievement
  .activity-icon {
  background:
    rgba(234, 179, 8, 0.1);

  color:
    #fde68a;
}

.activity-row--event
  .activity-icon {
  background:
    rgba(59, 130, 246, 0.1);

  color:
    #93c5fd;
}

.activity-row--tts
  .activity-icon {
  background:
    rgba(34, 211, 238, 0.1);

  color:
    #67e8f9;
}

.activity-row--alert
  .activity-icon {
  background:
    rgba(168, 85, 247, 0.12);

  color:
    #d8b4fe;
}


/* ============================================================
   07E
   EVENT COPY
   ============================================================ */

.activity-copy {
  min-width: 0;

  padding-right:
    3px;
}

.activity-title-row {
  display: flex;

  min-width: 0;

  align-items: center;
  justify-content: space-between;

  gap:
    5px;
}

.activity-title-row b {
  min-width: 0;

  overflow: hidden;

  color:
    #e5edf7;

  font-size:
    8px;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.activity-copy > strong {
  display: block;

  margin-top:
    5px;

  color:
    #98a8ba;

  font-size:
    8px;

  font-weight:
    500;

  line-height:
    1.35;
}

.activity-copy > small {
  display: block;

  margin-top:
    6px;

  color:
    #5f7288;

  font-size:
    7px;
}


/* ============================================================
   07E
   PLATFORM BADGES
   ============================================================ */

.activity-platform {
  flex: 0 0 auto;

  padding:
    2px 4px;

  border-radius:
    999px;

  background:
    rgba(148, 163, 184, 0.08);

  color:
    #75879b;

  font-size:
    6px;

  font-weight:
    800;
}

.activity-platform--twitch {
  background:
    rgba(145, 70, 255, 0.11);

  color:
    #c4b5fd;
}

.activity-platform--discord {
  background:
    rgba(88, 101, 242, 0.12);

  color:
    #a5b4fc;
}

.activity-platform--respawn {
  background:
    rgba(139, 92, 246, 0.1);

  color:
    #d8b4fe;
}


/* ============================================================
   07F
   REPLAY
   ============================================================ */

.activity-replay {
  position: absolute;

  right:
    7px;

  bottom:
    7px;

  display: flex;

  min-height:
    24px;

  align-items: center;

  gap:
    3px;

  padding:
    3px 6px;

  border:
    1px solid
    rgba(139, 92, 246, 0.2);

  border-radius:
    5px;

  background:
    rgba(91, 33, 182, 0.08);

  color:
    #aa98d5;

  font-size:
    6px;

  cursor: pointer;
}

.activity-replay:hover {
  border-color:
    rgba(139, 92, 246, 0.5);

  color:
    #ddd6fe;
}


/* ============================================================
   07G
   EMPTY STATE
   ============================================================ */

.recent-empty {
  display: grid;

  flex: 1 1 auto;

  place-content: center;
  justify-items: center;

  gap:
    5px;

  padding:
    20px;

  color:
    #718399;

  text-align: center;
}

.recent-empty > span {
  color:
    #a78bfa;

  font-size:
    18px;
}

.recent-empty strong {
  color:
    #cbd5e1;

  font-size:
    9px;
}

.recent-empty small {
  font-size:
    7px;
}

.recent-empty button {
  margin-top:
    3px;

  padding:
    0;

  border:
    0;

  background:
    transparent;

  color:
    #a78bfa;

  font-size:
    7px;

  cursor: pointer;
}
</style>