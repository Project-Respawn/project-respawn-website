// src/router/admin.routes.js

import AdminLayout from '../views/Admin/AdminLayout/AdminLayout.vue';

import AdminHome from '../views/Admin/AdminHome/AdminHome.vue';
import AdminUsers from '../views/Admin/AdminUsers/AdminUsers.vue';
import AdminPermissions from '../views/Admin/AdminPermissions/AdminPermissions.vue';
import AdminBrands from '../views/Admin/AdminBrands/AdminBrands.vue';
import AdminMerchCategories from '../views/Admin/AdminMerchCategories/AdminMerchCategories.vue';
import AdminForums from '../views/Admin/AdminForums/AdminForums.vue';
import AdminEvents from '../views/Admin/AdminEvents/AdminEvents.vue';
import ProductControl from '../views/Admin/ProductControl/ProductControl.vue';
import MediaLibrary from '../views/Admin/MediaLibrary/MediaLibrary.vue';
import AdminOrders from '../views/Admin/AdminOrders/AdminOrders.vue';
import AdminApplications from '../views/Admin/AdminApplications/AdminApplications.vue';
import AdminApplicationReviews from '../views/Admin/AdminApplications/AdminApplicationReviews.vue';
import AdminReviewerPerformance from '../views/Admin/AdminApplications/AdminReviewerPerformance.vue';
import AdminReviewerDetail from '../views/Admin/AdminApplications/AdminReviewerDetail.vue';
import AdminApplicationDetail from '../views/Admin/AdminApplications/AdminApplicationDetail.vue';
import AdminApplicationReview from '../views/Admin/AdminApplications/AdminApplicationReview.vue';
import AdminInductions from '../views/Admin/AdminApplications/AdminInductions.vue';
import AdminInductionDetail from '../views/Admin/AdminApplications/AdminInductionDetail.vue';
import AdminAvailability from '../views/Admin/Bookings/AdminAvailability.vue';
import AdminInvestors from '../views/Admin/AdminInvestors/AdminInvestors.vue';

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
