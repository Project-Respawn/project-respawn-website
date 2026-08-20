<template>
  <section class="therapist-activity-timeline">
    <div
      v-for="group in groupedActivity"
      :key="group.date"
      class="therapist-activity-day"
    >
      <header class="therapist-activity-day__header">
        <div>
          <span>{{ group.dayLabel }}</span>
          <strong>{{ group.dateLabel }}</strong>
        </div>

        <small>
          {{ group.items.length }}
          {{ group.items.length === 1 ? "activity" : "activities" }}
        </small>
      </header>

      <div class="therapist-activity-day__items">
        <article
          v-for="activity in group.items"
          :key="activity.id"
          class="therapist-activity-item"
          :class="[
            `therapist-activity-item--${activity.type}`,
            {
              'therapist-activity-item--locked':
                activity.locked,
            },
          ]"
        >
          <div
            class="therapist-activity-item__icon"
            :class="`therapist-activity-item__icon--${activity.tone}`"
          >
            {{ activity.icon }}
          </div>

          <div class="therapist-activity-item__content">
            <div class="therapist-activity-item__heading">
              <div>
                <span class="therapist-activity-item__type">
                  {{ activity.typeLabel }}
                </span>

                <strong>
                  {{ activity.title }}
                </strong>
              </div>

              <time>
                {{ activity.time }}
              </time>
            </div>

            <p
              v-if="activity.detail"
              class="therapist-activity-item__detail"
            >
              {{ activity.detail }}
            </p>

            <!-- QUEST -->
            <div
              v-if="activity.quest"
              class="therapist-activity-item__quest"
            >
              <span>Quest</span>

              <strong>
                {{ activity.quest }}
              </strong>
            </div>

            <!-- CONFIDENCE -->
            <div
              v-if="
                activity.confidenceBefore !== undefined ||
                activity.confidenceAfter !== undefined
              "
              class="therapist-activity-confidence"
            >
              <div>
                <span>Before</span>

                <strong>
                  {{
                    activity.confidenceBefore ??
                    "—"
                  }}
                </strong>
              </div>

              <span class="therapist-activity-confidence__arrow">
                →
              </span>

              <div>
                <span>After</span>

                <strong>
                  {{
                    activity.confidenceAfter ??
                    "—"
                  }}
                </strong>
              </div>
            </div>

            <!-- REFLECTION -->
            <blockquote
              v-if="activity.reflection"
              class="therapist-activity-reflection"
            >
              “{{ activity.reflection }}”
            </blockquote>

            <!-- POINTS -->
            <div
              v-if="activity.points"
              class="therapist-activity-points"
            >
              +{{ activity.points }} Respawn Points
            </div>

            <!-- DISCUSSION POINT -->
            <div
              v-if="activity.discussionPoint"
              class="therapist-activity-discussion"
            >
              <span>Client wants to discuss</span>

              <strong>
                “{{ activity.discussionPoint }}”
              </strong>
            </div>

            <!-- LOCKED / PERMISSION -->
            <div
              v-if="activity.locked"
              class="therapist-activity-locked"
            >
              <div>
                <strong>
                  This activity is not currently shared
                </strong>

                <p>
                  The client controls whether this category is
                  visible to their therapist.
                </p>
              </div>

              <button
                type="button"
                @click="
                  $emit(
                    'request-access',
                    activity.permission
                  )
                "
              >
                Request access →
              </button>
            </div>

            <footer
              v-if="activity.source || activity.status"
              class="therapist-activity-item__footer"
            >
              <span v-if="activity.source">
                {{ activity.source }}
              </span>

              <span
                v-if="activity.status"
                :class="`therapist-activity-status therapist-activity-status--${activity.statusTone ?? 'neutral'}`"
              >
                {{ activity.status }}
              </span>
            </footer>
          </div>
        </article>
      </div>
    </div>

    <div
      v-if="groupedActivity.length === 0"
      class="therapist-activity-empty"
    >
      <strong>No activity found</strong>

      <p>
        Try changing the activity filters or date range.
      </p>
    </div>
  </section>
</template>

<script setup>
defineProps({
  groupedActivity: {
    type: Array,
    required: true,
  },
});

defineEmits([
  "request-access",
]);
</script>