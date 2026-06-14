<template>
  <div class="tts-settings-container">
    
    <BotSidebar    
      title="TTS Settings"
      colourBrand1="#7c6af7"
      colourBrand2="#6b58f0"
      colourBoxShadow="rgba(124, 106, 247, 0.18)"/>

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
  </div>
</template>

<script scoped src="./TtsSettings.js"></script>

<style scoped src="./TtsSettings.css"></style>