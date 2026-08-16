<template><nav class="discord-demo-nav" aria-label="Discord demo areas"><button v-for="item in sections" :key="item.key" type="button" :class="{active:item.key===active}" @click="$emit('select',item.key)">{{ item.label }}</button></nav></template>
<script setup>defineProps({sections:Array,active:String});defineEmits(['select'])</script>
