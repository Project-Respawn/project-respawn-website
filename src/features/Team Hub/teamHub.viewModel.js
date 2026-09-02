export const canShowAdminControls = ({ isAdmin = false, isSuperAdmin = false } = {}) => Boolean(isAdmin || isSuperAdmin);

export function indexRoleIndependentPool(entries = []) {
  return Object.fromEntries(entries.map((entry) => [entry.championId, { ...entry }]));
}

export const isTeamHubConflict = (error) => error instanceof Error && error.message === 'Team Hub changed; refresh and try again';
export const isTeamHubDenied = (error) => error instanceof Error && error.message === 'Team Hub access denied';
export const normalizeAssignmentEmail = (value = '') => String(value).trim().toLowerCase();
export const managerAssignmentInput = (team, email) => ({ teamId: team.id, targetEmail: normalizeAssignmentEmail(email), action: 'ASSIGN', expectedRevision: team.membershipRevision });
export const memberAssignmentInput = (team, email, role) => ({ teamId: team.id, targetEmail: normalizeAssignmentEmail(email), role, action: 'ASSIGN', expectedRevision: team.membershipRevision });
export const revocationInput = (team, membership) => ({ teamId: team.id, targetMembershipId: membership.id, role: membership.role, action: 'REVOKE', expectedRevision: team.membershipRevision });

export function clearPrivateTeamState(state) {
  state.context = null;
  state.poolEntries = {};
  return state;
}
