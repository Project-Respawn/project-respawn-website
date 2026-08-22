// src/features/esports/data/esportsData.js

// ============================================================
// PROJECT RESPAWN — ESPORTS FRONTEND DATA
// ============================================================
//
// Temporary frontend-only data.
//
// Later this file can be replaced by:
// - AWS/API data
// - Admin-managed objectives
// - Admin-managed teams
// - Tournament management
// - Match / result management
//
// ============================================================

export const esportsData = {

    // ========================================================
    // CURRENT SEASON
    // ========================================================

    season: {
        name: 'Season Zero',
        year: 2026,
        tagline: 'Compete. Connect. Respawn.',
        status: 'Building our first competitive team',
    },


    // ========================================================
    // CURRENT OBJECTIVE
    //
    // This structure is deliberately generic.
    //
    // Later an admin will be able to change:
    // - title
    // - description
    // - target
    // - time limit
    // - CTA
    // - milestones
    //
    // ========================================================

    currentObjective: {
        id: 'season-zero-roster',

        type: 'platform_members',

        status: 'active',

        title: 'Unlock Our First Roster',

        description:
            'Help reveal Project Respawn\'s first competitive League of Legends team. Every new community member brings us closer to the next reveal.',

        currentValue: 0,

        targetValue: 200,

        metricLabel: 'Respawn Members',

        startDate: '2026-08-21T00:00:00',

        endDate: '2026-09-30T23:59:59',

        completedMessage:
            'The community unlocked our first competitive roster.',

        expiredMessage:
            'This community objective has ended.',

        cta: {
            label: 'Join Respawn & Help Unlock',
            route: '/join',
        },

        milestones: [
            {
                value: 25,
                label: 'Head Coach',
                subtitle: 'Coach Reveal',
            },

            {
                value: 50,
                label: 'Top',
                subtitle: 'Player Reveal #1',
            },

            {
                value: 75,
                label: 'Jungle',
                subtitle: 'Player Reveal #2',
            },

            {
                value: 100,
                label: 'Mid',
                subtitle: 'Player Reveal #3',
            },

            {
                value: 150,
                label: 'ADC',
                subtitle: 'Player Reveal #4',
            },

            {
                value: 200,
                label: 'Full Roster',
                subtitle: 'Support + Full Team',
            },
        ],
    },


    // ========================================================
    // ESPORTS TEAMS
    // ========================================================

    teams: [
        {
            id: 'league-of-legends',

            name: 'League of Legends',

            subtitle: 'Project Respawn LoL',

            season: 'Season Zero',

            year: 2026,

            status: 'Roster Reveal Coming Soon',

            route: '/esports/league-of-legends',

            featured: true,
        },
    ],


    // ========================================================
    // SEASON ZERO JOURNEY
    // ========================================================

    journey: [
        {
            id: 'team-formed',
            title: 'Team Formed',
            date: 'August 2026',
            completed: true,
        },

        {
            id: 'roster-reveal',
            title: 'Roster Reveal',
            date: 'September 2026',
            completed: false,
        },

        {
            id: 'first-scrim',
            title: 'First Scrim',
            date: 'September 2026',
            completed: false,
        },

        {
            id: 'first-match',
            title: 'First Match',
            date: 'TBD',
            completed: false,
        },

        {
            id: 'first-win',
            title: 'First Win',
            date: 'TBD',
            completed: false,
        },

        {
            id: 'future',
            title: '???',
            date: 'The Future',
            completed: false,
            secret: true,
        },
    ],


    // ========================================================
    // SEASON ZERO JERSEY
    // ========================================================

    jersey: {
        id: 'season-zero-2026',

        name: 'Season Zero Jersey',

        year: 2026,

        description:
            'Our first competitive jersey, designed around Project Respawn rather than sponsors.',

        details: [
            'Official Project Respawn phoenix identity',
            'Black, purple and Respawn green colour scheme',
            'Player name across the upper back',
            'No player numbers',
            'You Don\'t Have To Play Alone sleeve message',
            'Rise Again sleeve detail',
            'Your Past Was The Tutorial collar detail',
            'Season Zero 2026 identity',
        ],
    },


    // ========================================================
    // TOURNAMENTS
    // ========================================================

    tournaments: [
        {
            id: 'respawn-community-cup',

            name: 'Respawn Community Cup',

            game: 'League of Legends',

            status: 'Coming Soon',

            description:
                'Our first official Project Respawn community tournament. Format, rules, registration and schedule details will be announced soon.',
        },

        {
            id: 'community-choice',

            name: 'Community Choice Tournament',

            game: 'Community Selected',

            status: 'Coming Soon',

            description:
                'A future tournament where the Project Respawn community helps decide what game we compete in.',
        },
    ],


    // ========================================================
    // THE SIXTH PLAYER
    // ========================================================

    communityFeatures: [
        {
            id: 'objectives',

            title: 'Community Objectives',

            description:
                'Work together to unlock player reveals, esports milestones, content and future rewards.',
        },

        {
            id: 'vote',

            title: 'Vote & Decide',

            description:
                'Help shape selected tournaments, community events and non-competitive team decisions.',
        },

        {
            id: 'support',

            title: 'Support The Team',

            description:
                'Follow the players, join events and help build the community around Project Respawn Esports.',
        },

        {
            id: 'rewards',

            title: 'Earn Rewards',

            description:
                'Future esports participation can unlock recognition, cosmetics and community experiences.',
        },
    ],

};