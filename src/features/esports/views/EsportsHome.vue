<!-- src/features/esports/views/EsportsHome.vue -->

<script setup>
import { esportsData } from "../data/esportsData.js";

import EsportsHero from "../components/EsportsHero.vue";
import CurrentObjective from "../components/CurrentObjective.vue";
import TeamsSection from "../components/TeamsSection.vue";
import SeasonJourney from "../components/SeasonJourney.vue";
import JerseySection from "../components/JerseySection.vue";
import TournamentsSection from "../components/TournamentsSection.vue";
import SixthPlayer from "../components/SixthPlayer.vue";
import NextUp from "../components/NextUp.vue";
</script>

<template>
  <main class="esports-home">

    <!-- =========================================================
         HERO
    ========================================================== -->

    <EsportsHero
      :season="esportsData.season"
    />


    <!-- =========================================================
         CURRENT OBJECTIVE
    ========================================================== -->

    <CurrentObjective
      :objective="esportsData.currentObjective"
    />


    <!-- =========================================================
         TEAMS / JOURNEY / JERSEY
    ========================================================== -->

    <section class="esports-dashboard-grid">

      <TeamsSection
        :teams="esportsData.teams"
      />

      <SeasonJourney
        :journey="esportsData.journey"
      />

      <JerseySection
        :jersey="esportsData.jersey"
      />

    </section>


    <!-- =========================================================
         TOURNAMENTS / COMMUNITY
    ========================================================== -->

    <section class="esports-lower-grid">

      <TournamentsSection
        :tournaments="esportsData.tournaments"
      />

      <SixthPlayer
        :features="esportsData.communityFeatures"
      />

    </section>


    <!-- =========================================================
         NEXT UP
    ========================================================== -->

    <NextUp
      :objective="esportsData.currentObjective"
    />


    <!-- =========================================================
         FINAL CTA
    ========================================================== -->

    <section class="final-esports-cta">

      <div class="final-esports-cta-inner">

        <span class="cta-eyebrow">
          THIS IS SEASON ZERO.
        </span>

        <h2>
          Be part of something
          <strong>legendary.</strong>
        </h2>

        <p>
          Join the Project Respawn community.
          Help complete objectives, unlock the team
          and build the beginning of our esports journey.
        </p>

        <RouterLink
          to="/join"
          class="respawn-button"
        >
          Join Project Respawn
          <span>→</span>
        </RouterLink>

      </div>

    </section>

  </main>
</template>


<style scoped>
/* =========================================================
   PAGE
========================================================= */

.esports-home {
  min-height: 100vh;

  position: relative;

  background:
    linear-gradient(
      rgba(3, 4, 7, 0.88),
      rgba(3, 4, 7, 0.93)
    ),
    url("@/assets/esports/esports-background.png")
      center top / cover fixed;

  color: #ffffff;
}


/* =========================================================
   MAIN DASHBOARD GRID
========================================================= */

.esports-dashboard-grid {
  width:
    min(
      1500px,
      calc(100% - 40px)
    );

  margin:
    18px auto;

  display: grid;

  grid-template-columns:
    1fr
    0.8fr
    1.15fr;

  gap: 16px;
}


/* =========================================================
   LOWER GRID
========================================================= */

.esports-lower-grid {
  width:
    min(
      1500px,
      calc(100% - 40px)
    );

  margin:
    18px auto;

  display: grid;

  grid-template-columns:
    1.6fr
    1fr;

  gap: 16px;
}


/* =========================================================
   FINAL CTA
========================================================= */

.final-esports-cta {
  width:
    min(
      1500px,
      calc(100% - 40px)
    );

  margin:
    22px auto 40px;

  padding:
    70px 30px;

  position: relative;

  overflow: hidden;

  text-align: center;

  border:
    1px solid
    rgba(139, 92, 246, 0.35);

  background:
    radial-gradient(
      circle at center,
      rgba(111, 0, 255, 0.2),
      transparent 58%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba(97, 255, 24, 0.06),
      transparent 30%
    ),
    rgba(8, 9, 12, 0.95);

  backdrop-filter:
    blur(14px);
}


.final-esports-cta::before {
  content: "";

  position: absolute;

  inset: 0;

  pointer-events: none;

  background:
    linear-gradient(
      120deg,
      transparent 20%,
      rgba(139, 92, 246, 0.04),
      transparent 70%
    );
}


.final-esports-cta-inner {
  position: relative;

  z-index: 2;

  max-width: 800px;

  margin:
    0 auto;
}


/* =========================================================
   CTA EYEBROW
========================================================= */

.cta-eyebrow {
  display: block;

  color: #8b5cf6;

  font-size: 0.8rem;
  font-weight: 800;

  letter-spacing: 0.22em;

  text-transform: uppercase;
}


/* =========================================================
   CTA HEADING
========================================================= */

.final-esports-cta h2 {
  margin:
    12px 0 16px;

  font-size:
    clamp(
      2.3rem,
      4vw,
      4.4rem
    );

  line-height: 0.98;

  text-transform: uppercase;
}


.final-esports-cta h2 strong {
  display: block;

  color: #61ff18;

  text-shadow:
    0 0 24px
    rgba(97, 255, 24, 0.14);
}


/* =========================================================
   CTA COPY
========================================================= */

.final-esports-cta p {
  max-width: 650px;

  margin:
    0 auto 28px;

  color: #a6a8b3;

  font-size: 1rem;

  line-height: 1.7;
}


/* =========================================================
   BUTTON
========================================================= */

.respawn-button {
  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 10px;

  padding:
    15px 28px;

  border:
    1px solid #61ff18;

  background:
    #61ff18;

  color:
    #071000;

  font-size:
    0.8rem;

  font-weight:
    800;

  letter-spacing:
    0.04em;

  text-decoration:
    none;

  text-transform:
    uppercase;

  box-shadow:
    0 0 20px
    rgba(97, 255, 24, 0.12);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}


.respawn-button:hover {
  transform:
    translateY(-2px);

  box-shadow:
    0 0 30px
    rgba(97, 255, 24, 0.22);
}


/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1100px) {

  .esports-dashboard-grid {
    grid-template-columns:
      1fr;
  }


  .esports-lower-grid {
    grid-template-columns:
      1fr;
  }

}


@media (max-width: 720px) {

  .esports-dashboard-grid,
  .esports-lower-grid,
  .final-esports-cta {
    width:
      min(
        100% - 24px,
        1500px
      );
  }


  .final-esports-cta {
    padding:
      50px 22px;
  }

}
</style>