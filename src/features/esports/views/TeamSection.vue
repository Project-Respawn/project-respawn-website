<!-- src/features/esports/components/TeamsSection.vue -->

<script setup>
defineProps({
  teams: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <section
    id="teams"
    class="teams-section"
  >
    <!-- =========================================================
         SECTION HEADING
    ========================================================== -->
    <div class="section-heading">
      <div>
        <span class="section-eyebrow">
          PROJECT RESPAWN ESPORTS
        </span>

        <h2>
          Our Teams
        </h2>
      </div>

      <p>
        Meet the teams representing Project Respawn.
        League of Legends is only the beginning.
      </p>
    </div>


    <!-- =========================================================
         TEAM GRID
    ========================================================== -->
    <div class="teams-grid">

      <!-- =======================================================
           ACTIVE / EXISTING TEAMS
      ======================================================== -->
      <RouterLink
        v-for="team in teams"
        :key="team.id"
        :to="team.route"
        class="team-card active-team-card"
      >
        <!-- IMAGE -->
        <div class="team-image">

          <img
            v-if="team.id === 'league-of-legends'"
            src="@/assets/esports/league-of-legends-season-zero.png"
            alt="Project Respawn League of Legends Season Zero"
          />

          <div class="image-overlay"></div>

          <div class="season-badge">
            {{ team.season }} • {{ team.year }}
          </div>

          <div class="game-badge">
            COMPETITIVE TEAM
          </div>

        </div>


        <!-- CONTENT -->
        <div class="team-content">

          <span class="team-status">
            {{ team.status }}
          </span>

          <h3>
            {{ team.name }}
          </h3>

          <p>
            Project Respawn's first competitive team.
            Follow the journey from Season Zero through
            our first scrims, tournaments and official matches.
          </p>

          <div class="team-footer">

            <span class="team-route">
              View Team
              <strong>→</strong>
            </span>

            <span class="team-season">
              {{ team.season }}
            </span>

          </div>

        </div>
      </RouterLink>


      <!-- =======================================================
           FUTURE TEAM CARD
      ======================================================== -->
      <article class="team-card future-team-card">

        <div class="future-background">

          <div class="future-glow"></div>

          <img
            src="@/assets/logo.png"
            alt=""
          />

        </div>

        <div class="future-content">

          <div class="future-plus">
            +
          </div>

          <span class="future-eyebrow">
            WHAT COMES NEXT?
          </span>

          <h3>
            More To Come
          </h3>

          <p>
            Project Respawn Esports is being built to
            support multiple competitive games.
          </p>

          <span class="future-note">
            FUTURE TEAMS WILL APPEAR HERE
          </span>

        </div>

      </article>

    </div>
  </section>
</template>


<style scoped>
/* ============================================================
   SECTION
============================================================ */

.teams-section {
  min-width: 0;

  padding: 28px;

  border:
    1px solid
    rgba(139, 92, 246, 0.28);

  background:
    rgba(8, 9, 12, 0.93);

  backdrop-filter:
    blur(14px);
}


/* ============================================================
   HEADING
============================================================ */

.section-heading {
  display: flex;

  justify-content: space-between;
  align-items: flex-end;

  gap: 30px;

  margin-bottom: 24px;
}


.section-eyebrow {
  display: block;

  margin-bottom: 6px;

  color: #8b5cf6;

  font-size: 0.68rem;
  font-weight: 800;

  letter-spacing: 0.14em;

  text-transform: uppercase;
}


.section-heading h2 {
  margin: 0;

  font-size:
    clamp(
      1.8rem,
      3vw,
      2.5rem
    );

  text-transform: uppercase;
}


.section-heading p {
  max-width: 360px;

  margin: 0;

  color: #888c96;

  font-size: 0.84rem;

  line-height: 1.55;
}


/* ============================================================
   GRID
============================================================ */

.teams-grid {
  display: grid;

  grid-template-columns:
    minmax(0, 1.65fr)
    minmax(220px, 0.85fr);

  gap: 16px;
}


/* ============================================================
   BASE CARD
============================================================ */

.team-card {
  min-width: 0;

  position: relative;

  overflow: hidden;

  border:
    1px solid
    rgba(255, 255, 255, 0.09);

  background:
    rgba(7, 8, 11, 0.97);

  color: #ffffff;

  text-decoration: none;

  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease;
}


.team-card:hover {
  transform:
    translateY(-4px);

  border-color:
    rgba(139, 92, 246, 0.65);

  box-shadow:
    0 18px 45px
    rgba(0, 0, 0, 0.38);
}


/* ============================================================
   ACTIVE TEAM IMAGE
============================================================ */

.team-image {
  height: 260px;

  position: relative;

  overflow: hidden;

  background: #050608;
}


.team-image img {
  width: 100%;
  height: 100%;

  object-fit: cover;

  transition:
    transform 0.55s ease;
}


.active-team-card:hover
.team-image img {
  transform:
    scale(1.045);
}


.image-overlay {
  position: absolute;

  inset: 0;

  background:
    linear-gradient(
      to top,
      rgba(5, 6, 8, 0.97) 0%,
      rgba(5, 6, 8, 0.35) 48%,
      transparent 80%
    );
}


/* ============================================================
   BADGES
============================================================ */

.season-badge,
.game-badge {
  position: absolute;

  z-index: 3;

  padding:
    7px 10px;

  background:
    rgba(4, 5, 8, 0.8);

  backdrop-filter:
    blur(8px);

  font-size: 0.6rem;
  font-weight: 800;

  letter-spacing: 0.07em;

  text-transform: uppercase;
}


.season-badge {
  top: 13px;
  right: 13px;

  border:
    1px solid
    rgba(97, 255, 24, 0.4);

  color: #61ff18;
}


.game-badge {
  left: 13px;
  bottom: 13px;

  border:
    1px solid
    rgba(139, 92, 246, 0.45);

  color: #a855f7;
}


/* ============================================================
   ACTIVE TEAM CONTENT
============================================================ */

.team-content {
  padding: 20px;
}


.team-status {
  color: #8b5cf6;

  font-size: 0.66rem;
  font-weight: 800;

  letter-spacing: 0.08em;

  text-transform: uppercase;
}


.team-content h3 {
  margin:
    7px 0 9px;

  font-size:
    clamp(
      1.3rem,
      2.3vw,
      1.8rem
    );

  text-transform: uppercase;
}


.team-content p {
  max-width: 650px;

  margin:
    0 0 20px;

  color: #898d97;

  font-size: 0.82rem;

  line-height: 1.6;
}


.team-footer {
  display: flex;

  justify-content: space-between;
  align-items: center;

  gap: 20px;

  padding-top: 14px;

  border-top:
    1px solid
    rgba(255, 255, 255, 0.07);
}


.team-route {
  color: #61ff18;

  font-size: 0.72rem;
  font-weight: 800;

  letter-spacing: 0.05em;

  text-transform: uppercase;
}


.team-route strong {
  margin-left: 5px;
}


.team-season {
  color: #555963;

  font-size: 0.62rem;
  font-weight: 700;

  letter-spacing: 0.09em;

  text-transform: uppercase;
}


/* ============================================================
   FUTURE TEAM CARD
============================================================ */

.future-team-card {
  min-height: 100%;

  display: flex;

  flex-direction: column;

  justify-content: flex-end;

  border-style: dashed;

  cursor: default;
}


.future-team-card:hover {
  transform: none;

  border-color:
    rgba(139, 92, 246, 0.35);

  box-shadow: none;
}


.future-background {
  min-height: 210px;

  position: relative;

  display: grid;

  place-items: center;

  overflow: hidden;

  background:
    radial-gradient(
      circle at center,
      rgba(139, 92, 246, 0.1),
      transparent 52%
    ),
    #08090d;
}


.future-background img {
  width: 125px;
  height: 125px;

  position: relative;
  z-index: 2;

  object-fit: contain;

  opacity: 0.17;

  filter:
    grayscale(0.35);
}


.future-glow {
  position: absolute;

  width: 160px;
  height: 160px;

  border-radius: 50%;

  background:
    rgba(97, 255, 24, 0.04);

  filter:
    blur(30px);
}


.future-content {
  padding: 22px;
}


.future-plus {
  margin-bottom: 12px;

  color: #8b5cf6;

  font-size: 3.2rem;
  font-weight: 300;

  line-height: 0.8;
}


.future-eyebrow {
  display: block;

  color: #5f636d;

  font-size: 0.6rem;
  font-weight: 800;

  letter-spacing: 0.12em;
}


.future-content h3 {
  margin:
    6px 0 9px;

  font-size: 1.25rem;

  text-transform: uppercase;
}


.future-content p {
  margin:
    0 0 16px;

  color: #7d818b;

  font-size: 0.78rem;

  line-height: 1.55;
}


.future-note {
  color: #61ff18;

  font-size: 0.58rem;
  font-weight: 800;

  letter-spacing: 0.1em;
}


/* ============================================================
   RESPONSIVE
============================================================ */

@media (max-width: 950px) {

  .section-heading {
    flex-direction: column;

    align-items: flex-start;
  }


  .teams-grid {
    grid-template-columns:
      1fr;
  }


  .future-team-card {
    min-height: 300px;
  }


  .future-background {
    min-height: 160px;
  }

}


@media (max-width: 650px) {

  .teams-section {
    padding: 20px;
  }


  .team-image {
    height: 210px;
  }


  .team-footer {
    flex-direction: column;

    align-items: flex-start;
  }

}
</style>
