export const normalizeTeamSlug = (value = '') => String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const replaceTeamInList = (teams = [], team) => [team, ...teams.filter((entry) => entry.id !== team.id)];

export const activeManager = (context) => context?.members?.find((member) => member.role === 'MANAGER' && member.status === 'ACTIVE') || null;

export const activeMemberCount = (context) => context?.members?.filter((member) => member.status === 'ACTIVE').length || 0;
