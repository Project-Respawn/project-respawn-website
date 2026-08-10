<template>
  <div class="bot-page">
    <BotSidebar
      :title="'Twitch Alerts'"
      :colourBrand1="'#7c3aed'"
      :colourBrand2="'#a78bfa'"
      :colourBoxShadow="'rgba(124, 58, 237, 0.35)'"
    />

    <main class="bot-main">
      <section class="hero-card alerts-hero">
        <div class="hero-copy">
          <p class="eyebrow">Alert control centre</p>
          <h2>Configure viewer-facing alerts for follows, subs, raids, and rewards</h2>
          <p class="hero-text">
            Build a StreamElements-style alert system for Project Respawn by controlling
            what appears on stream, how it sounds, and how each event behaves per channel.
          </p>

          <div class="hero-actions">
            <button class="primary-btn" type="button">Save Alert Settings</button>
            <button class="secondary-btn" type="button">Trigger Test Alert</button>
          </div>
        </div>

        <div class="hero-stats">
          <div class="mini-stat">
            <span class="mini-label">Selected Alert</span>
            <strong>{{ selectedAlert.name }}</strong>
          </div>
          <div class="mini-stat">
            <span class="mini-label">Overlay Mode</span>
            <strong>Preview Ready</strong>
          </div>
          <div class="mini-stat">
            <span class="mini-label">Current Focus</span>
            <strong>Alert Editor MVP</strong>
          </div>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Alert editor</p>
            <h3>Choose an alert type</h3>
          </div>
          <div class="inline-status">Main config area</div>
        </div>

        <div class="alert-type-grid">
          <button
            v-for="alert in alertTypes"
            :key="alert.key"
            type="button"
            class="alert-type-card"
            :class="{ active: selectedAlertKey === alert.key }"
            @click="selectAlert(alert.key)"
          >
            <span class="card-badge" :class="alert.badgeClass">{{ alert.badge }}</span>
            <h4>{{ alert.name }}</h4>
            <p>{{ alert.description }}</p>
          </button>
        </div>
      </section>

      <section class="dashboard-section editor-layout">
        <div class="editor-main">
          <div class="section-heading">
            <div>
              <p class="section-kicker">Settings</p>
              <h3>{{ selectedAlert.name }} configuration</h3>
            </div>
          </div>

          <div class="editor-card">
            <div class="form-row split">
              <label class="field">
                <span class="field-label">Enable alert</span>
                <select v-model="selectedAlert.enabled">
                  <option :value="true">Enabled</option>
                  <option :value="false">Disabled</option>
                </select>
              </label>

              <label class="field">
                <span class="field-label">Duration</span>
                <select v-model="selectedAlert.duration">
                  <option value="4s">4 seconds</option>
                  <option value="6s">6 seconds</option>
                  <option value="8s">8 seconds</option>
                  <option value="10s">10 seconds</option>
                </select>
              </label>
            </div>

            <div class="form-row">
              <label class="field">
                <span class="field-label">Alert title</span>
                <input
                  v-model="selectedAlert.title"
                  type="text"
                  placeholder="Enter alert title"
                />
              </label>
            </div>

            <div class="form-row">
           <label class="field">
  <span class="field-label">Alert message</span>
  <textarea
    v-model="selectedAlert.message"
    rows="4"
    placeholder="Write the message viewers will see on stream"
  ></textarea>
</label>
            </div>

            <div class="form-row split">
              <label class="field">
                <span class="field-label">Image / GIF URL</span>
                <input
                  v-model="selectedAlert.mediaUrl"
                  type="text"
                  placeholder="https://..."
                />
              </label>

              <label class="field">
                <span class="field-label">Sound URL</span>
                <input
                  v-model="selectedAlert.soundUrl"
                  type="text"
                  placeholder="https://..."
                />
              </label>
            </div>

            <div class="form-row split">
              <label class="field">
                <span class="field-label">Animation style</span>
                <select v-model="selectedAlert.animation">
                  <option value="slide-up">Slide Up</option>
                  <option value="fade-in">Fade In</option>
                  <option value="pop">Pop</option>
                  <option value="zoom">Zoom</option>
                </select>
              </label>

              <label class="field">
                <span class="field-label">Volume</span>
                <input v-model="selectedAlert.volume" type="range" min="0" max="100" />
              </label>
            </div>
          </div>

          <div class="section-heading variation-heading">
            <div>
              <p class="section-kicker">Variations</p>
              <h3>Variation rules</h3>
            </div>
          </div>

          <div class="card-grid variation-grid">
            <article
              class="feature-card variation-card"
              v-for="variation in selectedAlert.variations"
              :key="variation.id"
            >
              <span class="card-badge muted">{{ variation.badge }}</span>
              <h4>{{ variation.name }}</h4>
              <p>{{ variation.rule }}</p>
              <button class="card-btn secondary" type="button">Edit Variation</button>
            </article>

            <article class="feature-card variation-card add-card">
              <span class="card-badge">Next</span>
              <h4>Add variation</h4>
              <p>Create alternate versions based on amount, tier, randomization, or reward type.</p>
              <button class="card-btn" type="button">Add Rule</button>
            </article>
          </div>
        </div>

        <aside class="editor-side">
          <div class="preview-card">
            <div class="section-heading compact">
              <div>
                <p class="section-kicker">Preview</p>
                <h3>Live style preview</h3>
              </div>
            </div>

            <div class="alert-preview-stage">
              <div class="alert-preview-box">
                <div class="preview-media">Media</div>
                <div class="preview-copy">
                  <span class="preview-title">{{ selectedAlert.title }}</span>
                  <p>{{ selectedAlert.message }}</p>
                </div>
              </div>
            </div>

            <div class="preview-meta">
              <div class="mini-stat">
                <span class="mini-label">Animation</span>
                <strong>{{ selectedAlert.animation }}</strong>
              </div>
              <div class="mini-stat">
                <span class="mini-label">Duration</span>
                <strong>{{ selectedAlert.duration }}</strong>
              </div>
            </div>

            <div class="hero-actions preview-actions">
              <button class="primary-btn" type="button">Preview Alert</button>
              <button class="secondary-btn" type="button">Send Test Event</button>
            </div>
          </div>

          <div class="preview-card helper-card">
            <div class="section-heading compact">
              <div>
                <p class="section-kicker">Overlay notes</p>
                <h3>What comes next</h3>
              </div>
            </div>

            <ul class="helper-list">
              <li>Link this page to a viewer-facing overlay route.</li>
              <li>Save configs per broadcaster account.</li>
              <li>Trigger test events from Twitch or internal tools.</li>
              <li>Extend to bits, gifts, donations, and TTS reward variants.</li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup>
import BotSidebar from '@/components/BotSidebar/BotSidebar.vue';
</script>

<script>
export default {
  name: 'TwitchAlerts',
  data() {
    return {
      selectedAlertKey: 'follow',
      alertTypes: [
        {
          key: 'follow',
          name: 'Follow Alert',
          badge: 'Ready',
          badgeClass: '',
          description: 'Control how new follower alerts appear on stream.'
        },
        {
          key: 'sub',
          name: 'Sub Alert',
          badge: 'Next',
          badgeClass: 'alert',
          description: 'Set the layout and message for subscriber alerts.'
        },
        {
          key: 'raid',
          name: 'Raid Alert',
          badge: 'Next',
          badgeClass: 'alert',
          description: 'Create custom welcome moments for incoming raids.'
        },
        {
          key: 'tts',
          name: 'TTS Reward Alert',
          badge: 'In Progress',
          badgeClass: 'alert',
          description: 'Link channel point or reward-based TTS moments.'
        },
        {
          key: 'bits',
          name: 'Bits Alert',
          badge: 'Planned',
          badgeClass: 'muted',
          description: 'Prepare thresholds and cheer-based alert variants.'
        },
        {
          key: 'donation',
          name: 'Donation Alert',
          badge: 'Planned',
          badgeClass: 'muted',
          description: 'Reserve support alert behaviour for future payments.'
        }
      ],
      alertConfigs: {
        follow: {
          name: 'Follow Alert',
          enabled: true,
          duration: '6s',
          title: 'New follower!',
          message: 'A new viewer has joined the respawn.',
          mediaUrl: '',
          soundUrl: '',
          animation: 'slide-up',
          volume: 75,
          variations: [
            {
              id: 'follow-default',
              badge: 'Default',
              name: 'Standard Follow',
              rule: 'Used for all follows unless a future special condition is added.'
            }
          ]
        },
        sub: {
          name: 'Sub Alert',
          enabled: true,
          duration: '8s',
          title: 'New subscriber!',
          message: 'Thank you for subscribing and supporting the channel.',
          mediaUrl: '',
          soundUrl: '',
          animation: 'pop',
          volume: 80,
          variations: [
            {
              id: 'sub-tier1',
              badge: 'Tier',
              name: 'Tier 1 Default',
              rule: 'Base subscriber alert for normal subscription events.'
            },
            {
              id: 'sub-gift',
              badge: 'Gift',
              name: 'Gifted Sub',
              rule: 'Show a different alert when a gifted sub event is detected.'
            }
          ]
        },
        raid: {
          name: 'Raid Alert',
          enabled: true,
          duration: '8s',
          title: 'Raid incoming!',
          message: 'Welcome in raiders — thanks for joining the stream.',
          mediaUrl: '',
          soundUrl: '',
          animation: 'zoom',
          volume: 85,
          variations: [
            {
              id: 'raid-small',
              badge: 'Size',
              name: 'Small Raid',
              rule: 'Used for normal or low-count raids.'
            },
            {
              id: 'raid-large',
              badge: 'Size',
              name: 'Big Raid',
              rule: 'Use a more dramatic version for larger raid sizes later.'
            }
          ]
        },
        tts: {
          name: 'TTS Reward Alert',
          enabled: true,
          duration: '10s',
          title: 'TTS activated',
          message: 'A viewer has triggered a text-to-speech alert moment.',
          mediaUrl: '',
          soundUrl: '',
          animation: 'fade-in',
          volume: 90,
          variations: [
            {
              id: 'tts-channel-points',
              badge: 'Reward',
              name: 'Channel Points',
              rule: 'Used when the TTS reward is triggered through Twitch channel points.'
            }
          ]
        },
        bits: {
          name: 'Bits Alert',
          enabled: false,
          duration: '6s',
          title: 'Cheer received!',
          message: 'Thanks for the bits and support.',
          mediaUrl: '',
          soundUrl: '',
          animation: 'slide-up',
          volume: 70,
          variations: [
            {
              id: 'bits-100',
              badge: 'Threshold',
              name: '100+ Bits',
              rule: 'Example threshold alert variation for higher bit amounts.'
            }
          ]
        },
        donation: {
          name: 'Donation Alert',
          enabled: false,
          duration: '8s',
          title: 'Support received!',
          message: 'Thank you for the donation and support.',
          mediaUrl: '',
          soundUrl: '',
          animation: 'pop',
          volume: 85,
          variations: [
            {
              id: 'donation-default',
              badge: 'Default',
              name: 'Base Donation Alert',
              rule: 'Placeholder for future payment-linked event support.'
            }
          ]
        }
      }
    };
  },
  computed: {
    selectedAlert() {
      return this.alertConfigs[this.selectedAlertKey];
    }
  },
  methods: {
    selectAlert(key) {
      this.selectedAlertKey = key;
    }
  }
};
</script>

<style scoped src="./TwitchAlerts.css"></style>
