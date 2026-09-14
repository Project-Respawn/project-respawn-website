<template>
  <section class="chat-presets">
    <!-- =========================================================
         HEADER
    ========================================================== -->
    <header class="chat-presets__header">
      <div>
        <p class="chat-presets__eyebrow">
          Style Library
        </p>

        <h2>
          Chat Presets
        </h2>

        <p>
          Apply a complete starting style, then customise it
          further using the other chat settings tabs.
        </p>
      </div>
    </header>

    <!-- =========================================================
         PRESET LIST
    ========================================================== -->
    <section class="chat-presets__section">
      <header class="section-header">
        <div>
          <h3>
            Available Presets
          </h3>

          <p>
            Presets update multiple chat settings at once.
          </p>
        </div>
      </header>

      <div class="preset-list">
        <article
          v-for="preset in chatPresets"
          :key="preset.id"
          class="preset-card"
          :class="{
            'preset-card--active':
              activePreset === preset.id,
          }"
        >
          <!-- Preview -->
          <div
            class="preset-card__preview"
            :class="
              `preset-card__preview--${preset.id}`
            "
          >
            <div class="preset-preview-chat">
              <div class="preset-preview-chat__row">
                <span class="preset-preview-chat__badge">
                  T
                </span>

                <div>
                  <strong>
                    CreatorName
                  </strong>

                  <p>
                    This is how your chat could look.
                  </p>
                </div>
              </div>

              <div class="preset-preview-chat__row">
                <span class="preset-preview-chat__badge">
                  T
                </span>

                <div>
                  <strong>
                    CommunityMember
                  </strong>

                  <p>
                    Nice stream!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Details -->
          <div class="preset-card__body">
            <div class="preset-card__heading">
              <div>
                <div class="preset-card__title-row">
                  <h4>
                    {{ preset.label }}
                  </h4>

                  <span
                    v-if="activePreset === preset.id"
                    class="preset-card__current"
                  >
                    Active
                  </span>
                </div>

                <p>
                  {{ preset.description }}
                </p>
              </div>
            </div>

            <div class="preset-card__summary">
              <span
                v-for="section in getAffectedSections(preset)"
                :key="section"
                class="preset-card__tag"
              >
                {{ formatSectionName(section) }}
              </span>
            </div>

            <button
              type="button"
              class="preset-card__button"
              :class="{
                'preset-card__button--active':
                  activePreset === preset.id,
              }"
              @click="applyPreset(preset)"
            >
              {{
                activePreset === preset.id
                  ? 'Reapply Preset'
                  : 'Apply Preset'
              }}
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- =========================================================
         CUSTOMISATION INFO
    ========================================================== -->
    <section class="chat-presets__section">
      <header class="section-header">
        <div>
          <h3>
            After Applying
          </h3>

          <p>
            Presets are a starting point, not a locked theme.
          </p>
        </div>
      </header>

      <div class="customisation-info">
        <div class="customisation-info__icon">
          ✦
        </div>

        <div>
          <strong>
            Keep customising
          </strong>

          <p>
            After applying a preset you can change Content,
            Appearance, Behaviour, Layout or Typography without
            losing the rest of the preset.
          </p>
        </div>
      </div>
    </section>

    <!-- =========================================================
         RESET
    ========================================================== -->
    <section class="chat-presets__section">
      <header class="section-header">
        <div>
          <h3>
            Reset Chat
          </h3>

          <p>
            Return every chat option to the Project Respawn
            default configuration.
          </p>
        </div>
      </header>

      <div class="reset-panel">
        <div class="reset-panel__content">
          <strong>
            Restore defaults
          </strong>

          <p>
            This will replace your current unsaved chat
            customisation with the default settings.
          </p>
        </div>

        <button
          type="button"
          class="reset-panel__button"
          @click="requestReset"
        >
          Reset
        </button>
      </div>
    </section>

    <!-- =========================================================
         INFO
    ========================================================== -->
    <div class="chat-presets__info">
      <span class="chat-presets__info-icon">
        i
      </span>

      <p>
        Applying a preset updates the Live Preview immediately.
        Changes are not persisted until you use
        <strong>Save Settings</strong>.
      </p>
    </div>
  </section>
</template>

<script setup>
import {
  chatPresets,
} from '../chat.presets.js'

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },

  activePreset: {
    type: String,
    default: null,
  },
})

const emit = defineEmits([
  'apply-preset',
  'reset',
])

/* =========================================================
   APPLY
========================================================= */

function applyPreset(
  preset
) {
  emit(
    'apply-preset',
    preset
  )
}

/* =========================================================
   RESET
========================================================= */

function requestReset() {
  emit('reset')
}

/* =========================================================
   HELPERS
========================================================= */

function getAffectedSections(
  preset
) {
  if (
    !preset?.settings ||
    typeof preset.settings !== 'object'
  ) {
    return []
  }

  return Object.keys(
    preset.settings
  )
}

function formatSectionName(
  section
) {
  const names = {
    sources: 'Sources',
    content: 'Content',
    appearance: 'Appearance',
    behaviour: 'Behaviour',
    layout: 'Layout',
    typography: 'Typography',
  }

  return (
    names[section] ||
    section
  )
}
</script>

<style scoped>
/* =========================================================
   ROOT
========================================================= */

.chat-presets {
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

.chat-presets__header {
  padding:
    17px
    18px
    15px;

  border-bottom:
    1px solid #1e2630;
}

.chat-presets__eyebrow {
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

.chat-presets__header h2 {
  margin: 0;

  color: #eef2f7;

  font-size: 15px;
  font-weight: 700;
}

.chat-presets__header > div > p:last-child {
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

.chat-presets__section {
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

/* =========================================================
   PRESET LIST
========================================================= */

.preset-list {
  display: flex;

  flex-direction: column;

  gap: 8px;

  padding:
    0
    12px
    14px;
}

.preset-card {
  overflow: hidden;

  border:
    1px solid #2a3440;

  border-radius: 8px;

  background: #0d141c;

  transition:
    border-color 0.16s ease,
    transform 0.16s ease,
    background 0.16s ease;
}

.preset-card:hover {
  border-color: #465263;

  background: #101821;
}

.preset-card--active {
  border-color:
    rgba(
      139,
      92,
      246,
      0.65
    );

  box-shadow:
    0
    0
    0
    1px
    rgba(
      139,
      92,
      246,
      0.08
    );
}

/* =========================================================
   PRESET PREVIEW
========================================================= */

.preset-card__preview {
  display: flex;

  min-height: 92px;

  align-items: center;
  justify-content: center;

  padding: 10px;

  box-sizing: border-box;

  border-bottom:
    1px solid #222b36;

  background: #080d13;
}

.preset-preview-chat {
  display: flex;

  width: 100%;

  flex-direction: column;

  gap: 5px;
}

.preset-preview-chat__row {
  display: flex;

  align-items: flex-start;

  gap: 6px;

  padding: 5px 6px;

  border-radius: 5px;
}

.preset-preview-chat__badge {
  display: flex;

  width: 15px;
  height: 15px;

  flex: none;

  align-items: center;
  justify-content: center;

  border-radius: 4px;

  background: #7c3aed;

  color: #fff;

  font-size: 7px;
  font-weight: 800;
}

.preset-preview-chat__row strong {
  display: block;

  color: #bfa8ff;

  font-size: 7px;
  line-height: 1.2;
}

.preset-preview-chat__row p {
  margin:
    2px
    0
    0;

  color: #cbd5e1;

  font-size: 7px;
  line-height: 1.25;
}

/* =========================================================
   MINIMAL
========================================================= */

.preset-card__preview--minimal {
  background:
    linear-gradient(
      135deg,
      #111827,
      #080d13
    );
}

.preset-card__preview--minimal
.preset-preview-chat__row {
  padding:
    3px
    4px;

  background: transparent;
}

/* =========================================================
   DARK GLASS
========================================================= */

.preset-card__preview--dark-glass {
  background:
    radial-gradient(
      circle at top right,
      rgba(71, 85, 105, 0.35),
      transparent 45%
    ),
    #0a1018;
}

.preset-card__preview--dark-glass
.preset-preview-chat {
  padding: 6px;

  box-sizing: border-box;

  border:
    1px solid
    rgba(
      148,
      163,
      184,
      0.2
    );

  border-radius: 7px;

  background:
    rgba(
      15,
      23,
      42,
      0.68
    );

  backdrop-filter:
    blur(8px);
}

/* =========================================================
   STREAMER
========================================================= */

.preset-card__preview--streamer {
  background:
    linear-gradient(
      135deg,
      #10151d,
      #06090e
    );
}

.preset-card__preview--streamer
.preset-preview-chat__row {
  background:
    rgba(
      17,
      24,
      39,
      0.82
    );
}

/* =========================================================
   RESPAWN
========================================================= */

.preset-card__preview--respawn {
  background:
    radial-gradient(
      circle at 20% 0%,
      rgba(124, 58, 237, 0.26),
      transparent 50%
    ),
    #080914;
}

.preset-card__preview--respawn
.preset-preview-chat {
  padding: 6px;

  box-sizing: border-box;

  border:
    1px solid
    rgba(
      124,
      58,
      237,
      0.65
    );

  border-radius: 7px;

  background:
    rgba(
      15,
      16,
      32,
      0.78
    );

  box-shadow:
    0
    0
    12px
    rgba(
      124,
      58,
      237,
      0.1
    );

  backdrop-filter:
    blur(8px);
}

/* =========================================================
   BODY
========================================================= */

.preset-card__body {
  padding: 10px;
}

.preset-card__heading {
  margin-bottom: 8px;
}

.preset-card__title-row {
  display: flex;

  align-items: center;

  gap: 6px;
}

.preset-card__title-row h4 {
  margin: 0;

  color: #dce3eb;

  font-size: 10px;
  font-weight: 700;
}

.preset-card__current {
  padding:
    2px
    5px;

  border:
    1px solid
    rgba(
      139,
      92,
      246,
      0.35
    );

  border-radius: 999px;

  color: #c4b5fd;

  background:
    rgba(
      124,
      58,
      237,
      0.11
    );

  font-size: 6px;
  font-weight: 700;

  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.preset-card__heading p {
  margin:
    4px
    0
    0;

  color: #6e7a88;

  font-size: 8px;
  line-height: 1.4;
}

/* =========================================================
   TAGS
========================================================= */

.preset-card__summary {
  display: flex;

  flex-wrap: wrap;

  gap: 4px;

  margin-bottom: 9px;
}

.preset-card__tag {
  padding:
    3px
    5px;

  border:
    1px solid #2a3440;

  border-radius: 4px;

  color: #778493;

  background: #111821;

  font-size: 6px;
  font-weight: 600;
}

/* =========================================================
   APPLY BUTTON
========================================================= */

.preset-card__button {
  width: 100%;
  min-height: 29px;

  border:
    1px solid #343e4b;

  border-radius: 6px;

  color: #aeb8c4;

  background: #141c26;

  font-family: inherit;
  font-size: 8px;
  font-weight: 700;

  cursor: pointer;

  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    color 0.16s ease;
}

.preset-card__button:hover {
  border-color:
    rgba(
      139,
      92,
      246,
      0.55
    );

  color: #eee7ff;

  background:
    rgba(
      124,
      58,
      237,
      0.15
    );
}

.preset-card__button--active {
  border-color:
    rgba(
      139,
      92,
      246,
      0.55
    );

  color: #d8ccff;

  background:
    rgba(
      124,
      58,
      237,
      0.14
    );
}

/* =========================================================
   CUSTOMISATION
========================================================= */

.customisation-info {
  display: flex;

  align-items: flex-start;

  gap: 9px;

  margin:
    0
    12px
    14px;

  padding: 11px;

  border:
    1px solid #2a3340;

  border-radius: 7px;

  background: #101720;
}

.customisation-info__icon {
  display: flex;

  width: 23px;
  height: 23px;

  flex: none;

  align-items: center;
  justify-content: center;

  border-radius: 6px;

  color: #c4b5fd;

  background:
    rgba(
      124,
      58,
      237,
      0.13
    );

  font-size: 10px;
}

.customisation-info strong {
  display: block;

  color: #c4ccd6;

  font-size: 9px;
}

.customisation-info p {
  margin:
    3px
    0
    0;

  color: #6d7987;

  font-size: 8px;
  line-height: 1.45;
}

/* =========================================================
   RESET
========================================================= */

.reset-panel {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  margin:
    0
    12px
    14px;

  padding: 11px;

  border:
    1px solid
    rgba(
      239,
      68,
      68,
      0.2
    );

  border-radius: 7px;

  background:
    rgba(
      127,
      29,
      29,
      0.07
    );
}

.reset-panel__content {
  min-width: 0;
}

.reset-panel__content strong {
  display: block;

  color: #d1d7de;

  font-size: 9px;
}

.reset-panel__content p {
  margin:
    3px
    0
    0;

  color: #747f8c;

  font-size: 8px;
  line-height: 1.4;
}

.reset-panel__button {
  flex: none;

  min-width: 56px;
  min-height: 28px;

  padding:
    0
    10px;

  border:
    1px solid
    rgba(
      248,
      113,
      113,
      0.35
    );

  border-radius: 5px;

  color: #fca5a5;

  background:
    rgba(
      127,
      29,
      29,
      0.15
    );

  font-family: inherit;
  font-size: 8px;
  font-weight: 700;

  cursor: pointer;
}

.reset-panel__button:hover {
  border-color:
    rgba(
      248,
      113,
      113,
      0.6
    );

  background:
    rgba(
      127,
      29,
      29,
      0.25
    );
}

/* =========================================================
   INFO
========================================================= */

.chat-presets__info {
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

.chat-presets__info-icon {
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

.chat-presets__info p {
  margin: 0;

  color: #808b99;

  font-size: 8px;
  line-height: 1.5;
}

.chat-presets__info strong {
  color: #bda5fb;
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {
  .chat-presets__header {
    padding:
      15px
      14px;
  }

  .preset-list {
    padding-left: 10px;
    padding-right: 10px;
  }

  .reset-panel {
    align-items: flex-start;

    flex-direction: column;
  }

  .reset-panel__button {
    width: 100%;
  }
}
</style>