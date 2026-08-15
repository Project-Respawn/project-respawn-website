// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';

import publicRoutes from './public.routes';
import creatorToolsRoutes from '../features/creator-tools/creator-tools.routes.js';
import adminRoutes from './admin.routes';
import forumRoutes from './forum.routes';

import NotFound from '../views/NotFound/NotFound.vue';
import BrandPermissions from '../views/BrandPermissions/BrandPermissions.vue';
import { refreshAccessContext } from '../composables/useAccessContext.js';
import { ensureAuthReady, useAuth } from '../composables/useAuth.js';

const routes = [
    ...publicRoutes,
    ...creatorToolsRoutes,
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

    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition;
        if (to.hash) {
            return {
                el: to.hash,
                behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
            };
        }
        return {
            top: 0
        };
    }
});

router.beforeEach(async (to) => {
    const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth);
    const requiredPermission = to.matched.map((record) => record.meta?.requiredPermission).find(Boolean);
    const requiredGroups = to.matched.flatMap((record) => record.meta?.requiredGroups || []);
    const requiresBrandAccess = to.matched.some((record) => record.meta?.requiresBrandAccess);
    if (requiresAuth) {
        await ensureAuthReady();
        const { isSignedIn } = useAuth();
        if (!isSignedIn.value) {
            return { path: '/join', query: { redirect: to.fullPath } };
        }
    }

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
