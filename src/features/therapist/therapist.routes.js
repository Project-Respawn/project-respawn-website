const TherapistLayout = () => import("./layouts/TherapistLayout/TherapistLayout.vue");
const TherapistDashboard = () => import("./views/TherapistDashboard/TherapistDashboard.vue");
const TherapistClients = () => import("./views/Clients/TherapistClients.vue");
const TherapistQuests = () => import("./views/Quests/TherapistQuests.vue");
const TherapistQuestBuilder = () => import("./views/QuestBuilder/TherapistQuestBuilder.vue");
const TherapistInsights = () => import("./views/Insights/TherapistInsights.vue");
const TherapistReports = () => import("./views/Reports/TherapistReports.vue");
const TherapistSettings = () => import("./views/Settings/TherapistSettings.vue");

const therapistRoutes = [
  {
    path: "/therapist",
    component: TherapistLayout,

    children: [
      /* =====================================================
         DASHBOARD
      ====================================================== */

      {
        path: "",
        name: "TherapistDashboard",
        component: TherapistDashboard,
      },

      /* =====================================================
         CLIENTS
      ====================================================== */

      {
        path: "clients",
        name: "TherapistClients",
        component: TherapistClients,
      },

      /*
       * The client workspace now uses TherapistQuests.
       *
       * TherapistQuests contains:
       * - Overview
       * - Quests
       * - Activity
       * - Insights
       * - Reports
       * - Sharing
       *
       * When a clientId is present, the workspace should load
       * that client's data.
       */
      {
        path: "clients/:clientId",
        name: "TherapistClientWorkspace",
        component: TherapistQuests,
      },

      /* =====================================================
         QUESTS
      ====================================================== */

      {
        path: "quests",
        name: "TherapistQuests",
        component: TherapistQuests,
      },

      {
        path: "quests/new",
        name: "TherapistQuestBuilder",
        component: TherapistQuestBuilder,
      },

      /*
       * Legacy/client-specific quest URL.
       *
       * Keep this temporarily so existing links do not break.
       * It loads the same workspace.
       */
      {
        path: "clients/:clientId/quests",
        name: "TherapistClientQuests",
        component: TherapistQuests,
      },

      /* =====================================================
         INSIGHTS
      ====================================================== */

      {
        path: "insights",
        name: "TherapistInsights",
        component: TherapistInsights,
      },

      {
        path: "clients/:clientId/insights",
        name: "TherapistClientInsights",
        component: TherapistInsights,
      },

      /* =====================================================
         REPORTS
      ====================================================== */

      {
        path: "reports",
        name: "TherapistReports",
        component: TherapistReports,
      },

      {
        path: "clients/:clientId/reports",
        name: "TherapistClientReports",
        component: TherapistReports,
      },

      /* =====================================================
         SETTINGS
      ====================================================== */

      {
        path: "settings",
        name: "TherapistSettings",
        component: TherapistSettings,
      },
    ],
  },
];

export default therapistRoutes;