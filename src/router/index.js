// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';

import publicRoutes from './public.routes';
import botRoutes from './bot.routes';
import adminRoutes from './admin.routes';
import forumRoutes from './forum.routes';

import NotFound from '../views/NotFound/NotFound.vue';
import BrandPermissions from '../views/BrandPermissions/BrandPermissions.vue';

const routes = [
    ...publicRoutes,
    ...botRoutes,
    ...adminRoutes,
    ...forumRoutes,

    {
        path: '/brand-permissions',
        name: 'BrandPermissions',
        component: BrandPermissions
    },

    {
        path: '/:pathMatch(.*)',
        component: NotFound
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,

    scrollBehavior() {
        return {
            top: 0
        };
    }
});

export default router;
