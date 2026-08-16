<template>
  <div class="admin-applications-page">
    <AdminApplicationsTabs active="applications" :admin="demoIdentity.role === 'admin'" />
    <DemoIdentitySwitcher v-if="application?.isDemo" @reset="loadApplication" />
    <div v-if="loading" class="applications-queue applications-state" role="status"><span class="applications-spinner"></span><strong>Loading application</strong></div>
    <div v-else-if="error" class="applications-queue applications-state applications-state--error" role="alert"><strong>Application could not be loaded</strong><p>{{ error }}</p><button class="application-retry" type="button" @click="loadApplication">Try again</button></div>
    <div v-else-if="!application" class="applications-queue applications-state"><span class="state-icon" aria-hidden="true">🔎</span><strong>Application not found</strong><p>No admin application matches “{{ applicationId }}”. Check the reference or return to the applications queue.</p><RouterLink class="application-back-link" :to="{ name: 'AdminApplications' }">Return to Applications</RouterLink></div>
    <template v-else>
    <ApplicationSummaryHeader :application="application" />
    <div class="application-detail-grid">
      <div class="application-detail-main">
        <ApplicationSection eyebrow="Applicant information" title="Identity and contact"><dl class="applicant-info-grid"><div><dt>Display name</dt><dd>{{ application.identity.displayName }}</dd></div><div><dt>Creator name</dt><dd>{{ application.identity.creatorName }}</dd></div><div><dt>Email</dt><dd><a :href="`mailto:${application.identity.email}`">{{ application.identity.email }}</a><small v-if="!application.isDemo">{{ application.emailStatusLabel }}</small></dd></div><div><dt>Discord</dt><dd>{{ application.identity.discord }}</dd></div><div><dt>Country / region</dt><dd>{{ application.identity.country || 'Not provided' }}</dd></div><div><dt>Timezone</dt><dd>{{ application.identity.timezone }}</dd></div><div><dt>Age range</dt><dd>{{ application.identity.ageRange || 'Not provided' }}</dd></div><div><dt>Pronouns</dt><dd>{{ application.identity.pronouns || 'Not provided' }}</dd></div></dl></ApplicationSection>
        <ApplicationSection eyebrow="Submitted answers" title="Application responses"><SubmittedAnswers :answers="application.answers" /></ApplicationSection>
        <ApplicationSection v-if="!application.isDemo" eyebrow="Public presence" title="Creator profiles"><dl class="metadata-list"><div v-for="profile in application.creatorProfiles" :key="`${profile.platform}-${profile.displayOrder}`"><dt>{{ profile.customPlatformLabel || profile.platform }}</dt><dd><a v-if="profile.profileUrl" :href="profile.profileUrl" target="_blank" rel="noopener noreferrer">{{ profile.displayNameOrHandle }}</a><span v-else>{{ profile.displayNameOrHandle }}</span><small v-if="profile.relationshipToServer">{{ profile.relationshipToServer }}</small></dd></div></dl></ApplicationSection>
        <ApplicationSection v-if="!application.isDemo" eyebrow="Availability" title="Stream and content schedule"><dl class="metadata-list"><div v-for="item in application.schedules" :key="item.displayOrder"><dt>{{ item.contentType || 'Public content' }}</dt><dd>{{ item.scheduleVaries ? 'Schedule varies' : `${item.dayOfWeek || 'Day not supplied'} ${item.startLocalTime || ''}–${item.endLocalTime || ''}` }} · {{ item.applicantTimeZone }}<small v-if="item.nextPlannedPublicStream">Next planned: {{ formatDate(item.nextPlannedPublicStream) }}</small><small v-if="item.additionalNotes">{{ item.additionalNotes }}</small></dd></div></dl></ApplicationSection>
        <AdminReviewProgressPanel v-if="application.isDemo && demoIdentity.role === 'admin'" :application="application" @reload="loadApplication" />
        <ReviewWorkflowPanel v-if="application.isDemo" :application="application" />
      </div>
      <aside class="application-detail-aside">
        <ApplicationSection eyebrow="Administration" title="Metadata"><dl class="metadata-list"><div><dt>Reference</dt><dd>{{ application.reference }}</dd></div><div><dt>Submitted</dt><dd>{{ formatDate(application.submittedAt) }}</dd></div><div><dt>Created date</dt><dd>{{ formatDate(application.metadata.createdAt) }}</dd></div><div><dt>Updated date</dt><dd>{{ formatDate(application.metadata.updatedAt) }}</dd></div><div><dt>Form version</dt><dd>{{ application.metadata.formVersion }}</dd></div><div><dt>Current status</dt><dd><ApplicationStatusBadge :status="application.status" /></dd></div><div v-if="!application.isDemo"><dt>Consent</dt><dd>{{ application.consent.version }} · {{ formatDate(application.consent.consentedAt) }}</dd></div><div><dt>Audit history</dt><dd>{{ application.auditEvents.length }} events</dd></div></dl></ApplicationSection>
      </aside>
    </div>
    </template>
  </div>
</template>
<script>
import AdminApplicationsTabs from './components/AdminApplicationsTabs.vue'; import ApplicationSummaryHeader from './components/ApplicationSummaryHeader.vue'; import ApplicationSection from './components/ApplicationSection.vue'; import SubmittedAnswers from './components/SubmittedAnswers.vue'; import DemoIdentitySwitcher from './components/DemoIdentitySwitcher.vue'; import ReviewWorkflowPanel from './components/ReviewWorkflowPanel.vue'; import AdminReviewProgressPanel from './components/AdminReviewProgressPanel.vue'; import ApplicationStatusBadge from './components/ApplicationStatusBadge.vue'; import { demoWorkflow, getAdminApplication, getDemoIdentity } from './applicationAdminData.js';
export default {
  name: 'AdminApplicationDetail', components: { AdminApplicationsTabs, ApplicationSummaryHeader, ApplicationSection, SubmittedAnswers, DemoIdentitySwitcher, ReviewWorkflowPanel, AdminReviewProgressPanel, ApplicationStatusBadge }, props: { applicationId: { type: String, required: true } },
  data: () => ({ application: null, loading: true, error: '', workflow: demoWorkflow }),
  computed: { demoIdentity() { this.workflow.revision; return getDemoIdentity(); } },
  watch: { applicationId: 'loadApplication' }, mounted() { this.loadApplication(); },
  methods: {
    async loadApplication() { this.loading = true; this.error = ''; try { this.application = await getAdminApplication(this.applicationId); } catch { this.application = null; this.error = 'Please try again. The stored application could not be read.'; } finally { this.loading = false; } },
    formatDate(value) { return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/London' }).format(new Date(value)); },
  },
};
</script>
<style src="./AdminApplications.css"></style>
