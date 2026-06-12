import { generateClient } from 'aws-amplify/data';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

const client = generateClient();

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
    const aDate = new Date(a.editedAt || a.updatedAt || a.createdAt || 0).getTime();
    const bDate = new Date(b.editedAt || b.updatedAt || b.createdAt || 0).getTime();
    return aDate - bDate;
  });
}

function splitParagraphs(value = '') {
  return value
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default {
  name: 'ForumThread',

  props: {
    threadSlug: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      loading: true,
      loadError: '',
      postingReply: false,
      deletingPostId: '',
      deletingThread: false,
      updatingThreadLock: false,
      currentUserId: '',
      currentUserGroups: [],
      replyError: '',
      replyPreview: false,
      threadRecord: null,
      boardRecord: null,
      threadPosts: [],
      replyForm: {
        title: '',
        content: '',
      },
    };
  },

  computed: {
    mappedPosts() {
      const orderedPosts = sortByNewest(this.threadPosts);

      return orderedPosts.map((post, index) => {
        const authorName = post.authorDisplayName || 'Unknown author';
        const initials = authorName.trim().charAt(0).toUpperCase() || 'U';

        return {
          id: post.id,
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
        };
      });
    },

    thread() {
      if (!this.threadRecord) {
        return DEFAULT_THREAD;
      }

      const participants = new Set(
        this.threadPosts.map((post) => post.authorUserId || post.authorDisplayName)
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
            this.threadRecord.createdAt
        ),
        posts: this.mappedPosts,
      };
    },

    replyPreviewParagraphs() {
      return splitParagraphs(this.replyForm.content);
    },
  },

  async mounted() {
    await this.loadCurrentUser();
    await this.fetchThreadPage();
  },

  methods: {
    // 1. Auth and permissions
    async loadCurrentUser() {
      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();

        this.currentUserId = user.userId || '';
        this.currentUserGroups =
          session.tokens?.accessToken?.payload?.['cognito:groups'] || [];

        console.log('currentUserId:', this.currentUserId);
        console.log('currentUserGroups:', this.currentUserGroups);
      } catch (error) {
        console.warn('Unable to load current user:', error);
        this.currentUserId = '';
        this.currentUserGroups = [];
      }
    },

    hasModerationAccess() {
      const groups = (this.currentUserGroups || []).map((group) =>
        String(group).trim().toLowerCase()
      );

      return (
        groups.includes('SuperAdmin') ||
        groups.includes('Admin') ||
        groups.includes('Staff')
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
      return String(originalPost?.authorUserId || '') === String(this.currentUserId);
    },

    // 2. Author profile
    async getForumAuthor() {
      const user = await getCurrentUser();
      const authorUserId = user.userId;

      const profileResult = await client.models.UserProfile.list({
        filter: {
          ownerUserId: { eq: authorUserId },
        },
      });

      if (profileResult.errors?.length) {
        throw new Error(
          profileResult.errors[0].message || 'Failed to load user profile'
        );
      }

      const userProfile = profileResult.data?.[0];

      return {
        authorUserId,
        authorDisplayName:
          userProfile?.displayName?.trim() ||
          user?.signInDetails?.loginId ||
          'Member',
      };
    },

    // 3. Thread moderation
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
        const updateResult = await client.models.ForumThread.update({
          id: this.threadRecord.id,
          isLocked: nextLockedState,
        });

        if (updateResult.errors?.length) {
          throw new Error(
            updateResult.errors[0].message || `Failed to ${actionLabel} thread`
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
          const deletePostResult = await client.models.ForumPost.delete({
            id: post.id,
          });

          if (deletePostResult.errors?.length) {
            throw new Error(
              deletePostResult.errors[0].message || 'Failed to delete a thread post'
            );
          }
        }

        const deleteThreadResult = await client.models.ForumThread.delete({
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

      const confirmed = window.confirm('Delete this post? This cannot be undone.');
      if (!confirmed) {
        return;
      }

      this.replyError = '';
      this.deletingPostId = post.id;

      try {
        const deleteResult = await client.models.ForumPost.delete({
          id: post.id,
        });

        if (deleteResult.errors?.length) {
          throw new Error(
            deleteResult.errors[0].message || 'Failed to delete post'
          );
        }

        const remainingPosts = this.threadPosts.filter((item) => item.id !== post.id);
        const updatedReplyCount = Math.max(remainingPosts.length - 1, 0);

        const latestPost = sortByNewest(remainingPosts).at(-1);
        const fallbackLastReplyAt =
          latestPost?.editedAt ||
          latestPost?.updatedAt ||
          latestPost?.createdAt ||
          this.threadRecord?.createdAt ||
          null;

        const threadUpdateResult = await client.models.ForumThread.update({
          id: this.threadRecord.id,
          replyCount: updatedReplyCount,
          lastReplyAt: fallbackLastReplyAt,
        });

        if (threadUpdateResult.errors?.length) {
          throw new Error(
            threadUpdateResult.errors[0].message ||
              'Post deleted but thread update failed'
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

    // 4. Thread loading
    async fetchThreadPage() {
      this.loading = true;
      this.loadError = '';

      try {
        const [threadResult, boardResult, postResult] = await Promise.all([
          client.models.ForumThread.list(),
          client.models.ForumBoard.list(),
          client.models.ForumPost.list(),
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
        this.threadPosts = posts.filter((post) => post.threadId === matchedThread.id);

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

        const updateResult = await client.models.ForumThread.update({
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

    // 5. Reply helpers
    scrollToReplyBox() {
      this.$refs.replySection?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    },

    quotePost(post) {
      if (this.thread.isLocked) {
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
        const { authorUserId, authorDisplayName } = await this.getForumAuthor();

        const postCreateResult = await client.models.ForumPost.create({
          threadId: this.threadRecord.id,
          authorUserId,
          authorDisplayName,
          content,
        });

        if (postCreateResult.errors?.length) {
          throw new Error(
            postCreateResult.errors[0].message || 'Failed to create reply'
          );
        }

        const updatedReplyCount = this.threadPosts.length;
        const nowIso = new Date().toISOString();

        const threadUpdateResult = await client.models.ForumThread.update({
          id: this.threadRecord.id,
          replyCount: updatedReplyCount,
          lastReplyAt: nowIso,
        });

        if (threadUpdateResult.errors?.length) {
          throw new Error(
            threadUpdateResult.errors[0].message || 'Failed to update thread'
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

    // 6. Post presentation
    getAuthorRole(authorName = '') {
      const normalized = authorName.toLowerCase();

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
      const normalized = authorName.toLowerCase();
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

  watch: {
    async threadSlug() {
      await this.fetchThreadPage();
    },
  },
};