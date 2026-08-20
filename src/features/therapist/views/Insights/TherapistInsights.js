import TherapistSinceLastSession from "../../components/insights/TherapistSinceLastSession.vue";
import TherapistConfidenceTrend from "../../components/insights/TherapistConfidenceTrend.vue";
import TherapistGoalProgress from "../../components/insights/TherapistGoalProgress.vue";
import TherapistInteractionBreakdown from "../../components/insights/TherapistInteractionBreakdown.vue";
import TherapistPatternSummary from "../../components/insights/TherapistPatternSummary.vue";
import TherapistDiscussionTopics from "../../components/insights/TherapistDiscussionTopics.vue";
import { therapistDemoClients } from "../../data/therapistDemoClients.js";
import { therapistDemoInsights } from "../../data/therapistDemoInsights.js";

const defaultClient = therapistDemoClients[0] ?? { name: "Client" };
const defaultInsights = therapistDemoInsights.find(
  (insight) => insight.clientId === defaultClient.id
) ?? null;

export default {
  name: "TherapistInsights",
  components: {
    TherapistSinceLastSession,
    TherapistConfidenceTrend,
    TherapistGoalProgress,
    TherapistInteractionBreakdown,
    TherapistPatternSummary,
    TherapistDiscussionTopics,
  },
  props: {
    client: { type: Object, default: () => defaultClient },
    clientFirstName: {
      type: String,
      default: () => defaultClient.name?.split(" ")[0] ?? "Client",
    },
    insights: { type: Object, default: () => defaultInsights },
    confidencePeriod: {
      type: String,
      default: () => defaultInsights?.confidenceTrend?.defaultPeriod ?? "4-weeks",
    },
    questView: {
      type: String,
      default: () => defaultInsights?.questTypeInsights?.defaultView ?? "completed",
    },
    questPeriod: {
      type: String,
      default: () => defaultInsights?.questTypeInsights?.defaultPeriod ?? "30-days",
    },
  },
  emits: [
    "update:confidencePeriod",
    "update:questView",
    "update:questPeriod",
    "navigate",
    "request-access",
  ],
};
