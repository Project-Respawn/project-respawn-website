export const target = Object.freeze({ account: '058264289478', region: 'eu-north-1', environment: 'Ntgre', stack: 'ProjectRespawn-TeamHub-Ntgre' });
export const operationalArn = `arn:aws:dynamodb:${target.region}:${target.account}:table/${target.stack}-Operational`;
export const journalArn = `arn:aws:dynamodb:${target.region}:${target.account}:table/${target.stack}-Journal`;
const policy = Statement => ({ Version: '2012-10-17', Statement });
export function runtimePolicy(kind) {
  if (!['read', 'command'].includes(kind)) throw new Error('Unknown runtime');
  const tables = kind === 'read' ? [operationalArn] : [operationalArn, journalArn];
  const resources = tables.flatMap(a => [a, `${a}/index/*`]);
  const statements = [
    { Effect: 'Allow', Action: ['dynamodb:GetItem', 'dynamodb:Query'], Resource: resources },
    { Effect: 'Allow', Action: ['logs:CreateLogStream', 'logs:PutLogEvents'], Resource: `arn:aws:logs:${target.region}:${target.account}:log-group:/project-respawn/Ntgre/team-hub/${kind}:*` },
    { Effect: 'Deny', Action: 'dynamodb:*', NotResource: resources },
    { Effect: 'Deny', Action: ['s3:*', 'cognito-idp:*', 'cognito-identity:*', 'iam:*', 'cloudformation:*', 'kms:*', 'secretsmanager:*', 'ssm:*', 'lambda:InvokeFunction', 'appsync:*', 'sts:AssumeRole'], Resource: '*' },
    { Effect: 'Deny', Action: ['dynamodb:Scan', 'dynamodb:BatchWriteItem', 'dynamodb:CreateTable', 'dynamodb:DeleteTable', 'dynamodb:UpdateTable'], Resource: '*' },
  ];
  if (kind === 'command') {
    statements.push({ Effect: 'Allow', Action: ['dynamodb:ConditionCheckItem', 'dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:DeleteItem'], Resource: [operationalArn], Condition: { 'ForAnyValue:StringEquals': { 'dynamodb:EnclosingOperation': ['TransactWriteItems'] } } });
    statements.push({ Effect: 'Allow', Action: ['dynamodb:ConditionCheckItem', 'dynamodb:PutItem'], Resource: [journalArn], Condition: { 'ForAnyValue:StringEquals': { 'dynamodb:EnclosingOperation': ['TransactWriteItems'] } } });
    statements.push({ Effect: 'Deny', Action: ['dynamodb:UpdateItem', 'dynamodb:DeleteItem'], Resource: [journalArn] });
    statements.push({ Effect: 'Deny', Action: ['dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:DeleteItem', 'dynamodb:ConditionCheckItem'], Resource: '*', Condition: { 'ForAllValues:StringNotEquals': { 'dynamodb:EnclosingOperation': ['TransactWriteItems'] } } });
  } else statements.push({ Effect: 'Deny', Action: ['dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:DeleteItem', 'dynamodb:ConditionCheckItem'], Resource: '*' });
  return policy(statements);
}
const base = `arn:aws:iam::${target.account}`;
export const executionRoleArn = `${base}:role/${target.stack}-Execution`;
export const deploymentPolicy = policy([
  // API Gateway create/lifecycle requires regional service-level authority. Artifact/caller gates
  // contain deployment; this policy alone is NOT a claim of per-API isolation.
  { Effect: 'Allow', Action: ['apigateway:GET', 'apigateway:POST', 'apigateway:PUT', 'apigateway:PATCH', 'apigateway:DELETE'], Resource: `arn:aws:apigateway:${target.region}::*` },
  { Effect: 'Allow', Action: ['lambda:CreateFunction', 'lambda:UpdateFunctionCode', 'lambda:UpdateFunctionConfiguration', 'lambda:DeleteFunction', 'lambda:GetFunction', 'lambda:GetFunctionConfiguration', 'lambda:AddPermission', 'lambda:RemovePermission', 'lambda:GetPolicy', 'lambda:TagResource', 'lambda:UntagResource', 'lambda:ListTags'], Resource: `arn:aws:lambda:${target.region}:${target.account}:function:${target.stack}-*` },
  { Effect: 'Allow', Action: ['dynamodb:CreateTable', 'dynamodb:DescribeTable', 'dynamodb:UpdateTable', 'dynamodb:DeleteTable', 'dynamodb:UpdateContinuousBackups', 'dynamodb:DescribeContinuousBackups', 'dynamodb:UpdateTimeToLive', 'dynamodb:DescribeTimeToLive', 'dynamodb:TagResource', 'dynamodb:UntagResource', 'dynamodb:ListTagsOfResource'], Resource: [operationalArn, journalArn] },
  { Effect: 'Allow', Action: ['logs:CreateLogGroup', 'logs:DeleteLogGroup', 'logs:PutRetentionPolicy', 'logs:DeleteRetentionPolicy', 'logs:TagResource', 'logs:UntagResource', 'logs:ListTagsForResource'], Resource: `arn:aws:logs:${target.region}:${target.account}:log-group:/project-respawn/Ntgre/team-hub/*` },
  { Effect: 'Allow', Action: ['logs:DescribeLogGroups', 'logs:CreateLogDelivery', 'logs:GetLogDelivery', 'logs:UpdateLogDelivery', 'logs:DeleteLogDelivery', 'logs:ListLogDeliveries', 'logs:PutResourcePolicy', 'logs:DeleteResourcePolicy', 'logs:DescribeResourcePolicies'], Resource: '*' },
  { Effect: 'Allow', Action: ['cloudwatch:PutMetricAlarm', 'cloudwatch:DeleteAlarms', 'cloudwatch:DescribeAlarms', 'cloudwatch:TagResource', 'cloudwatch:UntagResource'], Resource: `arn:aws:cloudwatch:${target.region}:${target.account}:alarm:${target.stack}-*` },
  { Effect: 'Allow', Action: ['iam:CreateRole', 'iam:PutRolePermissionsBoundary'], Resource: ['read', 'command'].map(k => `${base}:role/${target.stack}-${k}`), Condition: { StringEquals: { 'iam:PermissionsBoundary': ['read', 'command'].map(k => `${base}:policy/${target.stack}-${k}-Boundary`) } } },
  { Effect: 'Allow', Action: ['iam:GetRole', 'iam:DeleteRole', 'iam:PutRolePolicy', 'iam:GetRolePolicy', 'iam:DeleteRolePolicy', 'iam:TagRole', 'iam:UntagRole'], Resource: ['read', 'command'].map(k => `${base}:role/${target.stack}-${k}`) },
  { Effect: 'Allow', Action: ['iam:CreatePolicy', 'iam:GetPolicy', 'iam:GetPolicyVersion', 'iam:CreatePolicyVersion', 'iam:DeletePolicyVersion', 'iam:ListPolicyVersions', 'iam:DeletePolicy'], Resource: ['read', 'command'].map(k => `${base}:policy/${target.stack}-${k}-Boundary`) },
  { Effect: 'Allow', Action: 'iam:PassRole', Resource: ['read', 'command'].map(k => `${base}:role/${target.stack}-${k}`), Condition: { StringEquals: { 'iam:PassedToService': 'lambda.amazonaws.com' } } },
  { Effect: 'Deny', Action: ['cognito-idp:*', 'kms:*', 'secretsmanager:*', 'appsync:*'], Resource: '*' },
]);
export const callerPolicy = policy([
  { Effect: 'Allow', Action: ['cloudformation:CreateChangeSet', 'cloudformation:DescribeChangeSet', 'cloudformation:DeleteChangeSet', 'cloudformation:DescribeStacks', 'cloudformation:DescribeStackEvents', 'cloudformation:GetTemplate'], Resource: `arn:aws:cloudformation:${target.region}:${target.account}:stack/${target.stack}/*` },
  { Effect: 'Allow', Action: 'iam:PassRole', Resource: executionRoleArn, Condition: { StringEquals: { 'iam:PassedToService': 'cloudformation.amazonaws.com' } } },
  { Effect: 'Deny', Action: 'cloudformation:*', NotResource: `arn:aws:cloudformation:${target.region}:${target.account}:stack/${target.stack}/*` },
]);
