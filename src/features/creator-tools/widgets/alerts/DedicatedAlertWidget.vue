<template>
  <AlertPresentation v-if="event && config" :event="event" :configuration="config" :style="widgetStyle(widget.settings)" :play-audio="runtimeMode === 'browser-source'" :exiting="exiting" />
  <div v-else-if="runtimeMode !== 'browser-source'" :style="widgetStyle(widget.settings)">{{ alert.name }} · Preview in Alert Settings</div>
</template>
<script setup>
import { computed } from 'vue'
import AlertPresentation from '../../components/overlays/AlertPresentation.vue'
import { ALERT_WIDGETS } from '../../overlays/alertWidgets.js'
import { previewEventForKind } from '../../overlays/alertPresentation.js'
import { widgetStyle, useWidgetEvents } from '../widgetHelpers.js'
const props = defineProps({ widget: { type: Object, required: true }, runtimeMode: { type: String, default: 'editor-preview' }, runtimeConfig: { type: Object, default: null }, exiting: Boolean })
const alert = ALERT_WIDGETS[props.widget.type]
const event = useWidgetEvents({ ...props.widget, dataSource: { topics: [alert.topic] } }, props.runtimeMode === 'browser-source' ? null : previewEventForKind(alert.kind))
const config = computed(() => props.runtimeConfig?.alerts?.[alert.kind] || null)
</script>
