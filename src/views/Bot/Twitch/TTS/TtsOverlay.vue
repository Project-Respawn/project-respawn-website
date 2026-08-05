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
      shouldReconnect: true,
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
  },

  watch: {
    '$route.query.broadcasterId'(newValue) {
      const nextBroadcasterId = String(newValue || '').trim();

      if (nextBroadcasterId === this.broadcasterId) {
        return;
      }

      this.broadcasterId = nextBroadcasterId;
      console.log('TTS overlay broadcasterId updated from route:', this.broadcasterId || '');
      this.connectSocket();
    }
  },

  beforeUnmount() {
    this.shouldReconnect = false;
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
  this.shouldReconnect = true;
  this.cleanupSocket();

  if (this.reconnectTimer) {
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  if (!this.broadcasterId) {
    console.warn('TTS overlay socket skipped: missing broadcasterId');
    return;
  }

  const params = new URLSearchParams();

  if (this.broadcasterId) {
    params.set('broadcasterId', this.broadcasterId);
  }

  const queryString = params.toString();
  const wsUrl = `ws://localhost:3000/events-ws${queryString ? `?${queryString}` : ''}`;

  console.log('TTS overlay socket connecting:', {
    wsUrl,
    broadcasterId: this.broadcasterId || ''
  });

  this.socket = new WebSocket(wsUrl);

  this.socket.onopen = () => {
    this.socketConnected = true;
    console.log('TTS overlay socket connected:', wsUrl);
  };

  this.socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      console.log('TTS overlay socket message:', payload);

      if (payload.type === 'events-status') {
        console.log('TTS overlay events status:', payload);
        return;
      }

      if (payload.type !== 'overlay-event') return;
      if (String(payload.eventType || '').trim() !== 'tts') return;

      const ttsPayload = payload.payload || {};

      const item = {
        username: String(ttsPayload.username || 'Anonymous').trim() || 'Anonymous',
        text: String(ttsPayload.text || '').trim()
      };

      if (!item.text) return;

      console.log('TTS overlay received TTS event:', {
        broadcasterId: ttsPayload.broadcasterId || payload.broadcasterId || '',
        username: item.username,
        textLength: item.text.length
      });

      this.queue.push(item);
      this.speakNext();
    } catch (error) {
      console.error('Invalid TTS payload:', error);
    }
  };

  this.socket.onclose = (event) => {
    this.socketConnected = false;
    console.log('TTS overlay socket disconnected', {
      code: event.code,
      reason: event.reason || '',
      shouldReconnect: this.shouldReconnect
    });

    if (!this.shouldReconnect) {
      return;
    }

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

<style scoped src="./TtsOverlay.css"></style>