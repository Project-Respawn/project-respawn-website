import TherapistLayout from "./layouts/TherapistLayout/TherapistLayout.vue";
import TherapistDashboard from "./views/TherapistDashboard/TherapistDashboard.vue";
import TherapistClients from "./views/Clients/TherapistClients.vue";
import TherapistQuests from "./views/Quests/TherapistQuests.vue";
import TherapistQuestBuilder from "./views/QuestBuilder/TherapistQuestBuilder.vue";
import TherapistInsights from "./views/Insights/TherapistInsights.vue";
import TherapistReports from "./views/Reports/TherapistReports.vue";
import TherapistSettings from "./views/Settings/TherapistSettings.vue";

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