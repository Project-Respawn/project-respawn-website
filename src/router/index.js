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
import { refreshInvestorAccess } from '../composables/useInvestorAccess.js';

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
    //
    // Feature routes are combined inside:
    // src/router/features.routes.js
    //
    // Current feature areas include:
    // Creator Tools
    // Partner Hub
    // Trainer Hub
    // Therapist
    // Esports
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
    //
    // IMPORTANT:
    // This route must always remain last.
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
        // ----------------------------------------------------
        // RESTORE PREVIOUS SCROLL POSITION
        // ----------------------------------------------------

        if (savedPosition) {
            return savedPosition;
        }

        // ----------------------------------------------------
        // HASH / ANCHOR NAVIGATION
        // ----------------------------------------------------

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

        // ----------------------------------------------------
        // DEFAULT TO TOP OF PAGE
        // ----------------------------------------------------

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

    const requiresInvestorAccess = to.matched.some(
        (record) => record.meta?.requiresInvestorAccess
    );

    // --------------------------------------------------------
    // AUTH-AWARE HOMEPAGE
    //
    // Logged-out:
    // "/" -> public website
    //
    // Logged-in:
    // "/" -> "/home"
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
    // NO EXTRA ACCESS REQUIREMENTS
    // --------------------------------------------------------

    if (
        !requiredPermission &&
        !requiredGroups.length &&
        !requiresBrandAccess &&
        !requiresInvestorAccess
    ) {
        return true;
    }

    // --------------------------------------------------------
    // PERMISSION / GROUP / BRAND / INVESTOR ACCESS
    // --------------------------------------------------------

    try {
        const needsAccessContext =
            requiredPermission ||
            requiredGroups.length ||
            requiresBrandAccess;

        const context = needsAccessContext
            ? await refreshAccessContext()
            : null;

        const investor = requiresInvestorAccess
            ? await refreshInvestorAccess()
            : null;

        // ----------------------------------------------------
        // PERMISSION CHECK
        // ----------------------------------------------------

        const hasPermission =
            !requiredPermission ||
            context?.permissions?.includes(requiredPermission);

        // ----------------------------------------------------
        // GROUP CHECK
        // ----------------------------------------------------

        const hasGroup =
            !requiredGroups.length ||
            requiredGroups.some((group) =>
                context?.groups?.includes(group)
            );

        // ----------------------------------------------------
        // BRAND ACCESS CHECK
        // ----------------------------------------------------

        const hasBrandAccess =
            !requiresBrandAccess ||
            (context?.brands?.length ?? 0) > 0;

        // ----------------------------------------------------
        // INVESTOR ACCESS CHECK
        // ----------------------------------------------------

        const hasInvestorAccess =
            !requiresInvestorAccess ||
            investor?.hasAccess === true;

        // ----------------------------------------------------
        // ACCESS GRANTED
        // ----------------------------------------------------

        if (
            hasPermission &&
            hasGroup &&
            hasBrandAccess &&
            hasInvestorAccess
        ) {
            return true;
        }

        // ----------------------------------------------------
        // ACCESS DENIED
        // ----------------------------------------------------

        return {
            path: requiresInvestorAccess
                ? '/investors'
                : '/',
        };
    } catch (error) {
        console.error(
            '[Router] Access-control check failed:',
            error
        );

        return {
            path: '/',
        };
    }
});

// ============================================================
// EXPORT
// ============================================================

export default router;