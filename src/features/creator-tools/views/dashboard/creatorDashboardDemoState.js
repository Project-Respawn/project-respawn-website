export const CARD_STATES = Object.freeze({ LOCKED: 'locked', EMPTY: 'empty', ACTIVE: 'active' })

export const setupSteps = Object.freeze([
  { id: 'profile', label: 'Create Creator Profile', description: 'Set up your creator identity', requires: [] },
  { id: 'twitch', label: 'Connect Twitch', description: 'Unlock stream tools and alerts', requires: ['profile'] },
  { id: 'discord', label: 'Connect Discord', description: 'Build your community home', requires: ['profile'] },
  { id: 'bot', label: 'Install Respawn Bot', description: 'Add the bot to your server', requires: ['discord'] },
  { id: 'twitchTools', label: 'Configure Twitch Tools', description: 'Set commands and stream tools', requires: ['twitch'] },
  { id: 'community', label: 'Configure Community', description: 'Set channels, roles and permissions', requires: ['discord'] },
  { id: 'reward', label: 'Create Your First Reward', description: 'Reward your community', requires: ['community'] },
  { id: 'achievement', label: 'Create Your First Achievement', description: 'Set goals for your community', requires: ['community'] },
  { id: 'event', label: 'Create Your First Event', description: 'Bring your community together', requires: ['profile'] },
  { id: 'members', label: 'Invite Members', description: 'Grow your community', requires: ['community'] },
])

export const presets = Object.freeze({
  fresh: { label: 'Start / Fresh', completed: ['profile'] },
  partial: { label: 'Partially Configured', completed: ['profile', 'twitch', 'discord', 'bot', 'twitchTools', 'community'] },
  full: { label: 'Fully Configured', completed: setupSteps.map(({ id }) => id) },
})

export const dashboardCards = Object.freeze([
  { key: 'members', title: 'Community Members', icon: 'members', routeName: 'CreatorMembers', requires: ['discord'], activeWhen: 'members', value: '1,284', detail: '+42 this month', lockedText: 'Connect Discord to unlock.', emptyText: 'Your community is ready for its first members.', info: 'View and manage the people in your creator community, including their activity, achievements and rewards.' },
  { key: 'active', title: 'Active This Week', icon: 'pulse', routeName: 'CreatorAnalytics', requires: ['discord'], activeWhen: 'community', value: '642', detail: '50% of members', lockedText: 'Connect Discord to unlock.', emptyText: 'Activity will appear as your community engages.', info: 'See how many community members have participated during the last seven days.' },
  { key: 'newMembers', title: 'New Members', icon: 'new', routeName: 'CreatorMembers', requires: ['discord'], activeWhen: 'members', value: '42', detail: '+18% this month', lockedText: 'Connect Discord to unlock.', emptyText: 'New member growth will appear here.', info: 'Track newly joined members and open the member management area.' },
  { key: 'score', title: 'Community Score', icon: 'chart', routeName: 'CreatorAnalytics', requires: ['twitch', 'discord'], activeWhen: 'community', value: '84', suffix: '/ 100', detail: 'Excellent engagement', lockedText: 'Connect Twitch and Discord to unlock.', emptyText: 'Complete community setup to establish a score.', info: 'A demonstration of a future cross-platform community engagement metric.' },
  { key: 'activity', title: 'Community Activity', icon: 'pulse', routeName: 'CreatorAnalytics', requires: ['twitch', 'discord'], activeWhen: 'community', emptyText: 'Community activity will appear as people engage.', info: 'See a high-level trend across your connected creator platforms.' },
  { key: 'recent', title: 'Recent Activity', icon: 'bolt', routeName: 'CreatorCommunity', requires: ['discord'], activeWhen: 'community', emptyText: 'No community activity yet.', info: 'Review recent joins, achievements, reward redemptions and community milestones.' },
  { key: 'events', title: 'Upcoming Events', icon: 'calendar', routeName: 'CreatorEvents', requires: ['profile'], activeWhen: 'event', emptyText: "You haven't created an event yet.", info: 'Plan community events and see what is coming up next.' },
  { key: 'rewards', title: 'Rewards', icon: 'gift', routeName: 'CreatorRewards', requires: ['community'], activeWhen: 'reward', emptyText: 'Create your first community reward.', info: 'Create rewards that members can unlock and redeem.' },
  { key: 'achievements', title: 'Achievements', icon: 'trophy', routeName: 'CreatorAchievements', requires: ['community'], activeWhen: 'achievement', emptyText: 'Create your first achievement.', info: 'Set community goals and celebrate member milestones.' },
  { key: 'bots', title: 'Bots & Automation', icon: 'bot', routeName: 'CreatorBots', requires: ['discord', 'bot'], activeWhen: 'bot', emptyText: 'Your bot is ready to configure.', info: 'Automate and enhance your community experience with creator bots and workflows.' },
  { key: 'analytics', title: 'Analytics', icon: 'chart', routeName: 'CreatorAnalytics', requires: ['twitch', 'discord'], activeWhen: 'community', emptyText: 'Insights will appear as your community grows.', info: 'Explore growth and engagement insights across your creator community.' },
])

export const platforms = Object.freeze([
  { key: 'twitch', name: 'Twitch', icon: '●', step: 'twitch', routeName: 'CreatorTwitch' },
  { key: 'discord', name: 'Discord', icon: '●', step: 'discord', routeName: 'CreatorDiscord' },
  { key: 'youtube', name: 'YouTube', icon: '▶', step: null, routeName: 'CreatorIntegrations' },
  { key: 'tiktok', name: 'TikTok', icon: '♪', step: null, routeName: 'CreatorIntegrations' },
  { key: 'steam', name: 'Steam', icon: '●', step: null, routeName: 'CreatorIntegrations' },
])

export const recentActivity = Object.freeze([
  { icon: 'members', text: 'Nova joined your Discord community', time: '8 min ago' },
  { icon: 'trophy', text: 'PixelPilot unlocked Regular', time: '24 min ago' },
  { icon: 'gift', text: 'RavenAsh redeemed VIP Game', time: '1 hr ago' },
  { icon: 'bolt', text: 'Mika earned 250 Kudos', time: '2 hrs ago' },
])

export const upcomingEvents = Object.freeze([
  { title: 'Friday Game Night', date: '14 August · 19:30', attending: '28 attending' },
  { title: 'Community Run', date: '17 August · 09:00', attending: '12 attending' },
])

export const activityPoints = Object.freeze([8, 14, 12, 28, 34, 26, 18, 25, 23, 32, 29, 42, 47, 39, 35, 44, 53, 46, 55])

export function createDemoState(preset = 'fresh') {
  return { preset, completed: [...presets[preset].completed] }
}

export function isComplete(state, id) { return state.completed.includes(id) }

export function progress(state) { return Math.round((state.completed.length / setupSteps.length) * 100) }

export function unmetDirectRequirements(state, requirementIds) {
  return requirementIds.filter((id) => !isComplete(state, id))
}

export function nextActionableStep(state, requirementIds) {
  const unmet = unmetDirectRequirements(state, requirementIds)
  for (const id of unmet) {
    const step = setupSteps.find((item) => item.id === id)
    const unmetParents = unmetDirectRequirements(state, step.requires)
    if (unmetParents.length) return setupSteps.find((item) => item.id === unmetParents[0])
    return step
  }
  return null
}

export function resolveCard(card, state) {
  const unmet = unmetDirectRequirements(state, card.requires)
  if (unmet.length) return { ...card, state: CARD_STATES.LOCKED, unmet, directRequirements: unmet.map((id) => setupSteps.find((step) => step.id === id)), nextStep: nextActionableStep(state, card.requires) }
  return { ...card, state: isComplete(state, card.activeWhen) ? CARD_STATES.ACTIVE : CARD_STATES.EMPTY, unmet: [], nextStep: null }
}
