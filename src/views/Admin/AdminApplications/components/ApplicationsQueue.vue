<template>
  <section class="applications-queue" aria-labelledby="applications-queue-title" aria-live="polite">
    <h2 id="applications-queue-title" class="sr-only">Applications queue</h2>
    <div v-if="loading" class="applications-state" role="status"><span class="applications-spinner"></span><strong>Loading applications</strong></div>
    <div v-else-if="error" class="applications-state applications-state--error" role="alert"><strong>Applications could not be loaded</strong><p>{{ error }}</p></div>
    <div v-else-if="!applications.length" class="applications-state"><span class="state-icon" aria-hidden="true">📋</span><strong>{{ emptyTitle }}</strong><p>{{ emptyCopy }}</p></div>
    <div v-else class="applications-table-scroll">
      <table class="applications-table">
        <thead><tr><th>Applicant</th><th>Pathway</th><th>Submitted</th><th>Status</th><th>Reference</th><th>Reviews</th></tr></thead>
        <tbody><tr v-for="application in applications" :key="application.id" tabindex="0" @click="open(application)" @keydown.enter="open(application)">
          <td><strong>{{ application.applicantName }}</strong><small>{{ application.applicantEmail }}</small></td><td>{{ pathwayLabel(application.pathway) }}</td><td>{{ formatDate(application.submittedAt) }}</td>
          <td><ApplicationStatusBadge :status="application.status" /></td><td>{{ application.reference }}</td><td>{{ reviewProgress(application) }}</td>
        </tr></tbody>
      </table>
    </div>
  </section>
</template>

<script>
import ApplicationStatusBadge from './ApplicationStatusBadge.vue';
import { APPLICATION_PATHWAYS } from '../applicationTypes.js';
export default {
  name: 'ApplicationsQueue', components: { ApplicationStatusBadge },
  props: { applications: { type: Array, default: () => [] }, loading: Boolean, error: { type: String, default: '' }, emptyReason: { type: String, default: 'no-applications' } },
  emits: ['open'],
  computed: {
    emptyTitle() { return this.emptyReason === 'filtered' ? 'No applications match these filters' : 'No applications yet'; },
    emptyCopy() { return this.emptyReason === 'filtered' ? 'Clear or change the search and filters to see applications.' : 'Submitted applications will appear here when they are available.'; },
  },
  methods: { pathwayLabel(value) { return APPLICATION_PATHWAYS.find((item) => item.value === value)?.label || value; }, formatDate(value) { return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/London' }).format(new Date(value)); }, reviewProgress(item) { const claimed = item.reviewerSlots?.filter((slot) => !['available', 'closed'].includes(slot.state)).length || 0; return item.completedReviews === 3 ? '3 of 3 completed' : `${claimed} claimed · ${item.completedReviews} completed`; }, open(item) { this.$emit('open', item); } },
};
</script>
