import assert from 'node:assert/strict';
import {IAMClient,GetRoleCommand,GetRolePolicyCommand,ListRolePoliciesCommand,ListAttachedRolePoliciesCommand,SimulatePrincipalPolicyCommand} from '@aws-sdk/client-iam';
import {LambdaClient,GetFunctionCommand,GetFunctionConcurrencyCommand,GetPolicyCommand,GetFunctionUrlConfigCommand,ListEventSourceMappingsCommand} from '@aws-sdk/client-lambda';
import {DynamoDBClient,DescribeTableCommand,ListTagsOfResourceCommand,DescribeContinuousBackupsCommand} from '@aws-sdk/client-dynamodb';
import {flatten} from '../migration/iam-validation.mjs';
import {E,read,save,options,template,name,manifest,canonical,sleep,verifyPins} from './common.mjs';
verifyPins();assert.equal(read(E+'/provision.json').complete,true);
const r={at:new Date().toISOString(),complete:false,checks:[],tables:[]};save('installed',r);
const iam=new IAMClient(options),lambda=new LambdaClient(options),ddb=new DynamoDBClient(options),roleArn='arn:aws:iam::058264289478:role/'+name;
const decode=x=>JSON.parse(decodeURIComponent(x));
const role=(await iam.send(new GetRoleCommand({RoleName:name}))).Role;
assert.equal(role.Arn,roleArn);assert.ok(!role.PermissionsBoundary);assert.equal(canonical(decode(role.AssumeRolePolicyDocument)),canonical(template.Resources.IsolatedRunner.Properties.AssumeRolePolicyDocument));
const inline=await iam.send(new ListRolePoliciesCommand({RoleName:name}));assert.ok(!inline.IsTruncated);assert.deepEqual(inline.PolicyNames,['ExactIsolatedTablesOnly']);const managed=await iam.send(new ListAttachedRolePoliciesCommand({RoleName:name}));assert.ok(!managed.IsTruncated);assert.equal(managed.AttachedPolicies.length,0);
const window=read(E+'/provision.json').window;
const expected=JSON.parse(JSON.stringify(template.Resources.IsolatedRunner.Properties.Policies[0].PolicyDocument).replaceAll('{"Ref":"NotBefore"}',JSON.stringify(window.NotBefore)).replaceAll('{"Ref":"ExpiresAt"}',JSON.stringify(window.ExpiresAt)));
const policy=decode((await iam.send(new GetRolePolicyCommand({RoleName:name,PolicyName:'ExactIsolatedTablesOnly'}))).PolicyDocument);assert.equal(canonical(policy),canonical(expected));r.role={role,policy};save('installed',r);
for(const key of ['IsolatedOperational','IsolatedJournal']){
 const p=template.Resources[key].Properties,t=(await ddb.send(new DescribeTableCommand({TableName:p.TableName}))).Table;
 assert.equal(t.TableStatus,'ACTIVE');assert.equal(t.DeletionProtectionEnabled,false);assert.equal(canonical(t.KeySchema),canonical(p.KeySchema));assert.equal(t.BillingModeSummary.BillingMode,'PAY_PER_REQUEST');
 assert.deepEqual((t.GlobalSecondaryIndexes??[]).map(x=>({IndexName:x.IndexName,KeySchema:x.KeySchema,Projection:x.Projection})).sort((a,b)=>a.IndexName.localeCompare(b.IndexName)),(p.GlobalSecondaryIndexes??[]).toSorted((a,b)=>a.IndexName.localeCompare(b.IndexName)));
 const tags=await ddb.send(new ListTagsOfResourceCommand({ResourceArn:t.TableArn}));assert.ok(!tags.NextToken);for(const tag of p.Tags)assert.ok(tags.Tags.some(x=>x.Key===tag.Key&&x.Value===tag.Value));
 assert.ok(!t.SSEDescription?.KMSMasterKeyArn,'Unexpected customer-managed encryption');
 const recovery=await ddb.send(new DescribeContinuousBackupsCommand({TableName:p.TableName}));assert.equal(recovery.ContinuousBackupsDescription.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus,'DISABLED');r.tables.push({table:t,tags:tags.Tags,recovery});save('installed',r);
}
const probe=template.Resources.CursorProbe.Properties,fn=await lambda.send(new GetFunctionCommand({FunctionName:probe.FunctionName}));
const c=fn.Configuration;assert.equal(c.State,'Active');assert.equal(c.LastUpdateStatus,'Successful');assert.equal(c.CodeSha256,Buffer.from(manifest.probe.sha256,'hex').toString('base64'));
for(const key of ['Role','Runtime','Handler','MemorySize','Timeout','Architectures'])assert.equal(canonical(c[key]),canonical(probe[key]),key);
for(const [key,value] of Object.entries(probe.LoggingConfig))assert.equal(c.LoggingConfig[key],value,key);
assert.ok(!c.Environment?.Variables||Object.keys(c.Environment.Variables).length===0);assert.ok(!c.Layers?.length);assert.ok(!c.VpcConfig?.VpcId);
assert.ok(!Object.hasOwn(await lambda.send(new GetFunctionConcurrencyCommand({FunctionName:probe.FunctionName})),'ReservedConcurrentExecutions'));
for(const Command of [GetPolicyCommand,GetFunctionUrlConfigCommand]){let absent=false;try{await lambda.send(new Command({FunctionName:probe.FunctionName}));}catch(e){assert.equal(e.name,'ResourceNotFoundException');absent=true;}assert.ok(absent);}
const mappings=await lambda.send(new ListEventSourceMappingsCommand({FunctionName:probe.FunctionName}));assert.ok(!mappings.NextMarker);assert.equal(mappings.EventSourceMappings.length,0);r.probe={configuration:c,tags:fn.Tags,triggerCount:0,reservedConcurrency:'UNSET'};save('installed',r);
const resources=[...policy.Statement[1].NotResource,'arn:aws:dynamodb:eu-north-1:058264289478:table/ProjectRespawn-TeamHub-Ntgre-Operational','arn:aws:dynamodb:eu-north-1:058264289478:table/ProjectRespawn-TeamHub-Ntgre-Journal',probe.Role,'arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-Core-Ntgre-Contracts','arn:aws:secretsmanager:eu-north-1:058264289478:secret:ProjectRespawn-TeamHub-Ntgre-Cursor-wbclUV','arn:aws:kms:eu-north-1:058264289478:key/8802a37a-f981-4384-b538-fdb4f7aba74a'];
for(const [label,time,region] of [['inside',new Date(Date.parse(window.NotBefore)+1000),'eu-north-1'],['expired',new Date(Date.parse(window.ExpiresAt)+1000),'eu-north-1'],['wrong-region',new Date(Date.parse(window.NotBefore)+1000),'us-east-1']]){
 await sleep(15000);
 const result=await iam.send(new SimulatePrincipalPolicyCommand({PolicySourceArn:roleArn,ActionNames:[...policy.Statement[0].NotAction,'dynamodb:UpdateItem','iam:PassRole','lambda:InvokeFunction','secretsmanager:GetSecretValue','kms:Decrypt'],ResourceArns:resources,ContextEntries:[{ContextKeyName:'aws:CurrentTime',ContextKeyValues:[time.toISOString()],ContextKeyType:'date'},{ContextKeyName:'aws:RequestedRegion',ContextKeyValues:[region],ContextKeyType:'string'}],MaxItems:1000}));assert.ok(!result.IsTruncated);
 const rows=flatten(result).filter(x=>x.EvalResourceName.startsWith('arn:aws:'+x.EvalActionName.split(':')[0]+':'));
 for(const x of rows){const owned=policy.Statement[1].NotResource.includes(x.EvalResourceName),allowedAction=policy.Statement[0].NotAction.includes(x.EvalActionName);assert.equal(x.EvalDecision,!owned||!allowedAction||label==='wrong-region'?'explicitDeny':label==='expired'?'implicitDeny':'allowed',x.EvalActionName+' '+x.EvalResourceName);}
 r.checks.push({label,rows});save('installed',r);
}
r.complete=true;save('installed',r);console.log(JSON.stringify({complete:true,cases:r.checks.reduce((n,x)=>n+x.rows.length,0),resources:4}));
