<script setup>
// ============================================================
// PROJECT RESPAWN — PARTNER HEADER
// ============================================================

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

      <!-- Partner Logo -->

      <div class="partner-brand-logo">
        <img
          :src="partner.logo"
          :alt="`${partner.name} logo`"
          class="partner-brand-logo-image"
        />
      </div>

      <!-- Partner Information -->

      <div class="partner-header-copy">

        <h1>
          Welcome back, {{ partner.shortName || partner.name }} 👋
        </h1>

        <div class="partner-header-meta">

          <span class="partner-type">
            {{ partner.type }}
          </span>

          <span aria-hidden="true">
            •
          </span>

          <span>
            Active since {{ partner.activeSince }}
          </span>

        </div>

      </div>

    </div>

    <!-- Public Partner Profile -->

    <RouterLink
      :to="partner.publicProfileUrl"
      class="partner-outline-button"
    >
      View public profile ↗
    </RouterLink>

  </section>
</template>