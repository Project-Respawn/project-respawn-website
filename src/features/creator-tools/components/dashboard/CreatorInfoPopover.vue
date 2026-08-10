<template>
  <span ref="root" class="creator-info">
    <button type="button" class="creator-info__button" aria-label="More information" :aria-expanded="open" @click.stop="open = !open" @mouseenter="open = true" @focus="open = true">i</button>
    <span v-if="open" class="creator-info__popover" role="tooltip" @mouseleave="open = false">{{ text }}</span>
  </span>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
defineProps({ text: { type: String, required: true } })
const open = ref(false); const root = ref(null)
function outside(event) { if (!root.value?.contains(event.target)) open.value = false }
function escape(event) { if (event.key === 'Escape') open.value = false }
onMounted(() => { document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape) })
onBeforeUnmount(() => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape) })
</script>
<style scoped>
.creator-info{position:relative;margin-left:auto}.creator-info__button{width:20px;height:20px;border:1px solid #8b90a3;border-radius:50%;background:transparent;color:#c9ccda;font-size:.72rem;font-weight:800;cursor:pointer}.creator-info__button:hover,.creator-info__button:focus-visible{color:#fff;border-color:#c084fc;outline:2px solid rgba(168,85,247,.28);outline-offset:2px}.creator-info__popover{position:absolute;z-index:40;right:0;top:28px;width:min(280px,70vw);padding:12px;border:1px solid rgba(192,132,252,.38);border-radius:10px;background:#171525;color:#e5e7eb;font-size:.78rem;line-height:1.45;box-shadow:0 16px 35px rgba(0,0,0,.45)}
</style>
