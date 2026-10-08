import fs from 'node:fs';
import assert from 'node:assert/strict';
import {aws,identity} from './preflight/aws.mjs';
const E='docs/architecture/team-hub-2b4a-evidence-2026-10-06',read=n=>JSON.parse(fs.readFileSync(E+'/'+n+'.json','utf8')),save=(n,v)=>fs.writeFileSync(E+'/'+n+'.json',JSON.stringify(v,null,2)+'\n');
const who=await identity(),analyzer=[];
for(const name of ['command-policy','read-policy','execution-identity','execution-boundary']){const r=await aws('accessanalyzer','validate-policy',['--policy-document','file://'+E+'/'+name+'.json','--policy-type','IDENTITY_POLICY']);analyzer.push({name,...r});save('policy-analyzer',{identity:who,analyzer});assert.equal(r.findings.length,0,name+' findings');save(name+'-list',[JSON.stringify(read(name))]);}
const region={ContextKeyName:'aws:RequestedRegion',ContextKeyValues:['eu-north-1'],ContextKeyType:'string'},keys={ContextKeyName:'dynamodb:LeadingKeys',ContextKeyValues:['TEAM#team:phase2b4-test-abcdefgh-one'],ContextKeyType:'stringList'},transaction={ContextKeyName:'dynamodb:EnclosingOperation',ContextKeyValues:['TransactWriteItems'],ContextKeyType:'stringList'};
const op='arn:aws:dynamodb:eu-north-1:058264289478:table/ProjectRespawn-TeamHub-Ntgre-Operational',journal=op.replace('Operational','Journal'),checks=[];
async function sim(name,actions,resources,allowed,context=[region,keys,transaction]){
 const boundary=name==='execution-identity'?'execution-boundary':name;
 const r=await aws('iam','simulate-custom-policy',['--policy-input-list','file://'+E+'/'+name+'-list.json','--permissions-boundary-policy-input-list','file://'+E+'/'+boundary+'-list.json','--action-names',...actions,'--resource-arns',...resources,'--context-entries',JSON.stringify(context)]);
 const results=r.EvaluationResults.flatMap(x=>x.ResourceSpecificResults?.length?x.ResourceSpecificResults.map(y=>({...y,action:x.EvalActionName,decision:y.EvalResourceDecision})): [{...x,action:x.EvalActionName,decision:x.EvalDecision}]);checks.push({name,allowed,results});save('policy-simulation',{checks,complete:false});assert.equal(results.length,actions.length*resources.length);for(const x of results)assert.equal(x.decision==='allowed',allowed,JSON.stringify(x));
}
await sim('command-policy',['dynamodb:GetItem','dynamodb:Query','dynamodb:PutItem','dynamodb:DeleteItem','dynamodb:ConditionCheckItem'],[op],true);
await sim('command-policy',['dynamodb:PutItem'],[journal],true);
await sim('command-policy',['dynamodb:GetItem'],[journal],true,[region,{...keys,ContextKeyValues:['IDEMP#issuer#subject#team:phase2b4-test-abcdefgh-one']}]);
await sim('command-policy',['dynamodb:PutItem','dynamodb:DeleteItem'],[op],false,[region,keys]);
await sim('command-policy',['dynamodb:GetItem','dynamodb:PutItem'],[op],false,[region,{...keys,ContextKeyValues:['TEAM#team:real']},transaction]);
await sim('command-policy',['dynamodb:PutItem'],[journal],false,[region,{...keys,ContextKeyValues:['CONTROL#AUTHORITY']},transaction]);
await sim('command-policy',['dynamodb:DeleteItem','dynamodb:UpdateItem','dynamodb:Scan'],[journal],false);
await sim('read-policy',['dynamodb:GetItem','dynamodb:Query'],[op],true);
await sim('read-policy',['dynamodb:PutItem','dynamodb:UpdateItem','dynamodb:DeleteItem','dynamodb:Scan'],[op,journal],false);
for(const name of ['command-policy','read-policy']){
 await sim(name,['dynamodb:GetItem','dynamodb:PutItem','dynamodb:CreateTable'],['Team-dxb2tdlulrch7hj2pts2mfijia-NONE','ProjectRespawn-Tournaments-Ntgre','ProjectRespawn-Creator-Ntgre','ProjectRespawn-Commerce-Ntgre','ProjectRespawn-Community-Ntgre','ProjectRespawn-TeamHub-Production'].map(n=>'arn:aws:dynamodb:eu-north-1:058264289478:table/'+n),false);
 await sim(name,['cognito-idp:AdminGetUser','appsync:GraphQL','s3:GetObject','iam:PassRole','cloudformation:CreateStack','kms:GenerateDataKey'],['*'],false);
 await sim(name,['kms:Decrypt'],['arn:aws:kms:eu-north-1:058264289478:key/synthetic-business-key'],false,[region,{ContextKeyName:'kms:ResourceAliases',ContextKeyValues:['alias/project-respawn/business'],ContextKeyType:'stringList'}]);
}
for(const name of ['ParityCommand','ParityRead'])await sim('execution-identity',['lambda:CreateFunction','lambda:UpdateFunctionCode','lambda:DeleteFunction'],['arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-TeamHub-Ntgre-'+name],true,[region]);
await sim('execution-identity',['lambda:CreateFunction'],['arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Tournaments-Ntgre-Preview','arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-TeamHub-Ntgre-Unreviewed'],false,[region]);
await sim('execution-identity',['apigateway:POST'],['arn:aws:apigateway:eu-north-1::/apis','arn:aws:apigateway:eu-north-1::/apis/msipnwy39j/routes'],false,[region]);
await sim('execution-identity',['apigateway:POST'],['arn:aws:apigateway:eu-north-1::/apis/t54b88casf/routes'],true,[region]);
for(const name of ['ParityCommand','ParityRead']){const role='arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-'+name;await sim('execution-identity',['iam:CreateRole'],[role],true,[region,{ContextKeyName:'iam:PermissionsBoundary',ContextKeyValues:[role.replace(':role/',':policy/')+'Boundary'],ContextKeyType:'string'}]);await sim('execution-identity',['iam:CreateRole'],[role],false,[region,{ContextKeyName:'iam:PermissionsBoundary',ContextKeyValues:['arn:aws:iam::058264289478:policy/Foreign'],ContextKeyType:'string'}]);}
const results=checks.flatMap(c=>c.results);save('policy-simulation',{at:new Date().toISOString(),identity:who,complete:true,checks,positive:results.filter(r=>r.decision==='allowed').length,negative:results.filter(r=>r.decision!=='allowed').length,awsWrites:0});console.log(JSON.stringify({complete:true,positive:results.filter(r=>r.decision==='allowed').length,negative:results.filter(r=>r.decision!=='allowed').length}));
