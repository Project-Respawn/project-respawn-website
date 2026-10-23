// Additional read-only intersection and explicit-deny controls; never assume real service execution.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {aws} from './kms-recovery-validate.mjs';
import {out,read,save} from './kms-recovery-prepare.mjs';
import {lambdaKey,secretKey} from './deployment-prepare.mjs';
const m=read(out+'/manifest.json'),results=[];
for(const domain of ['Core','TeamHub']){
 const prefix=domain==='Core'?'coreSecurity':'teamSecurity';
 const identityId=m.policies.find(p=>p.domain===domain&&p.kind==='identity').id;
 const identity=read(out+'/resolved-policies/'+identityId+'.json'),boundary=read(out+'/resolved-policies/'+prefix+'.ExecutionBoundary.json');
 const context={'kms:ViaService':'lambda.eu-north-1.amazonaws.com','kms:CallerAccount':'058264289478','kms:GrantIsForAWSResource':true};
 const cases=[{name:'identity-boundary-intersection',resource:lambdaKey,context,allow:true}];
 for(const[key,value]of [['kms:ViaService','s3.eu-north-1.amazonaws.com'],['kms:CallerAccount','111111111111'],['kms:GrantIsForAWSResource',false]])cases.push({name:'explicit-deny '+key,resource:lambdaKey,context:{...context,[key]:value},allow:false,injectAllow:true});
 const missing={...context};delete missing['kms:GrantIsForAWSResource'];cases.push({name:'explicit-deny missing resource flag',resource:lambdaKey,context:missing,allow:false,injectAllow:true});
 for(const key of [secretKey,lambdaKey.replace('13ae83f9-bc5f-4486-a013-e07b9d7d52e7','00000000-0000-0000-0000-000000000000')])cases.push({name:'explicit-deny foreign key '+key,resource:key,context,allow:false,injectAllow:true});
 for(const c of cases){const policies=[JSON.stringify(identity)];if(c.injectAllow)policies.push(JSON.stringify({Version:'2012-10-17',Statement:[{Effect:'Allow',Action:'kms:CreateGrant',Resource:'*'}]}));const req={PolicyInputList:policies,...(!c.injectAllow?{PermissionsBoundaryPolicyInputList:[JSON.stringify(boundary)]}:{}),ActionNames:['kms:CreateGrant'],ResourceArns:[c.resource],ContextEntries:Object.entries(c.context).map(([ContextKeyName,v])=>({ContextKeyName,ContextKeyValues:[String(v)],ContextKeyType:typeof v==='boolean'?'boolean':'string'}))};save('effective-request.json',req);const r=await aws('iam','simulate-custom-policy',['--cli-input-json','file://'+out+'/effective-request.json']);const row=r.EvaluationResults[0];assert.equal(row.EvalDecision,c.allow?'allowed':'explicitDeny',domain+' '+c.name);results.push({domain,...c,decision:row.EvalDecision,passed:true});save('effective-validation.json',{awsWrites:0,cases:results,complete:false});}
}
save('effective-validation.json',{awsWrites:0,cases:results,complete:true,passed:true});console.log(JSON.stringify({effectiveCases:results.length,passed:true}));
