<template>
  <aside class="client-context-panel">
    <RouterLink to="/therapist/clients" class="client-context-back">←&nbsp; Back to all clients</RouterLink>

    <div class="client-switcher">
      <label>
        <span aria-hidden="true">⌕</span>
        <input v-model.trim="query" type="search" placeholder="Search or switch client..." aria-label="Search or switch client" @focus="open = true" />
      </label>
      <div v-if="open && filteredClients.length" class="client-switcher-results">
        <button v-for="option in filteredClients" :key="option.id" type="button" @click="selectClient(option.id)">
          <span>{{ option.initials }}</span>{{ option.name }}
        </button>
      </div>
    </div>

    <section class="client-context-card client-context-identity">
      <div class="client-context-avatar">{{ client.initials }}</div>
      <div><h2>{{ client.name }}</h2><strong class="context-green">♙ Sharing active</strong><p>Connected for {{ client.connectedFor }}</p></div>
    </section>

    <section class="client-context-session">
      <span class="context-icon">▣</span><div><small>NEXT SESSION</small><strong>{{ client.nextSession }}</strong><span>{{ client.nextSessionDetail }}</span></div>
    </section>

    <section class="client-context-card">
      <h3>QUEST SNAPSHOT</h3>
      <dl class="context-stat-list">
        <div><dt><i class="context-green">✓</i> Active quests</dt><dd class="context-green">{{ stats.active }}</dd></div>
        <div><dt><i class="context-blue">✓</i> Completed this week</dt><dd class="context-blue">{{ stats.completed }}</dd></div>
        <div><dt><i class="context-orange">!</i> Overdue quests</dt><dd class="context-orange">{{ stats.overdue }}</dd></div>
      </dl>
      <button type="button" class="context-primary" @click="$emit('assign')">＋&nbsp; Assign Quest</button>
    </section>

    <section class="client-context-card">
      <h3>SINCE LAST SESSION (7 DAYS)</h3>
      <dl class="context-stat-list">
        <div><dt>⌁&nbsp; Activities</dt><dd>{{ client.activityCount ?? 5 }}</dd></div>
        <div><dt>☵&nbsp; Reflections</dt><dd>{{ client.reflectionCount ?? 3 }}</dd></div>
        <div><dt>☆&nbsp; Confidence check-ins</dt><dd class="context-orange">{{ client.confidenceChecks ?? 4 }}</dd></div>
        <div><dt>☵&nbsp; Discussion points</dt><dd class="context-green">{{ client.discussionCount ?? 3 }}</dd></div>
      </dl>
      <button type="button" class="context-outline" @click="$emit('overview')">View client overview</button>
    </section>

    <section class="client-context-permissions">
      <span>♢</span><p>{{ client.name.split(' ')[0] }} controls what you can see.<br />You can request access to more.</p>
      <button type="button" @click="$emit('request-access')">Request additional access →</button>
    </section>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({ client: { type: Object, required: true }, clients: { type: Array, required: true }, stats: { type: Object, required: true } });
const emit = defineEmits(['switch-client', 'assign', 'overview', 'request-access']);
const query = ref('');
const open = ref(false);
const filteredClients = computed(() => props.clients.filter((item) => item.id !== props.client.id && item.name.toLowerCase().includes(query.value.toLowerCase())));
function selectClient(clientId) { query.value = ''; open.value = false; emit('switch-client', clientId); }
</script>
