import fs from 'node:fs';
import { MemoryRepository, membershipId, entryKey } from '../../../domains/team-hub/repository.mjs';
import { SyntheticCore } from '../../../domains/team-hub/core.mjs';
import { TeamService } from '../../../domains/team-hub/service.mjs';
export const environment = JSON.parse(fs.readFileSync(new URL('../../../config/environments/Ntgre.core.json', import.meta.url), 'utf8'));
export const now = 1800000000;
export const subjects = Object.fromEntries(['admin', 'manager', 'coach', 'player', 'player2', 'outsider'].map((name, i) => [name, `00000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`]));
export const actor = name => ({ issuer: environment.issuer, subject: subjects[name] });
export const claims = name => ({ iss: environment.issuer, sub: subjects[name], client_id: environment.clientId, token_use: 'access', exp: now + 3600 });
export const teamId = 'team:alpha';
export const memberId = name => membershipId(teamId, subjects[name]);
export function fixture() {
  const team = { id: teamId, slug: 'alpha', name: 'Alpha', gameKey: 'LEAGUE_OF_LEGENDS', status: 'ACTIVE', version: 1, authorizationEpoch: 1, rosterVersion: 0, settings: { plan: 'FREE', logoAssetId: '' }, provenance: { source: 'synthetic', sourceId: 'never-public' } };
  const memberships = Object.fromEntries(['manager', 'coach', 'player', 'player2'].map(name => [memberId(name), { id: memberId(name), teamId, ...actor(name), displayName: name, role: name.startsWith('player') ? 'PLAYER' : name.toUpperCase(), status: 'ACTIVE', version: 1 }]));
  const entry = { teamId, membershipId: memberId('player'), championId: 'Ahri', gameRoleKey: 'MID', comfortLevel: 'A', priority: 'NORMAL', competitiveReady: true, playerNotes: 'Player-owned', version: 1 };
  const key = entryKey(memberId('player'), 'Ahri');
  const aggregate = { team, memberships, roster: [], entries: { [key]: entry }, assessments: { [key]: { teamId, membershipId: memberId('player'), championId: 'Ahri', teamVisible: 'Visible assessment', version: 1 } }, privateNotes: { [key]: { teamId, membershipId: memberId('player'), championId: 'Ahri', author: actor('coach'), privateNote: 'PRIVATE_SENTINEL', version: 1 } }, intents: {} };
  const repository = new MemoryRepository({ teams: { [teamId]: aggregate }, journal: {}, audit: [] });
  const core = new SyntheticCore(environment, Object.entries(subjects).map(([name, subject]) => ({ subject, account: `${name}@example.invalid`, displayName: name, active: true, hiddenPersonalField: 'must-not-return' })));
  core.grant(actor('admin'), ['teams.admin', 'teams.branding.manage']);
  const service = new TeamService({ repository, core, environment, cursorSecret: 'synthetic-offline-cursor-signing-material', clock: () => now });
  let sequence = 0;
  const concurrency = (name = 'manager') => {
    const a = repository.readTeamStrong(teamId);
    return { teamId, idempotencyKey: `fixture-${++sequence}`, expectedTeamVersion: a.team.version, expectedAuthorizationEpoch: a.team.authorizationEpoch, expectedMembershipVersion: repository.readMembershipStrong(teamId, actor(name))?.version ?? 0 };
  };
  const request = (op, name = persona[op]) => {
    const c = concurrency(name);
    const requests = {
      LIST_MY_TEAMS: {}, GET_TEAM_HUB: { teamId }, LIST_MY_CHAMPION_POOL: { teamId }, LIST_TEAM_CHAMPION_POOLS: { teamId }, GET_PLAYER_COMPETITIVE_DETAIL: { teamId, membershipId: memberId('player') }, SEARCH_TEAM_ASSIGNABLE_USERS: { teamId, query: 'player' },
      CREATE_TEAM: { slug: 'new-team', name: 'New Team', gameKey: 'LEAGUE_OF_LEGENDS', idempotencyKey: c.idempotencyKey },
      UPDATE_TEAM: { ...c, name: 'Renamed', status: 'ACTIVE' },
      SET_MANAGER: { ...c, action: 'ASSIGN', targetAccount: 'manager@example.invalid', expectedTargetMembershipVersion: 1 },
      MANAGE_MEMBER: { ...c, action: 'ASSIGN', role: 'PLAYER', targetAccount: 'player2@example.invalid', expectedTargetMembershipVersion: 1 },
      SET_ROSTER_SLOT: { ...c, action: 'ASSIGN', membershipId: memberId('player'), gameRoleKey: 'MID', slotType: 'STARTER', expectedRosterVersion: 0, expectedTargetMembershipVersion: 1 },
      UPSERT_MY_CHAMPION: { ...c, championId: 'Ahri', gameRoleKey: 'MID', comfortLevel: 'S', priority: 'HIGH', competitiveReady: true, playerNotes: 'Updated', expectedEntryVersion: 1 },
      DELETE_MY_CHAMPION: { ...c, championId: 'Ahri', expectedEntryVersion: 1 },
      UPSERT_COACH_ASSESSMENT: { ...c, membershipId: memberId('player'), championId: 'Ahri', teamVisible: 'Updated visible', privateNote: 'Updated private', expectedAssessmentVersion: 1, expectedTargetMembershipVersion: 1 },
      SET_TEAM_PLAN: { ...c, plan: 'PRO' },
      REQUEST_TEAM_LOGO_UPLOAD: { ...c, contentType: 'image/png', size: 1024 },
      COMMIT_TEAM_LOGO: { ...c, intentId: 'synthetic-verified-intent' },
      REMOVE_TEAM_LOGO: c,
    };
    return requests[op];
  };
  repository.injectRace(state => { state.teams[teamId].intents['synthetic-verified-intent'] = { actor: `${environment.issuer}|${subjects.admin}`, teamId, expiresAt: now + 300, verified: true }; });
  return { repository, core, service, concurrency, request, execute: (op, req = request(op), name = persona[op]) => service.execute(op, req, claims(name), 'synthetic-request') };
}
export const persona = { LIST_MY_TEAMS: 'player', GET_TEAM_HUB: 'player', LIST_MY_CHAMPION_POOL: 'player', LIST_TEAM_CHAMPION_POOLS: 'manager', GET_PLAYER_COMPETITIVE_DETAIL: 'coach', SEARCH_TEAM_ASSIGNABLE_USERS: 'manager', CREATE_TEAM: 'admin', UPDATE_TEAM: 'admin', SET_MANAGER: 'admin', MANAGE_MEMBER: 'manager', SET_ROSTER_SLOT: 'manager', UPSERT_MY_CHAMPION: 'player', DELETE_MY_CHAMPION: 'player', UPSERT_COACH_ASSESSMENT: 'coach', SET_TEAM_PLAN: 'admin', REQUEST_TEAM_LOGO_UPLOAD: 'admin', COMMIT_TEAM_LOGO: 'admin', REMOVE_TEAM_LOGO: 'admin' };
