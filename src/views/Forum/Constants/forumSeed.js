export const STARTER_CATEGORIES = [
  {
    name: 'Project Respawn',
    slug: 'project-respawn',
    description: 'Official updates, platform feedback, and app-building discussion.',
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
    description: 'Share momentum, discipline, and real-life wins outside the screen.',
    sortOrder: 3,
    isActive: true,
  },
];

export const STARTER_BOARDS = [
  { categorySlug: 'project-respawn', name: 'Announcements', slug: 'announcements', description: 'Official platform updates, releases, and important news.', sortOrder: 1, isActive: true },
  { categorySlug: 'project-respawn', name: 'Feature Ideas', slug: 'feature-ideas', description: 'Suggest improvements, vote on ideas, and help shape the roadmap.', sortOrder: 2, isActive: true },
  { categorySlug: 'project-respawn', name: 'Bug Reports', slug: 'bug-reports', description: 'Report issues, strange behavior, and things that need fixing.', sortOrder: 3, isActive: true },
  { categorySlug: 'project-respawn', name: 'App Development', slug: 'app-development', description: 'Discuss implementation, product direction, architecture, and builds.', sortOrder: 4, isActive: true },
  { categorySlug: 'creator-community', name: 'Twitch Growth', slug: 'twitch-growth', description: 'Streaming strategy, retention, content loops, and channel growth.', sortOrder: 1, isActive: true },
  { categorySlug: 'creator-community', name: 'Discord Communities', slug: 'discord-communities', description: 'Community design, moderation, events, and healthy group culture.', sortOrder: 2, isActive: true },
  { categorySlug: 'real-world', name: 'Achievements', slug: 'achievements', description: 'Post real-life wins, habits, milestones, and personal progress.', sortOrder: 1, isActive: true },
  { categorySlug: 'real-world', name: 'Help & Advice', slug: 'help-and-advice', description: 'Ask for support, share advice, and help other members with real-world challenges.', sortOrder: 2, isActive: true },
];
