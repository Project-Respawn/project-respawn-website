<template>
  <div class="dashboard-wrapper">
    <!-- AUTH MODAL -->
    <div v-if="!isAuthenticated" class="modal-overlay">
      <div class="auth-modal">
        <div class="modal-glow"></div>
        <div class="modal-header">
          <p class="modal-subtitle">Enter your super admin email to continue</p>
        </div>

        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input
            v-model="authEmail"
            type="email"
            class="form-input"
            placeholder="Enter email"
            @keyup.enter="handleAuth"
            :class="{ 'input-error': authError }"
          />
          <p v-if="authError" class="error-text">{{ authError }}</p>
        </div>

        <button class="btn-primary" @click="handleAuth" :disabled="authLoading">
          <span v-if="!authLoading">Access Dashboard</span>
          <span v-else class="loading-dots">Verifying<span>.</span><span>.</span><span>.</span></span>
        </button>

        <p class="modal-footer-note">
          Access is restricted to authorized super admins only.
        </p>
      </div>
    </div>

    <!-- DASHBOARD CONTENT -->
    <div v-if="isAuthenticated" class="dashboard">
      <!-- Sidebar -->
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
            @click="activeTab = tab.id"
          >
            <span class="nav-icon">{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
          </button>
        </nav>

        <div class="sidebar-footer">
          <div class="admin-chip">
            <div class="chip-avatar">SA</div>
            <div class="chip-info">
              <span class="chip-name">Super Admin</span>
              <span class="chip-email">{{ adminEmail }}</span>
            </div>
          </div>
          <button class="btn-signout" @click="handleSignOut">Sign Out</button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="dashboard-main">
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
              <span class="stat-num">{{ users.filter(u => u.roles.some(r => r !== 'member')).length }}</span>
              <span class="stat-lbl">Assigned Roles</span>
            </div>
          </div>
        </div>

        <!-- Toolbar -->
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
              @click="roleFilter = f.value"
            >
              {{ f.label }}
            </button>
          </div>
          <button class="btn-fetch" @click="fetchUsers" :disabled="loadingUsers">
            <span v-if="!loadingUsers">↻ Refresh</span>
            <span v-else>Loading...</span>
          </button>
        </div>

        <!-- Table -->
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
                  :class="{ 'row-highlight': user.roles.some(r => r !== 'member') }"
                >
                  <td class="user-cell">
                    <div class="user-avatar" :style="{ background: user.avatarColor }">{{ user.initials }}</div>
                    <div class="user-info">
                      <span class="user-name">{{ user.name }}</span>
                      <span class="user-email">{{ user.email }}</span>
                    </div>
                  </td>
                  <td class="meta-cell">{{ user.joined }}</td>
                  <td class="roles-cell">
                    <div class="role-badges">
                      <span
                        v-for="role in user.roles"
                        :key="role"
                        class="role-badge"
                        :class="`role-${role}`"
                      >
                        {{ ROLE_DEFINITIONS[role]?.label || role }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <button class="btn-manage" @click="openRoleModal(user)">Edit Roles</button>
                  </td>
                  <td>
                    <span class="status-dot" :class="user.online ? 'online' : 'offline'"></span>
                    <span class="status-text">{{ user.online ? 'Online' : 'Offline' }}</span>
                  </td>
                </tr>
                <tr v-if="filteredUsers.length === 0">
                  <td colspan="5" class="empty-state">No users found matching your search.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <transition name="toast">
          <div v-if="toastMessage" class="toast">✓ {{ toastMessage }}</div>
        </transition>
      </main>
    </div>

    <!-- ROLE ASSIGNMENT MODAL -->
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
                <div class="user-email">{{ roleModalUser.email }}</div>
              </div>
            </div>
            <button class="btn-close" @click="closeRoleModal">✕</button>
          </div>

          <p class="role-modal-hint">Select all roles that apply. Users can hold multiple roles.</p>

          <div class="role-groups">
            <div v-for="group in roleGroups" :key="group.label" class="role-group">
              <div class="group-label">{{ group.label }}</div>
              <div class="role-checkboxes">
                <label
                  v-for="role in group.roles"
                  :key="role"
                  class="role-checkbox-item"
                  :class="{ checked: pendingRoles.includes(role), disabled: role === 'member' }"
                >
                  <input
                    type="checkbox"
                    :value="role"
                    :checked="pendingRoles.includes(role)"
                    :disabled="role === 'member'"
                    @change="toggleRole(role)"
                  />
                  <div class="checkbox-content">
                    <span class="checkbox-icon">{{ ROLE_DEFINITIONS[role].icon }}</span>
                    <div>
                      <span class="checkbox-label">{{ ROLE_DEFINITIONS[role].label }}</span>
                      <span class="checkbox-desc">{{ ROLE_DEFINITIONS[role].desc }}</span>
                    </div>
                  </div>
                  <span v-if="pendingRoles.includes(role)" class="role-badge sm" :class="`role-${role}`">Active</span>
                </label>
              </div>
            </div>
          </div>

          <div class="role-modal-footer">
            <button class="btn-cancel" @click="closeRoleModal">Cancel</button>
            <button class="btn-primary sm" @click="saveRoles">Save Roles</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
const SUPER_ADMIN_EMAILS = [
  "admin@respawn.gg",
  "superadmin@respawn.gg",
  // add your email here
];

const ROLE_DEFINITIONS = {
  super_admin:         { label: "Super Admin",         icon: "👑", desc: "Full platform control" },
  admin:               { label: "Admin",               icon: "🛡️", desc: "Near-full access, trusted staff" },
  staff:               { label: "Staff",               icon: "🔧", desc: "Internal team, limited admin" },
  community_moderator: { label: "Community Moderator", icon: "🤝", desc: "Moderates community spaces" },
  streaming_partner:   { label: "Streaming Partner",   icon: "🎥", desc: "Streamer with partner perks" },
  affiliate_partner:   { label: "Affiliate Partner",   icon: "🔗", desc: "Affiliate link & promo access" },
  therapist:           { label: "Therapist",           icon: "🧠", desc: "Mental health professional" },
  trainer:             { label: "Trainer",             icon: "💪", desc: "Coaching & training access" },
  beta_member:         { label: "Beta Member",         icon: "🧪", desc: "Early access to beta features" },
  member:              { label: "Member",              icon: "👤", desc: "Default signed-up user (auto)" },
  banned:              { label: "Banned",              icon: "🚫", desc: "Blocked from the platform" },
};

const ROLE_GROUPS = [
  { label: "Platform Staff",  roles: ["super_admin", "admin", "staff"] },
  { label: "Community",       roles: ["community_moderator", "streaming_partner", "affiliate_partner"] },
  { label: "Professional",    roles: ["therapist", "trainer"] },
  { label: "Members",         roles: ["beta_member", "member", "banned"] },
];

const MOCK_USERS = [
  { id: 1, name: "Alex Rivera",  email: "alex@example.com",   roles: ["community_moderator", "member"], joined: "Jan 12, 2025", online: true },
  { id: 2, name: "Jordan Kim",   email: "jordan@example.com", roles: ["member"],                        joined: "Feb 3, 2025",  online: false },
  { id: 3, name: "Sam Okonkwo",  email: "sam@example.com",    roles: ["beta_member", "member"],         joined: "Mar 19, 2025", online: true },
  { id: 4, name: "Maya Chen",    email: "maya@example.com",   roles: ["streaming_partner", "member"],   joined: "Apr 1, 2025",  online: true },
  { id: 5, name: "Dev Patel",    email: "dev@example.com",    roles: ["trainer", "member"],             joined: "Jan 28, 2025", online: false },
  { id: 6, name: "Riley Scott",  email: "riley@example.com",  roles: ["member"],                        joined: "May 5, 2025",  online: false },
  { id: 7, name: "Morgan Diaz",  email: "morgan@example.com", roles: ["banned"],                        joined: "Dec 10, 2024", online: false },
];

const AVATAR_COLORS = ["#7c3aed","#2563eb","#059669","#d97706","#dc2626","#7c3aed","#0891b2"];

export default {
  name: "Dashboard",

  data() {
    return {
      isAuthenticated: false,
      authEmail: "",
      authError: "",
      authLoading: false,
      adminEmail: "",

      activeTab: "users",
      tabs: [{ id: "users", icon: "👥", label: "Users" }],

      users: [],
      loadingUsers: false,
      searchQuery: "",
      roleFilter: "all",

      roleFilters: [
        { label: "All",        value: "all" },
        { label: "Staff",      value: "staff" },
        { label: "Moderators", value: "community_moderator" },
        { label: "Partners",   value: "streaming_partner" },
        { label: "Beta",       value: "beta_member" },
        { label: "Banned",     value: "banned" },
      ],

      roleModalUser: null,
      pendingRoles: [],

      toastMessage: "",
      toastTimer: null,

      ROLE_DEFINITIONS,
      roleGroups: ROLE_GROUPS,
    };
  },

  computed: {
    filteredUsers() {
      return this.users.filter((u) => {
        const matchesSearch =
          u.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesRole = this.roleFilter === "all" || u.roles.includes(this.roleFilter);
        return matchesSearch && matchesRole;
      });
    },
  },

  methods: {
    async handleAuth() {
      if (!this.authEmail.trim()) { this.authError = "Please enter your email address."; return; }
      this.authLoading = true;
      this.authError = "";
      await new Promise((r) => setTimeout(r, 900));
      const email = this.authEmail.trim().toLowerCase();
      if (SUPER_ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email)) {
        this.isAuthenticated = true;
        this.adminEmail = email;
        this.fetchUsers();
      } else {
        this.authError = "Access denied. This email is not a super admin.";
      }
      this.authLoading = false;
    },

    async fetchUsers() {
      this.loadingUsers = true;
      // ── REPLACE WITH YOUR REAL API CALL ──────────────────────────────────
      // const res = await fetch("/api/admin/users");
      // const data = await res.json();
      // this.users = data.users.map((u, i) => ({ ...u, avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length], initials: u.name.split(" ").map(n => n[0]).join("").toUpperCase() }));
      // ─────────────────────────────────────────────────────────────────────
      await new Promise((r) => setTimeout(r, 800));
      this.users = MOCK_USERS.map((u, i) => ({
        ...u,
        avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
        initials: u.name.split(" ").map((n) => n[0]).join("").toUpperCase(),
      }));
      this.loadingUsers = false;
    },

    openRoleModal(user) {
      this.roleModalUser = user;
      this.pendingRoles = [...user.roles];
    },

    closeRoleModal() {
      this.roleModalUser = null;
      this.pendingRoles = [];
    },

    toggleRole(role) {
      if (this.pendingRoles.includes(role)) {
        this.pendingRoles = this.pendingRoles.filter((r) => r !== role);
      } else {
        this.pendingRoles.push(role);
      }
    },

    async saveRoles() {
      const user = this.roleModalUser;
      let roles = [...this.pendingRoles];
      // Always keep member unless banned
      if (!roles.includes("banned") && !roles.includes("member")) roles.push("member");
      user.roles = roles;

      // ── REPLACE WITH YOUR REAL API CALL ──────────────────────────────────
      // await fetch(`/api/admin/users/${user.id}/roles`, {
      //   method: "PATCH",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ roles }),
      // });
      // ─────────────────────────────────────────────────────────────────────

      this.showToast(`${user.name}'s roles updated`);
      this.closeRoleModal();
    },

    showToast(message) {
      this.toastMessage = message;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => { this.toastMessage = ""; }, 3000);
    },

    handleSignOut() {
      this.isAuthenticated = false;
      this.authEmail = "";
      this.adminEmail = "";
      this.users = [];
    },
  },
};
</script>

<style src="./Dashboard.css"></style>
