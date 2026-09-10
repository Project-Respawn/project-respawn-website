import { onBeforeUnmount, ref, watch } from 'vue'
import { generateClient } from 'aws-amplify/data'
import { getTwitchConnectionStatus } from '../services/twitchConnection.js'
import { createOverlaySourceConnection, fetchOverlaySource, getActiveOverlayPublication, getTwitchOverlayConfig } from '../services/overlaySource.js'
import { widgetEventBus } from '../overlays/widgetEventBus.js'

// Editor uses the same credential-bound stream as the published source; tests stay local.
export function useOverlayChatPreview(workspaceId, brandId, sourceUrl) {
  const status = ref('Loading Twitch chat…'), config = ref(null), context = ref('')
  let generation = 0, connection = null
  watch([workspaceId, brandId, sourceUrl], async () => {
    const request = ++generation
    connection?.close(); connection = null; config.value = null
    context.value = `${workspaceId.value}:${brandId.value}`
    status.value = 'Loading Twitch chat…'
    if (!workspaceId.value || !brandId.value) { status.value = 'Select a Creator Brand to connect chat'; return }
    try {
      const workspace = workspaceId.value, brand = brandId.value
      const [settings, twitch, active] = await Promise.all([getTwitchOverlayConfig(workspace, brand), getTwitchConnectionStatus(generateClient(), brand), getActiveOverlayPublication(workspace, brand)])
      if (request !== generation) return
      config.value = settings.config?.chat || null
      if (!twitch.connected) { status.value = 'Twitch not connected · Test Chat works locally'; return }
      if (twitch.health?.chatReadAvailable !== true) { status.value = 'Chat connection unavailable · Test Chat works locally'; return }
      if (!active.publication?.browserSourceUrl) { status.value = 'Create or restore your Browser Source to preview live chat'; return }
      if (active.publication.workspaceId !== workspace || active.publication.brandId !== brand) throw new Error('Publication context mismatch')
      const url = new URL(active.publication.browserSourceUrl), match = url.pathname.match(/^\/overlay-source\/([^/]+)$/)
      if (!match) throw new Error('Invalid source URL')
      const credential = decodeURIComponent(match[1]), source = await fetchOverlaySource(credential)
      if (request !== generation) return
      connection = createOverlaySourceConnection({ websocketUrl: source.websocketUrl, credential,
        onEvent(event) { if (request === generation && event.topic === 'chat.message') { status.value = 'Live Twitch chat'; widgetEventBus.publish(event) } },
        async onReconnect() { if (request === generation) status.value = 'Reconnecting live chat…' },
      })
      status.value = 'Waiting for Twitch chat messages'
    } catch { if (request === generation) status.value = 'Could not load live chat · Test Chat works locally' }
  }, { immediate: true })
  onBeforeUnmount(() => { generation++; connection?.close() })
  return { status, config, context }
}
