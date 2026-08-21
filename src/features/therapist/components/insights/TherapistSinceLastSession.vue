<template>
  <section class="therapist-insights-since">
    <div class="therapist-insights-section-heading">
      <div>
        <span>
          {{ data.periodLabel }}
        </span>

        <h3>
          Since last session summary
        </h3>
      </div>
    </div>

    <div class="therapist-insights-since__grid">
      <article
        v-for="item in data.summary"
        :key="item.id"
        class="therapist-insights-since__item"
      >
        <div
          class="therapist-insights-since__icon"
          :class="`therapist-insights-since__icon--${item.tone}`"
        >
          {{ item.icon }}
        </div>

        <div class="therapist-insights-since__content">
          <strong>
            {{ item.value }}
          </strong>

          <span>
            {{ item.label }}
          </span>

          <small>
            {{ item.detail }}
          </small>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    required: true,
  },
});
</script>