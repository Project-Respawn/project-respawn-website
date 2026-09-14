export const chatPresets = Object.freeze([
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean chat with almost no background.',
    settings: {
      appearance: {
        container: {
          backgroundType: 'none',
          opacity: 0,
          blur: 0,
          borderEnabled: false,
        },
        message: {
          backgroundType: 'none',
          opacity: 0,
        },
      },
    },
  },

  {
    id: 'dark-glass',
    label: 'Dark Glass',
    description: 'Dark translucent chat with subtle blur.',
    settings: {
      appearance: {
        container: {
          backgroundType: 'glass',
          backgroundColor: '#0f172a',
          opacity: 0.72,
          blur: 12,
          borderEnabled: true,
          borderColor: '#334155',
          borderRadius: 12,
        },
      },
    },
  },

  {
    id: 'streamer',
    label: 'Streamer',
    description: 'Compact messages designed for gameplay overlays.',
    settings: {
      content: {
        showTimestamps: false,
      },
      appearance: {
        container: {
          backgroundType: 'none',
          opacity: 0,
          borderEnabled: false,
        },
        message: {
          backgroundType: 'solid',
          backgroundColor: '#111827',
          opacity: 0.78,
          borderRadius: 8,
        },
      },
    },
  },

  {
    id: 'respawn',
    label: 'Respawn',
    description: 'Project Respawn purple glass styling.',
    settings: {
      appearance: {
        container: {
          backgroundType: 'glass',
          backgroundColor: '#0f1020',
          opacity: 0.78,
          blur: 12,
          borderEnabled: true,
          borderColor: '#7c3aed',
          borderRadius: 12,
        },
      },
      typography: {
        usernameColor: '#a78bfa',
        linkColor: '#60a5fa',
      },
    },
  },
])