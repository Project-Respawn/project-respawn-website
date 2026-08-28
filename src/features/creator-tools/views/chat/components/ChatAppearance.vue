<template>
  <section class="chat-appearance">
    <!-- =========================================================
         HEADER
    ========================================================== -->
    <header class="chat-appearance__header">
      <div>
        <p class="chat-appearance__eyebrow">
          Visual Style
        </p>

        <h2>
          Chat Appearance
        </h2>

        <p>
          Control the background, borders and visual treatment
          of your unified chat.
        </p>
      </div>
    </header>

    <!-- =========================================================
         CONTAINER
    ========================================================== -->
    <section class="chat-appearance__section">
      <header class="section-header">
        <div>
          <h3>
            Chat Container
          </h3>

          <p>
            Style the main chat panel shown in your overlay.
          </p>
        </div>
      </header>

      <div class="setting-group">
        <!-- Background type -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Background type
              </strong>

              <p>
                Choose how the main chat background is rendered.
              </p>
            </div>
          </div>

          <div class="segmented-control">
            <button
              v-for="option in backgroundTypeOptions"
              :key="option.value"
              type="button"
              class="segmented-control__button"
              :class="{
                'segmented-control__button--active':
                  container.backgroundType === option.value,
              }"
              @click="
                updateContainer(
                  'backgroundType',
                  option.value
                )
              "
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Background colour -->
        <div
          v-if="container.backgroundType !== 'none'"
          class="setting-row"
        >
          <div class="setting-row__content">
            <strong>
              Background colour
            </strong>

            <p>
              Base colour used behind your chat messages.
            </p>
          </div>

          <div class="colour-control">
            <input
              class="colour-control__picker"
              type="color"
              :value="container.backgroundColor"
              @input="
                updateContainer(
                  'backgroundColor',
                  $event.target.value
                )
              "
            />

            <input
              class="colour-control__value"
              type="text"
              :value="container.backgroundColor"
              maxlength="7"
              @change="
                updateContainer(
                  'backgroundColor',
                  normalizeHex(
                    $event.target.value,
                    '#0f172a'
                  )
                )
              "
            />
          </div>
        </div>

        <!-- Opacity -->
        <div
          v-if="container.backgroundType !== 'none'"
          class="setting-block"
        >
          <div class="setting-block__header">
            <div>
              <strong>
                Background opacity
              </strong>

              <p>
                Adjust how transparent the chat container is.
              </p>
            </div>

            <span class="setting-value">
              {{ Math.round(container.opacity * 100) }}%
            </span>
          </div>

          <input
            class="range-control"
            type="range"
            min="0"
            max="1"
            step="0.05"
            :value="container.opacity"
            @input="
              updateContainer(
                'opacity',
                Number($event.target.value)
              )
            "
          />
        </div>

        <!-- Blur -->
        <div
          v-if="container.backgroundType === 'glass'"
          class="setting-block"
        >
          <div class="setting-block__header">
            <div>
              <strong>
                Glass blur
              </strong>

              <p>
                Increase the background blur for the glass effect.
              </p>
            </div>

            <span class="setting-value">
              {{ container.blur }}px
            </span>
          </div>

          <input
            class="range-control"
            type="range"
            min="0"
            max="30"
            step="1"
            :value="container.blur"
            @input="
              updateContainer(
                'blur',
                Number($event.target.value)
              )
            "
          />
        </div>

        <!-- Border -->
        <div class="setting-row">
          <div class="setting-row__content">
            <strong>
              Show border
            </strong>

            <p>
              Add an outline around the complete chat container.
            </p>
          </div>

          <label class="toggle">
            <input
              type="checkbox"
              :checked="container.borderEnabled"
              @change="
                updateContainer(
                  'borderEnabled',
                  $event.target.checked
                )
              "
            />

            <span class="toggle__track">
              <span class="toggle__thumb"></span>
            </span>
          </label>
        </div>

        <!-- Border colour -->
        <div
          v-if="container.borderEnabled"
          class="setting-row"
        >
          <div class="setting-row__content">
            <strong>
              Border colour
            </strong>

            <p>
              Choose the colour of the container border.
            </p>
          </div>

          <div class="colour-control">
            <input
              class="colour-control__picker"
              type="color"
              :value="container.borderColor"
              @input="
                updateContainer(
                  'borderColor',
                  $event.target.value
                )
              "
            />

            <input
              class="colour-control__value"
              type="text"
              :value="container.borderColor"
              maxlength="7"
              @change="
                updateContainer(
                  'borderColor',
                  normalizeHex(
                    $event.target.value,
                    '#6d28d9'
                  )
                )
              "
            />
          </div>
        </div>

        <!-- Radius -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Corner radius
              </strong>

              <p>
                Adjust how rounded the chat container appears.
              </p>
            </div>

            <span class="setting-value">
              {{ container.borderRadius }}px
            </span>
          </div>

          <input
            class="range-control"
            type="range"
            min="0"
            max="32"
            step="1"
            :value="container.borderRadius"
            @input="
              updateContainer(
                'borderRadius',
                Number($event.target.value)
              )
            "
          />
        </div>

        <!-- Padding -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Container padding
              </strong>

              <p>
                Control the spacing between the outer container
                and the chat content.
              </p>
            </div>

            <span class="setting-value">
              {{ container.padding }}px
            </span>
          </div>

          <input
            class="range-control"
            type="range"
            min="0"
            max="40"
            step="1"
            :value="container.padding"
            @input="
              updateContainer(
                'padding',
                Number($event.target.value)
              )
            "
          />
        </div>
      </div>
    </section>

    <!-- =========================================================
         MESSAGE CARDS
    ========================================================== -->
    <section class="chat-appearance__section">
      <header class="section-header">
        <div>
          <h3>
            Message Cards
          </h3>

          <p>
            Control the background and shape of individual messages.
          </p>
        </div>
      </header>

      <div class="setting-group">
        <!-- Message background -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Message background
              </strong>

              <p>
                Choose whether individual messages have their
                own background.
              </p>
            </div>
          </div>

          <div class="segmented-control">
            <button
              v-for="option in messageBackgroundOptions"
              :key="option.value"
              type="button"
              class="segmented-control__button"
              :class="{
                'segmented-control__button--active':
                  message.backgroundType === option.value,
              }"
              @click="
                updateMessage(
                  'backgroundType',
                  option.value
                )
              "
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Message background colour -->
        <div
          v-if="message.backgroundType !== 'none'"
          class="setting-row"
        >
          <div class="setting-row__content">
            <strong>
              Message colour
            </strong>

            <p>
              Base colour used behind individual messages.
            </p>
          </div>

          <div class="colour-control">
            <input
              class="colour-control__picker"
              type="color"
              :value="message.backgroundColor"
              @input="
                updateMessage(
                  'backgroundColor',
                  $event.target.value
                )
              "
            />

            <input
              class="colour-control__value"
              type="text"
              :value="message.backgroundColor"
              maxlength="7"
              @change="
                updateMessage(
                  'backgroundColor',
                  normalizeHex(
                    $event.target.value,
                    '#111827'
                  )
                )
              "
            />
          </div>
        </div>

        <!-- Message opacity -->
        <div
          v-if="message.backgroundType !== 'none'"
          class="setting-block"
        >
          <div class="setting-block__header">
            <div>
              <strong>
                Message opacity
              </strong>

              <p>
                Adjust the transparency of individual message cards.
              </p>
            </div>

            <span class="setting-value">
              {{ Math.round(message.opacity * 100) }}%
            </span>
          </div>

          <input
            class="range-control"
            type="range"
            min="0"
            max="1"
            step="0.05"
            :value="message.opacity"
            @input="
              updateMessage(
                'opacity',
                Number($event.target.value)
              )
            "
          />
        </div>

        <!-- Message radius -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Message corner radius
              </strong>

              <p>
                Adjust how rounded individual messages appear.
              </p>
            </div>

            <span class="setting-value">
              {{ message.borderRadius }}px
            </span>
          </div>

          <input
            class="range-control"
            type="range"
            min="0"
            max="24"
            step="1"
            :value="message.borderRadius"
            @input="
              updateMessage(
                'borderRadius',
                Number($event.target.value)
              )
            "
          />
        </div>

        <!-- Vertical padding -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Vertical padding
              </strong>

              <p>
                Change the spacing above and below message content.
              </p>
            </div>

            <span class="setting-value">
              {{ message.verticalPadding }}px
            </span>
          </div>

          <input
            class="range-control"
            type="range"
            min="0"
            max="20"
            step="1"
            :value="message.verticalPadding"
            @input="
              updateMessage(
                'verticalPadding',
                Number($event.target.value)
              )
            "
          />
        </div>

        <!-- Horizontal padding -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Horizontal padding
              </strong>

              <p>
                Change the spacing on the left and right of messages.
              </p>
            </div>

            <span class="setting-value">
              {{ message.horizontalPadding }}px
            </span>
          </div>

          <input
            class="range-control"
            type="range"
            min="0"
            max="24"
            step="1"
            :value="message.horizontalPadding"
            @input="
              updateMessage(
                'horizontalPadding',
                Number($event.target.value)
              )
            "
          />
        </div>
      </div>
    </section>

    <!-- =========================================================
         INFO
    ========================================================== -->
    <div class="chat-appearance__info">
      <span class="chat-appearance__info-icon">
        i
      </span>

      <p>
        Appearance changes update the Live Preview immediately.
        Presets can overwrite these values when applied.
      </p>
    </div>
  </section>
</template>

<script setup>
import {
  computed,
} from 'vue'

const model = defineModel({
  type: Object,
  required: true,
})

const emit = defineEmits([
  'change',
  'reset',
])

/* =========================================================
   OPTIONS
========================================================= */

const backgroundTypeOptions = Object.freeze([
  {
    value: 'none',
    label: 'None',
  },
  {
    value: 'solid',
    label: 'Solid',
  },
  {
    value: 'glass',
    label: 'Glass',
  },
])

const messageBackgroundOptions = Object.freeze([
  {
    value: 'none',
    label: 'None',
  },
  {
    value: 'solid',
    label: 'Solid',
  },
])

/* =========================================================
   SAFE STATE
========================================================= */

const container = computed(() => {
  ensureAppearanceState()

  return model.value.container
})

const message = computed(() => {
  ensureAppearanceState()

  return model.value.message
})

function ensureAppearanceState() {
  if (!model.value.container) {
    model.value.container = {}
  }

  if (!model.value.message) {
    model.value.message = {}
  }

  const containerDefaults = {
    backgroundType: 'glass',
    backgroundColor: '#0f172a',
    opacity: 0.7,
    blur: 10,
    borderEnabled: true,
    borderColor: '#6d28d9',
    borderRadius: 12,
    padding: 16,
  }

  const messageDefaults = {
    backgroundType: 'none',
    backgroundColor: '#111827',
    opacity: 0.6,
    borderRadius: 8,
    verticalPadding: 6,
    horizontalPadding: 10,
  }

  Object.entries(
    containerDefaults
  ).forEach(
    ([key, value]) => {
      if (
        model.value.container[key] === undefined
      ) {
        model.value.container[key] = value
      }
    }
  )

  Object.entries(
    messageDefaults
  ).forEach(
    ([key, value]) => {
      if (
        model.value.message[key] === undefined
      ) {
        model.value.message[key] = value
      }
    }
  )
}

/* =========================================================
   UPDATES
========================================================= */

function updateContainer(
  key,
  value
) {
  ensureAppearanceState()

  model.value.container[key] =
    value

  emit('change')
}

function updateMessage(
  key,
  value
) {
  ensureAppearanceState()

  model.value.message[key] =
    value

  emit('change')
}

/* =========================================================
   COLOUR HELPERS
========================================================= */

function normalizeHex(
  value,
  fallback
) {
  if (
    typeof value !== 'string'
  ) {
    return fallback
  }

  const trimmed =
    value.trim()

  if (
    /^#[0-9a-fA-F]{6}$/.test(
      trimmed
    )
  ) {
    return trimmed
  }

  return fallback
}
</script>

<style scoped>
/* =========================================================
   ROOT
========================================================= */

.chat-appearance {
  width: 100%;
  min-width: 0;

  overflow: hidden;

  border:
    1px solid #222a35;

  border-radius: 10px;

  background:
    linear-gradient(
      180deg,
      rgba(14, 20, 28, 0.98),
      rgba(9, 14, 21, 0.98)
    );
}

/* =========================================================
   HEADER
========================================================= */

.chat-appearance__header {
  padding:
    17px
    18px
    15px;

  border-bottom:
    1px solid #1e2630;
}

.chat-appearance__eyebrow {
  margin:
    0
    0
    4px;

  color: #8b5cf6;

  font-size: 8px;
  font-weight: 800;

  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.chat-appearance__header h2 {
  margin: 0;

  color: #eef2f7;

  font-size: 15px;
  font-weight: 700;
}

.chat-appearance__header > div > p:last-child {
  margin:
    5px
    0
    0;

  color: #7f8a99;

  font-size: 10px;
  line-height: 1.45;
}

/* =========================================================
   SECTION
========================================================= */

.chat-appearance__section {
  border-bottom:
    1px solid #1d242e;
}

.section-header {
  padding:
    14px
    15px
    10px;
}

.section-header h3 {
  margin: 0;

  color: #dce2e9;

  font-size: 10px;
  font-weight: 700;

  letter-spacing: 0.045em;
  text-transform: uppercase;
}

.section-header p {
  margin:
    4px
    0
    0;

  color: #6f7a88;

  font-size: 9px;
  line-height: 1.45;
}

.setting-group {
  display: flex;

  flex-direction: column;
}

/* =========================================================
   SETTING BLOCK
========================================================= */

.setting-block {
  padding:
    12px
    15px;

  border-top:
    1px solid
    rgba(
      51,
      65,
      85,
      0.27
    );
}

.setting-block__header {
  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  gap: 12px;

  margin-bottom: 9px;
}

.setting-block__header strong {
  display: block;

  color: #b8c1cc;

  font-size: 9px;
  font-weight: 600;
}

.setting-block__header p {
  max-width: 220px;

  margin:
    3px
    0
    0;

  color: #667281;

  font-size: 8px;
  line-height: 1.4;
}

.setting-value {
  flex: none;

  color: #b89aff;

  font-size: 9px;
  font-weight: 700;
}

/* =========================================================
   SETTING ROW
========================================================= */

.setting-row {
  display: flex;

  min-height: 58px;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding:
    10px
    15px;

  border-top:
    1px solid
    rgba(
      51,
      65,
      85,
      0.27
    );

  box-sizing: border-box;
}

.setting-row__content {
  min-width: 0;
}

.setting-row__content strong {
  display: block;

  color: #b8c1cc;

  font-size: 9px;
  font-weight: 600;
}

.setting-row__content p {
  max-width: 210px;

  margin:
    3px
    0
    0;

  color: #667281;

  font-size: 8px;
  line-height: 1.4;
}

/* =========================================================
   SEGMENTED CONTROL
========================================================= */

.segmented-control {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap: 4px;

  padding: 3px;

  border:
    1px solid #2b3541;

  border-radius: 7px;

  background: #0c1219;
}

.segmented-control__button {
  min-height: 28px;

  padding:
    0
    8px;

  border: 0;
  border-radius: 5px;

  color: #74808e;

  background: transparent;

  font-family: inherit;
  font-size: 8px;
  font-weight: 600;

  cursor: pointer;
}

.segmented-control__button:hover {
  color: #c1cad5;

  background: #151d27;
}

.segmented-control__button--active {
  color: #eadfff;

  background:
    rgba(
      124,
      58,
      237,
      0.2
    );

  box-shadow:
    inset
    0
    0
    0
    1px
    rgba(
      139,
      92,
      246,
      0.2
    );
}

/* =========================================================
   RANGE
========================================================= */

.range-control {
  width: 100%;

  accent-color:
    #8b5cf6;
}

/* =========================================================
   COLOUR
========================================================= */

.colour-control {
  display: flex;

  flex: none;

  align-items: center;

  gap: 6px;
}

.colour-control__picker {
  width: 30px;
  height: 28px;

  padding: 2px;

  border:
    1px solid #34404d;

  border-radius: 5px;

  background: #0e151e;

  cursor: pointer;
}

.colour-control__value {
  width: 72px;
  height: 28px;

  padding:
    0
    7px;

  box-sizing: border-box;

  border:
    1px solid #34404d;

  border-radius: 5px;

  outline: none;

  color: #cbd3dd;

  background: #0e151e;

  font-family: inherit;
  font-size: 8px;
}

.colour-control__value:focus {
  border-color:
    rgba(
      139,
      92,
      246,
      0.7
    );
}

/* =========================================================
   TOGGLE
========================================================= */

.toggle {
  position: relative;

  display: inline-flex;

  flex: none;

  cursor: pointer;
}

.toggle input {
  position: absolute;

  opacity: 0;

  pointer-events: none;
}

.toggle__track {
  display: inline-flex;

  width: 30px;
  height: 17px;

  align-items: center;

  padding: 2px;

  box-sizing: border-box;

  border:
    1px solid #414a56;

  border-radius: 999px;

  background: #2e3641;

  transition:
    background 0.16s ease,
    border-color 0.16s ease;
}

.toggle__thumb {
  width: 11px;
  height: 11px;

  border-radius: 50%;

  background: #d8dee6;

  transition:
    transform 0.16s ease;
}

.toggle input:checked +
.toggle__track {
  border-color: #8b5cf6;

  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #a855f7
    );
}

.toggle
input:checked +
.toggle__track
.toggle__thumb {
  transform:
    translateX(13px);
}

/* =========================================================
   INFO
========================================================= */

.chat-appearance__info {
  display: flex;

  gap: 8px;

  align-items: flex-start;

  margin: 12px;

  padding: 10px;

  border:
    1px solid #282f3a;

  border-radius: 7px;

  background: #111821;
}

.chat-appearance__info-icon {
  display: flex;

  width: 18px;
  height: 18px;

  flex: none;

  align-items: center;
  justify-content: center;

  border:
    1px solid #8b5cf6;

  border-radius: 50%;

  color: #c084fc;

  font-size: 9px;
  font-weight: 700;
}

.chat-appearance__info p {
  margin: 0;

  color: #808b99;

  font-size: 8px;
  line-height: 1.5;
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {
  .chat-appearance__header {
    padding:
      15px
      14px;
  }

  .setting-row,
  .setting-block {
    padding-left: 13px;
    padding-right: 13px;
  }

  .colour-control__value {
    width: 66px;
  }
}
</style>