import { computed, ref } from 'vue'
import { refreshAccessContext } from '../../../composables/useAccessContext.js'

export function resolveCreatorBrand(access, requestedBrandId) {
  const brands = Array.isArray(access?.brands) ? access.brands : []
  const brand = brands.find((item) => (item.brandId || item.id) === requestedBrandId) || null
  if (!brand) return null
  const brandId = brand.brandId || brand.id
  const workspaceId = brand.workspaceId || access.workspaces?.find((item) => (item.workspaceId || item.id) === brand.workspaceId)?.id || ''
  return workspaceId ? { brand, brandId, workspaceId } : null
}

export function useCreatorBrandContext(route, router) {
  const access = ref(null), brands = ref([]), selectedBrandId = ref(''), workspaceId = ref(''), loading = ref(false), error = ref('')
  const selectedBrand = computed(() => brands.value.find((item) => (item.brandId || item.id) === selectedBrandId.value) || null)
  async function select(brandId, { updateRoute = true } = {}) {
    const resolved = resolveCreatorBrand(access.value, String(brandId || ''))
    if (!resolved) throw new Error('Select an accessible Brand')
    selectedBrandId.value = resolved.brandId; workspaceId.value = resolved.workspaceId
    if (updateRoute && route?.query?.brandId !== resolved.brandId) await router.replace({ query: { ...route.query, brandId: resolved.brandId } })
    return resolved
  }
  let loadPromise = null
  async function loadOnce() {
    loading.value = true; error.value = ''
    try {
      access.value = await refreshAccessContext(); brands.value = access.value.brands || []
      const requested = String(route?.query?.brandId || '')
      if (!requested) {
        if (brands.value.length !== 1) throw new Error('Select a Brand before editing Creator settings')
        return await select(brands.value[0].brandId || brands.value[0].id)
      }
      return await select(requested, { updateRoute: false })
    } catch (cause) { error.value = cause?.message || 'Could not resolve Creator Brand'; throw cause }
    finally { loading.value = false }
  }
  function load() {
    if (!loadPromise) loadPromise = loadOnce().catch((cause) => { loadPromise = null; throw cause })
    return loadPromise
  }
  return { access, brands, selectedBrand, selectedBrandId, workspaceId, loading, error, load, select }
}
