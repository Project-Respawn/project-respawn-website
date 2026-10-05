import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { operations, valid, DEFERRED_PRODUCT_FEATURES, eligibilityContract } from '../../../domains/team-hub/contracts.mjs';
import { legacyMapping, teamIdForSlug } from '../../../domains/team-hub/compatibility.mjs';
import { entryKey } from '../../../domains/team-hub/repository.mjs';
import { operationalItems } from '../../../domains/team-hub/storage-plan.mjs';
import { coreSchemas } from '../../../domains/team-hub/core-contracts.mjs';
import { fixture, claims, actor, persona, teamId, memberId, subjects, now, environment } from './fixtures.mjs';
const code = expected => e => e.code === expected;
const require = createRequire(new URL('../../../infrastructure/domains/team-hub/package.json', import.meta.url));
const Ajv = require('ajv'); const ajv = new Ajv({ strict: true });
for (const [op, spec] of Object.entries(operations)) {
  test(`contract + business success: ${op}`, async () => {
    const f = fixture(); const req = f.request(op);
    assert.ok(ajv.compile(spec.request)(req));
    const response = await f.execute(op, req);
    assert.ok(ajv.compile(spec.response)(response));
    assert.equal(valid(spec.response, response), true);
    assert.equal(JSON.stringify(response).includes('never-public'), false);
    if (spec.runtime === 'command') { assert.equal(f.repository.snapshot().audit.length, 1); assert.equal(Object.keys(f.repository.snapshot().journal).length, 1); }
  });
  test(`strict input / caller identity rejected: ${op}`, async () => {
    const f = fixture();
    await assert.rejects(f.execute(op, { ...f.request(op), userId: subjects.admin }), code('INVALID_INPUT'));
  });
}
const allowed = {
  LIST_MY_TEAMS: ['admin', 'manager', 'coach', 'player', 'outsider'],
  GET_TEAM_HUB: ['admin', 'manager', 'coach', 'player'],
  LIST_MY_CHAMPION_POOL: ['player'], LIST_TEAM_CHAMPION_POOLS: ['manager', 'coach'], GET_PLAYER_COMPETITIVE_DETAIL: ['manager', 'coach'], SEARCH_TEAM_ASSIGNABLE_USERS: ['manager', 'admin'],
  CREATE_TEAM: ['admin'], UPDATE_TEAM: ['admin'], SET_MANAGER: ['admin'], MANAGE_MEMBER: ['manager'], SET_ROSTER_SLOT: ['manager'], UPSERT_MY_CHAMPION: ['player'], DELETE_MY_CHAMPION: ['player'], UPSERT_COACH_ASSESSMENT: ['coach'], SET_TEAM_PLAN: ['admin'], REQUEST_TEAM_LOGO_UPLOAD: ['admin'], COMMIT_TEAM_LOGO: ['admin'], REMOVE_TEAM_LOGO: ['admin'],
};
for (const op of Object.keys(operations)) for (const name of ['admin', 'manager', 'coach', 'player', 'outsider']) test(`persona ${name} / ${op}`, async () => {
  const f = fixture(); const promise = f.execute(op, f.request(op, name), name);
  if (allowed[op].includes(name)) await promise; else await assert.rejects(promise, code('FORBIDDEN'));
});
test('legacy gateway parity is exactly six reads/twelve commands; slug preserves identity', () => {
  const source = fs.readFileSync(new URL('../../../amplify/myFunction/teamHub/gateway.ts', import.meta.url), 'utf8');
  assert.equal(Object.keys(operations).length, 18);
  assert.equal(Object.values(operations).filter(s => s.runtime === 'read').length, 6);
  for (const action of Object.keys(operations)) { assert.ok(source.includes(action), action); assert.equal(legacyMapping[action].path, operations[action].path); }
  assert.equal(teamIdForSlug('alpha'), teamId);
  assert.equal(eligibilityContract.status, 'CONTRACT_ONLY');
  assert.deepEqual(DEFERRED_PRODUCT_FEATURES, ['approval', 'overallFeedback', 'recommendations', 'flexConfirmation']);
});
test('Player read/upsert/delete never disclose Coach or raw repository fields', async () => {
  const f = fixture();
  f.repository.injectRace(s => { Object.assign(s.teams[teamId].entries[entryKey(memberId('player'), 'Ahri')], { coachRecommendation: 'PRIVATE_SENTINEL', privateNote: 'PRIVATE_SENTINEL', provenance: { source: 'PRIVATE_SENTINEL' } }); });
  const read = await f.execute('LIST_MY_CHAMPION_POOL');
  const upsert = await f.execute('UPSERT_MY_CHAMPION');
  const deletion = await f.execute('DELETE_MY_CHAMPION', { ...f.request('DELETE_MY_CHAMPION'), expectedEntryVersion: 2 });
  for (const value of [read, upsert, deletion]) { const encoded = JSON.stringify(value); assert.doesNotMatch(encoded, /PRIVATE_SENTINEL|coachRecommendation|privateNote|teamVisible|provenance/); }
});
test('Manager sees team-visible assessment only; authoring Coach sees own private notes', async () => {
  const f = fixture();
  const manager = await f.execute('LIST_TEAM_CHAMPION_POOLS');
  assert.match(JSON.stringify(manager), /Visible assessment/); assert.doesNotMatch(JSON.stringify(manager), /PRIVATE_SENTINEL|privateNotes/);
  const coach = await f.execute('GET_PLAYER_COMPETITIVE_DETAIL'); assert.match(JSON.stringify(coach), /PRIVATE_SENTINEL/);
  f.repository.injectRace(s => { s.teams[teamId].privateNotes[entryKey(memberId('player'), 'Ahri')].author = actor('outsider'); });
  const successor = await f.execute('GET_PLAYER_COMPETITIVE_DETAIL'); assert.deepEqual(successor.privateNotes, []);
});
for (const [field, value] of [['coachRecommendation', 'x'], ['approval', true], ['recommendations', []], ['privateNote', 'x']]) test(`Player cannot write ${field}`, async () => {
  const f = fixture(); await assert.rejects(f.execute('UPSERT_MY_CHAMPION', { ...f.request('UPSERT_MY_CHAMPION'), [field]: value }), code('INVALID_INPUT'));
});
for (const [name, op] of [['manager', 'MANAGE_MEMBER'], ['coach', 'UPSERT_COACH_ASSESSMENT']]) test(`revoked ${name} fails at commit with no partial audit/idempotency/domain write`, async () => {
  const f = fixture(); const before = f.repository.snapshot();
  f.repository.beforeCommit = () => f.repository.injectRace(s => { s.teams[teamId].memberships[memberId(name)].status = 'INACTIVE'; s.teams[teamId].team.authorizationEpoch++; });
  await assert.rejects(f.execute(op), code('FORBIDDEN'));
  assert.equal(f.repository.snapshot().audit.length, 0); assert.deepEqual(f.repository.snapshot().journal, {});
  assert.equal(f.repository.snapshot().teams[teamId].team.version, before.teams[teamId].team.version);
});
for (const field of ['expectedTeamVersion', 'expectedAuthorizationEpoch', 'expectedMembershipVersion']) test(`stale ${field} rejects atomically`, async () => {
  const f = fixture(); const request = f.request('MANAGE_MEMBER'); request[field] += 1;
  const before = f.repository.snapshot(); await assert.rejects(f.execute('MANAGE_MEMBER', request), code('CONFLICT')); assert.deepEqual(f.repository.snapshot(), before);
});
test('epoch changed between read and commit rejects even when caller remains active', async () => {
  const f = fixture(); f.repository.beforeCommit = () => f.repository.injectRace(s => { s.teams[teamId].team.authorizationEpoch++; });
  await assert.rejects(f.execute('MANAGE_MEMBER'), code('CONFLICT'));
});
test('target membership revision condition is enforced', async () => {
  const f = fixture(); await assert.rejects(f.execute('SET_ROSTER_SLOT', { ...f.request('SET_ROSTER_SLOT'), expectedTargetMembershipVersion: 99 }), code('CONFLICT'));
});
test('same idempotency key and payload replays once; changed payload conflicts', async () => {
  const f = fixture(); const req = f.request('UPSERT_MY_CHAMPION');
  const first = await f.execute('UPSERT_MY_CHAMPION', req); const second = await f.execute('UPSERT_MY_CHAMPION', { ...req });
  assert.deepEqual(first, second); assert.equal(f.repository.snapshot().audit.length, 1);
  await assert.rejects(f.execute('UPSERT_MY_CHAMPION', { ...req, playerNotes: 'different' }), code('CONFLICT'));
  f.repository.injectRace(s => { s.teams[teamId].memberships[memberId('player')].status = 'INACTIVE'; });
  await assert.rejects(f.execute('UPSERT_MY_CHAMPION', req), code('FORBIDDEN'));
});
test('concurrent roster assignment has one winner; starter role/player guards survive fresh retries', async () => {
  const f = fixture(); const one = f.request('SET_ROSTER_SLOT'); const two = { ...one, idempotencyKey: 'another-request', membershipId: memberId('player2') };
  const results = await Promise.allSettled([f.execute('SET_ROSTER_SLOT', one), f.execute('SET_ROSTER_SLOT', two)]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(results.find(r => r.status === 'rejected').reason.code, 'CONFLICT');
  for (const change of [{ membershipId: memberId('player2') }, { gameRoleKey: 'TOP' }]) await assert.rejects(f.execute('SET_ROSTER_SLOT', { ...f.request('SET_ROSTER_SLOT'), expectedRosterVersion: 1, ...change }), code('CONFLICT'));
  assert.equal(f.repository.readRosterStrong(teamId).length, 1);
});
test('revocation cleans roster and stale candidate index cannot authorize reads', async () => {
  const f = fixture(); await f.execute('SET_ROSTER_SLOT');
  await f.execute('MANAGE_MEMBER', { ...f.concurrency('manager'), action: 'REVOKE', role: 'PLAYER', targetMembershipId: memberId('player'), expectedTargetMembershipVersion: 1 });
  f.repository.candidates = [teamId];
  assert.deepEqual(await f.execute('LIST_MY_TEAMS'), { items: [] });
  await assert.rejects(f.execute('LIST_MY_CHAMPION_POOL'), code('FORBIDDEN'));
  assert.deepEqual(f.repository.readRosterStrong(teamId), []);
});
test('Manager replacement revokes prior manager and does not grant admin implicit membership', async () => {
  const f = fixture(); await f.execute('SET_MANAGER', { ...f.concurrency('admin'), action: 'ASSIGN', targetAccount: 'player2@example.invalid', expectedTargetMembershipVersion: 1 });
  assert.equal(f.repository.readMembershipStrong(teamId, actor('manager')), undefined);
  assert.equal(f.repository.readMembershipStrong(teamId, actor('player2')).role, 'MANAGER');
  assert.equal(f.repository.readMembershipStrong(teamId, actor('admin')), undefined);
});
test('inactive/cross-team target and wrong subject rejected', async () => {
  const f = fixture();
  await assert.rejects(f.execute('GET_PLAYER_COMPETITIVE_DETAIL', { teamId, membershipId: `team-membership:team:other:${subjects.player}` }), code('NOT_FOUND'));
  await assert.rejects(f.execute('GET_TEAM_HUB', { teamId: 'team:other' }), code('FORBIDDEN'));
  await assert.rejects(f.execute('LIST_MY_CHAMPION_POOL', { teamId }, 'outsider'), code('FORBIDDEN'));
  f.repository.injectRace(s => { s.teams[teamId].memberships[memberId('player')].status = 'INACTIVE'; });
  await assert.rejects(f.execute('GET_PLAYER_COMPETITIVE_DETAIL'), code('NOT_FOUND'));
  await assert.rejects(f.execute('UPSERT_COACH_ASSESSMENT'), code('FORBIDDEN'));
});
for (const patch of [{ iss: 'https://wrong.example.invalid' }, { client_id: 'wrong-client' }, { token_use: 'id' }, { sub: 'email@example.invalid' }, { exp: now }, { nbf: now + 5 }]) test(`authentication rejects ${Object.keys(patch)[0]}=${Object.values(patch)[0]}`, async () => {
  const f = fixture(); await assert.rejects(f.service.execute('GET_TEAM_HUB', { teamId }, { ...claims('player'), ...patch }), code('UNAUTHENTICATED'));
});
test('wrong environment and missing claims fail closed', async () => {
  const f = fixture(); f.service.environment = { ...environment, environment: 'production' };
  await assert.rejects(f.execute('GET_TEAM_HUB'), code('UNAUTHENTICATED'));
  await assert.rejects(f.service.execute('GET_TEAM_HUB', { teamId }, undefined), code('UNAUTHENTICATED'));
});
test('Core unavailable denies global grants/directory; directory output minimizes account data', async () => {
  const f = fixture(); const result = await f.execute('SEARCH_TEAM_ASSIGNABLE_USERS');
  assert.equal(result.items.length, 2); assert.deepEqual(Object.keys(result.items[0]).sort(), ['displayName', 'subject']);
  assert.doesNotMatch(JSON.stringify(result), /@|hiddenPersonalField/);
  f.core.available = false;
  await assert.rejects(f.execute('CREATE_TEAM'), code('DEPENDENCY_UNAVAILABLE'));
  await assert.rejects(f.execute('SEARCH_TEAM_ASSIGNABLE_USERS'), code('DEPENDENCY_UNAVAILABLE'));
  await assert.rejects(f.execute('MANAGE_MEMBER'), code('DEPENDENCY_UNAVAILABLE'));
});
test('global privilege revocation at commit fails closed', async () => {
  const f = fixture(); f.repository.beforeCommit = () => f.core.grant(actor('admin'), []);
  await assert.rejects(f.execute('UPDATE_TEAM'), code('FORBIDDEN'));
});
test('pagination is bounded, signed and bound to caller/query; no raw cursor trust', async () => {
  const f = fixture(); f.repository.injectRace(s => { const base = s.teams[teamId].entries[entryKey(memberId('player'), 'Ahri')]; s.teams[teamId].entries[entryKey(memberId('player'), 'Lux')] = { ...base, championId: 'Lux' }; });
  const first = await f.execute('LIST_MY_CHAMPION_POOL', { teamId, limit: 1 }); assert.equal(first.items.length, 1); assert.ok(first.nextToken);
  const second = await f.execute('LIST_MY_CHAMPION_POOL', { teamId, limit: 1, nextToken: first.nextToken }); assert.equal(second.items[0].championId, 'Lux');
  await assert.rejects(f.execute('LIST_MY_CHAMPION_POOL', { teamId, limit: 1, nextToken: `${first.nextToken}x` }), code('INVALID_INPUT'));
  await assert.rejects(f.execute('LIST_MY_CHAMPION_POOL', { teamId, limit: 1, nextToken: first.nextToken }, 'player2'), code('INVALID_INPUT'));
  await assert.rejects(f.execute('LIST_MY_CHAMPION_POOL', { teamId, limit: 51 }), code('INVALID_INPUT'));
});
test('length limits, assignment disjunction and unverified/expired/wrong-owner media rejected', async () => {
  const f = fixture();
  for (const patch of [{ playerNotes: 'x'.repeat(501) }, { championId: 'x'.repeat(41) }, { gameRoleKey: 'CAPTAIN' }]) await assert.rejects(f.execute('UPSERT_MY_CHAMPION', { ...f.request('UPSERT_MY_CHAMPION'), ...patch }), code('INVALID_INPUT'));
  await assert.rejects(f.execute('MANAGE_MEMBER', { ...f.request('MANAGE_MEMBER'), targetMembershipId: memberId('player') }), code('INVALID_INPUT'));
  const intent = await f.execute('REQUEST_TEAM_LOGO_UPLOAD'); assert.equal('uploadUrl' in intent, false);
  await assert.rejects(f.execute('COMMIT_TEAM_LOGO', { ...f.request('COMMIT_TEAM_LOGO'), intentId: intent.intentId }), code('FORBIDDEN'));
  for (const mutation of [{ expiresAt: now }, { actor: 'wrong' }]) {
    f.repository.injectRace(s => Object.assign(s.teams[teamId].intents['synthetic-verified-intent'], mutation));
    await assert.rejects(f.execute('COMMIT_TEAM_LOGO'), code('FORBIDDEN'));
  }
});
test('versioned Core contracts compile and synthetic adapters satisfy minimized responses', () => {
  const f = fixture();
  for (const contract of Object.values(coreSchemas)) for (const value of Object.values(contract)) if (value && typeof value === 'object') ajv.compile(value);
  assert.ok(ajv.compile(coreSchemas['directory.assignment.v1'].searchResponse)({ items: f.core.search(actor('manager'), 'player', 10) }));
  assert.ok(ajv.compile(coreSchemas['directory.assignment.v1'].resolveResponse)(f.core.resolve(actor('manager'), 'player@example.invalid')));
  assert.ok(ajv.compile(coreSchemas['profile.summary.v1'].response)(f.core.summary(actor('manager'), subjects.player)));
  assert.ok(ajv.compile(coreSchemas['authorization.decision.v1'].response)(f.core.decision(actor('admin'), 'teams.admin', now)));
  assert.equal(f.core.decision(actor('player'), 'teams.admin', now).allowed, false);
});
test('read recheck prevents a Coach-to-Manager role change from returning old private projection', async () => {
  const f = fixture(); const req = f.request('GET_PLAYER_COMPETITIVE_DETAIL'); const original = f.repository.readTeamStrong.bind(f.repository); let reads = 0;
  f.repository.readTeamStrong = id => { if (++reads === 2) f.repository.injectRace(s => { const m = s.teams[id].memberships[memberId('coach')]; m.role = 'MANAGER'; m.version++; s.teams[id].team.authorizationEpoch++; }); return original(id); };
  await assert.rejects(f.execute('GET_PLAYER_COMPETITIVE_DETAIL', req), code('CONFLICT'));
});
test('directory resolution is rechecked at commit; account disable cannot become new membership', async () => {
  const f = fixture(); f.repository.beforeCommit = () => { f.core.accounts.find(a => a.subject === subjects.player2).active = false; };
  await assert.rejects(f.execute('MANAGE_MEMBER'), code('NOT_FOUND')); assert.equal(f.repository.snapshot().audit.length, 0);
});
test('two-table physical shape isolates private notes, slug and starter guard; audit contains no private payload', async () => {
  const f = fixture(); await f.execute('SET_ROSTER_SLOT');
  const items = operationalItems(f.repository.readTeamStrong(teamId));
  assert.ok(items.has(`SLUG#alpha|TEAM`));
  assert.ok(items.has(`TEAM#${teamId}|STARTER#MID`));
  assert.ok(items.has(`TEAM#${teamId}|STARTER_PLAYER#${memberId('player')}`));
  assert.equal([...items.values()].filter(i => i.SK.startsWith('COACH_PRIVATE#')).length, 1);
  assert.doesNotMatch(JSON.stringify([...items.values()].filter(i => i.SK.startsWith('POOL#') || i.SK.startsWith('ASSESSMENT#'))), /PRIVATE_SENTINEL/);
  assert.ok(f.repository.lastTransaction.count <= 25);
  assert.equal(f.repository.lastTransaction.journalWrites, 2);
  await f.execute('UPSERT_COACH_ASSESSMENT');
  assert.doesNotMatch(JSON.stringify(f.repository.snapshot().audit), /private|Updated|Player-owned|@/);
});
test('oversized synthetic transaction rejects without publishing any partial state', async () => {
  const f = fixture(); const before = f.repository.snapshot();
  await assert.rejects(f.repository.transact({ teamId, teamVersion: 1, epoch: 1, actor: actor('manager'), membershipVersion: 1, operation: 'fixture-only', key: 'oversized-test', digest: 'fixture-digest', now, requestId: 'oversize' }, () => {}, state => {
    for (let i = 0; i < 30; i++) state.teams[teamId].intents[`fixture-${i}`] = { teamId };
    state.teams[teamId].team.version++; return {};
  }), code('LIMIT_EXCEEDED'));
  assert.deepEqual(f.repository.snapshot(), before);
});
test('expiry is checked in application, independent of delayed TTL deletion', async () => {
  const f = fixture(); const req = f.request('UPSERT_MY_CHAMPION'); await f.execute('UPSERT_MY_CHAMPION', req);
  f.service.clock = () => now + 86401;
  const refreshedClaims = { ...claims('player'), exp: now + 90000 };
  const fresh = { ...f.request('UPSERT_MY_CHAMPION'), expectedEntryVersion: 2, idempotencyKey: req.idempotencyKey };
  await f.service.execute('UPSERT_MY_CHAMPION', fresh, refreshedClaims);
  assert.equal(f.repository.snapshot().audit.length, 2);
});
test('repository read ports support asynchronous adapters without using candidate results as authority', async () => {
  const f = fixture(); const read = f.repository.readTeamStrong.bind(f.repository); const candidates = f.repository.listCandidateTeamIds.bind(f.repository);
  f.repository.readTeamStrong = async id => read(id);
  f.repository.listCandidateTeamIds = async who => candidates(who);
  const page = await f.execute('LIST_MY_TEAMS', {}); assert.equal(page.items.length, 1);
  const detail = await f.execute('GET_TEAM_HUB', { teamId }); assert.equal(detail.team.id, teamId);
});
