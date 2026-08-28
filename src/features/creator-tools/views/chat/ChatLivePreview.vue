<template>
  <section class="chat-live-preview">
    <header class="chat-live-preview__header">
      <div>
        <h2>
          Live Preview
        </h2>

        <p>
          See how your chat will appear across your stream
          and overlays.
        </p>
      </div>

      <span class="live-status">
        <span class="live-status__dot"></span>

        LIVE
      </span>
    </header>

    <div class="preview-toolbar">
      <span class="preview-toolbar__label">
        Chat Preview
      </span>

      <div class="preview-toolbar__devices">
        <button
          v-for="deviceOption in previewDevices"
          :key="deviceOption.id"
          type="button"
          class="device-button"
          :class="{
            'device-button--active':
              device === deviceOption.id,
          }"
          @click="
            emit(
              'update:device',
              deviceOption.id
            )
          "
        >
          <span class="device-button__icon">
            {{ deviceOption.icon }}
          </span>

          <span>
            {{ deviceOption.label }}
          </span>
        </button>
      </div>
    </div>

    <div
      class="preview-stage"
      :style="previewStageStyle"
    >
      <div
        class="preview-window"
        :class="[
          `preview-window--${device}`,
          `preview-window--${messageDirection}`,
        ]"
        :style="previewWindowStyle"
      >
        <div class="preview-window__topbar">
          <div class="preview-window__title">
            <span
              class="preview-window__status-dot"
            ></span>

            Unified Chat
          </div>

          <span class="preview-window__message-count">
            {{ visibleMessages.length }}
            {{
              visibleMessages.length === 1
                ? 'message'
                : 'messages'
            }}
          </span>
        </div>

        <div
          class="preview-messages"
          :style="previewMessagesStyle"
        >
          <article
            v-for="message in visibleMessages"
            :key="message.id"
            class="preview-message"
            :class="[
              `preview-message--${message.type || 'viewer'}`,
              {
                'preview-message--mention':
                  message.isMention &&
                  contentSettings.highlightMentions,
              },
            ]"
            :style="messageStyle"
          >
            <span
              v-if="
                contentSettings.showTimestamps !== false
              "
              class="preview-message__timestamp"
              :style="timestampStyle"
            >
              {{ message.timestamp }}
            </span>

            <span
              v-if="
                contentSettings.showPlatformIndicator !== false
              "
              class="preview-message__platform"
              :class="
                `preview-message__platform--${message.platform}`
              "
            >
              {{ getPlatformIcon(message.platform) }}
            </span>

            <span
              v-if="
                contentSettings.showBadges !== false &&
                message.badges?.length
              "
              class="preview-message__badges"
            >
              <span
                v-for="(
                  badge,
                  badgeIndex
                ) in message.badges"
                :key="
                  `${message.id}-${badgeIndex}`
                "
                class="preview-message__badge"
              >
                {{ badge }}
              </span>
            </span>

            <strong
              v-if="
                contentSettings.showUsername !== false
              "
              class="preview-message__username"
              :style="usernameStyle(message)"
            >
              {{ message.username }}
            </strong>

            <span
              class="preview-message__text"
              :style="messageTextStyle"
            >
              {{ message.message }}
            </span>
          </article>

          <div
            v-if="visibleMessages.length === 0"
            class="preview-empty"
          >
            <span class="preview-empty__icon">
              ◌
            </span>

            <strong>
              No messages to preview
            </strong>

            <p>
              Enable a source or adjust your content filters
              to show preview messages.
            </p>
          </div>
        </div>

        <div class="preview-window__footer">
          <span>
            Preview only
          </span>

          <span>
            Changes update instantly
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  computed,
} from 'vue'

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },

  messages: {
    type: Array,
    default: () => [],
  },

  device: {
    type: String,
    default: 'desktop',
  },
})

const emit = defineEmits([
  'update:device',
])

const previewDevices = Object.freeze([
  {
    id: 'desktop',
    label: 'Desktop',
    icon: '▣',
  },
  {
    id: 'tablet',
    label: 'Tablet',
    icon: '▯',
  },
  {
    id: 'mobile',
    label: 'Mobile',
    icon: '▯',
  },
])

const sourceSettings = computed(() => {
  return props.settings?.sources ?? {}
})

const contentSettings = computed(() => {
  return props.settings?.content ?? {}
})

const behaviourSettings = computed(() => {
  return props.settings?.behaviour ?? {}
})

const appearanceSettings = computed(() => {
  return props.settings?.appearance ?? {}
})

const layoutSettings = computed(() => {
  return props.settings?.layout ?? {}
})

const typographySettings = computed(() => {
  return props.settings?.typography ?? {}
})

const enabledSources = computed(() => {
  return new Set(
    Object.entries(
      sourceSettings.value
    )
      .filter(
        ([, source]) =>
          source?.enabled === true
      )
      .map(
        ([sourceId]) =>
          sourceId
      )
  )
})

const visibleMessages = computed(() => {
  let messages = [
    ...props.messages,
  ]

  if (
    enabledSources.value.size > 0
  ) {
    messages =
      messages.filter(
        (message) =>
          enabledSources.value.has(
            message.platform
          )
      )
  }

  if (
    contentSettings.value
      .hideBotMessages
  ) {
    messages =
      messages.filter(
        (message) =>
          message.type !== 'bot'
      )
  }

  if (
    contentSettings.value
      .hideCommandMessages
  ) {
    messages =
      messages.filter(
        (message) =>
          !message.message
            ?.trim()
            .startsWith('!')
      )
  }

  const maximumVisibleMessages =
    clampNumber(
      contentSettings.value
        .maximumVisibleMessages,
      1,
      100,
      10
    )

  return messages.slice(
    -maximumVisibleMessages
  )
})

const messageDirection = computed(() => {
  return (
    behaviourSettings.value
      .messageDirection ||
    'top-to-bottom'
  )
})

const previewStageStyle = computed(() => {
  return {
    justifyContent:
      getPreviewAlignment(
        layoutSettings.value
          .alignment
      ),
  }
})

const previewWindowStyle = computed(() => {
  const container =
    appearanceSettings.value
      .container ?? {}

  const backgroundType =
    container.backgroundType ??
    'glass'

  const opacity =
    clampNumber(
      container.opacity,
      0,
      1,
      0.7
    )

  const backgroundColor =
    container.backgroundColor ||
    '#0f172a'

  const style = {
    background:
      backgroundType === 'none'
        ? 'transparent'
        : hexToRgba(
            backgroundColor,
            opacity
          ),

    borderRadius:
      `${
        container.borderRadius ??
        12
      }px`,

    padding:
      `${
        container.padding ??
        16
      }px`,
  }

  if (
    container.borderEnabled !==
    false
  ) {
    style.border =
      `1px solid ${
        container.borderColor ||
        '#6d28d9'
      }`
  } else {
    style.border =
      '1px solid transparent'
  }

  if (
    backgroundType === 'glass'
  ) {
    const blur =
      clampNumber(
        container.blur,
        0,
        50,
        10
      )

    style.backdropFilter =
      `blur(${blur}px)`

    style.WebkitBackdropFilter =
      `blur(${blur}px)`
  }

  const width =
    layoutSettings.value.width

  if (width === 'compact') {
    style.maxWidth = '520px'
  } else if (
    width === 'medium'
  ) {
    style.maxWidth = '680px'
  } else {
    style.maxWidth = '900px'
  }

  return style
})

const previewMessagesStyle = computed(() => {
  const spacing =
    clampNumber(
      behaviourSettings.value
        .messageSpacing,
      0,
      40,
      8
    )

  return {
    gap:
      `${spacing}px`,

    justifyContent:
      messageDirection.value ===
      'bottom-to-top'
        ? 'flex-end'
        : 'flex-start',

    flexDirection:
      messageDirection.value ===
      'bottom-to-top'
        ? 'column-reverse'
        : 'column',
  }
})

const messageStyle = computed(() => {
  const message =
    appearanceSettings.value
      .message ?? {}

  const backgroundType =
    message.backgroundType ??
    'none'

  const opacity =
    clampNumber(
      message.opacity,
      0,
      1,
      0.6
    )

  const backgroundColor =
    message.backgroundColor ||
    '#111827'

  return {
    background:
      backgroundType === 'none'
        ? 'transparent'
        : hexToRgba(
            backgroundColor,
            opacity
          ),

    borderRadius:
      `${
        message.borderRadius ??
        8
      }px`,

    padding:
      `${
        message.verticalPadding ??
        6
      }px ${
        message.horizontalPadding ??
        10
      }px`,
  }
})

const messageTextStyle = computed(() => {
  const typography =
    typographySettings.value

  return {
    color:
      typography.messageColor ||
      '#e2e8f0',

    fontFamily:
      typography.messageFont ||
      'Inter',

    fontWeight:
      typography.messageWeight ??
      400,

    fontSize:
      `${
        typography.messageSize ??
        14
      }px`,

    textShadow:
      typography.textShadow
        ? '0 1px 4px rgba(0, 0, 0, 0.75)'
        : 'none',
  }
})

const timestampStyle = computed(() => {
  return {
    color:
      typographySettings.value
        .timestampColor ||
      '#94a3b8',
  }
})

function usernameStyle(
  message
) {
  const typography =
    typographySettings.value

  return {
    color:
      message.usernameColor ||
      typography.usernameColor ||
      '#a78bfa',

    fontFamily:
      typography.usernameFont ||
      'Inter',

    fontWeight:
      typography.usernameWeight ??
      600,

    fontSize:
      `${
        typography.usernameSize ??
        14
      }px`,

    textShadow:
      typography.textShadow
        ? '0 1px 4px rgba(0, 0, 0, 0.75)'
        : 'none',
  }
}

function getPlatformIcon(
  platform
) {
  const icons = {
    twitch: 'T',
    youtube: '▶',
    tiktok: '♪',
    discord: 'D',
    kick: 'K',
  }

  return (
    icons[platform] ??
    '•'
  )
}

function getPreviewAlignment(
  alignment
) {
  if (
    alignment === 'center'
  ) {
    return 'center'
  }

  if (
    alignment === 'right'
  ) {
    return 'flex-end'
  }

  return 'flex-start'
}

function clampNumber(
  value,
  minimum,
  maximum,
  fallback
) {
  const number =
    Number(value)

  if (
    Number.isNaN(number)
  ) {
    return fallback
  }

  return Math.min(
    maximum,
    Math.max(
      minimum,
      number
    )
  )
}

function hexToRgba(
  hex,
  alpha
) {
  if (
    typeof hex !== 'string'
  ) {
    return (
      `rgba(15, 23, 42, ${alpha})`
    )
  }

  const cleaned =
    hex.replace('#', '')

  if (
    cleaned.length !== 3 &&
    cleaned.length !== 6
  ) {
    return hex
  }

  const normalized =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map(
            (character) =>
              `${character}${character}`
          )
          .join('')
      : cleaned

  const number =
    Number.parseInt(
      normalized,
      16
    )

  if (
    Number.isNaN(number)
  ) {
    return hex
  }

  const red =
    (number >> 16) & 255

  const green =
    (number >> 8) & 255

  const blue =
    number & 255

  return (
    `rgba(${red}, ${green}, ${blue}, ${alpha})`
  )
}
</script>

<style scoped>
.chat-live-preview {
  display: flex;

  width: 100%;
  min-width: 0;
  min-height: 650px;

  flex-direction: column;

  overflow: hidden;

  border: 1px solid #222a35;
  border-radius: 10px;

  background:
    linear-gradient(
      180deg,
      rgba(14, 20, 28, 0.98),
      rgba(9, 14, 21, 0.98)
    );
}

.chat-live-preview__header {
  display: flex;

  min-height: 70px;

  align-items: center;
  justify-content: space-between;

  gap: 18px;

  padding: 16px 18px;

  box-sizing: border-box;

  border-bottom:
    1px solid #1e2630;
}

.chat-live-preview__header h2 {
  margin: 0;

  color: #eef2f7;

  font-size: 15px;
  font-weight: 700;
}

.chat-live-preview__header p {
  margin: 5px 0 0;

  color: #7f8a99;

  font-size: 11px;
  line-height: 1.45;
}

.live-status {
  display: inline-flex;

  flex: none;

  align-items: center;

  gap: 6px;

  padding: 5px 8px;

  border:
    1px solid
    rgba(34, 197, 94, 0.25);

  border-radius: 999px;

  color: #6fec95;

  background:
    rgba(34, 197, 94, 0.08);

  font-size: 9px;
  font-weight: 800;
}

.live-status__dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: #22c55e;

  box-shadow:
    0 0 8px
    rgba(34, 197, 94, 0.7);
}

.preview-toolbar {
  display: flex;

  min-height: 48px;

  align-items: center;
  justify-content: space-between;

  gap: 14px;

  padding: 8px 14px;

  box-sizing: border-box;

  border-bottom:
    1px solid #1d2530;

  background:
    rgba(10, 15, 23, 0.9);
}

.preview-toolbar__label {
  color: #909aa7;

  font-size: 10px;
  font-weight: 600;
}

.preview-toolbar__devices {
  display: flex;

  gap: 4px;

  padding: 3px;

  border: 1px solid #252e3a;
  border-radius: 7px;

  background: #0c121a;
}

.device-button {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  gap: 5px;

  padding: 5px 8px;

  border: 0;
  border-radius: 5px;

  color: #737e8d;

  background: transparent;

  font-family: inherit;
  font-size: 9px;

  cursor: pointer;
}

.device-button:hover {
  color: #c6ced8;

  background: #161e29;
}

.device-button--active {
  color: #e9ddff;

  background:
    rgba(124, 58, 237, 0.2);
}

.preview-stage {
  display: flex;

  flex: 1;

  min-height: 500px;

  align-items: center;

  padding: 28px;

  box-sizing: border-box;

  background:
    radial-gradient(
      circle at 50% 15%,
      rgba(124, 58, 237, 0.13),
      transparent 40%
    ),
    #070c13;
}

.preview-window {
  display: flex;

  width: 100%;
  min-height: 480px;

  flex-direction: column;

  overflow: hidden;

  box-sizing: border-box;

  box-shadow:
    0 24px 80px
    rgba(0, 0, 0, 0.3);
}

.preview-window--tablet {
  width: min(78%, 640px);
}

.preview-window--mobile {
  width: min(48%, 390px);
}

.preview-window__topbar {
  display: flex;

  min-height: 40px;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  margin: -8px -8px 12px;

  padding: 0 10px;

  border-bottom:
    1px solid
    rgba(41, 51, 64, 0.65);

  color: #cbd3dd;

  background:
    rgba(8, 13, 20, 0.6);
}

.preview-window__title {
  display: flex;

  align-items: center;

  gap: 7px;

  font-size: 10px;
  font-weight: 700;
}

.preview-window__status-dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: #8b5cf6;
}

.preview-window__message-count {
  color: #687485;

  font-size: 9px;
}

.preview-messages {
  display: flex;

  flex: 1;

  overflow: hidden;
}

.preview-message {
  display: flex;

  width: 100%;

  flex-wrap: wrap;

  align-items: center;

  gap: 6px;

  box-sizing: border-box;
}

.preview-message--mention {
  outline:
    1px solid
    rgba(139, 92, 246, 0.5);
}

.preview-message__timestamp {
  flex: none;

  font-size: 10px;
}

.preview-message__platform {
  display: inline-flex;

  width: 18px;
  height: 18px;

  flex: none;

  align-items: center;
  justify-content: center;

  border-radius: 4px;

  color: #fff;

  font-size: 8px;
  font-weight: 800;
}

.preview-message__platform--twitch {
  background: #9146ff;
}

.preview-message__platform--youtube {
  background: #ff0033;
}

.preview-message__platform--tiktok {
  background: #202630;
}

.preview-message__platform--discord {
  background: #5865f2;
}

.preview-message__platform--kick {
  color: #111;

  background: #53fc18;
}

.preview-message__badges {
  display: inline-flex;

  gap: 2px;
}

.preview-message__badge {
  color: #c4b5fd;

  font-size: 9px;
}

.preview-message__text {
  overflow-wrap: anywhere;
}

.preview-window__footer {
  display: flex;

  justify-content: space-between;

  gap: 12px;

  margin-top: 12px;

  padding-top: 9px;

  border-top:
    1px solid
    rgba(51, 65, 85, 0.5);

  color: #64748b;

  font-size: 9px;
}

.preview-empty {
  display: flex;

  width: 100%;
  min-height: 300px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  color: #64748b;

  text-align: center;
}

.preview-empty__icon {
  margin-bottom: 8px;

  color: #8b5cf6;

  font-size: 24px;
}

.preview-empty strong {
  color: #cbd5e1;

  font-size: 11px;
}

.preview-empty p {
  max-width: 260px;

  margin: 6px 0 0;

  font-size: 9px;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .chat-live-preview {
    min-height: 560px;
  }

  .preview-stage {
    min-height: 430px;

    padding: 18px;
  }

  .preview-window {
    min-height: 420px;
  }
}

@media (max-width: 600px) {
  .preview-toolbar {
    align-items: flex-start;

    flex-direction: column;
  }

  .preview-toolbar__devices {
    width: 100%;
  }

  .device-button {
    flex: 1;
  }

  .preview-stage {
    padding: 10px;
  }

  .preview-window,
  .preview-window--tablet,
  .preview-window--mobile {
    width: 100%;
  }
}
</style>