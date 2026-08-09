<template>
  <div class="admin-permissions-page">
    <div v-if="accessChecking" class="permissions-state">Checking permissions…</div>

    <div v-else-if="!hasPlatformAccess" class="permissions-state permissions-state-error">
      Access restricted. Only Admin and Super Admin can manage global permissions.
    </div>

    <template v-else>
      <div class="dash-header">
        <div>
          <h1 class="dash-title">Permissions Matrix</h1>
          <p class="dash-subtitle">Control global Cognito-group permissions across the platform.</p>
        </div>

        <div class="header-stats">
          <div class="stat-pill">
            <span class="stat-num">{{ roles.length }}</span>
            <span class="stat-lbl">Groups</span>
          </div>
          <div class="stat-pill">
            <span class="stat-num">{{ totalPermissionRows }}</span>
            <span class="stat-lbl">Permissions</span>
          </div>
        </div>
      </div>

      <p class="platform-notice">
        Permissions are additive and deny-by-default. Platform-enforced rows cannot be removed from Admin or Super Admin because core controls are protected by Cognito group policy.
      </p>

      <div class="toolbar">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search modules, actions, or permission keys..."
          />
        </div>

        <button class="btn-fetch" :disabled="loadingCatalog || saving" @click="resetPermissions">
          Reset Changes
        </button>

        <button class="btn-primary sm" :disabled="loadingCatalog || saving" @click="savePermissions">
          {{ saving ? 'Saving…' : 'Save Permissions' }}
        </button>
      </div>

      <div v-if="loadingCatalog" class="permissions-state">Loading permission catalog…</div>
      <div v-else-if="catalogError" class="permissions-state permissions-state-error">{{ catalogError }}</div>

      <div v-else class="table-container permissions-table-container">
        <div class="table-scroll permissions-scroll">
          <table class="permissions-table">
            <thead>
              <tr>
                <th class="sticky-col permission-name-col">Module &amp; action</th>
                <th v-for="role in roles" :key="role" class="role-col">
                  {{ groupLabel(role) }}
                </th>
              </tr>
            </thead>

            <tbody>
              <template v-for="section in filteredSections" :key="section.key">
                <tr class="section-row">
                  <td class="section-cell sticky-col" :colspan="roles.length + 1">
                    {{ section.label }}
                  </td>
                </tr>

                <tr v-for="permission in section.items" :key="permission.key" class="permission-row">
                  <td class="permission-label sticky-col">
                    <div class="permission-module">{{ permission.module }}</div>
                    <div class="permission-name">
                      {{ permission.displayName }}
                      <span v-if="isPlatformEnforced(permission)" class="platform-badge">Platform enforced</span>
                    </div>
                    <div v-if="permission.description" class="permission-description">{{ permission.description }}</div>
                    <div class="permission-key">{{ permission.key }}</div>
                  </td>

                  <td v-for="role in roles" :key="`${permission.key}-${role}`" class="permission-toggle-cell">
                    <label class="matrix-checkbox">
                      <input
                        type="checkbox"
                        :checked="isPermissionAssigned(permission.key, role, permission)"
                        :disabled="isToggleDisabled(permission, role)"
                        @change="togglePermission(permission.key, role, permission)"
                      />
                      <span class="matrix-checkmark"></span>
                    </label>
                  </td>
                </tr>
              </template>

              <tr v-if="filteredSections.length === 0">
                <td :colspan="roles.length + 1" class="empty-state">No permissions found matching your search.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <transition name="toast">
        <div v-if="toastMessage" class="toast">✓ {{ toastMessage }}</div>
      </transition>
    </template>
  </div>
</template>

<script src="./AdminPermissions.js"></script>
<style src="./AdminPermissions.css"></style>
