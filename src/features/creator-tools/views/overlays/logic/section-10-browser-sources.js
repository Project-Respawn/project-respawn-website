import { ref } from 'vue'
import { refreshAccessContext } from '@/composables/useAccessContext.js'
import { createTestOverlayEvent } from '../../../overlays/overlayEventContract.js'
import { createOverlayPublication, revokeOverlayPublication, sendOverlayTestEvent, updateOverlayPublication } from '../../../services/overlaySource.js'

export function useBrowserSources({ notice, previewMode, project, scene }) {
  const publicationId = ref(''), sourceUrl = ref(''), sourceRevision = ref(0), sourceBusy = ref(false), sourceError = ref('')
  async function createTestSource() {
    sourceBusy.value = true; sourceError.value = ''
    try {
      const access = await refreshAccessContext({ force: true }), workspaceId = access.workspaces?.[0]?.id, brandId = access.brands?.[0]?.brandId
      if (!workspaceId || !brandId) throw new Error('An accessible Creator Workspace and Brand are required')
      const result = await createOverlayPublication({ workspaceId, brandId, overlayId: project.id || '', sceneId: scene.value.id, sceneSnapshot: scene.value })
      publicationId.value = result.publicationId; sourceUrl.value = result.browserSourceUrl; sourceRevision.value = result.revision
      notice.value = 'TEST Browser Source created · Copy the URL into OBS'
    } catch (error) { sourceError.value = error?.message || 'Could not create TEST Browser Source'; notice.value = sourceError.value } finally { sourceBusy.value = false }
  }
  async function updateTestSource() { sourceBusy.value = true; sourceError.value = ''; try { if (!publicationId.value) throw new Error('Create a TEST Browser Source first'); const result = await updateOverlayPublication(publicationId.value, scene.value); sourceRevision.value = result.revision; notice.value = `TEST Browser Source updated to revision ${result.revision} · Refresh the source`; } catch (error) { sourceError.value = error?.message || 'Could not update TEST Browser Source'; notice.value = sourceError.value } finally { sourceBusy.value = false } }
  async function copySourceUrl() { if (!sourceUrl.value) return; await navigator.clipboard?.writeText(sourceUrl.value); notice.value = 'Browser Source URL copied' }
  function openSourceUrl() { if (sourceUrl.value) window.open(sourceUrl.value, '_blank', 'noopener,noreferrer') }
  async function revokeTestSource() { if (!publicationId.value) return; sourceBusy.value = true; try { await revokeOverlayPublication(publicationId.value); publicationId.value = ''; sourceUrl.value = ''; sourceRevision.value = 0; notice.value = 'TEST Browser Source revoked'; } catch (error) { sourceError.value = error?.message || 'Could not revoke TEST Browser Source'; notice.value = sourceError.value } finally { sourceBusy.value = false } }
  async function sendSourceTest(type) { if (!publicationId.value) { notice.value = 'Create a TEST Browser Source first'; return false } try { const result = await sendOverlayTestEvent(publicationId.value, createTestOverlayEvent(type)); notice.value = `${type} sent to ${result.delivered} Browser Source connection${result.delivered === 1 ? '' : 's'}`; return true } catch (error) { sourceError.value = error?.message || 'Could not send test event'; notice.value = sourceError.value; return false } }
  function openBrowserSourcePreview() { previewMode.value = true }
  return { publicationId, sourceUrl, sourceRevision, sourceBusy, sourceError, createTestSource, updateTestSource, copySourceUrl, openSourceUrl, revokeTestSource, sendSourceTest, openBrowserSourcePreview }
}
