import fs from 'node:fs';
import assert from 'node:assert/strict';
import {DynamoDBClient,CreateTableCommand,DeleteTableCommand} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient,GetCommand,PutCommand,DeleteCommand,QueryCommand,ScanCommand,TransactWriteCommand} from '@aws-sdk/lib-dynamodb';
import {createCutoverHandler} from '../../domains/team-hub/business-runtime/handler.mjs';
import {operations} from '../../domains/team-hub/business-runtime/contracts.mjs';
import {environment,claims,subjects,now} from '../team-hub/tests/fixtures.mjs';
import {exercise} from '../team-hub-2b5/tests/sequence.mjs';
const E='docs/architecture/team-hub-business-runtime-evidence-2026-10-08';
assert.deepEqual(process.argv.slice(2),['--local-only']);
// Fixed loopback transport and dummy credentials: never resolve an AWS endpoint or profile.
const raw=new DynamoDBClient({endpoint:'http://127.0.0.1:18000',region:'local',credentials:{accessKeyId:'localtest',secretAccessKey:'localtest'},maxAttempts:1});
const data=DynamoDBDocumentClient.from(raw),journal='ProjectRespawn-TeamHub-Ntgre-Journal',operational='ProjectRespawn-TeamHub-Ntgre-Operational';
const results=[],created=[];let beforeWrite,transactions=0,revoked=false;
const control=()=>({PK:'CONTROL#AUTHORITY',SK:'STATE',schemaVersion:'team-hub-authority.v1',mode:'TARGET_WRITER',epoch:2,version:2,changedAt:'2026-10-08T00:00:00Z',changedBy:'isolated-local-test',gateDigest:'a'.repeat(64)});
const transport={get:p=>data.send(new GetCommand(p)),query:p=>data.send(new QueryCommand(p)),transactWrite:async p=>{if(beforeWrite){const f=beforeWrite;beforeWrite=null;await f();}transactions++;return data.send(new TransactWriteCommand(p));}};
const invokeCore=async r=>{if(r.contractVersion==='authorization.decision.v1')return {ok:true,data:{contractVersion:r.contractVersion,subject:subjects[r.accessToken],capability:r.capability,environment:'Ntgre',allowed:r.accessToken==='admin'&&!revoked&&r.capability==='teams.admin',decisionVersion:1,evaluatedAt:now,expiresAt:now+5}};if(r.action==='resolve'){const name=r.account.split('@')[0];return {ok:true,data:{contractVersion:r.contractVersion,subject:subjects[name],displayName:name}};}return {ok:true,data:{contractVersion:r.contractVersion,items:[]}};};
const logs=[],handlers=Object.fromEntries(['command','read'].map(runtime=>[runtime,createCutoverHandler({runtime,transport,invokeCore,environment,cursorSecret:'isolated-local-cursor-signing-material-123456',clock:()=>now,log:e=>logs.push(e)})]));
const call=async(persona,op,req,epoch='2')=>{const spec=operations[op],body={...req},pathParameters={};for(const m of spec.path.matchAll(/\{([^}]+)\}/g)){pathParameters[m[1]]=body[m[1]];delete body[m[1]];}const r=await handlers[spec.runtime]({routeKey:spec.method+' '+spec.path,pathParameters,headers:{authorization:'Bearer '+persona,'x-team-authority-epoch':epoch},...(spec.method==='GET'?{queryStringParameters:Object.fromEntries(Object.entries(body).map(([k,v])=>[k,String(v)]))}:{body:JSON.stringify(body)}),requestContext:{requestId:'isolated-local-proof',authorizer:{jwt:{claims:claims(persona)}}}});return {status:r.statusCode,body:JSON.parse(r.body)};};
const scan=async table=>(await data.send(new ScanCommand({TableName:table,ConsistentRead:true}))).Items;
const snapshot=async()=>({operational:(await scan(operational)).sort((a,b)=>(a.PK+a.SK).localeCompare(b.PK+b.SK)),journal:(await scan(journal)).filter(r=>r.PK!=='CONTROL#AUTHORITY').sort((a,b)=>(a.PK+a.SK).localeCompare(b.PK+b.SK))});
const seed=async row=>data.send(new PutCommand({TableName:journal,Item:row}));
const clear=async()=>{for(const t of [operational,journal])for(const r of await scan(t))await data.send(new DeleteCommand({TableName:t,Key:{PK:r.PK,SK:r.SK}}));await seed(control());revoked=false;beforeWrite=null;};
const check=async(name,fn)=>{await fn();results.push({name,passed:true});console.log('PASS '+name);};
const create={slug:'local-team',name:'Local transaction proof',gameKey:'LEAGUE_OF_LEGENDS',idempotencyKey:'local-create'};
try{
 for(const TableName of [operational,journal]){await raw.send(new CreateTableCommand({TableName,BillingMode:'PAY_PER_REQUEST',KeySchema:[{AttributeName:'PK',KeyType:'HASH'},{AttributeName:'SK',KeyType:'RANGE'}],AttributeDefinitions:[{AttributeName:'PK',AttributeType:'S'},{AttributeName:'SK',AttributeType:'S'}]}));created.push(TableName);}
 await seed(control());
 await check('41 real-engine mutation/privacy/concurrency assertions',async()=>{const mapped=Object.fromEntries(Object.entries(subjects).map(([k,subject])=>[k,{subject}]));const r=await exercise({call,snapshot,subjects:mapped,runId:'b4b20261006'});assert.equal(r.complete,true);assert.equal(r.results.length,41);});
 for(const mode of ['LEGACY_WRITER','FROZEN'])await check(mode+' denies without transaction',async()=>{await clear();await seed({...control(),mode});const n=transactions;assert.equal((await call('admin','CREATE_TEAM',create)).status,403);assert.equal(transactions,n);assert.equal((await scan(operational)).length,0);});
 await check('missing authority fails closed',async()=>{await clear();await data.send(new DeleteCommand({TableName:journal,Key:{PK:'CONTROL#AUTHORITY',SK:'STATE'}}));assert.equal((await call('admin','CREATE_TEAM',create)).status,503);assert.equal((await scan(operational)).length,0);});
 await check('stale and missing client epochs fail closed',async()=>{await clear();for(const e of ['1',''])assert.equal((await call('admin','CREATE_TEAM',create,e)).status,409);assert.equal((await scan(operational)).length,0);});
 await check('freeze immediately before transaction cancels every write',async()=>{await clear();beforeWrite=()=>seed({...control(),mode:'FROZEN',version:3});assert.equal((await call('admin','CREATE_TEAM',create)).status,403);assert.equal((await scan(operational)).length,0);assert.equal((await scan(journal)).length,1);});
 await check('epoch change immediately before transaction cancels every write',async()=>{await clear();beforeWrite=()=>seed({...control(),epoch:3,version:3});assert.equal((await call('admin','CREATE_TEAM',create)).status,409);assert.equal((await scan(operational)).length,0);assert.equal((await scan(journal)).length,1);});
 await check('idempotent replay preserves business/audit counts and revoked admin denied',async()=>{await clear();assert.equal((await call('admin','CREATE_TEAM',create)).status,200);const first=await snapshot();assert.equal((await call('admin','CREATE_TEAM',create)).status,200);assert.deepEqual(await snapshot(),first);revoked=true;assert.equal((await call('admin','CREATE_TEAM',create)).status,403);assert.deepEqual(await snapshot(),first);});
}finally{for(const TableName of created)await raw.send(new DeleteTableCommand({TableName}));raw.destroy();fs.writeFileSync(E+'/local-transactions.json',JSON.stringify({at:new Date().toISOString(),engine:'Amazon DynamoDB Local',imageDigest:'sha256:ff89bd48ff32cd8d9be5fee8873b65b8854dc408f1afe881be6eb00247bc0dab',endpoint:'loopback only',awsWrites:0,liveAwsProof:false,core:'isolated contract fixture; not live Core acceptance',results,transactions,cleanup:'local tables deleted',complete:results.length===8},null,2)+'\n');}
