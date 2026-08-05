import { getRecentForumActivity } from '../Services/forumApi';
import { formatRelativeTime } from '../Helpers/dateHelpers';

const ACTIVITY_PRESENTATION = {
  thread_viewed: { icon: '👁️', label: 'You viewed' },
  thread_created: { icon: '📝', label: 'You started' },
  reply_created: { icon: '💬', label: 'You replied to' },
  post_edited: { icon: '✏️', label: 'You edited a reply in' },
  post_deleted: { icon: '🗑️', label: 'You deleted a reply in' },
  thread_deleted: { icon: '🗑️', label: 'You deleted' },
  thread_pinned: { icon: '📌', label: 'You pinned' },
  thread_featured: { icon: '⭐', label: 'You featured' },
  thread_locked: { icon: '🔒', label: 'You locked' },
  thread_unlocked: { icon: '🔓', label: 'You unlocked' },
};

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
          id: 'real-world',
          name: 'Real World',
          boards: [
            { id: 'achievements', name: 'Achievements', icon: '🏆' },
            { id: 'help-and-advice', name: 'Help & Advice', icon: '🫶' },
          ],
        },
      ],

      recentActivity: [],

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
        const allBoards = this.forumSections.flatMap((section) => section.boards);
        const currentBoard = allBoards.find((board) => board.id === boardSlug);
        return currentBoard?.name || 'Board View';
      }

      return 'Forum Overview';
    },
  },

  async mounted() {
    await this.loadRecentActivity();
  },

  methods: {
    async loadRecentActivity() {
      try {
        const activity = await getRecentForumActivity(5);
        this.recentActivity = activity.map((item) => {
          const presentation = ACTIVITY_PRESENTATION[item.activityType] || {
            icon: '💬',
            label: 'Recent activity in',
          };

          return {
            id: item.id,
            icon: presentation.icon,
            title: `${presentation.label} “${item.threadTitle || 'a discussion'}”`,
            board: item.boardName || 'Forum',
            time: formatRelativeTime(item.occurredAt),
          };
        });
      } catch (error) {
        console.error('Failed to load recent forum activity:', error);
        this.recentActivity = [];
      }
    },

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
