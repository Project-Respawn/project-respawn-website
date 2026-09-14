import { computed, ref, watch } from 'vue'
import { refreshAccessContext } from '../../../composables/useAccessContext.js'

const sharedCreatorBrandId = ref('')

export function resolveCreatorBrand(access, requestedBrandId) {
  const brands = Array.isArray(access?.brands) ? access.brands : []
  const brand = brands.find((item) => (item.brandId || item.id) === requestedBrandId) || null
  if (!brand) return null
  const brandId = brand.brandId || brand.id
  const workspaces = Array.isArray(access?.workspaces) ? access.workspaces : []
  const workspaceId = brand.workspaceId
    || (workspaces.length === 1 ? (workspaces[0].workspaceId || workspaces[0].id) : '')
  return workspaceId ? { brand, brandId, workspaceId } : null
}

export function chooseCreatorBrandId(access, requestedBrandId = '', sharedBrandId = '') {
  const brands = Array.isArray(access?.brands) ? access.brands : []
  const ids = brands.map((brand) => String(brand.brandId || brand.id || '')).filter(Boolean)
  if (requestedBrandId) return ids.includes(String(requestedBrandId)) ? String(requestedBrandId) : ''
  if (sharedBrandId && ids.includes(String(sharedBrandId))) return String(sharedBrandId)
  return ids.length === 1 ? ids[0] : ''
}

export function creatorRouteLocation(name, brandId = '') {
  return brandId ? { name, query: { brandId } } : { name }
}

export function creatorContextMatches(expected, workspaceId, brandId) {
  return expected.workspaceId === workspaceId && expected.brandId === brandId
}

export function creatorRequestIsCurrent(expectedGeneration, currentGeneration, expectedContext, workspaceId, brandId) {
  return expectedGeneration === currentGeneration && creatorContextMatches(expectedContext, workspaceId, brandId)
}

export function useCreatorBrandContext(route, router) {
  const access = ref(null), brands = ref([]), selectedBrandId = ref(''), workspaceId = ref(''), loading = ref(false), error = ref('')
  const selectedBrand = computed(() => brands.value.find((item) => (item.brandId || item.id) === selectedBrandId.value) || null)
  function clearSelection(message = '') {
    selectedBrandId.value = ''
    workspaceId.value = ''
    error.value = message
  }
  async function select(brandId, { updateRoute = true } = {}) {
    const resolved = resolveCreatorBrand(access.value, String(brandId || ''))
    if (!resolved) throw new Error('Select an accessible Brand')
    selectedBrandId.value = resolved.brandId; workspaceId.value = resolved.workspaceId
    sharedCreatorBrandId.value = resolved.brandId
    error.value = ''
    if (updateRoute && route?.query?.brandId !== resolved.brandId) await router.replace({ query: { ...route.query, brandId: resolved.brandId } })
    return resolved
  }
  let loadPromise = null
  async function loadOnce() {
    loading.value = true; error.value = ''
    try {
      access.value = await refreshAccessContext(); brands.value = access.value.brands || []
      const requested = String(route?.query?.brandId || '')
      const shared = String(sharedCreatorBrandId.value || '')
      const chosen = chooseCreatorBrandId(access.value, requested, shared)
      if (chosen) return await select(chosen, { updateRoute: chosen !== requested })
      if (requested) throw new Error('Select an accessible Brand')
      if (!brands.value.length) throw new Error('Select or create a Brand before editing Creator settings')
      throw new Error('Select a Brand before editing Creator settings')
    } catch (cause) { error.value = cause?.message || 'Could not resolve Creator Brand'; throw cause }
    finally { loading.value = false }
  }
  function load() {
    if (!loadPromise) loadPromise = loadOnce().catch((cause) => { loadPromise = null; throw cause })
    return loadPromise
  }
  watch(
    () => route?.query?.brandId,
    async (nextBrandId) => {
      if (!access.value) return
      const requested = String(nextBrandId || '')
      if (requested === selectedBrandId.value) return
      if (requested) {
        const resolved = resolveCreatorBrand(access.value, requested)
        if (!resolved) {
          clearSelection('Select an accessible Brand')
          return
        }
        await select(requested, { updateRoute: false })
        return
      }
      const chosen = chooseCreatorBrandId(access.value, '', String(sharedCreatorBrandId.value || ''))
      if (chosen) await select(chosen)
      else clearSelection(brands.value.length ? 'Select a Brand before editing Creator settings' : 'Select or create a Brand before editing Creator settings')
    },
  )
  return { access, brands, selectedBrand, selectedBrandId, workspaceId, sharedCreatorBrandId, loading, error, load, select }
}
