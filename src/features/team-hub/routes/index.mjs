// Dormant descriptors. NOT registered in the live router; no client initialization here.
export const teamHubRoutes = [
  { path: '/team-hub', name: 'team-hub-home', component: () => import('../pages/TeamHome.mjs'), meta: { requiresAuth: true } },
  { path: '/team-hub/:teamSlug', name: 'team-hub-team', component: () => import('../pages/TeamDetail.mjs'), meta: { requiresAuth: true } },
  { path: '/team-hub/:teamSlug/manage', name: 'team-hub-manage', component: () => import('../pages/TeamManagement.mjs'), meta: { requiresAuth: true, teamRoles: ['MANAGER'], capability: 'teams.admin' } },
  { path: '/team-hub/:teamSlug/champion-pool', name: 'team-hub-champion-pool', component: () => import('../pages/ChampionPool.mjs'), meta: { requiresAuth: true, teamRoles: ['PLAYER'] } },
  { path: '/team-hub/:teamSlug/coach-review', name: 'team-hub-coach-review', component: () => import('../pages/CoachReview.mjs'), meta: { requiresAuth: true, teamRoles: ['COACH', 'MANAGER'] } },
  { path: '/team-hub/:teamSlug/team-pool', name: 'team-hub-team-pool', redirect: to => ({ name: 'team-hub-coach-review', params: { teamSlug: to.params.teamSlug } }) },
  { path: '/dashboard/esports/teams', name: 'AdminTeamAdministration', component: () => import('../pages/TeamAdministration.mjs'), meta: { requiresAuth: true, capability: 'teams.branding.manage' } },
];
