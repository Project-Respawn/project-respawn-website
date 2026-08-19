<template>
  <svg
    class="creator-category-icon"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <template v-for="(path, index) in activePaths" :key="index">
      <path :d="path" />
    </template>
  </svg>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true
  }
});

const paths = {
  gamepad: [
    'M8 8h8a5 5 0 0 1 4.8 6.4l-.8 3a2 2 0 0 1-3.3 1l-2.2-2H9.5l-2.2 2a2 2 0 0 1-3.3-1l-.8-3A5 5 0 0 1 8 8z',
    'M8 11v4M6 13h4M16 12h.01M18 14h.01'
  ],

  sparkles: [
    'M12 3l1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3z',
    'M5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14z',
    'M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14z'
  ],

  'message-circle': [
    'M21 11.5a8.5 8.5 0 0 1-9 8.5 9.8 9.8 0 0 1-4-.9L3 21l1.8-4.5A8.5 8.5 0 1 1 21 11.5z'
  ],

  trophy: [
    'M8 4h8v5a4 4 0 0 1-8 0V4z',
    'M8 6H4v2a4 4 0 0 0 4 4',
    'M16 6h4v2a4 4 0 0 1-4 4',
    'M12 13v4M8 21h8M9 17h6v4'
  ],

  medal: [
    'M8 3l4 6 4-6',
    'M7 3h10',
    'M12 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
    'M12 12l.9 1.8 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3L12 12z'
  ],

  'graduation-cap': [
    'M2 10l10-5 10 5-10 5L2 10z',
    'M6 12.5V17c3 2 9 2 12 0v-4.5',
    'M22 10v6'
  ],

  coffee: [
    'M5 8h11v6a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8z',
    'M16 10h2a3 3 0 0 1 0 6h-2',
    'M8 3v2M12 3v2'
  ],

  ghost: [
    'M6 20V10a6 6 0 0 1 12 0v10l-3-2-3 2-3-2-3 2z',
    'M9 11h.01M15 11h.01'
  ],

  timer: [
    'M9 2h6',
    'M12 6a8 8 0 1 1-8 8',
    'M12 10v4l3 2',
    'M18 5l2 2'
  ],

  users: [
    'M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    'M16 11a2.5 2.5 0 1 0 0-5',
    'M3 20a5 5 0 0 1 10 0',
    'M14 15a4 4 0 0 1 7 3'
  ],

  dumbbell: [
    'M6 9v6M18 9v6M3 10v4M21 10v4M6 12h12'
  ],

  heart: [
    'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z'
  ],

  palette: [
    'M12 3a9 9 0 0 0 0 18h1.2a1.8 1.8 0 0 0 1.2-3.2 1.8 1.8 0 0 1 1.2-3.2H18A3 3 0 0 0 21 12a9 9 0 0 0-9-9z',
    'M7.5 10h.01M9.5 6.5h.01M14 6.5h.01M17 10h.01'
  ],

  music: [
    'M9 18V6l10-2v12',
    'M9 18a3 3 0 1 1-3-3h3',
    'M19 16a3 3 0 1 1-3-3h3'
  ],

  masks: [
    'M4 6c3-2 6-2 9 0v6c-1 4-7 4-9 0V6z',
    'M11 8c3-2 6-2 9 0v6c-1 4-7 4-9 0',
    'M7 9h.01M10 9h.01',
    'M7 13c1 1 2 1 3 0',
    'M15 11h.01M18 11h.01'
  ],

  '18-plus': [
    'M5 9v8',
    'M4 10l1-1',
    'M9 11a2 2 0 1 1 4 0c0 1-1 1.5-2 2 1 .5 2 1 2 2a2 2 0 1 1-4 0c0-1 1-1.5 2-2-1-.5-2-1-2-2z',
    'M17 11v6M14 14h6'
  ]
};

const activePaths = computed(() => {
  return paths[props.name] || paths.sparkles;
});
</script>

<style scoped>
.creator-category-icon {
  width: 1em;
  height: 1em;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}
</style>