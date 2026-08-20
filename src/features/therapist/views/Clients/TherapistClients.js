import { therapistDemoAccount } from "../../data/therapistDemoAccount.js";
import { therapistDemoClients } from "../../data/therapistDemoClients.js";

export default {
  name: "TherapistClients",

  data() {
    return {
      account: therapistDemoAccount,
      clients: therapistDemoClients,

      searchQuery: "",
      activeFilter: "all",
      sortBy: "next-session",

      filters: [
        {
          id: "all",
          label: "All Clients",
        },
        {
          id: "session-soon",
          label: "Session Soon",
        },
        {
          id: "needs-attention",
          label: "Needs Attention",
        },
        {
          id: "report-ready",
          label: "Report Ready",
          premium: true,
        },
        {
          id: "no-recent-activity",
          label: "No Recent Activity",
        },
      ],
    };
  },

  computed: {
    subscription() {
      return this.account?.subscription ?? {};
    },

    hasPremiumAccess() {
      return (
        this.subscription.tier === "trial" ||
        this.subscription.tier === "premium"
      );
    },

    summaryMetrics() {
      return [
        {
          id: "clients",
          icon: "👥",
          value: this.clients.length,
          label: "Active Clients",
          detail: "+2 this month",
          tone: "purple",
        },
        {
          id: "sessions",
          icon: "▣",
          value: 9,
          label: "Sessions This Week",
          detail: "View schedule →",
          tone: "blue",
        },
        {
          id: "attention",
          icon: "!",
          value: this.clients.filter(
            (client) => client.needsAttention
          ).length,
          label: "Need Attention",
          detail: "View clients",
          tone: "orange",
        },
        {
          id: "reports",
          icon: "▤",
          value: this.clients.filter(
            (client) => client.reportReady
          ).length,
          label: "Reports Ready",
          detail: "View reports →",
          tone: "purple",
          premium: true,
        },
      ];
    },

    filteredClients() {
      let result = [...this.clients];

      const query = this.searchQuery.toLowerCase();

      if (query) {
        result = result.filter((client) =>
          client.name.toLowerCase().includes(query)
        );
      }

      if (this.activeFilter === "session-soon") {
        result = result.filter((client) => client.sessionSoon);
      }

      if (this.activeFilter === "needs-attention") {
        result = result.filter((client) => client.needsAttention);
      }

      if (this.activeFilter === "report-ready") {
        result = result.filter((client) => client.reportReady);
      }

      if (this.activeFilter === "no-recent-activity") {
        result = result.filter((client) => client.noRecentActivity);
      }

      if (this.sortBy === "name") {
        result.sort((a, b) => a.name.localeCompare(b.name));
      }

      if (this.sortBy === "recent-activity") {
        result.sort(
          (a, b) =>
            a.recentActivityOrder - b.recentActivityOrder
        );
      }

      if (this.sortBy === "next-session") {
        result.sort(
          (a, b) =>
            a.nextSessionOrder - b.nextSessionOrder
        );
      }

      return result;
    },
  },

  methods: {
    handleConnectClient() {
      // Demo only.
      // Later this should open the real client connection flow.
      window.alert(
        "Client connection flow will be added later."
      );
    },
  },
};export default { name: 'TherapistClients' };
