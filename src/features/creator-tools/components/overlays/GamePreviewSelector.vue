<template>
  <section
    class="builder-panel game-panel"
    aria-label="Game preview"
  >
    <!-- ======================================================
         SECTION 09A
         HEADER
         ====================================================== -->

    <header class="game-header">
      <div>
        <strong>
          Game Preview
        </strong>

        <small>
          Test overlay readability against gameplay
        </small>
      </div>

      <span class="game-preview-badge">
        Preview Only
      </span>
    </header>


    <!-- ======================================================
         SECTION 09B
         GAME SELECTION
         ====================================================== -->

    <div class="game-section">
      <label class="game-field">
        <span>
          Game
        </span>

        <select
          :value="current.id"
          @change="selectGame($event.target.value)"
        >
          <option
            v-for="item in choices"
            :key="item.id"
            :value="item.id"
          >
            {{ item.name }}
          </option>
        </select>
      </label>
    </div>


    <!-- ======================================================
         SECTION 09C
         PREVIEW ENVIRONMENT
         ====================================================== -->

    <div class="game-section">
      <div class="game-section-heading">
        <div>
          <strong>
            Preview Environment
          </strong>

          <small>
            Test visibility in different conditions
          </small>
        </div>
      </div>

      <div
        class="environment-grid"
        aria-label="Preview environment"
      >
        <button
          v-for="environment in environments"
          :key="environment.id"
          type="button"
          :class="{
            active:
              selectedEnvironment === environment.id
          }"
          @click="selectEnvironment(environment.id)"
        >
          <span
            class="environment-preview"
            :style="environmentStyle(environment)"
          ></span>

          <strong>
            {{ environment.label }}
          </strong>

          <small>
            {{ environment.description }}
          </small>
        </button>
      </div>
    </div>


    <!-- ======================================================
         SECTION 09D
         CURRENT PREVIEW STATUS
         ====================================================== -->

    <div class="current-preview">
      <span class="current-preview__label">
        Current Preview
      </span>

      <strong>
        {{ current.name }}
      </strong>

      <small>
        {{ selectedEnvironmentLabel }}
        ·
        {{ current.motion }} motion
      </small>
    </div>


    <!-- ======================================================
         SECTION 09E
         CUSTOM BACKGROUND
         ====================================================== -->

    <div class="custom-preview">
      <div class="custom-preview__copy">
        <strong>
          Custom Background
        </strong>

        <small>
          Upload a temporary gameplay screenshot
        </small>
      </div>

      <label class="custom-upload">
        <span>
          Upload Image
        </span>

        <input
          type="file"
          accept="image/*"
          @change="$emit('upload', $event)"
        >
      </label>
    </div>


    <!-- ======================================================
         SECTION 09F
         PREVIEW-ONLY NOTICE
         ====================================================== -->

    <footer class="game-preview-notice">
      <span>
        ◉
      </span>

      <p>
        This background is only used to preview your overlay.
        It is not included in the browser source output.
      </p>
    </footer>
  </section>
</template>


<script setup>
import {
  computed,
  ref,
  watch,
} from 'vue'

import {
  applyGamePreview,
  gamePreviewDefinitions as choices,
  resolveGamePreview,
} from '../../overlays/gamePreviewDefinitions.js'


// ============================================================
// SECTION 09
// PROPS
// ============================================================

const props = defineProps({
  preview: {
    type: Object,
    required: true,
  },
})


// ============================================================
// SECTION 09
// EVENTS
// ============================================================

const emit = defineEmits([
  'change',
  'upload',
])


// ============================================================
// SECTION 09B
// CURRENT GAME
// ============================================================

const current =
  computed(() => {
    return resolveGamePreview(
      props.preview.gameId ||
      props.preview.referenceAssetId,
    )
  })


// ============================================================
// SECTION 09C
// ENVIRONMENTS
//
// For now these are visual preview modes.
// Later each game can define dedicated image variants.
// ============================================================

const environments = [
  {
    id: 'bright',
    label: 'Bright',
    description: 'High visibility',
  },

  {
    id: 'dark',
    label: 'Dark',
    description: 'Low-light gameplay',
  },

  {
    id: 'high-motion',
    label: 'High Motion',
    description: 'Busy combat scene',
  },
]


// ============================================================
// SECTION 09C
// SELECTED ENVIRONMENT
// ============================================================

const selectedEnvironment =
  ref(
    inferEnvironment(
      props.preview,
    ),
  )


watch(
  () => props.preview,
  next => {
    selectedEnvironment.value =
      inferEnvironment(next)
  },
  {
    deep: true,
  },
)


// ============================================================
// SECTION 09D
// ENVIRONMENT LABEL
// ============================================================

const selectedEnvironmentLabel =
  computed(() => {
    return (
      environments.find(
        item =>
          item.id ===
          selectedEnvironment.value,
      )?.label ||
      'Preview'
    )
  })


// ============================================================
// SECTION 09B
// SELECT GAME
// ============================================================

function selectGame(id) {
  const next =
    applyGamePreview(
      props.preview,
      id,
    )

  emit(
    'change',
    applyEnvironment(
      next,
      selectedEnvironment.value,
    ),
  )
}


// ============================================================
// SECTION 09C
// SELECT ENVIRONMENT
// ============================================================

function selectEnvironment(id) {
  selectedEnvironment.value = id

  emit(
    'change',
    applyEnvironment(
      {
        ...props.preview,
        gameId:
          current.value.id,
      },
      id,
    ),
  )
}


// ============================================================
// SECTION 09C
// APPLY ENVIRONMENT
// ============================================================

function applyEnvironment(
  preview,
  environment,
) {
  if (
    environment === 'bright'
  ) {
    return {
      ...preview,
      brightness: 'bright',
      motion: 'low',
    }
  }

  if (
    environment === 'dark'
  ) {
    return {
      ...preview,
      brightness: 'dark',
      motion: 'low',
    }
  }

  return {
    ...preview,
    brightness: 'mixed',
    motion: 'high',
  }
}


// ============================================================
// SECTION 09C
// INFER ENVIRONMENT
// ============================================================

function inferEnvironment(
  preview,
) {
  if (
    preview?.motion === 'high'
  ) {
    return 'high-motion'
  }

  if (
    preview?.brightness === 'dark'
  ) {
    return 'dark'
  }

  return 'bright'
}


// ============================================================
// SECTION 09C
// ENVIRONMENT PREVIEW STYLE
//
// Uses the current game's image and applies visual treatment.
// This keeps the demo simple until dedicated variants exist.
// ============================================================

function environmentStyle(
  environment,
) {
  const image =
    current.value.image

  if (
    environment.id === 'dark'
  ) {
    return {
      backgroundImage:
        `
        linear-gradient(
          rgba(4, 8, 18, .52),
          rgba(4, 8, 18, .52)
        ),
        url(${image})
        `,
    }
  }

  if (
    environment.id === 'high-motion'
  ) {
    return {
      backgroundImage:
        `
        linear-gradient(
          rgba(20, 10, 35, .15),
          rgba(20, 10, 35, .15)
        ),
        url(${image})
        `,
    }
  }

  return {
    backgroundImage:
      `
      linear-gradient(
        rgba(255,255,255,.08),
        rgba(255,255,255,.08)
      ),
      url(${image})
      `,
  }
}
</script>


<style scoped>
/* ============================================================
   PROJECT RESPAWN
   SECTION 09 — GAME PREVIEW

   09A Header
   09B Game Selection
   09C Preview Environment
   09D Current Preview
   09E Custom Background
   09F Preview Notice
   ============================================================ */


/* ============================================================
   ROOT
   ============================================================ */

.game-panel {
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
   09A
   HEADER
   ============================================================ */

.game-header {
  display: flex;

  flex: 0 0 auto;

  min-height: 54px;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding:
    8px 10px;

  border-bottom:
    1px solid
    rgba(148, 163, 184, 0.09);
}

.game-header strong {
  display: block;

  color:
    #eef2f8;

  font-size: 10px;
}

.game-header small {
  display: block;

  margin-top: 3px;

  color:
    #66798f;

  font-size: 7px;
}

.game-preview-badge {
  flex: 0 0 auto;

  padding:
    3px 6px;

  border:
    1px solid
    rgba(139, 92, 246, 0.25);

  border-radius: 999px;

  background:
    rgba(91, 33, 182, 0.09);

  color:
    #b8a4ff;

  font-size: 6px;

  font-weight: 900;

  text-transform: uppercase;
}


/* ============================================================
   SHARED SECTION
   ============================================================ */

.game-section {
  flex: 0 0 auto;

  padding:
    9px 10px;

  border-bottom:
    1px solid
    rgba(148, 163, 184, 0.06);
}

.game-section-heading {
  margin-bottom: 7px;
}

.game-section-heading strong {
  display: block;

  color:
    #dce4ed;

  font-size: 8px;
}

.game-section-heading small {
  display: block;

  margin-top: 2px;

  color:
    #65788d;

  font-size: 7px;
}


/* ============================================================
   09B
   GAME SELECT
   ============================================================ */

.game-field {
  display: grid;

  gap: 5px;
}

.game-field > span {
  color:
    #7f91a5;

  font-size: 7px;

  font-weight: 800;

  text-transform: uppercase;
}

.game-field select {
  width: 100%;

  min-height: 32px;

  padding:
    5px 8px;

  border:
    1px solid
    rgba(148, 163, 184, 0.14);

  border-radius: 6px;

  background:
    #091725;

  color:
    #e5edf7;

  font-size: 9px;

  outline: none;
}

.game-field select:focus {
  border-color:
    rgba(139, 92, 246, 0.58);

  box-shadow:
    0 0 0 2px
    rgba(139, 92, 246, 0.07);
}


/* ============================================================
   09C
   ENVIRONMENT GRID
   ============================================================ */

.environment-grid {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap: 6px;
}

.environment-grid button {
  display: grid;

  min-width: 0;

  padding:
    5px;

  border:
    1px solid
    rgba(148, 163, 184, 0.09);

  border-radius: 7px;

  background:
    rgba(7, 18, 31, 0.62);

  color: inherit;

  text-align: left;

  cursor: pointer;
}

.environment-grid button:hover {
  border-color:
    rgba(139, 92, 246, 0.28);
}

.environment-grid button.active {
  border-color:
    rgba(139, 92, 246, 0.62);

  background:
    rgba(91, 33, 182, 0.1);
}


/* ============================================================
   ENVIRONMENT IMAGE
   ============================================================ */

.environment-preview {
  display: block;

  width: 100%;
  aspect-ratio: 16 / 7;

  margin-bottom: 5px;

  border-radius: 5px;

  background-position: center;
  background-size: cover;

  box-shadow:
    inset 0 0 0 1px
    rgba(255, 255, 255, 0.05);
}

.environment-grid strong {
  color:
    #dce4ed;

  font-size: 8px;
}

.environment-grid small {
  display: block;

  margin-top: 2px;

  color:
    #66798f;

  font-size: 6px;
}


/* ============================================================
   09D
   CURRENT PREVIEW
   ============================================================ */

.current-preview {
  display: grid;

  flex: 0 0 auto;

  gap: 2px;

  padding:
    8px 10px;

  border-bottom:
    1px solid
    rgba(148, 163, 184, 0.06);

  background:
    rgba(91, 33, 182, 0.03);
}

.current-preview__label {
  color:
    #725f97;

  font-size: 6px;

  font-weight: 900;

  letter-spacing: 0.05em;

  text-transform: uppercase;
}

.current-preview strong {
  color:
    #ddd6fe;

  font-size: 8px;
}

.current-preview small {
  color:
    #718399;

  font-size: 7px;
}


/* ============================================================
   09E
   CUSTOM BACKGROUND
   ============================================================ */

.custom-preview {
  display: flex;

  flex: 0 0 auto;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding:
    9px 10px;

  border-bottom:
    1px solid
    rgba(148, 163, 184, 0.06);
}

.custom-preview__copy {
  min-width: 0;
}

.custom-preview__copy strong {
  display: block;

  color:
    #dce4ed;

  font-size: 8px;
}

.custom-preview__copy small {
  display: block;

  margin-top: 3px;

  color:
    #65788d;

  font-size: 6px;
}

.custom-upload {
  flex: 0 0 auto;

  cursor: pointer;
}

.custom-upload > span {
  display: inline-flex;

  min-height: 28px;

  align-items: center;

  padding:
    4px 8px;

  border:
    1px solid
    rgba(139, 92, 246, 0.3);

  border-radius: 6px;

  background:
    rgba(91, 33, 182, 0.08);

  color:
    #c4b5fd;

  font-size: 7px;

  font-weight: 700;
}

.custom-upload:hover > span {
  border-color:
    rgba(139, 92, 246, 0.55);

  background:
    rgba(91, 33, 182, 0.14);
}

.custom-upload input {
  position: absolute;

  width: 1px;
  height: 1px;

  opacity: 0;

  pointer-events: none;
}


/* ============================================================
   09F
   NOTICE
   ============================================================ */

.game-preview-notice {
  display: flex;

  flex: 0 0 auto;

  align-items: flex-start;

  gap: 6px;

  margin-top: auto;

  padding:
    8px 10px;

  background:
    rgba(2, 10, 20, 0.28);

  color:
    #687b90;
}

.game-preview-notice > span {
  flex: 0 0 auto;

  color:
    #8b5cf6;

  font-size: 8px;
}

.game-preview-notice p {
  margin: 0;

  font-size: 6px;

  line-height: 1.4;
}
</style>