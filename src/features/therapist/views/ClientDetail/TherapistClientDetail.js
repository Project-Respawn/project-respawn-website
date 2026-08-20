import { therapistDemoClients } from "../../data/therapistDemoClients.js";

export default {
  name: "TherapistClientDetail",

  data() {
    return {
      activeTab: "overview",

      tabs: [
        {
          id: "overview",
          label: "Overview",
        },
        {
          id: "quests",
          label: "Quests",
        },
        {
          id: "activity",
          label: "Activity",
        },
        {
          id: "insights",
          label: "Insights",
          premium: true,
        },
        {
          id: "reports",
          label: "Reports",
          premium: true,
        },
        {
          id: "sharing",
          label: "Sharing",
        },
      ],

      recentTimeline: [
        {
          id: 1,
          day: "SAT",
          date: "16 AUG",
          icon: "✓",
          tone: "green",
          title: 'Completed "Join a community activity"',
          detail: "Before: 4/10  •  After: 7/10",
          result: "Better than expected",
        },
        {
          id: 2,
          day: "THU",
          date: "14 AUG",
          icon: "✓",
          tone: "green",
          title: 'Completed "Start one conversation"',
          detail: "Reflection added",
        },
        {
          id: 3,
          day: "TUE",
          date: "12 AUG",
          icon: "",
          tone: "orange",
          title: "Quest skipped",
          detail: '"I didn’t feel ready."',
        },
        {
          id: 4,
          day: "MON",
          date: "11 AUG",
          icon: "",
          tone: "blue",
          title: "Reflection added",
          detail: '"I was proud I stayed for the whole event."',
        },
      ],

      currentQuests: [
        {
          id: 1,
          title: "Join a community activity",
          status: "Completed",
          completed: true,
          points: 250,
          tone: "green",
        },
        {
          id: 2,
          title: "Start one conversation",
          status: "Completed",
          completed: true,
          points: 150,
          tone: "green",
        },
        {
          id: 3,
          title: "Attend a larger group activity",
          status: "Due Friday, 22 Aug",
          completed: false,
          points: 200,
          tone: "orange",
        },
      ],

      reflections: [
        {
          id: 1,
          text:
            "I nearly cancelled, but once I joined I actually enjoyed it.",
          activity: "Join a community activity",
          date: "16 Aug",
        },
        {
          id: 2,
          text:
            "Starting the conversation was harder than I expected.",
          activity: "Start one conversation",
          date: "14 Aug",
        },
        {
          id: 3,
          text:
            "I felt less nervous than last week.",
          activity: "Confidence check-in",
          date: "11 Aug",
        },
      ],

      discussionPoints: [
        {
          id: 1,
          text:
            "I left the community event early and I'm not really sure why.",
          date: "16 Aug",
          priority: true,
        },
        {
          id: 2,
          text:
            "I keep feeling anxious before group activities.",
          date: "15 Aug",
          priority: false,
        },
        {
          id: 3,
          text:
            "I want to get better at talking to new people.",
          date: "13 Aug",
          priority: false,
        },
      ],

      sharingPermissions: [
        {
          id: "quests",
          icon: "✓",
          label: "Quest completion",
          shared: true,
          tone: "green",
        },
        {
          id: "reflections",
          icon: "💬",
          label: "Quest reflections",
          shared: true,
          tone: "orange",
        },
        {
          id: "confidence",
          icon: "◇",
          label: "Confidence check-ins",
          shared: true,
          tone: "blue",
        },
        {
          id: "activity",
          icon: "▥",
          label: "Activity trends",
          shared: true,
          tone: "blue",
        },
        {
          id: "gaming",
          icon: "⌁",
          label: "Gaming / community activity",
          shared: false,
          tone: "red",
        },
      ],
    };
  },

  computed: {
    client() {
      const clientId = this.$route.params.clientId;

      const foundClient = therapistDemoClients.find(
        (client) => client.id === clientId
      );

      if (!foundClient) {
        return null;
      }

      return {
        ...foundClient,
        firstName: foundClient.name.split(" ")[0],
      };
    },

    summaryMetrics() {
      if (!this.client) {
        return [];
      }

      return [
        {
          id: "session",
          icon: "▣",
          label: "Next Session",
          value: this.client.nextSession,
          detail: this.client.nextSessionDetail,
          tone: "purple",
        },
        {
          id: "quests",
          icon: "✓",
          label: "Active Quests",
          value:
            `${this.client.completedQuests} / ` +
            `${this.client.totalQuests}`,
          detail: "completed",
          tone: "green",
        },
        {
          id: "activity",
          icon: "▥",
          label: "Since Last Session",
          value: "5",
          detail: "7 days tracked",
          tone: "blue",
        },
        {
          id: "report",
          icon: "▤",
          label: "Report",
          value: this.client.reportReady
            ? "Ready"
            : "Basic Summary",
          detail: this.client.reportReady
            ? "View report →"
            : "Activity available",
          tone: "purple",
        },
      ];
    },

    activeTabLabel() {
      return (
        this.tabs.find(
          (tab) => tab.id === this.activeTab
        )?.label ?? "Client"
      );
    },
  },
};export default { name: 'TherapistClientDetail' };
