export const analyticsPresets = Object.freeze({
  fresh: { label: 'Fresh', description: 'No analytics sources connected yet.' },
  partial: { label: 'Partial', description: 'Twitch, Discord and limited linked-member data.' },
  full: { label: 'Full Demo', description: 'A complete simulated creator intelligence view.' },
})

export const timeOptions = Object.freeze(['7 Days', '30 Days', '90 Days', '6 Months', '1 Year', '2 Years', '3 Years', 'All Time', 'Custom'])
export const sourceOptions = Object.freeze(['All Creator Data', 'Twitch', 'YouTube', 'Instagram', 'Discord', 'Project Respawn', 'Cross Platform'])
export const audienceOptions = Object.freeze(['All Members', 'New Members', 'Active Members', 'Highly Engaged', 'Mission Participants', 'Event Participants', 'Supporters', 'Non-Supporters', 'Single Creator Supporters', 'All Access Supporters', 'Bronze Supporters', 'Silver Supporters', 'Gold Supporters'])
export const chartMetrics = Object.freeze(['Respawn Members', 'Twitch Followers', 'Discord Members', 'Community Score', 'Creator Score', 'Viewers', 'Creator Earnings'])

export const analyticsSections = Object.freeze([
  { key: 'overview', label: 'Overview', available: true },
  { key: 'community', label: 'Community' }, { key: 'content', label: 'Content' },
  { key: 'engagement', label: 'Engagement' }, { key: 'missions', label: 'Missions' },
  { key: 'platforms', label: 'Platforms' }, { key: 'earnings', label: 'Earnings' },
  { key: 'trends', label: 'Trends & Insights' }, { key: 'reports', label: 'Reports' },
])

const historyLength = 48
const makeHistory = (base, growth, wave = 8) => Array.from({ length: historyLength }, (_, index) => Math.round(base + growth * index + Math.sin(index / 2.7) * wave + Math.cos(index / 5) * wave * .45))

export const histories = Object.freeze({
  'Respawn Members': makeHistory(228, 22, 35), 'Twitch Followers': makeHistory(3100, 115, 170),
  'Discord Members': makeHistory(310, 18, 30), 'Community Score': makeHistory(58, .68, 3),
  'Creator Score': makeHistory(53, .63, 3), Viewers: makeHistory(72, 4.2, 18), 'Creator Earnings': makeHistory(180, 23, 55),
})

export const milestones = Object.freeze([
  { index: 8, title: 'Discord Connected', date: 'September 2023', detail: 'Linked-member coverage began to improve after Discord was connected.' },
  { index: 20, title: 'Missions Launched', date: 'September 2024', detail: 'Engagement was 61% before launch and 72% during the following 90 days.' },
  { index: 28, title: 'Events Launched', date: 'May 2025', detail: 'Repeat participation increased in the following quarter.' },
  { index: 36, title: 'Affiliate Programme Launched', date: 'January 2026', detail: 'Commercial conversions became measurable from this point.' },
  { index: 41, title: 'Rewards Launched', date: 'June 2026', detail: 'Reward usage and mission completion moved together after launch.' },
])

const full = Object.freeze({
  primary: [
    { key: 'creator', title: 'Creator Score', value: '82', suffix: '/ 100', change: '+4 from last 30 days', info: 'A provisional demo measure of overall creator performance. The methodology is still being developed.', detail: 'Potential signals include Community Score, reach, growth, platform performance, consistency and commercial performance. No production weighting is established.' },
    { key: 'community', title: 'Community Score', value: '91', suffix: '/ 100', change: '+6 from last 30 days', info: 'Community Score measures engagement, not popularity. A smaller highly engaged community can score higher than a much larger inactive community.', detail: 'Built from participation, retention and engagement rates. Audience size, spending and membership tier do not directly increase this score.' },
    { key: 'viewers', title: 'Average Concurrent Viewers', value: '250', change: '+18 average viewers', info: 'Average viewers present at the same time across the selected Twitch period.', detail: 'Peak viewers were 612, with 8,921 unique viewers during this simulated period.' },
    { key: 'active', title: 'Active Respawn Members', value: '1,124', change: '+12% active members', info: 'Respawn members who completed a measurable community activity during the selected period.', detail: '87.5% of the 1,284 simulated Respawn members were active.' },
    { key: 'growth', title: 'Follower Growth', value: '+2,847', change: 'vs previous 30 days', info: 'Combined change indicators remain platform-specific beneath this summary and are not treated as unique people.', detail: 'A compact directional signal across independently reported creator channels. It is not a unique-audience total.' },
  ],
  platforms: [
    { name: 'Twitch', tone: 'twitch', total: '18,420', label: 'Followers', change: '+582', metrics: ['250 avg viewers', '612 peak viewers', '684 unique chatters', '14,820 chat messages'] },
    { name: 'YouTube', tone: 'youtube', total: '12,840', label: 'Subscribers', change: '+721', metrics: ['98,421 views', '21,284 unique viewers', '8,240 watch hours', '6m 42s avg duration'] },
    { name: 'Instagram', tone: 'instagram', total: '24,610', label: 'Followers', change: '+1,204', metrics: ['142,810 reach', '9,214 engaged accounts', '2,861 shares', '4,208 saves'] },
    { name: 'Discord', tone: 'discord', total: '3,482', label: 'Members', change: '+214', metrics: ['2,106 active members', '42,810 messages', '86% retention', '24 active channels'] },
  ],
  connected: { total: '1,284', linked: [['Twitch Linked', '984'], ['Discord Linked', '1,026'], ['YouTube Linked', '621'], ['Instagram Linked', '482'], ['Twitch + Discord', '684'], ['All Platforms', '142']] },
  crossPlatform: [['Twitch linked', '984'], ['Discord linked', '1,026'], ['Both linked', '684'], ['Cross-platform coverage', '53%'], ['Engaged on Twitch', '521'], ['Engaged in Discord', '574'], ['Engaged on both', '418'], ['Mission participants', '362'], ['Event attendees', '194'], ['Achievement participants', '286'], ['Reward users', '172']],
  confidence: { level: 'High', coverage: 53, text: 'Richer linked-member coverage provides stronger evidence for cross-platform insights. Linking improves evidence coverage, not creator performance.' },
})

const partial = Object.freeze({
  ...full,
  primary: full.primary.map((item) => item.key === 'creator' ? { ...item, value: '68', change: '+2 this period' } : item.key === 'community' ? { ...item, value: '76', change: '+3 this period' } : item),
  platforms: full.platforms.filter(({ name }) => ['Twitch', 'Discord'].includes(name)),
  connected: { total: '486', linked: [['Twitch Linked', '312'], ['Discord Linked', '401'], ['Twitch + Discord', '198'], ['All Platforms', '0']] },
  crossPlatform: [['Twitch linked', '312'], ['Discord linked', '401'], ['Both linked', '198'], ['Cross-platform coverage', '41%'], ['Engaged on both', '116']],
  confidence: { level: 'Medium', coverage: 41, text: 'Some linked-member evidence is available. More account linking would improve coverage, not performance scores.' },
})

export const insights = Object.freeze({
  working: [
    { title: 'Mission Engagement', score: 91, detail: 'Mission participation and repeat completion are both above the demo benchmark.' },
    { title: 'Community Growth', score: 86, detail: 'Respawn membership has grown for five consecutive quarters.' },
    { title: 'Cross Platform Engagement', score: 88, detail: 'Linked Twitch and Discord members show strong activity on both platforms.' },
    { title: 'Member Retention', score: 84, detail: '84% of previously active linked members returned during this period.' },
  ],
  improve: [
    { title: 'Event Participation', score: 63, detail: '842 eligible active members; 152 participated (18.1%). Friday Game Night was strongest. 690 active members did not participate.', actions: ['Create another community event', 'Create an event participation mission', 'Promote through Twitch and Discord'] },
    { title: 'Twitch Chat Engagement', score: 68, detail: 'Unique chatters grew more slowly than average concurrent viewers.' },
    { title: 'Content Consistency', score: 72, detail: 'Two missed publishing windows reduced repeat audience momentum.' },
    { title: 'Affiliate Conversion', score: 66, detail: 'Click volume is healthy, but offer conversion has room to improve.' },
  ],
})

export const journey = Object.freeze([['Engaged With Your Twitch', 19842], ['Joined Your Discord', 8421], ['Joined Your Respawn Community', 1284], ['Completed One of Your Missions', 742], ['Attended One of Your Events', 362], ['Earned One of Your Achievements', 286], ['Redeemed One of Your Rewards', 172], ['Still Active in Your Community', 1124]])
export const contentPerformance = Object.freeze([
  ['Twitch Stream', '2,841', '684', '+82', '31'], ['YouTube Video', '18,420', '1,842', '+194', '48'], ['Instagram Reel', '42,810', '3,214', '+286', '72'], ['YouTube Short', '61,284', '4,821', '+421', '86'],
])
export const missions = Object.freeze({ totals: [['Assigned', '1,842'], ['Started', '1,261'], ['Completed', '742'], ['Converted', '214']], top: [['Join Discord', 84], ['Attend Game Night', 72], ['Watch 3 Streams', 61], ['Complete Weekly Challenge', 56], ['Try Partner Offer', 31]] })
export const affiliates = Object.freeze([['Huel', '482', '36', '£276'], ['Green Man Gaming', '713', '54', '£391'], ['Replit', '229', '11', '£175']])
export const memberships = Object.freeze({
  metrics: [['Supporter Engagement Score', '87 / 100'], ['Supporter Retention', '82%'], ['Supporter Activity Trend', '+12%'], ['Mission Participation', '74%'], ['Event Participation', '61%'], ['Community Engagement', 'High']],
  insights: [['Most common tier', 'Bronze'], ['Fastest growing tier', 'Silver'], ['Highest retention tier', 'Gold'], ['Strongest supporter activity', 'Missions']],
  note: 'Engagement reporting intentionally excludes tier totals, access-type totals and Project Respawn subscription economics.',
})
export const bonusHistory = Object.freeze([1320, 1390, 1415, 1520, 1490, 1625, 1710, 1760, 1805, 1950])

export function createAnalyticsState(preset = 'full') { return { preset, time: '30 Days', source: 'All Creator Data', audience: 'All Members', chartMetric: 'Respawn Members' } }
export function getPresetData(preset) { if (preset === 'fresh') return null; return preset === 'partial' ? partial : full }
export function selectHistory(metric, time) {
  const values = histories[metric] || histories['Respawn Members']
  const count = { '7 Days': 7, '30 Days': 12, '90 Days': 18, '6 Months': 24, '1 Year': 30, '2 Years': 40, '3 Years': 48, 'All Time': 48, Custom: 20 }[time] || 12
  return values.slice(-count)
}
export function visibleMilestones(time) { const minimum = ['2 Years', '3 Years', 'All Time'].includes(time) ? 0 : time === '1 Year' ? 28 : 42; return milestones.filter(({ index }) => index >= minimum) }
export function sourcePlatforms(data, source) { if (!data) return []; if (source === 'All Creator Data' || source === 'Cross Platform' || source === 'Project Respawn') return data.platforms; return data.platforms.filter(({ name }) => name === source) }
export function communityScoreInputs() { return ['missionParticipationRate', 'retentionRate', 'eventParticipationRate', 'achievementParticipationRate', 'rewardParticipationRate', 'linkedEngagementRate'] }
