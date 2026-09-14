import { generateClient } from 'aws-amplify/data';
import BotSidebar from '@/components/BotSidebar/BotSidebar.vue';
import { refreshAccessContext } from '@/composables/useAccessContext.js';
import { getActiveOverlayPublication, getTwitchOverlayConfig, sendOverlayTestEvent, updateTwitchOverlayConfig } from '@/features/creator-tools/services/overlaySource.js';
import { decodeTwitchJson } from '@/features/creator-tools/services/twitchConnection.js';
import { createTestOverlayEvent } from '@/features/creator-tools/overlays/overlayEventContract.js';

const twitchDataClient = generateClient();

export default {
  name: 'TextToSpeech',
  components: {
    BotSidebar,
  },

  data() {
    return {
      broadcasterId: '',
      broadcasterName: '',
      selectedBrandId: '',
      workspaceId: '',
      canonicalConfig: null,
      integrationId: '',
      maxLength: 200,

      voices: [],
      selectedVoiceName: '',
      rate: 1,
      pitch: 1,
      volume: 1,

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
    selectedVoice() {
      return this.voices.find((v) => v.name === this.selectedVoiceName) || null;
    },
  },

  async mounted() {
    this.broadcasterId =
      this.$route?.params?.broadcasterId ||
      this.$route?.query?.broadcasterId ||
      '';

    this.loadVoices();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = this.loadVoices;
    }

    await this.resolveBroadcasterContext();
    await this.loadSavedSettings();
  },

  beforeUnmount() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    }
    if (this.statusTimer) clearTimeout(this.statusTimer);
  },

  methods: {
    async resolveBroadcasterContext() {
      if (this.broadcasterId) {
        console.log('[TTS Settings] using broadcasterId from route:', this.broadcasterId);
        return this.broadcasterId;
      }

      try {
          const access = await refreshAccessContext();
          const brand = access.brands?.[0], workspace = access.workspaces?.find(item => (item.workspaceId || item.id) === brand?.workspaceId) || access.workspaces?.[0];
          this.selectedBrandId = brand?.brandId || brand?.id || '';
          this.workspaceId = brand?.workspaceId || workspace?.workspaceId || workspace?.id || '';
          if (!this.selectedBrandId) throw new Error('No accessible Brand selected');
          const response = await twitchDataClient.queries.getMyTwitchIntegration({ brandId: this.selectedBrandId });
          if (response?.errors?.length) throw new Error(response.errors[0].message || 'Integration lookup failed');
          const integration = decodeTwitchJson(response?.data?.integration, null);
          if (integration?.twitchBroadcasterId) {
            this.integrationId = integration.id;
            this.broadcasterId = String(integration.twitchBroadcasterId);
            this.broadcasterName = integration.twitchDisplayName || integration.twitchLogin || '';
            return this.broadcasterId;
          }
          throw new Error('No Twitch integration exists for the selected Brand');
      } catch (error) {
        console.error('[TTS Settings] failed to resolve broadcaster context:', error);
      }

      this.broadcasterId = '';
      this.broadcasterName = '';
      this.showStatus('No connected broadcaster found for TTS', 'error');
      return '';
    },

    // ── Persistence ────────────────────────────────────────────────
    async loadSavedSettings() {
      try {
        const access = await refreshAccessContext(); const brand = access.brands?.find(item => item.brandId === this.selectedBrandId) || access.brands?.[0], workspace = access.workspaces?.[0];
        this.selectedBrandId = brand?.brandId || this.selectedBrandId; this.workspaceId = brand?.workspaceId || workspace?.workspaceId || workspace?.id || '';
        if (!this.selectedBrandId || !this.workspaceId) return;
        const result = await getTwitchOverlayConfig(this.workspaceId, this.selectedBrandId); this.canonicalConfig = result.config;
        const saved = { selectedVoiceName: result.config?.tts?.voice, ...result.config?.tts };
        if (saved.selectedVoiceName !== undefined) this.selectedVoiceName = saved.selectedVoiceName;
        if (saved.rate !== undefined) this.rate = saved.rate;
        if (saved.pitch !== undefined) this.pitch = saved.pitch;
        if (saved.volume !== undefined) this.volume = saved.volume;
        if (saved.maxLength !== undefined) this.maxLength = saved.maxLength;
        this.settingsChanged = false;
      } catch (err) {
        console.warn('Could not load saved TTS settings', err);
      }
    },

    async saveSettings() {
      try {
        this.saving = true;
        const payload = {
          selectedVoiceName: this.selectedVoiceName,
          rate: this.rate,
          pitch: this.pitch,
          volume: this.volume,
          maxLength: this.maxLength,
        };
        if (!this.workspaceId || !this.selectedBrandId || !this.canonicalConfig) throw new Error('TTS settings are still loading');
        const result = await updateTwitchOverlayConfig(this.workspaceId, this.selectedBrandId, { ...this.canonicalConfig, tts: { enabled: this.canonicalConfig.tts?.enabled !== false, voice: payload.selectedVoiceName, rate: payload.rate, pitch: payload.pitch, volume: payload.volume, maxLength: payload.maxLength } });
        this.canonicalConfig = result.config;
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

      if (!this.broadcasterId) {
        this.socketState = 'idle';
        console.warn('[TTS Settings] socket connect skipped: missing broadcasterId');
        this.showStatus('Connect a broadcaster before opening TTS socket', 'error');
        return;
      }

      this.suppressSocketReconnect = false;
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
      console.log('[TTS Settings] socket connecting:', {
        wsUrl,
        broadcasterId: this.broadcasterId || ''
      });

      const socket = new WebSocket(wsUrl);
      this.socket = socket;

      socket.addEventListener('open', () => {
        this.socketState = 'open';
        console.log('[TTS Settings] socket open:', wsUrl);
        this.showStatus('Socket connected', 'success');
      });

      socket.addEventListener('message', (event) => {
        try {
          const payload = JSON.parse(event.data);
          console.log('[TTS Settings] socket message:', payload);

          if (payload.type === 'events-status') {
            return;
          }

          if (payload.type !== 'overlay-event') return;
          if (String(payload.eventType || '').trim() !== 'tts') return;

          const ttsPayload = payload.payload || {};

          const item = {
            id: `${Date.now()}-${Math.random()}`,
            username: ttsPayload.username || 'Anonymous',
            text: ttsPayload.text || '',
            receivedAt: new Date().toISOString(),
          };

          if (!String(item.text || '').trim()) {
            return;
          }

          console.log('[TTS Settings] received TTS event:', {
            broadcasterId: ttsPayload.broadcasterId || payload.broadcasterId || '',
            username: item.username,
            textLength: String(item.text).length
          });

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
        console.log('[TTS Settings] socket closed:', {
          code: event.code,
          reason: event.reason || '',
          suppressReconnect: this.suppressSocketReconnect,
          useSocket: this.useSocket
        });
        this.showStatus('Socket closed');

        if (!this.suppressSocketReconnect && this.useSocket) {
          this.reconnectTimer = setTimeout(
            () => this.connectSocket(),
            this.reconnectDelayMs,
          );
        }
      });

      socket.addEventListener('error', (error) => {
        this.socketState = 'error';
        console.error('[TTS Settings] socket error:', error);
        this.showStatus(`Socket connection failed: ${wsUrl}`, 'error');
      });
    },

    reconnectSocket() {
      this.suppressSocketReconnect = true;
      this.cleanupSocket();
      this.suppressSocketReconnect = false;
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
      this.socketState = 'closed';
    },

    // ── API ────────────────────────────────────────────────────────
    async sendTestTts() {
      try {
        this.sendingTest = true;
        const active = await getActiveOverlayPublication(this.workspaceId, this.selectedBrandId); const publicationId = active.publication?.publicationId;
        if (!publicationId) throw new Error('Create a Browser Source before sending a TTS test');
        const event = createTestOverlayEvent('tts.requested'); event.data.actor.displayName = this.testUsername || 'Test User'; event.data.payload.text = this.testMessage || 'Project Respawn text to speech test';
        await sendOverlayTestEvent(publicationId, event);
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
