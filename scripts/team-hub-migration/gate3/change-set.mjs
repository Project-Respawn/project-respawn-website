import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import {aws,identity,assume,product,security,execution,read,save,E,digest} from './aws.mjs';
const [kind,mode]=process.argv.slice(2);assert.ok(['security','product'].includes(kind));assert.ok(['prepare','inspect','execute','status'].includes(mode));
const c=read(E+'/candidate.json'),stack=kind==='product'?product:security,restricted=kind==='product';
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(E+'/'+kind+'.template.json')).digest('hex'),c[kind+'Sha256']);
const who=await identity();let assumed;if(restricted)assumed=await assume();
if(mode==='prepare'){
 assert.equal(read(E+'/security-simulation.json').complete,true);
 if(restricted){assert.equal(read(E+'/security-installed.json').verified,true);const put=await aws('s3api','put-object',['--bucket','cdk-hnb659fds-assets-058264289478-eu-north-1','--key',c.key,'--body',E+'/product.template.json','--server-side-encryption','AES256','--checksum-algorithm','SHA256']);const head=await aws('s3api','head-object',['--bucket','cdk-hnb659fds-assets-058264289478-eu-north-1','--key',c.key,'--checksum-mode','ENABLED']);assert.equal(head.ServerSideEncryption,'AES256');assert.equal(head.ChecksumSHA256,Buffer.from(c.productSha256,'hex').toString('base64'));save('publication',{put,head});}
 const args=['--stack-name',stack,'--change-set-name',restricted?'team-hub-gate3-dark-target-20261005':'team-hub-gate3-security-20261005','--change-set-type','UPDATE','--capabilities','CAPABILITY_NAMED_IAM',...(restricted?['--template-url',c.url,'--role-arn',execution]:['--template-body','file://'+E+'/security.template.json'])];
 const r=await aws('cloudformation','create-change-set',args,restricted);save(kind+'-prepared',{at:new Date().toISOString(),identity:who,assumed,...r});console.log(JSON.stringify(r));
}else{
 const id=read(E+'/'+kind+'-prepared.json').Id;
 if(mode==='inspect'){
  const r=await aws('cloudformation','describe-change-set',['--stack-name',stack,'--change-set-name',id,'--include-property-values'],restricted);save(kind+'-change-set',r);assert.equal(r.Status,'CREATE_COMPLETE');assert.equal(r.ExecutionStatus,'AVAILABLE');
  const expected=c[kind==='product'?'expectedProductChanges':'expectedSecurityChanges'];
  for(const action of ['Add','Modify','Remove'])assert.deepEqual(r.Changes.filter(x=>x.ResourceChange.Action===action).map(x=>x.ResourceChange.LogicalResourceId).sort(),[...expected[action]].sort());
  assert.equal(r.Changes.length,Object.values(expected).flat().length);
  for(const x of r.Changes){assert.ok(!x.ResourceChange.Replacement||x.ResourceChange.Replacement==='False');assert.ok(x.ResourceChange.ResourceType.startsWith(restricted?'AWS::DynamoDB::':'AWS::IAM::'));}
  const t=await aws('cloudformation','get-template',['--stack-name',stack,'--change-set-name',id,'--template-stage','Original'],restricted);const body=typeof t.TemplateBody==='string'?JSON.parse(t.TemplateBody):t.TemplateBody;assert.equal(digest(body),digest(read(E+'/'+kind+'.template.json')));
  const live=(await aws('cloudformation','describe-stacks',['--stack-name',stack],restricted)).Stacks[0];if(restricted)assert.equal(live.RoleARN,execution);
  save(kind+'-execution-gate',{at:new Date().toISOString(),ready:true,changeSetId:id,stack,identity:who,assumed,rollbackEnabledOnExecution:true,changes:r.Changes,templateVerified:true});console.log(JSON.stringify({ready:true,kind,changes:r.Changes.map(x=>x.ResourceChange)}));
 }else if(mode==='execute'){
  if(restricted){const source=read(E+'/source-preexecute.json');assert.ok(source.empty&&source.complete);assert.ok(Date.now()-Date.parse(source.at)<300000);}
  const r=await aws('cloudformation','execute-change-set',['--stack-name',stack,'--change-set-name',id,'--no-disable-rollback'],restricted);save(kind+'-executed',{at:new Date().toISOString(),identity:who,assumed,changeSetId:id,rollbackEnabled:true,...r});console.log('Execution requested with rollback enabled; monitor before any next stage.');
 }else{const state=(await aws('cloudformation','describe-stacks',['--stack-name',stack],restricted)).Stacks[0];const events=await aws('cloudformation','describe-stack-events',['--stack-name',stack],restricted);save(kind+'-status',{at:new Date().toISOString(),stack:state,events:events.StackEvents});console.log(JSON.stringify({status:state.StackStatus,disableRollback:state.DisableRollback,latest:events.StackEvents.slice(0,5).map(e=>({id:e.LogicalResourceId,status:e.ResourceStatus,reason:e.ResourceStatusReason}))}));}
}
