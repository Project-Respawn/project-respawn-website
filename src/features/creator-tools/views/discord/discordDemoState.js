export const DISCORD_DEMO_NOTICE = Object.freeze({
  status: 'Not connected — interactive demo',
  save: 'Saved in demo',
  disclaimer: 'Nothing is being sent to Discord.',
})

export const discordSections = Object.freeze([
  ['overview', 'Overview'], ['commands', 'Commands'], ['greetings', 'Welcome & goodbye'],
  ['roles', 'Roles'], ['moderation', 'Moderation'], ['announcements', 'Announcements'],
  ['campaigns', 'Polls & giveaways'], ['community', 'Community'], ['events', 'Events'],
  ['automation', 'Automation'], ['analytics', 'Analytics'], ['settings', 'Settings'],
].map(([key, label]) => ({ key, label })))

export const demoChannels = Object.freeze([
  { id: '1200000000000000001', name: 'welcome-lounge', kind: 'Text' },
  { id: '1200000000000000002', name: 'community-news', kind: 'Announcement' },
  { id: '1200000000000000003', name: 'mod-log', kind: 'Private text' },
  { id: '1200000000000000004', name: 'events-and-lfg', kind: 'Text' },
])

export const demoRoles = Object.freeze([
  { id: '1300000000000000001', name: 'New Recruit', position: 2, assignable: true },
  { id: '1300000000000000002', name: 'Verified Member', position: 4, assignable: true },
  { id: '1300000000000000003', name: 'Respawn Creator', position: 8, assignable: true },
  { id: '1300000000000000004', name: 'Supporter', position: 7, assignable: true },
  { id: '1300000000000000005', name: 'Project Respawn Bot', position: 10, assignable: false, managed: true },
  { id: '1300000000000000006', name: 'Community Lead', position: 12, assignable: false },
])

export const commandCatalogue = Object.freeze([
  ['respawn', 'Project Respawn', 'Discover the connected community hub.', 'Everyone', 'Explore Project Respawn, upcoming events and your community profile.', true, 'Foundation'],
  ['help', 'Utility', 'Browse available commands and guidance.', 'Everyone', 'Here are the commands available in this server…', true, 'Foundation'],
  ['community', 'Community', 'Open the server community summary.', 'Everyone', '1,284 members · 642 active this week', true, 'Concept'],
  ['events', 'Events', 'Show upcoming community events.', 'Everyone', 'Next up: Friday Game Night · 19:30 BST', true, 'Concept'],
  ['rewards', 'Rewards', 'View community points and rewards.', 'Verified member', 'You have 2,450 Community Points.', true, 'Concept'],
  ['achievements', 'Community', 'Show recent achievements.', 'Everyone', 'Three achievements are close to completion.', true, 'Concept'],
  ['profile', 'Community', 'Open a linked Respawn profile.', 'Verified member', 'Your safe Project Respawn profile link is ready.', true, 'Concept'],
  ['support', 'Utility', 'Find support routes.', 'Everyone', 'Choose website help or the community support channel.', true, 'Concept'],
  ['rules', 'Utility', 'Display the community rules.', 'Everyone', 'Be kind, stay safe, and help others respawn.', true, 'Concept'],
  ['report', 'Moderation', 'Preview a private report flow.', 'Verified member', 'Your report would be shared privately with moderators.', false, 'Planned'],
].map(([name, category, description, permission, response, enabled, status]) => ({ key: `/${name}`, name, category, description, permission, response, enabled, status })))

export const automationRules = Object.freeze([
  ['New member joins', 'Account is not a bot', 'Send welcome + assign New Recruit'],
  ['Twitch stream starts', 'Creator integration is active', 'Post notification in community-news'],
  ['Event created', 'Event is published', 'Post event card + schedule reminders'],
  ['Achievement earned', 'Announcement is enabled', 'Celebrate in welcome-lounge'],
  ['Supporter tier changes', 'Role mapping exists', 'Update Supporter role'],
  ['Moderation threshold reached', 'Three warnings in 30 days', 'Notify moderator roles'],
].map(([trigger, condition, action], index) => ({ id: `rule-${index + 1}`, trigger, condition, action, enabled: index < 4 })))

export const analyticsMetrics = Object.freeze([
  ['Member growth', '+42', '+18% this month'], ['Active members', '642', '50% of demo members'],
  ['Command use', '3,840', '/events leads this week'], ['Event participation', '38%', '+6 points'],
  ['Announcement engagement', '24%', 'Estimated interactions'], ['Reward activity', '1,126', 'Points actions'],
  ['Moderation trends', '−12%', 'Fewer flagged messages'], ['Connected members', '418', 'Twitch + Discord linked'],
  ['Community Score', '+14', 'Illustrative contribution'], ['Data confidence', 'Demo', 'Deterministic sample data'],
].map(([label, value, detail]) => ({ label, value, detail })))

export function createDiscordDemoState() {
  return {
    activeSection: 'overview', savedMessage: '',
    commands: commandCatalogue.map((item) => ({ ...item })),
    customCommands: [],
    customCommandDraft: { name: '', description: '', response: '' },
    greetings: {
      welcomeEnabled: true, goodbyeEnabled: false, welcomeChannelId: demoChannels[0].id,
      goodbyeChannelId: demoChannels[0].id, welcomeTemplate: 'Welcome {user} to {server}! You are member {memberCount}.',
      goodbyeTemplate: '{user} has left {server}. We hope to see you again.', welcomeImage: false,
    },
    roles: { autoroleId: demoRoles[0].id, verifiedRoleId: demoRoles[1].id, creatorRoleId: demoRoles[2].id, supporterRoleId: demoRoles[3].id },
    moderation: { spam: true, links: true, invites: true, repeats: true, caps: false, mentionLimit: 5, warningThreshold: 3, timeoutMinutes: 10, logChannelId: demoChannels[2].id, wordFilter: 'spoiler, scam-link', trustedRoleId: demoRoles[2].id },
    announcement: { channelId: demoChannels[1].id, title: 'Sunday Respawn Showcase', message: 'Join us for community highlights, creator updates and what comes next.', audienceRoleId: demoRoles[1].id, timing: 'Schedule', scheduledFor: 'Sunday · 19:00 Europe/London' },
    poll: { question: 'Which community night should we run next?', options: 'Co-op night\nTournament\nCreative showcase', duration: '24 hours', roleId: demoRoles[1].id },
    giveaway: { prize: 'Project Respawn merch bundle', requirement: 'Attend one community event', winners: 2, ends: 'Sunday · 21:00 Europe/London' },
    events: { channelId: demoChannels[3].id, reminders: true, roleInvites: true, recurring: true, attendanceRewards: true },
    automation: automationRules.map((item) => ({ ...item })),
    settings: { displayName: 'Project Respawn', responseStyle: 'Friendly & concise', language: 'English (UK)', timezone: 'Europe/London', defaultChannelId: demoChannels[0].id, moderatorRoleId: demoRoles[5].id, notifications: true },
  }
}

export function validateCustomCommand(draft, existing = commandCatalogue) {
  const name = String(draft.name || '').trim().toLowerCase().replace(/^\//, '')
  if (!/^[a-z0-9_-]{2,32}$/.test(name)) return { valid: false, error: 'Use 2–32 lowercase letters, numbers, hyphens or underscores.' }
  if (existing.some((item) => item.name === name)) return { valid: false, error: `/${name} already exists.` }
  if (!String(draft.description || '').trim()) return { valid: false, error: 'Add a short description.' }
  if (!String(draft.response || '').trim()) return { valid: false, error: 'Add an example response.' }
  return { valid: true, command: { key: `/${name}`, name, category: 'Custom', permission: 'Everyone', status: 'Demo custom', enabled: true, description: draft.description.trim(), response: draft.response.trim() } }
}

const allowedPlaceholders = new Set(['user', 'server', 'memberCount'])
export function renderGreeting(template, values = {}) {
  const source = String(template || '')
  const unknown = [...source.matchAll(/\{([^{}]+)\}/g)].map((match) => match[1]).filter((key) => !allowedPlaceholders.has(key))
  if (unknown.length) return { valid: false, error: `Unknown placeholder: {${unknown[0]}}`, text: '' }
  const safe = source.replace(/@(everyone|here)/gi, '@\u200b$1')
  return {
    valid: true, error: '',
    text: safe.replace(/\{user\}/g, values.user || '@Nova').replace(/\{server\}/g, values.server || 'Respawn Creators').replace(/\{memberCount\}/g, String(values.memberCount || '1,285')),
  }
}

export function roleRestriction(roleId) {
  const role = demoRoles.find((item) => item.id === roleId)
  if (!role) return 'Unknown role ID'
  if (role.managed) return 'Discord-managed roles cannot be assigned.'
  if (!role.assignable) return 'This role is above the demonstration bot role.'
  return ''
}
