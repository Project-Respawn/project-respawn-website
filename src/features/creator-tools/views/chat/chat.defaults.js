export const defaultChatSettings = Object.freeze({
  sources: {
    twitch: {
      enabled: true,
    },

    youtube: {
      enabled: false,
    },

    tiktok: {
      enabled: false,
    },

    discord: {
      enabled: false,
    },

    kick: {
      enabled: false,
    },
  },

  content: {
    showUsername: true,
    showBadges: true,
    showTimestamps: true,
    showPlatformIndicator: true,
    showEmotes: true,
    maximumVisibleMessages: 10,
    messageDisplayDuration: 10,
    hideCommandMessages: false,
    hideBotMessages: false,
    highlightMentions: true,
  },

  appearance: {
    container: {
      backgroundType: 'glass',
      backgroundColor: '#0f172a',
      opacity: 0.7,
      blur: 10,
      borderEnabled: true,
      borderColor: '#6d28d9',
      borderRadius: 12,
      padding: 16,
    },

    message: {
      backgroundType: 'none',
      backgroundColor: '#111827',
      opacity: 0.6,
      borderRadius: 8,
      verticalPadding: 6,
      horizontalPadding: 10,
    },
  },

  behaviour: {
    messageDirection: 'top-to-bottom',
    messageSpacing: 8,
    messageAnimation: 'fade',
    animationSpeed: 'normal',
    fadeDuration: 1.5,
    messageLifetime: 15,
    autoScroll: true,
    pauseOnHover: true,
    smoothScrolling: true,
  },

  layout: {
    alignment: 'left',
    width: 'full',
    avatarBadgePosition: 'left',
    timestampPosition: 'left',
    showMessageSeparators: false,
    separatorStyle: 'solid',
    separatorColor: '#334155',
  },

  typography: {
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
  },
})

export function createDefaultChatSettings() {
  return structuredClone(defaultChatSettings)
}