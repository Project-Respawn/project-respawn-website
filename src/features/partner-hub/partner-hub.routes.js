// src/features/partner-hub/partner-hub.routes.js

const PartnerDashboard = () => import('./views/dashboard/PartnerDashboard.vue');
const PartnerProfile = () => import('./views/profile/PartnerProfile.vue');
const PartnerCampaigns = () => import('./views/campaigns/PartnerCampaigns.vue');
const PartnerAnalytics = () => import('./views/analytics/PartnerAnalytics.vue');
const CreatorDiscovery = () => import('./views/creator-discovery/CreatorDiscovery.vue');

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
