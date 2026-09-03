// src/features/team-hub/team-hub.routes.js

import { resolveTeamRouteAccess } from './teamHub.service.js';
import { teamHubLandingRoute } from './teamHub.viewModel.js';

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
    component: () => import('./TeamHubHome.vue'),
    beforeEnter: async (to) => {
      const context = await resolveTeamRouteAccess(to.params.teamSlug);
      return { name: teamHubLandingRoute(context), params: { teamSlug: to.params.teamSlug } };
    },
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
      requiresTeamMembership: true,
      teamRoles: ['PLAYER'],
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
      teamRoles: ['COACH'],
      requiredCapability: 'COACH_REVIEW',
    },
  },

  {
    path: '/team-hub/:teamSlug/team-pool',
    name: 'team-hub-team-pool',
    redirect: (to) => ({ name: 'team-hub-coach-review', params: { teamSlug: to.params.teamSlug } }),
    meta: {
      requiresAuth: true,
      requiresTeamMembership: true,
      teamRoles: ['COACH'],
    },
  },
];

export default teamHubRoutes;
