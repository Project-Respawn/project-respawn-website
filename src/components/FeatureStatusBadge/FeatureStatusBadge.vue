<template>
  <span class="feature-status" :class="`feature-status--${status}`">{{ label }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ status: { type: String, required: true } })
const label = computed(() => ({ live: 'Live', preview: 'Preview', 'coming-soon': 'Coming soon' }[props.status] || props.status))
</script>

<style scoped>
.feature-status { display:inline-flex; align-items:center; padding:.25rem .55rem; border:1px solid transparent; border-radius:999px; font-size:.68rem; font-weight:800; letter-spacing:.06em; text-transform:uppercase; }
.feature-status--live { color:#86efac; background:rgba(34,197,94,.13); border-color:rgba(34,197,94,.3); }
.feature-status--preview { color:#fde68a; background:rgba(245,158,11,.13); border-color:rgba(245,158,11,.3); }
.feature-status--coming-soon { color:#cbd5e1; background:rgba(148,163,184,.12); border-color:rgba(148,163,184,.25); }
</style>
