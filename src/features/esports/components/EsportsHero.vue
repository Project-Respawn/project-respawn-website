<!-- src/features/esports/components/EsportsHero.vue -->

<script setup>
defineProps({
  season: {
    type: Object,
    required: true,
  },
});

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}
</script>

<template>
  <section class="esports-hero">
    <div class="hero-darken"></div>
    <div class="hero-purple-glow"></div>
    <div class="hero-green-glow"></div>

    <div class="hero-shell">

      <!-- =====================================================
           LEFT — HERO COPY
      ====================================================== -->
      <div class="hero-copy">

        <div class="season-label">
          <span class="status-dot"></span>

          {{ season.name }} • {{ season.year }}
        </div>

        <h1>
          <span class="purple">
            COMPETE.
          </span>

          <span>
            CONNECT.
          </span>

          <span class="green">
            RESPAWN.
          </span>
        </h1>

        <p>
          We're building competitive teams differently.
          Our players compete while our community helps
          build the journey around them.
        </p>

        <div class="hero-actions">

          <button
            class="hero-button hero-button-primary"
            @click="scrollToSection('teams')"
          >
            Explore Our Teams
            <span>→</span>
          </button>

          <button
            class="hero-button hero-button-secondary"
            @click="scrollToSection('tournaments')"
          >
            View Tournaments
          </button>

        </div>

      </div>


      <!-- =====================================================
           CENTRE — SEASON ZERO JERSEY
      ====================================================== -->
      <div class="hero-jersey">

        <div class="jersey-glow"></div>

        <img
          src="@/assets/esports/season-zero-jersey.png"
          alt="Project Respawn Season Zero esports jersey"
        />

        <div class="jersey-caption">
          <span>OFFICIAL</span>

          <strong>
            SEASON ZERO JERSEY
          </strong>
        </div>

      </div>


      <!-- =====================================================
           RIGHT — RESPAWN IDENTITY
      ====================================================== -->
      <div class="hero-identity">

        <div class="identity-logo">

          <img
            src="@/assets/logo.png"
            alt="Project Respawn"
          />

        </div>

        <div class="identity-copy">
          <span>PROJECT</span>
          <strong>RESPAWN</strong>
          <small>ESPORTS</small>
        </div>

        <div class="identity-line"></div>

        <p>
          Season Zero starts here.
        </p>

      </div>

    </div>


    <!-- =====================================================
         BOTTOM DETAIL
    ====================================================== -->
    <div class="hero-bottom">

      <div>
        <span>01</span>
        <strong>FIRST TEAM</strong>
      </div>

      <div>
        <span>02</span>
        <strong>FIRST SEASON</strong>
      </div>

      <div>
        <span>03</span>
        <strong>YOUR COMMUNITY</strong>
      </div>

    </div>

  </section>
</template>


<style scoped>
.esports-hero {
  min-height: 700px;

  position: relative;

  overflow: hidden;

  border-bottom:
    1px solid rgba(139, 92, 246, 0.25);

  background:
    radial-gradient(
      circle at 72% 30%,
      rgba(126, 40, 255, 0.28),
      transparent 28%
    ),
    radial-gradient(
      circle at 87% 67%,
      rgba(97, 255, 24, 0.09),
      transparent 25%
    ),
    linear-gradient(
      110deg,
      rgba(3, 4, 5, 0.98),
      rgba(8, 7, 18, 0.96) 55%,
      rgba(9, 3, 15, 0.96)
    );
}


.hero-darken {
  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      to top,
      #050607 0%,
      transparent 35%
    );
}


.hero-purple-glow {
  position: absolute;

  width: 600px;
  height: 600px;

  right: 20%;
  top: 5%;

  border-radius: 50%;

  background:
    rgba(119, 25, 255, 0.08);

  filter: blur(80px);
}


.hero-green-glow {
  position: absolute;

  width: 400px;
  height: 400px;

  right: 2%;
  bottom: 0;

  border-radius: 50%;

  background:
    rgba(97, 255, 24, 0.05);

  filter: blur(70px);
}


.hero-shell {
  width:
    min(
      1500px,
      calc(100% - 40px)
    );

  min-height: 650px;

  margin: auto;

  position: relative;
  z-index: 2;

  display: grid;

  grid-template-columns:
    1fr
    0.9fr
    0.65fr;

  gap: 25px;

  align-items: center;
}


/* =========================================================
   COPY
========================================================= */

.hero-copy {
  position: relative;
  z-index: 4;
}


.season-label {
  display: flex;
  align-items: center;

  gap: 9px;

  color: #a855f7;

  font-size: 0.76rem;
  font-weight: 800;

  letter-spacing: 0.16em;

  text-transform: uppercase;
}


.status-dot {
  width: 8px;
  height: 8px;

  border-radius: 50%;

  background: #61ff18;

  box-shadow:
    0 0 12px #61ff18;
}


.hero-copy h1 {
  margin: 24px 0;

  font-size:
    clamp(
      3.6rem,
      6.5vw,
      7.2rem
    );

  line-height: 0.84;

  letter-spacing: -0.045em;
}


.hero-copy h1 span {
  display: block;
}


.purple {
  color: #9c4dff;
}


.green {
  color: #61ff18;
}


.hero-copy p {
  max-width: 500px;

  margin: 0;

  color: #b0b3bd;

  font-size: 1.05rem;

  line-height: 1.7;
}


.hero-actions {
  margin-top: 30px;

  display: flex;

  gap: 13px;

  flex-wrap: wrap;
}


.hero-button {
  padding: 14px 22px;

  cursor: pointer;

  font-size: 0.76rem;
  font-weight: 800;

  letter-spacing: 0.04em;

  text-transform: uppercase;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}


.hero-button:hover {
  transform:
    translateY(-2px);
}


.hero-button-primary {
  border: 1px solid #61ff18;

  background: #61ff18;

  color: #061000;

  box-shadow:
    0 0 22px rgba(97, 255, 24, 0.15);
}


.hero-button-secondary {
  border:
    1px solid #8b5cf6;

  background:
    rgba(10, 10, 15, 0.6);

  color: #ffffff;
}


/* =========================================================
   JERSEY
========================================================= */

.hero-jersey {
  height: 620px;

  position: relative;

  display: flex;

  align-items: center;
  justify-content: center;
}


.jersey-glow {
  position: absolute;

  width: 75%;
  height: 65%;

  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      rgba(139, 92, 246, 0.2),
      transparent 65%
    );

  filter: blur(25px);
}


.hero-jersey img {
  width: 100%;
  max-width: 550px;

  max-height: 600px;

  position: relative;
  z-index: 2;

  object-fit: contain;

  filter:
    drop-shadow(
      0 25px 40px
      rgba(0, 0, 0, 0.7)
    );
}


.jersey-caption {
  position: absolute;

  bottom: 35px;
  left: 50%;

  z-index: 3;

  transform:
    translateX(-50%);

  min-width: 200px;

  padding: 9px 15px;

  text-align: center;

  border:
    1px solid
    rgba(139, 92, 246, 0.35);

  background:
    rgba(4, 5, 8, 0.85);

  backdrop-filter: blur(10px);
}


.jersey-caption span,
.jersey-caption strong {
  display: block;
}


.jersey-caption span {
  color: #777b85;

  font-size: 0.57rem;

  letter-spacing: 0.14em;
}


.jersey-caption strong {
  margin-top: 3px;

  font-size: 0.69rem;

  letter-spacing: 0.06em;
}


/* =========================================================
   IDENTITY
========================================================= */

.hero-identity {
  text-align: center;
}


.identity-logo {
  width: 240px;
  height: 240px;

  margin: auto;

  display: grid;
  place-items: center;

  position: relative;
}


.identity-logo::before {
  content: "";

  position: absolute;

  inset: 15%;

  border-radius: 50%;

  background:
    rgba(126, 40, 255, 0.15);

  filter: blur(35px);
}


.identity-logo img {
  width: 100%;
  height: 100%;

  position: relative;

  object-fit: contain;

  filter:
    drop-shadow(
      0 0 28px
      rgba(139, 92, 246, 0.35)
    );
}


.identity-copy span,
.identity-copy strong,
.identity-copy small {
  display: block;
}


.identity-copy span {
  color: #aaaeb8;

  font-size: 0.7rem;

  letter-spacing: 0.28em;
}


.identity-copy strong {
  margin: 2px 0;

  font-size: 1.8rem;

  letter-spacing: 0.08em;
}


.identity-copy small {
  color: #61ff18;

  letter-spacing: 0.3em;
}


.identity-line {
  width: 70px;
  height: 1px;

  margin: 18px auto;

  background: #8b5cf6;
}


.hero-identity p {
  color: #777b85;

  font-size: 0.75rem;

  text-transform: uppercase;

  letter-spacing: 0.08em;
}


/* =========================================================
   BOTTOM
========================================================= */

.hero-bottom {
  width:
    min(
      1500px,
      calc(100% - 40px)
    );

  margin: auto;

  position: relative;
  z-index: 3;

  display: flex;

  gap: 40px;

  padding-bottom: 22px;
}


.hero-bottom div {
  display: flex;
  align-items: center;

  gap: 8px;
}


.hero-bottom span {
  color: #8b5cf6;

  font-size: 0.63rem;
}


.hero-bottom strong {
  color: #696d77;

  font-size: 0.63rem;

  letter-spacing: 0.08em;
}


/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1100px) {

  .hero-shell {
    grid-template-columns:
      1fr 1fr;
  }


  .hero-identity {
    display: none;
  }

}


@media (max-width: 750px) {

  .esports-hero {
    min-height: auto;
  }


  .hero-shell {
    grid-template-columns: 1fr;

    padding-top: 100px;
  }


  .hero-jersey {
    height: 480px;
  }


  .hero-bottom {
    flex-wrap: wrap;

    gap: 16px;
  }

}
</style>