<template>
  <div class="submitted-answer-sections">
    <section v-for="group in groupedAnswers" :key="group.section" class="answer-section">
      <h3>{{ group.section }}</h3>
      <dl class="answer-list">
        <div v-for="item in group.answers" :key="item.key" class="answer-item" :class="{ 'answer-item--long': item.type === 'long-text' }">
          <dt>{{ item.label }}</dt>
          <dd v-if="item.type === 'link' && item.value"><a :href="safeUrl(item.value)" target="_blank" rel="noopener noreferrer">{{ item.value }}</a></dd>
          <dd v-else-if="item.type === 'links' && item.value?.length" class="answer-values"><a v-for="link in item.value" :key="link" :href="safeUrl(link)" target="_blank" rel="noopener noreferrer">{{ link }}</a></dd>
          <dd v-else-if="item.type === 'list' && item.value?.length" class="answer-chips"><span v-for="value in item.value" :key="value">{{ value }}</span></dd>
          <dd v-else>{{ displayValue(item) }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>
<script>
export default {
  name: 'SubmittedAnswers', props: { answers: { type: Array, default: () => [] } },
  computed: { groupedAnswers() { const groups = new Map(); [...this.answers].sort((a, b) => a.order - b.order).forEach((item) => { if (!groups.has(item.section)) groups.set(item.section, []); groups.get(item.section).push(item); }); return [...groups].map(([section, answers]) => ({ section, answers })); } },
  methods: {
    displayValue(item) { if (item.displayValue !== undefined) return item.displayValue; if (item.value === null || item.value === undefined || item.value === '') return 'Not provided'; if (typeof item.value === 'boolean') return item.value ? 'Yes' : 'No'; return String(item.value); },
    safeUrl(value) { try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : '#'; } catch { return '#'; } },
  },
};
</script>
