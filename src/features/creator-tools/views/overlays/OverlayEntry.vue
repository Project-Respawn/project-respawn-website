<template><main class="overlay-entry" aria-live="polite"><p>Opening Overlay Builder…</p></main></template>
<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { resolveEntryOverlayId } from '../../overlays/overlayStore.js'

const router = useRouter()
onMounted(() => {
  const overlayId = resolveEntryOverlayId()
  router.replace(overlayId
    ? { name: 'CreatorOverlayEditor', params: { overlayId } }
    : { name: 'CreatorOverlayLibrary' })
})
</script>
<style scoped>.overlay-entry{min-height:100vh;display:grid;place-items:center;background:#07111d;color:#c4b5fd}</style>
