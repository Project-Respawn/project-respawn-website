export const normalizeTeamSlug = (value = '') => String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const replaceTeamInList = (teams = [], team) => [team, ...teams.filter((entry) => entry.id !== team.id)];

export const activeManager = (context) => context?.members?.find((member) => member.role === 'MANAGER' && member.status === 'ACTIVE') || null;

export const activeMemberCount = (context) => context?.members?.filter((member) => member.status === 'ACTIVE').length || 0;

export const decodeTeamHubPayload = (payload) => {
  if (typeof payload !== 'string') return payload;
  try { return JSON.parse(payload); }
  catch { throw new Error('Team Hub request failed'); }
};

export const normalizeAdminTeam = (team = {}) => ({
  ...team,
  id: String(team.id || ''),
  name: String(team.name || ''),
  slug: String(team.slug || ''),
  gameKey: String(team.gameKey || ''),
  status: String(team.status || ''),
});

export const filterAdminTeams = (teams = [], search = '', status = 'ALL') => {
  const query = String(search).trim().toLowerCase();
  return teams.map(normalizeAdminTeam).filter((team) =>
    (status === 'ALL' || team.status === status)
    && (!query || team.name.toLowerCase().includes(query) || team.slug.toLowerCase().includes(query)));
};

export const normalizeAssignableUser = (user = {}) => ({
  username: String(user.username || ''),
  displayName: String(user.displayName || user.username || 'Project Respawn member'),
  email: String(user.email || '').trim().toLowerCase(),
  enabled: user.enabled === true,
  confirmed: user.confirmed === true,
  eligible: user.eligible === true,
});

export const nextAccountSearchIndex = (current, direction, count) => {
  if (!count) return -1;
  return (Number(current) + Number(direction) + count) % count;
};
