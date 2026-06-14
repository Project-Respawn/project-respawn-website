export default {
  name: 'ForumLayout',

  data() {
    return {
      forumSections: [
        {
          id: 'project-respawn',
          name: 'Project Respawn',
          boards: [
            { id: 'announcements', name: 'Announcements', icon: '📢' },
            { id: 'feature-ideas', name: 'Feature Ideas', icon: '💡' },
            { id: 'bug-reports', name: 'Bug Reports', icon: '🛠️' },
            { id: 'app-development', name: 'App Development', icon: '🧠' },
          ],
        },
        {
          id: 'creator-community',
          name: 'Creator Community',
          boards: [
            { id: 'twitch-growth', name: 'Twitch Growth', icon: '🎥' },
            { id: 'discord-communities', name: 'Discord Communities', icon: '💬' },
          ],
        },
        {
          id: 'real-world-progress',
          name: 'Real World Progress',
          boards: [
            { id: 'irl-achievements', name: 'IRL Achievements', icon: '🏆' },
          ],
        },
      ],

      recentActivity: [
        {
          id: 'activity-1',
          icon: '💬',
          title: 'You replied to “How should forum permissions work by role?”',
          board: 'App Development',
          time: '18m ago',
        },
        {
          id: 'activity-2',
          icon: '⭐',
          title: 'Your post was featured in Feature Ideas',
          board: 'Feature Ideas',
          time: '1h ago',
        },
        {
          id: 'activity-3',
          icon: '↩️',
          title: 'New reply on your creator rewards discussion',
          board: 'Feature Ideas',
          time: '2h ago',
        },
        {
          id: 'activity-4',
          icon: '📌',
          title: 'A followed thread was pinned by staff',
          board: 'Discord Communities',
          time: '5h ago',
        },
        {
          id: 'activity-5',
          icon: '📝',
          title: 'You posted in IRL Achievements',
          board: 'IRL Achievements',
          time: '9h ago',
        },
      ],

      friendsOnline: [
        {
          id: 'friend-1',
          initials: 'RC',
          name: 'RespawnCreator',
          status: 'Online · In Twitch Growth',
        },
        {
          id: 'friend-2',
          initials: 'CB',
          name: 'CommunityBuilder',
          status: 'Online · Reading Discord Communities',
        },
        {
          id: 'friend-3',
          initials: 'RP',
          name: 'RespawnPal',
          status: 'Online · Active 2m ago',
        },
        {
          id: 'friend-4',
          initials: 'FM',
          name: 'FounderMate',
          status: 'Online · Viewing Feature Ideas',
        },
      ],
    };
  },

  computed: {
    currentPageTitle() {
      const boardSlug = this.$route.params.boardSlug;
      const threadSlug = this.$route.params.threadSlug;

      if (threadSlug) {
        return 'Thread Discussion';
      }

      if (boardSlug) {
        const allBoards = this.forumSections.flatMap(section => section.boards);
        const currentBoard = allBoards.find(board => board.id === boardSlug);
        return currentBoard?.name || 'Board View';
      }

      return 'Forum Overview';
    },
  },

  methods: {
    goToForumHome() {
      this.$router.push('/forum');
    },

    goToBoard(boardSlug) {
      this.$router.push(`/forum/board/${boardSlug}`);
    },

    isBoardActive(boardSlug) {
      return this.$route.params.boardSlug === boardSlug;
    },
  },
};