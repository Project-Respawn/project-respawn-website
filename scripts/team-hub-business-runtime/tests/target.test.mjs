import test from 'node:test';import assert from 'node:assert/strict';
import {createCutoverHandler} from '../../../domains/team-hub/business-runtime/handler.mjs';
import {operations} from '../../../domains/team-hub/business-runtime/contracts.mjs';
import {TransactionEmulator} from '../../team-hub-2b4/tests/transport.mjs';
import {environment,claims,subjects,now} from '../../team-hub/tests/fixtures.mjs';
import {exercise} from '../../team-hub-2b5/tests/sequence.mjs';
const journal='ProjectRespawn-TeamHub-Ntgre-Journal',operational='ProjectRespawn-TeamHub-Ntgre-Operational';
class Transport extends TransactionEmulator {
 async transactWrite(p){if(this.beforeWrite){const fn=this.beforeWrite;this.beforeWrite=null;fn();}const first=p.TransactItems[0].ConditionCheck;assert.equal(first.Key.PK,'CONTROL#AUTHORITY');const row=this.rows.get(this.key(journal,first.Key)),v=first.ExpressionAttributeValues;if(row.mode!==v[':mode']||row.epoch!==v[':epoch']||row.version!==v[':version']){const error=Error('conflict');error.name='TransactionCanceledException';throw error;}await super.transactWrite({...p,TransactItems:p.TransactItems.slice(1)});this.transactions[this.transactions.length-1]=structuredClone(p);}
}
function fixture({permissionsEnabled=false}={}){const transport=new Transport(),control={PK:'CONTROL#AUTHORITY',SK:'STATE',schemaVersion:'team-hub-authority.v1',mode:'TARGET_WRITER',epoch:2,version:2,changedAt:'2026-10-07T00:00:00Z',changedBy:'offline-test',gateDigest:'a'.repeat(64)};transport.rows.set(transport.key(journal,control),control);let revoked=false;const invokeCore=async r=>{if(r.contractVersion==='authorization.decision.v1')return {ok:true,data:{contractVersion:r.contractVersion,subject:subjects[r.accessToken],capability:r.capability,environment:'Ntgre',allowed:r.accessToken==='admin'&&!revoked&&r.capability==='teams.admin',decisionVersion:1,evaluatedAt:now,expiresAt:now+5}};if(r.action==='resolve'){const name=r.account.split('@')[0];return {ok:true,data:{contractVersion:r.contractVersion,subject:subjects[name],displayName:name}};}return {ok:true,data:{contractVersion:r.contractVersion,items:[]}};};const handlers=Object.fromEntries(['command','read'].map(runtime=>[runtime,createCutoverHandler({runtime,transport,invokeCore,environment,permissionsEnabled,cursorSecret:'offline-stable-cursor-secret-at-least-32-bytes',clock:()=>now})]));
 const call=async(persona,op,req)=>{const spec=operations[op],body={...req},pathParameters={};for(const m of spec.path.matchAll(/\{([^}]+)\}/g)){pathParameters[m[1]]=body[m[1]];delete body[m[1]];}const r=await handlers[spec.runtime]({routeKey:spec.method+' '+spec.path,pathParameters,headers:{authorization:'Bearer '+persona,'x-team-authority-epoch':'2'},...(spec.method==='GET'?{queryStringParameters:Object.fromEntries(Object.entries(body).map(([k,v])=>[k,String(v)]))}:{body:JSON.stringify(body)}),requestContext:{requestId:'offline-test',authorizer:{jwt:{claims:claims(persona)}}}});return {status:r.statusCode,body:JSON.parse(r.body)};};return {transport,control,call,revoke:()=>{revoked=true},snapshot:async()=>({operational:[...transport.rows.entries()].filter(([k])=>k.startsWith(operational+'|')).map(([,v])=>structuredClone(v)).sort((a,b)=>(a.PK+a.SK).localeCompare(b.PK+b.SK)),journal:[...transport.rows.entries()].filter(([k,v])=>k.startsWith(journal+'|')&&v.PK!=='CONTROL#AUTHORITY').map(([,v])=>structuredClone(v)).sort((a,b)=>(a.PK+a.SK).localeCompare(b.PK+b.SK))})};}
const create={slug:'real-team',name:'Real candidate',gameKey:'LEAGUE_OF_LEGENDS',idempotencyKey:'candidate-create'};
test('ordinary Team create uses real capability client and atomic authority condition',async()=>{const f=fixture();assert.equal((await f.call('admin','CREATE_TEAM',create)).status,200);assert.equal(f.transport.transactions.length,1);assert.equal(f.transport.transactions[0].TransactItems[0].ConditionCheck.Key.PK,'CONTROL#AUTHORITY');assert.equal((await f.call('player','CREATE_TEAM',{...create,slug:'other'})).status,403);});
for(const mode of ['LEGACY_WRITER','FROZEN'])test(mode+' denies target writes including synthetic-looking names',async()=>{const f=fixture();f.control.mode=mode;assert.equal((await f.call('admin','CREATE_TEAM',{...create,slug:'phase2b4-test-abcdefgh-one'})).status,403);assert.equal(f.transport.transactions.length,0);});
test('authority missing/outage fails closed',async()=>{const f=fixture();f.transport.rows.clear();assert.notEqual((await f.call('admin','CREATE_TEAM',create)).status,200);assert.equal(f.transport.transactions.length,0);});
test('freeze between read and transaction prevents all domain/audit/idempotency writes',async()=>{const f=fixture();f.transport.beforeWrite=()=>{f.control.mode='FROZEN';f.control.version++;};assert.equal((await f.call('admin','CREATE_TEAM',create)).status,403);assert.equal(f.transport.rows.size,1);});
test('fresh global revocation prevents idempotency replay',async()=>{const f=fixture();assert.equal((await f.call('admin','CREATE_TEAM',create)).status,200);f.revoke();assert.equal((await f.call('admin','CREATE_TEAM',create)).status,403);assert.equal(f.transport.transactions.length,1);});
test('41 adapted mutation/privacy/concurrency checks with ordinary authority adapter',async()=>{const f=fixture();const mapped=Object.fromEntries(Object.entries(subjects).map(([k,subject])=>[k,{subject}]));const result=await exercise({call:f.call,snapshot:f.snapshot,subjects:mapped,runId:'b4b20261006'});assert.ok(result.complete);assert.equal(result.results.length,41);});

test('Core-backed assignment resolution exposes only identity display and Team-owned membership version',async()=>{const f=fixture();await f.call('admin','CREATE_TEAM',create);const req={teamId:'team:real-team',account:'manager@example.invalid'};const r=await f.call('admin','RESOLVE_TEAM_ASSIGNABLE_USER',req);assert.equal(r.status,200);assert.deepEqual(Object.keys(r.body.data).sort(),['displayName','membershipVersion','subject']);assert.equal(r.body.data.membershipVersion,0);assert.equal((await f.call('outsider','RESOLVE_TEAM_ASSIGNABLE_USER',req)).status,403);});
test('stale client authority epoch denies before business transaction',async()=>{const f=fixture();f.control.epoch=3;assert.equal((await f.call('admin','CREATE_TEAM',create)).status,409);assert.equal(f.transport.transactions.length,0);});
test('missing authority audit metadata fails closed',async()=>{const f=fixture();delete f.control.changedAt;assert.equal((await f.call('admin','CREATE_TEAM',create)).status,503);assert.equal(f.transport.transactions.length,0);});

test('transaction service throttle fails closed without partial writes',async()=>{const f=fixture();f.transport.transactWrite=async()=>{const e=Error('provider details must not escape');e.name='ThrottlingException';throw e;};const r=await f.call('admin','CREATE_TEAM',create);assert.equal(r.status,503);assert.equal(r.body.error.code,'DEPENDENCY_UNAVAILABLE');assert.equal(f.transport.rows.size,1);assert.ok(!JSON.stringify(r).includes('provider details'));});

async function permissionFixture(){
 const f=fixture({permissionsEnabled:true});
 await f.call('admin','CREATE_TEAM',create);
 const teamId='team:real-team';
 let sequence=0;
 const permissions=async who=>{const r=await f.call(who,'GET_TEAM_PERMISSIONS',{teamId});assert.equal(r.status,200,JSON.stringify(r));return r.body.data;};
 const command=async(who,extra)=>{const p=await permissions(who);return {teamId,idempotencyKey:'permission-case-'+(++sequence),expectedTeamVersion:p.team.version,expectedAuthorizationEpoch:p.team.authorizationEpoch,expectedMembershipVersion:p.members.find(m=>m.membershipId.endsWith(subjects[who]))?.version??0,...extra};};
 assert.equal((await f.call('admin','SET_MANAGER',await command('admin',{action:'ASSIGN',targetAccount:'manager@example.invalid',expectedTargetMembershipVersion:0}))).status,200);
 for(const [person,role]of [['coach','COACH'],['player','PLAYER'],['player2','PLAYER']])assert.equal((await f.call('manager','MANAGE_MEMBER',await command('manager',{action:'ASSIGN',role,targetAccount:person+'@example.invalid',expectedTargetMembershipVersion:0}))).status,200);
 const id=who=>'team-membership:'+teamId+':'+subjects[who];
 const grant=async(who,target,list)=>{const p=await permissions(who);return f.call(who,'SET_MEMBER_PERMISSIONS',await command(who,{membershipId:id(target),permissions:list,expectedTargetMembershipVersion:p.members.find(m=>m.membershipId===id(target)).version}));};
 return {...f,teamId,command,permissions,id,grant};
}
test('saved grants survive Dynamo codec round-trip and enforce immediate grant/revoke',async()=>{
 const f=await permissionFixture();
 assert.equal((await f.call('player','LIST_TEAM_CHAMPION_POOLS',{teamId:f.teamId})).status,403);
 assert.equal((await f.grant('coach','player',['pools.read'])).status,200);
 assert.equal((await f.call('player','LIST_TEAM_CHAMPION_POOLS',{teamId:f.teamId})).status,200);
 const stored=(await f.permissions('manager')).members.find(m=>m.membershipId===f.id('player'));
 assert.deepEqual(stored.permissions,['pools.read']);
 assert.equal((await f.grant('manager','player',[])).status,200);
 assert.equal((await f.call('player','LIST_TEAM_CHAMPION_POOLS',{teamId:f.teamId})).status,403);
});
test('grant controls reject protected leaders, escalation, planned features and duplicate values',async()=>{
 const f=await permissionFixture();
 for(const target of ['manager','coach'])assert.equal((await f.grant('coach',target,['pools.read'])).status,403);
 for(const list of [['permissions.manage'],['ownership.transfer'],['staff.manage'],['development.ai'],['reviews.read'],['pools.read','pools.read']])assert.notEqual((await f.grant('manager','player',list)).status,200,JSON.stringify(list));
 const request=await f.command('manager',{membershipId:f.id('player'),permissions:['pools.read'],expectedTargetMembershipVersion:1});
 assert.equal((await f.call('player','SET_MEMBER_PERMISSIONS',request)).status,403);
 assert.equal((await f.call('outsider','GET_TEAM_PERMISSIONS',{teamId:f.teamId})).status,403);
});
test('permission save requires exact versions and authority inside the transaction',async()=>{
 const f=await permissionFixture();
 const request=await f.command('manager',{membershipId:f.id('player'),permissions:['pools.read'],expectedTargetMembershipVersion:1});
 assert.equal((await f.grant('coach','player2',['pools.read'])).status,200);
 assert.equal((await f.call('manager','SET_MEMBER_PERMISSIONS',request)).status,409);
 const before=await f.snapshot();f.transport.beforeWrite=()=>{f.control.mode='FROZEN';f.control.version++;};
 assert.notEqual((await f.grant('manager','player',['pools.read'])).status,200);
 assert.deepEqual(await f.snapshot(),before);
});
test('delegated membership management cannot replace Head Coach or self-elevate',async()=>{
 const f=await permissionFixture();
 assert.equal((await f.grant('manager','player',['members.manage'])).status,200);
 const request=await f.command('manager',{action:'ASSIGN',role:'COACH',targetAccount:'player@example.invalid',expectedTargetMembershipVersion:2});
 request.expectedMembershipVersion=2;
 assert.equal((await f.call('player','MANAGE_MEMBER',request)).status,403);
 const revoke=await f.command('coach',{action:'REVOKE',role:'COACH',targetMembershipId:f.id('coach'),expectedTargetMembershipVersion:1});
 assert.equal((await f.call('coach','MANAGE_MEMBER',revoke)).status,403);
});
test('pool and shared-review grants are separate and never reveal coach-private notes',async()=>{
 const f=await permissionFixture();
 const own=await f.command('manager',{});own.expectedMembershipVersion=1;
 const pool=await f.call('player2','UPSERT_MY_CHAMPION',{...own,championId:'Ahri',gameRoleKey:'MID',comfortLevel:'A',priority:'NORMAL',competitiveReady:true,playerNotes:'player-visible',expectedEntryVersion:0});assert.equal(pool.status,200);
 const assessment=await f.call('coach','UPSERT_COACH_ASSESSMENT',await f.command('coach',{membershipId:f.id('player2'),championId:'Ahri',teamVisible:'shared-review',privateNote:'',expectedAssessmentVersion:0,expectedTargetMembershipVersion:1}));assert.equal(assessment.status,200);
 await f.grant('manager','player',['pools.read']);
 let r=await f.call('player','GET_PLAYER_COMPETITIVE_DETAIL',{teamId:f.teamId,membershipId:f.id('player2')});assert.deepEqual(r.body.data.assessments,[]);assert.equal('privateNotes' in r.body.data,false);
 await f.grant('coach','player',['pools.read','reviews.read']);
 r=await f.call('player','GET_PLAYER_COMPETITIVE_DETAIL',{teamId:f.teamId,membershipId:f.id('player2')});assert.equal(r.body.data.assessments[0].teamVisible,'shared-review');assert.equal('privateNotes' in r.body.data,false);
});

test('permission feature stays default-off; both permission routes deny non-target authority',async()=>{
 const off=fixture();await off.call('admin','CREATE_TEAM',create);
 assert.equal((await off.call('admin','GET_TEAM_PERMISSIONS',{teamId:'team:real-team'})).status,404);
 for(const mode of ['LEGACY_WRITER','FROZEN']){
  const f=await permissionFixture();f.control.mode=mode;
  assert.equal((await f.call('manager','GET_TEAM_PERMISSIONS',{teamId:f.teamId})).status,403);
  assert.equal((await f.call('manager','SET_MEMBER_PERMISSIONS',{teamId:f.teamId})).status,403);
 }
});
test('membership revocation clears stored grants and rejects the retained identity',async()=>{
 const f=await permissionFixture();await f.grant('manager','player',['pools.read']);
 assert.equal((await f.call('manager','MANAGE_MEMBER',await f.command('manager',{action:'REVOKE',role:'PLAYER',targetMembershipId:f.id('player'),expectedTargetMembershipVersion:2}))).status,200);
 assert.equal((await f.call('player','GET_TEAM_HUB',{teamId:f.teamId})).status,403);
 assert.equal((await f.call('player','LIST_TEAM_CHAMPION_POOLS',{teamId:f.teamId})).status,403);
 const rows=(await f.snapshot()).operational;
 const member=rows.find(r=>r.entityType==='MEMBERSHIP'&&r.id===f.id('player'));
 assert.equal(member.status,'INACTIVE');assert.equal('permissions' in member,false);
});
test('grant save is idempotent and actor capabilities come only from current saved grants',async()=>{
 const f=await permissionFixture();
 const request=await f.command('manager',{membershipId:f.id('player'),permissions:['pools.read'],expectedTargetMembershipVersion:1});
 const first=await f.call('manager','SET_MEMBER_PERMISSIONS',request),after=await f.snapshot();
 assert.equal(first.status,200);assert.deepEqual(await f.call('manager','SET_MEMBER_PERMISSIONS',request),first);assert.deepEqual(await f.snapshot(),after);
 let context=await f.call('player','GET_TEAM_HUB',{teamId:f.teamId});assert.deepEqual(context.body.data.capabilities.memberPermissions,['pools.read']);
 await f.grant('coach','player',[]);
 context=await f.call('player','GET_TEAM_HUB',{teamId:f.teamId});assert.deepEqual(context.body.data.capabilities.memberPermissions,[]);
});
