// MediaLibrary.js
// TABLE OF CONTENTS
// 1. Imports & setup
// 2. Folder tree & navigation
// 3. Media filtering (folder + search + type)
// 4. Selection, inspector & bulk actions
// 5. Upload logic (uses currentFolderId)
// 6. Refresh / sync stubs
// 7. Exported API for MediaLibrary.vue

import { ref, computed, watch } from 'vue' // Vue 3 Composition API[web:127]

export function useMediaLibrary (props, ctx) {
  // ========================================
  // 1. IMPORTS & SETUP
  // ========================================

  // 1.1 Base state from props
  const collections = ref(props.collections || [])
  const mediaItems = ref(props.mediaItems || [])

  // Keep local refs in sync when parent props change
  watch(
    () => props.collections,
    (next) => {
      collections.value = next || []
    },
    { immediate: true, deep: true }
  )

  watch(
    () => props.mediaItems,
    (next) => {
      mediaItems.value = next || []
    },
    { immediate: true, deep: true }
  )

  // 1.2 UI state
  const loadingMedia = ref(false)
  const loadingCollections = ref(false)
  const savingMedia = ref(false)
  const loadError = ref('')
  const toastMessage = ref('')

  // Search / filter
  const searchQuery = ref('')
  const mediaTypeFilter = ref('all')
  const typeFilters = ref([
    { label: 'All', value: 'all' },
    { label: 'Images', value: 'image' },
    { label: 'Video', value: 'video' },
    { label: 'Other', value: 'other' }
  ])

  // Selection
  const selectedMediaId = ref(null)
  const selectedMediaIds = ref([])

  // Inspector helpers
  const activeMediaCollectionId = ref(null)
  const mediaInspectorTags = ref('')

  // Upload panel
  const uploadCollectionId = ref(null)
  const uploadFiles = ref([])
  const uploadSourceType = ref('manual')

  // ========================================
  // 2. FOLDER TREE & NAVIGATION
  // ========================================

  // 2.1 Build folder tree from flat collections[parentId]
  const folderTree = computed(() => {
    const nodes = collections.value.map(c => ({
      ...c,
      children: []
    }))

    const lookup = new Map()
    nodes.forEach(n => lookup.set(n.id, n))

    const roots = []

    nodes.forEach(node => {
      if (node.parentId == null) {
        roots.push(node)
      } else {
        const parent = lookup.get(node.parentId)
        if (parent) {
          parent.children.push(node)
        } else {
          roots.push(node)
        }
      }
    })

    return roots
  }) // Folder tree patterns follow common Vue file explorer designs.[web:157][web:138]

  // 2.2 Current folder and breadcrumb path
  const currentFolderId = ref(null)
  const currentFolderPath = ref([])

  function buildFolderPath (folderId) {
    const path = []
    if (!folderId) return path

    const byId = new Map(collections.value.map(c => [c.id, c]))
    let node = byId.get(folderId)
    while (node) {
      path.unshift(node)
      if (!node.parentId) break
      node = byId.get(node.parentId)
    }
    return path
  }

  // Initialise folder when collections change
  watch(
    () => collections.value,
    (newVal) => {
      if (!newVal || !newVal.length) {
        currentFolderId.value = null
        currentFolderPath.value = []
        return
      }

      if (!currentFolderId.value) {
        currentFolderId.value = newVal[0].id
      }

      currentFolderPath.value = buildFolderPath(currentFolderId.value)
    },
    { immediate: true }
  )

  const currentFolder = computed(() => {
    if (!currentFolderId.value) return null
    return collections.value.find(c => c.id === currentFolderId.value) || null
  })

  // 2.3 Navigation handlers
  function handleFolderSelect (folder) {
    if (!folder || !folder.id) return
    currentFolderId.value = folder.id
    currentFolderPath.value = buildFolderPath(folder.id)
    selectedMediaId.value = null
  }

  function handleBreadcrumbClick (folder) {
    if (!folder || !folder.id) return
    currentFolderId.value = folder.id
    currentFolderPath.value = buildFolderPath(folder.id)
    selectedMediaId.value = null
  }

  function selectAllMedia () {
    currentFolderId.value = null
    currentFolderPath.value = []
    selectedMediaId.value = null
  }

  function createFolder () {
    const name = window.prompt('New folder name')
    if (!name) return

    const maxId = collections.value.reduce(
      (max, c) => Math.max(max, Number(c.id) || 0),
      0
    )
    const newFolder = {
      id: maxId + 1,
      name,
      parentId: currentFolderId.value
    }

    collections.value = [...collections.value, newFolder]
    if (ctx.emit) ctx.emit('update:collections', collections.value)
  }

  // ========================================
  // 3. MEDIA FILTERING (FOLDER + SEARCH + TYPE)
  // ========================================

  // 3.1 Filter by folder first
  const mediaInCurrentFolder = computed(() => {
    if (!currentFolderId.value) return mediaItems.value
    return mediaItems.value.filter(
      m => m.collectionId === currentFolderId.value
    )
  })

  // 3.2 Then apply search and type filters
  const filteredMedia = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    const typeFilter = mediaTypeFilter.value

    return mediaInCurrentFolder.value.filter(item => {
      // Type filter
      if (typeFilter !== 'all') {
        const t = (item.type || '').toLowerCase()
        if (typeFilter === 'image' && !t.includes('image')) return false
        if (typeFilter === 'video' && !t.includes('video')) return false
        if (
          typeFilter === 'other' &&
          (t.includes('image') || t.includes('video'))
        ) {
          return false
        }
      }

      // Search filter
      if (!query) return true

      const inTitle = (item.title || '').toLowerCase().includes(query)
      const inAlt = (item.altText || '').toLowerCase().includes(query)
      const inTags = (item.tags || '')
        .toString()
        .toLowerCase()
        .includes(query)

      const col = collections.value.find(c => c.id === item.collectionId)
      const inCollection = (col?.name || '').toLowerCase().includes(query)

      return inTitle || inAlt || inTags || inCollection
    })
  }) // This pattern uses computed properties for reactive filters in Vue 3.[web:160]

  const totalMediaCount = computed(() => mediaItems.value.length)
  const activeCollectionsCount = computed(() => collections.value.length)

  // ========================================
  // 4. SELECTION, INSPECTOR & BULK ACTIONS
  // ========================================

  const activeMediaItem = computed(() => {
    if (!selectedMediaId.value) return null
    return mediaItems.value.find(m => m.id === selectedMediaId.value) || null
  })

  function selectMedia (item) {
    if (!item) return
    selectedMediaId.value = item.id
    activeMediaCollectionId.value = item.collectionId ?? null
    mediaInspectorTags.value =
      Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || '')
  }

  // NEW: change folder from inspector dropdown
  function changeActiveMediaCollection () {
    if (!activeMediaItem.value) return

    const idx = mediaItems.value.findIndex(
      m => m.id === activeMediaItem.value.id
    )
    if (idx === -1) return

    const updated = {
      ...mediaItems.value[idx],
      collectionId: activeMediaCollectionId.value
    }

    const copy = mediaItems.value.slice()
    copy.splice(idx, 1, updated)
    mediaItems.value = copy

    if (ctx.emit) ctx.emit('update:mediaItems', mediaItems.value)
  }

  function toggleMediaSelection (id) {
    const idx = selectedMediaIds.value.indexOf(id)
    if (idx === -1) {
      selectedMediaIds.value = [...selectedMediaIds.value, id]
    } else {
      const copy = selectedMediaIds.value.slice()
      copy.splice(idx, 1)
      selectedMediaIds.value = copy
    }
  }

  async function saveActiveMediaItem () {
    if (!activeMediaItem.value) return
    savingMedia.value = true
    try {
      const idx = mediaItems.value.findIndex(
        m => m.id === activeMediaItem.value.id
      )
      if (idx === -1) return

      const tags = mediaInspectorTags.value
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)

      const updated = {
        ...mediaItems.value[idx],
        ...activeMediaItem.value,
        collectionId: activeMediaCollectionId.value,
        tags
      }

      const copy = mediaItems.value.slice()
      copy.splice(idx, 1, updated)
      mediaItems.value = copy

      if (ctx.emit) ctx.emit('update:mediaItems', mediaItems.value)

      toastMessage.value = 'Saved asset'
      setTimeout(() => {
        toastMessage.value = ''
      }, 2000)
    } finally {
      savingMedia.value = false
    }
  }

  async function deleteActiveMediaItem () {
    if (!activeMediaItem.value) return
    const confirmed = window.confirm('Delete this asset?')
    if (!confirmed) return

    savingMedia.value = true
    try {
      mediaItems.value = mediaItems.value.filter(
        m => m.id !== activeMediaItem.value.id
      )
      if (ctx.emit) ctx.emit('update:mediaItems', mediaItems.value)

      selectedMediaId.value = null
      toastMessage.value = 'Deleted asset'
      setTimeout(() => {
        toastMessage.value = ''
      }, 2000)
    } finally {
      savingMedia.value = false
    }
  }

  async function bulkAssignSelectedToActiveCollection () {
    if (!activeMediaItem.value || !selectedMediaIds.value.length) return
    const targetCollectionId = activeMediaCollectionId.value

    const updated = mediaItems.value.map(item => {
      if (selectedMediaIds.value.includes(item.id)) {
        return { ...item, collectionId: targetCollectionId }
      }
      return item
    })

    mediaItems.value = updated
    if (ctx.emit) ctx.emit('update:mediaItems', mediaItems.value)

    toastMessage.value = 'Assigned selected assets to this folder'
    setTimeout(() => {
      toastMessage.value = ''
    }, 2000)
  }

  async function bulkDeleteSelectedMedia () {
    if (!selectedMediaIds.value.length) return
    const confirmed = window.confirm('Delete selected assets?')
    if (!confirmed) return

    const idsToDelete = new Set(selectedMediaIds.value)
    mediaItems.value = mediaItems.value.filter(item => !idsToDelete.has(item.id))
    if (ctx.emit) ctx.emit('update:mediaItems', mediaItems.value)

    selectedMediaIds.value = []
    toastMessage.value = 'Deleted selected assets'
    setTimeout(() => {
      toastMessage.value = ''
    }, 2000)
  }

  // ========================================
  // 5. UPLOAD LOGIC (USES currentFolderId)
  // ========================================

  function handleUploadFileChange (event) {
    const files = Array.from(event.target.files || [])
    uploadFiles.value = files
  } // Typical pattern for file input with Composition API.[web:137]

  async function uploadMediaItems () {
    if (!uploadFiles.value.length) return
    savingMedia.value = true
    try {
      const targetCollectionId =
        uploadCollectionId.value != null
          ? uploadCollectionId.value
          : currentFolderId.value

      const baseId = mediaItems.value.reduce(
        (max, m) => Math.max(max, Number(m.id) || 0),
        0
      )

      const newItems = uploadFiles.value.map((file, index) => ({
        id: baseId + index + 1,
        title: file.name,
        altText: '',
        url: URL.createObjectURL(file),
        type: file.type || 'image',
        status: 'active',
        collectionId: targetCollectionId,
        tags: [],
        sourceType: uploadSourceType.value
      }))

      mediaItems.value = [...mediaItems.value, ...newItems]
      if (ctx.emit) ctx.emit('update:mediaItems', mediaItems.value)

      uploadFiles.value = []
      uploadCollectionId.value = null

      toastMessage.value = 'Uploaded files'
      setTimeout(() => {
        toastMessage.value = ''
      }, 2000)
    } finally {
      savingMedia.value = false
    }
  }

  // ========================================
  // 6. REFRESH / SYNC STUBS
  // ========================================

  async function refreshLibrary () {
    loadingMedia.value = true
    loadingCollections.value = true
    loadError.value = ''
    try {
      // TODO: hook this up to your backend
      // const { collections: c, media: m } = await api.fetchMediaLibrary()
      // collections.value = c
      // mediaItems.value = m
      // if (ctx.emit) {
      //   ctx.emit('update:collections', c)
      //   ctx.emit('update:mediaItems', m)
      // }
    } catch (e) {
      loadError.value = 'Failed to load media library'
    } finally {
      loadingMedia.value = false
      loadingCollections.value = false
    }
  }

  // ========================================
  // 7. EXPORTED API
  // ========================================

  return {
    // Core collections / media
    collections,
    mediaItems,

    // Loading / toast / errors
    loadingMedia,
    loadingCollections,
    savingMedia,
    loadError,
    toastMessage,

    // Search + type filter
    searchQuery,
    mediaTypeFilter,
    typeFilters,

    // Folders
    folderTree,
    currentFolderId,
    currentFolderPath,
    currentFolder,
    handleFolderSelect,
    handleBreadcrumbClick,
    selectAllMedia,
    createFolder,

    // Media filtering & counts
    filteredMedia,
    totalMediaCount,
    activeCollectionsCount,

    // Selection & inspector
    selectedMediaId,
    selectedMediaIds,
    activeMediaItem,
    activeMediaCollectionId,
    mediaInspectorTags,
    selectMedia,
    changeActiveMediaCollection,
    toggleMediaSelection,
    saveActiveMediaItem,
    deleteActiveMediaItem,
    bulkAssignSelectedToActiveCollection,
    bulkDeleteSelectedMedia,

    // Upload
    uploadCollectionId,
    uploadFiles,
    uploadSourceType,
    handleUploadFileChange,
    uploadMediaItems,

    // Refresh
    refreshLibrary
  }
}