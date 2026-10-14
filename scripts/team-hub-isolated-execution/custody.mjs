import assert from 'node:assert/strict';import {aws,read,save,P} from './read.mjs';
import {requireReservedConcurrency} from './guards.mjs';
const c=read(P+'/candidate.json'),t=read(c.template.path),name=c.stack,user='arn:aws:iam::058264289478:user/RavenTest';
const r={at:new Date().toISOString(),identity:await aws('sts','get-caller-identity'),absent:[],operator:[],simulations:[],complete:false,awsWrites:0};save('custody',r);
assert.equal(r.identity.Account,'058264289478');assert.equal(r.identity.Arn,user);
const checkAbsent=async(s,a,input,code)=>{let absent=false;try{await aws(s,a,input);}catch(e){assert.ok(e.message.includes(code),e.message);absent=true;}assert.ok(absent,'Temporary resource collision');r.absent.push({s,a,input});save('custody',r);};
await checkAbsent('cloudformation','describe-stacks',{StackName:name},'does not exist');
await checkAbsent('iam','get-role',{RoleName:name},'NoSuchEntity');
await checkAbsent('lambda','get-function-configuration',{FunctionName:name+'-CursorProbe'},'ResourceNotFoundException');
for(const id of ['IsolatedOperational','IsolatedJournal'])await checkAbsent('dynamodb','describe-table',{TableName:t.Resources[id].Properties.TableName},'ResourceNotFoundException');
await checkAbsent('s3api','head-object',{Bucket:c.probe.bucket,Key:c.probe.key},'404');
r.accountSettings=await aws('lambda','get-account-settings');save('custody',r);requireReservedConcurrency(r.accountSettings,t.Resources.CursorProbe.Properties.ReservedConcurrentExecutions);
r.operatorUser=(await aws('iam','get-user',{UserName:'RavenTest'})).User;
r.userInline=(await aws('iam','list-user-policies',{UserName:'RavenTest'})).PolicyNames;
for(const PolicyName of r.userInline)r.operator.push({kind:'inline',name:PolicyName,document:(await aws('iam','get-user-policy',{UserName:'RavenTest',PolicyName})).PolicyDocument});
r.userGroups=(await aws('iam','list-groups-for-user',{UserName:'RavenTest'})).Groups;
r.attached=(await aws('iam','list-attached-user-policies',{UserName:'RavenTest'})).AttachedPolicies;
for(const p of r.attached){const meta=(await aws('iam','get-policy',{PolicyArn:p.PolicyArn})).Policy;r.operator.push({kind:'managed',arn:p.PolicyArn,version:meta.DefaultVersionId,document:(await aws('iam','get-policy-version',{PolicyArn:p.PolicyArn,VersionId:meta.DefaultVersionId})).PolicyVersion.Document});}
save('custody',r);
const role='arn:aws:iam::058264289478:role/'+name,fn='arn:aws:lambda:eu-north-1:058264289478:function:'+name+'-CursorProbe',stack='arn:aws:cloudformation:eu-north-1:058264289478:stack/'+name+'/*';
const groups=[
 [role,['iam:CreateRole','iam:GetRole','iam:PutRolePolicy','iam:GetRolePolicy','iam:DeleteRolePolicy','iam:DeleteRole'],{}],
 [role,['sts:AssumeRole'],{'sts:RoleSessionName':'verification'}],
 [t.Resources.CursorProbe.Properties.Role,['iam:PassRole'],{'iam:PassedToService':'lambda.amazonaws.com','iam:AssociatedResourceArn':fn}],
 [fn,['lambda:CreateFunction','lambda:GetFunction','lambda:GetFunctionConfiguration','lambda:TagResource','lambda:PutFunctionConcurrency','lambda:DeleteFunctionConcurrency','lambda:DeleteFunction','lambda:InvokeFunction'],{}],
 [stack,['cloudformation:CreateChangeSet','cloudformation:ExecuteChangeSet','cloudformation:DescribeChangeSet','cloudformation:DescribeStacks','cloudformation:ListStackResources','cloudformation:DeleteStack'],{}],
 ['arn:aws:s3:::'+c.probe.bucket+'/'+c.probe.key,['s3:PutObject','s3:GetObject','s3:DeleteObject'],{}]
 ];
 for(const id of ['IsolatedOperational','IsolatedJournal'])groups.push(['arn:aws:dynamodb:eu-north-1:058264289478:table/'+t.Resources[id].Properties.TableName,['dynamodb:CreateTable','dynamodb:DescribeTable','dynamodb:DeleteTable','dynamodb:TagResource','dynamodb:ListTagsOfResource','dynamodb:DescribeContinuousBackups','dynamodb:UpdateContinuousBackups'],{}]);
for(const [resource,actions,context]of groups){if(r.simulations.length)await new Promise(resolve=>setTimeout(resolve,15000));const result=await aws('iam','simulate-principal-policy',{PolicySourceArn:user,ActionNames:actions,ResourceArns:[resource],ContextEntries:Object.entries({'aws:RequestedRegion':'eu-north-1',...context}).map(([ContextKeyName,v])=>({ContextKeyName,ContextKeyValues:[v],ContextKeyType:'string'})),MaxItems:1000});r.simulations.push({resource,actions,result});save('custody',r);assert.ok(!result.IsTruncated);for(const x of result.EvaluationResults)assert.equal(x.EvalDecision,'allowed',x.EvalActionName);}
r.complete=true;save('custody',r);console.log(JSON.stringify({complete:true,collisions:0,operator:user,cases:r.simulations.reduce((n,x)=>n+x.result.EvaluationResults.length,0)}));
