<template>
  <div v-if="card" class="locked-dialog-backdrop" @click.self="$emit('close')">
    <section ref="dialog" class="locked-dialog" role="dialog" aria-modal="true" :aria-labelledby="`${card.key}-locked-title`" tabindex="-1">
      <button class="locked-dialog__close" type="button" aria-label="Close dialog" @click="$emit('close')">×</button>
      <span class="locked-dialog__icon" aria-hidden="true">🔒</span><h2 :id="`${card.key}-locked-title`">{{ card.title }} is locked</h2>
      <p>{{ card.info }}</p><div class="locked-dialog__requirement"><span>{{ card.directRequirements?.length > 1 ? 'Feature requirements' : 'Feature requirement' }}</span><strong>{{ card.directRequirements?.map(step => step.label).join(' and ') }}</strong><small v-if="card.nextStep && !card.unmet.includes(card.nextStep.id)">{{ card.directRequirements?.[0]?.label }} first requires {{ card.nextStep.label }}. Only one step will be completed.</small><small v-else>{{ card.nextStep?.description }}</small></div>
      <p class="locked-dialog__demo">This is a frontend simulation. No real platform connection or configuration will be made.</p>
      <p>For this demo, mark <strong>{{ card.nextStep?.label }}</strong> as completed?</p>
      <div class="locked-dialog__actions"><button class="creator-button creator-button--primary" type="button" @click="$emit('complete', card.nextStep.id)">Yes, mark complete</button><button class="creator-button" type="button" @click="$emit('close')">Not yet</button></div>
    </section>
  </div>
</template>
<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
const props=defineProps({card:Object}); const emit=defineEmits(['close','complete']); const dialog=ref(null)
function keydown(e){if(e.key==='Escape')emit('close')}
watch(()=>props.card,async(value)=>{if(value){await nextTick();dialog.value?.focus()}})
onMounted(()=>document.addEventListener('keydown',keydown));onBeforeUnmount(()=>document.removeEventListener('keydown',keydown))
</script>
