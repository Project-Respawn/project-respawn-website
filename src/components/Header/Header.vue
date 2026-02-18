<template>
  <header class="site-header">
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container">
        <!-- Logo -->
        <router-link to="/" class="navbar-brand">
          <img src="../../assets/logo.png" alt="Ravens logo" width="44" height="44" class="me-2">
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

<style scoped src="./Header.css"></style>
