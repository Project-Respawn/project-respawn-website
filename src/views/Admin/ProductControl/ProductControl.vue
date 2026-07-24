<template>
  <div class="admin-product-control-page">
    <!-- Header -->
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

    <!-- Toolbar -->
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

    <!-- Errors -->
    <div v-if="loadError" class="page-alert error">
      {{ loadError }}
    </div>

    <!-- Products table -->
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

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toastMessage" class="toast">✓ {{ toastMessage }}</div>
    </transition>

    <!-- Product edit modal (unchanged) -->
    <transition name="fade">
      <div v-if="productModal" class="modal-overlay" @click.self="closeProductModal">
        <div class="product-modal">
          <div class="product-modal-header">
            <div>
              <h2>{{ productForm.title || 'Edit product' }}</h2>
              <p class="product-modal-subtitle">
                Update storefront copy, assignments, and product detail sections
              </p>
            </div>

            <button class="btn-close" @click="closeProductModal">✕</button>
          </div>

          <div class="product-modal-body">
            <!-- overview, copy, assignments, readonly sections unchanged -->
            <!-- ... your existing sections exactly as before ... -->
          </div>

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

    <!-- Media popout modal -->
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
            <!-- Upload block (unchanged) -->
            <section class="modal-section">
              <h3>Upload mockups</h3>

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

            <!-- New media viewer -->
            <section class="modal-section">
              <h3>Existing images</h3>

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
                      name="featuredImage"
                      :value="activeMediaImage.id"
                      v-model="mediaForm.featuredImageId"
                    />
                    Set as primary image
                  </label>

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
import productControlLogic from './ProductControl.js';

export default {
  extends: productControlLogic,
  data() {
    const base = typeof productControlLogic.data === 'function'
      ? productControlLogic.data.call(this)
      : {};
    return {
      ...base,
      selectedMediaIndex: 0
    };
  },
  computed: {
    activeMediaImage() {
      return this.selectedProductImages[this.selectedMediaIndex] || {};
    }
  },
  methods: {
    ...productControlLogic.methods,

    openMediaModal(product) {
      if (productControlLogic.methods?.openMediaModal) {
        productControlLogic.methods.openMediaModal.call(this, product);
      } else {
        // your existing open logic if it was in data/methods
        this.mediaModalOpen = true;
        this.selectedProduct = product;
        // and you probably set selectedProductImages here already
      }
      this.selectedMediaIndex = 0;
    },

    prevMediaImage() {
      if (this.selectedMediaIndex > 0) {
        this.selectedMediaIndex -= 1;
      }
    },

    nextMediaImage() {
      if (this.selectedMediaIndex < this.selectedProductImages.length - 1) {
        this.selectedMediaIndex += 1;
      }
    }
  }
};
</script>

<style src="./ProductControl.css"></style>