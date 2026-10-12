import assert from 'node:assert/strict';import {aws,read,save} from './aws.mjs';
const E='docs/architecture/team-hub-execution-kms-evidence-2026-10-09',c=read(E+'/candidate.json'),r={at:new Date().toISOString(),checks:[],complete:false,awsWrites:0};
const secret='arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-TeamHub-Ntgre-Cursor-wbclUV';
const core=(await aws('lambda','get-function-configuration',{FunctionName:'ProjectRespawn-Core-Ntgre-Contracts'})).Role;
const roles=[core,'arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-ParityCommand','arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-Deploy'];
for(const role of roles)for(const[action,resource]of [['secretsmanager:GetSecretValue',secret],['kms:Decrypt',c.secretKey],['lambda:UpdateFunctionConfiguration','arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-TeamHub-Ntgre-ParityRead']]){
 const context={'aws:RequestedRegion':'eu-north-1','kms:ViaService':'secretsmanager.eu-north-1.amazonaws.com','kms:CallerAccount':'058264289478','kms:EncryptionContext:SecretARN':secret};
 const out=await aws('iam','simulate-principal-policy',{PolicySourceArn:role,ActionNames:[action],ResourceArns:[resource],ContextEntries:Object.entries(context).map(([ContextKeyName,v])=>({ContextKeyName,ContextKeyValues:[v],ContextKeyType:'string'}))});assert.notEqual(out.EvaluationResults[0].EvalDecision,'allowed');r.checks.push({role,action,resource,decision:out.EvaluationResults[0].EvalDecision});save('wrong-principals',r);
}
// Evaluate AWS-managed key condition branches as a standalone diagnostic model.
// Removing Principal is ONLY a simulator adapter; it is never a candidate policy.
const key=read(E+'/key-policies.json').keys[0].policy;
const model={Version:'2012-10-17',Statement:key.Statement.filter(x=>x.Principal?.AWS==='*').map(x=>{const t=structuredClone(x);delete t.Principal;return t;})};
for(const[label,ctx,expected]of [['lambda-service',{'kms:ViaService':'lambda.eu-north-1.amazonaws.com','kms:CallerAccount':'058264289478'},'allowed'],['wrong-account',{'kms:ViaService':'lambda.eu-north-1.amazonaws.com','kms:CallerAccount':'111122223333'},'implicitDeny'],['wrong-service',{'kms:ViaService':'secretsmanager.eu-north-1.amazonaws.com','kms:CallerAccount':'058264289478'},'implicitDeny'],['missing-context',{},'implicitDeny'],['same-account-ciphertext',{'kms:CallerAccount':'058264289478','kms:EncryptionContext:aws:lambda:FunctionArn':'arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-TeamHub-Ntgre-ParityRead'},'allowed']]){
 const out=await aws('iam','simulate-custom-policy',{PolicyInputList:[JSON.stringify(model)],ActionNames:['kms:Decrypt'],ResourceArns:[c.lambdaKey],ContextEntries:Object.entries(ctx).map(([ContextKeyName,v])=>({ContextKeyName,ContextKeyValues:[v],ContextKeyType:'string'}))});assert.equal(out.EvaluationResults[0].EvalDecision,expected);r.checks.push({mode:'key-policy-condition-model-not-effective-role-simulation',label,expected,decision:out.EvaluationResults[0].EvalDecision});save('wrong-principals',r);
}
r.complete=true;save('wrong-principals',r);console.log(JSON.stringify({complete:true,checks:r.checks.length}));
