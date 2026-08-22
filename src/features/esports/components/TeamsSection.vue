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
    class="panel teams-panel"
  >

    <div class="panel-heading">

      <div>
        <span>
          PROJECT RESPAWN ESPORTS
        </span>

        <h2>
          Our Teams
        </h2>
      </div>

      <p>
        Meet the teams representing Project Respawn.
      </p>

    </div>


    <div class="teams-grid">

      <RouterLink
        v-for="team in teams"
        :key="team.id"
        :to="team.route"
        class="team-card"
      >

        <div class="team-art">

          <img
            v-if="team.id === 'league-of-legends'"
            src="@/assets/esports/league-of-legends-season-zero.png"
            alt="Project Respawn League of Legends Season Zero"
          />

          <div class="team-art-overlay"></div>

          <div class="team-status">
            {{ team.season }} • {{ team.year }}
          </div>

        </div>


        <div class="team-content">

          <span class="status">
            {{ team.status }}
          </span>

          <h3>
            {{ team.name }}
          </h3>

          <p>
            Project Respawn's first competitive team.
            Follow the journey from roster reveal
            through our first official season.
          </p>

          <span class="view-team">
            View Team
            <strong>→</strong>
          </span>

        </div>

      </RouterLink>


      <!-- =====================================================
           FUTURE TEAM SLOT
      ====================================================== -->

      <article class="team-card more-card">

        <div class="future-icon">
          +
        </div>

        <span class="future-label">
          NEXT GAME
        </span>

        <h3>
          More To Come
        </h3>

        <p>
          League of Legends is only the beginning.
          Future Project Respawn teams will appear here.
        </p>

        <small>
          WATCH THIS SPACE
        </small>

      </article>

    </div>

  </section>
</template>


<style scoped>
.panel {
  min-width: 0;

  padding: 26px;

  border:
    1px solid
    rgba(139, 92, 246, 0.28);

  background:
    rgba(8, 9, 12, 0.92);

  backdrop-filter:
    blur(12px);
}


.panel-heading {
  margin-bottom: 22px;
}


.panel-heading span {
  display: block;

  margin-bottom: 5px;

  color: #8b5cf6;

  font-size: 0.68rem;
  font-weight: 800;

  letter-spacing: 0.14em;
}


.panel-heading h2 {
  margin: 0;

  font-size: 2rem;

  text-transform: uppercase;
}


.panel-heading p {
  margin: 7px 0 0;

  color: #898d98;

  font-size: 0.86rem;
}


/* =========================================================
   GRID
========================================================= */

.teams-grid {
  display: grid;

  gap: 14px;
}


/* =========================================================
   TEAM
========================================================= */

.team-card {
  overflow: hidden;

  position: relative;

  display: block;

  border:
    1px solid
    rgba(255, 255, 255, 0.09);

  background: #090a0e;

  color: #ffffff;

  text-decoration: none;

  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}


.team-card:hover {
  transform:
    translateY(-3px);

  border-color:
    rgba(139, 92, 246, 0.75);

  box-shadow:
    0 15px 35px
    rgba(0, 0, 0, 0.35);
}


/* =========================================================
   ART
========================================================= */

.team-art {
  height: 230px;

  position: relative;

  overflow: hidden;

  background: #050608;
}


.team-art img {
  width: 100%;
  height: 100%;

  object-fit: cover;

  transition:
    transform 0.5s ease;
}


.team-card:hover
.team-art img {
  transform:
    scale(1.04);
}


.team-art-overlay {
  position: absolute;

  inset: 0;

  background:
    linear-gradient(
      to top,
      rgba(5, 6, 8, 0.95),
      transparent 55%
    );
}


.team-status {
  position: absolute;

  top: 13px;
  right: 13px;

  padding: 7px 10px;

  border:
    1px solid
    rgba(97, 255, 24, 0.45);

  background:
    rgba(4, 5, 8, 0.8);

  color: #61ff18;

  font-size: 0.62rem;
  font-weight: 800;

  letter-spacing: 0.06em;
}


/* =========================================================
   CONTENT
========================================================= */

.team-content {
  padding: 18px;
}


.status {
  color: #8b5cf6;

  font-size: 0.67rem;
  font-weight: 800;

  text-transform: uppercase;
}


.team-content h3 {
  margin: 6px 0 8px;

  font-size: 1.45rem;

  text-transform: uppercase;
}


.team-content p {
  margin: 0 0 18px;

  color: #858994;

  font-size: 0.8rem;

  line-height: 1.55;
}


.view-team {
  color: #61ff18;

  font-size: 0.73rem;
  font-weight: 800;

  text-transform: uppercase;
}


.view-team strong {
  margin-left: 5px;
}


/* =========================================================
   FUTURE CARD
========================================================= */

.more-card {
  min-height: 230px;

  padding: 24px;

  display: flex;

  flex-direction: column;

  justify-content: center;

  border-style: dashed;

  background:
    radial-gradient(
      circle at center,
      rgba(139, 92, 246, 0.07),
      transparent 55%
    ),
    rgba(8, 9, 12, 0.85);
}


.future-icon {
  color: #8b5cf6;

  font-size: 3.5rem;

  line-height: 1;
}


.future-label {
  margin-top: 14px;

  color: #5f636d;

  font-size: 0.62rem;

  letter-spacing: 0.14em;
}


.more-card h3 {
  margin: 5px 0 8px;

  text-transform: uppercase;
}


.more-card p {
  margin: 0 0 15px;

  color: #81858f;

  font-size: 0.8rem;

  line-height: 1.55;
}


.more-card small {
  color: #61ff18;

  font-size: 0.6rem;

  letter-spacing: 0.12em;
}
</style>