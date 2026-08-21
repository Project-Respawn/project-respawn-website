// ============================================================
// PROJECT RESPAWN — PARTNER HUB DEMO DATA
// ============================================================

import ravensGamingLogo from '../../../assets/partners/ravens-gaming-logo.png';

// ------------------------------------------------------------
// SECTION 1 — PARTNER HEADER
// ------------------------------------------------------------

export const partner = {
  name: 'Ravens Community Gaming',
  shortName: 'Ravens Gaming',
  logo: ravensGamingLogo,
  type: 'Featured Partner',
  activeSince: 'August 2026',
  publicProfileUrl: '/partners/ravens-gaming',
};

// ------------------------------------------------------------
// SECTION 2 — PARTNERSHIP STATUS
// ------------------------------------------------------------

export const partnershipStatus = {
  status: 'Active',
  plan: 'Featured Partner',
  featuredUntil: '30 November 2026',
  partnerSince: '12 August 2026',

  manager: {
    name: 'Sarah Mitchell',
    role: 'Partnerships Manager',
    initials: 'SM',
  },
};

// ------------------------------------------------------------
// SECTION 3 — KEY PERFORMANCE STATS
// ------------------------------------------------------------

export const partnerStats = [
  {
    id: 'reach',
    label: 'Campaign Reach',
    value: '18,420',
    change: '+18%',
    changeText: 'vs last 30 days',
    icon: '◉',
    trend: [
      18,
      22,
      21,
      29,
      25,
      34,
      31,
      40,
      36,
      46,
      52,
      48,
      57,
    ],
  },

  {
    id: 'engagements',
    label: 'Engagements',
    value: '3,284',
    change: '+12%',
    changeText: 'vs last 30 days',
    icon: '♡',
    trend: [
      14,
      20,
      17,
      25,
      29,
      27,
      36,
      32,
      42,
      39,
      49,
      46,
      53,
    ],
  },

  {
    id: 'creators',
    label: 'Creator Activations',
    value: '6',
    change: '+50%',
    changeText: 'vs last 30 days',
    icon: '♟',
    trend: [
      12,
      14,
      18,
      16,
      24,
      22,
      27,
      30,
      28,
      34,
      38,
      36,
      42,
    ],
  },

  {
    id: 'conversions',
    label: 'Conversions',
    value: '412',
    change: '+22%',
    changeText: 'vs last 30 days',
    icon: '↗',
    trend: [
      10,
      13,
      15,
      14,
      19,
      18,
      23,
      25,
      22,
      29,
      31,
      30,
      35,
    ],
  },
];

// ------------------------------------------------------------
// SECTION 4 — ACTIVE CAMPAIGNS
// ------------------------------------------------------------

export const campaigns = [
  {
    id: 1,
    name: 'Respawn Community Challenge',
    category: 'Community Challenge',
    status: 'Active',
    creators: 6,
    reach: '12,800',
    engagement: '8.4%',
    imageClass: 'campaign-image-respawn',
  },

  {
    id: 2,
    name: 'Ravens Community Month',
    category: 'Community Awareness',
    status: 'Active',
    creators: 4,
    reach: '9,620',
    engagement: '7.1%',
    imageClass: 'campaign-image-ravens',
  },
];

// ------------------------------------------------------------
// SECTION 5 — FEATURED PLACEMENT
// ------------------------------------------------------------

export const featuredPlacement = {
  active: true,
  impressions: '14,200',
  profileVisits: '1,120',
  clickRate: '7.9%',
};

// ------------------------------------------------------------
// SECTION 6 — RECENT PERFORMANCE
// ------------------------------------------------------------

export const recentPerformance = {
  title: 'Community Engagement',
  change: '+18%',
  period: 'this month',

  points: [
    [0, 88],
    [10, 74],
    [20, 79],
    [30, 58],
    [40, 68],
    [50, 49],
    [60, 57],
    [70, 40],
    [80, 51],
    [90, 31],
    [100, 18],
  ],
};

// ------------------------------------------------------------
// SECTION 7 — QUICK ACTIONS
// ------------------------------------------------------------

export const quickActions = [
  {
    label: 'Edit brand profile',
    route: '/partner/profile',
  },

  {
    label: 'View campaigns',
    route: '/partner/campaigns',
  },

  {
    label: 'View analytics',
    route: '/partner/analytics',
  },

  {
    label: 'View public page',
    route: '/partners/ravens-gaming',
  },
];

// ------------------------------------------------------------
// SECTION 8 — UPCOMING OPPORTUNITIES
// ------------------------------------------------------------

export const opportunities = [
  {
    id: 1,
    title: 'Autumn Community Challenge',
    description: 'Looking for fitness and wellbeing partners',
    meta: 'Starts 5 October 2026',
    action: 'Learn more',
    icon: '♜',
  },

  {
    id: 2,
    title: 'Creator Campaign Opportunity',
    description: '4 matching creators available for your next campaign',
    meta: 'Creator matching',
    action: 'View creators',
    icon: '♟',
  },
];