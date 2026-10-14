import assert from 'node:assert/strict';
export const sourceBucket='amplify-projectrespawnweb-projectrespawnstoragebuc-ketz6kwxegaw';
export const diagnosticKey='team-logos/__team_hub_fence_20261012_5dc9b3484c16415fa3dfc740/absent.png';
export const operatorArn='arn:aws:iam::058264289478:user/RavenTest';
export function nextAuthority(row,next){
 assert.equal(row.schemaVersion,'team-hub-authority.v1');
 assert(Number.isSafeInteger(row.epoch)&&row.epoch>0&&row.epoch<Number.MAX_SAFE_INTEGER);
 assert(Number.isSafeInteger(row.version)&&row.version>0&&row.version<Number.MAX_SAFE_INTEGER);
 assert(/^[a-f0-9]{64}$/.test(row.gateDigest));
 assert(row.mode==='LEGACY_WRITER'||row.mode==='FROZEN'||row.mode==='TARGET_WRITER');
 assert(row.mode==='FROZEN'?['TARGET_WRITER','LEGACY_WRITER'].includes(next):next==='FROZEN');
 return {expected:{mode:row.mode,epoch:row.epoch,version:row.version,gateDigest:row.gateDigest},next:{...row,mode:next,epoch:row.epoch+1,version:row.version+1}};
}
export function authorityUpdateRequest(row,next,{expected,gateDigest,changedAt,changedBy}){
 assert.equal(row.mode,expected.mode);assert.equal(row.epoch,expected.epoch);assert.equal(row.version,expected.version);assert.equal(row.gateDigest,expected.gateDigest);
 assert(/^[a-f0-9]{64}$/.test(gateDigest));assert.equal(changedBy,operatorArn);assert(Number.isFinite(Date.parse(changedAt)));assert(changedAt.endsWith('Z'));
 const transition=nextAuthority(row,next);
 return {TableName:'ProjectRespawn-TeamHub-Ntgre-Journal',Key:{PK:{S:'CONTROL#AUTHORITY'},SK:{S:'STATE'}},
  UpdateExpression:'SET #mode = :next, #epoch = :nextEpoch, #version = :nextVersion, changedAt = :at, changedBy = :by, gateDigest = :digest',
  ConditionExpression:'#schema = :schema AND #mode = :priorMode AND #epoch = :priorEpoch AND #version = :priorVersion AND gateDigest = :priorDigest',
  ExpressionAttributeNames:{'#mode':'mode','#epoch':'epoch','#version':'version','#schema':'schemaVersion'},
  ExpressionAttributeValues:{':schema':{S:row.schemaVersion},':next':{S:next},':nextEpoch':{N:String(transition.next.epoch)},':nextVersion':{N:String(transition.next.version)},':priorMode':{S:row.mode},':priorEpoch':{N:String(row.epoch)},':priorVersion':{N:String(row.version)},':priorDigest':{S:row.gateDigest},':digest':{S:gateDigest},':at':{S:changedAt},':by':{S:changedBy}},ReturnValues:'ALL_NEW'};
}
export function assertOwnedUpload(receipt,current){
 assert.equal(receipt.bucket,sourceBucket);assert.equal(receipt.key,diagnosticKey);
 assert.equal(receipt.principal,operatorArn);assert.equal(receipt.account,'058264289478');
 assert.equal(receipt.region,'eu-north-1');assert(receipt.uploadId&&receipt.creationRequestId);
 assert.equal(receipt.ambiguous,false);assert.equal(current.uploadId,receipt.uploadId);
 assert.equal(current.bucket,receipt.bucket);assert.equal(current.key,receipt.key);
 assert.equal(current.initiatorPrincipalId,receipt.initiatorPrincipalId);assert(receipt.initiatorPrincipalId);
 assert.equal(current.parts.length,0);assert.equal(current.isTruncated,false);assert.equal(current.completedObjectExists,false);
 return true;
}
export function exactDiagnosticDeny(base){
 assert(!base.Statement.some(s=>s.Sid==='TeamHubMigrationLogoFence'||s.Sid==='TeamHubOwnedMultipartAbortProof'));
 return {...base,Statement:[...base.Statement,{Sid:'TeamHubOwnedMultipartAbortProof',Effect:'Deny',Principal:'*',Action:['s3:AbortMultipartUpload'],Resource:'arn:aws:s3:::'+sourceBucket+'/'+diagnosticKey}]};
}
export function requireOwnedAbortDenial(receipt,owned){
 assert.equal(receipt.uploadId,owned.uploadId);assert.equal(receipt.status,403);assert.equal(receipt.error,'AccessDenied');assert(receipt.requestId);
 assert(receipt.message.includes(operatorArn));assert(receipt.message.includes('s3:AbortMultipartUpload'));
 assert(receipt.message.includes('arn:aws:s3:::'+sourceBucket+'/'+diagnosticKey));
 assert(/explicit deny.*resource[- ]based policy/i.test(receipt.message));
 assert.equal(receipt.ownedUploadStillExists,true);return true;
}
