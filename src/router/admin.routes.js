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
                path: 'events',
                name: 'AdminEvents',
                component: AdminEvents,
                meta: { requiredPermission: 'events.manage' }
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
