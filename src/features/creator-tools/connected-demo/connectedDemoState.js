import { reactive } from 'vue'

export const CONNECTED_DEMO_VERSION = 1
export const CONNECTED_DEMO_STORAGE_KEY = 'project-respawn.creator-tools.connected-demo.v1'

export function createConnectedDemoState() {
  return {
    schemaVersion: CONNECTED_DEMO_VERSION,
    selectedMemberId: 'member-nova',
    visiblePlatforms: ['twitch', 'discord', 'respawn'],
    connectedHighlight: false,
    milestoneHighlight: false,
    selectedRewardId: '',
    overlayPreviewOpen: false,
    nova: {
      id: 'member-nova', name: 'Nova#1234', status: 'Online', tier: 'Bronze',
      identities: [
        { platform: 'respawn', label: 'Project Respawn', handle: 'Nova#1234', authorised: true },
        { platform: 'twitch', label: 'Twitch', handle: 'novaplays', authorised: true },
        { platform: 'discord', label: 'Discord', handle: 'Nova', authorised: true },
      ],
      balance: 2450, contribution: 12.4, eventsAttended: 7, achievements: 13,
    },
    event: { id: 'event-friday-game-night', title: 'Friday Game Night', category: 'Cooperative Adventure', date: 'May 16, 2025', time: '19:30 BST', rsvp: false, attended: false, platforms: ['twitch', 'discord', 'respawn'], recurring: true, announcementsPreviewed: false },
    reward: { id: 'reward-friday-attendance', points: 100, tested: false, granted: false },
    achievement: { id: 'achievement-community-regular', name: 'Community Regular', progress: 4, goal: 5, unlocked: false, overlayEnabled: true },
    activity: [
      { id: 'activity-connected', icon: '↗', title: 'Nova linked three community identities', detail: 'Member-authorised connections', time: '2 days ago' },
    ],
  }
}

export function isConnectedDemoState(value) {
  return Boolean(value && value.schemaVersion === CONNECTED_DEMO_VERSION && value.nova?.id === 'member-nova' && Array.isArray(value.nova.identities) && value.event?.id === 'event-friday-game-night' && value.reward?.id === 'reward-friday-attendance' && value.achievement?.id === 'achievement-community-regular' && Array.isArray(value.activity))
}

export function restoreConnectedDemoState(storage) {
  try { const parsed = JSON.parse(storage?.getItem(CONNECTED_DEMO_STORAGE_KEY) || 'null'); return isConnectedDemoState(parsed) ? parsed : createConnectedDemoState() } catch { return createConnectedDemoState() }
}

const storage = typeof window === 'undefined' ? null : window.sessionStorage
export const connectedDemo = reactive(restoreConnectedDemoState(storage))
function persist() { if (storage) storage.setItem(CONNECTED_DEMO_STORAGE_KEY, JSON.stringify(connectedDemo)) }
function activity(id, icon, title, detail) { connectedDemo.activity = [{ id, icon, title, detail, time: 'Just now' }, ...connectedDemo.activity.filter(item => item.id !== id)].slice(0, 8) }

export function resetConnectedDemo() { Object.assign(connectedDemo, createConnectedDemoState()); persist() }
export function selectDemoMember(id) { connectedDemo.selectedMemberId = id; persist() }
export function toggleDemoPlatform(platform) { const values = connectedDemo.visiblePlatforms; connectedDemo.visiblePlatforms = values.includes(platform) ? values.filter(item => item !== platform) : [...values, platform]; persist() }
export function highlightConnectedMembers() { connectedDemo.connectedHighlight = true; connectedDemo.milestoneHighlight = true; activity('activity-milestone', '✦', 'Connected Community milestone highlighted', '1,126 members connected across platforms'); persist() }
export function setEventPlatform(platform, enabled) { const values = connectedDemo.event.platforms; connectedDemo.event.platforms = enabled ? [...new Set([...values, platform])] : values.filter(item => item !== platform); persist() }
export function previewAnnouncements() { connectedDemo.event.announcementsPreviewed = true; activity('activity-preview', '◉', 'Friday Game Night announcements previewed', 'Twitch, Discord and Project Respawn · Demo only'); persist() }
export function rsvpNova() { connectedDemo.event.rsvp = true; activity('activity-rsvp', '✓', 'Nova RSVP’d to Friday Game Night', 'Attendance response recorded in this browser'); persist() }
export function attendFridayGameNight() { connectedDemo.event.rsvp = true; connectedDemo.event.attended = true; connectedDemo.nova.eventsAttended = 8; connectedDemo.achievement.progress = 5; connectedDemo.nova.contribution = 13.1; activity('activity-attended', '▣', 'Nova attended Friday Game Night', 'Community Regular reached 5 / 5'); persist() }
export function testReward() { connectedDemo.reward.tested = true; activity('activity-test-reward', '⚗', 'Attendance reward tested', 'No points were issued during the test'); persist() }
export function grantAttendanceReward() { if (!connectedDemo.reward.granted) { connectedDemo.reward.granted = true; connectedDemo.nova.balance += 100; activity('activity-points', '✦', 'Nova received 100 Community Points', 'Verified Friday Game Night attendance') } persist() }
export function selectReward(id) { connectedDemo.selectedRewardId = id; persist() }
export function unlockCommunityRegular() { connectedDemo.achievement.progress = 5; connectedDemo.achievement.unlocked = true; connectedDemo.nova.achievements = 14; activity('activity-achievement', '🏆', 'Community Regular unlocked', 'Nova attended 5 community events'); persist() }
export function showOverlayPreview() { connectedDemo.overlayPreviewOpen = true; persist() }
export function closeOverlayPreview() { connectedDemo.overlayPreviewOpen = false; persist() }
export function communityMetrics(state = connectedDemo) { const count = state.visiblePlatforms.length; return { total: 2840, connected: count === 3 ? 1126 : count === 2 ? 784 : count === 1 ? 512 : 0, score: Math.min(100, 78 + count * 2 + (state.event.attended ? 1 : 0)), confidence: count === 3 ? 91 : count === 2 ? 82 : count === 1 ? 70 : 0 } }
