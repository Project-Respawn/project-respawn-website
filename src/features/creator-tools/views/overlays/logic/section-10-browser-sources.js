import { computed, ref } from 'vue'
import { createTestOverlayEvent } from '../../../overlays/overlayEventContract.js'
import { createPublicationSceneSnapshot } from '../../../overlays/overlayPublicationSnapshot.js'
import { createOverlayPublication, getActiveOverlayPublication, revokeOverlayPublication, rotateOverlayPublicationCredential, sendOverlayTestEvent, updateOverlayPublication } from '../../../services/overlaySource.js'

export function useBrowserSources({ notice, previewMode, project, scene, dirty, revision, workspaceId, brandId, brandContext, saveDraft }) {
  const publicationId = ref(''), sourceUrl = ref(''), sourceRevision = ref(0), sourceEditorRevision = ref(null)
  const activeSceneId = ref(''), activeSceneName = ref(''), lastPublishedAt = ref(''), sourceBusy = ref(false), sourceError = ref('')
  const hasActivePublication = computed(() => Boolean(publicationId.value))
  const liveStatusUnknown = computed(() => hasActivePublication.value && sourceEditorRevision.value === null)
  const liveOutOfDate = computed(() => hasActivePublication.value && (liveStatusUnknown.value || dirty.value || sourceEditorRevision.value !== revision.value || activeSceneId.value !== scene.value?.id))

  async function resolveBindings() {
    const resolved = await brandContext.load()
    workspaceId.value = workspaceId.value || resolved?.workspaceId || ''
    brandId.value = brandId.value || resolved?.brandId || ''
    if (!workspaceId.value || !brandId.value) throw new Error('Select an accessible Creator Brand')
    return { workspaceId: workspaceId.value, brandId: brandId.value }
  }
  function clearPublication() {
    publicationId.value = ''; sourceUrl.value = ''; sourceRevision.value = 0; sourceEditorRevision.value = null
    activeSceneId.value = ''; activeSceneName.value = ''; lastPublishedAt.value = ''
  }
  function applyPublication(value) {
    const publication = value?.publication || value
    if (!publication?.publicationId) { clearPublication(); return }
    publicationId.value = publication.publicationId; sourceRevision.value = Number(publication.revision || 0)
    sourceEditorRevision.value = Number.isInteger(publication.sourceEditorRevision) ? publication.sourceEditorRevision : null
    activeSceneId.value = publication.sceneId || ''; activeSceneName.value = publication.sceneName || ''; lastPublishedAt.value = publication.updatedAt || ''
  }
  async function refreshSourceState() {
    sourceBusy.value = true; sourceError.value = ''
    try { const bindings = await resolveBindings(); applyPublication(await getActiveOverlayPublication(bindings.workspaceId, bindings.brandId)) }
    catch (error) { sourceError.value = error?.message || 'Could not load Browser Source status' }
    finally { sourceBusy.value = false }
  }
  async function ensureSavedDraft() {
    if (dirty.value || !revision.value) await saveDraft({ rethrow: true })
    const savedScene = project.scenes.find((item) => item.id === project.selectedSceneId) || project.scenes[0]
    if (!savedScene || !revision.value) throw new Error('Save the overlay draft before updating Live')
    return savedScene
  }
  async function createBrowserSource() {
    sourceBusy.value = true; sourceError.value = ''
    try {
      const bindings = await resolveBindings(), savedScene = await ensureSavedDraft()
      const result = await createOverlayPublication({ ...bindings, overlayId: project.id || '', sceneId: savedScene.id, sceneSnapshot: createPublicationSceneSnapshot(savedScene), sourceEditorRevision: revision.value })
      applyPublication(result); sourceUrl.value = result.browserSourceUrl || ''
      notice.value = result.created === false ? 'This Brand already has an active Browser Source' : 'Browser Source created · Copy the URL into OBS'
    } catch (error) { sourceError.value = error?.message || 'Could not create Browser Source'; notice.value = sourceError.value }
    finally { sourceBusy.value = false }
  }
  async function saveAndUpdateLive() {
    sourceBusy.value = true; sourceError.value = ''; let draftSaved = false
    try {
      if (!publicationId.value) throw new Error('Create a Browser Source first')
      const wasDirty = dirty.value || !revision.value
      const savedScene = await ensureSavedDraft(); draftSaved = wasDirty
      const result = await updateOverlayPublication(publicationId.value, savedScene.id, createPublicationSceneSnapshot(savedScene), revision.value)
      applyPublication(result); notice.value = `Live Overlay updated · Publication revision ${sourceRevision.value}`
    } catch (error) {
      sourceError.value = error?.message || 'Could not update Live Overlay'
      notice.value = draftSaved ? `Draft saved — live update failed · ${sourceError.value}` : sourceError.value
    } finally { sourceBusy.value = false }
  }
  async function replaceActiveScene() { await saveAndUpdateLive() }
  async function copySourceUrl() { if (!sourceUrl.value) return; await navigator.clipboard?.writeText(sourceUrl.value); notice.value = 'Browser Source URL copied' }
  function openSourceUrl() { if (sourceUrl.value) window.open(sourceUrl.value, '_blank', 'noopener,noreferrer') }
  async function revokeBrowserSource() { if (!publicationId.value) return; sourceBusy.value = true; try { await revokeOverlayPublication(publicationId.value); clearPublication(); notice.value = 'Browser Source revoked · Creating again will issue a new URL' } catch (error) { sourceError.value = error?.message || 'Could not revoke Browser Source'; notice.value = sourceError.value } finally { sourceBusy.value = false } }
  async function rotateSourceUrl() { if (!publicationId.value) return; sourceBusy.value = true; sourceError.value = ''; try { const result = await rotateOverlayPublicationCredential(publicationId.value); sourceUrl.value = result.browserSourceUrl; notice.value = 'Browser Source URL rotated · Copy the replacement URL now' } catch (error) { sourceError.value = error?.message || 'Could not rotate Browser Source URL'; notice.value = sourceError.value } finally { sourceBusy.value = false } }
  async function sendSourceTest(type) { if (!publicationId.value) { notice.value = 'Create a Browser Source first'; return false } try { const result = await sendOverlayTestEvent(publicationId.value, createTestOverlayEvent(type)); notice.value = `${type} sent to ${result.delivered} Browser Source connection${result.delivered === 1 ? '' : 's'}`; return true } catch (error) { sourceError.value = error?.message || 'Could not send test event'; notice.value = sourceError.value; return false } }
  function openBrowserSourcePreview() { previewMode.value = true }
  return { publicationId, sourceUrl, sourceRevision, sourceEditorRevision, activeSceneId, activeSceneName, lastPublishedAt, sourceBusy, sourceError, hasActivePublication, liveStatusUnknown, liveOutOfDate, refreshSourceState, createBrowserSource, saveAndUpdateLive, replaceActiveScene, copySourceUrl, openSourceUrl, rotateSourceUrl, revokeBrowserSource, sendSourceTest, openBrowserSourcePreview }
}
