<template>
  <section class="admin-page admin-brands-page">
    <div class="admin-page-header">
      <div>
        <p class="admin-page-eyebrow">Merch Admin</p>
        <h1>Brands</h1>
        <p class="admin-page-intro">
          Create and manage storefront brands like Project Respawn, streamer brands, and trainer brands.
        </p>
      </div>
    </div>

    <div class="admin-brands-grid">
      <article class="admin-page-card brand-form-card">
        <div class="card-head">
          <div>
            <h2>Add Brand</h2>
            <p>Create a new brand entry for the merch store.</p>
          </div>
        </div>

        <form class="brand-form" @submit.prevent="addBrand">
          <div class="form-row">
            <label for="brand-name">Brand name</label>
            <input
              id="brand-name"
              v-model.trim="newBrand.name"
              type="text"
              placeholder="Project Respawn"
              :disabled="saving"
            />
          </div>

          <div class="form-row">
            <label for="brand-slug">Slug</label>
            <input
              id="brand-slug"
              v-model.trim="newBrand.slug"
              type="text"
              placeholder="project-respawn"
              :disabled="saving"
            />
          </div>

          <div class="form-row">
            <label for="brand-description">Description</label>
            <textarea
              id="brand-description"
              v-model.trim="newBrand.description"
              rows="4"
              placeholder="Short description for this brand"
              :disabled="saving"
            ></textarea>
          </div>

          <div class="form-row">
            <label for="brand-sort-order">Sort order</label>
            <input
              id="brand-sort-order"
              v-model.number="newBrand.sortOrder"
              type="number"
              min="0"
              step="1"
              :disabled="saving"
            />
          </div>

          <div class="form-row form-row-checkbox">
            <label class="checkbox-row" for="brand-is-active">
              <input
                id="brand-is-active"
                v-model="newBrand.isActive"
                type="checkbox"
                :disabled="saving"
              />
              <span>Brand is active</span>
            </label>
          </div>

          <p v-if="formError" class="form-error">{{ formError }}</p>
          <p v-if="toastMessage" class="form-success">{{ toastMessage }}</p>

          <div class="form-actions">
            <button class="btn-primary" type="submit" :disabled="saving">
              {{ saving ? 'Adding...' : 'Add brand' }}
            </button>
            <button
              class="btn-secondary"
              type="button"
              @click="resetForm"
              :disabled="saving"
            >
              Reset
            </button>
          </div>
        </form>
      </article>

      <article class="admin-page-card brand-list-card">
        <div class="card-head card-head-split">
          <div>
            <h2>Existing Brands</h2>
            <p>
              {{ brands.length }} brand<span v-if="brands.length !== 1">s</span>
              in the store system.
            </p>
          </div>

          <div class="brand-stats">
            <span class="stat-chip">
              Active: {{ activeBrandCount }}
            </span>
            <span class="stat-chip muted">
              Archived: {{ archivedBrandCount }}
            </span>
          </div>
        </div>

        <div v-if="loading" class="empty-state">
          Loading brands...
        </div>

        <div v-else-if="loadError" class="empty-state">
          <p>{{ loadError }}</p>
          <button class="btn-secondary" type="button" @click="fetchBrands">
            Retry
          </button>
        </div>

        <div v-else-if="brands.length" class="brand-list">
          <article
            v-for="brand in brands"
            :key="brand.id"
            class="brand-item"
          >
            <div class="brand-item-main">
              <div class="brand-item-top">
                <h3>{{ brand.name }}</h3>
                <span
                  class="status-badge"
                  :class="brand.isActive ? 'is-active' : 'is-archived'"
                >
                  {{ brand.isActive ? 'active' : 'archived' }}
                </span>
              </div>

              <p class="brand-slug">/{{ brand.slug }}</p>
              <p class="brand-description">
                {{ brand.description || 'No description added yet.' }}
              </p>
            </div>

            <div class="brand-item-actions">
              <label class="owner-control">
                <span>Brand Owner</span>
                <select v-model="ownerInputs[brand.id]" :disabled="saving || loadingOwnerUsers">
                  <option value="">Not assigned — select an eligible user</option>
                  <option v-for="user in ownerUsers" :key="user.userId" :value="user.userId">{{ user.label }}</option>
                </select>
              </label>
              <p v-if="ownerUsersError" class="owner-error">{{ ownerUsersError }}</p>
              <button class="btn-secondary" type="button" @click="saveBrandOwner(brand)" :disabled="saving">
                {{ brand.ownerUserId ? 'Change owner' : 'Assign owner' }}
              </button>
              <button
                class="btn-secondary"
                type="button"
                @click="toggleBrandStatus(brand)"
                :disabled="saving"
              >
                {{ brand.isActive ? 'Archive' : 'Restore' }}
              </button>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <p>No brands have been created yet.</p>
          <p>Add your first brand using the form on the left.</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script src="./AdminBrands.js"></script>
<style src="./AdminBrands.css"></style>
