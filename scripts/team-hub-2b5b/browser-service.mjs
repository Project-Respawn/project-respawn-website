// Served only by the isolated localhost rehearsal's Vite alias.
import {fetchAuthSession} from 'aws-amplify/auth';
import manifest from '../../config/domains/team-hub/domain-endpoints.Ntgre.json';
import coreManifest from '../../config/domains/core/domain-endpoints.Ntgre.json';
import {createCutoverClient} from '../../src/features/team-hub/api/cutover-client.mjs';
import {createWebsiteAdapter} from '../../src/features/team-hub/services/website-adapter.mjs';
export const usingIndependentTeamHub=true;
const session=()=>fetchAuthSession();
const client=createCutoverClient({manifest,core:coreManifest.environmentContract,activation:{mode:'TARGET_WRITER',epoch:2,reviewed:true},tokenProvider:async()=> (await session()).tokens?.accessToken?.toString(),fetcher:(url,init)=>{
 if(!import.meta.env.DEV||location.hostname!=='localhost')throw Error('LOCAL_REHEARSAL_ONLY');
 const path=new URL(url);return fetch(__TEAM_HUB_REHEARSAL_BASE__+path.pathname+path.search,{...init,headers:{...init.headers,'X-Rehearsal-Persona':sessionStorage.getItem('team-hub-rehearsal-persona')??'ordinary'}});
}});
const adapter=createWebsiteAdapter({client,identity:async()=>({subject:(await session()).tokens?.accessToken?.payload?.sub})});
export const loadTeamCapabilities=async()=> (await client.call('LIST_MY_TEAMS',{})).capabilities;
export const listMyTeams=(...a)=>adapter.listMyTeams(...a),listAdminTeams=listMyTeams;
export const getTeamHub=(...a)=>adapter.getTeamHub(...a),createTeam=(...a)=>adapter.createTeam(...a),updateTeam=(...a)=>adapter.updateTeam(...a);
export const setTeamManager=(...a)=>adapter.setTeamManager(...a),manageTeamMember=(...a)=>adapter.manageTeamMember(...a),setTeamRosterSlot=(...a)=>adapter.setTeamRosterSlot(...a),searchAssignableUsers=(...a)=>adapter.searchAssignableUsers(...a);
export const listMyChampionPool=(...a)=>adapter.listMyChampionPool(...a),upsertMyChampionPoolEntry=(...a)=>adapter.upsertMyChampionPoolEntry(...a),deleteMyChampionPoolEntry=(...a)=>adapter.deleteMyChampionPoolEntry(...a);
export const listTeamChampionPools=(...a)=>adapter.listTeamChampionPools(...a),getPlayerCompetitiveDetail=(...a)=>adapter.getPlayerCompetitiveDetail(...a),upsertCoachAssessment=(...a)=>adapter.upsertCoachAssessment(...a),setTeamPlan=(...a)=>adapter.setTeamPlan(...a);
export const requestTeamLogoUpload=(...a)=>adapter.requestTeamLogoUpload(...a),commitTeamLogo=(...a)=>adapter.commitTeamLogo(...a),removeTeamLogo=(...a)=>adapter.removeTeamLogo(...a),uploadTeamLogo=requestTeamLogoUpload;
export async function loadBoundedPages(load,maxPages=2){let nextToken,items=[];for(let i=0;i<maxPages;i++){const p=await load(nextToken);items.push(...p.items);nextToken=p.nextToken;if(!nextToken)return {items,complete:true,nextToken:null};}return {items,nextToken,complete:false};}
export async function resolveTeamRouteAccess(slug,roles=[]){const c=await getTeamHub({teamSlug:slug});if(roles.length&&!roles.includes(c.teamRole)&&!(roles.includes('ADMIN')&&c.isPlatformAdmin))throw Error('Team Hub access denied');return c;}
