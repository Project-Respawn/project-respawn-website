<template>
  <div class="overlay-scene-renderer" :style="sceneStyle" data-overlay-source-renderer>
    <div
      v-for="widget in orderedWidgets"
      v-show="widget.enabled && !widget.hidden"
      :key="widget.id"
      class="overlay-source-widget"
      :data-instance-id="widget.id"
      :data-widget-type="widget.type"
      :style="frameStyle(widget)"
    >
      <component :is="registry[widget.type].component" class="widget-renderer" :widget="widget" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { widgetRegistry as registry } from '../../widgets/registry/index.js';
import { themeVariables } from '../../overlays/overlayThemes.js';

const props = defineProps({ scene: { type: Object, required: true } });
const orderedWidgets = computed(() => (props.scene.widgets || [])
  .filter((widget) => registry[widget.type])
  .sort((left, right) => Number(left.zIndex || 0) - Number(right.zIndex || 0)));
const sceneStyle = computed(() => ({
  width: `${props.scene.resolution.width}px`,
  height: `${props.scene.resolution.height}px`,
}));
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
