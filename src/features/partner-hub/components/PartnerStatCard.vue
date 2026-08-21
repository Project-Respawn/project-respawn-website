<script setup>
import { computed } from 'vue';

const props = defineProps({
  stat: {
    type: Object,
    required: true,
  },
});

const chartPoints = computed(() => {
  const values = props.stat.trend;

  const max = Math.max(...values);
  const min = Math.min(...values);

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;

      const y =
        100 -
        ((value - min) / Math.max(max - min, 1)) * 80 -
        10;

      return `${x},${y}`;
    })
    .join(' ');
});
</script>

<template>
  <article class="partner-stat-card">
    <div class="partner-stat-top">
      <div class="partner-stat-icon">
        {{ stat.icon }}
      </div>

      <div>
        <span class="partner-stat-label">
          {{ stat.label }}
        </span>

        <strong class="partner-stat-value">
          {{ stat.value }}
        </strong>
      </div>
    </div>

    <div class="partner-stat-change">
      ↑ {{ stat.change }}

      <span>
        {{ stat.changeText }}
      </span>
    </div>

    <svg
      class="partner-sparkline"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <polyline
        :points="chartPoints"
        fill="none"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  </article>
</template><!-- Partner Hub placeholder -->
