<template>
  <section class="user-homepage">
    <div class="user-homepage-shell">
      <header class="user-homepage-hero">
        <div class="user-homepage-hero-copy">
          <div class="user-homepage-status-row">
            <span class="user-homepage-status-badge">In Progress Layout not final</span>
          </div>

          <p class="user-homepage-kicker">Signed-in home</p>
          <h1 class="user-homepage-title">
            Welcome back<span v-if="displayLabel">, {{ displayLabel }}</span>
          </h1>
          <p class="user-homepage-subtitle">
            Your central hub for community activity, profile progress, and the latest updates across Project Respawn.
          </p>
        </div>

<div class="user-homepage-hero-actions">
  <router-link class="user-homepage-btn user-homepage-btn-primary" to="/forum">
    Go to forums
  </router-link>
  <router-link class="user-homepage-btn user-homepage-btn-secondary" to="/account">
    Edit profile
  </router-link>

  <!-- New sign-out button we’ll wire up -->
  <button
    class="user-homepage-btn user-homepage-btn-secondary user-homepage-btn-danger"
    @click="handleSignOut"
    type="button"
  >
    Sign out
  </button>
</div>
      </header>

      <nav class="user-homepage-topnav" aria-label="User homepage navigation">
        <router-link
          v-for="item in topNavItems"
          :key="item.label"
          :to="item.to"
          class="user-homepage-topnav-item"
        >
          <span class="user-homepage-topnav-label">{{ item.label }}</span>
          <span v-if="item.comingSoon" class="user-homepage-topnav-badge">Soon</span>
        </router-link>
      </nav>

      <div class="user-homepage-layout">
        <main class="user-homepage-main">
          <section class="user-homepage-card user-homepage-card-featured">
            <div class="user-homepage-card-header">
              <div>
                <p class="user-homepage-card-kicker">Community focus</p>
                <h2 class="user-homepage-card-title">Forum highlights</h2>
              </div>
              <router-link class="user-homepage-inline-link" to="/forum">
                View all
              </router-link>
            </div>

            <div class="user-homepage-forum-grid">
              <article
                v-for="item in forumHighlights"
                :key="item.title"
                class="user-homepage-forum-card"
              >
                <p class="user-homepage-forum-card-label">{{ item.label }}</p>
                <h3 class="user-homepage-forum-card-title">{{ item.title }}</h3>
                <p class="user-homepage-forum-card-text">{{ item.description }}</p>
                <router-link class="user-homepage-inline-link" :to="item.to">
                  Open section
                </router-link>
              </article>
            </div>
          </section>

          <section class="user-homepage-card">
            <div class="user-homepage-card-header">
              <div>
                <p class="user-homepage-card-kicker">Getting started</p>
                <h2 class="user-homepage-card-title">Quick actions</h2>
              </div>
            </div>

            <div class="user-homepage-action-grid">
              <router-link
                v-for="action in quickActions"
                :key="action.title"
                :to="action.to"
                class="user-homepage-action-card"
              >
                <span class="user-homepage-action-icon">{{ action.icon }}</span>
                <div>
                  <h3 class="user-homepage-action-title">{{ action.title }}</h3>
                  <p class="user-homepage-action-text">{{ action.description }}</p>
                </div>
              </router-link>
            </div>
          </section>

          <section class="user-homepage-card">
            <div class="user-homepage-card-header">
              <div>
                <p class="user-homepage-card-kicker">Platform roadmap</p>
                <h2 class="user-homepage-card-title">Coming next</h2>
              </div>
            </div>

            <div class="user-homepage-roadmap-list">
              <article
                v-for="item in roadmapItems"
                :key="item.title"
                class="user-homepage-roadmap-item"
              >
                <div class="user-homepage-roadmap-dot" aria-hidden="true"></div>
                <div>
                  <h3 class="user-homepage-roadmap-title">{{ item.title }}</h3>
                  <p class="user-homepage-roadmap-text">{{ item.description }}</p>
                </div>
              </article>
            </div>
          </section>
        </main>

        <aside class="user-homepage-sidebar">
          <section class="user-homepage-card">
            <div class="user-homepage-card-header">
              <div>
                <p class="user-homepage-card-kicker">Your account</p>
                <h2 class="user-homepage-card-title">Profile status</h2>
              </div>
            </div>

            <div class="user-homepage-profile-summary">
              <div class="user-homepage-profile-avatar">
                {{ profileInitials }}
              </div>

              <div class="user-homepage-profile-copy">
                <p class="user-homepage-profile-name">{{ displayLabel || 'Member' }}</p>
                <p class="user-homepage-profile-text">
                  Keep your profile updated so future community features, suggestions, and visibility settings feel more personal.
                </p>
              </div>
            </div>

            <div class="user-homepage-progress-block">
              <div class="user-homepage-progress-meta">
                <span>Profile completion</span>
                <strong>{{ profileCompletion }}%</strong>
              </div>
              <div class="user-homepage-progress-bar">
                <span :style="{ width: `${profileCompletion}%` }"></span>
              </div>
            </div>

            <router-link class="user-homepage-btn user-homepage-btn-secondary user-homepage-btn-full" to="/account">
              Manage profile
            </router-link>
          </section>

          <section class="user-homepage-card">
            <div class="user-homepage-card-header">
              <div>
                <p class="user-homepage-card-kicker">Current focus</p>
                <h2 class="user-homepage-card-title">Quest area</h2>
              </div>
            </div>

            <div class="user-homepage-placeholder">
              <p class="user-homepage-placeholder-title">Quest system coming soon</p>
              <p class="user-homepage-placeholder-text">
                This area will later show active quests, streaks, rewards, and creature-linked progression.
              </p>
            </div>
          </section>

          <section class="user-homepage-card">
            <div class="user-homepage-card-header">
              <div>
                <p class="user-homepage-card-kicker">Suggested places</p>
                <h2 class="user-homepage-card-title">Explore next</h2>
              </div>
            </div>

            <div class="user-homepage-link-list">
              <router-link
                v-for="item in exploreLinks"
                :key="item.label"
                :to="item.to"
                class="user-homepage-list-link"
              >
                <span>{{ item.label }}</span>
                <span class="user-homepage-list-arrow">→</span>
              </router-link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  </section>
</template>

<script src="./UserHomepage.js"></script>
<style src="./UserHomepage.css"></style>