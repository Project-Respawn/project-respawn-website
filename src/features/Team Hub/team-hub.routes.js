// src/features/team-hub/team-hub.routes.js
const resolveTeamRouteAccess = async (...args) => (await import('./teamHub.service.js')).resolveTeamRouteAccess(...args);

const teamHubRoutes = [
  {
    path: '/team-hub/:teamSlug/manage',
    name: 'team-hub-manage',
    component: () => import('./TeamManagement.vue'),
    meta: { requiresAuth: true, requiresTeamMembership: true, teamRoles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: '/team-hub',
    name: 'team-hub-home',
    component: () => import('./TeamHubHome.vue'),
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/team-hub/:teamSlug',
    name: 'team-hub-team',
    component: () => import('./TeamHome.vue'),
    beforeEnter: async to => (await import('../team-hub/services/route-access.mjs')).teamEntryGuard(resolveTeamRouteAccess)(to),
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/team-hub/:teamSlug/champion-pool',
    name: 'team-hub-champion-pool',
    component: () =>
      import('./champion-pool/ChampionPool.vue'),
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/team-hub/:teamSlug/coach-review',
    name: 'team-hub-coach-review',
    component: () =>
      import('./champion-pool/CoachPoolReview.vue'),
    meta: {
      requiresAuth: true,
      requiresTeamMembership: true,
      teamRoles: ['COACH', 'MANAGER'],
      requiredCapability: 'canReviewChampionPools',
    },
  },

  {
    path: '/team-hub/:teamSlug/team-pool',
    name: 'team-hub-team-pool',
    redirect: (to) => ({ name: 'team-hub-coach-review', params: { teamSlug: to.params.teamSlug } }),
    meta: {
      requiresAuth: true,
      requiresTeamMembership: true,
      teamRoles: ['COACH', 'MANAGER'],
    },
  },
];

export default teamHubRoutes;
