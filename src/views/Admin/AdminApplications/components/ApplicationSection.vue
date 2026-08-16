<template><section class="application-panel"><p class="application-eyebrow">{{ eyebrow }}</p><h2>{{ title }}</h2><slot /></section></template>
<script>export default { name: 'ApplicationSection', props: { eyebrow: { type: String, default: '' }, title: { type: String, required: true } } };</script>
