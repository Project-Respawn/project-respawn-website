import { generateClient } from 'aws-amplify/data';
import { fetchAuthSession } from 'aws-amplify/auth';

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
  Trainer: { label: 'Trainer', icon: '💪', desc: 'Coaching and training access' },
  Therapist: { label: 'Therapist', icon: '🧠', desc: 'Mental health professional access' },
  StreamingPartner: { label: 'Streaming Partner', icon: '🎥', desc: 'Streamer with partner access' },
  AffiliatePartner: { label: 'Affiliate Partner', icon: '🔗', desc: 'Affiliate and partner analytics access' },
  Member: { label: 'Member', icon: '👤', desc: 'Default signed-up user role' },
  BetaMember: { label: 'Beta Member', icon: '🧪', desc: 'Early access to beta areas and features' },
};

const ASSIGNABLE_ROLES = {
  SuperAdmin: ['Admin', 'Staff', 'Moderator', 'Trainer', 'Therapist', 'StreamingPartner', 'AffiliatePartner', 'Member', 'BetaMember'],
  Admin: ['Staff', 'Moderator', 'Trainer', 'Therapist', 'StreamingPartner', 'AffiliatePartner', 'Member', 'BetaMember'],
  Staff: ['Trainer', 'Therapist', 'StreamingPartner', 'AffiliatePartner', 'Member', 'BetaMember'],
};

const ROLE_GROUPS = [
  { label: 'Platform Staff', roles: ['SuperAdmin', 'Admin', 'Staff'] },
  { label: 'Community', roles: ['Moderator', 'StreamingPartner', 'AffiliatePartner'] },
  { label: 'Professional', roles: ['Trainer', 'Therapist'] },
  { label: 'Members', roles: ['Member', 'BetaMember'] },
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

function normalizeRoles(roles = []) {
  return Array.from(new Set((Array.isArray(roles) ? roles : []).filter(Boolean)));
}

function getRoleManager(groups = []) {
  if (groups.includes('SuperAdmin')) return 'SuperAdmin';
  if (groups.includes('Admin')) return 'Admin';
  if (groups.includes('Staff')) return 'Staff';
  return null;
}

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
      currentUserGroups: [],
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

    currentRoleManager() {
      return getRoleManager(this.currentUserGroups);
    },

    visibleRoleGroups() {
      return ROLE_GROUPS
        .map((group) => ({
          ...group,
          roles: group.roles.filter((role) => this.canAssignRole(role)),
        }))
        .filter((group) => group.roles.length > 0);
    },
  },

  async mounted() {
    await this.loadCurrentUserGroups();
    await this.fetchUsers();
  },

  methods: {
    async loadCurrentUserGroups() {
      try {
        const session = await fetchAuthSession();

        const groups =
          session?.tokens?.accessToken?.payload?.['cognito:groups'] ||
          session?.tokens?.idToken?.payload?.['cognito:groups'] ||
          [];

        this.currentUserGroups = Array.isArray(groups) ? groups : [];
      } catch (error) {
        console.error('loadCurrentUserGroups failed:', error);
        this.currentUserGroups = [];
      }
    },

    canEditUser(user) {
      const roles = normalizeRoles(user?.roles || []);

      if (!this.currentRoleManager || roles.includes('SuperAdmin')) return false;
      if (this.currentRoleManager === 'Admin') return !roles.includes('Admin');
      if (this.currentRoleManager === 'Staff') {
        return roles.every((role) => ASSIGNABLE_ROLES.Staff.includes(role));
      }

      return true;
    },

    canAssignRole(role) {
      return Boolean(this.currentRoleManager && ASSIGNABLE_ROLES[this.currentRoleManager].includes(role));
    },

    isRoleDisabled(role) {
      return role === 'Member' || !this.canAssignRole(role);
    },

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

          const roles = normalizeRoles(
            Array.isArray(u.roles) && u.roles.length ? u.roles : ['Member']
          );

          if (!roles.includes('Member')) {
            roles.push('Member');
          }

          return {
            id: u.id || u.username || u.Username || u.email || attrs.email,
            username: u.username || u.Username || '',
            name: displayName,
            email: u.email || attrs.email || '',
            roles,
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
      if (!this.canEditUser(user)) {
        this.showToast('You cannot manage this user’s roles');
        return;
      }

      this.roleModalUser = user;
      this.pendingRoles = normalizeRoles([...user.roles]);

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

      if (!this.canAssignRole(role)) {
        this.showToast(`You cannot assign the ${ROLE_DEFINITIONS[role]?.label || role} role`);
        return;
      }

      if (this.pendingRoles.includes(role)) {
        this.pendingRoles = this.pendingRoles.filter((r) => r !== role);
      } else {
        this.pendingRoles.push(role);
      }

      if (!this.pendingRoles.includes('Member')) {
        this.pendingRoles.push('Member');
      }

      this.pendingRoles = normalizeRoles(this.pendingRoles);
    },

    async saveRoles() {
      if (!this.roleModalUser) return;

      if (!this.canEditUser(this.roleModalUser)) {
        this.showToast('You cannot manage this user’s roles');
        return;
      }

      const roles = normalizeRoles([...this.pendingRoles, 'Member']);
      const forbiddenRole = roles.find((role) => !this.canAssignRole(role));

      if (forbiddenRole) {
        this.showToast(
          `You cannot assign the ${ROLE_DEFINITIONS[forbiddenRole]?.label || forbiddenRole} role`
        );
        return;
      }

      this.savingRoles = true;

      try {
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
