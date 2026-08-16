<template>
  <section class="setup-panel dashboard-panel" aria-labelledby="setup-title"><header class="panel-heading"><div><h2 id="setup-title">Creator Setup</h2><span>{{ progress }}% Complete</span></div><div class="setup-progress" role="progressbar" aria-label="Creator setup progress" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="progress"><span :style="{width:`${progress}%`}"></span></div></header>
    <ol class="setup-list"><li v-for="step in steps" :key="step.id" :class="{complete:isComplete(step.id), blocked:isBlocked(step)}"><button type="button" :disabled="isComplete(step.id) || isBlocked(step)" @click="$emit('complete',step.id)"><span class="setup-check" aria-hidden="true">{{ isComplete(step.id)?'✓':'' }}</span><span><strong>{{ step.label }}</strong><small>{{ isBlocked(step)?`Requires ${parentLabel(step)}`:step.description }}</small></span><span v-if="isBlocked(step)" aria-label="Locked">🔒</span><span v-else-if="!isComplete(step.id)" aria-hidden="true">›</span></button></li></ol>
  </section>
</template>
<script setup>
import { isComplete as complete } from '../../views/dashboard/creatorDashboardDemoState.js'
const props=defineProps({steps:Array,state:Object,progress:Number});defineEmits(['complete']);const isComplete=(id)=>complete(props.state,id);const isBlocked=(step)=>step.requires.some(id=>!isComplete(id));const parentLabel=(step)=>props.steps.find(s=>step.requires.includes(s.id)&&!isComplete(s.id))?.label
</script>
