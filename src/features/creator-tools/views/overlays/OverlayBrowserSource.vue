<template>
  <main ref="viewport" class="overlay-browser-source">
    <div v-if="scene" class="overlay-browser-source__stage" :style="stageStyle">
      <OverlaySceneRenderer :scene="scene" :runtime-config="runtimeConfig" runtime-mode="browser-source" />
    </div>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import OverlaySceneRenderer from '../../components/overlays/OverlaySceneRenderer.vue';
import { widgetEventBus } from '../../overlays/widgetEventBus.js';
import { calculateOverlayStage } from '../../overlays/overlayStage.js';
import { createPublicationSceneSnapshot } from '../../overlays/overlayPublicationSnapshot.js';
import { createOverlaySourceConnection, fetchOverlaySource } from '../../services/overlaySource.js';

const route = useRoute(); const scene = ref(null); const viewport = ref(null); const viewportSize = ref({ width: 0, height: 0 });
const runtimeConfig = ref(null);
let connection = null; let resizeObserver = null; let configRefreshTimer = null;
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
  runtimeConfig.value = { ...(source.twitchConfig || {}), revision: Number(source.twitchConfigRevision || 0) };
  connection?.close();
  connection = createOverlaySourceConnection({
    websocketUrl: source.websocketUrl, credential: credential.value,
    onEvent: async (event) => {
      if (Number(event.configRevision || 0) > Number(runtimeConfig.value?.revision || 0)) await refreshRuntimeConfig();
      widgetEventBus.publish(event);
    },
    onReconnect: async () => { const refreshed = await fetchOverlaySource(credential.value); scene.value = createPublicationSceneSnapshot(refreshed.scene); runtimeConfig.value = { ...(refreshed.twitchConfig || {}), revision: Number(refreshed.twitchConfigRevision || 0) }; },
  });
}
async function refreshRuntimeConfig() { const source = await fetchOverlaySource(credential.value); runtimeConfig.value = { ...(source.twitchConfig || {}), revision: Number(source.twitchConfigRevision || 0) }; }
onMounted(() => {
  document.documentElement.classList.add(documentClass);
  const updateViewport = () => {
    viewportSize.value = { width: viewport.value?.clientWidth || window.innerWidth, height: viewport.value?.clientHeight || window.innerHeight };
  };
  updateViewport();
  resizeObserver = new ResizeObserver(updateViewport);
  if (viewport.value) resizeObserver.observe(viewport.value);
  void load();
  configRefreshTimer = window.setInterval(() => { void refreshRuntimeConfig().catch(() => undefined); }, 30_000);
});
onBeforeUnmount(() => {
  document.documentElement.classList.remove(documentClass);
  resizeObserver?.disconnect();
  connection?.close();
  window.clearInterval(configRefreshTimer);
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
