<script setup>
import {
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";

import JerseyViewerControls from "./JerseyViewerControls.vue";
import JerseyViewerFallback from "./JerseyViewerFallback.vue";

import {
  createJersey3DViewer,
} from "../../composables/useJersey3D.js";

const props = defineProps({
  modelUrl: {
    type: String,
    required: true,
  },

  poster: {
    type: String,
    required: true,
  },
});

const canvas = ref(null);

const ready = ref(false);
const failed = ref(false);

const viewer = ref(null);

onMounted(() => {
  try {
    viewer.value =
      createJersey3DViewer({
        canvas: canvas.value,
        modelUrl: props.modelUrl,

        onReady: () => {
          ready.value = true;
        },

        onError: () => {
          failed.value = true;
        },
      });
  } catch (error) {
    console.error(error);

    failed.value = true;
  }
});

onBeforeUnmount(() => {
  viewer.value?.destroy?.();
});

function call(action) {
  viewer.value?.[action]?.();
}
</script>

<template>
  <div class="jersey-viewer-shell">

    <aside class="jersey-viewer-left">

      <JerseyViewerControls
        @front="call('front')"
        @back="call('back')"
        @left="call('left')"
        @right="call('right')"
        @zoom-in="call('zoomIn')"
        @zoom-out="call('zoomOut')"
        @reset="call('reset')"
      />

    </aside>

    <div class="jersey-viewer-stage">

      <div class="viewer-purple-light"></div>

      <div class="viewer-green-light"></div>

      <div class="viewer-floor-glow"></div>

      <canvas
        v-show="!failed"
        ref="canvas"
        class="jersey-canvas"
        aria-label="Interactive 3D Project Respawn Season Zero jersey"
      ></canvas>

      <JerseyViewerFallback
        v-if="failed"
        :poster="poster"
      />

      <div
        v-if="!ready && !failed"
        class="viewer-loading"
      >
        Loading jersey…
      </div>

      <div class="interaction-hint">

        <span>
          Drag to rotate
        </span>

        <span>
          Scroll to zoom
        </span>

      </div>

    </div>

    <aside
      class="jersey-viewer-right"
      aria-label="Jersey quick views"
    >

      <button
        type="button"
        @click="call('front')"
      >
        <img
          :src="poster"
          alt=""
        />

        <span>
          Front
        </span>
      </button>

      <button
        type="button"
        @click="call('back')"
      >

        <div class="view-icon">
          ↶
        </div>

        <span>
          Back
        </span>

      </button>

      <button
        type="button"
        @click="call('left')"
      >

        <div class="view-icon">
          ←
        </div>

        <span>
          Left
        </span>

      </button>

      <button
        type="button"
        @click="call('right')"
      >

        <div class="view-icon">
          →
        </div>

        <span>
          Right
        </span>

      </button>

    </aside>

  </div>
</template>

<style scoped>
.jersey-viewer-shell {
  min-height: 520px;

  display: grid;

  grid-template-columns:
    116px
    minmax(0, 1fr)
    88px;

  gap: 14px;

  align-items: stretch;
}

.jersey-viewer-left,
.jersey-viewer-right {
  display: flex;

  align-items: center;
  justify-content: center;

  position: relative;

  z-index: 4;
}

.jersey-viewer-stage {
  min-width: 0;
  min-height: 520px;

  position: relative;

  overflow: hidden;

  border:
    1px solid
    rgba(139, 92, 246, 0.16);

  background:
    radial-gradient(
      circle at 42% 35%,
      rgba(139, 92, 246, 0.10),
      transparent 35%
    ),
    radial-gradient(
      circle at 78% 58%,
      rgba(97, 255, 24, 0.045),
      transparent 32%
    ),
    rgba(3, 4, 7, 0.60);
}

.jersey-canvas {
  width: 100%;
  height: 100%;

  min-height: 520px;

  display: block;

  position: relative;

  z-index: 3;

  cursor: grab;

  touch-action: none;
}

.jersey-canvas:active {
  cursor: grabbing;
}

.viewer-purple-light,
.viewer-green-light {
  width: 160px;
  height: 78%;

  position: absolute;

  top: 11%;

  border-radius: 50%;

  filter:
    blur(45px);

  pointer-events: none;
}

.viewer-purple-light {
  left: -100px;

  background:
    rgba(139, 92, 246, 0.16);
}

.viewer-green-light {
  right: -105px;

  background:
    rgba(97, 255, 24, 0.08);
}

.viewer-floor-glow {
  width: 58%;
  height: 46px;

  position: absolute;

  left: 21%;
  bottom: 54px;

  border-radius: 50%;

  background:
    rgba(139, 92, 246, 0.10);

  filter:
    blur(18px);
}

.viewer-loading {
  position: absolute;

  inset: 0;

  z-index: 5;

  display: grid;

  place-items: center;

  color: #787c86;

  font-size: 0.68rem;
  font-weight: 800;

  letter-spacing: 0.13em;

  text-transform: uppercase;

  pointer-events: none;
}

.interaction-hint {
  position: absolute;

  right: 14px;
  bottom: 12px;

  z-index: 5;

  display: flex;

  gap: 12px;

  color: #60646f;

  font-size: 0.58rem;

  letter-spacing: 0.08em;

  text-transform: uppercase;

  pointer-events: none;
}

.jersey-viewer-right {
  flex-direction: column;

  gap: 8px;
}

.jersey-viewer-right button {
  width: 76px;

  padding: 7px;

  border:
    1px solid
    rgba(139, 92, 246, 0.22);

  background:
    rgba(5, 6, 9, 0.76);

  color: #a8abb3;

  cursor: pointer;

  font: inherit;

  transition:
    transform 0.18s ease,
    border-color 0.18s ease;
}

.jersey-viewer-right button:hover {
  transform:
    translateY(-1px);

  border-color:
    rgba(97, 255, 24, 0.42);
}

.jersey-viewer-right img,
.view-icon {
  width: 100%;
  height: 55px;

  object-fit: contain;

  display: grid;

  place-items: center;
}

.view-icon {
  color: #8b5cf6;

  font-size: 1.35rem;
}

.jersey-viewer-right span {
  display: block;

  margin-top: 4px;

  color: #858993;

  font-size: 0.52rem;
  font-weight: 800;

  letter-spacing: 0.09em;

  text-transform: uppercase;
}

@media (max-width: 980px) {

  .jersey-viewer-shell {
    grid-template-columns: 1fr;
  }

  .jersey-viewer-left {
    order: 2;
  }

  .jersey-viewer-stage {
    order: 1;
  }

  .jersey-viewer-right {
    order: 3;

    flex-direction: row;

    flex-wrap: wrap;
  }

  .jersey-viewer-right button {
    width: 82px;
  }

}

@media (max-width: 620px) {

  .jersey-viewer-shell,
  .jersey-viewer-stage,
  .jersey-canvas {
    min-height: 430px;
  }

  .interaction-hint {
    left: 0;
    right: 0;

    justify-content: center;
  }

}
</style>