import {aws,read,save,dir,prior} from './read-aws.mjs';
const policy=read(prior+'/first-create-policy.json'),manifest=read(prior+'/manifest.json');
const prefix='arn:aws:apigateway:eu-north-1::',api='thproof123',root=prefix+'/apis/'+api;
const role='arn:aws:iam::058264289478:role/ProjectRespawn-TeamHub-Ntgre-PreviewRead';
const fn='arn:aws:lambda:eu-north-1:058264289478:function:ProjectRespawn-TeamHub-Ntgre-PreviewRead';
const log='arn:aws:logs:eu-north-1:058264289478:log-group:/project-respawn/Ntgre/team-hub/preview';
const alarms=['ReadErrors','ApiErrors'].map(n=>'arn:aws:cloudwatch:eu-north-1:058264289478:alarm:ProjectRespawn-TeamHub-Ntgre-ReadProof-'+n);
const context=[{ContextKeyName:'aws:RequestedRegion',ContextKeyValues:['eu-north-1'],ContextKeyType:'string'},{ContextKeyName:'aws:CurrentTime',ContextKeyValues:[new Date().toISOString()],ContextKeyType:'date'}];
const jobs=[
 ['api-cleanup',['apigateway:GET','apigateway:DELETE'],[root]],
 ['stage-cleanup',['apigateway:GET','apigateway:DELETE'],[root+'/stages/$default']],
 ['authorizer-cleanup',['apigateway:GET','apigateway:DELETE'],[root+'/authorizers/proof']],
 ['integration-cleanup',['apigateway:GET','apigateway:DELETE'],[root+'/integrations/proof']],
 ['route-cleanup',['apigateway:GET','apigateway:DELETE'],[root+'/routes/proof']],
 ['lambda-cleanup',['lambda:DeleteFunction','lambda:GetFunction','lambda:GetFunctionConfiguration'],[fn]],
 ['role-cleanup',['iam:DeleteRole','iam:DeleteRolePolicy','iam:ListRolePolicies','iam:ListAttachedRolePolicies','iam:GetRole','iam:GetRolePolicy','iam:TagRole','iam:UntagRole'],[role]],
 ['permission-cleanup',['lambda:RemovePermission','lambda:GetPolicy'],[fn]],
 ['logs-cleanup',['logs:DeleteLogGroup'],[log,log+':*']],
 ['logs-stabilize',['logs:DescribeLogGroups'],['*']],
 ['alarms-cleanup',['cloudwatch:DeleteAlarms','cloudwatch:DescribeAlarms'],alarms],
 ['lambda-create',['lambda:CreateFunction','lambda:GetFunction','lambda:TagResource','lambda:GetRuntimeManagementConfig','lambda:GetFunctionRecursionConfig'],[fn]],
 ['role-create',['iam:CreateRole','iam:PutRolePolicy','iam:GetRole','iam:TagRole'],[role],[{ContextKeyName:'iam:PermissionsBoundary',ContextKeyValues:['arn:aws:iam::058264289478:policy/ProjectRespawn-TeamHub-Ntgre-PreviewBoundary'],ContextKeyType:'string'}]],
 ['default-lambda-kms',['kms:Encrypt','kms:Decrypt','kms:DescribeKey','kms:CreateGrant'],['arn:aws:kms:eu-north-1:058264289478:key/13ae83f9-bc5f-4486-a013-e07b9d7d52e7']],
];
const results=[];let cursor=0;await Promise.all(Array.from({length:3},async()=>{while(cursor<jobs.length){const [name,actions,resources,extra=[]]=jobs[cursor++];const request={PolicyInputList:[JSON.stringify(policy)],PermissionsBoundaryPolicyInputList:[JSON.stringify(policy)],ActionNames:actions,ResourceArns:resources,ContextEntries:[...context,...extra]};save('lifecycle-request-'+name,request);const response=await aws('iam','simulate-custom-policy','--cli-input-json','file://'+dir+'/lifecycle-request-'+name+'.json');save('lifecycle-response-'+name,response);const rows=response.EvaluationResults.flatMap(e=>e.ResourceSpecificResults?.length?e.ResourceSpecificResults.map(r=>({action:e.EvalActionName,resource:r.EvalResourceName,decision:r.EvalResourceDecision,missing:r.MissingContextValues??e.MissingContextValues??[]})):[{action:e.EvalActionName,resource:e.EvalResourceName,decision:e.EvalDecision,missing:e.MissingContextValues??[]}]);results.push({name,rows});}}));
const failures=results.flatMap(j=>j.rows.filter(r=>r.decision!=='allowed'||r.missing.length).map(r=>({job:j.name,...r})));
save('lifecycle-simulations',{at:new Date().toISOString(),expiresAt:manifest.expiresAt,results:results.sort((a,b)=>a.name.localeCompare(b.name)),failures,awsWrites:0});
console.log(JSON.stringify({jobs:results.length,assertions:results.reduce((n,r)=>n+r.rows.length,0),failures}));
