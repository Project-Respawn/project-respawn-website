// Eight fixed cells make the capacity invariant independent of GSI freshness.
// Every mutation conditionally writes the complete observed occupancy snapshot.
const ROLES = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT']
const ACTIVE = 'ACTIVE', INACTIVE = 'INACTIVE'
const conflict = () => { throw new Error('Team Hub changed; refresh and try again') }
export const rosterCells = (teamId: string) => [
  ...ROLES.map(role => ({id: `team-roster:${teamId}:starter:${role}`, slotType: 'STARTER', role})),
  ...[1, 2, 3].map(position => ({id: `team-roster:${teamId}:substitute-position:${position}`, slotType: 'SUBSTITUTE', role: 'TOP'})),
]
export const rosterRulesId = (teamId: string) => `team-roster:${teamId}:rules:v1`

export async function readRosterCells(data: any, teamId: string) {
  return Promise.all(rosterCells(teamId).map(async cell => {
    const result = await data.models.TeamRosterSlot.get({id: cell.id})
    if (result?.errors?.length) throw new Error('Team Hub roster lookup failed')
    const row = result?.data || null
    if (row && (row.id !== cell.id || row.teamId !== teamId || row.slotType !== cell.slotType || !ROLES.includes(row.gameRoleKey) || ![ACTIVE, INACTIVE].includes(row.status) || !row.membershipId || !row.playerUserId || (cell.slotType === 'STARTER' && row.gameRoleKey !== cell.role))) conflict()
    return row
  }))
}

function placeholder(cell: any, teamId: string, actor: string, at: string) {
  return {id: cell.id, teamId, membershipId: `team-roster-empty:${teamId}`, playerUserId: actor, gameRoleKey: cell.role, slotType: cell.slotType, status: INACTIVE, assignedByUserId: actor, deactivatedAt: at, createdAt: at, updatedAt: at, __typename: 'TeamRosterSlot'}
}

// Conditions cover the occupancy fields and timestamp. No-op snapshot writes
// never trust that an eventually consistent primary-key read is current.
export function snapshotPut(table: string, before: any, after: any) {
  const Put: any = {TableName: table, Item: {...after, __typename: 'TeamRosterSlot'}}
  if (!before) Put.ConditionExpression = 'attribute_not_exists(id)'
  else {
    const fields = ['teamId', 'membershipId', 'playerUserId', 'gameRoleKey', 'slotType', 'status', 'updatedAt']
    Put.ExpressionAttributeNames = {}; Put.ExpressionAttributeValues = {}
    Put.ConditionExpression = fields.map((field, n) => {
      Put.ExpressionAttributeNames[`#f${n}`] = field
      if (before[field] == null) return `attribute_not_exists(#f${n})`
      Put.ExpressionAttributeValues[`:v${n}`] = before[field]
      return `#f${n} = :v${n}`
    }).join(' AND ')
  }
  return {Put}
}

export function rosterRulesGuard(table: string, teamId: string) {
  return {Update: {TableName: table, Key: {id: rosterRulesId(teamId)}, UpdateExpression: 'SET #status = :active', ConditionExpression: 'teamId = :team AND slotType = :rules AND #status = :active', ExpressionAttributeNames: {'#status': 'status'}, ExpressionAttributeValues: {':team': teamId, ':rules': 'RULES_V1', ':active': ACTIVE}}}
}

export function rosterChange(table: string, teamId: string, before: any[], input: {membership: any, role: string, slotType: string, action: string, actor: string, at: string}) {
  if (before.length !== 8 || before.some(row => !row)) conflict() // bootstrap required
  const after = before.map(row => ({...row})), {membership, role, slotType, action, actor, at} = input
  const assigned = after.filter(row => row.status === ACTIVE && row.membershipId === membership.id)
  if (assigned.length > 1) conflict()
  let index: number
  if (action === 'REMOVE') {
    index = after.findIndex(row => row.status === ACTIVE && row.membershipId === membership.id && row.slotType === slotType && row.gameRoleKey === role)
    if (index < 0) throw new Error('Active roster slot not found')
    after[index] = {...after[index], status: INACTIVE, deactivatedAt: at, updatedAt: at}
  } else {
    if (assigned.some(row => row.slotType !== slotType || (slotType === 'STARTER' && row.gameRoleKey !== role))) throw new Error('Player already occupies a starting or substitute position')
    index = slotType === 'STARTER' ? ROLES.indexOf(role) : after.findIndex(row => row.slotType === 'SUBSTITUTE' && row.status === ACTIVE && row.membershipId === membership.id)
    if (slotType === 'SUBSTITUTE' && index < 0) index = after.findIndex(row => row.slotType === 'SUBSTITUTE' && row.status === INACTIVE)
    if (index < 0) throw new Error('Team Hub substitute limit exceeded')
    after[index] = {...after[index], membershipId: membership.id, playerUserId: membership.userId, gameRoleKey: role, status: ACTIVE, assignedByUserId: actor, deactivatedAt: null, updatedAt: at}
  }
  return {row: after[index], writes: [...after.map((row, n) => snapshotPut(table, before[n], row)), rosterRulesGuard(table, teamId)]}
}

export function clearRosterMembership(table: string, teamId: string, before: any[], membershipId: string, at: string) {
  if (before.length !== 8 || before.some(row => !row)) conflict()
  return [...before.map(row => snapshotPut(table, row, row.membershipId === membershipId && row.status === ACTIVE ? {...row, status: INACTIVE, deactivatedAt: at, updatedAt: at} : {...row})), rosterRulesGuard(table, teamId)]
}

// Offline preparation only. Execution must first stop the old handler, verify
// current revisions and complete source reads, and authorize this metadata move.
export function prepareRosterBootstrap(table: string, teamId: string, source: any[], members: any[], actor: string, at: string) {
  if (source.some(row => row.teamId !== teamId) || members.some(row => row.teamId !== teamId) || new Set(source.map(row => row.id)).size !== source.length || new Set(members.map(row => row.id)).size !== members.length) conflict()
  const activePlayers = new Map(members.filter(row => row.status === ACTIVE && row.role === 'PLAYER').map(row => [row.id, row]))
  const assignments = source.filter(row => row.status === ACTIVE && ['STARTER', 'SUBSTITUTE'].includes(row.slotType))
  if (assignments.some(row => !activePlayers.has(row.membershipId) || activePlayers.get(row.membershipId)?.userId !== row.playerUserId || !ROLES.includes(row.gameRoleKey))) conflict()
  if (new Set(assignments.map(row => row.membershipId)).size !== assignments.length || new Set(assignments.filter(row => row.slotType === 'STARTER').map(row => row.gameRoleKey)).size !== assignments.filter(row => row.slotType === 'STARTER').length) conflict()
  const subs = assignments.filter(row => row.slotType === 'SUBSTITUTE').sort((a, b) => a.id.localeCompare(b.id))
  if (subs.length > 3) throw new Error('Team Hub substitute limit exceeded; existing roster requires owner review')
  if (source.some(row => row.id === rosterRulesId(teamId))) conflict()
  const cells = rosterCells(teamId), writes: any[] = cells.map(cell => {
    const old = source.find(row => row.id === cell.id)
    const assigned = cell.slotType === 'STARTER' ? assignments.find(row => row.slotType === 'STARTER' && row.gameRoleKey === cell.role) : subs[Number(cell.id.split(':').at(-1)) - 1]
    const next = assigned ? {...assigned, id: cell.id, updatedAt: at} : placeholder(cell, teamId, actor, at)
    return snapshotPut(table, old || null, next)
  })
  for (const old of source.filter(row => row.status === ACTIVE && ['STARTER', 'SUBSTITUTE', 'STARTER_GUARD'].includes(row.slotType) && !cells.some(cell => cell.id === row.id))) writes.push(snapshotPut(table, old, {...old, status: INACTIVE, deactivatedAt: at, updatedAt: at}))
  writes.push(snapshotPut(table, null, {...placeholder({id: rosterRulesId(teamId), role: 'TOP', slotType: 'RULES_V1'}, teamId, actor, at), status: ACTIVE, deactivatedAt: null}))
  if (writes.length + 1 > 25) throw new Error('Team Hub roster bootstrap exceeds reviewed transaction bound')
  return writes
}

export function prepareExistingRosterInitialization(names: {team: string, roster: string}, team: any, source: any[], members: any[], actor: string, at: string) {
  if (!/^team:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(team.id) || team.status !== ACTIVE || !Number.isSafeInteger(team.rosterRevision) || !Number.isSafeInteger(team.membershipRevision)) conflict()
  const TeamUpdate = {Update: {TableName: names.team, Key: {id: team.id}, UpdateExpression: 'SET rosterRevision = :next, updatedAt = :at, updatedByUserId = :by', ConditionExpression: 'rosterRevision = :roster AND membershipRevision = :members AND #status = :active', ExpressionAttributeNames: {'#status': 'status'}, ExpressionAttributeValues: {':roster': team.rosterRevision, ':members': team.membershipRevision, ':active': ACTIVE, ':next': team.rosterRevision + 1, ':at': at, ':by': actor}}}
  return [TeamUpdate, ...prepareRosterBootstrap(names.roster, team.id, source, members, actor, at)]
}
