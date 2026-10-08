export const account='058264289478',region='eu-north-1',name='ProjectRespawn-Core-Ntgre';
export const arn=(service,resource)=>`arn:aws:${service}:${['iam','s3'].includes(service)?'':region}:${service==='s3'?'':account}:${resource}`;
export const runtimeArn=arn('iam','role/'+name+'-Contracts'),executionArn=arn('iam','role/'+name+'-Execution'),callerArn=arn('iam','role/'+name+'-Deploy');
export const functionArn=arn('lambda','function:'+name+'-Contracts'),secretArn=arn('secretsmanager','secret:'+name+'-Cursor-??????'),logArn=arn('logs','log-group:/project-respawn/Ntgre/core/contracts');
const p=Statement=>({Version:'2012-10-17',Statement}),s=(Effect,Action,Resource,Condition)=>({Effect,Action,Resource,...(Condition?{Condition}:{})});
const except=(actions,resources)=>({Effect:'Deny',Action:actions,NotResource:resources});
export function runtime(poolId,keys){
 const actions=['logs:CreateLogStream','logs:PutLogEvents','cognito-idp:AdminGetUser','cognito-idp:AdminListGroupsForUser','cognito-idp:ListUsers','secretsmanager:GetSecretValue'];
 const pool=arn('cognito-idp','userpool/'+poolId);
 const identity=p([{Effect:'Deny',NotAction:[...actions,'kms:Decrypt'],Resource:'*'},s('Allow',actions.slice(0,2),logArn+':*'),s('Allow',actions.slice(2,5),pool),s('Allow',actions[5],secretArn),except('cognito-idp:*',pool),except('logs:*',logArn+':*'),except('secretsmanager:*',secretArn),except('kms:Decrypt',keys)]);
 // Boundary cap only: there is no KMS Allow in the runtime identity policy.
 const boundary=p([...identity.Statement,s('Allow','kms:Decrypt',keys)]);
 return {identity,boundary};
}
export function deployment({url,objects,keys}){
 const stack=arn('cloudformation','stack/'+name+'/*'),boundary=arn('iam','policy/'+name+'-RuntimeBoundary');
 const read=['cloudformation:DescribeStacks','cloudformation:DescribeStackEvents','cloudformation:ListStackResources','cloudformation:GetTemplate','cloudformation:DescribeChangeSet'];
 const cfn=[...read,'cloudformation:CreateChangeSet','cloudformation:ExecuteChangeSet','cloudformation:DeleteChangeSet'];
 const caller=p([{Effect:'Deny',NotAction:[...cfn,'iam:PassRole','s3:GetObject'],Resource:'*'},except('cloudformation:*',stack),s('Allow',read,stack),s('Allow','cloudformation:CreateChangeSet',stack,{StringEquals:{'cloudformation:RoleArn':executionArn,'cloudformation:TemplateUrl':url}}),s('Allow',['cloudformation:ExecuteChangeSet','cloudformation:DeleteChangeSet'],stack),s('Allow','iam:PassRole',executionArn,{StringEquals:{'iam:PassedToService':'cloudformation.amazonaws.com'}}),s('Allow','s3:GetObject',objects)]);
 const lambdaActions=['lambda:CreateFunction','lambda:GetFunction','lambda:GetFunctionConfiguration','lambda:UpdateFunctionCode','lambda:UpdateFunctionConfiguration','lambda:DeleteFunction','lambda:ListTags','lambda:TagResource','lambda:UntagResource','lambda:PutFunctionConcurrency','lambda:GetFunctionConcurrency','lambda:DeleteFunctionConcurrency'];
 const roleReadWrite=['iam:GetRole','iam:GetRolePolicy','iam:ListRolePolicies','iam:ListAttachedRolePolicies','iam:PutRolePolicy','iam:DeleteRolePolicy','iam:DeleteRole','iam:UpdateAssumeRolePolicy','iam:TagRole','iam:UntagRole'];
 const logs=['logs:CreateLogGroup','logs:DeleteLogGroup','logs:PutRetentionPolicy','logs:DeleteRetentionPolicy','logs:TagResource','logs:UntagResource','logs:ListTagsForResource'];
 const secrets=['secretsmanager:CreateSecret','secretsmanager:DescribeSecret','secretsmanager:UpdateSecret','secretsmanager:PutSecretValue','secretsmanager:DeleteSecret','secretsmanager:RestoreSecret','secretsmanager:TagResource','secretsmanager:UntagResource'];
 const alarms=['cloudwatch:PutMetricAlarm','cloudwatch:DeleteAlarms','cloudwatch:DescribeAlarms','cloudwatch:TagResource','cloudwatch:UntagResource','cloudwatch:ListTagsForResource'];
 const statements=[s('Allow',lambdaActions,functionArn),s('Allow',roleReadWrite,runtimeArn),s('Allow',['iam:CreateRole','iam:PutRolePermissionsBoundary'],runtimeArn,{StringEquals:{'iam:PermissionsBoundary':boundary}}),s('Allow','iam:PassRole',runtimeArn,{StringEquals:{'iam:PassedToService':'lambda.amazonaws.com'}}),s('Allow','iam:GetPolicy',boundary),s('Allow',logs,[logArn,logArn+':*']),s('Allow',['logs:DescribeLogGroups','secretsmanager:GetRandomPassword'],'*'),s('Allow',secrets,secretArn),s('Allow',alarms,arn('cloudwatch','alarm:'+name+'-*')),s('Allow','s3:GetObject',objects)];
 const actions=[...new Set(statements.flatMap(x=>[].concat(x.Action)))];
 const serviceEncryption=['kms:Encrypt','kms:Decrypt','kms:ReEncrypt*','kms:GenerateDataKey*','kms:CreateGrant','kms:DescribeKey'];
 const execution=p([{Effect:'Deny',NotAction:[...actions,...serviceEncryption],Resource:'*'},...statements,except('kms:*',keys),s('Deny','iam:DeleteRolePermissionsBoundary','*'),{Effect:'Deny',Action:['secretsmanager:CreateSecret','secretsmanager:UpdateSecret'],Resource:'*',Condition:{Null:{'secretsmanager:KmsKeyArn':'false'}}}]);
 // Same practical boundary as execution identity; AWS-managed KMS cap is not an identity grant.
 const executionBoundary=p([...execution.Statement,s('Allow',serviceEncryption,keys)]);
 return {caller,execution,executionBoundary};
}
