<!--
ProductControl.vue

TABLE OF CONTENTS (SECTION NUMBERS)
1. Template: Page shell (header, toolbar, toast)
2. Template: Products table
3. Template: Product edit modal (numbered subsections)
   3.1 Modal header
   3.2 Modal body overview & copy
   3.3 Modal body detail sections
   3.4 Modal body assignments & visibility (brands/categories checkboxes)
   3.5 Modal body read-only meta
   3.6 Modal footer
4. Template: Media modal (upload + viewer)
5. Script: Imports & extension
6. Script: Data (includes productForm / media state)
7. Script: Computed properties
8. Script: Methods (product + media actions)
9. Style: External CSS import
-->

<template>
  <!-- ========================================================= -->
  <!-- 1. TEMPLATE: PAGE SHELL (HEADER, TOOLBAR, TOAST)          -->
  <!-- ========================================================= -->
  <div class="admin-product-control-page">
    <!-- 1.1 Header -->
    <div class="dash-header">
      <div>
        <h1 class="dash-title">Product Control</h1>
        <p class="dash-subtitle">
          Search, review, sync, and manage merch products, storefront copy, media, and assignments
        </p>
      </div>

      <div class="header-stats">
        <div class="stat-pill">
          <span class="stat-num">{{ products.length }}</span>
          <span class="stat-lbl">Total Products</span>
        </div>

        <div class="stat-pill">
          <span class="stat-num">{{ visibleProductsCount }}</span>
          <span class="stat-lbl">Visible</span>
        </div>

        <div class="stat-pill">
          <span class="stat-num">{{ printfulProductsCount }}</span>
          <span class="stat-lbl">Printful</span>
        </div>
      </div>
    </div>

    <!-- 1.2 Toolbar -->
    <div class="toolbar toolbar-with-sync">
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search by title, slug, brand or category..."
        />
      </div>

      <div class="filter-group">
        <button
          v-for="filter in sourceFilters"
          :key="filter.value"
          class="filter-btn"
          :class="{ active: sourceFilter === filter.value }"
          @click="sourceFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>

      <div class="filter-group">
        <button
          v-for="filter in visibilityFilters"
          :key="filter.value"
          class="filter-btn"
          :class="{ active: visibilityFilter === filter.value }"
          @click="visibilityFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>

      <div class="toolbar-actions">
        <p v-if="syncStatus" class="sync-status">
          {{ syncStatus }}
        </p>

        <button
          class="btn-fetch btn-sync"
          @click="handlePrintfulSync"
          :disabled="syncingProducts || loadingProducts"
        >
          <span v-if="!syncingProducts">⟳ Sync Printful</span>
          <span v-else>Syncing...</span>
        </button>

        <button
          class="btn-fetch"
          @click="loadProducts"
          :disabled="loadingProducts || syncingProducts"
        >
          <span v-if="!loadingProducts">↻ Refresh</span>
          <span v-else>Loading...</span>
        </button>
      </div>
    </div>

    <!-- 1.3 Error + toast -->
    <div v-if="loadError" class="page-alert error">
      {{ loadError }}
    </div>

    <transition name="toast">
      <div v-if="toastMessage" class="toast">✓ {{ toastMessage }}</div>
    </transition>

    <!-- =============================================== -->
    <!-- 2. TEMPLATE: PRODUCTS TABLE                    -->
    <!-- =============================================== -->
    <div class="table-container">
      <div v-if="loadingProducts" class="table-loading">
        <div class="spinner"></div>
        <p>Fetching products...</p>
      </div>

      <div v-else class="table-scroll">
        <table class="products-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Assignments</th>
              <th>Price / Variants</th>
              <th>Media</th>
              <th>Visibility</th>
              <th>Manage</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="product in filteredProducts"
              :key="product.id"
              class="product-row"
              :class="{ 'row-highlight': product.isVisible }"
            >
              <td class="product-cell">
                <div class="product-thumb-wrap">
                  <img
                    v-if="product.thumbnail"
                    :src="product.thumbnail"
                    :alt="product.title"
                    class="product-thumb"
                  />
                  <div v-else class="product-thumb fallback">No image</div>
                </div>

                <div class="product-info">
                  <span class="product-name">{{ product.title }}</span>
                  <span class="product-slug">{{ product.slug || '—' }}</span>
                  <span class="product-meta-line">
                    <span class="source-badge" :class="product.sourceTypeClass">
                      {{ product.sourceLabel }}
                    </span>
                    <span class="product-status" :class="product.statusClass">
                      {{ product.statusLabel }}
                    </span>
                  </span>
                </div>
              </td>

              <td class="assignments-cell">
                <div class="assignment-stack">
                  <div class="assignment-block">
                    <span class="assignment-label">Brand</span>
                    <span class="assignment-value">
                      {{ product.brandNames.length ? product.brandNames.join(', ') : '—' }}
                    </span>
                  </div>

                  <div class="assignment-block">
                    <span class="assignment-label">Category</span>
                    <span class="assignment-value">
                      {{ product.categoryNames.length ? product.categoryNames.join(', ') : '—' }}
                    </span>
                  </div>
                </div>
              </td>

              <td class="meta-cell">
                <div class="meta-stack">
                  <span>{{ product.displayPrice || 'Price unavailable' }}</span>
                  <span>{{ product.variantCount }} variants</span>
                </div>
              </td>

              <td class="meta-cell">
                <div class="meta-stack">
                  <span>{{ product.imageCount }} images</span>
                  <span>{{ product.hasPrimaryImage ? 'Primary image set' : 'No primary image' }}</span>
                </div>
              </td>

              <td>
                <div class="visibility-wrap">
                  <span class="status-dot" :class="product.isVisible ? 'online' : 'offline'"></span>
                  <span class="status-text">
                    {{ product.isVisible ? 'Visible' : 'Hidden' }}
                  </span>
                </div>
              </td>

              <td>
                <div class="manage-buttons">
                  <button class="btn-manage" @click="openProductModal(product)">
                    Edit Product
                  </button>

                  <button
                    class="btn-manage media-manage-button"
                    type="button"
                    @click="openMediaModal(product)"
                  >
                    Manage media
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!filteredProducts.length">
              <td colspan="6" class="empty-state">
                No products found matching your filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===================================================== -->
    <!-- 3. TEMPLATE: PRODUCT EDIT MODAL (NUMBERED SECTIONS)   -->
    <!-- ===================================================== -->
    <transition name="fade">
      <div v-if="productModal" class="modal-overlay" @click.self="closeProductModal">
        <div class="product-modal">
          <!-- 3.1 Modal header -->
          <div class="product-modal-header">
            <div>
              <h2>{{ productForm.title || 'Edit product' }}</h2>
              <p class="product-modal-subtitle">
                Update storefront copy, assignments, and product detail sections
              </p>
            </div>

            <button class="btn-close" @click="closeProductModal">✕</button>
          </div>

          <!-- 3.2–3.5 Modal body -->
          <div class="product-modal-body">
            <!-- 3.2 Overview & basic copy -->
            <section class="modal-section" id="section-1-overview">
              <h3>1. Overview & basic copy</h3>

              <label class="field">
                <span>Title</span>
                <input
                  type="text"
                  v-model="productForm.title"
                  placeholder="Product title"
                />
              </label>

              <label class="field">
                <span>Slug</span>
                <input
                  type="text"
                  v-model="productForm.slug"
                  placeholder="product-respawn-sports-top"
                />
              </label>

              <label class="field">
                <span>Short description</span>
                <textarea
                  v-model="productForm.shortDescription"
                  placeholder="Short summary used on listings"
                ></textarea>
              </label>

              <label class="field">
                <span>Full description</span>
                <textarea
                  v-model="productForm.description"
                  placeholder="Detailed description for the product page"
                ></textarea>
              </label>
            </section>

            <!-- 3.3 Detail sections -->
            <section class="modal-section" id="section-2-details">
              <h3>2. Detail sections</h3>

              <label class="field">
                <span>Materials</span>
                <textarea
                  v-model="productForm.materials"
                  placeholder="Fabric composition, key materials, etc."
                ></textarea>
              </label>

              <label class="field">
                <span>Size guide</span>
                <textarea
                  v-model="productForm.sizeGuide"
                  placeholder="Sizing guidance and measurements"
                ></textarea>
              </label>

              <label class="field">
                <span>Shipping & returns</span>
                <textarea
                  v-model="productForm.shippingReturns"
                  placeholder="Delivery times, shipping info, and returns"
                ></textarea>
              </label>

              <label class="field">
                <span>What's included</span>
                <textarea
                  v-model="productForm.whatsIncluded"
                  placeholder="What the customer receives with this product"
                ></textarea>
              </label>

              <label class="field">
                <span>Care instructions</span>
                <textarea
                  v-model="productForm.careInstructions"
                  placeholder="Washing, drying, and care guidance"
                ></textarea>
              </label>

              <label class="field">
                <span>Fit notes</span>
                <textarea
                  v-model="productForm.fitNotes"
                  placeholder="How it fits, sizing advice, and other notes"
                ></textarea>
              </label>
            </section>

<!-- 3.4 Assignments & visibility (boxed check groups) -->
<section class="modal-section" id="section-3-assignments">
  <h3>3. Assignments & visibility</h3>

  <!-- Brand boxes -->
  <div class="field">
    <span class="field-label">Brand assignments</span>
    <div class="option-box-grid">
      <label
        v-for="brand in brandOptions"
        :key="brand.id"
        class="option-box"
        :class="{
          selected: productForm.brandIds.includes(brand.id)
        }"
      >
        <!-- Hidden checkbox used for v-model binding -->
        <input
          type="checkbox"
          class="option-box-input"
          :value="brand.id"
          v-model="productForm.brandIds"
        />
        <div class="option-box-content">
          <span class="option-box-title">{{ brand.name }}</span>
        </div>
      </label>
    </div>
  </div>

  <!-- Category boxes -->
  <div class="field">
    <span class="field-label">Category assignments</span>
    <div class="option-box-grid">
      <label
        v-for="category in categoryOptions"
        :key="category.id"
        class="option-box"
        :class="{
          selected: productForm.categoryIds.includes(category.id)
        }"
      >
        <input
          type="checkbox"
          class="option-box-input"
          :value="category.id"
          v-model="productForm.categoryIds"
        />
        <div class="option-box-content">
          <span class="option-box-title">{{ category.name }}</span>
        </div>
      </label>
    </div>
  </div>

  <label class="field inline-field">
    <span>Status</span>
    <select v-model="productForm.status">
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
      <option value="archived">Archived</option>
    </select>
  </label>

  <label class="field inline-checkbox">
    <input
      type="checkbox"
      v-model="productForm.isVisible"
    />
    <span>Visible on storefront</span>
  </label>
</section>

            <!-- 3.5 Read-only meta -->
            <section class="modal-section readonly-section" id="section-4-meta">
              <h3>4. Read-only meta</h3>

              <div class="readonly-grid">
                <div class="readonly-item">
                  <span class="readonly-label">Display price</span>
                  <span class="readonly-value">{{ productForm.displayPrice || '—' }}</span>
                </div>
                <div class="readonly-item">
                  <span class="readonly-label">Variants</span>
                  <span class="readonly-value">{{ productForm.variantCount }}</span>
                </div>
                <div class="readonly-item">
                  <span class="readonly-label">Images</span>
                  <span class="readonly-value">{{ productForm.imageCount }}</span>
                </div>
                <div class="readonly-item">
                  <span class="readonly-label">Source</span>
                  <span class="readonly-value">{{ productForm.sourceType || 'Other' }}</span>
                </div>
              </div>
            </section>
          </div>

          <!-- 3.6 Modal footer -->
          <div class="product-modal-footer">
            <button class="btn-cancel" @click="closeProductModal">Cancel</button>
            <button class="btn-primary sm" @click="saveProduct" :disabled="savingProduct">
              <span v-if="!savingProduct">Save Product</span>
              <span v-else>Saving...</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ================================================ -->
    <!-- 4. TEMPLATE: MEDIA MODAL (UPLOAD + VIEWER)      -->
    <!-- ================================================ -->
    <transition name="fade">
      <div
        v-if="mediaModalOpen"
        class="modal-overlay"
        @click.self="closeMediaModal"
      >
        <div class="product-modal media-modal">
          <div class="product-modal-header">
            <div>
              <h2>Product media</h2>
              <p class="product-modal-subtitle">
                Upload your own mockup images and choose which ones are visible and primary.
              </p>
            </div>

            <button class="btn-close" @click="closeMediaModal">✕</button>
          </div>

          <div class="product-modal-body">
            <!-- 4.1 Upload block -->
            <section class="modal-section">
              <h3>Media section A: Upload mockups</h3>

              <div class="media-upload-block">
                <label class="field">
                  <span>Upload mockups</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    @change="handleMediaFileChange"
                  />
                </label>

                <button
                  type="button"
                  class="btn-secondary"
                  :disabled="!mediaUploadFiles.length || savingProduct"
                  @click="uploadMediaFiles"
                >
                  <span v-if="!savingProduct">Upload selected files</span>
                  <span v-else>Uploading...</span>
                </button>
              </div>
            </section>

            <!-- 4.2 Library picker -->
            <section class="modal-section">
              <h3>Media section B: Select from media library</h3>

              <div class="media-explorer">
                <div class="media-explorer-sidebar">
                  <div class="media-upload-block">
                    <label class="field">
                      <span>Search library</span>
                      <input
                        v-model="librarySearchQuery"
                        type="text"
                        placeholder="Search by title, type, or source"
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    class="btn-secondary sm"
                    @click="createLibraryFolder"
                  >
                    + New folder here
                  </button>

                  <button
                    type="button"
                    class="media-folder-item"
                    :class="{ active: !mediaLibraryCurrentFolderId }"
                    @click="selectAllLibraryMedia"
                  >
                    <span class="media-folder-icon">⌂</span>
                    <span class="media-folder-main">
                      <span class="media-folder-name">All media</span>
                      <span class="media-folder-meta">{{ mediaLibraryItems.length }} items</span>
                    </span>
                  </button>

                  <div v-if="mediaLibraryFolderRows.length" class="media-folder-tree">
                    <button
                      v-for="folder in mediaLibraryFolderRows"
                      :key="folder.id"
                      type="button"
                      class="media-folder-item"
                      :class="{ active: mediaLibraryCurrentFolderId === folder.id }"
                      :style="{ marginLeft: `${folder.depth * 14}px` }"
                      @click="handleLibraryFolderSelect(folder)"
                    >
                      <span class="media-folder-icon">📁</span>
                      <span class="media-folder-main">
                        <span class="media-folder-name">{{ folder.name }}</span>
                        <span class="media-folder-meta">{{ collectionMediaCount(folder.id) }} items</span>
                      </span>
                    </button>
                  </div>
                </div>

                <div class="media-explorer-main">
                  <nav v-if="mediaLibraryCurrentFolderPath.length" class="media-breadcrumb" aria-label="Media folder breadcrumb">
                    <button type="button" class="media-breadcrumb-link" @click="selectAllLibraryMedia">
                      All media
                    </button>
                    <span
                      v-for="(folder, index) in mediaLibraryCurrentFolderPath"
                      :key="folder.id"
                      class="media-breadcrumb-segment"
                    >
                      <span class="media-breadcrumb-separator">/</span>
                      <button
                        type="button"
                        class="media-breadcrumb-link"
                        :class="{ current: index === mediaLibraryCurrentFolderPath.length - 1 }"
                        @click="handleLibraryBreadcrumbClick(folder)"
                      >
                        {{ folder.name }}
                      </button>
                    </span>
                  </nav>

                  <div v-if="filteredLibraryMediaItems.length" class="media-gallery">
                    <div class="media-thumb-strip media-thumb-grid">
                      <button
                        v-for="item in filteredLibraryMediaItems"
                        :key="item.id"
                        type="button"
                        class="media-thumb-btn media-library-thumb"
                        @click="attachLibraryMediaItem(item)"
                        :class="{ attached: selectedProductMediaIds.has(item.id) }"
                      >
                        <span class="media-thumb-checkbox" :class="{ checked: selectedProductMediaIds.has(item.id) }">
                          <input
                            type="checkbox"
                            :checked="selectedProductMediaIds.has(item.id)"
                            tabindex="-1"
                            aria-label="Selected for this product"
                          />
                        </span>
                        <img
                          :src="item.url"
                          :alt="item.altText || item.title || 'Library media'"
                        />
                        <span class="media-thumb-label">{{ item.title || 'Untitled asset' }}</span>
                        <span v-if="selectedProductMediaIds.has(item.id)" class="media-thumb-attached-badge">
                          Attached
                        </span>
                        <span class="media-thumb-actions">
                          <button
                            type="button"
                            class="media-mini-action"
                            @click.stop="moveLibraryMediaItemToCurrentFolder(item)"
                            :disabled="!mediaLibraryCurrentFolderId"
                          >
                            Move here
                          </button>
                        </span>
                      </button>
                    </div>
                  </div>

                  <p v-else class="media-empty">
                    <span v-if="mediaLibraryCurrentFolderId">No media items in this folder yet.</span>
                    <span v-else>No media items in the library yet. Upload them from the media library first.</span>
                  </p>
                </div>
              </div>
            </section>

            <!-- 4.3 Existing images viewer/editor -->
            <section class="modal-section">
              <h3>Media section C: Existing product images</h3>

              <div v-if="selectedProductImages.length" class="media-gallery">
                <div class="media-viewer">
                  <img
                    :src="activeMediaImage.signedUrl || activeMediaImage.url"
                    :alt="activeMediaImage.altText || 'Product image'"
                  />
                </div>

                <div class="media-controls">
                  <div class="media-nav">
                    <button
                      type="button"
                      class="btn-media-nav"
                      @click="prevMediaImage"
                      :disabled="selectedMediaIndex === 0"
                    >
                      ← Previous
                    </button>

                    <span class="media-counter">
                      Image {{ selectedMediaIndex + 1 }} of {{ selectedProductImages.length }}
                    </span>

                    <button
                      type="button"
                      class="btn-media-nav"
                      @click="nextMediaImage"
                      :disabled="selectedMediaIndex === selectedProductImages.length - 1"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                <div class="media-thumb-strip">
                  <button
                    v-for="(image, index) in selectedProductImages"
                    :key="image.id"
                    type="button"
                    class="media-thumb-btn"
                    :class="{ active: selectedMediaIndex === index }"
                    @click="selectedMediaIndex = index"
                  >
                    <img
                      :src="image.signedUrl || image.url"
                      :alt="image.altText || `Product image ${index + 1}`"
                    />
                    <span v-if="mediaForm.primaryImageId === image.id" class="media-thumb-main-badge">
                      Main
                    </span>
                  </button>
                </div>

                <div class="media-editor">
                  <label class="media-color">
                    <span>Alt text</span>
                    <input
                      type="text"
                      v-model="activeMediaImage.altText"
                      placeholder="Describe the image"
                    />
                  </label>

                  <label class="media-color">
                    <span>Colour name</span>
                    <input
                      type="text"
                      v-model="activeMediaImage.color"
                      placeholder="e.g. Black, Sand, Forest Green"
                    />
                  </label>

                  <label class="media-color">
                    <span>Colour hex</span>
                    <input
                      type="text"
                      v-model="activeMediaImage.colorHex"
                      placeholder="#000000"
                    />
                  </label>

                  <label class="media-checkbox">
                    <input
                      type="checkbox"
                      :value="activeMediaImage.id"
                      v-model="mediaForm.visibleImageIds"
                    />
                    Visible on storefront
                  </label>

                  <label class="media-radio">
                    <input
                      type="radio"
                      name="primaryImage"
                      :value="activeMediaImage.id"
                      v-model="mediaForm.primaryImageId"
                    />
                    Set as primary image
                  </label>

                  <button
                    type="button"
                    class="btn-secondary sm"
                    @click="setPrimaryMediaImage(activeMediaImage.id)"
                  >
                    Make this the main image
                  </button>

                  <button
                    type="button"
                    class="btn-danger media-delete-button"
                    @click="deleteImage(activeMediaImage.id)"
                  >
                    Delete image
                  </button>
                </div>
              </div>

              <p v-else class="media-empty">
                No images uploaded yet for this product.
              </p>
            </section>
          </div>

          <div class="product-modal-footer media-dialog-actions">
            <button
              type="button"
              class="btn-primary sm"
              @click="saveMediaChanges"
              :disabled="savingProduct"
            >
              <span v-if="!savingProduct">Save media changes</span>
              <span v-else>Saving...</span>
            </button>
            <button
              type="button"
              class="btn-cancel"
              @click="closeMediaModal"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
/*
5. SCRIPT: IMPORTS & EXTENSION
   - Imports base logic and extends it to add UI-specific state
*/

import productControlLogic from './ProductControl.js';

export default {
  /*
  6. SCRIPT: DATA
     - Base data from productControlLogic
     - UI additions (selectedMediaIndex)
  */
  extends: productControlLogic,
  data() {
    const base =
      typeof productControlLogic.data === 'function'
        ? productControlLogic.data.call(this)
        : {};
    return {
      ...base,
      selectedMediaIndex: 0,
    };
  },

  /*
  7. SCRIPT: COMPUTED PROPERTIES
     - activeMediaImage: convenience accessor for current image
  */
  computed: {
    activeMediaImage() {
      return this.selectedProductImages[this.selectedMediaIndex] || {};
    },
  },

  /*
  8. SCRIPT: METHODS
     - Overrides / wraps base methods for media modal navigation
  */
  methods: {
    ...productControlLogic.methods,

    // 8.1 Open media modal for a product
    async openMediaModal(product, options = {}) {
      if (productControlLogic.methods?.openMediaModal) {
        await productControlLogic.methods.openMediaModal.call(this, product, options);
      } else {
        this.mediaModalOpen = true;
        this.selectedProduct = product;
      }
      this.selectedMediaIndex = 0;
    },

    // 8.2 Navigate to previous image
    prevMediaImage() {
      if (this.selectedMediaIndex > 0) {
        this.selectedMediaIndex -= 1;
      }
    },

    // 8.3 Navigate to next image
    nextMediaImage() {
      if (this.selectedMediaIndex < this.selectedProductImages.length - 1) {
        this.selectedMediaIndex += 1;
      }
    },
  },
};
</script>

<!--
9. STYLE: EXTERNAL CSS IMPORT
   - See ProductControl.css for layout and visual styles
-->
<style src="./ProductControl.css"></style>