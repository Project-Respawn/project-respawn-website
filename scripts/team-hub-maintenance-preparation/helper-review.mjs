// Read-only validation. No provisioning, uploads, role changes or probe invocation.
import fs from 'node:fs';import assert from 'node:assert/strict';
import {fromIni} from '@aws-sdk/credential-providers';
import {IAMClient,SimulatePrincipalPolicyCommand} from '@aws-sdk/client-iam';
import {CloudFormationClient,ValidateTemplateCommand} from '@aws-sdk/client-cloudformation';
import {S3Client,HeadBucketCommand} from '@aws-sdk/client-s3';
const E='docs/architecture/team-hub-maintenance-preparation-evidence-2026-10-12',opts={region:'eu-north-1',credentials:fromIni({profile:'default'}),maxAttempts:3};
const template=JSON.parse(fs.readFileSync(E+'/fence-helper.PROPOSED.template.json')),functions=Object.values(template.Resources);assert.equal(functions.length,2);
for(const f of functions){assert.equal(f.Type,'AWS::Lambda::Function');assert.ok(!('ReservedConcurrentExecutions' in f.Properties));assert.ok(!f.Properties.Events);assert.equal(f.Properties.Code.S3Bucket,'cdk-hnb659fds-assets-058264289478-eu-north-1');}
const r={at:new Date().toISOString(),deployed:false,checks:[],awsWrites:0};
r.template=await new CloudFormationClient(opts).send(new ValidateTemplateCommand({TemplateBody:JSON.stringify(template)}));
await new S3Client(opts).send(new HeadBucketCommand({Bucket:functions[0].Properties.Code.S3Bucket,ExpectedBucketOwner:'058264289478'}));r.artifactBucketOwnerVerified=true;
const iam=new IAMClient(opts);
for(const principal of ['arn:aws:iam::058264289478:user/RavenTest','arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-ReadProofExecution']){
 const out=await iam.send(new SimulatePrincipalPolicyCommand({PolicySourceArn:principal,ActionNames:['iam:PassRole'],ResourceArns:functions.map(f=>f.Properties.Role),ContextEntries:[{ContextKeyName:'iam:PassedToService',ContextKeyType:'string',ContextKeyValues:['lambda.amazonaws.com']},{ContextKeyName:'aws:RequestedRegion',ContextKeyType:'string',ContextKeyValues:['eu-north-1']}],MaxItems:1000}));assert.ok(!out.IsTruncated);
 const decisions=out.EvaluationResults.flatMap(x=>x.ResourceSpecificResults?.length?x.ResourceSpecificResults.map(y=>({action:x.EvalActionName,resource:y.EvalResourceName,decision:y.EvalResourceDecision})): [{action:x.EvalActionName,resource:x.EvalResourceName,decision:x.EvalDecision}]);
 assert.equal(decisions.length,2);for(const d of decisions){if(principal.endsWith('/RavenTest'))assert.equal(d.decision,'allowed');else assert.notEqual(d.decision,'allowed');r.checks.push({principal,...d});}
}
r.existingSecurityOperator='RavenTest retains existing broad operator permissions; this review grants none and does not claim an IAM-enforced narrow session. Exact candidate/action scope and custody require separate authorization.';
r.roleReuseRisk='The two temporary functions acquire the existing reused roles, including their existing permissions. Fixed packaged code/empty input, exact function identity, no trigger/URL/event mapping, security-owned code custody and immediate cleanup constrain use. Normal Team runtime/caller is not broadened. Review this new temporary-resource design explicitly.';
r.complete=true;fs.writeFileSync(E+'/helper-security-review.json',JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify({complete:true,templateResources:2,passRoleControls:r.checks.length,artifactOwner:true,awsWrites:0}));
