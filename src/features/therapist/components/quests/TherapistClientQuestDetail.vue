<template>
  <article v-if="quest" class="quest-detail-panel">
    <header><div><h2>{{ quest.title }}</h2><p>Due: {{ quest.dueDate }} <span>•</span> Assigned: {{ quest.assignedDate }}</p></div><span :class="`quest-status status-${quest.status}`">{{ quest.statusLabel }}</span><strong>+{{ quest.points }} RP</strong></header>
    <section class="quest-detail-section"><span class="detail-icon purple">☵</span><div><h3>Therapist instructions</h3><p>{{ quest.instructions }}</p></div><button type="button" @click="$emit('action', 'edit')">✎&nbsp; Edit quest</button></section>
    <section class="quest-detail-section quest-progress-detail"><span class="detail-icon blue">⌁</span><div><h3>Client progress</h3><small>Status</small><b>{{ quest.progress }}</b><small>Progress notes</small><p>{{ quest.progressNotes }}</p></div><div class="confidence"><small>Confidence (optional)</small><p><span>Before<strong>{{ quest.confidenceBefore ?? '—' }}</strong></span><span>After<strong>{{ quest.confidenceAfter ?? '—' }}</strong></span></p></div></section>
    <div class="quest-detail-bottom">
      <div>
        <section class="quest-detail-section"><span class="detail-icon green">☵</span><div><h3>Client reflection</h3><p>{{ quest.reflection }}</p></div><button type="button" @click="$emit('action', 'reflection')">Add reflection</button></section>
        <section class="quest-detail-section"><span class="detail-icon blue">◷</span><div class="quest-history"><h3>Quest history</h3><p v-for="entry in quest.history" :key="entry.join('-')"><span>○</span>{{ entry[0] }} <time>{{ entry[1] }}</time></p></div></section>
      </div>
      <aside class="quest-actions"><h3>Actions</h3><button v-if="quest.status !== 'completed'" class="complete" @click="$emit('action', 'complete')">✓&nbsp; Mark as completed</button><button v-if="quest.status === 'active'" class="pause" @click="$emit('action', 'pause')">Ⅱ&nbsp; Pause quest</button><button class="edit" @click="$emit('action', 'edit')">✎&nbsp; Edit quest</button><button v-if="quest.status !== 'completed'" class="end" @click="$emit('action', 'end')">□&nbsp; End quest</button></aside>
    </div>
  </article>
  <article v-else class="quest-detail-panel quest-detail-empty"><h2>Select a quest</h2><p>Choose a quest to review its details.</p></article>
</template>

<script setup>
defineProps({ quest: { type: Object, default: null } });
defineEmits(['action']);
</script>
