// Browser-only Gate A assistance. Never imported by the deployed website/runtime.
import {fetchAuthSession} from 'aws-amplify/auth';
import {acceptanceCall} from './browser-service.mjs';
const panel=document.querySelector('#team-rehearsal-panel');
const button=document.createElement('button');button.textContent='Run persona contract checks';panel.append(button);
const result=document.createElement('span');result.style.marginLeft='12px';panel.append(result);
button.onclick=async()=>{
 button.disabled=true;result.textContent='Checking…';
 const persona=sessionStorage.getItem('team-hub-rehearsal-persona')??'ordinary',checks=[];
 async function check(name,fn){try{await fn();checks.push({name,passed:true});}catch{checks.push({name,passed:false});throw Error('STOP');}}
 async function deny(op,input){try{await acceptanceCall(op,input);}catch(e){if(e.message==='FORBIDDEN')return;throw e;}throw Error('UNEXPECTED_ALLOW');}
 const teamId='team:native-alpha';
 try{
  await check('LIST_CAPABILITIES',async()=>{const r=await acceptanceCall('LIST_MY_TEAMS',{});if(r.capabilities.teamsAdmin!==(persona==='admin')||r.capabilities.brandingManage!==false||persona==='ordinary'&&r.items.length!==0)throw Error('CAPABILITY_MISMATCH');});
  await check('TEAM_ACCESS',()=>persona==='ordinary'?deny('GET_TEAM_HUB',{teamId}):acceptanceCall('GET_TEAM_HUB',{teamId}));
  await check('PLAYER_POOL',()=>persona==='player'?acceptanceCall('LIST_MY_CHAMPION_POOL',{teamId}):deny('LIST_MY_CHAMPION_POOL',{teamId}));
  await check('COACH_MANAGER_POOL',()=>['coach','manager'].includes(persona)?acceptanceCall('LIST_TEAM_CHAMPION_POOLS',{teamId}):deny('LIST_TEAM_CHAMPION_POOLS',{teamId}));
  await check('DIRECTORY_AUTHORIZATION',()=>['admin','manager'].includes(persona)?acceptanceCall('SEARCH_TEAM_ASSIGNABLE_USERS',{teamId,query:'zz2b6-no-match',limit:2}):deny('SEARCH_TEAM_ASSIGNABLE_USERS',{teamId,query:'zz2b6-no-match',limit:2}));
  await check('ADMIN_CREATE_AUTHORIZATION',()=>{const input={slug:'gate-a-'+crypto.randomUUID().slice(0,8),name:'Isolated Gate A',gameKey:'LEAGUE_OF_LEGENDS',idempotencyKey:crypto.randomUUID()};return persona==='admin'?acceptanceCall('CREATE_TEAM',input):deny('CREATE_TEAM',input);});
  await check('BRANDING_DISABLED',async()=>{try{await acceptanceCall('REMOVE_TEAM_LOGO',{});}catch(e){if(e.message==='BRANDING_DISABLED')return;throw e;}throw Error('BRANDING_ENABLED');});
  await check('INVALID_TOKEN_DENIED',async()=>{const r=await fetch(__TEAM_HUB_REHEARSAL_BASE__+'/v1/teams',{headers:{Authorization:'Bearer invalid-gate-a-token','X-Rehearsal-Persona':persona,'X-Team-Authority-Epoch':'2'}});if(r.status!==403)throw Error('INVALID_TOKEN_ACCEPTED');});
 }catch{ /* Stop at the first unexpected capability/result. */ }
 const passed=checks.length===8&&checks.every(c=>c.passed);
 try{const token=(await fetchAuthSession()).tokens?.accessToken?.toString();const r=await fetch(__TEAM_HUB_REHEARSAL_BASE__+'/__receipt',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json','X-Rehearsal-Persona':persona},body:JSON.stringify({persona,passed,checks})});if(!r.ok)throw Error('RECEIPT_FAILED');result.textContent=JSON.stringify({persona,passed,checks});}catch{result.textContent='Session or receipt failed. No acceptance recorded.';}
 button.disabled=false;
};
