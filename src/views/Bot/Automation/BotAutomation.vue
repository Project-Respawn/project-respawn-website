<template>
  <div class="bot-page">

    <BotSidebar :title="'Automation'" 
    :colourBrand1="'#0ea5e9'" 
    :colourBrand2="'#06b6d4'" 
    :colourBoxShadow="'rgba(124, 58, 237, 0.35)'" />

    <main class="bot-main">
      <section class="hero-card">
        <div class="hero-copy">
          <p class="eyebrow">Automation tools</p>
          <h2>Automation dashboard coming soon</h2>
          <p class="hero-text">
            This page is reserved for workflows, scheduled jobs, and cross-platform triggers between your website, Twitch, and Discord tools.
          </p>
        </div>

        <div class="hero-stats">
          <div class="mini-stat">
            <span class="mini-label">Status</span>
            <strong>Placeholder</strong>
          </div>
          <div class="mini-stat">
            <span class="mini-label">Focus</span>
            <strong>Automation</strong>
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
  name: 'BotAutomation'
}
</script>

<style scoped src="./BotAutomation.css"></style>