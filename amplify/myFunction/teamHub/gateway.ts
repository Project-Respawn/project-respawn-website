import {
  handleCreateTeamHubTeam, handleDeleteMyChampionPoolEntry, handleGetTeamHub,
  handleListMyChampionPool, handleListMyTeams, handleListTeamChampionPools,
  handleManageTeamMember, handleSetTeamManager, handleSetTeamRosterSlot,
  handleUpdateTeamHubTeam, handleUpsertMyChampionPoolEntry,
} from '.'

const MAX_GATEWAY_BYTES = 8_192
const fail = (message: string): never => { throw new Error(message) }
const own = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key)

type Handler = (event: any) => Promise<any>
type Route = { handler: Handler; allowed: readonly string[]; required?: readonly string[]; remap?: Record<string, string>; validate?: (args: Record<string, unknown>) => void }

const exactlyOne = (left: string, right: string) => (args: Record<string, unknown>) => {
  if (own(args, left) === own(args, right)) fail(`Exactly one of ${left} or ${right} is required`)
}
const atLeastOne = (...keys: string[]) => (args: Record<string, unknown>) => {
  if (!keys.some((key) => own(args, key))) fail(`At least one of ${keys.join(' or ')} is required`)
}

export const READ_ACTIONS: Record<string, Route> = {
  LIST_MY_TEAMS: { handler: handleListMyTeams, allowed: ['status', 'limit', 'nextToken'] },
  GET_TEAM_HUB: { handler: handleGetTeamHub, allowed: ['teamId', 'teamSlug'], validate: exactlyOne('teamId', 'teamSlug') },
  LIST_MY_CHAMPION_POOL: { handler: handleListMyChampionPool, allowed: ['teamId', 'limit', 'nextToken'], required: ['teamId'] },
  LIST_TEAM_CHAMPION_POOLS: { handler: handleListTeamChampionPools, allowed: ['teamId', 'limit', 'nextToken'], required: ['teamId'] },
}

export const MUTATION_ACTIONS: Record<string, Route> = {
  CREATE_TEAM: { handler: handleCreateTeamHubTeam, allowed: ['slug', 'name', 'gameKey'], required: ['slug', 'name', 'gameKey'] },
  UPDATE_TEAM: { handler: handleUpdateTeamHubTeam, allowed: ['teamId', 'name', 'status'], required: ['teamId'], validate: atLeastOne('name', 'status') },
  SET_MANAGER: { handler: handleSetTeamManager, allowed: ['teamId', 'targetEmail', 'targetMembershipId', 'memberAction', 'expectedRevision'], required: ['teamId', 'memberAction', 'expectedRevision'], remap: { memberAction: 'action' } },
  MANAGE_MEMBER: { handler: handleManageTeamMember, allowed: ['teamId', 'targetEmail', 'targetMembershipId', 'role', 'memberAction', 'expectedRevision'], required: ['teamId', 'role', 'memberAction', 'expectedRevision'], remap: { memberAction: 'action' } },
  SET_ROSTER_SLOT: { handler: handleSetTeamRosterSlot, allowed: ['teamId', 'membershipId', 'gameRoleKey', 'slotType', 'rosterAction', 'expectedRevision'], required: ['teamId', 'membershipId', 'gameRoleKey', 'slotType', 'rosterAction', 'expectedRevision'], remap: { rosterAction: 'action' } },
  UPSERT_MY_CHAMPION: { handler: handleUpsertMyChampionPoolEntry, allowed: ['teamId', 'championId', 'gameRoleKey', 'comfortLevel', 'priority', 'competitiveReady', 'playerNotes'], required: ['teamId', 'championId', 'comfortLevel', 'priority', 'competitiveReady'] },
  DELETE_MY_CHAMPION: { handler: handleDeleteMyChampionPoolEntry, allowed: ['teamId', 'championId', 'gameRoleKey'], required: ['teamId', 'championId'] },
}

function safeArguments(event: any) {
  const raw = event?.arguments
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || Object.getPrototypeOf(raw) !== Object.prototype) fail('Invalid Team Hub gateway input')
  if (JSON.stringify(raw).length > MAX_GATEWAY_BYTES) fail('Team Hub gateway input too large')
  for (const value of Object.values(raw)) if (value !== null && typeof value === 'object') fail('Invalid nested Team Hub gateway input')
  return Object.fromEntries(Object.entries(raw).filter(([, value]) => value !== null)) as Record<string, unknown>
}

async function dispatch(event: any, routes: Record<string, Route>) {
  const args = safeArguments(event)
  const action = typeof args.action === 'string' ? args.action : fail('Missing Team Hub action')
  const route = routes[action]
  if (!route) fail('Unsupported Team Hub action')
  const allowed = new Set(['action', ...route.allowed])
  const unexpected = Object.keys(args).filter((key) => !allowed.has(key))
  if (unexpected.length) fail('Unexpected Team Hub gateway field')
  for (const key of route.required || []) if (!own(args, key) || args[key] == null || args[key] === '') fail(`Missing Team Hub field: ${key}`)
  route.validate?.(args)
  const handlerArguments: Record<string, unknown> = {}
  for (const key of route.allowed) if (own(args, key)) handlerArguments[route.remap?.[key] || key] = args[key]
  return route.handler({ ...event, arguments: handlerArguments })
}

export const routeTeamHubRead = (event: any, routes = READ_ACTIONS) => dispatch(event, routes)
export const routeTeamHubMutation = (event: any, routes = MUTATION_ACTIONS) => dispatch(event, routes)
