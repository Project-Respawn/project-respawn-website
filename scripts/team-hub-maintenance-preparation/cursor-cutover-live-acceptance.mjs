import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {operations,validateResponse} from '../../domains/team-hub/business-runtime/contracts.mjs';
import {request,teamId} from './business-requests.mjs';
import {validateAuthority} from '../../domains/team-hub/authority-contract/contract.mjs';
import {acceptedCore} from '../../domains/team-hub/core-integration/manifest.mjs';
const E='docs/architecture/team-hub-cursor-accepted-cutover-evidence-2026-10-14';
const manifest=JSON.parse(fs.readFileSync('config/domains/team-hub/domain-endpoints.Ntgre.json'));assert.equal(manifest.apiId,'t54b88casf');
const product=JSON.parse(fs.readFileSync('docs/architecture/team-hub-cursor-runtime-correction-evidence-2026-10-13/product.template.json'));
const deployedRoutes=new Set(Object.values(product.Resources).filter(x=>x.Type==='AWS::ApiGatewayV2::Route').map(x=>x.Properties.RouteKey));
export async function run({sessions,phase}){
 assert.equal(sessions.size,5);assert.equal(new Set([...sessions.values()].map(x=>x.subject)).size,5);
 const receipts={at:new Date().toISOString(),phase,requests:[],complete:false,tokensPersisted:false};
 const save=()=>fs.writeFileSync(E+'/'+phase+'-live.json',JSON.stringify(receipts,null,2)+'\n');save();
 const token=p=>{const x=sessions.get(p);assert.ok(x);assert.ok(JSON.parse(Buffer.from(x.accessToken.split('.')[1],'base64url')).exp>Date.now()/1000+300,'SESSION_EXPIRY');return x.accessToken;};
 async function authority(persona,mode,epoch){const response=await fetch(manifest.endpoint+'/v1/authority',{headers:{Authorization:'Bearer '+token(persona)},signal:AbortSignal.timeout(15000)});const body=await response.json();receipts.requests.push({persona,path:'/v1/authority',status:response.status,requestId:response.headers.get('apigw-requestid'),response:body});save();assert.equal(response.status,200);validateAuthority(body,acceptedCore.environmentContract);assert.equal(body.mode,mode);assert.equal(body.epoch,epoch);assert.equal(body.version,epoch);return body;}
 async function call(persona,op,input={},expected=200,epoch=5){
  const spec=operations[op],payload={...input};let url=spec.path.replace(/\{([^}]+)\}/g,(_,key)=>{const value=payload[key];assert.ok(value,key);delete payload[key];return encodeURIComponent(value)});
  if(spec.method==='GET'&&Object.keys(payload).length)url+='?'+new URLSearchParams(payload);
  const response=await fetch(manifest.endpoint+url,{method:spec.method,headers:{Authorization:'Bearer '+token(persona),'x-team-authority-epoch':String(epoch),...(spec.method==='GET'?{}:{'Content-Type':'application/json'})},...(spec.method==='GET'?{}:{body:JSON.stringify(payload)}),signal:AbortSignal.timeout(20000)});
  const body=await response.json();receipts.requests.push({persona,operation:op,status:response.status,requestId:body.requestId??response.headers.get('apigw-requestid'),error:body.error?.code,expected,epoch});save();assert.equal(response.status,expected,persona+' '+op+' '+(body.error?.code??''));if(expected===200){validateResponse(op,body.data);return body.data;}return body;
 }
 try{
  if(['browser','browser-published'].includes(phase)){
   assert.equal(JSON.parse(fs.readFileSync(E+'/business-live.json')).complete,true);
   const readiness={at:new Date().toISOString(),personas:[],complete:false,tokensPersisted:false};
   for(const persona of sessions.keys()){const response=await fetch('https://cognito-idp.eu-north-1.amazonaws.com/',{method:'POST',headers:{'Content-Type':'application/x-amz-json-1.1','X-Amz-Target':'AWSCognitoIdentityProviderService.GetUser'},body:JSON.stringify({AccessToken:token(persona)}),signal:AbortSignal.timeout(15000)});const value=await response.json();readiness.personas.push({persona,status:response.status,error:response.ok?undefined:value.__type,message:response.ok?undefined:value.message});}
   readiness.complete=readiness.personas.every(x=>x.status===200);fs.writeFileSync(E+'/cognito-session-readiness.json',JSON.stringify(readiness,null,2));assert.equal(readiness.complete,true,'COGNITO_SELF_SESSION_INVALID');
   for(const persona of sessions.keys())await authority(persona,'TARGET_WRITER',5);const hash=crypto.createHash('sha256').update(fs.readFileSync('scripts/team-hub-maintenance-preparation/cursor-cutover-browser.mjs')).digest('hex');return(await import('./cursor-cutover-browser.mjs?sha256='+hash)).verify({sessions,port:5174,preview:phase==='browser'});
  }
  if(['dark','frozen'].includes(phase)){
   const mode=phase==='dark'?'LEGACY_WRITER':'FROZEN',epoch=phase==='dark'?3:4;
   for(const persona of sessions.keys()){await authority(persona,mode,epoch);for(const [op,spec]of Object.entries(operations).filter(([,spec])=>deployedRoutes.has(spec.method+' '+spec.path))){await call(persona,op,Object.fromEntries([...spec.path.matchAll(/\{([^}]+)\}/g)].map(m=>[m[1],m[1]==='teamId'?teamId:m[1]==='championId'?'Ahri':'team-membership:'+teamId+':'+sessions.get('player').subject])),403,epoch);}}
   receipts.complete=true;save();return receipts;
  }
  assert.ok(['business','cleanup'].includes(phase));assert.equal(JSON.parse(fs.readFileSync(E+'/target-writer.json')).authority.mode.S,'TARGET_WRITER');
  for(const persona of sessions.keys())await authority(persona,'TARGET_WRITER',5);
  const base='Cutover20261014_'+Date.now();let n=0;
  const context=async()=>call('admin','GET_TEAM_HUB',{teamId});
  const mutate=async(persona,op,extra={})=>{const c=await context();const membership=c.memberships.find(x=>x.subject===sessions.get(persona).subject);return call(persona,op,request(op,{team:c.team,membership,isPlatformAdmin:persona==='admin',runKey:base+'_'+(++n),...extra}));};
  if(phase==='cleanup'){
   assert.equal(JSON.parse(fs.readFileSync(E+'/business-live.json')).complete,true);assert.equal(JSON.parse(fs.readFileSync(E+'/observation.json')).complete,true);
   const pool=await call('player','LIST_MY_CHAMPION_POOL',{teamId,limit:50});for(const entry of pool.items){assert.ok(['Ahri','Ashe'].includes(entry.championId),'UNOWNED_FIXTURE_DATA');await mutate('player','DELETE_MY_CHAMPION',{championId:entry.championId,entryVersion:entry.version});}
   for(const persona of ['player','coach']){const c=await context(),target=c.memberships.find(x=>x.subject===sessions.get(persona).subject);assert.equal(target.status,'ACTIVE');await mutate('manager','MANAGE_MEMBER',{action:'REVOKE',target,role:persona==='player'?'PLAYER':'COACH'});}
   const c=await context(),target=c.memberships.find(x=>x.subject===sessions.get('manager').subject);await mutate('admin','SET_MANAGER',{action:'REVOKE',target});await mutate('admin','UPDATE_TEAM',{status:'INACTIVE'});const final=await context();assert.equal(final.team.status,'INACTIVE');assert.ok(final.memberships.every(x=>x.status==='INACTIVE'));assert.equal(final.roster.length,0);receipts.complete=true;receipts.retained='Inactive synthetic Team, inactive memberships and required audit/idempotency evidence; no direct table deletion';save();return receipts;
  }
  const create=request('CREATE_TEAM',{runKey:base+'_create'}),created=await call('admin','CREATE_TEAM',create);assert.equal(created.team.id,teamId);const replay=await call('admin','CREATE_TEAM',create);assert.deepEqual(replay,created);
  await call('ordinary','CREATE_TEAM',{...create,idempotencyKey:base+'_ordinary'},403);
  await mutate('admin','UPDATE_TEAM');
  const email=p=>JSON.parse(Buffer.from(sessions.get(p).idToken.split('.')[1],'base64url')).email;
  const manager=await call('admin','RESOLVE_TEAM_ASSIGNABLE_USER',{teamId,account:email('manager')});assert.equal(manager.subject,sessions.get('manager').subject);await mutate('admin','SET_MANAGER',{account:email('manager'),target:manager});
  for(const [persona,role]of [['coach','COACH'],['player','PLAYER']]){const target=await call('manager','RESOLVE_TEAM_ASSIGNABLE_USER',{teamId,account:email(persona)});assert.equal(target.subject,sessions.get(persona).subject);await mutate('manager','MANAGE_MEMBER',{account:email(persona),target,role});}
  let c=await context(),player=c.memberships.find(x=>x.subject===sessions.get('player').subject);await mutate('manager','SET_ROSTER_SLOT',{target:player});
  for(const championId of ['Ahri','Ashe'])await mutate('player','UPSERT_MY_CHAMPION',{championId,entryVersion:0});
  c=await context();player=c.memberships.find(x=>x.subject===sessions.get('player').subject);await mutate('coach','UPSERT_COACH_ASSESSMENT',{target:player,assessmentVersion:0});
  await mutate('admin','SET_TEAM_PLAN');
  const first=await call('player','LIST_MY_CHAMPION_POOL',{teamId,limit:1});assert.equal(first.items.length,1);assert.ok(first.nextToken);const second=await call('player','LIST_MY_CHAMPION_POOL',{teamId,limit:1,nextToken:first.nextToken});assert.equal(second.items.length,1);assert.notEqual(first.items[0].championId,second.items[0].championId);
  await call('player','LIST_MY_CHAMPION_POOL',{teamId,limit:1,nextToken:first.nextToken+'x'},400);
  for(const persona of ['admin','manager','coach','player']){const teams=await call(persona,'LIST_MY_TEAMS',{limit:1});assert.ok(teams.items.some(x=>x.id===teamId));await call(persona,'GET_TEAM_HUB',{teamId});}
  const ordinary=await call('ordinary','LIST_MY_TEAMS',{});assert.equal(ordinary.items.length,0);await call('ordinary','GET_TEAM_HUB',{teamId},403);
  for(const persona of ['manager','coach']){const pools=await call(persona,'LIST_TEAM_CHAMPION_POOLS',{teamId,limit:1});assert.equal(pools.items.length,1);assert.ok(pools.items.every(x=>(x.privateNotes??[]).every(n=>n.privateNote==='')));if(persona==='manager')assert.ok(pools.items.every(x=>!('privateNotes' in x)));await call(persona,'GET_PLAYER_COMPETITIVE_DETAIL',{teamId,membershipId:player.id});}
  await call('player','LIST_TEAM_CHAMPION_POOLS',{teamId},403);await call('coach','LIST_MY_CHAMPION_POOL',{teamId},403);await call('player','GET_PLAYER_COMPETITIVE_DETAIL',{teamId,membershipId:player.id},403);
  await call('player','LIST_MY_TEAMS',{},409,4);
  c=await context();const privateAttempt=request('UPSERT_COACH_ASSESSMENT',{team:c.team,membership:c.memberships.find(x=>x.subject===sessions.get('coach').subject),target:c.memberships.find(x=>x.id===player.id),assessmentVersion:1,runKey:base+'_private'});privateAttempt.privateNote='disabled synthetic probe';await call('coach','UPSERT_COACH_ASSESSMENT',privateAttempt,403);
  await mutate('player','DELETE_MY_CHAMPION',{championId:'Ashe',entryVersion:1});
  c=await context();player=c.memberships.find(x=>x.subject===sessions.get('player').subject);await mutate('manager','MANAGE_MEMBER',{action:'REVOKE',target:player,role:'PLAYER'});await call('player','GET_TEAM_HUB',{teamId},403);const target=await call('manager','RESOLVE_TEAM_ASSIGNABLE_USER',{teamId,account:email('player')});await mutate('manager','MANAGE_MEMBER',{target,account:email('player'),role:'PLAYER'});
  receipts.complete=true;receipts.mutations=[...new Set(receipts.requests.filter(x=>operations[x.operation]?.runtime==='command'&&x.status===200).map(x=>x.operation))];assert.equal(receipts.mutations.length,9);receipts.fixture={teamId,retained:true,branding:false,coachPrivateCreation:false};save();return receipts;
 }catch(error){receipts.failed={name:error.name,message:String(error.message).slice(0,400)};save();throw error;}
}
