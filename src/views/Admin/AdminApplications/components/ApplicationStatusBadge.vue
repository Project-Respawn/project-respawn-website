<template>
  <span class="application-status" :class="`application-status--${status || 'unknown'}`">
    {{ label }}
  </span>
</template>

<script>
import { APPLICATION_STATUSES } from '../applicationTypes.js';

export default {
  name: 'ApplicationStatusBadge',
  props: { status: { type: String, default: '' } },
  computed: {
    label() {
      return APPLICATION_STATUSES.find((item) => item.value === this.status)?.label || 'Not available';
    },
  },
};
</script>
