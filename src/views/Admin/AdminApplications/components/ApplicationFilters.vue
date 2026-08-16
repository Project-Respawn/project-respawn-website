<template>
  <form class="application-filters" role="search" @submit.prevent>
    <label class="application-search">
      <span class="sr-only">Search applications</span>
      <span aria-hidden="true">🔍</span>
      <input :value="search" type="search" placeholder="Search applicant or reference" @input="$emit('update:search', $event.target.value)" />
    </label>
    <label>
      <span class="sr-only">Filter by pathway</span>
      <select :value="pathway" @change="$emit('update:pathway', $event.target.value)">
        <option value="">All pathways</option>
        <option v-for="item in activePathways" :key="item.value" :value="item.value">{{ item.label }}</option>
      </select>
    </label>
    <label>
      <span class="sr-only">Filter by status</span>
      <select :value="status" @change="$emit('update:status', $event.target.value)">
        <option value="">All statuses</option>
        <option v-for="item in statuses" :key="item.value" :value="item.value">{{ item.label }}</option>
      </select>
    </label>
    <label>
      <span class="sr-only">Sort applications</span>
      <select :value="sort" @change="$emit('update:sort', $event.target.value)">
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
    </label>
  </form>
</template>

<script>
import { APPLICATION_PATHWAYS, APPLICATION_STATUSES } from '../applicationTypes.js';
export default {
  name: 'ApplicationFilters',
  props: { search: String, pathway: String, status: String, sort: String },
  emits: ['update:search', 'update:pathway', 'update:status', 'update:sort'],
  data: () => ({ statuses: APPLICATION_STATUSES, activePathways: APPLICATION_PATHWAYS.filter((item) => item.active) }),
};
</script>
