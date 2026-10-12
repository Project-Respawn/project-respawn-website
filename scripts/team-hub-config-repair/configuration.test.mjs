import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {read,sha,save} from './aws.mjs';
import {claims} from '../team-hub/tests/fixtures.mjs';
import {operations} from '../../domains/team-hub/business-runtime/contracts.mjs';
const base='docs/architecture/team-hub-config-repair-evidence-2026-10-09',manifest=read(base+'/artifact-manifest.json'),pin=read(base+'/candidate.json'),product=read(base+'/product.template.json'),inspection=read(base+'/inspection.json');
for(const f of manifest.artifacts)assert.equal(sha(f.path),f.sha256);
const index=fs.readFileSync('.tmp/team-hub-business-runtime/index.js');
assert.ok(fs.readFileSync(manifest.preservedRoot+'/runtime.zip').includes(index));
fs.mkdirSync('.tmp/team-hub-config-repair',{recursive:true});
const bundle=process.cwd()+'/.tmp/team-hub-config-repair/pinned.cjs';fs.writeFileSync(bundle,index);
const evidence=[];
const deployedRoutes=Object.values(product.Resources).filter(r=>r.Type==='AWS::ApiGatewayV2::Route').map(r=>r.Properties.RouteKey).filter(r=>!['GET /v1/authority','GET /v1/team-hub/preview'].includes(r));
assert.equal(deployedRoutes.length,16);
assert.ok(deployedRoutes.every(route=>Object.values(operations).some(op=>op.method+' '+op.path===route)));
async function run(kind,variables,routes){
 let calls=0;const errors=[];
 const server=http.createServer(async(req,res)=>{try{
  assert.equal(req.headers['x-amz-target'],'DynamoDB_20120810.GetItem');let body='';for await(const b of req)body+=b;
  assert.deepEqual(JSON.parse(body),{TableName:'ProjectRespawn-TeamHub-Ntgre-Journal',Key:{PK:{S:'CONTROL#AUTHORITY'},SK:{S:'STATE'}},ConsistentRead:true});calls++;
  res.setHeader('Content-Type','application/x-amz-json-1.0');res.end(JSON.stringify({Item:inspection.authority}));
 }catch(e){errors.push(e.message);res.statusCode=500;res.end('{}');}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const endpoint='http://127.0.0.1:'+server.address().port;
 const env={...process.env,AWS_ENDPOINT_URL:endpoint,AWS_ENDPOINT_URL_DYNAMODB:endpoint,AWS_ENDPOINT_URL_LAMBDA:endpoint,AWS_ENDPOINT_URL_SECRETS_MANAGER:endpoint,AWS_ACCESS_KEY_ID:'LOCAL_TEST_ONLY',AWS_SECRET_ACCESS_KEY:'LOCAL_TEST_ONLY',AWS_EC2_METADATA_DISABLED:'true'};
 for(const k of [...Object.keys(product.Resources.ParityReadFunction.Properties.Environment.Variables),'AWS_SESSION_TOKEN','AWS_PROFILE','AWS_DEFAULT_PROFILE'])delete env[k];
 Object.assign(env,variables);
 const event={headers:{authorization:'Bearer local-fixture'},requestContext:{requestId:'configuration-proof',authorizer:{jwt:{claims:{...claims('admin'),exp:Math.floor(Date.now()/1000)+300}}}}};
 const source=`const {handler}=require(${JSON.stringify(bundle)});(async()=>{const result=[];for(const routeKey of ${JSON.stringify(routes)})result.push(await handler({...${JSON.stringify(event)},routeKey}));console.log('RESULT:'+JSON.stringify(result));})().catch(()=>process.exitCode=1);`;
 let child;try{
 const out=await new Promise((resolve,reject)=>{child=spawn(process.execPath,['-e',source],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);const timer=setTimeout(()=>{child.kill();reject(Error('TIMEOUT'));},30000);child.on('error',reject);child.on('close',code=>{clearTimeout(timer);resolve({code,stdout,stderr});});});
 assert.equal(out.code,0,out.stderr);assert.deepEqual(errors,[]);assert.doesNotMatch(out.stdout,/Bearer local-fixture|gateDigest|changedBy/);
 return {responses:JSON.parse(out.stdout.split('\n').find(x=>x.startsWith('RESULT:')).slice(7)),metrics:out.stdout.split('\n').filter(x=>x.startsWith('{')).map(x=>JSON.parse(x)),calls};
 }finally{child?.kill();server.closeAllConnections();await new Promise(r=>server.close(r));}
}
for(const kind of ['Read','Command']){
 const vars=structuredClone(product.Resources['Parity'+kind+'Function'].Properties.Environment.Variables);
 if(kind==='Read')vars.TEAM_CURSOR_SECRET_ARN=inspection.secret.ARN;
 const routes=Object.values(operations).filter(x=>x.runtime===kind.toLowerCase()).map(x=>x.method+' '+x.path);
 test(kind+': installed configuration reproduces fail-closed dependency 503 before AWS I/O',async()=>{
  const r=await run(kind,inspection.functions.find(f=>f.kind===kind).installedEnvironment,[kind==='Read'?'GET /v1/authority':routes[0]]);
  assert.equal(r.responses[0].statusCode,503);assert.equal(JSON.parse(r.responses[0].body).error.code,'DEPENDENCY_UNAVAILABLE');assert.equal(r.calls,0);assert.equal(r.metrics.reduce((n,x)=>n+(x.DependencyFailures??0),0),1);
 });
 test(kind+': candidate environment preserves Legacy denial for every business route',async()=>{
  const r=await run(kind,vars,routes);assert.ok(r.responses.every(x=>x.statusCode===403));assert.equal(r.calls,routes.length);
  assert.equal(r.metrics.reduce((n,x)=>n+(x.WriterNotAuthoritative??0),0),routes.length);
  evidence.push({kind,routes:routes.length,deployedRoutes:routes.filter(r=>deployedRoutes.includes(r)).length,additionalUnpublishedContractRoutes:routes.filter(r=>!deployedRoutes.includes(r)).length,status:403,onlyAuthorityGetItem:true,coreCalls:0,secretCalls:0,businessWrites:0});save('configuration-proof',{runtimeSha256:pin.runtimeSha256,evidence,offlineOnly:true,awsWrites:0});
 });
 for(const key of ['CORE_ENVIRONMENT','TEAM_HUB_BUSINESS_RUNTIME'])test(kind+': missing '+key+' fails closed',async()=>{
  const bad={...vars};delete bad[key];const r=await run(kind,bad,[routes[0]]);assert.equal(r.responses[0].statusCode,503);assert.equal(r.calls,0);
 });
 test(kind+': wrong Core environment fails closed',async()=>{const bad={...vars,CORE_ENVIRONMENT:JSON.stringify({...JSON.parse(vars.CORE_ENVIRONMENT),environment:'production'})};const r=await run(kind,bad,[routes[0]]);assert.equal(r.responses[0].statusCode,503);assert.equal(r.calls,0);});
 if(kind==='Read')test('Read: authority 200 exposes exact real-record contract, lazy cursor remains unused',async()=>{
  const bad={...vars};delete bad.TEAM_CURSOR_SECRET_ARN;delete bad.CORE_CONTRACT_ARN;
  const r=await run(kind,bad,['GET /v1/authority']);assert.equal(r.responses[0].statusCode,200);const body=JSON.parse(r.responses[0].body);assert.equal(body.mode,'LEGACY_WRITER');assert.equal(body.epoch,1);assert.equal(body.version,1);assert.equal(r.calls,1);assert.equal(r.metrics.reduce((n,x)=>n+(x.DependencyFailures??0),0),0);
 });
}
