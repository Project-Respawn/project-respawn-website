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
            <li class="nav-item">
              <router-link
                to="/merch"
                class="nav-link"
                :class="{ active: $route.path === '/merch' }"
              >Store</router-link>
            </li>
            <li class="nav-item cart-nav-item">
              <router-link to="/checkout" class="nav-link cart-icon-link">
                <i class="bi bi-cart3"></i>
                <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
              </router-link>
            </li>

            <li class="nav-item">
              <span v-if="authStatus === 'loading'" class="btn btn-secondary ms-3 disabled" aria-busy="true">Checking session…</span>
              <router-link v-else-if="!isSignedIn" to="/join" class="btn btn-secondary ms-3" :class="{ active: $route.path === '/join' }">Join</router-link>

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

<script src="./Header.js"></script>
<style scoped src="./Header.css"></style>