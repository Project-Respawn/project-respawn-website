<template>
  <section class="layers-panel" aria-label="Widget layers">
    <header><p class="overlay-kicker">☷ &nbsp; Layers</p><button type="button" aria-label="Add layer">＋</button></header>
    <ol>
      <li v-for="widget in ordered" :key="widget.id" :class="{ selected: widget.id === selectedId }">
        <button type="button" class="layer-select" @click="$emit('select', widget.id)">
          <span class="layer-grip">⠿</span>{{ widget.name }}
        </button>
        <div>
          <button type="button" :aria-label="`${widget.enabled ? 'Hide' : 'Show'} ${widget.name}`" @click="$emit('action', 'visibility', widget.id)">{{ widget.enabled ? '◉' : '○' }}</button>
          <button type="button" :aria-label="`${widget.locked ? 'Unlock' : 'Lock'} ${widget.name}`" @click="$emit('action', 'lock', widget.id)">{{ widget.locked ? '▣' : '♙' }}</button>
        </div>
      </li>
    </ol>
  </section>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({ widgets: { type: Array, required: true }, selectedId: String })
defineEmits(['select', 'action'])
const ordered = computed(() => [...props.widgets].sort((a, b) => b.zIndex - a.zIndex))
</script>
