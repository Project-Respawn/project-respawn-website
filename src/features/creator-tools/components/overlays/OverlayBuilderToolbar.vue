<template>
  <header class="builder-toolbar">
    <RouterLink :to="{ name: 'CreatorOverlays' }" class="builder-brand"><span>PR</span><b>PROJECT<br>RESPAWN</b></RouterLink>
    <RouterLink :to="{ name: 'CreatorOverlayLibrary' }" class="library-link">All Overlays</RouterLink>
    <input :value="name" aria-label="Project name" @change="$emit('rename', $event.target.value)">
    <span class="builder-badge">Work in progress</span><span class="builder-badge cyan">Interactive demo</span>
    <label>Theme<select :value="themeId" @change="$emit('theme', $event.target.value)"><option v-for="theme in themes" :key="theme.id" :value="theme.id">{{ theme.name }}</option></select></label>
    <div class="toolbar-actions">
      <button @click="$emit('import')">⇩ Import OBS Setup</button><button @click="$emit('export')">⇧ Export to OBS</button>
      <button :disabled="!canUndo" @click="$emit('undo')">↶ Undo</button><button :disabled="!canRedo" @click="$emit('redo')">↷ Redo</button>
      <button @click="$emit('save')">▣ Save Demo</button><button @click="$emit('preview')">▶ Preview</button>
      <button class="publish" @click="$emit('publish')">➤ Publish Overlay</button><button aria-label="Widget settings" @click="$emit('settings')">⚙</button>
    </div>
    <span class="obs-offline">○ No OBS connection</span>
  </header>
</template>
<script setup>defineProps({name:String,themeId:String,themes:Array,canUndo:Boolean,canRedo:Boolean});defineEmits(['rename','theme','import','export','undo','redo','save','preview','publish','settings'])</script>
