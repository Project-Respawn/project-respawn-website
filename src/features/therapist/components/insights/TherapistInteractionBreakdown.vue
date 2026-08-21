<template>
  <section class="therapist-insights-card therapist-quest-type-insights">
    <header class="therapist-insights-card__header">
      <div>
        <span>QUEST TYPE INSIGHTS</span>

        <h3>
          How this client engages with quests
        </h3>
      </div>

      <div class="therapist-quest-type-insights__selectors">
        <select
          :value="selectedView"
          @change="$emit('update:selectedView', $event.target.value)"
        >
          <option
            v-for="view in data.views"
            :key="view.id"
            :value="view.id"
          >
            {{ view.label }}
          </option>
        </select>

        <select
          :value="selectedPeriod"
          @change="$emit('update:selectedPeriod', $event.target.value)"
        >
          <option
            v-for="period in data.periods"
            :key="period.id"
            :value="period.id"
          >
            {{ period.label }}
          </option>
        </select>
      </div>
    </header>

    <div
      v-if="currentData"
      class="therapist-quest-type-insights__body"
    >
      <!-- ===============================================
           DONUT CHART
      ================================================ -->
      <div class="therapist-quest-type-insights__visual">
        <div
          v-if="currentData.total !== undefined"
          class="therapist-quest-donut"
          :style="{ background: donutBackground }"
        >
          <div class="therapist-quest-donut__center">
            <strong>
              {{ currentData.total }}
            </strong>

            <span>
              {{ centerLabel }}
            </span>
          </div>
        </div>

        <div
          v-else
          class="therapist-quest-type-insights__metric"
        >
          <strong>
            {{ currentData.categories?.length ?? 0 }}
          </strong>

          <span>
            Quest categories
          </span>
        </div>
      </div>

      <!-- ===============================================
           LEGEND
      ================================================ -->
      <div class="therapist-quest-type-insights__legend">
        <article
          v-for="category in currentData.categories ?? []"
          :key="category.id"
        >
          <span
            class="therapist-quest-type-insights__dot"
            :style="{
              backgroundColor: getCategoryColor(category),
            }"
          />

          <strong>
            {{ category.label }}
          </strong>

          <span>
            {{ formatValue(category) }}
          </span>

          <small
            v-if="category.percentage !== undefined"
          >
            {{ category.percentage }}%
          </small>
        </article>
      </div>
    </div>

    <!-- ===============================================
         EMPTY STATE
    ================================================ -->
    <div
      v-else
      class="therapist-insights-empty"
    >
      <strong>
        No data available for this view
      </strong>

      <p>
        Try another time period or insight type.
      </p>
    </div>

    <!-- ===============================================
         HIGHLIGHTS
    ================================================ -->
    <div
      v-if="currentData?.highlights?.length"
      class="therapist-quest-type-insights__highlights"
    >
      <article
        v-for="highlight in currentData.highlights"
        :key="highlight.id"
      >
        <span>
          {{ highlight.label }}
        </span>

        <strong>
          {{ highlight.value }}
        </strong>

        <small>
          {{ highlight.detail }}
        </small>
      </article>
    </div>

    <!-- ===============================================
         FOOTER
    ================================================ -->
    <footer
      v-if="currentData?.assignedTotal"
      class="therapist-quest-type-insights__footer"
    >
      Based on {{ currentData.assignedTotal }} assigned quests and
      {{ currentData.total }} completed quests in this period.
    </footer>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },

  selectedView: {
    type: String,
    required: true,
  },

  selectedPeriod: {
    type: String,
    required: true,
  },
});

defineEmits([
  "update:selectedView",
  "update:selectedPeriod",
]);

/* =========================================================
   CATEGORY COLOURS

   These belong to the UI component rather than demo data.

   Stable quest categories always receive the same colour,
   regardless of whether the information comes from demo
   data or the real backend.
========================================================= */

const CATEGORY_COLORS = {
  "social-confidence": "#9d6cff",
  "community-engagement": "#5e97ff",
  independence: "#52d67a",
  "gaming-online-social": "#f0a33c",
  other: "#718095",
};

/* =========================================================
   FALLBACK COLOURS

   New categories coming from the backend automatically
   receive one of these colours.
========================================================= */

const FALLBACK_COLORS = [
  "#9d6cff",
  "#5e97ff",
  "#52d67a",
  "#f0a33c",
  "#ed6e6e",
  "#54c7c3",
  "#d16cff",
  "#d5c45b",
];

/* =========================================================
   CURRENT DATA
========================================================= */

const currentData = computed(() => {
  return (
    props.data.data?.[props.selectedPeriod]?.[
      props.selectedView
    ] ?? null
  );
});

/* =========================================================
   CENTER LABEL
========================================================= */

const centerLabel = computed(() => {
  if (props.selectedView === "completed") {
    return "Completed quests";
  }

  if (props.selectedView === "assigned") {
    return "Assigned quests";
  }

  if (props.selectedView === "completion-rate") {
    return "Completion rate";
  }

  if (props.selectedView === "confidence-gain") {
    return "Confidence gain";
  }

  if (props.selectedView === "difficulty") {
    return "Difficulty";
  }

  if (props.selectedView === "experience") {
    return "Experience";
  }

  return "Quest data";
});

/* =========================================================
   CATEGORY COLOUR
========================================================= */

function getCategoryColor(category) {
  const id = category?.id;

  if (id && CATEGORY_COLORS[id]) {
    return CATEGORY_COLORS[id];
  }

  /*
   Stable fallback based on category ID or label.

   This means an unknown category will still get the same
   colour every time rather than changing randomly.
  */

  const key =
    category?.id ||
    category?.label ||
    "unknown";

  let hash = 0;

  for (let index = 0; index < key.length; index += 1) {
    hash =
      key.charCodeAt(index) +
      ((hash << 5) - hash);
  }

  const colorIndex =
    Math.abs(hash) %
    FALLBACK_COLORS.length;

  return FALLBACK_COLORS[colorIndex];
}

/* =========================================================
   DONUT CHART
========================================================= */

const donutBackground = computed(() => {
  const categories =
    currentData.value?.categories ?? [];

  if (!categories.length) {
    return "#202936";
  }

  let current = 0;

  const segments = categories.map((category) => {
    const percentage =
      Number(category.percentage) || 0;

    const start = current;

    current += percentage;

    const color =
      getCategoryColor(category);

    return `${color} ${start}% ${current}%`;
  });

  return `conic-gradient(${segments.join(", ")})`;
});

/* =========================================================
   VALUE FORMATTING
========================================================= */

function formatValue(category) {
  if (props.selectedView === "confidence-gain") {
    const value =
      Number(category.value) || 0;

    return value > 0
      ? `+${value}`
      : `${value}`;
  }

  if (
    props.selectedView === "difficulty" ||
    props.selectedView === "experience"
  ) {
    return `${category.value}/10`;
  }

  if (props.selectedView === "completion-rate") {
    return `${category.value}%`;
  }

  return category.value;
}
</script>