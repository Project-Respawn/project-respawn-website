<script setup>
defineProps({
  partner: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <section class="partner-header-card">
    <div class="partner-header-content">
      <div class="partner-brand-logo">
        {{ partner.logoText }}
      </div>

      <div class="partner-header-copy">
        <h1>
          Welcome back, {{ partner.name }} 👋
        </h1>

        <div class="partner-header-meta">
          <span class="partner-type">
            {{ partner.type }}
          </span>

          <span>•</span>

          <span>
            Active since {{ partner.activeSince }}
          </span>
        </div>
      </div>
    </div>

    <RouterLink
      :to="partner.publicProfileUrl"
      class="partner-outline-button"
    >
      View public profile ↗
    </RouterLink>
  </section>
</template>