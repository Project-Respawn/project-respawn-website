import assert from 'node:assert/strict';import {aws,identity,read,save,canonical,product,security} from './aws.mjs';
await identity();const securityTemplate=read('security-before.template'),productTemplate=read('product-before.template');
for(const [name,expected] of [[security,securityTemplate],[product,productTemplate]]){const r=await aws('cloudformation','get-template',{StackName:name});assert.equal(canonical(typeof r.TemplateBody==='string'?JSON.parse(r.TemplateBody):r.TemplateBody),canonical(expected));}
for(const resource of Object.values(securityTemplate.Resources).filter(r=>r.Type==='AWS::IAM::ManagedPolicy')){
 const arn='arn:aws:iam::058264289478:policy/'+resource.Properties.ManagedPolicyName,p=(await aws('iam','get-policy',{PolicyArn:arn})).Policy;
 const doc=(await aws('iam','get-policy-version',{PolicyArn:arn,VersionId:p.DefaultVersionId})).PolicyVersion.Document;assert.equal(canonical(doc),canonical(resource.Properties.PolicyDocument));
}
const role=securityTemplate.Resources.ExecutionRole.Properties;const inline=(await aws('iam','get-role-policy',{RoleName:role.RoleName,PolicyName:role.Policies[0].PolicyName})).PolicyDocument;assert.equal(canonical(inline),canonical(role.Policies[0].PolicyDocument));
for(const kind of ['Command','Read']){const f=await aws('lambda','get-function-configuration',{FunctionName:product+'-Parity'+kind});assert.equal(f.CodeSha256,read('Parity'+kind+'Function-before').sha);assert.equal(JSON.parse(f.Environment.Variables.TEAM_HUB_VERIFICATION).mode,'DISABLED');}
save('rollback-verified',{at:new Date().toISOString(),verified:true,managedPoliciesRestored:true,executionIdentityRestored:true,productUntouched:true,authority:'LEGACY_WRITER',normalWritesEnabled:false});console.log(JSON.stringify({rollbackVerified:true,productUntouched:true}));
