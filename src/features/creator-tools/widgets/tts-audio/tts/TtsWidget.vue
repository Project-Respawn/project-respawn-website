<template><div v-if="event" class="demo-widget tts-widget" :style="widgetStyle(widget.settings)"><div v-if="widget.settings.showAvatar" class="avatar">🔊</div><div><span v-if="widget.settings.showStatus" class="widget-kicker">{{ event.payload?.status || (runtimeMode === 'browser-source' ? 'READY' : 'SIMULATED · READY') }}</span><b v-if="widget.settings.showSpeaker">{{ event.actor?.displayName }}</b><p>{{ event.payload?.text }}</p></div></div></template>
<script setup>
import { watch } from 'vue';
import { widgetStyle, useWidgetEvents } from '../../widgetHelpers.js';
import { browserTtsQueue } from '../../../overlays/ttsSpeechQueue.js';
const props = defineProps({ widget: { type: Object, required: true }, runtimeMode: { type: String, default: 'editor-preview' }, runtimeConfig: { type: Object, default: null } });
const event = useWidgetEvents(props.widget, props.runtimeMode==='browser-source'?null:{ actor: { displayName: 'VoiceTester' }, payload: { text: 'Visual preview only. Speech playback is not connected.', status: 'SIMULATED' } });
watch(event, next => {
  if (props.runtimeMode !== 'browser-source') return;
  browserTtsQueue.enqueue(next, props.runtimeConfig?.tts || {}, props.widget);
}, { flush: 'sync' });
</script>
