// src/features/trainer-hub/trainer-hub.routes.js

import TrainerDashboard from './views/dashboard/TrainerDashboard.vue';
import TrainerClients from './views/clients/TrainerClients.vue';
import TrainerClientDetail from './views/clients/TrainerClientDetail.vue';
import TrainerQuests from './views/quests/TrainerQuests.vue';
import TrainerChallenges from './views/challenges/TrainerChallenges.vue';
import TrainerEngagement from './views/engagement/TrainerEngagement.vue';

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