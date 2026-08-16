<template><nav class="applications-tabs" aria-label="Admin Applications sections"><RouterLink v-for="tab in visibleTabs" :key="tab.name" :to="{ name: tab.name }" :aria-current="active === tab.key ? 'page' : undefined" :class="{ active: active === tab.key }">{{ tab.label }}</RouterLink></nav></template>
<script>
const TABS = [{ key: 'applications', label: 'Applications', name: 'AdminApplications' }, { key: 'reviews', label: 'Review progress', name: 'AdminApplicationReviews', adminOnly: true }, { key: 'reviewers', label: 'Reviewer performance', name: 'AdminReviewerPerformance', adminOnly: true }, { key: 'inductions', label: 'Inductions', name: 'AdminInductions', adminOnly: true }];
export default { name: 'AdminApplicationsTabs', props: { active: { type: String, required: true }, admin: { type: Boolean, default: true } }, computed: { visibleTabs() { return TABS.filter((tab) => this.admin || !tab.adminOnly); } } };
</script>
