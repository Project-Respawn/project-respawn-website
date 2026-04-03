<template>
  <main class="account-page container py-5">
    <section class="account-section">
      <div class="row">
        <div class="col-lg-8 mx-auto account-column">
          <h1 class="mb-2">Your account</h1>
          <p class="lead text-secondary mb-4">
            Profile and sign-in settings for Project Respawn.
          </p>

          <template v-if="isSignedIn">
            <div class="card border profile-card mb-4">
              <div class="card-body d-flex flex-wrap align-items-center gap-3">
                <div class="profile-avatar" aria-hidden="true">
                  {{ initials }}
                </div>
                <div class="profile-meta flex-grow-1 min-width-0">
                  <div class="profile-name fw-semibold text-truncate">
                    {{ displayName }}
                  </div>
                  <div class="profile-email text-truncate text-secondary small">
                    {{ email }}
                  </div>
                </div>
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-sm flex-shrink-0"
                  :disabled="signingOut"
                  @click="handleSignOut"
                >
                  {{ signingOut ? "Signing out…" : "Sign out" }}
                </button>
              </div>
            </div>
          </template>

          <div v-else class="card border">
            <div class="card-body">
              <p class="mb-3">Sign in or create an account to manage your profile.</p>
              <router-link to="/join" class="btn btn-primary">Go to Join</router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useAuth } from "../../composables/useAuth.js";

const {
  displayName,
  email,
  initials,
  isSignedIn,
  refreshAuth,
  logout,
} = useAuth();

const signingOut = ref(false);

onMounted(() => {
  refreshAuth();
});

async function handleSignOut() {
  signingOut.value = true;
  try {
    await logout();
  } catch {
    /* ignore */
  } finally {
    signingOut.value = false;
  }
}
</script>

<style scoped src="./Account.css"></style>
