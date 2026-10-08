// src/features/trainer-hub/trainer-hub.routes.js

const TrainerDashboard = () => import('./views/dashboard/TrainerDashboard.vue');
const TrainerClients = () => import('./views/clients/TrainerClients.vue');
const TrainerClientDetail = () => import('./views/clients/TrainerClientDetail.vue');
const TrainerQuests = () => import('./views/quests/TrainerQuests.vue');
const TrainerChallenges = () => import('./views/challenges/TrainerChallenges.vue');
const TrainerEngagement = () => import('./views/engagement/TrainerEngagement.vue');

const trainerHubRoutes = [
    {
        path: '/trainer',
        name: 'TrainerDashboard',
        component: TrainerDashboard,
        meta: {
            requiresAuth: true,
            hideLayout: true,
        },
    },

    {
        path: '/trainer/clients',
        name: 'TrainerClients',
        component: TrainerClients,
        meta: {
            requiresAuth: true,
            hideLayout: true,
        },
    },

    {
        path: '/trainer/clients/:clientId',
        name: 'TrainerClientDetail',
        component: TrainerClientDetail,
        meta: {
            requiresAuth: true,
            hideLayout: true,
        },
    },

    {
        path: '/trainer/quests',
        name: 'TrainerQuests',
        component: TrainerQuests,
        meta: {
            requiresAuth: true,
            hideLayout: true,
        },
    },

    {
        path: '/trainer/challenges',
        name: 'TrainerChallenges',
        component: TrainerChallenges,
        meta: {
            requiresAuth: true,
            hideLayout: true,
        },
    },

    {
        path: '/trainer/engagement',
        name: 'TrainerEngagement',
        component: TrainerEngagement,
        meta: {
            requiresAuth: true,
            hideLayout: true,
        },
    },
];

export default trainerHubRoutes;