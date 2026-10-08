import fs from 'node:fs';import assert from 'node:assert/strict';import {aws,identity,E} from './aws.mjs';
import {arn,name,executionArn,runtimeArn,functionArn,secretArn,logArn} from './policies.mjs';
await identity();const read=n=>JSON.parse(fs.readFileSync(`${E}/${n}.json`));const result={at:new Date().toISOString(),analyzer:[],simulations:[],awsWrites:0};
const save=()=>fs.writeFileSync(E+'/security-review.json',JSON.stringify(result,null,2)+'\n');
for(const n of ['runtime-policy','runtime-boundary','caller-policy','execution-policy','executionBoundary-policy']){const r=await aws('accessanalyzer','validate-policy',['--policy-document','file://'+E+'/'+n+'.json','--policy-type','IDENTITY_POLICY']);result.analyzer.push({policy:n,findings:r.findings});save();}
const candidate=read('candidate');
const cases=[
 ['runtime','cognito-idp:AdminGetUser',arn('cognito-idp','userpool/eu-north-1_n24iLL7QE'),true],
 ['runtime','cognito-idp:ListUsers',arn('cognito-idp','userpool/eu-north-1_n24iLL7QE'),true],
 ['runtime','cognito-idp:AdminListGroupsForUser',arn('cognito-idp','userpool/eu-north-1_n24iLL7QE'),true],
 ['runtime','logs:PutLogEvents',logArn+':log-stream:review',true],
 ['runtime','secretsmanager:GetSecretValue',secretArn.replace('??????','abcdef'),true],
 ...['AdminCreateUser','AdminUpdateUserAttributes','AdminAddUserToGroup','AdminDeleteUser'].map(a=>['runtime','cognito-idp:'+a,arn('cognito-idp','userpool/eu-north-1_n24iLL7QE'),false]),
 ['runtime','cognito-idp:ListUsers',arn('cognito-idp','userpool/eu-north-1_OTHER'),false],
 ...['TeamHub','Tournaments','Creator','Commerce','Community'].map(d=>['runtime','dynamodb:GetItem',arn('dynamodb','table/ProjectRespawn-'+d+'-Ntgre-Data'),false]),
 ['runtime','s3:GetObject','arn:aws:s3:::foreign-business/test',false],['runtime','appsync:GraphQL','*',false],['runtime','iam:CreateRole','*',false],['runtime','cloudformation:CreateStack','*',false],['runtime','kms:Decrypt',arn('kms','key/11111111-1111-1111-1111-111111111111'),false],
 ['caller','cloudformation:CreateChangeSet',arn('cloudformation','stack/'+name+'/review'),true,{'cloudformation:RoleArn':executionArn,'cloudformation:TemplateUrl':candidate.templateUrl}],
 ['caller','cloudformation:CreateChangeSet',arn('cloudformation','stack/'+name+'/review'),false,{'cloudformation:RoleArn':executionArn,'cloudformation:TemplateUrl':'https://unreviewed.invalid/template'}],
 ['caller','iam:PassRole',executionArn,true,{'iam:PassedToService':'cloudformation.amazonaws.com'}],
 ['caller','iam:PassRole',runtimeArn,false,{'iam:PassedToService':'cloudformation.amazonaws.com'}],
 ...['ProjectRespawn-TeamHub-Ntgre','ProjectRespawn-Tournaments-Ntgre','ProjectRespawn-Core-Production','amplify-projectrespawnwebsite-Ntgre-sandbox-8bd9d02332'].map(n=>['caller','cloudformation:ExecuteChangeSet',arn('cloudformation','stack/'+n+'/review'),false]),
 ['execution','lambda:CreateFunction',functionArn,true],['execution','lambda:UpdateFunctionCode',functionArn.replace('Core','TeamHub'),false],
 ['execution','iam:CreateRole',runtimeArn,true,{'iam:PermissionsBoundary':arn('iam','policy/'+name+'-RuntimeBoundary')}],
 ['execution','iam:CreateRole',runtimeArn,false,{'iam:PermissionsBoundary':arn('iam','policy/foreign')}],
 ['execution','iam:DeleteRolePermissionsBoundary',runtimeArn,false],
 ['execution','iam:PassRole',runtimeArn,true,{'iam:PassedToService':'lambda.amazonaws.com'}],
 ['execution','secretsmanager:CreateSecret',secretArn.replace('??????','abcdef'),true],
 ['execution','secretsmanager:GetRandomPassword','*',true],
 ['execution','apigateway:POST','arn:aws:apigateway:eu-north-1::/apis',false],
 ['execution','cognito-idp:CreateUserPool','*',false],['execution','dynamodb:PutItem','*',false]
];
for(const[role,action,resource,expected,context={}]of cases){const file=role==='runtime'?'runtime-policy':role+'-policy';const cap=role==='runtime'?'runtime-boundary':role==='caller'?'caller-policy':'executionBoundary-policy';const args=['--policy-input-list',JSON.stringify([JSON.stringify(read(file))]),'--permissions-boundary-policy-input-list',JSON.stringify([JSON.stringify(read(cap))]),'--action-names',action,'--resource-arns',resource];if(Object.keys(context).length)args.push('--context-entries',JSON.stringify(Object.entries(context).map(([ContextKeyName,v])=>({ContextKeyName,ContextKeyValues:[v],ContextKeyType:'string'}))));const r=await aws('iam','simulate-custom-policy',args);const evaluations=r.EvaluationResults.map(x=>({action:x.EvalActionName,resource:x.EvalResourceName,decision:x.EvalDecision,missing:x.MissingContextValues}));result.simulations.push({role,action,resource,expected:expected?'allowed':'denied',pass:evaluations.every(x=>(x.decision==='allowed')===expected),evaluations});save();}
result.errors=result.analyzer.flatMap(x=>x.findings.filter(f=>['ERROR','SECURITY_WARNING'].includes(f.findingType)));result.failures=result.simulations.filter(x=>!x.pass);save();console.log(JSON.stringify({analyzer:result.analyzer.length,errors:result.errors.length,tests:result.simulations.length,failures:result.failures.length,awsWrites:0}));assert.equal(result.errors.length,0);assert.equal(result.failures.length,0);
