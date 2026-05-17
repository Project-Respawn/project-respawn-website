<template>
  <!-- =========================
    DASHBOARD WRAPPER
  ========================== -->
  <div class="dashboard-wrapper">
    <!-- =========================
      AUTH CHECKING STATE
    ========================== -->
    <div v-if="authChecking" class="modal-overlay">
      <div class="auth-modal">
        <div class="modal-glow"></div>
        <div class="modal-header">
          <p class="modal-subtitle">Checking your dashboard permissions...</p>
        </div>
        <div class="spinner" style="margin: 12px auto 0;"></div>
      </div>
    </div>

    <!-- =========================
      AUTH ERROR STATE
    ========================== -->
    <div v-else-if="authError && !isAuthenticated" class="modal-overlay">
      <div class="auth-modal">
        <div class="modal-glow"></div>
        <div class="modal-header">
          <p class="modal-subtitle">Access restricted</p>
        </div>

        <p class="error-text" style="margin-bottom: 16px;">{{ authError }}</p>
        
        <button v-if="!isAuthenticated" 
          @click="handleSignOut" 
          class="btn-primary">
          Sign In
        </button>                
      </div>
    </div>

    <!-- =========================
      MAIN DASHBOARD
    ========================== -->
    <div v-if="isAuthenticated" class="dashboard">
      <!-- =========================
        SIDEBAR
      ========================== -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-dot"></div>
          <span>Respawn Admin</span>
        </div>

        <nav class="sidebar-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="nav-item"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id">
            <span class="nav-icon">{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
          </button>
        </nav>

        <div class="sidebar-footer">
          <div class="admin-chip">
            <div class="chip-avatar">{{ currentAdminInitials }}</div>
            <div class="chip-info">
              <span class="chip-name">{{ currentAdminPrimaryRoleLabel }}</span>
              <span class="chip-email">{{ adminEmail }}</span>
            </div>
          </div>
          <button class="btn-signout" @click="handleSignOut">Sign Out</button>
        </div>
      </aside>

      <!-- =========================
        MAIN CONTENT
      ========================== -->
      <main class="dashboard-main">
        <!-- =========================
          PAGE HEADER
        ========================== -->
        <div class="dash-header">
          <div>
            <h1 class="dash-title">User Management</h1>
            <p class="dash-subtitle">Search, manage and assign roles to platform users</p>
          </div>
          <div class="header-stats">
            <div class="stat-pill">
              <span class="stat-num">{{ users.length }}</span>
              <span class="stat-lbl">Total Users</span>
            </div>
            <div class="stat-pill">
              <span class="stat-num">{{ users.filter(u => u.roles.some(r => r !== 'Member')).length }}</span>
              <span class="stat-lbl">Assigned Roles</span>
            </div>
          </div>
        </div>

        <!-- =========================
          TOOLBAR
        ========================== -->
        <div class="toolbar">
          <div class="search-wrap">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Search by name or email..."
            />
          </div>

          <div class="filter-group">
            <button
              v-for="f in roleFilters"
              :key="f.value"
              class="filter-btn"
              :class="{ active: roleFilter === f.value }"
              @click="roleFilter = f.value">
              {{ f.label }}
            </button>
          </div>

          <button class="btn-fetch" @click="fetchUsers" :disabled="loadingUsers">
            <span v-if="!loadingUsers">↻ Refresh</span>
            <span v-else>Loading...</span>
          </button>
        </div>

        <!-- =========================
          USERS TABLE
        ========================== -->
        <div class="table-container">
          <div v-if="loadingUsers" class="table-loading">
            <div class="spinner"></div>
            <p>Fetching users...</p>
          </div>

          <div v-else class="table-scroll">
            <table class="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Joined</th>
                  <th>Roles</th>
                  <th>Manage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="user in filteredUsers"
                  :key="user.id"
                  class="user-row"
                  :class="{ 'row-highlight': user.roles.some(r => r !== 'Member') }">
                  <td class="user-cell">
                    <div class="user-avatar" :style="{ background: user.avatarColor }">
                      {{ user.initials }}
                    </div>
                    <div class="user-info">
                      <span class="user-name">{{ user.name }}</span>
                      <span class="user-email">{{ user.email || '—' }}</span>
                    </div>
                  </td>

                  <td class="meta-cell">{{ user.joined || '—' }}</td>

                  <td class="roles-cell">
                    <div class="role-badges">
                      <span
                        v-for="role in user.roles"
                        :key="role"
                        class="role-badge"
                        :class="roleClass(role)"
                      >
                        {{ ROLE_DEFINITIONS[role]?.label || role }}
                      </span>
                    </div>
                  </td>

                  <td>
                    <button class="btn-manage" @click="openRoleModal(user)">
                      Edit Roles
                    </button>
                  </td>

                  <td>
                    <span
                      class="status-dot"
                      :class="user.enabled ? 'online' : 'offline'"
                    ></span>
                    <span class="status-text">
                      {{ user.enabled ? 'Enabled' : 'Disabled' }}
                    </span>
                  </td>
                </tr>

                <tr v-if="filteredUsers.length === 0">
                  <td colspan="5" class="empty-state">No users found matching your search.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- =========================
          TOAST
        ========================== -->
        <transition name="toast">
          <div v-if="toastMessage" class="toast">✓ {{ toastMessage }}</div>
        </transition>
      </main>
    </div>

    <!-- =========================
      ROLE MODAL
    ========================== -->
    <transition name="fade">
      <div v-if="roleModalUser" class="modal-overlay" @click.self="closeRoleModal">
        <div class="role-modal">
          <div class="role-modal-header">
            <div class="role-modal-user">
              <div class="user-avatar sm" :style="{ background: roleModalUser.avatarColor }">
                {{ roleModalUser.initials }}
              </div>
              <div>
                <div class="user-name">{{ roleModalUser.name }}</div>
                <div class="user-email">{{ roleModalUser.email || '—' }}</div>
              </div>
            </div>
            <button class="btn-close" @click="closeRoleModal">✕</button>
          </div>

          <p class="role-modal-hint">
            Select all roles that apply. Users can hold multiple roles. Member is the default role and stays enabled.
          </p>

          <div class="role-groups">
            <div v-for="group in roleGroups" :key="group.label" class="role-group">
              <div class="group-label">{{ group.label }}</div>
              <div class="role-checkboxes">
                <label
                  v-for="role in group.roles"
                  :key="role"
                  class="role-checkbox-item"
                  :class="{ checked: pendingRoles.includes(role), disabled: role === 'Member' }"
                >
                  <input
                    type="checkbox"
                    :value="role"
                    :checked="pendingRoles.includes(role)"
                    :disabled="role === 'Member'"
                    @change="toggleRole(role)" />
                  <div class="checkbox-content">
                    <span class="checkbox-icon">{{ ROLE_DEFINITIONS[role].icon }}</span>
                    <div>
                      <span class="checkbox-label">{{ ROLE_DEFINITIONS[role].label }}</span>
                      <span class="checkbox-desc">{{ ROLE_DEFINITIONS[role].desc }}</span>
                    </div>
                  </div>
                  <span
                    v-if="pendingRoles.includes(role)"
                    class="role-badge sm"
                    :class="roleClass(role)">
                    Active
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div class="role-modal-footer">
            <button class="btn-cancel" @click="closeRoleModal">Cancel</button>
            <button class="btn-primary sm" @click="saveRoles" :disabled="savingRoles">
              <span v-if="!savingRoles">Save Roles</span>
              <span v-else>Saving...</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { getCurrentUser, fetchAuthSession, signOut } from 'aws-amplify/auth';

/* =========================
   ROLE CONSTANTS
========================= */
const ROLE_DEFINITIONS = {
  SuperAdmin:      { label: 'Super Admin', icon: '👑', desc: 'Full platform control' },
  Admin:           { label: 'Admin', icon: '🛡️', desc: 'Administrative platform access' },
  Staff:           { label: 'Staff', icon: '🔧', desc: 'Internal team with management access' },
  Moderator:       { label: 'Moderator', icon: '🤝', desc: 'Moderates community and forum spaces' },
  StreamingPartner:{ label: 'Streaming Partner', icon: '🎥', desc: 'Streamer with partner access' },
  AffiliatePartner:{ label: 'Affiliate Partner', icon: '🔗', desc: 'Affiliate and partner analytics access' },
  Therapist:       { label: 'Therapist', icon: '🧠', desc: 'Mental health professional access' },
  Trainer:         { label: 'Trainer', icon: '💪', desc: 'Coaching and training access' },
  BetaMember:      { label: 'Beta Member', icon: '🧪', desc: 'Early access to beta areas and features' },
  Member:          { label: 'Member', icon: '👤', desc: 'Default signed-up user role' },
};

const ROLE_GROUPS = [
  { label: 'Platform Staff', roles: ['SuperAdmin', 'Admin', 'Staff'] },
  { label: 'Community', roles: ['Moderator', 'StreamingPartner', 'AffiliatePartner'] },
  { label: 'Professional', roles: ['Therapist', 'Trainer'] },
  { label: 'Members', roles: ['BetaMember', 'Member'] },
];

const ROLE_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Staff', value: 'Staff' },
  { label: 'Admins', value: 'Admin' },
  { label: 'Moderators', value: 'Moderator' },
  { label: 'Partners', value: 'StreamingPartner' },
  { label: 'Beta', value: 'BetaMember' },
];

const ADMIN_ALLOWED_GROUPS = ['SuperAdmin', 'Admin', 'Staff'];
const AVATAR_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#0891b2', '#4f46e5'];

export default {
  name: 'Dashboard',

  /* =========================
     COMPONENT STATE
  ========================= */
  data() {
    return {
      authChecking: true,
      isAuthenticated: false,
      authError: '',
      adminEmail: '',
      currentUserGroups: [],

      activeTab: 'users',
      tabs: [{ id: 'users', icon: '👥', label: 'Users' }],

      users: [],
      loadingUsers: false,
      savingRoles: false,
      searchQuery: '',
      roleFilter: 'all',
      roleFilters: ROLE_FILTERS,

      roleModalUser: null,
      pendingRoles: [],

      toastMessage: '',
      toastTimer: null,

      ROLE_DEFINITIONS,
      roleGroups: ROLE_GROUPS,
    };
  },

  /* =========================
     COMPUTED VALUES
  ========================= */
  computed: {
    filteredUsers() {
      return this.users.filter((u) => {
        const matchesSearch =
          u.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(this.searchQuery.toLowerCase());

        const matchesRole =
          this.roleFilter === 'all' || u.roles.includes(this.roleFilter);

        return matchesSearch && matchesRole;
      });
    },

    currentAdminPrimaryRoleLabel() {
      const priority = ['SuperAdmin', 'Admin', 'Staff'];
      const found = priority.find((role) => this.currentUserGroups.includes(role));
      return ROLE_DEFINITIONS[found]?.label || 'Admin User';
    },

    currentAdminInitials() {
      const label = this.currentAdminPrimaryRoleLabel;
      return label
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    },
  },

  /* =========================
     LIFECYCLE
  ========================= */
  async mounted() {
    await this.initAuth();
  },

  /* =========================
     METHODS
  ========================= */
  methods: {
    /* =========================
       AUTH METHODS
    ========================= */
    async initAuth() {
      this.authChecking = true;
      this.authError = '';

      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();

        const groups =
          session.tokens?.accessToken?.payload?.['cognito:groups'] ||
          session.tokens?.idToken?.payload?.['cognito:groups'] ||
          [];

        if (!Array.isArray(groups) || !groups.some((group) => ADMIN_ALLOWED_GROUPS.includes(group))) {
          this.isAuthenticated = false;
          this.authError = 'Access denied. Your account does not have dashboard permissions.';
          this.authChecking = false;
          return;
        }

        this.currentUserGroups = groups;
        this.adminEmail = user.signInDetails?.loginId || user.username || '';
        this.isAuthenticated = true;

        await this.fetchUsers();
      } catch (error) {
        this.isAuthenticated = false;
        this.authError = 'You must be signed in to access this dashboard.';
      } finally {
        this.authChecking = false;
      }
    },

    async handleSignOut() {
      try {
        await signOut();
      } catch (error) {
        // ignore signout cleanup error
      } finally {
        this.isAuthenticated = false;
        this.authError = '';
        this.adminEmail = '';
        this.currentUserGroups = [];
        this.users = [];
      }
    },

    /* =========================
       USER DATA METHODS
    ========================= */
    async fetchUsers() {
      this.loadingUsers = true;

      try {
        const res = await fetch('/api/admin/users', {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await res.json();

        this.users = (data.users || []).map((u, i) => ({
          id: u.id || u.username || u.email,
          username: u.username || '',
          name: u.name || u.displayName || u.username || 'Unknown User',
          email: u.email || '',
          roles: Array.isArray(u.roles) && u.roles.length ? u.roles : ['Member'],
          joined: u.joined || u.createdAt || '',
          online: Boolean(u.online),
          avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
          initials: (u.name || u.displayName || u.username || 'U')
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2),
        }));
      } catch (error) {
        console.error('fetchUsers failed:', error);
        this.showToast('Failed to fetch users');
      } finally {
        this.loadingUsers = false;
      }
    },

    openRoleModal(user) {
      this.roleModalUser = user;
      this.pendingRoles = [...user.roles];
      if (!this.pendingRoles.includes('Member')) {
        this.pendingRoles.push('Member');
      }
    },

    closeRoleModal() {
      this.roleModalUser = null;
      this.pendingRoles = [];
    },

    toggleRole(role) {
      if (role === 'Member') return;

      if (this.pendingRoles.includes(role)) {
        this.pendingRoles = this.pendingRoles.filter((r) => r !== role);
      } else {
        this.pendingRoles.push(role);
      }

      if (!this.pendingRoles.includes('Member')) {
        this.pendingRoles.push('Member');
      }
    },

    async saveRoles() {
      if (!this.roleModalUser) return;

      this.savingRoles = true;

      try {
        const roles = [...new Set([...this.pendingRoles, 'Member'])];

        const res = await fetch(`/api/admin/users/${encodeURIComponent(this.roleModalUser.id)}/roles`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ roles }),
        });

        if (!res.ok) {
          throw new Error('Failed to update roles');
        }

        this.roleModalUser.roles = roles;
        this.showToast(`${this.roleModalUser.name}'s roles updated`);
        this.closeRoleModal();
      } catch (error) {
        this.showToast('Failed to update roles');
      } finally {
        this.savingRoles = false;
      }
    },

    /* =========================
       UI HELPERS
    ========================= */
    roleClass(role) {
      return `role-${role.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')}`;
    },

    showToast(message) {
      this.toastMessage = message;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.toastMessage = '';
      }, 3000);
    },
  },
};
</script>
<script src="./Dashboard.js"></script>

<style src="./Dashboard.css"></style>
