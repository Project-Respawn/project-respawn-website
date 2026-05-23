const STORAGE_KEY = 'tts-settings-v1';

export default {
  name: 'TtsSettings',

  data() {
    return {
      broadcasterId: '',
      rewardTitle: 'Text To Speech',
      maxLength: 200,

      voices: [],
      selectedVoiceName: '',
      rate: 1,
      pitch: 1,
      volume: 1,

      socket: null,
      socketState: 'idle',
      reconnectTimer: null,
      reconnectDelayMs: 3000,
      useSocket: true,

      events: [],
      queue: [],
      speaking: false,

      testUsername: 'Test User',
      testMessage: 'This is a test of your text to speech system.',
      sendingTest: false,

      statusMessage: '',
      statusType: 'info',
      statusTimer: null,

      saving: false,
      settingsChanged: false,
    };
  },

  computed: {
    frontendOrigin() {
      return window.location.origin;
    },
    apiBaseUrl() {
      return 'http://127.0.0.1:3000';
    },
    socketUrl() {
      const params = new URLSearchParams();
      if (this.broadcasterId) params.set('broadcasterId', this.broadcasterId);
      const query = params.toString();
      return `ws://127.0.0.1:3000/tts-ws${query ? `?${query}` : ''}`;
    },
    overlayUrl() {
      const params = new URLSearchParams();
      if (this.broadcasterId) params.set('broadcasterId', this.broadcasterId);
      if (this.selectedVoiceName) params.set('voice', this.selectedVoiceName);
      const query = params.toString();
      return `${this.frontendOrigin}/tts-overlay${query ? `?${query}` : ''}`;
    },
    connectionLabel() {
      if (this.socketState === 'open') return 'Overlay socket connected';
      if (this.socketState === 'connecting') return 'Connecting…';
      if (this.socketState === 'error') return 'Connection error';
      if (this.socketState === 'closed') return 'Disconnected';
      return 'Socket idle';
    },
    connectionClass() {
      return {
        online: this.socketState === 'open',
        offline: this.socketState !== 'open',
      };
    },
    selectedVoice() {
      return this.voices.find((v) => v.name === this.selectedVoiceName) || null;
    },
  },

  mounted() {
    this.broadcasterId =
      this.$route?.params?.broadcasterId ||
      this.$route?.query?.broadcasterId ||
      '';

    this.loadSavedSettings();
    this.loadVoices();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = this.loadVoices;
    }

    this.connectSocket();
  },

  beforeUnmount() {
    this.cleanupSocket();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    }
    if (this.statusTimer) clearTimeout(this.statusTimer);
  },

  methods: {
    // ── Persistence ────────────────────────────────────────────────
    loadSavedSettings() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (saved.selectedVoiceName !== undefined) this.selectedVoiceName = saved.selectedVoiceName;
        if (saved.rate !== undefined) this.rate = saved.rate;
        if (saved.pitch !== undefined) this.pitch = saved.pitch;
        if (saved.volume !== undefined) this.volume = saved.volume;
        if (saved.rewardTitle !== undefined) this.rewardTitle = saved.rewardTitle;
        if (saved.maxLength !== undefined) this.maxLength = saved.maxLength;
      } catch (err) {
        console.warn('Could not load saved TTS settings', err);
      }
    },

    saveSettings() {
      try {
        this.saving = true;
        const payload = {
          selectedVoiceName: this.selectedVoiceName,
          rate: this.rate,
          pitch: this.pitch,
          volume: this.volume,
          rewardTitle: this.rewardTitle,
          maxLength: this.maxLength,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        this.settingsChanged = false;
        this.showStatus('Settings saved', 'success');
      } catch (err) {
        console.error('Failed to save settings', err);
        this.showStatus('Failed to save settings', 'error');
      } finally {
        this.saving = false;
      }
    },

    markChanged() {
      this.settingsChanged = true;
    },

    // ── Status helper ──────────────────────────────────────────────
    showStatus(message, type = 'info') {
      if (this.statusTimer) clearTimeout(this.statusTimer);
      this.statusMessage = message;
      this.statusType = type;
      this.statusTimer = setTimeout(() => {
        this.statusMessage = '';
      }, 4000);
    },

    // ── Speech ─────────────────────────────────────────────────────
    loadVoices() {
      if (!('speechSynthesis' in window)) return;
      this.voices = window.speechSynthesis.getVoices() || [];
    },

    speakNext() {
      if (this.speaking || !this.queue.length) return;
      if (!('speechSynthesis' in window)) return;

      const item = this.queue.shift();
      this.speaking = true;

      const utterance = new SpeechSynthesisUtterance(
        `${item.username} says: ${item.text}`,
      );

      if (this.selectedVoice) utterance.voice = this.selectedVoice;
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      utterance.volume = this.volume;

      utterance.onend = () => {
        this.speaking = false;
        this.speakNext();
      };
      utterance.onerror = () => {
        this.speaking = false;
        this.speakNext();
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },

    runLocalPreview() {
      const demo = {
        id: `preview-${Date.now()}`,
        username: this.testUsername || 'Test User',
        text: this.testMessage || 'This is a test of your text to speech system.',
        receivedAt: new Date().toISOString(),
      };
      this.events.unshift(demo);
      this.events = this.events.slice(0, 20);
      this.queue.push(demo);
      this.speakNext();
      this.showStatus('Playing local preview…', 'info');
    },

    // ── WebSocket ──────────────────────────────────────────────────
    connectSocket() {
      if (!this.useSocket) {
        this.showStatus('Socket disabled.');
        return;
      }
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      if (
        this.socket &&
        (this.socket.readyState === WebSocket.OPEN ||
          this.socket.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      const wsUrl = this.socketUrl;
      this.socketState = 'connecting';
      this.showStatus(`Connecting to ${wsUrl}`);

      const socket = new WebSocket(wsUrl);
      this.socket = socket;

      socket.addEventListener('open', () => {
        this.socketState = 'open';
        this.showStatus('Socket connected', 'success');
      });

      socket.addEventListener('message', (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'tts-status') return;
          if (payload.type !== 'tts') return;

          const item = {
            id: `${Date.now()}-${Math.random()}`,
            username: payload.username || 'Anonymous',
            text: payload.text || '',
            receivedAt: new Date().toISOString(),
          };
          this.events.unshift(item);
          this.events = this.events.slice(0, 20);
          this.queue.push(item);
          this.speakNext();
        } catch (error) {
          console.error('Invalid TTS payload', error);
        }
      });

      socket.addEventListener('close', (event) => {
        this.socketState = 'closed';
        this.showStatus('Socket closed');
        if (this.useSocket) {
          this.reconnectTimer = setTimeout(
            () => this.connectSocket(),
            this.reconnectDelayMs,
          );
        }
      });

      socket.addEventListener('error', () => {
        this.socketState = 'error';
        this.showStatus(`Socket connection failed: ${wsUrl}`, 'error');
      });
    },

    reconnectSocket() {
      this.cleanupSocket();
      this.useSocket = true;
      this.connectSocket();
    },

    cleanupSocket() {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      if (this.socket) {
        try {
          this.socket.close();
        } catch (e) {}
        this.socket = null;
      }
    },

    // ── API ────────────────────────────────────────────────────────
    async sendTestTts() {
      try {
        this.sendingTest = true;
        const response = await fetch(`${this.apiBaseUrl}/api/tts/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            broadcasterId: this.broadcasterId,
            username: this.testUsername,
            text: this.testMessage,
            voiceName: this.selectedVoiceName,
            rate: this.rate,
            pitch: this.pitch,
            volume: this.volume,
          }),
        });

        const raw = await response.text();
        let result = {};
        try {
          result = raw ? JSON.parse(raw) : {};
        } catch {
          result = { message: raw || 'Non-JSON response' };
        }

        if (!response.ok) throw new Error(result.message || `Failed (${response.status})`);
        this.showStatus('Test TTS sent successfully', 'success');
      } catch (error) {
        console.error('Failed to send test TTS', error);
        this.showStatus(error.message || 'Failed to send test TTS', 'error');
      } finally {
        this.sendingTest = false;
      }
    },

    // ── UI helpers ─────────────────────────────────────────────────
    async copyOverlayUrl() {
      try {
        await navigator.clipboard.writeText(this.overlayUrl);
        this.showStatus('Overlay URL copied', 'success');
      } catch {
        this.showStatus('Failed to copy overlay URL', 'error');
      }
    },

    clearEvents() {
      this.events = [];
    },

    formatTime(value) {
      return new Date(value).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    },
  },
};