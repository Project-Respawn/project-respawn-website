<template>
  <section class="therapist-insights-card therapist-pattern-summary">
    <header class="therapist-insights-card__header">
      <div>
        <span>PATTERN SUMMARY</span>

        <h3>
          Emerging patterns
        </h3>
      </div>

      <button
        type="button"
        @click="$emit('view-details')"
      >
        View details
      </button>
    </header>

    <div class="therapist-pattern-summary__list">
      <article
        v-for="pattern in patterns"
        :key="pattern.id"
        class="therapist-pattern-summary__item"
      >
        <div
          class="therapist-pattern-summary__icon"
          :class="`therapist-pattern-summary__icon--${pattern.tone}`"
        >
          {{ pattern.icon }}
        </div>

        <div class="therapist-pattern-summary__content">
          <strong>
            {{ pattern.title }}
          </strong>

          <p>
            {{ pattern.detail }}
          </p>

          <small>
            {{ pattern.source }}
          </small>
        </div>
      </article>
    </div>

    <footer class="therapist-pattern-summary__disclaimer">
      <span>
        i
      </span>

      <p>
        Patterns describe shared platform activity.
        They are not clinical conclusions or diagnoses.
      </p>
    </footer>
  </section>
</template>

<script setup>
defineProps({
  patterns: {
    type: Array,
    required: true,
  },
});

defineEmits([
  "view-details",
]);
</script>