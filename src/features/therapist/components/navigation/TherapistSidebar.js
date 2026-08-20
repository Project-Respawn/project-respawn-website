import { therapistDemoAccount } from "../../data/therapistDemoAccount.js";

export default {
  name: "TherapistSidebar",

  data() {
    return {
      account: therapistDemoAccount,
      activeQuestCount: 18,
      reportCount: 3,
    };
  },

  computed: {
    therapist() {
      return this.account?.profile ?? {
        displayName: "Therapist",
        initials: "TH",
        role: "Therapist",
      };
    },

    subscription() {
      return this.account?.subscription ?? {};
    },

    isTrial() {
      return this.subscription.tier === "trial";
    },

    isFree() {
      return this.subscription.tier === "free";
    },

    isPremium() {
      return this.subscription.tier === "premium";
    },

    hasPremiumAccess() {
      return this.isTrial || this.isPremium;
    },

    trialDaysRemaining() {
      return this.subscription.trial?.daysRemaining ?? 0;
    },

    premiumPrice() {
      return Number(
        this.subscription.premium?.price ?? 4.99
      ).toFixed(2);
    },
  },
};