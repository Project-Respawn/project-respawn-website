<template>
  <header class="builder-toolbar">
    <RouterLink :to="{ name: 'CreatorOverlays' }" class="builder-brand"><img src="/src/assets/logo.png" alt=""><b>PROJECT<br><strong>RESPAWN</strong></b></RouterLink>
    <input :value="name" aria-label="Project name" @change="$emit('rename', $event.target.value)"><button class="title-chevron" aria-label="Overlay menu">⌄</button><button class="title-edit" aria-label="Rename overlay">♢</button>
    <span class="builder-badge">Work in progress</span><span class="builder-badge cyan">Server-backed draft</span>
    <div class="toolbar-actions">
      <button @click="$emit('import')">⇩ Import OBS Setup</button><button @click="$emit('export')">⇧ Export to OBS</button>
      <button :disabled="loading || saving" @click="$emit('save')">▣ {{ saving ? 'Saving…' : !revision ? 'Save to Project Respawn' : dirty ? 'Save changes' : 'Saved' }}</button><button @click="$emit('preview')">▶ Preview</button>
      <button class="publish" @click="$emit('publish')">➤ &nbsp; Publish Overlay</button>
    </div>
    <button class="obs-offline" type="button" @click="$emit('settings')">○ {{ obsStatusLabel }}</button>
  </header>
</template>
<script setup>defineProps({name:String,themeId:String,themes:Array,canUndo:Boolean,canRedo:Boolean,loading:Boolean,saving:Boolean,dirty:Boolean,revision:Number,obsStatusLabel:{type:String,default:'No OBS connection'}});defineEmits(['rename','theme','import','export','undo','redo','save','preview','publish','settings'])</script>
