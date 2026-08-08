<template>
  <section class="admin-page admin-categories-page">
    <div class="admin-page-header">
      <div>
        <p class="admin-page-eyebrow">Merch Admin</p>
        <h1>Merch Categories</h1>
        <p class="admin-page-intro">
          Create and manage storefront product types such as shirts, accessories, kitchenware, and other merch sections.
        </p>
      </div>
    </div>

    <div v-if="loading" class="admin-page-card empty-state">
      Loading merch categories...
    </div>

    <div
      v-else-if="loadError && !categories.length"
      class="admin-page-card empty-state"
    >
      <p>{{ loadError }}</p>
      <button class="btn-secondary" type="button" @click="initializePage">
        Retry
      </button>
    </div>

    <div v-else class="admin-categories-grid">
      <article class="admin-page-card category-form-card">
        <div class="card-head">
          <div>
            <h2>Add Category</h2>
            <p>Create a new merch category for storefront browsing and product assignment.</p>
          </div>
        </div>

        <form class="category-form" @submit.prevent="addCategory">
          <div class="form-row">
            <label for="category-name">Category name</label>
            <input
              id="category-name"
              v-model.trim="newCategory.name"
              type="text"
              placeholder="Shirts"
              :disabled="saving"
            />
          </div>

          <div class="form-row">
            <label for="category-slug">Slug</label>
            <input
              id="category-slug"
              v-model.trim="newCategory.slug"
              type="text"
              placeholder="shirts"
              :disabled="saving"
            />
          </div>

          <div class="form-row">
            <label for="category-description">Description</label>
            <textarea
              id="category-description"
              v-model.trim="newCategory.description"
              rows="4"
              placeholder="Short description for this merch category"
              :disabled="saving"
            ></textarea>
          </div>

          <div class="form-row">
            <label for="category-sort-order">Sort order</label>
            <input
              id="category-sort-order"
              v-model.number="newCategory.sortOrder"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              :disabled="saving"
            />
          </div>

          <div class="form-row form-row-checkbox">
            <label class="checkbox-row" for="category-is-active">
              <input
                id="category-is-active"
                v-model="newCategory.isActive"
                type="checkbox"
                :disabled="saving"
              />
              <span>Category is active</span>
            </label>
          </div>


          <p v-if="formError" class="form-error">
            {{ formError }}
          </p>

          <p v-if="toastMessage" class="form-success">
            {{ toastMessage }}
          </p>

          <div class="form-actions">
            <button
              class="btn-primary"
              type="submit"
              :disabled="isSubmitDisabled"
            >
              {{ saving ? 'Saving...' : 'Add category' }}
            </button>
            <button
              class="btn-secondary"
              type="button"
              :disabled="saving"
              @click="resetForm"
            >
              Reset
            </button>
          </div>
        </form>
      </article>

      <article class="admin-page-card category-list-card">
        <div class="card-head card-head-split">
          <div>
            <h2>Existing Categories</h2>
            <p>
              {{ filteredCategories.length }}
              categor<span v-if="filteredCategories.length === 1">y</span><span v-else>ies</span>
              in the merch system.
            </p>
          </div>

          <div class="category-stats">
            <span class="stat-chip">
              Active: {{ activeCategoryCount }}
            </span>
            <span class="stat-chip muted">
              Archived: {{ archivedCategoryCount }}
            </span>
          </div>
        </div>

        <div v-if="filteredCategories.length" class="category-list">
          <article
            v-for="category in filteredCategories"
            :key="category.id"
            class="category-item"
          >
            <div class="category-item-main">
              <div class="category-item-top">
                <h3>{{ category.name }}</h3>
                <span
                  class="status-badge"
                  :class="category.isActive ? 'is-active' : 'is-archived'"
                >
                  {{ category.isActive ? 'active' : 'archived' }}
                </span>
              </div>

              <p class="category-slug">/{{ category.slug }}</p>

              <p class="category-description">
                {{ category.description || 'No description added yet.' }}
              </p>

              <div class="category-meta">
                <span class="meta-chip">
                  Sort: {{ category.sortOrder }}
                </span>
              </div>
            </div>

            <div class="category-item-actions">
              <button
                class="btn-secondary"
                type="button"
                :disabled="saving"
                @click="toggleCategoryStatus(category)"
              >
                {{ category.isActive ? 'Archive' : 'Restore' }}
              </button>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          No merch categories have been created yet.
        </div>

        <p v-if="loadError && categories.length" class="form-error">
          {{ loadError }}
        </p>
      </article>
    </div>
  </section>
</template>

<script src="./AdminMerchCategories.js"></script>
<style src="./AdminMerchCategories.css"></style>
