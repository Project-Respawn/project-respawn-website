import { getTournament } from './tournament.data.js';
const children = [
  { path: '', name: 'tournament-overview', component: () => import('../../views/Tournaments/Overview/TournamentOverview.vue'), meta: { public: true, tournamentSection: 'overview' } },
  { path: 'teams', name: 'tournament-teams', component: () => import('../../views/Tournaments/Teams/TournamentTeams.vue'), meta: { public: true, tournamentSection: 'teams' } },
  { path: 'matches', name: 'tournament-matches', component: () => import('../../views/Tournaments/Matches/TournamentMatches.vue'), meta: { public: true, tournamentSection: 'matches' } },
  { path: 'drafts', name: 'tournament-drafts', component: () => import('../../views/Tournaments/DraftCentre/TournamentDraftCentre.vue'), meta: { public: true, tournamentSection: 'drafts' } },
  { path: 'broadcast', name: 'tournament-broadcast', component: () => import('../../views/Tournaments/RespawnBroadcast/TournamentRespawnBroadcast.vue'), meta: { public: true, tournamentSection: 'broadcast' } },
  { path: 'partner-streams', name: 'tournament-streams', component: () => import('../../views/Tournaments/PartnerStreams/TournamentPartnerStreams.vue'), meta: { public: true, tournamentSection: 'streams' } },
  { path: 'bracket', name: 'tournament-bracket', component: () => import('../../views/Tournaments/BracketResults/TournamentBracketResults.vue'), meta: { public: true, tournamentSection: 'bracket' } },
  { path: 'news', name: 'tournament-news', component: () => import('../../views/Tournaments/News/TournamentNews.vue'), meta: { public: true, tournamentSection: 'news' } },
  { path: 'info', name: 'tournament-info', component: () => import('../../views/Tournaments/Info/TournamentInfo.vue'), meta: { public: true, tournamentSection: 'info' } },
  { path: 'matches/:matchId', name: 'tournament-match', component: () => import('../../views/Tournaments/MatchDetail/TournamentMatchDetail.vue'), meta: { public: true, tournamentSection: 'matches' } },
  { path: 'drafts/:matchId', name: 'tournament-draft', component: () => import('../../views/Tournaments/DraftSpectator/TournamentDraftSpectator.vue'), meta: { public: true, tournamentSection: 'drafts' } },
  { path: 'register', name: 'tournament-registration', component: () => import('../../views/Tournaments/Registration/TournamentRegistration.vue'), meta: { public: true, tournamentSection: 'overview' } },
  { path: 'matches/:matchId/lobby', name: 'tournament-lobby', component: () => import('../../views/Tournaments/MatchLobby/TournamentMatchLobby.vue'), meta: { public: true, tournamentSection: 'matches' } },
];
export default [
  { path: '/tournaments', redirect: '/tournaments/founders-cup' },
  { path: '/tournaments/:tournamentSlug', component: () => import('./shell/TournamentShell.vue'), beforeEnter: to => getTournament(to.params.tournamentSlug) ? true : { path: '/tournaments/founders-cup' }, children, meta: { public: true } },
];
