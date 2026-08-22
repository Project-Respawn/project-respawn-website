<!-- src/features/esports/components/JerseySection.vue -->

<script setup>
defineProps({
  jersey: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <section class="panel jersey-panel">

    <div class="heading">

      <span>
        OUR COLOURS
      </span>

      <h2>
        Season Zero Jersey
      </h2>

      <p>
        The first jersey in Project Respawn esports history.
        Designed around our identity rather than sponsors.
      </p>

    </div>


    <!-- =====================================================
         JERSEY IMAGE
    ====================================================== -->

    <div class="jersey-display">

      <div class="jersey-glow"></div>

      <img
        src="@/assets/esports/season-zero-jersey.png"
        alt="Project Respawn Season Zero esports jersey"
      />

      <div class="season-badge">
        SEASON ZERO
        <strong>2026</strong>
      </div>

    </div>


    <!-- =====================================================
         DETAILS
    ====================================================== -->

    <div class="jersey-details">

      <div
        v-for="detail in jersey.details"
        :key="detail"
        class="jersey-detail"
      >
        <span>◆</span>

        <p>
          {{ detail }}
        </p>
      </div>

    </div>


    <!-- =====================================================
         COLLAR
    ====================================================== -->

    <div class="jersey-message">

      <span>
        COLLAR DETAIL
      </span>

      <strong>
        YOUR PAST WAS THE TUTORIAL.
      </strong>

    </div>


    <div class="jersey-footer">
      PROJECT RESPAWN • SEASON ZERO
    </div>

  </section>
</template>


<style scoped>
.panel {
  padding: 26px;

  overflow: hidden;

  position: relative;

  border:
    1px solid
    rgba(139, 92, 246, 0.28);

  background:
    radial-gradient(
      circle at 55% 38%,
      rgba(126, 40, 255, 0.12),
      transparent 38%
    ),
    rgba(8, 9, 12, 0.93);

  backdrop-filter:
    blur(12px);
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
  margin: 0;

  color: #8c909b;

  line-height: 1.55;
}


/* =========================================================
   JERSEY
========================================================= */

.jersey-display {
  min-height: 390px;

  position: relative;

  display: grid;
  place-items: center;
}


.jersey-glow {
  position: absolute;

  width: 75%;
  height: 65%;

  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      rgba(139, 92, 246, 0.18),
      transparent 65%
    );

  filter: blur(20px);
}


.jersey-display img {
  width: 100%;

  max-width: 440px;
  max-height: 370px;

  position: relative;
  z-index: 2;

  object-fit: contain;

  filter:
    drop-shadow(
      0 22px 30px
      rgba(0, 0, 0, 0.55)
    );
}


.season-badge {
  position: absolute;

  right: 0;
  bottom: 20px;

  z-index: 3;

  padding: 9px 12px;

  border:
    1px solid
    rgba(139, 92, 246, 0.35);

  background:
    rgba(5, 6, 8, 0.85);

  color: #8b5cf6;

  font-size: 0.6rem;

  letter-spacing: 0.1em;
}


.season-badge strong {
  display: block;

  margin-top: 3px;

  color: #ffffff;

  font-size: 0.8rem;
}


/* =========================================================
   DETAILS
========================================================= */

.jersey-details {
  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 9px;
}


.jersey-detail {
  display: grid;

  grid-template-columns:
    18px 1fr;

  gap: 6px;

  align-items: start;
}


.jersey-detail span {
  color: #61ff18;

  font-size: 0.65rem;
}


.jersey-detail p {
  margin: 0;

  color: #979ba5;

  font-size: 0.72rem;

  line-height: 1.4;
}


/* =========================================================
   MESSAGE
========================================================= */

.jersey-message {
  margin-top: 22px;

  padding-top: 18px;

  border-top:
    1px solid
    rgba(255, 255, 255, 0.08);
}


.jersey-message span,
.jersey-message strong {
  display: block;
}


.jersey-message span {
  margin-bottom: 5px;

  color: #626670;

  font-size: 0.6rem;

  letter-spacing: 0.12em;
}


.jersey-message strong {
  color: #8b5cf6;

  font-size: 0.83rem;
}


.jersey-footer {
  margin-top: 20px;

  color: #50535c;

  font-size: 0.58rem;

  letter-spacing: 0.14em;

  text-align: right;
}


@media (max-width: 500px) {

  .jersey-details {
    grid-template-columns: 1fr;
  }

}
</style>