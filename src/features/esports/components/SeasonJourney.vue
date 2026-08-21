<!-- src/features/esports/components/SeasonJourney.vue -->

<script setup>
defineProps({
  journey: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <section class="panel journey-panel">
    <div class="heading">
      <span>SEASON ZERO</span>
      <h2>Our Journey</h2>

      <p>
        Every team starts somewhere.
        You're here at the beginning.
      </p>
    </div>

    <div class="timeline">
      <article
        v-for="(item, index) in journey"
        :key="`${item.title}-${index}`"
        class="timeline-item"
        :class="{
          complete: item.completed,
          secret: item.title === '???'
        }"
      >
        <div class="marker">
          <span>
            {{ item.completed ? "✓" : index + 1 }}
          </span>
        </div>

        <div class="timeline-copy">
          <strong>
            {{ item.title }}
          </strong>

          <small>
            {{ item.date }}
          </small>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.panel {
  padding: 26px;
  border: 1px solid rgba(139, 92, 246, 0.28);
  background: rgba(8, 9, 12, 0.96);
}

.heading span {
  color: #8b5cf6;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.heading h2 {
  margin: 5px 0;
  font-size: 2rem;
  text-transform: uppercase;
}

.heading p {
  margin: 0 0 25px;
  color: #898d98;
  font-size: 0.85rem;
  line-height: 1.55;
}

.timeline {
  position: relative;
}

.timeline::before {
  content: "";
  position: absolute;
  top: 20px;
  bottom: 20px;
  left: 19px;
  width: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 14px;
  padding-bottom: 24px;
}

.marker {
  width: 40px;
  height: 40px;
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  transform: rotate(45deg);
  border: 1px solid #454851;
  background: #090a0e;
}

.marker span {
  transform: rotate(-45deg);
  font-size: 0.74rem;
}

.timeline-copy {
  padding-top: 2px;
}

.timeline-copy strong,
.timeline-copy small {
  display: block;
}

.timeline-copy strong {
  text-transform: uppercase;
}

.timeline-copy small {
  margin-top: 4px;
  color: #70747e;
}

.complete .marker {
  border-color: #61ff18;
  color: #61ff18;
  box-shadow: 0 0 15px rgba(97, 255, 24, 0.2);
}

.secret .marker {
  border-color: #8b5cf6;
  color: #8b5cf6;
}

.secret .timeline-copy strong {
  color: #8b5cf6;
}
</style>