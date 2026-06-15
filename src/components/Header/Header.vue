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
                <router-link v-else to="/account" class="btn btn-secondary ms-3 header-account-btn text-truncate d-flex align-items-center gap-2"
                :class="{ active: $route.path === '/account' }" :title="displayName">
                <span class="profile-avatar" aria-hidden="true">{{ initials }}</span>
                <span class="text-truncate">{{ truncatedNavName }}</span>
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { computed, onMounted, ref, nextTick } from "vue";
import { useAuth } from "../../composables/useAuth.js";

const { isSignedIn, displayName, truncatedDisplayName, refreshAuth, initials } = useAuth();
const truncatedNavName = computed(() => truncatedDisplayName(10));

const cartCount = ref(0);

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

onMounted(() => {
  refreshAuth();
  updateCartCount();
  window.addEventListener("storage", updateCartCount);

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
</script>

<style scoped src="./Header.css"></style>
