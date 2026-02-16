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

<style scoped>
.site-footer {
  padding: 18px 0;
  border-top: 1px solid rgba(201, 180, 224, 0.1);
  margin-top: auto;
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.footer-links a {
  color: var(--muted);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: var(--text);
}

@media (max-width: 768px) {
  .footer-inner {
    flex-direction: column;
    text-align: center;
  }

  .col-md-6 {
    width: 100%;
  }

  .footer-links {
    margin-top: 1rem;
  }
}
</style>
