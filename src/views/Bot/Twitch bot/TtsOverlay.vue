<template>
  <div class="tts-overlay">
    <div v-if="showDebug" class="debug-pill" :class="{ online: socketConnected, offline: !socketConnected }">
      {{ socketConnected ? 'TTS connected' : 'TTS disconnected' }}
      <span v-if="broadcasterId">• {{ broadcasterId }}</span>
    </div>

    <transition name="fade">
      <div v-if="activeMessage" class="toast">
        <strong class="toast-username">{{ activeMessage.username }}</strong>
        <span class="toast-text">{{ activeMessage.text }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'TtsOverlay',
  data() {
    return {
      broadcasterId: '',
      socket: null,
      socketConnected: false,
      reconnectTimer: null,
      queue: [],
      speaking: false,
      activeMessage: null,
      activeClearTimer: null,
      voices: [],
      selectedVoiceName: '',
      showDebug: true
    };
  },

  mounted() {
    this.broadcasterId = this.$route?.query?.broadcasterId || '';
    this.selectedVoiceName = this.$route?.query?.voice || '';
    this.showDebug = this.$route?.query?.debug !== 'false';

    this.forceTransparentPage(true);
    this.loadVoices();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = this.loadVoices;
    }

    this.connectSocket();

    // Temporary visual confirmation on load
    setTimeout(() => {
      if (!this.activeMessage && this.showDebug) {
        this.activeMessage = {
          username: 'Overlay Ready',
          text: 'Waiting for TTS messages'
        };

        this.activeClearTimer = setTimeout(() => {
          this.activeMessage = null;
        }, 2000);
      }
    }, 600);
  },

  beforeUnmount() {
    this.cleanupSocket();
    this.cleanupTimers();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    }

    this.forceTransparentPage(false);
  },

  methods: {
    forceTransparentPage(enable) {
      const html = document.documentElement;
      const body = document.body;
      const app = document.getElementById('app');

      if (enable) {
        html.style.background = 'transparent';
        body.style.background = 'transparent';
        if (app) app.style.background = 'transparent';

        html.style.margin = '0';
        body.style.margin = '0';
        body.style.overflow = 'hidden';
      } else {
        html.style.background = '';
        body.style.background = '';
        if (app) app.style.background = '';

        html.style.margin = '';
        body.style.margin = '';
        body.style.overflow = '';
      }
    },

    cleanupTimers() {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      if (this.activeClearTimer) {
        clearTimeout(this.activeClearTimer);
        this.activeClearTimer = null;
      }
    },

    cleanupSocket() {
      if (this.socket) {
        this.socket.onopen = null;
        this.socket.onmessage = null;
        this.socket.onclose = null;
        this.socket.onerror = null;
        this.socket.close();
        this.socket = null;
      }
      this.socketConnected = false;
    },

    loadVoices() {
      if (!('speechSynthesis' in window)) return;
      this.voices = window.speechSynthesis.getVoices() || [];
    },

connectSocket() {
  this.cleanupSocket();

  const params = new URLSearchParams();

  if (this.broadcasterId) {
    params.set('broadcasterId', this.broadcasterId);
  }

  const queryString = params.toString();
  const wsUrl = `ws://localhost:3000/tts-ws${queryString ? `?${queryString}` : ''}`;

  this.socket = new WebSocket(wsUrl);

  this.socket.onopen = () => {
    this.socketConnected = true;
    console.log('TTS overlay socket connected:', wsUrl);
  };

  this.socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);

      if (payload.type === 'tts-status') {
        console.log('TTS status:', payload);
        return;
      }

      if (payload.type !== 'tts') return;

      const item = {
        username: String(payload.username || 'Anonymous').trim() || 'Anonymous',
        text: String(payload.text || '').trim()
      };

      if (!item.text) return;

      this.queue.push(item);
      this.speakNext();
    } catch (error) {
      console.error('Invalid TTS payload:', error);
    }
  };

  this.socket.onclose = () => {
    this.socketConnected = false;
    console.log('TTS overlay socket disconnected');

    this.reconnectTimer = setTimeout(() => {
      this.connectSocket();
    }, 3000);
  };

  this.socket.onerror = (error) => {
    this.socketConnected = false;
    console.error('TTS overlay socket error:', error);
  };
},

    getSelectedVoice() {
      if (!this.selectedVoiceName) return null;
      return this.voices.find((voice) => voice.name === this.selectedVoiceName) || null;
    },

    speakNext() {
      if (this.speaking || !this.queue.length) return;
      if (!('speechSynthesis' in window)) return;

      const item = this.queue.shift();
      this.speaking = true;
      this.activeMessage = item;

      if (this.activeClearTimer) {
        clearTimeout(this.activeClearTimer);
        this.activeClearTimer = null;
      }

      const utterance = new SpeechSynthesisUtterance(`${item.username} says: ${item.text}`);
      const selectedVoice = this.getSelectedVoice();

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        this.speaking = false;
        this.activeClearTimer = setTimeout(() => {
          this.activeMessage = null;
          this.speakNext();
        }, 800);
      };

      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        this.speaking = false;
        this.activeMessage = null;
        this.speakNext();
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }
};
</script>

<style scoped>
:global(html),
:global(body),
:global(#app) {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background: transparent !important;
}

.tts-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  background: transparent !important;
  overflow: hidden;
}

.debug-pill {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 20;
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: white;
  background: rgba(10, 14, 24, 0.72);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.debug-pill.online {
  box-shadow: 0 0 0 1px rgba(70, 201, 126, 0.24);
}

.debug-pill.offline {
  box-shadow: 0 0 0 1px rgba(255, 107, 107, 0.24);
}

.toast {
  position: absolute;
  left: 24px;
  bottom: 24px;
  z-index: 15;
  max-width: min(680px, calc(100vw - 48px));
  padding: 18px 20px;
  border-radius: 16px;
  background: rgba(12, 16, 24, 0.84);
  color: #ffffff;
  display: grid;
  gap: 8px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

.toast-username {
  font-size: 18px;
  line-height: 1.2;
}

.toast-text {
  font-size: 16px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.92);
  word-break: break-word;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>