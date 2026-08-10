<template>
  <div class="bot-page">
    <BotSidebar
      :title="'Moderation'"
      :colourBrand1="'#f97316'"
      :colourBrand2="'#fb923c'"
      :colourBoxShadow="'rgba(249, 115, 22, 0.35)'"
    />

    <main class="bot-main">
      <section class="moderation-shell">
        <div class="moderation-main-column">
          <section class="hero-card moderation-hero">
            <div class="hero-copy">
              <p class="eyebrow">Shared moderation</p>
              <h2>Manage Twitch and Discord moderation from one place</h2>
              <p class="hero-text">
                Create shared rules, filter by bot, and control how moderation policies
                are applied across your connected communities.
              </p>

              <div class="hero-actions">
                <button class="primary-btn" type="button" @click="saveSettings">
                  Save Moderation
                </button>
                <button class="secondary-btn" type="button" @click="resetSettings">
                  Reset
                </button>
              </div>
            </div>

            <div class="hero-stats">
              <div class="mini-stat">
                <span class="mini-label">Active rules</span>
                <strong>{{ activeRulesCount }}</strong>
              </div>
              <div class="mini-stat">
                <span class="mini-label">Visible rules</span>
                <strong>{{ filteredRules.length }}</strong>
              </div>
              <div class="mini-stat">
                <span class="mini-label">Current filter</span>
                <strong>{{ activeFilterLabel }}</strong>
              </div>
            </div>
          </section>

          <section class="dashboard-section">
            <div class="section-heading">
              <div>
                <p class="section-kicker">Quick controls</p>
                <h3>Moderation toggles</h3>
              </div>
              <div class="inline-status">
                {{ moderationEnabled ? 'Moderation live' : 'Moderation paused' }}
              </div>
            </div>

            <div class="toggle-grid">
              <article
                v-for="toggle in moderationToggles"
                :key="toggle.key"
                class="feature-card toggle-card"
              >
                <div class="toggle-card-top">
                  <div>
                    <span class="card-badge">{{ toggle.badge }}</span>
                    <h4>{{ toggle.title }}</h4>
                  </div>

                  <label class="switch">
                    <input
                      type="checkbox"
                      v-model="toggle.enabled"
                      @change="handleToggleChange(toggle.key)"
                    />
                    <span class="switch-slider"></span>
                  </label>
                </div>

                <p>{{ toggle.description }}</p>
              </article>
            </div>
          </section>

          <section class="dashboard-section">
            <div class="section-heading">
              <div>
                <p class="section-kicker">Rule filters</p>
                <h3>Policy visibility</h3>
              </div>
            </div>

            <article class="feature-card filter-card">
              <div class="filter-toolbar">
                <button
                  v-for="filter in ruleFilters"
                  :key="filter.key"
                  type="button"
                  class="filter-chip"
                  :class="{ active: activeFilter === filter.key }"
                  @click="activeFilter = filter.key"
                >
                  {{ filter.label }}
                </button>
              </div>
            </article>
          </section>

          <section class="dashboard-section moderation-workspace">
            <div class="moderation-content">
              <div class="section-heading">
                <div>
                  <p class="section-kicker">Shared rules</p>
                  <h3>Blocked words and phrases</h3>
                </div>
              </div>

              <article class="feature-card terms-card">
                <div class="terms-input-grid">
                  <input
                    v-model="newRuleLabel"
                    type="text"
                    class="term-input"
                    placeholder="Add a blocked word or phrase"
                    @keyup.enter="addRule"
                  />

                  <select v-model="newRuleCategory" class="field-input compact-input">
                    <option value="Spam">Spam</option>
                    <option value="Harassment">Harassment</option>
                    <option value="Links">Links</option>
                    <option value="Language">Language</option>
                  </select>

                  <select v-model="newRuleAction" class="field-input compact-input">
                    <option value="warn">Warn</option>
                    <option value="delete">Delete</option>
                    <option value="review">Review</option>
                    <option value="timeout">Timeout</option>
                  </select>

                  <select v-model="newRuleScope" class="field-input compact-input">
                    <option value="both">Both bots</option>
                    <option value="twitch">Twitch only</option>
                    <option value="discord">Discord only</option>
                  </select>

                  <button class="card-btn" type="button" @click="addRule">
                    Add rule
                  </button>
                </div>

                <div v-if="filteredRules.length" class="rule-list">
                  <article
                    v-for="rule in filteredRules"
                    :key="rule.id"
                    class="rule-card"
                  >
                    <div class="rule-top">
                      <div class="rule-main">
                        <strong>{{ rule.label }}</strong>

                        <div class="rule-meta">
                          <span class="rule-tag category">{{ rule.category }}</span>
                          <span class="rule-tag scope" :class="scopeClass(rule.scope)">
                            {{ scopeLabel(rule.scope) }}
                          </span>
                          <span class="rule-tag action">{{ actionLabel(rule.action) }}</span>
                          <span
                            class="rule-tag status"
                            :class="rule.enabled ? 'enabled' : 'paused'"
                          >
                            {{ rule.enabled ? 'Active' : 'Paused' }}
                          </span>
                        </div>
                      </div>

                      <div class="rule-controls">
                        <label class="switch compact-switch">
                          <input
                            type="checkbox"
                            v-model="rule.enabled"
                            @change="showToast('Rule updated')"
                          />
                          <span class="switch-slider"></span>
                        </label>

                        <button
                          type="button"
                          class="chip-remove"
                          @click="removeRule(rule.id)"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                </div>

                <p v-else class="empty-copy">
                  No moderation rules match this filter yet.
                </p>
              </article>

              <div class="section-heading nested-heading">
                <div>
                  <p class="section-kicker">Linked actions</p>
                  <h3>What should happen when a rule is triggered?</h3>
                </div>
              </div>

              <div class="action-grid">
                <article
                  v-for="action in moderationActions"
                  :key="action.key"
                  class="feature-card action-card"
                  :class="{ selected: selectedAction === action.key }"
                  @click="selectedAction = action.key"
                >
                  <span class="card-badge muted">{{ action.badge }}</span>
                  <h4>{{ action.title }}</h4>
                  <p>{{ action.description }}</p>
                </article>
              </div>
            </div>

            <aside class="moderation-settings-column">
              <div class="section-heading">
                <div>
                  <p class="section-kicker">Rule editor</p>
                  <h3>Moderation settings</h3>
                </div>
              </div>

              <article class="feature-card editor-card">
                <label class="field">
                  <span class="field-label">Primary response</span>
                  <select v-model="selectedAction" class="field-input">
                    <option
                      v-for="action in moderationActions"
                      :key="action.key"
                      :value="action.key"
                    >
                      {{ action.title }}
                    </option>
                  </select>
                </label>

                <label class="field">
                  <span class="field-label">Cooldown (seconds)</span>
                  <input
                    v-model.number="cooldownSeconds"
                    type="number"
                    min="0"
                    class="field-input"
                  />
                </label>

                <label class="field">
                  <span class="field-label">Warning message</span>
                  <textarea
                    v-model="warningMessage"
                    rows="6"
                    class="field-input field-textarea"
                    placeholder="Write the message users should see when moderation is triggered"
                  ></textarea>
                </label>

                <div class="editor-summary">
                  <div class="summary-row">
                    <span>Primary action</span>
                    <strong>{{ selectedActionLabel }}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Total rules</span>
                    <strong>{{ moderationRules.length }}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Active rules</span>
                    <strong>{{ activeRulesCount }}</strong>
                  </div>
                </div>

                <div class="card-actions">
                  <button class="card-btn" type="button" @click="saveSettings">
                    Save Rules
                  </button>
                </div>
              </article>
            </aside>
          </section>
        </div>

        <aside class="moderation-rail">
          <div class="rail-header">
            <p class="section-kicker">Community safety</p>
            <h3>Verified bans</h3>
          </div>

          <article class="feature-card bans-rail-card">
            <div v-if="verifiedBans.length" class="bans-list">
              <div
                v-for="entry in verifiedBans"
                :key="entry.id"
                class="ban-entry"
              >
                <div class="ban-entry-top">
                  <strong>{{ entry.name }}</strong>
                  <span class="ban-status">{{ entry.status }}</span>
                </div>

                <p class="ban-reason">{{ entry.reason }}</p>
              </div>
            </div>

            <p v-else class="empty-copy">
              No verified bans are currently being shown.
            </p>
          </article>
        </aside>
      </section>

      <transition name="fade">
        <div v-if="toastMessage" class="toast">
          {{ toastMessage }}
        </div>
      </transition>
    </main>
  </div>
</template>

<script src="./TwitchModeration.js"></script>
<style scoped src="./TwitchModeration.css"></style>
