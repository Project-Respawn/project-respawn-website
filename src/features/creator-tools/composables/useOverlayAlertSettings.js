import { computed, ref, watch } from 'vue'
import { ALERT_KINDS, normalizeAlertConfiguration } from '../overlays/alertPresentation.js'
import { getTwitchOverlayConfig, updateTwitchOverlayConfig } from '../services/overlaySource.js'

// Drafts here are only an editing buffer for the existing Brand config, never widget settings.
export function useOverlayAlertSettings(workspaceId, brandId) {
  const configs = ref({}), saved = ref({}), loading = ref(false), saving = ref(false), error = ref('')
  let generation = 0
  const dirty = computed(() => ALERT_KINDS.some(kind => JSON.stringify(configs.value[kind]) !== saved.value[kind]))
  watch([workspaceId, brandId], async () => {
    const request = ++generation
    configs.value = {}; saved.value = {}; error.value = ''
    loading.value = false
    if (!workspaceId.value || !brandId.value) return
    loading.value = true
    try {
      const result = await getTwitchOverlayConfig(workspaceId.value, brandId.value)
      if (request !== generation) return
      for (const kind of ALERT_KINDS) {
        configs.value[kind] = normalizeAlertConfiguration(result.config?.alerts?.[kind])
        saved.value[kind] = JSON.stringify(configs.value[kind])
      }
    } catch (failure) { if (request === generation) error.value = failure?.message || 'Could not load alert settings.' }
    finally { if (request === generation) loading.value = false }
  }, { immediate: true })

  async function save(kind) {
    if (saving.value || loading.value || !configs.value[kind]) return false
    const request = generation, workspace = workspaceId.value, brand = brandId.value
    const snapshot = JSON.stringify(configs.value[kind]), draft = JSON.parse(snapshot)
    saving.value = true; error.value = ''
    try {
      // Merge this alert into the latest record to preserve other alerts, chat and TTS.
      const latest = await getTwitchOverlayConfig(workspace, brand)
      if (request !== generation) return false
      const result = await updateTwitchOverlayConfig(workspace, brand, { ...latest.config, alerts: { ...latest.config.alerts, [kind]: { ...latest.config.alerts?.[kind], ...draft } } })
      if (request !== generation) return false
      const normalized = normalizeAlertConfiguration(result.config?.alerts?.[kind])
      saved.value[kind] = JSON.stringify(normalized)
      if (JSON.stringify(configs.value[kind]) === snapshot) configs.value[kind] = normalized
      return true
    } catch (failure) { if (request === generation) error.value = failure?.message || 'Could not save alert settings.'; return false }
    finally { saving.value = false }
  }
  return { configs, saved, loading, saving, error, dirty, save }
}
