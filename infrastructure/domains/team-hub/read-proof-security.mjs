export const proofTarget = { account: '058264289478', region: 'eu-north-1', stack: 'ProjectRespawn-TeamHub-Ntgre' };
const { account, region, stack } = proofTarget;
export const previewLogArn = `arn:aws:logs:${region}:${account}:log-group:/project-respawn/Ntgre/team-hub/preview:*`;
export const previewRoleArn = `arn:aws:iam::${account}:role/${stack}-PreviewRead`;
export const previewBoundaryArn = `arn:aws:iam::${account}:policy/${stack}-PreviewBoundary`;
export const executionRoleArn = `arn:aws:iam::${account}:role/${stack}-ReadProofExecution`;
const policy = Statement => ({ Version: '2012-10-17', Statement });
export const previewIdentity = policy([{ Effect: 'Allow', Action: ['logs:CreateLogStream', 'logs:PutLogEvents'], Resource: previewLogArn }]);
export const previewBoundary = policy([
  { Sid: 'OnlyLoggingAndServiceDecrypt', Effect: 'Deny', NotAction: ['logs:CreateLogStream', 'logs:PutLogEvents', 'kms:Decrypt'], Resource: '*' },
  { Effect: 'Deny', Action: 'logs:*', NotResource: previewLogArn },
  ...previewIdentity.Statement,
  // Reserved AWS-managed alias, not a copied Tournament key ARN. No business key allow.
  { Effect: 'Deny', Action: 'kms:Decrypt', NotResource: `arn:aws:kms:${region}:${account}:key/*` },
  { Effect: 'Deny', Action: 'kms:Decrypt', Resource: '*', Condition: { 'ForAllValues:StringNotEquals': { 'kms:ResourceAliases': ['alias/aws/lambda'] } } },
  { Effect: 'Allow', Action: 'kms:Decrypt', Resource: `arn:aws:kms:${region}:${account}:key/*`, Condition: { 'ForAnyValue:StringEquals': { 'kms:ResourceAliases': ['alias/aws/lambda'] } } },
]);
export function proofExecutionPolicy(assetKey) {
  if (!/^[a-f0-9]{64}\.zip$/.test(assetKey)) throw new Error('Exact hashed Lambda asset required');
  const asset = `arn:aws:s3:::cdk-hnb659fds-assets-${account}-${region}/${assetKey}`;
  return policy([
    { Effect: 'Allow', Action: 'apigateway:*', Resource: '*', Condition: { StringEquals: { 'aws:RequestedRegion': region } } },
    { Effect: 'Deny', Action: 'apigateway:*', Resource: [`arn:aws:apigateway:${region}::/restapis*`, `arn:aws:apigateway:${region}::/apis/msipnwy39j`, `arn:aws:apigateway:${region}::/apis/msipnwy39j/*`] },
    { Effect: 'Allow', Action: ['lambda:CreateFunction', 'lambda:GetFunction', 'lambda:GetFunctionConfiguration', 'lambda:UpdateFunctionCode', 'lambda:UpdateFunctionConfiguration', 'lambda:DeleteFunction', 'lambda:AddPermission', 'lambda:RemovePermission', 'lambda:GetPolicy', 'lambda:ListTags', 'lambda:TagResource', 'lambda:UntagResource', 'lambda:GetRuntimeManagementConfig', 'lambda:GetFunctionRecursionConfig'], Resource: `arn:aws:lambda:${region}:${account}:function:${stack}-PreviewRead` },
    { Effect: 'Allow', Action: ['logs:CreateLogGroup', 'logs:DeleteLogGroup', 'logs:PutRetentionPolicy', 'logs:DeleteRetentionPolicy', 'logs:TagResource', 'logs:UntagResource', 'logs:ListTagsForResource', 'logs:DescribeLogStreams', 'logs:GetDataProtectionPolicy'], Resource: [previewLogArn, previewLogArn.slice(0, -2)] },
    { Effect: 'Allow', Action: 'logs:DescribeLogGroups', Resource: '*' },
    { Effect: 'Allow', Action: ['cloudwatch:PutMetricAlarm', 'cloudwatch:DeleteAlarms', 'cloudwatch:DescribeAlarms', 'cloudwatch:TagResource', 'cloudwatch:UntagResource', 'cloudwatch:ListTagsForResource'], Resource: `arn:aws:cloudwatch:${region}:${account}:alarm:${stack}-ReadProof-*` },
    { Effect: 'Allow', Action: 'iam:CreateRole', Resource: previewRoleArn, Condition: { ArnEquals: { 'iam:PermissionsBoundary': previewBoundaryArn } } },
    { Effect: 'Allow', Action: ['iam:GetRole', 'iam:DeleteRole', 'iam:PutRolePolicy', 'iam:GetRolePolicy', 'iam:DeleteRolePolicy', 'iam:ListRolePolicies', 'iam:ListAttachedRolePolicies', 'iam:UpdateAssumeRolePolicy', 'iam:UpdateRole', 'iam:UpdateRoleDescription', 'iam:TagRole', 'iam:UntagRole', 'iam:ListRoleTags'], Resource: previewRoleArn },
    { Effect: 'Allow', Action: 'iam:PassRole', Resource: previewRoleArn, Condition: { StringEquals: { 'iam:PassedToService': 'lambda.amazonaws.com' } } },
    { Effect: 'Allow', Action: ['s3:GetObject', 's3:GetObjectVersion'], Resource: asset },
    { Effect: 'Allow', Action: ['ssm:GetParameter', 'ssm:GetParameters'], Resource: `arn:aws:ssm:${region}:${account}:parameter/cdk-bootstrap/hnb659fds/version` },
    { Effect: 'Deny', Action: ['apigateway:*', 'lambda:*', 'logs:*', 'cloudwatch:*'], Resource: '*', Condition: { StringNotEquals: { 'aws:RequestedRegion': region } } },
    { Effect: 'Deny', Action: ['dynamodb:*', 'cognito-idp:*', 'cognito-identity:*', 'appsync:*', 'secretsmanager:*', 'cloudformation:*', 'kms:*'], Resource: '*' },
    { Effect: 'Deny', Action: 's3:*', NotResource: asset },
    { Effect: 'Deny', Action: 'iam:PassRole', NotResource: previewRoleArn },
    { Effect: 'Deny', Action: ['iam:DeleteRolePermissionsBoundary', 'iam:PutRolePermissionsBoundary', 'iam:CreatePolicyVersion', 'iam:SetDefaultPolicyVersion', 'iam:AttachRolePolicy'], Resource: '*' },
    { Effect: 'Deny', Action: ['logs:PutResourcePolicy', 'logs:DeleteResourcePolicy', 'logs:CreateLogDelivery', 'logs:UpdateLogDelivery', 'logs:DeleteLogDelivery'], Resource: '*' },
  ]);
}
export const proofCallerPolicy = policy([
  { Effect: 'Allow', Action: ['cloudformation:CreateChangeSet', 'cloudformation:DescribeChangeSet', 'cloudformation:DeleteChangeSet', 'cloudformation:DescribeStacks', 'cloudformation:DescribeStackEvents', 'cloudformation:GetTemplate'], Resource: `arn:aws:cloudformation:${region}:${account}:stack/${stack}/*` },
  { Effect: 'Allow', Action: 'iam:PassRole', Resource: executionRoleArn, Condition: { StringEquals: { 'iam:PassedToService': 'cloudformation.amazonaws.com' } } },
  { Effect: 'Deny', Action: 'cloudformation:*', NotResource: `arn:aws:cloudformation:${region}:${account}:stack/${stack}/*` },
]);
