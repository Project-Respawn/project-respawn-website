import BotSidebar from '@/components/BotSidebar/BotSidebar.vue';

export default {
  name: 'DiscordLayout',
  components: {
    BotSidebar,
  },
  data() {
    return {
      selectedServerId: 'respawn-main',
      currentUserAccess: 'Staff',
      availableServers: [
        {
          id: 'respawn-main',
          name: 'Project Respawn',
          initials: 'PR',
          linkedBy: 'Ravens_Gamer',
          memberCount: '1,284',
          connectionStatus: 'Connected',
          lastSync: '2 mins ago',
        },
        {
          id: 'ravens-community',
          name: 'Ravens Community Gaming',
          initials: 'RC',
          linkedBy: 'Ravens_Gamer',
          memberCount: '846',
          connectionStatus: 'Connected',
          lastSync: '5 mins ago',
        },
        {
          id: 'creator-hub',
          name: 'Creator Hub',
          initials: 'CH',
          linkedBy: 'Admin Team',
          memberCount: '392',
          connectionStatus: 'Limited',
          lastSync: '14 mins ago',
        },
      ],
    };
  },
  computed: {
    currentServer() {
      return (
        this.availableServers.find((server) => server.id === this.selectedServerId) ||
        this.availableServers[0]
      );
    },
  },
  methods: {
    handleServerChange() {
      this.$emit('server-changed', this.currentServer);

      // Later:
      // 1. validate permission for chosen server
      // 2. save active context in store or route/query
      // 3. reload child page data for that server
    },

    refreshDiscordContext() {
      this.$emit('refresh-discord-context', this.currentServer);
    },

    openDiscordSettings() {
      this.$router.push('/dashboard/settings');
    },
  },
};