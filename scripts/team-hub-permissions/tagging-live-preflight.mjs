// Fresh read-only failed-record, collision, key and capacity verification.
import assert from 'node:assert/strict';
import {E,B,read,save,retryRead as aws,pins,recovery,manifest,digest} from './tagging-live-common.mjs';
pins();const r={at:new Date().toISOString(),identity:await aws('sts','get-caller-identity'),collisions:[],awsWrites:0};assert.equal(r.identity.Arn,recovery.operator);assert.equal(r.identity.Account,recovery.account);
const target=recovery.stages.find(x=>x.kind==='failed-record').request.StackName;
const stack=(await aws('cloudformation','describe-stacks',{StackName:target})).Stacks[0];assert.equal(stack.StackId,target);assert.equal(stack.StackName,'ProjectRespawn-TeamHub-Production');assert.equal(stack.StackStatus,'ROLLBACK_COMPLETE');
const failedResources=(await aws('cloudformation','list-stack-resources',{StackName:target})).StackResourceSummaries;assert(failedResources.every(x=>['DELETE_COMPLETE','DELETE_SKIPPED'].includes(x.ResourceStatus)),'FAILED_STACK_HAS_NONTERMINAL_OR_ACTIVE_RESOURCE');r.failedStack={stackId:target,status:stack.StackStatus,resources:failedResources};
const template=read(manifest.product.path);
for(const [id,x]of Object.entries(template.Resources)){const p=x.Properties;let op;
 if(x.Type==='AWS::IAM::Role')op=['iam','get-role',{RoleName:p.RoleName}];
 if(x.Type==='AWS::Lambda::Function')op=['lambda','get-function-configuration',{FunctionName:p.FunctionName}];
 if(x.Type==='AWS::DynamoDB::Table')op=['dynamodb','describe-table',{TableName:p.TableName}];
 if(x.Type==='AWS::Logs::LogGroup'){const v=await aws('logs','describe-log-groups',{logGroupNamePrefix:p.LogGroupName});assert(!v.logGroups.some(g=>g.logGroupName===p.LogGroupName));r.collisions.push({id,name:p.LogGroupName,absent:true});continue;}
 if(op){let absent=false;try{await aws(...op);}catch(e){assert.match(String(e.stderr),/ResourceNotFoundException|NoSuchEntity/);absent=true;}assert(absent,'RESOURCE_COLLISION '+id);r.collisions.push({id,request:op[2],absent:true});}
}
const alarms=(await aws('cloudwatch','describe-alarms',{AlarmNamePrefix:'ProjectRespawn-TeamHub-Production'})).MetricAlarms;assert.equal(alarms.length,0);r.productAlarmsAbsent=true;
const ApiId=recovery.expectedApiId;r.api=await aws('apigatewayv2','get-api',{ApiId});assert.equal(r.api.Name,'ProjectRespawn-TeamHub-Production');
for(const action of ['get-stages','get-routes','get-integrations','get-authorizers']){const v=await aws('apigatewayv2',action,{ApiId});assert.equal(v.Items?.length??0,0);assert(!v.NextToken);r[action]={count:0};}
r.capacity=await aws('lambda','get-account-settings');assert(r.capacity.AccountLimit.UnreservedConcurrentExecutions>0);r.reservedConcurrencyRequested=0;
r.keys=[];for(const key of ['arn:aws:kms:eu-north-1:058264289478:key/13ae83f9-bc5f-4486-a013-e07b9d7d52e7','arn:aws:kms:eu-north-1:058264289478:key/8802a37a-f981-4384-b538-fdb4f7aba74a']){const v=(await aws('kms','describe-key',{KeyId:key})).KeyMetadata;assert.equal(v.KeyManager,'AWS');assert.equal(v.KeyState,'Enabled');const policy=JSON.parse((await aws('kms','get-key-policy',{KeyId:key,PolicyName:'default'})).Policy);r.keys.push({arn:v.Arn,state:v.KeyState,keyManager:v.KeyManager,policyDigest:digest(policy)});}
r.passed=true;save('fresh-resource-preflight.json',r);console.log(JSON.stringify({failedStackVerified:true,productNameCollisions:0,apiEmpty:true,unreserved:r.capacity.AccountLimit.UnreservedConcurrentExecutions,awsWrites:0}));
