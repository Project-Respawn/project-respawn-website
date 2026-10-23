// Owner-published, dependency-free team-hub.v1 schemas. No SDK or configuration side effects.
export const VERSION = 'team-hub.v1';
export const DEFERRED_PRODUCT_FEATURES = Object.freeze(['approval', 'overallFeedback', 'recommendations', 'flexConfirmation']);
const str = (maxLength, pattern, minLength = 1) => ({ type: 'string', minLength, maxLength, ...(pattern ? { pattern } : {}) });
const enumeration = (...values) => ({ type: 'string', enum: values });
const integer = (minimum = 0, maximum = Number.MAX_SAFE_INTEGER) => ({ type: 'integer', minimum, maximum });
const object = (properties, required = Object.keys(properties)) => ({ type: 'object', additionalProperties: false, properties, required });
const array = (items, maxItems = 50) => ({ type: 'array', items, maxItems });
export const schemas = {
  subject: str(36, '^[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}$'),
  teamId: str(70, '^team:[a-z0-9]+(?:-[a-z0-9]+)*$'),
  slug: str(48, '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  membershipId: str(160, '^team-membership:team:[a-z0-9-]+:[0-9a-fA-F-]{36}$'),
  championId: str(40, '^[A-Za-z0-9]+$'),
  gameRoleKey: enumeration('TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'),
  role: enumeration('MANAGER', 'COACH', 'PLAYER'),
  status: enumeration('ACTIVE', 'INACTIVE'),
  idempotencyKey: str(128, '^[A-Za-z0-9_-]{8,128}$'),
};
const s = schemas;
const notes = str(500, undefined, 0);
const assessmentText = str(1000, undefined, 0);
export const playerFields = { championId: s.championId, gameRoleKey: s.gameRoleKey, comfortLevel: enumeration('S', 'A', 'B', 'C', 'D'), priority: enumeration('LOW', 'NORMAL', 'HIGH'), competitiveReady: { type: 'boolean' }, playerNotes: notes };
export const playerDTO = object({ teamId: s.teamId, membershipId: s.membershipId, ...playerFields, version: integer(1) });
export const assessmentDTO = object({ championId: s.championId, teamVisible: assessmentText, version: integer(1) });
export const privateNoteDTO = object({ championId: s.championId, privateNote: assessmentText, version: integer(1) });
export const membershipDTO = object({ id: s.membershipId, subject: s.subject, displayName: str(100), role: s.role, status: s.status, version: integer(1) });
export const rosterDTO = object({ membershipId: s.membershipId, gameRoleKey: s.gameRoleKey, slotType: enumeration('STARTER', 'SUBSTITUTE') });
export const teamDTO = object({ id: s.teamId, slug: s.slug, name: str(100), gameKey: enumeration('LEAGUE_OF_LEGENDS'), status: s.status, version: integer(1), authorizationEpoch: integer(), rosterVersion: integer(), settings: object({ plan: enumeration('FREE', 'PRO'), logoAssetId: str(180, undefined, 0) }) });
const competitiveDTO = object({ membershipId: s.membershipId, entries: array(playerDTO), assessments: array(assessmentDTO), privateNotes: array(privateNoteDTO) }, ['membershipId', 'entries', 'assessments']);
const directoryDTO = object({ subject: s.subject, displayName: str(100) });
const page = item => object({ items: array(item), nextToken: str(4096) }, ['items']);
const paging = { limit: integer(1, 50), nextToken: str(4096) };
const team = { teamId: s.teamId };
const concurrency = { idempotencyKey: s.idempotencyKey, expectedTeamVersion: integer(1), expectedAuthorizationEpoch: integer(), expectedMembershipVersion: integer() };
const baseRequired = ['teamId', ...Object.keys(concurrency)];
const command = (properties, required = Object.keys(properties)) => object({ ...team, ...concurrency, ...properties }, [...baseRequired, ...required]);
const result = object({ team: teamDTO });
const spec = (method, path, runtime, request, response, authorization) => ({ method, path, runtime, request, response, authorization });
export const operations = Object.freeze({
  LIST_MY_TEAMS: spec('GET', '/v1/teams', 'read', object({ ...paging, status: s.status }, []), page(teamDTO), 'active member or teams.admin'),
  GET_TEAM_HUB: spec('GET', '/v1/teams/{teamId}', 'read', object(team), object({ team: teamDTO, memberships: array(membershipDTO), roster: array(rosterDTO, 20) }), 'active member or teams.admin or teams.branding.manage'),
  LIST_MY_CHAMPION_POOL: spec('GET', '/v1/teams/{teamId}/me/champions', 'read', object({ ...team, ...paging }, ['teamId']), page(playerDTO), 'PLAYER'),
  LIST_TEAM_CHAMPION_POOLS: spec('GET', '/v1/teams/{teamId}/champion-pools', 'read', object({ ...team, ...paging }, ['teamId']), page(competitiveDTO), 'MANAGER or COACH'),
  GET_PLAYER_COMPETITIVE_DETAIL: spec('GET', '/v1/teams/{teamId}/players/{membershipId}/competitive', 'read', object({ ...team, membershipId: s.membershipId }), competitiveDTO, 'MANAGER or COACH; active target PLAYER'),
  SEARCH_TEAM_ASSIGNABLE_USERS: spec('POST', '/v1/directory/assignable-search', 'read', object({ ...team, query: str(100, undefined, 2), limit: integer(1, 10) }, ['teamId', 'query']), object({ items: array(directoryDTO, 10) }), 'MANAGER or teams.admin'),
  CREATE_TEAM: spec('POST', '/v1/teams', 'command', object({ slug: s.slug, name: str(100), gameKey: enumeration('LEAGUE_OF_LEGENDS'), idempotencyKey: s.idempotencyKey }), result, 'teams.admin'),
  UPDATE_TEAM: spec('PATCH', '/v1/teams/{teamId}', 'command', command({ name: str(100), status: s.status }), result, 'teams.admin'),
  SET_MANAGER: spec('PUT', '/v1/teams/{teamId}/manager', 'command', command({ action: enumeration('ASSIGN', 'REVOKE'), targetAccount: str(254), targetMembershipId: s.membershipId, expectedTargetMembershipVersion: integer() }, ['action', 'expectedTargetMembershipVersion']), object({ membership: membershipDTO, team: teamDTO }), 'teams.admin'),
  MANAGE_MEMBER: spec('POST', '/v1/teams/{teamId}/members', 'command', command({ action: enumeration('ASSIGN', 'REVOKE'), role: enumeration('COACH', 'PLAYER'), targetAccount: str(254), targetMembershipId: s.membershipId, expectedTargetMembershipVersion: integer() }, ['action', 'role', 'expectedTargetMembershipVersion']), object({ membership: membershipDTO, team: teamDTO }), 'MANAGER'),
  SET_ROSTER_SLOT: spec('POST', '/v1/teams/{teamId}/roster-slots', 'command', command({ membershipId: s.membershipId, gameRoleKey: s.gameRoleKey, slotType: enumeration('STARTER', 'SUBSTITUTE'), action: enumeration('ASSIGN', 'REMOVE'), expectedRosterVersion: integer(), expectedTargetMembershipVersion: integer(1) }), object({ roster: array(rosterDTO, 20), team: teamDTO }), 'MANAGER'),
  UPSERT_MY_CHAMPION: spec('PUT', '/v1/teams/{teamId}/me/champions/{championId}', 'command', command({ ...playerFields, expectedEntryVersion: integer() }), object({ entry: playerDTO, team: teamDTO }), 'PLAYER'),
  DELETE_MY_CHAMPION: spec('DELETE', '/v1/teams/{teamId}/me/champions/{championId}', 'command', command({ championId: s.championId, expectedEntryVersion: integer(1) }), object({ deleted: { const: true }, championId: s.championId, team: teamDTO }), 'PLAYER'),
  UPSERT_COACH_ASSESSMENT: spec('PUT', '/v1/teams/{teamId}/players/{membershipId}/assessments/{championId}', 'command', command({ membershipId: s.membershipId, championId: s.championId, teamVisible: assessmentText, privateNote: assessmentText, expectedAssessmentVersion: integer(), expectedTargetMembershipVersion: integer(1) }), object({ assessment: assessmentDTO, privateNote: privateNoteDTO, team: teamDTO }), 'COACH'),
  SET_TEAM_PLAN: spec('PUT', '/v1/teams/{teamId}/plan', 'command', command({ plan: enumeration('FREE', 'PRO') }), result, 'teams.admin'),
  REQUEST_TEAM_LOGO_UPLOAD: spec('POST', '/v1/teams/{teamId}/logo-upload-intents', 'command', command({ contentType: { const: 'image/png' }, size: integer(1, 2097152) }), object({ intentId: str(180), expiresAt: integer(), team: teamDTO }), 'teams.branding.manage; synthetic media only'),
  COMMIT_TEAM_LOGO: spec('PUT', '/v1/teams/{teamId}/logo', 'command', command({ intentId: str(180) }), result, 'teams.branding.manage; verified media only'),
  REMOVE_TEAM_LOGO: spec('DELETE', '/v1/teams/{teamId}/logo', 'command', command({}), result, 'teams.branding.manage'),
});
export const errorCodes = Object.freeze({ INVALID_INPUT: 400, UNAUTHENTICATED: 401, FORBIDDEN: 403, NOT_FOUND: 404, CONFLICT: 409, LIMIT_EXCEEDED: 400, DEPENDENCY_UNAVAILABLE: 503, OFFLINE_SKELETON: 503 });
export class DomainError extends Error {
  constructor(code) { super(code); this.code = code; this.status = errorCodes[code] ?? 500; }
}
export const fail = code => { throw new DomainError(code); };
// Implements only the closed JSON Schema subset above; unsupported keywords fail closed.
export function valid(schema, value) {
  const supported = ['type', 'const', 'enum', 'minLength', 'maxLength', 'pattern', 'minimum', 'maximum', 'items', 'maxItems', 'properties', 'required', 'additionalProperties'];
  if (Object.keys(schema).some(key => !supported.includes(key))) return false;
  if ('const' in schema && value !== schema.const) return false;
  if (schema.enum && !schema.enum.includes(value)) return false;
  if (schema.type === 'string') return typeof value === 'string' && value.length >= (schema.minLength ?? 0) && value.length <= (schema.maxLength ?? Infinity) && (!schema.pattern || new RegExp(schema.pattern).test(value));
  if (schema.type === 'integer') return Number.isSafeInteger(value) && value >= schema.minimum && value <= schema.maximum;
  if (schema.type === 'boolean') return typeof value === 'boolean';
  if (schema.type === 'array') return Array.isArray(value) && value.length <= schema.maxItems && value.every(v => valid(schema.items, v));
  if (schema.type === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every(k => Object.hasOwn(schema.properties, k)) && schema.required.every(k => Object.hasOwn(value, k)) && Object.entries(value).every(([k, v]) => valid(schema.properties[k], v));
  return 'const' in schema || !!schema.enum;
}
export function validateRequest(operation, request) {
  const spec = operations[operation];
  if (!spec || !valid(spec.request, request)) fail('INVALID_INPUT');
  if (['SET_MANAGER', 'MANAGE_MEMBER'].includes(operation)) {
    if (request.action === 'ASSIGN' ? (!request.targetAccount || request.targetMembershipId) : (!request.targetMembershipId || request.targetAccount)) fail('INVALID_INPUT');
  }
  return request;
}
export function validateResponse(operation, response) {
  if (!valid(operations[operation].response, response)) throw new Error('Team Hub response projection violated contract');
  return response;
}
export const coreContracts = Object.freeze({
  environment: 'environment.v1', directory: 'directory.assignment.v1', authorization: 'authorization.decision.v1', profile: 'profile.summary.v1',
});
export const eligibilityContract = Object.freeze({ version: 'eligibility.v1', owner: 'TeamHub', status: 'CONTRACT_ONLY', auth: 'Authenticated allowlisted service AND verified delegated subject; same environment; purpose tournament-registration or roster-lock; expiry and replay check required', request: object({ teamId: s.teamId, expectedRosterVersion: integer(), purpose: enumeration('tournament-registration', 'roster-lock') }), response: object({ teamId: s.teamId, rosterVersion: integer(), teamVersion: integer(1), eligible: { type: 'boolean' }, roster: array(object({ subject: s.subject, gameRoleKey: s.gameRoleKey }), 20), evaluatedAt: integer(), expiresAt: integer() }) });
