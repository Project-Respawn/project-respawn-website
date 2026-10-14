import fs from 'node:fs';import assert from 'node:assert/strict';
import {CloudFormationClient,CreateChangeSetCommand,DescribeChangeSetCommand,ExecuteChangeSetCommand,DescribeStacksCommand,DescribeStackEventsCommand,ListStackResourcesCommand} from '@aws-sdk/client-cloudformation';
import {S3Client,PutObjectCommand,HeadObjectCommand} from '@aws-sdk/client-s3';
import {STSClient,GetCallerIdentityCommand} from '@aws-sdk/client-sts';
import {E,read,save,options,manifest,template,name,requireGates,sleep} from './common.mjs';
requireGates();
const cf=new CloudFormationClient(options),s3=new S3Client(options);
const id=await new STSClient(options).send(new GetCallerIdentityCommand({}));assert.equal(id.Arn,'arn:aws:iam::058264289478:user/RavenTest');
const mode=process.argv[2];assert.ok(['prepare','execute'].includes(mode));
if(mode==='prepare'){
 assert.ok(!fs.existsSync(E+'/provision.json'),'No automatic repeat');
 const start=new Date(Date.now()+2*60000),end=new Date(start.getTime()+3600000);
 const r={at:new Date().toISOString(),identity:id,stack:name,window:{NotBefore:start.toISOString(),ExpiresAt:end.toISOString()},uploaded:false,prepared:false,executed:false,complete:false};save('provision',r);
 try{await s3.send(new HeadObjectCommand({Bucket:manifest.probe.bucket,Key:manifest.probe.key}));throw Error('Artifact collision');}catch(e){if(e.name!=='NotFound')throw e;}
 const put=await s3.send(new PutObjectCommand({Bucket:manifest.probe.bucket,Key:manifest.probe.key,Body:fs.readFileSync(manifest.probe.path),ChecksumSHA256:Buffer.from(manifest.probe.sha256,'hex').toString('base64'),IfNoneMatch:'*'}));r.uploaded=true;r.upload={requestId:put.$metadata.requestId,versionId:put.VersionId,checksum:put.ChecksumSHA256};save('provision',r);
 const head=await s3.send(new HeadObjectCommand({Bucket:manifest.probe.bucket,Key:manifest.probe.key,ChecksumMode:'ENABLED'}));assert.equal(head.ChecksumSHA256,Buffer.from(manifest.probe.sha256,'hex').toString('base64'));
 const created=await cf.send(new CreateChangeSetCommand({StackName:name,ChangeSetName:'quota-corrected-isolated-20261012',ChangeSetType:'CREATE',TemplateBody:fs.readFileSync(manifest.template.path,'utf8'),Capabilities:['CAPABILITY_NAMED_IAM'],Parameters:Object.entries(r.window).map(([ParameterKey,ParameterValue])=>({ParameterKey,ParameterValue})),Tags:[{Key:'Owner',Value:'TeamHubIsolatedVerification'},{Key:'RunId',Value:'20261012v1'}],Description:'Exact reviewed quota-corrected isolated verification; no live authority changes'}));r.changeSetId=created.Id;r.stackId=created.StackId;save('provision',r);
 let change;for(let i=0;i<40;i++){change=await cf.send(new DescribeChangeSetCommand({ChangeSetName:created.Id,IncludePropertyValues:true}));save('change-set',change);if(!['CREATE_PENDING','CREATE_IN_PROGRESS'].includes(change.Status))break;await sleep(3000);}
 assert.equal(change.Status,'CREATE_COMPLETE');assert.equal(change.ExecutionStatus,'AVAILABLE');assert.ok(!change.NextToken);assert.equal(change.Changes.length,4);
 for(const c of change.Changes){const x=c.ResourceChange;assert.equal(x.Action,'Add');assert.equal(x.ResourceType,template.Resources[x.LogicalResourceId]?.Type);assert.ok(!x.Replacement||x.Replacement==='False');assert.ok(!x.ChangeSetId);}
 assert.deepEqual(change.Changes.map(c=>c.ResourceChange.LogicalResourceId).sort(),Object.keys(template.Resources).sort());
 r.prepared=true;save('provision',r);console.log(JSON.stringify({prepared:true,changeSet:r.changeSetId,changes:4,executed:false}));
}else{
 const r=read(E+'/provision.json');assert.equal(r.prepared,true);assert.equal(r.executed,false);assert.ok(Date.parse(r.window.ExpiresAt)-Date.now()>25*60000,'Insufficient reviewed window');
 const change=await cf.send(new DescribeChangeSetCommand({ChangeSetName:r.changeSetId,IncludePropertyValues:true}));assert.equal(change.ExecutionStatus,'AVAILABLE');assert.deepEqual(change.Changes,read(E+'/change-set.json').Changes);
 r.executionAttemptedAt=new Date().toISOString();save('provision',r);
 const receipt=await cf.send(new ExecuteChangeSetCommand({ChangeSetName:r.changeSetId,DisableRollback:false}));r.executed=true;r.executionRequestId=receipt.$metadata.requestId;save('provision',r);
 let stack;for(let i=0;i<100;i++){stack=(await cf.send(new DescribeStacksCommand({StackName:name}))).Stacks[0];save('stack',stack);if(!stack.StackStatus.endsWith('_IN_PROGRESS'))break;await sleep(5000);}
 save('stack-events',await cf.send(new DescribeStackEventsCommand({StackName:name})));assert.equal(stack.StackStatus,'CREATE_COMPLETE');
 const resources=await cf.send(new ListStackResourcesCommand({StackName:name}));assert.ok(!resources.NextToken);assert.equal(resources.StackResourceSummaries.length,4);save('resources',resources);r.complete=true;save('provision',r);console.log(JSON.stringify({complete:true,status:stack.StackStatus,resources:4}));
}
