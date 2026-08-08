import { fetchAuthSession } from 'aws-amplify/auth';

export default {
  name: 'AdminHome',

  data() {
    return {
      canManagePermissions: false,
    };
  },

  async mounted() {
    try {
      const session = await fetchAuthSession();
      const groups =
        session.tokens?.accessToken?.payload?.['cognito:groups'] ||
        session.tokens?.idToken?.payload?.['cognito:groups'] ||
        [];
      this.canManagePermissions = Array.isArray(groups) &&
        groups.some((group) => group === 'SuperAdmin' || group === 'Admin');
    } catch {
      this.canManagePermissions = false;
    }
  },

  methods: {
    goToRoute(route) {
      if (!route || !this.$router) return;
      if (this.$route?.path !== route) {
        this.$router.push(route);
      }
    },
  },
};
