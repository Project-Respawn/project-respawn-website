<template>
  <div class="admin-permissions-page">
    <div class="dash-header">
      <div>
        <h1 class="dash-title">Permissions Matrix</h1>
        <p class="dash-subtitle">
          Control which roles can access each section of the platform
        </p>
      </div>

      <div class="header-stats">
        <div class="stat-pill">
          <span class="stat-num">{{ roles.length }}</span>
          <span class="stat-lbl">Roles</span>
        </div>
        <div class="stat-pill">
          <span class="stat-num">{{ totalPermissionRows }}</span>
          <span class="stat-lbl">Permissions</span>
        </div>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search permissions or sections..."
        />
      </div>

      <button class="btn-fetch" @click="resetPermissions">
        Reset Changes
      </button>

      <button class="btn-primary sm" @click="savePermissions">
        Save Permissions
      </button>
    </div>

    <div class="table-container permissions-table-container">
      <div class="table-scroll permissions-scroll">
        <table class="permissions-table">
          <thead>
            <tr>
              <th class="sticky-col permission-name-col">Permission</th>
              <th
                v-for="role in roles"
                :key="role"
                class="role-col"
              >
                {{ roleLabels[role] || role }}
              </th>
            </tr>
          </thead>

          <tbody>
            <template
              v-for="section in filteredSections"
              :key="section.key"
            >
              <tr class="section-row">
                <td
                  class="section-cell sticky-col"
                  :class="section.sectionClass"
                  :colspan="roles.length + 1"
                >
                  {{ section.label }}
                </td>
              </tr>

              <tr
                v-for="permission in section.items"
                :key="permission.key"
                class="permission-row"
              >
                <td class="permission-label sticky-col">
                  <div class="permission-name">{{ permission.label }}</div>
                  <div class="permission-key">{{ permission.key }}</div>
                </td>

                <td
                  v-for="role in roles"
                  :key="`${permission.key}-${role}`"
                  class="permission-toggle-cell"
                >
                  <label class="matrix-checkbox">
                    <input
                      type="checkbox"
                      :checked="permissions[permission.key]?.includes(role)"
                      @change="togglePermission(permission.key, role)"
                    />
                    <span class="matrix-checkmark"></span>
                  </label>
                </td>
              </tr>
            </template>

            <tr v-if="filteredSections.length === 0">
              <td :colspan="roles.length + 1" class="empty-state">
                No permissions found matching your search.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <transition name="toast">
      <div v-if="toastMessage" class="toast">✓ {{ toastMessage }}</div>
    </transition>
  </div>
</template>

<script src="./AdminPermissions.js"></script>
<style src="./AdminPermissions.css"></style>