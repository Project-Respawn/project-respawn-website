<template>
  <div class="forum-board-page">
    <section class="forum-board-hero">
      <div class="forum-board-hero-copy">
        <p class="forum-board-kicker">Project Respawn Forums</p>
        <h1 class="forum-board-title">{{ board.name }}</h1>
        <p class="forum-board-description">
          {{ board.description }}
        </p>
      </div>

      <div class="forum-board-hero-actions">
        <button class="forum-board-primary-btn">New Thread</button>
        <button class="forum-board-secondary-btn">Board Activity</button>
      </div>
    </section>

    <section class="forum-board-topbar">
      <div class="forum-board-topbar-stat">
        <span class="forum-board-topbar-value">{{ board.threadCount }}</span>
        <span class="forum-board-topbar-label">Threads</span>
      </div>
      <div class="forum-board-topbar-stat">
        <span class="forum-board-topbar-value">{{ board.postCount }}</span>
        <span class="forum-board-topbar-label">Posts</span>
      </div>
      <div class="forum-board-topbar-stat">
        <span class="forum-board-topbar-value">{{ board.watchers }}</span>
        <span class="forum-board-topbar-label">Watching</span>
      </div>
      <div class="forum-board-topbar-stat">
        <span class="forum-board-topbar-value">{{ board.sortLabel }}</span>
        <span class="forum-board-topbar-label">Sort</span>
      </div>
    </section>

    <section class="forum-board-info-card">
      <div class="forum-board-info-copy">
        <h2 class="forum-board-info-title">Board Focus</h2>
        <p class="forum-board-info-text">
          {{ board.rules }}
        </p>
      </div>

      <div class="forum-board-info-tags">
        <span
          v-for="tag in board.tags"
          :key="tag"
          class="forum-board-info-tag"
        >
          {{ tag }}
        </span>
      </div>
    </section>

    <section class="forum-thread-list-section">
      <div class="forum-thread-list-header">
        <div>
          <p class="forum-thread-list-kicker">Board Threads</p>
          <h2 class="forum-thread-list-title">Current Discussions</h2>
        </div>
      </div>

      <div class="forum-thread-list">
        <article
          v-for="thread in board.threads"
          :key="thread.id"
          class="forum-thread-row forum-clickable-thread"
          :class="{
            'is-featured-thread': thread.isFeatured,
            'is-locked-thread': thread.isLocked
          }"
          @click="goToThread(thread.threadSlug)"
          role="button"
          tabindex="0"
          @keydown.enter="goToThread(thread.threadSlug)"
          @keydown.space.prevent="goToThread(thread.threadSlug)"
        >
          <div class="forum-thread-main">
            <div class="forum-thread-status-icon">
              <span v-if="thread.isPinned">📌</span>
              <span v-else-if="thread.isLocked">🔒</span>
              <span v-else-if="thread.isFeatured">⭐</span>
              <span v-else>💬</span>
            </div>

            <div class="forum-thread-content">
              <div class="forum-thread-badges">
                <span
                  v-if="thread.isPinned"
                  class="forum-thread-badge forum-thread-badge-pinned"
                >
                  Pinned
                </span>
                <span
                  v-if="thread.isFeatured"
                  class="forum-thread-badge forum-thread-badge-featured"
                >
                  Featured
                </span>
                <span
                  v-if="thread.isLocked"
                  class="forum-thread-badge forum-thread-badge-locked"
                >
                  Locked
                </span>
              </div>

              <h3 class="forum-thread-title">{{ thread.title }}</h3>
              <p class="forum-thread-excerpt">{{ thread.excerpt }}</p>

              <div class="forum-thread-meta">
                <span>{{ thread.author }}</span>
                <span>·</span>
                <span>{{ thread.createdAt }}</span>
              </div>
            </div>
          </div>

          <div class="forum-thread-stats">
            <div class="forum-thread-stat">
              <span class="forum-thread-stat-value">{{ thread.replies }}</span>
              <span class="forum-thread-stat-label">Replies</span>
            </div>
            <div class="forum-thread-stat">
              <span class="forum-thread-stat-value">{{ thread.views }}</span>
              <span class="forum-thread-stat-label">Views</span>
            </div>
          </div>

          <div class="forum-thread-latest">
            <div class="forum-thread-latest-label">Latest Reply</div>
            <div class="forum-thread-latest-title">{{ thread.latestReply.title }}</div>
            <div class="forum-thread-latest-meta">
              {{ thread.latestReply.author }} · {{ thread.latestReply.time }}
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script src="./ForumBoard.js"></script>
<style src="./ForumBoard.css"></style>