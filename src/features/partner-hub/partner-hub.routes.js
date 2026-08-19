// src/features/partner-hub/partner-hub.routes.js

import PartnerDashboard from './views/dashboard/PartnerDashboard.vue';
import PartnerProfile from './views/profile/PartnerProfile.vue';
import PartnerCampaigns from './views/campaigns/PartnerCampaigns.vue';
import PartnerAnalytics from './views/analytics/PartnerAnalytics.vue';
import CreatorDiscovery from './views/creator-discovery/CreatorDiscovery.vue';

const partnerHubRoutes = [
    {
        path: '/partner',
        name: 'PartnerDashboard',
        component: PartnerDashboard,
        meta: {
            requiresAuth: true,
            hideLayout: true,
        },
    },
    {
        path: '/partner/profile',
        name: 'PartnerProfile',
        component: PartnerProfile,
        meta: {
            requiresAuth: true,
            hideLayout: true,
        },
    },
    {
        path: '/partner/campaigns',
        name: 'PartnerCampaigns',
        component: PartnerCampaigns,
        meta: {
            requiresAuth: true,
            hideLayout: true,
        },
    },
    {
        path: '/partner/analytics',
        name: 'PartnerAnalytics',
        component: PartnerAnalytics,
        meta: {
            requiresAuth: true,
            hideLayout: true,
        },
    },
    {
        path: '/partner/creators',
        name: 'PartnerCreatorDiscovery',
        component: CreatorDiscovery,
        meta: {
            requiresAuth: true,
            hideLayout: true,
        },
    },
];

export default partnerHubRoutes;// Partner Hub placeholder.
