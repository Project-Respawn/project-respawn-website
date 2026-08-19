<template>
  <section class="builder-editing-details" aria-label="Overlay editing details">
    <OverlayBuilderInspector :widget="widget" :suggestions="suggestions" :themes="themes" :theme-id="themeId" default-tab="settings" hide-tabs @change="$emit('change',$event)" @move="$emit('move',$event)"/>
    <OverlayBuilderInspector class="suggestions-panel" :widget="widget" :suggestions="suggestions" :themes="themes" :theme-id="themeId" default-tab="suggestions" hide-tabs @suggestion="$emit('suggestion',$event)"/>
  </section>
</template>
<script setup>
import OverlayBuilderInspector from './OverlayBuilderInspector.vue'
defineProps({widget:Object,suggestions:Array,themes:Array,themeId:String})
defineEmits(['change','suggestion','move'])
</script>
