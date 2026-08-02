<template>
  <main class="merch-page">
    <section class="merch-hero">
      <div class="container">
        <p class="merch-eyebrow">Project Respawn</p>
        <h1>Merch Store</h1>
        <p class="merch-subtitle">
          Browse merch, digital extras, and future custom products in one place.
        </p>

        <div class="shipping-notice" role="note">
          <p>
            We currently ship to the UK, Europe, and the USA.
            If you'd like to order from another location, please contact us to discuss pricing —
            we'd love to hear from anyone wanting to showcase the Project Respawn brand.
          </p>
        </div>
      </div>
    </section>

    <section class="container merch-toolbar">
      <div class="toolbar-top">
        <p class="merch-status">{{ statusMessage }}</p>
      </div>

      <div class="filter-stack">
        <div v-if="brandOptions.length" class="filter-group">
          <p class="filter-label">Brand</p>
          <div class="filter-chips">
            <button
              type="button"
              class="filter-chip"
              :class="{ active: selectedBrand === '' }"
              @click="selectedBrand = ''"
            >
              All
            </button>

            <button
              v-for="brand in brandOptions"
              :key="brand"
              type="button"
              class="filter-chip"
              :class="{ active: selectedBrand === brand }"
              @click="selectedBrand = brand"
            >
              {{ brand }}
            </button>
          </div>
        </div>

        <div v-if="categoryOptions.length" class="filter-group">
          <p class="filter-label">Categories</p>
          <div class="filter-chips">
            <button
              type="button"
              class="filter-chip"
              :class="{ active: selectedCategory === '' }"
              @click="selectedCategory = ''"
            >
              All
            </button>

            <button
              v-for="category in categoryOptions"
              :key="category"
              type="button"
              class="filter-chip"
              :class="{ active: selectedCategory === category }"
              @click="selectedCategory = category"
            >
              {{ category }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="selectedBrand || selectedCategory" class="active-filters">
        <span v-if="selectedBrand" class="active-filter-pill">
          Brand: {{ selectedBrand }}
        </span>

        <span v-if="selectedCategory" class="active-filter-pill">
          Category: {{ selectedCategory }}
        </span>

        <button type="button" class="clear-filters" @click="resetFilters">
          Clear filters
        </button>
      </div>
    </section>

    <section class="container">
      <div v-if="loading" class="empty-state">
        Loading products...
      </div>

      <div v-else-if="filteredProducts.length" class="product-grid">
        <article
          v-for="product in filteredProducts"
          :key="product.id"
          class="product-card"
        >
          <div class="product-image-wrap">
            <img
              :src="product.image || product.thumbnailUrl || product.images?.[0]?.url || fallbackImage"
              :alt="product.title || 'Product image'"
              loading="lazy"
            />
          </div>

          <div class="product-card-content">
            <h2 class="product-title">
              {{ product.title || 'Untitled product' }}
            </h2>

            <p class="product-description">
              {{
                product.description ||
                'View details to see info on sizing and colours available.'
              }}
            </p>

            <div class="product-footer">
              <div class="product-price">
                {{ product.displayPrice || 'Price unavailable' }}
              </div>

              <p v-if="product.variantCount" class="variant-count">
                {{ product.variantCount }} variants
              </p>
            </div>

            <div class="product-actions">
              <button
                class="btn-primary"
                type="button"
                @click="openProduct(product)"
              >
                View details
              </button>

              <a
                v-if="product.productUrl"
                class="btn-secondary"
                :href="product.productUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                Product page
              </a>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="empty-state">
        Check back for new products soon 🙂
      </div>
    </section>

    <dialog ref="productDialog" class="product-dialog">
      <div v-if="selectedProduct" class="product-dialog-content product-dialog-layout">
        <button
          class="dialog-close"
          type="button"
          @click="closeDialog"
          aria-label="Close product details"
        >
          ×
        </button>

        <div class="dialog-media-column">
          <div class="dialog-image-wrap dialog-image-large">
            <img
              :src="selectedVariantImage || selectedProduct?.image || selectedProduct?.thumbnailUrl || selectedProduct?.images?.[0]?.url || fallbackImage"
              :alt="activeGalleryImage?.altText || selectedProduct.title || 'Product image'"
            />

            <button
              v-if="selectedProductGallery.length > 1"
              type="button"
              class="gallery-nav gallery-nav-prev"
              @click="prevGalleryImage"
              aria-label="Previous product image"
            >
              ‹
            </button>

            <button
              v-if="selectedProductGallery.length > 1"
              type="button"
              class="gallery-nav gallery-nav-next"
              @click="nextGalleryImage"
              aria-label="Next product image"
            >
              ›
            </button>
          </div>

          <div
            v-if="selectedProductGallery.length > 1"
            class="gallery-meta"
          >
            <span>
              {{ activeGalleryIndex + 1 }} / {{ selectedProductGallery.length }}
            </span>
          </div>

          <div
            v-if="selectedProductGallery.length > 1"
            class="gallery-thumbnails"
          >
            <button
              v-for="(image, index) in selectedProductGallery"
              :key="image.id || `${image.url}-${index}`"
              type="button"
              class="gallery-thumb"
              :class="{ active: index === activeGalleryIndex }"
              @click="selectGalleryImage(index)"
              :aria-label="`Show image ${index + 1}`"
            >
              <img
                :src="image.url || fallbackImage"
                :alt="image.altText || `${selectedProduct.title} thumbnail ${index + 1}`"
                loading="lazy"
              />
            </button>
          </div>

          <div
            v-if="selectedProduct.variants && selectedProduct.variants.length"
            class="variant-picker variant-picker-grid"
          >
            <div class="variant-field">
              <label for="color-select">Colour</label>
              <select
                id="color-select"
                v-model="selectedColor"
                @change="onColorChange"
              >
                <option
                  v-for="color in availableColors"
                  :key="color"
                  :value="color"
                >
                  {{ color }}
                </option>
              </select>
            </div>

            <div class="variant-field">
              <label for="size-select">Size</label>
              <select
                id="size-select"
                v-model="selectedSize"
              >
                <option
                  v-for="size in availableSizes"
                  :key="size"
                  :value="size"
                >
                  {{ size }}
                </option>
              </select>
            </div>

            <div class="variant-field">
              <label for="quantity-select">Quantity</label>
              <input
                id="quantity-select"
                v-model.number="selectedQuantity"
                type="number"
                min="1"
                step="1"
                @change="normalizeQuantity"
              />
            </div>

            <div class="variant-field variant-field-button">
              <label class="sr-only" for="add-to-cart-button">Add to cart</label>
              <button
                id="add-to-cart-button"
                class="btn-primary add-to-cart-btn"
                type="button"
                @click="addToCart"
                :disabled="selectedProduct.variants.length > 0 && !selectedVariant"
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>

        <div class="dialog-info dialog-details-column">
          <h2>{{ selectedProduct.title }}</h2>

          <div class="product-price dialog-price">
            {{ selectedVariantPrice }}
          </div>

          <p class="dialog-description">
            {{
              selectedProduct.description ||
              'Pick a colour and size to view the current price and availability.'
            }}
          </p>

          <ul v-if="selectedVariant" class="variant-details">
            <li><strong>Colour:</strong> {{ selectedVariant.color || 'N/A' }}</li>
            <li><strong>Size:</strong> {{ selectedVariant.size || 'N/A' }}</li>
            <li><strong>Availability:</strong> {{ selectedVariant.availabilityStatus || 'Availability unknown' }}</li>
          </ul>

          <div class="product-detail-sections">
            <details class="product-detail-block" open>
              <summary>Materials</summary>
              <div class="product-detail-body">
                <p>{{ selectedProduct.materials || 'Materials information will be added soon.' }}</p>
              </div>
            </details>

            <details class="product-detail-block">
              <summary>Size guide</summary>
              <div class="product-detail-body">
                <p>{{ selectedProduct.sizeGuide || 'Size guide information will be added soon.' }}</p>
              </div>
            </details>

            <details class="product-detail-block">
              <summary>Shipping &amp; returns</summary>
              <div class="product-detail-body">
                <p>
                  {{
                    selectedProduct.shippingReturns ||
                    'Shipping and return information will be added soon.'
                  }}
                </p>
              </div>
            </details>

            <details class="product-detail-block">
              <summary>What’s included</summary>
              <div class="product-detail-body">
                <p>{{ selectedProduct.whatsIncluded || 'What’s included will be added soon.' }}</p>
              </div>
            </details>

            <details class="product-detail-block">
              <summary>Care instructions</summary>
              <div class="product-detail-body">
                <p>{{ selectedProduct.careInstructions || 'Care instructions will be added soon.' }}</p>
              </div>
            </details>

            <details class="product-detail-block">
              <summary>Fit notes</summary>
              <div class="product-detail-body">
                <p>{{ selectedProduct.fitNotes || 'Fit notes will be added soon.' }}</p>
              </div>
            </details>
          </div>

          <a
            v-if="selectedProduct.productUrl"
            class="btn-secondary dialog-product-link"
            :href="selectedProduct.productUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            View full product page
          </a>
        </div>
      </div>
    </dialog>
  </main>
</template>

<script>
import merchLogic from './Merch.logic.js';

export default merchLogic;
</script>

<style scoped src="./Merch.css"></style>