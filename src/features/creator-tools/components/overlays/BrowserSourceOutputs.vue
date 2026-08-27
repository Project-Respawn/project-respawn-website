<template>
  <section class="builder-panel outputs-panel">
    <header class="builder-panel__heading"><strong>◎ &nbsp; Browser Source Output</strong><small>TEST / PREVIEW</small></header>
    <article>
      <div>
        <b>Selected Scene</b>
        <span>{{ selectedSceneName }}<br>Transparent background · {{ resolution.width }} × {{ resolution.height }}</span>
        <small v-if="publicationId">Active: {{ activeSceneName || activeSceneId }} · Revision {{ revision }}</small>
        <small v-else>No active Browser Source for this Brand</small>
      </div>
      <div class="source-actions">
        <button v-if="!publicationId" :disabled="busy" @click="$emit('create')">Create Test Source</button>
        <template v-else>
          <button v-if="selectedSceneId === activeSceneId" :disabled="busy" @click="$emit('update')">Update Source</button>
          <button v-else :disabled="busy" @click="$emit('replace')">Replace Active Scene</button>
          <button v-if="sourceUrl" @click="$emit('copy')">Copy URL</button>
          <button v-if="sourceUrl" @click="$emit('open')">Open</button>
          <button :disabled="busy" @click="$emit('rotate')">Rotate / Reissue URL</button>
          <button class="danger" :disabled="busy" @click="$emit('revoke')">Revoke</button>
        </template>
      </div>
    </article>
    <p v-if="publicationId && !sourceUrl">The active URL is intentionally hidden after issuance. Rotate only if the original URL was lost or exposed.</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <p>One stable URL renders the Brand's active scene. OBS width: {{ resolution.width }}, height: {{ resolution.height }}. Custom CSS: none.</p>
  </section>
</template>

<script setup>
defineProps({
  resolution: Object, sourceUrl: String, publicationId: String, revision: Number, busy: Boolean, error: String,
  selectedSceneId: String, selectedSceneName: String, activeSceneId: String, activeSceneName: String,
})
defineEmits(['create', 'update', 'replace', 'copy', 'open', 'rotate', 'revoke', 'preview'])
</script>
