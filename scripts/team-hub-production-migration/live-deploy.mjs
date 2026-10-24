// Exact reviewed dark update. Every mutation has a durable once-only intent.
import fs from 'node:fs';import assert from 'node:assert/strict';
import {E,manifest,plan,read,save,sha,canon,aws,retryRead,pause,gate,intent,setCaller} from './live-common.mjs';
const bucket='cdk-hnb659fds-assets-058264289478-eu-north-1';
const securityKey='production/'+manifest.security.sha256+'.json';
async function object(a,key,publish){
 const request={Bucket:bucket,Key:key,ChecksumAlgorithm:'SHA256',ChecksumSHA256:Buffer.from(a.sha256,'hex').toString('base64'),ServerSideEncryption:'AES256',IfNoneMatch:'*'};
 let head;try{head=await retryRead('s3api','head-object',{Bucket:bucket,Key:key,ChecksumMode:'ENABLED'});}catch(error){assert.match(String(error.stderr),/404|Not Found|NoSuchKey/);}
 if(!head){assert(publish,'ROLLBACK_ARTIFACT_MISSING');intent('publish-'+a.sha256,{request,sourceSha256:a.sha256});save('publish-response-'+a.sha256+'.json',aws('s3api','put-object',request,'operator',['--body',a.path]));}
 head=await retryRead('s3api','head-object',{Bucket:bucket,Key:key,ChecksumMode:'ENABLED'});assert.equal(head.ServerSideEncryption,'AES256');assert.equal(head.ChecksumSHA256,request.ChecksumSHA256);
 const local='.tmp/team-hub-production-'+a.sha256+'.download';aws('s3api','get-object',{},'operator',['--bucket',bucket,'--key',key,'--checksum-mode','ENABLED',local]);assert.equal(sha(fs.readFileSync(local)),a.sha256);fs.unlinkSync(local);
 save('publication-'+a.sha256+'.json',{at:new Date().toISOString(),sha256:a.sha256,key,head,downloadedHashVerified:true,newPublicationAllowed:publish});
}
async function publish(){gate();for(const a of [manifest.rollback.runtime,manifest.rollback.product])await object(a,a.key,false);for(const a of [manifest.runtime,manifest.product,manifest.security])await object(a,a.key??securityKey,true);console.log('Three exact artifacts and healthy rollback references verified.');}
async function changes(id,who){let token,first,rows=[];do{const page=await retryRead('cloudformation','describe-change-set',{ChangeSetName:id,IncludePropertyValues:true,...(token?{NextToken:token}:{})},who);first??=page;rows.push(...page.Changes??[]);token=page.NextToken;}while(token);return {...first,Changes:rows};}
async function stage(kind){
 assert(['security','product'].includes(kind));gate();assert(read(E+'/baseline-security-installed.json').passed);assert(read(E+'/baseline-product-installed.json').passed);
 for(const a of [manifest.runtime,manifest.product,manifest.security])assert(read(E+'/publication-'+a.sha256+'.json').downloadedHashVerified);
 let who='operator';if(kind==='product'){
  for(const file of ['security-result.json','security-installed.json','security-installed-iam.json','security-installed-analyzer.json'])assert(read(E+'/'+file).passed);
  const session=aws('sts','assume-role',{RoleArn:'arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Production-Deploy',RoleSessionName:'TeamHubCurrentDataParity20261024',DurationSeconds:3600});setCaller(session.Credentials);who='caller';save('product-caller.json',{identity:aws('sts','get-caller-identity',{},who),expiration:session.Credentials.Expiration,credentialsPersisted:false});
 }
 const stack=kind==='security'?plan.security.stack:plan.product.stack,a=manifest[kind],template=read(a.path),url='https://'+bucket+'.s3.eu-north-1.amazonaws.com/'+(a.key??securityKey);
 const request={StackName:stack,ChangeSetName:'current-data-parity-'+kind+'-20261024',ChangeSetType:'UPDATE',TemplateURL:url,Capabilities:['CAPABILITY_NAMED_IAM'],IncludeNestedStacks:true,...(kind==='product'?{RoleARN:'arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Production-ReadProofExecution'}:{})};
 intent(kind+'-change-set',{request});const created=aws('cloudformation','create-change-set',request,who);save(kind+'-change-set-created.json',created);let inspected;
 for(let n=0;n<120;n++){inspected=await changes(created.Id,who);if(inspected.Status==='CREATE_COMPLETE')break;if(inspected.Status==='FAILED'){save(kind+'-change-set-failed.json',inspected);throw Error('CHANGE_SET_FAILED '+inspected.StatusReason);}await pause(5000);}
 assert.equal(inspected.Status,'CREATE_COMPLETE');assert.equal(inspected.ExecutionStatus,'AVAILABLE');
 const expected=kind==='security'?new Map(plan.security.modifications.map(id=>[id,'Modify'])):new Map([...plan.product.additions.map(id=>[id,'Add']),...plan.product.codeOnlyModifications.map(id=>[id,'Modify'])]);assert.equal(inspected.Changes.length,expected.size);
 const seen=new Set();for(const row of inspected.Changes){assert.equal(row.Type,'Resource');const r=row.ResourceChange;assert.equal(r.Action,expected.get(r.LogicalResourceId));assert.equal(r.ResourceType,template.Resources[r.LogicalResourceId]?.Type);assert(!seen.has(r.LogicalResourceId));seen.add(r.LogicalResourceId);assert(!r.Replacement||r.Replacement==='False');assert(!r.ChangeSetId);assert.notEqual(r.ResourceType,'AWS::CloudFormation::Stack');if(r.Action==='Modify')for(const d of r.Details??[]){assert.equal(d.Target.Attribute,'Properties');const name=d.Target.Name;assert(kind==='product'?name==='Code'||name?.startsWith('Code.'):['Policies','PolicyDocument'].some(k=>name===k||name?.startsWith(k+'.')),'UNEXPECTED_PROPERTY '+name);assert(!d.Target.RequiresRecreation||d.Target.RequiresRecreation==='Never');}}
 const actual=(await retryRead('cloudformation','get-template',{StackName:stack,ChangeSetName:created.Id,TemplateStage:'Original'},who)).TemplateBody;assert.deepEqual(canon(typeof actual==='string'?JSON.parse(actual):actual),canon(template));
 save(kind+'-change-set-inspected.json',{at:new Date().toISOString(),passed:true,completeAwsChangeSet:inspected,templateMatched:true,rollbackEnabled:true});
 gate();const final=await changes(created.Id,who);assert.equal(final.ExecutionStatus,'AVAILABLE');assert.deepEqual(final.Changes,inspected.Changes);
 const execute={StackName:stack,ChangeSetName:created.Id};intent(kind+'-execute',{request:execute});save(kind+'-execute-response.json',aws('cloudformation','execute-change-set',execute,who));
 let current;for(let n=0;n<300;n++){current=(await retryRead('cloudformation','describe-stacks',{StackName:stack})).Stacks[0];save(kind+'-progress.json',current);if(current.StackStatus==='UPDATE_COMPLETE')break;if(/ROLLBACK|FAILED/.test(current.StackStatus)&&!current.StackStatus.endsWith('_IN_PROGRESS')){save(kind+'-events.json',await retryRead('cloudformation','describe-stack-events',{StackName:stack}));throw Error('DEPLOYMENT_FAILED '+current.StackStatus);}await pause(5000);}
 assert.equal(current.StackStatus,'UPDATE_COMPLETE');assert.notEqual(current.DisableRollback,true);save(kind+'-result.json',{at:new Date().toISOString(),passed:true,stack:current,changes:expected.size,automaticRetry:false});console.log(JSON.stringify({kind,status:current.StackStatus,changes:expected.size,rollbackEnabled:true}));
}
try{if(process.argv[2]==='publish')await publish();else await stage(process.argv[2]);}catch(error){save('deployment-stop.json',{at:new Date().toISOString(),stage:process.argv[2],message:String(error.message).slice(0,2000),automaticRetry:false});console.error(String(error.message).slice(0,2000));process.exitCode=1;}
