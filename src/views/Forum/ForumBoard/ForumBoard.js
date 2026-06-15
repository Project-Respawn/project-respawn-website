// ForumBoard.js
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

const DEFAULT_BOARD = {
  id: 'community-board',
  dbId: '',
  name: 'Community Board',
  description: 'General community discussion for Project Respawn.',
  rules:
    'Keep conversations constructive, helpful, and focused on community growth.',
  tags: ['Community'],
  threadCount: 0,
  postCount: 0,
  watchers: 0,
  sortLabel: 'Pinned + Featured + Latest',
  threads: [],
};

function sortByOrder(items = []) {
  return [...items].sort((a, b) => {
    const aOrder = a.sortOrder ?? 0;
    const bOrder = b.sortOrder ?? 0;
    return aOrder - bOrder;
  });
}

function sortPostsByNewest(items = []) {
  return [...items].sort((a, b) => {
    const aDate = new Date(
      a.editedAt || a.updatedAt || a.createdAt || 0,
    ).getTime();
    const bDate = new Date(
      b.editedAt || b.updatedAt || b.createdAt || 0,
    ).getTime();
    return bDate - aDate;
  });
}

function sortThreadsForBoard(items = []) {
  return [...items].sort((a, b) => {
    const aPinned = a.isPinned === true ? 1 : 0;
    const bPinned = b.isPinned === true ? 1 : 0;

    if (aPinned !== bPinned) {
      return bPinned - aPinned;
    }

    const aFeatured = a.isFeatured === true ? 1 : 0;
    const bFeatured = b.isFeatured === true ? 1 : 0;

    if (aFeatured !== bFeatured) {
      return bFeatured - aFeatured;
    }

    const aDate = new Date(
      a.lastReplyAt || a.updatedAt || a.createdAt || 0,
    ).getTime();
    const bDate = new Date(
      b.lastReplyAt || b.updatedAt || b.createdAt || 0,
    ).getTime();
    return bDate - aDate;
  });
}

function normaliseGroupName(value = '') {
  return String(value).trim().toLowerCase();
}

export default {
  name: 'ForumBoard',

  props: {
    boardSlug: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      // loading + errors
      loading: true,
      loadError: '',
      creatingThread: false,
      createThreadError: '',

      // async flags
      updatingPinnedThreadId: '',
      updatingFeaturedThreadId: '',

      // create-thread form
      showCreateThreadForm: false,
      newThreadForm: {
        title: '',
        content: '',
        isFeatured: false,
      },

      // accessibility
      textSize: 'default',

      // board data
      boardRecord: null,
      boardCategory: null,
      boardThreads: [],
      boardPosts: [],

      // auth + identity
      currentUserId: '',
      currentUsername: '',
      currentUserGroups: [],
      isSignedIn: false,

      // join prompt
      showJoinPrompt: false,
      joinPageUrl: '/join',
      signInPageUrl: '/join',
    };
  },

  computed: {
    // route + role gate for "New Thread" buttons
    isAnnouncementsRoute() {
      return this.$route.path === '/forum/board/announcements';
    },

    isSuperAdmin() {
      return (this.currentUserGroups || []).includes('superadmin');
    },

    showNewThreadButton() {
      if (this.isAnnouncementsRoute) {
        return this.isSuperAdmin;
      }
      return true;
    },

    canManageThreadFlags() {
      const allowedGroups = ['superadmin', 'admin', 'staff'];

      return (this.currentUserGroups || [])
        .map((group) => String(group).trim().toLowerCase())
        .some((group) => allowedGroups.includes(group));
    },

    hasModerationAccess() {
      return this.canManageThreadFlags;
    },

    boardTextSizeClass() {
      return `forum-text-size-${this.textSize}`;
    },

    board() {
      if (!this.boardRecord) {
        return DEFAULT_BOARD;
      }

      return {
        id: this.boardRecord.slug,
        dbId: this.boardRecord.id,
        categoryId: this.boardRecord.categoryId,
        categoryName: this.boardCategory?.name || 'Forum',
        name: this.boardRecord.name,
        description: this.boardRecord.description || '',
        rules: this.getBoardRules(this.boardRecord.slug),
        tags: this.getBoardTags(this.boardRecord.slug),
        threadCount: this.boardThreads.length,
        postCount: this.boardPosts.length,
        watchers: 0,
        sortLabel: 'Pinned + Featured + Latest',
        threads: this.mappedThreads,
      };
    },

    mappedThreads() {
      return sortThreadsForBoard(this.boardThreads).map((thread, index) => {
        const threadPosts = this.boardPosts.filter(
          (post) => post.threadId === thread.id,
        );
        const latestPost = sortPostsByNewest(threadPosts)[0];

        const authorUsername =
          this.normaliseAuthorDisplayName(thread.authorDisplayName) ||
          'Member';

        const latestAuthorUsername = latestPost
          ? this.normaliseAuthorDisplayName(
              latestPost.authorDisplayName,
            ) || 'Member'
          : 'System';

        return {
          id: thread.id,
          dbId: thread.id,
          renderId: `${thread.id}-${index}`,
          threadSlug: thread.slug,
          title: thread.title,
          excerpt:
            thread.contentPreview ||
            'Join the discussion and help shape this board.',
          authorUsername,
          createdAt: this.formatRelativeTime(thread.createdAt),
          replies: Math.max(threadPosts.length - 1, 0),
          views: thread.viewCount || 0,
          isPinned: thread.isPinned === true,
          isFeatured: thread.isFeatured === true,
          isLocked: thread.isLocked === true,
          latestReply: latestPost
            ? {
                title: this.buildLatestReplyTitle(latestPost.content),
                authorUsername: latestAuthorUsername,
                time: this.formatRelativeTime(
                  latestPost.editedAt ||
                    latestPost.updatedAt ||
                    latestPost.createdAt,
                ),
              }
            : {
                title: 'No replies yet',
                authorUsername: 'System',
                time: 'No activity yet',
              },
        };
      });
    },

    pinnedThreadsForBoard() {
      return this.board.threads.filter((thread) => thread.isPinned);
    },

    featuredThreadsForBoard() {
      return this.board.threads.filter(
        (thread) => thread.isFeatured && !thread.isPinned,
      );
    },

    orderedFeaturedThreads() {
      const threads = [...this.featuredThreadsForBoard];
      const prioritySlug = 'beginning-of-the-end';
      const priorityIndex = threads.findIndex(
        (thread) => thread.threadSlug === prioritySlug,
      );

      if (priorityIndex > -1) {
        const [priorityThread] = threads.splice(priorityIndex, 1);
        threads.unshift(priorityThread);
      }

      return threads;
    },

    scrollingFeaturedThreads() {
      const threads = this.orderedFeaturedThreads;

      if (!threads.length) return [];

      if (threads.length === 1) {
        return [...threads, ...threads, ...threads, ...threads].map(
          (thread, index) => ({
            ...thread,
            renderId: `${thread.id}-x${index}`,
          }),
        );
      }

      if (threads.length === 2) {
        return [...threads, ...threads, ...threads].map((thread, index) => ({
          ...thread,
          renderId: `${thread.id}-x${index}`,
        }));
      }

      if (threads.length === 3) {
        return [...threads, ...threads].map((thread, index) => ({
          ...thread,
          renderId: `${thread.id}-x${index}`,
        }));
      }

      return threads.map((thread, index) => ({
        ...thread,
        renderId: `${thread.id}-x${index}`,
      }));
    },

    regularThreads() {
      return this.board.threads.filter(
        (thread) => !thread.isFeatured && !thread.isPinned,
      );
    },
  },

  async mounted() {
    window.addEventListener('keydown', this.handleEscapeKey);
    await this.bootstrapBoardPage();
  },

  unmounted() {
    window.removeEventListener('keydown', this.handleEscapeKey);
  },

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

      const profileResult = await getUserPoolClient().models.UserProfile.list({
        filter: {
          ownerUserId: { eq: authorUserId },
        },
      });

      if (profileResult.errors?.length) {
        throw new Error(
          profileResult.errors[0].message || 'Failed to load user profile',
        );
      }

      const profile = profileResult.data?.[0] || null;
      const authorDisplayName = profile?.displayName?.trim() || 'Member';

      return {
        authorUserId,
        authorDisplayName,
      };
    },

    async getForumReadClient() {
      try {
        const session = await fetchAuthSession();
        const isSignedIn = !!session?.tokens?.idToken;
        this.isSignedIn = isSignedIn;

        return isSignedIn ? getUserPoolClient() : getPublicClient();
      } catch {
        this.isSignedIn = false;
        return getPublicClient();
      }
    },

    async bootstrapBoardPage() {
      this.loading = true;
      this.loadError = '';

      try {
        await this.loadCurrentUserPermissions();
        await this.fetchBoardPage();
      } catch (error) {
        console.error('Failed to bootstrap board page:', error);
        this.loadError = error?.message || 'Failed to load board page';
        this.loading = false;
      }
    },

    async loadCurrentUserPermissions() {
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
      } catch {
        this.isSignedIn = false;
        this.currentUserId = '';
        this.currentUsername = '';
        this.currentUserGroups = [];
      }
    },

    async fetchBoardPage() {
      this.loading = true;
      this.loadError = '';

      try {
        const readClient = await this.getForumReadClient();

        const [boardResult, categoryResult, threadResult, postResult] =
          await Promise.all([
            readClient.models.ForumBoard.list(),
            readClient.models.ForumCategory.list(),
            readClient.models.ForumThread.list(),
            readClient.models.ForumPost.list(),
          ]);

        if (boardResult.errors?.length) {
          throw new Error(
            boardResult.errors[0].message || 'Failed to load board',
          );
        }

        if (categoryResult.errors?.length) {
          throw new Error(
            categoryResult.errors[0].message || 'Failed to load categories',
          );
        }

        if (threadResult.errors?.length) {
          throw new Error(
            threadResult.errors[0].message || 'Failed to load threads',
          );
        }

        if (postResult.errors?.length) {
          throw new Error(
            postResult.errors[0].message || 'Failed to load posts',
          );
        }

        const boards = sortByOrder(boardResult.data || []);
        const categories = sortByOrder(categoryResult.data || []);
        const threads = threadResult.data || [];
        const posts = postResult.data || [];

        const matchedBoard = boards.find(
          (board) => board.slug === this.boardSlug && board.isActive !== false,
        );

        if (!matchedBoard) {
          throw new Error('Board not found');
        }

        const boardThreads = threads.filter(
          (thread) => thread.boardId === matchedBoard.id,
        );

        this.boardRecord = matchedBoard;
        this.boardCategory =
          categories.find(
            (category) => category.id === matchedBoard.categoryId,
          ) || null;
        this.boardThreads = boardThreads;
        this.boardPosts = posts.filter((post) =>
          boardThreads.some((thread) => thread.id === post.threadId),
        );
      } catch (error) {
        console.error('Failed to fetch board page:', error);
        this.loadError = error?.message || 'Failed to load board page';
      } finally {
        this.loading = false;
      }
    },

    openCreateThread() {
      if (!this.isSignedIn) {
        this.showJoinPrompt = true;
        this.createThreadError = '';
        return;
      }

      if (!this.showNewThreadButton) {
        this.createThreadError =
          'You do not have permission to create threads here.';
        return;
      }

      this.showCreateThreadForm = true;
      this.createThreadError = '';
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

    cancelCreateThread() {
      this.showCreateThreadForm = false;
      this.createThreadError = '';
      this.newThreadForm = {
        title: '',
        content: '',
        isFeatured: false,
      };
    },

    async submitThread() {
      this.createThreadError = '';

      const title = this.newThreadForm.title.trim();
      const content = this.newThreadForm.content.trim();

      if (!title) {
        this.createThreadError = 'Please enter a thread title.';
        return;
      }

      if (!content) {
        this.createThreadError = 'Please write the opening post.';
        return;
      }

      if (!this.boardRecord?.id) {
        this.createThreadError =
          'Board is not ready yet. Refresh and try again.';
        return;
      }

      if (!this.isSignedIn) {
        this.showJoinPrompt = true;
        this.createThreadError = '';
        return;
      }

      // guard again on submit, just to be safe
      if (!this.showNewThreadButton) {
        this.createThreadError =
          'You do not have permission to create threads on this board.';
        return;
      }

      this.creatingThread = true;

      try {
        const { authorUserId, authorDisplayName } =
          await this.getForumAuthor();

        const result = await getUserPoolClient().mutations.submitForumThread({
          boardId: this.boardRecord.id,
          title,
          content,
          authorUserId,
          authorDisplayName,
          owner: authorUserId,
          isFeatured:
            this.canManageThreadFlags &&
            this.newThreadForm.isFeatured === true,
        });

        if (result.errors?.length) {
          throw new Error(
            result.errors[0].message || 'Failed to create thread',
          );
        }

        const payload = result.data;

        if (!payload?.success) {
          throw new Error(payload?.message || 'Failed to create thread');
        }

        this.cancelCreateThread();
        await this.fetchBoardPage();

        const createdThread = this.boardThreads.find(
          (thread) => thread.id === payload.threadId,
        );

        if (createdThread?.slug) {
          this.goToThread(createdThread.slug);
          return;
        }

        await this.fetchBoardPage();

        const fallbackThread = this.boardThreads.find(
          (thread) => thread.id === payload.threadId,
        );

        if (fallbackThread?.slug) {
          this.goToThread(fallbackThread.slug);
        }
      } catch (error) {
        console.error('Failed to create thread:', error);
        this.createThreadError =
          error?.message || 'Failed to publish thread';
      } finally {
        this.creatingThread = false;
      }
    },

    async togglePinned(thread) {
      if (!thread?.dbId || !this.canManageThreadFlags) {
        return;
      }

      this.updatingPinnedThreadId = thread.dbId;
      this.loadError = '';

      try {
        const updateResult =
          await getUserPoolClient().models.ForumThread.update({
            id: thread.dbId,
            isPinned: !thread.isPinned,
          });

        if (updateResult.errors?.length) {
          throw new Error(
            updateResult.errors[0].message ||
              'Failed to update pinned state',
          );
        }

        await this.fetchBoardPage();
      } catch (error) {
        console.error('Failed to toggle pinned state:', error);
        this.loadError =
          error?.message || 'Failed to update pinned state';
      } finally {
        this.updatingPinnedThreadId = '';
      }
    },

    async toggleFeatured(thread, nextValue) {
      if (!thread?.dbId || !this.canManageThreadFlags) {
        return;
      }

      this.updatingFeaturedThreadId = thread.dbId;
      this.loadError = '';

      try {
        const updateResult =
          await getUserPoolClient().models.ForumThread.update({
            id: thread.dbId,
            isFeatured: nextValue === true,
          });

        if (updateResult.errors?.length) {
          throw new Error(
            updateResult.errors[0].message ||
              'Failed to update featured state',
          );
        }

        await this.fetchBoardPage();
      } catch (error) {
        console.error('Failed to toggle featured state:', error);
        this.loadError =
          error?.message || 'Failed to update featured state';
      } finally {
        this.updatingFeaturedThreadId = '';
      }
    },

    isUpdatingPinned(thread) {
      return this.updatingPinnedThreadId === thread.dbId;
    },

    isUpdatingFeatured(thread) {
      return this.updatingFeaturedThreadId === thread.dbId;
    },

    buildLatestReplyTitle(content = '') {
      if (!content.trim()) {
        return 'Latest reply';
      }

      const clean = content.replace(/\s+/g, ' ').trim();
      return clean.length > 60 ? `${clean.slice(0, 57)}...` : clean;
    },

    getBoardRules(boardSlug) {
      const rulesMap = {
        announcements:
          'Use this board for official platform updates, important news, and release notes.',
        'feature-ideas':
          'Use this board to suggest product ideas, workflow improvements, creator tools, and community features. Keep each thread focused on one main idea.',
        'bug-reports':
          'Use this board to report issues clearly, including what happened, what you expected, and how to reproduce it.',
        'app-development':
          'Use this board for roadmap planning, architecture discussion, app feedback, and build updates tied to Project Respawn.',
        'twitch-growth':
          'Use this board for streaming strategy, audience growth, content loops, and creator improvement discussions.',
        'discord-communities':
          'Use this board for Discord strategy, server structure, moderation ideas, bots, and onboarding.',
        achievements:
          'Use this board to share achievements, momentum, discipline, and real-life wins outside the screen.',
        'help-and-advice':
          'Use this board to ask for help, share advice, and support other members with practical guidance.',
      };

      return (
        rulesMap[boardSlug] ||
        'Keep conversations constructive, helpful, and focused on community growth.'
      );
    },

    getBoardTags(boardSlug) {
      const tagMap = {
        announcements: ['Official', 'Updates'],
        'feature-ideas': ['Feedback', 'Ideas', 'Product'],
        'bug-reports': ['Support', 'Issues'],
        'app-development': ['Build', 'Roadmap', 'Development'],
        'twitch-growth': ['Streaming', 'Growth', 'Creator'],
        'discord-communities': ['Discord', 'Community', 'Moderation'],
        achievements: ['Achievements', 'Wins', 'Progress'],
        'help-and-advice': ['Help', 'Advice', 'Support'],
      };

      return tagMap[boardSlug] || ['Community'];
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

    goToThread(threadSlug) {
      this.$router.push(`/forum/thread/${threadSlug}`);
    },

    scrollToFeatured() {
      this.$refs.featuredSection?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    },

    setTextSize(size = 'default') {
      const allowed = ['default', 'large', 'xlarge'];

      if (!allowed.includes(size)) {
        this.textSize = 'default';
        return;
      }

      this.textSize = size;
    },

    handleEscapeKey(event) {
      if (event.key !== 'Escape') {
        return;
      }

      if (this.showJoinPrompt) {
        this.closeJoinPrompt();
        return;
      }

      if (this.showCreateThreadForm) {
        this.cancelCreateThread();
      }
    },
  },

  watch: {
    async boardSlug() {
      await this.bootstrapBoardPage();
    },
  },
};