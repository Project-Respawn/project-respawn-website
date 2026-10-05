import fs from 'node:fs';
import {aws} from './aws-read.mjs';
import {prefix,fixtureApiId,target,verbs} from './model.mjs';
const dir='docs/architecture/team-hub-2b2-security-correction-evidence-2026-10-05';
const read=n=>JSON.parse(fs.readFileSync(dir+'/'+n+'.json','utf8'));
const manifest=read('manifest'),inventory=read('inventory');
const policies={bootstrap:read('first-create-policy'),steady:read('steady-state-fixture-policy'),caller:read('deployment-caller-policy')};
const save=(name,value)=>fs.writeFileSync(dir+'/'+name+'.json',JSON.stringify(value,null,2)+'\n');
const identity=await aws('sts','get-caller-identity');if(identity.Account!==target.account||identity.Arn!==inventory.identity.Arn)throw Error('Identity changed');
const analyzer={};for(const [name,policy] of Object.entries(policies)){
  save('analyzer-request-'+name,{policyDocument:JSON.stringify(policy),policyType:'IDENTITY_POLICY'});
  analyzer[name]=await aws('accessanalyzer','validate-policy','--cli-input-json','file://'+dir+'/analyzer-request-'+name+'.json');
}save('analyzer',analyzer);
function paths(id){const root=prefix+'/apis/'+id;return [root,root+'/routes',root+'/routes/proof',root+'/integrations/proof',root+'/authorizers/proof',root+'/stages/$default',prefix+'/tags/'+root,prefix+'/tags/'+encodeURIComponent(root),prefix+'/tags/'+encodeURIComponent(root+'/stages/$default'),prefix+'/tags/'+encodeURIComponent(root).replace(/%[0-9A-F]{2}/g,s=>s.toLowerCase())];}
const jobs=[];
const context=(extra=[])=>[{ContextKeyName:'aws:RequestedRegion',ContextKeyValues:[target.region],ContextKeyType:'string'},{ContextKeyName:'aws:CurrentTime',ContextKeyValues:[inventory.at],ContextKeyType:'date'},...extra];
function add(name,policy,actions,resources,expected,extra=[],override){jobs.push({name,policy,expected,request:{PolicyInputList:[JSON.stringify(policies[policy])],PermissionsBoundaryPolicyInputList:[JSON.stringify(policies[policy])],ActionNames:actions,ResourceArns:resources,ContextEntries:override??context(extra)}});}
for(const a of inventory.apis){for(const p of ['bootstrap','steady'])add(p+'-protected-'+a.id,p,verbs,paths(a.id),'explicitDeny');}
add('bootstrap-create','bootstrap',['apigateway:POST'],[prefix+'/apis'],'allowed');
add('bootstrap-lifecycle','bootstrap',['apigateway:GET',...verbs],paths(fixtureApiId),'allowed');
add('steady-lifecycle','steady',['apigateway:GET',...verbs],paths(fixtureApiId),'allowed');
for(const id of ['othernew12',fixtureApiId+'x'])add('steady-new-id-'+id,'steady',verbs,paths(id),'explicitDeny');
add('steady-no-create','steady',verbs,[prefix+'/apis'],'explicitDeny');
add('bootstrap-expired','bootstrap',['apigateway:POST',...verbs.slice(1)],[prefix+'/apis',...paths(fixtureApiId)],'explicitDeny',[],[{ContextKeyName:'aws:RequestedRegion',ContextKeyValues:[target.region],ContextKeyType:'string'},{ContextKeyName:'aws:CurrentTime',ContextKeyValues:[manifest.expiresAt],ContextKeyType:'date'}]);
for(const p of ['bootstrap','steady']){
  add(p+'-wrong-region',p,verbs,['arn:aws:apigateway:us-east-1::/apis/'+fixtureApiId],'explicitDeny',[],[{ContextKeyName:'aws:RequestedRegion',ContextKeyValues:['us-east-1'],ContextKeyType:'string'},{ContextKeyName:'aws:CurrentTime',ContextKeyValues:[inventory.at],ContextKeyType:'date'}]);
  add(p+'-rest',p,verbs,[prefix+'/restapis/fakerest12',prefix+'/restapis/fakerest12/resources'],'explicitDeny');
  const cf=['amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332','amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-nested','ProjectRespawn-Tournaments-Ntgre','amplify-d2cux232bpa951-master-branch-53ef67772a'];
  add(p+'-cloudformation',p,['cloudformation:CreateChangeSet','cloudformation:UpdateStack','cloudformation:DeleteStack','cloudformation:ExecuteChangeSet'],cf.map(s=>`arn:aws:cloudformation:eu-north-1:058264289478:stack/${s}/proof`),'explicitDeny');
  add(p+'-wrong-passrole',p,['iam:PassRole'],['arn:aws:iam::058264289478:role/OtherDomain','arn:aws:iam::999999999999:role/ProjectRespawn-TeamHub-Ntgre-PreviewRead'],'explicitDeny',[{ContextKeyName:'iam:PassedToService',ContextKeyValues:['lambda.amazonaws.com'],ContextKeyType:'string'}]);
  add(p+'-right-passrole',p,['iam:PassRole'],['arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-PreviewRead'],'allowed',[{ContextKeyName:'iam:PassedToService',ContextKeyValues:['lambda.amazonaws.com'],ContextKeyType:'string'}]);
  const forbidden=[['cognito',['cognito-idp:AdminCreateUser','cognito-idp:DeleteUserPool'],'arn:aws:cognito-idp:eu-north-1:058264289478:userpool/eu-north-1_n24iLL7QE'],['appsync',['appsync:GraphQL','appsync:UpdateGraphqlApi'],'arn:aws:appsync:eu-north-1:058264289478:apis/protected'],['dynamodb',['dynamodb:GetItem','dynamodb:PutItem'],'arn:aws:dynamodb:eu-north-1:058264289478:table/protected'],['s3',['s3:GetObject','s3:PutObject'],'arn:aws:s3:::protected-business/proof'],['kms',['kms:Decrypt','kms:CreateGrant'],'arn:aws:kms:eu-north-1:058264289478:key/00000000-0000-0000-0000-000000000001']];
  for(const [label,actions,resource] of forbidden)add(p+'-'+label,p,actions,[resource],'explicitDeny');
}
const teamStack='arn:aws:cloudformation:eu-north-1:058264289478:stack/ProjectRespawn-TeamHub-Ntgre/proof';
const c=policies.caller.Statement.find(s=>s.Action==='cloudformation:CreateChangeSet'&&s.Effect==='Allow').Condition.StringEquals;
const callContext=[...Object.entries(c).map(([k,v])=>({ContextKeyName:k,ContextKeyValues:[v],ContextKeyType:'string'})),{ContextKeyName:'iam:PassedToService',ContextKeyValues:['cloudformation.amazonaws.com'],ContextKeyType:'string'}];
add('caller-prepare','caller',['cloudformation:CreateChangeSet'],[teamStack],'allowed',callContext);
add('caller-execute-reviewed','caller',['cloudformation:ExecuteChangeSet'],[teamStack],'allowed');
add('caller-wrong-template','caller',['cloudformation:CreateChangeSet'],[teamStack],'denied',callContext.map(x=>x.ContextKeyName==='cloudformation:TemplateUrl'?{...x,ContextKeyValues:['https://wrong.example/template.json']}:x));
add('caller-wrong-role','caller',['cloudformation:CreateChangeSet'],[teamStack],'denied',callContext.map(x=>x.ContextKeyName==='cloudformation:RoleArn'?{...x,ContextKeyValues:['arn:aws:iam::058264289478:role/Other']}:x));
add('caller-foreign-stacks','caller',['cloudformation:CreateChangeSet','cloudformation:ExecuteChangeSet','cloudformation:UpdateStack','cloudformation:DeleteStack'],['amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332','amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332-nested','ProjectRespawn-Tournaments-Ntgre','amplify-d2cux232bpa951-master-branch-53ef67772a'].map(s=>`arn:aws:cloudformation:eu-north-1:058264289478:stack/${s}/proof`),'explicitDeny',callContext);
add('caller-no-direct-api','caller',verbs,paths(fixtureApiId),'explicitDeny');
add('caller-right-passrole','caller',['iam:PassRole'],[c['cloudformation:RoleArn']],'allowed',[{ContextKeyName:'iam:PassedToService',ContextKeyValues:['cloudformation.amazonaws.com'],ContextKeyType:'string'}]);
add('caller-wrong-passrole','caller',['iam:PassRole'],['arn:aws:iam::058264289478:role/Other'],'explicitDeny',[{ContextKeyName:'iam:PassedToService',ContextKeyValues:['cloudformation.amazonaws.com'],ContextKeyType:'string'}]);
add('caller-wrong-passservice','caller',['iam:PassRole'],[c['cloudformation:RoleArn']],'explicitDeny',[{ContextKeyName:'iam:PassedToService',ContextKeyValues:['lambda.amazonaws.com'],ContextKeyType:'string'}]);
let cursor=0;const results=[];
await Promise.all(Array.from({length:3},async()=>{while(cursor<jobs.length){const j=jobs[cursor++];save('request-'+j.name,j.request);const response=await aws('iam','simulate-custom-policy','--cli-input-json','file://'+dir+'/request-'+j.name+'.json');save('response-'+j.name,response);
  const rows=response.EvaluationResults.flatMap(e=>e.ResourceSpecificResults?.length?e.ResourceSpecificResults.map(r=>({action:e.EvalActionName,resource:r.EvalResourceName,decision:r.EvalResourceDecision,missing:r.MissingContextValues??e.MissingContextValues??[]})):[{action:e.EvalActionName,resource:e.EvalResourceName,decision:e.EvalDecision,missing:e.MissingContextValues??[]}]);
  // A wildcard-allow diagnostic also returns implicitDeny for these combinations.
  // Keep them UNRESOLVED; never count their implicit denial as isolation proof.
  const unresolved=rows.filter(r=>['apigateway:PATCH','apigateway:DELETE'].includes(r.action)&&(/::\/tags\//.test(r.resource)||/::\/restapis\//.test(r.resource))&&r.decision==='implicitDeny'&&!r.missing.length);
  const checked=rows.filter(r=>!unresolved.includes(r));
  const failures=checked.filter(r=>r.missing.length||(j.expected==='denied'?!['explicitDeny','implicitDeny'].includes(r.decision):r.decision!==j.expected));
  if(rows.length!==j.request.ActionNames.length*j.request.ResourceArns.length)failures.push({error:'Incomplete simulation coverage',actual:rows.length,expected:j.request.ActionNames.length*j.request.ResourceArns.length});
  results.push({name:j.name,expected:j.expected,count:rows.length,proven:checked.length,unresolved,failures});
}}));
results.sort((a,b)=>a.name.localeCompare(b.name));
const findings=Object.entries(analyzer).flatMap(([policy,r])=>r.findings.map(f=>({policy,...f})));
const result={at:new Date().toISOString(),identity,jobs:results.length,assertions:results.reduce((n,r)=>n+r.count,0),positive:results.filter(r=>r.expected==='allowed').reduce((n,r)=>n+r.proven,0),negative:results.filter(r=>r.expected!=='allowed').reduce((n,r)=>n+r.proven,0),unresolved:results.reduce((n,r)=>n+r.unresolved.length,0),failures:results.filter(r=>r.failures.length),analyzerFindings:findings,results,awsWrites:0};save('validation',result);
console.log(JSON.stringify({jobs:result.jobs,assertions:result.assertions,positive:result.positive,negative:result.negative,unresolved:result.unresolved,failures:result.failures,analyzerFindings:findings}));if(result.failures.length||result.unresolved||findings.some(f=>['ERROR','SECURITY_WARNING'].includes(f.findingType)))process.exitCode=1;
