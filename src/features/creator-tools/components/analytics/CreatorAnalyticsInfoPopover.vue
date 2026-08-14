<template><span ref="root" class="analytics-info"><button type="button" :aria-expanded="open" :aria-label="label" @click.stop="open=!open" @mouseenter="open=true" @focus="open=true">i</button><span v-if="open" role="tooltip" @mouseleave="open=false">{{ text }}</span></span></template>
<script setup>
import { onBeforeUnmount,onMounted,ref } from 'vue'
defineProps({ text:{type:String,required:true},label:{type:String,default:'More information'} }); const open=ref(false);const root=ref(null)
const outside=e=>{if(!root.value?.contains(e.target))open.value=false};const escape=e=>{if(e.key==='Escape')open.value=false}
onMounted(()=>{document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape)});onBeforeUnmount(()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)})
</script>
