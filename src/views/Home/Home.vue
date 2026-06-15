<template>
  <div class="landing-page" :class="{ 'is-transitioning': isTransitioning }">
    <section class="hero-section">
      <div class="container hero-shell">
        <p class="eyebrow">Project Respawn</p>

        <h1>
          Your past is just the tutorial.
          <span>Your real game starts now.</span>
        </h1>

        <p class="hero-copy">
          Project Respawn helps people rebuild social confidence through gaming,
          community, and real-life progression.
        </p>

        <p class="hero-subcopy">
          Respawn your confidence. Re-enter the world stronger.
        </p>

        <div class="hero-actions">

          <div class="col-md-12" align="center">
            <button class="btn btn-primary" @click="beginRespawn">
              Begin your respawn
            </button>
          </div>

          <div class="col-md-12">
            <a href="/team-tryouts" class="btn btn-secondary col-md-4 offset-md-4">
              Learn how it works
            </a>
          </div>

          <div class="col-md-12 offset-md-1">
            <div class="value-strip" aria-label="Project Respawn benefits">
              <span>One quest at a time</span>
              <span>Built around community</span>
              <span>Designed for real-life growth</span>
            </div>
          </div>
        </div>
      </div>

      <transition name="respawn-overlay">
        <div
          v-if="isTransitioning"
          class="respawn-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Beginning your respawn"
        >
          <div class="respawn-panel">
            <p class="respawn-kicker">Beginning your respawn</p>
            <div class="progress-bar" aria-hidden="true">
              <div class="progress-fill"></div>
            </div>
            <ul class="respawn-steps" role="list">
              <li :class="{ active: animationStep >= 1 }">Loading confidence…</li>
              <li :class="{ active: animationStep >= 2 }">Equipping courage…</li>
              <li :class="{ active: animationStep >= 3 }">Quest ready…</li>
            </ul>
          </div>
        </div>
      </transition>
    </section>

    <section id="how-it-works" class="content-section">
      <div class="container content-shell">
        <div class="section-heading">
          <p class="section-label">What this is</p>
          <h2>A better way to build confidence</h2>
        </div>

        <p class="section-copy">
          In games, a respawn is a second chance. You load back in, learn from the
          last round, and keep moving. We believe real life should work like that too.
        </p>

        <p class="section-copy">
          Project Respawn is a gaming-powered platform and community built to help
          people grow their social confidence, find their people, and make progress
          that feels real.
        </p>

        <div class="mini-grid">
          <article class="mini-card">
            <h3>Respawn</h3>
            <p>
              Start where you are. You do not need to have everything figured out to
              take the next step.
            </p>
          </article>

          <article class="mini-card">
            <h3>Reconnect</h3>
            <p>
              Meet people, join communities, and build confidence through shared
              challenges and support.
            </p>
          </article>

          <article class="mini-card">
            <h3>Level up</h3>
            <p>
              Turn growth into something practical through quests, momentum, and
              repeatable wins.
            </p>
          </article>
        </div>

        <div class="closing-block">
          <p class="closing-quote">
            “Your past is just the tutorial. Your real game starts now.”
          </p>
          <a href="/join" class="btn btn-primary">
            Start the next quest
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'LandingPage',
  data() {
    return {
      isTransitioning: false,
      animationStep: 0,
      timeouts: []
    };
  },
  methods: {
    beginRespawn() {
      if (this.isTransitioning) return;

      this.isTransitioning = true;
      this.animationStep = 0;

      this.timeouts.push(
        setTimeout(() => {
          this.animationStep = 1;
        }, 180)
      );

      this.timeouts.push(
        setTimeout(() => {
          this.animationStep = 2;
        }, 520)
      );

      this.timeouts.push(
        setTimeout(() => {
          this.animationStep = 3;
        }, 860)
      );

      this.timeouts.push(
        setTimeout(() => {
          window.location.href = '/join';
        }, 1350)
      );
    }
  },
  beforeUnmount() {
    this.timeouts.forEach(clearTimeout);
  }
};
</script>

<style scoped src="./Home.css"></style>
