<!-- src/features/esports/components/NextUp.vue -->

<script setup>
import { computed } from "vue";

const props = defineProps({
  objective: {
    type: Object,
    required: true,
  },
});

const nextMilestone = computed(() => {
  const milestones =
    props.objective.milestones || [];

  return milestones.find(
    milestone =>
      props.objective.currentValue <
      milestone.value
  );
});

const remaining = computed(() => {
  if (!nextMilestone.value) {
    return 0;
  }

  return Math.max(
    nextMilestone.value.value -
      props.objective.currentValue,
    0
  );
});
</script>

<template>
  <section class="next-wrapper">
    <div class="next-label">
      NEXT UP
    </div>

    <div
      v-if="nextMilestone"
      class="next-content"
    >
      <div>
        <span class="unlock-label">
          NEXT COMMUNITY UNLOCK
        </span>

        <h2>
          {{ nextMilestone.label }}
        </h2>

        <p>
          Help the community reach the next milestone.
        </p>
      </div>

      <div class="remaining">
        <strong>
          {{ remaining }}
        </strong>

        <span>
          {{ objective.metricLabel || "members" }}
          remaining
        </span>
      </div>

      <RouterLink
        v-if="objective.cta?.route"
        :to="objective.cta.route"
        class="next-button"
      >
        {{ objective.cta.label }}
        →
      </RouterLink>
    </div>

    <div
      v-else
      class="next-content completed"
    >
      <div>
        <span>
          OBJECTIVE COMPLETE
        </span>

        <h2>
          The Community Did It.
        </h2>

        <p>
          Stay tuned for the next Project Respawn objective.
        </p>
      </div>

      <div class="complete-icon">
        ✓
      </div>
    </div>
  </section>
</template>

<style scoped>
.next-wrapper {
  width: min(1500px, calc(100% - 40px));
  margin: 18px auto;
  padding: 28px;
  border: 1px solid rgba(139, 92, 246, 0.3);
  background:
    linear-gradient(
      100deg,
      rgba(91, 25, 185, 0.13),
      rgba(8, 9, 12, 0.98) 55%
    );
}

.next-label {
  margin-bottom: 12px;
  color: #8b5cf6;
  font-size: 0.69rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.next-content {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 30px;
}

.unlock-label {
  color: #777b86;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
}

.next-content h2 {
  margin: 5px 0;
  font-size: clamp(1.7rem, 3vw, 3rem);
  text-transform: uppercase;
}

.next-content p {
  margin: 0;
  color: #888c96;
}

.remaining {
  text-align: center;
}

.remaining strong,
.remaining span {
  display: block;
}

.remaining strong {
  color: #61ff18;
  font-size: 3rem;
  line-height: 1;
}

.remaining span {
  margin-top: 5px;
  color: #8c9099;
  font-size: 0.68rem;
  text-transform: uppercase;
}

.next-button {
  padding: 13px 20px;
  border: 1px solid #61ff18;
  color: #61ff18;
  font-size: 0.72rem;
  font-weight: 800;
  text-decoration: none;
  text-transform: uppercase;
}

.complete-icon {
  color: #61ff18;
  font-size: 4rem;
}

@media (max-width: 700px) {
  .next-wrapper {
    width: calc(100% - 24px);
  }

  .next-content {
    grid-template-columns: 1fr;
  }

  .remaining {
    text-align: left;
  }
}
</style>