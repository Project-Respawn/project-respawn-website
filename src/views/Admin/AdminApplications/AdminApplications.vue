<template>
  <div class="admin-applications-page">
    <AdminApplicationsTabs active="applications" />
    <header class="applications-page-header"><div><h1>Applications</h1><p>Manage submitted programme applications and follow their review progress.</p></div><span class="demo-data-badge">Live sandbox data</span></header>
    <section class="application-summary-grid" aria-label="Application status summary"><article v-for="item in summary" :key="item.value"><strong>{{ item.count }}</strong><span>{{ item.label }}</span></article></section>
    <div class="applications-shortcuts"><RouterLink :to="{ name: 'AdminApplicationReviews' }">View review progress</RouterLink><RouterLink :to="{ name: 'AdminInductions' }">View inductions</RouterLink></div>
    <ApplicationFilters v-model:search="filters.search" v-model:pathway="filters.pathway" v-model:status="filters.status" v-model:sort="filters.sort" />
    <ApplicationsQueue :applications="filteredApplications" :loading="loading" :error="error" :empty-reason="emptyReason" @open="openApplication" />
    <nav v-if="!loading && !error && (page > 1 || nextToken)" class="applications-pagination" aria-label="Applications pages"><button class="application-retry" type="button" :disabled="page === 1" @click="previousPage">Previous</button><span>Page {{ page }}</span><button class="application-retry" type="button" :disabled="!nextToken" @click="nextPage">Next</button></nav>
  </div>
</template>
<script>
import ApplicationFilters from './components/ApplicationFilters.vue'; import ApplicationsQueue from './components/ApplicationsQueue.vue';
import AdminApplicationsTabs from './components/AdminApplicationsTabs.vue';
import { filterAndSortApplications, getApplicationDetailRoute, getApplicationStatusSummary, listAdminApplicationsPage } from './applicationAdminData.js';
export default {
  name: 'AdminApplications', components: { ApplicationFilters, ApplicationsQueue, AdminApplicationsTabs },
  data: () => ({ filters: { search: '', pathway: '', status: '', sort: 'newest' }, applications: [], loading: true, error: '', page: 1, nextToken: null, pageTokens: [null] }),
  computed: {
    summary() { return getApplicationStatusSummary(this.applications); },
    filteredApplications() { return filterAndSortApplications(this.applications, this.filters); },
    hasFilters() { return Boolean(this.filters.search || this.filters.pathway || this.filters.status); },
    emptyReason() { if (this.hasFilters) return 'filtered'; return this.applications.length ? 'none' : 'no-applications'; },
  },
  mounted() { this.loadPage(); },
  methods: { async loadPage() { this.loading = true; this.error = ''; try { const result = await listAdminApplicationsPage({ real: true, limit: 25, nextToken: this.pageTokens[this.page - 1] }); this.applications = result.items; this.nextToken = result.nextToken; } catch { this.error = 'Please try again. Stored applications could not be read.'; } finally { this.loading = false; } }, nextPage() { if (!this.nextToken) return; this.pageTokens[this.page] = this.nextToken; this.page += 1; this.loadPage(); }, previousPage() { if (this.page === 1) return; this.page -= 1; this.loadPage(); }, openApplication(item) { this.$router.push(getApplicationDetailRoute(item)); } },
};
</script>
<style src="./AdminApplications.css"></style>
