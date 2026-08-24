import TeamHubSidebar from '../TeamHubSidebar.vue';

export default {
  name: 'ChampionPool',

  components: {
    TeamHubSidebar,
  },

  data() {
    return {
      tiers: ['S', 'A', 'B', 'C', 'D'],
    };
  },
};