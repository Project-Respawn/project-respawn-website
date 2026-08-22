// src/features/esports/esports.routes.js

// ============================================================
// PROJECT RESPAWN — ESPORTS ROUTES
// ============================================================
//
// Public routes for Project Respawn Esports.
//
// CURRENT ROUTES
//
// 1. Esports Home
// 2. League of Legends Team
// 3. Tournament Detail
//
// ============================================================


// ============================================================
// MAIN VIEW
// ============================================================

import EsportsHome from './views/EsportsHome.vue';


// ============================================================
// ESPORTS ROUTES
// ============================================================

const esportsRoutes = [

    // --------------------------------------------------------
    // 1. ESPORTS HOME
    //
    // Main public esports landing page.
    // --------------------------------------------------------

    {
        path: '/esports',
        name: 'EsportsHome',
        component: EsportsHome,
        meta: {
            public: true,
            title: 'Esports | Project Respawn',
        },
    },


    // --------------------------------------------------------
    // 2. LEAGUE OF LEGENDS
    //
    // Project Respawn's first competitive team.
    //
    // Lazy loaded because visitors only need this bundle
    // when they open the League of Legends team page.
    // --------------------------------------------------------

    {
        path: '/esports/league-of-legends',
        name: 'EsportsLeagueOfLegends',
        component: () =>
            import('./views/LeagueOfLegendsTeam.vue'),
        meta: {
            public: true,
            title: 'League of Legends | Project Respawn Esports',
        },
    },


    // --------------------------------------------------------
    // 3. TOURNAMENT DETAIL
    //
    // Dynamic route used for Project Respawn tournaments.
    //
    // Examples:
    //
    // /esports/tournaments/respawn-community-cup
    // /esports/tournaments/community-choice
    //
    // --------------------------------------------------------

    {
        path: '/esports/tournaments/:tournamentId',
        name: 'EsportsTournament',
        component: () =>
            import('./views/TournamentDetail.vue'),
        props: true,
        meta: {
            public: true,
            title: 'Tournament | Project Respawn Esports',
        },
    },

];


// ============================================================
// EXPORT
// ============================================================

export default esportsRoutes;