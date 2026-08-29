<template><AlertPresentation v-if="event && config" :event="event" :configuration="config" :style="widgetStyle(widget.settings)" :play-audio="runtimeMode === 'browser-source'" :exiting="exiting" /></template>
<script setup>
import { computed } from 'vue'
import AlertPresentation from '../../../components/overlays/AlertPresentation.vue'
import { EVENT_KIND } from '../../../overlays/alertPresentation.js'
import { widgetStyle, useWidgetEvents } from '../../widgetHelpers.js'
const props=defineProps({widget:{type:Object,required:true},runtimeMode:{type:String,default:'editor-preview'},runtimeConfig:{type:Object,default:null},exiting:{type:Boolean,default:false}})
const event=useWidgetEvents(props.widget,props.runtimeMode==='browser-source'?null:{id:'editor-sample',topic:'stream.follow',actor:{displayName:'NovaRespawn'},payload:{}})
const kind=computed(()=>EVENT_KIND[event.value?.topic])
const config=computed(()=>props.runtimeConfig?.alerts?.[kind.value]||null)
</script>
