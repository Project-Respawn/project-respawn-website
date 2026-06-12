<template>
  <div class="forum-thread-page">
    <!-- 1. Loading -->
    <section v-if="loading" class="forum-thread-empty-state">
      <h1 class="forum-thread-empty-title">Loading thread</h1>
      <p class="forum-thread-empty-copy">
        Pulling the discussion and replies from the backend now.
      </p>
    </section>

    <!-- 2. Error -->
    <section
      v-else-if="loadError"
      class="forum-thread-empty-state forum-thread-empty-state-error"
    >
      <h1 class="forum-thread-empty-title">Could not load thread</h1>
      <p class="forum-thread-empty-copy">
        {{ loadError }}
      </p>

      <div class="forum-thread-empty-actions">
        <button class="forum-thread-primary-btn" @click="fetchThreadPage">
          Try Again
        </button>
      </div>
    </section>

    <!-- 3. Thread page -->
    <template v-else>
      <!-- 3a. Thread header -->
      <section class="forum-thread-hero">
        <div class="forum-thread-hero-copy">
          <p class="forum-thread-kicker">Community Hub</p>
          <h1 class="forum-thread-hero-title">{{ thread.title }}</h1>
        </div>

        <div class="forum-thread-hero-header">
          <div class="forum-thread-hero-actions">
            <button
              v-if="hasModerationAccess()"
              class="forum-thread-secondary-btn forum-thread-lock-btn"
              @click="toggleThreadLock"
              :disabled="deletingThread || updatingThreadLock"
            >
              {{
                updatingThreadLock
                  ? (thread.isLocked ? 'Unlocking…' : 'Locking…')
                  : (thread.isLocked ? 'Unlock Thread' : 'Lock Thread')
              }}
            </button>

            <button
              v-if="canDeleteThread()"
              class="forum-thread-secondary-btn forum-thread-danger-btn"
              @click="deleteThread"
              :disabled="deletingThread || updatingThreadLock"
            >
              {{ deletingThread ? 'Deleting Thread…' : 'Delete Thread' }}
            </button>
          </div>
        </div>
      </section>

      <!-- 3b. Thread stats -->
      <section class="forum-thread-topbar">
        <div class="forum-thread-topbar-stat">
          <span class="forum-thread-topbar-value">{{ thread.replyCount }}</span>
          <span class="forum-thread-topbar-label">Replies</span>
        </div>

        <div class="forum-thread-topbar-stat">
          <span class="forum-thread-topbar-value">{{ thread.viewCount }}</span>
          <span class="forum-thread-topbar-label">Views</span>
        </div>

        <div class="forum-thread-topbar-stat">
          <span class="forum-thread-topbar-value">{{ thread.participantCount }}</span>
          <span class="forum-thread-topbar-label">Participants</span>
        </div>

        <div class="forum-thread-topbar-stat">
          <span class="forum-thread-topbar-value">{{ thread.lastActivity }}</span>
          <span class="forum-thread-topbar-label">Last Activity</span>
        </div>
      </section>

      <!-- 3c. Posts -->
      <section class="forum-thread-posts-section">
        <article
          v-for="post in thread.posts"
          :key="post.id"
          class="forum-post-card"
          :class="{ 'is-staff-post': post.isStaff }"
        >
          <aside class="forum-post-author">
            <div class="forum-post-avatar">
              {{ post.avatar }}
            </div>

            <h2 class="forum-post-author-name">{{ post.author }}</h2>

            <p class="forum-post-author-role">
              {{ post.role }}
            </p>

            <div class="forum-post-author-stats">
              <div class="forum-post-author-stat">
                <span class="forum-post-author-stat-value">{{ post.joined }}</span>
                <span class="forum-post-author-stat-label">Joined</span>
              </div>

              <div class="forum-post-author-stat">
                <span class="forum-post-author-stat-value">{{ post.postCount }}</span>
                <span class="forum-post-author-stat-label">Posts</span>
              </div>
            </div>
          </aside>

          <div class="forum-post-content">
            <div class="forum-post-meta">
              <span class="forum-post-meta-time">{{ post.postedAt }}</span>

              <span
                v-if="post.isOriginalPost"
                class="forum-post-meta-pill"
              >
                Original Post
              </span>

              <span
                v-if="post.isStaff"
                class="forum-post-meta-pill forum-post-meta-pill-staff"
              >
                Staff
              </span>
            </div>

            <div class="forum-post-body">
              <p
                v-for="(paragraph, index) in post.content"
                :key="`${post.id}-${index}`"
              >
                {{ paragraph }}
              </p>
            </div>

            <div class="forum-post-footer">
              <button
                class="forum-post-action"
                @click="quotePost(post)"
                :disabled="thread.isLocked"
              >
                Reply
              </button>

              <button
                class="forum-post-action"
                @click="quotePost(post)"
                :disabled="thread.isLocked"
              >
                Quote
              </button>

              <button class="forum-post-action">
                Report
              </button>

              <button
                v-if="canDeletePost(post)"
                class="forum-post-action forum-post-action-danger"
                @click="deletePost(post)"
                :disabled="deletingPostId === post.id"
              >
                {{ deletingPostId === post.id ? 'Deleting…' : 'Delete' }}
              </button>
            </div>
          </div>
        </article>
      </section>

      <!-- 3d. Locked state -->
      <section
        v-if="thread.isLocked"
        class="forum-thread-empty-state forum-thread-empty-state-inline"
      >
        <h2 class="forum-thread-empty-title">This thread is locked</h2>
        <p class="forum-thread-empty-copy">
          Replies are currently disabled for this discussion.
        </p>
      </section>

      <!-- 3e. Reply form -->
      <section
        v-else
        ref="replySection"
        class="forum-reply-box-section"
      >
        <div class="forum-reply-box-header">
          <div>
            <p class="forum-reply-kicker">Join Discussion</p>
            <h2 class="forum-reply-title">Write a Reply</h2>
          </div>
        </div>

        <div class="forum-reply-box">
          <input
            v-model.trim="replyForm.title"
            type="text"
            class="forum-reply-input forum-reply-input-title"
            placeholder="Optional reply title"
          />

          <textarea
            v-model.trim="replyForm.content"
            class="forum-reply-textarea"
            rows="7"
            placeholder="Share your reply, suggestion, or feedback here..."
          ></textarea>

          <div v-if="replyError" class="forum-reply-error">
            {{ replyError }}
          </div>

          <div class="forum-reply-actions">
            <button
              class="forum-thread-secondary-btn"
              @click="previewReply"
              :disabled="postingReply"
            >
              Preview
            </button>

            <button
              class="forum-thread-primary-btn"
              @click="submitReply"
              :disabled="postingReply"
            >
              {{ postingReply ? 'Posting Reply…' : 'Post Reply' }}
            </button>
          </div>

          <div
            v-if="replyPreview"
            class="forum-reply-preview"
          >
            <p class="forum-reply-kicker">Preview</p>

            <div class="forum-post-body">
              <p
                v-for="(paragraph, index) in replyPreviewParagraphs"
                :key="`preview-${index}`"
              >
                {{ paragraph }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script src="./ForumThread.js"></script>
<style src="./ForumThread.css"></style>