export default {
  name: 'ForumIndex',

  data() {
    return {
      featuredThreads: [
        {
          id: 'featured-1',
          threadSlug: 'creator-milestones-profile-rewards',
          title: 'Should creator milestones unlock profile rewards?',
          excerpt: 'Share thoughts on milestone rewards, profile identity, and how progress should feel visible on the platform.',
          board: 'Feature Ideas',
          author: 'Admin',
          time: '2h ago',
          isFeatured: true,
        },
        {
          id: 'featured-2',
          threadSlug: 'forum-permissions-role-discussion',
          title: 'Best way to bring users from the site into Discord communities',
          excerpt: 'Discuss onboarding, role-gating, safety, and how to create stronger community pathways.',
          board: 'Discord Communities',
          author: 'CommunityBuilder',
          time: '5h ago',
          isFeatured: true,
        },
        {
          id: 'featured-3',
          threadSlug: 'creator-milestones-profile-rewards',
          title: 'First big IRL confidence win this month',
          excerpt: 'A community thread for celebrating meaningful real-world progress and momentum.',
          board: 'IRL Achievements',
          author: 'RespawnMember',
          time: '9h ago',
          isFeatured: true,
        },
        {
          id: 'featured-4',
          threadSlug: 'forum-permissions-role-discussion',
          title: 'How should forum permissions work by role?',
          excerpt: 'Help define how staff, moderators, and members should interact across the forum experience.',
          board: 'App Development',
          author: 'Founder',
          time: '1d ago',
          isFeatured: true,
        },
      ],

      forumCategories: [
        {
          id: 'project-respawn',
          name: 'Project Respawn',
          description: 'Official updates, feature planning, bug reports, and product discussion.',
          boards: [
            {
              id: 'announcements',
              icon: '📢',
              name: 'Announcements',
              description: 'Official news, launches, updates, and important community notices.',
              tags: ['Official', 'Updates'],
              threadCount: 12,
              postCount: 94,
              latestPost: {
                title: 'Forum structure and permissions rollout',
                author: 'Admin',
                time: '2h ago',
              },
            },
            {
              id: 'feature-ideas',
              icon: '💡',
              name: 'Feature Ideas',
              description: 'Suggest ideas for improving Project Respawn and discuss what should be built next.',
              tags: ['Feedback', 'Ideas'],
              threadCount: 28,
              postCount: 213,
              latestPost: {
                title: 'Should creator milestones unlock profile rewards?',
                author: 'RespawnMember',
                time: '4h ago',
              },
            },
            {
              id: 'bug-reports',
              icon: '🛠️',
              name: 'Bug Reports',
              description: 'Report issues, broken flows, visual bugs, and unexpected behaviour.',
              tags: ['Support', 'Issues'],
              threadCount: 9,
              postCount: 41,
              latestPost: {
                title: 'Dashboard page not updating after save',
                author: 'CommunityTester',
                time: '6h ago',
              },
            },
            {
              id: 'app-development',
              icon: '🧠',
              name: 'App Development',
              description: 'Discuss roadmap ideas, architecture, UX decisions, and development updates.',
              tags: ['Build', 'Roadmap'],
              threadCount: 17,
              postCount: 137,
              latestPost: {
                title: 'How should forum permissions work by role?',
                author: 'Founder',
                time: '1d ago',
              },
            },
          ],
        },
        {
          id: 'creator-community',
          name: 'Creator Community',
          description: 'Conversations around Twitch, Discord, content strategy, and creator growth.',
          boards: [
            {
              id: 'twitch-growth',
              icon: '🎥',
              name: 'Twitch Growth',
              description: 'Share stream ideas, retention tactics, schedules, and lessons from live content.',
              tags: ['Streaming', 'Growth'],
              threadCount: 21,
              postCount: 166,
              latestPost: {
                title: 'What stream openers keep people watching?',
                author: 'StreamerPath',
                time: '3h ago',
              },
            },
            {
              id: 'discord-communities',
              icon: '💬',
              name: 'Discord Communities',
              description: 'Talk about Discord setup, moderation, onboarding, bots, and stronger communities.',
              tags: ['Discord', 'Community'],
              threadCount: 19,
              postCount: 152,
              latestPost: {
                title: 'Best way to onboard people from site to Discord?',
                author: 'CommunityBuilder',
                time: '5h ago',
              },
            },
          ],
        },
        {
          id: 'real-world-progress',
          name: 'Real-World Progress',
          description: 'Celebrate wins, share momentum, and discuss confidence-building in real life.',
          boards: [
            {
              id: 'irl-achievements',
              icon: '🏆',
              name: 'IRL Achievements',
              description: 'Share real-world wins, habits, progress, and moments of personal growth.',
              tags: ['IRL', 'Wins'],
              threadCount: 14,
              postCount: 98,
              latestPost: {
                title: 'First big IRL confidence win this month',
                author: 'RespawnMember',
                time: '9h ago',
              },
            },
          ],
        },
      ],
    };
  },

  computed: {
    totalBoards() {
      return this.forumCategories.reduce((total, category) => {
        return total + category.boards.length;
      }, 0);
    },

    totalThreads() {
      return this.forumCategories.reduce((total, category) => {
        return total + category.boards.reduce((boardTotal, board) => boardTotal + board.threadCount, 0);
      }, 0);
    },

    totalPosts() {
      return this.forumCategories.reduce((total, category) => {
        return total + category.boards.reduce((boardTotal, board) => boardTotal + board.postCount, 0);
      }, 0);
    },

    latestActivityLabel() {
      return '2h ago';
    },

    scrollingFeaturedThreads() {
      return [...this.featuredThreads, ...this.featuredThreads].map((thread, index) => ({
        ...thread,
        renderId: `${thread.id}-${index}`,
      }));
    },
  },

  methods: {
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
      if (section) {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    },
  },
};