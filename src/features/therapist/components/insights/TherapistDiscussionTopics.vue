<template>
  <section class="therapist-insights-card therapist-discussion-topics">
    <header class="therapist-insights-card__header">
      <div>
        <span>DISCUSSION TOPICS</span>

        <h3>
          Potential areas to explore next session
        </h3>
      </div>

      <button
        type="button"
        @click="$emit('view-activity')"
      >
        View related activity
      </button>
    </header>

    <div class="therapist-discussion-topics__grid">
      <article
        v-for="topic in topics"
        :key="topic.id"
        class="therapist-discussion-topic"
        :class="`therapist-discussion-topic--${topic.tone}`"
      >
        <div
          class="therapist-discussion-topic__icon"
          :class="`therapist-discussion-topic__icon--${topic.tone}`"
        >
          {{ topic.icon }}
        </div>

        <div class="therapist-discussion-topic__content">
          <span>
            {{ topic.typeLabel }}
          </span>

          <strong>
            {{ topic.title }}
          </strong>

          <p v-if="topic.detail">
            {{ topic.detail }}
          </p>

          <small v-if="topic.dateLabel">
            {{ topic.dateLabel }}
          </small>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({
  topics: {
    type: Array,
    required: true,
  },
});

defineEmits([
  "view-activity",
]);
</script>