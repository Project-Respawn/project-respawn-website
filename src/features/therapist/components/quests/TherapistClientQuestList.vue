<template>
  <section class="quest-master">
    <header class="quest-controls">
      <label><input v-model.trim="query" type="search" placeholder="Search quests..." aria-label="Search quests" /></label>
      <button v-for="option in filters" :key="option.id" type="button" :class="{ active: filter === option.id }" @click="filter = option.id">
        {{ option.label }} <span>{{ count(option.id) }}</span>
      </button>
      <select v-model="sort" aria-label="Sort quests"><option value="due">Sort by: Due date</option><option value="title">Sort by: Title</option><option value="status">Sort by: Status</option></select>
    </header>
    <div class="quest-list">
      <button v-for="quest in visibleQuests" :key="quest.id" type="button" class="quest-list-item" :class="[{ selected: quest.id === selectedId }, `status-${quest.status}`]" @click="$emit('select', quest.id)">
        <i>{{ quest.status === 'completed' ? '✓' : quest.status === 'overdue' || quest.status === 'active' ? '!' : '' }}</i>
        <span><strong>{{ quest.title }}</strong><small>{{ quest.dueLabel }} <b>· &nbsp;+{{ quest.points }} RP</b></small></span>
        <em>{{ quest.statusLabel }}</em><b>›</b>
      </button>
      <p v-if="!visibleQuests.length" class="quest-list-empty">No quests match these filters.</p>
    </div>
    <footer>Showing {{ visibleQuests.length }} of {{ quests.length }} quests</footer>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
const props = defineProps({ quests: { type: Array, required: true }, selectedId: { type: String, default: '' } });
defineEmits(['select']);
const query = ref(''); const filter = ref('current'); const sort = ref('due');
const filters = [{ id: 'current', label: 'Current' }, { id: 'completed', label: 'Completed' }, { id: 'overdue', label: 'Overdue' }, { id: 'all', label: 'All' }];
function matches(quest, id) { return id === 'all' || (id === 'current' ? ['active', 'upcoming'].includes(quest.status) : quest.status === id); }
function count(id) { return props.quests.filter((quest) => matches(quest, id)).length; }
const visibleQuests = computed(() => {
  const items = props.quests.filter((quest) => matches(quest, filter.value) && quest.title.toLowerCase().includes(query.value.toLowerCase()));
  return items.sort((a, b) => sort.value === 'title' ? a.title.localeCompare(b.title) : sort.value === 'status' ? a.status.localeCompare(b.status) : a.dueDate.localeCompare(b.dueDate));
});
</script>
