import { ACTIVE, INACTIVE, LEAGUE_STARTING_ROLES, TEAM_HUB_DENIED, actor, requireAdmin, requireCoach, requireManager, requirePlayer, requireTeamAccess } from './policy'
import { TEAM_HUB_CONFLICT, commitTransaction, tableNames, transactionClient } from './dynamo'
import { resolveAssignmentAccount, searchAssignableAccounts } from './accounts'

const PAGE_SIZE = 25
const MAX_PAGE_SIZE = 50
const MAX_INTERNAL_PAGES = 2
const MAX_TEAM_MEMBERS = 50
const MAX_MEMBER_SLOTS = 20
const MAX_TX_ITEMS = 25
const COGNITO_SUB = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TEAM_ID = /^team:[a-z0-9]+(?:-[a-z0-9]+)*$/
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const CHAMPION = /^[A-Za-z0-9]{1,40}$/
const ROLES = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'] as const

const clean = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const fail = (message: string): never => { throw new Error(message) }
const bounded = (value: unknown, label: string, max: number, required = true) => {
  const result = clean(value)
  if ((required && !result) || result.length > max) fail(`Invalid ${label}`)
  return result
}
const oneOf = (value: unknown, values: readonly string[], label: string) => {
  const result = clean(value)
  if (!values.includes(result)) fail(`Invalid ${label}`)
  return result
}
const teamIdValue = (value: unknown) => {
  const result = bounded(value, 'team ID', 70)
  if (!TEAM_ID.test(result)) fail('Invalid team ID')
  return result
}
const membershipIdValue = (value: unknown, teamId: string) => {
  const result = bounded(value, 'membership ID', 160)
  if (!result.startsWith(`team-membership:${teamId}:`) || !COGNITO_SUB.test(result.slice(`team-membership:${teamId}:`.length))) fail('Invalid membership ID')
  return result
}
const revisionValue = (value: unknown) => {
  if (!Number.isInteger(value) || Number(value) < 0 || Number(value) > 2_147_483_647) fail('Invalid expected revision')
  return Number(value)
}
const pageLimit = (value: unknown) => {
  if (value == null) return PAGE_SIZE
  if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > MAX_PAGE_SIZE) fail('Invalid pagination limit')
  return Number(value)
}
const pageToken = (value: unknown) => {
  if (value == null || value === '') return undefined
  const result = clean(value)
  if (!result || result.length > 4096) fail('Invalid pagination token')
  return result
}
const memberId = (teamId: string, userId: string) => `team-membership:${teamId}:${userId}`
const starterId = (teamId: string, role: string) => `team-roster:${teamId}:starter:${role}`
const starterGuardId = (teamId: string, membershipId: string) => `team-roster:${teamId}:starter-player:${membershipId}`
const substituteId = (teamId: string, membershipId: string, role: string) => `team-roster:${teamId}:substitute:${membershipId}:${role}`
const poolId = (teamId: string, userId: string, championId: string) => `team-pool:${teamId}:${userId}:${championId}`

const ok = (result: any, fallback: string) => {
  if (result?.errors?.length) { console.error(fallback, result.errors); fail(fallback) }
  return result?.data
}
async function client(injected?: any) {
  if (injected) return injected
  const { getDataClient } = await import('../shared/dataClient')
  return getDataClient()
}
const page = async (method: any, key: any, limit: number, nextToken?: string) => {
  const result = await method(key, { limit, ...(nextToken ? { nextToken } : {}) })
  if (result?.errors?.length) { console.error('Team Hub lookup failed', result.errors); fail('Team Hub lookup failed') }
  return { items: result?.data || [], nextToken: result?.nextToken || null }
}
async function complete(method: any, key: any, itemLimit: number): Promise<any[]> {
  const items: any[] = []
  let token: string | undefined
  for (let count = 0; count < MAX_INTERNAL_PAGES; count += 1) {
    const result = await page(method, key, Math.min(PAGE_SIZE, itemLimit - items.length), token)
    items.push(...result.items)
    if (!result.nextToken) return items
    if (items.length >= itemLimit) break
    token = result.nextToken
  }
  return fail('Team Hub data limit exceeded')
}
const membershipsFor = (data: any, teamId: string) => complete(data.models.TeamMembership.listTeamMembershipByTeamId, { teamId }, MAX_TEAM_MEMBERS)
const membershipForUser = (data: any, userId: string, limit = MAX_TEAM_MEMBERS) => complete(data.models.TeamMembership.listTeamMembershipByUserId, { userId }, limit)
const slotsForTeam = (data: any, teamId: string) => complete(data.models.TeamRosterSlot.listTeamRosterSlotByTeamId, { teamId }, MAX_TEAM_MEMBERS)
const slotsForMember = (data: any, membershipId: string) => complete(data.models.TeamRosterSlot.listTeamRosterSlotByMembershipId, { membershipId }, MAX_MEMBER_SLOTS)

async function rawTeam(data: any, teamId: string) {
  return ok(await data.models.Team.get({ id: teamId }), 'Team lookup failed')
}
async function teamFor(data: any, teamId: string, isAdmin = false) {
  const team = await rawTeam(data, teamId)
  if (!team || (!isAdmin && team.status !== ACTIVE)) fail(TEAM_HUB_DENIED)
  return team
}
async function teamFromInput(data: any, args: any, isAdmin: boolean) {
  if (args.teamId) return teamFor(data, teamIdValue(args.teamId), isAdmin)
  const slug = bounded(args.teamSlug, 'team slug', 48).toLowerCase()
  if (!SLUG.test(slug)) fail('Invalid team slug')
  const found = await page(data.models.Team.listTeamBySlug, { slug }, 2)
  if (found.items.length !== 1) fail(TEAM_HUB_DENIED)
  return teamFor(data, found.items[0].id, isAdmin)
}
const publicTeam = (team: any) => ({ id: team.id, slug: team.slug, name: team.name, gameKey: team.gameKey, status: team.status, rosterRevision: team.rosterRevision || 0, membershipRevision: team.membershipRevision || 0, createdAt: team.createdAt || null, updatedAt: team.updatedAt || null })
const publicMember = (row: any) => ({ id: row.id, teamId: row.teamId, displayName: row.displayName || 'Project Respawn member', role: row.role, status: row.status, revokedAt: row.revokedAt || null })
const publicSlot = (row: any) => ({ id: row.id, teamId: row.teamId, membershipId: row.membershipId, gameRoleKey: row.gameRoleKey, slotType: row.slotType, status: row.status })
const now = () => new Date().toISOString()

const teamRevisionUpdate = (table: string, team: any, field: 'rosterRevision' | 'membershipRevision', expected: number, by: string, set?: Record<string, any>, remove?: string[], touchRoster = false) => {
  const names: Record<string, string> = { '#revision': field, '#status': 'status', '#updatedBy': 'updatedByUserId', '#updatedAt': 'updatedAt' }
  const timestamp = now()
  const values: Record<string, any> = { ':expected': expected, ':next': expected + 1, ':active': ACTIVE, ':by': by, ':updatedAt': timestamp }
  const sets = ['#revision = :next', '#updatedBy = :by', '#updatedAt = :updatedAt']
  let condition = '#revision = :expected AND #status = :active'
  if (touchRoster && field !== 'rosterRevision') {
    names['#rosterRevision'] = 'rosterRevision'; values[':rosterExpected'] = Number(team.rosterRevision || 0); values[':rosterNext'] = Number(team.rosterRevision || 0) + 1
    sets.push('#rosterRevision = :rosterNext'); condition += ' AND #rosterRevision = :rosterExpected'
  }
  Object.entries(set || {}).forEach(([key, value], index) => { names[`#s${index}`] = key; values[`:s${index}`] = value; sets.push(`#s${index} = :s${index}`) })
  const removes = (remove || []).map((key, index) => { names[`#r${index}`] = key; return `#r${index}` })
  return { Update: { TableName: table, Key: { id: team.id }, ConditionExpression: condition, UpdateExpression: `SET ${sets.join(', ')}${removes.length ? ` REMOVE ${removes.join(', ')}` : ''}`, ExpressionAttributeNames: names, ExpressionAttributeValues: values } }
}
const putMembership = (table: string, item: any) => ({ Put: { TableName: table, Item: item, ConditionExpression: 'attribute_not_exists(id) OR teamId = :teamId', ExpressionAttributeValues: { ':teamId': item.teamId } } })
const revokeMembership = (table: string, membership: any, by: string, timestamp: string) => ({ Update: { TableName: table, Key: { id: membership.id }, ConditionExpression: '#status = :active AND teamId = :teamId AND #role = :role', UpdateExpression: 'SET #status = :inactive, revokedAt = :at, revokedByUserId = :by, updatedAt = :at', ExpressionAttributeNames: { '#status': 'status', '#role': 'role' }, ExpressionAttributeValues: { ':active': ACTIVE, ':inactive': INACTIVE, ':teamId': membership.teamId, ':role': membership.role, ':at': timestamp, ':by': by } } })
const deactivateSlot = (table: string, slot: any, timestamp: string) => ({ Update: { TableName: table, Key: { id: slot.id }, ConditionExpression: '#status = :active AND membershipId = :membershipId', UpdateExpression: 'SET #status = :inactive, deactivatedAt = :at, updatedAt = :at', ExpressionAttributeNames: { '#status': 'status' }, ExpressionAttributeValues: { ':active': ACTIVE, ':inactive': INACTIVE, ':membershipId': slot.membershipId, ':at': timestamp } } })
const putSlot = (table: string, item: any) => ({ Put: { TableName: table, Item: item } })
const ensureTxBound = (items: any[]) => { if (items.length > MAX_TX_ITEMS) fail('Team Hub roster limit exceeded'); return items }
const auditMembership = (value: Record<string, unknown>) => console.info('Team Hub membership audit', value)
async function resolveForAssignment(event: any, actorUserId: string, teamId: string, action: string) {
  try {
    return await resolveAssignmentAccount(event.arguments?.targetEmail, event.assignmentDirectory)
  } catch (error) {
    auditMembership({ actorUserId, teamId, action, category: 'account_resolution_failed', timestamp: now() })
    throw error
  }
}

async function transact(injectedTx: any, injectedNames: any, items: any[]) {
  await commitTransaction(injectedTx || transactionClient(), ensureTxBound(items))
}

export async function handleListMyTeams(event: any, injected?: any) {
  const current = actor(event), data = await client(injected)
  const limit = pageLimit(event.arguments?.limit), nextToken = pageToken(event.arguments?.nextToken)
  if (current.isAdmin) {
    const status = oneOf(event.arguments?.status || ACTIVE, [ACTIVE, INACTIVE], 'team status')
    const result = await page(data.models.Team.listTeamByStatus, { status }, limit, nextToken)
    return { items: result.items.map((team: any) => ({ ...publicTeam(team), role: 'ADMIN' })), nextToken: result.nextToken }
  }
  if (event.arguments?.status && event.arguments.status !== ACTIVE) fail(TEAM_HUB_DENIED)
  const result = await page(data.models.TeamMembership.listTeamMembershipByUserId, { userId: current.userId }, limit, nextToken)
  const active = result.items.filter((row: any) => row.status === ACTIVE)
  const teams = await Promise.all(active.map((row: any) => rawTeam(data, row.teamId)))
  return { items: teams.flatMap((team: any, index: number) => team?.status === ACTIVE ? [{ ...publicTeam(team), role: active[index].role }] : []), nextToken: result.nextToken }
}

export async function handleSearchTeamAssignableUsers(event: any, injected?: any) {
  const current = actor(event)
  if (!current.isAdmin) {
    const teamId = teamIdValue(event.arguments?.teamId)
    const data = await client(injected)
    await teamFor(data, teamId)
    requireManager(await membershipsFor(data, teamId), current.userId)
  }
  return searchAssignableAccounts(event.arguments?.query, event.assignmentDirectory)
}

export async function handleCreateTeamHubTeam(event: any, injected?: any) {
  const current = requireAdmin(event), data = await client(injected)
  const slug = bounded(event.arguments?.slug, 'team slug', 48).toLowerCase()
  if (!SLUG.test(slug)) fail('Invalid team slug')
  const name = bounded(event.arguments?.name, 'team name', 100)
  const gameKey = oneOf(event.arguments?.gameKey, ['LEAGUE_OF_LEGENDS'], 'game key')
  const id = `team:${slug}`
  if (await rawTeam(data, id)) fail('Team slug already exists')
  return publicTeam(ok(await data.models.Team.create({ id, slug, name, gameKey, status: ACTIVE, createdByUserId: current.userId, updatedByUserId: current.userId, rosterRevision: 0, membershipRevision: 0 }), 'Team creation failed'))
}

export async function handleUpdateTeamHubTeam(event: any, injected?: any) {
  const current = requireAdmin(event), data = await client(injected), id = teamIdValue(event.arguments?.teamId)
  const existing = await rawTeam(data, id)
  if (!existing) fail(TEAM_HUB_DENIED)
  const name = event.arguments?.name == null ? existing.name : bounded(event.arguments.name, 'team name', 100)
  const status = event.arguments?.status == null ? existing.status : oneOf(event.arguments.status, [ACTIVE, INACTIVE], 'team status')
  return publicTeam(ok(await data.models.Team.update({ id, name, status, updatedByUserId: current.userId }), 'Team update failed'))
}

export async function handleSetTeamManager(event: any, injected?: any, injectedTx?: any, injectedNames?: any) {
  const current = requireAdmin(event), data = await client(injected), teamId = teamIdValue(event.arguments?.teamId)
  const team = await teamFor(data, teamId, true), expected = revisionValue(event.arguments?.expectedRevision)
  const action = oneOf(event.arguments?.action, ['ASSIGN', 'REVOKE'], 'membership action')
  const memberships = await membershipsFor(data, teamId), currentManager = memberships.find((row: any) => row.id === team.managerMembershipId && row.status === ACTIVE && row.role === 'MANAGER')
  const timestamp = now(), names = injectedNames || tableNames(), items: any[] = []
  if (action === 'REVOKE') {
    const targetMembershipId = membershipIdValue(event.arguments?.targetMembershipId, teamId)
    if (!currentManager || currentManager.id !== targetMembershipId) fail('Active Manager membership not found')
    const slots = await slotsForMember(data, currentManager.id)
    items.push(teamRevisionUpdate(names.team, team, 'membershipRevision', expected, current.userId, undefined, ['managerMembershipId'], slots.some((x: any) => x.status === ACTIVE)), revokeMembership(names.membership, currentManager, current.userId, timestamp), ...slots.filter((x: any) => x.status === ACTIVE).map((x: any) => deactivateSlot(names.roster, x, timestamp)))
  } else {
    if (event.arguments?.targetMembershipId) fail('Invalid Manager assignment input')
    const account = await resolveForAssignment(event, current.userId, teamId, 'MANAGER_ASSIGN')
    const target = account.userId
    const desiredId = memberId(teamId, target), desired = memberships.find((row: any) => row.id === desiredId)
    if (desired?.status === ACTIVE && !['MANAGER', 'PLAYER'].includes(desired.role)) fail('Target already has an active Team role')
    const staleSlots = desired && desired.role === 'PLAYER' ? await slotsForMember(data, desired.id) : []
    items.push(teamRevisionUpdate(names.team, team, 'membershipRevision', expected, current.userId, { managerMembershipId: desiredId }, undefined, staleSlots.some((x: any) => x.status === ACTIVE)), ...(currentManager && currentManager.id !== desiredId ? [revokeMembership(names.membership, currentManager, current.userId, timestamp)] : []), ...staleSlots.filter((x: any) => x.status === ACTIVE).map((x: any) => deactivateSlot(names.roster, x, timestamp)), putMembership(names.membership, { id: desiredId, teamId, userId: target, displayName: account.displayName, role: 'MANAGER', status: ACTIVE, addedByUserId: current.userId, revokedAt: null, revokedByUserId: null, createdAt: desired?.createdAt || timestamp, updatedAt: timestamp, __typename: 'TeamMembership' }))
  }
  try { await transact(injectedTx, names, items) } catch (error) {
    auditMembership({ actorUserId: current.userId, teamId, action: `MANAGER_${action}`, category: 'transaction_failed', timestamp: now() })
    throw error
  }
  auditMembership({ actorUserId: current.userId, teamId, membershipId: action === 'ASSIGN' ? items.at(-1)?.Put?.Item?.id : currentManager?.id, action: `MANAGER_${action}`, category: 'success', timestamp })
  return { teamId, membershipRevision: expected + 1, role: 'MANAGER', action }
}

export async function handleManageTeamMember(event: any, injected?: any, injectedTx?: any, injectedNames?: any) {
  const current = actor(event), data = await client(injected), teamId = teamIdValue(event.arguments?.teamId)
  const team = await teamFor(data, teamId, current.isAdmin), expected = revisionValue(event.arguments?.expectedRevision)
  const memberships = await membershipsFor(data, teamId); requireManager(memberships, current.userId)
  const role = oneOf(event.arguments?.role, ['COACH', 'PLAYER'], 'team role'), action = oneOf(event.arguments?.action, ['ASSIGN', 'REVOKE'], 'membership action')
  const account = action === 'ASSIGN' ? await resolveForAssignment(event, current.userId, teamId, `${role}_ASSIGN`) : null
  if (action === 'ASSIGN' && event.arguments?.targetMembershipId) fail('Invalid member assignment input')
  const id = action === 'ASSIGN' ? memberId(teamId, account!.userId) : membershipIdValue(event.arguments?.targetMembershipId, teamId)
  const existing = memberships.find((row: any) => row.id === id)
  if (id === team.managerMembershipId) fail('Manager membership requires the Admin operation')
  const timestamp = now(), names = injectedNames || tableNames(), items: any[] = []
  if (action === 'REVOKE') {
    if (!existing || existing.status !== ACTIVE || existing.role !== role) fail(`Active ${role} membership not found`)
    if (role === 'COACH' && existing.id !== team.coachMembershipId) fail('Active authoritative Coach membership not found')
    const slots = await slotsForMember(data, id)
    items.push(teamRevisionUpdate(names.team, team, 'membershipRevision', expected, current.userId, undefined, role === 'COACH' ? ['coachMembershipId'] : [], slots.some((x: any) => x.status === ACTIVE)), revokeMembership(names.membership, existing, current.userId, timestamp), ...slots.filter((x: any) => x.status === ACTIVE).map((x: any) => deactivateSlot(names.roster, x, timestamp)))
  } else {
    if (existing?.status === ACTIVE && existing.role !== role && !(role === 'COACH' && existing.role === 'PLAYER')) fail('Target already has an active Team role')
    const staleSlots = existing ? await slotsForMember(data, id) : []
    const oldCoach = role === 'COACH' ? memberships.find((row: any) => row.id === team.coachMembershipId && row.status === ACTIVE && row.role === 'COACH') : null
    items.push(teamRevisionUpdate(names.team, team, 'membershipRevision', expected, current.userId, role === 'COACH' ? { coachMembershipId: id } : undefined, undefined, staleSlots.some((x: any) => x.status === ACTIVE)), ...(oldCoach && oldCoach.id !== id ? [revokeMembership(names.membership, oldCoach, current.userId, timestamp)] : []), ...staleSlots.filter((x: any) => x.status === ACTIVE).map((x: any) => deactivateSlot(names.roster, x, timestamp)), putMembership(names.membership, { id, teamId, userId: account!.userId, displayName: account!.displayName, role, status: ACTIVE, addedByUserId: current.userId, revokedAt: null, revokedByUserId: null, createdAt: existing?.createdAt || timestamp, updatedAt: timestamp, __typename: 'TeamMembership' }))
  }
  try { await transact(injectedTx, names, items) } catch (error) {
    auditMembership({ actorUserId: current.userId, teamId, membershipId: id, action: `${role}_${action}`, category: 'transaction_failed', timestamp: now() })
    throw error
  }
  auditMembership({ actorUserId: current.userId, teamId, membershipId: id, action: `${role}_${action}`, category: 'success', timestamp })
  return { teamId, membershipRevision: expected + 1, role, action }
}

export async function handleGetTeamHub(event: any, injected?: any) {
  const current = actor(event), data = await client(injected), team = await teamFromInput(data, event.arguments || {}, current.isAdmin)
  const members = await membershipsFor(data, team.id)
  requireTeamAccess(members, current.userId, current.isAdmin)
  const mine = members.find((row: any) => row.userId === current.userId && row.status === ACTIVE) || null
  if (!current.isAdmin && team.status !== ACTIVE) fail(TEAM_HUB_DENIED)
  const teamRole = mine?.role || null
  const capabilities = {
    canAdministerTeam: current.isAdmin,
    canManageMembers: teamRole === 'MANAGER',
    canManageRoster: teamRole === 'MANAGER',
    canReviewChampionPools: teamRole === 'COACH',
    canEditChampionPool: teamRole === 'PLAYER',
  }
  const visible = capabilities.canAdministerTeam || capabilities.canManageMembers ? members : members.filter((row: any) => row.status === ACTIVE)
  const activePlayers = new Set(members.filter((row: any) => row.status === ACTIVE && row.role === 'PLAYER' && row.teamId === team.id).map((row: any) => row.id))
  const slots = (await slotsForTeam(data, team.id)).filter((row: any) => row.status === ACTIVE && row.teamId === team.id && activePlayers.has(row.membershipId) && row.slotType !== 'STARTER_GUARD')
  return { team: publicTeam(team), myRole: teamRole || (current.isAdmin ? 'ADMIN' : null), isPlatformAdmin: current.isAdmin, teamRole, capabilities, members: visible.map(publicMember), roster: slots.map(publicSlot) }
}

export async function handleSetTeamRosterSlot(event: any, injected?: any, injectedTx?: any, injectedNames?: any) {
  const current = actor(event), data = await client(injected), teamId = teamIdValue(event.arguments?.teamId)
  const team = await teamFor(data, teamId), expected = revisionValue(event.arguments?.expectedRevision)
  const members = await membershipsFor(data, teamId); requireManager(members, current.userId)
  const requestedMembershipId = membershipIdValue(event.arguments?.membershipId, teamId), role = oneOf(event.arguments?.gameRoleKey, ROLES, 'League role'), slotType = oneOf(event.arguments?.slotType, ['STARTER', 'SUBSTITUTE'], 'slot type'), action = oneOf(event.arguments?.action, ['ASSIGN', 'REMOVE'], 'roster action')
  const membership = members.find((row: any) => row.id === requestedMembershipId && row.role === 'PLAYER' && row.status === ACTIVE && row.teamId === teamId)
  if (!membership) fail('An active Player membership is required')
  const target = membership.userId
  const names = injectedNames || tableNames(), timestamp = now(), slots = await slotsForTeam(data, teamId)
  const id = slotType === 'STARTER' ? starterId(teamId, role) : substituteId(teamId, membership.id, role)
  const existing = slots.find((row: any) => row.id === id && row.status === ACTIVE)
  const items: any[] = [teamRevisionUpdate(names.team, team, 'rosterRevision', expected, current.userId)]
  if (action === 'REMOVE') {
    if (!existing || existing.membershipId !== membership.id) fail('Active roster slot not found')
    items.push(deactivateSlot(names.roster, existing, timestamp))
    if (slotType === 'STARTER') {
      const guard = slots.find((row: any) => row.id === starterGuardId(teamId, membership.id) && row.status === ACTIVE)
      if (guard) items.push(deactivateSlot(names.roster, guard, timestamp))
    }
  } else {
    if (slotType === 'STARTER') {
      const priorGuard = slots.find((row: any) => row.id === starterGuardId(teamId, membership.id) && row.status === ACTIVE)
      if (priorGuard && priorGuard.gameRoleKey !== role) fail('Player already occupies a starting position')
      if (existing && existing.membershipId !== membership.id) {
        const oldGuard = slots.find((row: any) => row.id === starterGuardId(teamId, existing.membershipId) && row.status === ACTIVE)
        if (oldGuard) items.push(deactivateSlot(names.roster, oldGuard, timestamp))
      }
      items.push(putSlot(names.roster, { id: starterGuardId(teamId, membership.id), teamId, membershipId: membership.id, playerUserId: target, gameRoleKey: role, slotType: 'STARTER_GUARD', status: ACTIVE, assignedByUserId: current.userId, deactivatedAt: null, createdAt: priorGuard?.createdAt || timestamp, updatedAt: timestamp, __typename: 'TeamRosterSlot' }))
    }
    items.push(putSlot(names.roster, { id, teamId, membershipId: membership.id, playerUserId: target, gameRoleKey: role, slotType, status: ACTIVE, assignedByUserId: current.userId, deactivatedAt: null, createdAt: existing?.createdAt || timestamp, updatedAt: timestamp, __typename: 'TeamRosterSlot' }))
  }
  await transact(injectedTx, names, items)
  return { id, teamId, membershipId: membership.id, playerUserId: target, gameRoleKey: role, slotType, status: action === 'REMOVE' ? INACTIVE : ACTIVE, rosterRevision: expected + 1 }
}

export async function handleListMyChampionPool(event: any, injected?: any) {
  const current = actor(event), data = await client(injected), teamId = teamIdValue(event.arguments?.teamId)
  await teamFor(data, teamId); const membership = requirePlayer(await membershipsFor(data, teamId), current.userId)
  const result = await page(data.models.PlayerChampionPoolEntry.listPlayerChampionPoolEntryByMembershipId, { membershipId: membership.id }, pageLimit(event.arguments?.limit), pageToken(event.arguments?.nextToken))
  return { items: result.items, nextToken: result.nextToken }
}

export async function handleUpsertMyChampionPoolEntry(event: any, injected?: any) {
  const current = actor(event), data = await client(injected), teamId = teamIdValue(event.arguments?.teamId)
  await teamFor(data, teamId); const membership = requirePlayer(await membershipsFor(data, teamId), current.userId)
  const championId = bounded(event.arguments?.championId, 'champion ID', 40)
  if (!CHAMPION.test(championId)) fail('Invalid champion ID')
  const role = event.arguments?.gameRoleKey ? oneOf(event.arguments.gameRoleKey, ROLES, 'champion-pool role') : null
  const comfortLevel = oneOf(event.arguments?.comfortLevel, ['S', 'A', 'B', 'C', 'D'], 'comfort level')
  const priority = oneOf(event.arguments?.priority, ['LOW', 'NORMAL', 'HIGH'], 'priority')
  if (typeof event.arguments?.competitiveReady !== 'boolean') fail('Invalid competitive-ready value')
  const playerNotes = bounded(event.arguments?.playerNotes, 'player notes', 500, false) || null
  const id = poolId(teamId, current.userId, championId), existing = ok(await data.models.PlayerChampionPoolEntry.get({ id }), 'Champion entry lookup failed')
  const input = { id, teamId, membershipId: membership.id, playerUserId: current.userId, championId, gameRoleKey: role, comfortLevel, priority, competitiveReady: event.arguments.competitiveReady, playerNotes }
  return ok(existing ? await data.models.PlayerChampionPoolEntry.update(input) : await data.models.PlayerChampionPoolEntry.create(input), 'Champion entry update failed')
}

export async function handleDeleteMyChampionPoolEntry(event: any, injected?: any) {
  const current = actor(event), data = await client(injected), teamId = teamIdValue(event.arguments?.teamId)
  await teamFor(data, teamId); requirePlayer(await membershipsFor(data, teamId), current.userId)
  const championId = bounded(event.arguments?.championId, 'champion ID', 40)
  if (!CHAMPION.test(championId)) fail('Invalid champion ID')
  if (event.arguments?.gameRoleKey) oneOf(event.arguments.gameRoleKey, ROLES, 'champion-pool role')
  const id = poolId(teamId, current.userId, championId), entry = ok(await data.models.PlayerChampionPoolEntry.get({ id }), 'Champion entry lookup failed')
  if (!entry || entry.teamId !== teamId || entry.playerUserId !== current.userId) fail(TEAM_HUB_DENIED)
  ok(await data.models.PlayerChampionPoolEntry.delete({ id }), 'Champion entry deletion failed')
  return { id, deleted: true }
}

export async function handleListTeamChampionPools(event: any, injected?: any) {
  const current = actor(event), data = await client(injected), teamId = teamIdValue(event.arguments?.teamId)
  await teamFor(data, teamId); const members = await membershipsFor(data, teamId); requireCoach(members, current.userId)
  const activePlayers = new Set(members.filter((row: any) => row.status === ACTIVE && row.role === 'PLAYER').map((row: any) => row.id))
  const result = await page(data.models.PlayerChampionPoolEntry.listPlayerChampionPoolEntryByTeamId, { teamId }, pageLimit(event.arguments?.limit), pageToken(event.arguments?.nextToken))
  return { items: result.items.filter((entry: any) => activePlayers.has(entry.membershipId)), nextToken: result.nextToken }
}

export { TEAM_HUB_CONFLICT }
