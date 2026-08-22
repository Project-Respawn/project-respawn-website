export const therapistDemoInsights = [
  /* =========================================================
     ALEX MORGAN
  ========================================================= */
  {
    clientId: "alex-morgan",

    /* =====================================================
       SINCE LAST SESSION
    ====================================================== */

    sinceLastSession: {
      periodLabel: "Since last session",

      summary: [
        {
          id: "quests-completed",
          icon: "✓",
          value: 2,
          label: "Quests completed",
          detail: "+2 since last session",
          tone: "blue",
        },
        {
          id: "reflections",
          icon: "“",
          value: 3,
          label: "Reflections shared",
          detail: "+3 since last session",
          tone: "purple",
        },
        {
          id: "confidence",
          icon: "◇",
          value: 4,
          label: "Confidence check-ins",
          detail: "+1 since last session",
          tone: "orange",
        },
        {
          id: "discussion",
          icon: "💬",
          value: 3,
          label: "Discussion points",
          detail: "+1 since last session",
          tone: "orange",
        },
      ],
    },

    /* =====================================================
       CONFIDENCE TREND
    ====================================================== */

    confidenceTrend: {
      defaultPeriod: "4-weeks",

      periods: [
        {
          id: "4-weeks",
          label: "Last 4 weeks",
        },
        {
          id: "3-months",
          label: "Last 3 months",
        },
        {
          id: "12-months",
          label: "Last 12 months",
        },
      ],

      datasets: {
        "4-weeks": [
          {
            label: "Jul 24",
            value: 4,
          },
          {
            label: "Jul 31",
            value: 5,
          },
          {
            label: "Aug 7",
            value: 4,
          },
          {
            label: "Aug 14",
            value: 6,
          },
          {
            label: "Aug 20",
            value: 7,
          },
        ],

        "3-months": [
          {
            label: "Jun",
            value: 3.8,
          },
          {
            label: "Jul",
            value: 4.7,
          },
          {
            label: "Aug",
            value: 6.2,
          },
        ],

        "12-months": [
          {
            label: "Sep",
            value: 3.1,
          },
          {
            label: "Nov",
            value: 3.5,
          },
          {
            label: "Jan",
            value: 3.8,
          },
          {
            label: "Mar",
            value: 4.2,
          },
          {
            label: "May",
            value: 4.8,
          },
          {
            label: "Jul",
            value: 5.3,
          },
          {
            label: "Aug",
            value: 6.2,
          },
        ],
      },

      overallChange: 18,

      overallDirection: "up",

      summary:
        "Overall self-reported confidence has increased since the previous session.",
    },

    /* =====================================================
       GOAL PROGRESS
    ====================================================== */

    goalProgress: [
      {
        id: "social-confidence",
        label: "Social Confidence",
        progress: 72,
        change: 12,
        tone: "blue",
      },
      {
        id: "community-engagement",
        label: "Community Engagement",
        progress: 58,
        change: 8,
        tone: "purple",
      },
      {
        id: "independence",
        label: "Independence",
        progress: 81,
        change: 15,
        tone: "orange",
      },
    ],

    goalProgressSummary: {
      progressing: 4,
      total: 5,
      label: "4 of 5 goals are progressing",
    },

    /* =====================================================
       QUEST TYPE INSIGHTS
    ====================================================== */

    questTypeInsights: {
      defaultView: "completed",
      defaultPeriod: "30-days",

      views: [
        {
          id: "completed",
          label: "Completed Quests",
        },
        {
          id: "assigned",
          label: "Assigned Quests",
        },
        {
          id: "completion-rate",
          label: "Completion Rate",
        },
        {
          id: "confidence-gain",
          label: "Confidence Improvement",
        },
        {
          id: "difficulty",
          label: "Quest Difficulty",
        },
        {
          id: "experience",
          label: "Client Rated Experience",
        },
      ],

      periods: [
        {
          id: "7-days",
          label: "7 Days",
        },
        {
          id: "30-days",
          label: "30 Days",
        },
        {
          id: "3-months",
          label: "3 Months",
        },
        {
          id: "12-months",
          label: "12 Months",
        },
        {
          id: "all-time",
          label: "All Time",
        },
      ],

      data: {
        "30-days": {
          completed: {
            total: 18,

            assignedTotal: 24,

            categories: [
              {
                id: "social-confidence",
                label: "Social Confidence",
                value: 7,
                percentage: 39,
                tone: "purple",
              },
              {
                id: "community-engagement",
                label: "Community Engagement",
                value: 5,
                percentage: 28,
                tone: "blue",
              },
              {
                id: "independence",
                label: "Independence",
                value: 3,
                percentage: 17,
                tone: "green",
              },
              {
                id: "gaming-online-social",
                label: "Gaming / Online Social",
                value: 2,
                percentage: 11,
                tone: "orange",
              },
              {
                id: "other",
                label: "Other",
                value: 1,
                percentage: 5,
                tone: "neutral",
              },
            ],

            highlights: [
              {
                id: "most-completed",
                label: "Most completed",
                value: "Social Confidence",
                detail: "7 completed",
                tone: "purple",
              },
              {
                id: "highest-rate",
                label: "Highest completion rate",
                value: "Independence",
                detail: "81%",
                tone: "orange",
              },
              {
                id: "largest-confidence-gain",
                label: "Largest confidence gain",
                value: "Community Engagement",
                detail: "+1.8 average",
                tone: "green",
              },
              {
                id: "most-challenging",
                label: "Most challenging",
                value: "Group Social",
                detail: "42% completion",
                tone: "red",
              },
            ],
          },

          assigned: {
            total: 24,

            categories: [
              {
                id: "social-confidence",
                label: "Social Confidence",
                value: 9,
                percentage: 38,
                tone: "purple",
              },
              {
                id: "community-engagement",
                label: "Community Engagement",
                value: 7,
                percentage: 29,
                tone: "blue",
              },
              {
                id: "independence",
                label: "Independence",
                value: 4,
                percentage: 17,
                tone: "green",
              },
              {
                id: "gaming-online-social",
                label: "Gaming / Online Social",
                value: 3,
                percentage: 12,
                tone: "orange",
              },
              {
                id: "other",
                label: "Other",
                value: 1,
                percentage: 4,
                tone: "neutral",
              },
            ],
          },

          "completion-rate": {
            categories: [
              {
                id: "social-confidence",
                label: "Social Confidence",
                value: 78,
                percentage: 78,
                tone: "purple",
              },
              {
                id: "community-engagement",
                label: "Community Engagement",
                value: 71,
                percentage: 71,
                tone: "blue",
              },
              {
                id: "independence",
                label: "Independence",
                value: 81,
                percentage: 81,
                tone: "green",
              },
              {
                id: "gaming-online-social",
                label: "Gaming / Online Social",
                value: 67,
                percentage: 67,
                tone: "orange",
              },
              {
                id: "group-social",
                label: "Group Social",
                value: 42,
                percentage: 42,
                tone: "red",
              },
            ],
          },

          "confidence-gain": {
            categories: [
              {
                id: "social-confidence",
                label: "Social Confidence",
                value: 1.5,
                tone: "purple",
              },
              {
                id: "community-engagement",
                label: "Community Engagement",
                value: 1.8,
                tone: "blue",
              },
              {
                id: "independence",
                label: "Independence",
                value: 1.2,
                tone: "green",
              },
              {
                id: "gaming-online-social",
                label: "Gaming / Online Social",
                value: 0.9,
                tone: "orange",
              },
              {
                id: "group-social",
                label: "Group Social",
                value: 0.6,
                tone: "red",
              },
            ],
          },

          difficulty: {
            categories: [
              {
                id: "social-confidence",
                label: "Social Confidence",
                value: 5.7,
                tone: "purple",
              },
              {
                id: "community-engagement",
                label: "Community Engagement",
                value: 6.4,
                tone: "blue",
              },
              {
                id: "independence",
                label: "Independence",
                value: 4.8,
                tone: "green",
              },
              {
                id: "gaming-online-social",
                label: "Gaming / Online Social",
                value: 4.2,
                tone: "orange",
              },
              {
                id: "group-social",
                label: "Group Social",
                value: 7.6,
                tone: "red",
              },
            ],
          },

          experience: {
            categories: [
              {
                id: "social-confidence",
                label: "Social Confidence",
                value: 7.8,
                tone: "purple",
              },
              {
                id: "community-engagement",
                label: "Community Engagement",
                value: 7.2,
                tone: "blue",
              },
              {
                id: "independence",
                label: "Independence",
                value: 8.1,
                tone: "green",
              },
              {
                id: "gaming-online-social",
                label: "Gaming / Online Social",
                value: 8.4,
                tone: "orange",
              },
              {
                id: "group-social",
                label: "Group Social",
                value: 5.6,
                tone: "red",
              },
            ],
          },
        },

        "7-days": {
          completed: {
            total: 5,

            assignedTotal: 7,

            categories: [
              {
                id: "social-confidence",
                label: "Social Confidence",
                value: 2,
                percentage: 40,
                tone: "purple",
              },
              {
                id: "community-engagement",
                label: "Community Engagement",
                value: 1,
                percentage: 20,
                tone: "blue",
              },
              {
                id: "independence",
                label: "Independence",
                value: 1,
                percentage: 20,
                tone: "green",
              },
              {
                id: "gaming-online-social",
                label: "Gaming / Online Social",
                value: 1,
                percentage: 20,
                tone: "orange",
              },
            ],

            highlights: [
              {
                id: "most-completed",
                label: "Most completed",
                value: "Social Confidence",
                detail: "2 completed",
                tone: "purple",
              },
              {
                id: "highest-rate",
                label: "Highest completion rate",
                value: "Independence",
                detail: "100%",
                tone: "green",
              },
              {
                id: "largest-confidence-gain",
                label: "Largest confidence gain",
                value: "Community Engagement",
                detail: "+2.0 average",
                tone: "blue",
              },
              {
                id: "most-challenging",
                label: "Most challenging",
                value: "Group Social",
                detail: "Not completed",
                tone: "red",
              },
            ],
          },
        },

        "3-months": {
          completed: {
            total: 44,

            assignedTotal: 58,

            categories: [
              {
                id: "social-confidence",
                label: "Social Confidence",
                value: 17,
                percentage: 39,
                tone: "purple",
              },
              {
                id: "community-engagement",
                label: "Community Engagement",
                value: 11,
                percentage: 25,
                tone: "blue",
              },
              {
                id: "independence",
                label: "Independence",
                value: 8,
                percentage: 18,
                tone: "green",
              },
              {
                id: "gaming-online-social",
                label: "Gaming / Online Social",
                value: 5,
                percentage: 11,
                tone: "orange",
              },
              {
                id: "other",
                label: "Other",
                value: 3,
                percentage: 7,
                tone: "neutral",
              },
            ],
          },
        },

        "12-months": {
          completed: {
            total: 123,

            assignedTotal: 166,

            categories: [
              {
                id: "social-confidence",
                label: "Social Confidence",
                value: 45,
                percentage: 37,
                tone: "purple",
              },
              {
                id: "community-engagement",
                label: "Community Engagement",
                value: 31,
                percentage: 25,
                tone: "blue",
              },
              {
                id: "independence",
                label: "Independence",
                value: 23,
                percentage: 19,
                tone: "green",
              },
              {
                id: "gaming-online-social",
                label: "Gaming / Online Social",
                value: 16,
                percentage: 13,
                tone: "orange",
              },
              {
                id: "other",
                label: "Other",
                value: 8,
                percentage: 6,
                tone: "neutral",
              },
            ],
          },
        },

        "all-time": {
          completed: {
            total: 148,

            assignedTotal: 201,

            categories: [
              {
                id: "social-confidence",
                label: "Social Confidence",
                value: 54,
                percentage: 36,
                tone: "purple",
              },
              {
                id: "community-engagement",
                label: "Community Engagement",
                value: 38,
                percentage: 26,
                tone: "blue",
              },
              {
                id: "independence",
                label: "Independence",
                value: 27,
                percentage: 18,
                tone: "green",
              },
              {
                id: "gaming-online-social",
                label: "Gaming / Online Social",
                value: 19,
                percentage: 13,
                tone: "orange",
              },
              {
                id: "other",
                label: "Other",
                value: 10,
                percentage: 7,
                tone: "neutral",
              },
            ],
          },
        },
      },
    },

    /* =====================================================
       PATTERN SUMMARY
    ====================================================== */

    patterns: [
      {
        id: "individual-social",
        icon: "↗",
        tone: "green",

        title:
          "Strong engagement with individual social quests.",

        detail:
          "Alex completed 8 of 9 individual social quests during this period.",

        source:
          "Based on assigned and completed quest activity",
      },
      {
        id: "group-challenge",
        icon: "!",
        tone: "orange",

        title:
          "Group activities appear more challenging.",

        detail:
          "3 of 7 assigned group quests were completed during the selected period.",

        source:
          "Based on quest completion data",
      },
      {
        id: "community-confidence",
        icon: "“",
        tone: "blue",

        title:
          "Positive confidence movement after community quests.",

        detail:
          "Average self-reported confidence increased from 4.6 to 6.4 after completed community quests.",

        source:
          "Based on shared confidence check-ins",
      },
      {
        id: "planned-success",
        icon: "▣",
        tone: "purple",

        title:
          "Planning appears associated with higher completion.",

        detail:
          "Quests marked as planned have a higher completion rate than unplanned activities in the current period.",

        source:
          "Based on completed and skipped quest activity",
      },
    ],

    /* =====================================================
       DISCUSSION TOPICS
    ====================================================== */

    discussionTopics: [
      {
        id: "alex-shared-1",
        type: "client",
        typeLabel: "Client shared",
        icon: "“",
        tone: "blue",

        title:
          "I felt much better once I got there.",

        detail:
          "Added by Alex after completing a planned social activity.",

        dateLabel: "18 Aug",

        source:
          "Client discussion point",
      },
      {
        id: "therapist-prompt-1",
        type: "prompt",
        typeLabel: "Therapist prompt",
        icon: "◇",
        tone: "purple",

        title:
          "Consider discussing confidence before vs after planned social activities.",

        detail:
          "Reported confidence has increased after several completed planned activities.",

        source:
          "Platform-generated session preparation prompt",
      },
      {
        id: "explore-1",
        type: "attention",
        typeLabel: "Important to explore",
        icon: "!",
        tone: "orange",

        title:
          "Community event ended earlier than planned.",

        detail:
          "Alex added this as something they would like to discuss.",

        dateLabel: "15 Aug",

        source:
          "Client activity and discussion point",
      },
    ],

    /* =====================================================
       PERMISSIONS
    ====================================================== */

    permissions: {
      communityActivity: {
        shared: false,

        label:
          "Community activity",

        description:
          "Additional community activity is not currently shared.",

        requestable: true,
      },

      gamingActivity: {
        shared: false,

        label:
          "Gaming activity",

        description:
          "Detailed gaming activity is not currently shared.",

        requestable: true,
      },
    },
  },

  /* =========================================================
     SARAH CHEN
  ========================================================= */
  {
    clientId: "sarah-chen",

    sinceLastSession: {
      periodLabel: "Since last session",

      summary: [
        {
          id: "quests-completed",
          icon: "✓",
          value: 1,
          label: "Quests completed",
          detail: "+1 since last session",
          tone: "blue",
        },
        {
          id: "reflections",
          icon: "“",
          value: 2,
          label: "Reflections shared",
          detail: "+2 since last session",
          tone: "purple",
        },
        {
          id: "confidence",
          icon: "◇",
          value: 2,
          label: "Confidence check-ins",
          detail: "Stable",
          tone: "orange",
        },
        {
          id: "discussion",
          icon: "💬",
          value: 1,
          label: "Discussion point",
          detail: "+1 since last session",
          tone: "orange",
        },
      ],
    },

    confidenceTrend: {
      defaultPeriod: "4-weeks",

      periods: [
        {
          id: "4-weeks",
          label: "Last 4 weeks",
        },
      ],

      datasets: {
        "4-weeks": [
          {
            label: "Jul 24",
            value: 5,
          },
          {
            label: "Jul 31",
            value: 5,
          },
          {
            label: "Aug 7",
            value: 6,
          },
          {
            label: "Aug 14",
            value: 6,
          },
          {
            label: "Aug 20",
            value: 6,
          },
        ],
      },

      overallChange: 6,
      overallDirection: "up",

      summary:
        "Self-reported confidence has remained relatively stable with a small recent increase.",
    },

    goalProgress: [
      {
        id: "planning",
        label: "Planned Activities",
        progress: 76,
        change: 9,
        tone: "blue",
      },
      {
        id: "social-confidence",
        label: "Social Confidence",
        progress: 63,
        change: 4,
        tone: "purple",
      },
      {
        id: "independence",
        label: "Independence",
        progress: 70,
        change: 6,
        tone: "orange",
      },
    ],

    goalProgressSummary: {
      progressing: 3,
      total: 4,
      label: "3 of 4 goals are progressing",
    },

    questTypeInsights: {
      defaultView: "completed",
      defaultPeriod: "30-days",

      views: [
        {
          id: "completed",
          label: "Completed Quests",
        },
        {
          id: "completion-rate",
          label: "Completion Rate",
        },
      ],

      periods: [
        {
          id: "7-days",
          label: "7 Days",
        },
        {
          id: "30-days",
          label: "30 Days",
        },
        {
          id: "3-months",
          label: "3 Months",
        },
      ],

      data: {
        "30-days": {
          completed: {
            total: 12,
            assignedTotal: 16,

            categories: [
              {
                id: "planning",
                label: "Planned Activities",
                value: 5,
                percentage: 42,
                tone: "purple",
              },
              {
                id: "social-confidence",
                label: "Social Confidence",
                value: 3,
                percentage: 25,
                tone: "blue",
              },
              {
                id: "independence",
                label: "Independence",
                value: 3,
                percentage: 25,
                tone: "green",
              },
              {
                id: "other",
                label: "Other",
                value: 1,
                percentage: 8,
                tone: "neutral",
              },
            ],

            highlights: [
              {
                id: "most-completed",
                label: "Most completed",
                value: "Planned Activities",
                detail: "5 completed",
                tone: "purple",
              },
            ],
          },
        },
      },
    },

    patterns: [
      {
        id: "planning",
        icon: "↗",
        tone: "green",

        title:
          "Planned activities have a strong completion rate.",

        detail:
          "Sarah has completed most activities that were planned in advance.",

        source:
          "Based on quest completion data",
      },
    ],

    discussionTopics: [
      {
        id: "sarah-topic-1",
        type: "client",
        typeLabel: "Client shared",
        icon: "“",
        tone: "blue",

        title:
          "Why does planning make some situations easier but others harder?",

        detail:
          "Added by Sarah for the next session.",

        dateLabel: "17 Aug",

        source:
          "Client discussion point",
      },
    ],

    permissions: {},
  },

  /* =========================================================
     JAMIE WILSON
  ========================================================= */
  {
    clientId: "jamie-wilson",

    sinceLastSession: {
      periodLabel: "Since last session",

      summary: [
        {
          id: "quests-completed",
          icon: "✓",
          value: 0,
          label: "Quests completed",
          detail: "No new completions",
          tone: "blue",
        },
        {
          id: "reflections",
          icon: "“",
          value: 0,
          label: "Reflections shared",
          detail: "No new reflections",
          tone: "purple",
        },
        {
          id: "confidence",
          icon: "◇",
          value: 1,
          label: "Confidence check-in",
          detail: "1 recorded",
          tone: "orange",
        },
        {
          id: "discussion",
          icon: "💬",
          value: 0,
          label: "Discussion points",
          detail: "None added",
          tone: "orange",
        },
      ],
    },

    confidenceTrend: {
      defaultPeriod: "4-weeks",

      periods: [
        {
          id: "4-weeks",
          label: "Last 4 weeks",
        },
      ],

      datasets: {
        "4-weeks": [
          {
            label: "Jul 24",
            value: 5,
          },
          {
            label: "Jul 31",
            value: 5,
          },
          {
            label: "Aug 7",
            value: 4,
          },
          {
            label: "Aug 14",
            value: 4,
          },
          {
            label: "Aug 20",
            value: 4,
          },
        ],
      },

      overallChange: -8,
      overallDirection: "down",

      summary:
        "Self-reported confidence is lower than at the start of the period.",
    },

    goalProgress: [
      {
        id: "reflection",
        label: "Reflection Routine",
        progress: 44,
        change: -8,
        tone: "orange",
      },
      {
        id: "community",
        label: "Community Engagement",
        progress: 52,
        change: -4,
        tone: "purple",
      },
    ],

    goalProgressSummary: {
      progressing: 1,
      total: 3,
      label: "1 of 3 goals is progressing",
    },

    questTypeInsights: {
      defaultView: "completed",
      defaultPeriod: "30-days",

      views: [
        {
          id: "completed",
          label: "Completed Quests",
        },
      ],

      periods: [
        {
          id: "30-days",
          label: "30 Days",
        },
      ],

      data: {
        "30-days": {
          completed: {
            total: 7,
            assignedTotal: 13,

            categories: [
              {
                id: "social",
                label: "Social Confidence",
                value: 3,
                percentage: 43,
                tone: "purple",
              },
              {
                id: "reflection",
                label: "Reflection",
                value: 2,
                percentage: 29,
                tone: "blue",
              },
              {
                id: "community",
                label: "Community",
                value: 2,
                percentage: 28,
                tone: "green",
              },
            ],

            highlights: [],
          },
        },
      },
    },

    patterns: [
      {
        id: "reduced-completion",
        icon: "!",
        tone: "orange",

        title:
          "Quest completion has been lower in the current period.",

        detail:
          "Fewer assigned quests have been completed compared with the previous period.",

        source:
          "Based on quest activity",
      },
    ],

    discussionTopics: [
      {
        id: "jamie-prompt-1",
        type: "prompt",
        typeLabel: "Therapist prompt",
        icon: "◇",
        tone: "purple",

        title:
          "Consider reviewing whether current quest difficulty remains appropriate.",

        detail:
          "Recent completion frequency has decreased.",

        source:
          "Platform-generated session preparation prompt",
      },
    ],

    permissions: {},
  },

  /* =========================================================
     CHRIS TAYLOR
  ========================================================= */
  {
    clientId: "chris-taylor",

    sinceLastSession: {
      periodLabel: "Since last session",

      summary: [
        {
          id: "quests-completed",
          icon: "✓",
          value: 0,
          label: "Quests completed",
          detail: "No recent activity",
          tone: "blue",
        },
        {
          id: "reflections",
          icon: "“",
          value: 0,
          label: "Reflections shared",
          detail: "No recent reflections",
          tone: "purple",
        },
        {
          id: "confidence",
          icon: "◇",
          value: 0,
          label: "Confidence check-ins",
          detail: "No recent check-ins",
          tone: "orange",
        },
        {
          id: "discussion",
          icon: "💬",
          value: 0,
          label: "Discussion points",
          detail: "None added",
          tone: "orange",
        },
      ],
    },

    confidenceTrend: {
      defaultPeriod: "4-weeks",

      periods: [
        {
          id: "4-weeks",
          label: "Last 4 weeks",
        },
      ],

      datasets: {
        "4-weeks": [
          {
            label: "Jul 24",
            value: 4,
          },
          {
            label: "Jul 31",
            value: 4,
          },
          {
            label: "Aug 7",
            value: 4,
          },
          {
            label: "Aug 14",
            value: 4,
          },
          {
            label: "Aug 20",
            value: 4,
          },
        ],
      },

      overallChange: 0,
      overallDirection: "stable",

      summary:
        "There is not enough recent shared activity to identify a meaningful confidence change.",
    },

    goalProgress: [
      {
        id: "planned-activity",
        label: "Planned Activity",
        progress: 35,
        change: 0,
        tone: "blue",
      },
    ],

    goalProgressSummary: {
      progressing: 0,
      total: 2,
      label: "No goals have enough recent activity to show progression",
    },

    questTypeInsights: {
      defaultView: "completed",
      defaultPeriod: "30-days",

      views: [
        {
          id: "completed",
          label: "Completed Quests",
        },
      ],

      periods: [
        {
          id: "30-days",
          label: "30 Days",
        },
      ],

      data: {
        "30-days": {
          completed: {
            total: 2,
            assignedTotal: 6,

            categories: [
              {
                id: "planned",
                label: "Planned Activities",
                value: 1,
                percentage: 50,
                tone: "purple",
              },
              {
                id: "reflection",
                label: "Reflection",
                value: 1,
                percentage: 50,
                tone: "blue",
              },
            ],

            highlights: [],
          },
        },
      },
    },

    patterns: [
      {
        id: "limited-data",
        icon: "i",
        tone: "blue",

        title:
          "Limited recent activity.",

        detail:
          "There is not enough recent shared information to identify reliable engagement patterns.",

        source:
          "Based on currently shared activity",
      },
    ],

    discussionTopics: [
      {
        id: "chris-prompt-1",
        type: "prompt",
        typeLabel: "Therapist prompt",
        icon: "◇",
        tone: "purple",

        title:
          "Consider checking whether assigned activities still feel achievable.",

        detail:
          "There has been limited quest activity during the current period.",

        source:
          "Platform-generated session preparation prompt",
      },
    ],

        permissions: {},
  },
];