<template>
  <div class="forum-thread-page">
    <!-- ==========================================================
         1. Loading state
         ========================================================== -->
    <section v-if="loading" class="forum-thread-empty-state">
      <h1 class="forum-thread-empty-title">Loading thread</h1>
      <p class="forum-thread-empty-copy">
        Pulling the discussion and replies from the backend now.
      </p>
    </section>

    <!-- ==========================================================
         2. Error state
         ========================================================== -->
    <section
      v-else-if="loadError"
      class="forum-thread-empty-state forum-thread-empty-state-error"
    >
      <h1 class="forum-thread-empty-title">Could not load thread</h1>
      <p class="forum-thread-empty-copy">
        {{ loadError }}
      </p>

      <div class="forum-thread-empty-actions">
        <button
          class="forum-thread-primary-btn"
          type="button"
          @click="fetchThreadPage"
        >
          Try Again
        </button>
      </div>
    </section>

    <template v-else>
      <!-- ==========================================================
           3. Thread hero
           ========================================================== -->
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
              type="button"
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
              type="button"
              @click="deleteThread"
              :disabled="deletingThread || updatingThreadLock"
            >
              {{ deletingThread ? 'Deleting Thread…' : 'Delete Thread' }}
            </button>
          </div>
        </div>
      </section>

      <!-- ==========================================================
           4. Thread stats bar
           ========================================================== -->
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

      <!-- ==========================================================
           5. Posts list
           ========================================================== -->
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

            <h2 class="forum-post-author-name">
              {{ post.author || 'Member' }}
            </h2>

            <p class="forum-post-author-role">
              {{ post.role || 'Member' }}
            </p>

            <div class="forum-post-author-stats">
              <div class="forum-post-author-stat">
                <span class="forum-post-author-stat-value">
                  {{ post.joined || 'Recently' }}
                </span>
                <span class="forum-post-author-stat-label">Joined</span>
              </div>

              <div class="forum-post-author-stat">
                <span class="forum-post-author-stat-value">
                  {{ post.postCount ?? 0 }}
                </span>
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

            <div
              class="forum-post-body"
              v-if="!post.isEditing"
            >
              <p
                v-for="(paragraph, index) in post.content"
                :key="`${post.id}-${index}`"
              >
                {{ paragraph }}
              </p>
            </div>

            <div
              v-else
              class="forum-post-edit-box"
            >
              <textarea
                v-model.trim="editForm.content"
                class="forum-reply-textarea forum-post-edit-textarea"
                rows="6"
                placeholder="Edit your post..."
              ></textarea>

              <div class="forum-reply-actions">
                <button
                  class="forum-thread-secondary-btn"
                  type="button"
                  @click="cancelEditingPost"
                  :disabled="savingEditPostId === post.id"
                >
                  Cancel
                </button>

                <button
                  class="forum-thread-primary-btn"
                  type="button"
                  @click="saveEditedPost(post.raw)"
                  :disabled="savingEditPostId === post.id"
                >
                  {{
                    savingEditPostId === post.id
                      ? 'Saving…'
                      : 'Save Changes'
                  }}
                </button>
              </div>
            </div>

            <div class="forum-post-footer">
              <button
                class="forum-post-action"
                type="button"
                @click="openReplyBox"
                :disabled="thread.isLocked"
              >
                Reply
              </button>

              <button
                class="forum-post-action"
                type="button"
                @click="quotePost(post)"
                :disabled="thread.isLocked"
              >
                Quote
              </button>

              <button
                class="forum-post-action"
                type="button"
              >
                Report
              </button>

              <button
                v-if="post.canEdit"
                class="forum-post-action"
                type="button"
                @click="startEditingPost(post.raw)"
                :disabled="editingPostId === post.id || deletingPostId === post.id"
              >
                Edit
              </button>

              <button
                v-if="canDeletePost(post)"
                class="forum-post-action forum-post-action-danger"
                type="button"
                @click="deletePost(post)"
                :disabled="deletingPostId === post.id"
              >
                {{ deletingPostId === post.id ? 'Deleting…' : 'Delete' }}
              </button>
            </div>
          </div>
        </article>
      </section>

      <!-- ==========================================================
           6. Locked notice
           ========================================================== -->
      <section
        v-if="thread.isLocked"
        class="forum-thread-empty-state forum-thread-empty-state-inline"
      >
        <h2 class="forum-thread-empty-title">This thread is locked</h2>
        <p class="forum-thread-empty-copy">
          Replies are currently disabled for this discussion.
        </p>
      </section>

      <!-- ==========================================================
           7. Signed-in quick reply
           ========================================================== -->
      <section
        v-else-if="isSignedIn"
        ref="replySection"
        class="forum-reply-box-section"
      >
        <div class="forum-reply-box-header">
          <div>
            <p class="forum-reply-kicker">Join Discussion</p>
            <h2 class="forum-reply-title">Quick Reply</h2>
          </div>
        </div>

        <div class="forum-reply-box forum-reply-box-compact">
          <input
            v-model.trim="replyForm.title"
            type="text"
            class="forum-reply-input forum-reply-input-title"
            placeholder="Optional reply title"
          />

          <textarea
            v-model.trim="replyForm.content"
            class="forum-reply-textarea forum-reply-textarea-compact"
            rows="4"
            placeholder="Write a quick reply..."
          ></textarea>

          <div v-if="replyError" class="forum-reply-error">
            {{ replyError }}
          </div>

          <div class="forum-reply-actions">
            <button
              class="forum-thread-secondary-btn"
              type="button"
              @click="previewReply"
              :disabled="postingReply"
            >
              Preview
            </button>

            <button
              class="forum-thread-secondary-btn"
              type="button"
              @click="openExpandedReply"
              :disabled="postingReply"
            >
              Expand Reply
            </button>

            <button
              class="forum-thread-primary-btn"
              type="button"
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

      <!-- ==========================================================
           8. Logged-out reply CTA
           ========================================================== -->
      <section
        v-else
        class="forum-thread-empty-state forum-thread-empty-state-inline forum-thread-signin-cta"
      >
        <h2 class="forum-thread-empty-title">Want to reply?</h2>
        <p class="forum-thread-empty-copy">
          Sign in or create an account to join this discussion, reply to posts,
          and quote other members.
        </p>

        <div class="forum-thread-empty-actions">
          <button
            class="forum-thread-primary-btn"
            type="button"
            @click="openReplyBox"
          >
            Reply to Thread
          </button>
        </div>
      </section>
    </template>

    <!-- ==========================================================
         9. Join prompt modal
         ========================================================== -->
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

          <p class="forum-reply-kicker">Join the conversation</p>
          <h2 id="forum-join-prompt-title" class="forum-reply-title">
            Want to get involved?
          </h2>
          <p class="forum-thread-empty-copy">
            Create an account or sign in to reply, quote posts, and take part in
            the Project Respawn community.
          </p>

          <div class="forum-reply-actions">
            <button
              class="forum-thread-primary-btn"
              type="button"
              @click="goToJoinPage"
            >
              Join Project Respawn
            </button>

            <button
              class="forum-thread-secondary-btn"
              type="button"
              @click="goToSignInPage"
            >
              Sign In
            </button>

            <button
              class="forum-thread-secondary-btn"
              type="button"
              @click="closeJoinPrompt"
            >
              Not Now
            </button>
          </div>
        </div>
      </section>
    </Teleport>

    <!-- ==========================================================
         10. Expanded reply modal
         ========================================================== -->
    <Teleport to="body">
      <section
        v-if="showExpandedReply && isSignedIn && !thread.isLocked"
        class="forum-reply-expand-overlay"
        @click.self="closeExpandedReply"
      >
        <div
          class="forum-reply-expand-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forum-expanded-reply-title"
        >
          <button
            class="forum-join-prompt-close"
            type="button"
            aria-label="Close expanded reply"
            @click="closeExpandedReply"
          >
            ×
          </button>

          <div class="forum-reply-box-header forum-reply-expand-header">
            <div>
              <p class="forum-reply-kicker">Long-form reply</p>
              <h2 id="forum-expanded-reply-title" class="forum-reply-title">
                Expanded Reply
              </h2>
            </div>
          </div>

          <div class="forum-reply-box forum-reply-box-expanded">
            <input
              v-model.trim="replyForm.title"
              type="text"
              class="forum-reply-input forum-reply-input-title"
              placeholder="Optional reply title"
            />

            <textarea
              v-model.trim="replyForm.content"
              class="forum-reply-textarea forum-reply-textarea-expanded"
              rows="12"
              placeholder="Write a longer reply with more detail..."
            ></textarea>

            <div v-if="replyError" class="forum-reply-error">
              {{ replyError }}
            </div>

            <div class="forum-reply-actions">
              <button
                class="forum-thread-secondary-btn"
                type="button"
                @click="previewReply"
                :disabled="postingReply"
              >
                Preview
              </button>

              <button
                class="forum-thread-secondary-btn"
                type="button"
                @click="closeExpandedReply"
                :disabled="postingReply"
              >
                Back to Quick Reply
              </button>

              <button
                class="forum-thread-primary-btn"
                type="button"
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
                  :key="`expanded-preview-${index}`"
                >
                  {{ paragraph }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Teleport>
  </div>
</template>

<script src="./ForumThread.js"></script>
<style src="./ForumThread.css"></style>