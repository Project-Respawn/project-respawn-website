import test from 'node:test'
import assert from 'node:assert/strict'
import { MUTATION_ACTIONS, READ_ACTIONS, routeTeamHubMutation, routeTeamHubRead } from './gateway'

const readArgs: Record<string, any> = {
  LIST_MY_TEAMS: {}, GET_TEAM_HUB: { teamId: 'team:alpha' },
  LIST_MY_CHAMPION_POOL: { teamId: 'team:alpha' }, LIST_TEAM_CHAMPION_POOLS: { teamId: 'team:alpha' },
  SEARCH_TEAM_ASSIGNABLE_USERS: { query: 'ra' },
}
const mutationArgs: Record<string, any> = {
  CREATE_TEAM: { slug: 'alpha', name: 'Alpha', gameKey: 'LEAGUE_OF_LEGENDS' },
  UPDATE_TEAM: { teamId: 'team:alpha', name: 'Alpha' },
  SET_MANAGER: { teamId: 'team:alpha', targetEmail: 'manager@example.com', memberAction: 'ASSIGN', expectedRevision: 1 },
  MANAGE_MEMBER: { teamId: 'team:alpha', targetEmail: 'player@example.com', role: 'PLAYER', memberAction: 'ASSIGN', expectedRevision: 1 },
  SET_ROSTER_SLOT: { teamId: 'team:alpha', membershipId: 'membership', gameRoleKey: 'MID', slotType: 'STARTER', rosterAction: 'ASSIGN', expectedRevision: 1 },
  UPSERT_MY_CHAMPION: { teamId: 'team:alpha', championId: 'Ahri', comfortLevel: 'S', priority: 'HIGH', competitiveReady: true },
  DELETE_MY_CHAMPION: { teamId: 'team:alpha', championId: 'Ahri' },
  SET_TEAM_PLAN: { teamId: 'team:alpha', payload: '{"plan":"PRO","expectedRevision":0}' },
  REQUEST_TEAM_LOGO_UPLOAD: { teamId: 'team:alpha', payload: '{"fileName":"logo.png","contentType":"image/png","size":100}' },
  COMMIT_TEAM_LOGO: { teamId: 'team:alpha', payload: '{"key":"team-logos/team:alpha/id.png","expectedRevision":0}' },
  REMOVE_TEAM_LOGO: { teamId: 'team:alpha', payload: '{"expectedRevision":0}' },
}

function spies(routes: Record<string, any>) {
  const calls: string[] = []
  return [Object.fromEntries(Object.entries(routes).map(([action, route]) => [action, { ...route, handler: async (event: any) => { calls.push(action); return event.arguments } }])), calls] as const
}

test('read gateway exhaustively dispatches each action only to its intended handler', async () => {
  const [routes, calls] = spies(READ_ACTIONS)
  for (const [action, args] of Object.entries(readArgs)) await routeTeamHubRead({ arguments: { action, ...args } }, routes)
  assert.deepEqual(calls, Object.keys(readArgs))
})

test('mutation gateway exhaustively dispatches each action and remaps only bounded command fields', async () => {
  const [routes, calls] = spies(MUTATION_ACTIONS)
  for (const [action, args] of Object.entries(mutationArgs)) {
    const forwarded = await routeTeamHubMutation({ arguments: { action, ...args } }, routes)
    assert.equal('memberAction' in forwarded || 'rosterAction' in forwarded, false)
  }
  assert.deepEqual(calls, Object.keys(mutationArgs))
})

test('gateway ignores AppSync null placeholders for unrelated optional fields', async () => {
  const [routes] = spies(MUTATION_ACTIONS)
  const forwarded = await routeTeamHubMutation({ arguments: {
    action: 'CREATE_TEAM', ...mutationArgs.CREATE_TEAM,
    teamId: null, targetEmail: null, expectedRevision: null, championId: null,
  } }, routes)
  assert.deepEqual(forwarded, mutationArgs.CREATE_TEAM)
  const manager = await routeTeamHubMutation({ arguments: { action: 'SET_MANAGER', ...mutationArgs.SET_MANAGER, teamSlug: null, status: null, query: null } }, routes)
  assert.deepEqual(manager, { teamId: 'team:alpha', targetEmail: 'manager@example.com', action: 'ASSIGN', expectedRevision: 1 })
})

test('gateways reject missing, unknown, cross-protocol and unexpected actions or fields', async () => {
  await assert.rejects(() => routeTeamHubRead({ arguments: {} }), /Missing Team Hub action/)
  await assert.rejects(() => routeTeamHubRead({ arguments: { action: 'NOPE' } }), /Unsupported Team Hub action/)
  await assert.rejects(() => routeTeamHubRead({ arguments: { action: 'CREATE_TEAM' } }), /Unsupported Team Hub action/)
  await assert.rejects(() => routeTeamHubMutation({ arguments: { action: 'GET_TEAM_HUB', teamId: 'team:alpha' } }), /Unsupported Team Hub action/)
  await assert.rejects(() => routeTeamHubRead({ arguments: { action: 'LIST_MY_TEAMS', callerUserId: 'forged' } }), /Unexpected Team Hub gateway field/)
  await assert.rejects(() => routeTeamHubMutation({ arguments: { action: 'CREATE_TEAM', ...mutationArgs.CREATE_TEAM, extra: true } }), /Unexpected Team Hub gateway field/)
})

test('gateways reject malformed, nested, primitive, array and oversized inputs', async () => {
  for (const value of [null, 'x', 1, [], { action: 'LIST_MY_TEAMS', nested: {} }]) await assert.rejects(() => routeTeamHubRead({ arguments: value }), /Invalid/)
  await assert.rejects(() => routeTeamHubRead({ arguments: { action: 'LIST_MY_TEAMS', status: 'x'.repeat(9_000) } }), /too large/)
})

test('action-specific allowlists reject irrelevant, conflicting and missing fields', async () => {
  await assert.rejects(() => routeTeamHubRead({ arguments: { action: 'GET_TEAM_HUB', teamId: 'team:alpha', teamSlug: 'alpha' } }), /Exactly one/)
  await assert.rejects(() => routeTeamHubMutation({ arguments: { action: 'UPDATE_TEAM', teamId: 'team:alpha' } }), /At least one/)
  await assert.rejects(() => routeTeamHubMutation({ arguments: { action: 'DELETE_MY_CHAMPION', teamId: 'team:alpha' } }), /Missing Team Hub field/)
})

test('authorization remains inside every selected handler', async () => {
  for (const [action, args] of Object.entries(readArgs)) await assert.rejects(() => routeTeamHubRead({ arguments: { action, ...args }, identity: null }), /Cognito sub/)
  for (const [action, args] of Object.entries(mutationArgs)) await assert.rejects(() => routeTeamHubMutation({ arguments: { action, ...args }, identity: null }), /Cognito sub/)
})
