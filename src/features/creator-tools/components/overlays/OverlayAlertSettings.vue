<template>
  <section v-if="alert" class="alert-settings">
    <strong>Alert Settings · {{ alert.name }}</strong>
    <small>Shared across this Brand. Position, size and layers are saved separately in Layout.</small>
    <p v-if="loading">Loading alert settings…</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <template v-if="configuration">
      <label>Enabled <input v-model="configuration.enabled" type="checkbox"></label>
      <label>Title template <input v-model="configuration.titleTemplate" maxlength="240"></label>
      <label>Message template <textarea v-model="configuration.messageTemplate" maxlength="500"></textarea></label>
      <label>Image / GIF HTTPS URL <input v-model.trim="configuration.mediaUrl" type="url"></label>
      <label>Sound HTTPS URL <input v-model.trim="configuration.soundUrl" type="url"></label>
      <label>Volume <input v-model.number="configuration.volume" type="range" min="0" max="1" step="0.01"></label>
      <label>Duration (seconds) <input v-model.number="configuration.duration" type="number" min="1" max="60"></label>
      <label>Entry animation <select v-model="configuration.entryAnimation"><option v-for="value in ALERT_ANIMATIONS" :key="value">{{ value }}</option></select></label>
      <label>Exit animation <select v-model="configuration.exitAnimation"><option v-for="value in ALERT_ANIMATIONS" :key="value">{{ value }}</option></select></label>
      <p v-if="dirty">Unsaved Brand alert settings</p>
      <button :disabled="loading || saving || !selectedDirty" @click="saveSelected">{{ saving ? 'Saving…' : 'Save Alert Settings' }}</button>
      <button @click="previewNonce++">Preview Alert</button>
      <template v-if="FIRST_PARTY_ALERT_DEFAULTS[alert.kind]">
        <small>Empty image, sound and text fields use Project Respawn defaults.</small>
        <button :disabled="saving" @click="resetPresentation">Reset to Default</button>
      </template>
      <p v-if="message" role="status">{{ message }}</p>
      <AlertPresentation v-if="previewNonce" :event="previewEvent" :configuration="configuration" :play-audio="true" />
    </template>
  </section>
</template>
<script setup>
import { computed, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue'
import AlertPresentation from './AlertPresentation.vue'
import { ALERT_WIDGETS } from '../../overlays/alertWidgets.js'
import { FIRST_PARTY_ALERT_DEFAULTS, resetAlertPresentationOverrides } from '../../overlays/firstPartyAlertDefaults.js'
import { ALERT_ANIMATIONS, previewEventForKind } from '../../overlays/alertPresentation.js'
import { useOverlayAlertSettings } from '../../composables/useOverlayAlertSettings.js'
const props = defineProps({ widgetType: String, workspaceId: String, brandId: String })
const { configs, saved, loading, saving, error, dirty, save } = useOverlayAlertSettings(toRef(props, 'workspaceId'), toRef(props, 'brandId'))
const alert = computed(() => ALERT_WIDGETS[props.widgetType])
const configuration = computed(() => configs.value[alert.value?.kind])
const selectedDirty = computed(() => configuration.value && JSON.stringify(configuration.value) !== saved.value[alert.value.kind])
const previewNonce = ref(0), message = ref('')
const previewEvent = computed(() => ({ ...previewEventForKind(alert.value.kind), id: `local-preview-${previewNonce.value}` }))
watch(() => [props.widgetType, props.brandId], () => { previewNonce.value = 0; message.value = '' })
async function saveSelected() { const kind = alert.value.kind; message.value = ''; if (await save(kind) && alert.value?.kind === kind) message.value = 'Brand alert settings saved' }
function resetPresentation() { configs.value[alert.value.kind] = resetAlertPresentationOverrides(alert.value.kind, configuration.value); message.value = 'Defaults restored in preview. Save Alert Settings to keep this change.' }
function warnUnsaved(event) { if (dirty.value) { event.preventDefault(); event.returnValue = '' } }
onMounted(() => window.addEventListener('beforeunload', warnUnsaved))
onBeforeUnmount(() => window.removeEventListener('beforeunload', warnUnsaved))
</script>
<style scoped>
.alert-settings{display:grid;gap:8px;padding:12px}.alert-settings label{display:grid;gap:4px}.alert-settings input,.alert-settings textarea,.alert-settings select{max-width:100%;min-width:0}
</style>
