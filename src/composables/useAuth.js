import { computed, ref } from "vue";
import {
  getCurrentUser,
  fetchUserAttributes,
  signOut,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

const cognitoUser = ref(null);
const userAttributes = ref({});
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
  } catch {
    cognitoUser.value = null;
    userAttributes.value = {};
  }
}

function startHubListener() {
  if (hubStarted) return;
  hubStarted = true;
  Hub.listen("auth", ({ payload }) => {
    if (payload.event === "signedIn" || payload.event === "signedOut") {
      refreshAuth();
    }
  });
}

export function useAuth() {
  startHubListener();

  const displayName = computed(() => {
    const a = userAttributes.value;
    return (
      (a.preferred_username || a.email || cognitoUser.value?.username || "")
        .trim() || "Account"
    );
  });

  const email = computed(() => userAttributes.value.email || "");

  const initials = computed(() =>
    computeInitials(displayName.value, email.value),
  );

  const isSignedIn = computed(() => !!cognitoUser.value);

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
    displayName,
    email,
    initials,
    isSignedIn,
    truncatedDisplayName,
    refreshAuth,
    logout,
  };
}
