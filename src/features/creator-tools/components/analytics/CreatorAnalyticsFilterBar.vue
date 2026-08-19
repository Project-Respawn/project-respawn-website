<template>
  <section class="analytics-filters" aria-label="Analytics filters">
    <label>Time<select :value="state.time" @change="$emit('update','time',$event.target.value)"><option v-for="item in times" :key="item">{{ item }}</option></select></label>
    <label>Data source<select :value="state.source" @change="$emit('update','source',$event.target.value)"><option v-for="item in sources" :key="item">{{ item }}</option></select></label>
    <label>Audience<select :value="state.audience" @change="$emit('update','audience',$event.target.value)"><option v-for="item in audiences" :key="item">{{ item }}</option></select></label>
    <fieldset><legend>Demo state</legend><button v-for="(item,key) in presets" :key="key" type="button" :aria-pressed="state.preset===key" :class="{active:state.preset===key}" @click="$emit('preset',key)">{{ item.label }}</button></fieldset>
    <button class="analytics-reset" type="button" @click="$emit('reset')">Reset Demo</button>
  </section>
</template>
<script setup>defineProps({ state:Object, times:Array, sources:Array, audiences:Array, presets:Object }); defineEmits(['update','preset','reset'])</script>
