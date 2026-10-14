// Read-only drain and quarantine observations. A timer is not a physical S3 revocation claim.
import fs from 'node:fs';import assert from 'node:assert/strict';import crypto from 'node:crypto';import {gunzipSync} from 'node:zlib';
import {fromIni} from '@aws-sdk/credential-providers';import {S3Client,ListObjectsV2Command,ListMultipartUploadsCommand,GetObjectCommand} from '@aws-sdk/client-s3';
import {aws} from '../team-hub-describekey-execution/aws.mjs';
const E='docs/architecture/team-hub-cursor-accepted-cutover-evidence-2026-10-14',account='058264289478',bucket='amplify-projectrespawnweb-projectrespawnstoragebuc-ketz6kwxegaw',audit='respawn-teamhub-quarantine-audit-058264289478-20261013';
const read=p=>JSON.parse(fs.readFileSync(p)),save=x=>fs.writeFileSync(E+'/drain-and-audit.json',JSON.stringify(x,null,2)+'\n');
const installed=read(E+'/fence-install.json');assert.equal(installed.complete,true);const window=read(E+'/window.json');
const r={at:new Date().toISOString(),observations:[],originalFunctions:[],audit:[],complete:false,physicalS3RevocationClaim:false,logicalQuarantine:true,rawEventsPersisted:false};
const expected=read(E+'/operator-fence-proof.json').requests.filter(x=>x.action.startsWith('s3:'));
assert.equal(expected.length,3);assert.ok(expected.every(x=>x.passed));
const sdk=new S3Client({region:'eu-north-1',credentials:fromIni({profile:'default'}),maxAttempts:1}),seen=new Set(),found=new Map();
const service=read('docs/architecture/team-hub-maintenance-preparation-evidence-2026-10-12/service-inspection.json');
for(const f of service.functions){
 const actual=await aws('lambda','get-function-configuration',{FunctionName:f.arn});assert.equal(actual.CodeSha256,f.codeSha256);assert.equal(actual.Role,f.role);assert.equal(actual.Timeout,f.timeout);
 try{
  const start=await aws('logs','filter-log-events',{logGroupName:f.logging.LogGroup,startTime:Date.parse(window.start)-900000,filterPattern:'"START RequestId"'}),terminal=await aws('logs','filter-log-events',{logGroupName:f.logging.LogGroup,startTime:Date.parse(window.start)-900000,filterPattern:'"REPORT RequestId"'});
  assert.ok(!start.nextToken&&!terminal.nextToken,'Incomplete original-function request census');const starts=(start.events??[]).map(x=>x.message.match(/START RequestId:\s*([^\s]+)/)?.[1]).filter(Boolean),reports=new Set((terminal.events??[]).map(x=>x.message.match(/REPORT RequestId:\s*([^\s]+)/)?.[1]).filter(Boolean));
  r.originalFunctions.push({name:f.name,timeout:actual.Timeout,started:starts.length,terminal:reports.size,unresolved:starts.filter(x=>!reports.has(x)),evidenceAvailable:true});assert.equal(r.originalFunctions.at(-1).unresolved.length,0,'Unresolved original-principal Lambda request');
 }catch(error){
  if(!/ResourceNotFoundException.*log group does not exist/.test(error.message))throw error;
  // Accepted security decision requires terminal evidence where available, not invented cleanup invocation receipts.
  r.originalFunctions.push({name:f.name,timeout:actual.Timeout,evidenceAvailable:false,reason:'LOG_GROUP_ABSENT_NOT_ACTIVITY_PROOF',acceptedCriterion:'Original-principal alternative plus exclusive control-plane custody',securityDecision:'docs/architecture/team-hub-2b6-original-principal-security-decision.md',directServiceRoleProofClaim:false});
 }
 save(r);
}
const earliest=Date.parse(installed.at)+1020000; // reviewed maximum provider envelope plus margin, supplemented by live census/fences/scans.
const deadline=Date.parse(window.end)-65*60000;
while(Date.now()<deadline){
 const began=Date.now();let objects=0,next;do{const q=await sdk.send(new ListObjectsV2Command({Bucket:bucket,Prefix:'team-logos/',...(next?{ContinuationToken:next}:{})}));objects+=(q.Contents??[]).length;next=q.NextContinuationToken;assert.ok(!q.IsTruncated||next);}while(next);
 const uploads=await sdk.send(new ListMultipartUploadsCommand({Bucket:bucket,Prefix:'team-logos/'}));assert.equal(uploads.IsTruncated,false);assert.equal(objects,0,'Unknown late object: preserve and hold reconciliation');assert.equal((uploads.Uploads??[]).length,0,'Pending multipart upload: hold');
 const alarms=(await aws('cloudwatch','describe-alarms',{AlarmNamePrefix:'ProjectRespawn-TeamHub-Ntgre'})).MetricAlarms;assert.equal(alarms.length,6);assert.ok(alarms.every(x=>x.StateValue==='OK'),'Monitoring alarm not OK');
 let token;do{const page=await sdk.send(new ListObjectsV2Command({Bucket:audit,Prefix:'AWSLogs/'+account+'/CloudTrail/eu-north-1/2026/10/14/',...(token?{ContinuationToken:token}:{})}));for(const object of page.Contents??[]){if(!object.Key.endsWith('.json.gz')||seen.has(object.Key))continue;const q=await sdk.send(new GetObjectCommand({Bucket:audit,Key:object.Key}));const bytes=Buffer.from(await q.Body.transformToByteArray());for(const event of JSON.parse(gunzipSync(bytes)).Records??[]){const wanted=expected.find(x=>x.requestId===event.requestID);if(wanted){assert.equal(event.requestParameters?.bucketName,bucket);assert.equal(event.userIdentity?.arn,'arn:aws:iam::'+account+':user/RavenTest');assert.ok(/AccessDenied/.test(event.errorCode??''));found.set(event.requestID,{requestId:event.requestID,eventName:event.eventName,errorCode:event.errorCode,eventTime:event.eventTime,logKey:object.Key,logSha256:crypto.createHash('sha256').update(bytes).digest('hex')});}}seen.add(object.Key);}token=page.NextContinuationToken;assert.ok(!page.IsTruncated||token);}while(token);
 r.audit=[...found.values()];r.observations.push({at:new Date().toISOString(),logos:objects,pendingUploads:0,alarms:'6_OK',matchedAudit:found.size,expectedAudit:3});r.lastObservation=new Date().toISOString();assert.ok(Date.now()-began<300000,'Evidence gap exceeds five minutes');save(r);
 console.log(JSON.stringify({drainPending:Date.now()<earliest,auditMatched:found.size,expected:3,logos:objects,alarms:'6_OK'}));
 if(Date.now()>=earliest&&found.size===3){r.complete=true;r.completedAt=new Date().toISOString();r.terminalEvidenceWhereAvailable=true;r.universalRequestCensusClaim=false;save(r);break;}
 await new Promise(resolve=>setTimeout(resolve,30000));
}
sdk.destroy();assert.equal(r.complete,true,'Drain or audit correlation incomplete: hold transfer');
