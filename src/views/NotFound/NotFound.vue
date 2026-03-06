<template>
  <main class="container">
    <section class="error-hero">
      <div class="error-card">
        <div class="error-code">404</div>
        <div class="error-message">Page not found. The page you're looking for doesn't exist.</div>
        <div class="error-actions">
          <router-link class="btn btn-primary" to="/">Home</router-link>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
</script>

<style scoped src="./NotFound.css"></style>
