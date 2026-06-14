<template>
  <div class="bot-page">
    
    <BotSidebar :title="'Discord Dashboard'" 
    :colourBrand1="'#5865f2'" 
    :colourBrand2="'#8b5cf6'" 
    :colourBoxShadow="'rgba(124, 58, 237, 0.35)'" />
    
    
    <main class="bot-main">
      <section class="hero-card">
        <div class="hero-copy">
          <p class="eyebrow">Discord tools</p>
          <h2>Discord dashboard coming soon</h2>
          <p class="hero-text">
            This page is reserved for Discord onboarding, permissions, moderation, and community tools.
          </p>
        </div>

        <div class="hero-stats">
          <div class="mini-stat">
            <span class="mini-label">Status</span>
            <strong>Placeholder</strong>
          </div>
          <div class="mini-stat">
            <span class="mini-label">Focus</span>
            <strong>Discord Tools</strong>
          </div>
          <div class="mini-stat">
            <span class="mini-label">Next Step</span>
            <strong>Build Later</strong>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
  import BotSidebar from '@/components/BotSidebar/BotSidebar.vue';
</script>

<script>
export default {
  name: 'BotDiscord'
}
</script>

<style scoped src="./BotDiscord.css"></style>