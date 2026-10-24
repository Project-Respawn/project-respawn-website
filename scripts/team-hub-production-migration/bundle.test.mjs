import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {marshall}=createRequire(require.resolve('@aws-sdk/lib-dynamodb'))('@aws-sdk/util-dynamodb');
const root='docs/architecture/team-hub-production-migration-2026-10-24/runtime-candidate';
const manifest=JSON.parse(fs.readFileSync(root+'/candidate.json'));
const product=JSON.parse(fs.readFileSync(manifest.product.path));

test('exact ZIP: authority contract and all nineteen business routes fail closed before cutover',async()=>{
 const zip=fs.readFileSync(manifest.runtime.path);
 assert.equal(zip.readUInt16LE(8),0,'expected stored ZIP entry');
 const size=zip.readUInt32LE(18),start=30+zip.readUInt16LE(26)+zip.readUInt16LE(28);
 const bundle=path.resolve('.tmp/team-hub-production-migration-bundle.cjs');
 fs.writeFileSync(bundle,zip.subarray(start,start+size));
 const calls=[],sockets=new Set();let mode='LEGACY_WRITER';
 const server=http.createServer(async(req,res)=>{
  let body='';for await(const part of req)body+=part;
  const input=JSON.parse(body),target=req.headers['x-amz-target'];calls.push({target,input});
  res.setHeader('content-type','application/x-amz-json-1.0');
  if(target!=='DynamoDB_20120810.GetItem'){res.statusCode=500;return res.end('{}');}
  res.end(JSON.stringify({Item:marshall({PK:'CONTROL#AUTHORITY',SK:'STATE',schemaVersion:'team-hub-authority.v1',mode,epoch:1,version:1,changedAt:'2026-10-24T00:00:00.000Z',changedBy:'offline-proof',gateDigest:'a'.repeat(64)})}));
 });
 server.on('connection',s=>{sockets.add(s);s.on('close',()=>sockets.delete(s));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const endpoint='http://127.0.0.1:'+server.address().port;
 const routeResources=Object.values(product.Resources).filter(r=>r.Type==='AWS::ApiGatewayV2::Route');
 const routes=routeResources.map(r=>r.Properties.RouteKey);
 const routeRuntime=routeKey=>JSON.stringify(routeResources.find(r=>r.Properties.RouteKey===routeKey).Properties.Target).includes('ParityReadIntegration')?'read':'command';
 const base={headers:{authorization:'Bearer OFFLINE_ONLY','x-team-authority-epoch':'1'},requestContext:{requestId:'offline-compiled-proof',authorizer:{jwt:{claims:{iss:manifest.environment.issuer,client_id:manifest.environment.clientId,token_use:'access',sub:'00000000-0000-0000-0000-000000000001',exp:Math.floor(Date.now()/1000)+3600}}}}};
 async function run(runtime,events,overrides={}){
  const env=Object.fromEntries(Object.entries(process.env).filter(([k])=>!k.startsWith('AWS_')));
  Object.assign(env,product.Resources[runtime==='read'?'ParityReadFunction':'ParityCommandFunction'].Properties.Environment.Variables,{AWS_ENDPOINT_URL:endpoint,AWS_ENDPOINT_URL_DYNAMODB:endpoint,AWS_ENDPOINT_URL_LAMBDA:endpoint,AWS_ENDPOINT_URL_SECRETS_MANAGER:endpoint,AWS_ACCESS_KEY_ID:'OFFLINE_TEST_ONLY',AWS_SECRET_ACCESS_KEY:'OFFLINE_TEST_ONLY',AWS_EC2_METADATA_DISABLED:'true',TEAM_CURSOR_SECRET_ARN:'arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-TeamHub-Production-Cursor-abcdef'},overrides);
  return new Promise((resolve,reject)=>{
   const child=spawn(process.execPath,['-e',`(async()=>{const h=require(${JSON.stringify(bundle)}).handler;const rows=[];for(const e of ${JSON.stringify(events)})rows.push(await h(e));console.log('RESULT:'+JSON.stringify(rows));})().catch(e=>{console.error(e);process.exitCode=1;});`],{env,windowsHide:true});
   let output='';child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
   const timeout=setTimeout(()=>{child.kill();reject(Error('OFFLINE_BUNDLE_TIMEOUT'));},60000);
   child.on('error',reject);child.on('close',code=>{clearTimeout(timeout);try{assert.equal(code,0,output);assert(!output.includes('Bearer OFFLINE_ONLY'));const row=output.split('\n').find(x=>x.startsWith('RESULT:'));assert(row,output);resolve(JSON.parse(row.slice(7)));}catch(error){reject(error);}});
  });
 }
 try{
  const business=routes.filter(r=>r!=='GET /v1/authority');assert.equal(business.length,19);
  for(const state of ['LEGACY_WRITER','FROZEN']){
   mode=state;
   for(const runtime of ['read','command']){
    const selected=business.filter(r=>routeRuntime(r)===runtime);
    const responses=await run(runtime,selected.map(routeKey=>({...base,routeKey})));
    for(let i=0;i<responses.length;i++){assert.equal(responses[i].statusCode,403,state+' '+selected[i]);assert.equal(JSON.parse(responses[i].body).error.code,'FORBIDDEN');}
   }
  }
  mode='LEGACY_WRITER';
  const [status]=await run('read',[{...base,routeKey:'GET /v1/authority'}]);assert.equal(status.statusCode,200);assert.equal(JSON.parse(status.body).epoch,1);
  const n=calls.length;const [bad]=await run('read',[{...base,routeKey:'GET /v1/authority'}],{CORE_ENVIRONMENT:'{}'});assert.equal(bad.statusCode,503);assert.equal(calls.length,n);
  assert(calls.length>=39);
  assert(calls.every(c=>c.target==='DynamoDB_20120810.GetItem'&&c.input.TableName==='ProjectRespawn-TeamHub-Production-Journal'&&c.input.ConsistentRead===true));
 }finally{for(const socket of sockets)socket.destroy();await new Promise(r=>server.close(r));}
});
