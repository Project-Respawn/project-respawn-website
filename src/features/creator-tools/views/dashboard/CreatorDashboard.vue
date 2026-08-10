<template>
  <main class="creator-dashboard">
    <header class="creator-dashboard-hero">
      <p>Project Respawn</p>
      <h1>Creator Dashboard</h1>
      <span>Your starting point for creator channels, tools, growth features, and configuration.</span>
    </header>

    <section aria-labelledby="creator-sections-heading">
      <h2 id="creator-sections-heading">Creator Tools</h2>
      <div class="creator-card-grid">
        <router-link v-for="card in cards" :key="card.key" :to="{ name: card.routeName }" class="creator-card">
          <FeatureStatusBadge :status="card.status" />
          <h3>{{ card.label }}</h3>
          <p>{{ descriptions[card.key] }}</p>
          <span class="creator-card-action">Open {{ card.label }} →</span>
        </router-link>
      </div>
    </section>
  </main>
</template>

<script setup>
import FeatureStatusBadge from '../../../../components/FeatureStatusBadge/FeatureStatusBadge.vue'
import { creatorFeatureRegistry } from '../../config/creatorFeatureRegistry.js'

const descriptions = {
  twitch: 'Existing Twitch tools and the channel-focused feature roadmap.',
  discord: 'A preview of the future Discord creator area.',
  bots: 'Commands, alerts, TTS, moderation, and existing automation tools.',
  community: 'Future creator community management tools.',
  rewards: 'Future creator reward tools.',
  achievements: 'Future creator achievement tools.',
  events: 'Future creator event tools.',
  members: 'Future creator member tools.',
  analytics: 'Future creator analytics tools.',
  integrations: 'Existing connection settings and future provider integrations.',
  setup: 'The future guided Creator Tools setup experience.',
}
const cards = Object.entries(creatorFeatureRegistry)
  .filter(([key]) => key !== 'dashboard')
  .map(([key, value]) => ({ key, ...value }))
</script>

<style scoped>
.creator-dashboard { padding:32px; max-width:1400px; margin:0 auto; }.creator-dashboard-hero { padding:38px; margin-bottom:30px; border-radius:26px; background:linear-gradient(135deg,rgba(124,58,237,.34),rgba(236,72,153,.18)); border:1px solid rgba(255,255,255,.09); }.creator-dashboard-hero p { margin:0 0 8px; color:#d8b4fe; font-size:.75rem; letter-spacing:.13em; text-transform:uppercase; }.creator-dashboard-hero h1 { margin:0 0 12px; font-size:clamp(2.2rem,5vw,4rem); }.creator-dashboard-hero span { color:#e2e8f0; }.creator-dashboard section > h2 { margin:0 0 18px; }.creator-card-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; }.creator-card { min-height:190px; display:flex; flex-direction:column; align-items:flex-start; padding:22px; color:#fff; text-decoration:none; border-radius:18px; background:rgba(15,23,42,.72); border:1px solid rgba(255,255,255,.08); transition:.2s ease; }.creator-card:hover { transform:translateY(-2px); border-color:rgba(167,139,250,.55); }.creator-card h3 { margin:18px 0 8px; }.creator-card p { margin:0; color:#aebbd0; line-height:1.55; }.creator-card-action { margin-top:auto; padding-top:18px; color:#c4b5fd; font-weight:700; font-size:.86rem; }
</style>
