import TournamentMatchCard from './TournamentMatchCard.vue';
import { getTournament, tournamentPath, registrationState } from '../tournament.data.js';
import { tournamentNavigation } from '../tournament-navigation.js';
export default {
  props:{page:{type:String,required:true}},components:{TournamentMatchCard},
  data:()=>({search:'',filter:'All',bracketTab:'Bracket',registrationPreview:'',notice:'',selectedArticle:null,hover:'Orianna',locked:false,gameTab:1,ready:false,side:''}),
  computed:{
    tournament(){return getTournament(this.$route.params.tournamentSlug)},
    roles(){return this.tournament.draftPreview?.roles || []},
    bluePicks(){return this.tournament.draftPreview?.bluePicks || []},
    redPicks(){return this.tournament.draftPreview?.redPicks || []},
    champions(){return this.tournament.draftPreview?.champions || []},
    exclusions(){return this.tournament.draftPreview?.exclusions || []},
    title(){return tournamentNavigation.find(i=>i.key===this.page)?.label || ({match:'Match Centre',draft:'Spectator Draft',registration:'Registration Preview',lobby:'Match Lobby Preview'}[this.page])},
    registrationStatus(){return this.registrationPreview || registrationState(this.tournament.registration)},
    registrationTitle(){return {open:'REGISTRATION OPEN · PREVIEW',closed:'REGISTRATION IS NOW CLOSED',paused:'REGISTRATION PAUSED','coming-soon':'TEAM REGISTRATION OPENS SOON'}[this.registrationStatus]},
    registrationCopy(){return this.registrationStatus==='closed'?'Team submissions have ended. Follow matches and participating communities.':this.registrationStatus==='open'?'Preview a free creator-community application using your Team Hub lineup.':'Entry dates and final tournament details will be confirmed before applications open.'},
    filteredTeams(){const q=this.search.toLowerCase();return this.tournament.teams.filter(t=>(t.name+' '+t.creator).toLowerCase().includes(q))},
    filteredMatches(){const q=this.search.toLowerCase();return this.tournament.matches.filter(m=>(this.filter==='All'||m.status===this.filter)&&this.matchLabel(m).toLowerCase().includes(q))},
    selectedMatch(){return this.findMatch(this.$route.params.matchId)},
    bracketRounds(){return this.tournament.bracket.map(round=>({title:round.title,matches:round.matchIds.map(id=>{const m=this.findMatch(id);return {id:m.id,label:m.time,rows:[[this.teamName(m.a),m.score.split(' : ')[0]],[this.teamName(m.b),m.score.split(' : ')[1]||'—']]}})}))},
    rules(){return [['Format & dates',this.tournament.format.label+'. '+this.tournament.dateLabel+'. Bracket and series states here are previews, not confirmed rules.'],['Registration & eligibility','A Project Respawn creator submits a community team. The creator does not need to compete. Maintain players in Team Hub, then select the tournament lineup.'],['Roster changes','Tournament entry preserves approved players independently of later Team Hub changes. Substitution and lock rules must be confirmed before launch.'],['Side selection','The higher seed chooses side for Game 1. The losing team chooses side for the next game.'],['Public & private draft information','Intentional public hovers, bans and locked selections are visible. Team notes, suggestions and chat remain private. Fearless settings belong to the event configuration.'],['Results & disputes','Participants submit a result with evidence. Opponent confirmation or administrator approval is required before progression. This frontend does not submit results.'],['Broadcast & rewards','Only approved coverage will be linked. Rewards and Riot support must be confirmed; this preview promises neither cash prizes nor RP.']]},
  },
  watch:{notice(v){if(v)this.focusDialog()},selectedArticle(v){if(v)this.focusDialog()}},
  methods:{path(segment){return tournamentPath(this.tournament.slug,segment)},teamName(id){return this.tournament.teams.find(t=>t.id===id)?.name || 'To be confirmed'},matchLabel(m){return m?this.teamName(m.a)+' vs '+this.teamName(m.b):'Match to be confirmed'},findMatch(id){return this.tournament?.matches.find(m=>m.id===id)||null},focusDialog(){this.returnFocus=document.activeElement;this.$nextTick(()=>this.$refs.dialogClose?.focus())},dismiss(){this.notice='';this.selectedArticle=null;this.$nextTick(()=>this.returnFocus?.focus())}},
};
