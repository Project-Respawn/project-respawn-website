import assert from 'node:assert/strict';
import {read,save,dir} from './read-aws.mjs';
const inventory=read(dir+'/key-inventory.json');
const lambda=inventory.keys.find(k=>k.classification==='AWS_MANAGED_LAMBDA_KEY');
assert.equal(lambda.manager,'AWS');assert.equal(lambda.state,'Enabled');
assert.ok(lambda.aliases.includes('alias/aws/lambda'));
const service=lambda.policy.Statement.find(s=>s.Effect==='Allow'&&s.Condition?.StringEquals?.['kms:ViaService']==='lambda.eu-north-1.amazonaws.com');
assert.equal(service.Condition.StringEquals['kms:CallerAccount'],'058264289478');
for(const action of ['kms:Encrypt','kms:Decrypt','kms:CreateGrant'])assert.ok(service.Action.includes(action));
const sizes={};
for(const name of ['first-create-policy','steady-state-fixture-policy']){
 const p=read(dir+'/'+name+'.json');
 assert.ok(p.Statement.every(s=>!s.NotAction&&![].concat(s.Action??[]).some(a=>a==='*'||a.toLowerCase().startsWith('kms:'))));
 sizes[name]=JSON.stringify(p).length;assert.ok(sizes[name]<=6144);
}
const artifact=read(dir+'/artifact-encryption.json');
assert.equal(artifact.lambdaKmsKeyArn,null);assert.equal(artifact.customerManagedLambdaKeyConfigured,false);
assert.equal(artifact.object.published,false);assert.ok(artifact.plannedPublicationEncryption.startsWith('AES256'));
save('effective-kms-model',{at:new Date().toISOString(),lambdaKey:lambda.arn,explicitExecutionKmsDeny:false,kmsIdentityAllows:0,servicePathSupported:true,basis:['Current AWS-managed Lambda key policy permits Lambda ViaService/account encryption and grants','Accepted Tournament correction demonstrated the same zero-new-KMS-Allow model in this account/region','Customer keys separately verified as account-root delegation only with zero grants'],limitation:'IAM-only implicitDeny does not evaluate the Lambda managed-key resource-policy path. No live Team Hub Lambda creation or cryptographic test was performed. AWS-managed Lambda resource-policy context grants are not claimed to be universally denied.',artifactRequirement:'Future authorized publication must explicitly use AES256 and verify HeadObject; object currently absent',managedPolicyCharacters:sizes,awsWrites:0});
console.log('KMS model, zero execution KMS actions, policy quotas and artifact requirements: PASS');
