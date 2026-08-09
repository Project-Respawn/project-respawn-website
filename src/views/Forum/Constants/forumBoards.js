const BOARD_ICONS = {
  announcements: '📢',
  'feature-ideas': '💡',
  'bug-reports': '🛠️',
  'app-development': '🧠',
  'twitch-growth': '🎥',
  'discord-communities': '💬',
  achievements: '🏆',
  'help-and-advice': '🫶',
};

const BOARD_RULES = {
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

const INDEX_BOARD_TAGS = {
  announcements: ['Official', 'Updates'],
  'feature-ideas': ['Feedback', 'Ideas'],
  'bug-reports': ['Support', 'Issues'],
  'app-development': ['Build', 'Roadmap'],
  'twitch-growth': ['Streaming', 'Growth'],
  'discord-communities': ['Discord', 'Community'],
  achievements: ['Achievements', 'Wins'],
  'help-and-advice': ['Help', 'Advice', 'Support'],
};

const BOARD_PAGE_TAGS = {
  announcements: ['Official', 'Updates'],
  'feature-ideas': ['Feedback', 'Ideas', 'Product'],
  'bug-reports': ['Support', 'Issues'],
  'app-development': ['Build', 'Roadmap', 'Development'],
  'twitch-growth': ['Streaming', 'Growth', 'Creator'],
  'discord-communities': ['Discord', 'Community', 'Moderation'],
  achievements: ['Achievements', 'Wins', 'Progress'],
  'help-and-advice': ['Help', 'Advice', 'Support'],
};

export function getBoardIcon(boardSlug) {
  return BOARD_ICONS[boardSlug] || '🗂️';
}

export function getBoardRules(boardSlug) {
  return (
    BOARD_RULES[boardSlug] ||
    'Keep conversations constructive, helpful, and focused on community growth.'
  );
}

export function getBoardTags(boardSlug, display = 'board') {
  const tags = display === 'index' ? INDEX_BOARD_TAGS : BOARD_PAGE_TAGS;
  return tags[boardSlug] || ['Community'];
}
