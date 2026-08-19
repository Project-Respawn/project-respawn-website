<template>
  <section
    class="builder-panel scenes-panel"
    aria-label="Overlay scenes"
  >
    <!-- ======================================================
         SECTION 08A
         HEADER
         ====================================================== -->

    <header class="scenes-header">
      <div>
        <strong>
          ▧ Overlay Scenes
        </strong>

        <small>
          {{ scenes.length }}
          {{ scenes.length === 1 ? 'scene' : 'scenes' }}
        </small>
      </div>

      <button
        type="button"
        class="scene-add-button"
        aria-label="Add scene"
        title="Add scene"
        @click="$emit('action', 'add')"
      >
        ＋
      </button>
    </header>


    <!-- ======================================================
         SECTION 08B
         SCENE LIST
         ====================================================== -->

    <div class="scene-list">
      <button
        v-for="scene in scenes"
        :key="scene.id"
        type="button"
        class="scene-row"
        :class="{
          active: scene.id === selectedId
        }"
        @click="$emit('select', scene.id)"
      >
        <!-- ==================================================
             SECTION 08C
             SCENE IDENTITY
             ================================================== -->

        <span class="scene-copy">
          <span class="scene-title-row">
            <strong>
              {{ displayName(scene) }}
            </strong>

            <span
              v-if="scene.id === selectedId"
              class="scene-badge scene-badge--active"
            >
              Active
            </span>

            <span
              v-if="scene.isDefault"
              class="scene-badge scene-badge--default"
            >
              Default
            </span>
          </span>

          <small>
            {{ sceneDescription(scene) }}
          </small>

          <span class="scene-meta">
            {{ scene.widgets?.length || 0 }}
            {{
              (scene.widgets?.length || 0) === 1
                ? 'widget'
                : 'widgets'
            }}

            <template v-if="scene.required">
              · Starter scene
            </template>
          </span>
        </span>

        <!-- ==================================================
             SECTION 08D
             SELECTED INDICATOR
             ================================================== -->

        <span
          v-if="scene.id === selectedId"
          class="scene-selected-mark"
          aria-hidden="true"
        >
          ›
        </span>
      </button>
    </div>


    <!-- ======================================================
         SECTION 08E
         SELECTED SCENE SUMMARY
         ====================================================== -->

    <div
      v-if="selectedScene"
      class="scene-selected-summary"
    >
      <span>
        Selected
      </span>

      <strong>
        {{ selectedScene.name }}
      </strong>

      <small>
        {{ selectedScene.widgets?.length || 0 }}
        widgets
        ·
        {{
          selectedScene.isDefault
            ? 'Default scene'
            : 'Standard scene'
        }}
      </small>
    </div>


    <!-- ======================================================
         SECTION 08F
         SCENE ACTIONS
         ====================================================== -->

    <footer class="scene-actions">
      <button
        type="button"
        :disabled="!selectedScene"
        @click="$emit('action', 'duplicate')"
      >
        <span>
          ▣
        </span>

        Duplicate
      </button>

      <button
        type="button"
        :disabled="!selectedScene"
        @click="$emit('action', 'rename')"
      >
        <span>
          ✎
        </span>

        Rename
      </button>

      <button
        type="button"
        :disabled="
          !selectedScene ||
          selectedScene.isDefault
        "
        @click="$emit('action', 'default')"
      >
        <span>
          ★
        </span>

        Default
      </button>

      <button
        type="button"
        class="scene-delete-button"
        :disabled="
          !selectedScene ||
          selectedScene.required ||
          scenes.length <= 1
        "
        @click="$emit('action', 'delete')"
      >
        <span>
          ⌫
        </span>

        Delete
      </button>
    </footer>
  </section>
</template>


<script setup>
import {
  computed,
} from 'vue'


// ============================================================
// SECTION 08
// PROPS
// ============================================================

const props = defineProps({
  scenes: {
    type: Array,
    default: () => [],
  },

  selectedId: {
    type: String,
    default: '',
  },
})


// ============================================================
// SECTION 08
// EVENTS
// ============================================================

defineEmits([
  'select',
  'action',
])


// ============================================================
// SECTION 08E
// SELECTED SCENE
// ============================================================

const selectedScene =
  computed(() => {
    return props.scenes.find(
      scene =>
        scene.id === props.selectedId,
    ) || null
  })


// ============================================================
// SECTION 08C
// DISPLAY HELPERS
// ============================================================

function displayName(scene) {
  if (
    scene.name ===
    'Be Right Back'
  ) {
    return 'BRB'
  }

  return scene.name
}


function sceneDescription(scene) {
  const name =
    scene.name
      ?.toLowerCase() || ''

  if (
    name.includes(
      'gameplay',
    )
  ) {
    return 'Main gameplay overlay'
  }

  if (
    name.includes(
      'starting',
    )
  ) {
    return 'Pre-stream countdown'
  }

  if (
    name.includes(
      'chat',
    )
  ) {
    return 'Camera and community'
  }

  if (
    name.includes('brb') ||
    name.includes(
      'right back',
    )
  ) {
    return 'Away screen'
  }

  if (
    name.includes(
      'ending',
    ) ||
    name.includes(
      'end',
    )
  ) {
    return 'Outro and socials'
  }

  if (
    scene.required
  ) {
    return 'Starter overlay'
  }

  return 'Custom overlay scene'
}
</script>


<style scoped>
/* ============================================================
   PROJECT RESPAWN
   SECTION 08 — OVERLAY SCENES

   08A Header
   08B Scene List
   08C Scene Identity
   08D Selected State
   08E Selected Summary
   08F Scene Actions
   ============================================================ */


/* ============================================================
   ROOT
   ============================================================ */

.scenes-panel {
  display: flex;

  width: 100%;
  height: 100%;

  min-width: 0;
  min-height: 0;

  flex-direction: column;

  overflow: hidden;

  background:
    #081727;
}


/* ============================================================
   08A
   HEADER
   ============================================================ */

.scenes-header {
  display: flex;

  flex: 0 0 auto;

  min-height:
    48px;

  align-items: center;
  justify-content: space-between;

  gap:
    8px;

  padding:
    7px 9px;

  border-bottom:
    1px solid
    rgba(148, 163, 184, 0.09);
}

.scenes-header strong {
  display: block;

  color:
    #eef2f8;

  font-size:
    10px;
}

.scenes-header small {
  display: block;

  margin-top:
    3px;

  color:
    #66798f;

  font-size:
    7px;
}

.scene-add-button {
  display: grid;

  width:
    28px;

  height:
    28px;

  min-width:
    28px;

  min-height:
    28px;

  place-items: center;

  padding:
    0;

  border:
    1px solid
    rgba(139, 92, 246, 0.28);

  border-radius:
    6px;

  background:
    rgba(91, 33, 182, 0.1);

  color:
    #c4b5fd;

  cursor:
    pointer;
}


/* ============================================================
   08B
   SCENE LIST
   ============================================================ */

.scene-list {
  display: grid;

  flex:
    1 1 0;

  min-height: 0;

  align-content: start;

  gap:
    4px;

  padding:
    7px;

  overflow-x: hidden;
  overflow-y: auto;
}


/* ============================================================
   08B
   SCENE ROW
   ============================================================ */

.scene-row {
  position: relative;

  display: grid;

  width: 100%;
  min-width: 0;
  min-height: 62px;

  grid-template-columns:
    minmax(0, 1fr)
    18px;

  align-items: center;

  gap: 8px;

  padding:
    9px 9px 9px 12px;

  border:
    1px solid
    rgba(148, 163, 184, 0.09);

  border-radius:
    8px;

  background:
    rgba(7, 18, 31, 0.62);

  color: inherit;

  text-align: left;

  cursor: pointer;
}

.scene-row::before {
  position: absolute;

  top: 8px;
  bottom: 8px;
  left: 0;

  width: 3px;

  border-radius:
    0 999px 999px 0;

  background: transparent;

  content: "";
}

.scene-row:hover {
  border-color:
    rgba(139, 92, 246, 0.26);

  background:
    rgba(11, 25, 42, 0.82);
}

.scene-row.active {
  border-color:
    rgba(139, 92, 246, 0.6);

  background:
    rgba(91, 33, 182, 0.12);
}

.scene-row.active::before {
  background:
    #8b5cf6;
}


/* ============================================================
   08E
   SELECTED SUMMARY
   ============================================================ */

.scene-selected-summary {
  display: grid;

  flex: 0 0 auto;

  gap:
    2px;

  padding:
    7px 9px;

  border-top:
    1px solid
    rgba(148, 163, 184, 0.07);

  background:
    rgba(91, 33, 182, 0.03);
}

.scene-selected-summary > span {
  color:
    #725f97;

  font-size:
    6px;

  font-weight:
    900;

  text-transform:
    uppercase;
}

.scene-selected-summary strong {
  color:
    #ddd6fe;

  font-size:
    8px;
}

.scene-selected-summary small {
  color:
    #66798f;

  font-size:
    6px;
}


/* ============================================================
   08F
   ACTIONS
   ============================================================ */

.scene-actions {
  display: grid;

  flex: 0 0 auto;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  border-top:
    1px solid
    rgba(148, 163, 184, 0.08);
}

.scene-actions button {
  display: grid;

  min-width: 0;

  min-height:
    42px;

  place-items: center;

  gap:
    1px;

  padding:
    4px 2px;

  border:
    0;

  border-right:
    1px solid
    rgba(148, 163, 184, 0.06);

  border-radius:
    0;

  background:
    transparent;

  color:
    #718399;

  font-size:
    6px;

  cursor:
    pointer;
}

.scene-actions button:last-child {
  border-right:
    0;
}

.scene-actions button span {
  color:
    #a78bfa;

  font-size:
    11px;
}

.scene-actions button:hover:not(:disabled) {
  background:
    rgba(139, 92, 246, 0.06);

  color:
    #c4b5fd;
}

.scene-actions button:disabled {
  opacity:
    0.28;

  cursor:
    not-allowed;
}


/* ============================================================
   DELETE
   ============================================================ */

.scene-actions
  .scene-delete-button:not(:disabled)
  span {
  color:
    #f87171;
}

.scene-actions
  .scene-delete-button:hover:not(:disabled) {
  background:
    rgba(239, 68, 68, 0.06);

  color:
    #fca5a5;
}
</style>