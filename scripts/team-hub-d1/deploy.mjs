import fs from 'node:fs';import assert from 'node:assert/strict';
import {aws,identity,assume,read,save,pin,E,product,security,execution,canonical,P,B,json} from './aws.mjs';
const [kind,action]=process.argv.slice(2);assert.ok(['product','security'].includes(kind));assert.ok(['prepare','inspect','execute','status','verify'].includes(action));
const c=pin(),stack=kind==='product'?product:security,restricted=kind==='product',who=await identity();if(restricted)await assume();
const template=json(P+'/d1-after-c2-'+kind+'.template.json');
if(action==='prepare'){
 assert.equal(read('policy-review').complete,true);assert.ok(!fs.existsSync(`${E}/${kind}-prepared.json`));
 const actual=await aws('cloudformation','get-template',{StackName:stack},restricted);assert.equal(canonical(typeof actual.TemplateBody==='string'?JSON.parse(actual.TemplateBody):actual.TemplateBody),canonical(json(P+'/c2-'+kind+'.template.json')),'Unexpected live template drift');
 const r=await aws('cloudformation','create-change-set',{StackName:stack,ChangeSetName:`team-hub-d1-monitoring-${kind}-20261008`,ChangeSetType:'UPDATE',Capabilities:['CAPABILITY_NAMED_IAM'],...(restricted?{TemplateURL:c.url,RoleARN:execution}:{TemplateBody:fs.readFileSync(`${P}/d1-after-c2-security.template.json`,'utf8')})},restricted);save(kind+'-prepared',{at:new Date().toISOString(),...r});console.log(JSON.stringify(r));
}else if(action==='inspect'){
 const id=read(kind+'-prepared').Id;let next,r;const changes=[];do{r=await aws('cloudformation','describe-change-set',{StackName:stack,ChangeSetName:id,IncludePropertyValues:true,...(next?{NextToken:next}:{})},restricted);changes.push(...(r.Changes??[]));next=r.NextToken;}while(next);
 save(kind+'-change-set',{...r,Changes:changes});assert.equal(r.Status,'CREATE_COMPLETE');assert.equal(r.ExecutionStatus,'AVAILABLE');
 assert.deepEqual(changes.map(x=>x.ResourceChange.LogicalResourceId).sort(),c.changes[kind]);
 for(const {ResourceChange:x} of changes){assert.equal(x.Action,'Modify');assert.equal(x.Replacement,'False');assert.equal(x.ResourceType,template.Resources[x.LogicalResourceId].Type);assert.ok(!x.ChangeSetId);for(const d of x.Details??[])assert.ok(!d.Target?.RequiresRecreation||d.Target.RequiresRecreation==='Never');}
 const actual=await aws('cloudformation','get-template',{StackName:stack,ChangeSetName:id,TemplateStage:'Original'},restricted);assert.equal(canonical(typeof actual.TemplateBody==='string'?JSON.parse(actual.TemplateBody):actual.TemplateBody),canonical(template));
 save(kind+'-gate',{at:new Date().toISOString(),ready:true,changeSetId:id,changes:changes.map(x=>x.ResourceChange),rollbackEnabled:true,identity:who,candidate:c[kind+'Sha256']});console.log(JSON.stringify({ready:true,kind,modifications:changes.length,replacements:0,additions:0,deletions:0}));
}else if(action==='execute'){
 assert.ok(!fs.existsSync(`${E}/${kind}-executed.json`));const authority=await aws('dynamodb','get-item',{TableName:product+'-Journal',Key:{PK:{S:'CONTROL#AUTHORITY'},SK:{S:'STATE'}},ConsistentRead:true});assert.deepEqual(authority.Item,json(P+'/c1-request.json').Item);const gate=read(kind+'-gate');const latest=await aws('cloudformation','describe-change-set',{StackName:stack,ChangeSetName:gate.changeSetId},restricted);assert.equal(latest.ExecutionStatus,'AVAILABLE');assert.equal(latest.Status,'CREATE_COMPLETE');
 await aws('cloudformation','execute-change-set',{StackName:stack,ChangeSetName:gate.changeSetId,DisableRollback:false},restricted);save(kind+'-executed',{at:new Date().toISOString(),changeSetId:gate.changeSetId,rollbackEnabled:true});console.log('Execution requested with rollback enabled.');
}else if(action==='status'){
 const s=(await aws('cloudformation','describe-stacks',{StackName:stack},restricted)).Stacks[0];const events=(await aws('cloudformation','describe-stack-events',{StackName:stack},restricted)).StackEvents;save(kind+'-status',{at:new Date().toISOString(),stack:s,events});
 const since=Date.parse(read(kind+'-executed').at)-5000;if(s.StackStatus.includes('ROLLBACK')||events.some(e=>Date.parse(e.Timestamp)>=since&&e.ResourceStatus.includes('FAILED')))save('STOP',{kind,status:s.StackStatus});
 console.log(JSON.stringify({kind,status:s.StackStatus,latest:events.slice(0,4).map(x=>({id:x.LogicalResourceId,status:x.ResourceStatus}))}));
}else{
 const s=(await aws('cloudformation','describe-stacks',{StackName:stack},restricted)).Stacks[0];assert.equal(s.StackStatus,'UPDATE_COMPLETE');assert.equal(s.DisableRollback,false);
 const actual=await aws('cloudformation','get-template',{StackName:stack},restricted);assert.equal(canonical(typeof actual.TemplateBody==='string'?JSON.parse(actual.TemplateBody):actual.TemplateBody),canonical(template));
 if(kind==='security'){
  for(const [id,r] of Object.entries(template.Resources).filter(([,r])=>r.Type==='AWS::IAM::ManagedPolicy')){const arn='arn:aws:iam::058264289478:policy/'+r.Properties.ManagedPolicyName;const p=(await aws('iam','get-policy',{PolicyArn:arn})).Policy;const installed=(await aws('iam','get-policy-version',{PolicyArn:arn,VersionId:p.DefaultVersionId})).PolicyVersion.Document;assert.equal(canonical(installed),canonical(r.Properties.PolicyDocument),id);}
 }else for(const kind of ['Command','Read']){const f=await aws('lambda','get-function-configuration',{FunctionName:product+'-Parity'+kind});assert.equal(f.State,'Active');assert.equal(f.LastUpdateStatus,'Successful');assert.equal(Buffer.from(f.CodeSha256,'base64').toString('hex'),c.zipSha256);assert.equal(f.Environment.Variables.TEAM_HUB_NORMAL_WRITES,'DISABLED');assert.equal(f.Environment.Variables.TEAM_HUB_AUTHORITY,'LEGACY_WRITER');}
 save(kind+'-installed',{at:new Date().toISOString(),verified:true,status:s.StackStatus,disableRollback:s.DisableRollback});console.log(JSON.stringify({kind,verified:true}));
}
