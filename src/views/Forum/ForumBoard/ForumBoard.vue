<template>
  <div class="forum-board-page" :class="boardTextSizeClass">
    <section v-if="loading" class="forum-board-empty-state">
      <h1 class="forum-board-empty-title">Loading board</h1>
      <p class="forum-board-empty-copy">
        Pulling board details and discussions from the backend now.
      </p>
    </section>

    <section
      v-else-if="loadError"
      class="forum-board-empty-state forum-board-empty-state-error"
    >
      <h1 class="forum-board-empty-title">Could not load board</h1>
      <p class="forum-board-empty-copy">
        {{ loadError }}
      </p>

      <div class="forum-board-empty-actions">
        <button class="forum-board-primary-btn" @click="fetchBoardPage" type="button">
          Try Again
        </button>
      </div>
    </section>

    <template v-else>
      <section class="forum-board-hero">
        <div class="forum-board-hero-copy">
          <p class="forum-board-kicker">Project Respawn Forums</p>
          <h1 class="forum-board-title">{{ board.name }}</h1>
          <p class="forum-board-description">
            {{ board.description }}
          </p>
        </div>

        <div class="forum-board-hero-actions">
          <div class="forum-board-text-size-toggle" aria-label="Text size controls">
            <button
              class="forum-board-size-btn"
              :class="{ 'is-active': textSize === 'default' }"
              type="button"
              @click="setTextSize('default')"
              aria-label="Default text size"
            >
              A
            </button>
            <button
              class="forum-board-size-btn"
              :class="{ 'is-active': textSize === 'large' }"
              type="button"
              @click="setTextSize('large')"
              aria-label="Large text size"
            >
              A
            </button>
            <button
              class="forum-board-size-btn"
              :class="{ 'is-active': textSize === 'xlarge' }"
              type="button"
              @click="setTextSize('xlarge')"
              aria-label="Extra large text size"
            >
              A
            </button>
          </div>

          <button
            v-if="showNewThreadButton"
            class="forum-board-primary-btn"
            @click="openCreateThread"
            :disabled="creatingThread"
            type="button"
          >
            {{ creatingThread ? 'Creating…' : 'New Thread' }}
          </button>

          <button
            v-if="featuredThreadsForBoard.length"
            class="forum-board-secondary-btn"
            @click="scrollToFeatured"
            type="button"
          >
            Featured Posts
          </button>
        </div>
      </section>

      <section
        v-if="featuredThreadsForBoard.length"
        ref="featuredSection"
        class="forum-featured-section"
      >
        <div class="forum-featured-header">
          <div>
            <p class="forum-featured-kicker">Staff Picks</p>
            <h2 class="forum-featured-heading">Featured Threads</h2>
            <p class="forum-featured-subtitle">
              Important conversations, standout ideas, and staff-picked posts from this section.
            </p>
          </div>
        </div>

        <div class="forum-featured-ticker-box">
          <div class="forum-featured-glow"></div>

          <div class="forum-featured-ticker-window" aria-label="Featured threads">
            <div class="forum-featured-ticker-track">
              <div class="forum-featured-ticker-group">
                <article
                  v-for="thread in scrollingFeaturedThreads"
                  :key="`main-${thread.renderId}`"
                  class="forum-featured-ticker-card forum-clickable-card"
                  @click="goToThread(thread.threadSlug)"
                  role="button"
                  tabindex="0"
                  @keydown.enter="goToThread(thread.threadSlug)"
                  @keydown.space.prevent="goToThread(thread.threadSlug)"
                >
                  <div class="forum-featured-card-top">
                    <span class="forum-featured-card-badge">
                      {{ thread.isPinned ? 'Pinned' : 'Featured' }}
                    </span>
                    <span class="forum-featured-card-board">{{ board.name }}</span>
                  </div>

                  <h3 class="forum-featured-card-title">{{ thread.title }}</h3>
                  <p class="forum-featured-card-excerpt">{{ thread.excerpt }}</p>

                  <div class="forum-featured-card-meta">
                    <span>{{ thread.authorUsername }}</span>
                    <span>·</span>
                    <span>{{ thread.createdAt }}</span>
                  </div>
                </article>
              </div>

              <div class="forum-featured-ticker-group" aria-hidden="true">
                <article
                  v-for="thread in scrollingFeaturedThreads"
                  :key="`clone-${thread.renderId}`"
                  class="forum-featured-ticker-card forum-clickable-card"
                  @click="goToThread(thread.threadSlug)"
                  tabindex="-1"
                >
                  <div class="forum-featured-card-top">
                    <span class="forum-featured-card-badge">
                      {{ thread.isPinned ? 'Pinned' : 'Featured' }}
                    </span>
                    <span class="forum-featured-card-board">{{ board.name }}</span>
                  </div>

                  <h3 class="forum-featured-card-title">{{ thread.title }}</h3>
                  <p class="forum-featured-card-excerpt">{{ thread.excerpt }}</p>

                  <div class="forum-featured-card-meta">
                    <span>{{ thread.authorUsername }}</span>
                    <span>·</span>
                    <span>{{ thread.createdAt }}</span>
                  </div>
                </article>
              </div>
            </div>
          </div>
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

        <section
          v-if="!board.threads.length"
          class="forum-board-empty-state forum-board-empty-state-inline"
        >
          <h3 class="forum-board-empty-title">No threads yet</h3>
          <p class="forum-board-empty-copy">
            This board is ready, but no one has started a discussion yet.
            Create the first thread to get the conversation moving.
          </p>

          <div class="forum-board-empty-actions">
            <button
              v-if="showNewThreadButton"
              class="forum-board-primary-btn"
              @click="openCreateThread"
              type="button"
            >
              Start the First Thread
            </button>
          </div>
        </section>

        <div v-else class="forum-thread-list">
          <article
            v-for="thread in board.threads"
            :key="thread.id"
            class="forum-thread-row forum-clickable-thread"
            :class="{
              'is-featured-thread': thread.isFeatured,
              'is-locked-thread': thread.isLocked,
              'is-pinned-thread': thread.isPinned
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
                  <span>{{ thread.authorUsername }}</span>
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
              <div class="forum-thread-latest-title">
                {{ thread.latestReply.title }}
              </div>
              <div class="forum-thread-latest-meta">
                {{ thread.latestReply.authorUsername }} · {{ thread.latestReply.time }}
              </div>
            </div>

            <div class="forum-thread-actions" @click.stop>
              <button
                v-if="canManageThreadFlags"
                class="forum-thread-pin-btn"
                :class="{ 'is-active': thread.isPinned }"
                @click="togglePinned(thread)"
                :disabled="isUpdatingPinned(thread)"
                type="button"
              >
                {{
                  isUpdatingPinned(thread)
                    ? 'Saving...'
                    : thread.isPinned
                      ? 'Unpin'
                      : 'Pin'
                }}
              </button>

              <label
                v-if="canManageThreadFlags"
                class="forum-thread-feature-toggle"
                :class="{ 'is-active': thread.isFeatured }"
                @click.stop
              >
                <input
                  class="forum-thread-feature-checkbox"
                  type="checkbox"
                  :checked="thread.isFeatured"
                  :disabled="isUpdatingFeatured(thread)"
                  @change="toggleFeatured(thread, $event.target.checked)"
                />
                <span class="forum-thread-feature-box" aria-hidden="true"></span>
                <span class="forum-thread-feature-label">
                  {{
                    isUpdatingFeatured(thread)
                      ? 'Saving...'
                      : 'Featured'
                  }}
                </span>
              </label>
            </div>
          </article>
        </div>
      </section>
    </template>

    <Teleport to="body">
      <section
        v-if="showJoinPrompt"
        class="forum-join-prompt-overlay"
        @click.self="closeJoinPrompt"
      >
        <div
          class="forum-join-prompt-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forum-join-prompt-title"
        >
          <button
            class="forum-join-prompt-close"
            type="button"
            aria-label="Close join prompt"
            @click="closeJoinPrompt"
          >
            ×
          </button>

          <p class="forum-thread-list-kicker">Join the conversation</p>
          <h2 id="forum-join-prompt-title" class="forum-thread-list-title">
            Want to get involved?
          </h2>
          <p class="forum-board-empty-copy">
            Create an account to start threads, reply to posts, and take part in
            the Project Respawn community.
          </p>

          <div class="forum-create-thread-actions">
            <button
              class="forum-board-primary-btn"
              type="button"
              @click="goToJoinPage"
            >
              Join Project Respawn
            </button>

            <button
              class="forum-board-secondary-btn"
              type="button"
              @click="goToSignInPage"
            >
              Sign In
            </button>

            <button
              class="forum-board-secondary-btn"
              type="button"
              @click="closeJoinPrompt"
            >
              Not Now
            </button>
          </div>
        </div>
      </section>
    </Teleport>

    <Teleport to="body">
      <section
        v-if="showCreateThreadForm && showNewThreadButton"
        class="forum-create-thread-overlay"
        @click.self="cancelCreateThread"
      >
        <div
          class="forum-create-thread-card forum-create-thread-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forum-create-thread-title"
        >
          <button
            class="forum-join-prompt-close"
            type="button"
            aria-label="Close create thread"
            @click="cancelCreateThread"
          >
            ×
          </button>

          <div class="forum-create-thread-header">
            <p class="forum-thread-list-kicker">Start Discussion</p>
            <h2 id="forum-create-thread-title" class="forum-thread-list-title">
              Create New Thread
            </h2>
          </div>

          <div class="forum-create-thread-form">
            <label class="forum-create-thread-field">
              <span class="forum-create-thread-label">Thread title</span>
              <input
                v-model.trim="newThreadForm.title"
                type="text"
                class="forum-create-thread-input"
                maxlength="120"
                placeholder="Enter a clear thread title"
              />
            </label>

            <label class="forum-create-thread-field">
              <span class="forum-create-thread-label">Opening post</span>
              <textarea
                v-model.trim="newThreadForm.content"
                class="forum-create-thread-textarea"
                rows="7"
                placeholder="Write the opening post for this discussion"
              ></textarea>
            </label>

            <label
              v-if="hasModerationAccess"
              class="forum-create-thread-checkbox"
            >
              <input v-model="newThreadForm.isFeatured" type="checkbox" />
              <span>Mark as featured</span>
            </label>

            <div v-if="createThreadError" class="forum-create-thread-error">
              {{ createThreadError }}
            </div>

            <div class="forum-create-thread-actions">
              <button
                class="forum-board-primary-btn"
                @click="submitThread"
                :disabled="creatingThread"
                type="button"
              >
                {{ creatingThread ? 'Publishing Thread…' : 'Publish Thread' }}
              </button>

              <button
                class="forum-board-secondary-btn"
                @click="cancelCreateThread"
                :disabled="creatingThread"
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </section>
    </Teleport>
  </div>
</template>

<script src="./ForumBoard.js"></script>
<style src="./ForumBoard.css"></style>