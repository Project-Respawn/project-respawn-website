import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {read,save,dir,prior} from './read-aws.mjs';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const manifest=read(prior+'/manifest.json'),inventory=read(prior+'/inventory.json');
assert.equal(manifest.revision,'7e3f27a0191d5039f3035a4fddd0e14f10eb9c56fd41a8a13092ca5b4d14768b');
for(const f of manifest.files)assert.equal(hash(f.path),f.sha256,f.path);
const receipt=read('infrastructure/domains/team-hub/.build/offline-1791205212119/receipt.json');
for(const f of [...receipt.inputs,...receipt.templates,...receipt.closure.flatMap(c=>c.outputs)])assert.equal(hash(f.path),f.sha256,f.path);
const policies={bootstrap:read(prior+'/first-create-policy.json'),steady:read(prior+'/steady-state-fixture-policy.json'),caller:read(prior+'/deployment-caller-policy.json')};
const arr=v=>Array.isArray(v)?v:[v];
const match=(pattern,value,ignoreCase=false)=>new RegExp('^'+pattern.replace(/[.+^${}()|[\]\\]/g,'\\$&').replaceAll('*','.*').replaceAll('?','.')+'$',ignoreCase?'i':'').test(value);
function decision(policy,action,resource,ctx){
 const matched=policy.Statement.filter(s=>{
  if(s.Action&&!arr(s.Action).some(p=>match(p,action,true)))return false;
  if(s.NotAction&&arr(s.NotAction).some(p=>match(p,action,true)))return false;
  if(s.Resource&&!arr(s.Resource).some(p=>match(p,resource)))return false;
  if(s.NotResource&&arr(s.NotResource).some(p=>match(p,resource)))return false;
  return Object.entries(s.Condition??{}).every(([op,values])=>Object.entries(values).every(([key,value])=>{
   const actual=ctx[key];if(actual===undefined)throw Error('Missing independent evaluator context '+key);
   if(op==='StringEquals'||op==='ArnEquals')return arr(value).includes(actual);
   if(op==='StringNotEquals')return !arr(value).includes(actual);
   if(op==='DateLessThan')return Date.parse(actual)<Date.parse(value);
   if(op==='DateGreaterThanEquals')return Date.parse(actual)>=Date.parse(value);
   throw Error('Unsupported independent evaluator condition '+op);
  }));
 });
 return {decision:matched.some(s=>s.Effect==='Deny')?'explicitDeny':matched.some(s=>s.Effect==='Allow')?'allowed':'implicitDeny',matchingEffects:matched.map(s=>s.Effect)};
}
const classification=read(dir+'/classification.json');assert.equal(classification.counts.UNKNOWN,0);
const semanticCases=classification.cases.map(r=>{
 const request=read(prior+'/request-'+r.sourceJob+'.json');const ctx=Object.fromEntries(request.ContextEntries.map(x=>[x.ContextKeyName,x.ContextKeyValues[0]]));
 const policy=policies[r.sourceJob.startsWith('bootstrap')?'bootstrap':r.sourceJob.startsWith('steady')?'steady':'caller'];
 const evaluated=decision(policy,r.iamAction,r.resourcePath,ctx);
 const expected=r.sourceJob.endsWith('-lifecycle')?'allowed':'explicitDeny';
 assert.equal(evaluated.decision,expected,'Independent semantics '+r.caseId);
 return {caseId:r.caseId,expected,...evaluated,evidenceLevel:'Document semantics independently evaluated; NOT a successful AWS simulator or live request'};
});
save('independent-semantics',{at:new Date().toISOString(),assertions:semanticCases.length,passed:semanticCases.length,cases:semanticCases});
const original=read(prior+'/validation.json');
const protection=inventory.apis.map(a=>{
 const jobs=['bootstrap','steady'].map(p=>original.results.find(j=>j.name===p+'-protected-'+a.id));
 assert.ok(jobs.every(j=>j&&!j.failures.length&&j.proven===32));
 const cases=classification.cases.filter(r=>r.apiId===a.id&&r.protectedNegative);
 assert.ok(cases.every(r=>semanticCases.find(s=>s.caseId===r.caseId).decision==='explicitDeny'));
 return {apiId:a.id,owner:a.owner,classification:a.classification,ordinaryUpdate:'DENIED',delete:'DENIED',applicableMutation:'DENIED',evidence:['Explicit apigateway:* Deny matching the API ID in all resource paths, in identity AND boundary','64 supported simulator action/resource negatives across both states','16 unsupported tag representations independently evaluated as explicit Deny'],unsupportedIsNotPermissionFailure:true};
});save('protected-api-proof',{count:protection.length,apis:protection});
const successPath='docs/architecture/phase2a-tournament-kms-correction-evidence-2026-10-04/successful-deployment-events.json';
const pastPath='docs/architecture/phase2a-tournament-practical-iam-evidence-2026-10-04/events.json';
const success=read(successPath).events,past=read(pastPath);
const eventRow=(e,path)=>({eventId:e.EventId,logicalId:e.LogicalResourceId,type:e.ResourceType,status:e.ResourceStatus,at:e.Timestamp,reason:e.ResourceStatusReason,evidence:path});
save('tournament-comparison',{equivalentCreate:success.filter(e=>e.ResourceType?.startsWith('AWS::ApiGatewayV2::')&&e.ResourceStatus==='CREATE_COMPLETE').map(e=>eventRow(e,successPath)),equivalentCleanup:past.filter(e=>e.ResourceType?.startsWith('AWS::ApiGatewayV2::')&&e.ResourceStatus==='DELETE_COMPLETE').map(e=>eventRow(e,pastPath)),taggingFailureThenSuccess:past.filter(e=>e.ResourceType==='AWS::ApiGatewayV2::Stage'&&e.ResourceStatus==='CREATE_FAILED').map(e=>eventRow(e,pastPath)),nonEquivalent:['Tournament HttpApi already existed and was imported; accepted October 4 deployment does not prove fresh CloudFormation CreateApi','Exact HTTP paths, API IDs, policies, names and Team JWT route differ','No individual successful TagResource/UntagResource CloudTrail event is inferred from resource completion; successful Stage create demonstrates the integrated lifecycle','Neither template uses REST APIs, custom API credentials roles or imported OpenAPI S3 bodies'],apiCreateEvidence:['Current AWS::ApiGatewayV2::Api provider create permissions','Supported first-create POST /apis simulator allow','Regional apigateway:* Allow document semantics before expiry']});
const product=read(manifest.productTemplate.path);
const schemas=Object.fromEntries([...new Set(Object.values(product.Resources).map(r=>r.Type))].map(t=>[t,read(dir+'/schema-'+t.replaceAll('::','-')+'.json').Schema]));
const optionalNotes={
 'AWS::ApiGatewayV2::Api':['s3:GetObject is conditional on BodyS3Location; absent in this template. Inline import Body also absent.','GET/POST/PUT/PATCH/DELETE covered by first-create apigateway:*; API/Stage tagging and system tags are included.'],
 'AWS::ApiGatewayV2::Authorizer':['iam:PassRole is conditional on AuthorizerCredentialsArn; absent for this JWT authorizer.'],
 'AWS::ApiGatewayV2::Integration':['iam:PassRole is conditional on CredentialsArn; absent. Lambda uses resource-based invocation permission.'],
 'AWS::ApiGatewayV2::Stage':['Schema names TagResource/UntagResource: record as provider operation annotations, NOT newly valid IAM actions. Translate via AWS service authorization verbs; existing apigateway:* covers the service lifecycle.'],
 'AWS::IAM::Role':['No ManagedPolicyArns, so AttachRolePolicy/DetachRolePolicy not required. Boundary is supplied in CreateRole; standalone boundary alteration remains denied. Inline OwnLogsOnly policy requires DeleteRolePolicy before DeleteRole.'],
 'AWS::Lambda::Function':['ZIP from exact existing S3 object; no VPC, EFS, layers, signing, provisioned capacity or concurrency configuration. Broad provider optional-feature permissions do not authorize those features.','Default encryption is not disabled by absence of KmsKeyArn. Tournament CloudTrail proves execution-principal Encrypt/Decrypt dependencies; both are explicitly denied in Team execution identity/boundary.'],
 'AWS::Logs::LogGroup':['No DataProtectionPolicy, KmsKeyId, FieldIndexPolicies, ResourcePolicyDocument or log delivery configuration. Optional policy/delivery cleanup not part of this template.','Provider schema includes s3:REST.PUT.OBJECT annotation; do not add this as an IAM action or grant unrelated delivery rights.'],
};
const cleanup={HttpApi:['GetApi','DeleteApi'],Stage:['GetStage','DeleteStage'],JwtAuthorizer:['GetAuthorizer','DeleteAuthorizer'],ReadIntegration:['GetIntegration','DeleteIntegration'],PreviewRoute:['GetRoute','DeleteRoute'],ReadFunction:['GetFunction','DeleteFunction','KMS Decrypt during environment-aware read/stabilization'],ReadRole:['GetRole','ListRolePolicies','ListAttachedRolePolicies','DeleteRolePolicy','DeleteRole'],ApiInvoke:['GetPolicy','RemovePermission'],ReadLogs:['DescribeLogGroups','DeleteLogGroup'],ReadErrors:['DescribeAlarms','DeleteAlarms'],ApiErrors:['DescribeAlarms','DeleteAlarms']};
const mapped=Object.entries(product.Resources).map(([logicalId,r])=>({logicalId,type:r.Type,propertiesPresent:Object.keys(r.Properties),providerHandlers:schemas[r.Type].handlers,providerTagging:schemas[r.Type].tagging,createAndRead:r.Type==='AWS::Lambda::Function'?'KNOWN_BLOCKER_DEFAULT_KMS_DENY':'COVERED_FOR_PINNED_PROPERTIES',update:'Provider operations recorded; no product update authorized',tag:schemas[r.Type].tagging?.taggable?'Service tag lifecycle included':'Not taggable',untag:schemas[r.Type].tagging?.taggable?'Maintenance path; not separate first-create rollback cleanup':'Not taggable',rollbackOperations:cleanup[logicalId],rollbackStatus:logicalId==='ReadFunction'?'DELETE_ALLOWED_BUT_ENVIRONMENT_READ_DEPENDENCY_BLOCKED':'COVERED',unknownCleanup:0,notes:optionalNotes[r.Type]??[],schemaEvidence:'schema-'+r.Type.replaceAll('::','-')+'.json'}));
assert.equal(mapped.length,11);assert.ok(mapped.every(r=>r.rollbackOperations));save('provider-lifecycle-and-rollback',{resources:11,resourceTypes:10,apiGatewayTypes:5,knownDefaultKmsBlocker:true,unknownCleanupOperations:0,resourcesMapped:mapped});
const failures=read('docs/architecture/phase2a-tournament-kms-correction-evidence-2026-10-04/kms-failure-events.json');
const after=read('docs/architecture/phase2a-tournament-kms-correction-evidence-2026-10-04/kms-post-deployment-events.json');
save('real-kms-dependency',{teamDeniedActions:read(dir+'/lifecycle-simulations.json').failures,priorFailure:failures.filter(e=>e.eventName==='Encrypt'&&e.errorCode==='AccessDenied'),priorSuccess:after.filter(e=>e.principal?.includes('CfnExecution')&&!e.errorCode),teamRuntimeModified:false,policyBroadening:false,conclusion:'A real default-Lambda encryption dependency, not a synthetic simulator anomaly; pinned execution policy needs separately reviewed correction before bootstrap'});
const now=new Date(),hours=(Date.parse(manifest.expiresAt)-now.getTime())/3600000;
save('expiry',{checkedAt:now.toISOString(),expiresAt:manifest.expiresAt,hoursRemaining:hours,minimumReviewReserveHours:6,reservePlanning:{bootstrap:1,verification:1,changeSetReview:1,deployment:1,rollback:1,lockdown:1},sufficientAtReview:hours>=6,renewalRequired:hours<6,renewalApplied:false,note:'Planning reserve, not an AWS duration guarantee. Recheck immediately before future authorized work; no deployment authorized here.'});
save('preservation',{at:now.toISOString(),product:receipt.revision,security:manifest.revision,sourceInputs:receipt.inputs.length,productAndSecurityHashesVerified:true,candidateChanges:0,awsWrites:0});
console.log(JSON.stringify({classificationUnknown:0,semantics:semanticCases.length,protected:protection.length,resourceMappings:mapped.length,hoursRemaining:hours,knownBlocker:'Execution-role default Lambda KMS deny'}));
