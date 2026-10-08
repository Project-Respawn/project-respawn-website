// src/router/admin.routes.js

const AdminLayout = () => import('../views/Admin/AdminLayout/AdminLayout.vue');

const AdminHome = () => import('../views/Admin/AdminHome/AdminHome.vue');
const AdminUsers = () => import('../views/Admin/AdminUsers/AdminUsers.vue');
const AdminPermissions = () => import('../views/Admin/AdminPermissions/AdminPermissions.vue');
const AdminBrands = () => import('../views/Admin/AdminBrands/AdminBrands.vue');
const BrandPermissions = () => import('../views/BrandPermissions/BrandPermissions.vue');
const AdminMerchCategories = () => import('../views/Admin/AdminMerchCategories/AdminMerchCategories.vue');
const AdminForums = () => import('../views/Admin/AdminForums/AdminForums.vue');
const AdminEvents = () => import('../views/Admin/AdminEvents/AdminEvents.vue');
const ProductControl = () => import('../views/Admin/ProductControl/ProductControl.vue');
const MediaLibrary = () => import('../views/Admin/MediaLibrary/MediaLibrary.vue');
const AdminOrders = () => import('../views/Admin/AdminOrders/AdminOrders.vue');
const AdminApplications = () => import('../views/Admin/AdminApplications/AdminApplications.vue');
const AdminApplicationReviews = () => import('../views/Admin/AdminApplications/AdminApplicationReviews.vue');
const AdminReviewerPerformance = () => import('../views/Admin/AdminApplications/AdminReviewerPerformance.vue');
const AdminReviewerDetail = () => import('../views/Admin/AdminApplications/AdminReviewerDetail.vue');
const AdminApplicationDetail = () => import('../views/Admin/AdminApplications/AdminApplicationDetail.vue');
const AdminApplicationReview = () => import('../views/Admin/AdminApplications/AdminApplicationReview.vue');
const AdminInductions = () => import('../views/Admin/AdminApplications/AdminInductions.vue');
const AdminInductionDetail = () => import('../views/Admin/AdminApplications/AdminInductionDetail.vue');
const AdminAvailability = () => import('../views/Admin/Bookings/AdminAvailability.vue');
const AdminInvestors = () => import('../views/Admin/AdminInvestors/AdminInvestors.vue');
const TeamAdministration = () => import('../features/Team Hub/TeamAdministration.vue');

export default [

    {
        path: '/dashboard',
        component: AdminLayout,
        meta: {
            hideLayout: true
        },
        children: [
            {
                path: '',
                name: 'AdminHome',
                component: AdminHome
            },
            {
                path: 'users',
                name: 'AdminUsers',
                component: AdminUsers,
                meta: { requiredPermission: 'users.view' }
            },
            {
                path: 'permissions',
                name: 'AdminPermissions',
                component: AdminPermissions,
                meta: { requiredGroups: ['SuperAdmin', 'Admin'] }
            },
            {
                path: 'investors',
                name: 'AdminInvestors',
                component: AdminInvestors,
                meta: { requiredGroups: ['SuperAdmin', 'Admin'] }
            },
            {
                path: 'esports/teams',
                name: 'AdminTeamAdministration',
                component: TeamAdministration,
                meta: { requiredPermission: 'teams.branding.manage' }
            },
            {
                path: 'events',
                name: 'AdminEvents',
                component: AdminEvents,
                meta: { requiredPermission: 'events.manage' }
            },
            {
                path: 'applications',
                name: 'AdminApplications',
                component: AdminApplications,
                meta: { requiredPermission: 'applications.read' }
            },
            {
                path: 'applications/reviews',
                name: 'AdminApplicationReviews',
                component: AdminApplicationReviews,
                meta: { requiredGroups: ['SuperAdmin', 'Admin'] }
            },
            {
                path: 'applications/reviewers',
                name: 'AdminReviewerPerformance',
                component: AdminReviewerPerformance,
                meta: { requiredGroups: ['SuperAdmin', 'Admin'] }
            },
            {
                path: 'applications/reviewers/:reviewerId',
                name: 'AdminReviewerDetail',
                component: AdminReviewerDetail,
                props: true,
                meta: { requiredGroups: ['SuperAdmin', 'Admin'] }
            },
            {
                path: 'availability',
                name: 'AdminAvailability',
                component: AdminAvailability,
                meta: { requiredGroups: ['SuperAdmin', 'Admin', 'Staff'] }
            },
            {
                path: 'applications/availability',
                redirect: { name: 'AdminAvailability' }
            },
            {
                path: 'applications/inductions',
                name: 'AdminInductions',
                component: AdminInductions,
                meta: { requiredGroups: ['SuperAdmin', 'Admin', 'Staff'] }
            },
            {
                path: 'applications/inductions/:inductionId',
                name: 'AdminInductionDetail',
                component: AdminInductionDetail,
                props: true,
                meta: { requiredGroups: ['SuperAdmin', 'Admin', 'Staff'] }
            },
            {
                path: 'applications/:applicationId/review',
                name: 'AdminApplicationReview',
                component: AdminApplicationReview,
                props: true,
                meta: { requiredGroups: ['SuperAdmin', 'Admin', 'Staff'] }
            },
            {
                path: 'applications/:applicationId',
                name: 'AdminApplicationDetail',
                component: AdminApplicationDetail,
                props: true,
                meta: { requiredPermission: 'applications.read' }
            },
            {
                path: 'forums',
                name: 'AdminForums',
                component: AdminForums,
                meta: { requiredPermission: 'forums.structure.manage' }
            },
            {
                path: 'brands',
                name: 'AdminBrands',
                component: AdminBrands,
                meta: { requiredPermission: 'brands.manage' }
            },
            {
                path: 'brand-permissions',
                name: 'BrandPermissions',
                component: BrandPermissions,
                meta: { requiredGroups: ['SuperAdmin', 'Admin', 'Staff'] }
            },
            {
                path: 'merch-categories',
                name: 'AdminMerchCategories',
                component: AdminMerchCategories,
                meta: { requiredPermission: 'merch.categories.manage' }
            },
            {
                path: 'product-control',
                name: 'ProductControl',
                component: ProductControl,
                meta: { requiredPermission: 'products.edit' }
            },
            {
                path: 'media-library',
                name: 'MediaLibrary',
                component: MediaLibrary,
                meta: { requiredPermission: 'media.library.manage' }
            },
            {
                path: 'orders',
                name: 'AdminOrders',
                component: AdminOrders,
                meta: { requiredPermission: 'orders.view' }
            }
        ]
    }

];
