<template>
  <header class="application-detail-header">
    <RouterLink class="application-back-link" :to="{ name: 'AdminApplications' }">← Applications</RouterLink>
    <div class="application-detail-heading"><div><p class="application-eyebrow">{{ application?.reference }}</p><h1>{{ application?.applicantName }}</h1><p>{{ application?.pathwayLabel }} · Submitted {{ formatDate(application?.submittedAt) }}</p></div><div class="application-header-state"><span class="demo-data-badge">Demo data</span><ApplicationStatusBadge :status="application?.status" /><strong>{{ application?.completedReviews || 0 }} of 3 reviews completed</strong></div></div>
  </header>
</template>
<script>
import ApplicationStatusBadge from './ApplicationStatusBadge.vue';
export default { name: 'ApplicationSummaryHeader', components: { ApplicationStatusBadge }, props: { application: { type: Object, required: true } }, methods: { formatDate(value) { return value ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/London' }).format(new Date(value)) : ''; } } };
</script>
