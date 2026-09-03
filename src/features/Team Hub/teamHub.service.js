import { generateClient } from 'aws-amplify/data';
import { decodeTeamHubPayload } from './teamAdministration.viewModel.js';

let client;
const api = () => (client ||= generateClient());
const PUBLIC_ERRORS = [
  'Team Hub access denied', 'Team Hub changed; refresh and try again', 'Team Hub data limit exceeded',
  'Invalid ', 'Active ', 'An active Player membership is required', 'Player already occupies a starting position',
  'No Project Respawn account was found for that email.', 'That account could not be assigned.', 'Team slug already exists',
  'Invalid account search', 'Account search is temporarily unavailable',
  'Team Hub request failed',
];
const unwrap = async (request) => {
  try {
    const result = await request;
    if (result.errors?.length) {
      const message = result.errors[0]?.message || '';
      const candidate = result.errors[0]?.extensions?.requestId || result.errors[0]?.extensions?.requestID || '';
      const requestId = /^[A-Za-z0-9-]{8,128}$/.test(candidate) ? candidate : '';
      throw new Error(PUBLIC_ERRORS.some((prefix) => message.startsWith(prefix)) ? message : `Team Hub request failed${requestId ? ` (request ${requestId})` : ''}`);
    }
    return decodeTeamHubPayload(result.data);
  } catch (error) {
    if (error instanceof Error && PUBLIC_ERRORS.some((prefix) => error.message.startsWith(prefix))) throw error;
    throw new Error('Team Hub request failed');
  }
};

const read = (action, input = {}) => unwrap(api().queries.readTeamHub({ action, ...input }));
const mutate = (action, input = {}) => unwrap(api().mutations.mutateTeamHub({ action, ...input }));
const memberMutation = (action, input) => {
  const { action: memberAction, ...fields } = input;
  return mutate(action, { ...fields, memberAction });
};
export const listMyTeams = (input = {}) => read('LIST_MY_TEAMS', input);
export const listAdminTeams = (input = {}) => read('LIST_MY_TEAMS', input);
export const searchAssignableUsers = (query) => read('SEARCH_TEAM_ASSIGNABLE_USERS', { query });
export const createTeam = (input) => mutate('CREATE_TEAM', input);
export const updateTeam = (input) => mutate('UPDATE_TEAM', input);
export const setTeamManager = (input) => memberMutation('SET_MANAGER', input);
export const manageTeamMember = (input) => memberMutation('MANAGE_MEMBER', input);
export const getTeamHub = (input) => read('GET_TEAM_HUB', input);
export const setTeamRosterSlot = (input) => {
  const { action: rosterAction, ...fields } = input;
  return mutate('SET_ROSTER_SLOT', { ...fields, rosterAction });
};
export const listMyChampionPool = (teamId, page = {}) => read('LIST_MY_CHAMPION_POOL', { teamId, ...page });
export const upsertMyChampionPoolEntry = (input) => mutate('UPSERT_MY_CHAMPION', input);
export const deleteMyChampionPoolEntry = (input) => mutate('DELETE_MY_CHAMPION', input);
export const listTeamChampionPools = (teamId, page = {}) => read('LIST_TEAM_CHAMPION_POOLS', { teamId, ...page });

export async function loadBoundedPages(load, maxPages = 2) {
  const items = [];
  let nextToken;
  for (let index = 0; index < maxPages; index += 1) {
    const page = await load(nextToken);
    items.push(...(page?.items || []));
    nextToken = page?.nextToken || null;
    if (!nextToken) return { items, nextToken: null, complete: true };
  }
  return { items, nextToken, complete: false };
}

export async function resolveTeamRouteAccess(teamSlug, allowedRoles = []) {
  const context = await getTeamHub({ teamSlug });
  if (allowedRoles.length && !allowedRoles.includes(context.myRole)) throw new Error('Team Hub access denied');
  return context;
}
