// Prepared harness: importing does not contact AWS. Invocation requires separately approved
// isolated resources/credentials. SDK interface uses document values, maxAttempts=1.
import assert from 'node:assert/strict';
import {isolatedTransport,tables,reconcile,cleanupTargets,runId} from './isolation.mjs';
import {createCutoverHandler} from '../../domains/team-hub/business-runtime/handler.mjs';
import {operations} from '../../domains/team-hub/business-runtime/contracts.mjs';
import {environment,claims,subjects,now} from '../team-hub/tests/fixtures.mjs';
import {exercise} from '../team-hub-2b5/tests/sequence.mjs';
import {decode} from '../../domains/team-hub/parity/codec.mjs';
const journal=Object.values(tables)[1],operational=Object.values(tables)[0];
export async function runTransactions({sdk,ownership,record}){
 assert.equal(typeof record,'function','A sanitized durable evidence sink is required');
 cleanupTargets(ownership);
 assert.equal(ownership.principalArn,'arn:aws:sts::058264289478:assumed-role/ProjectRespawn-TeamHub-Ntgre-Isolated-20261012v1/verification');
 const scan=async TableName=>{const rows=[];let ExclusiveStartKey;do{const p=await sdk.scan({TableName,ConsistentRead:true,...(ExclusiveStartKey?{ExclusiveStartKey}:{})});rows.push(...(p.Items??[]));ExclusiveStartKey=p.LastEvaluatedKey;}while(ExclusiveStartKey);return rows.sort((a,b)=>JSON.stringify([a.PK,a.SK]).localeCompare(JSON.stringify([b.PK,b.SK])));};
 const snapshot=async()=>({operational:await scan(operational),journal:(await scan(journal)).filter(x=>x.PK!=='CONTROL#AUTHORITY')});
 for(const table of [operational,journal])assert.equal((await scan(table)).length,0,'Fresh isolated tables required');
 const control={PK:'CONTROL#AUTHORITY',SK:'STATE',schemaVersion:'team-hub-authority.v1',mode:'TARGET_WRITER',epoch:2,version:2,changedAt:'2026-10-12T00:00:00Z',changedBy:'isolated-verification',gateDigest:'a'.repeat(64)};
 const seed=()=>sdk.put({TableName:journal,Item:structuredClone(control)});
 const transport=isolatedTransport(sdk);
 let beforeWrite;
 const originalWrite=transport.transactWrite;transport.transactWrite=async p=>{if(beforeWrite){const hook=beforeWrite;beforeWrite=null;await hook();}return originalWrite(p);};
 const invokeCore=async r=>r.contractVersion==='authorization.decision.v1'?{ok:true,data:{contractVersion:r.contractVersion,subject:subjects[r.accessToken],capability:r.capability,environment:'Ntgre',allowed:r.accessToken==='admin'&&r.capability==='teams.admin',decisionVersion:1,evaluatedAt:now,expiresAt:now+5}}:r.action==='resolve'?{ok:true,data:{contractVersion:r.contractVersion,subject:subjects[r.account.split('@')[0]],displayName:r.account.split('@')[0]}}:{ok:true,data:{contractVersion:r.contractVersion,items:[]}};
 // These are explicit synthetic Core/persona adapters. Real Core/browser acceptance is separate.
 const handlers=Object.fromEntries(['read','command'].map(runtime=>[runtime,createCutoverHandler({runtime,transport,invokeCore,environment,cursorSecret:'ISOLATED_FIXTURE_ONLY_NOT_REAL_CURSOR_SECRET',clock:()=>now})]));
 const call=async(persona,op,req,epoch='2')=>{const spec=operations[op],body={...req},pathParameters={};for(const m of spec.path.matchAll(/\{([^}]+)\}/g)){pathParameters[m[1]]=body[m[1]];delete body[m[1]];}const response=await handlers[spec.runtime]({routeKey:spec.method+' '+spec.path,pathParameters,headers:{authorization:'Bearer '+persona,'x-team-authority-epoch':epoch},...(spec.method==='GET'?{queryStringParameters:Object.fromEntries(Object.entries(body).map(([k,v])=>[k,String(v)]))}:{body:JSON.stringify(body)}),requestContext:{requestId:'isolated-verification',authorizer:{jwt:{claims:claims(persona)}}}});return {status:response.statusCode,body:JSON.parse(response.body)};};
 const checks=[];let failure;
 try{
  const request={slug:'isolated-authority-denial',name:'Isolated',gameKey:'LEAGUE_OF_LEGENDS',idempotencyKey:'isolated-authority-denial'};
  for(const mode of ['LEGACY_WRITER','FROZEN']){control.mode=mode;await seed();assert.equal((await call('admin','CREATE_TEAM',request)).status,403);assert.equal((await scan(operational)).length,0);assert.equal((await snapshot()).journal.length,0);checks.push(mode);}
  await sdk.delete({TableName:journal,Key:{PK:'CONTROL#AUTHORITY',SK:'STATE'}});assert.equal((await call('admin','CREATE_TEAM',request)).status,503);checks.push('missing-authority');
  control.mode='TARGET_WRITER';await seed();assert.equal((await call('admin','CREATE_TEAM',request,'1')).status,409);checks.push('stale-epoch');
  beforeWrite=async()=>{control.mode='FROZEN';control.version++;await seed();};assert.equal((await call('admin','CREATE_TEAM',request)).status,403);assert.equal((await scan(operational)).length,0);assert.equal((await snapshot()).journal.length,0);checks.push('atomic-authority-race-zero-partial-writes');
  control.mode='TARGET_WRITER';control.version=2;await seed();
  const result=await exercise({call,snapshot,subjects:Object.fromEntries(Object.entries(subjects).map(([k,subject])=>[k,{subject}])),runId});
  assert.equal(result.complete,true);checks.push(...result.results.map(x=>x.label));
  const slug='isolated-roster-race',teamId='team:'+slug,member=n=>'team-membership:'+teamId+':'+subjects[n];let serial=0;
  const aggregate=async()=>decode((await scan(operational)).filter(x=>x.PK==='TEAM#'+teamId||x.PK==='SLUG#'+slug));
  const revision=async n=>{const a=await aggregate();return {teamId,idempotencyKey:'isolated-race-'+(++serial),expectedTeamVersion:a.team.version,expectedAuthorizationEpoch:a.team.authorizationEpoch,expectedMembershipVersion:a.memberships[member(n)]?.version??0};};
  assert.equal((await call('admin','CREATE_TEAM',{slug,name:'Isolated race',gameKey:'LEAGUE_OF_LEGENDS',idempotencyKey:'isolated-race-create'})).status,200);
  assert.equal((await call('admin','SET_MANAGER',{...await revision('admin'),action:'ASSIGN',targetAccount:'manager@example.invalid',expectedTargetMembershipVersion:0})).status,200);
  assert.equal((await call('manager','MANAGE_MEMBER',{...await revision('manager'),action:'ASSIGN',role:'PLAYER',targetAccount:'player@example.invalid',expectedTargetMembershipVersion:0})).status,200);
  const roster={...await revision('manager'),action:'ASSIGN',membershipId:member('player'),slotType:'STARTER',expectedRosterVersion:0,expectedTargetMembershipVersion:1};
  const raceBefore=await snapshot();const races=await Promise.all(['MID','TOP'].map(gameRoleKey=>call('manager','SET_ROSTER_SLOT',{...roster,gameRoleKey,idempotencyKey:'isolated-roster-'+gameRoleKey})));
  assert.deepEqual(races.map(r=>r.status).sort(),[200,409]);assert.equal((await snapshot()).journal.length,raceBefore.journal.length+2);checks.push('concurrent-roster-one-commit-one-audit-and-idempotency');
  // Revoke the unchanged actor membership between repository reads and the atomic commit.
  const revokeRequest={...await revision('manager'),action:'REVOKE',role:'PLAYER',targetMembershipId:member('player'),expectedTargetMembershipVersion:1};let afterInjection;
  beforeWrite=async()=>{const rows=await scan(operational);const row=rows.find(x=>x.PK==='TEAM#'+teamId&&JSON.stringify(x).includes(subjects.manager)&&x.SK!=='META');assert.ok(row,'Actor membership fixture');await sdk.put({TableName:operational,Item:{...row,version:row.version+1}});afterInjection=await snapshot();};
  assert.notEqual((await call('manager','MANAGE_MEMBER',revokeRequest)).status,200);assert.deepEqual(await snapshot(),afterInjection);checks.push('membership-revision-race-cancels-with-zero-partial-writes');
  const state=await snapshot();return {passed:true,checks,scope:'Real isolated DynamoDB only; synthetic Core/personas and cursor material',reconciliation:{operational:reconcile(state.operational),journal:reconcile(state.journal)}};
 }catch(e){failure=e;throw e;}finally{
  // Cleanup is bounded to exact rehearsal-owned tables, including only their synthetic row keys.
  // Preserve aggregates/digests in the caller receipt before deleting infrastructure.
  const preCleanup=[];for(const TableName of [operational,journal])preCleanup.push({table:TableName,...reconcile(await scan(TableName))});
  await record({phase:'before-cleanup',failed:Boolean(failure),completedChecks:checks,preCleanup});
  const cleanup=[];for(const TableName of [operational,journal]){for(const row of await scan(TableName))await sdk.delete({TableName,Key:{PK:row.PK,SK:row.SK}});cleanup.push({table:TableName,...reconcile(await scan(TableName))});}
  await record({phase:'after-cleanup',cleanup});
  if(cleanup.some(x=>x.count!==0))throw Error('ISOLATED_CLEANUP_INCOMPLETE'+(failure?'_AFTER_FAILURE':''));
 }
}
