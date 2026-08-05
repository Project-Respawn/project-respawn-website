// src/router/admin.routes.js

import AdminLayout from '../views/Admin/AdminLayout/AdminLayout.vue';

import AdminHome from '../views/Admin/AdminHome/AdminHome.vue';
import AdminUsers from '../views/Admin/AdminUsers/AdminUsers.vue';
import AdminPermissions from '../views/Admin/AdminPermissions/AdminPermissions.vue';
import AdminBrands from '../views/Admin/AdminBrands/AdminBrands.vue';
import AdminMerchCategories from '../views/Admin/AdminMerchCategories/AdminMerchCategories.vue';
import AdminBrandPermissions from '../views/Admin/AdminBrandPermissions/AdminBrandPermissions.vue';
import AdminForums from '../views/Admin/AdminForums/AdminForums.vue';
import AdminEvents from '../views/Admin/AdminEvents/AdminEvents.vue';
import AdminHost from '../views/Admin/AdminHost/AdminHost.vue';
import ProductControl from '../views/Admin/ProductControl/ProductControl.vue';
import MediaLibrary from '../views/Admin/MediaLibrary/MediaLibrary.vue';

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
                component: AdminUsers
            },
            {
                path: 'permissions',
                name: 'AdminPermissions',
                component: AdminPermissions
            },
            {
                path: 'events',
                name: 'AdminEvents',
                component: AdminEvents
            },
            {
                path: 'forums',
                name: 'AdminForums',
                component: AdminForums
            },
            {
                path: 'brands',
                name: 'AdminBrands',
                component: AdminBrands
            },
            {
                path: 'merch-categories',
                name: 'AdminMerchCategories',
                component: AdminMerchCategories
            },
            {
                path: 'brand-permissions',
                name: 'AdminBrandPermissions',
                component: AdminBrandPermissions
            },
            {
                path: 'product-control',
                name: 'ProductControl',
                component: ProductControl
            },
            {
                path: 'media-library',
                name: 'MediaLibrary',
                component: MediaLibrary
            },
            {
                path: 'host-permissions',
                name: 'AdminHost',
                component: AdminHost
            }
        ]
    }

];