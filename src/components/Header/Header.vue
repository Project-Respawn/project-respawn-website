<template>
  <header class="site-header">
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container">
        <!-- Logo -->
        <router-link to="/" class="navbar-brand">
          <img src="../../assets/logo.png" alt="Project Respawn logo" width="44" height="44" class="me-2">
          <span>Project Respawn</span>
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
              <router-link to="/contact" class="nav-link" :class="{ active: $route.path === '/contact' }">Contact</router-link>
            </li>
             <li class="nav-item">
              <router-link to="/team-tryouts" class="nav-link" :class="{ active: $route.path === '/team-tryouts' }">Team Tryouts</router-link>
            </li>
             <li class="nav-item">
              <router-link to="/merch" class="nav-link" :class="{ active: $route.path === '/merch' }">Merch</router-link>
            </li>      
              <li class="nav-item">
              <router-link to="/events" class="nav-link" :class="{ active: $route.path === '/events' }">Events</router-link>
            </li>                  
          </ul>
          <router-link to="/join" class="btn btn-secondary ms-3 " :class="{ active: $route.path === '/join' }">Join</router-link>
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
