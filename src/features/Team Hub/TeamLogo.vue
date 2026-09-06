<template><div class="team-avatar" :style="sizeStyle"><img v-if="src" :src="src" :alt="`${name} logo`" /><span v-else aria-hidden="true">{{ initials }}</span></div></template>
<script setup>
import { computed } from 'vue';
const props = defineProps({ src: { type: String, default: '' }, name: { type: String, required: true }, size: { type: Number, default: 64 } });
const initials = computed(() => props.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'TH');
const sizeStyle = computed(() => ({ '--team-logo-size': `${props.size}px` }));
</script>
<style scoped>.team-avatar{display:grid;flex:0 0 var(--team-logo-size);width:var(--team-logo-size);height:var(--team-logo-size);place-items:center;overflow:hidden;border:1px solid #58437b;border-radius:16px;background:#171322;color:#a9ff38;font-weight:800}.team-avatar img{width:100%;height:100%;object-fit:contain}.team-avatar span{font-size:calc(var(--team-logo-size) * .32)}</style>
