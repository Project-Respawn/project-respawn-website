<template>
  <main class="creator-bots">
    <header><p>Creator Tools</p><h1>Bots</h1><span>Existing bot functionality now lives within Creator Tools.</span></header>
    <div class="bot-links">
      <router-link v-for="item in items" :key="item.name" :to="{ name:item.name }">
        <FeatureStatusBadge :status="item.status"/><h2>{{ item.label }}</h2><p>{{ item.description }}</p><span>Open →</span>
      </router-link>
    </div>
  </main>
</template>
<script setup>
import FeatureStatusBadge from '@/components/FeatureStatusBadge/FeatureStatusBadge.vue'
const items = [
  { name:'CreatorTwitch', label:'Twitch Overview', status:'preview', description:'Open the existing Twitch control centre and channel tool overview.' },
  { name:'CreatorTwitchCommands', label:'Basic Commands', status:'live', description:'Manage text chat commands for your Twitch channel.' },
  { name:'CreatorTwitchAlerts', label:'Twitch Alerts', status:'preview', description:'Open the existing alerts prototype.' },
  { name:'CreatorTwitchTts', label:'Text to Speech', status:'preview', description:'Configure Text to Speech (TTS) and the existing browser-source overlay.' },
  { name:'CreatorBotModeration', label:'Moderation', status:'preview', description:'Open the existing moderation prototype.' },
  { name:'CreatorBotAutomation', label:'Automation', status:'coming-soon', description:'The existing automation placeholder is preserved here.' },
  { name:'CreatorDiscord', label:'Discord', status:'preview', description:'Open the current Discord preview without presenting simulated servers as live.' },
  { name:'CreatorIntegrations', label:'Connections and Integrations', status:'preview', description:'Open the existing Twitch connection settings and integration area.' },
]
</script>
<style scoped>
.creator-bots { padding:32px; }.creator-bots header { padding:30px; border-radius:22px; background:linear-gradient(135deg,rgba(124,58,237,.3),rgba(15,23,42,.7)); border:1px solid rgba(255,255,255,.08); }.creator-bots header p { margin:0;color:#c4b5fd;text-transform:uppercase;letter-spacing:.12em;font-size:.72rem}.creator-bots header h1{margin:8px 0;font-size:3rem}.creator-bots header span{color:#cbd5e1}.bot-links{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-top:24px}.bot-links a{min-height:190px;padding:22px;display:flex;flex-direction:column;align-items:flex-start;color:#fff;text-decoration:none;background:rgba(15,23,42,.72);border:1px solid rgba(255,255,255,.08);border-radius:18px}.bot-links h2{margin:16px 0 8px;font-size:1.2rem}.bot-links p{color:#aebbd0}.bot-links a>span:last-child{margin-top:auto;color:#c4b5fd;font-weight:700}
</style>
