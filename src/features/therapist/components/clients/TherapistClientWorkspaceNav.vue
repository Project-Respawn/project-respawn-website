<template>
  <nav class="workspace-tabs" aria-label="Client workspace">
    <button v-for="tab in tabs" :key="tab.id" type="button" :class="{ active: modelValue === tab.id }" @click="$emit('update:modelValue', tab.id)">
      <span>{{ tab.icon }}</span>{{ tab.label }} <small v-if="tab.premium">PREMIUM</small>
    </button>
  </nav>
</template>

<script setup>
defineProps({ modelValue: { type: String, required: true } });
defineEmits(['update:modelValue']);
const tabs = [
  { id: 'overview', label: 'Overview', icon: '◆' }, { id: 'quests', label: 'Quests', icon: '▣' },
  { id: 'activity', label: 'Activity', icon: '⌁' }, { id: 'insights', label: 'Insights', icon: '✧', premium: true },
  { id: 'reports', label: 'Reports', icon: '▤', premium: true }, { id: 'sharing', label: 'Sharing', icon: '♙' },
];
</script>
