// Preparation only: fixed requests and response-custody requirements. No AWS client.
import {sourceBucket,diagnosticKey,operatorArn,exactDiagnosticDeny} from './post-abort-contracts.mjs';
export function multipartPlan(base){
 const common={Bucket:sourceBucket,Key:diagnosticKey,ExpectedBucketOwner:'058264289478'};
 return {schemaVersion:'team-hub-owned-multipart-proof.v1',account:'058264289478',region:'eu-north-1',principal:operatorArn,
  phase:'SEPARATELY_AUTHORIZED_PRE_MAINTENANCE_ONLY',requiredAuthority:{mode:'LEGACY_WRITER',epoch:3,version:3},requiresFullWriterFenceAbsent:true,
  key:diagnosticKey,basePolicy:base,diagnosticPolicy:exactDiagnosticDeny(base),
  permittedOperations:['GetBucketPolicy','ListMultipartUploads','ListParts','HeadObject','CreateMultipartUpload','AbortMultipartUpload','PutBucketPolicy'],
  prohibitedOperations:['UploadPart','UploadPartCopy','CompleteMultipartUpload','PutObject','DeleteObject','DeleteObjectVersion','DeleteBucketPolicy','IAM','AuthorityUpdate'],
  steps:[
   {id:'ownership-preflight',writes:0,require:'Fresh RavenTest STS account/region; authority 3/3; exact baseline bucket-policy hash; no full fence; reserved object/versions/uploads absent; exclusive custody; retained trail healthy'},
   {id:'positive-create',api:'CreateMultipartUpload',input:{...common,ServerSideEncryption:'AES256',ContentType:'application/octet-stream',Metadata:{'team-hub-diagnostic':'owned-multipart-abort-precontrol'}},capture:'MPU_A only from unambiguous service UploadId and request ID; verify zero parts, exact Initiator and key'},
   {id:'positive-abort',api:'AbortMultipartUpload',input:{...common,UploadId:'SERVICE_RECEIPT_MPU_A'},expect:'204; verify ListParts NoSuchUpload and no exact upload in complete listing'},
   {id:'negative-create',api:'CreateMultipartUpload',input:{...common,ServerSideEncryption:'AES256',ContentType:'application/octet-stream',Metadata:{'team-hub-diagnostic':'owned-multipart-abort-denial'}},capture:'MPU_B only from unambiguous service UploadId and request ID; verify zero parts, exact Initiator and key'},
   {id:'diagnostic-deny-install',api:'PutBucketPolicy',input:{Bucket:sourceBucket,ExpectedBucketOwner:'058264289478',Policy:JSON.stringify(exactDiagnosticDeny(base))},require:'Fresh baseline policy matches; complete readback; forbid installation if full fence present'},
   {id:'owned-abort-denial',api:'AbortMultipartUpload',input:{...common,UploadId:'SERVICE_RECEIPT_MPU_B'},expect:'403 AccessDenied naming RavenTest, exact key, s3:AbortMultipartUpload and explicit resource-policy deny; MPU_B still exists with zero parts'},
   {id:'restore-own-diagnostic-policy',api:'PutBucketPolicy',input:{Bucket:sourceBucket,ExpectedBucketOwner:'058264289478',Policy:JSON.stringify(base)},require:'Only if installed policy still exactly equals this owned diagnostic policy; restore and read back baseline; full fence must still be absent'},
   {id:'terminal-abort',api:'AbortMultipartUpload',input:{...common,UploadId:'SERVICE_RECEIPT_MPU_B'},expect:'204; verify ListParts NoSuchUpload and no exact upload in complete listing'},
   {id:'audit-and-reconcile',writes:0,require:'Correlate creation/abort/denial requests to retained trail; no fixed delivery SLA; object remains absent; source data/authority unchanged; no owned pending upload or diagnostic deny remains; record complete hash receipts'}
  ],
  limits:{multipartUploadsCreated:2,partsUploaded:0,objectsCompleted:0,existingBucketPolicyMutations:2,newResources:0,newIamGrants:0,automaticWriteRetries:0},
  stop:'Ambiguous creation, ownership mismatch, parts/object appearance, policy drift, uncorrelated denial, failed cleanup or absent audit evidence stops all progression. Never adopt an unknown UploadId. A disappeared upload is not a successful denial.',
  recovery:'Read-only verification first; restore only the exact owned diagnostic policy if it is unchanged and no full fence exists. Abort only a captured verified owned zero-part upload. If ownership is ambiguous preserve it, report unresolved cleanup, and require review. No data deletion or lifecycle-rule patch.',
  amendmentRequired:true,finalFenceCriterion:'Source-bucket original-principal abort denial is accepted from this completed pre-maintenance diagnostic. During FROZEN require exact unmodified full-prefix policy hash including AbortMultipartUpload plus actual Put/Delete/DeleteVersion denials and complete original writer coverage. Do not label the pre-maintenance receipt a live final-prefix Abort receipt.'};
}
