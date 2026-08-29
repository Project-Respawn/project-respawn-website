<template>
  <div class="alert-presentation" :class="animationClass" :style="style" data-alert-presentation>
    <img v-if="resolved.config.mediaUrl && !mediaFailed" class="alert-presentation__media" :src="resolved.config.mediaUrl" alt="" @error="mediaFailed = true">
    <div class="alert-presentation__copy">
      <strong v-if="resolved.title">{{ resolved.title }}</strong>
      <p v-if="resolved.message">{{ resolved.message }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { createAlertAudioLifecycle } from '../../overlays/alertAudioLifecycle.js'
import { resolveAlertPresentation } from '../../overlays/alertPresentation.js'

const props = defineProps({ event: { type: Object, required: true }, configuration: { type: Object, required: true }, style: { type: Object, default: () => ({}) }, playAudio: { type: Boolean, default: false }, exiting: { type: Boolean, default: false } })
const mediaFailed = ref(false), audio = createAlertAudioLifecycle()
const resolved = computed(() => resolveAlertPresentation(props.event, props.configuration))
const animationClass = computed(() => `alert-animation--${props.exiting ? `exit-${resolved.value.config.exitAnimation}` : `entry-${resolved.value.config.entryAnimation}`}`)
watch(() => resolved.value.config.mediaUrl, () => { mediaFailed.value = false })
watch([() => props.event?.id, () => props.playAudio], () => { if (props.playAudio) void audio.play(resolved.value.config.soundUrl, resolved.value.config.volume); else audio.stop() }, { immediate: true })
onBeforeUnmount(() => audio.stop())
</script>

<style scoped>
.alert-presentation{box-sizing:border-box;width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:24px;overflow:hidden;padding:24px;color:#fff;text-align:center}.alert-presentation__media{display:block;width:min(34%,220px);height:100%;object-fit:contain}.alert-presentation__copy{min-width:0}.alert-presentation strong{display:block;font-size:2em;overflow-wrap:anywhere}.alert-presentation p{margin:.45em 0 0;font-size:1.05em;overflow-wrap:anywhere}
.alert-animation--entry-fade{animation:alert-fade-in .35s ease-out both}.alert-animation--entry-slide-up{animation:alert-up-in .35s ease-out both}.alert-animation--entry-slide-down{animation:alert-down-in .35s ease-out both}.alert-animation--entry-slide-left{animation:alert-left-in .35s ease-out both}.alert-animation--entry-slide-right{animation:alert-right-in .35s ease-out both}.alert-animation--entry-scale{animation:alert-scale-in .35s ease-out both}
.alert-animation--exit-fade{animation:alert-fade-out .3s ease-in both}.alert-animation--exit-slide-up{animation:alert-up-out .3s ease-in both}.alert-animation--exit-slide-down{animation:alert-down-out .3s ease-in both}.alert-animation--exit-slide-left{animation:alert-left-out .3s ease-in both}.alert-animation--exit-slide-right{animation:alert-right-out .3s ease-in both}.alert-animation--exit-scale{animation:alert-scale-out .3s ease-in both}
@keyframes alert-fade-in{from{opacity:0}}@keyframes alert-fade-out{to{opacity:0}}@keyframes alert-up-in{from{opacity:0;transform:translateY(28px)}}@keyframes alert-up-out{to{opacity:0;transform:translateY(-28px)}}@keyframes alert-down-in{from{opacity:0;transform:translateY(-28px)}}@keyframes alert-down-out{to{opacity:0;transform:translateY(28px)}}@keyframes alert-left-in{from{opacity:0;transform:translateX(28px)}}@keyframes alert-left-out{to{opacity:0;transform:translateX(-28px)}}@keyframes alert-right-in{from{opacity:0;transform:translateX(-28px)}}@keyframes alert-right-out{to{opacity:0;transform:translateX(28px)}}@keyframes alert-scale-in{from{opacity:0;transform:scale(.82)}}@keyframes alert-scale-out{to{opacity:0;transform:scale(.82)}}
</style>
