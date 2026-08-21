export const therapistDemoAccount = {
  id: "therapist-demo-001",

  profile: {
    firstName: "Emily",
    lastName: "Morgan",
    displayName: "Dr. Emily Morgan",
    initials: "EM",
    role: "Therapist",
  },

  subscription: {
    // Change between:
    // "free"
    // "trial"
    // "premium"
    tier: "trial",

    status: "active",

    trial: {
      active: true,
      daysRemaining: 24,
      endsAt: "2026-09-13",
    },

    premium: {
      price: 4.99,
      currency: "GBP",
      billingPeriod: "month",
    },
  },

  permissions: {
    betweenSessionInsights: true,
    generatedReports: true,
    historicalTrends: true,
    patternSummaries: true,
    sessionPreparation: true,
  },
};