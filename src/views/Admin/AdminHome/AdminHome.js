export default {
  name: 'AdminHome',

  methods: {
    goToRoute(route) {
      if (!route || !this.$router) return;
      if (this.$route?.path !== route) {
        this.$router.push(route);
      }
    },
  },
};