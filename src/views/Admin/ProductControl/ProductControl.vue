<template>
  <div class="admin-product-control-page">
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

        <button class="btn-fetch" @click="loadProducts" :disabled="loadingProducts || syncingProducts">
          <span v-if="!loadingProducts">↻ Refresh</span>
          <span v-else>Loading...</span>
        </button>
      </div>
    </div>

    <div v-if="loadError" class="page-alert error">
      {{ loadError }}
    </div>

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
                <button class="btn-manage" @click="openProductModal(product)">
                  Edit Product
                </button>
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

    <transition name="toast">
      <div v-if="toastMessage" class="toast">✓ {{ toastMessage }}</div>
    </transition>

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
            <section class="modal-section">
              <h3>Overview</h3>

              <div class="field-grid two">
                <label class="field">
                  <span>Title</span>
                  <input v-model="productForm.title" type="text" />
                </label>

                <label class="field">
                  <span>Slug</span>
                  <input v-model="productForm.slug" type="text" />
                </label>

                <label class="field">
                  <span>Status</span>
                  <select v-model="productForm.status">
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>

                <label class="field checkbox-field">
                  <span>Visible on storefront</span>
                  <input v-model="productForm.isVisible" type="checkbox" />
                </label>
              </div>
            </section>

            <section class="modal-section">
              <h3>Storefront copy</h3>

              <div class="field-grid">
                <label class="field">
                  <span>Short description</span>
                  <textarea v-model="productForm.shortDescription" rows="3"></textarea>
                </label>

                <label class="field">
                  <span>Description</span>
                  <textarea v-model="productForm.description" rows="5"></textarea>
                </label>
              </div>
            </section>

            <section class="modal-section">
              <h3>Detail sections</h3>

              <div class="field-grid">
                <label class="field">
                  <span>Materials</span>
                  <textarea v-model="productForm.materials" rows="4"></textarea>
                </label>

                <label class="field">
                  <span>Size guide</span>
                  <textarea v-model="productForm.sizeGuide" rows="4"></textarea>
                </label>

                <label class="field">
                  <span>Shipping &amp; returns</span>
                  <textarea v-model="productForm.shippingReturns" rows="4"></textarea>
                </label>

                <label class="field">
                  <span>What’s included</span>
                  <textarea v-model="productForm.whatsIncluded" rows="4"></textarea>
                </label>

                <label class="field">
                  <span>Care instructions</span>
                  <textarea v-model="productForm.careInstructions" rows="4"></textarea>
                </label>

                <label class="field">
                  <span>Fit notes</span>
                  <textarea v-model="productForm.fitNotes" rows="4"></textarea>
                </label>
              </div>
            </section>

            <section class="modal-section">
              <h3>Assignments</h3>

              <div class="field-grid two">
                <label class="field">
                  <span>Brand</span>
                  <select v-model="productForm.brandId">
                    <option value="">No brand</option>
                    <option
                      v-for="brand in brandOptions"
                      :key="brand.id"
                      :value="brand.id"
                    >
                      {{ brand.name }}
                    </option>
                  </select>
                </label>

                <label class="field">
                  <span>Category</span>
                  <select v-model="productForm.categoryId">
                    <option value="">No category</option>
                    <option
                      v-for="category in categoryOptions"
                      :key="category.id"
                      :value="category.id"
                    >
                      {{ category.name }}
                    </option>
                  </select>
                </label>
              </div>
            </section>

            <section class="modal-section compact">
              <h3>Read-only info</h3>

              <div class="readonly-grid">
                <div class="readonly-card">
                  <span class="readonly-label">Source</span>
                  <span class="readonly-value">{{ productForm.sourceType || '—' }}</span>
                </div>

                <div class="readonly-card">
                  <span class="readonly-label">Display price</span>
                  <span class="readonly-value">{{ productForm.displayPrice || '—' }}</span>
                </div>

                <div class="readonly-card">
                  <span class="readonly-label">Variant count</span>
                  <span class="readonly-value">{{ productForm.variantCount || 0 }}</span>
                </div>

                <div class="readonly-card">
                  <span class="readonly-label">Image count</span>
                  <span class="readonly-value">{{ productForm.imageCount || 0 }}</span>
                </div>
              </div>
            </section>
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
  </div>
</template>

<script src="./ProductControl.js"></script>
<style src="./ProductControl.css"></style>