<template>
  <aside
    class="builder-panel inspector-panel"
    aria-label="Widget settings"
  >
    <!-- ======================================================
         SECTION 06A
         SELECTED WIDGET IDENTITY
         ====================================================== -->

    <header class="inspector-identity">
      <template v-if="widget && definition">
        <span class="inspector-identity__icon">
          {{ resolveIcon }}
        </span>

        <span class="inspector-identity__copy">
          <strong>
            {{ widget.name }}
          </strong>

          <small>
            {{ categoryLabel }}
            <template v-if="integrationLabel">
              · {{ integrationLabel }}
            </template>
          </small>
        </span>

        <span class="inspector-identity__states">
          <em>
            {{ widget.hidden ? 'Hidden' : 'Visible' }}
          </em>

          <em>
            {{ displayModeLabel }}
          </em>
        </span>
      </template>

      <template v-else>
        <span class="inspector-identity__empty">
          Select a widget to configure it
        </span>
      </template>
    </header>


    <!-- ======================================================
         SECTION 06B
         SETTINGS TABS
         ====================================================== -->

    <nav
      v-if="widget && definition"
      class="inspector-main-tabs"
      aria-label="Widget settings sections"
    >
      <button
        type="button"
        :class="{ active: tab === 'content' }"
        @click="tab = 'content'"
      >
        Content
      </button>

      <button
        type="button"
        :class="{ active: tab === 'style' }"
        @click="tab = 'style'"
      >
        Style
      </button>

      <button
        type="button"
        :class="{ active: tab === 'layout' }"
        @click="tab = 'layout'"
      >
        Layout
      </button>

      <button
        type="button"
        :class="{ active: tab === 'behaviour' }"
        @click="tab = 'behaviour'"
      >
        Behaviour
      </button>
    </nav>


    <!-- ======================================================
         NO SELECTION
         ====================================================== -->

    <div
      v-if="!widget || !definition"
      class="empty-inspector"
    >
      <strong>
        Select a widget
      </strong>

      <p>
        Choose one from the Widget Library, canvas
        or Layers to edit it here.
      </p>
    </div>


    <!-- ======================================================
         SECTION 06C
         CONTENT
         ====================================================== -->

    <section
      v-else-if="tab === 'content'"
      class="inspector-section"
    >
      <div class="inspector-section__heading">
        <div>
          <strong>
            Content
          </strong>

          <small>
            {{ definition.displayName }} settings
          </small>
        </div>
      </div>

      <div class="inspector-fields">
        <label class="inspector-field">
          <span>
            Display name
          </span>

          <input
            :value="widget.name"
            type="text"
            @change="
              patch({
                name: $event.target.value
              })
            "
          >
        </label>


        <!-- Registry-driven widget settings -->

        <template
          v-if="definition.settings?.length"
        >
          <label
            v-for="field in definition.settings"
            :key="field.key"
            class="inspector-field"
          >
            <span>
              {{ field.label }}
            </span>

            <input
              v-if="field.type === 'checkbox'"
              type="checkbox"
              :checked="widget.settings[field.key]"
              @change="
                setting(
                  field,
                  $event.target.checked
                )
              "
            >

            <textarea
              v-else-if="field.type === 'textarea'"
              :value="widget.settings[field.key]"
              @change="
                setting(
                  field,
                  $event.target.value
                )
              "
            ></textarea>

            <select
              v-else-if="field.type === 'select'"
              :value="widget.settings[field.key]"
              @change="
                setting(
                  field,
                  $event.target.value
                )
              "
            >
              <option
                v-for="option in field.options"
                :key="option"
                :value="option"
              >
                {{ option }}
              </option>
            </select>

            <input
              v-else
              :type="field.type"
              :min="field.min"
              :max="field.max"
              :step="field.step"
              :value="widget.settings[field.key]"
              @change="
                setting(
                  field,
                  $event.target.value
                )
              "
            >
          </label>
        </template>

        <div
          v-else
          class="inspector-inline-empty"
        >
          No additional content settings are required
          for this widget.
        </div>
      </div>
    </section>


    <!-- ======================================================
         SECTION 06D
         STYLE
         ====================================================== -->

    <section
      v-else-if="tab === 'style'"
      class="inspector-section"
    >
      <div class="inspector-section__heading">
        <div>
          <strong>
            Style
          </strong>

          <small>
            Appearance and theme
          </small>
        </div>
      </div>

      <div class="inspector-fields">
        <label class="inspector-field">
          <span>
            Widget theme
          </span>

          <select
            :value="widget.themeId || themeId"
            @change="
              patch({
                themeId: $event.target.value
              })
            "
          >
            <option
              v-for="theme in themes"
              :key="theme.id"
              :value="theme.id"
            >
              {{ theme.name }}
            </option>
          </select>
        </label>


        <div
          v-if="themes.length"
          class="theme-swatches"
          aria-label="Widget themes"
        >
          <button
            v-for="theme in themes"
            :key="theme.id"
            type="button"
            :class="{
              active:
                (widget.themeId || themeId) ===
                theme.id
            }"
            :style="{
              '--swatch': theme.primary,
              '--swatch-accent': theme.accent
            }"
            @click="
              patch({
                themeId: theme.id
              })
            "
          >
            <i></i>

            {{ theme.name }}
          </button>
        </div>


        <!-- Common style values when present in widget settings -->

        <label
          v-if="'opacity' in widget.settings"
          class="inspector-field"
        >
          <span>
            Opacity
          </span>

          <div class="range-field">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              :value="widget.settings.opacity"
              @input="
                patchSetting(
                  'opacity',
                  Number($event.target.value)
                )
              "
            >

            <output>
              {{
                Math.round(
                  Number(widget.settings.opacity) *
                  100
                )
              }}%
            </output>
          </div>
        </label>


        <label
          v-if="'background' in widget.settings"
          class="inspector-field"
        >
          <span>
            Background
          </span>

          <input
            type="color"
            :value="widget.settings.background"
            @input="
              patchSetting(
                'background',
                $event.target.value
              )
            "
          >
        </label>


        <label
          v-if="'cornerRadius' in widget.settings"
          class="inspector-field"
        >
          <span>
            Corner radius
          </span>

          <input
            type="number"
            min="0"
            max="100"
            :value="widget.settings.cornerRadius"
            @change="
              patchSetting(
                'cornerRadius',
                Number($event.target.value)
              )
            "
          >
        </label>


        <label
          v-if="'fontSize' in widget.settings"
          class="inspector-field"
        >
          <span>
            Text size
          </span>

          <input
            type="number"
            min="10"
            max="160"
            :value="widget.settings.fontSize"
            @change="
              patchSetting(
                'fontSize',
                Number($event.target.value)
              )
            "
          >
        </label>


        <label
          v-if="'textAlign' in widget.settings"
          class="inspector-field"
        >
          <span>
            Text alignment
          </span>

          <select
            :value="widget.settings.textAlign"
            @change="
              patchSetting(
                'textAlign',
                $event.target.value
              )
            "
          >
            <option value="left">
              Left
            </option>

            <option value="center">
              Centre
            </option>

            <option value="right">
              Right
            </option>
          </select>
        </label>
      </div>
    </section>


    <!-- ======================================================
         SECTION 06E
         LAYOUT
         ====================================================== -->

    <section
      v-else-if="tab === 'layout'"
      class="inspector-section"
    >
      <div class="inspector-section__heading">
        <div>
          <strong>
            Layout
          </strong>

          <small>
            Exact position and size
          </small>
        </div>
      </div>


      <div class="inspector-fields">
        <!-- Position -->

        <fieldset class="inspector-card">
          <legend>
            Position
          </legend>

          <div class="frame-fields">
            <label>
              <span>X</span>

              <input
                type="number"
                min="0"
                :value="widget.frame.x"
                @change="
                  frame(
                    'x',
                    $event.target.value
                  )
                "
              >
            </label>

            <label>
              <span>Y</span>

              <input
                type="number"
                min="0"
                :value="widget.frame.y"
                @change="
                  frame(
                    'y',
                    $event.target.value
                  )
                "
              >
            </label>
          </div>
        </fieldset>


        <!-- Size -->

        <fieldset class="inspector-card">
          <legend>
            Size
          </legend>

          <div class="frame-fields">
            <label>
              <span>W</span>

              <input
                type="number"
                :min="minimumWidth"
                :value="widget.frame.width"
                @change="
                  frame(
                    'width',
                    $event.target.value
                  )
                "
              >
            </label>

            <label>
              <span>H</span>

              <input
                type="number"
                :min="minimumHeight"
                :value="widget.frame.height"
                @change="
                  frame(
                    'height',
                    $event.target.value
                  )
                "
              >
            </label>
          </div>
        </fieldset>


        <!-- Alignment -->

        <fieldset class="inspector-card">
          <legend>
            Alignment
          </legend>

          <div class="alignment-grid">
            <button
              type="button"
              @click="$emit('layout', 'left')"
            >
              Left
            </button>

            <button
              type="button"
              @click="$emit('layout', 'h-centre')"
            >
              Centre
            </button>

            <button
              type="button"
              @click="$emit('layout', 'right')"
            >
              Right
            </button>

            <button
              type="button"
              @click="$emit('layout', 'top')"
            >
              Top
            </button>

            <button
              type="button"
              @click="$emit('layout', 'v-centre')"
            >
              Middle
            </button>

            <button
              type="button"
              @click="$emit('layout', 'bottom')"
            >
              Bottom
            </button>
          </div>
        </fieldset>


        <!-- Quick actions -->

        <div class="layout-actions">
          <button
            type="button"
            @click="$emit('layout', 'centre')"
          >
            Centre on canvas
          </button>

          <button
            type="button"
            @click="$emit('layout', 'reset-position')"
          >
            Reset position
          </button>

          <button
            type="button"
            @click="$emit('layout', 'reset-size')"
          >
            Reset size
          </button>
        </div>
      </div>
    </section>


    <!-- ======================================================
         SECTION 06F
         BEHAVIOUR
         ====================================================== -->

    <section
      v-else
      class="inspector-section"
    >
      <div class="inspector-section__heading">
        <div>
          <strong>
            Behaviour
          </strong>

          <small>
            Visibility and animation
          </small>
        </div>
      </div>

      <div class="inspector-fields">
        <label class="inspector-field">
          <span>
            Display
          </span>

          <select
            :value="displayMode"
            @change="
              patch({
                displayMode:
                  $event.target.value
              })
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


        <label class="inspector-field">
          <span>
            Entrance animation
          </span>

          <select
            :value="widget.animations?.entrance || 'fade'"
            @change="
              patchAnimation(
                'entrance',
                $event.target.value
              )
            "
          >
            <option value="fade">
              Fade
            </option>

            <option value="slide">
              Slide
            </option>

            <option value="pop">
              Pop
            </option>

            <option value="none">
              None
            </option>
          </select>
        </label>


        <label class="inspector-field">
          <span>
            Exit animation
          </span>

          <select
            :value="widget.animations?.exit || 'fade'"
            @change="
              patchAnimation(
                'exit',
                $event.target.value
              )
            "
          >
            <option value="fade">
              Fade
            </option>

            <option value="slide">
              Slide
            </option>

            <option value="pop">
              Pop
            </option>

            <option value="none">
              None
            </option>
          </select>
        </label>


        <label class="inspector-field">
          <span>
            Trigger duration
          </span>

          <div class="duration-field">
            <input
              type="number"
              min="100"
              max="30000"
              step="100"
              :value="
                widget.animations?.durationMs ||
                6000
              "
              @change="
                patchAnimation(
                  'durationMs',
                  Number($event.target.value)
                )
              "
            >

            <span>
              ms
            </span>
          </div>
        </label>


        <button
          type="button"
          class="behaviour-test"
          @click="$emit('test', widget)"
        >
          ▶ Test widget
        </button>
      </div>
    </section>
  </aside>
</template>


<script setup>
import {
  computed,
  ref,
} from 'vue'

import {
  getWidgetByType,
  getWidgetCategory,
  getWidgetIntegration,
} from '../../widgets/registry/index.js'


// ============================================================
// SECTION 06
// PROPS
// ============================================================

const props = defineProps({
  widget: {
    type: Object,
    default: null,
  },

  themes: {
    type: Array,
    default: () => [],
  },

  themeId: {
    type: String,
    default: '',
  },
})


// ============================================================
// SECTION 06
// EVENTS
// ============================================================

const emit = defineEmits([
  'change',
  'layout',
  'test',
])


// ============================================================
// SECTION 06B
// TAB STATE
// ============================================================

const tab =
  ref('content')


// ============================================================
// SECTION 06A
// REGISTRY DEFINITION
// ============================================================

const definition =
  computed(() => {
    if (!props.widget) {
      return null
    }

    return getWidgetByType(
      props.widget.type,
    )
  })


// ============================================================
// SECTION 06A
// IDENTITY HELPERS
// ============================================================

const resolveIcon =
  computed(() => {
    const icon =
      definition.value?.icon

    if (
      typeof icon === 'string' &&
      icon.length <= 4
    ) {
      return icon
    }

    return '◆'
  })


const categoryLabel =
  computed(() => {
    const id =
      definition.value
        ?.categories?.[0]

    if (!id) {
      return 'Widget'
    }

    return (
      getWidgetCategory(id)
        ?.label ||
      id
    )
  })


const integrationLabel =
  computed(() => {
    const id =
      definition.value
        ?.integrations?.[0]

    if (!id) {
      return ''
    }

    return (
      getWidgetIntegration(id)
        ?.label ||
      id
    )
  })


// ============================================================
// SECTION 06F
// DISPLAY MODE
// ============================================================

const displayMode =
  computed(() => {
    return (
      props.widget?.displayMode ||
      (
        definition.value
          ?.categories
          ?.includes('alerts')
          ? 'triggered'
          : 'always'
      )
    )
  })


const displayModeLabel =
  computed(() => {
    return displayMode.value ===
      'triggered'
      ? 'Triggered'
      : 'Always'
  })


// ============================================================
// SECTION 06E
// SIZE LIMITS
// ============================================================

const minimumWidth =
  computed(() => {
    return (
      definition.value
        ?.minimumSize
        ?.width ||
      80
    )
  })


const minimumHeight =
  computed(() => {
    return (
      definition.value
        ?.minimumSize
        ?.height ||
      50
    )
  })


// ============================================================
// SECTION 06
// PATCH HELPERS
// ============================================================

function patch(next) {
  if (!props.widget) {
    return
  }

  emit(
    'change',
    {
      ...props.widget,
      ...next,
      updatedAt:
        new Date().toISOString(),
    },
  )
}


function patchSetting(
  key,
  value,
) {
  patch({
    settings: {
      ...props.widget.settings,
      [key]: value,
    },
  })
}


function setting(
  field,
  value,
) {
  patchSetting(
    field.key,
    [
      'number',
      'range',
    ].includes(field.type)
      ? Number(value)
      : value,
  )
}


function frame(
  key,
  rawValue,
) {
  const value =
    Number(rawValue)

  if (
    !Number.isFinite(value)
  ) {
    return
  }

  let safeValue =
    Math.max(
      0,
      value,
    )

  if (
    key === 'width'
  ) {
    safeValue =
      Math.max(
        minimumWidth.value,
        safeValue,
      )
  }

  if (
    key === 'height'
  ) {
    safeValue =
      Math.max(
        minimumHeight.value,
        safeValue,
      )
  }

  patch({
    frame: {
      ...props.widget.frame,
      [key]: safeValue,
    },
  })
}


function patchAnimation(
  key,
  value,
) {
  patch({
    animations: {
      ...props.widget.animations,
      [key]: value,
    },
  })
}
</script>


<style scoped>
/* ============================================================
   PROJECT RESPAWN
   SECTION 06 — WIDGET SETTINGS

   06A Identity
   06B Tabs
   06C Content
   06D Style
   06E Layout
   06F Behaviour
   ============================================================ */


/* ============================================================
   ROOT
   ============================================================ */

.inspector-panel {
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
   06A
   IDENTITY
   ============================================================ */

.inspector-identity {
  display: grid;

  flex: 0 0 auto;

  grid-template-columns:
    32px
    minmax(0, 1fr)
    auto;

  align-items: center;

  gap: 7px;

  min-height: 54px;

  padding:
    8px 10px;

  border-bottom:
    1px solid
    rgba(148, 163, 184, 0.09);
}

.inspector-identity__icon {
  display: grid;

  width: 32px;
  height: 32px;

  place-items: center;

  border-radius: 7px;

  background:
    rgba(139, 92, 246, 0.1);

  color:
    #b8a4ff;

  font-size: 14px;
}

.inspector-identity__copy {
  min-width: 0;
}

.inspector-identity__copy strong {
  display: block;

  overflow: hidden;

  color:
    #edf2f7;

  font-size: 10px;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.inspector-identity__copy small {
  display: block;

  margin-top: 3px;

  overflow: hidden;

  color:
    #718399;

  font-size: 7px;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.inspector-identity__states {
  display: grid;

  justify-items: end;

  gap: 3px;
}

.inspector-identity__states em {
  padding:
    2px 5px;

  border-radius: 999px;

  background:
    rgba(148, 163, 184, 0.08);

  color:
    #8192a6;

  font-size: 6px;

  font-style: normal;

  font-weight: 800;

  text-transform: uppercase;
}

.inspector-identity__empty {
  grid-column: 1 / -1;

  color:
    #74869b;

  font-size: 9px;
}


/* ============================================================
   06B
   MAIN TABS
   ============================================================ */

.inspector-main-tabs {
  display: grid;

  flex: 0 0 auto;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  min-height:
    37px;

  border-bottom:
    1px solid
    rgba(148, 163, 184, 0.09);
}

.inspector-main-tabs button {
  min-width: 0;

  min-height:
    37px;

  padding:
    4px 3px;

  border:
    0;

  border-bottom:
    2px solid transparent;

  border-radius:
    0;

  background:
    transparent;

  color:
    #74869b;

  font-size:
    7px;

  font-weight:
    800;

  cursor:
    pointer;
}

.inspector-main-tabs button:hover {
  color:
    #c4b5fd;
}

.inspector-main-tabs button.active {
  border-bottom-color:
    #8b5cf6;

  background:
    rgba(139, 92, 246, 0.07);

  color:
    #ddd6fe;
}


/* ============================================================
   SECTIONS
   ============================================================ */

.inspector-section {
  display: flex;

  min-width: 0;
  min-height: 0;

  flex:
    1 1 auto;

  flex-direction: column;

  overflow: hidden;
}

.inspector-section__heading {
  display: flex;

  flex: 0 0 auto;

  min-height:
    43px;

  align-items: center;

  padding:
    7px 10px;

  border-bottom:
    1px solid
    rgba(148, 163, 184, 0.06);
}

.inspector-section__heading strong {
  display: block;

  color:
    #e5edf7;

  font-size:
    9px;
}

.inspector-section__heading small {
  display: block;

  margin-top:
    2px;

  color:
    #66798f;

  font-size:
    7px;
}


/* ============================================================
   FIELD CONTAINER
   ============================================================ */

.inspector-fields {
  flex:
    1 1 auto;

  min-height:
    0;

  padding:
    9px;

  overflow-y:
    auto;
}


/* ============================================================
   FIELDS
   ============================================================ */

.inspector-field {
  display: grid;

  gap:
    5px;

  margin-bottom:
    10px;
}

.inspector-field > span {
  color:
    #8798ab;

  font-size:
    8px;

  font-weight:
    700;
}

.inspector-field input,
.inspector-field select,
.inspector-field textarea,
.inspector-card input {
  width:
    100%;

  min-width:
    0;

  min-height:
    30px;

  box-sizing:
    border-box;

  padding:
    5px 7px;

  border:
    1px solid
    rgba(148, 163, 184, 0.15);

  border-radius:
    5px;

  outline:
    none;

  background:
    #091725;

  color:
    #e5edf7;

  font-size:
    9px;
}

.inspector-field textarea {
  min-height:
    72px;

  resize:
    vertical;
}

.inspector-field input:focus,
.inspector-field select:focus,
.inspector-field textarea:focus,
.inspector-card input:focus {
  border-color:
    rgba(139, 92, 246, 0.6);

  box-shadow:
    0 0 0 2px
    rgba(139, 92, 246, 0.07);
}


/* ============================================================
   CHECKBOX
   ============================================================ */

.inspector-field
  input[type="checkbox"] {
  width:
    16px;

  min-height:
    16px;

  accent-color:
    #8b5cf6;
}


/* ============================================================
   STYLE
   ============================================================ */

.theme-swatches {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap:
    5px;

  margin-bottom:
    10px;
}

.theme-swatches button {
  display: flex;

  min-height:
    32px;

  align-items: center;

  gap:
    5px;

  padding:
    5px;

  border:
    1px solid
    rgba(148, 163, 184, 0.11);

  border-radius:
    6px;

  background:
    #091725;

  color:
    #8798ab;

  font-size:
    7px;

  cursor:
    pointer;
}

.theme-swatches button.active {
  border-color:
    rgba(139, 92, 246, 0.65);

  color:
    #ddd6fe;
}

.theme-swatches i {
  width:
    17px;

  height:
    17px;

  border-radius:
    4px;

  background:
    linear-gradient(
      135deg,
      var(--swatch),
      var(--swatch-accent)
    );
}

.range-field {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    38px;

  align-items:
    center;

  gap:
    6px;
}

.range-field output {
  color:
    #a78bfa;

  font-size:
    8px;

  text-align:
    right;
}


/* ============================================================
   06E
   LAYOUT CARDS
   ============================================================ */

.inspector-card {
  margin:
    0 0 9px;

  padding:
    8px;

  border:
    1px solid
    rgba(148, 163, 184, 0.09);

  border-radius:
    7px;

  background:
    rgba(6, 16, 29, 0.35);
}

.inspector-card legend {
  padding:
    0 4px;

  color:
    #75879d;

  font-size:
    7px;

  font-weight:
    800;

  text-transform:
    uppercase;
}


/* ============================================================
   POSITION / SIZE
   ============================================================ */

.frame-fields {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap:
    6px;
}

.frame-fields label {
  display: grid;

  gap:
    4px;
}

.frame-fields label > span {
  color:
    #718399;

  font-size:
    7px;

  font-weight:
    800;
}


/* ============================================================
   ALIGNMENT
   ============================================================ */

.alignment-grid {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap:
    4px;
}

.alignment-grid button,
.layout-actions button,
.behaviour-test {
  min-height:
    30px;

  padding:
    4px 5px;

  border:
    1px solid
    rgba(148, 163, 184, 0.11);

  border-radius:
    5px;

  background:
    rgba(12, 27, 44, 0.76);

  color:
    #8fa0b4;

  font-size:
    7px;

  cursor:
    pointer;
}

.alignment-grid button:hover,
.layout-actions button:hover,
.behaviour-test:hover {
  border-color:
    rgba(139, 92, 246, 0.4);

  color:
    #c4b5fd;
}


/* ============================================================
   LAYOUT QUICK ACTIONS
   ============================================================ */

.layout-actions {
  display: grid;

  gap:
    5px;
}


/* ============================================================
   06F
   BEHAVIOUR
   ============================================================ */

.duration-field {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    24px;

  align-items:
    center;

  gap:
    5px;
}

.duration-field span {
  color:
    #718399;

  font-size:
    7px;
}

.behaviour-test {
  width:
    100%;

  border-color:
    rgba(139, 92, 246, 0.4);

  background:
    rgba(91, 33, 182, 0.12);

  color:
    #c4b5fd;
}


/* ============================================================
   EMPTY STATES
   ============================================================ */

.empty-inspector,
.inspector-inline-empty {
  color:
    #718399;

  font-size:
    8px;

  line-height:
    1.45;
}

.empty-inspector {
  display: grid;

  flex:
    1 1 auto;

  place-content: center;

  padding:
    20px;

  text-align:
    center;
}

.empty-inspector strong {
  color:
    #cbd5e1;

  font-size:
    10px;
}
</style>