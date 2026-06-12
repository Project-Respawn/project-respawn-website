<template>
  <main class="account-page container py-5">
    <section class="account-section">
      <div class="row">
        <div class="col-xl-9 mx-auto account-column">
          <p class="account-eyebrow mb-2">Project Respawn</p>
          <h1 class="mb-2">Profile</h1>
          <p class="lead text-secondary mb-4">
            Your public card, stats, and badges
          </p>

          <template v-if="isSignedIn">
            <p v-if="profileLoadError" class="text-danger small mb-3">
              {{ profileLoadError }}
            </p>

            <div class="card border account-panel mb-4">
              <div class="card-body">
                <div class="profile-header-row">
                  <div class="profile-avatar-wrap">
                    <img
                      v-if="profile.avatarObjectUrl"
                      :src="profile.avatarObjectUrl"
                      alt=""
                      class="profile-avatar-img"
                    />
                    <div v-else class="profile-avatar profile-avatar-lg" aria-hidden="true">
                      {{ profileInitials }}
                    </div>
                  </div>

                  <div class="profile-header-meta min-width-0 flex-grow-1">
                    <div class="d-flex align-items-start justify-content-between gap-2">
                      <div class="min-width-0">
                        <h2 class="profile-heading h5 mb-1 text-truncate">
                          {{ profile.displayName || "Set your display name" }}
                        </h2>
                        <p class="profile-email text-secondary small text-truncate mb-3">
                          {{ profile.email }}
                        </p>
                      </div>

                      <button
                        type="button"
                        class="account-icon-btn-modern"
                        aria-label="Edit profile"
                        @click="openEditModal"
                      >
                        ⚙
                      </button>
                    </div>

                    <p class="profile-bio mb-0">
                      {{ profile.bio || "No bio yet — tap edit to add one." }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="card border account-panel mb-4">
              <div class="card-body">
                <h3 class="account-section-title h6 mb-3">Stats</h3>

                <div class="stats-grid">
                  <button
                    v-if="stats.orders > 0"
                    type="button"
                    class="stat-card stat-card-interactive"
                    @click="onOrdersClick"
                  >
                    <span class="stat-label">Orders</span>
                    <span class="stat-value">{{ stats.orders }}</span>
                  </button>

                  <div v-else class="stat-card">
                    <span class="stat-label">Orders</span>
                    <span class="stat-value">{{ stats.orders }}</span>
                  </div>

                  <button
                    type="button"
                    class="stat-card stat-card-interactive"
                    @click="showStatMessage('Coming soon')"
                  >
                    <span class="stat-label">Quests</span>
                    <span class="stat-value">{{ stats.quests }}</span>
                  </button>

                  <button
                    type="button"
                    class="stat-card stat-card-interactive"
                    @click="showStatMessage('Coming soon')"
                  >
                    <span class="stat-label">Level</span>
                    <span class="stat-value">{{ stats.level }}</span>
                  </button>

                  <button
                    type="button"
                    class="stat-card stat-card-interactive"
                    @click="showStatMessage('Coming soon')"
                  >
                    <span class="stat-label">Streak</span>
                    <span class="stat-value">{{ stats.streak }}</span>
                  </button>
                </div>

                <p v-if="stats.orders === 0" class="stat-hint mb-0 mt-3">
                  No orders yet
                </p>

                <p
                  v-if="statStatusMessage"
                  class="stat-status mt-3 mb-0"
                  role="status"
                >
                  {{ statStatusMessage }}
                </p>
              </div>
            </div>

            <div class="card border account-panel mb-4">
              <div class="card-body">
                <h3 class="account-section-title h6 mb-3">Achievements</h3>

                <div v-if="!earnedBadges.length" class="text-muted small">
                  Grind more — complete quests to earn badges
                </div>

                <div v-else class="badges-grid">
                  <div
                    v-for="(url, index) in earnedBadges"
                    :key="index"
                    class="badge-slot"
                  >
                    <img :src="url" class="badge-slot-img" alt="" />
                  </div>
                </div>
              </div>
            </div>

            <div class="connect-banner">
              <div class="banner-inner">
                <div class="banner-text">
                  <h4>Coming soon. Stay Connected.</h4>
                  <p>Your crew is just one click away.</p>

                  <div class="banner-actions">
                    <router-link class="btn primary" to="/friends">Find Friends</router-link>
                    <router-link to="/" class="btn secondary">Go Home</router-link>
                  </div>
                </div>

                <div class="visual visual-main">
                  <svg viewBox="0 0 200 200">
                    <circle cx="60" cy="70" r="25" fill="#6366f1" />
                    <circle cx="120" cy="60" r="22" fill="#8b5cf6" />
                    <circle cx="100" cy="110" r="28" fill="#22c55e" />
                    <path d="M60 100 Q100 140 140 90" stroke="#fff" stroke-width="3" fill="none" />
                    <path d="M40 120 Q100 170 160 110" stroke="#a5b4fc" stroke-width="2" fill="none" />
                  </svg>
                </div>

                <div class="visual visual-accent">
                  <svg viewBox="0 0 100 100">
                    <rect x="20" y="40" width="60" height="30" rx="10" fill="#0ea5e9" />
                    <circle cx="40" cy="55" r="5" fill="#fff" />
                    <circle cx="60" cy="55" r="5" fill="#fff" />
                    <rect x="48" y="48" width="4" height="14" fill="#fff" />
                    <rect x="43" y="53" width="14" height="4" fill="#fff" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="account-signout-wrap">
              <button
                type="button"
                class="btn btn-outline-danger btn-sm"
                :disabled="signingOut"
                @click="handleSignOut"
              >
                {{ signingOut ? "Signing out…" : "Sign out" }}
              </button>
            </div>
          </template>

          <div v-else class="card border">
            <div class="card-body">
              <p class="mb-3">
                Sign in or create an account to manage your profile.
              </p>
              <router-link to="/join" class="btn btn-primary">Go to Join</router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div
      v-if="editOpen && draft"
      class="account-modal-overlay"
      role="presentation"
      @click.self="cancelEdit"
    >
      <div
        class="account-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-edit-title"
      >
        <button
          type="button"
          class="account-modal-close"
          aria-label="Close"
          @click="cancelEdit"
        >
          ✕
        </button>

        <h2 id="account-edit-title" class="h5 mb-3">Edit profile</h2>

        <div class="mb-3">
          <label class="form-label small text-secondary" for="edit-name">Name</label>
          <input
            id="edit-name"
            v-model="draft.displayName"
            type="text"
            class="form-control"
            autocomplete="nickname"
          />
        </div>

        <div class="mb-3">
          <label class="form-label small text-secondary" for="edit-bio">Bio</label>
          <textarea
            id="edit-bio"
            v-model="draft.bio"
            class="form-control"
            rows="3"
            placeholder="Short intro for the community…"
          />
        </div>

        <div class="mb-3">
          <label class="form-label small text-secondary" for="edit-avatar">Avatar</label>
          <input
            id="edit-avatar"
            type="file"
            class="form-control form-control-sm"
            accept="image/*"
            @change="onAvatarFile($event)"
          />
        </div>

        <p v-if="profileSaveError" class="text-danger small mb-3">
          {{ profileSaveError }}
        </p>

        <div class="d-flex flex-wrap gap-2 justify-content-end">
          <button type="button" class="btn btn-outline-secondary" @click="cancelEdit">
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="savingProfile"
            @click="saveEdit"
          >
            {{ savingProfile ? "Saving…" : "Save" }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";
import { useAuth } from "../../composables/useAuth.js";
import type { Schema } from "../../../amplify/data/resource";

const client = generateClient<Schema>();

const EMPTY_PROFILE = {
  id: null as string | null,
  ownerUserId: "",
  displayName: "",
  email: "",
  bio: "",
  avatarObjectUrl: null as string | null,
};

const TIER_IMAGES = [
  "images/imageTier1.png",
  "images/ImageTier2.png",
  "images/imageTier3.png",
  "images/imageTier4.png",
  "images/imageTier5.png",
];

const MOCK_STATS = {
  orders: 1,
  quests: 32,
  level: 8,
  streak: 6,
};

const { displayName, email, isSignedIn, refreshAuth, logout } = useAuth();

const signingOut = ref(false);
const savingProfile = ref(false);
const profileLoadError = ref("");
const profileSaveError = ref("");

const profile = ref({ ...EMPTY_PROFILE });
const stats = ref({ ...MOCK_STATS });

const editOpen = ref(false);
const draft = ref<null | {
  id: string | null;
  ownerUserId: string;
  displayName: string;
  email: string;
  bio: string;
  avatarObjectUrl: string | null;
}>(null);

let snapshotOnOpen: null | {
  id: string | null;
  ownerUserId: string;
  displayName: string;
  email: string;
  bio: string;
  avatarObjectUrl: string | null;
} = null;

const statStatusMessage = ref("");
let statStatusTimer: ReturnType<typeof setTimeout> | null = null;

const profileInitials = computed(() =>
  computeInitials(profile.value.displayName, profile.value.email),
);

function computeInitials(display: string, em: string) {
  const s = (display || em || "").trim();
  if (!s) return "?";
  if (s.includes("@")) return s.slice(0, 2).toUpperCase();
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return s.slice(0, 2).toUpperCase();
}

function revokeIfBlob(url: string | null) {
  if (url && String(url).startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

function cloneProfile(p: typeof EMPTY_PROFILE) {
  return {
    id: p.id ?? null,
    ownerUserId: p.ownerUserId ?? "",
    displayName: p.displayName ?? "",
    email: p.email ?? "",
    bio: p.bio ?? "",
    avatarObjectUrl: p.avatarObjectUrl ?? null,
  };
}

async function loadProfile() {
  profileLoadError.value = "";

  if (!isSignedIn.value) return;

  try {
    const user = await getCurrentUser();
    const ownerUserId = user.userId;

    const { data, errors } = await client.models.UserProfile.list({
      filter: {
        ownerUserId: { eq: ownerUserId },
      },
    });

    if (errors?.length) {
      throw new Error(errors[0].message || "Failed to load profile");
    }

    const existingProfile = data?.[0];

    if (existingProfile) {
      profile.value = {
        id: existingProfile.id,
        ownerUserId: existingProfile.ownerUserId ?? ownerUserId,
        displayName: existingProfile.displayName || displayName.value || "",
        email: email.value || "",
        bio: existingProfile.bio || "",
        avatarObjectUrl: null,
      };
    } else {
      profile.value = {
        id: null,
        ownerUserId,
        displayName: displayName.value || "",
        email: email.value || "",
        bio: "",
        avatarObjectUrl: null,
      };
    }
  } catch (error: any) {
    console.error("Failed to load user profile:", error);
    profileLoadError.value = error?.message || "Failed to load profile";
    profile.value = {
      ...profile.value,
      displayName: displayName.value || profile.value.displayName,
      email: email.value || profile.value.email,
    };
  }
}

onMounted(async () => {
  await refreshAuth();
  await loadProfile();
});

function showStatMessage(msg: string) {
  if (statStatusTimer) clearTimeout(statStatusTimer);
  statStatusMessage.value = msg;
  statStatusTimer = setTimeout(() => {
    statStatusMessage.value = "";
    statStatusTimer = null;
  }, 2800);
}

function onOrdersClick() {
  showStatMessage("Order history will open here.");
}

function openEditModal() {
  snapshotOnOpen = cloneProfile(profile.value);
  draft.value = cloneProfile(profile.value);
  profileSaveError.value = "";
  editOpen.value = true;
  window.addEventListener("keydown", onGlobalEsc);
}

function onGlobalEsc(e: KeyboardEvent) {
  if (e.key === "Escape" && editOpen.value) cancelEdit();
}

function revokeDraftOrphans() {
  if (!draft.value || !snapshotOnOpen) return;
  if (draft.value.avatarObjectUrl !== snapshotOnOpen.avatarObjectUrl) {
    revokeIfBlob(draft.value.avatarObjectUrl);
  }
}

onUnmounted(() => {
  window.removeEventListener("keydown", onGlobalEsc);
  if (statStatusTimer) clearTimeout(statStatusTimer);
  if (draft.value && snapshotOnOpen) revokeDraftOrphans();
  draft.value = null;
  snapshotOnOpen = null;
});

const earnedBadges = computed(() => {
  const quests = stats.value.quests || 0;
  const earnedCount = Math.floor(quests / 10);
  return TIER_IMAGES.slice(0, Math.min(earnedCount, 5));
});

function cancelEdit() {
  try {
    if (draft.value) revokeDraftOrphans();
  } catch (err) {
    console.error("revokeDraftOrphans failed:", err);
  }

  draft.value = null;
  snapshotOnOpen = null;
  editOpen.value = false;
  profileSaveError.value = "";
  window.removeEventListener("keydown", onGlobalEsc);
}

async function saveEdit() {
  if (!draft.value || !isSignedIn.value) return;

  savingProfile.value = true;
  profileSaveError.value = "";

  try {
    const user = await getCurrentUser();
    const ownerUserId = user.userId;
    const nextDisplayName = draft.value.displayName.trim();
    const nextBio = draft.value.bio.trim();

    if (!nextDisplayName) {
      throw new Error("Display name is required.");
    }

    let savedRecord;

    if (profile.value.id) {
      const { data, errors } = await client.models.UserProfile.update({
        id: profile.value.id,
        ownerUserId,
        displayName: nextDisplayName,
        bio: nextBio,
      });

      if (errors?.length) {
        throw new Error(errors[0].message || "Failed to update profile");
      }

      savedRecord = data;
    } else {
      const { data, errors } = await client.models.UserProfile.create({
        ownerUserId,
        displayName: nextDisplayName,
        bio: nextBio,
      });

      if (errors?.length) {
        throw new Error(errors[0].message || "Failed to create profile");
      }

      savedRecord = data;
    }

    const prev = cloneProfile(profile.value);

    profile.value = {
      id: savedRecord?.id ?? null,
      ownerUserId: savedRecord?.ownerUserId ?? ownerUserId,
      displayName: savedRecord?.displayName || nextDisplayName,
      email: email.value || "",
      bio: savedRecord?.bio || "",
      avatarObjectUrl: draft.value.avatarObjectUrl || null,
    };

    if (prev.avatarObjectUrl !== profile.value.avatarObjectUrl) {
      revokeIfBlob(prev.avatarObjectUrl);
    }

    draft.value = null;
    snapshotOnOpen = null;
    editOpen.value = false;
    window.removeEventListener("keydown", onGlobalEsc);
  } catch (error: any) {
    console.error("Failed to save profile:", error);
    profileSaveError.value = error?.message || "Failed to save profile";
  } finally {
    savingProfile.value = false;
  }
}

function onAvatarFile(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !draft.value) return;

  revokeIfBlob(draft.value.avatarObjectUrl);
  draft.value.avatarObjectUrl = URL.createObjectURL(file);
  input.value = "";
}

async function handleSignOut() {
  signingOut.value = true;
  try {
    await logout();
  } catch {
  } finally {
    signingOut.value = false;
  }
}
</script>

<style scoped src="./Account.css"></style>