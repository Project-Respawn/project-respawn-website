<template>
  <section class="therapist-activity-summary-grid">
    <article
      v-for="item in items"
      :key="item.id"
      class="therapist-activity-summary-card"
      :class="`therapist-activity-summary-card--${item.tone}`"
    >
      <div
        class="therapist-activity-summary-card__icon"
        :class="`therapist-activity-summary-card__icon--${item.tone}`"
      >
        {{ item.icon }}
      </div>

      <div class="therapist-activity-summary-card__content">
        <span>{{ item.label }}</span>

        <strong>{{ item.value }}</strong>

        <small>
          {{ item.detail }}
        </small>
      </div>
    </article>
  </section>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
});
</script>