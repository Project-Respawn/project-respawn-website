import { computed, ref, watch } from 'vue'
import { generateClient } from 'aws-amplify/data'
import { Hub } from 'aws-amplify/utils'
import { ensureAuthReady, useAuth } from './useAuth.js'

const EMPTY_ACCESS_CONTEXT = Object.freeze({
  userId: '',
  groups: [],
  permissions: [],
  isPlatformAdmin: false,
  brands: [],
  workspaces: [],
})

const accessContext = ref(EMPTY_ACCESS_CONTEXT)
const accessLoading = ref(false)
const accessError = ref('')

let client
let refreshPromise = null
let hubStarted = false

function getClient() {
  return client ||= generateClient()
}

function assertAccessContextQuery(dataClient) {
  const query = dataClient?.queries?.getMyAccessContext

  if (typeof query !== 'function') {
    throw new Error(
      'Amplify Data operation getMyAccessContext is unavailable. Regenerate amplify_outputs.json from the deployed branch backend and rebuild the frontend; the frontend schema metadata is stale or targets a different AppSync deployment.'
    )
  }
}

function normalizeAccessContext(value) {
  return {
    userId: typeof value?.userId === 'string' ? value.userId : '',
    groups: Array.isArray(value?.groups) ? value.groups : [],
    permissions: Array.isArray(value?.permissions) ? value.permissions : [],
    isPlatformAdmin: value?.isPlatformAdmin === true,
    brands: Array.isArray(value?.brands) ? value.brands : [],
    workspaces: Array.isArray(value?.workspaces) ? value.workspaces : [],
  }
}

export function clearAccessContext() {
  accessContext.value = EMPTY_ACCESS_CONTEXT
  accessLoading.value = false
  accessError.value = ''
}

export async function refreshAccessContext({ force = false } = {}) {
  await ensureAuthReady()
  const { isSignedIn } = useAuth()

  if (!isSignedIn.value) {
    clearAccessContext()
    return accessContext.value
  }

  if (refreshPromise) {
    if (!force) return refreshPromise
    await refreshPromise.catch(() => undefined)
  }

  accessLoading.value = true
  accessError.value = ''
  refreshPromise = (async () => {
    const dataClient = getClient()
    assertAccessContextQuery(dataClient)
    const result = await dataClient.queries.getMyAccessContext()
    const message = result.errors?.[0]?.message

    if (message) throw new Error(message)
    if (!result.data) throw new Error('The access context could not be loaded')

    accessContext.value = normalizeAccessContext(result.data)
    return accessContext.value
  })()
    .catch((error) => {
      clearAccessContext()
      accessError.value = error instanceof Error ? error.message : 'The access context could not be loaded'
      throw error
    })
    .finally(() => {
      accessLoading.value = false
      refreshPromise = null
    })

  return refreshPromise
}

function startHubListener() {
  if (hubStarted) return

  hubStarted = true
  Hub.listen('auth', ({ payload }) => {
    switch (payload?.event) {
      case 'signedOut':
        clearAccessContext()
        break
      case 'signedIn':
      case 'tokenRefresh':
        void refreshAccessContext().catch(() => undefined)
        break
    }
  })
}

export function useAccessContext() {
  startHubListener()
  const { isAuthReady, isSignedIn } = useAuth()

  watch(
    [isAuthReady, isSignedIn],
    ([ready, signedIn]) => {
      if (!signedIn) {
        clearAccessContext()
        return
      }

      if (ready && !accessContext.value.userId && !accessLoading.value && !accessError.value) {
        void refreshAccessContext().catch(() => undefined)
      }
    },
    { immediate: true },
  )

  const permissions = computed(() => new Set(accessContext.value.permissions))
  const hasPermission = (permissionKey) => permissions.value.has(permissionKey)

  return {
    accessContext,
    accessLoading,
    accessError,
    hasPermission,
    refreshAccessContext,
    clearAccessContext,
  }
}
