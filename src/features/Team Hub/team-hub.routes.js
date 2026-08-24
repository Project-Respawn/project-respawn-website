// src/features/team-hub/team-hub.routes.js

const teamHubRoutes = [
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
    redirect: (to) => ({
      name: 'team-hub-champion-pool',
      params: {
        teamSlug: to.params.teamSlug,
      },
    }),
    meta: {
      requiresAuth: true,
      requiresTeamMembership: true,
    },
  },

  {
    path: '/team-hub/:teamSlug/champion-pool',
    name: 'team-hub-champion-pool',
    component: () =>
      import('./champion-pool/ChampionPool.vue'),
    meta: {
      requiresAuth: true,
      requiresTeamMembership: true,
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
      teamRoles: ['COACH', 'ADMIN'],
      requiredCapability: 'COACH_REVIEW',
    },
  },

  {
    path: '/team-hub/:teamSlug/team-pool',
    name: 'team-hub-team-pool',
    component: () =>
      import('./champion-pool/TeamPool.vue'),
    meta: {
      requiresAuth: true,
      requiresTeamMembership: true,
      teamRoles: ['COACH', 'ADMIN'],
    },
  },
];

export default teamHubRoutes;