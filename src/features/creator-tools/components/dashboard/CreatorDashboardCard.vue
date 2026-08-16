<template>
  <article class="dashboard-card" :class="[`dashboard-card--${card.state}`, { 'dashboard-card--metric': metric }]" tabindex="0" role="button" :aria-label="ariaLabel" @click="$emit('activate', card)" @keydown.enter.prevent="$emit('activate', card)" @keydown.space.prevent="$emit('activate', card)">
    <header class="dashboard-card__header"><span class="dashboard-card__icon" aria-hidden="true">{{ icons[card.icon] }}</span><h2>{{ card.title }}</h2><CreatorInfoPopover :text="card.info" /></header>
    <template v-if="card.state === 'locked'">
      <strong class="dashboard-card__locked">Locked</strong><p>{{ card.lockedText || `Complete ${card.nextStep?.label} to unlock.` }}</p><span class="dashboard-card__requirements">View requirements <b>→</b></span>
    </template>
    <template v-else-if="card.state === 'empty'">
      <div v-if="metric" class="dashboard-card__value">—</div><p>{{ card.emptyText }}</p><span class="dashboard-card__action">Get started <b>→</b></span>
    </template>
    <template v-else-if="metric">
      <div class="dashboard-card__value">{{ card.value }} <small v-if="card.suffix">{{ card.suffix }}</small></div><p>{{ card.detail }}</p><span class="dashboard-card__action">View details <b>→</b></span>
    </template>
    <slot v-else />
  </article>
</template>
<script setup>
import { computed } from 'vue'; import CreatorInfoPopover from './CreatorInfoPopover.vue'
const props = defineProps({ card: { type: Object, required: true }, metric: Boolean }); defineEmits(['activate'])
const icons = { members:'♟', pulse:'⌁', new:'✦', chart:'▥', bolt:'ϟ', calendar:'▦', gift:'🎁', trophy:'♜', bot:'◉' }
const ariaLabel = computed(() => `${props.card.title}. ${props.card.state === 'locked' ? `Locked. ${props.card.lockedText || ''}` : props.card.state === 'empty' ? `Available. ${props.card.emptyText}` : `Active. ${props.card.detail || ''}`}`)
</script>
