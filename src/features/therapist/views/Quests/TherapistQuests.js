import TherapistClientPanel from "../../components/clients/TherapistClientPanel.vue";
import TherapistClientWorkspaceNav from "../../components/clients/TherapistClientWorkspaceNav.vue";
import TherapistClientOverview from "../../components/clients/TherapistClientOverview.vue";
import TherapistInsights from "../Insights/TherapistInsights.vue";

/* =========================================================
   QUEST COMPONENTS
========================================================= */

import TherapistClientQuestList from "../../components/quests/TherapistClientQuestList.vue";
import TherapistClientQuestDetail from "../../components/quests/TherapistClientQuestDetail.vue";

/* =========================================================
   ACTIVITY COMPONENTS
========================================================= */

import TherapistClientActivitySummary from "../../components/activity/TherapistClientActivitySummary.vue";
import TherapistClientActivityFilters from "../../components/activity/TherapistClientActivityFilters.vue";
import TherapistClientActivityTimeline from "../../components/activity/TherapistClientActivityTimeline.vue";

/* =========================================================
   INSIGHTS COMPONENTS
========================================================= */

/* =========================================================
   DEMO DATA
========================================================= */

import { therapistDemoClients } from "../../data/therapistDemoClients.js";
import { therapistDemoQuests } from "../../data/therapistDemoQuests.js";
import { therapistDemoActivity } from "../../data/therapistDemoActivity.js";
import { therapistDemoInsights } from "../../data/therapistDemoInsights.js";

const DEFAULT_CLIENT_ID = "alex-morgan";

export default {
  name: "TherapistQuests",

  components: {
    /* Client workspace */
    TherapistClientPanel,
    TherapistClientWorkspaceNav,
    TherapistClientOverview,
    TherapistInsights,

    /* Quests */
    TherapistClientQuestList,
    TherapistClientQuestDetail,

    /* Activity */
    TherapistClientActivitySummary,
    TherapistClientActivityFilters,
    TherapistClientActivityTimeline,

  },

  data() {
    return {
      /* =====================================================
         CLIENT STATE
      ====================================================== */

      clients: therapistDemoClients,

      quests: therapistDemoQuests.map((quest) => ({
        ...quest,

        history: (quest.history ?? []).map((entry) =>
          Array.isArray(entry)
            ? [...entry]
            : entry
        ),
      })),

      selectedClientId: DEFAULT_CLIENT_ID,

      /* =====================================================
         WORKSPACE STATE
      ====================================================== */

      activeWorkspace: "quests",

      /* =====================================================
         QUEST STATE
      ====================================================== */

      selectedQuestId: "",

      /* =====================================================
         ACTIVITY STATE
      ====================================================== */

      activitySearch: "",
      activityFilter: "all",
      activityDateRange: "since-session",

      /* =====================================================
         INSIGHTS STATE
      ====================================================== */

      insightConfidencePeriod: "4-weeks",
      insightQuestView: "completed",
      insightQuestPeriod: "30-days",

      /* =====================================================
         DEMO NOTICE
      ====================================================== */

      notice: "",
      noticeTimer: null,
    };
  },

  computed: {
    /* =====================================================
       SELECTED CLIENT
    ====================================================== */

    selectedClient() {
      return (
        this.clients.find(
          (client) =>
            client.id === this.selectedClientId
        ) ??
        this.clients[0] ??
        null
      );
    },

    selectedClientFirstName() {
      return (
        this.selectedClient?.name?.split(" ")[0] ??
        "Client"
      );
    },

    /* =====================================================
       SELECTED CLIENT INSIGHTS
    ====================================================== */

    selectedClientInsights() {
      return (
        therapistDemoInsights.find(
          (insight) =>
            insight.clientId === this.selectedClientId
        ) ?? null
      );
    },

    /* =====================================================
       QUEST DATA
    ====================================================== */

    clientQuests() {
      return this.quests.filter(
        (quest) =>
          quest.clientId === this.selectedClientId
      );
    },

    selectedQuest() {
      return (
        this.clientQuests.find(
          (quest) =>
            quest.id === this.selectedQuestId
        ) ??
        this.clientQuests[0] ??
        null
      );
    },

    /* =====================================================
       QUEST STATISTICS
    ====================================================== */

    questStats() {
      const completedQuests =
        this.clientQuests.filter(
          (quest) =>
            quest.status === "completed"
        );

      const completedPoints =
        completedQuests.reduce(
          (total, quest) =>
            total + Number(quest.points || 0),
          0
        );

      return {
        active: this.clientQuests.filter(
          (quest) =>
            ["active", "upcoming"].includes(
              quest.status
            )
        ).length,

        completed: completedQuests.length,

        overdue: this.clientQuests.filter(
          (quest) =>
            quest.status === "overdue"
        ).length,

        completedPoints,

        totalPoints:
          this.selectedClientId === DEFAULT_CLIENT_ID
            ? 1450
            : completedPoints,
      };
    },

    /* =====================================================
       LEFT CLIENT PANEL STATS
    ====================================================== */

    clientPanelStats() {
      return {
        active: this.questStats.active,
        completed: this.questStats.completed,
        overdue: this.questStats.overdue,
      };
    },

    /* =====================================================
       QUEST SUMMARY CARDS
    ====================================================== */

    summaryCards() {
      return [
        {
          id: "active",
          icon: "✓",
          value: this.questStats.active,
          label: "Active Quests",
          detail: "Currently assigned",
          tone: "purple",
        },

        {
          id: "completed",
          icon: "✓",
          value: this.questStats.completed,
          label: "Completed This Week",
          detail:
            `+${this.questStats.completedPoints} RP earned`,
          tone: "green",
        },

        {
          id: "overdue",
          icon: "!",
          value: this.questStats.overdue,
          label: "Overdue",
          detail:
            this.questStats.overdue === 1
              ? "Needs attention"
              : "Need attention",
          tone: "orange",
        },

        {
          id: "points",
          icon: "◆",
          value: this.questStats.totalPoints,
          label: "Respawn Points Earned",
          detail: "All time",
          tone: "blue",
        },
      ];
    },

    /* =====================================================
       ACTIVITY DATA
    ====================================================== */

    clientActivity() {
      return therapistDemoActivity.filter(
        (activity) =>
          activity.clientId ===
          this.selectedClientId
      );
    },

    /* =====================================================
       ACTIVITY FILTERS
    ====================================================== */

    activityFilters() {
      const count = (type) =>
        this.clientActivity.filter(
          (activity) =>
            activity.type === type
        ).length;

      return [
        {
          id: "all",
          label: "All Activity",
          icon: "⌁",
          count: this.clientActivity.length,
        },

        {
          id: "quest",
          label: "Quests",
          icon: "✓",
          count: count("quest"),
        },

        {
          id: "reflection",
          label: "Reflections",
          icon: "“",
          count: count("reflection"),
        },

        {
          id: "confidence",
          label: "Confidence",
          icon: "◇",
          count: count("confidence"),
        },

        {
          id: "discussion",
          label: "Discussion",
          icon: "💬",
          count: count("discussion"),
        },

        {
          id: "community",
          label: "Community",
          icon: "⌁",
          count: count("community"),

          locked: this.clientActivity.some(
            (activity) =>
              activity.type === "community" &&
              activity.locked
          ),
        },
      ];
    },

    /* =====================================================
       ACTIVITY SUMMARY
    ====================================================== */

    activitySummaryCards() {
      const count = (type) =>
        this.clientActivity.filter(
          (activity) =>
            activity.type === type
        ).length;

      return [
        {
          id: "activity",
          icon: "⌁",
          value: this.clientActivity.filter(
            (activity) =>
              !activity.locked
          ).length,
          label: "Shared Activity",
          detail: "Since last session",
          tone: "purple",
        },

        {
          id: "quests",
          icon: "✓",
          value: count("quest"),
          label: "Quest Updates",
          detail: "Progress and completions",
          tone: "green",
        },

        {
          id: "reflections",
          icon: "“",
          value: count("reflection"),
          label: "Reflections",
          detail: "Shared by client",
          tone: "blue",
        },

        {
          id: "discussion",
          icon: "💬",
          value: count("discussion"),
          label: "Discussion Points",
          detail:
            `${count("confidence")} confidence check-ins`,
          tone: "orange",
        },
      ];
    },

    /* =====================================================
       FILTERED ACTIVITY
    ====================================================== */

    filteredActivity() {
      const query = this.activitySearch
        .trim()
        .toLowerCase();

      const cutoffDays = {
        "since-session": 10,
        "7-days": 7,
        "30-days": 30,
      }[this.activityDateRange];

      const cutoff = cutoffDays
        ? new Date("2026-08-20T12:00:00")
        : null;

      if (cutoff) {
        cutoff.setDate(
          cutoff.getDate() - cutoffDays
        );
      }

      return this.clientActivity
        .filter(
          (item) =>
            this.activityFilter === "all" ||
            item.type === this.activityFilter
        )

        .filter((item) => {
          if (!query) {
            return true;
          }

          const searchable = [
            item.title,
            item.detail,
            item.quest,
            item.reflection,
            item.discussionPoint,
            item.typeLabel,
            item.source,
            item.status,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(query);
        })

        .filter((item) => {
          if (!cutoff) {
            return true;
          }

          const itemDate = new Date(
            `${item.date}T12:00:00`
          );

          return itemDate >= cutoff;
        })

        .sort((a, b) => {
          const second = new Date(
            `${b.date}T${b.time || "00:00"}`
          );

          const first = new Date(
            `${a.date}T${a.time || "00:00"}`
          );

          return second - first;
        });
    },

    /* =====================================================
       GROUP ACTIVITY BY DAY
    ====================================================== */

    groupedActivity() {
      const groups = new Map();

      this.filteredActivity.forEach(
        (activity) => {
          if (!groups.has(activity.date)) {
            groups.set(activity.date, {
              date: activity.date,
              dayLabel: activity.dayLabel,
              dateLabel: activity.dateLabel,
              items: [],
            });
          }

          groups
            .get(activity.date)
            .items.push(activity);
        }
      );

      return Array.from(groups.values());
    },
  },

  watch: {
    /* =====================================================
       ROUTE → CLIENT SYNC
    ====================================================== */

    "$route.params.clientId": {
      immediate: true,

      handler(clientId) {
        const validId =
          this.clients.some(
            (client) =>
              client.id === clientId
          )
            ? clientId
            : DEFAULT_CLIENT_ID;

        this.setSelectedClient(validId);
      },
    },
  },

  methods: {
    /* =====================================================
       CLIENT SELECTION
    ====================================================== */

    setSelectedClient(clientId) {
      const exists = this.clients.some(
        (client) =>
          client.id === clientId
      );

      if (!exists) {
        return;
      }

      this.selectedClientId = clientId;

      /* -----------------------------------------------------
         SELECT DEFAULT QUEST
      ----------------------------------------------------- */

      const quests = this.quests.filter(
        (quest) =>
          quest.clientId === clientId
      );

      const preferredQuest =
        quests.find(
          (quest) =>
            quest.status === "active"
        ) ??
        quests.find(
          (quest) =>
            quest.status === "overdue"
        ) ??
        quests.find(
          (quest) =>
            quest.status === "upcoming"
        ) ??
        quests[0] ??
        null;

      this.selectedQuestId =
        preferredQuest?.id ?? "";

      /* -----------------------------------------------------
         RESET ACTIVITY
      ----------------------------------------------------- */

      this.activitySearch = "";
      this.activityFilter = "all";
      this.activityDateRange =
        "since-session";

      /* -----------------------------------------------------
         RESET INSIGHTS FOR SELECTED CLIENT

         This matters because different demo clients currently
         expose different Insight periods and chart views.
      ----------------------------------------------------- */

      const insights =
        therapistDemoInsights.find(
          (insight) =>
            insight.clientId === clientId
        );

      this.insightConfidencePeriod =
        insights?.confidenceTrend?.defaultPeriod ??
        "4-weeks";

      this.insightQuestView =
        insights?.questTypeInsights?.defaultView ??
        "completed";

      this.insightQuestPeriod =
        insights?.questTypeInsights?.defaultPeriod ??
        "30-days";
    },

    /* =====================================================
       CLIENT SWITCHING
    ====================================================== */

    handleClientSwitch(clientId) {
      const exists = this.clients.some(
        (client) =>
          client.id === clientId
      );

      if (!exists) {
        return;
      }

      this.setSelectedClient(clientId);

      /*
       Keep the current workspace selected.
       Only update the client route.
      */

      if (
        this.$route.params.clientId !== clientId
      ) {
        this.$router.push(
          `/therapist/clients/${clientId}`
        );
      }

      const client = this.clients.find(
        (item) =>
          item.id === clientId
      );

      this.showNotice(
        `Switched to ${client?.name ?? "client"}.`
      );
    },

    /* =====================================================
       WORKSPACE NAVIGATION
    ====================================================== */

    handleWorkspaceChange(section) {
      const allowedSections = [
        "overview",
        "quests",
        "activity",
        "insights",
        "reports",
        "sharing",
      ];

      if (
        !allowedSections.includes(section)
      ) {
        return;
      }

      this.activeWorkspace = section;
    },

    /* =====================================================
       QUEST SELECTION
    ====================================================== */

    handleQuestSelect(questId) {
      const exists =
        this.clientQuests.some(
          (quest) =>
            quest.id === questId
        );

      if (!exists) {
        return;
      }

      this.selectedQuestId = questId;
    },

    /* =====================================================
       ASSIGN QUEST
    ====================================================== */

    handleAssignQuest() {
      this.$router.push({
        path: "/therapist/quests/new",

        query: {
          client: this.selectedClientId,
        },
      });
    },

    /* =====================================================
       QUEST TEMPLATES
    ====================================================== */

    handleBrowseTemplates() {
      this.showNotice(
        "Quest templates are demo-only for now."
      );
    },

    /* =====================================================
       ACCESS / SHARING
    ====================================================== */

    handleRequestAccess() {
      this.showNotice(
        `Access request prepared for ${this.selectedClientFirstName}. No permissions were changed.`
      );
    },

    handleActivityPermissionRequest(
      permission
    ) {
      const label =
        permission === "community-activity"
          ? "community and gaming activity"
          : "additional activity";

      this.showNotice(
        `Request to view ${label} prepared for ${this.selectedClientFirstName}.`
      );
    },

    /* =====================================================
       QUEST ACTIONS
    ====================================================== */

    handleQuestAction(action) {
      const quest = this.quests.find(
        (item) =>
          item.id ===
          this.selectedQuest?.id
      );

      if (!quest) {
        return;
      }

      if (action === "complete") {
        quest.status = "completed";
        quest.statusLabel = "Completed";
        quest.progress = "Completed";

        this.showNotice(
          `"${quest.title}" marked complete for demo purposes.`
        );

        return;
      }

      if (action === "pause") {
        quest.statusLabel = "Paused";
        quest.progress = "Paused";

        this.showNotice(
          `"${quest.title}" paused for demo purposes.`
        );

        return;
      }

      if (action === "end") {
        quest.statusLabel = "Ended";
        quest.progress = "Ended";

        this.showNotice(
          `"${quest.title}" ended for demo purposes.`
        );

        return;
      }

      if (action === "reflection") {
        this.showNotice(
          "Client reflections are demo-only."
        );

        return;
      }

      if (action === "edit") {
        this.showNotice(
          "Quest editing is demo-only."
        );

        return;
      }

      this.showNotice(
        "This action is demo-only."
      );
    },

    /* =====================================================
       NOTICE
    ====================================================== */

    showNotice(message) {
      this.notice = message;

      if (this.noticeTimer) {
        window.clearTimeout(
          this.noticeTimer
        );
      }

      this.noticeTimer =
        window.setTimeout(() => {
          this.notice = "";
          this.noticeTimer = null;
        }, 3000);
    },
  },

  /* =====================================================
     CLEANUP
  ====================================================== */

  beforeUnmount() {
    if (this.noticeTimer) {
      window.clearTimeout(
        this.noticeTimer
      );
    }
  },
};
