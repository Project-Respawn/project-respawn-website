import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { canShowAdminControls, clearPrivateTeamState, indexRoleIndependentPool, isTeamHubConflict, isTeamHubDenied, managerAssignmentInput, memberAssignmentInput, revocationInput } from './teamHub.viewModel.js';
import { activeManager, decodeTeamHubPayload, filterAdminTeams, normalizeAdminTeam, normalizeTeamSlug, replaceTeamInList } from './teamAdministration.viewModel.js';

test('runtime view-model: Admin controls are hidden from members and visible to both platform Admin roles', () => {
  assert.equal(canShowAdminControls({}), false);
  assert.equal(canShowAdminControls({ isAdmin: true }), true);
  assert.equal(canShowAdminControls({ isSuperAdmin: true }), true);
});

test('runtime view-model: role-independent pool preserves stored identity and role metadata', () => {
  const indexed = indexRoleIndependentPool([{ id: 'pool-1', championId: 'Ahri', gameRoleKey: 'MID', comfortLevel: 'S' }]);
  assert.deepEqual(indexed.Ahri, { id: 'pool-1', championId: 'Ahri', gameRoleKey: 'MID', comfortLevel: 'S' });
});

test('runtime view-model: denied/revoked state clears private team and pool data', () => {
  assert.deepEqual(clearPrivateTeamState({ context: { team: 'secret' }, poolEntries: { Ahri: 'S' }, publicValue: true }), { context: null, poolEntries: {}, publicValue: true });
});

test('runtime view-model: only the stable stale-revision error triggers conflict refresh UX', () => {
  assert.equal(isTeamHubConflict(new Error('Team Hub changed; refresh and try again')), true);
  assert.equal(isTeamHubConflict(new Error('Team Hub request failed')), false);
  assert.equal(isTeamHubDenied(new Error('Team Hub access denied')), true);
});

test('static wiring check: operational screens use secured backend services and no generated CRUD or localStorage fallback', async () => {
  const [player, coach, home, management, service] = await Promise.all([
    readFile(new URL('./champion-pool/ChampionPool.vue', import.meta.url), 'utf8'),
    readFile(new URL('./champion-pool/CoachPoolReview.vue', import.meta.url), 'utf8'),
    readFile(new URL('./TeamHubHome.vue', import.meta.url), 'utf8'),
    readFile(new URL('./TeamManagement.vue', import.meta.url), 'utf8'),
    readFile(new URL('./teamHub.service.js', import.meta.url), 'utf8'),
  ]);
  const operational = `${player}\n${coach}\n${home}\n${management}`;
  assert.doesNotMatch(operational, /localStorage/);
  assert.match(player, /listMyChampionPool/);
  assert.match(coach, /listTeamChampionPools/);
  assert.match(home, /listMyTeams/);
  assert.match(management, /expectedRevision/);
  assert.doesNotMatch(management, /Cognito user ID|Canonical user ID|targetUserId/);
  assert.match(management, /type="email"/);
  assert.match(management, /if \(submitting\.value\) return/);
  assert.match(management, /managerEmail\.value = ''/);
  assert.match(management, /memberEmail\.value = ''/);
  assert.match(service, /queries\.readTeamHub/);
  assert.match(service, /mutations\.mutateTeamHub/);
  for (const action of ['LIST_MY_TEAMS', 'GET_TEAM_HUB', 'LIST_MY_CHAMPION_POOL', 'LIST_TEAM_CHAMPION_POOLS', 'CREATE_TEAM', 'UPDATE_TEAM', 'SET_MANAGER', 'MANAGE_MEMBER', 'SET_ROSTER_SLOT', 'UPSERT_MY_CHAMPION', 'DELETE_MY_CHAMPION']) assert.match(service, new RegExp(`['"]${action}['"]`));
  assert.doesNotMatch(service, /\.(?:queries|mutations)\.(?:listMyTeams|getTeamHub|listMyChampionPool|listTeamChampionPools|createTeamHubTeam|updateTeamHubTeam|setTeamManager|manageTeamMember|setTeamRosterSlot|upsertMyChampionPoolEntry|deleteMyChampionPoolEntry)\s*\(/);
  assert.doesNotMatch(operational, /(?:LIST_MY_TEAMS|GET_TEAM_HUB|LIST_MY_CHAMPION_POOL|LIST_TEAM_CHAMPION_POOLS|CREATE_TEAM|UPDATE_TEAM|SET_MANAGER|MANAGE_MEMBER|SET_ROSTER_SLOT|UPSERT_MY_CHAMPION|DELETE_MY_CHAMPION)/);
});

test('runtime view-model: assignment sends normalized exact email without a user ID', () => {
  const team = { id: 'team:alpha', membershipRevision: 4 };
  assert.deepEqual(managerAssignmentInput(team, ' ADMIN@Example.COM '), { teamId: 'team:alpha', targetEmail: 'admin@example.com', action: 'ASSIGN', expectedRevision: 4 });
  assert.deepEqual(memberAssignmentInput(team, ' PLAYER@Example.COM ', 'PLAYER'), { teamId: 'team:alpha', targetEmail: 'player@example.com', role: 'PLAYER', action: 'ASSIGN', expectedRevision: 4 });
  assert.equal('targetUserId' in memberAssignmentInput(team, 'x@example.com', 'COACH'), false);
});

test('runtime view-model: revocation uses an existing membership record, never typed identity', () => {
  assert.deepEqual(revocationInput({ id: 'team:alpha', membershipRevision: 7 }, { id: 'membership-1', role: 'PLAYER' }), { teamId: 'team:alpha', targetMembershipId: 'membership-1', role: 'PLAYER', action: 'REVOKE', expectedRevision: 7 });
});

test('team administration immediately inserts a successful create and selects one active manager', () => {
  const created = { id: 'team:new-team', slug: 'new-team', name: 'New Team' };
  assert.deepEqual(replaceTeamInList([{ id: 'team:old' }], created), [created, { id: 'team:old' }]);
  assert.deepEqual(replaceTeamInList([created], { ...created, name: 'Updated' }), [{ ...created, name: 'Updated' }]);
  assert.equal(normalizeTeamSlug('  New Team!! '), 'new-team');
  assert.equal(activeManager({ members: [{ id: 'old', role: 'MANAGER', status: 'INACTIVE' }, { id: 'active', role: 'MANAGER', status: 'ACTIVE' }] }).id, 'active');
});

test('Team Hub AWSJSON responses decode before pagination instead of becoming an empty list', async () => {
  const existing = { id: 'team:project-respawn', name: 'Project Respawn', slug: 'project-respawn', gameKey: 'LEAGUE_OF_LEGENDS', status: 'ACTIVE', createdAt: '2026-09-02T18:42:56.028Z' };
  const decoded = decodeTeamHubPayload(JSON.stringify({ items: [existing], nextToken: null }));
  assert.deepEqual(decoded.items, [existing]);
  assert.deepEqual(decodeTeamHubPayload(decoded), decoded);
  assert.throws(() => decodeTeamHubPayload('{bad json'), /Team Hub request failed/);
});

test('team administration retains and renders the exact managerless active production-team shape', () => {
  const existing = normalizeAdminTeam({ id: 'team:project-respawn', name: 'Project Respawn', slug: 'project-respawn', gameKey: 'LEAGUE_OF_LEGENDS', status: 'ACTIVE', createdAt: '2026-09-02T18:42:56.028Z' });
  assert.equal(activeManager({ team: existing, members: [] }), null);
  assert.deepEqual(filterAdminTeams([existing]), [existing]);
  assert.deepEqual(filterAdminTeams([existing], '', 'ACTIVE'), [existing]);
  assert.deepEqual(filterAdminTeams([existing], 'project respawn'), [existing]);
  assert.deepEqual(filterAdminTeams([existing], 'project-respawn'), [existing]);
  assert.deepEqual(filterAdminTeams([existing], '', 'INACTIVE'), []);
});

test('duplicate team creation remains fail-closed before the create write', async () => {
  const source = await readFile(new URL('../../../amplify/myFunction/teamHub/index.ts', import.meta.url), 'utf8');
  const duplicateGuard = source.indexOf("if (await rawTeam(data, id)) fail('Team slug already exists')");
  const createWrite = source.indexOf('data.models.Team.create', duplicateGuard);
  assert.ok(duplicateGuard >= 0);
  assert.ok(createWrite > duplicateGuard);
});

test('admin dashboard routes and presents the existing consolidated Team Hub administration flow', async () => {
  const [page, routes, layout, service, home] = await Promise.all([
    readFile(new URL('./TeamAdministration.vue', import.meta.url), 'utf8'),
    readFile(new URL('../../router/admin.routes.js', import.meta.url), 'utf8'),
    readFile(new URL('../../views/Admin/AdminLayout/AdminLayout.js', import.meta.url), 'utf8'),
    readFile(new URL('./teamHub.service.js', import.meta.url), 'utf8'),
    readFile(new URL('./TeamHubHome.vue', import.meta.url), 'utf8'),
  ]);
  assert.match(routes, /path: 'esports\/teams'[\s\S]*requiredGroups: \['SuperAdmin', 'Admin'\]/);
  assert.match(layout, /Esports · Team Administration/);
  assert.match(page, /listAdminTeams/);
  assert.match(page, /if \(submitting\.value\) return/);
  assert.match(page, /window\.confirm/);
  assert.match(page, /managerAssignmentInput/);
  assert.match(page, /Open operational Team Hub/);
  assert.match(page, /statusFilter/);
  assert.match(page, /filterAdminTeams/);
  assert.match(service, /queries\.readTeamHub/);
  assert.match(service, /mutations\.mutateTeamHub/);
  assert.match(home, /errorMessage\.value = ''/);
  assert.match(home, /selectedTeamId\.value = created\.id/);
  assert.doesNotMatch(page, /generateClient|localStorage|\.models\./);
});
