export const canShowAdminControls = ({ isAdmin = false, isSuperAdmin = false } = {}) => Boolean(isAdmin || isSuperAdmin);

export function indexRoleIndependentPool(entries = []) {
  return Object.fromEntries(entries.map((entry) => [entry.championId, { ...entry }]));
}

export const isTeamHubConflict = (error) => error instanceof Error && error.message === 'Team Hub changed; refresh and try again';
export const isTeamHubDenied = (error) => error instanceof Error && error.message === 'Team Hub access denied';
export const teamHubLandingRoute = (context) => {
  if (context?.capabilities?.canAdministerTeam || context?.capabilities?.canManageMembers) return 'team-hub-manage';
  if (context?.capabilities?.canReviewChampionPools) return 'team-hub-coach-review';
  if (context?.capabilities?.canEditChampionPool) return 'team-hub-champion-pool';
  return 'team-hub-home';
};
export const normalizeAssignmentEmail = (value = '') => String(value).trim().toLowerCase();
export const managerAssignmentInput = (team, email) => ({ teamId: team.id, targetEmail: normalizeAssignmentEmail(email), action: 'ASSIGN', expectedRevision: team.membershipRevision });
export const memberAssignmentInput = (team, email, role) => ({ teamId: team.id, targetEmail: normalizeAssignmentEmail(email), role, action: 'ASSIGN', expectedRevision: team.membershipRevision });
export const revocationInput = (team, membership) => ({ teamId: team.id, targetMembershipId: membership.id, role: membership.role, action: 'REVOKE', expectedRevision: team.membershipRevision });

export function clearPrivateTeamState(state) {
  state.context = null;
  state.poolEntries = {};
  return state;
}

// Do not interpret a transport success or legacy error envelope as a created team.
export function confirmCreatedTeam(result) {
  if (!result || result.success === false || typeof result.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result.slug) || result.id !== 'team:' + result.slug || typeof result.name !== 'string' || !result.name.trim() || result.gameKey !== 'LEAGUE_OF_LEGENDS' || result.status !== 'ACTIVE') {
    throw new Error('Team creation could not be confirmed. Refresh the team list before trying again.');
  }
  return result;
}
