const THREAD_LIBRARY = {
  'forum-permissions-role-discussion': {
    id: 'forum-permissions-role-discussion',
    boardSlug: 'app-development',
    boardName: 'App Development',
    title: 'How should forum permissions work by role?',
    excerpt:
      'A working discussion on how staff, moderators, and members should interact with the forum system as Project Respawn grows.',
    isPinned: true,
    isFeatured: true,
    isLocked: false,
    replyCount: 21,
    viewCount: 266,
    participantCount: 8,
    lastActivity: '22m ago',
    posts: [
      {
        id: 'post-1',
        author: 'Founder',
        avatar: 'F',
        role: 'Project Lead',
        joined: 'Jun 2026',
        postCount: 184,
        postedAt: '1d ago',
        isOriginalPost: true,
        isStaff: true,
        content: [
          'I want the permissions system for the forums to stay simple at first, but still be strong enough that we can properly test real differences between member, moderator, and admin experiences.',
          'My current thinking is that permissions should mostly live at board level first. That means some boards could be public, some member-only, and some just for moderators or staff while we test internal workflows.',
          'Longer term, I think we may also want thread-level moderation actions like locking, pinning, and featuring to sit inside the same broader permissions structure rather than being handled as one-off hardcoded checks.',
        ],
      },
      {
        id: 'post-2',
        author: 'Admin',
        avatar: 'A',
        role: 'Administrator',
        joined: 'Jun 2026',
        postCount: 96,
        postedAt: '20h ago',
        isOriginalPost: false,
        isStaff: true,
        content: [
          'Board-level access first makes the most sense. It gives us the clearest way to prove the backend permissions are actually doing something useful instead of just existing in the admin panel.',
          'If we return the effective permissions with each board and thread response, the front end can stay pretty dumb and just show or hide actions based on the response instead of duplicating permission logic everywhere.',
        ],
      },
      {
        id: 'post-3',
        author: 'RespawnMember',
        avatar: 'R',
        role: 'Member',
        joined: 'Jun 2026',
        postCount: 28,
        postedAt: '12h ago',
        isOriginalPost: false,
        isStaff: false,
        content: [
          'From a normal user perspective, I think the most important thing is that restricted areas do not feel broken. Either hide them entirely or label them clearly so users understand why they cannot post there.',
          'It would also be nice if public boards could still show read-only threads for guests while requiring login to reply.',
        ],
      },
      {
        id: 'post-4',
        author: 'Moderator',
        avatar: 'M',
        role: 'Moderator',
        joined: 'Jun 2026',
        postCount: 61,
        postedAt: '3h ago',
        isOriginalPost: false,
        isStaff: true,
        content: [
          'Moderation tools should probably be tied to the same permissions matrix but exposed separately in the UI so moderators are not overwhelmed with admin-only options.',
          'I would separate canView, canPost, canReply, canLock, canPin, and canFeature. That keeps the model readable and makes it easier to test combinations later.',
        ],
      },
    ],
  },

  'creator-milestones-profile-rewards': {
    id: 'creator-milestones-profile-rewards',
    boardSlug: 'feature-ideas',
    boardName: 'Feature Ideas',
    title: 'Should creator milestones unlock profile rewards?',
    excerpt:
      'A discussion about whether progress on the platform should unlock profile cosmetics, badges, or extra visibility features.',
    isPinned: true,
    isFeatured: true,
    isLocked: false,
    replyCount: 18,
    viewCount: 240,
    participantCount: 6,
    lastActivity: '18m ago',
    posts: [
      {
        id: 'reward-post-1',
        author: 'RespawnMember',
        avatar: 'R',
        role: 'Member',
        joined: 'Jun 2026',
        postCount: 34,
        postedAt: '4h ago',
        isOriginalPost: true,
        isStaff: false,
        content: [
          'I think profile rewards could help make progress feel more visible and motivating, especially if they are tied to meaningful milestones instead of just raw activity counts.',
          'Badges, profile frames, or unlockable identity pieces could be a good fit as long as they feel earned and do not turn into spammy gamification.',
        ],
      },
      {
        id: 'reward-post-2',
        author: 'Founder',
        avatar: 'F',
        role: 'Project Lead',
        joined: 'Jun 2026',
        postCount: 184,
        postedAt: '18m ago',
        isOriginalPost: false,
        isStaff: true,
        content: [
          'I like the idea if it reinforces real progress and community participation rather than empty grinding. We could also tie some rewards to IRL achievements or creator consistency rather than only forum activity.',
        ],
      },
    ],
  },
};

const DEFAULT_THREAD = {
  id: 'default-thread',
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

export default {
  name: 'ForumThread',
  props: {
    threadSlug: {
      type: String,
      default: '',
    },
  },
  computed: {
    thread() {
      return THREAD_LIBRARY[this.threadSlug] || DEFAULT_THREAD;
    },
  },
};