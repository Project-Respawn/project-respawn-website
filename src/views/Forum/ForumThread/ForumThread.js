// ============================================================
// ForumThread
// ============================================================
// File map
// 1. Imports + clients
// 2. Constants + helpers (pure functions)
// 3. Component meta (name, props)
// 4. State (data)
// 5. Computed properties
// 6. Lifecycle hooks
// 7. Auth + identity helpers
// 8. Permissions + moderation helpers
// 9. Thread data loading + analytics
// 10. Reply interactions (quote, preview, submit, scroll)
// 11. Display helpers (roles, counts, formatting)
// 12. Watchers
// ============================================================


// 1. Imports + clients
// ------------------------------------------------------------

import { generateClient } from 'aws-amplify/data';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

const userPoolClient = generateClient(); // authenticated reads/writes
const publicClient = generateClient({ authMode: 'apiKey' }); // guest reads


// 2. Constants + helpers (pure functions)
// ------------------------------------------------------------

const DEFAULT_THREAD = {
  id: 'default-thread',
  dbId: '',
  boardSlug: 'community-board',
  boardName: 'Community Board',
  title: 'Community Discussion',
  excerpt: 'General community discussion for Project Respawn.',
  isPinned: false,
  isFeatured: false,
  isLocked: false,
  replyCount: 0,
  viewCount: 0,
  participantCount: 0,
  lastActivity: 'No activity',
  posts: [],
};

function sortByNewest(items = []) {
  return [...items].sort((a, b) => {
    const aDate = new Date(
      a.editedAt || a.updatedAt || a.createdAt || 0,
    ).getTime();
    const bDate = new Date(
      b.editedAt || b.updatedAt || b.createdAt || 0,
    ).getTime();
    return aDate - bDate;
  });
}

function splitParagraphs(value = '') {
  return value
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normaliseGroupName(value = '') {
  return String(value).trim().toLowerCase();
}


// 3. Component meta (name, props)
// ------------------------------------------------------------

export default {
  name: 'ForumThread',

  props: {
    threadSlug: {
      type: String,
      default: '',
    },
  },


  // 4. State (data)
  // ----------------------------------------------------------

  data() {
    return {
      // loading + errors
      loading: true,
      loadError: '',
      replyError: '',

      // async flags
      postingReply: false,
      deletingPostId: '',
      deletingThread: false,
      updatingThreadLock: false,

      // auth + identity
      isSignedIn: false,
      currentUserId: '',
      currentUsername: '',
      currentUserGroups: [],

      // join prompt (for logged-out reply)
      showJoinPrompt: false,
      joinPageUrl: '/join',
      signInPageUrl: '/login',

      // thread data
      threadRecord: null,
      boardRecord: null,
      threadPosts: [],

      // reply form state
      replyPreview: false,
      replyForm: {
        title: '',
        content: '',
      },
    };
  },


  // 5. Computed properties
  // ----------------------------------------------------------

  computed: {
    mappedPosts() {
      const orderedPosts = sortByNewest(this.threadPosts);

      return orderedPosts.map((post, index) => {
        const authorName =
          this.normaliseAuthorDisplayName(post.authorDisplayName) || 'Member';
        const initials = authorName.trim().charAt(0).toUpperCase() || 'M';

        return {
          id: post.id,
          authorUserId: post.authorUserId,
          author: authorName,
          avatar: initials,
          role: this.getAuthorRole(authorName),
          joined: 'Jun 2026',
          postCount: this.getAuthorPostCount(post.authorUserId),
          postedAt: this.formatRelativeTime(
            post.editedAt || post.updatedAt || post.createdAt,
          ),
          isOriginalPost: index === 0,
          isStaff: this.isStaffAuthor(authorName),
          content: splitParagraphs(post.content),
        };
      });
    },

    thread() {
      if (!this.threadRecord) {
        return DEFAULT_THREAD;
      }

      const participants = new Set(
        this.threadPosts.map(
          (post) =>
            post.authorUserId ||
            this.normaliseAuthorDisplayName(post.authorDisplayName),
        ),
      );

      return {
        id: this.threadRecord.slug,
        dbId: this.threadRecord.id,
        boardSlug: this.boardRecord?.slug || 'community-board',
        boardName: this.boardRecord?.name || 'Community Board',
        title: this.threadRecord.title,
        excerpt:
          this.threadRecord.contentPreview ||
          'Join the discussion and add your perspective.',
        isPinned: this.threadRecord.isPinned === true,
        isFeatured: this.threadRecord.isFeatured === true,
        isLocked: this.threadRecord.isLocked === true,
        replyCount: Math.max(this.threadPosts.length - 1, 0),
        viewCount: this.threadRecord.viewCount || 0,
        participantCount: participants.size,
        lastActivity: this.formatRelativeTime(
          this.threadRecord.lastReplyAt ||
            this.threadRecord.updatedAt ||
            this.threadRecord.createdAt,
        ),
        posts: this.mappedPosts,
      };
    },

    replyPreviewParagraphs() {
      return splitParagraphs(this.replyForm.content);
    },
  },


  // 6. Lifecycle hooks
  // ----------------------------------------------------------

  async mounted() {
    await this.loadCurrentUser();
    await this.fetchThreadPage();
  },


  // 7. Auth + identity helpers
  // ----------------------------------------------------------

  methods: {
    looksLikeCognitoId(value = '') {
      return (
        typeof value === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          value,
        )
      );
    },

    normaliseAuthorDisplayName(value = '') {
      if (!value || this.looksLikeCognitoId(value)) {
        return '';
      }
      return String(value).trim();
    },

    async getForumAuthor() {
      const user = await getCurrentUser();
      const authorUserId = user?.userId || user?.username || '';

      if (!authorUserId) {
        throw new Error('Could not determine the current user.');
      }

      const profileResult = await userPoolClient.models.UserProfile.list({
        filter: {
          ownerUserId: { eq: authorUserId },
        },
      });

      if (profileResult.errors?.length) {
        throw new Error(
          profileResult.errors[0].message || 'Failed to load user profile',
        );
      }

      const userProfile = profileResult.data?.[0] || null;

      return {
        authorUserId,
        authorDisplayName:
          userProfile?.displayName?.trim() ||
          this.currentUsername ||
          'Member',
      };
    },

    async getForumReadClient() {
      try {
        const session = await fetchAuthSession();
        const isSignedIn = !!session?.tokens?.idToken;
        this.isSignedIn = isSignedIn;
        return isSignedIn ? userPoolClient : publicClient;
      } catch {
        this.isSignedIn = false;
        return publicClient;
      }
    },

    async loadCurrentUser() {
      try {
        const session = await fetchAuthSession();
        const isSignedIn = !!session?.tokens?.idToken;
        this.isSignedIn = isSignedIn;

        if (!isSignedIn) {
          this.currentUserId = '';
          this.currentUsername = '';
          this.currentUserGroups = [];
          return;
        }

        const forumAuthor = await this.getForumAuthor().catch(() => ({
          authorUserId: '',
          authorDisplayName: '',
        }));

        this.currentUserId = forumAuthor.authorUserId || '';
        this.currentUsername = forumAuthor.authorDisplayName || '';

        const groups =
          session?.tokens?.accessToken?.payload?.['cognito:groups'] ||
          session?.tokens?.idToken?.payload?.['cognito:groups'] ||
          [];

        this.currentUserGroups = Array.isArray(groups)
          ? groups.map(normaliseGroupName)
          : [];
      } catch (error) {
        console.warn('Unable to load current user:', error);
        this.isSignedIn = false;
        this.currentUserId = '';
        this.currentUsername = '';
        this.currentUserGroups = [];
      }
    },


    // 8. Permissions + moderation helpers
    // ------------------------------------------------------

    hasModerationAccess() {
      const groups = (this.currentUserGroups || []).map(normaliseGroupName);

      return (
        groups.includes('superadmin') ||
        groups.includes('admin') ||
        groups.includes('staff')
      );
    },

    canDeletePost(post) {
      if (this.hasModerationAccess()) {
        return true;
      }

      if (!this.currentUserId || !post?.authorUserId) {
        return false;
      }

      return String(post.authorUserId) === String(this.currentUserId);
    },

    canDeleteThread() {
      if (this.hasModerationAccess()) {
        return true;
      }

      if (!this.currentUserId || !this.threadPosts.length) {
        return false;
      }

      const originalPost = sortByNewest(this.threadPosts)[0];
      return String(originalPost?.authorUserId || '') === String(
        this.currentUserId,
      );
    },

    async toggleThreadLock() {
      if (!this.threadRecord?.id || !this.hasModerationAccess()) {
        return;
      }

      const nextLockedState = !this.threadRecord.isLocked;
      const actionLabel = nextLockedState ? 'lock' : 'unlock';

      const confirmed = window.confirm(
        `Are you sure you want to ${actionLabel} this thread?`,
      );

      if (!confirmed) {
        return;
      }

      this.loadError = '';
      this.replyError = '';
      this.updatingThreadLock = true;

      try {
        const updateResult = await userPoolClient.models.ForumThread.update({
          id: this.threadRecord.id,
          isLocked: nextLockedState,
        });

        if (updateResult.errors?.length) {
          throw new Error(
            updateResult.errors[0].message || `Failed to ${actionLabel} thread`,
          );
        }

        if (updateResult.data) {
          this.threadRecord = {
            ...this.threadRecord,
            ...updateResult.data,
          };
        } else {
          this.threadRecord = {
            ...this.threadRecord,
            isLocked: nextLockedState,
          };
        }
      } catch (error) {
        console.error(`Failed to ${actionLabel} thread:`, error);
        this.loadError = error?.message || `Failed to ${actionLabel} thread`;
      } finally {
        this.updatingThreadLock = false;
      }
    },

    async deleteThread() {
      if (!this.threadRecord?.id) {
        return;
      }

      const confirmed = window.confirm(
        'Delete this entire thread and all replies? This cannot be undone.',
      );

      if (!confirmed) {
        return;
      }

      this.loadError = '';
      this.replyError = '';
      this.deletingThread = true;

      try {
        const postsInThread = [...this.threadPosts];

        for (const post of postsInThread) {
          const deletePostResult = await userPoolClient.models.ForumPost.delete({
            id: post.id,
          });

          if (deletePostResult.errors?.length) {
            throw new Error(
              deletePostResult.errors[0].message ||
                'Failed to delete a thread post',
            );
          }
        }

        const deleteThreadResult =
          await userPoolClient.models.ForumThread.delete({
            id: this.threadRecord.id,
          });

        if (deleteThreadResult.errors?.length) {
          throw new Error(
            deleteThreadResult.errors[0].message || 'Failed to delete thread',
          );
        }

        const boardSlug =
          this.boardRecord?.slug ||
          this.thread.boardSlug ||
          'community-board';

        await this.$router.push({
          name: 'ForumBoard',
          params: { boardSlug },
        });
      } catch (error) {
        console.error('Failed to delete thread:', error);
        this.loadError = error?.message || 'Failed to delete thread';
      } finally {
        this.deletingThread = false;
      }
    },

    async deletePost(post) {
      if (!post?.id) {
        return;
      }

      const confirmed = window.confirm(
        'Delete this post? This cannot be undone.',
      );
      if (!confirmed) {
        return;
      }

      this.replyError = '';
      this.deletingPostId = post.id;

      try {
        const deleteResult = await userPoolClient.models.ForumPost.delete({
          id: post.id,
        });

        if (deleteResult.errors?.length) {
          throw new Error(
            deleteResult.errors[0].message || 'Failed to delete post',
          );
        }

        const remainingPosts = this.threadPosts.filter(
          (item) => item.id !== post.id,
        );
        const updatedReplyCount = Math.max(remainingPosts.length - 1, 0);

        const latestPost = sortByNewest(remainingPosts).at(-1);
        const fallbackLastReplyAt =
          latestPost?.editedAt ||
          latestPost?.updatedAt ||
          latestPost?.createdAt ||
          this.threadRecord?.createdAt ||
          null;

        const threadUpdateResult = await userPoolClient.models.ForumThread.update(
          {
            id: this.threadRecord.id,
            replyCount: updatedReplyCount,
            lastReplyAt: fallbackLastReplyAt,
          },
        );

        if (threadUpdateResult.errors?.length) {
          throw new Error(
            threadUpdateResult.errors[0].message ||
              'Post deleted but thread update failed',
          );
        }

        await this.fetchThreadPage();
      } catch (error) {
        console.error('Failed to delete post:', error);
        this.replyError = error?.message || 'Failed to delete post';
      } finally {
        this.deletingPostId = '';
      }
    },


    // 9. Thread data loading + analytics
    // ------------------------------------------------------

    async fetchThreadPage() {
      this.loading = true;
      this.loadError = '';

      try {
        const readClient = await this.getForumReadClient();

        const [threadResult, boardResult, postResult] = await Promise.all([
          readClient.models.ForumThread.list(),
          readClient.models.ForumBoard.list(),
          readClient.models.ForumPost.list(),
        ]);

        if (threadResult.errors?.length) {
          throw new Error(
            threadResult.errors[0].message || 'Failed to load thread',
          );
        }

        if (boardResult.errors?.length) {
          throw new Error(
            boardResult.errors[0].message || 'Failed to load boards',
          );
        }

        if (postResult.errors?.length) {
          throw new Error(
            postResult.errors[0].message || 'Failed to load posts',
          );
        }

        const threads = threadResult.data || [];
        const boards = boardResult.data || [];
        const posts = postResult.data || [];

        const matchedThread = threads.find(
          (thread) => thread.slug === this.threadSlug,
        );

        if (!matchedThread) {
          throw new Error('Thread not found');
        }

        this.threadRecord = matchedThread;
        this.boardRecord =
          boards.find((board) => board.id === matchedThread.boardId) || null;
        this.threadPosts = posts.filter(
          (post) => post.threadId === matchedThread.id,
        );

        await this.incrementThreadViews();
      } catch (error) {
        console.error('Failed to fetch thread page:', error);
        this.loadError = error?.message || 'Failed to load thread page';
      } finally {
        this.loading = false;
      }
    },

    async incrementThreadViews() {
      if (!this.threadRecord?.id) {
        return;
      }

      try {
        const nextViewCount = (this.threadRecord.viewCount || 0) + 1;

        const updateResult = await userPoolClient.models.ForumThread.update({
          id: this.threadRecord.id,
          viewCount: nextViewCount,
        });

        if (!updateResult.errors?.length && updateResult.data) {
          this.threadRecord = {
            ...this.threadRecord,
            ...updateResult.data,
          };
        }
      } catch (error) {
        console.warn('Failed to increment thread views:', error);
      }
    },


    // 10. Reply interactions (quote, preview, submit, scroll)
    // ------------------------------------------------------

    scrollToReplyBox() {
      this.$refs.replySection?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    },

    // For template: logged-out click should call this to open the join modal
    openReplyBox() {
      if (!this.isSignedIn) {
        this.showJoinPrompt = true;
        this.replyError = '';
        return;
      }

      if (this.thread.isLocked) {
        this.replyError = 'This thread is locked.';
        return;
      }

      this.replyError = '';
      this.replyPreview = false;
      this.scrollToReplyBox();
    },

    closeJoinPrompt() {
      this.showJoinPrompt = false;
    },

    goToJoinPage() {
      this.$router.push(this.joinPageUrl);
    },

    goToSignInPage() {
      this.$router.push(this.signInPageUrl);
    },

    quotePost(post) {
      if (this.thread.isLocked) {
        return;
      }

      if (!this.isSignedIn) {
        this.showJoinPrompt = true;
        return;
      }

      const quotedText = post.content
        .map((paragraph) => `> ${paragraph}`)
        .join('\n\n');

      this.replyForm.content = this.replyForm.content
        ? `${this.replyForm.content}\n\n${quotedText}\n\n`
        : `${quotedText}\n\n`;

      this.replyPreview = false;
      this.scrollToReplyBox();
    },

    previewReply() {
      this.replyError = '';

      if (!this.replyForm.content.trim()) {
        this.replyError = 'Write your reply before previewing it.';
        this.replyPreview = false;
        return;
      }

      this.replyPreview = true;
    },

    async submitReply() {
      this.replyError = '';

      if (this.thread.isLocked) {
        this.replyError = 'This thread is locked.';
        return;
      }

      if (!this.isSignedIn) {
        this.showJoinPrompt = true;
        this.replyError = 'Sign in to post a reply.';
        return;
      }

      const content = this.replyForm.content.trim();

      if (!content) {
        this.replyError = 'Please write a reply before posting.';
        return;
      }

      if (!this.threadRecord?.id) {
        this.replyError = 'Thread is not ready yet. Refresh and try again.';
        return;
      }

      this.postingReply = true;

      try {
        const { authorUserId, authorDisplayName } =
          await this.getForumAuthor();

        const postCreateResult = await userPoolClient.models.ForumPost.create({
          threadId: this.threadRecord.id,
          authorUserId,
          authorDisplayName,
          content,
        });

        if (postCreateResult.errors?.length) {
          throw new Error(
            postCreateResult.errors[0].message || 'Failed to create reply',
          );
        }

        const updatedReplyCount = this.threadPosts.length;
        const nowIso = new Date().toISOString();

        const threadUpdateResult = await userPoolClient.models.ForumThread.update(
          {
            id: this.threadRecord.id,
            replyCount: updatedReplyCount,
            lastReplyAt: nowIso,
          },
        );

        if (threadUpdateResult.errors?.length) {
          throw new Error(
            threadUpdateResult.errors[0].message ||
              'Failed to update thread',
          );
        }

        this.replyForm = {
          title: '',
          content: '',
        };
        this.replyPreview = false;

        await this.fetchThreadPage();
      } catch (error) {
        console.error('Failed to submit reply:', error);
        this.replyError = error?.message || 'Failed to post reply';
      } finally {
        this.postingReply = false;
      }
    },


    // 11. Display helpers (roles, counts, formatting)
    // ------------------------------------------------------

    getAuthorRole(authorName = '') {
      const normalized = String(authorName).toLowerCase();

      if (normalized.includes('founder')) {
        return 'Project Lead';
      }

      if (normalized.includes('admin')) {
        return 'Administrator';
      }

      if (normalized.includes('moderator')) {
        return 'Moderator';
      }

      return 'Member';
    },

    isStaffAuthor(authorName = '') {
      const normalized = String(authorName).toLowerCase();

      return (
        normalized.includes('founder') ||
        normalized.includes('admin') ||
        normalized.includes('moderator')
      );
    },

    getAuthorPostCount(authorUserId) {
      if (!authorUserId) {
        return 1;
      }

      return this.threadPosts.filter(
        (post) => post.authorUserId === authorUserId,
      ).length;
    },

    formatRelativeTime(value) {
      if (!value) {
        return 'No activity yet';
      }

      const date = new Date(value);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();

      if (Number.isNaN(diffMs)) {
        return 'No activity yet';
      }

      const minute = 60 * 1000;
      const hour = 60 * minute;
      const day = 24 * hour;
      const week = 7 * day;

      if (diffMs < minute) {
        return 'Just now';
      }

      if (diffMs < hour) {
        const minutes = Math.floor(diffMs / minute);
        return `${minutes}m ago`;
      }

      if (diffMs < day) {
        const hours = Math.floor(diffMs / hour);
        return `${hours}h ago`;
      }

      if (diffMs < week) {
        const days = Math.floor(diffMs / day);
        return `${days}d ago`;
      }

      return date.toLocaleDateString();
    },
  },


  // 12. Watchers
  // ----------------------------------------------------------

  watch: {
    async threadSlug() {
      await this.fetchThreadPage();
    },
  },
};