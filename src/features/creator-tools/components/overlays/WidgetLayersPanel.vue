<template>
  <section class="layers-panel" aria-label="Widget layers">
    <header><p class="overlay-kicker">Layers</p><span>{{ widgets.length }} widgets</span></header>
    <ol>
      <li v-for="widget in ordered" :key="widget.id" :class="{ selected: widget.id === selectedId }">
        <button type="button" class="layer-select" @click="$emit('select', widget.id)">
          <span>{{ widget.enabled ? '●' : '○' }}</span>{{ widget.name }}<small>{{ widget.locked ? 'Locked' : 'Editable' }}</small>
        </button>
        <div>
          <button type="button" :aria-label="`${widget.enabled ? 'Hide' : 'Show'} ${widget.name}`" @click="$emit('action', 'visibility', widget.id)">{{ widget.enabled ? 'Hide' : 'Show' }}</button>
          <button type="button" :aria-label="`${widget.locked ? 'Unlock' : 'Lock'} ${widget.name}`" @click="$emit('action', 'lock', widget.id)">{{ widget.locked ? 'Unlock' : 'Lock' }}</button>
          <button type="button" aria-label="Bring forward" @click="$emit('action', 'forward', widget.id)">↑</button>
          <button type="button" aria-label="Send backward" @click="$emit('action', 'backward', widget.id)">↓</button>
          <button type="button" aria-label="Bring to front" @click="$emit('action', 'front', widget.id)">Front</button>
          <button type="button" aria-label="Send to back" @click="$emit('action', 'back', widget.id)">Back</button>
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
