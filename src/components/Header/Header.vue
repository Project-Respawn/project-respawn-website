<template>
  <header class="site-header">
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container">
        <router-link to="/" class="navbar-brand">
          <img src="../../assets/logo.png" alt="Project Respawn logo" width="44" height="44" class="me-2"/>
          <span>Project Respawn</span>
        </router-link>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/about" class="nav-link" :class="{ active: $route.path === '/about' }">About</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/forum" class="nav-link" :class="{ active: $route.path === '/forum' }">Forum</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/contact" class="nav-link" :class="{ active: $route.path === '/contact' }">Contact</router-link>
            </li>
            <!-- <li class="nav-item">
              <router-link
                to="/merch"
                class="nav-link"
                :class="{ active: $route.path === '/merch' }"
                >Merch</router-link
              >
            </li> -->
            <!-- <li class="nav-item cart-nav-item">
              <router-link to="/checkout" class="nav-link cart-icon-link">
                <i class="bi bi-cart3"></i>
                <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
              </router-link>
            </li> -->

            <!-- Admin Dashboard link — only visible when signed in -->
            <!-- <li v-if="isSignedIn" class="nav-item">
              <router-link
                to="/dashboard"
                class="nav-link dashboard-link"
                :class="{ active: $route.path === '/dashboard' }"
                title="Admin Dashboard"
              >
                <i class="bi bi-sliders"></i>
              </router-link>
            </li> -->
            
            <!-- <li class="nav-item">
              <router-link
                to="/events"
                class="nav-link"
                :class="{ active: $route.path === '/events' }"
                >Events</router-link
              >
            </li> -->
            <li class="nav-item">
              <router-link v-if="!isSignedIn" to="/join" class="btn btn-secondary ms-3" :class="{ active: $route.path === '/join' }">Join</router-link>
              <!-- Signed-in account dropdown -->
              <div v-else class="ms-3 position-relative">
                <button
                  class="btn btn-secondary header-account-btn d-flex align-items-center"
                  :title="displayName"
                  @click="toggleDropdown"
                  type="button">
                  <span class="profile-avatar me-2" aria-hidden="true">{{ initials }}</span>
                  <span class="text-truncate">{{ truncatedNavName }}</span>
                  <i class="bi bi-caret-down-fill ms-2"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end" :class="{ show: showDropdown }" style="min-width: 12rem;">
                  <li>
                    <router-link to="/home" class="dropdown-item">Dashboard</router-link>
                  </li>
                  <li>
                    <router-link to="/account" class="dropdown-item">Profile Settings</router-link>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <button class="dropdown-item text-danger" @click="handleLogout">Sign out</button>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { computed, onMounted, ref, nextTick, onBeforeUnmount, watch } from "vue";
import { useAuth } from "../../composables/useAuth.js";
import { useRouter } from "vue-router";

const { isSignedIn, displayName, truncatedDisplayName, refreshAuth, initials, logout } = useAuth();
const truncatedNavName = computed(() => truncatedDisplayName(10));
const router = useRouter();

const cartCount = ref(0);
const showDropdown = ref(false);

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cartCount.value = cart.reduce((acc, item) => acc + (item.qty || 1), 0);
}

function closeNavbar() {
  const navbarCollapse = document.getElementById("navbarNav");
  const toggler = document.querySelector(".navbar-toggler");
  if (navbarCollapse && navbarCollapse.classList.contains("show")) {
    toggler.click();
  }
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

async function handleLogout() {
  try {
    await logout();
    showDropdown.value = false;
    // refresh auth state in case useAuth needs it
    await refreshAuth();
    router.push('/');
  } catch (err) {
    console.error('Logout failed', err);
  }
}

function onDocClick(e) {
  const btn = document.querySelector('.header-account-btn');
  const menu = document.querySelector('.dropdown-menu');
  if (!btn) return;
  if (btn.contains(e.target) || (menu && menu.contains(e.target))) return;
  showDropdown.value = false;
}

onMounted(() => {
  refreshAuth();
  updateCartCount();
  window.addEventListener("storage", updateCartCount);
  document.addEventListener('click', onDocClick);

  // Close navbar when a link is clicked
  const navLinks = document.querySelectorAll(".navbar-collapse .nav-link, .navbar-collapse .btn");
  navLinks.forEach(link => {
    link.addEventListener("click", closeNavbar);
  });

  // Close navbar when clicking the backdrop
  const navbarCollapse = document.getElementById("navbarNav");
  navbarCollapse?.addEventListener("click", (e) => {
    if (e.target === navbarCollapse) {
      closeNavbar();
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("storage", updateCartCount);
  document.removeEventListener('click', onDocClick);
});

// Close dropdown when route changes
watch(() => window.location.pathname, () => {
  showDropdown.value = false;
});
</script>

<style scoped src="./Header.css"></style>
