import test from 'node:test';
import assert from 'node:assert/strict';
import { createTeamHubClient } from '../../../src/features/team-hub/api/client.mjs';
import { teamHubRoutes } from '../../../src/features/team-hub/routes/index.mjs';
import { createTeamHubState } from '../../../src/features/team-hub/state/session.mjs';
import { createHandler } from '../../../domains/team-hub/http.mjs';
import { handler as offlineRead } from '../../../domains/team-hub/read-entry.mjs';
import { handler as offlineCommand } from '../../../domains/team-hub/command-entry.mjs';
import { operations } from '../../../domains/team-hub/contracts.mjs';
import { fixture, claims, persona, environment, now, teamId } from './fixtures.mjs';
function handlers(f) { const dependencies = { repository: f.repository, core: f.core, environment, clock: () => now, cursorSecret: 'synthetic-offline-cursor-signing-material' }; return { read: createHandler('read', dependencies), command: createHandler('command', dependencies) }; }
for (const [op, spec] of Object.entries(operations)) test(`synthetic frontend -> HTTP -> service round trip ${op}`, async () => {
  const f = fixture(); const server = handlers(f); let refreshed = 0;
  const client = createTeamHubClient({ endpoint: 'https://team-hub.example.invalid', tokenProvider: async () => { refreshed++; return 'synthetic-not-a-jwt'; }, transport: async (url, options) => {
    const parsed = new URL(url); const pattern = new RegExp(`^${spec.path.replace(/\{[^}]+\}/g, '([^/]+)')}$`); const values = pattern.exec(decodeURIComponent(parsed.pathname));
    assert.ok(values); const keys = [...spec.path.matchAll(/\{([^}]+)\}/g)].map(m => m[1]);
    assert.equal(options.headers.authorization, 'Bearer synthetic-not-a-jwt');
    const result = await server[spec.runtime]({ routeKey: `${spec.method} ${spec.path}`, pathParameters: Object.fromEntries(keys.map((k, i) => [k, values[i + 1]])), queryStringParameters: Object.fromEntries(parsed.searchParams), body: options.body, requestContext: { requestId: 'test-http', authorizer: { jwt: { claims: claims(persona[op]) } } } });
    return { ok: result.statusCode === 200, json: async () => JSON.parse(result.body) };
  } });
  await client.call(op, f.request(op)); assert.equal(refreshed, 1);
});
test('offline packaged entrypoints fail closed without trusting bearer/body identity', async () => {
  for (const handler of [offlineRead, offlineCommand]) { const result = await handler({ headers: { authorization: 'not-a-real-token' }, body: '{"userId":"admin"}' }); assert.equal(result.statusCode, 503); assert.equal(JSON.parse(result.body).error.code, 'OFFLINE_SKELETON'); }
});
test('HTTP rejects overlapping identity sources, malformed/oversized body, absent JWT context and wrong runtime route', async () => {
  const f = fixture(); const h = handlers(f).read;
  const base = { routeKey: 'GET /v1/teams/{teamId}', pathParameters: { teamId }, requestContext: { authorizer: { jwt: { claims: claims('player') } } } };
  for (const patch of [{ body: JSON.stringify({ teamId }) }, { queryStringParameters: { teamId } }, { body: 'broken JSON' }, { body: 'x'.repeat(17000) }, { isBase64Encoded: true }]) assert.equal((await h({ ...base, ...patch })).statusCode, 400);
  assert.equal((await h({ ...base, requestContext: {} })).statusCode, 401);
  assert.equal((await h({ ...base, routeKey: 'POST /v1/teams' })).statusCode, 404);
});
test('all major pages including admin are dormant dynamic imports; redirect preserves slug', async () => {
  assert.equal(teamHubRoutes.length, 7);
  const pages = teamHubRoutes.filter(r => r.component); assert.equal(pages.length, 6);
  for (const route of pages) { assert.equal(typeof route.component, 'function'); assert.match(route.component.toString(), /import\(/); assert.ok((await route.component()).default.render); }
  assert.deepEqual(teamHubRoutes.find(r => r.redirect).redirect({ params: { teamSlug: 'alpha' } }), { name: 'team-hub-coach-review', params: { teamSlug: 'alpha' } });
});
test('client refreshes token every request; no token cached in domain state; logout/account switch clear private data', async () => {
  let refreshes = 0; let requests = 0;
  const client = createTeamHubClient({ endpoint: 'https://team-hub.example.invalid', tokenProvider: async () => `synthetic-${++refreshes}`, transport: async (_, options) => { assert.equal(options.headers.authorization, `Bearer synthetic-${++requests}`); return { ok: true, json: async () => ({ contractVersion: 'team-hub.v1', data: { items: [] } }) }; } });
  await client.call('LIST_MY_TEAMS', {}); await client.call('LIST_MY_TEAMS', {}); assert.equal(refreshes, 2);
  const state = createTeamHubState(); state.selectIdentity('issuer|coach'); state.set('private', 'notes'); state.selectIdentity('issuer|player'); assert.equal(state.get('private'), undefined); state.set('public', 'data'); state.reset(); assert.equal(state.get('public'), undefined); assert.throws(() => state.set('x', 'data'));
});
test('client rejects unsafe endpoint and failed/missing auth without transport', async () => {
  for (const endpoint of ['http://team-hub.example.invalid', 'https://user:pass@team-hub.example.invalid', 'https://team-hub.example.invalid?token=x']) assert.throws(() => createTeamHubClient({ endpoint, tokenProvider: async () => 'x' }));
  const client = createTeamHubClient({ endpoint: 'https://team-hub.example.invalid', tokenProvider: async () => null, transport: () => assert.fail('must not make a request') });
  await assert.rejects(client.call('LIST_MY_TEAMS', {}), /UNAUTHENTICATED/);
});
