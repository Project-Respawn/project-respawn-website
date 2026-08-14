import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  CONNECTED_DEMO_STORAGE_KEY, CONNECTED_DEMO_VERSION, attendFridayGameNight,
  closeOverlayPreview, communityMetrics, connectedDemo, createConnectedDemoState,
  grantAttendanceReward, highlightConnectedMembers, isConnectedDemoState,
  resetConnectedDemo, restoreConnectedDemoState, rsvpNova, selectDemoMember,
  showOverlayPreview, toggleDemoPlatform, unlockCommunityRegular,
} from './connectedDemoState.js'

test('initial connected demo state is deterministic and fictional', () => {
  assert.deepEqual(createConnectedDemoState(), createConnectedDemoState())
  assert.equal(createConnectedDemoState().nova.name, 'Nova#1234')
  assert.equal(CONNECTED_DEMO_STORAGE_KEY, 'project-respawn.creator-tools.connected-demo.v1')
})
test('restoration validates version and required deterministic records', () => {
  const valid = createConnectedDemoState()
  assert.deepEqual(restoreConnectedDemoState({ getItem: () => JSON.stringify(valid) }), valid)
  assert.equal(restoreConnectedDemoState({ getItem: () => '{bad' }).schemaVersion, CONNECTED_DEMO_VERSION)
  assert.equal(restoreConnectedDemoState({ getItem: () => JSON.stringify({ schemaVersion: 0 }) }).nova.id, 'member-nova')
  assert.equal(isConnectedDemoState({ schemaVersion: CONNECTED_DEMO_VERSION }), false)
})
test('member selection and linked identities remain consistent', () => {
  resetConnectedDemo(); selectDemoMember('member-nova')
  assert.equal(connectedDemo.selectedMemberId, 'member-nova')
  assert.deepEqual(connectedDemo.nova.identities.map(item => item.platform), ['respawn', 'twitch', 'discord'])
  assert.ok(connectedDemo.nova.identities.every(item => item.authorised))
})
test('platform filtering changes overlap metrics locally', () => {
  resetConnectedDemo(); const full = communityMetrics(connectedDemo); toggleDemoPlatform('discord'); const filtered = communityMetrics(connectedDemo)
  assert.ok(filtered.connected < full.connected); assert.ok(filtered.confidence < full.confidence)
})
test('RSVP, attendance, reward and achievement tell one cross-page story', () => {
  resetConnectedDemo(); rsvpNova(); assert.equal(connectedDemo.event.rsvp, true)
  attendFridayGameNight(); assert.equal(connectedDemo.event.attended, true); assert.equal(connectedDemo.achievement.progress, 5)
  grantAttendanceReward(); assert.equal(connectedDemo.nova.balance, 2550); grantAttendanceReward(); assert.equal(connectedDemo.nova.balance, 2550)
  unlockCommunityRegular(); assert.equal(connectedDemo.achievement.unlocked, true); assert.equal(connectedDemo.nova.achievements, 14)
  assert.ok(connectedDemo.activity.some(item => item.id === 'activity-achievement'))
})
test('overlay preview, milestone highlight and reset are deterministic', () => {
  resetConnectedDemo(); highlightConnectedMembers(); assert.equal(connectedDemo.milestoneHighlight, true)
  showOverlayPreview(); assert.equal(connectedDemo.overlayPreviewOpen, true); closeOverlayPreview(); assert.equal(connectedDemo.overlayPreviewOpen, false)
  resetConnectedDemo(); assert.deepEqual(JSON.parse(JSON.stringify(connectedDemo)), createConnectedDemoState())
})
test('five route pages mount shared demo labels and contain no external request code', () => {
  const root = fileURLToPath(new URL('../views/', import.meta.url))
  for (const [folder, file] of [['community','CreatorCommunity.vue'],['events','CreatorEvents.vue'],['rewards','CreatorRewards.vue'],['achievements','CreatorAchievements.vue'],['members','CreatorMembers.vue']]) {
    const source = readFileSync(`${root}${folder}/${file}`, 'utf8')
    assert.match(source, /ConnectedDemoHeader/)
    assert.doesNotMatch(source, /fetch\(|axios|XMLHttpRequest|WebSocket/)
  }
  const header = readFileSync(fileURLToPath(new URL('./ConnectedDemoHeader.vue', import.meta.url)), 'utf8')
  for (const label of ['WORK IN PROGRESS','INTERACTIVE DEMO','Demo data','No live platform connections','Changes stay in this browser']) assert.match(header, new RegExp(label))
})
test('existing Creator Tools routes mount all five connected demo pages', () => {
  const routes = readFileSync(fileURLToPath(new URL('../creator-tools.routes.js', import.meta.url)), 'utf8')
  for (const [path, name] of [['community','CreatorCommunity'],['events','CreatorEvents'],['rewards','CreatorRewards'],['achievements','CreatorAchievements'],['members','CreatorMembers']]) {
    assert.match(routes, new RegExp(`path: '${path}'.*name: '${name}'`))
  }
})
test('privacy presentation excludes surveillance and sensitive-note concepts', () => {
  const members = readFileSync(fileURLToPath(new URL('../views/members/CreatorMembers.vue', import.meta.url)), 'utf8')
  assert.match(members, /chosen to share/); assert.match(members, /not personal tracking/); assert.match(members, /Sensitive private notes are never displayed/); assert.match(members, /fictional/)
})
