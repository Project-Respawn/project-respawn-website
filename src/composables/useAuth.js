import { computed, ref } from "vue";
import {
  getCurrentUser,
  fetchUserAttributes,
  fetchAuthSession,
  signOut,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

const cognitoUser = ref(null);
const userAttributes = ref({});
const userGroups = ref([]);
let hubStarted = false;

function computeInitials(display, email) {
  const s = (display || email || "").trim();

  if (!s) return "?";

  if (s.includes("@")) {
    return s.slice(0, 2).toUpperCase();
  }

  const parts = s.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return s.slice(0, 2).toUpperCase();
}

export async function refreshAuth() {
  try {
    cognitoUser.value = await getCurrentUser();
    userAttributes.value = await fetchUserAttributes();

    const session = await fetchAuthSession();

    const groupsFromAccessToken =
      session?.tokens?.accessToken?.payload?.["cognito:groups"];

    const groupsFromIdToken =
      session?.tokens?.idToken?.payload?.["cognito:groups"];

    const groups = groupsFromAccessToken || groupsFromIdToken || [];

    userGroups.value = Array.isArray(groups) ? groups : [];
  } catch {
    cognitoUser.value = null;
    userAttributes.value = {};
    userGroups.value = [];
  }
}

function startHubListener() {
  if (hubStarted) return;

  hubStarted = true;

  Hub.listen("auth", ({ payload }) => {
    const authEvent = payload?.event;

    if (
      authEvent === "signedIn" ||
      authEvent === "signedOut" ||
      authEvent === "tokenRefresh"
    ) {
      refreshAuth();
    }
  });
}

export function useAuth() {
  startHubListener();

  const displayName = computed(() => {
    const a = userAttributes.value;

    return (
      (
        a.preferred_username ||
        a.name ||
        a.email ||
        cognitoUser.value?.username ||
        ""
      ).trim() || "Account"
    );
  });

  const email = computed(() => userAttributes.value.email || "");

  const initials = computed(() =>
    computeInitials(displayName.value, email.value)
  );

  const isSignedIn = computed(() => !!cognitoUser.value);

  const groups = computed(() => userGroups.value);

  const isSuperAdmin = computed(() => groups.value.includes("SuperAdmin"));
  const isAdmin = computed(() => groups.value.includes("Admin"));
  const isStreamer = computed(() => groups.value.includes("StreamingPartner"));
  const isTrainer = computed(() => groups.value.includes("Trainer"));
  const isStaff = computed(() => groups.value.includes("Staff"));
  const isModerator = computed(() => groups.value.includes("Moderator"));
  const isStreamModerator = computed(() =>
    groups.value.includes("StreamModerator")
  );
  const isTherapist = computed(() => groups.value.includes("Therapist"));
  const isAffiliatePartner = computed(() =>
    groups.value.includes("AffiliatePartner")
  );
  const isMember = computed(() => groups.value.includes("Member"));
  const isBetaMember = computed(() => groups.value.includes("BetaMember"));

  const canViewAdmin = computed(
    () => isSuperAdmin.value || isAdmin.value
  );

  const canManageTaxonomy = computed(
    () => isSuperAdmin.value || isAdmin.value
  );

  const canAssignTaxonomy = computed(
    () =>
      canManageTaxonomy.value ||
      isStreamer.value ||
      isTrainer.value
  );

  function hasGroup(groupName) {
    return groups.value.includes(groupName);
  }

  function hasAnyGroup(groupNames = []) {
    return groupNames.some((groupName) => groups.value.includes(groupName));
  }

  function truncatedDisplayName(maxLen = 16) {
    const d = displayName.value;

    if (d.length <= maxLen) return d;

    return `${d.slice(0, Math.max(1, maxLen - 1))}…`;
  }

  async function logout() {
    await signOut();
    await refreshAuth();
  }

  return {
    cognitoUser,
    userAttributes,
    userGroups,
    displayName,
    email,
    initials,
    isSignedIn,
    groups,

    isSuperAdmin,
    isAdmin,
    isStreamer,
    isTrainer,
    isStaff,
    isModerator,
    isStreamModerator,
    isTherapist,
    isAffiliatePartner,
    isMember,
    isBetaMember,

    canViewAdmin,
    canManageTaxonomy,
    canAssignTaxonomy,

    hasGroup,
    hasAnyGroup,
    truncatedDisplayName,
    refreshAuth,
    logout,
  };
}