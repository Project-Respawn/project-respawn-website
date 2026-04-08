<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const isPlaying = ref(false)
let anthemAudio: HTMLAudioElement | null = null

onMounted(() => {
  anthemAudio = new Audio('/audio/Respawn-theme.mp3')
  anthemAudio.loop = true
})

onBeforeUnmount(() => {
  if (anthemAudio) {
    anthemAudio.pause()
    anthemAudio = null
  }
})

const toggleAnthem = async () => {
  if (!anthemAudio) return
  if (isPlaying.value) {
    anthemAudio.pause()
    isPlaying.value = false
  } else {
    try {
      await anthemAudio.play()
      isPlaying.value = true
    } catch (err) {
      console.error(err)
    }
  }
}
</script>

<template>
  <div class="about">
    <h2>Respawn</h2>
    <p>
      Start where you are. You do not need to have everything figured out to take the next step.
    </p>

    <h3>Project Respawn</h3>
    <p>
      Project Respawn helps people rebuild social confidence through gaming, community, and
      real-life progression.
    </p>
    <p>
      Respawn your confidence. Re-enter the world stronger.
    </p>

    <!-- Simple music control, just before “What this is” -->
    <button
      type="button"
      class="anthem-toggle"
      @click="toggleAnthem"
      :aria-pressed="isPlaying"
      aria-label="Toggle Respawn theme music"
    >
      <span v-if="!isPlaying">🎵 Play Respawn theme</span>
      <span v-else>🔇 Pause Respawn theme</span>
    </button>

    <h3>What this is</h3>
    <p>
      In games, a respawn is a second chance. You load back in, learn from the last round, and keep
      moving. We believe real life should work like that too.
    </p>
    <p>
      Project Respawn is a gaming-powered platform and community built to help people grow their
      social confidence, find their people, and make progress that feels real.
    </p>
    <p>
      Start where you are. You do not need to have everything figured out to take the next step.
    </p>
    <p>
      Meet people, join communities, and build confidence through shared challenges and support.
    </p>
    <p>
      Turn growth into something practical through quests, momentum, and repeatable wins.
    </p>
    <p>
      “Your past is just the tutorial. Your real game starts now.”
    </p>
    <p>
      Start the next quest.
    </p>
  </div>
</template>

<style scoped>
.about {
  max-width: 720px;
  margin: 0 auto;
}

.anthem-toggle {
  margin: 1rem 0 1.5rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.35);
  color: inherit;
  cursor: pointer;
  font-size: 0.9rem;
}
.anthem-toggle:hover {
  background: rgba(0, 0, 0, 0.6);
}
</style>
