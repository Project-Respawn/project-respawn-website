<template>
  <div class="client-overview-content">
    <section class="workspace-overview">
      <article><span>NEXT SESSION</span><strong>{{ client.nextSession }}</strong><p>{{ client.nextSessionDetail }}</p></article>
      <article><span>QUEST PROGRESS</span><strong>{{ client.completedQuests }} / {{ client.totalQuests }}</strong><p>{{ client.questStatus }}</p></article>
      <article><span>SINCE LAST SESSION</span><strong>{{ client.activitiesSinceLastSession }}</strong><p>Shared activity summary</p></article>
      <article><span>REPORT</span><strong>{{ client.reportReady ? 'Ready' : 'Basic Summary' }}</strong><p>{{ client.reportReady ? 'Session preparation available' : 'Activity available' }}</p></article>
    </section>
    <section class="overview-detail-grid">
      <article><header><h2>Since Last Session</h2><small>7 days</small></header><dl><div><dt>Activities</dt><dd>{{ client.activityCount ?? 5 }}</dd></div><div><dt>Reflections</dt><dd>{{ client.reflectionCount ?? 3 }}</dd></div><div><dt>Confidence trend</dt><dd class="context-green">{{ client.confidenceTrend ?? '—' }}</dd></div></dl><p>Recent shared activity and progress are ready to review before the next session.</p></article>
      <article><header><h2>Current Quests</h2><button type="button" @click="$emit('open-quests')">View all →</button></header><ul><li v-for="quest in quests.slice(0, 3)" :key="quest.id"><span>{{ quest.title }}</span><strong :class="`status-${quest.status}`">{{ quest.statusLabel }}</strong></li></ul></article>
      <article><header><h2>Recent Reflections</h2></header><blockquote>“I noticed the activity became easier once I got started.”</blockquote><blockquote>“I want to keep building confidence before group activities.”</blockquote></article>
      <article><header><h2>Session Preparation</h2></header><strong>{{ client.reportReady ? 'Report ready' : 'Summary available' }}</strong><p>Review shared quest progress, reflections and changes since the previous session.</p></article>
    </section>
    <section class="overview-wide-card"><header><h2>Client Wants To Discuss</h2><small>3 points</small></header><p>Social confidence before group activities</p><p>What helped during the latest completed quest</p><p>Planning a manageable next step</p></section>
    <section class="overview-wide-card"><header><h2>Sharing &amp; Permissions</h2><button type="button" @click="$emit('open-sharing')">Review sharing →</button></header><p>The client controls what is shared. Quest completion, reflections, confidence check-ins and activity trends are currently available.</p></section>
  </div>
</template>
<script setup>
defineProps({ client: { type: Object, required: true }, quests: { type: Array, required: true } });
defineEmits(['open-quests', 'open-sharing']);
</script>
