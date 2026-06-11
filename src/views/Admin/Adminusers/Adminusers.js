import { generateClient } from 'aws-amplify/data';

let client = null;

function getClient() {
  if (!client) {
    client = generateClient();
  }
  return client;
}

const ROLE_DEFINITIONS = {
  SuperAdmin: { label: 'Super Admin', icon: '👑', desc: 'Full platform control' },
  Admin: { label: 'Admin', icon: '🛡️', desc: 'Administrative platform access' },
  Staff: { label: 'Staff', icon: '🔧', desc: 'Internal team with management access' },
  Moderator: { label: 'Moderator', icon: '🤝', desc: 'Moderates community and forum spaces' },
  StreamingPartner: { label: 'Streaming Partner', icon: '🎥', desc: 'Streamer with partner access' },
  AffiliatePartner: { label: 'Affiliate Partner', icon: '🔗', desc: 'Affiliate and partner analytics access' },
  Therapist: { label: 'Therapist', icon: '🧠', desc: 'Mental health professional access' },
  Trainer: { label: 'Trainer', icon: '💪', desc: 'Coaching and training access' },
  BetaMember: { label: 'Beta Member', icon: '🧪', desc: 'Early access to beta areas and features' },
  Member: { label: 'Member', icon: '👤', desc: 'Default signed-up user role' },
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

const AVATAR_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#0891b2', '#4f46e5'];

export default {
  name: 'AdminUsers',

  data() {
    return {
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

  computed: {
    filteredUsers() {
      return this.users.filter((u) => {
        const safeName = (u.name || '').toLowerCase();
        const safeEmail = (u.email || '').toLowerCase();
        const query = (this.searchQuery || '').toLowerCase();

        const matchesSearch =
          safeName.includes(query) || safeEmail.includes(query);

        const matchesRole =
          this.roleFilter === 'all' || u.roles.includes(this.roleFilter);

        return matchesSearch && matchesRole;
      });
    },
  },

  async mounted() {
    await this.fetchUsers();
  },

  methods: {
    async fetchUsers() {
      this.loadingUsers = true;

      try {
        const result = await getClient().queries.listAdminUsers();

        console.log('listAdminUsers result:', result);

        if (result?.errors?.length) {
          console.error('listAdminUsers full result:', result);
          console.error('listAdminUsers errors JSON:', JSON.stringify(result.errors, null, 2));
          throw new Error(result.errors[0]?.message || 'Failed to fetch users');
        }

        const rawUsers = Array.isArray(result?.data)
          ? result.data
          : result?.data?.users || [];

        this.users = rawUsers.map((u, i) => {
          const attrs = Array.isArray(u.Attributes)
            ? Object.fromEntries(u.Attributes.map((a) => [a.Name, a.Value]))
            : {};

          const displayName =
            u.name ||
            u.username ||
            attrs.name ||
            [attrs.given_name, attrs.family_name].filter(Boolean).join(' ') ||
            u.email ||
            attrs.email ||
            u.Username ||
            'Unknown User';

          return {
            id: u.id || u.username || u.Username || u.email || attrs.email,
            username: u.username || u.Username || '',
            name: displayName,
            email: u.email || attrs.email || '',
            roles: Array.isArray(u.roles) && u.roles.length ? u.roles : ['Member'],
            joined: u.joined || u.UserCreateDate || '',
            online: Boolean(u.online),
            enabled: typeof u.enabled === 'boolean' ? u.enabled : Boolean(u.Enabled ?? true),
            status: u.status || u.UserStatus || '',
            avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
            initials: displayName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
          };
        });
      } catch (error) {
        console.error('fetchUsers failed:', error);
        this.showToast(error.message || 'Failed to fetch users');
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

        const result = await getClient().mutations.updateUserRoles({
          username: this.roleModalUser.username,
          roles,
        });

        if (result?.errors?.length) {
          console.error('updateUserRoles full result:', result);
          console.error('updateUserRoles errors JSON:', JSON.stringify(result.errors, null, 2));
          throw new Error(result.errors[0]?.message || 'Failed to update roles');
        }

        if (!result?.data?.success) {
          throw new Error('Failed to update roles');
        }

        const userIndex = this.users.findIndex(
          (u) => u.username === this.roleModalUser.username
        );

        if (userIndex !== -1) {
          this.users[userIndex].roles = [...roles];
        }

        this.roleModalUser.roles = [...roles];
        this.showToast(`${this.roleModalUser.name}'s roles updated`);
        this.closeRoleModal();
      } catch (error) {
        console.error('saveRoles failed:', error);
        this.showToast(error.message || 'Failed to update roles');
      } finally {
        this.savingRoles = false;
      }
    },

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