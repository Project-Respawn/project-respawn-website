import { computed } from "vue";
import { useAuth } from "../../composables/useAuth.js";

export default {
  name: "UserHomepage",
  setup() {
    const { displayName, email } = useAuth();

    const topNavItems = [
      { label: "Home", to: "/home", comingSoon: false },
      { label: "Forums", to: "/forum", comingSoon: false },
      { label: "Profile", to: "/account", comingSoon: false },
      { label: "Quests", to: "/home", comingSoon: true },
      { label: "Friends", to: "/home", comingSoon: true },
      { label: "Events", to: "/events", comingSoon: false },
      { label: "Trainer Hub", to: "/trainer", comingSoon: true },
      { label: "Creator Tools", to: "/creator-tools", comingSoon: true },
    ];

    const forumHighlights = [
      {
        label: "Featured section",
        title: "Feature ideas",
        description: "A place for members to suggest improvements and help shape what gets built next.",
        to: "/forum",
      },
      {
        label: "Community space",
        title: "Discord and Twitch discussions",
        description: "Explore conversations around stream growth, communities, and connected platforms.",
        to: "/forum",
      },
      {
        label: "Support area",
        title: "Bug reports and updates",
        description: "See what is changing across the platform and where members can report issues.",
        to: "/forum",
      },
    ];

    const quickActions = [
      {
        icon: "👤",
        title: "Edit your profile",
        description: "Update your profile modules, text sections, and public visibility settings.",
        to: "/account",
      },
      {
        icon: "💬",
        title: "Open the forums",
        description: "Jump back into the latest community discussions and pinned posts.",
        to: "/forum",
      },
      {
        icon: "📅",
        title: "Check events",
        description: "See what events are already live and what the platform is building toward.",
        to: "/events",
      },
      {
        icon: "🎥",
        title: "Open Creator Tools",
        description: "Manage creator channels, bots, integrations, and upcoming creator features.",
        to: "/creator-tools",
      },
    ];

    const roadmapItems = [
      {
        title: "Creature-focused homepage modules",
        description: "Your chosen creature will eventually shape the atmosphere and progress cues of this space.",
      },
      {
        title: "Quest tracking and rewards",
        description: "Active quests, streaks, and progress rewards will live here as the system expands.",
      },
      {
        title: "Social suggestions",
        description: "Later versions can surface recommended friends, activities, and shared interests.",
      },
    ];

    const exploreLinks = [
      { label: "Visit forums", to: "/forum" },
      { label: "Open your profile", to: "/account" },
      { label: "View events", to: "/events" },
      { label: "Browse merch", to: "/merch" },
    ];

    const displayLabel = computed(() => {
      return displayName.value?.trim() || email.value?.split("@")[0] || "";
    });

    const profileInitials = computed(() => {
      const source = displayLabel.value || email.value || "";
      if (!source) return "?";
      const parts = source.trim().split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return source.slice(0, 2).toUpperCase();
    });

    const profileCompletion = computed(() => {
      let score = 45;
      if (displayName.value?.trim()) score += 25;
      if (email.value?.trim()) score += 15;
      return Math.min(score, 100);
    });

    return {
      displayLabel,
      exploreLinks,
      forumHighlights,
      profileCompletion,
      profileInitials,
      quickActions,
      roadmapItems,
      topNavItems,
    };
  },
};
