<template>
  <section class="chat-layout">
    <!-- =========================================================
         HEADER
    ========================================================== -->
    <header class="chat-layout__header">
      <div>
        <p class="chat-layout__eyebrow">
          Structure
        </p>

        <h2>
          Chat Layout
        </h2>

        <p>
          Control the size, alignment and structure of your
          unified chat.
        </p>
      </div>
    </header>

    <!-- =========================================================
         CHAT POSITION
    ========================================================== -->
    <section class="chat-layout__section">
      <header class="section-header">
        <div>
          <h3>
            Chat Position
          </h3>

          <p>
            Control how the chat container is positioned inside
            the available overlay space.
          </p>
        </div>
      </header>

      <div class="setting-group">
        <!-- Alignment -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Chat alignment
              </strong>

              <p>
                Position the chat to the left, centre or right.
              </p>
            </div>
          </div>

          <div class="alignment-control">
            <button
              v-for="option in alignmentOptions"
              :key="option.value"
              type="button"
              class="alignment-card"
              :class="{
                'alignment-card--active':
                  model.alignment === option.value,
              }"
              @click="
                updateSetting(
                  'alignment',
                  option.value
                )
              "
            >
              <span class="alignment-card__preview">
                <span
                  class="alignment-card__bar"
                  :class="
                    `alignment-card__bar--${option.value}`
                  "
                ></span>
              </span>

              <span>
                {{ option.label }}
              </span>
            </button>
          </div>
        </div>

        <!-- Width -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Chat width
              </strong>

              <p>
                Choose how much horizontal space the chat should
                occupy.
              </p>
            </div>
          </div>

          <div class="width-control">
            <button
              v-for="option in widthOptions"
              :key="option.value"
              type="button"
              class="width-card"
              :class="{
                'width-card--active':
                  model.width === option.value,
              }"
              @click="
                updateSetting(
                  'width',
                  option.value
                )
              "
            >
              <span
                class="width-card__preview"
                :class="
                  `width-card__preview--${option.value}`
                "
              >
                <span></span>
              </span>

              <strong>
                {{ option.label }}
              </strong>

              <small>
                {{ option.description }}
              </small>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- =========================================================
         MESSAGE STRUCTURE
    ========================================================== -->
    <section class="chat-layout__section">
      <header class="section-header">
        <div>
          <h3>
            Message Structure
          </h3>

          <p>
            Control where supporting message information appears.
          </p>
        </div>
      </header>

      <div class="setting-group">
        <!-- Badge / avatar position -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Badge position
              </strong>

              <p>
                Choose where platform and user badges appear
                relative to the message.
              </p>
            </div>
          </div>

          <div class="segmented-control">
            <button
              v-for="option in badgePositionOptions"
              :key="option.value"
              type="button"
              class="segmented-control__button"
              :class="{
                'segmented-control__button--active':
                  model.avatarBadgePosition === option.value,
              }"
              @click="
                updateSetting(
                  'avatarBadgePosition',
                  option.value
                )
              "
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Timestamp position -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Timestamp position
              </strong>

              <p>
                Choose where timestamps appear within each
                message row.
              </p>
            </div>
          </div>

          <div class="segmented-control segmented-control--three">
            <button
              v-for="option in timestampPositionOptions"
              :key="option.value"
              type="button"
              class="segmented-control__button"
              :class="{
                'segmented-control__button--active':
                  model.timestampPosition === option.value,
              }"
              @click="
                updateSetting(
                  'timestampPosition',
                  option.value
                )
              "
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- =========================================================
         SEPARATORS
    ========================================================== -->
    <section class="chat-layout__section">
      <header class="section-header">
        <div>
          <h3>
            Message Separators
          </h3>

          <p>
            Add subtle dividers between individual chat messages.
          </p>
        </div>
      </header>

      <div class="setting-group">
        <!-- Enable separators -->
        <div class="setting-row">
          <div class="setting-row__content">
            <strong>
              Show message separators
            </strong>

            <p>
              Add a divider between each visible message.
            </p>
          </div>

          <label class="toggle">
            <input
              type="checkbox"
              :checked="
                model.showMessageSeparators === true
              "
              @change="
                updateSetting(
                  'showMessageSeparators',
                  $event.target.checked
                )
              "
            />

            <span class="toggle__track">
              <span class="toggle__thumb"></span>
            </span>
          </label>
        </div>

        <!-- Separator style -->
        <div
          v-if="model.showMessageSeparators"
          class="setting-block"
        >
          <div class="setting-block__header">
            <div>
              <strong>
                Separator style
              </strong>

              <p>
                Choose the appearance of the divider line.
              </p>
            </div>
          </div>

          <div class="segmented-control segmented-control--three">
            <button
              v-for="option in separatorStyleOptions"
              :key="option.value"
              type="button"
              class="segmented-control__button"
              :class="{
                'segmented-control__button--active':
                  model.separatorStyle === option.value,
              }"
              @click="
                updateSetting(
                  'separatorStyle',
                  option.value
                )
              "
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Separator colour -->
        <div
          v-if="model.showMessageSeparators"
          class="setting-row"
        >
          <div class="setting-row__content">
            <strong>
              Separator colour
            </strong>

            <p>
              Choose the colour used for message dividers.
            </p>
          </div>

          <div class="colour-control">
            <input
              class="colour-control__picker"
              type="color"
              :value="model.separatorColor"
              @input="
                updateSetting(
                  'separatorColor',
                  $event.target.value
                )
              "
            />

            <input
              class="colour-control__value"
              type="text"
              :value="model.separatorColor"
              maxlength="7"
              @change="
                updateSetting(
                  'separatorColor',
                  normalizeHex(
                    $event.target.value,
                    '#334155'
                  )
                )
              "
            />
          </div>
        </div>
      </div>
    </section>

    <!-- =========================================================
         INFO
    ========================================================== -->
    <div class="chat-layout__info">
      <span class="chat-layout__info-icon">
        i
      </span>

      <p>
        Width and alignment should update the Live Preview
        immediately. Message-level positioning and separators may
        need a small preview update if they are not yet represented
        there.
      </p>
    </div>
  </section>
</template>

<script setup>
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

const alignmentOptions = Object.freeze([
  {
    value: 'left',
    label: 'Left',
  },

  {
    value: 'center',
    label: 'Centre',
  },

  {
    value: 'right',
    label: 'Right',
  },
])

const widthOptions = Object.freeze([
  {
    value: 'compact',
    label: 'Compact',
    description: 'Narrow chat',
  },

  {
    value: 'medium',
    label: 'Medium',
    description: 'Balanced width',
  },

  {
    value: 'full',
    label: 'Full',
    description: 'Maximum width',
  },
])

const badgePositionOptions = Object.freeze([
  {
    value: 'left',
    label: 'Left',
  },

  {
    value: 'right',
    label: 'Right',
  },
])

const timestampPositionOptions = Object.freeze([
  {
    value: 'left',
    label: 'Left',
  },

  {
    value: 'inline',
    label: 'Inline',
  },

  {
    value: 'right',
    label: 'Right',
  },
])

const separatorStyleOptions = Object.freeze([
  {
    value: 'solid',
    label: 'Solid',
  },

  {
    value: 'dashed',
    label: 'Dashed',
  },

  {
    value: 'dotted',
    label: 'Dotted',
  },
])

/* =========================================================
   SAFE DEFAULT STATE
========================================================= */

ensureLayoutState()

function ensureLayoutState() {
  const defaults = {
    alignment: 'left',
    width: 'full',
    avatarBadgePosition: 'left',
    timestampPosition: 'left',
    showMessageSeparators: false,
    separatorStyle: 'solid',
    separatorColor: '#334155',
  }

  Object.entries(
    defaults
  ).forEach(
    ([key, value]) => {
      if (
        model.value[key] === undefined
      ) {
        model.value[key] = value
      }
    }
  )
}

/* =========================================================
   UPDATE
========================================================= */

function updateSetting(
  key,
  value
) {
  model.value[key] =
    value

  emit('change')
}

/* =========================================================
   COLOUR
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

.chat-layout {
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

.chat-layout__header {
  padding:
    17px
    18px
    15px;

  border-bottom:
    1px solid #1e2630;
}

.chat-layout__eyebrow {
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

.chat-layout__header h2 {
  margin: 0;

  color: #eef2f7;

  font-size: 15px;
  font-weight: 700;
}

.chat-layout__header > div > p:last-child {
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

.chat-layout__section {
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

/* =========================================================
   SETTING ROW
========================================================= */

.setting-row {
  display: flex;

  min-height: 58px;

  align-items: center;
  justify-content: space-between;

  gap: 14px;

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
  max-width: 220px;

  margin:
    3px
    0
    0;

  color: #667281;

  font-size: 8px;
  line-height: 1.4;
}

/* =========================================================
   ALIGNMENT
========================================================= */

.alignment-control {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap: 6px;
}

.alignment-card {
  display: flex;

  min-width: 0;

  flex-direction: column;

  align-items: center;

  gap: 6px;

  padding:
    8px
    6px;

  border:
    1px solid #2c3541;

  border-radius: 6px;

  color: #778392;

  background: #0d141d;

  font-family: inherit;
  font-size: 8px;
  font-weight: 600;

  cursor: pointer;
}

.alignment-card:hover {
  color: #c8d0da;

  border-color: #414d5d;
}

.alignment-card--active {
  color: #eadfff;

  border-color:
    rgba(
      139,
      92,
      246,
      0.55
    );

  background:
    rgba(
      124,
      58,
      237,
      0.12
    );
}

.alignment-card__preview {
  display: flex;

  width: 100%;
  height: 22px;

  align-items: center;

  padding: 3px;

  box-sizing: border-box;

  border:
    1px solid #26303b;

  border-radius: 4px;

  background: #080e15;
}

.alignment-card__bar {
  display: block;

  width: 55%;
  height: 6px;

  border-radius: 2px;

  background: #8b5cf6;
}

.alignment-card__bar--left {
  margin-right: auto;
}

.alignment-card__bar--center {
  margin-left: auto;
  margin-right: auto;
}

.alignment-card__bar--right {
  margin-left: auto;
}

/* =========================================================
   WIDTH
========================================================= */

.width-control {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap: 6px;
}

.width-card {
  display: flex;

  min-width: 0;

  flex-direction: column;

  align-items: center;

  gap: 5px;

  padding:
    8px
    6px;

  border:
    1px solid #2c3541;

  border-radius: 6px;

  color: #768291;

  background: #0d141d;

  font-family: inherit;
  text-align: center;

  cursor: pointer;
}

.width-card:hover {
  border-color: #414d5d;

  background: #111922;
}

.width-card--active {
  border-color:
    rgba(
      139,
      92,
      246,
      0.55
    );

  background:
    rgba(
      124,
      58,
      237,
      0.11
    );
}

.width-card__preview {
  display: flex;

  width: 100%;
  height: 22px;

  align-items: center;
  justify-content: center;

  border:
    1px solid #26303b;

  border-radius: 4px;

  background: #080e15;
}

.width-card__preview span {
  display: block;

  height: 6px;

  border-radius: 2px;

  background: #8b5cf6;
}

.width-card__preview--compact span {
  width: 42%;
}

.width-card__preview--medium span {
  width: 68%;
}

.width-card__preview--full span {
  width: 92%;
}

.width-card strong {
  color: #b9c2cd;

  font-size: 8px;
  font-weight: 700;
}

.width-card small {
  color: #65717f;

  font-size: 7px;
  line-height: 1.3;
}

/* =========================================================
   SEGMENTED CONTROL
========================================================= */

.segmented-control {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 4px;

  padding: 3px;

  border:
    1px solid #2b3541;

  border-radius: 7px;

  background: #0c1219;
}

.segmented-control--three {
  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );
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
   INFO
========================================================= */

.chat-layout__info {
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

.chat-layout__info-icon {
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

.chat-layout__info p {
  margin: 0;

  color: #808b99;

  font-size: 8px;
  line-height: 1.5;
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {
  .chat-layout__header {
    padding:
      15px
      14px;
  }

  .setting-row,
  .setting-block {
    padding-left: 13px;
    padding-right: 13px;
  }

  .alignment-control,
  .width-control {
    grid-template-columns: 1fr;
  }
}
</style>