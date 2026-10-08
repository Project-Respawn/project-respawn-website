import assert from 'node:assert/strict';import {aws,identity,read,save,pin} from './aws.mjs';
const c=pin(),who=await identity(),checks=[];save('policy-review',{complete:false});
for(const name of ['command-policy','read-policy','execution-identity','execution-boundary','caller-policy']){
 const r=await aws('accessanalyzer','validate-policy',{policyDocument:JSON.stringify(read(name)),policyType:'IDENTITY_POLICY'});checks.push({name,findings:r.findings});assert.equal(r.findings.length,0,name+' Analyzer findings');
}
const context=[{ContextKeyName:'aws:RequestedRegion',ContextKeyValues:['eu-north-1'],ContextKeyType:'string'}];
async function sim(name,actions,resources,allow,extra=[]){
 const boundary=name==='execution-identity'?'execution-boundary':name;
 const r=await aws('iam','simulate-custom-policy',{PolicyInputList:[JSON.stringify(read(name))],PermissionsBoundaryPolicyInputList:[JSON.stringify(read(boundary))],ActionNames:actions,ResourceArns:resources,ContextEntries:[...context.filter(c=>!extra.some(e=>e.ContextKeyName===c.ContextKeyName)),...extra]});
 const results=r.EvaluationResults.flatMap(x=>x.ResourceSpecificResults?.length?x.ResourceSpecificResults.map(y=>({action:x.EvalActionName,resource:y.EvalResourceName,decision:y.EvalResourceDecision})):[{action:x.EvalActionName,resource:x.EvalResourceName,decision:x.EvalDecision}]);
 assert.equal(results.length,actions.length*resources.length);for(const r of results)assert.equal(r.decision==='allowed',allow,JSON.stringify(r));checks.push({name,allow,results});
}
const core='arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Core-Ntgre-Contracts';
for(const name of ['command-policy','read-policy']){
 await sim(name,['lambda:InvokeFunction'],[core,core+':$LATEST'],true);
 await sim(name,['lambda:InvokeFunction'],[core.replace('Core','Tournament'),core.replace('Ntgre','Production'),core+':unreviewed'],false);
 await sim(name,['dynamodb:GetItem','dynamodb:PutItem','dynamodb:UpdateItem','dynamodb:DeleteItem','dynamodb:TransactWriteItems','cognito-idp:AdminGetUser','cognito-idp:ListUsers','cognito-idp:AdminAddUserToGroup','secretsmanager:GetSecretValue','s3:GetObject','iam:PassRole','appsync:GraphQL'],['*'],false);
}
await sim('execution-identity',['s3:GetObject'],[`arn:aws:s3:::${c.bucket}/${c.assetKey}`],true);
await sim('execution-identity',['s3:GetObject'],[`arn:aws:s3:::${c.bucket}/unreviewed.zip`],false);
await sim('execution-identity',['lambda:UpdateFunctionCode','lambda:UpdateFunctionConfiguration'],['arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-TeamHub-Ntgre-ParityRead'],true);
await sim('execution-identity',['apigateway:GET'],['arn:aws:apigateway:eu-north-1::/apis/t54b88casf'],true);
await sim('execution-identity',['apigateway:GET'],['arn:aws:apigateway:eu-north-1::/apis/t54b88casf'],false,[{ContextKeyName:'aws:RequestedRegion',ContextKeyValues:['eu-west-1'],ContextKeyType:'string'}]);
await sim('execution-identity',['apigateway:POST'],['arn:aws:apigateway:eu-north-1::/apis/msipnwy39j/routes'],false);
await sim('caller-policy',['cloudformation:CreateChangeSet'],[read('product-before').stackId],true,[{ContextKeyName:'cloudformation:TemplateUrl',ContextKeyValues:[c.url],ContextKeyType:'string'},{ContextKeyName:'cloudformation:RoleArn',ContextKeyValues:['arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-ReadProofExecution'],ContextKeyType:'string'}]);
save('policy-review',{at:new Date().toISOString(),identity:who,complete:true,checks,awsWrites:0});console.log(JSON.stringify({complete:true,checks:checks.length,awsWrites:0}));
