<template>
  <section class="therapist-activity-controls">
    <label class="therapist-activity-search">
      <span aria-hidden="true">⌕</span>

      <input
        :value="search"
        type="search"
        placeholder="Search activity..."
        aria-label="Search activity"
        @input="
          $emit(
            'update:search',
            $event.target.value
          )
        "
      />
    </label>

    <div
      class="therapist-activity-filter-list"
      aria-label="Activity filters"
    >
      <button
        v-for="filter in filters"
        :key="filter.id"
        type="button"
        class="therapist-activity-filter"
        :class="{
          'therapist-activity-filter--active':
            activeFilter === filter.id,
        }"
        @click="$emit('update:activeFilter', filter.id)"
      >
        <span>{{ filter.icon }}</span>

        {{ filter.label }}

        <small v-if="filter.count !== undefined">
          {{ filter.count }}
        </small>

        <span
          v-if="filter.locked"
          class="therapist-activity-filter__locked"
          title="Not currently shared"
        >
          🔒
        </span>
      </button>
    </div>

    <label class="therapist-activity-date">
      <span>Date range</span>

      <select
        :value="dateRange"
        @change="
          $emit(
            'update:dateRange',
            $event.target.value
          )
        "
      >
        <option value="since-session">
          Since last session
        </option>

        <option value="7-days">
          Last 7 days
        </option>

        <option value="30-days">
          Last 30 days
        </option>

        <option value="all">
          All activity
        </option>
      </select>
    </label>
  </section>
</template>

<script setup>
defineProps({
  search: {
    type: String,
    default: "",
  },

  activeFilter: {
    type: String,
    default: "all",
  },

  dateRange: {
    type: String,
    default: "since-session",
  },

  filters: {
    type: Array,
    required: true,
  },
});

defineEmits([
  "update:search",
  "update:activeFilter",
  "update:dateRange",
]);
</script>