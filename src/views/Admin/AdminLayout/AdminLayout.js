import { getCurrentUser, fetchAuthSession, signOut } from 'aws-amplify/auth';

const ADMIN_ALLOWED_GROUPS = ['SuperAdmin', 'Admin', 'Staff'];

const ROLE_LABELS = {
  SuperAdmin: 'Super Admin',
  Admin: 'Admin',
  Staff: 'Staff',
};

export default {
  name: 'AdminLayout',

  data() {
    return {
      authChecking: true,
      isAuthenticated: false,
      authError: '',
      adminEmail: '',
      currentUserGroups: [],
      tabs: [
        { id: 'home', icon: '🏠', label: 'Home', route: '/dashboard' },
        { id: 'users', icon: '👥', label: 'Users', route: '/dashboard/users' },
        { id: 'permissions', icon: '🛡️', label: 'Permissions', route: '/dashboard/permissions' },
        { id: 'events', icon: '📅', label: 'Events', route: '/dashboard/events' },
        { id: 'forums', icon: '🧵', label: 'Forums', route: '/dashboard/forums' },
        { id: 'brands', icon: '🏷️', label: 'Brands', route: '/dashboard/brands' },
        { id: 'merch-categories', icon: '📦', label: 'Merch Categories', route: '/dashboard/merch-categories' },
        { id: 'brand-permissions', icon: '🔐', label: 'Brand Permissions', route: '/dashboard/brand-permissions' },
      ],
    };
  },

  computed: {
    currentAdminPrimaryRoleLabel() {
      const priority = ['SuperAdmin', 'Admin', 'Staff'];
      const found = priority.find((role) => this.currentUserGroups.includes(role));
      return ROLE_LABELS[found] || 'Admin User';
    },

    currentAdminInitials() {
      return this.currentAdminPrimaryRoleLabel
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    },

    activeTab() {
      const path = this.$route?.path || '';

      if (path === '/dashboard') return 'home';
      if (path.includes('/brand-permissions')) return 'brand-permissions';
      if (path.includes('/merch-categories')) return 'merch-categories';
      if (path.includes('/brands')) return 'brands';
      if (path.includes('/forums')) return 'forums';
      if (path.includes('/events')) return 'events';
      if (path.includes('/permissions')) return 'permissions';
      if (path.includes('/users')) return 'users';

      return 'home';
    },
  },

  async mounted() {
    await this.initAuth();
  },

  methods: {
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

        if (
          !Array.isArray(groups) ||
          !Array.isArray(ADMIN_ALLOWED_GROUPS) ||
          !groups.some((group) => ADMIN_ALLOWED_GROUPS.includes(group))
        ) {
          this.isAuthenticated = false;
          this.authError = 'Access denied. Your account does not have dashboard permissions.';
          return;
        }

        this.currentUserGroups = groups;
        this.adminEmail = user.signInDetails?.loginId || user.username || '';
        this.isAuthenticated = true;
      } catch (error) {
        console.error('initAuth failed:', error);
        this.isAuthenticated = false;
        this.authError = 'You must be signed in to access this dashboard.';
      } finally {
        this.authChecking = false;
      }
    },

    goToTab(tab) {
      if (!tab?.route || !this.$router) return;
      if (this.$route?.path !== tab.route) {
        this.$router.push(tab.route);
      }
    },

    async handleSignOut() {
      try {
        await signOut();
      } catch (error) {
        console.error('signOut failed:', error);
      } finally {
        this.isAuthenticated = false;
        this.authError = '';
        this.adminEmail = '';
        this.currentUserGroups = [];

        if (this.$router) {
          this.$router.push('/');
        }
      }
    },
  },
};