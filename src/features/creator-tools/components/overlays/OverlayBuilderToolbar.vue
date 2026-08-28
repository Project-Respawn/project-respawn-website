<template>
  <header class="builder-toolbar">
    <RouterLink :to="{ name: 'CreatorOverlays' }" class="builder-brand"><img src="/src/assets/logo.png" alt=""><b>PROJECT<br><strong>RESPAWN</strong></b></RouterLink>
    <input :value="name" aria-label="Project name" @change="$emit('rename', $event.target.value)"><button class="title-chevron" aria-label="Overlay menu">⌄</button><button class="title-edit" aria-label="Rename overlay">♢</button>
    <span class="builder-badge">Work in progress</span><span class="builder-badge cyan">Server-backed draft</span>
    <div class="toolbar-actions">
      <button @click="$emit('import')">⇩ Import OBS Setup</button><button @click="$emit('export')">⇧ Export to OBS</button>
      <span class="draft-status" :class="{ dirty }">{{ dirty ? 'Unsaved changes' : 'Draft saved' }}</span>
      <button class="save-draft" :disabled="loading || saving || !dirty" @click="$emit('save')">▣ {{ saving ? 'Saving…' : 'Save Draft' }}</button>
      <button @click="$emit('preview')">▶ Preview</button>
      <button class="publish" :disabled="loading || saving || liveBusy || liveActionDisabled" @click="$emit('live')">➤ &nbsp; {{ liveActionLabel }}</button>
    </div>
    <button class="obs-offline" type="button" @click="$emit('settings')">○ {{ obsStatusLabel }}</button>
  </header>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({name:String,themeId:String,themes:Array,canUndo:Boolean,canRedo:Boolean,loading:Boolean,saving:Boolean,dirty:Boolean,revision:Number,hasActivePublication:Boolean,liveOutOfDate:Boolean,liveBusy:Boolean,obsStatusLabel:{type:String,default:'No OBS connection'}})
defineEmits(['rename','theme','import','export','undo','redo','save','preview','live','settings'])
const liveActionLabel = computed(() => !props.hasActivePublication ? 'Create Browser Source' : props.dirty ? 'Save & Update Live' : props.liveOutOfDate ? 'Update Live' : 'Live up to date')
const liveActionDisabled = computed(() => props.hasActivePublication && !props.dirty && !props.liveOutOfDate)
</script>

<style scoped>
.draft-status{color:#94a3b8;font-size:9px;font-weight:700}.draft-status.dirty{color:#fbbf24}.save-draft{border-color:rgba(139,92,246,.65)!important;color:#ede9fe!important}
</style>
