<template>
  <div class="forum-index-page">
    <section class="forum-hero">
      <div class="forum-hero-copy">
        <span class="forum-kicker">Project Respawn Community</span>
        <h1 class="forum-title">Forums</h1>
        <p class="forum-subtitle">
          Help shape Project Respawn through feedback, creator discussion, IRL progress,
          and app development conversations.
        </p>
      </div>

      <div class="forum-hero-actions">
        <button class="forum-primary-btn" @click="scrollToCategories">Latest Boards</button>
        <button class="forum-secondary-btn" @click="scrollToFeatured">Featured Posts</button>
      </div>
    </section>

    <section ref="featuredSection" class="forum-featured-section">
      <div class="forum-featured-header">
        <div>
          <p class="forum-featured-kicker">Staff Picks</p>
          <h2 class="forum-featured-heading">Featured Threads</h2>
          <p class="forum-featured-subtitle">
            Important conversations, community wins, and standout ideas selected by staff.
          </p>
        </div>
      </div>

      <div class="forum-featured-ticker-box">
        <div class="forum-featured-glow"></div>

        <div class="forum-featured-ticker-window">
          <div class="forum-featured-ticker-track">
            <article
              v-for="thread in scrollingFeaturedThreads"
              :key="thread.renderId"
              class="forum-featured-ticker-card forum-clickable-card"
              @click="goToThread(thread.threadSlug)"
              role="button"
              tabindex="0"
              @keydown.enter="goToThread(thread.threadSlug)"
              @keydown.space.prevent="goToThread(thread.threadSlug)"
            >
              <div class="forum-featured-card-top">
                <span class="forum-featured-card-badge">Featured</span>
                <span class="forum-featured-card-board">{{ thread.board }}</span>
              </div>

              <h3 class="forum-featured-card-title">{{ thread.title }}</h3>
              <p class="forum-featured-card-excerpt">{{ thread.excerpt }}</p>

              <div class="forum-featured-card-meta">
                <span>{{ thread.author }}</span>
                <span>·</span>
                <span>{{ thread.time }}</span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="forum-overview-bar">
      <div class="forum-stat">
        <span class="forum-stat-value">{{ totalBoards }}</span>
        <span class="forum-stat-label">Boards</span>
      </div>
      <div class="forum-stat">
        <span class="forum-stat-value">{{ totalThreads }}</span>
        <span class="forum-stat-label">Threads</span>
      </div>
      <div class="forum-stat">
        <span class="forum-stat-value">{{ totalPosts }}</span>
        <span class="forum-stat-label">Posts</span>
      </div>
      <div class="forum-stat">
        <span class="forum-stat-value">{{ latestActivityLabel }}</span>
        <span class="forum-stat-label">Latest activity</span>
      </div>
    </section>

    <section
      v-for="category in forumCategories"
      :key="category.id"
      class="forum-category-section"
      :ref="category.id === forumCategories[0].id ? 'categoriesSection' : null"
    >
      <div class="forum-category-header">
        <div>
          <h2 class="forum-category-title">{{ category.name }}</h2>
          <p class="forum-category-description">{{ category.description }}</p>
        </div>
      </div>

      <div class="forum-board-list">
        <article
          v-for="board in category.boards"
          :key="board.id"
          class="forum-board-row forum-clickable-card"
          @click="goToBoard(board.id)"
          role="button"
          tabindex="0"
          @keydown.enter="goToBoard(board.id)"
          @keydown.space.prevent="goToBoard(board.id)"
        >
          <div class="forum-board-main">
            <div class="forum-board-icon">
              <span>{{ board.icon }}</span>
            </div>

            <div class="forum-board-content">
              <h3 class="forum-board-title">{{ board.name }}</h3>
              <p class="forum-board-description">{{ board.description }}</p>

              <div class="forum-board-tags" v-if="board.tags?.length">
                <span
                  v-for="tag in board.tags"
                  :key="tag"
                  class="forum-board-tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <div class="forum-board-stats">
            <div class="forum-board-stat">
              <span class="forum-board-stat-value">{{ board.threadCount }}</span>
              <span class="forum-board-stat-label">Threads</span>
            </div>
            <div class="forum-board-stat">
              <span class="forum-board-stat-value">{{ board.postCount }}</span>
              <span class="forum-board-stat-label">Posts</span>
            </div>
          </div>

          <div class="forum-board-latest">
            <div class="forum-board-latest-label">Latest</div>
            <div class="forum-board-latest-title">{{ board.latestPost.title }}</div>
            <div class="forum-board-latest-meta">
              {{ board.latestPost.author }} · {{ board.latestPost.time }}
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script src="./ForumIndex.js"></script>
<style src="./ForumIndex.css"></style>