<template>
  <svg class="creator-feature-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path v-for="(path, index) in paths[name] || paths.integrations" :key="index" :d="path" />
  </svg>
</template>

<script setup>
defineProps({ name: { type: String, required: true } })
const paths = {
  dashboard: ['M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z'],
  setup: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M4.9 14.8 3 16l2 3.5 2.2-1a8 8 0 0 0 2.1 1.2l.2 2.3h5l.2-2.3a8 8 0 0 0 2.1-1.2l2.2 1 2-3.5-1.9-1.2a8 8 0 0 0 0-2.6L21 11l-2-3.5-2.2 1a8 8 0 0 0-2.1-1.2L14.5 5h-5l-.2 2.3a8 8 0 0 0-2.1 1.2l-2.2-1L3 11l1.9 1.2a8 8 0 0 0 0 2.6z'],
  twitch: ['M5 3h16v11l-5 5h-4l-3 3v-3H5V3z', 'M9 7v6M15 7v6'],
  discord: ['M7 7.5A12 12 0 0 1 17 7.5c1.4 2 2.3 4.3 2.5 6.8A12 12 0 0 1 15 17l-1-1.5M17 17l1 2-3-1.5A12 12 0 0 1 9 17l-3 1.5 1-2A12 12 0 0 1 4.5 14.3 15 15 0 0 1 7 7.5z', 'M8.5 12.5h.01M15.5 12.5h.01'],
  overlays: ['M4 5h16v12H4zM9 21h6M12 17v4'], bots: ['M7 8h10a3 3 0 0 1 3 3v7H4v-7a3 3 0 0 1 3-3zM12 8V5M10 5h4M8 13h.01M16 13h.01'],
  community: ['M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 11a2.5 2.5 0 1 0 0-5M3 19a5 5 0 0 1 10 0M14 14a4 4 0 0 1 7 3'], events: ['M5 5h14v15H5zM8 3v4M16 3v4M5 9h14'],
  rewards: ['M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7H8.5a2 2 0 1 1 2-2c0 1.1 1.5 2 1.5 2zM12 7h3.5a2 2 0 1 0-2-2c0 1.1-1.5 2-1.5 2z'], achievements: ['M8 4h8v5a4 4 0 0 1-8 0V4zM8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6v4'],
  members: ['M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM15 11a3 3 0 1 0 0-6M2 21a7 7 0 0 1 14 0M15 15a6 6 0 0 1 7 6'], analytics: ['M4 20V10M10 20V4M16 20v-7M22 20H2'], integrations: ['M9 15l6-6M7.5 17.5l-1 1a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0M16.5 6.5l1-1a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0'],
}
</script>

<style scoped>.creator-feature-icon{width:20px;height:20px;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}</style>
