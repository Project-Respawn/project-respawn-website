<template>
  <section class="chat-typography">
    <!-- =========================================================
         HEADER
    ========================================================== -->
    <header class="chat-typography__header">
      <div>
        <p class="chat-typography__eyebrow">
          Text Styling
        </p>

        <h2>
          Chat Typography
        </h2>

        <p>
          Control fonts, sizes, weights and colours across
          your unified chat.
        </p>
      </div>
    </header>

    <!-- =========================================================
         USERNAMES
    ========================================================== -->
    <section class="chat-typography__section">
      <header class="section-header">
        <div>
          <h3>
            Usernames
          </h3>

          <p>
            Control how chat usernames appear.
          </p>
        </div>
      </header>

      <div class="setting-group">
        <!-- Username font -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Font family
              </strong>

              <p>
                Choose the font used for usernames.
              </p>
            </div>
          </div>

          <select
            class="select-control"
            :value="model.usernameFont"
            @change="
              updateSetting(
                'usernameFont',
                $event.target.value
              )
            "
          >
            <option
              v-for="font in fontOptions"
              :key="font.value"
              :value="font.value"
            >
              {{ font.label }}
            </option>
          </select>
        </div>

        <!-- Username weight -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Font weight
              </strong>

              <p>
                Adjust how bold usernames appear.
              </p>
            </div>
          </div>

          <div class="segmented-control">
            <button
              v-for="option in weightOptions"
              :key="option.value"
              type="button"
              class="segmented-control__button"
              :class="{
                'segmented-control__button--active':
                  Number(model.usernameWeight) === option.value,
              }"
              @click="
                updateSetting(
                  'usernameWeight',
                  option.value
                )
              "
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Username size -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Font size
              </strong>

              <p>
                Adjust the size of usernames.
              </p>
            </div>

            <span class="setting-value">
              {{ model.usernameSize }}px
            </span>
          </div>

          <input
            class="range-control"
            type="range"
            min="10"
            max="28"
            step="1"
            :value="model.usernameSize"
            @input="
              updateSetting(
                'usernameSize',
                Number($event.target.value)
              )
            "
          />
        </div>

        <!-- Username colour -->
        <div class="setting-row">
          <div class="setting-row__content">
            <strong>
              Username colour
            </strong>

            <p>
              Choose the default colour used for usernames.
            </p>
          </div>

          <ColourControl
            :value="model.usernameColor"
            fallback="#a78bfa"
            @update="
              updateSetting(
                'usernameColor',
                $event
              )
            "
          />
        </div>
      </div>
    </section>

    <!-- =========================================================
         MESSAGE TEXT
    ========================================================== -->
    <section class="chat-typography__section">
      <header class="section-header">
        <div>
          <h3>
            Message Text
          </h3>

          <p>
            Control the typography used for chat messages.
          </p>
        </div>
      </header>

      <div class="setting-group">
        <!-- Message font -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Font family
              </strong>

              <p>
                Choose the font used for message text.
              </p>
            </div>
          </div>

          <select
            class="select-control"
            :value="model.messageFont"
            @change="
              updateSetting(
                'messageFont',
                $event.target.value
              )
            "
          >
            <option
              v-for="font in fontOptions"
              :key="font.value"
              :value="font.value"
            >
              {{ font.label }}
            </option>
          </select>
        </div>

        <!-- Message weight -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Font weight
              </strong>

              <p>
                Adjust how bold chat messages appear.
              </p>
            </div>
          </div>

          <div class="segmented-control">
            <button
              v-for="option in weightOptions"
              :key="option.value"
              type="button"
              class="segmented-control__button"
              :class="{
                'segmented-control__button--active':
                  Number(model.messageWeight) === option.value,
              }"
              @click="
                updateSetting(
                  'messageWeight',
                  option.value
                )
              "
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Message size -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Font size
              </strong>

              <p>
                Adjust the size of chat message text.
              </p>
            </div>

            <span class="setting-value">
              {{ model.messageSize }}px
            </span>
          </div>

          <input
            class="range-control"
            type="range"
            min="10"
            max="32"
            step="1"
            :value="model.messageSize"
            @input="
              updateSetting(
                'messageSize',
                Number($event.target.value)
              )
            "
          />
        </div>

        <!-- Message colour -->
        <div class="setting-row">
          <div class="setting-row__content">
            <strong>
              Message colour
            </strong>

            <p>
              Choose the default colour for chat messages.
            </p>
          </div>

          <ColourControl
            :value="model.messageColor"
            fallback="#e2e8f0"
            @update="
              updateSetting(
                'messageColor',
                $event
              )
            "
          />
        </div>
      </div>
    </section>

    <!-- =========================================================
         SUPPORTING TEXT
    ========================================================== -->
    <section class="chat-typography__section">
      <header class="section-header">
        <div>
          <h3>
            Supporting Text
          </h3>

          <p>
            Style timestamps, links and system messages.
          </p>
        </div>
      </header>

      <div class="setting-group">
        <!-- Timestamp -->
        <div class="setting-row">
          <div class="setting-row__content">
            <strong>
              Timestamp colour
            </strong>

            <p>
              Colour used for message timestamps.
            </p>
          </div>

          <ColourControl
            :value="model.timestampColor"
            fallback="#94a3b8"
            @update="
              updateSetting(
                'timestampColor',
                $event
              )
            "
          />
        </div>

        <!-- System -->
        <div class="setting-row">
          <div class="setting-row__content">
            <strong>
              System message colour
            </strong>

            <p>
              Colour used for system and notification messages.
            </p>
          </div>

          <ColourControl
            :value="model.systemMessageColor"
            fallback="#f59e0b"
            @update="
              updateSetting(
                'systemMessageColor',
                $event
              )
            "
          />
        </div>

        <!-- Links -->
        <div class="setting-row">
          <div class="setting-row__content">
            <strong>
              Link colour
            </strong>

            <p>
              Colour used for clickable links in chat.
            </p>
          </div>

          <ColourControl
            :value="model.linkColor"
            fallback="#60a5fa"
            @update="
              updateSetting(
                'linkColor',
                $event
              )
            "
          />
        </div>
      </div>
    </section>

    <!-- =========================================================
         EFFECTS
    ========================================================== -->
    <section class="chat-typography__section">
      <header class="section-header">
        <div>
          <h3>
            Text Effects
          </h3>

          <p>
            Add extra readability for text over gameplay.
          </p>
        </div>
      </header>

      <div class="setting-row">
        <div class="setting-row__content">
          <strong>
            Text shadow
          </strong>

          <p>
            Add a subtle shadow behind chat text to improve
            readability on bright backgrounds.
          </p>
        </div>

        <label class="toggle">
          <input
            type="checkbox"
            :checked="model.textShadow === true"
            @change="
              updateSetting(
                'textShadow',
                $event.target.checked
              )
            "
          />

          <span class="toggle__track">
            <span class="toggle__thumb"></span>
          </span>
        </label>
      </div>
    </section>

    <!-- =========================================================
         INFO
    ========================================================== -->
    <div class="chat-typography__info">
      <span class="chat-typography__info-icon">
        i
      </span>

      <p>
        Typography changes update the Live Preview immediately.
        Keep text readable against both light and dark gameplay.
      </p>
    </div>
  </section>
</template>

<script setup>
import {
  defineComponent,
  h,
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

const fontOptions = Object.freeze([
  {
    value: 'Inter',
    label: 'Inter',
  },
  {
    value: 'Arial',
    label: 'Arial',
  },
  {
    value: 'Helvetica',
    label: 'Helvetica',
  },
  {
    value: 'Verdana',
    label: 'Verdana',
  },
  {
    value: 'Trebuchet MS',
    label: 'Trebuchet MS',
  },
  {
    value: 'Georgia',
    label: 'Georgia',
  },
  {
    value: 'Courier New',
    label: 'Courier New',
  },
])

const weightOptions = Object.freeze([
  {
    value: 400,
    label: 'Regular',
  },
  {
    value: 500,
    label: 'Medium',
  },
  {
    value: 600,
    label: 'Semi',
  },
  {
    value: 700,
    label: 'Bold',
  },
])

/* =========================================================
   DEFAULT SAFETY
========================================================= */

ensureTypographyState()

function ensureTypographyState() {
  const defaults = {
    usernameFont: 'Inter',
    usernameWeight: 600,
    usernameSize: 14,
    usernameColor: '#a78bfa',

    messageFont: 'Inter',
    messageWeight: 400,
    messageSize: 14,
    messageColor: '#e2e8f0',

    timestampColor: '#94a3b8',
    systemMessageColor: '#f59e0b',
    linkColor: '#60a5fa',

    textShadow: false,
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
   COLOUR CONTROL
========================================================= */

const ColourControl = defineComponent({
  name: 'ColourControl',

  props: {
    value: {
      type: String,
      required: true,
    },

    fallback: {
      type: String,
      required: true,
    },
  },

  emits: [
    'update',
  ],

  setup(
    props,
    { emit }
  ) {
    function normalizeHex(
      value
    ) {
      if (
        typeof value !== 'string'
      ) {
        return props.fallback
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

      return props.fallback
    }

    return () =>
      h(
        'div',
        {
          class:
            'colour-control',
        },
        [
          h(
            'input',
            {
              class:
                'colour-control__picker',

              type:
                'color',

              value:
                props.value,

              onInput:
                event => {
                  emit(
                    'update',
                    event.target.value
                  )
                },
            }
          ),

          h(
            'input',
            {
              class:
                'colour-control__value',

              type:
                'text',

              maxlength:
                7,

              value:
                props.value,

              onChange:
                event => {
                  emit(
                    'update',
                    normalizeHex(
                      event.target.value
                    )
                  )
                },
            }
          ),
        ]
      )
  },
})
</script>

<style scoped>
/* =========================================================
   ROOT
========================================================= */

.chat-typography {
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

.chat-typography__header {
  padding:
    17px
    18px
    15px;

  border-bottom:
    1px solid #1e2630;
}

.chat-typography__eyebrow {
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

.chat-typography__header h2 {
  margin: 0;

  color: #eef2f7;

  font-size: 15px;
  font-weight: 700;
}

.chat-typography__header > div > p:last-child {
  margin:
    5px
    0
    0;

  color: #7f8a99;

  font-size: 10px;
  line-height: 1.45;
}

/* =========================================================
   SECTIONS
========================================================= */

.chat-typography__section {
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

  box-sizing: border-box;

  border-top:
    1px solid
    rgba(
      51,
      65,
      85,
      0.27
    );
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
   SELECT
========================================================= */

.select-control {
  width: 100%;
  height: 32px;

  padding:
    0
    9px;

  border:
    1px solid #303946;

  border-radius: 6px;

  outline: none;

  color: #cbd3dd;

  background: #0d141d;

  font-family: inherit;
  font-size: 9px;

  cursor: pointer;
}

.select-control:focus {
  border-color:
    rgba(
      139,
      92,
      246,
      0.7
    );
}

/* =========================================================
   SEGMENTED CONTROL
========================================================= */

.segmented-control {
  display: grid;

  grid-template-columns:
    repeat(
      4,
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
  min-width: 0;
  min-height: 28px;

  padding:
    0
    4px;

  border: 0;
  border-radius: 5px;

  color: #74808e;

  background: transparent;

  font-family: inherit;
  font-size: 7px;
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

  accent-color: #8b5cf6;
}

/* =========================================================
   COLOUR
========================================================= */

:deep(.colour-control) {
  display: flex;

  flex: none;

  align-items: center;

  gap: 6px;
}

:deep(.colour-control__picker) {
  width: 30px;
  height: 28px;

  padding: 2px;

  border:
    1px solid #34404d;

  border-radius: 5px;

  background: #0e151e;

  cursor: pointer;
}

:deep(.colour-control__value) {
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

:deep(.colour-control__value:focus) {
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

.chat-typography__info {
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

.chat-typography__info-icon {
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

.chat-typography__info p {
  margin: 0;

  color: #808b99;

  font-size: 8px;
  line-height: 1.5;
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {
  .chat-typography__header {
    padding:
      15px
      14px;
  }

  .setting-row,
  .setting-block {
    padding-left: 13px;
    padding-right: 13px;
  }

  .segmented-control {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}
</style>