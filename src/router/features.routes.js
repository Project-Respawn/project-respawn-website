// src/router/features.routes.js

// ============================================================
// PROJECT RESPAWN — FEATURE ROUTER
// ============================================================
//
// Central router for Project Respawn's feature areas.
//
// Each feature owns its own routes inside its feature folder.
// This file simply combines those routes for the main router.
//
// CURRENT FEATURES
//
// 1. Creator Tools
// 2. Partner Hub
// 3. Trainer Hub
//
// ============================================================


// ============================================================
// IMPORT FEATURE ROUTES
// ============================================================

import creatorToolsRoutes from '../features/creator-tools/creator-tools.routes.js';
import partnerHubRoutes from '../features/partner-hub/partner-hub.routes.js';
import trainerHubRoutes from '../features/trainer-hub/trainer-hub.routes.js';
import therapistRoutes from '../features/therapist/therapist.routes.js';


// ============================================================
// FEATURE ROUTE COLLECTION
// ============================================================

const featureRoutes = [

    // --------------------------------------------------------
    // 1. CREATOR TOOLS
    // --------------------------------------------------------

    ...creatorToolsRoutes,


    // --------------------------------------------------------
    // 2. PARTNER HUB
    // --------------------------------------------------------

    ...partnerHubRoutes,


    // --------------------------------------------------------
    // 3. TRAINER HUB
    // --------------------------------------------------------

    ...trainerHubRoutes,

    // --------------------------------------------------------
    // 4. THERAPIST
    // --------------------------------------------------------

    ...therapistRoutes,

];


// ============================================================
// EXPORT FEATURE ROUTES
// ============================================================

export default featureRoutes;
