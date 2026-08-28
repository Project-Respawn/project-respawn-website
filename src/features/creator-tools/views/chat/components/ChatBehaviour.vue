<template>
  <section class="chat-behaviour">
    <!-- =========================================================
         HEADER
    ========================================================== -->
    <header class="chat-behaviour__header">
      <div>
        <p class="chat-behaviour__eyebrow">
          Message Flow
        </p>

        <h2>
          Chat Behaviour
        </h2>

        <p>
          Control how messages enter, move and remain visible
          inside your unified chat.
        </p>
      </div>
    </header>

    <!-- =========================================================
         MESSAGE FLOW
    ========================================================== -->
    <section class="chat-behaviour__section">
      <header class="section-header">
        <div>
          <h3>
            Message Flow
          </h3>

          <p>
            Control the direction and spacing of incoming messages.
          </p>
        </div>
      </header>

      <div class="setting-group">
        <!-- Direction -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Message direction
              </strong>

              <p>
                Choose whether new messages appear from the top
                or bottom of the chat.
              </p>
            </div>
          </div>

          <div class="segmented-control">
            <button
              v-for="option in directionOptions"
              :key="option.value"
              type="button"
              class="segmented-control__button"
              :class="{
                'segmented-control__button--active':
                  model.messageDirection === option.value,
              }"
              @click="
                updateSetting(
                  'messageDirection',
                  option.value
                )
              "
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Spacing -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Message spacing
              </strong>

              <p>
                Adjust the vertical gap between messages.
              </p>
            </div>

            <span class="setting-value">
              {{ model.messageSpacing }}px
            </span>
          </div>

          <input
            class="range-control"
            type="range"
            min="0"
            max="24"
            step="1"
            :value="model.messageSpacing"
            @input="
              updateSetting(
                'messageSpacing',
                Number($event.target.value)
              )
            "
          />
        </div>
      </div>
    </section>

    <!-- =========================================================
         ANIMATION
    ========================================================== -->
    <section class="chat-behaviour__section">
      <header class="section-header">
        <div>
          <h3>
            Message Animation
          </h3>

          <p>
            Control how new messages appear in the chat.
          </p>
        </div>
      </header>

      <div class="setting-group">
        <!-- Animation -->
        <div class="setting-block">
          <div class="setting-block__header">
            <div>
              <strong>
                Entry animation
              </strong>

              <p>
                Choose how incoming messages animate into view.
              </p>
            </div>
          </div>

          <div class="animation-grid">
            <button
              v-for="option in animationOptions"
              :key="option.value"
              type="button"
              class="animation-card"
              :class="{
                'animation-card--active':
                  model.messageAnimation === option.value,
              }"
              @click="
                updateSetting(
                  'messageAnimation',
                  option.value
                )
              "
            >
              <span class="animation-card__icon">
                {{ option.icon }}
              </span>

              <span>
                {{ option.label }}
              </span>
            </button>
          </div>
        </div>

        <!-- Animation speed -->
        <div
          v-if="model.messageAnimation !== 'none'"
          class="setting-block"
        >
          <div class="setting-block__header">
            <div>
              <strong>
                Animation speed
              </strong>

              <p>
                Control how quickly messages animate into view.
              </p>
            </div>
          </div>

          <div class="segmented-control segmented-control--three">
            <button
              v-for="option in speedOptions"
              :key="option.value"
              type="button"
              class="segmented-control__button"
              :class="{
                'segmented-control__button--active':
                  model.animationSpeed === option.value,
              }"
              @click="
                updateSetting(
                  'animationSpeed',
                  option.value
                )
              "
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Fade duration -->
        <div
          v-if="model.messageAnimation === 'fade'"
          class="setting-block"
        >
          <div class="setting-block__header">
            <div>
              <strong>
                Fade duration
              </strong>

              <p>
                Control how long the fade transition takes.
              </p>
            </div>

            <span class="setting-value">
              {{ model.fadeDuration }}s
            </span>
          </div>

          <input
            class="range-control"
            type="range"
            min="0.2"
            max="5"
            step="0.1"
            :value="model.fadeDuration"
            @input="
              updateSetting(
                'fadeDuration',
                Number($event.target.value)
              )
            "
          />
        </div>
      </div>
    </section>

    <!-- =========================================================
         MESSAGE LIFETIME
    ========================================================== -->
    <section class="chat-behaviour__section">
      <header class="section-header">
        <div>
          <h3>
            Message Lifetime
          </h3>

          <p>
            Control how long messages remain visible.
          </p>
        </div>
      </header>

      <div class="setting-block">
        <div class="setting-block__header">
          <div>
            <strong>
              Message lifetime
            </strong>

            <p>
              Set how many seconds a message remains visible
              before it is removed.
            </p>
          </div>

          <span class="setting-value">
            {{ model.messageLifetime }}s
          </span>
        </div>

        <input
          class="range-control"
          type="range"
          min="3"
          max="120"
          step="1"
          :value="model.messageLifetime"
          @input="
            updateSetting(
              'messageLifetime',
              Number($event.target.value)
            )
          "
        />

        <div class="range-labels">
          <span>
            3s
          </span>

          <span>
            120s
          </span>
        </div>
      </div>
    </section>

    <!-- =========================================================
         SCROLLING
    ========================================================== -->
    <section class="chat-behaviour__section">
      <header class="section-header">
        <div>
          <h3>
            Scrolling
          </h3>

          <p>
            Control how the chat follows incoming messages.
          </p>
        </div>
      </header>

      <div class="setting-list">
        <div class="setting-row">
          <div class="setting-row__content">
            <strong>
              Auto scroll
            </strong>

            <p>
              Automatically keep the newest messages visible.
            </p>
          </div>

          <label class="toggle">
            <input
              type="checkbox"
              :checked="model.autoScroll !== false"
              @change="
                updateSetting(
                  'autoScroll',
                  $event.target.checked
                )
              "
            />

            <span class="toggle__track">
              <span class="toggle__thumb"></span>
            </span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-row__content">
            <strong>
              Smooth scrolling
            </strong>

            <p>
              Animate movement when new messages enter the chat.
            </p>
          </div>

          <label class="toggle">
            <input
              type="checkbox"
              :checked="model.smoothScrolling !== false"
              @change="
                updateSetting(
                  'smoothScrolling',
                  $event.target.checked
                )
              "
            />

            <span class="toggle__track">
              <span class="toggle__thumb"></span>
            </span>
          </label>
        </div>

        <div class="setting-row">
          <div class="setting-row__content">
            <strong>
              Pause on hover
            </strong>

            <p>
              Pause message movement and expiry while the viewer
              hovers over the chat.
            </p>
          </div>

          <label class="toggle">
            <input
              type="checkbox"
              :checked="model.pauseOnHover !== false"
              @change="
                updateSetting(
                  'pauseOnHover',
                  $event.target.checked
                )
              "
            />

            <span class="toggle__track">
              <span class="toggle__thumb"></span>
            </span>
          </label>
        </div>
      </div>
    </section>

    <!-- =========================================================
         INFO
    ========================================================== -->
    <div class="chat-behaviour__info">
      <span class="chat-behaviour__info-icon">
        i
      </span>

      <p>
        Behaviour settings control message movement and timing.
        Some animation effects will become more obvious once the
        live chat runtime is connected.
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

const directionOptions = Object.freeze([
  {
    value: 'top-to-bottom',
    label: 'Top → Bottom',
  },

  {
    value: 'bottom-to-top',
    label: 'Bottom → Top',
  },
])

const animationOptions = Object.freeze([
  {
    value: 'none',
    label: 'None',
    icon: '—',
  },

  {
    value: 'fade',
    label: 'Fade',
    icon: '◌',
  },

  {
    value: 'slide',
    label: 'Slide',
    icon: '→',
  },

  {
    value: 'pop',
    label: 'Pop',
    icon: '◇',
  },
])

const speedOptions = Object.freeze([
  {
    value: 'fast',
    label: 'Fast',
  },

  {
    value: 'normal',
    label: 'Normal',
  },

  {
    value: 'slow',
    label: 'Slow',
  },
])

/* =========================================================
   DEFAULT SAFETY
========================================================= */

ensureBehaviourState()

function ensureBehaviourState() {
  const defaults = {
    messageDirection: 'top-to-bottom',
    messageSpacing: 8,
    messageAnimation: 'fade',
    animationSpeed: 'normal',
    fadeDuration: 1.5,
    messageLifetime: 15,
    autoScroll: true,
    pauseOnHover: true,
    smoothScrolling: true,
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
</script>

<style scoped>
/* =========================================================
   ROOT
========================================================= */

.chat-behaviour {
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

.chat-behaviour__header {
  padding:
    17px
    18px
    15px;

  border-bottom:
    1px solid #1e2630;
}

.chat-behaviour__eyebrow {
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

.chat-behaviour__header h2 {
  margin: 0;

  color: #eef2f7;

  font-size: 15px;
  font-weight: 700;
}

.chat-behaviour__header > div > p:last-child {
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

.chat-behaviour__section {
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

.setting-group,
.setting-list {
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
  max-width: 225px;

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
   ANIMATIONS
========================================================= */

.animation-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 6px;
}

.animation-card {
  display: flex;

  min-height: 42px;

  align-items: center;

  gap: 7px;

  padding:
    0
    9px;

  border:
    1px solid #2c3541;

  border-radius: 6px;

  color: #7d8997;

  background: #0d141d;

  font-family: inherit;
  font-size: 8px;
  font-weight: 600;

  cursor: pointer;
}

.animation-card:hover {
  color: #c9d1db;

  border-color: #414d5d;

  background: #121a24;
}

.animation-card--active {
  color: #eadfff;

  border-color:
    rgba(
      139,
      92,
      246,
      0.5
    );

  background:
    rgba(
      124,
      58,
      237,
      0.12
    );
}

.animation-card__icon {
  display: flex;

  width: 22px;
  height: 22px;

  align-items: center;
  justify-content: center;

  border-radius: 5px;

  color: #b99cff;

  background:
    rgba(
      124,
      58,
      237,
      0.12
    );

  font-size: 10px;
}

/* =========================================================
   RANGE
========================================================= */

.range-control {
  width: 100%;

  accent-color: #8b5cf6;
}

.range-labels {
  display: flex;

  justify-content: space-between;

  margin-top: 3px;

  color: #596575;

  font-size: 7px;
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

.chat-behaviour__info {
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

.chat-behaviour__info-icon {
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

.chat-behaviour__info p {
  margin: 0;

  color: #808b99;

  font-size: 8px;
  line-height: 1.5;
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {
  .chat-behaviour__header {
    padding:
      15px
      14px;
  }

  .setting-row,
  .setting-block {
    padding-left: 13px;
    padding-right: 13px;
  }

  .animation-grid {
    grid-template-columns: 1fr;
  }
}
</style>