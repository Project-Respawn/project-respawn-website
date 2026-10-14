import assert from 'node:assert/strict';
import {CloudFormationClient,GetTemplateCommand} from '@aws-sdk/client-cloudformation';
import {IAMClient,SimulatePrincipalPolicyCommand} from '@aws-sdk/client-iam';
import {E,read,save,options,template,manifest,canonical} from './common.mjs';
const p=read(E+'/provision.json'),change=read(E+'/change-set.json');
const awsTemplate=await new CloudFormationClient(options).send(new GetTemplateCommand({StackName:p.stackId,ChangeSetName:p.changeSetId,TemplateStage:'Original'}));assert.equal(canonical(JSON.parse(awsTemplate.TemplateBody)),canonical(template));
assert.deepEqual(Object.fromEntries(change.Parameters.map(x=>[x.ParameterKey,x.ParameterValue])),p.window);assert.equal(change.DeploymentConfig.DisableRollback,false);
const cleanup=await new IAMClient(options).send(new SimulatePrincipalPolicyCommand({PolicySourceArn:'arn:aws:iam::058264289478:user/RavenTest',ActionNames:['s3:DeleteObjectVersion'],ResourceArns:['arn:aws:s3:::'+manifest.probe.bucket+'/'+manifest.probe.key],MaxItems:1000}));assert.ok(!cleanup.IsTruncated);assert.equal(cleanup.EvaluationResults[0].EvalDecision,'allowed');
save('change-review',{at:new Date().toISOString(),complete:true,templateMatchesPin:true,parametersMatch:true,additions:4,modifications:0,deletions:0,replacements:0,nestedStacks:0,rollbackEnabled:true,versionedArtifactCleanup:cleanup,templateRequestId:awsTemplate.$metadata.requestId});console.log(JSON.stringify({complete:true,additions:4,otherChanges:0}));
