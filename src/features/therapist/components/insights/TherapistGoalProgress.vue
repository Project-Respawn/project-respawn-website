<template>
  <section class="therapist-insights-card therapist-goal-progress">
    <header class="therapist-insights-card__header">
      <div>
        <span>GOAL PROGRESS</span>

        <h3>
          Current goals
        </h3>
      </div>

      <button
        type="button"
        @click="$emit('view-goals')"
      >
        View all goals
      </button>
    </header>

    <div class="therapist-goal-progress__list">
      <article
        v-for="goal in goals"
        :key="goal.id"
        class="therapist-goal-progress__item"
      >
        <div
          class="therapist-goal-progress__icon"
          :class="`therapist-goal-progress__icon--${goal.tone}`"
        >
          ◇
        </div>

        <div class="therapist-goal-progress__content">
          <div>
            <strong>
              {{ goal.label }}
            </strong>

            <span>
              {{ goal.progress }}%
            </span>
          </div>

          <div class="therapist-goal-progress__bar">
            <i
              :class="`therapist-goal-progress__fill therapist-goal-progress__fill--${goal.tone}`"
              :style="{ width: `${goal.progress}%` }"
            />
          </div>
        </div>

        <span
          class="therapist-goal-progress__change"
          :class="{
            'therapist-goal-progress__change--negative':
              goal.change < 0,
          }"
        >
          {{ goal.change >= 0 ? "↑" : "↓" }}
          {{ Math.abs(goal.change) }}%
        </span>
      </article>
    </div>

    <footer>
      <strong>
        {{ summary.label }}
      </strong>
    </footer>
  </section>
</template>

<script setup>
defineProps({
  goals: {
    type: Array,
    required: true,
  },

  summary: {
    type: Object,
    required: true,
  },
});

defineEmits([
  "view-goals",
]);
</script>