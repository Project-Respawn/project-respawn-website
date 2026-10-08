import assert from 'node:assert/strict';
import {aws,identity,tableArns,tableNames,product,caller,execution,read,save,E} from './aws.mjs';
const who=await identity(),candidate=read(E+'/candidate.json');
for(const name of tableNames){let absent=false;try{await aws('dynamodb','describe-table',['--table-name',name]);}catch(e){if(e.code==='ResourceNotFoundException')absent=true;else throw e;}assert.ok(absent,'Target already exists');}
const docs=['execution-policy','caller-policy'];for(const n of docs)save(n+'-list',[JSON.stringify(read(E+'/'+n+'.json'))]);const analyzer=[];
for(const name of docs){const r=await aws('accessanalyzer','validate-policy',['--policy-document','file://'+E+'/'+name+'.json','--policy-type','IDENTITY_POLICY']);analyzer.push({name,...r});save('analyzer',{analyzer});assert.equal(r.findings.length,0);}
const region={ContextKeyName:'aws:RequestedRegion',ContextKeyType:'string',ContextKeyValues:['eu-north-1']};
const checks=[];
async function sim(name,actions,resources,expected,context=[region],principal){const args=principal?['--policy-source-arn',principal]:['--policy-input-list','file://'+E+'/'+name+'-list.json','--permissions-boundary-policy-input-list','file://'+E+'/'+name+'-list.json'];args.push('--action-names',...actions,'--resource-arns',...resources,'--context-entries',JSON.stringify(context));const r=await aws('iam',principal?'simulate-principal-policy':'simulate-custom-policy',args);r.EvaluationResults=r.EvaluationResults.flatMap(x=>x.ResourceSpecificResults?.length?x.ResourceSpecificResults.map(y=>({...y,EvalActionName:x.EvalActionName,EvalResourceName:y.EvalResourceName,EvalDecision:y.EvalResourceDecision})): [x]);checks.push({name,expected,principal,...r});save('security-simulation',{checks,complete:false});for(const x of r.EvaluationResults){assert.equal(x.EvalDecision==='allowed',expected==='allowed',JSON.stringify({action:x.EvalActionName,resource:x.EvalResourceName,decision:x.EvalDecision,missing:x.MissingContextValues}));}assert.equal(r.EvaluationResults.length,actions.length*resources.length);}
const policy=read(E+'/execution-policy.json');
const lifecycle=policy.Statement.find(s=>s.Effect==='Allow'&&JSON.stringify(s.Action).includes('dynamodb:CreateTable')).Action;
await sim('execution-policy',lifecycle,tableArns,'allowed');
const data=['GetItem','Query','Scan','PutItem','UpdateItem','DeleteItem','ConditionCheckItem','BatchWriteItem'].map(a=>'dynamodb:'+a);
await sim('execution-policy',[...data,'dynamodb:DeleteTable','dynamodb:RestoreTableFromBackup'],tableArns,'denied');
const foreign=['Team-dxb2tdlulrch7hj2pts2mfijia-NONE','ProjectRespawn-Tournaments-Ntgre','ProjectRespawn-Creator-Ntgre','ProjectRespawn-Commerce-Ntgre','ProjectRespawn-TeamHub-Production','ProjectRespawn-TeamHub-Ntgre-Operational-foreign'].map(n=>'arn:aws:dynamodb:eu-north-1:058264289478:table/'+n);
await sim('execution-policy',lifecycle,foreign,'denied');
await sim('execution-policy',lifecycle,tableArns,'denied',[{...region,ContextKeyValues:['us-east-1']}]);
await sim('caller-policy',[...data,...lifecycle],tableArns,'denied');
await sim('runtime',data,tableArns,'denied',[region],'arn:aws:iam::058264289478:role/'+product+'-PreviewRead');
await sim('runtime',['dynamodb:PutItem','dynamodb:UpdateItem','dynamodb:DeleteItem','dynamodb:ConditionCheckItem'],tableArns,'denied',[region,{ContextKeyName:'dynamodb:EnclosingOperation',ContextKeyType:'string',ContextKeyValues:['TransactWriteItems']}],'arn:aws:iam::058264289478:role/'+product+'-PreviewRead');
const ctx=[region,{ContextKeyName:'cloudformation:RoleArn',ContextKeyType:'string',ContextKeyValues:[execution]},{ContextKeyName:'cloudformation:TemplateUrl',ContextKeyType:'string',ContextKeyValues:[candidate.url]}];
await sim('caller-policy',['cloudformation:CreateChangeSet'],['arn:aws:cloudformation:eu-north-1:058264289478:stack/'+product+'/review'],'allowed',ctx);
await sim('caller-policy',['cloudformation:CreateChangeSet'],['arn:aws:cloudformation:eu-north-1:058264289478:stack/ProjectRespawn-Tournaments-Ntgre/review'],'denied',ctx);
await sim('caller-policy',['cloudformation:CreateChangeSet'],['arn:aws:cloudformation:eu-north-1:058264289478:stack/'+product+'/review'],'denied',ctx.map(c=>c.ContextKeyName==='cloudformation:TemplateUrl'?{...c,ContextKeyValues:[candidate.originalTemplateUrl]}:c));
await sim('caller-policy',['iam:PassRole'],[execution],'allowed',[region,{ContextKeyName:'iam:PassedToService',ContextKeyType:'string',ContextKeyValues:['cloudformation.amazonaws.com']}]);
await sim('caller-policy',['iam:PassRole'],['arn:aws:iam::058264289478:role/ProjectRespawn-Tournaments-Ntgre-Execution'],'denied',[region,{ContextKeyName:'iam:PassedToService',ContextKeyType:'string',ContextKeyValues:['cloudformation.amazonaws.com']}]);
const results=checks.flatMap(c=>c.EvaluationResults);save('security-simulation',{at:new Date().toISOString(),identity:who,checks,complete:true,positive:results.filter(r=>r.EvalDecision==='allowed').length,negative:results.filter(r=>r.EvalDecision!=='allowed').length,analyzerFindings:0,unexpected:0,transactionProof:'Underlying item actions with dynamodb:EnclosingOperation=TransactWriteItems; TransactWriteItems is not a standalone IAM action'});
console.log(JSON.stringify({complete:true,positive:results.filter(r=>r.EvalDecision==='allowed').length,negative:results.filter(r=>r.EvalDecision!=='allowed').length}));
