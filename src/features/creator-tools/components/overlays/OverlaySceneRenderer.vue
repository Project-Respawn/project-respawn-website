<template>
  <div class="overlay-scene-renderer" :style="sceneStyle" data-overlay-source-renderer>
    <div
      v-for="widget in orderedWidgets"
      v-show="widgetIsVisible(widget)"
      :key="widget.id"
      class="overlay-source-widget"
      :class="{ 'overlay-source-widget--triggered': widgetDisplayMode(widget) === 'triggered' && triggerVisibility[widget.id] }"
      :data-instance-id="widget.id"
      :data-widget-type="widget.type"
      :style="frameStyle(widget)"
    >
      <component
        :is="registry[widget.type].component"
        :key="`${widget.id}:${triggerGeneration[widget.id] || 0}`"
        class="widget-renderer"
        :widget="widget"
        :runtime-mode="runtimeMode"
        :runtime-config="runtimeConfig"
        :exiting="triggerExiting[widget.id] === true"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, watch } from 'vue';
import { widgetRegistry as registry } from '../../widgets/registry/index.js';
import { themeVariables } from '../../overlays/overlayThemes.js';
import { widgetEventBus } from '../../overlays/widgetEventBus.js';
import { createTriggeredWidgetSubscription } from '../../overlays/triggeredWidgetState.js';
import { widgetDisplayMode } from '../../overlays/overlayPublicationSnapshot.js';

const props = defineProps({
  scene: { type: Object, required: true },
  runtimeMode: { type: String, default: 'editor-preview' },
  runtimeConfig: { type: Object, default: null },
});
const triggerVisibility = reactive({});
const triggerGeneration = reactive({});
const triggerExiting = reactive({});
let disposeTriggers = [];
const orderedWidgets = computed(() => (props.scene.widgets || [])
  .filter((widget) => registry[widget.type])
  .sort((left, right) => Number(left.zIndex || 0) - Number(right.zIndex || 0)));
const sceneStyle = computed(() => ({
  width: `${props.scene.resolution.width}px`,
  height: `${props.scene.resolution.height}px`,
}));
function configureTriggers() {
  disposeTriggers.forEach((dispose) => dispose());
  disposeTriggers = [];
  for (const widget of props.scene.widgets || []) {
    if (widgetDisplayMode(widget) !== 'triggered') continue;
    const settings = runtimeSettings(widget);
    triggerVisibility[widget.id] = false;
    triggerExiting[widget.id] = false;
    disposeTriggers.push(createTriggeredWidgetSubscription(widget, {
      bus: widgetEventBus,
      onVisibility: (visible) => { triggerVisibility[widget.id] = visible; },
      onExpiring: (value = true) => { triggerExiting[widget.id] = value; },
      onExpired: () => { triggerGeneration[widget.id] = (triggerGeneration[widget.id] || 0) + 1; },
      runtimeSettings: settings,
    }));
  }
}
function runtimeSettings(widget) {
  if (widget.type === 'tts') return props.runtimeConfig?.tts || null;
  if (widget.type === 'alerts') return (event) => props.runtimeConfig?.alerts?.[({ 'stream.follow': 'follow', 'stream.subscription': 'subscription', 'stream.raid': 'raid', 'stream.cheer': 'cheer', 'reward.redeemed': 'redemption' }[event?.topic])] || null;
  const kind = widget.type === 'subscription-alert' ? 'subscription' : widget.type === 'raid-alert' ? 'raid' : null;
  return kind ? props.runtimeConfig?.alerts?.[kind] || null : null;
}
function widgetIsVisible(widget) {
  return widget.enabled && !widget.hidden
    && (widgetDisplayMode(widget) !== 'triggered' || triggerVisibility[widget.id] === true);
}
watch(() => [props.scene.widgets, props.runtimeConfig], configureTriggers, { immediate: true, deep: true });
onBeforeUnmount(() => disposeTriggers.forEach((dispose) => dispose()));
function frameStyle(widget) {
  return {
    left: `${widget.frame.x}px`, top: `${widget.frame.y}px`,
    width: `${widget.frame.width}px`, height: `${widget.frame.height}px`,
    zIndex: widget.zIndex,
    ...themeVariables(widget.themeId || props.scene.themeId),
  };
}
</script>

<style scoped>
.overlay-scene-renderer { position: relative; overflow: hidden; background: transparent; }
.overlay-source-widget { position: absolute; overflow: hidden; pointer-events: none; }
.widget-renderer { width: 100%; height: 100%; }
</style>
