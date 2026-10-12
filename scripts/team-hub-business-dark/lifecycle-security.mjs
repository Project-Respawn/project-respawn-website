import assert from 'node:assert/strict';
import {aws,read,save} from './aws.mjs';
import {verify} from './pins.mjs';
const c=verify(),s=read(c.root+'/security.template.json');
const policy=s.Resources.ExecutionRole.Properties.Policies[0].PolicyDocument,boundary=s.Resources.ExecutionBoundary.Properties.PolicyDocument;
const own='arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-TeamHub-Ntgre-Cursor-ABC123';
const r={at:new Date().toISOString(),checks:[],complete:false,awsWrites:0};
for(const action of ['CreateSecret','DescribeSecret','TagResource','GetSecretValue','UpdateSecret','PutSecretValue','DeleteSecret','ReplicateSecretToRegions'])for(const resource of [own,own.replace('TeamHub','Core')]){
 const expected=resource===own&&['CreateSecret','DescribeSecret','TagResource','GetSecretValue'].includes(action);
 const result=await aws('iam','simulate-custom-policy',{PolicyInputList:[JSON.stringify(policy)],PermissionsBoundaryPolicyInputList:[JSON.stringify(boundary)],ActionNames:['secretsmanager:'+action],ResourceArns:[resource],ContextEntries:[{ContextKeyName:'aws:RequestedRegion',ContextKeyValues:['eu-north-1'],ContextKeyType:'string'}]});
 const d=result.EvaluationResults[0];r.checks.push({action,resource,expected,decision:d.EvalDecision});save('lifecycle-security',r);assert.equal(d.EvalDecision==='allowed',expected);
}
const d=(await aws('iam','simulate-custom-policy',{PolicyInputList:[JSON.stringify(policy)],PermissionsBoundaryPolicyInputList:[JSON.stringify(boundary)],ActionNames:['secretsmanager:GetRandomPassword'],ResourceArns:['*'],ContextEntries:[{ContextKeyName:'aws:RequestedRegion',ContextKeyValues:['eu-north-1'],ContextKeyType:'string'}]})).EvaluationResults[0];assert.equal(d.EvalDecision,'allowed');r.checks.push({action:'GetRandomPassword',decision:d.EvalDecision});
r.complete=true;save('lifecycle-security',r);console.log(JSON.stringify({complete:true,checks:r.checks.length}));
