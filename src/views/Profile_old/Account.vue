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
            <div class="account-tabs card border mb-4">
              <div class="card-body">
                <div class="card border profile-card mb-4">
                  <div
                    class="card-body d-flex flex-wrap align-items-center gap-3"
                  >
                    <div class="profile-avatar" aria-hidden="true">
                      {{ initials }}
                    </div>
                    <div class="profile-meta flex-grow-1 min-width-0">
                      <div class="profile-name fw-semibold text-truncate">
                        {{ displayName }}
                      </div>
                      <div
                        class="profile-email text-truncate text-secondary small"
                      >
                        {{ email }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="coming-soon mb-3">Coming soon</div>

                <div class="tabs-list">
                  <div class="tab-item" @click="handleComingSoon('Quests')" >
                    <div class="icon">🏆</div>
                    <span>Quests</span>
                  </div>

                  <div class="tab-item " @click="handleComingSoon('Level')">
                    <div class="icon">📊</div>
                    <span>Level</span>
                  </div>

                  <div class="tab-item" @click="handleComingSoon('My Profile')">
                    <div class="icon">👤</div>
                    <span>My Profile</span>
                  </div>

                  <div class="tab-item" @click="handleComingSoon('My Orders')">
                    <div class="icon">🛍️</div>
                    <span>My Orders</span>
                  </div>

                  <div class="tab-item" @click="handleComingSoon('Privacy Settings')">
                    <div class="icon">🔒</div>
                    <span>Privacy Settings</span>
                  </div>

                  <div class="tab-item signout" @click="handleSignOut">
                    <div class="icon">🚪</div>
                    <span>Sign out</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <div v-else class="card border">
            <div class="card-body">
              <p class="mb-3">
                Sign in or create an account to manage your profile.
              </p>
              <router-link to="/join" class="btn btn-primary"
                >Go to Join</router-link
              >
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

function handleComingSoon(feature) {
  alert(`${feature} is coming soon 🚀`);
}
</script>

<!-- <style scoped src="./Account.css"></style> -->
