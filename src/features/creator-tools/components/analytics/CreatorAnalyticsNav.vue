<template>
  <nav class="analytics-subnav" aria-label="Analytics sections">
    <button v-for="item in sections" :key="item.key" type="button" :class="{ active: item.key === active }" :aria-current="item.key === active ? 'page' : undefined" @click="$emit('select', item)">
      {{ item.label }}<small v-if="!item.available">Planned</small>
    </button>
  </nav>
</template>
<script setup>defineProps({ sections: { type: Array, required: true }, active: { type: String, default: 'overview' } }); defineEmits(['select'])</script>
