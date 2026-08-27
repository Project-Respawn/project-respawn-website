import { ref } from 'vue'
import { refreshAccessContext } from '@/composables/useAccessContext.js'
import { createTestOverlayEvent } from '../../../overlays/overlayEventContract.js'
import { createPublicationSceneSnapshot } from '../../../overlays/overlayPublicationSnapshot.js'
import { createOverlayPublication, getActiveOverlayPublication, revokeOverlayPublication, rotateOverlayPublicationCredential, sendOverlayTestEvent, updateOverlayPublication } from '../../../services/overlaySource.js'

export function useBrowserSources({ notice, previewMode, project, scene }) {
  const publicationId = ref(''), sourceUrl = ref(''), sourceRevision = ref(0), activeSceneId = ref(''), activeSceneName = ref(''), sourceBusy = ref(false), sourceError = ref('')
  let bindings = null
  async function resolveBindings() {
    const access = await refreshAccessContext({ force: true }), workspaceId = access.workspaces?.[0]?.id, brandId = access.brands?.[0]?.brandId
    if (!workspaceId || !brandId) throw new Error('An accessible Creator Workspace and Brand are required')
    bindings = { workspaceId, brandId }; return bindings
  }
  function applyPublication(value) {
    const publication = value?.publication || value
    publicationId.value = publication?.publicationId || ''; sourceRevision.value = Number(publication?.revision || 0)
    activeSceneId.value = publication?.sceneId || ''; activeSceneName.value = publication?.sceneName || ''
  }
  async function refreshSourceState() {
    sourceBusy.value = true; sourceError.value = ''
    try { const { workspaceId, brandId } = await resolveBindings(); applyPublication(await getActiveOverlayPublication(workspaceId, brandId)) }
    catch (error) { sourceError.value = error?.message || 'Could not load Browser Source status' }
    finally { sourceBusy.value = false }
  }
  async function createTestSource() {
    sourceBusy.value = true; sourceError.value = ''
    try {
      const { workspaceId, brandId } = bindings || await resolveBindings()
      const result = await createOverlayPublication({ workspaceId, brandId, overlayId: project.id || '', sceneId: scene.value.id, sceneSnapshot: createPublicationSceneSnapshot(scene.value) })
      applyPublication(result); sourceUrl.value = result.browserSourceUrl || ''
      notice.value = result.created === false ? 'This Brand already has an active Browser Source · Rotate only if its URL was lost' : 'TEST Browser Source created · Copy the URL into OBS'
    } catch (error) { sourceError.value = error?.message || 'Could not create TEST Browser Source'; notice.value = sourceError.value } finally { sourceBusy.value = false }
  }
  async function updateTestSource() { sourceBusy.value = true; sourceError.value = ''; try { if (!publicationId.value) throw new Error('Create a TEST Browser Source first'); const result = await updateOverlayPublication(publicationId.value, scene.value.id, createPublicationSceneSnapshot(scene.value)); applyPublication(result); notice.value = `TEST Browser Source updated to revision ${result.revision} · Refresh the source`; } catch (error) { sourceError.value = error?.message || 'Could not update TEST Browser Source'; notice.value = sourceError.value } finally { sourceBusy.value = false } }
  async function replaceActiveScene() { await updateTestSource(); notice.value = sourceError.value || `Active Browser Source scene replaced with ${scene.value.name}` }
  async function copySourceUrl() { if (!sourceUrl.value) return; await navigator.clipboard?.writeText(sourceUrl.value); notice.value = 'Browser Source URL copied' }
  function openSourceUrl() { if (sourceUrl.value) window.open(sourceUrl.value, '_blank', 'noopener,noreferrer') }
  async function revokeTestSource() { if (!publicationId.value) return; sourceBusy.value = true; try { await revokeOverlayPublication(publicationId.value); publicationId.value = ''; sourceUrl.value = ''; sourceRevision.value = 0; activeSceneId.value = ''; activeSceneName.value = ''; notice.value = 'TEST Browser Source revoked · Creating again will issue a new URL'; } catch (error) { sourceError.value = error?.message || 'Could not revoke TEST Browser Source'; notice.value = sourceError.value } finally { sourceBusy.value = false } }
  async function rotateSourceUrl() { if (!publicationId.value) return; sourceBusy.value = true; sourceError.value = ''; try { const result = await rotateOverlayPublicationCredential(publicationId.value); sourceUrl.value = result.browserSourceUrl; notice.value = 'Browser Source URL rotated · Copy the replacement URL now'; } catch (error) { sourceError.value = error?.message || 'Could not rotate Browser Source URL'; notice.value = sourceError.value } finally { sourceBusy.value = false } }
  async function sendSourceTest(type) { if (!publicationId.value) { notice.value = 'Create a TEST Browser Source first'; return false } try { const result = await sendOverlayTestEvent(publicationId.value, createTestOverlayEvent(type)); notice.value = `${type} sent to ${result.delivered} Browser Source connection${result.delivered === 1 ? '' : 's'}`; return true } catch (error) { sourceError.value = error?.message || 'Could not send test event'; notice.value = sourceError.value; return false } }
  function openBrowserSourcePreview() { previewMode.value = true }
  return { publicationId, sourceUrl, sourceRevision, activeSceneId, activeSceneName, sourceBusy, sourceError, refreshSourceState, createTestSource, updateTestSource, replaceActiveScene, copySourceUrl, openSourceUrl, rotateSourceUrl, revokeTestSource, sendSourceTest, openBrowserSourcePreview }
}
