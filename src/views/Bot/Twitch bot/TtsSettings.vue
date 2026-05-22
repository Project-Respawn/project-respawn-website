<template>
  <section class="tts-settings-page">
    <!-- ========================= Header ========================== -->
    <header class="page-header">
      <div class="header-info">
        <p class="eyebrow">Stream Tools</p>
        <h1>Text to Speech</h1>
        <p class="intro">
          Configure your TTS overlay, preview voices, and send a real test
          message to OBS before going live.
        </p>
      </div>
      <div class="header-actions">
        <button class="btn btn-ghost" @click="copyOverlayUrl">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy overlay URL
        </button>
        <button class="btn btn-ghost" @click="runLocalPreview">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Preview voice
        </button>
        <button class="btn btn-ghost" @click="reconnectSocket">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
          Reconnect
        </button>
        <button class="btn btn-secondary" @click="saveSettings" :disabled="saving">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          {{ saving ? 'Saving…' : 'Save settings' }}
        </button>
        <button class="btn btn-primary" @click="sendTestTts" :disabled="sendingTest">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          {{ sendingTest ? 'Sending…' : 'Send test to overlay' }}
        </button>
      </div>
    </header>

    <!-- ========================= Status banner ========================== -->
    <transition name="status-fade">
      <div v-if="statusMessage" class="status-banner" :class="statusType">
        <svg
          v-if="statusType === 'success'"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <svg
          v-else-if="statusType === 'error'"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <svg
          v-else
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {{ statusMessage }}
      </div>
    </transition>

    <!-- ========================= Main grid ========================== -->
    <div class="settings-grid">
      <!-- Overlay panel -->
      <article class="panel">
        <header class="panel-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <h2>Overlay</h2>
        </header>

        <div class="field">
          <label class="field-label">Overlay URL</label>
          <div class="input-with-action">
            <input :value="overlayUrl" readonly class="field-input" />
            <button class="btn btn-ghost btn-sm" @click="copyOverlayUrl">Copy</button>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Socket URL</label>
          <input :value="socketUrl" readonly class="field-input" />
        </div>

        <div class="status-row">
          <span class="status-dot" :class="connectionClass"></span>
          <span class="status-label">{{ connectionLabel }}</span>
        </div>

        <p class="helper-text">
          Add the overlay URL as a browser source in OBS for the broadcaster.
        </p>
      </article>

      <!-- Speech settings panel -->
      <article class="panel">
        <header class="panel-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
            />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
          <h2>Speech settings</h2>
          <span v-if="settingsChanged" class="unsaved-badge">Unsaved</span>
        </header>

        <div class="field">
          <label for="voice" class="field-label">Voice</label>
          <select
            id="voice"
            v-model="selectedVoiceName"
            class="field-select"
            @change="markChanged"
          >
            <option value="">Default browser voice</option>
            <option
              v-for="voice in voices"
              :key="`${voice.name}-${voice.lang}`"
              :value="voice.name"
            >
              {{ voice.name }} ({{ voice.lang }})
            </option>
          </select>
        </div>

        <div class="field">
          <div class="range-label-row">
            <label for="rate" class="field-label">Rate</label>
            <span class="range-value">{{ rate }}</span>
          </div>
          <input
            id="rate"
            v-model.number="rate"
            @input="markChanged"
            type="range"
            min="0.5"
            max="1.8"
            step="0.1"
            class="range-input"
          />
          <div class="range-ticks"><span>0.5×</span><span>1.8×</span></div>
        </div>

        <div class="field">
          <div class="range-label-row">
            <label for="pitch" class="field-label">Pitch</label>
            <span class="range-value">{{ pitch }}</span>
          </div>
          <input
            id="pitch"
            v-model.number="pitch"
            @input="markChanged"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            class="range-input"
          />
          <div class="range-ticks"><span>0.5</span><span>2.0</span></div>
        </div>

        <div class="field">
          <div class="range-label-row">
            <label for="volume" class="field-label">Volume</label>
            <span class="range-value">{{ Math.round(volume * 100) }}%</span>
          </div>
          <input
            id="volume"
            v-model.number="volume"
            @input="markChanged"
            type="range"
            min="0"
            max="1"
            step="0.1"
            class="range-input"
          />
          <div class="range-ticks"><span>0%</span><span>100%</span></div>
        </div>

        <p class="helper-text">
          Preview plays on this page. The overlay test sends through your backend.
        </p>
      </article>

      <!-- Reward config panel -->
      <article class="panel">
        <header class="panel-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02
                      12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            />
          </svg>
          <h2>Reward config</h2>
          <span v-if="settingsChanged" class="unsaved-badge">Unsaved</span>
        </header>

        <div class="field">
          <label for="rewardTitle" class="field-label">Reward title</label>
          <input
            id="rewardTitle"
            v-model="rewardTitle"
            @input="markChanged"
            type="text"
            placeholder="Text To Speech"
            class="field-input"
          />
        </div>

        <div class="field">
          <label for="maxLength" class="field-label">Max message length</label>
          <input
            id="maxLength"
            v-model.number="maxLength"
            @input="markChanged"
            type="number"
            min="1"
            max="500"
            class="field-input field-input-sm"
          />
        </div>

        <p class="helper-text">
          Keep this reward title matched to your Twitch channel point reward name.
        </p>
      </article>

      <!-- Test TTS panel -->
      <article class="panel">
        <header class="panel-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5
                 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"
            />
            <path
              d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67
                 1.5 1.5-.67 1.5-1.5 1.5z"
            />
            <path
              d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67
                 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"
            />
            <path
              d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33
                 2 15.5 2.67 14 3.5 14z"
            />
            <path
              d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67
                 1.5 1.5s-.67 1.5-1.5 1.5H15.5c-.83 0-1.5-.67-1.5-1.5z"
            />
            <path
              d="M15.5 19H14v1.5c0 .83.67 1.5 1.5
                 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"
            />
            <path
              d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2
                 8.67 2 9.5S2.67 11 3.5 11H8.5c.83 0 1.5-.67
                 1.5-1.5z"
            />
            <path
              d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5
                 2S7 2.67 7 3.5 7.67 5 8.5 5z"
            />
          </svg>
          <h2>Test TTS</h2>
        </header>

        <div class="field">
          <label for="testUsername" class="field-label">Test username</label>
          <input
            id="testUsername"
            v-model="testUsername"
            type="text"
            placeholder="Test User"
            class="field-input"
          />
        </div>

        <div class="field">
          <label for="testMessage" class="field-label">Test message</label>
          <input
            id="testMessage"
            v-model="testMessage"
            type="text"
            placeholder="This is a test of your text to speech system."
            class="field-input"
          />
        </div>

        <p class="helper-text">
          Verify your overlay, voice, and browser source before going live.
        </p>
      </article>

      <!-- Recent events panel (full width) -->
      <article class="panel panel-full">
        <header class="panel-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            />
          </svg>
          <h2>Recent TTS events</h2>
          <button class="btn btn-ghost btn-sm ml-auto" @click="clearEvents">Clear</button>
        </header>

        <div v-if="events.length" class="event-list">
          <div v-for="event in events" :key="event.id" class="event-item">
            <div class="event-meta">
              <strong class="event-username">{{ event.username }}</strong>
              <span class="event-time">{{ formatTime(event.receivedAt) }}</span>
            </div>
            <p class="event-text">{{ event.text }}</p>
          </div>
        </div>

        <div v-else class="empty-state">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            />
          </svg>
          <p>No TTS events received yet.</p>
          <span>Events will appear here when viewers redeem your channel point reward.</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script>
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
</script>

<style scoped>
/* ── Design tokens ───────────────────────────────────────────────── */
.tts-settings-page {
  --color-bg: #111213;
  --color-surface: #18191c;
  --color-surface-2: #1e2023;
  --color-surface-offset: #252729;
  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-strong: rgba(255, 255, 255, 0.14);
  --color-text: #e8e9ea;
  --color-text-muted: #8b8f96;
  --color-text-faint: #52565c;
  --color-primary: #7c6af7;
  --color-primary-hover: #6b58f0;
  --color-primary-glow: rgba(124, 106, 247, 0.18);
  --color-success: #3ecf8e;
  --color-error: #f87171;
  --color-warning: #fbbf24;
  --color-online: #22c55e;
  --color-offline: #52565c;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.5);

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.375rem;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;

  --transition: 160ms cubic-bezier(0.16, 1, 0.3, 1);

  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: var(--text-base);
  color: var(--color-text);
  background: var(--color-bg);
  min-height: 100vh;
  padding: var(--space-8) var(--space-8) var(--space-12);
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: inherit;
}

/* ── Page header ─────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-6);
  margin-bottom: var(--space-8);
  flex-wrap: wrap;
}

.eyebrow {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-primary);
  margin-bottom: var(--space-1);
}

.page-header h1 {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-1);
  line-height: 1.2;
}

.intro {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  max-width: 480px;
}

.header-actions {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  flex-wrap: wrap;
  flex-shrink: 0;
}

/* ── Buttons ─────────────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition:
    background var(--transition),
    color var(--transition),
    box-shadow var(--transition),
    opacity var(--transition);
  white-space: nowrap;
  line-height: 1;
  height: 36px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary);
  color: #fff;
}
.btn-primary:not(:disabled):hover {
  background: var(--color-primary-hover);
  box-shadow: 0 0 0 3px var(--color-primary-glow);
}

.btn-secondary {
  background: var(--color-surface-offset);
  color: var(--color-text);
  border: 1px solid var(--color-border-strong);
}
.btn-secondary:not(:disabled):hover {
  background: var(--color-surface-2);
  border-color: var(--color-primary);
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}
.btn-ghost:not(:disabled):hover {
  background: var(--color-surface-offset);
  color: var(--color-text);
  border-color: var(--color-border-strong);
}

.btn-sm {
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  height: 28px;
}

.ml-auto {
  margin-left: auto;
}

/* ── Status banner ───────────────────────────────────────────────── */
.status-banner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  margin-bottom: var(--space-6);
  border: 1px solid transparent;
}

.status-banner.success {
  background: rgba(62, 207, 142, 0.1);
  border-color: rgba(62, 207, 142, 0.25);
  color: var(--color-success);
}

.status-banner.error {
  background: rgba(248, 113, 113, 0.1);
  border-color: rgba(248, 113, 113, 0.25);
  color: var(--color-error);
}

.status-banner.info {
  background: rgba(124, 106, 247, 0.08);
  border-color: rgba(124, 106, 247, 0.2);
  color: var(--color-text-muted);
}

.status-fade-enter-active,
.status-fade-leave-active {
  transition:
    opacity var(--transition),
    transform var(--transition);
}
.status-fade-enter-from,
.status-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── Grid layout ─────────────────────────────────────────────────── */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
}

.panel-full {
  grid-column: 1 / -1;
}

/* ── Panel ───────────────────────────────────────────────────────── */
.panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  transition: border-color var(--transition);
}

.panel:hover {
  border-color: var(--color-border-strong);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-1);
}

.panel-header svg {
  color: var(--color-primary);
  flex-shrink: 0;
}

.panel-header h2 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.unsaved-badge {
  margin-left: auto;
  font-size: var(--text-xs);
  font-weight: 500;
  padding: 2px var(--space-2);
  background: rgba(251, 191, 36, 0.12);
  color: var(--color-warning);
  border: 1px solid rgba(251, 191, 36, 0.25);
  border-radius: var(--radius-full);
}

/* ── Form fields ─────────────────────────────────────────────────── */
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-muted);
}

.field-input,
.field-select {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text);
  width: 100%;
  transition:
    border-color var(--transition),
    box-shadow var(--transition);
  height: 36px;
}

.field-input:focus,
.field-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-glow);
}

.field-input::placeholder {
  color: var(--color-text-faint);
}

.field-input[readonly] {
  color: var(--color-text-muted);
  cursor: default;
}

.field-input-sm {
  width: 120px;
}

.input-with-action {
  display: flex;
  gap: var(--space-2);
}

.input-with-action .field-input {
  flex: 1;
}

/* ── Range inputs ────────────────────────────────────────────────── */
.range-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.range-value {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
  min-width: 2.5rem;
  text-align: right;
}

.range-input {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--color-surface-offset);
  cursor: pointer;
  outline: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-glow);
  transition: transform var(--transition);
}

.range-input::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.range-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  background: var(--color-primary);
}

.range-ticks {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

/* ── Status row ──────────────────────────────────────────────────── */
.status-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-2);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.online {
  background: var(--color-online);
  box-shadow: 0 0 6px var(--color-online);
}

.status-dot.offline {
  background: var(--color-offline);
}

.status-label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

/* ── Helper text ─────────────────────────────────────────────────── */
.helper-text {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  margin-top: var(--space-1);
  line-height: 1.5;
}

/* ── Events list ─────────────────────────────────────────────────── */
.event-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 320px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-surface-offset) transparent;
}

.event-item {
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: border-color var(--transition);
}

.event-item:hover {
  border-color: var(--color-border-strong);
}

.event-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-1);
}

.event-username {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-primary);
}

.event-time {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  font-variant-numeric: tabular-nums;
}

.event-text {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
}

/* ── Empty state ─────────────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-8);
  color: var(--color-text-faint);
  text-align: center;
  gap: var(--space-2);
}

.empty-state svg {
  opacity: 0.4;
  margin-bottom: var(--space-2);
}

.empty-state p {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--color-text-muted);
  margin: 0;
}

.empty-state span {
  font-size: var(--text-sm);
  max-width: 320px;
}

/* ── Responsive ──────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  .panel-full {
    grid-column: auto;
  }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-actions {
    width: 100%;
  }
  .tts-settings-page {
    padding: var(--space-5) var(--space-4) var(--space-10);
  }
}

@media (max-width: 480px) {
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .btn {
    justify-content: center;
  }
}
</style>