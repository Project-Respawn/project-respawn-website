// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';

// ============================================================
// ROUTE GROUPS
// ============================================================

import publicRoutes from './public.routes.js';
import featureRoutes from './features.routes.js';
import adminRoutes from './admin.routes.js';
import forumRoutes from './forum.routes.js';

// ============================================================
// SHARED / SPECIAL ROUTES
// ============================================================

import NotFound from '../views/NotFound/NotFound.vue';
import BrandPermissions from '../views/BrandPermissions/BrandPermissions.vue';

// ============================================================
// ACCESS CONTROL
// ============================================================

import { refreshAccessContext } from '../composables/useAccessContext.js';
import { ensureAuthReady, useAuth } from '../composables/useAuth.js';

// ============================================================
// ROUTES
// ============================================================

const routes = [
    // --------------------------------------------------------
    // PUBLIC WEBSITE
    // --------------------------------------------------------

    ...publicRoutes,

    // --------------------------------------------------------
    // PROJECT RESPAWN FEATURES
    // Creator Tools
    // Partner Hub
    // Trainer Hub
    // --------------------------------------------------------

    ...featureRoutes,

    // --------------------------------------------------------
    // ADMIN
    // --------------------------------------------------------

    ...adminRoutes,

    // --------------------------------------------------------
    // COMMUNITY / FORUMS
    // --------------------------------------------------------

    ...forumRoutes,

    // --------------------------------------------------------
    // SPECIAL ACCESS ROUTES
    // --------------------------------------------------------

    {
        path: '/brand-permissions',
        name: 'BrandPermissions',
        component: BrandPermissions,
        meta: {
            requiresBrandAccess: true,
        },
    },

    // --------------------------------------------------------
    // 404
    // IMPORTANT: Keep this route last
    // --------------------------------------------------------

    {
        path: '/:pathMatch(.*)',
        name: 'NotFound',
        component: NotFound,
    },
];

// ============================================================
// ROUTER
// ============================================================

const router = createRouter({
    history: createWebHistory(),

    routes,

    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }

        if (to.hash) {
            return {
                el: to.hash,
                behavior: window.matchMedia?.(
                    '(prefers-reduced-motion: reduce)'
                ).matches
                    ? 'auto'
                    : 'smooth',
            };
        }

        return {
            top: 0,
        };
    },
});

// ============================================================
// GLOBAL ROUTE ACCESS CONTROL
// ============================================================

router.beforeEach(async (to) => {
    // --------------------------------------------------------
    // DETERMINE ROUTE REQUIREMENTS
    // --------------------------------------------------------

    const requiresAuth = to.matched.some(
        (record) => record.meta?.requiresAuth
    );

    const requiredPermission = to.matched
        .map((record) => record.meta?.requiredPermission)
        .find(Boolean);

    const requiredGroups = to.matched.flatMap(
        (record) => record.meta?.requiredGroups || []
    );

    const requiresBrandAccess = to.matched.some(
        (record) => record.meta?.requiresBrandAccess
    );

    // --------------------------------------------------------
    // AUTH-AWARE HOMEPAGE
    //
    // Logged-out users:
    // "/" -> public landing page
    //
    // Logged-in users:
    // "/" -> user home dashboard at "/home"
    // --------------------------------------------------------

    if (to.path === '/') {
        await ensureAuthReady();

        const { isSignedIn } = useAuth();

        if (isSignedIn.value) {
            return {
                path: '/home',
            };
        }
    }

    // --------------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------------

    if (requiresAuth) {
        await ensureAuthReady();

        const { isSignedIn } = useAuth();

        if (!isSignedIn.value) {
            return {
                path: '/join',
                query: {
                    redirect: to.fullPath,
                },
            };
        }
    }

    // --------------------------------------------------------
    // NO ADDITIONAL ACCESS REQUIREMENTS
    // --------------------------------------------------------

    if (
        !requiredPermission &&
        !requiredGroups.length &&
        !requiresBrandAccess
    ) {
        return true;
    }

    // --------------------------------------------------------
    // PERMISSION / GROUP / BRAND ACCESS
    // --------------------------------------------------------

    try {
        const context = await refreshAccessContext();

        const hasPermission =
            !requiredPermission ||
            context.permissions.includes(requiredPermission);

        const hasGroup =
            !requiredGroups.length ||
            requiredGroups.some((group) =>
                context.groups.includes(group)
            );

        const hasBrandAccess =
            !requiresBrandAccess ||
            context.brands.length > 0;

        if (
            hasPermission &&
            hasGroup &&
            hasBrandAccess
        ) {
            return true;
        }

        return {
            path: '/',
        };
    } catch {
        return {
            path: '/',
        };
    }
});

// ============================================================
// EXPORT
// ============================================================

export default router;