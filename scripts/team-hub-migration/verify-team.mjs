import assert from 'node:assert/strict';
import {aws,read,save,digest,audit} from './read-only.mjs';
const P='docs/architecture/team-hub-2b2-caller-release-evidence-2026-10-05/';
const identity=await aws('sts','get-caller-identity');assert.equal(identity.Account,'058264289478');
const before=read(P+'ownership.json'),installed=read(P+'lockdown-installed.json'),caller=read(P+'installed-caller.json');
const ids=rs=>rs.map(r=>[r.LogicalResourceId,r.ResourceType,r.PhysicalResourceId]).sort((a,b)=>a[0].localeCompare(b[0]));
const stack=(await aws('cloudformation','describe-stacks','--stack-name',before.stack.StackName)).Stacks[0];
for(const k of ['StackId','StackStatus','LastUpdatedTime','RoleARN'])assert.equal(stack[k],before.stack[k]);
const resources=(await aws('cloudformation','list-stack-resources','--stack-name',stack.StackName)).StackResourceSummaries;assert.deepEqual(ids(resources),ids(before.resources));
const api=await aws('apigatewayv2','get-api','--api-id','t54b88casf');assert.equal(digest(api),digest(before.api));
const lambda=await aws('lambda','get-function-configuration','--function-name','ProjectRespawn-TeamHub-Ntgre-PreviewRead');assert.equal(lambda.CodeSha256,'uROMTdppYqBarFWhso61iQVCTQdVRmm8vCNVR3KRWVA=');assert.equal(lambda.State,'Active');
const security=(await aws('cloudformation','describe-stacks','--stack-name',installed.stack.StackName)).Stacks[0];assert.equal(security.LastUpdatedTime,installed.stack.LastUpdatedTime);assert.equal(security.StackStatus,'UPDATE_COMPLETE');
const securityResources=(await aws('cloudformation','list-stack-resources','--stack-name',security.StackName)).StackResourceSummaries;assert.deepEqual(ids(securityResources),ids(caller.resources));
const product=read('docs/architecture/team-hub-2b2-evidence-2026-10-05/read-proof.template.json');
const securityTemplate=read(P+'lockdown-security.template.json');
const roles=[];
for(const name of ['ProjectRespawn-TeamHub-Ntgre-Deploy','ProjectRespawn-TeamHub-Ntgre-ReadProofExecution','ProjectRespawn-TeamHub-Ntgre-PreviewRead']){
 const role=(await aws('iam','get-role','--role-name',name)).Role;
 const expected=name.endsWith('-Deploy')?caller.role:name.endsWith('ReadProofExecution')?installed.role:null;
 if(expected){assert.equal(role.Arn,expected.Arn);assert.equal(digest(role.AssumeRolePolicyDocument),digest(expected.AssumeRolePolicyDocument));assert.deepEqual(role.PermissionsBoundary,expected.PermissionsBoundary);}
 else{assert.equal(digest(role.AssumeRolePolicyDocument),digest(product.Resources.ReadRole.Properties.AssumeRolePolicyDocument));assert.equal(role.PermissionsBoundary.PermissionsBoundaryArn,product.Resources.ReadRole.Properties.PermissionsBoundary);}
 const attached=(await aws('iam','list-attached-role-policies','--role-name',name)).AttachedPolicies;
 const inlineNames=(await aws('iam','list-role-policies','--role-name',name)).PolicyNames;
 const boundary=role.PermissionsBoundary.PermissionsBoundaryArn;
 const policy=(await aws('iam','get-policy','--policy-arn',boundary)).Policy;
 const document=(await aws('iam','get-policy-version','--policy-arn',boundary,'--version-id',policy.DefaultVersionId)).PolicyVersion.Document;
 const expectedDoc=name.endsWith('-Deploy')?caller.document:name.endsWith('ReadProofExecution')?installed.document:securityTemplate.Resources.PreviewBoundary.Properties.PolicyDocument;
 assert.equal(digest(document),digest(expectedDoc));
 if(name.endsWith('-Deploy')){assert.deepEqual(attached,caller.attached);assert.equal(inlineNames.length,0);}
 else{assert.equal(attached.length,0);assert.equal(inlineNames.length,1);const inline=(await aws('iam','get-role-policy','--role-name',name,'--policy-name',inlineNames[0])).PolicyDocument;assert.equal(digest(inline),digest(name.endsWith('ReadProofExecution')?installed.inline:product.Resources.ReadRole.Properties.Policies[0].PolicyDocument));}
 roles.push({role:name,boundary,policyVersion:policy.DefaultVersionId,policyDigest:digest(document),unchanged:true});
}
save('team-baseline',{at:new Date().toISOString(),identity,stack:{name:stack.StackName,id:stack.StackId,status:stack.StackStatus,lastUpdated:stack.LastUpdatedTime},resources:ids(resources),api:api.ApiId,lambda:{name:lambda.FunctionName,hash:lambda.CodeSha256},security:{stack:security.StackName,status:security.StackStatus,resources:securityResources.length,roles},firstCreateAuthorityEffective:false,exactApi:'t54b88casf',unchanged:true,audit});
console.log(JSON.stringify({unchanged:true,resources:resources.length,security:securityResources.length,api:api.ApiId,audit}));
