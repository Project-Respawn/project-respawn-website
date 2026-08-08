// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';

import publicRoutes from './public.routes';
import botRoutes from './bot.routes';
import adminRoutes from './admin.routes';
import forumRoutes from './forum.routes';

import NotFound from '../views/NotFound/NotFound.vue';
import BrandPermissions from '../views/BrandPermissions/BrandPermissions.vue';
import { refreshAccessContext } from '../composables/useAccessContext.js';

const routes = [
    ...publicRoutes,
    ...botRoutes,
    ...adminRoutes,
    ...forumRoutes,

    {
        path: '/brand-permissions',
        name: 'BrandPermissions',
        component: BrandPermissions,
        meta: { requiresBrandAccess: true }
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

router.beforeEach(async (to) => {
    const requiredPermission = to.matched.map((record) => record.meta?.requiredPermission).find(Boolean);
    const requiredGroups = to.matched.flatMap((record) => record.meta?.requiredGroups || []);
    const requiresBrandAccess = to.matched.some((record) => record.meta?.requiresBrandAccess);
    if (!requiredPermission && !requiredGroups.length && !requiresBrandAccess) return true;
    try {
        const context = await refreshAccessContext();
        const hasPermission = !requiredPermission || context.permissions.includes(requiredPermission);
        const hasGroup = !requiredGroups.length || requiredGroups.some((group) => context.groups.includes(group));
        const hasBrandAccess = !requiresBrandAccess || context.brands.length > 0;
        return hasPermission && hasGroup && hasBrandAccess ? true : { path: '/' };
    } catch {
        return { path: '/' };
    }
});

export default router;
