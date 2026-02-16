<template>
  <header class="site-header">
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container">
        <!-- Logo -->
        <router-link to="/" class="navbar-brand">
          <img src="./assets/logo.png" alt="Ravens logo" width="44" height="44" class="me-2">
          <span>Ravens</span>
        </router-link>

        <!-- Navbar Toggle for Mobile -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Navigation Menu -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/about" class="nav-link" :class="{ active: $route.path === '/about' }">About</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/our-mission" class="nav-link" :class="{ active: $route.path === '/our-mission' }">Our Mission</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/contact" class="nav-link" :class="{ active: $route.path === '/contact' }">Contact</router-link>
            </li>
          </ul>
          <router-link to="/contact" class="btn btn-primary ms-3">Join</router-link>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style scoped>
.site-header {
  background: linear-gradient(180deg, rgba(201, 180, 224, 0.04), transparent);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid rgba(201, 180, 224, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand {
  display: flex;
  align-items: center;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: var(--text) !important;
  font-size: 1.25rem;
}

.navbar-brand img {
  display: block;
}

.navbar-brand span {
  white-space: nowrap;
}

.nav-link {
  color: var(--muted) !important;
  padding: 8px 10px !important;
  border-radius: 8px;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--text) !important;
  background: var(--glass);
}

.btn-primary {
  background: linear-gradient(90deg, var(--accent), var(--accent-2)) !important;
  color: #2a1b3d !important;
  border: none !important;
  font-weight: 600 !important;
  padding: 8px 12px !important;
  border-radius: 10px !important;
}

.btn-primary:hover {
  opacity: 0.9;
}

.navbar-toggler {
  border: none !important;
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28148, 163, 184, 1%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e") !important;
}
</style>
