<template>
  <footer class="site-footer mt-5">
    <div class="container">
      <div class="row py-4 align-items-center">
        <div class="col-md-6">
          <p class="mb-0">&copy; <span id="year">{{ currentYear }}</span> Ravens — All rights reserved</p>
        </div>
        <div class="col-md-6">
          <nav class="nav justify-content-md-end">
            <router-link to="/" class="nav-link px-2">Home</router-link>
            <router-link to="/about" class="nav-link px-2">About</router-link>
            <router-link to="/contact" class="nav-link px-2">Contact</router-link>
            <router-link to="/privacy-policy" class="nav-link px-2">Privacy Policy</router-link>
          </nav>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'

const currentYear = ref(new Date().getFullYear())
</script>

<style scoped src="./Footer.css"></style>
