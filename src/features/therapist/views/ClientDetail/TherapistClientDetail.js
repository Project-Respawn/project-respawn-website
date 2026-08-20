import { therapistDemoClients } from "../../data/therapistDemoClients.js";
import { therapistDemoQuests } from "../../data/therapistDemoQuests.js";
import TherapistClientPanel from "../../components/clients/TherapistClientPanel.vue";
import TherapistClientWorkspaceNav from "../../components/clients/TherapistClientWorkspaceNav.vue";
import TherapistClientOverview from "../../components/clients/TherapistClientOverview.vue";
import TherapistClientQuestList from "../../components/quests/TherapistClientQuestList.vue";
import TherapistClientQuestDetail from "../../components/quests/TherapistClientQuestDetail.vue";

export default {
  name: "TherapistClientDetail",
  components: { TherapistClientPanel, TherapistClientWorkspaceNav, TherapistClientOverview, TherapistClientQuestList, TherapistClientQuestDetail },
  data() {
    return { clients: therapistDemoClients, quests: therapistDemoQuests.map((quest) => ({ ...quest, history: quest.history.map((entry) => [...entry]) })), activeTab: "quests", selectedQuestId: null };
  },
  computed: {
    client() { return this.clients.find((client) => client.id === this.$route.params.clientId) ?? null; },
    clientQuests() { return this.quests.filter((quest) => quest.clientId === this.client?.id); },
    selectedQuest() { return this.clientQuests.find((quest) => quest.id === this.selectedQuestId) ?? this.clientQuests[0] ?? null; },
    questStats() {
      const completed = this.clientQuests.filter((quest) => quest.status === "completed");
      return { active: this.clientQuests.filter((quest) => ["active", "upcoming"].includes(quest.status)).length, completed: completed.length, overdue: this.clientQuests.filter((quest) => quest.status === "overdue").length, completedPoints: completed.reduce((total, quest) => total + quest.points, 0), totalPoints: this.client?.id === "alex-morgan" ? 1450 : completed.reduce((total, quest) => total + quest.points, 0) };
    },
    activeTabLabel() { return { overview: "Overview", quests: "Quests", activity: "Activity", insights: "Insights", reports: "Reports", sharing: "Sharing" }[this.activeTab]; },
  },
  watch: { clientQuests: { immediate: true, handler(quests) { this.selectedQuestId = quests[0]?.id ?? null; } } },
  methods: {
    switchClient(clientId) { this.$router.push(`/therapist/clients/${clientId}`); },
    goToAssignQuest() { this.$router.push(`/therapist/quests/new?client=${this.client.id}`); },
    demoNotice(feature) { window.alert(`${feature} is demo-only and will be connected later.`); },
    requestAccess() { window.alert("Access request sent to the client. No permissions were changed."); },
    handleQuestAction(action) {
      const quest = this.quests.find((item) => item.id === this.selectedQuest?.id); if (!quest) return;
      if (action === "complete") { quest.status = "completed"; quest.statusLabel = "Completed"; quest.progress = "Completed"; quest.progressNotes = "Marked complete in this demo"; }
      else if (action === "pause") { quest.statusLabel = "Paused"; quest.progress = "Paused"; }
      else if (action === "end") { quest.statusLabel = "Ended"; quest.progress = "Ended"; }
      else this.demoNotice(action === "reflection" ? "Client reflections" : "Quest editing");
    },
  },
};
