<script setup>
defineProps({
  campaign: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <article class="partner-campaign-card">
    <div
      class="partner-campaign-image"
      :class="campaign.imageClass"
    >
      <span>PROJECT</span>
      <strong>RESPAWN</strong>
    </div>

    <div class="partner-campaign-content">
      <div class="partner-campaign-title-row">
        <div>
          <h3>
            {{ campaign.name }}
          </h3>

          <span>
            {{ campaign.category }}
          </span>
        </div>

        <span class="partner-active-badge">
          {{ campaign.status }}
        </span>
      </div>

      <div class="partner-campaign-metrics">
        <span>♙ {{ campaign.creators }} Creators</span>
        <span>◉ {{ campaign.reach }} Reach</span>
        <span>♡ {{ campaign.engagement }} Engagement</span>
      </div>

      <RouterLink
        :to="`/partner/campaigns/${campaign.id}`"
        class="partner-small-outline-button"
      >
        View campaign
      </RouterLink>
    </div>
  </article>
</template><!-- Partner Hub placeholder -->
