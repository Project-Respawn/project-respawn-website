import { generateClient } from 'aws-amplify/data';
import { fetchAuthSession } from 'aws-amplify/auth';

const userPoolClient = generateClient();
const publicClient = generateClient({
  authMode: 'apiKey',
});

// 1. Starter data (new structure)
const STARTER_CATEGORIES = [
  {
    name: 'Project Respawn',
    slug: 'project-respawn',
    description:
      'Official updates, platform feedback, and app-building discussion.',
    sortOrder: 1,
    isActive: true,
  },
  {
    name: 'Creator Community',
    slug: 'creator-community',
    description: 'Streaming, Discord, and creator-focused growth conversations.',
    sortOrder: 2,
    isActive: true,
  },
  {
    name: 'Real World',
    slug: 'real-world',
    description:
      'Share momentum, discipline, and real-life wins outside the screen.',
    sortOrder: 3,
    isActive: true,
  },
];

const STARTER_BOARDS = [
  {
    categorySlug: 'project-respawn',
    name: 'Announcements',
    slug: 'announcements',
    description: 'Official platform updates, releases, and important news.',
    sortOrder: 1,
    isActive: true,
  },
  {
    categorySlug: 'project-respawn',
    name: 'Feature Ideas',
    slug: 'feature-ideas',
    description:
      'Suggest improvements, vote on ideas, and help shape the roadmap.',
    sortOrder: 2,
    isActive: true,
  },
  {
    categorySlug: 'project-respawn',
    name: 'Bug Reports',
    slug: 'bug-reports',
    description: 'Report issues, strange behavior, and things that need fixing.',
    sortOrder: 3,
    isActive: true,
  },
  {
    categorySlug: 'project-respawn',
    name: 'App Development',
    slug: 'app-development',
    description:
      'Discuss implementation, product direction, architecture, and builds.',
    sortOrder: 4,
    isActive: true,
  },
  {
    categorySlug: 'creator-community',
    name: 'Twitch Growth',
    slug: 'twitch-growth',
    description:
      'Streaming strategy, retention, content loops, and channel growth.',
    sortOrder: 1,
    isActive: true,
  },
  {
    categorySlug: 'creator-community',
    name: 'Discord Communities',
    slug: 'discord-communities',
    description:
      'Community design, moderation, events, and healthy group culture.',
    sortOrder: 2,
    isActive: true,
  },
  {
    categorySlug: 'real-world',
    name: 'Achievements',
    slug: 'achievements',
    description:
      'Post real-life wins, habits, milestones, and personal progress.',
    sortOrder: 1,
    isActive: true,
  },
  {
    categorySlug: 'real-world',
    name: 'Help & Advice',
    slug: 'help-and-advice',
    description:
      'Ask for support, share advice, and help other members with real-world challenges.',
    sortOrder: 2,
    isActive: true,
  },
];

// 2. Helpers
function sortByOrder(items = []) {
  return [...items].sort((a, b) => {
    const aOrder = a.sortOrder ?? 0;
    const bOrder = b.sortOrder ?? 0;
    return aOrder - bOrder;
  });
}

function sortByNewest(items = []) {
  return [...items].sort((a, b) => {
    const aDate = new Date(
      a.lastReplyAt || a.updatedAt || a.createdAt || 0,
    ).getTime();
    const bDate = new Date(
      b.lastReplyAt || b.updatedAt || b.createdAt || 0,
    ).getTime();
    return bDate - aDate;
  });
}

export default {
  name: 'ForumIndex',

  data() {
    return {
      loading: true,
      loadError: '',
      seedingForum: false,
      // Seed button hidden on this public page; keep logic for admin use
      showSeedButton: false,
      forumCategories: [],
      forumThreads: [],
      boardLookup: {},
      featuredScrollDuration: '36s',
    };
  },

  computed: {
    totalBoards() {
      return this.forumCategories.reduce(
        (total, category) => total + (category.boards?.length || 0),
        0,
      );
    },

    totalThreads() {
      return this.forumCategories.reduce((total, category) => {
        return (
          total +
          category.boards.reduce(
            (boardTotal, board) => boardTotal + (board.threadCount || 0),
            0,
          )
        );
      }, 0);
    },

    totalPosts() {
      return this.forumCategories.reduce((total, category) => {
        return (
          total +
          category.boards.reduce(
            (boardTotal, board) => boardTotal + (board.postCount || 0),
            0,
          )
        );
      }, 0);
    },

    latestActivityLabel() {
      const allBoards = this.forumCategories.flatMap(
        (category) => category.boards || [],
      );

      const latestBoardWithActivity = allBoards.find(
        (board) =>
          board.latestPost &&
          board.latestPost.time &&
          board.latestPost.time !== 'No activity yet',
      );

      return latestBoardWithActivity?.latestPost?.time || 'No activity yet';
    },

    featuredThreads() {
      return sortByNewest(
        this.forumThreads.filter((thread) => thread.isFeatured === true),
      ).map((thread, index) => {
        const board = this.boardLookup[thread.boardId] || {};
        const excerpt =
          thread.contentPreview ||
          'Join the discussion and help shape the direction of the community.';

        return {
          id: thread.id,
          renderId: `${thread.id}-${index}`,
          threadSlug: thread.slug,
          title: thread.title,
          excerpt,
          board: board.name || 'Community',
          author: thread.authorDisplayName || 'Unknown author',
          time: this.formatRelativeTime(
            thread.lastReplyAt || thread.updatedAt || thread.createdAt,
          ),
          isPinned: thread.isPinned === true,
          isFeatured: thread.isFeatured === true,
        };
      });
    },

    orderedFeaturedThreads() {
      const threads = [...this.featuredThreads];
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

      if (!threads.length) {
        return [];
      }

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

    hasFeaturedThreads() {
      return this.scrollingFeaturedThreads.length > 0;
    },
  },

  async mounted() {
    await this.fetchForumIndex();
  },

  methods: {
    // Choose the right client based on auth state
    async getForumReadClient() {
      try {
        const session = await fetchAuthSession();
        const isSignedIn = !!session?.tokens?.idToken;
        return isSignedIn ? userPoolClient : publicClient;
      } catch (error) {
        // If we cannot determine session, fall back to public read
        return publicClient;
      }
    },

    // 3. Read forum data
    async fetchForumIndex() {
      this.loading = true;
      this.loadError = '';

      try {
        const readClient = await this.getForumReadClient();

        const [categoryResult, boardResult, threadResult, postResult] =
          await Promise.all([
            readClient.models.ForumCategory.list(),
            readClient.models.ForumBoard.list(),
            readClient.models.ForumThread.list(),
            readClient.models.ForumPost.list(),
          ]);

        if (categoryResult.errors?.length) {
          throw new Error(
            categoryResult.errors[0].message ||
              'Failed to load forum categories',
          );
        }

        if (boardResult.errors?.length) {
          throw new Error(
            boardResult.errors[0].message || 'Failed to load forum boards',
          );
        }

        if (threadResult.errors?.length) {
          throw new Error(
            threadResult.errors[0].message || 'Failed to load forum threads',
          );
        }

        if (postResult.errors?.length) {
          throw new Error(
            postResult.errors[0].message || 'Failed to load forum posts',
          );
        }

        const categories = sortByOrder(categoryResult.data || []);
        const boards = sortByOrder(boardResult.data || []);
        const threads = threadResult.data || [];
        const posts = postResult.data || [];

        this.forumThreads = threads;
        this.boardLookup = boards.reduce((lookup, board) => {
          lookup[board.id] = board;
          return lookup;
        }, {});

        this.forumCategories = categories
          .filter((category) => category.isActive !== false)
          .map((category) => {
            const categoryBoards = boards
              .filter(
                (board) =>
                  board.categoryId === category.id && board.isActive !== false,
              )
              .map((board) => {
                const boardThreads = threads.filter(
                  (thread) => thread.boardId === board.id,
                );

                const boardPosts = posts.filter((post) =>
                  boardThreads.some((thread) => thread.id === post.threadId),
                );

                const latestThread = sortByNewest(boardThreads)[0];

                return {
                  id: board.slug,
                  dbId: board.id,
                  slug: board.slug,
                  icon: this.getBoardIcon(board.slug),
                  name: board.name,
                  description: board.description || '',
                  tags: this.getBoardTags(board.slug),
                  threadCount: boardThreads.length,
                  postCount: boardPosts.length,
                  latestPost: latestThread
                    ? {
                        title: latestThread.title || 'Latest thread',
                        author:
                          latestThread.authorDisplayName || 'Unknown author',
                        time: this.formatRelativeTime(
                          latestThread.lastReplyAt ||
                            latestThread.updatedAt ||
                            latestThread.createdAt,
                        ),
                      }
                    : {
                        title: 'No posts yet',
                        author: 'System',
                        time: 'No activity yet',
                      },
                };
              });

            return {
              id: category.slug,
              dbId: category.id,
              slug: category.slug,
              name: category.name,
              description: category.description || '',
              boards: categoryBoards,
            };
          })
          .filter((category) => category.boards.length > 0);

        this.updateFeaturedScrollDuration();
      } catch (error) {
        console.error('Failed to fetch forum index:', error);
        this.loadError = error?.message || 'Failed to load forum data';
      } finally {
        this.loading = false;
      }
    },

    // 4. Seed + migrate forum structure (admin-only; still uses userPool client)
    async seedForumStructure() {
      this.seedingForum = true;
      this.loadError = '';

      try {
        const writeClient = userPoolClient;

        // Categories
        const existingCategoriesResult =
          await writeClient.models.ForumCategory.list();

        if (existingCategoriesResult.errors?.length) {
          throw new Error(
            existingCategoriesResult.errors[0].message ||
              'Failed to check existing forum categories',
          );
        }

        const existingCategories = existingCategoriesResult.data || [];
        const categoryMap = new Map();

        for (const existingCategory of existingCategories) {
          categoryMap.set(existingCategory.slug, existingCategory);
        }

        // Migrate old Real-World Progress -> Real World if it exists
        const legacyRealWorld = categoryMap.get('real-world-progress');
        if (legacyRealWorld && !categoryMap.has('real-world')) {
          const updateResult = await writeClient.models.ForumCategory.update({
            id: legacyRealWorld.id,
            name: 'Real World',
            slug: 'real-world',
            description:
              'Share momentum, discipline, and real-life wins outside the screen.',
            sortOrder: 3,
            isActive: true,
          });

          if (updateResult.errors?.length) {
            throw new Error(
              updateResult.errors[0].message ||
                'Failed to migrate Real World category',
            );
          }

          if (updateResult.data) {
            categoryMap.delete('real-world-progress');
            categoryMap.set('real-world', updateResult.data);
          }
        }

        // Ensure all starter categories exist
        for (const category of STARTER_CATEGORIES) {
          if (!categoryMap.has(category.slug)) {
            const createResult = await writeClient.models.ForumCategory.create({
              name: category.name,
              slug: category.slug,
              description: category.description,
              sortOrder: category.sortOrder,
              isActive: category.isActive,
            });

            if (createResult.errors?.length) {
              throw new Error(
                createResult.errors[0].message ||
                  `Failed to create category: ${category.name}`,
              );
            }

            if (createResult.data) {
              categoryMap.set(category.slug, createResult.data);
            }
          }
        }

        // Boards
        const existingBoardsResult =
          await writeClient.models.ForumBoard.list();

        if (existingBoardsResult.errors?.length) {
          throw new Error(
            existingBoardsResult.errors[0].message ||
              'Failed to check existing forum boards',
          );
        }

        const existingBoards = existingBoardsResult.data || [];
        const boardSlugMap = new Map();
        existingBoards.forEach((board) => {
          boardSlugMap.set(board.slug, board);
        });

        // Migrate old IRL Achievements -> Achievements if present
        const legacyAchievements = boardSlugMap.get('irl-achievements');
        if (legacyAchievements && !boardSlugMap.has('achievements')) {
          const parentCategory =
            categoryMap.get('real-world') ||
            categoryMap.get('real-world-progress');

          if (parentCategory?.id) {
            const updateResult = await writeClient.models.ForumBoard.update({
              id: legacyAchievements.id,
              categoryId: parentCategory.id,
              name: 'Achievements',
              slug: 'achievements',
              description:
                'Post real-life wins, habits, milestones, and personal progress.',
              sortOrder: 1,
              isActive: true,
            });

            if (updateResult.errors?.length) {
              throw new Error(
                updateResult.errors[0].message ||
                  'Failed to migrate Achievements board',
              );
            }

            if (updateResult.data) {
              boardSlugMap.delete('irl-achievements');
              boardSlugMap.set('achievements', updateResult.data);
            }
          }
        }

        // Ensure all starter boards exist
        for (const board of STARTER_BOARDS) {
          if (boardSlugMap.has(board.slug)) {
            continue;
          }

          const parentCategory = categoryMap.get(board.categorySlug);

          if (!parentCategory?.id) {
            throw new Error(
              `Missing category for board "${board.name}" (${board.categorySlug})`,
            );
          }

          const createResult = await writeClient.models.ForumBoard.create({
            categoryId: parentCategory.id,
            name: board.name,
            slug: board.slug,
            description: board.description,
            sortOrder: board.sortOrder,
            isActive: board.isActive,
          });

          if (createResult.errors?.length) {
            throw new Error(
              createResult.errors[0].message ||
                `Failed to create board: ${board.name}`,
            );
          }

          if (createResult.data) {
            boardSlugMap.set(board.slug, createResult.data);
          }
        }

        await this.fetchForumIndex();
      } catch (error) {
        console.error('Failed to seed forum structure:', error);
        this.loadError =
          error?.message || 'Failed to create starter forum structure';
      } finally {
        this.seedingForum = false;
      }
    },

    // 5. UI helpers
    updateFeaturedScrollDuration() {
      const count = this.scrollingFeaturedThreads.length;

      if (count <= 2) {
        this.featuredScrollDuration = '20s';
        return;
      }

      if (count <= 4) {
        this.featuredScrollDuration = '28s';
        return;
      }

      if (count <= 6) {
        this.featuredScrollDuration = '36s';
        return;
      }

      this.featuredScrollDuration = '44s';
    },

    getBoardIcon(boardSlug) {
      const iconMap = {
        announcements: '📢',
        'feature-ideas': '💡',
        'bug-reports': '🛠️',
        'app-development': '🧠',
        'twitch-growth': '🎥',
        'discord-communities': '💬',
        achievements: '🏆',
        'help-and-advice': '🫶',
      };

      return iconMap[boardSlug] || '🗂️';
    },

    getBoardTags(boardSlug) {
      const tagMap = {
        announcements: ['Official', 'Updates'],
        'feature-ideas': ['Feedback', 'Ideas'],
        'bug-reports': ['Support', 'Issues'],
        'app-development': ['Build', 'Roadmap'],
        'twitch-growth': ['Streaming', 'Growth'],
        'discord-communities': ['Discord', 'Community'],
        achievements: ['Achievements', 'Wins'],
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

    goToBoard(boardSlug) {
      this.$router.push(`/forum/board/${boardSlug}`);
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

    scrollToCategories() {
      const section = this.$refs.categoriesSection;

      if (Array.isArray(section)) {
        section[0]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        return;
      }

      section?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    },
  },
};