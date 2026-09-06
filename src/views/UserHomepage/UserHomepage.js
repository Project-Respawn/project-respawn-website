// src/views/UserHomepage/UserHomepage.js

import {
  computed,
  onMounted,
  ref,
} from "vue";

import { useAuth } from "../../composables/useAuth.js";
import { refreshAccessContext } from "../../composables/useAccessContext.js";
import { getTeamHub, listMyTeams, loadBoundedPages } from "../../features/Team Hub/teamHub.service.js";
import { buildTeamHubShortcuts } from "../../features/Team Hub/teamHubDashboard.js";

export default {
  name: "UserHomepage",

  setup() {
    // ============================================================
    // AUTHENTICATED USER
    // ============================================================

    const {
      displayName,
      email,
    } = useAuth();

    // ============================================================
    // ACCESS CONTEXT
    // ============================================================

    const userGroups = ref([]);
    const accessReady = ref(false);
    const teamHubLoading = ref(true);
    const teamHubError = ref("");
    const teamHubMemberships = ref([]);

    // ------------------------------------------------------------
    // NORMALISE GROUP NAMES
    //
    // Makes comparisons case-insensitive and tolerant of spaces,
    // hyphens, and underscores.
    // ------------------------------------------------------------

    const normaliseGroup = (group) => {
      return String(group || "")
        .trim()
        .toLowerCase()
        .replace(/[\s_-]/g, "");
    };

    // ============================================================
    // COGNITO GROUP DEFINITIONS
    // ============================================================

    // Admin-level users see every restricted hub.
    const PRIVILEGED_GROUPS = [
      "Admin",
      "SuperAdmin",
      "Staff",
    ];

    // Specific Project Respawn access groups.
    const STREAMING_PARTNER_GROUP = "StreamingPartner";
    const TRAINER_GROUP = "Trainer";
    const AFFILIATE_PARTNER_GROUP = "AffiliatePartner";
    const THERAPIST_GROUP = "Therapist";

    // ============================================================
    // NORMALISED USER GROUPS
    // ============================================================

    const normalisedUserGroups = computed(() => {
      return userGroups.value.map(normaliseGroup);
    });

    // ============================================================
    // GROUP HELPERS
    // ============================================================

    const hasGroup = (group) => {
      return normalisedUserGroups.value.includes(
        normaliseGroup(group)
      );
    };

    const hasAnyGroup = (groups) => {
      return groups.some((group) =>
        hasGroup(group)
      );
    };

    // ============================================================
    // PRIVILEGED ACCESS
    // Admin / SuperAdmin / Staff
    // ============================================================

    const hasFullHubAccess = computed(() => {
      return hasAnyGroup(PRIVILEGED_GROUPS);
    });

    // ============================================================
    // CREATOR TOOLS ACCESS
    //
    // Admin / SuperAdmin / Staff
    // OR
    // StreamingPartner
    // ============================================================

    const canAccessCreatorTools = computed(() => {
      return (
        hasFullHubAccess.value ||
        hasGroup(STREAMING_PARTNER_GROUP)
      );
    });

    // ============================================================
    // TRAINER HUB ACCESS
    //
    // Admin / SuperAdmin / Staff
    // OR
    // Trainer
    // ============================================================

    const canAccessTrainerHub = computed(() => {
      return (
        hasFullHubAccess.value ||
        hasGroup(TRAINER_GROUP)
      );
    });

    // ============================================================
    // PARTNER HUB ACCESS
    //
    // Admin / SuperAdmin / Staff
    // OR
    // AffiliatePartner
    // ============================================================

    const canAccessPartnerHub = computed(() => {
      return (
        hasFullHubAccess.value ||
        hasGroup(AFFILIATE_PARTNER_GROUP)
      );
    });

    // ============================================================
    // THERAPIST HUB ACCESS
    //
    // Admin / SuperAdmin / Staff
    // OR
    // Therapist
    // ============================================================

    const canAccessTherapistHub = computed(() => {
      return (
        hasFullHubAccess.value ||
        hasGroup(THERAPIST_GROUP)
      );
    });

    // ============================================================
    // LOAD ACCESS CONTEXT
    // ============================================================

    const loadAccessContext = async () => {
      try {
        const context = await refreshAccessContext();

        userGroups.value = Array.isArray(context?.groups)
          ? context.groups
          : [];
      } catch (error) {
        console.error(
          "Unable to load homepage access context:",
          error
        );

        // Fail closed:
        // restricted hubs remain hidden if access cannot be verified.
        userGroups.value = [];
      } finally {
        accessReady.value = true;
      }
    };

    onMounted(() => {
      loadAccessContext();
      loadTeamHubMemberships();
    });

    const loadTeamHubMemberships = async () => {
      teamHubLoading.value = true;
      teamHubError.value = "";
      try {
        const result = await loadBoundedPages((nextToken) => listMyTeams({ limit: 50, ...(nextToken ? { nextToken } : {}) }));
        if (!result.complete) throw new Error("Team Hub data limit exceeded");
        teamHubMemberships.value = await Promise.all(result.items.map(async (team) => {
          const context = await getTeamHub({ teamId: team.id });
          const ownSlots = context.roster.filter((slot) => slot.membershipId === context.myMembershipId);
          return { ...team, context, assignedPosition: ownSlots[0]?.gameRoleKey || "" };
        }));
      } catch {
        teamHubError.value = "Team Hub shortcuts are temporarily unavailable.";
        teamHubMemberships.value = [];
      } finally { teamHubLoading.value = false; }
    };

    // ============================================================
    // TOP NAVIGATION
    // ============================================================

    const topNavItems = computed(() => {
      const items = [
        {
          label: "Home",
          to: "/home",
          comingSoon: false,
        },
        {
          label: "Forums",
          to: "/forum",
          comingSoon: false,
        },
        {
          label: "Profile",
          to: "/account",
          comingSoon: false,
        },
        {
          label: "Quests",
          to: "/home",
          comingSoon: true,
        },
        {
          label: "Friends",
          to: "/home",
          comingSoon: true,
        },
        {
          label: "Events",
          to: "/events",
          comingSoon: false,
        },
      ];

      // --------------------------------------------------------
      // RESTRICTED HUBS
      // --------------------------------------------------------

      if (canAccessTrainerHub.value) {
        items.push({
          label: "Trainer Hub",
          to: "/trainer",
          comingSoon: true,
        });
      }

      if (canAccessTherapistHub.value) {
        items.push({
          label: "Therapist Hub",
          to: "/therapist",
          comingSoon: true,
        });
      }

      if (canAccessCreatorTools.value) {
        items.push({
          label: "Creator Tools",
          to: "/creator-tools",
          comingSoon: true,
        });
      }

      if (canAccessPartnerHub.value) {
        items.push({
          label: "Partner Hub",
          to: "/partner",
          comingSoon: true,
        });
      }

      return items;
    });

    // ============================================================
    // FORUM HIGHLIGHTS
    // ============================================================

    const forumHighlights = [
      {
        label: "Featured section",
        title: "Feature ideas",
        description:
          "A place for members to suggest improvements and help shape what gets built next.",
        to: "/forum",
      },
      {
        label: "Community space",
        title: "Discord and Twitch discussions",
        description:
          "Explore conversations around stream growth, communities, and connected platforms.",
        to: "/forum",
      },
      {
        label: "Support area",
        title: "Bug reports and updates",
        description:
          "See what is changing across the platform and where members can report issues.",
        to: "/forum",
      },
    ];

    // ============================================================
    // QUICK ACTIONS
    // ============================================================

    const quickActions = computed(() => {
      const actions = [
        {
          icon: "👤",
          title: "Edit your profile",
          description:
            "Update your profile modules, text sections, and public visibility settings.",
          to: "/account",
        },
        {
          icon: "💬",
          title: "Open the forums",
          description:
            "Jump back into the latest community discussions and pinned posts.",
          to: "/forum",
        },
        {
          icon: "📅",
          title: "Check events",
          description:
            "See what events are already live and what the platform is building toward.",
          to: "/events",
        },
      ];

      // --------------------------------------------------------
      // CREATOR TOOLS QUICK ACTION
      // --------------------------------------------------------

      if (canAccessCreatorTools.value) {
        actions.push({
          icon: "🎥",
          title: "Open Creator Tools",
          description:
            "Manage creator channels, bots, integrations, and upcoming creator features.",
          to: "/creator-tools",
        });
      }

      // --------------------------------------------------------
      // TRAINER HUB QUICK ACTION
      // --------------------------------------------------------

      if (canAccessTrainerHub.value) {
        actions.push({
          icon: "🏋️",
          title: "Open Trainer Hub",
          description:
            "Access trainer tools, member support features, and future fitness integrations.",
          to: "/trainer",
        });
      }

      // --------------------------------------------------------
      // THERAPIST HUB QUICK ACTION
      // --------------------------------------------------------

      if (canAccessTherapistHub.value) {
        actions.push({
          icon: "🧠",
          title: "Open Therapist Hub",
          description:
            "Access therapist-facing tools and future wellbeing support features.",
          to: "/therapist",
        });
      }

      // --------------------------------------------------------
      // PARTNER HUB QUICK ACTION
      // --------------------------------------------------------

      if (canAccessPartnerHub.value) {
        actions.push({
          icon: "🤝",
          title: "Open Partner Hub",
          description:
            "Access partner tools, campaigns, affiliate activity, and collaboration features.",
          to: "/partner",
        });
      }

      actions.push(...buildTeamHubShortcuts(teamHubMemberships.value));

      return actions;
    });

    // ============================================================
    // ROADMAP
    // ============================================================

    const roadmapItems = [
      {
        title: "Creature-focused homepage modules",
        description:
          "Your chosen creature will eventually shape the atmosphere and progress cues of this space.",
      },
      {
        title: "Quest tracking and rewards",
        description:
          "Active quests, streaks, and progress rewards will live here as the system expands.",
      },
      {
        title: "Social suggestions",
        description:
          "Later versions can surface recommended friends, activities, and shared interests.",
      },
    ];

    // ============================================================
    // EXPLORE LINKS
    // ============================================================

    const exploreLinks = [
      {
        label: "Visit forums",
        to: "/forum",
      },
      {
        label: "Open your profile",
        to: "/account",
      },
      {
        label: "View events",
        to: "/events",
      },
      {
        label: "Browse merch",
        to: "/merch",
      },
    ];

    // ============================================================
    // DISPLAY NAME
    // ============================================================

    const displayLabel = computed(() => {
      return (
        displayName.value?.trim() ||
        email.value?.split("@")[0] ||
        ""
      );
    });

    // ============================================================
    // PROFILE INITIALS
    // ============================================================

    const profileInitials = computed(() => {
      const source =
        displayLabel.value ||
        email.value ||
        "";

      if (!source) {
        return "?";
      }

      const parts = source
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }

      return source
        .slice(0, 2)
        .toUpperCase();
    });

    // ============================================================
    // PROFILE COMPLETION
    // ============================================================

    const profileCompletion = computed(() => {
      let score = 45;

      if (displayName.value?.trim()) {
        score += 25;
      }

      if (email.value?.trim()) {
        score += 15;
      }

      return Math.min(score, 100);
    });

    // ============================================================
    // RETURN
    // ============================================================

    return {
      // User
      displayLabel,
      profileInitials,
      profileCompletion,

      // Homepage
      topNavItems,
      forumHighlights,
      quickActions,
      roadmapItems,
      exploreLinks,

      // Access state
      accessReady,

      // Hub access
      hasFullHubAccess,
      canAccessCreatorTools,
      canAccessTrainerHub,
      canAccessTherapistHub,
      canAccessPartnerHub,
      teamHubLoading,
      teamHubError,
      teamHubMemberships,
    };
  },
};
