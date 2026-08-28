<template>
  <section class="builder-panel outputs-panel">
    <header class="builder-panel__heading"><strong>◎ &nbsp; Draft &amp; Live Overlay</strong><small>Browser Source</small></header>
    <div class="publication-status" aria-live="polite">
      <span><b>Draft</b>{{ draftDirty ? 'Unsaved changes' : `Saved · Revision ${draftRevision}` }}</span>
      <span><b>Live Overlay</b>{{ !publicationId ? 'Not published' : liveStatusUnknown ? 'Status unknown · update recommended' : liveOutOfDate ? 'Update available' : 'Up to date' }}</span>
      <span><b>Last published</b>{{ lastPublishedLabel }}</span>
    </div>
    <article>
      <div>
        <b>Selected Scene</b>
        <span>{{ selectedSceneName }}<br>Transparent background · {{ resolution.width }} × {{ resolution.height }}</span>
        <small v-if="publicationId">Active: {{ activeSceneName || activeSceneId }} · Revision {{ revision }}</small>
        <small v-else>No active Browser Source for this Brand</small>
      </div>
      <div class="source-actions">
        <button v-if="!publicationId" :disabled="busy" @click="$emit('create')">Create Browser Source</button>
        <template v-else>
          <button :disabled="busy" @click="$emit('update')">{{ draftDirty ? 'Save & Update Live' : selectedSceneId === activeSceneId ? 'Update Live' : 'Update Live Scene' }}</button>
          <button v-if="sourceUrl" @click="$emit('copy')">Copy URL</button>
          <button v-if="sourceUrl" @click="$emit('open')">Open</button>
          <button :disabled="busy" @click="$emit('rotate')">Rotate / Reissue URL</button>
          <button class="danger" :disabled="busy" @click="$emit('revoke')">Revoke</button>
        </template>
      </div>
    </article>
    <p v-if="publicationId && !sourceUrl">The active URL is intentionally hidden after issuance. Rotate only if the original URL was lost or exposed.</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <p>One stable URL renders the Brand's active scene. <strong>Scene resolution: {{ resolution.width }} × {{ resolution.height }}</strong> — use these exact Width and Height values in OBS.</p>
    <p>Save Draft preserves editable work. Updating Live publishes the selected saved scene to the stable OBS URL.</p>
    <ul class="browser-source-settings">
      <li>FPS: 30</li>
      <li>Custom CSS: none</li>
      <li>Shutdown source when not visible: recommended</li>
      <li>Refresh browser when scene becomes active: recommended, so the latest published revision is fetched</li>
    </ul>
  </section>
</template>

<script setup>
import { computed } from 'vue'
const props =
defineProps({
  resolution: Object, sourceUrl: String, publicationId: String, revision: Number, busy: Boolean, error: String,
  selectedSceneId: String, selectedSceneName: String, activeSceneId: String, activeSceneName: String,
  draftDirty: Boolean, draftRevision: Number, liveOutOfDate: Boolean, liveStatusUnknown: Boolean, lastPublishedAt: String,
})
defineEmits(['create', 'update', 'replace', 'copy', 'open', 'rotate', 'revoke', 'preview'])
const lastPublishedLabel = computed(() => props.lastPublishedAt ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(props.lastPublishedAt)) : 'Never')
</script>

<style scoped>
.publication-status{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:9px 10px;border-bottom:1px solid rgba(148,163,184,.1)}
.publication-status span{display:grid;gap:3px;color:#94a3b8;font-size:9px}.publication-status b{color:#ddd6fe;font-size:8px;text-transform:uppercase;letter-spacing:.06em}
</style>
