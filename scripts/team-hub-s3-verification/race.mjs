// Inert unless separately authorized through an exact receipt and --execute.
// No source-bucket policy, real authority or target business write is possible here.
import fs from 'node:fs';import https from 'node:https';import assert from 'node:assert/strict';
import {fromIni} from '@aws-sdk/credential-providers';import {S3Client,GetBucketPolicyCommand,PutBucketPolicyCommand,PutObjectCommand,GetObjectCommand,HeadObjectCommand,DeleteObjectCommand,ListObjectsV2Command,ListMultipartUploadsCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';import {aws} from '../team-hub-describekey-execution/aws.mjs';
import {reconcileObjects} from '../team-hub-maintenance-preparation/quarantine-model.mjs';
import {E,ACCOUNT,REGION,OWNER,RACE_BUCKET,KEY,digest,validateApproval,validateTerminal,validateOwnedBody,assertPinned} from './scope.mjs';
const original='docs/architecture/team-hub-maintenance-preparation-evidence-2026-10-12/s3-inflight-review-plan.json';
const canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort().map(([k,x])=>[k,x])):v);
async function run(receiptPath){
 const manifestBytes=fs.readFileSync(E+'/execution-manifest.json'),manifest=JSON.parse(manifestBytes);validateApproval(JSON.parse(fs.readFileSync(receiptPath)),manifestBytes);assertPinned(manifest);
 const id=await aws('sts','get-caller-identity');assert.equal(id.Account,ACCOUNT);assert.equal(id.Arn,OWNER);
 const plan=JSON.parse(fs.readFileSync(original)),s3=new S3Client({region:REGION,credentials:fromIni({profile:'default'}),maxAttempts:1});
 const input={Bucket:RACE_BUCKET,ExpectedBucketOwner:ACCOUNT};const live=JSON.parse((await s3.send(new GetBucketPolicyCommand(input))).Policy);assert.equal(canonical(live),canonical(plan.initialPolicy),'Unexpected isolated policy/custody');
 const initial=await s3.send(new ListObjectsV2Command({...input,MaxKeys:1000}));assert.ok(!initial.IsTruncated&&!initial.Contents?.length,'Isolated bucket must be empty');const multipart=await s3.send(new ListMultipartUploadsCommand({...input,MaxUploads:1000}));assert.ok(!multipart.IsTruncated&&!multipart.Uploads?.length);
 const body=Buffer.alloc(65536),put={Bucket:RACE_BUCKET,Key:KEY,ContentLength:body.length,ContentType:'application/octet-stream',ExpectedBucketOwner:ACCOUNT};
 const url=await getSignedUrl(s3,new PutObjectCommand({...put,Body:body}),{expiresIn:300}); // checksum binds the exact body; never persisted or printed
 const attempt=fs.openSync(E+'/live-race-attempt.json','wx');fs.writeFileSync(attempt,JSON.stringify({at:new Date().toISOString(),packageSha256:digest(manifestBytes),operator:OWNER,noAutomaticRetry:true})+'\n');fs.closeSync(attempt);
 const before=new Date().toISOString(),results=[];let request;
 const terminal=new Promise(resolve=>{let settled=false;const finish=x=>{if(!settled){settled=true;clearTimeout(timer);resolve(x);}};request=https.request(url,{method:'PUT',headers:{'content-length':String(body.length),'content-type':put.ContentType}},r=>{r.resume();r.on('end',()=>finish({status:r.statusCode,requestId:r.headers['x-amz-request-id'],classification:r.statusCode===200?'SUCCEEDED':r.statusCode===403?'DENIED':'OTHER',at:new Date().toISOString()}));});const timer=setTimeout(()=>{request.destroy();finish({classification:'UNKNOWN_DEADLINE',at:new Date().toISOString()});},180000);request.on('error',()=>finish({classification:'UNKNOWN_NETWORK',at:new Date().toISOString()}));});
 // Bytes sent locally are not a claim that AWS completed authorization at this point.
 try{
  await new Promise((resolve,reject)=>request.write(body.subarray(0,2048),e=>e?reject(e):resolve()));
  await s3.send(new PutBucketPolicyCommand({...input,Policy:JSON.stringify(plan.fencePolicy)}));
  assert.equal(canonical(JSON.parse((await s3.send(new GetBucketPolicyCommand(input))).Policy)),canonical(plan.fencePolicy));
  const denied=await fetch(url,{method:'PUT',headers:{'content-type':put.ContentType},body,redirect:'error',signal:AbortSignal.timeout(15000)});results.push({case:'PREISSUED_NOT_STARTED_AFTER_FENCE',status:denied.status,requestId:denied.headers.get('x-amz-request-id')});assert.equal(denied.status,403);assert.ok(results[0].requestId);
  request.end(body.subarray(2048));const outcome=await terminal;results.push({case:'HELD_STREAM_BEFORE_FENCE',...outcome});validateTerminal(outcome);
  let late=[];try{const head=await s3.send(new HeadObjectCommand({...input,Key:KEY}));late=[{key:KEY,etag:head.ETag,size:head.ContentLength,lastModified:head.LastModified.toISOString()}];}catch(e){if(e.$metadata?.httpStatusCode!==404)throw e;}
  if(outcome.classification==='SUCCEEDED')assert.equal(late.length,1);
  const observed=reconcileObjects([],late,{complete:true});
  if(outcome.classification==='DENIED'){
   // Separately labeled injection; never call this an observed late race completion.
   await s3.send(new PutBucketPolicyCommand({...input,Policy:JSON.stringify(plan.initialPolicy)}));
   const injected=await s3.send(new PutObjectCommand({...put,Body:body}));results.push({case:'SYNTHETIC_LATE_ARRIVAL_INJECTION_NOT_RACE_SUCCESS',requestId:injected.$metadata.requestId,status:200});
   const head=await s3.send(new HeadObjectCommand({...input,Key:KEY}));assert.equal(reconcileObjects([],[{key:KEY,etag:head.ETag,size:head.ContentLength,lastModified:head.LastModified.toISOString()}],{complete:true}).length,1);
  }
  const currentPolicy=JSON.parse((await s3.send(new GetBucketPolicyCommand(input))).Policy);assert.ok([canonical(plan.fencePolicy),canonical(plan.initialPolicy)].includes(canonical(currentPolicy)));
  await s3.send(new PutBucketPolicyCommand({...input,Policy:JSON.stringify(plan.initialPolicy)}));
  const object=await s3.send(new GetObjectCommand({...input,Key:KEY}));validateOwnedBody(Buffer.from(await object.Body.transformToByteArray()));
  const deletion=await s3.send(new DeleteObjectCommand({...input,Key:KEY}));results.push({case:'OWNED_CLEANUP_DELETE',status:deletion.$metadata.httpStatusCode,requestId:deletion.$metadata.requestId});
  const after=await s3.send(new ListObjectsV2Command({...input,MaxKeys:1000}));assert.ok(!after.IsTruncated&&!after.Contents?.length);
  const m=await s3.send(new ListMultipartUploadsCommand({...input,MaxUploads:1000}));assert.ok(!m.IsTruncated&&!m.Uploads?.length);
  const result={at:new Date().toISOString(),startedAt:before,results,observedQuarantine:observed,objectCleanup:true,resourceCleanupPending:true,sourceChanges:0,authorityChanges:0,urlsPersisted:false,associationProof:'Run pinned actual service/adapter offline suite and real source/target read-only preservation; no live TARGET_WRITER association test is claimed'};
  fs.writeFileSync(E+'/live-race-result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({terminal:true,objectCleanup:true,resourceCleanupPending:true}));
 }catch(e){request?.destroy();const outcome=await terminal;fs.writeFileSync(E+'/live-race-failure.json',JSON.stringify({at:new Date().toISOString(),error:e.name,message:'Stopped; no automatic race retry or unsafe deletion',results,outcome,needsOwnedCleanupReview:true},null,2)+'\n');throw Error('RACE_FAILED_SAFE_STOP');}
}
if(process.argv[2]==='--execute'){if(process.argv[3]!=='--approval'||!process.argv[4]||process.argv.length!==5)throw Error('EXACT_ARGUMENTS_REQUIRED');run(process.argv[4]).catch(()=>{console.error('RACE_EXECUTION_FAILED_PRESERVE_RECEIPTS_NO_RETRY');process.exitCode=1;});}
else if(process.argv.length>2)throw Error('PREPARATION_HAS_NO_EXECUTION_PERMISSION');
