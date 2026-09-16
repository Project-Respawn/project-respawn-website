import { getTournament, tournamentPath } from '../tournament.data.js';
import { tournamentNavigation } from '../tournament-navigation.js';
export default {
  data:()=>({menuOpen:false,navigation:tournamentNavigation}),
  computed:{tournament(){return getTournament(this.$route.params.tournamentSlug)},active(){return this.$route.meta.tournamentSection || 'overview'}},
  methods:{path(segment){return tournamentPath(this.$route.params.tournamentSlug,segment)}},
};
