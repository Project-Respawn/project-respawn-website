<template>
  <main ref="viewport" class="overlay-browser-source">
    <div v-if="scene" class="overlay-browser-source__stage" :style="stageStyle">
      <OverlaySceneRenderer :scene="scene" runtime-mode="browser-source" />
    </div>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import OverlaySceneRenderer from '../../components/overlays/OverlaySceneRenderer.vue';
import { widgetEventBus } from '../../overlays/widgetEventBus.js';
import { calculateOverlayStage } from '../../overlays/overlayStage.js';
import { createPublicationSceneSnapshot } from '../../overlays/overlayPublicationSnapshot.js';
import { createOverlaySourceConnection, fetchOverlaySource } from '../../services/overlaySource.js';

const route = useRoute(); const scene = ref(null); const viewport = ref(null); const viewportSize = ref({ width: 0, height: 0 });
let connection = null; let resizeObserver = null;
let diagnosticSignature = '';
const documentClass = 'overlay-browser-source-document';
const credential = computed(() => String(route.params.credential || ''));
const stageStyle = computed(() => {
  if (!scene.value) return {};
  const { width, height } = scene.value.resolution;
  const stage = calculateOverlayStage(width, height, viewportSize.value.width, viewportSize.value.height);
  return {
    width: `${width}px`, height: `${height}px`,
    transform: `translate(${stage.x}px, ${stage.y}px) scale(${stage.scale})`,
  };
});
async function load() {
  const source = await fetchOverlaySource(credential.value);
  scene.value = createPublicationSceneSnapshot(source.scene);
  await nextTick();
  reportGeometry();
  connection?.close();
  connection = createOverlaySourceConnection({
    websocketUrl: source.websocketUrl, credential: credential.value,
    onEvent: (event) => widgetEventBus.publish(event),
    onReconnect: async () => { const refreshed = await fetchOverlaySource(credential.value); scene.value = createPublicationSceneSnapshot(refreshed.scene); },
  });
}
function safeRect(element) {
  const rect = element?.getBoundingClientRect();
  return rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null;
}
function reportGeometry() {
  if (!scene.value || !viewport.value) return;
  const stage = viewport.value.querySelector('.overlay-browser-source__stage');
  const viewportRect = viewport.value.getBoundingClientRect();
  const stageRect = stage?.getBoundingClientRect();
  const computedStage = stage ? getComputedStyle(stage) : null;
  const rootStyle = getComputedStyle(document.documentElement);
  const bodyStyle = getComputedStyle(document.body);
  const appStyle = getComputedStyle(document.getElementById('app'));
  const geometry = calculateOverlayStage(
    scene.value.resolution.width,
    scene.value.resolution.height,
    viewportRect.width,
    viewportRect.height,
  );
  const signature = [viewportRect.width, viewportRect.height, stageRect?.width, stageRect?.height].join(':');
  if (signature === diagnosticSignature) return;
  diagnosticSignature = signature;
  console.info('[Overlay Source geometry diagnostic]', {
    viewport: { width: viewportRect.width, height: viewportRect.height },
    scene: { width: scene.value.resolution.width, height: scene.value.resolution.height },
    computedScale: geometry.scale,
    offsetX: geometry.x,
    offsetY: geometry.y,
    stageCss: { width: computedStage?.width, height: computedStage?.height, transform: computedStage?.transform, zoom: computedStage?.zoom },
    stageBoundingRect: safeRect(stage),
    devicePixelRatio: window.devicePixelRatio,
    rootSpacing: { margin: rootStyle.margin, padding: rootStyle.padding },
    bodySpacing: { margin: bodyStyle.margin, padding: bodyStyle.padding },
    appLayout: { transform: appStyle.transform, zoom: appStyle.zoom, width: appStyle.width, height: appStyle.height },
    parentLayout: stage?.parentElement ? { transform: getComputedStyle(stage.parentElement).transform, zoom: getComputedStyle(stage.parentElement).zoom } : null,
    widgetBoundingRects: [...(stage?.querySelectorAll('.overlay-source-widget') || [])].slice(0, 5).map(safeRect),
  });
}
onMounted(() => {
  document.documentElement.classList.add(documentClass);
  const updateViewport = () => {
    viewportSize.value = { width: viewport.value?.clientWidth || window.innerWidth, height: viewport.value?.clientHeight || window.innerHeight };
    void nextTick(reportGeometry);
  };
  updateViewport();
  resizeObserver = new ResizeObserver(updateViewport);
  if (viewport.value) resizeObserver.observe(viewport.value);
  void load();
});
onBeforeUnmount(() => {
  document.documentElement.classList.remove(documentClass);
  resizeObserver?.disconnect();
  connection?.close();
});
</script>

<style>
html.overlay-browser-source-document,
html.overlay-browser-source-document body,
html.overlay-browser-source-document #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent !important;
}
.overlay-browser-source { position: fixed; inset: 0; overflow: hidden; background: transparent; }
.overlay-browser-source__stage { position: absolute; left: 0; top: 0; transform-origin: top left; }
</style>
