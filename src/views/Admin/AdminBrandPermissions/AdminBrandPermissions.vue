<template>
  <section class="admin-page admin-brand-permissions-page">
    <div class="admin-page-header">
      <div>
        <p class="admin-page-eyebrow">Merch Admin</p>
        <h1>Brand Permissions</h1>
        <p class="admin-page-intro">
          Search for users, assign them to a brand, and review who currently has access to each brand.
        </p>
      </div>
    </div>

    <div v-if="loading" class="admin-page-card empty-state">
      Loading brand permissions...
    </div>

    <div
      v-else-if="loadError && !brands.length && !assignments.length"
      class="admin-page-card empty-state"
    >
      <p>{{ loadError }}</p>
      <button class="btn-secondary" type="button" @click="initializePage">
        Retry
      </button>
    </div>

    <div v-else class="admin-brand-permissions-layout">
      <article class="admin-page-card permissions-search-card">
        <div class="card-head">
          <div>
            <h2>Assign User to Brand</h2>
            <p>Search for a user account, then grant access to a selected brand.</p>
          </div>
        </div>

        <div class="form-row">
          <label for="user-search">Search users</label>
          <input
            id="user-search"
            v-model.trim="userSearch"
            type="text"
            placeholder="Search by name or email"
            :disabled="saving"
          />
        </div>

        <div class="user-search-results">
          <button
            v-for="user in filteredUsers"
            :key="user.id"
            type="button"
            class="user-result-card"
            :class="{ 'is-selected': selectedUser && selectedUser.id === user.id }"
            :disabled="saving"
            @click="selectUser(user)"
          >
            <span class="user-result-name">{{ user.name }}</span>
            <span v-if="user.email" class="user-result-meta">
              {{ user.email }}
            </span>
          </button>

          <div v-if="userSearch && !filteredUsers.length" class="empty-inline-state">
            No users match your search.
          </div>

          <div v-else-if="!allUsers.length" class="empty-inline-state">
            No users available yet.
          </div>
        </div>

        <form class="permission-form" @submit.prevent="assignUserToBrand">
          <div class="form-row">
            <label for="assignment-brand">Brand</label>
            <select
              id="assignment-brand"
              v-model="newAssignment.brandId"
              :disabled="saving || !brands.length"
            >
              <option disabled value="">Select a brand</option>
              <option
                v-for="brand in brands"
                :key="brand.id"
                :value="brand.id"
              >
                {{ brand.name }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <label for="assignment-level">Access level</label>
            <select
              id="assignment-level"
              v-model="newAssignment.accessLevel"
              :disabled="saving"
            >
              <option value="assign">Assign products only</option>
              <option value="manage">Assign and manage products</option>
            </select>
          </div>

          <div v-if="selectedUser" class="selected-user-panel">
            <p class="selected-user-label">Selected user</p>
            <div class="selected-user-card">
              <strong>{{ selectedUser.name }}</strong>
              <span v-if="selectedUser.email">{{ selectedUser.email }}</span>
            </div>
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
              {{ saving ? 'Assigning...' : 'Assign brand access' }}
            </button>

            <button
              class="btn-secondary"
              type="button"
              :disabled="saving"
              @click="resetAssignmentForm"
            >
              Reset
            </button>
          </div>
        </form>
      </article>

      <article class="admin-page-card permissions-brand-card">
        <div class="card-head">
          <div>
            <h2>Brand Access Viewer</h2>
            <p>Select a brand to see who currently has access to it.</p>
          </div>
        </div>

        <div class="form-row">
          <label for="brand-viewer">View brand members</label>
          <select
            id="brand-viewer"
            v-model="selectedBrandFilter"
            :disabled="saving || !brands.length"
          >
            <option disabled value="">Select a brand</option>
            <option
              v-for="brand in brands"
              :key="brand.id"
              :value="brand.id"
            >
              {{ brand.name }}
            </option>
          </select>
        </div>

        <div v-if="selectedBrandFilter" class="brand-members-summary">
          <p>
            Showing access for
            <strong>{{ getBrandName(selectedBrandFilter) }}</strong>
          </p>
        </div>

        <div
          v-if="selectedBrandFilter && filteredAssignments.length"
          class="brand-member-list"
        >
          <article
            v-for="assignment in filteredAssignments"
            :key="assignment.id"
            class="brand-member-item"
          >
            <div class="brand-member-main">
              <div class="brand-member-top">
                <h3>{{ assignment.userName }}</h3>
                <span
                  class="scope-badge"
                  :class="assignment.accessLevel === 'assign' ? 'is-assign' : 'is-manage'"
                >
                  {{
                    assignment.accessLevel === 'assign'
                      ? 'Assign only'
                      : 'Assign + manage products'
                  }}
                </span>
              </div>

              <p v-if="assignment.email" class="brand-member-meta">
                {{ assignment.email }}
              </p>
            </div>

            <div class="brand-member-actions">
              <button
                class="btn-secondary btn-danger"
                type="button"
                :disabled="saving"
                @click="removeAssignment(assignment)"
              >
                Remove from brand
              </button>
            </div>
          </article>
        </div>

        <div v-else-if="selectedBrandFilter" class="empty-state">
          No users currently have access to this brand.
        </div>

        <div v-else class="empty-state">
          Select a brand to view its members.
        </div>

        <p v-if="loadError && (brands.length || assignments.length)" class="form-error">
          {{ loadError }}
        </p>
      </article>
    </div>
  </section>
</template>

<script src="./AdminBrandPermissions.js"></script>
<style scoped src="./AdminBrandPermissions.css"></style>