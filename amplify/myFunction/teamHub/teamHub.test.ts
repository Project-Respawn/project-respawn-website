import test from 'node:test'
import assert from 'node:assert/strict'
import { handleGetTeamHub, handleListMyTeams, handleManageTeamMember, handleSearchTeamAssignableUsers, handleSetTeamManager, handleSetTeamRosterSlot, handleUpsertMyChampionPoolEntry } from '.'
import { ACCOUNT_NOT_FOUND, ACCOUNT_UNAVAILABLE, resolveAssignmentAccount, searchAssignableAccounts } from './accounts'
import { commitTransaction } from './dynamo'

process.env.TEAM_HUB_USER_POOL_ID = 'test-pool'

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const IDS = { admin: id(1), manager: id(2), coach: id(3), player: id(4), player2: id(5), outsider: id(6) }
const NICHOLAS = '209c19dc-e0a1-7090-0b35-879fed200271'
const emailById = new Map([[IDS.manager, 'manager@example.com'], [IDS.coach, 'coach@example.com'], [IDS.player, 'player@example.com'], [IDS.player2, 'player2@example.com']])
const assignmentDirectory = { listUsers: async ({ Filter }: any) => {
  const email = String(Filter).match(/"(.+)"/)?.[1]
  const userId = [...emailById].find(([, value]) => value === email)?.[0]
  return { Users: userId ? [{ Enabled: true, UserStatus: 'CONFIRMED', Attributes: [{ Name: 'sub', Value: userId }, { Name: 'email', Value: email }, { Name: 'name', Value: email?.split('@')[0] }] }] : [] }
} }
const event = (userId: string, groups: string[] = [], arguments_: any = {}) => ({ identity: { sub: userId, claims: { sub: userId, 'cognito:groups': groups } }, arguments: arguments_, assignmentDirectory })
const names = { team: 'TeamTable', membership: 'MembershipTable', roster: 'RosterTable', championPool: 'PoolTable' }

function fixture() {
  const team = { id: 'team:alpha', slug: 'alpha', name: 'Alpha', gameKey: 'LEAGUE_OF_LEGENDS', status: 'ACTIVE', rosterRevision: 7, membershipRevision: 4, managerMembershipId: `team-membership:team:alpha:${IDS.manager}`, coachMembershipId: `team-membership:team:alpha:${IDS.coach}` }
  const memberships = [
    { id: team.managerMembershipId, teamId: team.id, userId: IDS.manager, displayName: 'Manager', role: 'MANAGER', status: 'ACTIVE' },
    { id: team.coachMembershipId, teamId: team.id, userId: IDS.coach, displayName: 'Coach', role: 'COACH', status: 'ACTIVE' },
    { id: `team-membership:${team.id}:${IDS.player}`, teamId: team.id, userId: IDS.player, displayName: 'Player', role: 'PLAYER', status: 'ACTIVE' },
    { id: `team-membership:${team.id}:${IDS.player2}`, teamId: team.id, userId: IDS.player2, displayName: 'Player 2', role: 'PLAYER', status: 'ACTIVE' },
  ]
  const slots: any[] = []
  const pool: any[] = []
  const paged = (rows: any[], key: string) => async (input: any, options: any = {}) => {
    const selected = rows.filter((row) => row[key] === input[key])
    const start = options.nextToken ? Number(options.nextToken) : 0
    const limit = options.limit || 25
    return { data: selected.slice(start, start + limit), nextToken: start + limit < selected.length ? String(start + limit) : null }
  }
  const byId = (rows: any[]) => ({ get: async ({ id }: any) => ({ data: rows.find((row) => row.id === id) || null }), create: async (input: any) => ({ data: input }), update: async (input: any) => ({ data: input }), delete: async ({ id }: any) => ({ data: { id } }), list: async () => { throw new Error('scan must not be called') } })
  const client: any = { models: {
    Team: { ...byId([team]), listTeamBySlug: paged([team], 'slug'), listTeamByStatus: paged([team], 'status') },
    TeamMembership: { ...byId(memberships), listTeamMembershipByTeamId: paged(memberships, 'teamId'), listTeamMembershipByUserId: paged(memberships, 'userId') },
    TeamRosterSlot: { ...byId(slots), listTeamRosterSlotByTeamId: paged(slots, 'teamId'), listTeamRosterSlotByMembershipId: paged(slots, 'membershipId') },
    PlayerChampionPoolEntry: { ...byId(pool), listPlayerChampionPoolEntryByTeamId: paged(pool, 'teamId'), listPlayerChampionPoolEntryByMembershipId: paged(pool, 'membershipId') },
  } }
  return { client, team, memberships, slots }
}

test('roster assignment is one transaction with revision condition and deterministic position/player guards', async () => {
  const { client, team } = fixture(); let request: any[] = []
  const tx = { transact: async (items: any[]) => { request = items } }
  await handleSetTeamRosterSlot(event(IDS.manager, [], { teamId: team.id, membershipId: `team-membership:${team.id}:${IDS.player}`, gameRoleKey: 'MID', slotType: 'STARTER', action: 'ASSIGN', expectedRevision: 7 }), client, tx, names)
  assert.equal(request.length, 3)
  assert.match(request[0].Update.ConditionExpression, /#revision = :expected/)
  assert.equal(request[0].Update.ExpressionAttributeValues[':expected'], 7)
  assert.equal(request[1].Put.Item.id, `team-roster:${team.id}:starter-player:team-membership:${team.id}:${IDS.player}`)
  assert.equal(request[2].Put.Item.id, `team-roster:${team.id}:starter:MID`)
})

test('stale concurrent roster writes surface a stable conflict and do not retry', async () => {
  const { client, team } = fixture(); let calls = 0
  const tx = { transact: async () => { calls += 1; if (calls > 1) throw Object.assign(new Error('cancelled'), { name: 'TransactionCanceledException' }) } }
  const input = { teamId: team.id, membershipId: `team-membership:${team.id}:${IDS.player}`, gameRoleKey: 'TOP', slotType: 'STARTER', action: 'ASSIGN', expectedRevision: 7 }
  await handleSetTeamRosterSlot(event(IDS.manager, [], input), client, tx, names)
  await assert.rejects(() => handleSetTeamRosterSlot(event(IDS.manager, [], { ...input, membershipId: `team-membership:${team.id}:${IDS.player2}` }), client, tx, names), /refresh and try again/)
  assert.equal(calls, 2)
})

test('transaction failure exposes no sequential revision or slot write and later revision cannot interleave', async () => {
  const { client, team } = fixture(); let modelWrites = 0; let captured: any[] = []
  client.models.Team.update = async () => { modelWrites += 1; throw new Error('must not run') }
  client.models.TeamRosterSlot.update = async () => { modelWrites += 1; throw new Error('must not run') }
  client.models.TeamRosterSlot.create = async () => { modelWrites += 1; throw new Error('must not run') }
  const tx = { transact: async (items: any[]) => { captured = items; throw Object.assign(new Error('cancelled'), { name: 'TransactionCanceledException' }) } }
  await assert.rejects(() => handleSetTeamRosterSlot(event(IDS.manager, [], { teamId: team.id, membershipId: `team-membership:${team.id}:${IDS.player}`, gameRoleKey: 'ADC', slotType: 'STARTER', action: 'ASSIGN', expectedRevision: 7 }), client, tx, names), /refresh and try again/)
  assert.equal(modelWrites, 0)
  assert.equal(captured[0].Update.ExpressionAttributeValues[':next'], 8)
  assert.ok(captured.slice(1).every((item) => item.Put?.TableName === names.roster || item.Update?.TableName === names.roster))
})

test('one player cannot concurrently acquire two roles from the same observed revision', async () => {
  const { client, team } = fixture(); let revision = 7
  const tx = { transact: async (items: any[]) => {
    const expected = items[0].Update.ExpressionAttributeValues[':expected']
    if (expected !== revision) throw Object.assign(new Error('cancelled'), { name: 'TransactionCanceledException' })
    revision += 1
  } }
  const base = { teamId: team.id, membershipId: `team-membership:${team.id}:${IDS.player}`, slotType: 'STARTER', action: 'ASSIGN', expectedRevision: 7 }
  const results = await Promise.allSettled([
    handleSetTeamRosterSlot(event(IDS.manager, [], { ...base, gameRoleKey: 'TOP' }), client, tx, names),
    handleSetTeamRosterSlot(event(IDS.manager, [], { ...base, gameRoleKey: 'MID' }), client, tx, names),
  ])
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1)
  assert.equal(revision, 8)
})

test('manager and coach replacement requests atomically update the authority reference and memberships', async () => {
  const { client, team } = fixture(); const requests: any[][] = []; const tx = { transact: async (items: any[]) => { requests.push(items) } }
  await handleSetTeamManager(event(IDS.admin, ['Admin'], { teamId: team.id, targetEmail: 'player@example.com', action: 'ASSIGN', expectedRevision: 4 }), client, tx, names)
  await handleManageTeamMember(event(IDS.manager, [], { teamId: team.id, targetEmail: 'player2@example.com', role: 'COACH', action: 'ASSIGN', expectedRevision: 4 }), client, tx, names)
  assert.ok(Object.values(requests[0][0].Update.ExpressionAttributeNames).includes('managerMembershipId'))
  assert.ok(requests[0].some((item) => item.Update?.Key?.id === team.managerMembershipId))
  assert.ok(Object.values(requests[1][0].Update.ExpressionAttributeNames).includes('coachMembershipId'))
  assert.ok(requests[1].some((item) => item.Update?.Key?.id === team.coachMembershipId))
})

test('stale concurrent Manager and Coach assignments cannot create two active holders', async () => {
  for (const role of ['MANAGER', 'COACH']) {
    const { client, team } = fixture(); let revision = 4
    const tx = { transact: async (items: any[]) => {
      const expected = items[0].Update.ExpressionAttributeValues[':expected']
      if (expected !== revision) throw Object.assign(new Error('cancelled'), { name: 'TransactionCanceledException' })
      revision += 1
    } }
    const calls = role === 'MANAGER'
      ? ['player@example.com', 'player2@example.com'].map((targetEmail) => handleSetTeamManager(event(IDS.admin, ['SuperAdmin'], { teamId: team.id, targetEmail, action: 'ASSIGN', expectedRevision: 4 }), client, tx, names))
      : ['player@example.com', 'player2@example.com'].map((targetEmail) => handleManageTeamMember(event(IDS.manager, [], { teamId: team.id, targetEmail, role: 'COACH', action: 'ASSIGN', expectedRevision: 4 }), client, tx, names))
    const results = await Promise.allSettled(calls)
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1)
  }
})

test('indexed reads paginate and never call model.list scans', async () => {
  const { client } = fixture()
  const mine = await handleListMyTeams(event(IDS.manager, [], { limit: 1 }), client)
  assert.equal(mine.items.length, 1)
  assert.equal(mine.items[0].role, 'MANAGER')
  assert.equal((await handleGetTeamHub(event(IDS.coach, [], { teamSlug: 'alpha' }), client)).myRole, 'COACH')
})

test('SuperAdmin lists every team without requiring a TeamMembership record', async () => {
  const { client, team } = fixture()
  const result = await handleListMyTeams(event(IDS.admin, ['SuperAdmin'], { status: 'ACTIVE', limit: 50 }), client)
  assert.equal(result.items.length, 1)
  assert.equal(result.items[0].id, team.id)
  assert.equal(result.items[0].role, 'ADMIN')
})

test('admin account search normalizes email and username queries and returns bounded safe Nicholas account data', async () => {
  const calls: any[] = []
  const nicholas = { Username: IDS.admin, Enabled: true, UserStatus: 'CONFIRMED', Attributes: [{ Name: 'email', Value: 'N.GREFSHEIM@PROJECTRESPAWN.COM' }, { Name: 'preferred_username', Value: 'Ravens Gamer' }, { Name: 'sub', Value: IDS.admin }] }
  const directory = { listUsers: async (input: any) => { calls.push(input); return { Users: [nicholas] } } }
  const result = await handleSearchTeamAssignableUsers({ ...event(IDS.admin, ['SuperAdmin'], { query: '  N.Grefsheim  ' }), assignmentDirectory: directory })
  assert.deepEqual(result, { items: [{ username: IDS.admin, displayName: 'Ravens Gamer', email: 'n.grefsheim@projectrespawn.com', enabled: true, confirmed: true, eligible: true }] })
  assert.deepEqual(calls.map((call) => call.Filter), ['email ^= "n.grefsheim"', 'username ^= "N.Grefsheim"', 'preferred_username ^= "N.Grefsheim"'])
  assert.ok(calls.every((call) => call.Limit === 10 && call.UserPoolId === 'test-pool'))
})

test('account search rejects unauthorized team access and undersized enumeration, returns at most ten, and creates no membership', async () => {
  const { client, team } = fixture()
  let calls = 0
  const directory = { listUsers: async () => { calls += 1; return { Users: Array.from({ length: 12 }, (_, index) => ({ Username: id(index + 20), Enabled: index !== 1, UserStatus: index === 2 ? 'UNCONFIRMED' : 'CONFIRMED', Attributes: [{ Name: 'email', Value: `member${index}@example.com` }] })) } } }
  await assert.rejects(() => handleSearchTeamAssignableUsers({ ...event(IDS.outsider, [], { query: 'member', teamId: team.id }), assignmentDirectory: directory }, client), /denied/)
  await assert.rejects(() => searchAssignableAccounts(' ', directory), /Invalid account search/)
  assert.equal(calls, 0)
  const result = await searchAssignableAccounts('member', directory)
  assert.equal(result.items.length, 10)
  assert.equal(result.items[1].eligible, false)
  assert.equal(result.items[2].eligible, false)
  assert.equal(calls, 3)
})

test('dual SuperAdmin Manager retains platform and team capabilities while plain Admin lacks manager capabilities', async () => {
  const { client, team, memberships } = fixture()
  memberships[0].userId = IDS.admin
  const dual = await handleGetTeamHub(event(IDS.admin, ['SuperAdmin'], { teamId: team.id }), client)
  assert.equal(dual.isPlatformAdmin, true)
  assert.equal(dual.teamRole, 'MANAGER')
  assert.equal(dual.myRole, 'MANAGER')
  assert.deepEqual(dual.capabilities, { canAdministerTeam: true, canManageMembers: true, canManageRoster: true, canReviewChampionPools: false, canEditChampionPool: false })

  const plain = fixture()
  const admin = await handleGetTeamHub(event(IDS.admin, ['SuperAdmin'], { teamId: plain.team.id }), plain.client)
  assert.equal(admin.isPlatformAdmin, true)
  assert.equal(admin.teamRole, null)
  assert.equal(admin.capabilities.canManageMembers, false)
  await assert.rejects(() => handleManageTeamMember(event(IDS.admin, ['SuperAdmin'], { teamId: plain.team.id, targetEmail: 'player2@example.com', role: 'PLAYER', action: 'ASSIGN', expectedRevision: 4 }), plain.client, { transact: async () => undefined }, names), /denied/)
})

test('active Manager searches only for their exact team while Coach and cross-team searches fail before Cognito', async () => {
  const { client, team } = fixture(); let calls = 0
  const directory = { listUsers: async () => { calls += 1; return { Users: [] } } }
  await handleSearchTeamAssignableUsers({ ...event(IDS.manager, [], { query: 'pl', teamId: team.id }), assignmentDirectory: directory }, client)
  assert.equal(calls, 3)
  await assert.rejects(() => handleSearchTeamAssignableUsers({ ...event(IDS.manager, [], { query: 'pl', teamId: 'team:other' }), assignmentDirectory: directory }, client), /denied/)
  await assert.rejects(() => handleSearchTeamAssignableUsers({ ...event(IDS.coach, [], { query: 'pl', teamId: team.id }), assignmentDirectory: directory }, client), /denied/)
  assert.equal(calls, 3)
})

test('authorization and strict action, enum, revision, notes and identifier validation fail closed', async () => {
  const { client, team } = fixture(); const tx = { transact: async () => undefined }
  await assert.rejects(() => handleSetTeamRosterSlot(event(IDS.outsider, [], { teamId: team.id, membershipId: `team-membership:${team.id}:${IDS.player}`, gameRoleKey: 'MID', slotType: 'STARTER', action: 'ASSIGN', expectedRevision: 7 }), client, tx, names), /denied/)
  await assert.rejects(() => handleManageTeamMember(event(IDS.manager, [], { teamId: team.id, targetEmail: 'player@example.com', role: 'PLAYER', action: 'UPSERT', expectedRevision: 4 }), client, tx, names), /Invalid membership action/)
  await assert.rejects(() => handleSetTeamRosterSlot(event(IDS.manager, [], { teamId: team.id, membershipId: `team-membership:${team.id}:${IDS.player}`, gameRoleKey: 'FLEX', slotType: 'STARTER', action: 'ASSIGN', expectedRevision: 7 }), client, tx, names), /Invalid League role/)
  await assert.rejects(() => handleSetTeamRosterSlot(event(IDS.manager, [], { teamId: team.id, membershipId: `team-membership:${team.id}:${IDS.player}`, gameRoleKey: 'MID', slotType: 'STARTER', action: 'ASSIGN', expectedRevision: -1 }), client, tx, names), /Invalid expected revision/)
  await assert.rejects(() => handleUpsertMyChampionPoolEntry(event(IDS.player, [], { teamId: team.id, championId: 'Ahri!', gameRoleKey: 'MID', comfortLevel: 'S', priority: 'HIGH', competitiveReady: true }), client), /Invalid champion ID/)
  await assert.rejects(() => handleUpsertMyChampionPoolEntry(event(IDS.player, [], { teamId: team.id, championId: 'Ahri', gameRoleKey: 'MID', comfortLevel: 'S', priority: 'HIGH', competitiveReady: true, playerNotes: 'x'.repeat(501) }), client), /Invalid player notes/)
  await assert.rejects(() => handleListMyTeams(event(IDS.manager, [], { limit: 0 }), client), /Invalid pagination limit/)
})

test('generic member operation cannot alter authoritative Manager', async () => {
  const { client, team } = fixture()
  await assert.rejects(() => handleManageTeamMember(event(IDS.manager, [], { teamId: team.id, targetMembershipId: team.managerMembershipId, role: 'PLAYER', action: 'REVOKE', expectedRevision: 4 }), client, { transact: async () => undefined }, names), /Admin operation/)
})

test('exact email resolution normalizes case, limits to two, and returns only canonical identity plus display name', async () => {
  let request: any
  const result = await resolveAssignmentAccount('  PLAYER@EXAMPLE.COM ', { listUsers: async (input) => {
    request = input
    return { Users: [{ Enabled: true, UserStatus: 'CONFIRMED', Attributes: [{ Name: 'sub', Value: IDS.player }, { Name: 'email', Value: 'player@example.com' }, { Name: 'name', Value: 'Player' }, { Name: 'custom:private', Value: 'secret' }] }] }
  } })
  assert.deepEqual(result, { userId: IDS.player, displayName: 'Player' })
  assert.equal(request.Limit, 2)
  assert.equal(request.Filter, 'email = "player@example.com"')
  assert.equal('email' in result, false)
})

test('exact deployed Cognito subject shape revalidates and maps username to canonical sub', async () => {
  const result = await resolveAssignmentAccount('  N.GREFSHEIM@PROJECTRESPAWN.COM ', { listUsers: async () => ({ Users: [{ Username: NICHOLAS, Enabled: true, UserStatus: 'CONFIRMED', Attributes: [{ Name: 'sub', Value: NICHOLAS }, { Name: 'email', Value: 'n.grefsheim@projectrespawn.com' }, { Name: 'preferred_username', Value: 'Ravens Gamer' }, { Name: 'email_verified', Value: 'true' }] }] }) })
  assert.deepEqual(result, { userId: NICHOLAS, displayName: 'Ravens Gamer' })
})

test('eligible SuperAdmin self-assignment creates the first manager atomically with canonical keys', async () => {
  const { client, team, memberships } = fixture(); memberships.splice(0)
  let request: any[] = []
  const directory = { listUsers: async () => ({ Users: [{ Username: NICHOLAS, Enabled: true, UserStatus: 'CONFIRMED', Attributes: [{ Name: 'sub', Value: NICHOLAS }, { Name: 'email', Value: 'n.grefsheim@projectrespawn.com' }, { Name: 'preferred_username', Value: 'Ravens Gamer' }] }] }) }
  const result = await handleSetTeamManager({ ...event(NICHOLAS, ['Member', 'SuperAdmin'], { teamId: team.id, targetEmail: 'n.grefsheim@projectrespawn.com', action: 'ASSIGN', expectedRevision: 4 }), assignmentDirectory: directory }, client, { transact: async (items: any[]) => { request = items } }, names)
  const membershipId = `team-membership:${team.id}:${NICHOLAS}`
  assert.equal(request.length, 2)
  assert.equal(request[0].Update.Key.id, team.id)
  assert.equal(request[0].Update.ExpressionAttributeValues[':s0'], membershipId)
  assert.equal(request[1].Put.Item.id, membershipId)
  assert.equal(request[1].Put.Item.userId, NICHOLAS)
  assert.equal(request[1].Put.Item.role, 'MANAGER')
  assert.equal(request[1].Put.Item.status, 'ACTIVE')
  assert.deepEqual(result, { teamId: team.id, membershipRevision: 5, role: 'MANAGER', action: 'ASSIGN' })
  assert.equal('userId' in result, false)
})

test('failed first-manager transaction creates no partial membership and inactive identity is deterministically reused', async () => {
  const { client, team, memberships } = fixture(); memberships.splice(0)
  let modelWrites = 0, txCalls = 0
  client.models.Team.update = async () => { modelWrites += 1 }
  client.models.TeamMembership.create = async () => { modelWrites += 1 }
  const directory = { listUsers: async () => ({ Users: [{ Username: NICHOLAS, Enabled: true, UserStatus: 'CONFIRMED', Attributes: [{ Name: 'sub', Value: NICHOLAS }, { Name: 'email', Value: 'n.grefsheim@projectrespawn.com' }] }] }) }
  const call = () => handleSetTeamManager({ ...event(NICHOLAS, ['SuperAdmin'], { teamId: team.id, targetEmail: 'n.grefsheim@projectrespawn.com', action: 'ASSIGN', expectedRevision: 4 }), assignmentDirectory: directory }, client, { transact: async () => { txCalls += 1; throw Object.assign(new Error('cancelled'), { name: 'TransactionCanceledException' }) } }, names)
  await assert.rejects(call, /refresh and try again/)
  assert.equal(txCalls, 1)
  assert.equal(modelWrites, 0)

  const inactive: any = { id: `team-membership:${team.id}:${NICHOLAS}`, teamId: team.id, userId: NICHOLAS, displayName: 'Old name', role: 'PLAYER', status: 'INACTIVE', createdAt: '2026-08-01T00:00:00.000Z' }
  memberships.push(inactive)
  let request: any[] = []
  await handleSetTeamManager({ ...event(NICHOLAS, ['SuperAdmin'], { teamId: team.id, targetEmail: 'n.grefsheim@projectrespawn.com', action: 'ASSIGN', expectedRevision: 4 }), assignmentDirectory: directory }, client, { transact: async (items: any[]) => { request = items } }, names)
  assert.equal(request[1].Put.Item.id, memberships[0].id)
  assert.equal(request[1].Put.Item.createdAt, inactive.createdAt)
  assert.equal(request.filter((item) => item.Put?.TableName === names.membership).length, 1)
})

test('deployed managerless assignment operation set is completely covered by the exact table IAM grant', async () => {
  const { client, team, memberships } = fixture(); memberships.splice(0)
  const directory = { listUsers: async () => ({ Users: [{ Username: NICHOLAS, Enabled: true, UserStatus: 'CONFIRMED', Attributes: [{ Name: 'sub', Value: NICHOLAS }, { Name: 'email', Value: 'n.grefsheim@projectrespawn.com' }] }] }) }
  let request: any[] = []
  await handleSetTeamManager({ ...event(NICHOLAS, ['SuperAdmin'], { teamId: team.id, targetEmail: 'n.grefsheim@projectrespawn.com', action: 'ASSIGN', expectedRevision: 4 }), assignmentDirectory: directory }, client, { transact: async (items: any[]) => { request = items } }, names)
  const operations = request.map((item) => {
    const operation = ['Put', 'Update', 'ConditionCheck', 'Delete'].find((candidate) => candidate in item)
    return { operation, table: operation ? item[operation].TableName : undefined }
  })
  assert.deepEqual(operations, [
    { operation: 'Update', table: names.team },
    { operation: 'Put', table: names.membership },
  ])
  const source = await import('node:fs/promises').then(({ readFile }) => readFile(new URL('../../backend.ts', import.meta.url), 'utf8'))
  const policy = source.slice(source.indexOf('teamHubLambda.addToRolePolicy'), source.indexOf('backend.data.resources.graphqlApi.grantQuery'))
  const requiredActions = new Set(operations.map(({ operation }) => `dynamodb:${operation}Item`))
  for (const action of requiredActions) assert.match(policy, new RegExp(`['"]${action}['"]`))
  assert.doesNotMatch(policy, /dynamodb:(?:ConditionCheckItem|DeleteItem|\*)/)
  assert.doesNotMatch(policy, /resources:\s*\[\s*['"]\*['"]\s*\]/)
  const requiredTables = new Set(operations.map(({ table }) => table))
  const tableKeys: Record<string, string> = { [names.team]: 'Team', [names.membership]: 'TeamMembership', [names.roster]: 'TeamRosterSlot' }
  for (const table of requiredTables) assert.match(policy, new RegExp(`teamHubTables\\.${tableKeys[table!]}\\.tableArn`))
})

test('conditional and AWS transaction cancellations map safely while access failures stay generic', async () => {
  await assert.rejects(() => commitTransaction({ transact: async () => { throw Object.assign(new Error('condition'), { name: 'TransactionCanceledException' }) } }, []), /Team Hub changed; refresh and try again/)
  await assert.rejects(() => commitTransaction({ transact: async () => { throw Object.assign(new Error('denied'), { name: 'AccessDeniedException' }) } }, []), /Team Hub update failed/)
})

test('deployed Cognito subject can be removed through its canonical membership ID', async () => {
  const { client, team, memberships } = fixture()
  const membership = { id: `team-membership:${team.id}:${NICHOLAS}`, teamId: team.id, userId: NICHOLAS, displayName: 'Ravens Gamer', role: 'MANAGER', status: 'ACTIVE' }
  memberships.splice(0, memberships.length, membership); team.managerMembershipId = membership.id
  let request: any[] = []
  await handleSetTeamManager(event(NICHOLAS, ['SuperAdmin'], { teamId: team.id, targetMembershipId: membership.id, action: 'REVOKE', expectedRevision: 4 }), client, { transact: async (items: any[]) => { request = items } }, names)
  assert.equal(request[1].Update.Key.id, membership.id)
})

test('account resolution rejects malformed, oversized, missing, ambiguous, disabled, and unconfirmed accounts', async () => {
  await assert.rejects(() => resolveAssignmentAccount('bad', assignmentDirectory), new RegExp(ACCOUNT_UNAVAILABLE))
  await assert.rejects(() => resolveAssignmentAccount(`${'a'.repeat(250)}@x.com`, assignmentDirectory), new RegExp(ACCOUNT_UNAVAILABLE))
  await assert.rejects(() => resolveAssignmentAccount('missing@example.com', assignmentDirectory), new RegExp(ACCOUNT_NOT_FOUND))
  const user = (enabled = true, status = 'CONFIRMED') => ({ Enabled: enabled, UserStatus: status, Attributes: [{ Name: 'sub', Value: IDS.player }, { Name: 'email', Value: 'player@example.com' }] })
  await assert.rejects(() => resolveAssignmentAccount('player@example.com', { listUsers: async () => ({ Users: [user(), user()] }) }), new RegExp(ACCOUNT_UNAVAILABLE))
  await assert.rejects(() => resolveAssignmentAccount('player@example.com', { listUsers: async () => ({ Users: [user(false)] }) }), new RegExp(ACCOUNT_UNAVAILABLE))
  await assert.rejects(() => resolveAssignmentAccount('player@example.com', { listUsers: async () => ({ Users: [user(true, 'UNCONFIRMED')] }) }), new RegExp(ACCOUNT_UNAVAILABLE))
})

test('authorization is established before email lookup for outsider, Coach, Player, and inactive Manager', async () => {
  for (const caller of [IDS.outsider, IDS.coach, IDS.player]) {
    const { client, team } = fixture(); let probes = 0
    const denied = event(caller, [], { teamId: team.id, targetEmail: 'player2@example.com', role: 'PLAYER', action: 'ASSIGN', expectedRevision: 4 })
    denied.assignmentDirectory = { listUsers: async () => { probes += 1; return { Users: [] } } }
    await assert.rejects(() => handleManageTeamMember(denied, client, { transact: async () => undefined }, names), /denied/)
    assert.equal(probes, 0)
  }
  const { client, team, memberships } = fixture(); memberships[0].status = 'INACTIVE'; let probes = 0
  const denied = event(IDS.manager, [], { teamId: team.id, targetEmail: 'player2@example.com', role: 'PLAYER', action: 'ASSIGN', expectedRevision: 4 })
  denied.assignmentDirectory = { listUsers: async () => { probes += 1; return { Users: [] } } }
  await assert.rejects(() => handleManageTeamMember(denied, client, { transact: async () => undefined }, names), /denied/)
  assert.equal(probes, 0)
})

test('starter replacement and removal include position, old-player guard, and timestamped Team update', async () => {
  const { client, team, memberships, slots } = fixture(); const old = memberships[3]
  slots.push(
    { id: `team-roster:${team.id}:starter:MID`, teamId: team.id, membershipId: old.id, playerUserId: old.userId, gameRoleKey: 'MID', slotType: 'STARTER', status: 'ACTIVE' },
    { id: `team-roster:${team.id}:starter-player:${old.id}`, teamId: team.id, membershipId: old.id, playerUserId: old.userId, gameRoleKey: 'MID', slotType: 'STARTER_GUARD', status: 'ACTIVE' },
  )
  const requests: any[][] = [], tx = { transact: async (items: any[]) => { requests.push(items) } }
  await handleSetTeamRosterSlot(event(IDS.manager, [], { teamId: team.id, membershipId: memberships[2].id, gameRoleKey: 'MID', slotType: 'STARTER', action: 'ASSIGN', expectedRevision: 7 }), client, tx, names)
  assert.equal(requests[0].length, 4)
  assert.equal(requests[0][1].Update.Key.id, `team-roster:${team.id}:starter-player:${old.id}`)
  assert.ok(requests[0][0].Update.ExpressionAttributeNames['#updatedAt'])
  slots.splice(0, slots.length, { ...slots[0], membershipId: memberships[2].id, playerUserId: IDS.player }, { ...slots[1], id: `team-roster:${team.id}:starter-player:${memberships[2].id}`, membershipId: memberships[2].id, playerUserId: IDS.player })
  await handleSetTeamRosterSlot(event(IDS.manager, [], { teamId: team.id, membershipId: memberships[2].id, gameRoleKey: 'MID', slotType: 'STARTER', action: 'REMOVE', expectedRevision: 7 }), client, tx, names)
  assert.equal(requests[1].length, 3)
  assert.deepEqual(requests[1].slice(1).map((item) => item.Update.Key.id).sort(), slots.map((slot) => slot.id).sort())
})

test('substitute assignment and removal use only the deterministic substitute record', async () => {
  const { client, team, memberships, slots } = fixture(); const requests: any[][] = [], tx = { transact: async (items: any[]) => { requests.push(items) } }
  const membership = memberships[2], key = `team-roster:${team.id}:substitute:${membership.id}:ADC`
  await handleSetTeamRosterSlot(event(IDS.manager, [], { teamId: team.id, membershipId: membership.id, gameRoleKey: 'ADC', slotType: 'SUBSTITUTE', action: 'ASSIGN', expectedRevision: 7 }), client, tx, names)
  assert.equal(requests[0][1].Put.Item.id, key)
  assert.equal(requests[0].length, 2)
  slots.push({ ...requests[0][1].Put.Item })
  await handleSetTeamRosterSlot(event(IDS.manager, [], { teamId: team.id, membershipId: membership.id, gameRoleKey: 'ADC', slotType: 'SUBSTITUTE', action: 'REMOVE', expectedRevision: 7 }), client, tx, names)
  assert.equal(requests[1][1].Update.Key.id, key)
  assert.equal(requests[1].length, 2)
})

test('Player revocation and Player-to-Coach transition atomically clean every roster record', async () => {
  for (const action of ['REVOKE', 'COACH']) {
    const { client, team, memberships, slots } = fixture(); const player = memberships[2]
    for (let index = 0; index < 3; index += 1) slots.push({ id: `slot-${index}`, teamId: team.id, membershipId: player.id, playerUserId: player.userId, gameRoleKey: 'TOP', slotType: index === 2 ? 'STARTER_GUARD' : 'SUBSTITUTE', status: 'ACTIVE' })
    let request: any[] = []; const tx = { transact: async (items: any[]) => { request = items } }
    const args = action === 'REVOKE'
      ? { teamId: team.id, targetMembershipId: player.id, role: 'PLAYER', action, expectedRevision: 4 }
      : { teamId: team.id, targetEmail: 'player@example.com', role: 'COACH', action: 'ASSIGN', expectedRevision: 4 }
    await handleManageTeamMember(event(IDS.manager, [], args), client, tx, names)
    assert.equal(request.filter((item) => item.Update?.TableName === names.roster).length, 3)
    assert.equal(request[0].Update.ExpressionAttributeValues[':rosterNext'], 8)
    assert.ok(request.every((item) => !item.Update || item.Update.TableName !== names.roster || item.Update.UpdateExpression.includes('updatedAt')))
  }
})

test('Manager revocation and Coach revocation require and clear authoritative references', async () => {
  const { client, team, memberships } = fixture(); const requests: any[][] = [], tx = { transact: async (items: any[]) => { requests.push(items) } }
  await handleSetTeamManager(event(IDS.admin, ['Admin'], { teamId: team.id, targetMembershipId: team.managerMembershipId, action: 'REVOKE', expectedRevision: 4 }), client, tx, names)
  assert.ok(Object.values(requests[0][0].Update.ExpressionAttributeNames).includes('managerMembershipId'))
  await handleManageTeamMember(event(IDS.manager, [], { teamId: team.id, targetMembershipId: team.coachMembershipId, role: 'COACH', action: 'REVOKE', expectedRevision: 4 }), client, tx, names)
  assert.ok(Object.values(requests[1][0].Update.ExpressionAttributeNames).includes('coachMembershipId'))
  const extra = { ...memberships[1], id: `team-membership:${team.id}:${IDS.outsider}`, userId: IDS.outsider }
  memberships.push(extra)
  await assert.rejects(() => handleManageTeamMember(event(IDS.manager, [], { teamId: team.id, targetMembershipId: extra.id, role: 'COACH', action: 'REVOKE', expectedRevision: 4 }), client, tx, names), /authoritative Coach/)
})

test('Player-to-Manager transition cleans roster state and stores the resolved sub without returning it', async () => {
  const { client, team, memberships, slots } = fixture(); const player = memberships[2]
  slots.push({ id: 'slot-player', teamId: team.id, membershipId: player.id, playerUserId: player.userId, gameRoleKey: 'TOP', slotType: 'STARTER', status: 'ACTIVE' })
  let request: any[] = []; const result = await handleSetTeamManager(event(IDS.admin, ['SuperAdmin'], { teamId: team.id, targetEmail: 'player@example.com', action: 'ASSIGN', expectedRevision: 4 }), client, { transact: async (items: any[]) => { request = items } }, names)
  assert.equal(request.filter((item) => item.Update?.TableName === names.roster).length, 1)
  const membership = request.find((item) => item.Put?.TableName === names.membership).Put.Item
  assert.equal(membership.userId, IDS.player)
  assert.equal(membership.role, 'MANAGER')
  assert.equal(membership.updatedAt, membership.createdAt)
  assert.equal('userId' in result, false)
})

test('bounded cleanup reaches the maximum safe request and rejects overflow before transaction execution', async () => {
  const { client, team, memberships, slots } = fixture(); const player = memberships[2]
  for (let index = 0; index < 20; index += 1) slots.push({ id: `bounded-${index}`, teamId: team.id, membershipId: player.id, playerUserId: player.userId, gameRoleKey: 'TOP', slotType: 'SUBSTITUTE', status: 'ACTIVE' })
  let request: any[] = []; await handleManageTeamMember(event(IDS.manager, [], { teamId: team.id, targetMembershipId: player.id, role: 'PLAYER', action: 'REVOKE', expectedRevision: 4 }), client, { transact: async (items: any[]) => { request = items } }, names)
  assert.equal(request.length, 22)
  slots.push({ id: 'overflow', teamId: team.id, membershipId: player.id, playerUserId: player.userId, gameRoleKey: 'MID', slotType: 'SUBSTITUTE', status: 'ACTIVE' })
  let calls = 0
  await assert.rejects(() => handleManageTeamMember(event(IDS.manager, [], { teamId: team.id, targetMembershipId: player.id, role: 'PLAYER', action: 'REVOKE', expectedRevision: 4 }), client, { transact: async () => { calls += 1 } }, names), /data limit exceeded/)
  assert.equal(calls, 0)
})

test('missing and conflicting Cognito identities, cross-team access, and inactive teams fail before lookup', async () => {
  const { client, team } = fixture(); let probes = 0
  const args = { teamId: team.id, targetEmail: 'player2@example.com', role: 'PLAYER', action: 'ASSIGN', expectedRevision: 4 }
  const missing: any = { identity: {}, arguments: args, assignmentDirectory: { listUsers: async () => { probes += 1; return { Users: [] } } } }
  await assert.rejects(() => handleManageTeamMember(missing, client, { transact: async () => undefined }, names), /Cognito sub/)
  const conflicting: any = event(IDS.manager, [], args); conflicting.identity.claims.sub = IDS.outsider; conflicting.assignmentDirectory = missing.assignmentDirectory
  await assert.rejects(() => handleManageTeamMember(conflicting, client, { transact: async () => undefined }, names), /Cognito sub/)
  await assert.rejects(() => handleManageTeamMember(event(IDS.manager, [], { ...args, teamId: 'team:other' }), client, { transact: async () => undefined }, names), /denied/)
  team.status = 'INACTIVE'
  await assert.rejects(() => handleManageTeamMember(event(IDS.manager, [], args), client, { transact: async () => undefined }, names), /denied/)
  assert.equal(probes, 0)
})

test('Manager can assign a Player, while removed Player and Coach lose pool access', async () => {
  const { client, team, memberships } = fixture(); let request: any[] = []
  await handleManageTeamMember(event(IDS.manager, [], { teamId: team.id, targetEmail: 'player2@example.com', role: 'PLAYER', action: 'ASSIGN', expectedRevision: 4 }), client, { transact: async (items: any[]) => { request = items } }, names)
  assert.equal(request.find((item) => item.Put?.TableName === names.membership).Put.Item.userId, IDS.player2)
  memberships[2].status = 'INACTIVE'
  await assert.rejects(() => handleUpsertMyChampionPoolEntry(event(IDS.player, [], { teamId: team.id, championId: 'Ahri', comfortLevel: 'S', priority: 'HIGH', competitiveReady: true }), client), /denied/)
  memberships[1].status = 'INACTIVE'
  await assert.rejects(() => handleGetTeamHub(event(IDS.coach, [], { teamId: team.id }), client), /denied/)
})

test('Player pool identity is caller-derived and cannot target another Player', async () => {
  const { client, team } = fixture()
  const result = await handleUpsertMyChampionPoolEntry(event(IDS.player, [], { teamId: team.id, championId: 'Ahri', gameRoleKey: 'MID', comfortLevel: 'S', priority: 'HIGH', competitiveReady: true, targetUserId: IDS.player2 }), client)
  assert.equal(result.playerUserId, IDS.player)
  assert.notEqual(result.playerUserId, IDS.player2)
})
