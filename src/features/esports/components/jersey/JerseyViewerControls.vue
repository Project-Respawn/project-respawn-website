<script setup>
defineEmits([
  "front",
  "back",
  "left",
  "right",
  "zoom-in",
  "zoom-out",
  "reset",
]);
</script>

<template>
  <div
    class="viewer-controls"
    aria-label="Jersey view controls"
  >

    <button
      type="button"
      @click="$emit('front')"
    >
      Front
    </button>

    <button
      type="button"
      @click="$emit('back')"
    >
      Back
    </button>

    <button
      type="button"
      @click="$emit('left')"
    >
      Left
    </button>

    <button
      type="button"
      @click="$emit('right')"
    >
      Right
    </button>

    <div class="viewer-controls-divider"></div>

    <button
      type="button"
      aria-label="Zoom in"
      @click="$emit('zoom-in')"
    >
      +
    </button>

    <button
      type="button"
      aria-label="Zoom out"
      @click="$emit('zoom-out')"
    >
      −
    </button>

    <button
      type="button"
      @click="$emit('reset')"
    >
      Reset
    </button>

  </div>
</template>

<style scoped>
.viewer-controls {
  width: 104px;

  display: flex;

  flex-direction: column;

  gap: 8px;
}

.viewer-controls button {
  min-height: 38px;

  padding: 9px 10px;

  border:
    1px solid
    rgba(139, 92, 246, 0.30);

  background:
    rgba(5, 6, 9, 0.78);

  color:
    #d7d9df;

  cursor: pointer;

  font: inherit;

  font-size: 0.66rem;
  font-weight: 800;

  letter-spacing: 0.08em;

  text-transform: uppercase;

  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    background 0.18s ease;
}

.viewer-controls button:hover {
  transform:
    translateY(-1px);

  border-color:
    rgba(97, 255, 24, 0.55);

  background:
    rgba(12, 15, 12, 0.88);

  color:
    #ffffff;
}

.viewer-controls button:focus-visible {
  outline:
    2px solid
    #61ff18;

  outline-offset:
    2px;
}

.viewer-controls-divider {
  height: 1px;

  margin: 3px 0;

  background:
    rgba(255, 255, 255, 0.08);
}

@media (max-width: 760px) {

  .viewer-controls {
    width: 100%;

    flex-direction: row;

    flex-wrap: wrap;

    justify-content: center;
  }

  .viewer-controls-divider {
    display: none;
  }

  .viewer-controls button {
    min-width: 72px;
  }

}
</style>