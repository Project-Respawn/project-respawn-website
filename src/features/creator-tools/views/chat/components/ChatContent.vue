<template>
  <section class="chat-content">
    <!-- =========================================================
         HEADER
    ========================================================== -->
    <header class="chat-content__header">
      <div>
        <p class="chat-content__eyebrow">
          Message Content
        </p>

        <h2>
          Chat Content
        </h2>

        <p>
          Choose which parts of each chat message are shown
          in your unified chat.
        </p>
      </div>
    </header>

    <!-- =========================================================
         MESSAGE INFORMATION
    ========================================================== -->
    <section class="chat-content__section">
      <header class="section-header">
        <div>
          <h3>
            Message Information
          </h3>

          <p>
            Control the information shown alongside each
            message.
          </p>
        </div>
      </header>

      <div class="setting-list">
        <div class="setting-row">
          <div class="setting-row__content">
            <strong>
              Show usernames
            </strong>

            <p>
              Display the sender's username with each
              message.
            </p>
          </div>

          <label class="toggle">
            <input
              type="checkbox"
              :checked="model.showUsername !== false"
              @change="
                updateBoolean(
                  'showUsername',
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
              Show badges
            </strong>

            <p>
              Show broadcaster, moderator and other
              supported chat badges.
            </p>
          </div>

          <label class="toggle">
            <input
              type="checkbox"
              :checked="model.showBadges !== false"
              @change="
                updateBoolean(
                  'showBadges',
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
              Show timestamps
            </strong>

            <p>
              Display the time each message was received.
            </p>
          </div>

          <label class="toggle">
            <input
              type="checkbox"
              :checked="model.showTimestamps !== false"
              @change="
                updateBoolean(
                  'showTimestamps',
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
              Show platform indicators
            </strong>

            <p>
              Show which platform each message came from.
            </p>
          </div>

          <label class="toggle">
            <input
              type="checkbox"
              :checked="
                model.showPlatformIndicator !== false
              "
              @change="
                updateBoolean(
                  'showPlatformIndicator',
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
              Show emotes
            </strong>

            <p>
              Display supported platform emotes inside
              chat messages.
            </p>
          </div>

          <label class="toggle">
            <input
              type="checkbox"
              :checked="model.showEmotes !== false"
              @change="
                updateBoolean(
                  'showEmotes',
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
         MESSAGE RULES
    ========================================================== -->
    <section class="chat-content__section">
      <header class="section-header">
        <div>
          <h3>
            Message Rules
          </h3>

          <p>
            Filter or highlight specific message types.
          </p>
        </div>
      </header>

      <div class="setting-list">
        <div class="setting-row">
          <div class="setting-row__content">
            <strong>
              Hide command messages
            </strong>

            <p>
              Hide messages beginning with commands such
              as !discord or !socials.
            </p>
          </div>

          <label class="toggle">
            <input
              type="checkbox"
              :checked="
                model.hideCommandMessages === true
              "
              @change="
                updateBoolean(
                  'hideCommandMessages',
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
              Hide bot messages
            </strong>

            <p>
              Remove automated bot messages from the
              unified chat display.
            </p>
          </div>

          <label class="toggle">
            <input
              type="checkbox"
              :checked="
                model.hideBotMessages === true
              "
              @change="
                updateBoolean(
                  'hideBotMessages',
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
              Highlight mentions
            </strong>

            <p>
              Visually highlight messages that mention
              the creator.
            </p>
          </div>

          <label class="toggle">
            <input
              type="checkbox"
              :checked="
                model.highlightMentions !== false
              "
              @change="
                updateBoolean(
                  'highlightMentions',
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
         MESSAGE LIMITS
    ========================================================== -->
    <section class="chat-content__section">
      <header class="section-header">
        <div>
          <h3>
            Message Limits
          </h3>

          <p>
            Control how many messages remain visible in
            the chat.
          </p>
        </div>
      </header>

      <div class="message-limit">
        <div class="message-limit__content">
          <strong>
            Maximum visible messages
          </strong>

          <p>
            Limit the number of messages shown at the
            same time.
          </p>
        </div>

        <div class="number-control">
          <button
            type="button"
            class="number-control__button"
            :disabled="maximumVisibleMessages <= 1"
            @click="decreaseMaximumMessages"
          >
            −
          </button>

          <input
            class="number-control__input"
            type="number"
            min="1"
            max="100"
            :value="maximumVisibleMessages"
            @change="
              setMaximumMessages(
                $event.target.value
              )
            "
          />

          <button
            type="button"
            class="number-control__button"
            :disabled="maximumVisibleMessages >= 100"
            @click="increaseMaximumMessages"
          >
            +
          </button>
        </div>
      </div>
    </section>

    <!-- =========================================================
         INFO
    ========================================================== -->
    <div class="chat-content__info">
      <span class="chat-content__info-icon">
        i
      </span>

      <p>
        Changes update the Live Preview immediately.
        They are not persisted until you use
        <strong>Save Settings</strong>.
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
   MAXIMUM MESSAGES
========================================================= */

const maximumVisibleMessages =
  computed(() => {
    return clampInteger(
      model.value
        ?.maximumVisibleMessages,
      1,
      100,
      10
    )
  })

/* =========================================================
   BOOLEAN SETTINGS
========================================================= */

function updateBoolean(
  key,
  value
) {
  model.value[key] =
    value

  emit('change')
}

/* =========================================================
   MESSAGE LIMIT
========================================================= */

function setMaximumMessages(
  value
) {
  model.value
    .maximumVisibleMessages =
      clampInteger(
        value,
        1,
        100,
        10
      )

  emit('change')
}

function decreaseMaximumMessages() {
  setMaximumMessages(
    maximumVisibleMessages.value -
      1
  )
}

function increaseMaximumMessages() {
  setMaximumMessages(
    maximumVisibleMessages.value +
      1
  )
}

/* =========================================================
   HELPERS
========================================================= */

function clampInteger(
  value,
  min,
  max,
  fallback
) {
  const parsed =
    Number.parseInt(
      value,
      10
    )

  if (
    Number.isNaN(
      parsed
    )
  ) {
    return fallback
  }

  return Math.min(
    max,
    Math.max(
      min,
      parsed
    )
  )
}
</script>

<style scoped>
/* =========================================================
   ROOT
========================================================= */

.chat-content {
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

.chat-content__header {
  padding:
    17px
    18px
    15px;

  border-bottom:
    1px solid #1e2630;
}

.chat-content__eyebrow {
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

.chat-content__header h2 {
  margin: 0;

  color: #eef2f7;

  font-size: 15px;
  font-weight: 700;
}

.chat-content__header > div > p:last-child {
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

.chat-content__section {
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

  text-transform: uppercase;
  letter-spacing: 0.045em;
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

/* =========================================================
   SETTINGS
========================================================= */

.setting-list {
  display: flex;

  flex-direction: column;
}

.setting-row {
  display: flex;

  min-height: 56px;

  align-items: center;
  justify-content: space-between;

  gap: 16px;

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

  transition:
    background 0.16s ease;
}

.setting-row:hover {
  background:
    rgba(
      255,
      255,
      255,
      0.015
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
  max-width: 240px;

  margin:
    3px
    0
    0;

  color: #667281;

  font-size: 8px;
  line-height: 1.4;
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
   MESSAGE LIMIT
========================================================= */

.message-limit {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 14px;

  padding:
    12px
    15px
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

.message-limit__content {
  min-width: 0;
}

.message-limit__content strong {
  display: block;

  color: #b8c1cc;

  font-size: 9px;
  font-weight: 600;
}

.message-limit__content p {
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
   NUMBER CONTROL
========================================================= */

.number-control {
  display: grid;

  grid-template-columns:
    28px
    44px
    28px;

  flex: none;

  overflow: hidden;

  border:
    1px solid #303946;

  border-radius: 6px;

  background: #0d141d;
}

.number-control__button {
  width: 28px;
  height: 28px;

  padding: 0;

  border: 0;

  color: #aeb7c3;

  background: #141c26;

  font-family: inherit;
  font-size: 13px;

  cursor: pointer;
}

.number-control__button:hover:not(:disabled) {
  color: #fff;

  background:
    rgba(
      124,
      58,
      237,
      0.18
    );
}

.number-control__button:disabled {
  opacity: 0.35;

  cursor: not-allowed;
}

.number-control__input {
  width: 44px;
  height: 28px;

  padding: 0;

  box-sizing: border-box;

  border:
    0;

  border-left:
    1px solid #303946;

  border-right:
    1px solid #303946;

  outline: none;

  color: #eceff4;

  background: #0b1119;

  font-family: inherit;
  font-size: 9px;
  font-weight: 700;

  text-align: center;

  appearance: textfield;
}

.number-control__input::-webkit-inner-spin-button,
.number-control__input::-webkit-outer-spin-button {
  margin: 0;

  appearance: none;
}

/* =========================================================
   INFO
========================================================= */

.chat-content__info {
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

.chat-content__info-icon {
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

.chat-content__info p {
  margin: 0;

  color: #808b99;

  font-size: 8px;
  line-height: 1.5;
}

.chat-content__info strong {
  color: #bda5fb;

  font-weight: 600;
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {
  .chat-content__header {
    padding:
      15px
      14px;
  }

  .setting-row,
  .message-limit {
    padding-left: 13px;
    padding-right: 13px;
  }

  .setting-row__content p {
    max-width: 190px;
  }
}
</style>