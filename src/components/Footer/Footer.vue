<template>
  <footer class="site-footer mt-5">
    <div class="container">
      <div class="row footer-inner py-4">
        <div class="col-md-6">
          <p class="mb-0">&copy; <span id="year">{{ currentYear }}</span> Ravens — All rights reserved</p>
        </div>
        <div class="col-md-6 text-md-end">
          <div class="footer-links">
            <router-link to="/" class="me-3">Home</router-link>
            <router-link to="/about" class="me-3">About</router-link>
            <router-link to="/contact">Contact</router-link>
            <router-link to="/privacypolicy">Privacy Policy</router-link>
          </div>
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
