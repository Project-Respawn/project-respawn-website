<template>
  <main class="creator-profile-page">
    <section class="creator-profile-header">
      <div>
        <p class="creator-profile-eyebrow">Creator Tools</p>
        <h1>Creator Profile</h1>
        <p class="creator-profile-subtitle">
          Build your creator identity and control how your card appears on the public Creators page.
        </p>
      </div>

      <div class="creator-profile-header-actions">
        <button class="profile-button profile-button-secondary" type="button" @click="scrollToPreview">
          Preview on Creators Page
        </button>
        <button class="profile-button profile-button-primary" type="button" @click="saveProfile">
          Save Changes
        </button>
      </div>
    </section>

    <section class="creator-profile-status-row">
      <span class="profile-status-pill" :class="`is-${profile.status}`">
        {{ statusLabel }}
      </span>
      <span v-if="lastSaved" class="profile-save-message">
        Saved {{ lastSaved }}
      </span>
    </section>

    <nav class="creator-profile-tabs" aria-label="Creator Profile sections">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </nav>

    <section class="creator-profile-workspace">
      <div class="creator-profile-editor">
        <section v-if="activeTab === 'identity'" class="profile-panel">
          <div class="profile-panel-heading">
            <div>
              <h2>Creator Identity</h2>
              <p>This information appears on your creator card.</p>
            </div>
          </div>

          <div class="identity-grid">
            <div class="avatar-column">
              <div class="avatar-preview">
                <img v-if="profile.avatarUrl" :src="profile.avatarUrl" alt="Creator avatar preview">
                <span v-else>{{ initials }}</span>
              </div>

              <label class="field-label" for="avatar-url">Avatar image URL</label>
              <input
                id="avatar-url"
                v-model.trim="profile.avatarUrl"
                class="profile-input"
                type="url"
                placeholder="https://..."
              >
              <p class="field-help">
                Temporary frontend field. Backend image upload can replace this tomorrow.
              </p>
            </div>

            <div class="identity-fields">
              <label class="profile-field">
                <span>Display name</span>
                <div class="input-with-count">
                  <input v-model.trim="profile.displayName" class="profile-input" maxlength="30">
                  <small>{{ profile.displayName.length }}/30</small>
                </div>
              </label>

              <label class="profile-field">
                <span>Headline</span>
                <div class="input-with-count">
                  <input
                    v-model.trim="profile.headline"
                    class="profile-input"
                    maxlength="60"
                    placeholder="Variety streamer & community creator"
                  >
                  <small>{{ profile.headline.length }}/60</small>
                </div>
              </label>

              <label class="profile-field">
                <span>Creator bio</span>
                <div class="textarea-with-count">
                  <textarea
                    v-model.trim="profile.bio"
                    class="profile-textarea"
                    rows="5"
                    maxlength="220"
                    placeholder="Tell people what you create and what your community is about."
                  ></textarea>
                  <small>{{ profile.bio.length }}/220</small>
                </div>
              </label>
            </div>
          </div>
        </section>

        <section v-if="activeTab === 'content'" class="profile-panel">
          <div class="profile-panel-heading">
            <div>
              <h2>Content & Categories</h2>
              <p>Help people understand what they can expect from your content.</p>
            </div>
          </div>

          <div class="profile-field">
            <span>Content categories <small>Up to 5</small></span>
            <div class="chip-editor">
              <button
                v-for="category in profile.categories"
                :key="category"
                class="editable-chip"
                type="button"
                @click="removeCategory(category)"
              >
                {{ category }} <span>×</span>
              </button>

              <div v-if="profile.categories.length < 5" class="chip-add">
                <input
                  v-model.trim="newCategory"
                  class="profile-input"
                  placeholder="Add category"
                  @keyup.enter.prevent="addCategory"
                >
                <button type="button" @click="addCategory">Add</button>
              </div>
            </div>
          </div>

          <div class="profile-field">
            <span>Top games <small>Up to 4</small></span>
            <div class="chip-editor">
              <button
                v-for="game in profile.games"
                :key="game"
                class="editable-chip game-chip"
                type="button"
                @click="removeGame(game)"
              >
                {{ game }} <span>×</span>
              </button>

              <div v-if="profile.games.length < 4" class="chip-add">
                <input
                  v-model.trim="newGame"
                  class="profile-input"
                  placeholder="Add game"
                  @keyup.enter.prevent="addGame"
                >
                <button type="button" @click="addGame">Add</button>
              </div>
            </div>
          </div>
        </section>

        <section v-if="activeTab === 'links'" class="profile-panel">
          <div class="profile-panel-heading">
            <div>
              <h2>Platform Links</h2>
              <p>Choose where visitors can find you.</p>
            </div>
          </div>

          <div class="links-grid">
            <label class="profile-field">
              <span>Twitch</span>
              <input v-model.trim="profile.links.twitch" class="profile-input" type="url" placeholder="https://twitch.tv/...">
            </label>

            <label class="profile-field">
              <span>YouTube</span>
              <input v-model.trim="profile.links.youtube" class="profile-input" type="url" placeholder="https://youtube.com/...">
            </label>

            <label class="profile-field">
              <span>TikTok</span>
              <input v-model.trim="profile.links.tiktok" class="profile-input" type="url" placeholder="https://tiktok.com/@...">
            </label>

            <label class="profile-field">
              <span>Instagram</span>
              <input v-model.trim="profile.links.instagram" class="profile-input" type="url" placeholder="https://instagram.com/...">
            </label>

            <label class="profile-field full-width">
              <span>Website</span>
              <input v-model.trim="profile.links.website" class="profile-input" type="url" placeholder="https://...">
            </label>
          </div>
        </section>

        <section v-if="activeTab === 'appearance'" class="profile-panel">
          <div class="profile-panel-heading">
            <div>
              <h2>Card Appearance</h2>
              <p>Choose a Project Respawn approved colour scheme for your creator card.</p>
            </div>
          </div>

          <div class="theme-grid">
            <button
              v-for="theme in themes"
              :key="theme.key"
              type="button"
              class="theme-option"
              :class="[theme.key, { selected: profile.theme === theme.key }]"
              @click="profile.theme = theme.key"
            >
              <span class="theme-preview"></span>
              <strong>{{ theme.label }}</strong>
              <small>{{ theme.description }}</small>
              <span class="theme-selected">{{ profile.theme === theme.key ? '✓' : '' }}</span>
            </button>
          </div>

          <p class="appearance-note">
            Custom colours are intentionally limited so every card still feels part of Project Respawn.
          </p>
        </section>

        <section v-if="activeTab === 'discovery'" class="profile-panel">
          <div class="profile-panel-heading">
            <div>
              <h2>Discovery & Visibility</h2>
              <p>Control whether your creator identity can appear in Project Respawn discovery.</p>
            </div>
          </div>

          <div class="discovery-setting">
            <div>
              <strong>Show me on the Creators page</strong>
              <p>
                When enabled, your creator card can appear on the public Project Respawn Creators page after approval.
              </p>
            </div>

            <button
              type="button"
              class="toggle-control"
              :class="{ enabled: profile.publicOptIn }"
              :aria-pressed="profile.publicOptIn"
              @click="profile.publicOptIn = !profile.publicOptIn"
            >
              <span></span>
            </button>
          </div>

          <div class="review-box">
            <div>
              <strong>Profile review</strong>
              <p>
                Creator-controlled fields can be edited at any time. Featured status, ordering and moderation remain admin controlled.
              </p>
            </div>

            <button
              v-if="profile.publicOptIn"
              class="profile-button profile-button-primary"
              type="button"
              @click="submitForReview"
            >
              Submit for Review
            </button>
          </div>
        </section>
      </div>

      <aside id="creator-profile-preview" class="creator-profile-preview-panel">
        <div class="preview-heading">
          <div>
            <h2>Live Preview</h2>
            <p>This is how your card can appear on the Creators page.</p>
          </div>
        </div>

        <article class="creator-card" :class="`theme-${profile.theme}`">
          <div class="creator-card-glow"></div>

          <span v-if="profile.featured" class="creator-card-featured">★ Featured</span>

          <div class="creator-card-avatar">
            <img v-if="profile.avatarUrl" :src="profile.avatarUrl" alt="">
            <span v-else>{{ initials }}</span>
          </div>

          <h3>{{ profile.displayName || 'Creator Name' }}</h3>
          <p class="creator-card-headline">
            {{ profile.headline || 'Tell people what you create.' }}
          </p>

          <div class="creator-card-chips">
            <span v-for="category in profile.categories.slice(0, 4)" :key="category">
              {{ category }}
            </span>
          </div>

          <div class="creator-card-socials">
            <a v-if="profile.links.twitch" :href="profile.links.twitch" target="_blank" rel="noopener">Twitch</a>
            <a v-if="profile.links.youtube" :href="profile.links.youtube" target="_blank" rel="noopener">YouTube</a>
            <a v-if="profile.links.tiktok" :href="profile.links.tiktok" target="_blank" rel="noopener">TikTok</a>
            <a v-if="profile.links.instagram" :href="profile.links.instagram" target="_blank" rel="noopener">Instagram</a>
          </div>

          <p class="creator-card-bio">
            {{ profile.bio || 'Your creator bio will appear here.' }}
          </p>

          <button type="button" class="creator-card-view" disabled>
            View Profile →
          </button>
        </article>

        <div class="preview-meta">
          <div>
            <span>Theme</span>
            <strong>{{ activeThemeLabel }}</strong>
          </div>
          <div>
            <span>Discovery</span>
            <strong>{{ profile.publicOptIn ? 'Enabled' : 'Hidden' }}</strong>
          </div>
        </div>
      </aside>
    </section>

    <section class="creator-profile-theme-strip">
      <div>
        <p class="creator-profile-eyebrow">Choose your card theme</p>
        <h2>Keep your identity. Stay part of Respawn.</h2>
      </div>

      <div class="theme-strip-options">
        <button
          v-for="theme in themes"
          :key="theme.key"
          type="button"
          class="theme-strip-card"
          :class="[theme.key, { selected: profile.theme === theme.key }]"
          @click="profile.theme = theme.key"
        >
          <span></span>
          <strong>{{ theme.label }}</strong>
          <small>{{ theme.description }}</small>
        </button>
      </div>
    </section>

    <section class="creator-profile-how">
      <p class="creator-profile-eyebrow">How it works</p>

      <div class="how-grid">
        <article v-for="(step, index) in howItWorks" :key="step.title">
          <span>{{ index + 1 }}</span>
          <div>
            <strong>{{ step.title }}</strong>
            <p>{{ step.copy }}</p>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<script src="./CreatorProfile.js"></script>
<style scoped src="./CreatorProfile.css"></style>
