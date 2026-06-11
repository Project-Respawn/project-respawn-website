<template>
  <div class="forum-thread-page">
    <section class="forum-thread-hero">
      <div class="forum-thread-hero-copy">
        <p class="forum-thread-kicker">
          {{ thread.boardName }} · Project Respawn Forums
        </p>

        <div class="forum-thread-badge-row">
          <span
            v-if="thread.isPinned"
            class="forum-thread-hero-badge forum-thread-hero-badge-pinned"
          >
            Pinned
          </span>
          <span
            v-if="thread.isFeatured"
            class="forum-thread-hero-badge forum-thread-hero-badge-featured"
          >
            Featured
          </span>
          <span
            v-if="thread.isLocked"
            class="forum-thread-hero-badge forum-thread-hero-badge-locked"
          >
            Locked
          </span>
        </div>

        <h1 class="forum-thread-hero-title">{{ thread.title }}</h1>

        <p class="forum-thread-hero-description">
          {{ thread.excerpt }}
        </p>
      </div>

      <div class="forum-thread-hero-actions">
        <button class="forum-thread-primary-btn">Reply</button>
        <button class="forum-thread-secondary-btn">Follow Thread</button>
      </div>
    </section>

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
            <button class="forum-post-action">Reply</button>
            <button class="forum-post-action">Quote</button>
            <button class="forum-post-action">Report</button>
          </div>
        </div>
      </article>
    </section>

    <section class="forum-reply-box-section">
      <div class="forum-reply-box-header">
        <div>
          <p class="forum-reply-kicker">Join Discussion</p>
          <h2 class="forum-reply-title">Write a Reply</h2>
        </div>
      </div>

      <div class="forum-reply-box">
        <input
          type="text"
          class="forum-reply-input forum-reply-input-title"
          placeholder="Optional reply title"
        />

        <textarea
          class="forum-reply-textarea"
          rows="7"
          placeholder="Share your reply, suggestion, or feedback here..."
        ></textarea>

        <div class="forum-reply-actions">
          <button class="forum-thread-secondary-btn">Preview</button>
          <button class="forum-thread-primary-btn">Post Reply</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script src="./ForumThread.js"></script>
<style src="./ForumThread.css"></style>