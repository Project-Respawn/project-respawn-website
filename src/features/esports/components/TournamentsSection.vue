<!-- src/features/esports/components/TournamentsSection.vue -->

<script setup>
defineProps({
  tournaments: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <section
    id="tournaments"
    class="panel tournaments-panel"
  >

    <div class="section-heading">

      <div>
        <span>
          COMPETE WITH US
        </span>

        <h2>
          Project Respawn Tournaments
        </h2>
      </div>

      <p>
        Esports isn't only about watching our teams.
        We want the community competing too.
      </p>

    </div>


    <div class="tournament-grid">

      <article
        v-for="tournament in tournaments"
        :key="tournament.id"
        class="tournament-card"
      >

        <!-- ===================================================
             COMMUNITY CUP
        ==================================================== -->

        <div class="tournament-art">

          <img
            v-if="tournament.id === 'respawn-community-cup'"
            src="@/assets/esports/respawn-community-cup.png"
            alt="Project Respawn Community Cup"
          />


          <!-- Future tournaments without artwork -->

          <div
            v-else
            class="future-tournament-art"
          >
            <img
              src="@/assets/logo.png"
              alt=""
            />

            <span>
              COMMUNITY CHOICE
            </span>
          </div>


          <div class="art-overlay"></div>


          <div class="tournament-status">
            {{ tournament.status }}
          </div>

        </div>


        <!-- ===================================================
             CONTENT
        ==================================================== -->

        <div class="tournament-copy">

          <small>
            {{ tournament.game }}
          </small>

          <h3>
            {{ tournament.name }}
          </h3>

          <p>
            {{ tournament.description }}
          </p>


          <RouterLink
            :to="`/esports/tournaments/${tournament.id}`"
            class="tournament-link"
          >
            View Tournament
            <span>→</span>
          </RouterLink>

        </div>

      </article>

    </div>

  </section>
</template>


<style scoped>
.panel {
  padding: 28px;

  border:
    1px solid
    rgba(139, 92, 246, 0.28);

  background:
    rgba(8, 9, 12, 0.93);

  backdrop-filter:
    blur(12px);
}


/* =========================================================
   HEADING
========================================================= */

.section-heading {
  display: flex;

  justify-content: space-between;

  gap: 30px;

  margin-bottom: 22px;
}


.section-heading span {
  color: #8b5cf6;

  font-size: 0.68rem;
  font-weight: 800;

  letter-spacing: 0.14em;
}


.section-heading h2 {
  margin: 5px 0;

  text-transform: uppercase;
}


.section-heading p {
  max-width: 360px;

  margin: 0;

  color: #81858f;

  line-height: 1.5;
}


/* =========================================================
   GRID
========================================================= */

.tournament-grid {
  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 16px;
}


/* =========================================================
   CARD
========================================================= */

.tournament-card {
  min-width: 0;

  overflow: hidden;

  border:
    1px solid
    rgba(255, 255, 255, 0.09);

  background: #090a0e;

  transition:
    transform 0.2s ease,
    border-color 0.2s ease;
}


.tournament-card:hover {
  transform:
    translateY(-3px);

  border-color:
    rgba(139, 92, 246, 0.65);
}


/* =========================================================
   ART
========================================================= */

.tournament-art {
  height: 260px;

  position: relative;

  overflow: hidden;

  background: #050608;
}


.tournament-art > img {
  width: 100%;
  height: 100%;

  object-fit: cover;

  transition:
    transform 0.5s ease;
}


.tournament-card:hover
.tournament-art > img {
  transform:
    scale(1.04);
}


.art-overlay {
  position: absolute;

  inset: 0;

  pointer-events: none;

  background:
    linear-gradient(
      to top,
      rgba(5, 6, 8, 0.95),
      transparent 55%
    );
}


.tournament-status {
  position: absolute;

  top: 12px;
  right: 12px;

  z-index: 3;

  padding: 7px 10px;

  border:
    1px solid
    rgba(97, 255, 24, 0.4);

  background:
    rgba(4, 5, 8, 0.82);

  color: #61ff18;

  font-size: 0.62rem;
  font-weight: 800;

  letter-spacing: 0.06em;

  text-transform: uppercase;
}


/* =========================================================
   FUTURE TOURNAMENT
========================================================= */

.future-tournament-art {
  width: 100%;
  height: 100%;

  display: flex;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 10px;

  background:
    radial-gradient(
      circle,
      rgba(139, 92, 246, 0.14),
      transparent 45%
    ),
    #08090d;
}


.future-tournament-art img {
  width: 120px;
  height: 120px;

  object-fit: contain;

  opacity: 0.4;

  filter:
    grayscale(0.2);
}


.future-tournament-art span {
  color: #777b85;

  font-size: 0.62rem;

  letter-spacing: 0.15em;
}


/* =========================================================
   COPY
========================================================= */

.tournament-copy {
  padding: 18px;
}


.tournament-copy small {
  color: #8b5cf6;

  font-size: 0.65rem;
  font-weight: 800;

  text-transform: uppercase;
}


.tournament-copy h3 {
  margin: 6px 0 10px;

  font-size: 1.2rem;

  text-transform: uppercase;
}


.tournament-copy p {
  min-height: 66px;

  margin: 0 0 18px;

  color: #8d919b;

  font-size: 0.82rem;

  line-height: 1.55;
}


.tournament-link {
  color: #61ff18;

  font-size: 0.72rem;
  font-weight: 800;

  text-decoration: none;

  text-transform: uppercase;
}


.tournament-link span {
  margin-left: 5px;
}


/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 750px) {

  .section-heading {
    flex-direction: column;
  }


  .tournament-grid {
    grid-template-columns: 1fr;
  }

}
</style>