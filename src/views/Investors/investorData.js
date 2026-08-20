export const ecosystemItems = [
  { key: 'community', label: 'Community', stage: 'Core', copy: 'Profiles, friends, events, quests, achievements and progression designed to make participation easier and more rewarding.' },
  { key: 'creator-tools', label: 'Creator Tools', stage: 'Core', copy: 'Free creator infrastructure spanning Twitch and Discord integrations, moderation, alerts, commands, overlays and analytics.' },
  { key: 'memberships', label: 'Memberships', stage: 'Planned', copy: 'Single Creator and All Access experiences with tiered benefits that connect support to community identity and progression.' },
  { key: 'brands', label: 'Brands & Sponsorship', stage: 'Commercial expansion', copy: 'Campaigns, sponsorships and measurable community activations that create value for creators without selling unrestricted member level data.' },
  { key: 'commerce', label: 'Commerce', stage: 'Commercial expansion', copy: 'Affiliate, marketplace, merchandise and transaction economics built around creator and community activity.' },
  { key: 'labs', label: 'Respawn Labs', stage: 'Commercial expansion', copy: 'Publisher research, game testing, closed betas, player panels, creator previews, exclusive reveals and product launches.' },
  { key: 'enterprise', label: 'Enterprise', stage: 'Commercial expansion', copy: 'Organisation controls, APIs, services and intelligence for larger partners that need more than the free creator experience.' },
  { key: 'esports', label: 'Esports & Live', stage: 'Long term', copy: 'Competition, events, sponsorship, media rights and hospitality that bring the digital ecosystem into the real world.' },
  { key: 'streaming', label: 'Media & Streaming', stage: 'Long term / conditional', copy: 'Native streaming is an earned expansion only when creator scale, audience demand and unit economics justify carrying the video layer ourselves.' },
  { key: 'confidence', label: 'Social Confidence', stage: 'Mission', copy: 'Gaming is the environment. Human connection is the objective. Respawn is designed to help people take progressively easier steps into participation.' },
  { key: 'health', label: 'Respawn Health', stage: 'Conditional', copy: 'A separate health pathway would only be considered after independent evidence demonstrates meaningful outcomes and relevant regulatory requirements can be met.' }
];

export const revenueEngines = [
  { key: 'memberships', label: 'Memberships', copy: 'Recurring Single Creator and All Access member experiences.' },
  { key: 'brands', label: 'Brands & sponsorship', copy: 'Creator campaigns, sponsored community activations and privacy protected measurement.' },
  { key: 'commerce', label: 'Commerce', copy: 'Affiliate, marketplace, merchandise and transaction economics.' },
  { key: 'labs', label: 'Respawn Labs', copy: 'Research, playtests, closed betas, player panels, previews, reveals and launches.' },
  { key: 'enterprise', label: 'Enterprise', copy: 'Organisation controls, APIs, services and intelligence.' },
  { key: 'media', label: 'Media / streaming', copy: 'Advertising, memberships, discovery and media economics only if native streaming proves viable.' },
  { key: 'live', label: 'Esports / live', copy: 'Events, sponsorship, media rights and hospitality.' },
  { key: 'health', label: 'Respawn Health', copy: 'Institutional or consumer health revenue only after evidence and regulatory gates.' }
];

export const revenueStreams = [
  { key: 'memberships', label: 'Memberships', className: 'stream-memberships', stage: 'Core / planned' },
  { key: 'brands', label: 'Brands & sponsorship', className: 'stream-brands', stage: 'Core / planned' },
  { key: 'commerce', label: 'Commerce', className: 'stream-commerce', stage: 'Core / planned' },
  { key: 'labs', label: 'Respawn Labs', className: 'stream-labs', stage: 'Expansion' },
  { key: 'enterprise', label: 'Enterprise', className: 'stream-enterprise', stage: 'Expansion' },
  { key: 'live', label: 'Esports & live', className: 'stream-live', stage: 'Expansion' },
  { key: 'media', label: 'Media / streaming', className: 'stream-media', stage: 'Conditional' },
  { key: 'health', label: 'Respawn Health', className: 'stream-health', stage: 'Conditional' },
  { key: 'other', label: 'Other / emerging', className: 'stream-other', stage: 'Emerging' }
];

export const scenarios = {
  harsh: {
    label: 'Harsh / niche',
    tone: 'Downside planning case',
    description: 'A viable niche company rather than absolute failure. The true downside can still be zero.',
    totals: [0.01, 0.03, 0.08, 0.2, 0.45, 0.8, 1.3, 1.8, 2.5, 3.5],
    mix: [
      { memberships: 0.003, brands: 0.001, commerce: 0.006, labs: 0, enterprise: 0, live: 0, media: 0, health: 0, other: 0 },
      { memberships: 0.010, brands: 0.004, commerce: 0.016, labs: 0, enterprise: 0, live: 0, media: 0, health: 0, other: 0 },
      { memberships: 0.028, brands: 0.012, commerce: 0.034, labs: 0.006, enterprise: 0, live: 0, media: 0, health: 0, other: 0 },
      { memberships: 0.075, brands: 0.035, commerce: 0.065, labs: 0.020, enterprise: 0.005, live: 0, media: 0, health: 0, other: 0 },
      { memberships: 0.170, brands: 0.085, commerce: 0.115, labs: 0.045, enterprise: 0.015, live: 0.010, media: 0, health: 0, other: 0.010 },
      { memberships: 0.300, brands: 0.150, commerce: 0.180, labs: 0.090, enterprise: 0.030, live: 0.020, media: 0, health: 0, other: 0.030 },
      { memberships: 0.470, brands: 0.250, commerce: 0.280, labs: 0.150, enterprise: 0.060, live: 0.040, media: 0, health: 0, other: 0.050 },
      { memberships: 0.640, brands: 0.350, commerce: 0.370, labs: 0.220, enterprise: 0.090, live: 0.060, media: 0, health: 0, other: 0.070 },
      { memberships: 0.850, brands: 0.500, commerce: 0.500, labs: 0.320, enterprise: 0.130, live: 0.090, media: 0, health: 0, other: 0.110 },
      { memberships: 1.150, brands: 0.700, commerce: 0.650, labs: 0.420, enterprise: 0.180, live: 0.120, media: 0, health: 0, other: 0.280 }
    ]
  },
  base: {
    label: 'Execution / base success',
    tone: 'Operating planning case',
    description: 'Respawn becomes a significant gaming technology and media business with multiple proven revenue engines.',
    totals: [0.025, 0.125, 0.5, 1.8, 5, 12, 27, 52, 90, 145],
    mix: [
      { memberships: 0.006, brands: 0.002, commerce: 0.017, labs: 0, enterprise: 0, live: 0, media: 0, health: 0, other: 0 },
      { memberships: 0.040, brands: 0.020, commerce: 0.060, labs: 0.005, enterprise: 0, live: 0, media: 0, health: 0, other: 0 },
      { memberships: 0.170, brands: 0.090, commerce: 0.160, labs: 0.050, enterprise: 0.015, live: 0.010, media: 0, health: 0, other: 0.005 },
      { memberships: 0.600, brands: 0.360, commerce: 0.420, labs: 0.180, enterprise: 0.090, live: 0.080, media: 0.020, health: 0, other: 0.050 },
      { memberships: 1.700, brands: 1.050, commerce: 1.000, labs: 0.500, enterprise: 0.280, live: 0.200, media: 0.080, health: 0, other: 0.190 },
      { memberships: 3.800, brands: 2.500, commerce: 2.200, labs: 1.300, enterprise: 0.800, live: 0.650, media: 0.300, health: 0, other: 0.450 },
      { memberships: 8.000, brands: 5.000, commerce: 4.300, labs: 3.000, enterprise: 2.000, live: 1.500, media: 1.200, health: 0.200, other: 1.800 },
      { memberships: 15.000, brands: 9.000, commerce: 7.500, labs: 6.000, enterprise: 4.500, live: 3.500, media: 3.000, health: 0.500, other: 3.000 },
      { memberships: 25.000, brands: 16.000, commerce: 12.500, labs: 10.000, enterprise: 8.000, live: 6.500, media: 5.500, health: 1.500, other: 5.000 },
      { memberships: 38.000, brands: 27.000, commerce: 20.000, labs: 18.000, enterprise: 15.000, live: 12.000, media: 10.000, health: 2.000, other: 3.000 }
    ]
  },
  breakout: {
    label: 'Global breakout',
    tone: 'Upside boundary',
    description: 'Assumes exceptional global adoption, successful streaming economics, major brand and publisher scale and a validated health business.',
    totals: [0.075, 0.4, 2, 10, 35, 100, 225, 425, 700, 1050],
    mix: [
      { memberships: 0.020, brands: 0.010, commerce: 0.045, labs: 0, enterprise: 0, live: 0, media: 0, health: 0, other: 0 },
      { memberships: 0.140, brands: 0.070, commerce: 0.160, labs: 0.020, enterprise: 0.005, live: 0, media: 0, health: 0, other: 0.005 },
      { memberships: 0.700, brands: 0.350, commerce: 0.500, labs: 0.200, enterprise: 0.100, live: 0.050, media: 0.050, health: 0, other: 0.050 },
      { memberships: 3.000, brands: 1.800, commerce: 2.000, labs: 1.000, enterprise: 0.600, live: 0.500, media: 0.500, health: 0, other: 0.600 },
      { memberships: 10.000, brands: 6.000, commerce: 6.000, labs: 4.000, enterprise: 2.500, live: 2.000, media: 2.000, health: 0.500, other: 2.000 },
      { memberships: 28.000, brands: 17.000, commerce: 15.000, labs: 11.000, enterprise: 8.000, live: 6.000, media: 7.000, health: 2.000, other: 6.000 },
      { memberships: 58.000, brands: 38.000, commerce: 31.000, labs: 25.000, enterprise: 20.000, live: 15.000, media: 18.000, health: 5.000, other: 15.000 },
      { memberships: 105.000, brands: 70.000, commerce: 56.000, labs: 49.000, enterprise: 40.000, live: 30.000, media: 38.000, health: 12.000, other: 25.000 },
      { memberships: 165.000, brands: 115.000, commerce: 90.000, labs: 82.000, enterprise: 68.000, live: 50.000, media: 65.000, health: 25.000, other: 40.000 },
      { memberships: 225.000, brands: 150.000, commerce: 115.000, labs: 95.000, enterprise: 80.000, live: 70.000, media: 145.000, health: 125.000, other: 45.000 }
    ]
  }
};

export const roadmap = [
  { period: '2026–27', title: 'Prove the core loop', copy: 'Launch, creator pilot, member retention and an instrumented community loop.' },
  { period: '2027–28', title: 'Prove the economics', copy: 'Membership economics, first brand and publisher pilots, and the research foundation.' },
  { period: '2028–29', title: 'Validate the evidence', copy: 'University backed research, stronger Labs and enterprise products, and evidence validation.' },
  { period: '2029–31', title: 'Scale distribution', copy: 'International creator network, larger commercial partnerships and native streaming feasibility.' },
  { period: '2031–33', title: 'Earn platform expansion', copy: 'Selective platform expansion. A health pathway only proceeds if evidence supports it.' },
  { period: '2033–36', title: 'Build the group', copy: 'Potential global gaming and media group with multiple mature revenue engines.' }
];

export const confidenceJourney = ['Watch', 'Interact', 'Join', 'Play', 'Connect', 'Participate', 'Belong'];
