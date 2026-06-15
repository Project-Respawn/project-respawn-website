// ============================================================
// ForumThread
// ============================================================
// 1. Imports + clients
// 2. Constants + helpers
// 3. Component meta
// 4. State
// 5. Computed
// 6. Lifecycle
// 7. Auth + identity helpers
// 8. Permissions helpers
// 9. Thread data loading
// 10. Reply + edit interactions
// 11. Moderation actions
// 12. Display helpers
// 13. Watchers
// ============================================================



// 1. Imports + clients
// ------------------------------------------------------------

import { generateClient } from 'aws-amplify/data';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

let userPoolClient;
let publicClient;

function getUserPoolClient() {
  if (!userPoolClient) {
    userPoolClient = generateClient();
  }
  return userPoolClient;
}

function getPublicClient() {
  if (!publicClient) {
    publicClient = generateClient({ authMode: 'apiKey' });
  }
  return publicClient;
}



// 2. Constants + helpers
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

function sortByOldest(items = []) {
  return [...items].sort((a, b) => {
    const aDate = new Date(a.createdAt || a.updatedAt || a.editedAt || 0).getTime();
    const bDate = new Date(b.createdAt || b.updatedAt || b.editedAt || 0).getTime();
    return aDate - bDate;
  });
}

function splitParagraphs(value = '') {
  return String(value)
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normaliseGroupName(value = '') {
  return String(value).trim().toLowerCase();
}

function looksLikeCognitoId(value = '') {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}



// 3. Component meta
// ------------------------------------------------------------

export default {
  name: 'ForumThread',

  props: {
    threadSlug: {
      type: String,
      default: '',
    },
  },



  // 4. State
  // ----------------------------------------------------------

  data() {
    return {
      loading: true,
      loadError: '',
      replyError: '',

      postingReply: false,
      deletingPostId: '',
      deletingThread: false,
      updatingThreadLock: false,
      savingEditPostId: '',

      isSignedIn: false,
      currentUserId: '',
      currentUsername: '',
      currentUserGroups: [],

      showJoinPrompt: false,
      showExpandedReply: false,
      joinPageUrl: '/join',
      signInPageUrl: '/join',

      threadRecord: null,
      boardRecord: null,
      threadPosts: [],

      replyPreview: false,
      replyForm: {
        title: '',
        content: '',
      },

      editingPostId: '',
      editForm: {
        content: '',
      },
    };
  },



  // 5. Computed
  // ----------------------------------------------------------

  computed: {
    mappedPosts() {
      const orderedPosts = sortByOldest(this.threadPosts);

      return orderedPosts.map((post, index) => {
        const authorName =
          this.normaliseAuthorDisplayName(post.authorDisplayName) || 'Member';
        const initials = authorName.trim().charAt(0).toUpperCase() || 'M';

        return {
          id: post.id,
          raw: post,
          authorUserId: post.authorUserId,
          author: authorName,
          avatar: initials,
          role: this.getAuthorRole(authorName),
          joined: 'Jun 2026',
          postCount: this.getAuthorPostCount(post.authorUserId),
          postedAt: this.formatRelativeTime(
            post.editedAt || post.updatedAt || post.createdAt
          ),
          isOriginalPost: index === 0,
          isStaff: this.isStaffAuthor(authorName),
          content: splitParagraphs(post.content),
          contentRaw: post.content || '',
          wasEdited: !!post.editedAt,
          canEdit: this.canEditPost(post),
          canDelete: this.canDeletePost(post),
          isEditing: this.editingPostId === post.id,
        };
      });
    },

    thread() {
      if (!this.threadRecord) {
        return DEFAULT_THREAD;
      }

      const participants = new Set(
        this.threadPosts
          .map((post) =>
            post.authorUserId ||
            this.normaliseAuthorDisplayName(post.authorDisplayName)
          )
          .filter(Boolean)
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
        replyCount:
          typeof this.threadRecord.replyCount === 'number'
            ? this.threadRecord.replyCount
            : Math.max(this.threadPosts.length - 1, 0),
        viewCount: this.threadRecord.viewCount || 0,
        participantCount: participants.size,
        lastActivity: this.formatRelativeTime(
          this.threadRecord.lastReplyAt ||
            this.threadRecord.updatedAt ||
            this.threadRecord.createdAt
        ),
        posts: this.mappedPosts,
      };
    },

    replyPreviewParagraphs() {
      return splitParagraphs(this.replyForm.content);
    },
  },



  // 6. Lifecycle
  // ----------------------------------------------------------

  async mounted() {
    window.addEventListener('keydown', this.handleEscapeKey);
    await this.bootstrapThreadPage();
  },

  unmounted() {
    window.removeEventListener('keydown', this.handleEscapeKey);
  },



  // 7. Auth + identity helpers
  // ----------------------------------------------------------

  methods: {
    async bootstrapThreadPage() {
      await this.loadCurrentUser();
      await this.fetchThreadPage();
    },

    normaliseAuthorDisplayName(value = '') {
      if (!value || looksLikeCognitoId(value)) {
        return '';
      }
      return String(value).trim();
    },

    async getForumReadClient() {
      try {
        const session = await fetchAuthSession();
        const signedIn = !!session?.tokens?.idToken;
        this.isSignedIn = signedIn;
        return signedIn ? getUserPoolClient() : getPublicClient();
      } catch {
        this.isSignedIn = false;
        return getPublicClient();
      }
    },

    async getForumAuthor() {
      const user = await getCurrentUser();
      const authorUserId = user?.userId || user?.username || '';

      if (!authorUserId) {
        throw new Error('Could not determine the current user.');
      }

      const profileResult = await getUserPoolClient().models.UserProfile.list({
        filter: {
          ownerUserId: { eq: authorUserId },
        },
      });

      if (profileResult.errors?.length) {
        throw new Error(
          profileResult.errors[0].message || 'Failed to load user profile'
        );
      }

      const profile = profileResult.data?.[0] || null;

      return {
        authorUserId,
        authorDisplayName:
          profile?.displayName?.trim() || this.currentUsername || 'Member',
      };
    },

    async loadCurrentUser() {
      try {
        const session = await fetchAuthSession();
        const signedIn = !!session?.tokens?.idToken;

        this.isSignedIn = signedIn;

        if (!signedIn) {
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



    // 8. Permissions helpers
    // --------------------------------------------------------

    hasModerationAccess() {
      const groups = (this.currentUserGroups || []).map(normaliseGroupName);

      return (
        groups.includes('superadmin') ||
        groups.includes('admin') ||
        groups.includes('staff')
      );
    },

    canEditPost(post) {
      if (this.hasModerationAccess()) {
        return true;
      }

      if (!this.currentUserId || !post?.authorUserId) {
        return false;
      }

      return String(post.authorUserId) === String(this.currentUserId);
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

      const originalPost = sortByOldest(this.threadPosts)[0];
      return String(originalPost?.authorUserId || '') === String(
        this.currentUserId
      );
    },



    // 9. Thread data loading
    // --------------------------------------------------------

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
            threadResult.errors[0].message || 'Failed to load thread'
          );
        }

        if (boardResult.errors?.length) {
          throw new Error(
            boardResult.errors[0].message || 'Failed to load boards'
          );
        }

        if (postResult.errors?.length) {
          throw new Error(
            postResult.errors[0].message || 'Failed to load posts'
          );
        }

        const threads = threadResult.data || [];
        const boards = boardResult.data || [];
        const posts = postResult.data || [];

        const matchedThread = threads.find(
          (thread) => thread.slug === this.threadSlug
        );

        if (!matchedThread) {
          throw new Error('Thread not found');
        }

        this.threadRecord = matchedThread;
        this.boardRecord =
          boards.find((board) => board.id === matchedThread.boardId) || null;
        this.threadPosts = posts.filter(
          (post) => post.threadId === matchedThread.id
        );

        await this.recordThreadView();
      } catch (error) {
        console.error('Failed to fetch thread page:', error);
        this.loadError = error?.message || 'Failed to load thread page';
      } finally {
        this.loading = false;
      }
    },

    async recordThreadView() {
      if (!this.threadRecord?.id) {
        return;
      }

      try {
        const client = getUserPoolClient();

        if (!client.mutations?.recordForumThreadView) {
          console.warn(
            'recordForumThreadView mutation is not available on the client'
          );
          return;
        }

        const result = await client.mutations.recordForumThreadView({
          threadId: this.threadRecord.id,
        });

        if (result?.data) {
          const { viewCount, replyCount, lastReplyAt } = result.data;

          this.threadRecord = {
            ...this.threadRecord,
            viewCount:
              typeof viewCount === 'number'
                ? viewCount
                : this.threadRecord.viewCount,
            replyCount:
              typeof replyCount === 'number'
                ? replyCount
                : this.threadRecord.replyCount,
            lastReplyAt: lastReplyAt || this.threadRecord.lastReplyAt,
          };
        }
      } catch (error) {
        console.warn('Failed to record thread view:', error);
      }
    },



    // 10. Reply + edit interactions
    // --------------------------------------------------------

    scrollToReplyBox() {
      this.$refs.replySection?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    },

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
      this.showExpandedReply = false;
      this.scrollToReplyBox();
    },

    openExpandedReply() {
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
      this.showExpandedReply = true;
    },

    closeExpandedReply() {
      this.showExpandedReply = false;
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

      const quotedText = (post.content || [])
        .map((paragraph) => `> ${paragraph}`)
        .join('\n\n');

      this.replyForm.content = this.replyForm.content
        ? `${this.replyForm.content}\n\n${quotedText}\n\n`
        : `${quotedText}\n\n`;

      this.replyPreview = false;
      this.showExpandedReply = true;
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

      const title = (this.replyForm.title || '').trim();
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

        const client = getUserPoolClient();

        if (!client.mutations?.submitForumReply) {
          throw new Error(
            'submitForumReply mutation is not available on the client. Check resource.ts, handler wiring, and sandbox regeneration.'
          );
        }

        const replyResult = await client.mutations.submitForumReply({
          threadId: this.threadRecord.id,
          title,
          content,
          authorUserId,
          authorDisplayName,
          owner: authorUserId,
        });

        if (replyResult?.errors?.length) {
          throw new Error(
            replyResult.errors[0].message || 'Failed to create reply'
          );
        }

        if (replyResult?.data?.success === false) {
          throw new Error(
            replyResult.data.message || 'Failed to create reply'
          );
        }

        this.replyForm = {
          title: '',
          content: '',
        };
        this.replyPreview = false;
        this.showExpandedReply = false;

        await this.fetchThreadPage();
        this.scrollToReplyBox();
      } catch (error) {
        console.error('Failed to submit reply:', error);
        this.replyError = error?.message || 'Failed to post reply';
      } finally {
        this.postingReply = false;
      }
    },

    startEditingPost(post) {
      if (!this.canEditPost(post)) {
        return;
      }

      this.replyError = '';
      this.editingPostId = post.id;
      this.editForm.content = post.content || '';
    },

    cancelEditingPost() {
      this.editingPostId = '';
      this.editForm.content = '';
    },

    async saveEditedPost(post) {
      if (!post?.id) {
        return;
      }

      const content = this.editForm.content.trim();

      if (!content) {
        this.replyError = 'Edited post cannot be empty.';
        return;
      }

      this.replyError = '';
      this.savingEditPostId = post.id;

      try {
        const updateResult = await getUserPoolClient().models.ForumPost.update({
          id: post.id,
          content,
          editedAt: new Date().toISOString(),
        });

        if (updateResult.errors?.length) {
          throw new Error(
            updateResult.errors[0].message || 'Failed to update post'
          );
        }

        this.editingPostId = '';
        this.editForm.content = '';
        await this.fetchThreadPage();
      } catch (error) {
        console.error('Failed to edit post:', error);
        this.replyError = error?.message || 'Failed to save post changes';
      } finally {
        this.savingEditPostId = '';
      }
    },



    // 11. Moderation actions
    // --------------------------------------------------------

    async toggleThreadLock() {
      if (!this.threadRecord?.id || !this.hasModerationAccess()) {
        return;
      }

      const nextLockedState = !this.threadRecord.isLocked;
      const actionLabel = nextLockedState ? 'lock' : 'unlock';

      const confirmed = window.confirm(
        `Are you sure you want to ${actionLabel} this thread?`
      );

      if (!confirmed) {
        return;
      }

      this.loadError = '';
      this.replyError = '';
      this.updatingThreadLock = true;

      try {
        const updateResult = await getUserPoolClient().models.ForumThread.update({
          id: this.threadRecord.id,
          isLocked: nextLockedState,
        });

        if (updateResult.errors?.length) {
          throw new Error(
            updateResult.errors[0].message || `Failed to ${actionLabel} thread`
          );
        }

        this.threadRecord = {
          ...this.threadRecord,
          ...(updateResult.data || {}),
          isLocked: nextLockedState,
        };

        if (nextLockedState) {
          this.showExpandedReply = false;
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
        'Delete this entire thread and all replies? This cannot be undone.'
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
          const deletePostResult = await getUserPoolClient().models.ForumPost.delete({
            id: post.id,
          });

          if (deletePostResult.errors?.length) {
            throw new Error(
              deletePostResult.errors[0].message ||
                'Failed to delete a thread post'
            );
          }
        }

        const deleteThreadResult =
          await getUserPoolClient().models.ForumThread.delete({
            id: this.threadRecord.id,
          });

        if (deleteThreadResult.errors?.length) {
          throw new Error(
            deleteThreadResult.errors[0].message || 'Failed to delete thread'
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
        'Delete this post? This cannot be undone.'
      );

      if (!confirmed) {
        return;
      }

      this.replyError = '';
      this.deletingPostId = post.id;

      try {
        const deleteResult = await getUserPoolClient().models.ForumPost.delete({
          id: post.id,
        });

        if (deleteResult.errors?.length) {
          throw new Error(
            deleteResult.errors[0].message || 'Failed to delete post'
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



    // 12. Display helpers
    // --------------------------------------------------------

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
        (post) => post.authorUserId === authorUserId
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
        return `${Math.floor(diffMs / minute)}m ago`;
      }

      if (diffMs < day) {
        return `${Math.floor(diffMs / hour)}h ago`;
      }

      if (diffMs < week) {
        return `${Math.floor(diffMs / day)}d ago`;
      }

      return date.toLocaleDateString();
    },

    handleEscapeKey(event) {
      if (event.key !== 'Escape') {
        return;
      }

      if (this.showJoinPrompt) {
        this.closeJoinPrompt();
        return;
      }

      if (this.showExpandedReply) {
        this.closeExpandedReply();
      }
    },
  },



  // 13. Watchers
  // ----------------------------------------------------------

  watch: {
    async threadSlug() {
      this.cancelEditingPost();
      this.showExpandedReply = false;
      this.replyPreview = false;
      await this.fetchThreadPage();
    },
  },
};