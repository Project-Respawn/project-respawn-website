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
          <button class="btn btn-primary" @click="beginRespawn">
            Begin your respawn
          </button>

          <a href="#how-it-works" class="btn btn-secondary">
            Learn how it works
          </a>
        </div>

        <div class="value-strip" aria-label="Project Respawn benefits">
          <span>One quest at a time</span>
          <span>Built around community</span>
          <span>Designed for real-life growth</span>
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

<style scoped>
.landing-page {
  color: #f3f7ff;
  background:
    radial-gradient(circle at top left, rgba(168, 85, 247, 0.16), transparent 30%),
    radial-gradient(circle at top right, rgba(45, 212, 191, 0.1), transparent 26%),
    linear-gradient(180deg, #171f3d 0%, #11182f 42%, #0d1428 100%);
  min-height: 100vh;
}

.container {
  width: min(1120px, calc(100% - 2rem));
  margin: 0 auto;
}

.hero-section {
  position: relative;
  padding: 6rem 0 4rem;
  overflow: hidden;
}

.hero-shell {
  position: relative;
  z-index: 2;
  max-width: 760px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.45rem 0.8rem;
  border: 1px solid rgba(168, 85, 247, 0.28);
  border-radius: 999px;
  background: rgba(20, 27, 52, 0.65);
  color: #8ef0d0;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-shell h1 {
  margin: 0 0 1rem;
  font-size: clamp(2.6rem, 7vw, 5.5rem);
  line-height: 0.95;
  letter-spacing: -0.04em;
  color: #ffffff;
  max-width: 10.5ch;
}

.hero-shell h1 span {
  display: block;
  margin-top: 0.4rem;
  color: #a78bfa;
}

.hero-copy {
  margin: 0 0 0.9rem;
  max-width: 42rem;
  font-size: clamp(1.05rem, 1.8vw, 1.3rem);
  line-height: 1.65;
  color: rgba(243, 247, 255, 0.92);
}

.hero-subcopy {
  margin: 0 0 1.75rem;
  max-width: 34rem;
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(219, 228, 255, 0.72);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin-bottom: 1.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0.9rem 1.35rem;
  border-radius: 14px;
  font-size: 0.98rem;
  font-weight: 700;
  text-decoration: none;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease,
    border-color 180ms ease,
    color 180ms ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-primary {
  border: 1px solid rgba(168, 85, 247, 0.45);
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: #ffffff;
  box-shadow: 0 10px 30px rgba(124, 58, 237, 0.28);
}

.btn-primary:hover {
  box-shadow: 0 14px 34px rgba(124, 58, 237, 0.36);
}

.btn-secondary {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.04);
  color: #eaf1ff;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.08);
}

.value-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.value-strip span {
  display: inline-flex;
  align-items: center;
  padding: 0.7rem 0.95rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  background: rgba(17, 24, 47, 0.6);
  color: rgba(233, 240, 255, 0.82);
  font-size: 0.92rem;
}

.content-section {
  padding: 1.5rem 0 5.5rem;
}

.content-shell {
  padding: 2rem;
  border: 1px solid rgba(168, 85, 247, 0.15);
  border-radius: 28px;
  background: rgba(10, 16, 33, 0.68);
  box-shadow: 0 24px 80px rgba(3, 8, 20, 0.35);
  backdrop-filter: blur(12px);
}

.section-heading {
  margin-bottom: 1.25rem;
}

.section-label {
  margin: 0 0 0.65rem;
  color: #8ef0d0;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-heading h2 {
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 3rem);
  line-height: 1.05;
  color: #ffffff;
}

.section-copy {
  margin: 0 0 1rem;
  max-width: 44rem;
  color: rgba(229, 236, 255, 0.84);
  line-height: 1.75;
}

.mini-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.mini-card {
  padding: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.025));
}

.mini-card h3 {
  margin: 0 0 0.65rem;
  font-size: 1.05rem;
  color: #ffffff;
}

.mini-card p {
  margin: 0;
  color: rgba(221, 229, 249, 0.76);
  line-height: 1.7;
}

.closing-block {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2.25rem;
  padding-top: 1.4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.closing-quote {
  margin: 0;
  max-width: 32rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: #f4f7ff;
}

.respawn-overlay {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgba(7, 10, 20, 0.72);
  backdrop-filter: blur(10px);
}

.respawn-panel {
  width: min(100%, 480px);
  padding: 1.5rem;
  border: 1px solid rgba(168, 85, 247, 0.22);
  border-radius: 24px;
  background:
    radial-gradient(circle at top, rgba(168, 85, 247, 0.18), transparent 55%),
    rgba(12, 18, 36, 0.96);
  box-shadow: 0 30px 60px rgba(3, 8, 20, 0.45);
}

.respawn-kicker {
  margin: 0 0 1rem;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
}

.progress-bar {
  width: 100%;
  height: 10px;
  margin-bottom: 1rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.progress-fill {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #2dd4bf 0%, #8b5cf6 100%);
  transform: translateX(-100%);
  animation: loadBar 1.2s ease forwards;
}

.respawn-steps {
  display: grid;
  gap: 0.5rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.respawn-steps li {
  color: rgba(225, 232, 248, 0.45);
  transition: color 180ms ease, transform 180ms ease;
}

.respawn-steps li.active {
  color: #ffffff;
  transform: translateX(2px);
}

.respawn-overlay-enter-active,
.respawn-overlay-leave-active {
  transition: opacity 220ms ease;
}

.respawn-overlay-enter-from,
.respawn-overlay-leave-to {
  opacity: 0;
}

@keyframes loadBar {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0%);
  }
}

@media (max-width: 991.98px) {
  .mini-grid {
    grid-template-columns: 1fr;
  }

  .closing-block {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 575.98px) {
  .hero-section {
    padding: 4.5rem 0 3rem;
  }

  .container {
    width: min(100% - 1.25rem, 1120px);
  }

  .content-shell {
    padding: 1.25rem;
    border-radius: 22px;
  }

  .hero-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .value-strip {
    flex-direction: column;
  }

  .value-strip span {
    width: 100%;
    justify-content: center;
  }
}
</style>
