<template>
  <main class="overlay-browser-source" :style="viewportStyle">
    <OverlaySceneRenderer v-if="scene" :scene="scene" />
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import OverlaySceneRenderer from '../../components/overlays/OverlaySceneRenderer.vue';
import { widgetEventBus } from '../../overlays/widgetEventBus.js';
import { createOverlaySourceConnection, fetchOverlaySource } from '../../services/overlaySource.js';

const route = useRoute(); const scene = ref(null); let connection = null;
const credential = computed(() => String(route.params.credential || ''));
const viewportStyle = computed(() => scene.value ? { width: `${scene.value.resolution.width}px`, height: `${scene.value.resolution.height}px` } : {});
async function load() {
  const source = await fetchOverlaySource(credential.value);
  scene.value = source.scene;
  connection?.close();
  connection = createOverlaySourceConnection({
    websocketUrl: source.websocketUrl, credential: credential.value,
    onEvent: (event) => widgetEventBus.publish(event),
    onReconnect: async () => { const refreshed = await fetchOverlaySource(credential.value); scene.value = refreshed.scene; },
  });
}
onMounted(() => { void load(); });
onBeforeUnmount(() => connection?.close());
</script>

<style>
html, body, #app { margin: 0; width: 100%; height: 100%; overflow: hidden; background: transparent !important; }
.overlay-browser-source { position: relative; overflow: hidden; background: transparent; }
</style>
