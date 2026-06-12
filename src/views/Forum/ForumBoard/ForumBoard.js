// 1. Imports and Amplify client
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

const client = generateClient();

// 1a. Default board shape
const DEFAULT_BOARD = {
  id: 'community-board',
  dbId: '',
  name: 'Community Board',
  description: 'General community discussion for Project Respawn.',
  rules: 'Keep conversations constructive, helpful, and focused on community growth.',
  tags: ['Community'],
  threadCount: 0,
  postCount: 0,
  watchers: 0,
  sortLabel: 'Pinned + Featured + Latest',
  threads: [],
};

// 1b. Helper functions (sorting, slug, groups)
function sortByOrder(items = []) {
  return [...items].sort((a, b) => {
    const aOrder = a.sortOrder ?? 0;
    const bOrder = b.sortOrder ?? 0;
    return aOrder - bOrder;
  });
}

function sortPostsByNewest(items = []) {
  return [...items].sort((a, b) => {
    const aDate = new Date(a.editedAt || a.updatedAt || a.createdAt || 0).getTime();
    const bDate = new Date(b.editedAt || b.updatedAt || b.createdAt || 0).getTime();
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

    const aDate = new Date(a.lastReplyAt || a.updatedAt || a.createdAt || 0).getTime();
    const bDate = new Date(b.lastReplyAt || b.updatedAt || b.createdAt || 0).getTime();
    return bDate - aDate;
  });
}

function slugify(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function normaliseGroupName(value = '') {
  return String(value).trim().toLowerCase();
}

// 2. Component export
export default {
  name: 'ForumBoard',

  // 2a. Props
  props: {
    boardSlug: {
      type: String,
      default: '',
    },
  },

  // 2b. Data
  data() {
    return {
      loading: true,
      loadError: '',
      creatingThread: false,
      createThreadError: '',
      updatingPinnedThreadId: '',
      updatingFeaturedThreadId: '',
      showCreateThreadForm: false,
      boardRecord: null,
      boardCategory: null,
      boardThreads: [],
      boardPosts: [],
      currentUsername: '',
      currentUserGroups: [],
      newThreadForm: {
        title: '',
        content: '',
        isFeatured: false,
      },
    };
  },

  // 2c. Computed properties
  computed: {
    // 2c‑1. Moderation access (SuperAdmin/Admin/Staff)
    canManageThreadFlags() {
      const allowedGroups = ['superadmin', 'admin', 'staff'];

      return (this.currentUserGroups || [])
        .map((group) => String(group).trim().toLowerCase())
        .some((group) => allowedGroups.includes(group));
    },

    // 2c‑2. Board view model
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

    // 2c‑3. Mapped thread rows
    mappedThreads() {
      return sortThreadsForBoard(this.boardThreads).map((thread, index) => {
        const threadPosts = this.boardPosts.filter((post) => post.threadId === thread.id);
        const latestPost = sortPostsByNewest(threadPosts)[0];

        return {
          id: thread.id,
          dbId: thread.id,
          renderId: `${thread.id}-${index}`,
          threadSlug: thread.slug,
          title: thread.title,
          excerpt:
            thread.contentPreview ||
            'Join the discussion and help shape this board.',
          author: thread.authorDisplayName || 'Unknown author',
          createdAt: this.formatRelativeTime(thread.createdAt),
          replies: Math.max(threadPosts.length - 1, 0),
          views: thread.viewCount || 0,
          isPinned: thread.isPinned === true,
          isFeatured: thread.isFeatured === true,
          isLocked: thread.isLocked === true,
          latestReply: latestPost
            ? {
                title: this.buildLatestReplyTitle(latestPost.content),
                author: latestPost.authorDisplayName || 'Unknown author',
                time: this.formatRelativeTime(
                  latestPost.editedAt || latestPost.updatedAt || latestPost.createdAt
                ),
              }
            : {
                title: 'No replies yet',
                author: 'System',
                time: 'No activity yet',
              },
        };
      });
    },

    // 2c‑4. Derived thread subsets
    pinnedThreadsForBoard() {
      return this.board.threads.filter((thread) => thread.isPinned);
    },

    featuredThreadsForBoard() {
      return this.board.threads.filter(
        (thread) => thread.isFeatured && !thread.isPinned
      );
    },

    orderedFeaturedThreads() {
      const threads = [...this.featuredThreadsForBoard];
      const prioritySlug = 'beginning-of-the-end';
      const priorityIndex = threads.findIndex(
        (thread) => thread.threadSlug === prioritySlug
      );

      if (priorityIndex > -1) {
        const [priorityThread] = threads.splice(priorityIndex, 1);
        threads.unshift(priorityThread);
      }

      return threads;
    },

    scrollingFeaturedThreads() {
      const threads = this.orderedFeaturedThreads;

      if (!threads.length) {
        return [];
      }

      if (threads.length === 1) {
        return [...threads, ...threads, ...threads, ...threads].map((thread, index) => ({
          ...thread,
          renderId: `${thread.id}-x${index}`,
        }));
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
        (thread) => !thread.isFeatured && !thread.isPinned
      );
    },
  },

  // 2d. Lifecycle
  async mounted() {
    await this.bootstrapBoardPage();
  },

  // 2e. Methods
  methods: {
    // 2e‑1. Bootstrap: auth + board data
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

    // 2e‑2. Load current user + Cognito groups
    async loadCurrentUserPermissions() {
      try {
        const [user, session] = await Promise.all([
          getCurrentUser(),
          fetchAuthSession(),
        ]);

        this.currentUsername =
          user?.username ||
          user?.signInDetails?.loginId ||
          '';

        const groups =
          session?.tokens?.accessToken?.payload?.['cognito:groups'] ||
          session?.tokens?.idToken?.payload?.['cognito:groups'] ||
          [];

        this.currentUserGroups = Array.isArray(groups)
          ? groups.map(normaliseGroupName)
          : [];
      } catch (error) {
        this.currentUsername = '';
        this.currentUserGroups = [];
      }
    },

    // 2e‑3. Fetch board, threads, posts
    async fetchBoardPage() {
      this.loading = true;
      this.loadError = '';

      try {
        const [boardResult, categoryResult, threadResult, postResult] =
          await Promise.all([
            client.models.ForumBoard.list(),
            client.models.ForumCategory.list(),
            client.models.ForumThread.list(),
            client.models.ForumPost.list(),
          ]);

        if (boardResult.errors?.length) {
          throw new Error(boardResult.errors[0].message || 'Failed to load board');
        }

        if (categoryResult.errors?.length) {
          throw new Error(
            categoryResult.errors[0].message || 'Failed to load categories'
          );
        }

        if (threadResult.errors?.length) {
          throw new Error(
            threadResult.errors[0].message || 'Failed to load threads'
          );
        }

        if (postResult.errors?.length) {
          throw new Error(postResult.errors[0].message || 'Failed to load posts');
        }

        const boards = sortByOrder(boardResult.data || []);
        const categories = sortByOrder(categoryResult.data || []);
        const threads = threadResult.data || [];
        const posts = postResult.data || [];

        // Debug: see what flags are coming from the backend
        console.log(
          'forum raw threads',
          threads.map((t) => ({
            slug: t.slug,
            boardId: t.boardId,
            isPinned: t.isPinned,
            isFeatured: t.isFeatured,
          }))
        );

        const matchedBoard = boards.find(
          (board) => board.slug === this.boardSlug && board.isActive !== false
        );

        if (!matchedBoard) {
          throw new Error('Board not found');
        }

        const boardThreads = threads.filter((thread) => thread.boardId === matchedBoard.id);

        this.boardRecord = matchedBoard;
        this.boardCategory =
          categories.find((category) => category.id === matchedBoard.categoryId) || null;
        this.boardThreads = boardThreads;
        this.boardPosts = posts.filter((post) =>
          boardThreads.some((thread) => thread.id === post.threadId)
        );
      } catch (error) {
        console.error('Failed to fetch board page:', error);
        this.loadError = error?.message || 'Failed to load board page';
      } finally {
        this.loading = false;
      }
    },

    // 2e‑4. Thread creation UX controls
    openCreateThread() {
      this.showCreateThreadForm = true;
      this.createThreadError = '';
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

    // 2e‑5. Create thread + opening post
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
        this.createThreadError = 'Board is not ready yet. Refresh and try again.';
        return;
      }

      this.creatingThread = true;

      try {
        const user = await getCurrentUser();
        const username =
          user?.username ||
          user?.signInDetails?.loginId ||
          this.currentUsername ||
          'authenticated-user';

        const threadSlugBase = slugify(title);
        const uniqueThreadSlug = `${threadSlugBase}-${Date.now()}`;
        const preview = content.slice(0, 180);

        const threadCreateResult = await client.models.ForumThread.create({
          boardId: this.boardRecord.id,
          title,
          slug: uniqueThreadSlug,
          authorUserId: username,
          authorDisplayName: username,
          contentPreview: preview,
          isPinned: false,
          isLocked: false,
          isFeatured:
            this.canManageThreadFlags && this.newThreadForm.isFeatured === true,
          replyCount: 0,
          viewCount: 0,
          lastReplyAt: new Date().toISOString(),
        });

        if (threadCreateResult.errors?.length) {
          throw new Error(
            threadCreateResult.errors[0].message || 'Failed to create thread'
          );
        }

        const createdThread = threadCreateResult.data;

        if (!createdThread?.id) {
          throw new Error('Thread was created without an ID.');
        }

        const postCreateResult = await client.models.ForumPost.create({
          threadId: createdThread.id,
          authorUserId: username,
          authorDisplayName: username,
          content,
        });

        if (postCreateResult.errors?.length) {
          throw new Error(
            postCreateResult.errors[0].message || 'Failed to create opening post'
          );
        }

        this.cancelCreateThread();
        await this.fetchBoardPage();
        this.goToThread(createdThread.slug);
      } catch (error) {
        console.error('Failed to create thread:', error);
        this.createThreadError = error?.message || 'Failed to publish thread';
      } finally {
        this.creatingThread = false;
      }
    },

    // 2e‑6. Toggle pinned
    async togglePinned(thread) {
      if (!thread?.dbId || !this.canManageThreadFlags) {
        return;
      }

      this.updatingPinnedThreadId = thread.dbId;
      this.loadError = '';

      try {
        const updateResult = await client.models.ForumThread.update({
          id: thread.dbId,
          isPinned: !thread.isPinned,
        });

        if (updateResult.errors?.length) {
          throw new Error(
            updateResult.errors[0].message || 'Failed to update pinned state'
          );
        }

        await this.fetchBoardPage();
      } catch (error) {
        console.error('Failed to toggle pinned state:', error);
        this.loadError = error?.message || 'Failed to update pinned state';
      } finally {
        this.updatingPinnedThreadId = '';
      }
    },

    // 2e‑7. Toggle featured
    async toggleFeatured(thread, nextValue) {
      if (!thread?.dbId || !this.canManageThreadFlags) {
        return;
      }

      this.updatingFeaturedThreadId = thread.dbId;
      this.loadError = '';

      try {
        const updateResult = await client.models.ForumThread.update({
          id: thread.dbId,
          isFeatured: nextValue === true,
        });

        if (updateResult.errors?.length) {
          throw new Error(
            updateResult.errors[0].message || 'Failed to update featured state'
          );
        }

        await this.fetchBoardPage();
      } catch (error) {
        console.error('Failed to toggle featured state:', error);
        this.loadError = error?.message || 'Failed to update featured state';
      } finally {
        this.updatingFeaturedThreadId = '';
      }
    },

    // 2e‑8. UI helpers
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
        'irl-achievements':
          'Use this board to share progress, real-life wins, habits, milestones, and personal growth.',
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
        'irl-achievements': ['IRL', 'Wins', 'Progress'],
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
  },

  // 2f. Watchers
  watch: {
    async boardSlug() {
      await this.bootstrapBoardPage();
    },
  },
};