<!-- src/features/esports/components/CurrentObjective.vue -->

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  objective: {
    type: Object,
    required: true,
  },
});

const now = ref(new Date());
let timer = null;

/* =========================================================
   OBJECTIVE PROGRESS
========================================================= */

const currentValue = computed(() => {
  return Number(props.objective.currentValue ?? 0);
});

const targetValue = computed(() => {
  return Number(props.objective.targetValue ?? 0);
});

const progressPercent = computed(() => {
  if (!targetValue.value) {
    return 0;
  }

  return Math.min(
    Math.max(
      (currentValue.value / targetValue.value) * 100,
      0
    ),
    100
  );
});


/* =========================================================
   OBJECTIVE STATUS
========================================================= */

const isComplete = computed(() => {
  return (
    props.objective.status === "completed" ||
    currentValue.value >= targetValue.value
  );
});

const endDate = computed(() => {
  if (!props.objective.endDate) {
    return null;
  }

  return new Date(props.objective.endDate);
});

const hasExpired = computed(() => {
  if (!endDate.value) {
    return false;
  }

  return (
    now.value.getTime() > endDate.value.getTime() &&
    !isComplete.value
  );
});

const objectiveState = computed(() => {
  if (isComplete.value) {
    return "complete";
  }

  if (hasExpired.value) {
    return "expired";
  }

  return "active";
});


/* =========================================================
   TIME REMAINING
========================================================= */

const remainingMilliseconds = computed(() => {
  if (!endDate.value) {
    return null;
  }

  return Math.max(
    endDate.value.getTime() - now.value.getTime(),
    0
  );
});

const timeRemaining = computed(() => {
  if (remainingMilliseconds.value === null) {
    return null;
  }

  const totalSeconds = Math.floor(
    remainingMilliseconds.value / 1000
  );

  const days = Math.floor(
    totalSeconds / 86400
  );

  const hours = Math.floor(
    (totalSeconds % 86400) / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
  };
});


/* =========================================================
   MILESTONES
========================================================= */

const milestones = computed(() => {
  return props.objective.milestones ?? [];
});

const hasMilestones = computed(() => {
  return milestones.value.length > 0;
});

function milestoneUnlocked(milestone) {
  return currentValue.value >= milestone.value;
}

const nextMilestone = computed(() => {
  if (!hasMilestones.value) {
    return null;
  }

  return milestones.value.find(
    milestone =>
      currentValue.value < milestone.value
  );
});

const amountUntilNextMilestone = computed(() => {
  if (!nextMilestone.value) {
    return 0;
  }

  return Math.max(
    nextMilestone.value.value - currentValue.value,
    0
  );
});


/* =========================================================
   DISPLAY HELPERS
========================================================= */

const formattedCurrentValue = computed(() => {
  return currentValue.value.toLocaleString();
});

const formattedTargetValue = computed(() => {
  return targetValue.value.toLocaleString();
});

const metricLabel = computed(() => {
  return (
    props.objective.metricLabel ||
    "PROGRESS"
  );
});

const statusText = computed(() => {
  switch (objectiveState.value) {
    case "complete":
      return (
        props.objective.completedMessage ||
        "OBJECTIVE COMPLETE"
      );

    case "expired":
      return (
        props.objective.expiredMessage ||
        "OBJECTIVE ENDED"
      );

    default:
      return "CURRENT OBJECTIVE";
  }
});


/* =========================================================
   LIVE TIMER
========================================================= */

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onBeforeUnmount(() => {
  if (timer) {
    window.clearInterval(timer);
  }
});
</script>


<template>
  <section class="objective-wrapper">
    <div
      class="objective-card"
      :class="`objective-${objectiveState}`"
    >

      <!-- ===============================================
           TOP CONTENT
      ================================================ -->

      <div class="objective-copy">

        <span class="objective-eyebrow">
          {{ statusText }}
        </span>

        <h2>
          {{ objective.title }}
        </h2>

        <p>
          {{ objective.description }}
        </p>

      </div>


      <!-- ===============================================
           CURRENT / TARGET VALUE
      ================================================ -->

      <div class="objective-count">

        <div class="count-line">
          <strong>
            {{ formattedCurrentValue }}
          </strong>

          <span>
            /
            {{ formattedTargetValue }}
          </span>
        </div>

        <small>
          {{ metricLabel }}
        </small>

      </div>


      <!-- ===============================================
           TIMER
      ================================================ -->

      <div
        v-if="timeRemaining && objectiveState === 'active'"
        class="objective-timer"
      >
        <span>TIME REMAINING</span>

        <div class="timer-values">

          <div>
            <strong>
              {{ timeRemaining.days }}
            </strong>
            <small>DAYS</small>
          </div>

          <div>
            <strong>
              {{ String(timeRemaining.hours).padStart(2, "0") }}
            </strong>
            <small>HRS</small>
          </div>

          <div>
            <strong>
              {{ String(timeRemaining.minutes).padStart(2, "0") }}
            </strong>
            <small>MIN</small>
          </div>

          <div>
            <strong>
              {{ String(timeRemaining.seconds).padStart(2, "0") }}
            </strong>
            <small>SEC</small>
          </div>

        </div>
      </div>


      <!-- ===============================================
           COMPLETED / EXPIRED STATUS
      ================================================ -->

      <div
        v-else-if="objectiveState === 'complete'"
        class="objective-result objective-result-complete"
      >
        <strong>✓</strong>

        <span>
          {{ objective.completedMessage || "THE COMMUNITY DID IT." }}
        </span>
      </div>


      <div
        v-else-if="objectiveState === 'expired'"
        class="objective-result objective-result-expired"
      >
        <strong>○</strong>

        <span>
          {{ objective.expiredMessage || "THIS OBJECTIVE HAS ENDED." }}
        </span>
      </div>


      <!-- ===============================================
           MAIN PROGRESS BAR
      ================================================ -->

      <div class="progress-track">
        <div
          class="progress-fill"
          :style="{
            width: `${progressPercent}%`
          }"
        ></div>
      </div>


      <!-- ===============================================
           OPTIONAL MILESTONES
      ================================================ -->

      <div
        v-if="hasMilestones"
        class="milestone-grid"
      >

        <article
          v-for="milestone in milestones"
          :key="`${objective.id}-${milestone.value}`"
          class="milestone"
          :class="{
            unlocked:
              milestoneUnlocked(milestone),

            active:
              nextMilestone &&
              nextMilestone.value === milestone.value
          }"
        >

          <div class="milestone-line"></div>

          <div class="milestone-icon">
            <span
              v-if="milestoneUnlocked(milestone)"
            >
              ✓
            </span>

            <span v-else>
              ◈
            </span>
          </div>

          <strong class="milestone-value">
            {{ milestone.value }}
          </strong>

          <span class="milestone-label">
            {{ milestone.label }}
          </span>

          <small
            v-if="milestone.subtitle"
            class="milestone-subtitle"
          >
            {{ milestone.subtitle }}
          </small>

        </article>

      </div>


      <!-- ===============================================
           NEXT UNLOCK
      ================================================ -->

      <div
        v-if="
          objectiveState === 'active' &&
          nextMilestone
        "
        class="next-unlock"
      >

        <span class="next-label">
          NEXT UNLOCK
        </span>

        <strong>
          {{ nextMilestone.label }}
        </strong>

        <small>
          {{ amountUntilNextMilestone }}
          {{ metricLabel.toLowerCase() }}
          to go
        </small>

      </div>


      <!-- ===============================================
           NO MILESTONES
      ================================================ -->

      <div
        v-else-if="
          objectiveState === 'active' &&
          !hasMilestones
        "
        class="simple-progress-copy"
      >
        <strong>
          {{
            Math.max(
              targetValue - currentValue,
              0
            ).toLocaleString()
          }}
        </strong>

        <span>
          {{ metricLabel.toLowerCase() }}
          remaining
        </span>
      </div>


      <!-- ===============================================
           CTA
      ================================================ -->

      <div
        v-if="
          objective.cta &&
          objectiveState === 'active'
        "
        class="objective-actions"
      >

        <RouterLink
          v-if="objective.cta.route"
          :to="objective.cta.route"
          class="objective-button objective-button-primary"
        >
          {{ objective.cta.label }}
          <span>→</span>
        </RouterLink>


        <a
          v-else-if="objective.cta.url"
          :href="objective.cta.url"
          class="objective-button objective-button-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ objective.cta.label }}
          <span>→</span>
        </a>

      </div>

    </div>
  </section>
</template>


<style scoped>
/* =========================================================
   WRAPPER
========================================================= */

.objective-wrapper {
  width: min(1500px, calc(100% - 40px));
  margin: -12px auto 22px;
  position: relative;
  z-index: 10;
}


/* =========================================================
   OBJECTIVE CARD
========================================================= */

.objective-card {
  position: relative;
  overflow: hidden;

  padding: 32px;

  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    auto
    auto;

  gap: 26px;

  border:
    1px solid
    rgba(139, 92, 246, 0.32);

  background:
    radial-gradient(
      circle at 92% 12%,
      rgba(110, 40, 255, 0.12),
      transparent 25%
    ),
    linear-gradient(
      135deg,
      rgba(11, 12, 17, 0.99),
      rgba(5, 6, 9, 0.99)
    );

  box-shadow:
    0 20px 80px
    rgba(0, 0, 0, 0.4);
}


.objective-card::after {
  content: "";

  position: absolute;

  right: -90px;
  bottom: -130px;

  width: 330px;
  height: 330px;

  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      rgba(97, 255, 24, 0.07),
      transparent 65%
    );

  pointer-events: none;
}


/* =========================================================
   COPY
========================================================= */

.objective-copy {
  position: relative;
  z-index: 2;
}


.objective-eyebrow {
  display: block;

  margin-bottom: 8px;

  color: #a855f7;

  font-size: 0.78rem;
  font-weight: 800;

  letter-spacing: 0.16em;

  text-transform: uppercase;
}


.objective-copy h2 {
  margin: 0 0 10px;

  font-size:
    clamp(1.7rem, 3vw, 2.7rem);

  line-height: 1;

  text-transform: uppercase;

  letter-spacing: 0.025em;
}


.objective-copy p {
  max-width: 650px;

  margin: 0;

  color: #a9acb7;

  font-size: 0.98rem;

  line-height: 1.65;
}


/* =========================================================
   OBJECTIVE COUNT
========================================================= */

.objective-count {
  min-width: 175px;

  align-self: center;

  text-align: center;
}


.count-line {
  display: flex;

  justify-content: center;
  align-items: baseline;

  gap: 8px;
}


.count-line strong {
  color: #61ff18;

  font-size: 3.4rem;

  line-height: 1;

  text-shadow:
    0 0 20px
    rgba(97, 255, 24, 0.22);
}


.count-line span {
  color: #e5e7eb;

  font-size: 1.45rem;
}


.objective-count small {
  display: block;

  margin-top: 8px;

  color: #c7c9d0;

  font-size: 0.72rem;
  font-weight: 700;

  letter-spacing: 0.1em;

  text-transform: uppercase;
}


/* =========================================================
   TIMER
========================================================= */

.objective-timer {
  min-width: 250px;

  align-self: center;

  padding: 15px 18px;

  border:
    1px solid
    rgba(139, 92, 246, 0.35);

  background:
    rgba(7, 8, 11, 0.82);
}


.objective-timer > span {
  display: block;

  margin-bottom: 10px;

  color: #a855f7;

  font-size: 0.69rem;
  font-weight: 800;

  letter-spacing: 0.13em;

  text-align: center;
}


.timer-values {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 9px;
}


.timer-values div {
  text-align: center;
}


.timer-values strong {
  display: block;

  color: #ffffff;

  font-size: 1.35rem;
}


.timer-values small {
  color: #7f828c;

  font-size: 0.58rem;

  letter-spacing: 0.08em;
}


/* =========================================================
   RESULT STATE
========================================================= */

.objective-result {
  min-width: 220px;

  align-self: center;

  padding: 17px;

  border: 1px solid;

  text-align: center;
}


.objective-result strong {
  display: block;

  margin-bottom: 6px;

  font-size: 1.9rem;
}


.objective-result span {
  font-size: 0.76rem;
  font-weight: 800;

  letter-spacing: 0.08em;
}


.objective-result-complete {
  border-color:
    rgba(97, 255, 24, 0.4);

  color: #61ff18;
}


.objective-result-expired {
  border-color:
    rgba(255, 255, 255, 0.16);

  color: #9ca0aa;
}


/* =========================================================
   PROGRESS BAR
========================================================= */

.progress-track {
  grid-column: 1 / -1;

  height: 21px;

  overflow: hidden;

  border:
    1px solid
    rgba(255, 255, 255, 0.13);

  border-radius: 999px;

  background: #090a0e;
}


.progress-fill {
  height: 100%;

  border-radius: inherit;

  background:
    linear-gradient(
      90deg,
      #4fd600,
      #61ff18
    );

  box-shadow:
    0 0 24px
    rgba(97, 255, 24, 0.28);

  transition:
    width 0.6s ease;
}


/* =========================================================
   MILESTONES
========================================================= */

.milestone-grid {
  grid-column: 1 / -1;

  display: grid;

  grid-template-columns:
    repeat(
      auto-fit,
      minmax(120px, 1fr)
    );

  margin-top: 6px;
}


.milestone {
  position: relative;

  min-width: 0;

  padding: 0 10px 12px;

  color: #777a84;

  text-align: center;
}


.milestone-line {
  position: absolute;

  top: 22px;
  left: 0;

  width: 100%;
  height: 1px;

  background:
    rgba(255, 255, 255, 0.1);
}


.milestone-icon {
  position: relative;

  z-index: 2;

  width: 44px;
  height: 44px;

  margin: 0 auto 10px;

  display: grid;
  place-items: center;

  transform: rotate(45deg);

  border:
    1px solid #484b55;

  background: #08090c;
}


.milestone-icon span {
  transform: rotate(-45deg);
}


.milestone-value {
  display: block;

  margin-bottom: 4px;

  font-size: 1.55rem;
}


.milestone-label {
  display: block;

  color: inherit;

  font-size: 0.73rem;
  font-weight: 800;

  letter-spacing: 0.04em;

  text-transform: uppercase;
}


.milestone-subtitle {
  display: block;

  margin-top: 5px;

  color: #696c76;

  font-size: 0.68rem;

  text-transform: uppercase;
}


.milestone.unlocked {
  color: #ffffff;
}


.milestone.unlocked
.milestone-icon {
  color: #61ff18;

  border-color: #61ff18;

  box-shadow:
    0 0 18px
    rgba(97, 255, 24, 0.26);
}


.milestone.active
.milestone-icon {
  border-color: #a855f7;

  box-shadow:
    0 0 18px
    rgba(168, 85, 247, 0.32);
}


/* =========================================================
   NEXT UNLOCK
========================================================= */

.next-unlock {
  grid-column: 1 / 2;

  display: flex;
  align-items: baseline;
  gap: 10px;

  flex-wrap: wrap;

  text-transform: uppercase;
}


.next-label {
  color: #8f939e;

  font-size: 0.68rem;
  font-weight: 700;

  letter-spacing: 0.1em;
}


.next-unlock strong {
  color: #a855f7;
}


.next-unlock small {
  color: #61ff18;

  font-size: 0.72rem;

  letter-spacing: 0.06em;
}


/* =========================================================
   SIMPLE OBJECTIVE
========================================================= */

.simple-progress-copy {
  grid-column: 1 / 2;

  display: flex;
  align-items: baseline;

  gap: 7px;

  color: #a8abb5;
}


.simple-progress-copy strong {
  color: #61ff18;
}


/* =========================================================
   CTA
========================================================= */

.objective-actions {
  grid-column: 3;

  display: flex;

  justify-content: flex-end;
}


.objective-button {
  display: inline-flex;

  align-items: center;

  gap: 10px;

  padding: 13px 20px;

  font-size: 0.78rem;
  font-weight: 800;

  letter-spacing: 0.04em;

  text-decoration: none;

  text-transform: uppercase;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}


.objective-button:hover {
  transform:
    translateY(-2px);
}


.objective-button-primary {
  color: #061000;

  border: 1px solid #61ff18;

  background: #61ff18;

  box-shadow:
    0 0 20px
    rgba(97, 255, 24, 0.14);
}


/* =========================================================
   COMPLETE STATE
========================================================= */

.objective-complete
.progress-fill {
  width: 100% !important;
}


/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1050px) {

  .objective-card {
    grid-template-columns:
      1fr 1fr;
  }


  .objective-copy {
    grid-column: 1 / -1;
  }


  .objective-count {
    justify-self: start;
  }


  .objective-timer,
  .objective-result {
    justify-self: end;
  }


  .objective-actions {
    grid-column: 2;
  }
}


@media (max-width: 720px) {

  .objective-wrapper {
    width:
      min(
        100% - 24px,
        1500px
      );
  }


  .objective-card {
    padding: 22px;

    grid-template-columns: 1fr;
  }


  .objective-copy,
  .objective-count,
  .objective-timer,
  .objective-result,
  .progress-track,
  .milestone-grid,
  .next-unlock,
  .simple-progress-copy,
  .objective-actions {
    grid-column: 1;
  }


  .objective-count,
  .objective-timer,
  .objective-result {
    justify-self: stretch;
  }


  .objective-count {
    text-align: left;
  }


  .count-line {
    justify-content: flex-start;
  }


  .objective-count small {
    text-align: left;
  }


  .milestone-grid {
    grid-template-columns:
      repeat(2, 1fr);

    gap: 16px 0;
  }


  .objective-actions {
    justify-content: stretch;
  }


  .objective-button {
    width: 100%;

    justify-content: center;
  }
}


@media (max-width: 440px) {

  .timer-values {
    grid-template-columns:
      repeat(2, 1fr);

    gap: 14px;
  }
}
</style>