import TherapistClientPanel from "../../components/clients/TherapistClientPanel.vue";
import TherapistClientWorkspaceNav from "../../components/clients/TherapistClientWorkspaceNav.vue";

import TherapistClientQuestList from "../../components/quests/TherapistClientQuestList.vue";
import TherapistClientQuestDetail from "../../components/quests/TherapistClientQuestDetail.vue";

import TherapistClientActivitySummary from "../../components/activity/TherapistClientActivitySummary.vue";
import TherapistClientActivityFilters from "../../components/activity/TherapistClientActivityFilters.vue";
import TherapistClientActivityTimeline from "../../components/activity/TherapistClientActivityTimeline.vue";

import { therapistDemoClients } from "../../data/therapistDemoClients.js";
import { therapistDemoQuests } from "../../data/therapistDemoQuests.js";
import { therapistDemoActivity } from "../../data/therapistDemoActivity.js";

export default {
  name: "TherapistQuests",

  components: {
    TherapistClientPanel,
    TherapistClientWorkspaceNav,

    TherapistClientQuestList,
    TherapistClientQuestDetail,

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
      selectedClientId: "alex-morgan",

      /* =====================================================
         CLIENT WORKSPACE STATE
      ====================================================== */

      activeWorkspace: "quests",

      /* =====================================================
         QUEST STATE
      ====================================================== */

      selectedQuestId: "alex-group-activity",

      /* =====================================================
         ACTIVITY STATE
      ====================================================== */

      activitySearch: "",
      activityFilter: "all",
      activityDateRange: "since-session",

      /* =====================================================
         DEMO UI STATE
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
          (client) => client.id === this.selectedClientId
        ) ??
        this.clients[0] ??
        null
      );
    },

    selectedClientFirstName() {
      return this.selectedClient?.name?.split(" ")[0] ?? "Client";
    },

    /* =====================================================
       QUEST DATA
    ====================================================== */

    clientQuests() {
      return therapistDemoQuests.filter(
        (quest) => quest.clientId === this.selectedClientId
      );
    },

    selectedQuest() {
      return (
        this.clientQuests.find(
          (quest) => quest.id === this.selectedQuestId
        ) ??
        this.clientQuests[0] ??
        null
      );
    },

    /* =====================================================
       QUEST STATISTICS
    ====================================================== */

    questStats() {
      const quests = this.clientQuests;

      const active = quests.filter((quest) =>
        ["active", "upcoming"].includes(quest.status)
      ).length;

      const completed = quests.filter(
        (quest) => quest.status === "completed"
      ).length;

      const overdue = quests.filter(
        (quest) => quest.status === "overdue"
      ).length;

      const points = quests
        .filter((quest) => quest.status === "completed")
        .reduce(
          (total, quest) => total + Number(quest.points || 0),
          0
        );

      return {
        active,
        completed,
        overdue,
        points,
      };
    },

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
          detail: "Recent completions",
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
          value: this.questStats.points,
          label: "Respawn Points Earned",
          detail: "From completed quests",
          tone: "blue",
        },
      ];
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
       CLIENT ACTIVITY
    ====================================================== */

    clientActivity() {
      return therapistDemoActivity.filter(
        (activity) =>
          activity.clientId === this.selectedClientId
      );
    },

    /* =====================================================
       ACTIVITY FILTER DEFINITIONS
    ====================================================== */

    activityFilters() {
      const countType = (type) =>
        this.clientActivity.filter(
          (activity) => activity.type === type
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
          count: countType("quest"),
        },
        {
          id: "reflection",
          label: "Reflections",
          icon: "“",
          count: countType("reflection"),
        },
        {
          id: "confidence",
          label: "Confidence",
          icon: "◇",
          count: countType("confidence"),
        },
        {
          id: "discussion",
          label: "Discussion",
          icon: "💬",
          count: countType("discussion"),
        },
        {
          id: "community",
          label: "Community",
          icon: "⌁",
          count: countType("community"),
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
      const activities = this.clientActivity;

      const questEvents = activities.filter(
        (activity) => activity.type === "quest"
      ).length;

      const reflections = activities.filter(
        (activity) => activity.type === "reflection"
      ).length;

      const confidence = activities.filter(
        (activity) => activity.type === "confidence"
      ).length;

      const discussion = activities.filter(
        (activity) => activity.type === "discussion"
      ).length;

      return [
        {
          id: "activity",
          icon: "⌁",
          value: activities.filter(
            (activity) => !activity.locked
          ).length,
          label: "Shared Activity",
          detail: "Since last session",
          tone: "purple",
        },
        {
          id: "quests",
          icon: "✓",
          value: questEvents,
          label: "Quest Updates",
          detail: "Progress and completions",
          tone: "green",
        },
        {
          id: "reflections",
          icon: "“",
          value: reflections,
          label: "Reflections",
          detail: "Shared by client",
          tone: "blue",
        },
        {
          id: "discussion",
          icon: "💬",
          value: discussion,
          label: "Discussion Points",
          detail:
            confidence > 0
              ? `${confidence} confidence check-ins`
              : "For next session",
          tone: "orange",
        },
      ];
    },

    /* =====================================================
       FILTERED ACTIVITY
    ====================================================== */

    filteredActivity() {
      let activity = [...this.clientActivity];

      /* -------------------------
         TYPE FILTER
      ------------------------- */

      if (this.activityFilter !== "all") {
        activity = activity.filter(
          (item) => item.type === this.activityFilter
        );
      }

      /* -------------------------
         SEARCH
      ------------------------- */

      const search = this.activitySearch
        .trim()
        .toLowerCase();

      if (search) {
        activity = activity.filter((item) => {
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

          return searchable.includes(search);
        });
      }

      /* -------------------------
         DATE RANGE
      ------------------------- */

      const today = new Date("2026-08-20T12:00:00");

      let cutoff = null;

      if (this.activityDateRange === "since-session") {
        cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() - 10);
      }

      if (this.activityDateRange === "7-days") {
        cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() - 7);
      }

      if (this.activityDateRange === "30-days") {
        cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() - 30);
      }

      if (cutoff) {
        activity = activity.filter((item) => {
          const date = new Date(
            `${item.date}T12:00:00`
          );

          return date >= cutoff;
        });
      }

      /* -------------------------
         NEWEST FIRST
      ------------------------- */

      return activity.sort((a, b) => {
        const first = new Date(
          `${a.date}T${a.time || "00:00"}`
        );

        const second = new Date(
          `${b.date}T${b.time || "00:00"}`
        );

        return second - first;
      });
    },

    /* =====================================================
       GROUP ACTIVITY BY DAY
    ====================================================== */

    groupedActivity() {
      const groups = new Map();

      this.filteredActivity.forEach((activity) => {
        if (!groups.has(activity.date)) {
          groups.set(activity.date, {
            date: activity.date,
            dayLabel: activity.dayLabel,
            dateLabel: activity.dateLabel,
            items: [],
          });
        }

        groups.get(activity.date).items.push(activity);
      });

      return Array.from(groups.values());
    },
  },

  watch: {
    /* =====================================================
       RESET CLIENT-SPECIFIC STATE
    ====================================================== */

    selectedClientId() {
      this.selectDefaultQuestForClient();

      this.activitySearch = "";
      this.activityFilter = "all";
      this.activityDateRange = "since-session";
    },
  },

  methods: {
    /* =====================================================
       CLIENT SWITCHING
    ====================================================== */

    handleClientSwitch(clientId) {
      const exists = this.clients.some(
        (client) => client.id === clientId
      );

      if (!exists) {
        return;
      }

      this.selectedClientId = clientId;

      const selectedClient = this.clients.find(
        (client) => client.id === clientId
      );

      /*
       IMPORTANT:
       Do not change activeWorkspace here.

       If the therapist is viewing Activity and switches
       client, they stay in Activity.
      */

      this.showNotice(
        `Switched to ${selectedClient?.name ?? "client"}.`
      );
    },

    /* =====================================================
       DEFAULT QUEST
    ====================================================== */

    selectDefaultQuestForClient() {
      const quests = therapistDemoQuests.filter(
        (quest) => quest.clientId === this.selectedClientId
      );

      const preferredQuest =
        quests.find((quest) => quest.status === "active") ??
        quests.find((quest) => quest.status === "overdue") ??
        quests.find((quest) => quest.status === "upcoming") ??
        quests[0] ??
        null;

      this.selectedQuestId = preferredQuest?.id ?? "";
    },

    /* =====================================================
       QUEST SELECTION
    ====================================================== */

    handleQuestSelect(questId) {
      const exists = this.clientQuests.some(
        (quest) => quest.id === questId
      );

      if (!exists) {
        return;
      }

      this.selectedQuestId = questId;
    },

    /* =====================================================
       WORKSPACE NAVIGATION
    ====================================================== */

    handleWorkspaceChange(section) {
      if (section === "overview") {
        this.$router.push(
          `/therapist/clients/${this.selectedClientId}`
        );

        return;
      }

      const allowedSections = [
        "quests",
        "activity",
        "insights",
        "reports",
        "sharing",
      ];

      if (allowedSections.includes(section)) {
        this.activeWorkspace = section;
      }
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
        "Quest templates will be connected to the quest builder."
      );
    },

    /* =====================================================
       CLIENT OVERVIEW
    ====================================================== */

    handleClientOverview() {
      this.$router.push(
        `/therapist/clients/${this.selectedClientId}`
      );
    },

    /* =====================================================
       SHARING / PERMISSIONS
    ====================================================== */

    handleRequestAccess() {
      this.showNotice(
        `Permission request flow opened for ${this.selectedClientFirstName}.`
      );
    },

    handleActivityPermissionRequest(permission) {
      const permissionName =
        permission === "community-activity"
          ? "community and gaming activity"
          : "additional activity";

      this.showNotice(
        `Request to view ${permissionName} prepared for ${this.selectedClientFirstName}.`
      );
    },

    /* =====================================================
       QUEST ACTIONS
    ====================================================== */

    handleQuestAction(action) {
      if (!this.selectedQuest) {
        return;
      }

      const questName = this.selectedQuest.title;

      switch (action) {
        case "complete":
          this.showNotice(
            `"${questName}" marked complete for demo purposes.`
          );
          break;

        case "pause":
          this.showNotice(
            `"${questName}" paused for demo purposes.`
          );
          break;

        case "edit":
          this.showNotice(
            `Editing "${questName}" will connect to the quest builder.`
          );
          break;

        case "end":
          this.showNotice(
            `"${questName}" ended for demo purposes.`
          );
          break;

        case "reflection":
          this.showNotice(
            `Reflection tools opened for "${questName}".`
          );
          break;

        default:
          this.showNotice(
            `Demo action selected for "${questName}".`
          );
      }
    },

    /* =====================================================
       DEMO NOTICE
    ====================================================== */

    showNotice(message) {
      this.notice = message;

      if (this.noticeTimer) {
        window.clearTimeout(this.noticeTimer);
      }

      this.noticeTimer = window.setTimeout(() => {
        this.notice = "";
        this.noticeTimer = null;
      }, 3200);
    },
  },

  /* =====================================================
     CLEANUP
  ====================================================== */

  beforeUnmount() {
    if (this.noticeTimer) {
      window.clearTimeout(this.noticeTimer);
    }
  },
};