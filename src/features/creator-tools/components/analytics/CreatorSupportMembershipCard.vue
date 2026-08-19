<template>
  <section class="analytics-panel membership-panel" aria-labelledby="membership-title">
    <header class="analytics-section-heading"><div><span class="planned-badge">Planned feature</span><h2 id="membership-title">Supporter Engagement</h2><p>Behavioral analytics only. Membership purchasing and management are not active.</p></div></header>
    <div class="analytics-mini-grid"><div v-for="item in data.metrics" :key="item[0]"><span>{{ item[0] }}</span><strong>{{ item[1] }}</strong></div></div>
    <div class="supporter-insights"><div v-for="item in data.insights" :key="item[0]"><span>{{ item[0] }}</span><strong>{{ item[1] }}</strong></div></div>
    <p class="analytics-note">{{ data.note }} Paying or holding a higher tier does not increase Community Score; only measurable behavior contributes.</p>
    <details><summary>How supporter analytics works</summary><p class="analytics-note">Supporter activity is based on attributable Project Respawn missions, events, retention and community participation. No external identity matching is inferred.</p></details>
    <div class="membership-earnings"><span>Creator payable membership earnings</span><strong>Contract-defined · not shown in this demo</strong><p>Internal Respawn revenue, margins and commercial attribution remain private.</p></div>
  </section>
</template>
<script setup>defineProps({data:{type:Object,required:true}})</script>
