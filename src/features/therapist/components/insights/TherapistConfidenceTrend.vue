<template>
  <section class="therapist-insights-card therapist-confidence-trend">
    <header class="therapist-insights-card__header">
      <div>
        <span>CONFIDENCE TREND</span>

        <h3>
          Confidence over time
        </h3>
      </div>

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
    </header>

    <div class="therapist-confidence-chart">
      <div class="therapist-confidence-chart__axis">
        <span
          v-for="value in 10"
          :key="value"
        >
          {{ 11 - value }}
        </span>
      </div>

      <div class="therapist-confidence-chart__plot">
        <div class="therapist-confidence-chart__grid">
          <span
            v-for="value in 10"
            :key="`grid-${value}`"
          />
        </div>

        <div class="therapist-confidence-chart__points">
          <div
            v-for="point in points"
            :key="point.label"
            class="therapist-confidence-chart__point"
          >
            <div
              class="therapist-confidence-chart__marker"
              :style="{
                bottom: `${Math.max(
                  0,
                  Math.min(100, (point.value / 10) * 100)
                )}%`,
              }"
            >
              <strong>
                {{ point.value }}
              </strong>

              <i />
            </div>

            <span>
              {{ point.label }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <footer class="therapist-confidence-trend__summary">
      <span>
        Overall confidence

        <strong
          :class="`therapist-insight-change therapist-insight-change--${data.overallDirection}`"
        >
          {{ directionIcon }}
          {{ Math.abs(data.overallChange) }}%
        </strong>
      </span>

      <small>
        {{ data.summary }}
      </small>
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

  selectedPeriod: {
    type: String,
    required: true,
  },
});

defineEmits([
  "update:selectedPeriod",
]);

const points = computed(() => {
  return (
    props.data.datasets?.[
      props.selectedPeriod
    ] ?? []
  );
});

const directionIcon = computed(() => {
  if (
    props.data.overallDirection === "up"
  ) {
    return "↑";
  }

  if (
    props.data.overallDirection === "down"
  ) {
    return "↓";
  }

  return "→";
});
</script>