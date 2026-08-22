<!-- src/features/esports/components/SixthPlayer.vue -->

<script setup>
defineProps({
  features: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <section class="panel sixth-player">
    <div class="eyebrow">
      THE COMMUNITY
    </div>

    <div class="sixth-number">
      6
    </div>

    <h2>
      The Sixth Player
    </h2>

    <p class="intro">
      Five players compete in game.
      Everyone else helps build what happens around them.
    </p>

    <div class="feature-list">
      <article
        v-for="feature in features"
        :key="feature.title"
      >
        <div class="feature-icon">
          ◆
        </div>

        <div>
          <strong>
            {{ feature.title }}
          </strong>

          <p>
            {{ feature.description }}
          </p>
        </div>
      </article>
    </div>

    <RouterLink
      to="/join"
      class="join-link"
    >
      Become The Sixth Player →
    </RouterLink>
  </section>
</template>

<style scoped>
.panel {
  position: relative;
  overflow: hidden;
  padding: 28px;
  border: 1px solid rgba(97, 255, 24, 0.18);
  background:
    radial-gradient(
      circle at 85% 15%,
      rgba(97, 255, 24, 0.08),
      transparent 35%
    ),
    rgba(8, 9, 12, 0.96);
}

.eyebrow {
  color: #61ff18;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.15em;
}

.sixth-number {
  position: absolute;
  top: -30px;
  right: 20px;
  color: rgba(97, 255, 24, 0.045);
  font-size: 12rem;
  font-weight: 900;
  line-height: 1;
}

h2 {
  margin: 7px 0 9px;
  font-size: 2rem;
  text-transform: uppercase;
}

.intro {
  max-width: 390px;
  margin: 0 0 25px;
  color: #969aa5;
  line-height: 1.6;
}

.feature-list {
  display: grid;
  gap: 16px;
}

.feature-list article {
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 12px;
}

.feature-icon {
  color: #8b5cf6;
}

.feature-list strong {
  text-transform: uppercase;
}

.feature-list p {
  margin: 4px 0 0;
  color: #777b85;
  font-size: 0.78rem;
  line-height: 1.45;
}

.join-link {
  display: inline-block;
  margin-top: 25px;
  color: #61ff18;
  font-size: 0.75rem;
  font-weight: 800;
  text-decoration: none;
  text-transform: uppercase;
}
</style>