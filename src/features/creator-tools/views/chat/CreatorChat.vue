<template>
  <div class="creator-chat">
    <div class="creator-chat-inner">
      <!-- =========================================================
           PAGE HEADER
      ========================================================== -->
      <header class="creator-chat-header">
        <div class="creator-chat-header__title-row">
          <div>
            <p class="creator-chat-header__eyebrow">
              Creator Tools
            </p>

            <h1>
              Chat Settings
            </h1>

            <p class="creator-chat-header__description">
              Configure your unified chat sources, appearance,
              behaviour and layout from one place.
            </p>
          </div>

          <div class="creator-chat-header__actions">
            <button
              type="button"
              class="chat-action-button chat-action-button--secondary"
              @click="testChat"
            >
              Test Chat
            </button>

            <button
              type="button"
              class="chat-action-button chat-action-button--primary"
              :class="{
                'chat-action-button--dirty':
                  isDirty,
              }"
              @click="saveSettings"
            >
              Save Settings
            </button>
          </div>
        </div>
      </header>

      <!-- =========================================================
           TABS
      ========================================================== -->
      <nav
        class="creator-chat-tabs"
        aria-label="Chat settings sections"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="creator-chat-tab"
          :class="{
            'creator-chat-tab--active':
              activeTab === tab.id,
          }"
          @click="
            activeTab =
              tab.id
          "
        >
          {{ tab.label }}
        </button>
      </nav>

      <!-- =========================================================
           WORKSPACE
      ========================================================== -->
      <main class="creator-chat-workspace">
        <!-- =====================================================
             LEFT COLUMN
             ACTIVE SETTINGS TAB
        ====================================================== -->
        <section class="creator-chat-settings">
          <ChatSources
            v-if="
              activeTab ===
              'sources'
            "
            v-model="
              settings.sources
            "
            @change="markDirty"
          />

          <ChatContent
            v-else-if="
              activeTab ===
              'content'
            "
            v-model="
              settings.content
            "
            @change="markDirty"
            @reset="
              resetSettings
            "
          />

          <ChatAppearance
            v-else-if="
              activeTab ===
              'appearance'
            "
            v-model="
              settings.appearance
            "
            @change="markDirty"
            @reset="
              resetSettings
            "
          />

          <ChatBehaviour
            v-else-if="
              activeTab ===
              'behaviour'
            "
            v-model="
              settings.behaviour
            "
            @change="markDirty"
            @reset="
              resetSettings
            "
          />

          <ChatLayout
            v-else-if="
              activeTab ===
              'layout'
            "
            v-model="
              settings.layout
            "
            @change="markDirty"
            @reset="
              resetSettings
            "
          />

          <ChatTypography
            v-else-if="
              activeTab ===
              'typography'
            "
            v-model="
              settings.typography
            "
            @change="markDirty"
            @reset="
              resetSettings
            "
          />

          <ChatPresets
            v-else-if="
              activeTab ===
              'presets'
            "
            :settings="
              settings
            "
            :active-preset="
              activePreset
            "
            @apply-preset="
              applyPreset
            "
            @reset="
              resetSettings
            "
          />
        </section>

        <!-- =====================================================
             CENTRE COLUMN
             SHARED LIVE PREVIEW
        ====================================================== -->
        <section class="creator-chat-preview">
          <ChatLivePreview
            :settings="
              settings
            "
            :messages="
              previewMessages
            "
            :device="
              previewDevice
            "
            @update:device="
              previewDevice =
                $event
            "
          />
        </section>

        <!-- =====================================================
             RIGHT COLUMN
             QUICK PRESETS
        ====================================================== -->
        <aside class="creator-chat-utility">
          <section class="quick-presets">
            <header class="quick-presets__header">
              <div>
                <p class="quick-presets__eyebrow">
                  Styles
                </p>

                <h2>
                  Quick Presets
                </h2>

                <p>
                  Apply a ready-made chat style.
                </p>
              </div>
            </header>

            <div class="quick-presets__list">
              <button
                v-for="preset in chatPresets"
                :key="preset.id"
                type="button"
                class="preset-card"
                :class="{
                  'preset-card--active':
                    activePreset ===
                    preset.id,
                }"
                @click="
                  applyPreset(
                    preset
                  )
                "
              >
                <div
                  class="preset-card__preview"
                  :class="
                    `preset-card__preview--${preset.id}`
                  "
                >
                  <div class="preset-preview-message">
                    <strong>
                      RespawnUser
                    </strong>

                    <span>
                      GG! 💜
                    </span>
                  </div>

                  <div class="preset-preview-message">
                    <strong>
                      Viewer123
                    </strong>

                    <span>
                      Let's go!
                    </span>
                  </div>
                </div>

                <div class="preset-card__content">
                  <div class="preset-card__title-row">
                    <strong>
                      {{ preset.label }}
                    </strong>

                    <span
                      v-if="
                        activePreset ===
                        preset.id
                      "
                      class="preset-card__check"
                    >
                      ✓
                    </span>
                  </div>

                  <p>
                    {{ preset.description }}
                  </p>
                </div>
              </button>
            </div>

            <button
              type="button"
              class="open-presets-button"
              @click="
                activeTab =
                  'presets'
              "
            >
              <span>
                Open Presets
              </span>

              <span>
                →
              </span>
            </button>
          </section>
        </aside>
      </main>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
} from 'vue'

import ChatLivePreview from './ChatLivePreview.vue'

import ChatSources from './components/ChatSources.vue'
import ChatContent from './components/ChatContent.vue'
import ChatAppearance from './components/ChatAppearance.vue'
import ChatBehaviour from './components/ChatBehaviour.vue'
import ChatLayout from './components/ChatLayout.vue'
import ChatTypography from './components/ChatTypography.vue'
import ChatPresets from './components/ChatPresets.vue'

import {
  createDefaultChatSettings,
} from './chat.defaults.js'

import {
  chatPresets,
} from './chat.presets.js'

/* =========================================================
   TABS
========================================================= */

const tabs = Object.freeze([
  {
    id: 'sources',
    label: 'Sources',
  },

  {
    id: 'content',
    label: 'Content',
  },

  {
    id: 'appearance',
    label: 'Appearance',
  },

  {
    id: 'behaviour',
    label: 'Behaviour',
  },

  {
    id: 'layout',
    label: 'Layout',
  },

  {
    id: 'typography',
    label: 'Typography',
  },

  {
    id: 'presets',
    label: 'Presets',
  },
])

const activeTab =
  ref('sources')

/* =========================================================
   SETTINGS
========================================================= */

const settings =
  ref(
    createDefaultChatSettings()
  )

const activePreset =
  ref(null)

const isDirty =
  ref(false)

/* =========================================================
   PREVIEW
========================================================= */

const previewDevice =
  ref('desktop')

let testMessageId =
  1000

const previewMessages =
  ref([
    {
      id: 1,
      timestamp:
        '12:45:01',
      username:
        'SeaGuardian',
      message:
        'Hello everyone! Welcome to the stream! 💜',
      platform:
        'twitch',
      type:
        'creator',
      badges: [
        '◆',
      ],
      usernameColor:
        '#55e6b2',
    },

    {
      id: 2,
      timestamp:
        '12:45:04',
      username:
        'Viewer123',
      message:
        'GG! That was clean.',
      platform:
        'twitch',
      type:
        'viewer',
      badges: [],
      usernameColor:
        '#60a5fa',
    },

    {
      id: 3,
      timestamp:
        '12:45:07',
      username:
        'RavenFan',
      message:
        'That play was insane! 🔥',
      platform:
        'twitch',
      type:
        'viewer',
      badges: [],
      usernameColor:
        '#f472b6',
    },

    {
      id: 4,
      timestamp:
        '12:45:10',
      username:
        'StreamerBot',
      message:
        'Thank you for following!',
      platform:
        'twitch',
      type:
        'bot',
      badges: [],
      usernameColor:
        '#4ade80',
    },

    {
      id: 5,
      timestamp:
        '12:45:13',
      username:
        'RespawnViewer',
      message:
        '@SeaGuardian this setup looks great!',
      platform:
        'twitch',
      type:
        'viewer',
      badges: [],
      isMention:
        true,
      usernameColor:
        '#c084fc',
    },

    {
      id: 6,
      timestamp:
        '12:45:16',
      username:
        'CommandTester',
      message:
        '!discord',
      platform:
        'twitch',
      type:
        'viewer',
      badges: [],
      usernameColor:
        '#94a3b8',
    },

    {
      id: 7,
      timestamp:
        '12:45:19',
      username:
        'YouTubeViewer',
      message:
        'Watching from YouTube!',
      platform:
        'youtube',
      type:
        'viewer',
      badges: [],
      usernameColor:
        '#f87171',
    },

    {
      id: 8,
      timestamp:
        '12:45:22',
      username:
        'DiscordMember',
      message:
        'Hello from Discord 👋',
      platform:
        'discord',
      type:
        'viewer',
      badges: [],
      usernameColor:
        '#818cf8',
    },
  ])

/* =========================================================
   DIRTY STATE
========================================================= */

function markDirty() {
  isDirty.value =
    true

  activePreset.value =
    null
}

/* =========================================================
   DEEP MERGE
========================================================= */

function deepMerge(
  target,
  source
) {
  if (
    !source ||
    typeof source !==
      'object'
  ) {
    return target
  }

  Object.entries(
    source
  ).forEach(
    ([
      key,
      value,
    ]) => {
      if (
        value &&
        typeof value ===
          'object' &&
        !Array.isArray(
          value
        )
      ) {
        if (
          !target[key] ||
          typeof target[key] !==
            'object' ||
          Array.isArray(
            target[key]
          )
        ) {
          target[key] = {}
        }

        deepMerge(
          target[key],
          value
        )

        return
      }

      target[key] =
        value
    }
  )

  return target
}

/* =========================================================
   PRESETS
========================================================= */

function applyPreset(
  presetOrId
) {
  const presetId =
    typeof presetOrId ===
    'string'
      ? presetOrId
      : presetOrId?.id

  if (
    !presetId
  ) {
    return
  }

  const preset =
    chatPresets.find(
      (item) =>
        item.id ===
        presetId
    )

  if (
    !preset
  ) {
    return
  }

  const nextSettings =
    structuredClone(
      settings.value
    )

  deepMerge(
    nextSettings,
    structuredClone(
      preset.settings
    )
  )

  settings.value =
    nextSettings

  activePreset.value =
    presetId

  isDirty.value =
    true
}

/* =========================================================
   RESET
========================================================= */

function resetSettings() {
  settings.value =
    createDefaultChatSettings()

  activePreset.value =
    null

  isDirty.value =
    true
}

/* =========================================================
   TEST CHAT
========================================================= */

function testChat() {
  testMessageId += 1

  const enabledSources =
    Object.entries(
      settings.value
        .sources ??
      {}
    )
      .filter(
        ([
          ,
          source,
        ]) =>
          source?.enabled ===
          true
      )
      .map(
        ([
          sourceId,
        ]) =>
          sourceId
      )

  const platform =
    enabledSources[0] ??
    'twitch'

  previewMessages.value.push({
    id:
      testMessageId,

    timestamp:
      new Date()
        .toLocaleTimeString(
          'en-GB',
          {
            hour:
              '2-digit',
            minute:
              '2-digit',
            second:
              '2-digit',
          }
        ),

    username:
      'TestViewer',

    message:
      'This is a live preview test message! 👋',

    platform,

    type:
      'viewer',

    badges: [],

    usernameColor:
      '#a78bfa',
  })

  const maximum =
    Math.max(
      1,
      Number(
        settings.value
          .content
          ?.maximumVisibleMessages ??
        10
      )
    )

  const bufferLimit =
    Math.max(
      20,
      maximum + 10
    )

  if (
    previewMessages
      .value
      .length >
    bufferLimit
  ) {
    previewMessages.value =
      previewMessages.value.slice(
        -bufferLimit
      )
  }
}

/* =========================================================
   SAVE
========================================================= */

function saveSettings() {
  console.info(
    '[Creator Chat] Save requested',
    structuredClone(
      settings.value
    )
  )

  isDirty.value =
    false
}
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.creator-chat {
  width: 100%;
  min-width: 0;
}

.creator-chat-inner {
  width:
    min(
      calc(100% - 28px),
      1760px
    );

  margin:
    0 auto;

  padding:
    24px
    0
    48px;

  box-sizing:
    border-box;
}

/* =========================================================
   HEADER
========================================================= */

.creator-chat-header {
  margin-bottom:
    18px;
}

.creator-chat-header__title-row {
  display:
    flex;

  align-items:
    flex-start;

  justify-content:
    space-between;

  gap:
    24px;
}

.creator-chat-header__eyebrow {
  margin:
    0
    0
    5px;

  color:
    #8b5cf6;

  font-size:
    10px;

  font-weight:
    700;

  letter-spacing:
    0.08em;

  text-transform:
    uppercase;
}

.creator-chat-header h1 {
  margin:
    0;

  color:
    #f3f5f8;

  font-size:
    26px;

  font-weight:
    750;

  letter-spacing:
    -0.02em;
}

.creator-chat-header__description {
  max-width:
    660px;

  margin:
    7px
    0
    0;

  color:
    #818c9a;

  font-size:
    12px;

  line-height:
    1.55;
}

/* =========================================================
   HEADER ACTIONS
========================================================= */

.creator-chat-header__actions {
  display:
    flex;

  flex:
    none;

  align-items:
    center;

  gap:
    8px;
}

.chat-action-button {
  display:
    inline-flex;

  min-height:
    36px;

  align-items:
    center;

  justify-content:
    center;

  padding:
    0
    14px;

  border-radius:
    7px;

  font-family:
    inherit;

  font-size:
    10px;

  font-weight:
    700;

  cursor:
    pointer;

  transition:
    border-color
      0.16s ease,
    background
      0.16s ease,
    color
      0.16s ease,
    transform
      0.16s ease;
}

.chat-action-button:hover {
  transform:
    translateY(
      -1px
    );
}

.chat-action-button--secondary {
  border:
    1px solid
    #2d3744;

  color:
    #b8c1cd;

  background:
    #111821;
}

.chat-action-button--secondary:hover {
  border-color:
    #414d5d;

  color:
    #e1e6ec;

  background:
    #151e28;
}

.chat-action-button--primary {
  border:
    1px solid
    rgba(
      139,
      92,
      246,
      0.42
    );

  color:
    #e9ddff;

  background:
    linear-gradient(
      135deg,
      rgba(
        124,
        58,
        237,
        0.82
      ),
      rgba(
        147,
        51,
        234,
        0.82
      )
    );

  box-shadow:
    0 6px 18px
    rgba(
      124,
      58,
      237,
      0.14
    );
}

.chat-action-button--primary:hover {
  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #9333ea
    );
}

.chat-action-button--dirty {
  box-shadow:
    0 0 0 1px
    rgba(
      196,
      181,
      253,
      0.15
    ),
    0 6px 20px
    rgba(
      124,
      58,
      237,
      0.24
    );
}

/* =========================================================
   TABS
========================================================= */

.creator-chat-tabs {
  display:
    flex;

  width:
    100%;

  gap:
    2px;

  overflow-x:
    auto;

  margin-bottom:
    18px;

  padding:
    4px;

  box-sizing:
    border-box;

  border:
    1px solid
    #232c37;

  border-radius:
    9px;

  background:
    rgba(
      10,
      15,
      22,
      0.86
    );

  scrollbar-width:
    none;
}

.creator-chat-tabs::-webkit-scrollbar {
  display:
    none;
}

.creator-chat-tab {
  min-height:
    34px;

  flex:
    1;

  padding:
    0
    12px;

  border:
    0;

  border-radius:
    6px;

  color:
    #778392;

  background:
    transparent;

  font-family:
    inherit;

  font-size:
    10px;

  font-weight:
    600;

  white-space:
    nowrap;

  cursor:
    pointer;

  transition:
    color
      0.16s ease,
    background
      0.16s ease;
}

.creator-chat-tab:hover {
  color:
    #b6c0cc;

  background:
    rgba(
      255,
      255,
      255,
      0.025
    );
}

.creator-chat-tab--active {
  color:
    #efe8ff;

  background:
    linear-gradient(
      180deg,
      rgba(
        124,
        58,
        237,
        0.2
      ),
      rgba(
        124,
        58,
        237,
        0.11
      )
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
      0.18
    );
}

/* =========================================================
   THREE COLUMN WORKSPACE
========================================================= */

.creator-chat-workspace {
  display:
    grid;

  grid-template-columns:
    minmax(
      280px,
      0.78fr
    )
    minmax(
      560px,
      1.65fr
    )
    minmax(
      220px,
      0.57fr
    );

  gap:
    20px;

  width:
    100%;

  min-width:
    0;

  align-items:
    start;
}

.creator-chat-settings,
.creator-chat-preview,
.creator-chat-utility {
  min-width:
    0;
}

.creator-chat-preview,
.creator-chat-utility {
  position:
    sticky;

  top:
    20px;
}

/* =========================================================
   QUICK PRESETS PANEL
========================================================= */

.quick-presets {
  overflow:
    hidden;

  width:
    100%;

  border:
    1px solid
    #222a35;

  border-radius:
    10px;

  background:
    linear-gradient(
      180deg,
      rgba(
        14,
        20,
        28,
        0.98
      ),
      rgba(
        9,
        14,
        21,
        0.98
      )
    );
}

.quick-presets__header {
  padding:
    16px
    16px
    14px;

  border-bottom:
    1px solid
    #1e2630;
}

.quick-presets__eyebrow {
  margin:
    0
    0
    4px;

  color:
    #8b5cf6;

  font-size:
    8px;

  font-weight:
    800;

  letter-spacing:
    0.08em;

  text-transform:
    uppercase;
}

.quick-presets__header h2 {
  margin:
    0;

  color:
    #eef2f7;

  font-size:
    14px;

  font-weight:
    700;
}

.quick-presets__header p {
  margin:
    5px
    0
    0;

  color:
    #778392;

  font-size:
    9px;

  line-height:
    1.45;
}

.quick-presets__list {
  display:
    flex;

  flex-direction:
    column;

  gap:
    10px;

  padding:
    11px;
}

/* =========================================================
   PRESET CARD
========================================================= */

.preset-card {
  width:
    100%;

  overflow:
    hidden;

  padding:
    0;

  border:
    1px solid
    #28313c;

  border-radius:
    8px;

  color:
    inherit;

  background:
    #0c1219;

  font-family:
    inherit;

  text-align:
    left;

  cursor:
    pointer;

  transition:
    border-color
      0.16s ease,
    transform
      0.16s ease,
    background
      0.16s ease;
}

.preset-card:hover {
  transform:
    translateY(
      -1px
    );

  border-color:
    #414d5d;

  background:
    #101720;
}

.preset-card--active {
  border-color:
    rgba(
      139,
      92,
      246,
      0.72
    );

  box-shadow:
    0 0 0 1px
    rgba(
      139,
      92,
      246,
      0.12
    );
}

/* =========================================================
   PRESET PREVIEW
========================================================= */

.preset-card__preview {
  display:
    flex;

  min-height:
    70px;

  flex-direction:
    column;

  justify-content:
    center;

  gap:
    5px;

  padding:
    9px;

  box-sizing:
    border-box;

  border-bottom:
    1px solid
    #242c36;

  background:
    #080d13;
}

.preset-preview-message {
  display:
    flex;

  flex-wrap:
    wrap;

  gap:
    3px;

  padding:
    4px
    5px;

  border-radius:
    4px;

  color:
    #bec7d2;

  font-size:
    8px;

  line-height:
    1.3;
}

.preset-preview-message strong {
  color:
    #ad8cff;

  font-weight:
    700;
}

/* Minimal */
.preset-card__preview--minimal {
  background:
    #080d13;
}

.preset-card__preview--minimal
.preset-preview-message {
  padding-left:
    0;

  padding-right:
    0;

  background:
    transparent;
}

/* Dark Glass */
.preset-card__preview--dark-glass {
  background:
    linear-gradient(
      135deg,
      rgba(
        15,
        23,
        42,
        0.9
      ),
      rgba(
        8,
        13,
        21,
        0.85
      )
    );
}

.preset-card__preview--dark-glass
.preset-preview-message {
  background:
    rgba(
      17,
      24,
      39,
      0.45
    );
}

/* Streamer */
.preset-card__preview--streamer {
  background:
    #080d13;
}

.preset-card__preview--streamer
.preset-preview-message {
  background:
    rgba(
      17,
      24,
      39,
      0.82
    );
}

/* Respawn */
.preset-card__preview--respawn {
  background:
    radial-gradient(
      circle at 82% 16%,
      rgba(
        124,
        58,
        237,
        0.25
      ),
      transparent
        48%
    ),
    linear-gradient(
      135deg,
      #101020,
      #090d15
    );
}

.preset-card__preview--respawn
.preset-preview-message {
  background:
    rgba(
      124,
      58,
      237,
      0.08
    );
}

/* =========================================================
   PRESET CONTENT
========================================================= */

.preset-card__content {
  padding:
    9px
    10px
    10px;
}

.preset-card__title-row {
  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    8px;
}

.preset-card__title-row strong {
  color:
    #e5eaf0;

  font-size:
    10px;

  font-weight:
    700;
}

.preset-card__check {
  color:
    #a78bfa;

  font-size:
    10px;

  font-weight:
    800;
}

.preset-card__content p {
  margin:
    4px
    0
    0;

  color:
    #737f8e;

  font-size:
    8px;

  line-height:
    1.45;
}

/* =========================================================
   OPEN PRESETS
========================================================= */

.open-presets-button {
  display:
    flex;

  width:
    calc(
      100% - 22px
    );

  min-height:
    34px;

  margin:
    0
    11px
    11px;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    8px;

  padding:
    0
    10px;

  box-sizing:
    border-box;

  border:
    1px solid
    #2b3440;

  border-radius:
    6px;

  color:
    #b89aff;

  background:
    #111821;

  font-family:
    inherit;

  font-size:
    9px;

  font-weight:
    700;

  cursor:
    pointer;

  transition:
    border-color
      0.16s ease,
    background
      0.16s ease;
}

.open-presets-button:hover {
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
      0.08
    );
}

/* =========================================================
   LARGE DESKTOP
========================================================= */

@media (
  min-width:
    1800px
) {
  .creator-chat-inner {
    max-width:
      1800px;
  }

  .creator-chat-workspace {
    grid-template-columns:
      minmax(
        300px,
        0.75fr
      )
      minmax(
        680px,
        1.7fr
      )
      minmax(
        230px,
        0.55fr
      );

    gap:
      22px;
  }
}

/* =========================================================
   MEDIUM DESKTOP
========================================================= */

@media (
  max-width:
    1320px
) {
  .creator-chat-workspace {
    grid-template-columns:
      minmax(
        280px,
        0.8fr
      )
      minmax(
        500px,
        1.35fr
      );
  }

  .creator-chat-utility {
    grid-column:
      1 / -1;

    position:
      static;
  }

  .quick-presets__list {
    display:
      grid;

    grid-template-columns:
      repeat(
        4,
        minmax(
          0,
          1fr
        )
      );
  }

  .open-presets-button {
    width:
      calc(
        100% - 22px
      );
  }
}

/* =========================================================
   TABLET
========================================================= */

@media (
  max-width:
    980px
) {
  .creator-chat-inner {
    width:
      min(
        calc(
          100% - 24px
        ),
        820px
      );
  }

  .creator-chat-header__title-row {
    flex-direction:
      column;
  }

  .creator-chat-header__actions {
    width:
      100%;
  }

  .chat-action-button {
    flex:
      1;
  }

  .creator-chat-workspace {
    grid-template-columns:
      1fr;
  }

  .creator-chat-preview,
  .creator-chat-utility {
    position:
      static;
  }

  .creator-chat-utility {
    grid-column:
      auto;
  }

  .quick-presets__list {
    grid-template-columns:
      repeat(
        2,
        minmax(
          0,
          1fr
        )
      );
  }

  .creator-chat-tab {
    flex:
      none;

    min-width:
      105px;
  }
}

/* =========================================================
   MOBILE
========================================================= */

@media (
  max-width:
    600px
) {
  .creator-chat-inner {
    width:
      min(
        calc(
          100% - 16px
        ),
        100%
      );

    padding-top:
      16px;
  }

  .creator-chat-header h1 {
    font-size:
      22px;
  }

  .creator-chat-header__actions {
    flex-direction:
      column;
  }

  .chat-action-button {
    width:
      100%;
  }

  .creator-chat-workspace {
    gap:
      14px;
  }

  .quick-presets__list {
    grid-template-columns:
      1fr;
  }
}
</style>