import fs from 'node:fs';import assert from 'node:assert/strict';
import {CloudFormationClient,DescribeStacksCommand,ListStackResourcesCommand,DeleteStackCommand,DescribeStackEventsCommand} from '@aws-sdk/client-cloudformation';
import {S3Client,DeleteObjectCommand,HeadObjectCommand} from '@aws-sdk/client-s3';
import {IAMClient,GetRoleCommand} from '@aws-sdk/client-iam';
import {LambdaClient,GetFunctionConfigurationCommand} from '@aws-sdk/client-lambda';
import {DynamoDBClient,DescribeTableCommand} from '@aws-sdk/client-dynamodb';
import {E,read,save,options,name,template,manifest,verifyPins,sleep} from './common.mjs';
verifyPins();const p=read(E+'/provision.json'),r={at:new Date().toISOString(),complete:false,absent:[],receipts:[]};save('cleanup',r);
const cf=new CloudFormationClient(options),s3=new S3Client(options);
if(p.stackId){
 const stack=(await cf.send(new DescribeStacksCommand({StackName:p.stackId}))).Stacks[0];assert.equal(stack.StackName,name);assert.ok(!stack.StackStatus.endsWith('_IN_PROGRESS'),'Wait for terminal infrastructure state');
 const resources=await cf.send(new ListStackResourcesCommand({StackName:p.stackId}));assert.ok(!resources.NextToken);
 for(const x of resources.StackResourceSummaries){assert.equal(x.ResourceType,template.Resources[x.LogicalResourceId]?.Type);const expected=template.Resources[x.LogicalResourceId].Properties;if(x.PhysicalResourceId)assert.equal(x.PhysicalResourceId,expected.TableName??expected.RoleName??expected.FunctionName);}
 save('cleanup-resources',resources);save('cleanup-stack-events',await cf.send(new DescribeStackEventsCommand({StackName:p.stackId})));
 const deleted=await cf.send(new DeleteStackCommand({StackName:p.stackId}));r.receipts.push({action:'DeleteStack',requestId:deleted.$metadata.requestId});save('cleanup',r);
 let absent=false;for(let i=0;i<100;i++){try{const current=(await cf.send(new DescribeStacksCommand({StackName:p.stackId}))).Stacks[0];if(current.StackStatus==='DELETE_COMPLETE'){absent=true;break;}assert.ok(current.StackStatus!=='DELETE_FAILED','Temporary deletion failed');}catch(e){if(e.name==='ValidationError'&&e.message.includes('does not exist')){absent=true;break;}throw e;}await sleep(4000);}assert.ok(absent,'Cleanup timeout');
}
if(p.uploaded){const deleted=await s3.send(new DeleteObjectCommand({Bucket:manifest.probe.bucket,Key:manifest.probe.key,...(p.upload.versionId?{VersionId:p.upload.versionId}:{})}));r.receipts.push({action:'DeleteExactProbeObject',requestId:deleted.$metadata.requestId});save('cleanup',r);}
const checks=[['role',new IAMClient(options),new GetRoleCommand({RoleName:name}),'NoSuchEntityException'],['probe',new LambdaClient(options),new GetFunctionConfigurationCommand({FunctionName:name+'-CursorProbe'}),'ResourceNotFoundException'],...['IsolatedOperational','IsolatedJournal'].map(k=>[k,new DynamoDBClient(options),new DescribeTableCommand({TableName:template.Resources[k].Properties.TableName}),'ResourceNotFoundException']),['artifact',s3,new HeadObjectCommand({Bucket:manifest.probe.bucket,Key:manifest.probe.key}),'NotFound']];
for(const [kind,client,command,error] of checks){let absent=false;try{await client.send(command);}catch(e){assert.ok(e.name===error||(kind==='role'&&e.name==='NoSuchEntity'),e.name);absent=true;}assert.ok(absent,kind+' remains');r.absent.push(kind);save('cleanup',r);}
r.complete=true;save('cleanup',r);console.log(JSON.stringify({complete:true,absent:r.absent}));
