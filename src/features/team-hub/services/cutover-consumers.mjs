// Candidate adapters only: no imports from the live router or Legacy service.
export const consumers=Object.freeze([
 {route:'/team-hub',operations:['LIST_MY_TEAMS','CREATE_TEAM']},
 {route:'/team-hub/:teamSlug',operations:['GET_TEAM_HUB']},
 {route:'/team-hub/:teamSlug/manage',operations:['GET_TEAM_HUB','SEARCH_TEAM_ASSIGNABLE_USERS','SET_MANAGER','MANAGE_MEMBER','SET_ROSTER_SLOT','UPDATE_TEAM']},
 {route:'/team-hub/:teamSlug/champion-pool',operations:['LIST_MY_CHAMPION_POOL','UPSERT_MY_CHAMPION','DELETE_MY_CHAMPION']},
 {route:'/team-hub/:teamSlug/coach-review',operations:['LIST_TEAM_CHAMPION_POOLS','GET_PLAYER_COMPETITIVE_DETAIL','UPSERT_COACH_ASSESSMENT']},
 {route:'/team-hub/:teamSlug/team-pool',redirect:'/team-hub/:teamSlug/coach-review'},
 {route:'/dashboard/esports/teams',operations:['LIST_MY_TEAMS','CREATE_TEAM','UPDATE_TEAM','SET_MANAGER','SET_TEAM_PLAN','SEARCH_TEAM_ASSIGNABLE_USERS']},
 {route:'/home',operations:['LIST_MY_TEAMS','GET_TEAM_HUB']}
]);
export async function loadCutoverClient(options){const {createCutoverClient}=await import('../api/cutover-client.mjs');return createCutoverClient(options);}
export function cutoverConsumers(client){return {listHomeTeams:page=>client.call('LIST_MY_TEAMS',page??{}),getTeamBySlug:slug=>{if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw Error('INVALID_SLUG');return client.call('GET_TEAM_HUB',{teamId:'team:'+slug});},adminCommand:(operation,input)=>{if(!['CREATE_TEAM','UPDATE_TEAM','SET_MANAGER','SET_TEAM_PLAN'].includes(operation))throw Error('INVALID_ADMIN_OPERATION');return client.call(operation,input);}};}
