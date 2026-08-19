<template>
  <section
    class="layers-panel"
    aria-label="Widget layers"
  >
    <!-- ======================================================
         SECTION 05A
         LAYERS HEADER
         ====================================================== -->

    <header class="layers-header">
      <div>
        <p class="overlay-kicker">
          ☷ &nbsp; Layers
        </p>

        <small>
          {{ ordered.length }}
          {{ ordered.length === 1 ? 'layer' : 'layers' }}
        </small>
      </div>

      <p>
        Visibility, behaviour and stacking
      </p>
    </header>


    <!-- ======================================================
         SECTION 05B
         LAYER LIST

         Highest z-index appears at the top.
         ====================================================== -->

    <ol class="layers-list">
      <li
        v-for="widget in ordered"
        :key="widget.id"
        class="layer-row"
        :class="{
          selected:
            widget.id === selectedId,

          hidden:
            isHidden(widget),

          locked:
            widget.locked
        }"
      >
        <!-- ==================================================
             SECTION 05C
             LAYER SELECTION
             ================================================== -->

        <button
          type="button"
          class="layer-select"
          @click="$emit('select', widget.id)"
        >
          <span
            class="layer-grip"
            aria-hidden="true"
            title="Layer order"
          >
            ⠿
          </span>

          <span class="layer-icon">
            {{ resolveIcon(widget) }}
          </span>

          <span class="layer-copy">
            <span class="layer-title-row">
              <b>
                {{ widget.name }}
              </b>

              <span
                v-if="widget.locked"
                class="layer-state-pill"
              >
                Locked
              </span>

              <span
                v-if="isHidden(widget)"
                class="layer-state-pill"
              >
                Hidden
              </span>
            </span>

            <span class="layer-meta">
              {{ categoryLabel(widget) }}

              <template
                v-if="integrationLabel(widget)"
              >
                · {{ integrationLabel(widget) }}
              </template>
            </span>
          </span>
        </button>


        <!-- ==================================================
             SECTION 05D
             DISPLAY MODE

             Always
             Triggered
             ================================================== -->

        <label
          class="layer-display-mode"
          :title="
            displayMode(widget) === 'triggered'
              ? 'Only appears when triggered'
              : 'Normally visible while the scene is active'
          "
        >
          <span>
            Display
          </span>

          <select
            :value="displayMode(widget)"
            :aria-label="`Display mode for ${widget.name}`"
            @change="
              $emit(
                'action',
                'display-mode',
                widget.id,
                $event.target.value
              )
            "
          >
            <option value="always">
              Always
            </option>

            <option value="triggered">
              Triggered
            </option>
          </select>
        </label>


        <!-- ==================================================
             SECTION 05E
             VISIBILITY + LOCK
             ================================================== -->

        <div class="layer-actions">
          <button
            type="button"
            class="layer-icon-button"
            :class="{
              active: !isHidden(widget)
            }"
            :aria-label="
              `${
                isHidden(widget)
                  ? 'Show'
                  : 'Hide'
              } ${widget.name}`
            "
            :title="
              isHidden(widget)
                ? 'Show widget'
                : 'Hide widget'
            "
            @click="
              $emit(
                'action',
                'visibility',
                widget.id
              )
            "
          >
            {{ isHidden(widget) ? '○' : '◉' }}
          </button>

          <button
            type="button"
            class="layer-icon-button"
            :class="{
              active: widget.locked
            }"
            :aria-label="
              `${
                widget.locked
                  ? 'Unlock'
                  : 'Lock'
              } ${widget.name}`
            "
            :title="
              widget.locked
                ? 'Unlock widget'
                : 'Lock widget'
            "
            @click="
              $emit(
                'action',
                'lock',
                widget.id
              )
            "
          >
            {{ widget.locked ? '▣' : '◇' }}
          </button>
        </div>
      </li>
    </ol>


    <!-- ======================================================
         SECTION 05F
         SELECTED LAYER SUMMARY
         ====================================================== -->

    <div
      v-if="selectedWidget"
      class="layer-selected-summary"
    >
      <span>
        Selected
      </span>

      <strong>
        {{ selectedWidget.name }}
      </strong>

      <small>
        {{
          displayMode(selectedWidget) === 'triggered'
            ? 'Triggered'
            : 'Always'
        }}

        ·

        {{
          isHidden(selectedWidget)
            ? 'Hidden'
            : 'Visible'
        }}

        ·

        {{
          selectedWidget.locked
            ? 'Locked'
            : 'Unlocked'
        }}
      </small>
    </div>


    <!-- ======================================================
         SECTION 05G
         STACKING CONTROLS
         ====================================================== -->

    <footer
      class="layer-order-controls"
      aria-label="Layer order controls"
    >
      <button
        type="button"
        :disabled="!selectedWidget"
        @click="
          selectedWidget &&
          $emit(
            'action',
            'back',
            selectedWidget.id
          )
        "
      >
        <span>
          ⇩
        </span>

        Bottom
      </button>

      <button
        type="button"
        :disabled="!selectedWidget"
        @click="
          selectedWidget &&
          $emit(
            'action',
            'backward',
            selectedWidget.id
          )
        "
      >
        <span>
          ↓
        </span>

        Back
      </button>

      <button
        type="button"
        :disabled="!selectedWidget"
        @click="
          selectedWidget &&
          $emit(
            'action',
            'forward',
            selectedWidget.id
          )
        "
      >
        <span>
          ↑
        </span>

        Forward
      </button>

      <button
        type="button"
        :disabled="!selectedWidget"
        @click="
          selectedWidget &&
          $emit(
            'action',
            'front',
            selectedWidget.id
          )
        "
      >
        <span>
          ⇧
        </span>

        Top
      </button>
    </footer>
  </section>
</template>


<script setup>
import {
  computed,
} from 'vue'

import {
  getWidgetByType,
  getWidgetCategory,
  getWidgetIntegration,
} from '../../widgets/registry/index.js'


// ============================================================
// SECTION 05
// PROPS
// ============================================================

const props = defineProps({
  widgets: {
    type: Array,
    required: true,
  },

  selectedId: {
    type: String,
    default: '',
  },
})


// ============================================================
// SECTION 05
// EVENTS
// ============================================================

defineEmits([
  'select',
  'action',
])


// ============================================================
// SECTION 05B
// LAYER ORDER
//
// Highest z-index = front/top.
// ============================================================

const ordered = computed(() => {
  return [...props.widgets]
    .filter(
      widget =>
        widget.enabled !== false,
    )
    .sort(
      (a, b) =>
        b.zIndex - a.zIndex,
    )
})


// ============================================================
// SECTION 05F
// SELECTED WIDGET
// ============================================================

const selectedWidget = computed(() => {
  return props.widgets.find(
    widget =>
      widget.id === props.selectedId,
  ) || null
})


// ============================================================
// SECTION 05
// VISIBILITY
// ============================================================

function isHidden(widget) {
  return widget.hidden === true
}


// ============================================================
// SECTION 05
// DISPLAY MODE
// ============================================================

function displayMode(widget) {
  return (
    widget.displayMode ||
    defaultDisplayMode(widget)
  )
}


function defaultDisplayMode(widget) {
  const definition =
    getWidgetByType(widget.type)

  if (
    definition?.displayMode
  ) {
    return definition.displayMode
  }

  /*
   * Demo fallback:
   * alert-style widgets only appear when triggered.
   */

  const categories =
    definition?.categories || []

  if (
    categories.includes('alerts')
  ) {
    return 'triggered'
  }

  return 'always'
}


// ============================================================
// SECTION 05
// REGISTRY DISPLAY HELPERS
// ============================================================

function resolveIcon(widget) {
  const definition =
    getWidgetByType(widget.type)

  if (
    typeof definition?.icon === 'string' &&
    definition.icon.length <= 4
  ) {
    return definition.icon
  }

  return '◆'
}


function categoryLabel(widget) {
  const definition =
    getWidgetByType(widget.type)

  const categoryId =
    definition?.categories?.[0]

  if (!categoryId) {
    return 'Widget'
  }

  return (
    getWidgetCategory(categoryId)
      ?.label ||
    categoryId
  )
}


function integrationLabel(widget) {
  const definition =
    getWidgetByType(widget.type)

  const integrationId =
    definition?.integrations?.[0]

  if (!integrationId) {
    return ''
  }

  return (
    getWidgetIntegration(
      integrationId,
    )?.label ||
    integrationId
  )
}
</script>


<style scoped>
/* ============================================================
   PROJECT RESPAWN
   SECTION 05 — LAYERS

   05A Header
   05B Layer List
   05C Layer Selection
   05D Display Mode
   05E Visibility / Lock
   05F Selected Summary
   05G Stacking Controls
   ============================================================ */


/* ============================================================
   SECTION 05
   ROOT
   ============================================================ */

.layers-panel {
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
   05A
   HEADER
   ============================================================ */

.layers-header {
  display: flex;

  flex: 0 0 auto;

  min-height: 50px;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding:
    7px 10px;

  border-bottom:
    1px solid
    rgba(148, 163, 184, 0.1);
}

.layers-header > div {
  min-width: 0;
}

.layers-header .overlay-kicker {
  margin: 0;

  color:
    #eef2f8;

  font-size:
    11px;

  font-weight:
    800;
}

.layers-header small {
  display: block;

  margin-top: 2px;

  color:
    #718399;

  font-size:
    8px;
}

.layers-header > p {
  margin: 0;

  color:
    #63758a;

  font-size:
    8px;

  text-align:
    right;
}


/* ============================================================
   05B
   LAYER LIST
   ============================================================ */

.layers-list {
  flex: 1 1 0;

  min-height: 0;

  margin: 0;

  padding:
    7px;

  overflow-x: hidden;
  overflow-y: auto;

  list-style: none;
}


/* ============================================================
   05C
   LAYER ROW
   ============================================================ */

.layer-row {
  position: relative;

  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    auto;

  grid-template-areas:
    "select actions"
    "mode mode";

  gap:
    5px;

  margin-bottom:
    5px;

  padding:
    6px;

  border:
    1px solid
    rgba(148, 163, 184, 0.09);

  border-radius:
    7px;

  background:
    rgba(8, 19, 33, 0.6);

  transition:
    border-color 120ms ease,
    background 120ms ease;
}

.layer-row::before {
  position: absolute;

  top: 6px;
  bottom: 6px;

  left: 0;

  width: 2px;

  border-radius:
    999px;

  background:
    transparent;

  content:
    "";
}

.layer-row:hover {
  border-color:
    rgba(139, 92, 246, 0.25);

  background:
    rgba(12, 26, 44, 0.78);
}

.layer-row.selected {
  border-color:
    rgba(139, 92, 246, 0.5);

  background:
    rgba(91, 33, 182, 0.12);
}

.layer-row.selected::before {
  background:
    #8b5cf6;
}

.layer-row.hidden,
.layer-row.locked {
  opacity: 0.72;
}


/* ============================================================
   05C
   SELECTION BUTTON
   ============================================================ */

.layer-select {
  grid-area:
    select;

  display: grid !important;

  min-width: 0 !important;
  min-height: 36px !important;

  grid-template-columns:
    12px
    27px
    minmax(0, 1fr);

  align-items: center;

  gap:
    6px;

  padding:
    2px !important;

  border:
    0 !important;

  background:
    transparent !important;

  color:
    inherit !important;

  text-align:
    left;

  cursor:
    pointer;
}

.layer-grip {
  color:
    #566b83;

  font-size:
    12px;
}

.layer-icon {
  display: grid;

  width: 27px;
  height: 27px;

  place-items: center;

  border-radius:
    6px;

  background:
    rgba(139, 92, 246, 0.09);

  color:
    #b8a4ff;

  font-size:
    12px;
}

.layer-copy {
  min-width: 0;
}

.layer-title-row {
  display: flex;

  min-width: 0;

  align-items: center;

  gap:
    4px;
}

.layer-title-row b {
  min-width: 0;

  overflow: hidden;

  color:
    #e5edf7;

  font-size:
    9px;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;
}

.layer-meta {
  display: block;

  margin-top:
    3px;

  overflow: hidden;

  color:
    #718399;

  font-size:
    7px;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;
}


/* ============================================================
   05C
   STATE PILLS
   ============================================================ */

.layer-state-pill {
  flex:
    0 0 auto;

  padding:
    2px 4px;

  border-radius:
    999px;

  background:
    rgba(148, 163, 184, 0.08);

  color:
    #8596aa;

  font-size:
    6px;

  font-weight:
    800;

  text-transform:
    uppercase;
}


/* ============================================================
   05D
   DISPLAY MODE
   ============================================================ */

.layer-display-mode {
  grid-area:
    mode;

  display: flex;

  min-width: 0;

  align-items: center;
  justify-content: space-between;

  gap:
    6px;

  padding-top:
    5px;

  border-top:
    1px solid
    rgba(148, 163, 184, 0.06);
}

.layer-display-mode > span {
  color:
    #60748a;

  font-size:
    7px;

  font-weight:
    800;

  letter-spacing:
    0.07em;

  text-transform:
    uppercase;
}

.layer-display-mode select {
  min-width:
    88px;

  min-height:
    25px;

  padding:
    3px 6px;

  border:
    1px solid
    rgba(148, 163, 184, 0.13);

  border-radius:
    5px;

  background:
    #091725;

  color:
    #aeb9c8;

  font-size:
    8px;
}


/* ============================================================
   05E
   VISIBILITY / LOCK
   ============================================================ */

.layer-actions {
  grid-area:
    actions;

  display: flex;

  align-items: center;

  gap:
    2px;
}

.layer-icon-button {
  display: grid !important;

  width:
    25px !important;

  min-width:
    25px !important;

  height:
    27px !important;

  min-height:
    27px !important;

  place-items: center;

  padding:
    0 !important;

  border:
    0 !important;

  background:
    transparent !important;

  color:
    #66798f !important;

  font-size:
    11px !important;

  cursor:
    pointer;
}

.layer-icon-button:hover,
.layer-icon-button.active {
  color:
    #c4b5fd !important;
}


/* ============================================================
   05F
   SELECTED SUMMARY
   ============================================================ */

.layer-selected-summary {
  display: grid;

  flex: 0 0 auto;

  gap:
    2px;

  padding:
    8px 10px;

  border-top:
    1px solid
    rgba(148, 163, 184, 0.08);

  background:
    rgba(91, 33, 182, 0.04);
}

.layer-selected-summary > span {
  color:
    #725f97;

  font-size:
    7px;

  font-weight:
    800;

  letter-spacing:
    0.08em;

  text-transform:
    uppercase;
}

.layer-selected-summary strong {
  color:
    #ddd6fe;

  font-size:
    9px;
}

.layer-selected-summary small {
  color:
    #718399;

  font-size:
    7px;
}


/* ============================================================
   05G
   STACKING CONTROLS
   ============================================================ */

.layer-order-controls {
  display: grid;

  flex: 0 0 auto;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  border-top:
    1px solid
    rgba(148, 163, 184, 0.09);
}

.layer-order-controls button {
  display: grid;

  min-width: 0;
  min-height: 40px;

  place-items: center;

  gap:
    1px;

  padding:
    4px 2px;

  border: 0;
  border-right:
    1px solid
    rgba(148, 163, 184, 0.07);

  border-radius: 0;

  background:
    transparent;

  color:
    #718399;

  font-size:
    7px;

  cursor:
    pointer;
}

.layer-order-controls button:last-child {
  border-right:
    0;
}

.layer-order-controls button span {
  color:
    #a78bfa;

  font-size:
    12px;
}

.layer-order-controls button:hover:not(:disabled) {
  background:
    rgba(139, 92, 246, 0.06);

  color:
    #c4b5fd;
}

.layer-order-controls button:disabled {
  opacity:
    0.3;

  cursor:
    not-allowed;
}
</style>