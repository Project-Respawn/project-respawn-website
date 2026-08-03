<!--
MediaLibrary.vue

TABLE OF CONTENTS (SECTION NUMBERS)
1. Template: Page shell (header, toolbar, toast)
2. Template: Main layout (sidebar + grid + upload)
   2.1 Collections sidebar (navigation menu)
   2.2 Media grid & inspector + breadcrumb
   2.3 Upload panel
3. Script: Logic import (Composition API)
4. Style import
-->

<template>
  <!-- ======================================= -->
  <!-- 1. TEMPLATE: PAGE SHELL                -->
  <!-- ======================================= -->
  <div class="admin-media-library-page">
    <!-- 1.1 Header -->
    <div class="dash-header">
      <div>
        <h1 class="dash-title">Media Library</h1>
        <p class="dash-subtitle">
          Browse, organise, and upload assets for merch, events, and branding.
        </p>
      </div>

      <div class="header-stats">
        <div class="stat-pill">
          <span class="stat-num">{{ totalMediaCount }}</span>
          <span class="stat-lbl">Total assets</span>
        </div>

        <div class="stat-pill">
          <span class="stat-num">{{ activeCollectionsCount }}</span>
          <span class="stat-lbl">Collections</span>
        </div>
      </div>
    </div>

    <!-- 1.2 Toolbar -->
    <div class="toolbar toolbar-with-sync media-toolbar">
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search by title, tags, or collection..."
        />
      </div>

      <div class="filter-group">
        <button
          v-for="filter in typeFilters"
          :key="filter.value"
          class="filter-btn"
          :class="{ active: mediaTypeFilter === filter.value }"
          @click="mediaTypeFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>

      <div class="toolbar-actions media-toolbar-actions">
        <p v-if="loadError" class="sync-status">
          {{ loadError }}
        </p>

        <button
          class="btn-fetch"
          @click="refreshLibrary"
          :disabled="loadingMedia || loadingCollections"
        >
          <span v-if="!loadingMedia && !loadingCollections">↻ Refresh</span>
          <span v-else>Loading...</span>
        </button>
      </div>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toastMessage" class="toast">✓ {{ toastMessage }}</div>
    </transition>

    <!-- ======================================= -->
    <!-- 2. TEMPLATE: MAIN LAYOUT               -->
    <!--    Sidebar + media grid + upload       -->
    <!-- ======================================= -->
    <div class="media-layout">
      <!-- 2.1 Collections sidebar (navigation menu) -->
      <aside class="media-sidebar">
        <div class="sidebar-header">
          <h2>Collections</h2>
          <button
            type="button"
            class="btn-secondary sm"
            @click="createFolder"
          >
            + New collection
          </button>
        </div>

        <div class="collection-list" v-if="folderRows && folderRows.length">
          <!-- All media -->
          <button
            type="button"
            class="collection-item"
            :class="{ active: !currentFolderId }"
            @click="selectAllMedia"
          >
            <div class="collection-main">
              <span class="collection-name">All media</span>
              <span class="collection-meta">
                {{ totalMediaCount }} items
              </span>
            </div>
          </button>

          <!-- Folder tree -->
          <button
            v-for="collection in folderRows"
            :key="collection.id"
            type="button"
            class="collection-item"
            :class="{ active: currentFolderId === collection.id }"
            :style="{ marginLeft: `${collection.depth * 16}px` }"
            @click="handleFolderSelect(collection)"
          >
            <div class="collection-main">
              <span class="collection-name">📁 {{ collection.name }}</span>
              <span class="collection-meta">
                {{ collectionMediaCount(collection.id) }} items
              </span>
            </div>
          </button>
        </div>

        <p v-else class="collection-empty">
          No collections yet. Create one to start organising your media.
        </p>
      </aside>

      <!-- 2.2 Media grid, breadcrumb & inspector -->
      <section class="media-main">
        <!-- 2.2.1 Breadcrumb + count -->
        <div class="media-grid-header">
          <div class="media-breadcrumb-wrap">
            <nav class="breadcrumb" aria-label="Breadcrumb">
              <span
                v-for="(folder, index) in (currentFolderPath || [])"
                :key="folder.id"
                class="breadcrumb-item"
                :class="{
                  'is-current':
                    Array.isArray(currentFolderPath) &&
                    index === currentFolderPath.length - 1
                }"
                @click="
                  Array.isArray(currentFolderPath) &&
                  index === currentFolderPath.length - 1
                    ? null
                    : handleBreadcrumbClick(folder)
                "
              >
                <span>{{ folder.name }}</span>
                <span
                  v-if="
                    Array.isArray(currentFolderPath) &&
                    index < currentFolderPath.length - 1
                  "
                  class="breadcrumb-separator"
                >
                  /
                </span>
              </span>

              <!-- Fallback when no folder path yet -->
              <span
                v-if="!(Array.isArray(currentFolderPath) && currentFolderPath.length)"
                class="breadcrumb-item is-current"
              >
                All media
              </span>
            </nav>

            <span class="media-grid-count">
              Showing {{ (filteredMedia || []).length }} of {{ totalMediaCount }} assets
            </span>
          </div>
        </div>

        <!-- 2.2.2 Media grid -->
        <div class="media-grid-container">
          <div v-if="loadingMedia" class="media-loading">
            <div class="spinner"></div>
            <p>Loading media...</p>
          </div>

          <div
            v-else-if="!(filteredMedia && filteredMedia.length)"
            class="media-empty-state"
          >
            <p>No media items match your filters.</p>
            <p class="media-empty-hint">
              Try adjusting your search or upload new assets below.
            </p>
          </div>

          <div v-else class="media-grid">
            <button
              v-for="item in filteredMedia"
              :key="item.id"
              type="button"
              class="media-card"
              :class="{
                selected: selectedMediaId === item.id,
                'bulk-selected': selectedMediaIds && selectedMediaIds.includes(item.id),
              }"
              @click="selectMedia(item)"
            >
              <div class="media-card-select">
                <input
                  type="checkbox"
                  :checked="selectedMediaIds && selectedMediaIds.includes(item.id)"
                  @click.stop="toggleMediaSelection(item.id)"
                />
              </div>

              <div class="media-thumb">
                <img
                  v-if="item.url"
                  :src="item.resolvedUrl || item.url"
                  :alt="item.altText || item.title || 'Media item'"
                />
                <div v-else class="media-thumb-fallback">
                  No preview
                </div>
              </div>

              <div class="media-card-info">
                <span class="media-card-title">
                  {{ item.title || 'Untitled asset' }}
                </span>
                <span class="media-card-meta">
                  {{ item.type || 'Unknown type' }}
                </span>
              </div>
            </button>
          </div>
        </div>

        <!-- 2.2.3 Media inspector -->
        <div class="media-inspector" v-if="activeMediaItem">
          <h3>Selected asset</h3>

          <div class="media-inspector-preview">
            <img
              v-if="activeMediaItem.url"
              :src="activeMediaItem.resolvedUrl || activeMediaItem.url"
              :alt="activeMediaItem.altText || activeMediaItem.title || 'Selected media'"
            />
            <div v-else class="media-thumb-fallback">
              No preview available
            </div>
          </div>

          <div class="media-inspector-fields">
            <label class="field">
              <span>Collection</span>
              <select
                v-model="activeMediaCollectionId"
                @change="changeActiveMediaCollection"
              >
                <option :value="null">Unassigned (no collection)</option>
                <option
                  v-for="collection in collections"
                  :key="collection.id"
                  :value="collection.id"
                >
                  {{ collection.name }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>Title</span>
              <input
                type="text"
                v-model="activeMediaItem.title"
                placeholder="Display name for this asset"
              />
            </label>

            <label class="field">
              <span>Alt text</span>
              <textarea
                v-model="activeMediaItem.altText"
                placeholder="Describe the image for accessibility"
              ></textarea>
            </label>

            <label class="field">
              <span>Tags</span>
              <input
                type="text"
                v-model="mediaInspectorTags"
                placeholder="Comma-separated tags, e.g. jersey, black, logo"
              />
            </label>

            <label class="field">
              <span>Type</span>
              <input
                type="text"
                v-model="activeMediaItem.type"
                placeholder="image, video, document..."
              />
            </label>

            <label class="field">
              <span>Status</span>
              <input
                type="text"
                v-model="activeMediaItem.status"
                placeholder="active, archived, draft..."
              />
            </label>

            <div class="media-inspector-actions">
              <button
                type="button"
                class="btn-primary sm"
                :disabled="savingMedia"
                @click="saveActiveMediaItem"
              >
                <span v-if="!savingMedia">Save changes</span>
                <span v-else>Saving...</span>
              </button>

              <button
                type="button"
                class="btn-danger sm"
                :disabled="savingMedia"
                @click="deleteActiveMediaItem"
              >
                Delete asset
              </button>

              <button
                type="button"
                class="btn-secondary sm"
                :disabled="savingMedia || !(selectedMediaIds && selectedMediaIds.length)"
                @click="bulkAssignSelectedToActiveCollection"
              >
                Assign selected to this collection
              </button>

              <button
                type="button"
                class="btn-danger sm"
                :disabled="savingMedia || !(selectedMediaIds && selectedMediaIds.length)"
                @click="bulkDeleteSelectedMedia"
              >
                Delete selected
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 2.3 Upload panel -->
      <section class="media-upload-panel">
        <div class="modal-section">
          <h3>Upload new media</h3>

          <div class="field">
            <span>Target collection</span>
            <select v-model="uploadCollectionId">
              <option :value="null">Unassigned (no collection)</option>
              <option
                v-for="collection in collections"
                :key="collection.id"
                :value="collection.id"
              >
                {{ collection.name }}
              </option>
            </select>
          </div>

          <div class="field">
            <span>Files</span>
            <input
              type="file"
              multiple
              accept="image/*"
              @change="handleUploadFileChange"
            />
          </div>

          <div class="field">
            <span>Source type</span>
            <input
              type="text"
              v-model="uploadSourceType"
              placeholder="e.g. manual, printful, branding"
            />
          </div>

          <button
            type="button"
            class="btn-primary sm"
            :disabled="!(uploadFiles && uploadFiles.length) || savingMedia"
            @click="uploadMediaItems"
          >
            <span v-if="!savingMedia">Upload files</span>
            <span v-else>Uploading...</span>
          </button>

          <p
            v-if="uploadFiles && uploadFiles.length"
            class="media-upload-hint"
          >
            {{ uploadFiles.length }} file(s) selected for upload.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { useMediaLibrary } from './MediaLibrary.js'

export default {
  name: 'MediaLibrary',
  props: {
    collections: {
      type: Array,
      default: () => []
    },
    mediaItems: {
      type: Array,
      default: () => []
    }
  },
  setup (props, ctx) {
    const logic = useMediaLibrary(props, ctx)
    return {
      ...logic
    }
  }
}
</script>

<style src="./MediaLibrary.css"></style>