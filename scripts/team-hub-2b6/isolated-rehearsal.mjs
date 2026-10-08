// Explicit isolated AWS rehearsal. Never imported by a deployed runtime.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fromIni} from '@aws-sdk/credential-providers';
import {DynamoDBClient,CreateTableCommand,DescribeTableCommand,DeleteTableCommand,waitUntilTableExists,waitUntilTableNotExists} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient,GetCommand,QueryCommand,TransactWriteCommand,PutCommand,ScanCommand,UpdateCommand} from '@aws-sdk/lib-dynamodb';
import {identity,targets} from '../team-hub-2b4b/preflight/common.mjs';
import {createCutoverHandler} from '../../domains/team-hub/cutover/handler.mjs';
import {operations} from '../../domains/team-hub/contracts.mjs';
import {decode} from '../../domains/team-hub/parity/codec.mjs';
import {nativeToLegacy,reconcileNative} from '../team-hub-migration/native-state.mjs';
import {environment,subjects,claims,now} from '../team-hub/tests/fixtures.mjs';
const E='docs/architecture/team-hub-2b6-evidence-2026-10-07/preparation';
assert.ok(process.argv.includes('--execute-isolated'), 'Explicit isolated-only execution flag required');
const prefix='ProjectRespawn-TeamHub-Ntgre-2B6-Rehearsal-20261007-';
const names=['Operational','Journal',...targets.map(t=>t.model)].map(s=>prefix+s);
const receipt={at:new Date().toISOString(),scope:'ISOLATED_SYNTHETIC_LOCAL_HANDLER_REAL_DYNAMODB',actualAuthorityChanged:false,core:'SYNTHETIC_LOCAL_TRANSPORT_ONLY; accepted live Core unchanged',created:[],checks:[],cleanup:[],passed:false};
const save=()=>fs.writeFileSync(E+'/rehearsal.json',JSON.stringify(receipt,null,2)+'\n');
const client=new DynamoDBClient({region:'eu-north-1',credentials:fromIni({profile:'default'}),maxAttempts:1});
const db=DynamoDBDocumentClient.from(client,{marshallOptions:{removeUndefinedValues:true}});
const guard=name=>{assert.ok(names.includes(name),'Outside disposable rehearsal tables');return name;};
const mapping=new Map(['Operational','Journal'].map(s=>['ProjectRespawn-TeamHub-Ntgre-'+s,prefix+s]));
const mapped=p=>({...p,TableName:guard(mapping.get(p.TableName))});
let freezeBeforeCommit=false;
async function freezeTestAuthority(){await db.send(new UpdateCommand({TableName:guard(prefix+'Journal'),Key:{PK:'CONTROL#AUTHORITY',SK:'STATE'},UpdateExpression:'SET #m = :f, epoch = :next, #v = :next, changedAt = :at',ConditionExpression:'#m = :t AND epoch = :old AND #v = :old',ExpressionAttributeNames:{'#m':'mode','#v':'version'},ExpressionAttributeValues:{':f':'FROZEN',':t':'TARGET_WRITER',':next':3,':old':2,':at':new Date().toISOString()}}));}
const transport={get:p=>db.send(new GetCommand(mapped(p))),query:p=>db.send(new QueryCommand(mapped(p))),transactWrite:async p=>{if(freezeBeforeCommit){freezeBeforeCommit=false;await freezeTestAuthority();}return db.send(new TransactWriteCommand({...p,TransactItems:p.TransactItems.map(x=>Object.fromEntries(Object.entries(x).map(([k,v])=>[k,mapped(v)])))}));}};
async function scan(name){let key,rows=[];do{const r=await db.send(new ScanCommand({TableName:guard(name),ConsistentRead:true,...(key?{ExclusiveStartKey:key}:{})}));rows.push(...r.Items??[]);key=r.LastEvaluatedKey;}while(key&&Object.keys(key).length);return rows;}
const invokeCore=async r=>r.contractVersion==='authorization.decision.v1'?{ok:true,data:{contractVersion:r.contractVersion,subject:subjects[r.accessToken],capability:r.capability,environment:'Ntgre',allowed:r.accessToken==='admin'&&r.capability==='teams.admin',decisionVersion:1,evaluatedAt:now,expiresAt:now+5}}:{ok:true,data:{contractVersion:r.contractVersion,subject:subjects[r.account.split('@')[0]],displayName:r.account.split('@')[0]}};
const handlers=Object.fromEntries(['command','read'].map(runtime=>[runtime,createCutoverHandler({runtime,transport,invokeCore,environment,cursorSecret:crypto.randomBytes(32).toString('hex'),clock:()=>now})]));
let expectedEpoch=2,sequence=0;
async function call(persona,op,request,status=200){const spec=operations[op],body={...request},pathParameters={};for(const m of spec.path.matchAll(/\{([^}]+)\}/g)){pathParameters[m[1]]=body[m[1]];delete body[m[1]];}
 const response=await handlers[spec.runtime]({routeKey:spec.method+' '+spec.path,pathParameters,headers:{authorization:'Bearer '+persona,...(expectedEpoch===undefined?{}:{'x-team-authority-epoch':String(expectedEpoch)})},...(spec.method==='GET'?{queryStringParameters:Object.fromEntries(Object.entries(body).map(([k,v])=>[k,String(v)]))}:{body:JSON.stringify(body)}),requestContext:{requestId:'isolated-2b5b-'+(++sequence),authorizer:{jwt:{claims:claims(persona)}}}});
 receipt.checks.push({operation:op,persona,status:response.statusCode,expected:status});save();assert.equal(response.statusCode,status,op+' '+JSON.parse(response.body).error?.code);return JSON.parse(response.body).data;
}
const id='team:rehearsal-2b5b',member=n=>'team-membership:'+id+':'+subjects[n];
async function concurrency(persona){const a=decode(await scan(prefix+'Operational'));return {teamId:id,idempotencyKey:'rehearsal-2b5b-'+(++sequence),expectedTeamVersion:a.team.version,expectedAuthorizationEpoch:a.team.authorizationEpoch,expectedMembershipVersion:a.memberships[member(persona)]?.version??0};}
await identity();fs.mkdirSync(E,{recursive:true});receipt.candidate=JSON.parse(fs.readFileSync('docs/architecture/team-hub-2b5b-evidence-2026-10-07/candidate.json')).runtimeSha256;
assert.equal(JSON.parse(fs.readFileSync('docs/architecture/team-hub-2b6-evidence-2026-10-07/inventory.json')).complete,true,'Fresh baseline must pass first');
for(const name of names){try{await client.send(new DescribeTableCommand({TableName:name}));throw Error('Rehearsal target already exists');}catch(e){if(e.name!=='ResourceNotFoundException')throw e;}}
try{
 for(const name of names){let schema={AttributeDefinitions:[{AttributeName:'PK',AttributeType:'S'},{AttributeName:'SK',AttributeType:'S'}],KeySchema:[{AttributeName:'PK',KeyType:'HASH'},{AttributeName:'SK',KeyType:'RANGE'}]};
  const source=targets.find(t=>name===prefix+t.model);if(source){const t=(await client.send(new DescribeTableCommand({TableName:source.sourceName}))).Table;assert.equal(t.TableArn,source.sourceArn);schema={AttributeDefinitions:t.AttributeDefinitions,KeySchema:t.KeySchema,...(t.GlobalSecondaryIndexes?.length?{GlobalSecondaryIndexes:t.GlobalSecondaryIndexes.map(g=>({IndexName:g.IndexName,KeySchema:g.KeySchema,Projection:g.Projection}))}:{}),...(t.LocalSecondaryIndexes?.length?{LocalSecondaryIndexes:t.LocalSecondaryIndexes.map(g=>({IndexName:g.IndexName,KeySchema:g.KeySchema,Projection:g.Projection}))}:{})};}
  const created=await client.send(new CreateTableCommand({TableName:guard(name),...schema,BillingMode:'PAY_PER_REQUEST',Tags:[{Key:'Purpose',Value:'TeamHub2B5BIsolatedRehearsal'},{Key:'Environment',Value:'Ntgre'}]}));
  receipt.created.push({name,arn:created.TableDescription.TableArn,tableId:created.TableDescription.TableId});save();await waitUntilTableExists({client,maxWaitTime:120,minDelay:2,maxDelay:5},{TableName:name});
  const t=(await client.send(new DescribeTableCommand({TableName:name}))).Table;Object.assign(receipt.created.at(-1),{tableId:t.TableId,arn:t.TableArn});save();
 }
 const control={PK:'CONTROL#AUTHORITY',SK:'STATE',schemaVersion:'team-hub-authority.v1',mode:'TARGET_WRITER',epoch:2,version:2,changedAt:new Date().toISOString(),changedBy:'ISOLATED_REHEARSAL',gateDigest:crypto.createHash('sha256').update('2B5B isolated only').digest('hex')};
 const probe={slug:'rehearsal-denied',name:'Must never persist',gameKey:'LEAGUE_OF_LEGENDS',idempotencyKey:'isolated-denial'};
 await call('admin','CREATE_TEAM',probe,503); // Missing authority must fail closed.
 for(const mode of ['LEGACY_WRITER','FROZEN']){
  await db.send(new PutCommand({TableName:guard(prefix+'Journal'),Item:{...control,mode}}));
  await call('admin','CREATE_TEAM',{...probe,slug:'phase2b4-test-abcdefgh-denied'},403);
 }
 await db.send(new PutCommand({TableName:guard(prefix+'Journal'),Item:{...control,epoch:0}}));
 await call('admin','CREATE_TEAM',probe,503);
 await db.send(new PutCommand({TableName:guard(prefix+'Journal'),Item:control}));
 for(const epoch of [undefined,1,3]){expectedEpoch=epoch;await call('admin','CREATE_TEAM',probe,409);}
 expectedEpoch=2;await call('player','CREATE_TEAM',{...probe,slug:'phase2b4-test-abcdefgh-denied'},403);
 assert.equal((await scan(prefix+'Operational')).length,0);
 assert.equal((await scan(prefix+'Journal')).length,1);
 receipt.authorityNegativeControls={missing:true,malformed:true,legacyWriter:true,frozen:true,missingEpoch:true,staleEpoch:true,futureEpoch:true,syntheticNameCannotBypass:true,noOperationalAuditOrIdempotencyWrites:true};
 await call('admin','CREATE_TEAM',{slug:id.slice(5),name:'Synthetic rollback rehearsal',gameKey:'LEAGUE_OF_LEGENDS',idempotencyKey:'rehearsal-create'});
 await call('admin','SET_MANAGER',{...await concurrency('admin'),action:'ASSIGN',targetAccount:'manager@example.invalid',expectedTargetMembershipVersion:0});
 for(const n of ['coach','player'])await call('manager','MANAGE_MEMBER',{...await concurrency('manager'),action:'ASSIGN',role:n.toUpperCase(),targetAccount:n+'@example.invalid',expectedTargetMembershipVersion:0});
 await call('admin','UPDATE_TEAM',{...await concurrency('admin'),name:'Synthetic updated rollback',status:'ACTIVE'});
 await call('admin','SET_TEAM_PLAN',{...await concurrency('admin'),plan:'PRO'});
 await call('manager','SET_ROSTER_SLOT',{...await concurrency('manager'),action:'ASSIGN',membershipId:member('player'),gameRoleKey:'MID',slotType:'STARTER',expectedRosterVersion:0,expectedTargetMembershipVersion:1});
 await call('player','UPSERT_MY_CHAMPION',{...await concurrency('player'),championId:'Ahri',gameRoleKey:'MID',comfortLevel:'A',priority:'HIGH',competitiveReady:true,playerNotes:'Synthetic',expectedEntryVersion:0});
 await call('coach','UPSERT_COACH_ASSESSMENT',{...await concurrency('coach'),membershipId:member('player'),championId:'Ahri',teamVisible:'Synthetic team-visible review',privateNote:'',expectedAssessmentVersion:0,expectedTargetMembershipVersion:1});
 const stale={...await concurrency('admin'),name:'Must not commit',status:'ACTIVE'};
 const beforeRows=await scan(prefix+'Operational'),beforeJournal=await scan(prefix+'Journal');
 freezeBeforeCommit=true;await call('admin','UPDATE_TEAM',stale,403);
 const sorted=rows=>JSON.stringify(rows.sort((a,b)=>(a.PK+'|'+a.SK).localeCompare(b.PK+'|'+b.SK)));
 assert.equal(sorted(await scan(prefix+'Operational')),sorted(beforeRows));assert.equal(sorted((await scan(prefix+'Journal')).filter(r=>r.PK!=='CONTROL#AUTHORITY')),sorted(beforeJournal.filter(r=>r.PK!=='CONTROL#AUTHORITY')));receipt.atomicFreezeRaceDenied=true;receipt.auditIdempotencyUnaffected=true;
 expectedEpoch=3;await call('admin','UPDATE_TEAM',stale,403);
 const exported=await scan(prefix+'Operational'),reverse=nativeToLegacy(exported),restored={};
 for(const [model,rows] of Object.entries(reverse.legacy)){for(const Item of rows)await db.send(new PutCommand({TableName:guard(prefix+model),Item,ConditionExpression:'attribute_not_exists(id)'}));const actual=await scan(prefix+model);assert.equal(actual.length,rows.length);assert.equal(new Set(actual.map(r=>r.id)).size,rows.length);restored[model]=rows.map(r=>actual.find(a=>a.id===r.id));}
 // Canonical codec compares complete mapped fields, including joins/settings/roles.
 assert.ok(reconcileNative(exported,restored));
 receipt.reverse=reverse.manifest;const exportedJournal=await scan(prefix+'Journal');receipt.journalRows=exportedJournal.length;receipt.journalDigest=crypto.createHash('sha256').update(sorted(exportedJournal)).digest('hex');receipt.nativeRows=exported.length;receipt.nativeDigest=crypto.createHash('sha256').update(sorted(exported)).digest('hex');receipt.export={operationalComplete:true,journalComplete:true,stronglyConsistent:true,paginatedToExhaustion:true,rawSyntheticDataPersisted:false};receipt.restoredCounts=Object.fromEntries(Object.entries(restored).map(([k,v])=>[k,v.length]));receipt.reconciled=true;receipt.syntheticAuthority='FROZEN';
}catch(e){receipt.error={name:e.name,message:String(e.message).slice(0,180)};save();throw e;}
finally{
 for(const created of [...receipt.created].reverse()){
  const t=(await client.send(new DescribeTableCommand({TableName:guard(created.name)}))).Table;assert.equal(t.TableArn,created.arn);assert.equal(t.TableId,created.tableId);
  await client.send(new DeleteTableCommand({TableName:guard(created.name)}));await waitUntilTableNotExists({client,maxWaitTime:120,minDelay:2,maxDelay:5},{TableName:created.name});receipt.cleanup.push({name:created.name,absent:true});save();
 }
 receipt.passed=receipt.reconciled===true&&receipt.cleanup.length===6&&!receipt.error;receipt.completedAt=new Date().toISOString();save();console.log(JSON.stringify(receipt));
}
