import assert from 'node:assert/strict';import {aws,identity,read,save,canonical,product} from './aws.mjs';
await identity();const checks=[],template=read('product.template');
for(const kind of ['Command','Read']){
 const name=product+'-Parity'+kind,expected=template.Resources['Parity'+kind+'Role'].Properties,role=(await aws('iam','get-role',{RoleName:name})).Role;
 assert.equal(role.PermissionsBoundary.PermissionsBoundaryArn,expected.PermissionsBoundary);
 const policies=(await aws('iam','list-role-policies',{RoleName:name})).PolicyNames;assert.deepEqual(policies,[expected.Policies[0].PolicyName]);
 const actual=(await aws('iam','get-role-policy',{RoleName:name,PolicyName:policies[0]})).PolicyDocument;assert.equal(canonical(actual),canonical(expected.Policies[0].PolicyDocument));assert.equal((await aws('iam','list-attached-role-policies',{RoleName:name})).AttachedPolicies.length,0);
 const boundary=(await aws('iam','get-policy',{PolicyArn:role.PermissionsBoundary.PermissionsBoundaryArn})).Policy;const document=(await aws('iam','get-policy-version',{PolicyArn:boundary.Arn,VersionId:boundary.DefaultVersionId})).PolicyVersion.Document;assert.equal(canonical(document),canonical(actual));
 for(const [actions,resources,allowed] of [
  [['lambda:InvokeFunction'],['arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Core-Ntgre-Contracts','arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Core-Ntgre-Contracts:$LATEST'],true],
  [['lambda:InvokeFunction'],['arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Tournaments-Ntgre-Preview','arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Core-Production-Contracts'],false],
  [['dynamodb:GetItem','dynamodb:PutItem','dynamodb:UpdateItem','dynamodb:DeleteItem','dynamodb:TransactWriteItems','cognito-idp:AdminGetUser','cognito-idp:ListUsers','cognito-idp:AdminAddUserToGroup','secretsmanager:GetSecretValue','appsync:GraphQL','s3:PutObject','iam:PassRole'],['*'],false]
 ]){const r=await aws('iam','simulate-principal-policy',{PolicySourceArn:role.Arn,ActionNames:actions,ResourceArns:resources});const results=r.EvaluationResults.flatMap(x=>x.ResourceSpecificResults?.length?x.ResourceSpecificResults.map(y=>({action:x.EvalActionName,resource:y.EvalResourceName,decision:y.EvalResourceDecision})):[{action:x.EvalActionName,resource:x.EvalResourceName,decision:x.EvalDecision}]);assert.equal(results.length,actions.length*resources.length);for(const r of results)assert.equal(r.decision==='allowed',allowed);checks.push({role:name,allowed,results});}
}
save('actual-security',{at:new Date().toISOString(),complete:true,checks});console.log(JSON.stringify({complete:true,checks:checks.flatMap(c=>c.results).length}));
